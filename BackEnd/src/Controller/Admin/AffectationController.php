<?php

namespace App\Controller\Admin;

use App\Entity\Affectation;
use App\Entity\Course;
use App\Entity\User;
use App\Repository\CourseRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
class AffectationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private CourseRepository $courseRepository,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {
    }

    #[Route('/affectations', name: 'app_admin_affectations', methods: ['GET'])]
    public function getAllAffectations(): JsonResponse
    {
        $affectations = $this->entityManager->getRepository(Affectation::class)->findAll();
        
        $data = [];
        foreach ($affectations as $affectation) {
            $data[] = [
                'id' => $affectation->getId(),
                'date' => $affectation->getDateAssigned()->format('Y-m-d'),
                'user' => [
                    'id' => $affectation->getUser()->getId(),
                    'fullName' => $affectation->getUser()->getFullName(),
                    'email' => $affectation->getUser()->getEmail()
                ],
                'course' => [
                    'id' => $affectation->getCours()->getId(),
                    'title' => $affectation->getCours()->getTitle()
                ],
                'assigneCours' => $affectation->isAssigneCours()
            ];
        }
        
        return new JsonResponse($data, Response::HTTP_OK);
    }

    #[Route('/affectations', name: 'app_admin_create_affectation', methods: ['POST'])]
    public function createAffectation(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['userId']) || !isset($data['courseId'])) {
            return new JsonResponse(['error' => 'Les IDs de l\'utilisateur et du cours sont requis'], Response::HTTP_BAD_REQUEST);
        }
        
        $user = $this->userRepository->find($data['userId']);
        $course = $this->courseRepository->find($data['courseId']);
        
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }
        
        if ($user->getRole() !== 'employée') {
            return new JsonResponse(['error' => 'Seuls les employés peuvent être affectés à des cours'], Response::HTTP_BAD_REQUEST);
        }
        
        if (!$course) {
            return new JsonResponse(['error' => 'Cours non trouvé'], Response::HTTP_NOT_FOUND);
        }
        
        // Vérifier si l'affectation existe déjà
        $existingAffectation = $this->entityManager->getRepository(Affectation::class)->findOneBy([
            'user' => $user,
            'cours' => $course
        ]);
        
        if ($existingAffectation) {
            return new JsonResponse(['error' => 'Cet employé est déjà affecté à ce cours'], Response::HTTP_CONFLICT);
        }
        
        $affectation = new Affectation();
        $affectation->setUser($user);
        $affectation->setCours($course);
        $affectation->setDateAssigned(new \DateTime());
        $affectation->setAssigneCours(true);
        
        $this->entityManager->persist($affectation);
        $this->entityManager->flush();
        
        return new JsonResponse([
            'message' => 'Affectation créée avec succès',
            'affectation' => [
                'id' => $affectation->getId(),
                'date' => $affectation->getDateAssigned()->format('Y-m-d'),
                'user' => [
                    'id' => $user->getId(),
                    'fullName' => $user->getFullName(),
                    'email' => $user->getEmail()
                ],
                'course' => [
                    'id' => $course->getId(),
                    'title' => $course->getTitle()
                ],
                'assigneCours' => $affectation->isAssigneCours()
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/affectations/{id}', name: 'app_admin_edit_affectation', methods: ['PUT'])]
    public function editAffectation(int $id, Request $request): JsonResponse
    {
        $affectation = $this->entityManager->getRepository(Affectation::class)->find($id);
        
        if (!$affectation) {
            return new JsonResponse(['error' => 'Affectation non trouvée'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        // Si l'utilisateur change, vérifier et mettre à jour
        if (isset($data['userId'])) {
            $user = $this->userRepository->find($data['userId']);
            
            if (!$user) {
                return new JsonResponse(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
            }
            
            if ($user->getRole() !== 'employée') {
                return new JsonResponse(['error' => 'Seuls les employés peuvent être affectés à des cours'], Response::HTTP_BAD_REQUEST);
            }
            
            // Vérifier si une autre affectation existe déjà avec cette combinaison user-course
            if ($affectation->getUser()->getId() !== $user->getId()) {
                $existingAffectation = $this->entityManager->getRepository(Affectation::class)->findOneBy([
                    'user' => $user,
                    'cours' => $affectation->getCours()
                ]);
                
                if ($existingAffectation) {
                    return new JsonResponse(['error' => 'Cet employé est déjà affecté à ce cours'], Response::HTTP_CONFLICT);
                }
                
                $affectation->setUser($user);
            }
        }
        
        // Si le cours change, vérifier et mettre à jour
        if (isset($data['courseId'])) {
            $course = $this->courseRepository->find($data['courseId']);
            
            if (!$course) {
                return new JsonResponse(['error' => 'Cours non trouvé'], Response::HTTP_NOT_FOUND);
            }
            
            // Vérifier si une autre affectation existe déjà avec cette combinaison user-course
            if ($affectation->getCours()->getId() !== $course->getId()) {
                $existingAffectation = $this->entityManager->getRepository(Affectation::class)->findOneBy([
                    'user' => $affectation->getUser(),
                    'cours' => $course
                ]);
                
                if ($existingAffectation) {
                    return new JsonResponse(['error' => 'Cet employé est déjà affecté à ce cours'], Response::HTTP_CONFLICT);
                }
                
                $affectation->setCours($course);
            }
        }
        
        // Mise à jour de l'état d'affectation si fourni
        if (isset($data['assigneCours'])) {
            $affectation->setAssigneCours($data['assigneCours']);
        }
        
        // Mise à jour de la date si fournie
        if (isset($data['dateAssigned'])) {
            try {
                $date = new \DateTime($data['dateAssigned']);
                $affectation->setDateAssigned($date);
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Format de date invalide'], Response::HTTP_BAD_REQUEST);
            }
        }
        
        $this->entityManager->flush();
        
        return new JsonResponse([
            'message' => 'Affectation modifiée avec succès',
            'affectation' => [
                'id' => $affectation->getId(),
                'date' => $affectation->getDateAssigned()->format('Y-m-d'),
                'user' => [
                    'id' => $affectation->getUser()->getId(),
                    'fullName' => $affectation->getUser()->getFullName(),
                    'email' => $affectation->getUser()->getEmail()
                ],
                'course' => [
                    'id' => $affectation->getCours()->getId(),
                    'title' => $affectation->getCours()->getTitle()
                ],
                'assigneCours' => $affectation->isAssigneCours()
            ]
        ], Response::HTTP_OK);
    }

    #[Route('/affectations/{id}', name: 'app_admin_delete_affectation', methods: ['DELETE'])]
    public function deleteAffectation(int $id): JsonResponse
    {
        $affectation = $this->entityManager->getRepository(Affectation::class)->find($id);
        
        if (!$affectation) {
            return new JsonResponse(['error' => 'Affectation non trouvée'], Response::HTTP_NOT_FOUND);
        }
        
        $this->entityManager->remove($affectation);
        $this->entityManager->flush();
        
        return new JsonResponse(['message' => 'Affectation supprimée avec succès'], Response::HTTP_OK);
    }

    #[Route('/employees', name: 'app_admin_get_employees', methods: ['GET'])]
    public function getEmployees(): JsonResponse
    {
        $employees = $this->userRepository->findBy(['roles' => 'employée']);
        
        $data = [];
        foreach ($employees as $employee) {
            $data[] = [
                'id' => $employee->getId(),
                'fullName' => $employee->getFullName(),
                'email' => $employee->getEmail(),
                'roles' => $employee->getRole()
            ];
        }
        
        return new JsonResponse($data, Response::HTTP_OK);
    }

    
}

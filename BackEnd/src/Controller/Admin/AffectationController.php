<?php

namespace App\Controller\Admin;

use App\Entity\Affectation;
use App\Entity\Course;
use App\Entity\User;
use App\Repository\AffectationRepository;
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

#[Route('/api/admin/affectations', name: 'affectations_')]
class AffectationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private AffectationRepository $affectationRepository,
        private CourseRepository $courseRepository,
        private UserRepository $userRepository
    ) {}

    /**
     * Get all course assignments
     */
    #[Route('', name: 'list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function index(): JsonResponse
    {
        $affectations = $this->affectationRepository->findAll();
        
        error_log('Nombre d\'affectations trouvées: ' . count($affectations));
        
        $affectationsData = [];
        foreach ($affectations as $affectation) {
            $user = $affectation->getUser();
            $course = $affectation->getCours();
            
            $affectationData = [
                'id' => $affectation->getId(),
                'dateAssigned' => $affectation->getDateAssigned()?->format('Y-m-d'),
                'assigneCours' => $affectation->isAssigneCours(),
                'user' => $user ? [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'fullName' => $user->getFullName(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                ] : null,
                'cours' => $course ? [
                    'id' => $course->getId(),
                    'title' => $course->getTitle(),
                    'description' => $course->getDescription(),
                ] : null
            ];
            
            error_log('Affectation ' . $affectation->getId() . ': ' . json_encode($affectationData));
            $affectationsData[] = $affectationData;
        }
        
        return $this->json($affectationsData);
    }

    /**
     * Get a specific course assignment
     */
    #[Route('/{id}', name: 'show', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function show(int $id): JsonResponse
    {
        $affectation = $this->affectationRepository->find($id);
        
        if (!$affectation) {
            return new JsonResponse(
                ['error' => 'Affectation not found'], 
                Response::HTTP_NOT_FOUND
            );
        }
        
        $data = $this->serializer->serialize(
            $affectation, 
            'json', 
            ['groups' => ['affectation:read', 'affectation:details']]
        );
        
        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    /**
     * Create a new course assignment
     */
    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        error_log('Affectation Create - Données reçues: ' . json_encode($data));
        
        if (!$data) {
            error_log('Affectation Create - JSON invalide');
            return new JsonResponse(
                ['error' => 'Invalid JSON data'], 
                Response::HTTP_BAD_REQUEST
            );
        }

        // Validate required fields
        if (!isset($data['userId']) || !isset($data['courseId'])) {
            error_log('Affectation Create - Champs manquants: userId=' . ($data['userId'] ?? 'null') . ', courseId=' . ($data['courseId'] ?? 'null'));
            return new JsonResponse(
                ['error' => 'userId and courseId are required'], 
                Response::HTTP_BAD_REQUEST
            );
        }

        // Find user and course
        $user = $this->userRepository->find($data['userId']);
        $course = $this->courseRepository->find($data['courseId']);

        error_log('Affectation Create - Utilisateur trouvé: ' . ($user ? $user->getId() . ' (' . $user->getEmail() . ')' : 'null'));
        error_log('Affectation Create - Cours trouvé: ' . ($course ? $course->getId() . ' (' . $course->getTitle() . ')' : 'null'));

        if (!$user) {
            error_log('Affectation Create - Utilisateur non trouvé avec ID: ' . $data['userId']);
            return new JsonResponse(
                ['error' => 'User not found'], 
                Response::HTTP_NOT_FOUND
            );
        }

        if (!$course) {
            error_log('Affectation Create - Cours non trouvé avec ID: ' . $data['courseId']);
            return new JsonResponse(
                ['error' => 'Course not found'], 
                Response::HTTP_NOT_FOUND
            );
        }

        // Check if assignment already exists
        $existingAffectation = $this->affectationRepository->findOneBy([
            'user' => $user,
            'cours' => $course
        ]);

        if ($existingAffectation) {
            error_log('Affectation Create - Affectation existe déjà: utilisateur ' . $user->getId() . ' -> cours ' . $course->getId());
            return new JsonResponse(
                ['error' => 'User is already assigned to this course'], 
                Response::HTTP_CONFLICT
            );
        }

        // Create new affectation
        $affectation = new Affectation();
        $affectation->setUser($user);
        $affectation->setCours($course);
        
        error_log('Affectation Create - Nouvelle affectation créée');
        
        // Set optional fields
        if (isset($data['dateAssigned'])) {
            $dateAssigned = new \DateTime($data['dateAssigned']);
            $affectation->setDateAssigned($dateAssigned);
        }
        
        if (isset($data['assigneCours'])) {
            $affectation->setAssigneCours($data['assigneCours']);
        }

        // Validate entity
        $errors = $this->validator->validate($affectation);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            error_log('Affectation Create - Erreurs de validation: ' . json_encode($errorMessages));
            return new JsonResponse(
                ['errors' => $errorMessages], 
                Response::HTTP_BAD_REQUEST
            );
        }

        // Save to database
        try {
            $this->entityManager->persist($affectation);
            $this->entityManager->flush();
            error_log('Affectation Create - Sauvegarde réussie avec ID: ' . $affectation->getId());
        } catch (\Exception $e) {
            error_log('Affectation Create - Erreur lors de la sauvegarde: ' . $e->getMessage());
            return new JsonResponse(
                ['error' => 'Database error: ' . $e->getMessage()], 
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        $data = $this->serializer->serialize(
            $affectation, 
            'json', 
            ['groups' => ['affectation:read']]
        );

        return new JsonResponse($data, Response::HTTP_CREATED, [], true);
    }

    /**
     * Update a course assignment
     */
    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $id, Request $request): JsonResponse
    {
        $affectation = $this->affectationRepository->find($id);
        
        if (!$affectation) {
            return new JsonResponse(
                ['error' => 'Affectation not found'], 
                Response::HTTP_NOT_FOUND
            );
        }

        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return new JsonResponse(
                ['error' => 'Invalid JSON data'], 
                Response::HTTP_BAD_REQUEST
            );
        }

        // Update fields if provided
        if (isset($data['dateAssigned'])) {
            $dateAssigned = new \DateTime($data['dateAssigned']);
            $affectation->setDateAssigned($dateAssigned);
        }
        
        if (isset($data['assigneCours'])) {
            $affectation->setAssigneCours($data['assigneCours']);
        }

        if (isset($data['userId'])) {
            $user = $this->userRepository->find($data['userId']);
            if (!$user) {
                return new JsonResponse(
                    ['error' => 'User not found'], 
                    Response::HTTP_NOT_FOUND
                );
            }
            $affectation->setUser($user);
        }

        if (isset($data['courseId'])) {
            $course = $this->courseRepository->find($data['courseId']);
            if (!$course) {
                return new JsonResponse(
                    ['error' => 'Course not found'], 
                    Response::HTTP_NOT_FOUND
                );
            }
            $affectation->setCours($course);
        }

        // Validate entity
        $errors = $this->validator->validate($affectation);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(
                ['errors' => $errorMessages], 
                Response::HTTP_BAD_REQUEST
            );
        }

        // Save changes
        $this->entityManager->flush();

        $data = $this->serializer->serialize(
            $affectation, 
            'json', 
            ['groups' => ['affectation:read']]
        );

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    /**
     * Delete a course assignment
     */
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $affectation = $this->affectationRepository->find($id);
        
        if (!$affectation) {
            return new JsonResponse(
                ['error' => 'Affectation not found'], 
                Response::HTTP_NOT_FOUND
            );
        }

        $this->entityManager->remove($affectation);
        $this->entityManager->flush();

        return new JsonResponse(
            ['message' => 'Affectation deleted successfully'], 
            Response::HTTP_OK
        );
    }

    /**
     * Get all assignments for a specific course
     */
    #[Route('/course/{courseId}', name: 'by_course', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getAssignmentsByCourse(int $courseId): JsonResponse
    {
        $course = $this->courseRepository->find($courseId);
        
        if (!$course) {
            return new JsonResponse(
                ['error' => 'Course not found'], 
                Response::HTTP_NOT_FOUND
            );
        }

        $affectations = $this->affectationRepository->findBy(['cours' => $course]);

        $data = $this->serializer->serialize(
            $affectations, 
            'json', 
            ['groups' => ['affectation:read', 'affectation:details']]
        );

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    /**
     * Get all assignments for a specific user
     */
    #[Route('/user/{userId}', name: 'by_user', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getAssignmentsByUser(int $userId): JsonResponse
    {
        $user = $this->userRepository->find($userId);
        
        if (!$user) {
            return new JsonResponse(
                ['error' => 'User not found'], 
                Response::HTTP_NOT_FOUND
            );
        }

        $affectations = $this->affectationRepository->findBy(['user' => $user]);

        $data = $this->serializer->serialize(
            $affectations, 
            'json', 
            ['groups' => ['affectation:read', 'affectation:details']]
        );

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    /**
     * Assign multiple courses to a user
     */
    #[Route('/bulk-assign', name: 'bulk_assign', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function bulkAssign(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!$data || !isset($data['userId']) || !isset($data['courseIds']) || !is_array($data['courseIds'])) {
            return new JsonResponse(
                ['error' => 'userId and courseIds array are required'], 
                Response::HTTP_BAD_REQUEST
            );
        }

        $user = $this->userRepository->find($data['userId']);
        if (!$user) {
            return new JsonResponse(
                ['error' => 'User not found'], 
                Response::HTTP_NOT_FOUND
            );
        }

        $createdAffectations = [];
        $errors = [];

        foreach ($data['courseIds'] as $courseId) {
            $course = $this->courseRepository->find($courseId);
            if (!$course) {
                $errors[] = "Course with ID {$courseId} not found";
                continue;
            }

            // Check if assignment already exists
            $existingAffectation = $this->affectationRepository->findOneBy([
                'user' => $user,
                'cours' => $course
            ]);

            if ($existingAffectation) {
                $errors[] = "User is already assigned to course with ID {$courseId}";
                continue;
            }

            // Create new affectation
            $affectation = new Affectation();
            $affectation->setUser($user);
            $affectation->setCours($course);
            
            if (isset($data['assigneCours'])) {
                $affectation->setAssigneCours($data['assigneCours']);
            }

            $this->entityManager->persist($affectation);
            $createdAffectations[] = $affectation;
        }

        if (!empty($createdAffectations)) {
            $this->entityManager->flush();
        }

        $responseData = [
            'created' => count($createdAffectations),
            'errors' => $errors
        ];

        if (!empty($createdAffectations)) {
            $responseData['affectations'] = json_decode(
                $this->serializer->serialize(
                    $createdAffectations, 
                    'json', 
                    ['groups' => ['affectation:read']]
                ), 
                true
            );
        }

        return new JsonResponse($responseData, Response::HTTP_CREATED);
    }

    /**
     * Assign a course to multiple users (bulk operation)
     */
    #[Route('/bulk-assign-users', name: 'bulk_assign_users', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function bulkAssignUsers(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!$data || !isset($data['courseId']) || !isset($data['userIds']) || !is_array($data['userIds'])) {
            return new JsonResponse(
                ['error' => 'courseId and userIds array are required'], 
                Response::HTTP_BAD_REQUEST
            );
        }

        $course = $this->courseRepository->find($data['courseId']);
        if (!$course) {
            return new JsonResponse(
                ['error' => 'Course not found'], 
                Response::HTTP_NOT_FOUND
            );
        }

        $createdAffectations = [];
        $errors = [];

        foreach ($data['userIds'] as $userId) {
            $user = $this->userRepository->find($userId);
            if (!$user) {
                $errors[] = "User with ID {$userId} not found";
                continue;
            }

            // Check if assignment already exists
            $existingAffectation = $this->affectationRepository->findOneBy([
                'user' => $user,
                'cours' => $course
            ]);

            if ($existingAffectation) {
                $errors[] = "User with ID {$userId} is already assigned to this course";
                continue;
            }

            // Create new affectation
            $affectation = new Affectation();
            $affectation->setUser($user);
            $affectation->setCours($course);
            
            // Set optional fields
            if (isset($data['dateAssigned'])) {
                $dateAssigned = new \DateTime($data['dateAssigned']);
                $affectation->setDateAssigned($dateAssigned);
            }
            
            if (isset($data['assigneCours'])) {
                $affectation->setAssigneCours($data['assigneCours']);
            }

            $this->entityManager->persist($affectation);
            $createdAffectations[] = $affectation;
        }

        if (!empty($createdAffectations)) {
            $this->entityManager->flush();
        }

        $responseData = [
            'created' => count($createdAffectations),
            'errors' => $errors,
            'message' => 'Course assigned successfully to ' . count($createdAffectations) . ' user(s)'
        ];

        if (!empty($createdAffectations)) {
            $responseData['affectations'] = json_decode(
                $this->serializer->serialize(
                    $createdAffectations, 
                    'json', 
                    ['groups' => ['affectation:read']]
                ), 
                true
            );
        }

        return new JsonResponse($responseData, Response::HTTP_CREATED);
    }

    // /**
    //  * Mark a course assignment as completed
    //  */
    // #[Route('/{id}/complete', name: 'mark_complete', methods: ['PATCH'])]
    // #[IsGranted('ROLE_EMPLOYEE')]
    // public function markAsComplete(int $id): JsonResponse
    // {
    //     $affectation = $this->affectationRepository->find($id);
        
    //     if (!$affectation) {
    //         return new JsonResponse(
    //             ['error' => 'Affectation not found'], 
    //             Response::HTTP_NOT_FOUND
    //         );
    //     }

    //     // Check if the current user owns this affectation
    //     $currentUser = $this->getUser();
    //     if (!$this->isGranted('ROLE_ADMIN') && $affectation->getUser() !== $currentUser) {
    //         return new JsonResponse(
    //             ['error' => 'Access denied'], 
    //             Response::HTTP_FORBIDDEN
    //         );
    //     }

    //     $affectation->setAssigneCours(true);
    //     $this->entityManager->flush();

    //     $data = $this->serializer->serialize(
    //         $affectation, 
    //         'json', 
    //         ['groups' => ['affectation:read']]
    //     );

    //     return new JsonResponse($data, Response::HTTP_OK, [], true);
    // }

     // /**
    //  * Get courses assigned to current user (for employees)
    //  */
    // #[Route('/my-courses', name: 'my_courses', methods: ['GET'])]
    // #[IsGranted('ROLE_EMPLOYEE')]
    // public function getMyCourses(): JsonResponse
    // {
    //     $user = $this->getUser();
        
    //     if (!$user instanceof User) {
    //         return new JsonResponse(
    //             ['error' => 'User not authenticated'], 
    //             Response::HTTP_UNAUTHORIZED
    //         );
    //     }

    //     $affectations = $this->affectationRepository->findBy(['user' => $user]);

    //     $data = $this->serializer->serialize(
    //         $affectations, 
    //         'json', 
    //         ['groups' => ['affectation:read', 'affectation:details']]
    //     );

    //     return new JsonResponse($data, Response::HTTP_OK, [], true);
    // }
}
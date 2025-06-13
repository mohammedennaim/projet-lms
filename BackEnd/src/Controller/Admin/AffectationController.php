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
        
        $data = $this->serializer->serialize(
            $affectations, 
            'json', 
            ['groups' => ['affectation:read']]
        );
        
        return new JsonResponse($data, Response::HTTP_OK, [], true);
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
        
        if (!$data) {
            return new JsonResponse(
                ['error' => 'Invalid JSON data'], 
                Response::HTTP_BAD_REQUEST
            );
        }

        // Validate required fields
        if (!isset($data['userId']) || !isset($data['courseId'])) {
            return new JsonResponse(
                ['error' => 'userId and courseId are required'], 
                Response::HTTP_BAD_REQUEST
            );
        }

        // Find user and course
        $user = $this->userRepository->find($data['userId']);
        $course = $this->courseRepository->find($data['courseId']);

        if (!$user) {
            return new JsonResponse(
                ['error' => 'User not found'], 
                Response::HTTP_NOT_FOUND
            );
        }

        if (!$course) {
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
            return new JsonResponse(
                ['error' => 'User is already assigned to this course'], 
                Response::HTTP_CONFLICT
            );
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

        // Save to database
        $this->entityManager->persist($affectation);
        $this->entityManager->flush();

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
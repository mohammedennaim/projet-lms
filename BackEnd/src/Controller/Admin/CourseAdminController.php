<?php

namespace App\Controller\Admin;

use App\Entity\Course;
use App\Entity\User;
use App\Repository\CourseRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/admin/courses', name: 'admin_courses_')]
#[IsGranted('ROLE_ADMIN')]
class CourseAdminController extends AbstractController
{    public function __construct(
        private EntityManagerInterface $entityManager,
        private CourseRepository $courseRepository,
        private UserRepository $userRepository,
        private ValidatorInterface $validator
    ) {
    }

    /**
     * Get all courses with pagination and filters
     */
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(50, max(1, $request->query->getInt('limit', 10)));
        $search = $request->query->get('search');

        $queryBuilder = $this->courseRepository->createQueryBuilder('c');

        if ($search) {
            $queryBuilder->andWhere('c.title LIKE :search OR c.description LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        // Count total
        $totalQuery = clone $queryBuilder;
        $total = $totalQuery->select('COUNT(c.id)')
            ->getQuery()
            ->getSingleScalarResult();

        // Get paginated results
        $courses = $queryBuilder
            ->orderBy('c.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        $coursesData = [];
        foreach ($courses as $course) {
            $coursesData[] = [
                'id' => $course->getId(),
                'title' => $course->getTitle(),
                'description' => $course->getDescription(),
                'createdAt' => $course->getCreatedAt()?->format('Y-m-d H:i:s'),
                'updatedAt' => $course->getUpdatedAt()?->format('Y-m-d H:i:s'),
                'studentsCount' => $course->getEmployees()->count()
            ];
        }

        return $this->json([
            'courses' => $coursesData,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    /**
     * Get a specific course
     */
    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $course = $this->courseRepository->find($id);

        if (!$course) {
            return $this->json(['message' => 'Cours non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }        $employees = [];
        foreach ($course->getEmployees() as $employee) {
            $employees[] = [
                'id' => $employee->getId(),
                'fullName' => $employee->getFullName(),
                'email' => $employee->getEmail(),
            ];
        }

        return $this->json([
            'id' => $course->getId(),
            'title' => $course->getTitle(),
            'description' => $course->getDescription(),
            'createdAt' => $course->getCreatedAt()?->format('Y-m-d H:i:s'),
            'updatedAt' => $course->getUpdatedAt()?->format('Y-m-d H:i:s'),
            'employees' => $employees
        ]);
    }

    /**
     * Create a new course
     */
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['message' => 'Données JSON invalides'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Validate required fields
        $requiredFields = ['title', 'description'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
                return $this->json([
                    'message' => "Le champ '$field' est obligatoire"
                ], JsonResponse::HTTP_BAD_REQUEST);
            }
        }

        $course = new Course();
        $course->setTitle($data['title'])
            ->setDescription($data['description']);

        // Validate the course
        $errors = $this->validator->validate($course);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json([
                'message' => 'Erreurs de validation',
                'errors' => $errorMessages
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $this->entityManager->persist($course);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Cours créé avec succès',
                'course' => [
                    'id' => $course->getId(),
                    'title' => $course->getTitle(),
                    'description' => $course->getDescription(),
                    'createdAt' => $course->getCreatedAt()?->format('Y-m-d H:i:s')
                ]
            ], JsonResponse::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la création du cours',
                'error' => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update a course
     */
    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $course = $this->courseRepository->find($id);

        if (!$course) {
            return $this->json(['message' => 'Cours non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['message' => 'Données JSON invalides'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Update fields if provided
        if (isset($data['title'])) {
            $course->setTitle($data['title']);
        }

        if (isset($data['description'])) {
            $course->setDescription($data['description']);
        }

        // Validate the course
        $errors = $this->validator->validate($course);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json([
                'message' => 'Erreurs de validation',
                'errors' => $errorMessages
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Cours mis à jour avec succès',
                'course' => [
                    'id' => $course->getId(),
                    'title' => $course->getTitle(),
                    'description' => $course->getDescription(),
                    'updatedAt' => $course->getUpdatedAt()?->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la mise à jour du cours',
                'error' => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete a course
     */
    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $course = $this->courseRepository->find($id);

        if (!$course) {
            return $this->json(['message' => 'Cours non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        try {
            $this->entityManager->remove($course);
            $this->entityManager->flush();

            return $this->json(['message' => 'Cours supprimé avec succès']);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la suppression du cours',
                'error' => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get course statistics
     */
    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $totalCourses = $this->courseRepository->count([]);

        return $this->json([
            'total' => $totalCourses
        ]);
    }    /**
     * Enroll an employee in a course
     */
    #[Route('/{courseId}/enroll/{employeeId}', name: 'enroll', methods: ['POST'], requirements: ['courseId' => '\d+', 'employeeId' => '\d+'])]
    public function enrollEmployee(int $courseId, int $employeeId): JsonResponse
    {
        $course = $this->courseRepository->find($courseId);
        $employee = $this->userRepository->find($employeeId);

        if (!$course) {
            return $this->json(['message' => 'Course non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        if (!$employee) {
            return $this->json(['message' => 'Employé non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($course->getEmployees()->contains($employee)) {
            return $this->json(['message' => 'L\'employé est déjà enrollé à ce cours'], JsonResponse::HTTP_CONFLICT);
        }

        try {
            $course->addEmployee($employee);
            $this->entityManager->flush();

            return $this->json(['message' => 'Employé enroll avec succès']);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de l\'enrollment',
                'error' => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }    /**
     * Remove an employee from a course
     */
    #[Route('/{courseId}/unenroll/{employeeId}', name: 'unenroll', methods: ['DELETE'], requirements: ['courseId' => '\d+', 'employeeId' => '\d+'])]
    public function unenrollEmployee(int $courseId, int $employeeId): JsonResponse
    {
        $course = $this->courseRepository->find($courseId);
        $employee = $this->userRepository->find($employeeId);

        if (!$course) {
            return $this->json(['message' => 'Cours non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        if (!$employee) {
            return $this->json(['message' => 'Employé non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        if (!$course->getEmployees()->contains($employee)) {
            return $this->json(['message' => 'L\'employé n\'est pas enrollé à ce cours'], JsonResponse::HTTP_NOT_FOUND);
        }

        try {
            $course->removeEmployee($employee);
            $this->entityManager->flush();

            return $this->json(['message' => 'Employé unenroll avec succès']);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la désinscription',
                'error' => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

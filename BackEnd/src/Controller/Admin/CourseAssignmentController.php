<?php

namespace App\Controller\Admin;

use App\Entity\Course;
use App\Entity\User;
use App\Repository\CourseRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/admin')]
class CourseAssignmentController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private CourseRepository $courseRepository;
    private UserRepository $userRepository;
    private Security $security;

    public function __construct(
        EntityManagerInterface $entityManager,
        CourseRepository $courseRepository,
        UserRepository $userRepository,
        Security $security
    ) {
        $this->entityManager = $entityManager;
        $this->courseRepository = $courseRepository;
        $this->userRepository = $userRepository;
        $this->security = $security;
    }

    #[Route('/courses/{courseId}/assign-employee/{employeeId}', name: 'assign_course_to_employee', methods: ['POST'])]
    public function assignCourseToEmployee(int $courseId, int $employeeId): JsonResponse
    {
        $user = $this->security->getUser();
        
        if (!$user || !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $course = $this->courseRepository->find($courseId);
        if (!$course) {
            return $this->json(['message' => 'Cours non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $employee = $this->userRepository->find($employeeId);
        if (!$employee || !in_array('ROLE_EMPLOYEE', $employee->getRoles())) {
            return $this->json(['message' => 'Employé non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si l'employé n'est pas déjà affecté à ce cours
        if ($course->getEmployees()->contains($employee)) {
            return $this->json(['message' => 'L\'employé est déjà affecté à ce cours'], Response::HTTP_CONFLICT);
        }

        $course->addEmployee($employee);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Employé affecté au cours avec succès',
            'data' => [
                'course' => $course->getTitle(),
                'employee' => $employee->getEmail()
            ]
        ], Response::HTTP_OK);
    }

    #[Route('/courses/{courseId}/unassign-employee/{employeeId}', name: 'unassign_course_from_employee', methods: ['DELETE'])]
    public function unassignCourseFromEmployee(int $courseId, int $employeeId): JsonResponse
    {
        $user = $this->security->getUser();
        
        if (!$user || !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $course = $this->courseRepository->find($courseId);
        if (!$course) {
            return $this->json(['message' => 'Cours non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $employee = $this->userRepository->find($employeeId);
        if (!$employee) {
            return $this->json(['message' => 'Employé non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $course->removeEmployee($employee);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Employé désaffecté du cours avec succès'
        ], Response::HTTP_OK);
    }

    #[Route('/courses/{courseId}/employees', name: 'get_course_employees', methods: ['GET'])]
    public function getCourseEmployees(int $courseId): JsonResponse
    {
        $user = $this->security->getUser();
        
        if (!$user || !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $course = $this->courseRepository->find($courseId);
        if (!$course) {
            return $this->json(['message' => 'Cours non trouvé'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'data' => [
                'course' => $course,
                'employees' => $course->getEmployees()->toArray()
            ]
        ], Response::HTTP_OK, [], ['groups' => ['cours:read', 'user:read']]);
    }

    #[Route('/employees/{employeeId}/courses', name: 'get_employee_courses', methods: ['GET'])]
    public function getEmployeeCourses(int $employeeId): JsonResponse
    {
        $user = $this->security->getUser();
        
        if (!$user || !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $employee = $this->userRepository->find($employeeId);
        if (!$employee || !in_array('ROLE_EMPLOYEE', $employee->getRoles())) {
            return $this->json(['message' => 'Employé non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Récupérer tous les cours assignés à cet employé
        $assignedCourses = $this->courseRepository->createQueryBuilder('c')
            ->innerJoin('c.employees', 'e')
            ->where('e.id = :employeeId')
            ->setParameter('employeeId', $employeeId)
            ->getQuery()
            ->getResult();

        return $this->json([
            'data' => [
                'employee' => $employee,
                'courses' => $assignedCourses
            ]
        ], Response::HTTP_OK, [], ['groups' => ['user:read', 'cours:read']]);
    }

    #[Route('/employees', name: 'get_all_employees', methods: ['GET'])]
    public function getAllEmployees(): JsonResponse
    {
        $user = $this->security->getUser();
        
        if (!$user || !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $employees = $this->userRepository->findByRole('ROLE_EMPLOYEE');

        return $this->json([
            'data' => $employees
        ], Response::HTTP_OK, [], ['groups' => 'user:read']);
    }
}

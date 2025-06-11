<?php

namespace App\Controller\Admin;

use App\Repository\CourseRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin', name: 'admin_')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private CourseRepository $courseRepository,
        private UserRepository $userRepository
    ) {
    }    /**
     * Dashboard with general statistics
     */
    #[Route('/dashboard', name: 'dashboard', methods: ['GET'])]
    public function dashboard(): JsonResponse
    {
        // Users statistics
        $totalUsers = $this->userRepository->count([]);
        $usersByRole = $this->entityManager->createQuery(
            'SELECT u.roles, COUNT(u.id) as count 
             FROM App\Entity\User u 
             GROUP BY u.roles 
             ORDER BY count DESC'
        )->getResult();

        // Courses statistics
        $totalCourses = $this->courseRepository->count([]);        // Enrollments statistics
        $totalEnrollments = $this->entityManager->createQuery(
            'SELECT COUNT(e.id) as count 
             FROM App\Entity\Course c 
             JOIN c.employees e'
        )->getSingleScalarResult();

        // Recent courses (last 5)
        $recentCourses = $this->courseRepository->findBy(
            [],
            ['createdAt' => 'DESC'],
            5
        );

        $recentCoursesData = [];
        foreach ($recentCourses as $course) {
            $recentCoursesData[] = [
                'id' => $course->getId(),
                'title' => $course->getTitle(),
                'description' => $course->getDescription(),
                'createdAt' => $course->getCreatedAt()?->format('Y-m-d H:i:s')
            ];
        }

        // Recent users (last 5)
        $recentUsers = $this->userRepository->findBy(
            [],
            ['id' => 'DESC'],
            5
        );

        $recentUsersData = [];
        foreach ($recentUsers as $user) {
            $recentUsersData[] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'fullName' => $user->getFullName(),
                'roles' => $user->getRole()
            ];
        }

        return $this->json([
            'users' => [
                'total' => $totalUsers,
                'byRole' => $usersByRole,
                'recent' => $recentUsersData
            ],
            'courses' => [
                'total' => $totalCourses,
                'recent' => $recentCoursesData
            ],
            'enrollments' => [
                'total' => $totalEnrollments
            ]
        ]);
    }
}

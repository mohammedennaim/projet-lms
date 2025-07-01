<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Repository\AffectationRepository;
use App\Repository\CourseRepository;
use App\Repository\UserQuizResponseRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/statistics')]
class StatisticsController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private AffectationRepository $affectationRepository,
        private CourseRepository $courseRepository,
        private UserQuizResponseRepository $userQuizResponseRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer
    ) {}

    /**
     * Récupère les statistiques complètes des employés avec leurs affectations, scores et feedback
     */
    #[Route('/employees-detailed', name: 'statistics_employees_detailed', methods: ['GET'])]
    public function getEmployeesDetailedStatistics(): JsonResponse
    {
        try {
            // Récupérer tous les employés
            $employees = $this->userRepository->createQueryBuilder('u')
                ->where('u.roles LIKE :role')
                ->setParameter('role', '%ROLE_EMPLOYEE%')
                ->getQuery()
                ->getResult();

            $statistics = [];

            foreach ($employees as $employee) {
                // Récupérer les affectations de l'employé
                $affectations = $this->affectationRepository->findBy(['user' => $employee]);
                
                $employeeData = [
                    'employee' => [
                        'id' => $employee->getId(),
                        'email' => $employee->getEmail(),
                        'fullName' => $employee->getFullName(),
                        'firstName' => $employee->getFirstName(),
                        'lastName' => $employee->getLastName()
                    ],
                    'courses' => [],
                    'totalCourses' => count($affectations),
                    'totalQuizzes' => 0,
                    'averageScore' => 0,
                    'totalQuizAttempts' => 0
                ];

                $totalScore = 0;
                $totalQuizzes = 0;

                foreach ($affectations as $affectation) {
                    $course = $affectation->getCours();
                    if (!$course) continue;

                    $courseData = [
                        'id' => $course->getId(),
                        'title' => $course->getTitle(),
                        'description' => $course->getDescription(),
                        'dateAssigned' => $affectation->getDateAssigned() ? $affectation->getDateAssigned()->format('Y-m-d') : null,
                        'quizzes' => []
                    ];

                    // Récupérer les quiz associés au cours
                    $quizzes = $course->getQuizzes();
                    
                    foreach ($quizzes as $quiz) {
                        // Récupérer les réponses de l'employé pour ce quiz
                        $userQuizResponses = $this->userQuizResponseRepository->findBy([
                            'user' => $employee,
                            'quiz' => $quiz
                        ], ['submittedAt' => 'DESC']);

                        $quizData = [
                            'id' => $quiz->getId(),
                            'title' => $quiz->getTitle(),
                            'description' => $quiz->getDescription(),
                            'attempts' => []
                        ];

                        foreach ($userQuizResponses as $response) {
                            $quizData['attempts'][] = [
                                'id' => $response->getId(),
                                'score' => $response->getScore(),
                                'percentage' => $response->getPercentageScore(),
                                'correctAnswers' => $response->getCorrectAnswers(),
                                'totalQuestions' => $response->getTotalQuestions(),
                                'timeSpentSeconds' => $response->getTimeSpentSeconds(),
                                'timeSpentFormatted' => $this->formatTime($response->getTimeSpentSeconds()),
                                'feedback' => $response->getFeedback(),
                                'performanceLevel' => $response->getPerformanceLevel(),
                                'submittedAt' => $response->getSubmittedAt()->format('Y-m-d H:i:s'),
                                'submittedAtFormatted' => $response->getSubmittedAt()->format('d/m/Y à H:i')
                            ];

                            $totalScore += $response->getScore();
                            $totalQuizzes++;
                        }

                        if (!empty($quizData['attempts'])) {
                            $courseData['quizzes'][] = $quizData;
                        }
                    }

                    if (!empty($courseData['quizzes'])) {
                        $employeeData['courses'][] = $courseData;
                    }
                }

                // Calculer la moyenne générale
                $employeeData['totalQuizAttempts'] = $totalQuizzes;
                $employeeData['averageScore'] = $totalQuizzes > 0 ? round($totalScore / $totalQuizzes, 2) : 0;
                
                // Déterminer le niveau de performance global
                $averageScore = $employeeData['averageScore'];
                if ($averageScore >= 90) {
                    $employeeData['overallPerformance'] = 'Excellent';
                } elseif ($averageScore >= 80) {
                    $employeeData['overallPerformance'] = 'Très bien';
                } elseif ($averageScore >= 70) {
                    $employeeData['overallPerformance'] = 'Bien';
                } elseif ($averageScore >= 60) {
                    $employeeData['overallPerformance'] = 'Satisfaisant';
                } else {
                    $employeeData['overallPerformance'] = 'À améliorer';
                }

                $statistics[] = $employeeData;
            }

            return $this->json([
                'success' => true,
                'data' => $statistics,
                'summary' => [
                    'totalEmployees' => count($statistics),
                    'totalWithAssignments' => count(array_filter($statistics, fn($emp) => $emp['totalCourses'] > 0)),
                    'totalWithQuizAttempts' => count(array_filter($statistics, fn($emp) => $emp['totalQuizAttempts'] > 0))
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la récupération des statistiques: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all employees data for analytics dashboard
     */
    #[Route('/employees', name: 'statistics_employees', methods: ['GET'])]
    public function getEmployeesAnalytics(): JsonResponse
    {
        $employees = $this->userRepository->findByRole('ROLE_EMPLOYEE');
        
        $result = [];
        foreach ($employees as $employee) {
            $result[] = [
                'id' => $employee->getId(),
                'fullName' => $employee->getFullName(),
                'email' => $employee->getEmail(),
                'roleInDb' => $employee->getRole(),
                'roles' => $employee->getRoles(),
                'firstName' => $employee->getFirstName(),
                'lastName' => $employee->getLastName()
            ];
        }
        
        return new JsonResponse([
            'count' => count($result),
            'employees' => $result
        ]);
    }

    /**
     * Get all affectations with evaluations for analytics
     */
    #[Route('/affectations', name: 'statistics_affectations', methods: ['GET'])]
    public function getAffectationsAnalytics(): JsonResponse
    {
        $affectations = $this->affectationRepository->findAllWithEvaluations();

        $data = $this->serializer->serialize(
            $affectations, 
            'json', 
            ['groups' => ['affectation:read', 'affectation:details', 'evaluation:read', 'user:read', 'cours:read']]
        );

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    /**
     * Get all courses for analytics
     */
    #[Route('/courses', name: 'statistics_courses', methods: ['GET'])]
    public function getCoursesAnalytics(): JsonResponse
    {
        $courses = $this->courseRepository->findAll();

        $data = $this->serializer->serialize(
            $courses, 
            'json', 
            ['groups' => ['cours:read']]
        );

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    /**
     * Get dashboard overview statistics
     */
    #[Route('/overview', name: 'statistics_overview', methods: ['GET'])]
    public function getOverviewStatistics(): JsonResponse
    {
        $totalEmployees = $this->userRepository->countByRole('ROLE_EMPLOYEE');
        $totalCourses = $this->courseRepository->count([]);
        $totalAffectations = $this->affectationRepository->count([]);
        $completedAffectations = $this->affectationRepository->count(['isCompleted' => true]);

        $stats = [
            'totalEmployees' => $totalEmployees,
            'totalCourses' => $totalCourses,
            'totalAffectations' => $totalAffectations,
            'completedAffectations' => $completedAffectations,
            'completionRate' => $totalAffectations > 0 ? round(($completedAffectations / $totalAffectations) * 100, 2) : 0,
            'lastUpdated' => new \DateTime('now')
        ];

        return new JsonResponse($stats);
    }

    /**
     * Debug endpoint to check evaluations
     */
    #[Route('/debug-evaluations', name: 'debug_evaluations', methods: ['GET'])]
    public function debugEvaluations(): JsonResponse
    {
        $affectations = $this->affectationRepository->findAll();
        
        $result = [];
        foreach ($affectations as $affectation) {
            $evaluationsData = [];
            foreach ($affectation->getEvaluations() as $evaluation) {
                $evaluationsData[] = [
                    'id' => $evaluation->getId(),
                    'note' => $evaluation->getNote(),
                    'evalueAffectation' => $evaluation->isEvalueAffectation()
                ];
            }
            
            $result[] = [
                'affectation_id' => $affectation->getId(),
                'user_id' => $affectation->getUser() ? $affectation->getUser()->getId() : null,
                'user_name' => $affectation->getUser() ? $affectation->getUser()->getFullName() : null,
                'course_id' => $affectation->getCours() ? $affectation->getCours()->getId() : null,
                'course_title' => $affectation->getCours() ? $affectation->getCours()->getTitle() : null,
                'assigneCours' => $affectation->isAssigneCours(),
                'dateAssigned' => $affectation->getDateAssigned() ? $affectation->getDateAssigned()->format('Y-m-d') : null,
                'evaluations_count' => count($evaluationsData),
                'evaluations' => $evaluationsData
            ];
        }
        
        return new JsonResponse($result);
    }

    /**
     * Get all affectations simple
     */
    #[Route('/affectations-simple', name: 'statistics_affectations_simple', methods: ['GET'])]
    public function getAffectationsSimple(): JsonResponse
    {
        $entityManager = $this->affectationRepository->getEntityManager();
        
        $query = $entityManager->createQuery('
            SELECT a, u, c, e 
            FROM App\Entity\Affectation a
            LEFT JOIN a.user u
            LEFT JOIN a.cours c  
            LEFT JOIN a.evaluations e
            ORDER BY a.id ASC
        ');
        
        $affectations = $query->getResult();
        
        $result = [];
        foreach ($affectations as $affectation) {
            $evaluationsData = [];
            foreach ($affectation->getEvaluations() as $evaluation) {
                $evaluationsData[] = [
                    'id' => $evaluation->getId(),
                    'note' => $evaluation->getNote(),
                    'evalueAffectation' => $evaluation->isEvalueAffectation()
                ];
            }
            
            $userData = null;
            if ($affectation->getUser()) {
                $userData = [
                    'id' => $affectation->getUser()->getId(),
                    'fullName' => $affectation->getUser()->getFullName(),
                    'email' => $affectation->getUser()->getEmail(),
                    'roles' => $affectation->getUser()->getRoles()
                ];
            }
            
            $courseData = null;
            if ($affectation->getCours()) {
                $courseData = [
                    'id' => $affectation->getCours()->getId(),
                    'title' => $affectation->getCours()->getTitle(),
                    'description' => $affectation->getCours()->getDescription()
                ];
            }
            
            $result[] = [
                'id' => $affectation->getId(),
                'dateAssigned' => $affectation->getDateAssigned() ? $affectation->getDateAssigned()->format('Y-m-d H:i:s') : null,
                'assigneCours' => $affectation->isAssigneCours(),
                'user' => $userData,
                'course' => $courseData,
                'evaluations' => $evaluationsData
            ];
        }
        
        return new JsonResponse($result);
    }

    /**
     * Debug endpoint for employees
     */
    #[Route('/debug-employees', name: 'debug_employees', methods: ['GET'])]
    public function debugEmployees(): JsonResponse
    {
        $employees = $this->userRepository->findByRole('ROLE_EMPLOYEE');
        
        $result = [];
        foreach ($employees as $employee) {
            $result[] = [
                'id' => $employee->getId(),
                'fullName' => $employee->getFullName(),
                'email' => $employee->getEmail(),
                'roleInDb' => $employee->getRole(),
                'rolesMethod' => $employee->getRoles(),
                'firstName' => $employee->getFirstName(),
                'lastName' => $employee->getLastName()
            ];
        }
        
        return new JsonResponse([
            'count' => count($result),
            'employees' => $result
        ]);
    }

    /**
     * Formate le temps en secondes en format lisible
     */
    private function formatTime(?int $seconds): string
    {
        if (!$seconds) {
            return 'Non renseigné';
        }

        $minutes = floor($seconds / 60);
        $seconds = $seconds % 60;

        if ($minutes > 0) {
            return sprintf('%d min %d sec', $minutes, $seconds);
        }

        return sprintf('%d sec', $seconds);
    }
}

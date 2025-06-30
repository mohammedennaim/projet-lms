<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Affectation;
use App\Repository\CourseRepository;
use App\Repository\QuizRepository;
use App\Repository\UserQuizResponseRepository;
use App\Repository\AffectationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/employee')]
#[IsGranted('ROLE_EMPLOYEE')]
class EmployeeController extends AbstractController
{    
    public function __construct(
        private CourseRepository $courseRepository,
        private QuizRepository $quizRepository,
        private UserQuizResponseRepository $userQuizResponseRepository,
        private EntityManagerInterface $entityManager,
        private Security $security,
        private AffectationRepository $affectationRepository
    ) {}

    /**
     * Récupère tous les cours assignés à l'employé connecté
     */
    #[Route('/courses', name: 'employee_assigned_courses', methods: ['GET'])]
    public function getAssignedCourses(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        // Récupérer tous les cours assignés à cet employé via l'entité Affectation
        $assignedCourses = $this->courseRepository->createQueryBuilder('c')
            ->innerJoin('App\Entity\Affectation', 'a', 'WITH', 'a.cours = c.id')
            ->leftJoin('c.quizzes', 'q')
            ->where('a.user = :userId')
            ->setParameter('userId', $user->getId())
            ->select('c', 'q')
            ->getQuery()
            ->getResult();

        $coursesData = [];
        foreach ($assignedCourses as $course) {
            $quizzes = [];
            foreach ($course->getQuizzes() as $quiz) {
                // Vérifier si l'employé a déjà répondu à ce quiz
                $userResponse = $this->userQuizResponseRepository->findOneBy([
                    'user' => $user,
                    'quiz' => $quiz
                ]);

                $quizzes[] = [
                    'id' => $quiz->getId(),
                    'title' => $quiz->getTitle(),
                    'description' => $quiz->getDescription(),
                    'completed' => $userResponse !== null,
                    'score' => $userResponse ? $userResponse->getScore() : null,
                    'submittedAt' => $userResponse ? $userResponse->getSubmittedAt()->format('Y-m-d H:i:s') : null
                ];
            }

            $coursesData[] = [
                'id' => $course->getId(),
                'title' => $course->getTitle(),
                'description' => $course->getDescription(),
                'createdAt' => $course->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $course->getUpdatedAt()->format('Y-m-d H:i:s'),
                'quizzesCount' => count($quizzes),
                'quizzes' => $quizzes
            ];
        }

        return $this->json([
            'message' => 'Cours assignés récupérés avec succès',
            'data' => $coursesData,
            'total' => count($coursesData)
        ], Response::HTTP_OK);
    }

    /**
     * Récupère les détails d'un quiz spécifique
     */
    #[Route('/quiz/{quizId}/details', name: 'employee_quiz_details', methods: ['GET'], requirements: ['quizId' => '\d+'])]
    public function getQuizDetails(int $quizId): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();        // Vérifier que l'employé a accès à ce quiz via un cours assigné
        $hasAccess = $this->courseRepository->createQueryBuilder('c')
            ->innerJoin('App\Entity\Affectation', 'a', 'WITH', 'a.cours = c.id')
            ->innerJoin('c.quizzes', 'q')
            ->where('a.user = :userId')
            ->andWhere('q.id = :quizId')
            ->setParameter('userId', $user->getId())
            ->setParameter('quizId', $quizId)
            ->select('COUNT(c.id)')
            ->getQuery()
            ->getSingleScalarResult();        if ($hasAccess == 0) {
            return $this->json(['message' => 'Quiz non accessible'], Response::HTTP_FORBIDDEN);
        }

        // Récupérer le quiz simplement
        $quiz = $this->quizRepository->find($quizId);
        
        if (!$quiz) {
            return $this->json(['message' => 'Quiz non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si l'employé a déjà répondu à ce quiz
        $userResponse = $this->userQuizResponseRepository->findOneBy([
            'user' => $user,
            'quiz' => $quiz
        ]);

        if ($userResponse) {
            return $this->json([
                'message' => 'Vous avez déjà répondu à ce quiz',
                'data' => [
                    'quiz_id' => $quiz->getId(),
                    'quiz_title' => $quiz->getTitle(),
                    'score' => $userResponse->getScore(),
                    'submittedAt' => $userResponse->getSubmittedAt()->format('Y-m-d H:i:s')
                ]
            ], Response::HTTP_CONFLICT);
        }

        // Structurer les questions et réponses pour l'affichage
        $questionsData = [];
        foreach ($quiz->getQuestions() as $question) {
            $reponsesData = [];
            foreach ($question->getReponses() as $reponse) {
                $reponsesData[] = [
                    'id' => $reponse->getId(),
                    'content' => $reponse->getContent(),
                    // Ne pas révéler la bonne réponse
                ];
            }

            $questionsData[] = [
                'id' => $question->getId(),
                'content' => $question->getContent(),
                'reponses' => $reponsesData
            ];
        }

        return $this->json([
            'message' => 'Détails du quiz récupérés avec succès',
            'data' => [
                'quiz' => [
                    'id' => $quiz->getId(),
                    'title' => $quiz->getTitle(),
                    'description' => $quiz->getDescription()
                ],
                'questions' => $questionsData,
                'questionsCount' => count($questionsData)
            ]
        ], Response::HTTP_OK);
    }

    /**
     * Récupère les détails d'un cours avec ses ressources
     */
    #[Route('/course/{id}/details', name: 'employee_course_details', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getCourseDetails(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        // Vérifier si l'employé a accès à ce cours via une affectation
        $affectation = $this->affectationRepository->findOneBy([
            'user' => $user,
            'cours' => $id
        ]);

        if (!$affectation) {
            return $this->json(['message' => 'Cours non accessible'], Response::HTTP_FORBIDDEN);
        }

        // Récupérer le cours avec toutes ses relations
        $course = $this->courseRepository->createQueryBuilder('c')
            ->leftJoin('c.ressources', 'r')
            ->leftJoin('c.quizzes', 'q')
            ->where('c.id = :courseId')
            ->setParameter('courseId', $id)
            ->select('c', 'r', 'q')
            ->getQuery()
            ->getOneOrNullResult();

        if (!$course) {
            return $this->json(['message' => 'Cours non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Structurer la réponse avec les ressources en premier
        $ressourcesData = [];
        foreach ($course->getRessources() as $ressource) {
            $ressourcesData[] = [
                'id' => $ressource->getId(),
                'contenu' => $ressource->getContenu()
            ];
        }

        $quizzesData = [];
        foreach ($course->getQuizzes() as $quiz) {
            // Vérifier si l'employé a déjà répondu à ce quiz
            $userResponse = $this->userQuizResponseRepository->findOneBy([
                'user' => $user,
                'quiz' => $quiz
            ]);

            $quizzesData[] = [
                'id' => $quiz->getId(),
                'title' => $quiz->getTitle(),
                'description' => $quiz->getDescription(),
                'questionsCount' => count($quiz->getQuestions()),
                'completed' => $userResponse !== null,
                'score' => $userResponse ? $userResponse->getScore() : null,
                'submittedAt' => $userResponse ? $userResponse->getSubmittedAt()->format('Y-m-d H:i:s') : null
            ];
        }

        return $this->json([
            'message' => 'Détails du cours récupérés avec succès',
            'data' => [
                'course' => [
                    'id' => $course->getId(),
                    'title' => $course->getTitle(),
                    'description' => $course->getDescription(),
                    'createdAt' => $course->getCreatedAt()->format('Y-m-d H:i:s'),
                    'updatedAt' => $course->getUpdatedAt()->format('Y-m-d H:i:s')
                ],
                'ressources' => $ressourcesData,
                'quizzes' => $quizzesData,
                'stats' => [
                    'totalRessources' => count($ressourcesData),
                    'totalQuizzes' => count($quizzesData),
                    'completedQuizzes' => count(array_filter($quizzesData, fn($q) => $q['completed']))
                ]
            ]
        ], Response::HTTP_OK);
    }

    /**
     * Récupère uniquement les ressources d'un cours
     */
    #[Route('/course/{courseId}/ressources', name: 'employee_course_ressources', methods: ['GET'], requirements: ['courseId' => '\d+'])]
    public function getCourseRessources(int $courseId): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        // Vérifier que l'employé a accès à ce cours
        $course = $this->courseRepository->createQueryBuilder('c')
            ->innerJoin('App\Entity\Affectation', 'a', 'WITH', 'a.cours = c.id')
            ->leftJoin('c.ressources', 'r')
            ->where('a.user = :userId')
            ->andWhere('c.id = :courseId')
            ->setParameter('userId', $user->getId())
            ->setParameter('courseId', $courseId)
            ->select('c', 'r')
            ->getQuery()
            ->getOneOrNullResult();

        if (!$course) {
            return $this->json(['message' => 'Cours non accessible'], Response::HTTP_FORBIDDEN);
        }

        $ressourcesData = [];
        foreach ($course->getRessources() as $ressource) {
            $ressourcesData[] = [
                'id' => $ressource->getId(),
                'contenu' => $ressource->getContenu()
            ];
        }

        return $this->json([
            'message' => 'Ressources du cours récupérées avec succès',
            'data' => [
                'course' => [
                    'id' => $course->getId(),
                    'title' => $course->getTitle(),
                    'description' => $course->getDescription()
                ],
                'ressources' => $ressourcesData,
                'total' => count($ressourcesData)
            ]
        ], Response::HTTP_OK);
    }

    /**
     * Récupère le profil de l'employé connecté
     */
    #[Route('/profile', name: 'employee_profile', methods: ['GET'])]
    public function getProfile(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();

        // Statistiques de l'employé
        $totalCourses = $this->courseRepository->createQueryBuilder('c')
            ->innerJoin('App\Entity\Affectation', 'a', 'WITH', 'a.cours = c.id')
            ->where('a.user = :userId')
            ->setParameter('userId', $user->getId())
            ->select('COUNT(c.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $totalQuizResponses = $this->userQuizResponseRepository->count(['user' => $user]);

        return $this->json([
            'message' => 'Profil récupéré avec succès',
            'data' => [
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'fullName' => $user->getFullName(),
                    'roles' => $user->getRoles()
                ],
                'stats' => [
                    'totalAssignedCourses' => $totalCourses,
                    'totalQuizCompleted' => $totalQuizResponses
                ]
            ]
        ], Response::HTTP_OK);
    }

    /**
     * Récupère toutes les affectations pour un employé (cours, quiz, ressources)
     */
    #[Route('/affectations/{userId}', name: 'employee_affectations', methods: ['GET'])]
    public function getEmployeeAffectations(int $userId): JsonResponse
    {
        // Récupérer l'utilisateur
        $user = $this->entityManager->getRepository(User::class)->find($userId);
        
        if (!$user) {
            return $this->json(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
        }
        
        // Vérifier que l'utilisateur est bien un employé
        $userRoles = $user->getRoles();
        if (!in_array('ROLE_EMPLOYEE', $userRoles)) {
            return $this->json(['message' => 'Access denied - User is not an employee'], Response::HTTP_FORBIDDEN);
        }
        
        // Récupérer toutes les affectations pour cet employé
        $affectations = $this->affectationRepository->findBy(['user' => $user]);
        
        // Organiser les données par type (cours, quiz, ressources)
        $courses = [];
        $quizzes = [];
        $resources = [];
        
        foreach ($affectations as $affectation) {
            // Ajouter le cours s'il est associé à cette affectation
            if ($affectation->getCourse()) {
                $course = $affectation->getCourse();
                $courses[] = [
                    'id' => $course->getId(),
                    'title' => $course->getTitle(),
                    'description' => $course->getDescription(),
                    'createdAt' => $course->getCreatedAt() ? $course->getCreatedAt()->format('Y-m-d H:i:s') : null,
                ];
            }
            
            // Ajouter le quiz s'il est associé à cette affectation
            if ($affectation->getQuiz()) {
                $quiz = $affectation->getQuiz();
                $quizzes[] = [
                    'id' => $quiz->getId(),
                    'title' => $quiz->getTitle(),
                    'questionCount' => count($quiz->getQuestions()),
                    'createdAt' => $quiz->getCreatedAt() ? $quiz->getCreatedAt()->format('Y-m-d H:i:s') : null,
                ];
            }
            
            // Ajouter les ressources si elles sont associées à cette affectation
            if ($affectation->getRessource()) {
                $resource = $affectation->getRessource();
                $resources[] = [
                    'id' => $resource->getId(),
                    'title' => $resource->getTitle(),
                    'type' => $resource->getType(),
                    'url' => $resource->getUrl(),
                    'createdAt' => $resource->getCreatedAt() ? $resource->getCreatedAt()->format('Y-m-d H:i:s') : null,
                ];
            }
        }
        
        // Retourner les données structurées
        return $this->json([
            'message' => 'Affectations retrieved successfully',
            'courses' => $courses,
            'quizzes' => $quizzes,
            'resources' => $resources,
            'total' => [
                'courses' => count($courses),
                'quizzes' => count($quizzes),
                'resources' => count($resources)
            ]
        ]);
    }

    /**
     * Debug: Récupère toutes les affectations pour déboguer
     */
    #[Route('/debug/affectations', name: 'debug_affectations', methods: ['GET'])]
    public function debugAffectations(): JsonResponse
    {
        // Récupérer toutes les affectations
        $affectations = $this->affectationRepository->findAll();
        
        $debugData = [];
        foreach ($affectations as $affectation) {
            $user = $affectation->getUser();
            $debugData[] = [
                'affectation_id' => $affectation->getId(),
                'user_id' => $user ? $user->getId() : null,
                'user_email' => $user ? $user->getEmail() : null,
                'user_roles' => $user ? $user->getRoles() : null,
                'user_role_string' => $user ? $user->getRole() : null,
                'has_course' => $affectation->getCourse() ? true : false,
                'course_id' => $affectation->getCourse() ? $affectation->getCourse()->getId() : null,
                'course_title' => $affectation->getCourse() ? $affectation->getCourse()->getTitle() : null,
                'has_quiz' => $affectation->getQuiz() ? true : false,
                'has_resource' => $affectation->getRessource() ? true : false,
                'date_assigned' => $affectation->getDateAssigned() ? $affectation->getDateAssigned()->format('Y-m-d H:i:s') : null,
            ];
        }
        
        return $this->json([
            'message' => 'Debug data for all affectations',
            'total_affectations' => count($affectations),
            'data' => $debugData
        ]);
    }
}

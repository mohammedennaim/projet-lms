<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\CourseRepository;
use App\Repository\QuizRepository;
use App\Repository\UserQuizResponseRepository;
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
{    public function __construct(
        private CourseRepository $courseRepository,
        private QuizRepository $quizRepository,
        private UserQuizResponseRepository $userQuizResponseRepository,
        private EntityManagerInterface $entityManager,
        private Security $security
    ) {}

    /**
     * Récupère tous les cours assignés à l'employé connecté
     */
    #[Route('/courses', name: 'employee_assigned_courses', methods: ['GET'])]
    public function getAssignedCourses(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        // Récupérer tous les cours assignés à cet employé
        $assignedCourses = $this->courseRepository->createQueryBuilder('c')
            ->innerJoin('c.employees', 'e')
            ->leftJoin('c.quizzes', 'q')
            ->where('e.id = :userId')
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
            ->innerJoin('c.employees', 'e')
            ->innerJoin('c.quizzes', 'q')
            ->where('e.id = :userId')
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
    #[Route('/course/{courseId}/details', name: 'employee_course_details', methods: ['GET'], requirements: ['courseId' => '\d+'])]
    public function getCourseDetails(int $courseId): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        // Vérifier que l'employé a accès à ce cours avec ses ressources
        $course = $this->courseRepository->createQueryBuilder('c')
            ->leftJoin('c.ressources', 'r')
            ->leftJoin('c.quizzes', 'q')
            ->innerJoin('c.employees', 'e')
            ->where('e.id = :userId')
            ->andWhere('c.id = :courseId')
            ->setParameter('userId', $user->getId())
            ->setParameter('courseId', $courseId)
            ->select('c', 'r', 'q')
            ->getQuery()
            ->getOneOrNullResult();

        if (!$course) {
            return $this->json(['message' => 'Cours non accessible'], Response::HTTP_FORBIDDEN);
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
                'completed' => $userResponse !== null,
                'score' => $userResponse ? $userResponse->getScore() : null
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
            ->innerJoin('c.employees', 'e')
            ->leftJoin('c.ressources', 'r')
            ->where('e.id = :userId')
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
            ->innerJoin('c.employees', 'e')
            ->where('e.id = :userId')
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
}

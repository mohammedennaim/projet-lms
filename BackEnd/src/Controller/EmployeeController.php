<?php

namespace App\Controller;

use App\Entity\Affectation;
use App\Repository\AffectationRepository;
use App\Repository\CourseRepository;
use App\Repository\UserQuizResponseRepository;
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
    private AffectationRepository $affectationRepository;
    private CourseRepository $courseRepository;
    private UserQuizResponseRepository $userQuizResponseRepository;
    private Security $security;

    public function __construct(
        AffectationRepository $affectationRepository,
        CourseRepository $courseRepository,
        UserQuizResponseRepository $userQuizResponseRepository,
        Security $security
    ) {
        $this->affectationRepository = $affectationRepository;
        $this->courseRepository = $courseRepository;
        $this->userQuizResponseRepository = $userQuizResponseRepository;
        $this->security = $security;
    }

    #[Route('/courses', name: 'employee_assigned_courses', methods: ['GET'])]
    public function getAssignedCourses(): JsonResponse
    {
        $user = $this->security->getUser();
        
        // Récupérer tous les cours assignés à cet employé
        $assignedCourses = $this->courseRepository->createQueryBuilder('c')
            ->innerJoin('c.employees', 'e')
            ->where('e.id = :userId')
            ->setParameter('userId', $user->getId())
            ->getQuery()
            ->getResult();

        $coursesWithQuizzes = [];
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
                    'questionsCount' => $quiz->getQuestionsCount(),
                    'isValid' => $quiz->isValid(),
                    'completed' => $userResponse !== null,
                    'score' => $userResponse ? $userResponse->getScore() : null,
                    'submittedAt' => $userResponse ? $userResponse->getSubmittedAt()->format('Y-m-d H:i:s') : null
                ];
            }

            $coursesWithQuizzes[] = [
                'id' => $course->getId(),
                'title' => $course->getTitle(),
                'description' => $course->getDescription(),
                'quizzes' => $quizzes
            ];
        }

        return $this->json([
            'data' => $coursesWithQuizzes
        ], Response::HTTP_OK);
    }

    #[Route('/quiz/{quizId}/details', name: 'employee_quiz_details', methods: ['GET'])]
    public function getQuizDetails(int $quizId): JsonResponse
    {
        $user = $this->security->getUser();
        
        // Vérifier que l'employé a accès à ce quiz via un cours assigné
        $quiz = $this->courseRepository->createQueryBuilder('c')
            ->innerJoin('c.employees', 'e')
            ->innerJoin('c.quizzes', 'q')
            ->where('e.id = :userId')
            ->andWhere('q.id = :quizId')
            ->setParameter('userId', $user->getId())
            ->setParameter('quizId', $quizId)
            ->select('q')
            ->getQuery()
            ->getOneOrNullResult();

        if (!$quiz) {
            return $this->json(['message' => 'Quiz non accessible'], Response::HTTP_FORBIDDEN);
        }

        // Vérifier si l'employé a déjà répondu à ce quiz
        $userResponse = $this->userQuizResponseRepository->findOneBy([
            'user' => $user,
            'quiz' => $quiz
        ]);

        if ($userResponse) {
            return $this->json([
                'message' => 'Vous avez déjà répondu à ce quiz',
                'score' => $userResponse->getScore(),
                'submittedAt' => $userResponse->getSubmittedAt()->format('Y-m-d H:i:s')
            ], Response::HTTP_CONFLICT);
        }

        return $this->json([
            'data' => $quiz
        ], Response::HTTP_OK, [], ['groups' => 'quiz:read']);
    }
}

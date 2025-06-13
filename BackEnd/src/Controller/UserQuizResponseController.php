<?php

namespace App\Controller;

use App\Entity\Question;
use App\Entity\Quiz;
use App\Entity\Reponse;
use App\Entity\User;
use App\Entity\UserQuestionResponse;
use App\Entity\UserQuizResponse;
use App\Repository\QuestionRepository;
use App\Repository\QuizRepository;
use App\Repository\ReponseRepository;
use App\Repository\UserQuizResponseRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api')]
class UserQuizResponseController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private QuizRepository $quizRepository;
    private QuestionRepository $questionRepository;
    private ReponseRepository $reponseRepository;
    private UserQuizResponseRepository $userQuizResponseRepository;
    private Security $security;
    private SerializerInterface $serializer;

    public function __construct(
        EntityManagerInterface $entityManager,
        QuizRepository $quizRepository,
        QuestionRepository $questionRepository,
        ReponseRepository $reponseRepository,
        UserQuizResponseRepository $userQuizResponseRepository,
        Security $security,
        SerializerInterface $serializer
    ) {
        $this->entityManager = $entityManager;
        $this->quizRepository = $quizRepository;
        $this->questionRepository = $questionRepository;
        $this->reponseRepository = $reponseRepository;
        $this->userQuizResponseRepository = $userQuizResponseRepository;
        $this->security = $security;
        $this->serializer = $serializer;
    }

    #[Route('/employee/quiz/{quizId}/submit', name: 'employee_quiz_submit', methods: ['POST'])]
    public function submitQuiz(int $quizId, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }
        
        $quiz = $this->quizRepository->find($quizId);
        
        if (!$quiz) {
            return $this->json(['message' => 'Quiz non trouvé'], Response::HTTP_NOT_FOUND);
        }
        
        // Vérifier que l'employé a accès à ce quiz via un cours assigné
        $courseWithQuiz = $this->quizRepository->createQueryBuilder('q')
            ->innerJoin('q.course', 'c')
            ->innerJoin('c.employees', 'e')
            ->where('q.id = :quizId')
            ->andWhere('e.id = :userId')
            ->setParameter('quizId', $quizId)
            ->setParameter('userId', $user->getId())
            ->getQuery()
            ->getOneOrNullResult();
        
        if (!$courseWithQuiz) {
            return $this->json(['message' => 'Accès refusé à ce quiz'], Response::HTTP_FORBIDDEN);
        }
        
        // Vérifier que le quiz est valide (10 questions, 4 réponses chacune)
        if (!$quiz->isValid()) {
            return $this->json([
                'message' => 'Ce quiz n\'est pas encore prêt. Il doit contenir exactement 10 questions avec 4 réponses chacune.'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        // Vérifier si l'employé a déjà répondu à ce quiz
        $existingResponse = $this->userQuizResponseRepository->findOneBy([
            'user' => $user,
            'quiz' => $quiz
        ]);
        
        if ($existingResponse) {
            return $this->json([
                'message' => 'Vous avez déjà répondu à ce quiz',
                'score' => $existingResponse->getScore(),
                'submittedAt' => $existingResponse->getSubmittedAt()->format('Y-m-d H:i:s')
            ], Response::HTTP_CONFLICT);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['responses']) || !is_array($data['responses'])) {
            return $this->json([
                'message' => 'Format de données invalide. Les réponses doivent être fournies dans un tableau "responses".'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        // Vérifier que toutes les 10 questions ont une réponse
        if (count($data['responses']) !== 10) {
            return $this->json([
                'message' => 'Vous devez répondre aux 10 questions du quiz.'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        // Créer la réponse au quiz
        $userQuizResponse = new UserQuizResponse();
        $userQuizResponse->setUser($user);
        $userQuizResponse->setQuiz($quiz);
        
        $totalQuestions = 10; // Nombre fixe selon vos exigences
        $correctAnswers = 0;
        $processedQuestions = [];
        
        // Traiter chaque réponse aux questions
        foreach ($data['responses'] as $responseData) {
            if (!isset($responseData['questionId']) || !isset($responseData['responseId'])) {
                continue;
            }
            
            $questionId = $responseData['questionId'];
            
            // Éviter les doublons de questions
            if (in_array($questionId, $processedQuestions)) {
                continue;
            }
            $processedQuestions[] = $questionId;
            
            $question = $this->questionRepository->find($questionId);
            $selectedResponse = $this->reponseRepository->find($responseData['responseId']);
            
            if (!$question || !$selectedResponse || $question->getQuiz()->getId() !== $quiz->getId()) {
                continue;
            }
            
            // Vérifier que la réponse sélectionnée appartient bien à cette question
            if (!$question->getReponses()->contains($selectedResponse)) {
                continue;
            }
            
            $userQuestionResponse = new UserQuestionResponse();
            $userQuestionResponse->setUserQuizResponse($userQuizResponse);
            $userQuestionResponse->setQuestion($question);
            $userQuestionResponse->setSelectedResponse($selectedResponse);
            
            if ($selectedResponse->isIsCorrect()) {
                $correctAnswers++;
            }
            
            $userQuizResponse->addQuestionResponse($userQuestionResponse);
        }
        
        // Calculer le score (pourcentage de réponses correctes)
        $score = ($correctAnswers / $totalQuestions) * 100;
        $userQuizResponse->setScore($score);
        
        $this->entityManager->persist($userQuizResponse);
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Réponses au quiz soumises avec succès',
            'data' => [
                'quizId' => $quiz->getId(),
                'quizTitle' => $quiz->getTitle(),
                'score' => $score,
                'correctAnswers' => $correctAnswers,
                'totalQuestions' => $totalQuestions,
                'percentage' => round($score, 2) . '%',
                'submittedAt' => $userQuizResponse->getSubmittedAt()->format('Y-m-d H:i:s')
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/employee/quiz-responses', name: 'employee_quiz_responses', methods: ['GET'])]
    public function getUserQuizResponses(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }
        
        $responses = $this->userQuizResponseRepository->findBy(['user' => $user], ['submittedAt' => 'DESC']);
        
        return $this->json([
            'data' => $responses
        ], Response::HTTP_OK, [], ['groups' => 'user_quiz_response:read']);
    }

    #[Route('/employee/quiz-response/{id}', name: 'employee_quiz_response_detail', methods: ['GET'])]
    public function getUserQuizResponseDetail(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }
        
        $quizResponse = $this->userQuizResponseRepository->find($id);
        
        if (!$quizResponse || $quizResponse->getUser()->getId() !== $user->getId()) {
            return $this->json(['message' => 'Réponse au quiz non trouvée'], Response::HTTP_NOT_FOUND);
        }
        
        return $this->json([
            'data' => $quizResponse
        ], Response::HTTP_OK, [], ['groups' => 'user_quiz_response:read']);
    }
    
    #[Route('/admin/quiz/{quizId}/results', name: 'admin_quiz_results', methods: ['GET'])]
    public function getQuizResults(int $quizId): JsonResponse
    {
        $user = $this->security->getUser();
        
        if (!$user || !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }
        
        $quiz = $this->quizRepository->find($quizId);
        
        if (!$quiz) {
            return $this->json(['message' => 'Quiz non trouvé'], Response::HTTP_NOT_FOUND);
        }
        
        $quizResponses = $this->userQuizResponseRepository->findBy(['quiz' => $quiz], ['submittedAt' => 'DESC']);
        
        return $this->json([
            'data' => [
                'quiz' => $quiz,
                'responses' => $quizResponses
            ]
        ], Response::HTTP_OK, [], ['groups' => ['quiz:read', 'user_quiz_response:read']]);
    }
}

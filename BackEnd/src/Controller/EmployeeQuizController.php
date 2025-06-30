<?php

namespace App\Controller;

use App\Entity\Quiz;
use App\Entity\User;
use App\Entity\UserQuizResponse;
use App\Entity\UserQuestionResponse;
use App\Entity\Question;
use App\Entity\Reponse;
use App\Entity\Affectation;
use App\Repository\QuizRepository;
use App\Repository\UserRepository;
use App\Repository\UserQuizResponseRepository;
use App\Repository\AffectationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/employee/quiz', name: 'api_employee_quiz_')]
#[IsGranted('ROLE_EMPLOYEE')]
class EmployeeQuizController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private QuizRepository $quizRepository,
        private UserRepository $userRepository,
        private UserQuizResponseRepository $userQuizResponseRepository,
        private AffectationRepository $affectationRepository
    ) {}

    #[Route('/{id}', name: 'get_quiz', methods: ['GET'])]
    public function getQuiz(int $id): JsonResponse
    {
        try {
            $quiz = $this->quizRepository->find($id);
            
            if (!$quiz) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Quiz non trouvé'
                ], 404);
            }

            // Vérifier si l'utilisateur connecté a accès à ce quiz via une affectation de cours
            $user = $this->getUser();
            $hasAccess = false;
            
            $affectations = $this->affectationRepository->findBy(['user' => $user]);
            foreach ($affectations as $affectation) {
                if ($affectation->getCourse() === $quiz->getCourse()) {
                    $hasAccess = true;
                    break;
                }
            }
            
            if (!$hasAccess) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Vous n\'avez pas accès à ce quiz'
                ], 403);
            }

            // Vérifier si l'utilisateur a déjà passé ce quiz
            $existingResponse = $this->userQuizResponseRepository->findOneBy([
                'user' => $user,
                'quiz' => $quiz
            ]);

            $data = [
                'id' => $quiz->getId(),
                'title' => $quiz->getTitle(),
                'description' => $quiz->getDescription(),
                'course' => [
                    'id' => $quiz->getCourse()->getId(),
                    'title' => $quiz->getCourse()->getTitle()
                ],
                'questions' => [],
                'alreadySubmitted' => $existingResponse !== null,
                'previousScore' => $existingResponse ? $existingResponse->getScore() : null,
                'submittedAt' => $existingResponse ? $existingResponse->getSubmittedAt()->format('Y-m-d H:i:s') : null
            ];

            // Si le quiz n'a pas encore été passé, inclure les questions
            if (!$existingResponse) {
                foreach ($quiz->getQuestions() as $question) {
                    $questionData = [
                        'id' => $question->getId(),
                        'content' => $question->getContent(),
                        'responses' => []
                    ];

                    foreach ($question->getReponses() as $response) {
                        $questionData['responses'][] = [
                            'id' => $response->getId(),
                            'content' => $response->getContent()
                            // Ne pas inclure isCorrect pour éviter la triche
                        ];
                    }

                    $data['questions'][] = $questionData;
                }
            }

            return new JsonResponse([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Erreur lors de la récupération du quiz: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/{id}/submit', name: 'submit_quiz', methods: ['POST'])]
    public function submitQuiz(int $id, Request $request): JsonResponse
    {
        try {
            $quiz = $this->quizRepository->find($id);
            
            if (!$quiz) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Quiz non trouvé'
                ], 404);
            }

            $user = $this->getUser();
            
            // Vérifier si l'utilisateur a accès à ce quiz
            $hasAccess = false;
            $affectations = $this->affectationRepository->findBy(['user' => $user]);
            foreach ($affectations as $affectation) {
                if ($affectation->getCourse() === $quiz->getCourse()) {
                    $hasAccess = true;
                    break;
                }
            }
            
            if (!$hasAccess) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Vous n\'avez pas accès à ce quiz'
                ], 403);
            }

            // Vérifier si l'utilisateur a déjà passé ce quiz
            $existingResponse = $this->userQuizResponseRepository->findOneBy([
                'user' => $user,
                'quiz' => $quiz
            ]);

            if ($existingResponse) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Vous avez déjà passé ce quiz'
                ], 400);
            }

            $data = json_decode($request->getContent(), true);
            $answers = $data['answers'] ?? [];
            $timeSpent = $data['timeSpent'] ?? null; // Temps total en secondes
            $questionTimes = $data['questionTimes'] ?? []; // Temps par question

            if (empty($answers)) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Aucune réponse fournie'
                ], 400);
            }

            // Créer la réponse du quiz
            $userQuizResponse = new UserQuizResponse();
            $userQuizResponse->setUser($user);
            $userQuizResponse->setQuiz($quiz);
            
            if ($timeSpent) {
                $userQuizResponse->setTimeSpentSeconds($timeSpent);
            }

            $correctAnswers = 0;
            $totalQuestions = count($quiz->getQuestions());

            // Traiter chaque réponse
            foreach ($answers as $answerData) {
                $questionId = $answerData['questionId'] ?? null;
                $selectedResponseId = $answerData['selectedResponseId'] ?? null;

                if (!$questionId || !$selectedResponseId) {
                    continue;
                }

                $question = $this->entityManager->getRepository(Question::class)->find($questionId);
                $selectedResponse = $this->entityManager->getRepository(Reponse::class)->find($selectedResponseId);

                if (!$question || !$selectedResponse) {
                    continue;
                }

                // Vérifier que la question appartient au quiz
                if ($question->getQuiz() !== $quiz) {
                    continue;
                }

                // Vérifier que la réponse appartient à la question
                if ($selectedResponse->getQuestion() !== $question) {
                    continue;
                }

                // Créer la réponse à la question
                $userQuestionResponse = new UserQuestionResponse();
                $userQuestionResponse->setUserQuizResponse($userQuizResponse);
                $userQuestionResponse->setQuestion($question);
                $userQuestionResponse->setSelectedResponse($selectedResponse);
                
                // Ajouter le temps passé sur cette question si disponible
                if (isset($questionTimes[$questionId])) {
                    $userQuestionResponse->setTimeSpentSeconds($questionTimes[$questionId]);
                }

                if ($selectedResponse->isIsCorrect()) {
                    $correctAnswers++;
                }

                $userQuizResponse->addQuestionResponse($userQuestionResponse);
            }

            // Calculer et sauvegarder les statistiques
            $userQuizResponse->setTotalQuestions($totalQuestions);
            $userQuizResponse->setCorrectAnswers($correctAnswers);
            
            $score = $totalQuestions > 0 ? ($correctAnswers / $totalQuestions) * 100 : 0;
            $userQuizResponse->setScore($score);
            
            // Générer un feedback personnalisé
            $feedback = $this->generateFeedback($score, $correctAnswers, $totalQuestions);
            $userQuizResponse->setFeedback($feedback);

            // Sauvegarder en base
            $this->entityManager->persist($userQuizResponse);
            $this->entityManager->flush();

            return new JsonResponse([
                'success' => true,
                'data' => [
                    'score' => $score,
                    'correctAnswers' => $correctAnswers,
                    'totalQuestions' => $totalQuestions,
                    'percentage' => $userQuizResponse->getPercentageScore(),
                    'performanceLevel' => $userQuizResponse->getPerformanceLevel(),
                    'feedback' => $feedback,
                    'timeSpent' => $timeSpent,
                    'submittedAt' => $userQuizResponse->getSubmittedAt()->format('Y-m-d H:i:s')
                ],
                'message' => 'Quiz soumis avec succès'
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Erreur lors de la soumission du quiz: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/{id}/results', name: 'get_results', methods: ['GET'])]
    public function getQuizResults(int $id): JsonResponse
    {
        try {
            $quiz = $this->quizRepository->find($id);
            
            if (!$quiz) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Quiz non trouvé'
                ], 404);
            }

            $user = $this->getUser();
            
            $userQuizResponse = $this->userQuizResponseRepository->findOneBy([
                'user' => $user,
                'quiz' => $quiz
            ]);

            if (!$userQuizResponse) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Vous n\'avez pas encore passé ce quiz'
                ], 404);
            }

            $results = [
                'quiz' => [
                    'id' => $quiz->getId(),
                    'title' => $quiz->getTitle(),
                    'description' => $quiz->getDescription()
                ],
                'score' => $userQuizResponse->getScore(),
                'correctAnswers' => $userQuizResponse->getCorrectAnswers(),
                'totalQuestions' => $userQuizResponse->getTotalQuestions(),
                'percentage' => $userQuizResponse->getPercentageScore(),
                'performanceLevel' => $userQuizResponse->getPerformanceLevel(),
                'feedback' => $userQuizResponse->getFeedback(),
                'timeSpent' => $userQuizResponse->getTimeSpentSeconds(),
                'submittedAt' => $userQuizResponse->getSubmittedAt()->format('Y-m-d H:i:s'),
                'questions' => []
            ];

            foreach ($userQuizResponse->getQuestionResponses() as $questionResponse) {
                $question = $questionResponse->getQuestion();
                $selectedResponse = $questionResponse->getSelectedResponse();

                $questionData = [
                    'id' => $question->getId(),
                    'content' => $question->getContent(),
                    'selectedResponse' => [
                        'id' => $selectedResponse->getId(),
                        'content' => $selectedResponse->getContent(),
                        'isCorrect' => $selectedResponse->isIsCorrect()
                    ],
                    'isCorrect' => $questionResponse->isIsCorrect(),
                    'timeSpent' => $questionResponse->getTimeSpentSeconds(),
                    'answeredAt' => $questionResponse->getAnsweredAt()->format('Y-m-d H:i:s'),
                    'correctResponses' => []
                ];

                // Ajouter toutes les bonnes réponses pour cette question
                foreach ($question->getReponses() as $response) {
                    if ($response->isIsCorrect()) {
                        $questionData['correctResponses'][] = [
                            'id' => $response->getId(),
                            'content' => $response->getContent()
                        ];
                    }
                }

                $results['questions'][] = $questionData;
            }

            return new JsonResponse([
                'success' => true,
                'data' => $results
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Erreur lors de la récupération des résultats: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/statistics', name: 'quiz_statistics', methods: ['GET'])]
    public function getQuizStatistics(): JsonResponse
    {
        try {
            $user = $this->getUser();
            
            // Récupérer tous les quiz passés par l'utilisateur
            $userQuizResponses = $this->userQuizResponseRepository->findBy(['user' => $user]);
            
            $statistics = [
                'totalQuizzesTaken' => count($userQuizResponses),
                'averageScore' => 0,
                'bestScore' => 0,
                'worstScore' => 100,
                'totalTimeSpent' => 0,
                'performanceBreakdown' => [
                    'Excellent' => 0,
                    'Très bien' => 0,
                    'Bien' => 0,
                    'Satisfaisant' => 0,
                    'Passable' => 0,
                    'Insuffisant' => 0
                ],
                'recentQuizzes' => []
            ];
            
            if (count($userQuizResponses) > 0) {
                $totalScore = 0;
                
                foreach ($userQuizResponses as $response) {
                    $score = $response->getPercentageScore();
                    $totalScore += $score;
                    
                    // Mise à jour des meilleurs/pires scores
                    if ($score > $statistics['bestScore']) {
                        $statistics['bestScore'] = $score;
                    }
                    if ($score < $statistics['worstScore']) {
                        $statistics['worstScore'] = $score;
                    }
                    
                    // Temps total
                    if ($response->getTimeSpentSeconds()) {
                        $statistics['totalTimeSpent'] += $response->getTimeSpentSeconds();
                    }
                    
                    // Breakdown par niveau de performance
                    $level = $response->getPerformanceLevel();
                    if (isset($statistics['performanceBreakdown'][$level])) {
                        $statistics['performanceBreakdown'][$level]++;
                    }
                    
                    // Quiz récents (5 derniers)
                    if (count($statistics['recentQuizzes']) < 5) {
                        $statistics['recentQuizzes'][] = [
                            'quiz' => [
                                'id' => $response->getQuiz()->getId(),
                                'title' => $response->getQuiz()->getTitle(),
                                'course' => $response->getQuiz()->getCourse()->getTitle()
                            ],
                            'score' => $score,
                            'performanceLevel' => $level,
                            'submittedAt' => $response->getSubmittedAt()->format('Y-m-d H:i:s')
                        ];
                    }
                }
                
                $statistics['averageScore'] = round($totalScore / count($userQuizResponses), 2);
            }
            
            return new JsonResponse([
                'success' => true,
                'data' => $statistics
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Génère un feedback personnalisé basé sur le score
     */
    private function generateFeedback(float $score, int $correctAnswers, int $totalQuestions): string
    {
        $percentage = round($score, 1);
        
        if ($percentage >= 90) {
            return "Excellent travail ! Vous avez obtenu {$correctAnswers}/{$totalQuestions} bonnes réponses ({$percentage}%). Vous maîtrisez parfaitement ce sujet.";
        } elseif ($percentage >= 80) {
            return "Très bien ! Vous avez obtenu {$correctAnswers}/{$totalQuestions} bonnes réponses ({$percentage}%). Vous avez une bonne compréhension du sujet.";
        } elseif ($percentage >= 70) {
            return "Bien joué ! Vous avez obtenu {$correctAnswers}/{$totalQuestions} bonnes réponses ({$percentage}%). Quelques révisions pourraient vous aider à parfaire vos connaissances.";
        } elseif ($percentage >= 60) {
            return "Résultat satisfaisant. Vous avez obtenu {$correctAnswers}/{$totalQuestions} bonnes réponses ({$percentage}%). Il serait bénéfique de revoir certains points du cours.";
        } elseif ($percentage >= 50) {
            return "Résultat passable. Vous avez obtenu {$correctAnswers}/{$totalQuestions} bonnes réponses ({$percentage}%). Je vous recommande de réviser le cours attentivement.";
        } else {
            return "Il semble que vous ayez des difficultés avec ce sujet. Vous avez obtenu {$correctAnswers}/{$totalQuestions} bonnes réponses ({$percentage}%). N'hésitez pas à revoir le cours et à demander de l'aide si nécessaire.";
        }
    }
}

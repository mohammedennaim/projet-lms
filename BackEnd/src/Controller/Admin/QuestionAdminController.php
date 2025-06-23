<?php

namespace App\Controller\Admin;

use App\Entity\Question;
use App\Entity\Quiz;
use App\Entity\Reponse;
use App\Repository\QuestionRepository;
use App\Repository\QuizRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bundle\SecurityBundle\Security;

#[Route('/api/admin')]
class QuestionAdminController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private QuestionRepository $questionRepository;
    private QuizRepository $quizRepository;
    private SerializerInterface $serializer;
    private ValidatorInterface $validator;
    private Security $security;
    
    public function __construct(
        EntityManagerInterface $entityManager,
        QuestionRepository $questionRepository,
        QuizRepository $quizRepository,
        SerializerInterface $serializer,
        ValidatorInterface $validator,
        Security $security
    ) {
        $this->entityManager = $entityManager;
        $this->questionRepository = $questionRepository;
        $this->quizRepository = $quizRepository;
        $this->serializer = $serializer;
        $this->validator = $validator;
        $this->security = $security;
    }

    #[Route('/questions', name: 'admin_question_list', methods: ['GET'])]
    public function getQuestions(Request $request): JsonResponse
    {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);
        $search = $request->query->get('search', '');

        $queryBuilder = $this->questionRepository->createQueryBuilder('q')
            ->leftJoin('q.quiz', 'quiz')
            ->leftJoin('q.reponses', 'reponses')
            ->addSelect('quiz', 'reponses');

        if ($search) {
            $queryBuilder->where('q.content LIKE :search OR quiz.title LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        $totalQuery = clone $queryBuilder;
        $total = $totalQuery->select('COUNT(q.id)')->getQuery()->getSingleScalarResult();

        $questions = $queryBuilder
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
        
        return $this->json([
            'data' => $questions,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil($total / $limit)
        ], Response::HTTP_OK, [], ['groups' => 'question:read']);
    }
    
    #[Route('/questions/{id}', name: 'admin_question_show', methods: ['GET'])]
    public function getQuestion(int $id): JsonResponse
    {
        $question = $this->questionRepository->find($id);
        
        if (!$question) {
            return $this->json(['message' => 'Question not found'], Response::HTTP_NOT_FOUND);
        }
        
        return $this->json([
            'data' => $question,
        ], Response::HTTP_OK, [], ['groups' => 'question:read']);
    }
      #[Route('/questions', name: 'admin_question_create', methods: ['POST'])]
    public function createQuestion(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (!$data) {
                return $this->json(['errors' => ['general' => 'Données JSON invalides']], Response::HTTP_BAD_REQUEST);
            }
            
            $question = new Question();
            
            if (!isset($data['content']) || empty(trim($data['content']))) {
                return $this->json(['errors' => ['content' => 'Le contenu de la question est requis']], Response::HTTP_BAD_REQUEST);
            }
              $question->setContent($data['content']);
            
            // Gérer l'association avec le quiz (obligatoire)
            if (!isset($data['quiz']) || empty($data['quiz'])) {
                return $this->json(['errors' => ['quiz' => 'Un quiz doit être sélectionné']], Response::HTTP_BAD_REQUEST);
            }
            
            $quiz = $this->quizRepository->find($data['quiz']);
            if (!$quiz) {
                return $this->json(['errors' => ['quiz' => 'Quiz introuvable']], Response::HTTP_BAD_REQUEST);
            }
            $question->setQuiz($quiz);
              // Gérer les réponses
            if (isset($data['reponses']) && is_array($data['reponses'])) {
                if (count($data['reponses']) !== 4) {
                    return $this->json(['errors' => ['reponses' => 'Exactement 4 réponses sont requises']], Response::HTTP_BAD_REQUEST);
                }
                
                $correctCount = 0;
                foreach ($data['reponses'] as $index => $reponseData) {
                    if (!isset($reponseData['content']) || empty(trim($reponseData['content']))) {
                        return $this->json(['errors' => ['reponses' => "Le contenu de la réponse " . ($index + 1) . " est requis"]], Response::HTTP_BAD_REQUEST);
                    }
                    
                    $reponse = new Reponse();
                    $reponse->setContent($reponseData['content']);
                    $reponse->setIsCorrect($reponseData['isCorrect'] ?? false);
                    
                    if ($reponseData['isCorrect'] ?? false) {
                        $correctCount++;
                    }
                    
                    $reponse->setQuestion($question);
                    $question->addReponse($reponse);
                    // Ne pas persister les réponses individuellement, laisser Doctrine gérer la cascade
                }
                
                if ($correctCount !== 1) {
                    return $this->json(['errors' => ['reponses' => 'Exactement une réponse doit être correcte']], Response::HTTP_BAD_REQUEST);
                }
            }
            
            $errors = $this->validator->validate($question);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }
                
                return $this->json(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
            }
            
            $this->entityManager->persist($question);
            $this->entityManager->flush();
            
            return $this->json([
                'message' => 'Question created successfully',
                'data' => $question,
            ], Response::HTTP_CREATED, [], ['groups' => 'question:read']);
            
        } catch (\Exception $e) {
            return $this->json([
                'errors' => ['general' => 'Erreur serveur: ' . $e->getMessage()]
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    #[Route('/questions/{id}', name: 'admin_question_update', methods: ['PUT'])]
    public function updateQuestion(int $id, Request $request): JsonResponse
    {
        $question = $this->questionRepository->find($id);
        
        if (!$question) {
            return $this->json(['message' => 'Question not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['content'])) {
            $question->setContent($data['content']);
        }
        
        // Gérer l'association avec le quiz
        if (isset($data['quiz'])) {
            $quiz = $this->quizRepository->find($data['quiz']);
            if (!$quiz) {
                return $this->json(['errors' => ['quiz' => 'Quiz introuvable']], Response::HTTP_BAD_REQUEST);
            }
            $question->setQuiz($quiz);
        }
        
        // Gérer les réponses - supprimer les anciennes et ajouter les nouvelles
        if (isset($data['reponses']) && is_array($data['reponses'])) {
            // Supprimer les anciennes réponses
            foreach ($question->getReponses() as $oldReponse) {
                $question->removeReponse($oldReponse);
                $this->entityManager->remove($oldReponse);
            }
            
            // Ajouter les nouvelles réponses
            foreach ($data['reponses'] as $reponseData) {
                $reponse = new Reponse();
                $reponse->setContent($reponseData['content']);
                $reponse->setIsCorrect($reponseData['isCorrect'] ?? false);
                $reponse->setQuestion($question);
                $question->addReponse($reponse);
            }
        }
        
        $errors = $this->validator->validate($question);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            
            return $this->json(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Question updated successfully',
            'data' => $question,
        ], Response::HTTP_OK, [], ['groups' => 'question:read']);
    }
    
    #[Route('/questions/{id}', name: 'admin_question_delete', methods: ['DELETE'])]
    public function deleteQuestion(int $id): JsonResponse
    {
        $question = $this->questionRepository->find($id);
        
        if (!$question) {
            return $this->json(['message' => 'Question not found'], Response::HTTP_NOT_FOUND);
        }
        
        $this->entityManager->remove($question);
        $this->entityManager->flush();
        
        return $this->json(['message' => 'Question deleted successfully'], Response::HTTP_OK);
    }
    
    #[Route('/questions/{id}/validate', name: 'admin_question_validate', methods: ['POST'])]
    public function validateQuestion(int $id): JsonResponse
    {
        $question = $this->questionRepository->find($id);
        
        if (!$question) {
            return $this->json(['message' => 'Question not found'], Response::HTTP_NOT_FOUND);
        }
        
        $errors = [];
        
        // Vérifier le nombre de réponses
        if (count($question->getReponses()) !== 4) {
            $errors[] = "La question doit avoir exactement 4 réponses. Actuellement: " . count($question->getReponses());
        }
        
        // Vérifier qu'il y a exactement une réponse correcte
        if ($question->getCorrectAnswersCount() !== 1) {
            $errors[] = "La question doit avoir exactement 1 réponse correcte. Actuellement: " . $question->getCorrectAnswersCount();
        }
        
        if (empty($errors)) {
            return $this->json([
                'message' => 'Question validée avec succès',
                'isValid' => true
            ], Response::HTTP_OK);
        } else {
            return $this->json([
                'message' => 'Question invalide',
                'isValid' => false,
                'errors' => $errors
            ], Response::HTTP_BAD_REQUEST);
        }
    }
    
    #[Route('/questions/test', name: 'admin_question_test', methods: ['POST'])]
    public function testQuestionCreation(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            return $this->json([
                'message' => 'Test successful',
                'received_data' => $data,
                'timestamp' => new \DateTime()
            ], Response::HTTP_OK);
            
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Test failed: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

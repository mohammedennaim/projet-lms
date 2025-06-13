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

#[Route('/api/admin')]
class QuestionController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private QuestionRepository $questionRepository;
    private QuizRepository $quizRepository;
    private SerializerInterface $serializer;
    private ValidatorInterface $validator;
    
    public function __construct(
        EntityManagerInterface $entityManager,
        QuestionRepository $questionRepository,
        QuizRepository $quizRepository,
        SerializerInterface $serializer,
        ValidatorInterface $validator
    ) {
        $this->entityManager = $entityManager;
        $this->questionRepository = $questionRepository;
        $this->quizRepository = $quizRepository;
        $this->serializer = $serializer;
        $this->validator = $validator;
    }

    #[Route('/questions', name: 'question_list', methods: ['GET'])]
    public function getQuestions(): JsonResponse
    {
        $questions = $this->questionRepository->findAll();
        
        return $this->json([
            'data' => $questions,
        ], Response::HTTP_OK, [], ['groups' => 'question:read']);
    }
    
    #[Route('/questions/{id}', name: 'question_show', methods: ['GET'])]
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
    
    #[Route('/quizzes/{quizId}/questions', name: 'question_create', methods: ['POST'])]
    public function createQuestion(int $quizId, Request $request): JsonResponse
    {
        $quiz = $this->quizRepository->find($quizId);
        
        if (!$quiz) {
            return $this->json(['message' => 'Quiz not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['content'])) {
            return $this->json(['message' => 'Question content is required'], Response::HTTP_BAD_REQUEST);
        }
        
        $question = new Question();
        $question->setContent($data['content']);
        $question->setQuiz($quiz);
        
        // Traiter les réponses si elles sont fournies
        if (isset($data['reponses']) && is_array($data['reponses'])) {
            $hasCorrectAnswer = false;
            
            foreach ($data['reponses'] as $reponseData) {
                if (!isset($reponseData['content'])) {
                    return $this->json(['message' => 'Each response must have content'], Response::HTTP_BAD_REQUEST);
                }
                
                $reponse = new Reponse();
                $reponse->setContent($reponseData['content']);
                $reponse->setIsCorrect($reponseData['isCorrect'] ?? false);
                $reponse->setQuestion($question);
                
                if ($reponse->isIsCorrect()) {
                    $hasCorrectAnswer = true;
                }
                
                // Valider la réponse
                $reponseErrors = $this->validator->validate($reponse);
                if (count($reponseErrors) > 0) {
                    $errorMessages = [];
                    foreach ($reponseErrors as $error) {
                        $errorMessages[] = $error->getMessage();
                    }
                    return $this->json(['message' => 'Response validation failed', 'errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
                }
                
                $question->addReponse($reponse);
                $this->entityManager->persist($reponse);
            }
            
            // Vérifier qu'il y a au moins une bonne réponse
            if (!$hasCorrectAnswer && count($data['reponses']) > 0) {
                return $this->json(['message' => 'At least one response must be marked as correct'], Response::HTTP_BAD_REQUEST);
            }
        }
        
        // Valider la question
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
        ], Response::HTTP_CREATED, [], ['groups' => ['question:read', 'quiz:read']]);
    }
    
    #[Route('/questions/{id}', name: 'question_update', methods: ['PUT'])]
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
    
    #[Route('/questions/{id}', name: 'question_delete', methods: ['DELETE'])]
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
}

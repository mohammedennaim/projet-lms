<?php

namespace App\Controller\Admin;

use App\Entity\Question;
use App\Entity\Quiz;
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
        
        $question = new Question();
        $question->setContent($data['content']);
        $question->setQuiz($quiz);
        
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

<?php

namespace App\Controller;

use App\Entity\Quiz;
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

#[Route('/api')]
class QuizController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private QuizRepository $quizRepository;
    private SerializerInterface $serializer;
    private ValidatorInterface $validator;
    private Security $security;
    
    public function __construct(
        EntityManagerInterface $entityManager,
        QuizRepository $quizRepository,
        SerializerInterface $serializer,
        ValidatorInterface $validator,
        Security $security
    ) {
        $this->entityManager = $entityManager;
        $this->quizRepository = $quizRepository;
        $this->serializer = $serializer;
        $this->validator = $validator;
        $this->security = $security;
    }

    #[Route('/quizzes', name: 'quiz_list', methods: ['GET'])]
    public function getQuizzes(): JsonResponse
    {
        $quizzes = $this->quizRepository->findAll();
        
        return $this->json([
            'data' => $quizzes,
        ], Response::HTTP_OK, [], ['groups' => 'quiz:read']);
    }
    
    #[Route('/quizzes/{id}', name: 'quiz_show', methods: ['GET'])]
    public function getQuiz(int $id): JsonResponse
    {
        $quiz = $this->quizRepository->find($id);
        
        if (!$quiz) {
            return $this->json(['message' => 'Quiz not found'], Response::HTTP_NOT_FOUND);
        }
        
        return $this->json([
            'data' => $quiz,
        ], Response::HTTP_OK, [], ['groups' => 'quiz:read']);
    }
    
    #[Route('/quizzes', name: 'quiz_create', methods: ['POST'])]
    public function createQuiz(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $quiz = new Quiz();
        $quiz->setTitle($data['title']);
        
        if (isset($data['description'])) {
            $quiz->setDescription($data['description']);
        }
        
        $errors = $this->validator->validate($quiz);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            
            return $this->json(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->persist($quiz);
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Quiz created successfully',
            'data' => $quiz,
        ], Response::HTTP_CREATED, [], ['groups' => 'quiz:read']);
    }
    
    #[Route('/quizzes/{id}', name: 'quiz_update', methods: ['PUT'])]
    public function updateQuiz(int $id, Request $request): JsonResponse
    {
        $quiz = $this->quizRepository->find($id);
        
        if (!$quiz) {
            return $this->json(['message' => 'Quiz not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['title'])) {
            $quiz->setTitle($data['title']);
        }
        
        if (isset($data['description'])) {
            $quiz->setDescription($data['description']);
        }
        
        $errors = $this->validator->validate($quiz);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            
            return $this->json(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Quiz updated successfully',
            'data' => $quiz,
        ], Response::HTTP_OK, [], ['groups' => 'quiz:read']);
    }
    
    #[Route('/quizzes/{id}', name: 'quiz_delete', methods: ['DELETE'])]
    public function deleteQuiz(int $id): JsonResponse
    {
        $quiz = $this->quizRepository->find($id);
        
        if (!$quiz) {
            return $this->json(['message' => 'Quiz not found'], Response::HTTP_NOT_FOUND);
        }
        
        $this->entityManager->remove($quiz);
        $this->entityManager->flush();
        
        return $this->json(['message' => 'Quiz deleted successfully'], Response::HTTP_OK);
    }
    
    #[Route('/admin/quizzes/{id}/validate', name: 'quiz_validate', methods: ['POST'])]
    public function validateQuiz(int $id): JsonResponse
    {
        $user = $this->security->getUser();
        
        if (!$user || !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }
        
        $quiz = $this->quizRepository->find($id);
        
        if (!$quiz) {
            return $this->json(['message' => 'Quiz not found'], Response::HTTP_NOT_FOUND);
        }
        
        $errors = [];
        
        // Vérifier le nombre de questions
        if ($quiz->getQuestionsCount() !== 10) {
            $errors[] = "Le quiz doit contenir exactement 10 questions. Actuellement: " . $quiz->getQuestionsCount();
        }
        
        // Vérifier chaque question
        foreach ($quiz->getQuestions() as $index => $question) {
            $questionNumber = $index + 1;
            
            if (count($question->getReponses()) !== 4) {
                $errors[] = "La question $questionNumber doit avoir exactement 4 réponses. Actuellement: " . count($question->getReponses());
            }
            
            if ($question->getCorrectAnswersCount() !== 1) {
                $errors[] = "La question $questionNumber doit avoir exactement 1 réponse correcte. Actuellement: " . $question->getCorrectAnswersCount();
            }
        }
        
        if (empty($errors)) {
            return $this->json([
                'message' => 'Quiz validé avec succès',
                'isValid' => true
            ], Response::HTTP_OK);
        } else {
            return $this->json([
                'message' => 'Quiz invalide',
                'isValid' => false,
                'errors' => $errors
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}

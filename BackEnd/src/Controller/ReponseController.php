<?php

namespace App\Controller;

use App\Entity\Question;
use App\Entity\Reponse;
use App\Repository\QuestionRepository;
use App\Repository\ReponseRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
class ReponseController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private ReponseRepository $reponseRepository;
    private QuestionRepository $questionRepository;
    private SerializerInterface $serializer;
    private ValidatorInterface $validator;
    
    public function __construct(
        EntityManagerInterface $entityManager,
        ReponseRepository $reponseRepository,
        QuestionRepository $questionRepository,
        SerializerInterface $serializer,
        ValidatorInterface $validator
    ) {
        $this->entityManager = $entityManager;
        $this->reponseRepository = $reponseRepository;
        $this->questionRepository = $questionRepository;
        $this->serializer = $serializer;
        $this->validator = $validator;
    }

    #[Route('/reponses', name: 'reponse_list', methods: ['GET'])]
    public function getReponses(): JsonResponse
    {
        $reponses = $this->reponseRepository->findAll();
        
        return $this->json([
            'data' => $reponses,
        ], Response::HTTP_OK, [], ['groups' => 'reponse:read']);
    }
    
    #[Route('/reponses/{id}', name: 'reponse_show', methods: ['GET'])]
    public function getReponse(int $id): JsonResponse
    {
        $reponse = $this->reponseRepository->find($id);
        
        if (!$reponse) {
            return $this->json(['message' => 'Reponse not found'], Response::HTTP_NOT_FOUND);
        }
        
        return $this->json([
            'data' => $reponse,
        ], Response::HTTP_OK, [], ['groups' => 'reponse:read']);
    }
    
    #[Route('/questions/{questionId}/reponses', name: 'reponse_create', methods: ['POST'])]
    public function createReponse(int $questionId, Request $request): JsonResponse
    {
        $question = $this->questionRepository->find($questionId);
        
        if (!$question) {
            return $this->json(['message' => 'Question not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        $reponse = new Reponse();
        $reponse->setContent($data['content']);
        $reponse->setIsCorrect($data['isCorrect'] ?? false);
        $reponse->setQuestion($question);
        
        // Vérifier qu'il n'y a pas déjà une réponse correcte si celle-ci est correcte
        if ($reponse->isIsCorrect()) {
            $existingCorrectReponses = $this->reponseRepository->findBy([
                'question' => $question,
                'isCorrect' => true
            ]);
            
            if (count($existingCorrectReponses) > 0) {
                return $this->json([
                    'message' => 'Une seule réponse correcte est autorisée par question.'
                ], Response::HTTP_BAD_REQUEST);
            }
        }
        
        $errors = $this->validator->validate($reponse);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            
            return $this->json(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->persist($reponse);
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Reponse created successfully',
            'data' => $reponse,
        ], Response::HTTP_CREATED, [], ['groups' => 'reponse:read']);
    }
    
    #[Route('/reponses/{id}', name: 'reponse_update', methods: ['PUT'])]
    public function updateReponse(int $id, Request $request): JsonResponse
    {
        $reponse = $this->reponseRepository->find($id);
        
        if (!$reponse) {
            return $this->json(['message' => 'Reponse not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['content'])) {
            $reponse->setContent($data['content']);
        }
        
        if (isset($data['isCorrect'])) {
            $oldIsCorrect = $reponse->isIsCorrect();
            $newIsCorrect = $data['isCorrect'];
            
            // Si la réponse devient correcte, vérifier qu'il n'y a pas déjà une réponse correcte
            if ($newIsCorrect && !$oldIsCorrect) {
                $existingCorrectReponses = $this->reponseRepository->findBy([
                    'question' => $reponse->getQuestion(),
                    'isCorrect' => true
                ]);
                
                if (count($existingCorrectReponses) > 0) {
                    return $this->json([
                        'message' => 'Une seule réponse correcte est autorisée par question.'
                    ], Response::HTTP_BAD_REQUEST);
                }
            }
            
            $reponse->setIsCorrect($newIsCorrect);
        }
        
        $errors = $this->validator->validate($reponse);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            
            return $this->json(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Reponse updated successfully',
            'data' => $reponse,
        ], Response::HTTP_OK, [], ['groups' => 'reponse:read']);
    }
    
    #[Route('/reponses/{id}', name: 'reponse_delete', methods: ['DELETE'])]
    public function deleteReponse(int $id): JsonResponse
    {
        $reponse = $this->reponseRepository->find($id);
        
        if (!$reponse) {
            return $this->json(['message' => 'Reponse not found'], Response::HTTP_NOT_FOUND);
        }
        
        $this->entityManager->remove($reponse);
        $this->entityManager->flush();
        
        return $this->json(['message' => 'Reponse deleted successfully'], Response::HTTP_OK);
    }
}

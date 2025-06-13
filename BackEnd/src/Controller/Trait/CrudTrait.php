<?php

namespace App\Controller\Trait;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

trait CrudTrait
{
    /**
     * Crée une nouvelle entité
     */
    protected function createEntity(
        $entity,
        Request $request,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        ValidatorInterface $validator,
        array $groups = []
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (!$data) {
                return $this->errorResponse('Invalid JSON data');
            }

            // Hydrate l'entité avec les données
            $serializer->deserialize(
                $request->getContent(),
                get_class($entity),
                'json',
                ['object_to_populate' => $entity, 'groups' => $groups]
            );

            // Validation
            $errors = $validator->validate($entity);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }
                return $this->errorResponse('Validation failed', 400, $errorMessages);
            }

            $entityManager->persist($entity);
            $entityManager->flush();

            $responseData = $serializer->serialize($entity, 'json', ['groups' => $groups]);
            
            return new JsonResponse($responseData, 201, [], true);
            
        } catch (\Exception $e) {
            return $this->errorResponse('An error occurred: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Met à jour une entité existante
     */
    protected function updateEntity(
        $entity,
        Request $request,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        ValidatorInterface $validator,
        array $groups = []
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (!$data) {
                return $this->errorResponse('Invalid JSON data');
            }

            // Hydrate l'entité avec les nouvelles données
            $serializer->deserialize(
                $request->getContent(),
                get_class($entity),
                'json',
                ['object_to_populate' => $entity, 'groups' => $groups]
            );

            // Validation
            $errors = $validator->validate($entity);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }
                return $this->errorResponse('Validation failed', 400, $errorMessages);
            }

            $entityManager->flush();

            $responseData = $serializer->serialize($entity, 'json', ['groups' => $groups]);
            
            return new JsonResponse($responseData, 200, [], true);
            
        } catch (\Exception $e) {
            return $this->errorResponse('An error occurred: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Supprime une entité
     */
    protected function deleteEntity(
        $entity,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $entityManager->remove($entity);
            $entityManager->flush();

            return $this->successResponse(null, 'Entity deleted successfully', 204);
            
        } catch (\Exception $e) {
            return $this->errorResponse('An error occurred: ' . $e->getMessage(), 500);
        }
    }
}

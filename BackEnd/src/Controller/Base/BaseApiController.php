<?php

namespace App\Controller\Base;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;

abstract class BaseApiController extends AbstractController
{
    /**
     * Retourne une réponse JSON standardisée pour les succès
     */
    protected function successResponse($data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        return $this->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    /**
     * Retourne une réponse JSON standardisée pour les erreurs
     */
    protected function errorResponse(string $message = 'An error occurred', int $statusCode = 400, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return $this->json($response, $statusCode);
    }

    /**
     * Valide les données d'entrée et retourne les erreurs s'il y en a
     */
    protected function validateData($data, $constraints): array
    {
        $validator = $this->container->get('validator');
        $violations = $validator->validate($data, $constraints);

        $errors = [];
        foreach ($violations as $violation) {
            $errors[$violation->getPropertyPath()] = $violation->getMessage();
        }

        return $errors;
    }
}

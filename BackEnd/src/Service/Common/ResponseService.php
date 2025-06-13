<?php

namespace App\Service\Common;

use Symfony\Component\HttpFoundation\JsonResponse;

class ResponseService
{
    /**
     * Crée une réponse de succès standardisée
     */
    public function success($data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        return new JsonResponse([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    /**
     * Crée une réponse d'erreur standardisée
     */
    public function error(string $message = 'An error occurred', int $statusCode = 400, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return new JsonResponse($response, $statusCode);
    }

    /**
     * Crée une réponse de validation d'erreur
     */
    public function validationError(array $errors, string $message = 'Validation failed'): JsonResponse
    {
        return new JsonResponse([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], 422);
    }

    /**
     * Crée une réponse de ressource non trouvée
     */
    public function notFound(string $message = 'Resource not found'): JsonResponse
    {
        return new JsonResponse([
            'success' => false,
            'message' => $message
        ], 404);
    }

    /**
     * Crée une réponse d'accès non autorisé
     */
    public function unauthorized(string $message = 'Unauthorized access'): JsonResponse
    {
        return new JsonResponse([
            'success' => false,
            'message' => $message
        ], 401);
    }

    /**
     * Crée une réponse d'accès interdit
     */
    public function forbidden(string $message = 'Access forbidden'): JsonResponse
    {
        return new JsonResponse([
            'success' => false,
            'message' => $message
        ], 403);
    }

    /**
     * Crée une réponse de création réussie
     */
    public function created($data = null, string $message = 'Resource created successfully'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    /**
     * Crée une réponse de suppression réussie
     */
    public function deleted(string $message = 'Resource deleted successfully'): JsonResponse
    {
        return new JsonResponse([
            'success' => true,
            'message' => $message
        ], 204);
    }

    /**
     * Crée une réponse paginée
     */
    public function paginated(array $data, array $pagination, string $message = 'Data retrieved successfully'): JsonResponse
    {
        return new JsonResponse([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'pagination' => $pagination
        ], 200);
    }
}

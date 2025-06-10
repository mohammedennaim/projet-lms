<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {        $data = json_decode($request->getContent(), true);

        if (!isset($data['email']) || !isset($data['password']) || !isset($data['fullName'])) {
            return $this->json([
                'message' => 'Email, password and fullName are required'
            ], JsonResponse::HTTP_BAD_REQUEST);
        }        $user = new User();
        $user->setEmail($data['email']);
        $user->setFullName($data['fullName']);
        $user->setPlainPassword($data['password']);
        $user->setRoles('employée');
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json([
                'message' => 'Validation failed',
                'errors' => $errorMessages
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $entityManager->persist($user);
            $entityManager->flush();            return $this->json([
                'message' => 'User created successfully',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'fullName' => $user->getFullName(),
                    'roles' => $user->getRoles()
                ]
            ], JsonResponse::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'User registration failed',
                'error' => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

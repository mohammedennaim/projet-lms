<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/users', name: 'users_')]
#[IsGranted('ROLE_ADMIN')]
class UserController extends AbstractController
{    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private NormalizerInterface $normalizer,
        private ValidatorInterface $validator,
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    #[Route('/profile', name: 'profile', methods: ['GET'])]
    public function profile(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = $this->serializer->serialize($user, 'json', ['groups' => ['user:read']]);
        
        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('/profile', name: 'update_profile', methods: ['PUT'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return new JsonResponse(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        // Users can only update certain fields
        if (isset($data['fullName'])) {
            $user->setFullName($data['fullName']);
        }
        
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }

        // Validate the user
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = [
                    'property' => $error->getPropertyPath(),
                    'message' => $error->getMessage()
                ];
            }
            return new JsonResponse(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->flush();

        $responseData = $this->serializer->serialize($user, 'json', ['groups' => ['user:read']]);
        
        return new JsonResponse($responseData, Response::HTTP_OK, [], true);
    }

    #[Route('/change-password', name: 'change_password', methods: ['PUT'])]
    public function changePassword(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return new JsonResponse(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        // Validate required fields
        if (!isset($data['currentPassword']) || !isset($data['newPassword'])) {
            return new JsonResponse([
                'error' => 'Current password and new password are required'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Verify current password
        if (!$this->passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
            return new JsonResponse(['error' => 'Current password is incorrect'], Response::HTTP_BAD_REQUEST);
        }

        // Validate new password
        if (strlen($data['newPassword']) < 6) {
            return new JsonResponse([
                'error' => 'New password must be at least 6 characters long'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Hash and set new password
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['newPassword']);
        $user->setPassword($hashedPassword);

        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Password changed successfully'], Response::HTTP_OK);
    }

    #[Route('/stats', name: 'stats', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getUserStats(UserRepository $userRepository): JsonResponse
    {
        $stats = [
            'total_users' => $userRepository->count([]),
            'by_role' => $userRepository->countByRole(),
            'recent_users' => []
        ];        // Get recent users (last 10)
        $recentUsers = $userRepository->findBy([], ['id' => 'DESC'], 10);
        $stats['recent_users'] = $this->normalizer->normalize($recentUsers, null, ['groups' => ['user:read']]);

        return new JsonResponse($stats, Response::HTTP_OK);
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request, UserRepository $userRepository): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(50, max(1, $request->query->getInt('limit', 10)));
        $search = $request->query->get('search');
        $role = $request->query->get('role');

        $queryBuilder = $userRepository->createQueryBuilder('u');

        if ($search) {
            $queryBuilder->andWhere('u.fullName LIKE :search OR u.email LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        if ($role) {
            $queryBuilder->andWhere('u.roles = :role')
                ->setParameter('role', $role);
        }

        // Count total
        $totalQuery = clone $queryBuilder;
        $total = $totalQuery->select('COUNT(u.id)')
            ->getQuery()
            ->getSingleScalarResult();

        // Get paginated results
        $users = $queryBuilder
            ->orderBy('u.id', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        $usersData = [];
        foreach ($users as $user) {
            $usersData[] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'fullName' => $user->getFullName(),
                'roles' => $user->getRole()
            ];
        }

        return $this->json([
            'users' => $usersData,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'fullName' => $user->getFullName(),
            'roles' => $user->getRole()
        ]);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Données JSON invalides'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Update user fields
        if (isset($data['fullName'])) {
            $user->setFullName($data['fullName']);
        }
        
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }

        if (isset($data['roles'])) {
            $user->setRoles($data['roles']);
        }

        // Validate the user
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = [
                    'property' => $error->getPropertyPath(),
                    'message' => $error->getMessage()
                ];
            }
            return $this->json(['errors' => $errorMessages], JsonResponse::HTTP_BAD_REQUEST);
        }

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'fullName' => $user->getFullName(),
                'roles' => $user->getRole()
            ]
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($user);
        $this->entityManager->flush();

        return $this->json(['message' => 'Utilisateur supprimé avec succès']);
    }
}

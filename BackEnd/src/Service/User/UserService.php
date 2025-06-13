<?php

namespace App\Service\User;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;

class UserService
{
    private UserRepository $userRepository;
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ) {
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
    }

    /**
     * Crée un nouvel utilisateur
     */
    public function createUser(string $email, string $fullName, string $password, string $roles = 'employée'): User
    {
        $user = new User();
        $user->setEmail($email);
        $user->setFullName($fullName);
        $user->setRoles($roles);

        $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $user;
    }

    /**
     * Met à jour les informations d'un utilisateur
     */
    public function updateUser(User $user, array $data): User
    {
        if (isset($data['fullName'])) {
            $user->setFullName($data['fullName']);
        }

        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }

        if (isset($data['roles'])) {
            $user->setRoles($data['roles']);
        }

        $this->entityManager->flush();

        return $user;
    }

    /**
     * Change le mot de passe d'un utilisateur
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (!$this->passwordHasher->isPasswordValid($user, $currentPassword)) {
            return false;
        }

        $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);

        $this->entityManager->flush();

        return true;
    }

    /**
     * Supprime un utilisateur
     */
    public function deleteUser(User $user): void
    {
        $this->entityManager->remove($user);
        $this->entityManager->flush();
    }

    /**
     * Trouve un utilisateur par email
     */
    public function findUserByEmail(string $email): ?User
    {
        return $this->userRepository->findOneBy(['email' => $email]);
    }

    /**
     * Trouve un utilisateur par ID
     */
    public function findUserById(int $id): ?User
    {
        return $this->userRepository->find($id);
    }

    /**
     * Récupère tous les utilisateurs avec pagination
     */
    public function getAllUsers(int $page = 1, int $limit = 10): array
    {
        $offset = ($page - 1) * $limit;
        
        $users = $this->userRepository->findBy([], null, $limit, $offset);
        $total = $this->userRepository->count([]);

        return [
            'users' => $users,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit)
        ];
    }

    /**
     * Récupère les statistiques des utilisateurs
     */
    public function getUserStats(): array
    {
        $totalUsers = $this->userRepository->count([]);
        $adminCount = $this->userRepository->count(['roles' => 'admin']);
        $employeeCount = $this->userRepository->count(['roles' => 'employée']);

        return [
            'total_users' => $totalUsers,
            'admin_count' => $adminCount,
            'employee_count' => $employeeCount,
            'by_role' => [
                'admin' => $adminCount,
                'employée' => $employeeCount
            ]
        ];
    }

    /**
     * Recherche des utilisateurs par nom ou email
     */
    public function searchUsers(string $query, int $page = 1, int $limit = 10): array
    {
        $offset = ($page - 1) * $limit;
        
        $queryBuilder = $this->userRepository->createQueryBuilder('u')
            ->where('u.fullName LIKE :query OR u.email LIKE :query')
            ->setParameter('query', '%' . $query . '%')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        $users = $queryBuilder->getQuery()->getResult();
        
        $countQueryBuilder = $this->userRepository->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.fullName LIKE :query OR u.email LIKE :query')
            ->setParameter('query', '%' . $query . '%');

        $total = $countQueryBuilder->getQuery()->getSingleScalarResult();

        return [
            'users' => $users,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit),
            'query' => $query
        ];
    }

    /**
     * Vérifie si un email est déjà utilisé
     */
    public function isEmailTaken(string $email, ?User $excludeUser = null): bool
    {
        $user = $this->findUserByEmail($email);
        
        if (!$user) {
            return false;
        }

        return $excludeUser ? $user->getId() !== $excludeUser->getId() : true;
    }
}

<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class UserService
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher
    ) {}    public function createUser(string $email, string $fullName, string $role, string $plainPassword): User    {
        $user = new User();
        $user->setEmail($email);
        $user->setFullName($fullName);
        $user->setRoles($role);
        $user->setPlainPassword($plainPassword);

        // Le PasswordHasherListener se chargera du hachage automatiquement
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $user;
    }

    public function updateUser(User $user, array $data): User
    {
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }

        if (isset($data['fullName'])) {
            $user->setFullName($data['fullName']);
        }        if (isset($data['role'])) {
            $user->setRoles($data['role']);
        }if (isset($data['plainPassword']) && !empty($data['plainPassword'])) {
            $user->setPlainPassword($data['plainPassword']);
            // Le PasswordHasherListener se chargera du hachage automatiquement
        }

        $this->entityManager->flush();

        return $user;
    }

    public function deleteUser(User $user): void
    {
        $this->entityManager->remove($user);
        $this->entityManager->flush();
    }

    public function findByEmail(string $email): ?User
    {
        return $this->userRepository->findOneBy(['email' => $email]);
    }

    public function findById(int $id): ?User
    {
        return $this->userRepository->find($id);
    }

    /**
     * @return User[]
     */
    public function findAll(): array
    {
        return $this->userRepository->findAll();
    }    /**
     * @return User[]
     */
    public function findByRole(string $role): array
    {
        return $this->userRepository->findBy(['roles' => $role]);
    }

    public function isEmailUnique(string $email, ?int $excludeUserId = null): bool
    {
        $user = $this->findByEmail($email);
        
        if ($user === null) {
            return true;
        }

        return $excludeUserId !== null && $user->getId() === $excludeUserId;
    }
}

<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Entity\User;
use Doctrine\ORM\Event\PrePersistEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class PasswordHasherListener
{
    public function __construct(
        private readonly UserPasswordHasherInterface $passwordHasher
    ) {}

    public function prePersist(PrePersistEventArgs $args): void
    {
        $entity = $args->getObject();
        
        if ($entity instanceof User) {
            $this->hashPassword($entity);
        }
    }

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $entity = $args->getObject();
        
        if ($entity instanceof User) {
            $this->hashPassword($entity);
        }
    }

    private function hashPassword(User $user): void
    {
        $plainPassword = $user->getPlainPassword();
        
        if ($plainPassword === null || $plainPassword === '') {
            return;
        }

        $hashedPassword = $this->passwordHasher->hashPassword($user, $plainPassword);
        $user->setPassword($hashedPassword);
        $user->eraseCredentials();
    }
}

<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture
{
    public const USER_REFERENCE = 'user_';

    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function load(ObjectManager $manager): void
    {
        // Créer un admin
        $admin = new User();
        $admin->setEmail('admin@lms.com');
        $admin->setFullName('Administrateur Principal');
        $admin->setRoles('admin');
        $hashedPassword = $this->passwordHasher->hashPassword($admin, 'admin123');
        $admin->setPassword($hashedPassword);
        $manager->persist($admin);
        $this->addReference(self::USER_REFERENCE . '0', $admin);

        // Créer 5 employés avec des données fixes
        $employees = [
            ['email' => 'john.doe@lms.com', 'name' => 'John Doe'],
            ['email' => 'jane.smith@lms.com', 'name' => 'Jane Smith'],
            ['email' => 'mike.johnson@lms.com', 'name' => 'Mike Johnson'],
            ['email' => 'sarah.wilson@lms.com', 'name' => 'Sarah Wilson'],
            ['email' => 'david.brown@lms.com', 'name' => 'David Brown'],
        ];

        for ($i = 1; $i <= 5; $i++) {
            $user = new User();
            $user->setEmail($employees[$i-1]['email']);
            $user->setFullName($employees[$i-1]['name']);
            $user->setRoles('employée');
            
            $hashedPassword = $this->passwordHasher->hashPassword($user, 'password123');
            $user->setPassword($hashedPassword);
            
            $manager->persist($user);
            $this->addReference(self::USER_REFERENCE . $i, $user);
        }

        $manager->flush();
    }
}

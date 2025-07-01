<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-employee-without-courses',
    description: 'Créer un employé sans cours assignés pour tester l\'affichage'
)]
class CreateEmployeeWithoutCoursesCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Créer un nouvel employé
        $employee = new User();
        $employee->setEmail('emma.martin@lms.com');
        $employee->setFullName('Emma Martin');
        $employee->setRoles('ROLE_EMPLOYEE');
        $employee->setPassword($this->passwordHasher->hashPassword($employee, 'password123'));

        $this->entityManager->persist($employee);
        $this->entityManager->flush();

        $io->success('Employé Emma Martin créé avec succès (sans cours assignés) !');

        return Command::SUCCESS;
    }
}

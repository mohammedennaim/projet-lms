<?php

namespace App\Command;

use App\Repository\UserRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test-employees',
    description: 'Tester la récupération des employés'
)]
class TestEmployeesCommand extends Command
{
    public function __construct(
        private UserRepository $userRepository
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $employees = $this->userRepository->findByRole('ROLE_EMPLOYEE');
        
        $io->writeln(sprintf('Requête: findByRole("ROLE_EMPLOYEE")'));
        $io->writeln(sprintf('Résultats: %d employé(s)', count($employees)));
        $io->writeln('');
        
        $io->table(
            ['ID', 'Nom', 'Email', 'Rôle DB'],
            array_map(fn($user) => [
                $user->getId(),
                $user->getFullName(),
                $user->getEmail(),
                $user->getRole()
            ], $employees)
        );

        // Test avec Emma spécifiquement
        $emma = $this->userRepository->find(49);
        if ($emma) {
            $io->writeln('Emma Martin trouvée avec find(49):');
            $io->writeln(sprintf('- ID: %d', $emma->getId()));
            $io->writeln(sprintf('- Nom: %s', $emma->getFullName()));
            $io->writeln(sprintf('- Email: %s', $emma->getEmail()));
            $io->writeln(sprintf('- Rôle: %s', $emma->getRole()));
        } else {
            $io->error('Emma Martin non trouvée avec find(49)');
        }

        return Command::SUCCESS;
    }
}

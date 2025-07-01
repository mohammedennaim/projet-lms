<?php

namespace App\Command;

use App\Entity\Affectation;
use App\Entity\Evaluation;
use App\Repository\UserRepository;
use App\Repository\CourseRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:add-test-data-emma',
    description: 'Ajouter des données de test pour Emma Martin'
)]
class AddTestDataEmmaCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private CourseRepository $courseRepository
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Récupérer Emma Martin
        $emma = $this->userRepository->find(49);
        if (!$emma) {
            $io->error('Emma Martin non trouvée (ID: 49)');
            return Command::FAILURE;
        }

        // Récupérer un cours
        $course = $this->courseRepository->find(27);
        if (!$course) {
            $io->error('Cours non trouvé (ID: 27)');
            return Command::FAILURE;
        }

        // Créer une affectation pour Emma
        $affectation = new Affectation();
        $affectation->setUser($emma);
        $affectation->setCours($course);
        $affectation->setDateAssigned(new \DateTime('2025-06-01'));
        $affectation->setAssigneCours(false); // Pas encore complété

        $this->entityManager->persist($affectation);

        // Créer des évaluations pour cette affectation
        $notes = [16, 18, 15]; // Bonnes notes pour Emma
        foreach ($notes as $note) {
            $evaluation = new Evaluation();
            $evaluation->setNote($note);
            $evaluation->setEvalueAffectation(true);
            $evaluation->setAffectation($affectation);
            
            $this->entityManager->persist($evaluation);
        }

        $this->entityManager->flush();

        $io->success('Affectation et évaluations créées pour Emma Martin !');
        $io->writeln('- 1 cours assigné: ' . $course->getTitle());
        $io->writeln('- 3 évaluations: 16, 18, 15 (moyenne: 16.3/20)');
        $io->writeln('- Statut: Non complété (pour tester la progression)');

        return Command::SUCCESS;
    }
}

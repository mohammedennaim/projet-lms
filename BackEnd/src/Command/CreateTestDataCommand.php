<?php

namespace App\Command;

use App\Entity\Affectation;
use App\Entity\Evaluation;
use App\Repository\AffectationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:create-test-data',
    description: 'Créer des données de test pour les évaluations'
)]
class CreateTestDataCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private AffectationRepository $affectationRepository
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Récupérer toutes les affectations
        $affectations = $this->affectationRepository->findAll();

        if (empty($affectations)) {
            $io->error('Aucune affectation trouvée. Veuillez d\'abord créer des affectations.');
            return Command::FAILURE;
        }

        $io->progressStart(count($affectations));

        foreach ($affectations as $affectation) {
            // Créer entre 1 et 3 évaluations par affectation
            $nbEvaluations = rand(1, 3);
            
            for ($i = 0; $i < $nbEvaluations; $i++) {
                $evaluation = new Evaluation();
                $evaluation->setNote(rand(8, 20)); // Note entre 8 et 20
                $evaluation->setEvalueAffectation(true);
                $evaluation->setAffectation($affectation);
                
                $this->entityManager->persist($evaluation);
            }
            
            $io->progressAdvance();
        }

        $this->entityManager->flush();
        $io->progressFinish();

        $io->success('Données de test créées avec succès !');

        return Command::SUCCESS;
    }
}

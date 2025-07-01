<?php

namespace App\Command;

use App\Entity\Evaluation;
use App\Repository\AffectationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:add-evaluations-ayoub',
    description: 'Ajouter des évaluations pour Ayoub Labit'
)]
class AddEvaluationsAyoubCommand extends Command
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

        try {
            // Récupérer les affectations d'Ayoub Labit (user_id = 50)
            $affectations = $this->affectationRepository->findBy(['user' => 50]);
            
            if (empty($affectations)) {
                $io->error('Aucune affectation trouvée pour Ayoub Labit (ID: 50)');
                return Command::FAILURE;
            }

            $io->info('Affectations trouvées pour Ayoub Labit: ' . count($affectations));

            foreach ($affectations as $affectation) {
                $course = $affectation->getCours();
                $courseName = $course ? $course->getTitle() : 'Cours inconnu';
                
                $io->info("Traitement de l'affectation {$affectation->getId()} - Cours: {$courseName}");

                // Créer 2-3 évaluations pour chaque affectation
                $notes = [];
                if ($affectation->getId() == 78) { // Développement web avec PHP
                    $notes = [14, 17, 16]; // Moyenne: 15.7
                } else if ($affectation->getId() == 79) { // Introduction à la programmation
                    $notes = [18, 15, 19]; // Moyenne: 17.3
                }

                foreach ($notes as $note) {
                    $evaluation = new Evaluation();
                    $evaluation->setNote($note);
                    $evaluation->setEvalueAffectation(true);
                    $evaluation->setAffectation($affectation);

                    $this->entityManager->persist($evaluation);
                }

                $io->info("Ajouté " . count($notes) . " évaluations pour le cours: {$courseName}");
            }

            $this->entityManager->flush();

            $io->success('Évaluations créées avec succès pour Ayoub Labit !');
            $io->info('Ayoub devrait maintenant avoir des feedbacks visibles dans les statistiques.');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Erreur lors de la création des évaluations: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}

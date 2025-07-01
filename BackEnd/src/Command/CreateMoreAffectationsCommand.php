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
    name: 'app:create-more-affectations',
    description: 'Créer plus d\'affectations pour avoir des données complètes'
)]
class CreateMoreAffectationsCommand extends Command
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

        // Récupérer tous les employés
        $employees = $this->userRepository->findByRole('ROLE_EMPLOYEE');
        $courses = $this->courseRepository->findAll();

        if (empty($employees)) {
            $io->error('Aucun employé trouvé.');
            return Command::FAILURE;
        }

        if (empty($courses)) {
            $io->error('Aucun cours trouvé.');
            return Command::FAILURE;
        }

        $totalAffectations = 0;

        foreach ($employees as $employee) {
            // Assigner entre 2 et 4 cours à chaque employé
            $nbCourses = rand(2, 4);
            $selectedCourses = array_rand($courses, min($nbCourses, count($courses)));
            
            if (!is_array($selectedCourses)) {
                $selectedCourses = [$selectedCourses];
            }

            foreach ($selectedCourses as $courseIndex) {
                $course = $courses[$courseIndex];

                // Vérifier si cette affectation n'existe pas déjà
                $existingAffectation = $this->entityManager->getRepository(Affectation::class)
                    ->findOneBy(['user' => $employee, 'cours' => $course]);

                if (!$existingAffectation) {
                    $affectation = new Affectation();
                    $affectation->setUser($employee);
                    $affectation->setCours($course);
                    $affectation->setDateAssigned(new \DateTime('-' . rand(1, 90) . ' days'));
                    $affectation->setAssigneCours(rand(0, 100) < 30); // 30% de chance d'être complété

                    $this->entityManager->persist($affectation);

                    // Créer des évaluations pour chaque affectation
                    $nbEvaluations = rand(1, 3);
                    for ($i = 0; $i < $nbEvaluations; $i++) {
                        $evaluation = new Evaluation();
                        $evaluation->setNote(rand(8, 20));
                        $evaluation->setEvalueAffectation(true);
                        $evaluation->setAffectation($affectation);
                        
                        $this->entityManager->persist($evaluation);
                    }

                    $totalAffectations++;
                }
            }
        }

        $this->entityManager->flush();

        $io->success("$totalAffectations nouvelles affectations créées avec leurs évaluations !");

        return Command::SUCCESS;
    }
}

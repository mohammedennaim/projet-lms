<?php

namespace App\DataFixtures;

use App\Entity\Affectation;
use App\Entity\Course;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory as FakerFactory;

class AffectationFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $faker = FakerFactory::create('fr_FR');

        // Créer des affectations variées pour les employés
        $affectationsCreated = 0;
        
        // Créer des affectations pour chaque employé (5 employés)
        for ($i = 1; $i <= 5; $i++) {
            // Chaque employé peut avoir 1 à 3 affectations
            $numberOfAffectations = $faker->numberBetween(1, 3);
            $assignedCourses = [];
            
            for ($j = 0; $j < $numberOfAffectations; $j++) {
                // Éviter les doublons pour le même employé
                do {
                    $courseIndex = $faker->numberBetween(0, 4);
                } while (in_array($courseIndex, $assignedCourses));
                
                $assignedCourses[] = $courseIndex;
                
                $affectation = new Affectation();
                
                // Date d'affectation aléatoire dans les 30 derniers jours
                $affectation->setDateAssigned($faker->dateTimeBetween('-30 days', 'now'));
                
                // Statut d'affectation aléatoire (70% de chance d'être assigné)
                $affectation->setAssigneCours($faker->boolean(70));
                
                // Affecter un employé (éviter l'admin qui est à l'index 0)
                $employee = $this->getReference(UserFixtures::USER_REFERENCE . $i, User::class);
                $affectation->setUser($employee);
                
                // Affecter un cours
                $course = $this->getReference(CourseFixtures::COURSE_REFERENCE . $courseIndex, Course::class);
                $affectation->setCours($course);
                
                $manager->persist($affectation);
                $affectationsCreated++;
            }
        }

        $manager->flush();
        echo "Créé {$affectationsCreated} affectations\n";
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            CourseFixtures::class,
        ];
    }
}

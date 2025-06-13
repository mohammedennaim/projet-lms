<?php

namespace App\DataFixtures;

use App\Entity\Course;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory as FakerFactory;

class CourseFixtures extends Fixture implements DependentFixtureInterface
{
    public const COURSE_REFERENCE = 'course_';    public function load(ObjectManager $manager): void
    {
        $courseData = [
            [
                'title' => 'Introduction à la programmation',
                'description' => 'Ce cours couvre les bases de la programmation avec des concepts fondamentaux comme les variables, les boucles et les fonctions.'
            ],
            [
                'title' => 'Développement web avec PHP',
                'description' => 'Apprenez à créer des applications web dynamiques avec PHP, MySQL et les bonnes pratiques de développement.'
            ],
            [
                'title' => 'Bases de données relationnelles',
                'description' => 'Maîtrisez les concepts des bases de données, SQL, la modélisation et l\'optimisation des requêtes.'
            ],
            [
                'title' => 'Gestion de projet agile',
                'description' => 'Découvrez les méthodologies agiles, Scrum, Kanban et les outils de gestion de projet modernes.'
            ],
            [
                'title' => 'Sécurité informatique',
                'description' => 'Apprenez les principes de sécurité, le chiffrement, l\'authentification et la protection des données.'
            ]
        ];

        for ($i = 0; $i < 5; $i++) {
            $course = new Course();
            $course->setTitle($courseData[$i]['title']);
            $course->setDescription($courseData[$i]['description']);
            
            // Assigner des employés au cours (2-4 employés par cours)
            $numberOfEmployees = ($i % 3) + 2; // 2, 3, ou 4 employés
            for ($j = 1; $j <= $numberOfEmployees; $j++) {
                $employee = $this->getReference(UserFixtures::USER_REFERENCE . $j, User::class);
                $course->addEmployee($employee);
            }
            
            $manager->persist($course);
            $this->addReference(self::COURSE_REFERENCE . $i, $course);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
        ];
    }
}

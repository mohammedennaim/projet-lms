<?php

namespace App\DataFixtures;

use App\Entity\Course;
use App\Entity\Ressource;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class RessourceFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $ressourcesData = [
            // Ressources pour "Introduction à la programmation" (Course 0)
            [
                'courseIndex' => 0,
                'ressources' => [
                    'https://www.youtube.com/watch?v=ZJ6rTUPoPKc', // Introduction aux variables
                    'https://www.youtube.com/watch?v=UDZJGYIwjE8', // Structures de contrôle
                    'https://www.youtube.com/watch?v=xnCJ-4dRdQs', // Introduction aux fonctions
                    'https://www.youtube.com/watch?v=pTB0EiLXZ2c', // Programmation orientée objet
                    'https://www.youtube.com/watch?v=rfscVS0vtbw'  // Exercices pratiques
                ]
            ],
            // Ressources pour "Développement web avec PHP" (Course 1)
            [
                'courseIndex' => 1,
                'ressources' => [
                    'https://www.youtube.com/watch?v=OK_JCtrrv-c', // Installation PHP
                    'https://www.youtube.com/watch?v=XKWqdp17BFo', // Syntaxe PHP
                    'https://www.youtube.com/watch?v=9YfhRVJGFOA', // PHP et MySQL
                    'https://www.youtube.com/watch?v=1SnPKhCdlsU', // Formulaires PHP
                    'https://www.youtube.com/watch?v=zKEP3KH6s_8'  // Sécurité PHP
                ]
            ],
            // Ressources pour "Bases de données relationnelles" (Course 2)
            [
                'courseIndex' => 2,
                'ressources' => [
                    'https://www.youtube.com/watch?v=ER8oKX5myE0', // Modélisation BDD
                    'https://www.youtube.com/watch?v=HXV3zeQKqGY', // Langage SQL
                    'https://www.youtube.com/watch?v=9yeOJ0ZMUYw', // Jointures SQL
                    'https://www.youtube.com/watch?v=fsXVi9_7xbE', // Optimisation BDD
                    'https://www.youtube.com/watch?v=vzzPSXIXHSU'  // Administration BDD
                ]
            ],
            // Ressources pour "Gestion de projet agile" (Course 3)
            [
                'courseIndex' => 3,
                'ressources' => [
                    'https://www.youtube.com/watch?v=1-CXGEOTr_o', // Principes Agile
                    'https://www.youtube.com/watch?v=gy1c4_YixCo', // Framework Scrum
                    'https://www.youtube.com/watch?v=GE6lbPLEAzc', // Planification agile
                    'https://www.youtube.com/watch?v=uM_m7AHle-M', // Outils de gestion
                    'https://www.youtube.com/watch?v=jttO6OKgHx4'  // Métriques agiles
                ]
            ],
            // Ressources pour "Sécurité informatique" (Course 4)
            [
                'courseIndex' => 4,
                'ressources' => [
                    'https://www.youtube.com/watch?v=inWWhr5tnEA', // Cybersécurité
                    'https://www.youtube.com/watch?v=AQDCe585Lnc', // Chiffrement
                    'https://www.youtube.com/watch?v=zbxjNx6dGOc', // Authentification
                    'https://www.youtube.com/watch?v=lWwE6y4YKdI', // Sécurité web
                    'https://www.youtube.com/watch?v=6KQFn7GVJgw'  // Audit sécurité
                ]
            ]
        ];

        foreach ($ressourcesData as $courseData) {
            $course = $this->getReference(CourseFixtures::COURSE_REFERENCE . $courseData['courseIndex'], Course::class);
            
            foreach ($courseData['ressources'] as $ressourceContent) {
                $ressource = new Ressource();
                $ressource->setContenu($ressourceContent);
                $ressource->setCourse($course);
                
                $manager->persist($ressource);
            }
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            CourseFixtures::class,
        ];
    }
}

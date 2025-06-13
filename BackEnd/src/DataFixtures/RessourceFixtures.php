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
                    'Introduction aux variables et types de données en programmation',
                    'Les structures de contrôle : conditions et boucles',
                    'Introduction aux fonctions et procédures',
                    'Concepts de base de la programmation orientée objet',
                    'Exercices pratiques et exemples de code'
                ]
            ],
            // Ressources pour "Développement web avec PHP" (Course 1)
            [
                'courseIndex' => 1,
                'ressources' => [
                    'Installation et configuration de PHP et serveur web',
                    'Syntaxe PHP : variables, tableaux, fonctions',
                    'Interaction avec les bases de données MySQL',
                    'Gestion des formulaires et sessions en PHP',
                    'Bonnes pratiques et sécurité en PHP'
                ]
            ],
            // Ressources pour "Bases de données relationnelles" (Course 2)
            [
                'courseIndex' => 2,
                'ressources' => [
                    'Modélisation conceptuelle avec le modèle entité-association',
                    'Langage SQL : requêtes SELECT, INSERT, UPDATE, DELETE',
                    'Les jointures et sous-requêtes en SQL',
                    'Optimisation des performances et indexation',
                    'Administration et sauvegarde de bases de données'
                ]
            ],
            // Ressources pour "Gestion de projet agile" (Course 3)
            [
                'courseIndex' => 3,
                'ressources' => [
                    'Les principes et valeurs de la méthode Agile',
                    'Framework Scrum : rôles, événements et artefacts',
                    'Planification et estimation en mode agile',
                    'Outils de gestion de projet : Jira, Trello, Azure DevOps',
                    'Métriques et amélioration continue'
                ]
            ],
            // Ressources pour "Sécurité informatique" (Course 4)
            [
                'courseIndex' => 4,
                'ressources' => [
                    'Principes fondamentaux de la cybersécurité',
                    'Chiffrement symétrique et asymétrique',
                    'Authentification et contrôle d\'accès',
                    'Sécurité des applications web : OWASP Top 10',
                    'Audit de sécurité et tests de pénétration'
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

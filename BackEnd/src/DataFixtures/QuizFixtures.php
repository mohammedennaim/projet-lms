<?php

namespace App\DataFixtures;

use App\Entity\Course;
use App\Entity\Quiz;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory as FakerFactory;

class QuizFixtures extends Fixture implements DependentFixtureInterface
{
    public const QUIZ_REFERENCE = 'quiz_';    public function load(ObjectManager $manager): void
    {
        $quizData = [
            [
                'title' => 'Évaluation - Introduction à la programmation',
                'description' => 'Testez vos connaissances sur les concepts de base de la programmation.'
            ],
            [
                'title' => 'Test - Développement web PHP',
                'description' => 'Évaluez votre compréhension du développement web avec PHP.'
            ],
            [
                'title' => 'Quiz - Bases de données SQL',
                'description' => 'Vérifiez vos compétences en gestion de bases de données relationnelles.'
            ],
            [
                'title' => 'Contrôle - Gestion de projet',
                'description' => 'Testez vos connaissances sur les méthodologies agiles et la gestion de projet.'
            ],
            [
                'title' => 'Examen - Sécurité informatique',
                'description' => 'Évaluez votre compréhension des principes de sécurité informatique.'
            ]
        ];

        for ($i = 0; $i < 5; $i++) {
            $quiz = new Quiz();
            $quiz->setTitle($quizData[$i]['title']);
            $quiz->setDescription($quizData[$i]['description']);
            
            // Associer le quiz au cours correspondant
            $course = $this->getReference(CourseFixtures::COURSE_REFERENCE . $i, Course::class);
            $quiz->setCourse($course);
            
            $manager->persist($quiz);
            $this->addReference(self::QUIZ_REFERENCE . $i, $quiz);
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

<?php

namespace App\DataFixtures;

use App\Entity\Question;
use App\Entity\Quiz;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory as FakerFactory;

class QuestionFixtures extends Fixture implements DependentFixtureInterface
{
    public const QUESTION_REFERENCE = 'question_';    public function load(ObjectManager $manager): void
    {
        $questionTemplates = [
            // Questions pour programmation
            [
                'Qu\'est-ce qu\'une variable en programmation ?',
                'Quelle est la différence entre une boucle for et une boucle while ?',
                'Comment définir une fonction en PHP ?',
                'Qu\'est-ce que l\'encapsulation en programmation orientée objet ?',
                'Quelle est l\'utilité des commentaires dans le code ?'
            ],
            // Questions pour développement web
            [
                'Quelle est la différence entre GET et POST en HTTP ?',
                'Qu\'est-ce que le DOM en développement web ?',
                'Comment sécuriser une application web contre les injections SQL ?',
                'Qu\'est-ce qu\'un framework web ?',
                'Quelle est l\'importance du responsive design ?'
            ],
            // Questions pour bases de données
            [
                'Qu\'est-ce qu\'une clé primaire dans une base de données ?',
                'Quelle est la différence entre INNER JOIN et LEFT JOIN ?',
                'Comment optimiser les performances d\'une requête SQL ?',
                'Qu\'est-ce que la normalisation de base de données ?',
                'Quelle est l\'utilité des index en base de données ?'
            ],
            // Questions pour gestion de projet
            [
                'Quels sont les principes de la méthode Agile ?',
                'Qu\'est-ce qu\'un sprint en Scrum ?',
                'Comment gérer les risques dans un projet ?',
                'Quelle est l\'importance de la communication dans un projet ?',
                'Comment mesurer le succès d\'un projet ?'
            ],
            // Questions pour sécurité
            [
                'Qu\'est-ce que le chiffrement symétrique ?',
                'Comment se protéger contre les attaques par force brute ?',
                'Qu\'est-ce qu\'un certificat SSL/TLS ?',
                'Quelle est l\'importance des mises à jour de sécurité ?',
                'Comment implémenter une authentification à deux facteurs ?'
            ]
        ];

        $questionCounter = 0;
        
        for ($quizIndex = 0; $quizIndex < 5; $quizIndex++) {
            $quiz = $this->getReference(QuizFixtures::QUIZ_REFERENCE . $quizIndex, Quiz::class);
            
            // Créer 5 questions par quiz
            for ($j = 0; $j < 5; $j++) {
                $question = new Question();
                $question->setContent($questionTemplates[$quizIndex][$j]);
                $question->setQuiz($quiz);
                
                $manager->persist($question);
                $this->addReference(self::QUESTION_REFERENCE . $questionCounter, $question);
                $questionCounter++;
            }
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            QuizFixtures::class,
        ];
    }
}

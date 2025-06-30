<?php

namespace App\DataFixtures;

use App\Entity\Quiz;
use App\Entity\User;
use App\Entity\UserQuizResponse;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory as FakerFactory;

class UserQuizResponseFixtures extends Fixture implements DependentFixtureInterface
{
    public const USER_QUIZ_RESPONSE_REFERENCE = 'user_quiz_response_';

    public function load(ObjectManager $manager): void
    {
        $faker = FakerFactory::create('fr_FR');

        $responseCounter = 0;
        
        // Créer des réponses pour chaque employé sur différents quiz
        for ($userIndex = 1; $userIndex <= 5; $userIndex++) {
            $user = $this->getReference(UserFixtures::USER_REFERENCE . $userIndex, User::class);
            
            // Chaque utilisateur répond à 2-3 quiz aléatoirement
            $numberOfQuizzes = $faker->numberBetween(2, 3);
            $quizIndices = $faker->randomElements(range(0, 4), $numberOfQuizzes);
            
            foreach ($quizIndices as $quizIndex) {
                $quiz = $this->getReference(QuizFixtures::QUIZ_REFERENCE . $quizIndex, Quiz::class);
                
                $userQuizResponse = new UserQuizResponse();
                $userQuizResponse->setUser($user);
                $userQuizResponse->setQuiz($quiz);
                
                // Calculer le nombre de questions dans le quiz
                $totalQuestions = count($quiz->getQuestions());
                $userQuizResponse->setTotalQuestions($totalQuestions);
                
                // Nombre de bonnes réponses aléatoire
                $correctAnswers = $faker->numberBetween(0, $totalQuestions);
                $userQuizResponse->setCorrectAnswers($correctAnswers);
                
                // Score calculé en pourcentage
                $score = $totalQuestions > 0 ? ($correctAnswers / $totalQuestions) * 100 : 0;
                $userQuizResponse->setScore($score);
                
                // Temps passé aléatoire (entre 2 et 15 minutes)
                $timeSpent = $faker->numberBetween(120, 900);
                $userQuizResponse->setTimeSpentSeconds($timeSpent);
                
                // Générer un feedback
                if ($score >= 90) {
                    $feedback = "Excellent travail ! Vous maîtrisez parfaitement ce sujet.";
                } elseif ($score >= 80) {
                    $feedback = "Très bien ! Vous avez une bonne compréhension du sujet.";
                } elseif ($score >= 70) {
                    $feedback = "Bien joué ! Quelques révisions pourraient vous aider.";
                } elseif ($score >= 60) {
                    $feedback = "Résultat satisfaisant. Il serait bénéfique de revoir certains points.";
                } else {
                    $feedback = "Il serait recommandé de réviser le cours attentivement.";
                }
                $userQuizResponse->setFeedback($feedback);
                
                // Date de soumission dans les 15 derniers jours
                $submittedAt = $faker->dateTimeBetween('-15 days', 'now');
                $userQuizResponse->setSubmittedAt(\DateTimeImmutable::createFromMutable($submittedAt));
                
                $manager->persist($userQuizResponse);
                $this->addReference(self::USER_QUIZ_RESPONSE_REFERENCE . $responseCounter, $userQuizResponse);
                $responseCounter++;
            }
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            QuizFixtures::class,
        ];
    }
}

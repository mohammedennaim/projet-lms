<?php

namespace App\DataFixtures;

use App\Entity\Quiz;
use App\Entity\User;
use App\Entity\UserQuizResponse;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class UserQuizResponseFixtures extends Fixture implements DependentFixtureInterface
{
    public const USER_QUIZ_RESPONSE_REFERENCE = 'user_quiz_response_';

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');

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
                
                // Score aléatoire entre 0 et 20
                $score = $faker->randomFloat(2, 0, 20);
                $userQuizResponse->setScore($score);
                
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

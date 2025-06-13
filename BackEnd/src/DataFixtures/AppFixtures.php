<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture implements DependentFixtureInterface, FixtureGroupInterface
{
    public function load(ObjectManager $manager): void
    {
        // Cette fixture ne fait rien directement, elle sert juste à orchestrer les autres
        // Toutes les fixtures seront chargées via les dépendances
    }    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            CourseFixtures::class,
            QuizFixtures::class,
            QuestionFixtures::class,
            ReponseFixtures::class,
            RessourceFixtures::class,
            // AffectationFixtures::class,
            // UserQuizResponseFixtures::class,
        ];
    }

    public static function getGroups(): array
    {
        return ['test', 'dev'];
    }
}

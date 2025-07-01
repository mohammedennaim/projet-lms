<?php

require_once 'vendor/autoload.php';

use App\Entity\User;
use App\Entity\Affectation;
use App\Entity\Evaluation;
use App\Entity\UserQuizResponse;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Dotenv\Dotenv;

echo "🔄 BACKFILL - Création d'évaluations pour les quiz existants\n";
echo "==========================================================\n";

// Load environment variables
$dotenv = new Dotenv();
$dotenv->load(__DIR__.'/.env');

// Bootstrap Symfony
$_SERVER['APP_ENV'] = 'dev';
$kernel = new \App\Kernel($_SERVER['APP_ENV'], true);
$kernel->boot();
$container = $kernel->getContainer();

/** @var EntityManagerInterface $entityManager */
$entityManager = $container->get('doctrine.orm.entity_manager');

try {
    // 1. Find all UserQuizResponse records that don't have corresponding evaluations
    $userQuizResponseRepo = $entityManager->getRepository(UserQuizResponse::class);
    $affectationRepo = $entityManager->getRepository(Affectation::class);
    $evaluationRepo = $entityManager->getRepository(Evaluation::class);
    
    echo "1️⃣ Recherche des réponses de quiz sans évaluations...\n";
    
    $allQuizResponses = $userQuizResponseRepo->findAll();
    echo "📊 Total des réponses de quiz: " . count($allQuizResponses) . "\n";
    
    $createdEvaluations = 0;
    
    foreach ($allQuizResponses as $quizResponse) {
        $user = $quizResponse->getUser();
        $quiz = $quizResponse->getQuiz();
        
        if (!$user || !$quiz) {
            continue;
        }
        
        echo "\n👤 Utilisateur: " . $user->getEmail() . "\n";
        echo "📝 Quiz: " . $quiz->getTitle() . "\n";
        echo "📊 Score: " . $quizResponse->getScore() . "%\n";
        
        // Find the corresponding affectation
        $affectation = $affectationRepo->findOneBy([
            'user' => $user,
            'cours' => $quiz->getCourse()
        ]);
        
        if (!$affectation) {
            echo "❌ Aucune affectation trouvée pour ce cours\n";
            continue;
        }
        
        // Check if evaluation already exists
        $existingEvaluation = $evaluationRepo->findOneBy([
            'affectation' => $affectation
        ]);
        
        if ($existingEvaluation) {
            echo "✅ Évaluation existe déjà (note: " . $existingEvaluation->getNote() . ")\n";
            continue;
        }
        
        // Create new evaluation
        $evaluation = new Evaluation();
        $evaluation->setAffectation($affectation);
        
        // Convert percentage to note out of 20
        $noteOutOf20 = ($quizResponse->getScore() / 100) * 20;
        $evaluation->setNote($noteOutOf20);
        
        // Set evaluation as completed
        $evaluation->setEvalueAffectation(true);
        
        $entityManager->persist($evaluation);
        
        echo "🆕 Nouvelle évaluation créée (note: " . $noteOutOf20 . "/20)\n";
        $createdEvaluations++;
    }
    
    if ($createdEvaluations > 0) {
        $entityManager->flush();
        echo "\n✅ " . $createdEvaluations . " évaluations créées avec succès!\n";
    } else {
        echo "\n📋 Aucune nouvelle évaluation à créer.\n";
    }
    
    echo "\n2️⃣ Vérification finale pour Hassan...\n";
    
    $userRepo = $entityManager->getRepository(User::class);
    $hassan = $userRepo->findOneBy(['email' => 'hassan@gmail.com']);
    
    if ($hassan) {
        echo "✅ Hassan trouvé - ID: " . $hassan->getId() . "\n";
        
        $hassanAffectations = $affectationRepo->findBy(['user' => $hassan]);
        echo "📚 Affectations Hassan: " . count($hassanAffectations) . "\n";
        
        foreach ($hassanAffectations as $affectation) {
            $course = $affectation->getCourse();
            $evaluations = $affectation->getEvaluations();
            
            echo "📖 Cours: " . $course->getTitle() . "\n";
            echo "⭐ Évaluations: " . count($evaluations) . "\n";
            
            if (count($evaluations) > 0) {
                foreach ($evaluations as $eval) {
                    echo "   📊 Note: " . $eval->getNote() . "/20\n";
                    echo "   ✅ Évaluation complète: " . ($eval->isEvalueAffectation() ? 'Oui' : 'Non') . "\n";
                }
            }
        }
    } else {
        echo "❌ Hassan non trouvé!\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "📍 Fichier: " . $e->getFile() . "\n";
    echo "📍 Ligne: " . $e->getLine() . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "Test terminé\n";

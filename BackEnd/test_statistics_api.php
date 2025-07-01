<?php

require_once 'vendor/autoload.php';

use App\Entity\User;
use App\Entity\Affectation;
use App\Entity\UserQuizResponse;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Dotenv\Dotenv;

echo "🔍 TEST - API Statistiques\n";
echo "=" . str_repeat("=", 50) . "\n\n";

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
    $userRepo = $entityManager->getRepository(User::class);
    $affectationRepo = $entityManager->getRepository(Affectation::class);
    $userQuizResponseRepo = $entityManager->getRepository(UserQuizResponse::class);
    
    echo "1️⃣ TEST - Employés\n";
    echo "=" . str_repeat("-", 30) . "\n";
    
    // Récupérer tous les employés
    $employees = $userRepo->createQueryBuilder('u')
        ->where('u.roles LIKE :role')
        ->setParameter('role', '%ROLE_EMPLOYEE%')
        ->getQuery()
        ->getResult();
    
    echo "📊 Total employés trouvés: " . count($employees) . "\n\n";
    
    if (count($employees) > 0) {
        $employee = $employees[0];
        echo "🔍 Test avec l'employé: " . $employee->getFullName() . "\n";
        
        // Affectations
        $affectations = $affectationRepo->findBy(['user' => $employee]);
        echo "📚 Affectations: " . count($affectations) . "\n";
        
        // Réponses aux quiz
        $quizResponses = $userQuizResponseRepo->findBy(['user' => $employee]);
        echo "🎯 Réponses quiz: " . count($quizResponses) . "\n";
        
        if (count($quizResponses) > 0) {
            $response = $quizResponses[0];
            echo "   - Score: " . $response->getScore() . "%\n";
            echo "   - Feedback: " . ($response->getFeedback() ?: 'Aucun') . "\n";
            echo "   - Performance: " . $response->getPerformanceLevel() . "\n";
        }
    }
    
    echo "\n2️⃣ TEST - Structure des données\n";
    echo "=" . str_repeat("-", 30) . "\n";
    
    foreach ($employees as $employee) {
        $affectations = $affectationRepo->findBy(['user' => $employee]);
        
        echo "👤 " . $employee->getFullName() . "\n";
        echo "   📧 " . $employee->getEmail() . "\n";
        echo "   📚 Cours assignés: " . count($affectations) . "\n";
        
        $totalQuizzes = 0;
        foreach ($affectations as $affectation) {
            $course = $affectation->getCours();
            if ($course) {
                $quizzes = $course->getQuizzes();
                $totalQuizzes += count($quizzes);
                echo "      - " . $course->getTitle() . " (" . count($quizzes) . " quiz)\n";
            }
        }
        
        $userQuizResponses = $userQuizResponseRepo->findBy(['user' => $employee]);
        echo "   🎯 Réponses totales: " . count($userQuizResponses) . "\n";
        
        if (count($userQuizResponses) > 0) {
            $totalScore = 0;
            foreach ($userQuizResponses as $response) {
                $totalScore += $response->getScore();
            }
            $averageScore = $totalScore / count($userQuizResponses);
            echo "   📊 Score moyen: " . round($averageScore, 2) . "%\n";
        }
        
        echo "\n";
    }
    
    echo "✅ Test terminé avec succès!\n";
    
} catch (\Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

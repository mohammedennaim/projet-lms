<?php

require_once 'vendor/autoload.php';

use App\Entity\User;
use App\Entity\Affectation;
use App\Entity\Evaluation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Dotenv\Dotenv;

echo "🔍 ANALYSE COMPLÈTE - Base de données employés\n";
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
    $evaluationRepo = $entityManager->getRepository(Evaluation::class);
    
    echo "1️⃣ ANALYSE DES EMPLOYÉS\n";
    echo "=" . str_repeat("-", 30) . "\n";
    
    // Récupérer tous les employés
    $allUsers = $userRepo->createQueryBuilder('u')
        ->where('u.roles LIKE :role')
        ->setParameter('role', '%ROLE_EMPLOYEE%')
        ->getQuery()
        ->getResult();
    
    echo "📊 Total employés trouvés: " . count($allUsers) . "\n\n";
    
    $employeesAnalysis = [];
    
    foreach ($allUsers as $user) {
        $affectations = $affectationRepo->findBy(['user' => $user]);
        $totalEvaluations = 0;
        $coursesWithEvaluations = 0;
        $totalScore = 0;
        
        $coursesDetails = [];
        foreach ($affectations as $affectation) {
            $evaluations = $affectation->getEvaluations();
            $evaluationsCount = count($evaluations);
            $totalEvaluations += $evaluationsCount;
            
            if ($evaluationsCount > 0) {
                $coursesWithEvaluations++;
                foreach ($evaluations as $eval) {
                    $totalScore += $eval->getNote();
                }
            }
            
            $coursesDetails[] = [
                'course' => $affectation->getCours()->getTitle(),
                'evaluations' => $evaluationsCount,
                'scores' => array_map(function($eval) { return $eval->getNote(); }, $evaluations->toArray())
            ];
        }
        
        $avgScore = $totalEvaluations > 0 ? round($totalScore / $totalEvaluations, 1) : 0;
        
        $employeesAnalysis[] = [
            'id' => $user->getId(),
            'fullName' => $user->getFullName(),
            'email' => $user->getEmail(),
            'totalCourses' => count($affectations),
            'coursesWithEvaluations' => $coursesWithEvaluations,
            'totalEvaluations' => $totalEvaluations,
            'averageScore' => $avgScore,
            'coursesDetails' => $coursesDetails,
            'shouldBeDisplayed' => count($affectations) > 0 || $totalEvaluations > 0 // Critère d'affichage
        ];
        
        echo "👤 " . $user->getEmail() . "\n";
        echo "   Nom: " . ($user->getFullName() ?: 'Non défini') . "\n";
        echo "   Cours assignés: " . count($affectations) . "\n";
        echo "   Cours avec évaluations: " . $coursesWithEvaluations . "\n";
        echo "   Total évaluations: " . $totalEvaluations . "\n";
        echo "   Score moyen: " . $avgScore . "/20\n";
        echo "   Devrait être affiché: " . (count($affectations) > 0 || $totalEvaluations > 0 ? 'OUI' : 'NON') . "\n";
        
        if (count($affectations) > 0) {
            echo "   📚 Détails des cours:\n";
            foreach ($coursesDetails as $course) {
                echo "      - " . $course['course'] . " (" . $course['evaluations'] . " éval.)\n";
                if (!empty($course['scores'])) {
                    echo "        Notes: " . implode(', ', $course['scores']) . "\n";
                }
            }
        }
        echo "\n";
    }
    
    echo "2️⃣ RÉSUMÉ GLOBAL\n";
    echo "=" . str_repeat("-", 30) . "\n";
    
    $employeesWithCourses = array_filter($employeesAnalysis, function($emp) {
        return $emp['totalCourses'] > 0;
    });
    
    $employeesWithEvaluations = array_filter($employeesAnalysis, function($emp) {
        return $emp['totalEvaluations'] > 0;
    });
    
    $employeesShouldBeDisplayed = array_filter($employeesAnalysis, function($emp) {
        return $emp['shouldBeDisplayed'];
    });
    
    echo "📊 Employés total: " . count($employeesAnalysis) . "\n";
    echo "📚 Employés avec cours: " . count($employeesWithCourses) . "\n";
    echo "⭐ Employés avec évaluations: " . count($employeesWithEvaluations) . "\n";
    echo "👁️  Employés qui devraient être affichés: " . count($employeesShouldBeDisplayed) . "\n\n";
    
    echo "3️⃣ RECOMMANDATIONS POUR LE FRONTEND\n";
    echo "=" . str_repeat("-", 30) . "\n";
    
    if (count($employeesShouldBeDisplayed) != count($employeesWithCourses)) {
        echo "⚠️  PROBLÈME DÉTECTÉ:\n";
        echo "   - Frontend montre probablement seulement les employés avec cours\n";
        echo "   - Mais certains employés ont des évaluations sans affectations visibles\n";
        echo "   - Solution: Afficher TOUS les employés avec cours OU évaluations\n\n";
    }
    
    echo "✅ CRITÈRE D'AFFICHAGE RECOMMANDÉ:\n";
    echo "   - Afficher si: (totalCourses > 0) OU (totalEvaluations > 0)\n";
    echo "   - Cela inclurait " . count($employeesShouldBeDisplayed) . " employés\n\n";
    
    echo "4️⃣ EMPLOYÉS QUI DEVRAIENT ÊTRE AFFICHÉS\n";
    echo "=" . str_repeat("-", 30) . "\n";
    
    foreach ($employeesShouldBeDisplayed as $emp) {
        echo "✓ " . $emp['email'] . " (" . $emp['fullName'] . ")\n";
        echo "  Cours: " . $emp['totalCourses'] . " | Évals: " . $emp['totalEvaluations'] . " | Moyenne: " . $emp['averageScore'] . "/20\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "Analyse terminée\n";

<?php

require_once 'vendor/autoload.php';

use App\Entity\User;
use App\Entity\Course;
use App\Entity\Affectation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Kernel;

echo "🔍 CRÉATION D'AFFECTATIONS VIA DOCTRINE\n";
echo "=" . str_repeat("=", 45) . "\n\n";

// Bootstrap Symfony
$_SERVER['APP_ENV'] = 'dev';
$kernel = new \App\Kernel($_SERVER['APP_ENV'], true);
$kernel->boot();
$container = $kernel->getContainer();

/** @var EntityManagerInterface $entityManager */
$entityManager = $container->get('doctrine.orm.entity_manager');

try {
    // Récupérer l'employé créé
    $employeeEmail = 'employee.dashboard@example.com';
    $employee = $entityManager->getRepository(User::class)->findOneBy(['email' => $employeeEmail]);
    
    if (!$employee) {
        echo "❌ Employé non trouvé avec l'email: {$employeeEmail}\n";
        exit;
    }
    
    echo "✅ Employé trouvé: {$employee->getFullName()} (ID: {$employee->getId()})\n";
    
    // Récupérer les premiers cours
    $courses = $entityManager->getRepository(Course::class)->findAll();
    
    if (empty($courses)) {
        echo "❌ Aucun cours trouvé\n";
        exit;
    }
    
    echo "✅ " . count($courses) . " cours trouvés\n";
    
    // Vérifier les affectations existantes
    $existingAffectations = $entityManager->getRepository(Affectation::class)->findBy(['user' => $employee]);
    echo "ℹ️ Affectations existantes: " . count($existingAffectations) . "\n";
    
    // Supprimer les anciennes affectations pour ce test
    foreach ($existingAffectations as $affectation) {
        $entityManager->remove($affectation);
    }
    
    // Créer de nouvelles affectations pour les 2 premiers cours
    $assignedCount = 0;
    for ($i = 0; $i < min(2, count($courses)); $i++) {
        $course = $courses[$i];
        
        $affectation = new Affectation();
        $affectation->setUser($employee);
        $affectation->setCourse($course);
        $affectation->setDateAssigned(new \DateTime());
        $affectation->setAssigneCours(true);
        
        $entityManager->persist($affectation);
        $assignedCount++;
        
        echo "✅ Affectation créée: {$course->getTitle()}\n";
    }
    
    // Sauvegarder
    $entityManager->flush();
    
    echo "\n🎯 SUCCÈS!\n";
    echo "✅ {$assignedCount} affectations créées pour l'employé\n";
    
    // Vérification finale
    $finalAffectations = $entityManager->getRepository(Affectation::class)->findBy(['user' => $employee]);
    echo "✅ Vérification: " . count($finalAffectations) . " affectations en base\n\n";
    
    echo "📋 DONNÉES POUR LE TEST FRONTEND:\n";
    echo "Email: employee.dashboard@example.com\n";
    echo "Mot de passe: employee123\n";
    echo "User ID: {$employee->getId()}\n";
    echo "Cours assignés:\n";
    foreach ($finalAffectations as $affectation) {
        if ($affectation->getCourse()) {
            echo "  - {$affectation->getCourse()->getTitle()}\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

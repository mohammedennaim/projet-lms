<?php

require_once 'vendor/autoload.php';

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Dotenv\Dotenv;

echo "🔍 TEST - API Employee Affectations\n";
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
    
    // Trouver un employé
    $employee = $userRepo->createQueryBuilder('u')
        ->where('u.roles LIKE :role')
        ->setParameter('role', '%ROLE_EMPLOYEE%')
        ->setMaxResults(1)
        ->getQuery()
        ->getOneOrNullResult();
    
    if (!$employee) {
        echo "❌ Aucun employé trouvé\n";
        exit;
    }
    
    echo "👤 Test avec l'employé: " . $employee->getFullName() . " (ID: " . $employee->getId() . ")\n";
    echo "📧 Email: " . $employee->getEmail() . "\n\n";
    
    // Simuler un appel à l'API
    $url = "http://localhost:8000/api/employee/affectations/" . $employee->getId();
    echo "🌐 Test de l'API: " . $url . "\n\n";
    
    // Faire une requête HTTP
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            'timeout' => 10
        ]
    ]);
    
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "❌ Erreur lors de l'appel API\n";
        echo "Headers de réponse:\n";
        print_r($http_response_header ?? []);
    } else {
        echo "✅ Réponse reçue:\n";
        echo $response . "\n\n";
        
        $data = json_decode($response, true);
        if ($data) {
            echo "📊 Résultats:\n";
            echo "- Cours: " . count($data['courses'] ?? []) . "\n";
            echo "- Quiz: " . count($data['quizzes'] ?? []) . "\n";
            echo "- Ressources: " . count($data['resources'] ?? []) . "\n";
        }
    }
    
} catch (\Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

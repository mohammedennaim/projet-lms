<?php

echo "🔍 CRÉATION D'AFFECTATIONS TEST\n";
echo "=" . str_repeat("=", 35) . "\n\n";

$baseUrl = 'http://localhost:8000';

function makeApiCall($url, $method = 'GET', $data = null, $token = null) {
    $curl = curl_init();
    
    $headers = [
        'Content-Type: application/json',
        'Accept: application/json'
    ];
    
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
    ]);
    
    if ($method === 'POST') {
        curl_setopt($curl, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    return [
        'status' => $httpCode,
        'body' => json_decode($response, true),
        'raw' => $response
    ];
}

// Étape 1: Créer un admin pour gérer les affectations
echo "1️⃣ Création d'un compte admin...\n";
$adminData = [
    'email' => 'admin.test@example.com',
    'password' => 'admin123',
    'fullName' => 'Admin Test',
    'roles' => 'ROLE_ADMIN'
];

$adminResult = makeApiCall($baseUrl . '/api/register', 'POST', $adminData);
echo "Status admin: " . $adminResult['status'] . "\n";

if ($adminResult['status'] === 201) {
    echo "✅ Admin créé\n";
    $adminId = $adminResult['body']['user']['id'];
} else {
    echo "ℹ️ Admin existe déjà ou autre erreur\n";
    $adminId = null;
}

// Étape 2: Se connecter comme admin
echo "\n2️⃣ Connexion admin...\n";
$adminLogin = [
    'email' => 'admin.test@example.com',
    'password' => 'admin123'
];

$adminLoginResult = makeApiCall($baseUrl . '/api/login', 'POST', $adminLogin);
if ($adminLoginResult['status'] === 200) {
    $adminToken = $adminLoginResult['body']['token'];
    echo "✅ Admin connecté\n";
} else {
    echo "❌ Impossible de connecter l'admin\n";
    exit;
}

// Étape 3: Créer un employé de test
echo "\n3️⃣ Création d'un employé de test...\n";
$employeeData = [
    'email' => 'employee.dashboard@example.com',
    'password' => 'employee123',
    'fullName' => 'Employee Dashboard Test',
    'roles' => 'ROLE_EMPLOYEE'
];

$employeeResult = makeApiCall($baseUrl . '/api/register', 'POST', $employeeData);
echo "Status employé: " . $employeeResult['status'] . "\n";

if ($employeeResult['status'] === 201) {
    $employeeId = $employeeResult['body']['user']['id'];
    echo "✅ Employé créé avec ID: {$employeeId}\n";
} else {
    echo "ℹ️ Employé existe déjà ou autre erreur\n";
    // Essayons de se connecter pour récupérer l'ID
    $employeeLoginResult = makeApiCall($baseUrl . '/api/login', 'POST', [
        'email' => 'employee.dashboard@example.com',
        'password' => 'employee123'
    ]);
    
    if ($employeeLoginResult['status'] === 200) {
        $employeeId = $employeeLoginResult['body']['userId'];
        echo "ℹ️ ID employé récupéré: {$employeeId}\n";
    } else {
        echo "❌ Impossible de récupérer l'ID employé\n";
        exit;
    }
}

// Étape 4: Récupérer les cours disponibles
echo "\n4️⃣ Récupération des cours disponibles...\n";
$coursesResult = makeApiCall($baseUrl . '/api/courses', 'GET', null, $adminToken);
echo "Status courses: " . $coursesResult['status'] . "\n";

if ($coursesResult['status'] === 200 && !empty($coursesResult['body'])) {
    $courses = is_array($coursesResult['body']) ? $coursesResult['body'] : [];
    echo "✅ " . count($courses) . " cours trouvés\n";
    
    // Affichage des cours
    foreach ($courses as $index => $course) {
        echo "   Cours " . ($index + 1) . ": {$course['title']} (ID: {$course['id']})\n";
    }
} else {
    echo "❌ Aucun cours trouvé\n";
    echo "Réponse: " . json_encode($coursesResult['body'], JSON_PRETTY_PRINT) . "\n";
    exit;
}

// Étape 5: Créer des affectations
echo "\n5️⃣ Création d'affectations pour l'employé...\n";

// Utilisons le script SQL direct pour créer les affectations
echo "Création d'affectations via insertion directe en base...\n";

// On va utiliser une approche simple: insertion manuelle via SQL
$sqlCommands = [];
foreach ($courses as $index => $course) {
    if ($index < 2) { // Limitons à 2 cours pour le test
        $courseId = $course['id'];
        $sqlCommands[] = "INSERT INTO affectation (user_id, course_id, created_at) VALUES ({$employeeId}, {$courseId}, NOW()) ON DUPLICATE KEY UPDATE course_id = course_id;";
    }
}

// Sauvegarde des commandes SQL dans un fichier
$sqlContent = "-- Affectations de test pour l'employé ID {$employeeId}\n";
$sqlContent .= "USE lms_database;\n\n";
foreach ($sqlCommands as $sql) {
    $sqlContent .= $sql . "\n";
}

file_put_contents('create_test_affectations.sql', $sqlContent);
echo "✅ Fichier SQL créé: create_test_affectations.sql\n";
echo "   Exécutez ce fichier dans votre base de données pour créer les affectations\n";

// Étape 6: Vérification finale
echo "\n6️⃣ Vérification finale...\n";
$finalCheck = makeApiCall($baseUrl . '/api/employee/affectations/' . $employeeId, 'GET', null, $adminToken);
echo "Status vérification: " . $finalCheck['status'] . "\n";

if ($finalCheck['status'] === 200) {
    $coursesCount = count($finalCheck['body']['courses'] ?? []);
    echo "✅ Affectations trouvées: {$coursesCount} cours\n";
    
    if ($coursesCount > 0) {
        echo "📚 Cours assignés:\n";
        foreach ($finalCheck['body']['courses'] as $assignedCourse) {
            echo "   - {$assignedCourse['title']}\n";
        }
    }
} else {
    echo "❌ Erreur lors de la vérification\n";
}

echo "\n🎯 RÉSUMÉ POUR LES TESTS FRONTEND:\n";
echo "Email employé: employee.dashboard@example.com\n";
echo "Mot de passe: employee123\n";
echo "User ID: {$employeeId}\n";
echo "API URL: {$baseUrl}/api/employee/affectations/{$employeeId}\n\n";

echo "💡 PROCHAINES ÉTAPES:\n";
echo "1. Exécutez le fichier SQL généré pour créer les affectations\n";
echo "2. Testez la connexion avec les identifiants ci-dessus\n";
echo "3. Utilisez l'URL API pour vérifier les affectations\n";
echo "4. Testez le composant React avec ces données\n";

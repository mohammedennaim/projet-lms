<?php

echo "🔍 DIAGNOSTIC - Problème Dashboard Employé (Courses Assignés)\n";
echo "=" . str_repeat("=", 60) . "\n\n";

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
    $error = curl_error($curl);
    curl_close($curl);
    
    return [
        'status' => $httpCode,
        'body' => json_decode($response, true),
        'raw' => $response,
        'error' => $error
    ];
}

// Étape 1: Créer un utilisateur employé de test
echo "1️⃣ Création d'un utilisateur employé de test...\n";
$timestamp = time();
$testEmployee = [
    'email' => "employee.test.{$timestamp}@example.com",
    'password' => 'password123',
    'fullName' => 'Test Employee Dashboard',
    'roles' => 'ROLE_EMPLOYEE'
];

$registerResult = makeApiCall($baseUrl . '/api/register', 'POST', $testEmployee);
echo "Status: " . $registerResult['status'] . "\n";
echo "Réponse: " . json_encode($registerResult['body'], JSON_PRETTY_PRINT) . "\n\n";

if ($registerResult['status'] !== 201) {
    echo "❌ Échec de la création de l'utilisateur test. Arrêt du diagnostic.\n";
    exit;
}

$userId = $registerResult['body']['user']['id'] ?? null;
if (!$userId) {
    echo "❌ Impossible de récupérer l'ID utilisateur. Arrêt du diagnostic.\n";
    exit;
}

echo "✅ Utilisateur créé avec l'ID: {$userId}\n\n";

// Étape 2: Connexion de l'utilisateur
echo "2️⃣ Connexion de l'utilisateur employé...\n";
$loginData = [
    'email' => $testEmployee['email'],
    'password' => $testEmployee['password']
];

$loginResult = makeApiCall($baseUrl . '/api/login', 'POST', $loginData);
echo "Status: " . $loginResult['status'] . "\n";
echo "Réponse: " . json_encode($loginResult['body'], JSON_PRETTY_PRINT) . "\n\n";

if ($loginResult['status'] !== 200) {
    echo "❌ Échec de la connexion. Arrêt du diagnostic.\n";
    exit;
}

$token = $loginResult['body']['token'] ?? null;
if (!$token) {
    echo "❌ Token non reçu. Arrêt du diagnostic.\n";
    exit;
}

echo "✅ Connexion réussie. Token obtenu.\n\n";

// Étape 3: Test de l'API des affectations (sans affectations)
echo "3️⃣ Test de l'API des affectations employé (sans affectations)...\n";
$affectationsUrl = $baseUrl . '/api/employee/affectations/' . $userId;
$affectationsResult = makeApiCall($affectationsUrl, 'GET', null, $token);

echo "URL: {$affectationsUrl}\n";
echo "Status: " . $affectationsResult['status'] . "\n";
echo "Réponse: " . json_encode($affectationsResult['body'], JSON_PRETTY_PRINT) . "\n\n";

// Étape 4: Vérifier les cours disponibles
echo "4️⃣ Vérification des cours disponibles...\n";
$coursesResult = makeApiCall($baseUrl . '/api/courses', 'GET');
echo "Status: " . $coursesResult['status'] . "\n";
echo "Nombre de cours: " . (is_array($coursesResult['body']) ? count($coursesResult['body']) : 'N/A') . "\n";
if (is_array($coursesResult['body']) && !empty($coursesResult['body'])) {
    echo "Premier cours: " . json_encode($coursesResult['body'][0], JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

// Étape 5: Créer une affectation (simulation admin)
echo "5️⃣ Création d'une affectation test...\n";
if (is_array($coursesResult['body']) && !empty($coursesResult['body'])) {
    $firstCourse = $coursesResult['body'][0];
    $courseId = $firstCourse['id'];
    
    echo "Tentative d'affectation du cours ID {$courseId} à l'utilisateur ID {$userId}...\n";
    
    // Test direct de création d'affectation
    $affectationData = [
        'userId' => $userId,
        'courseId' => $courseId
    ];
    
    $createAffectationResult = makeApiCall($baseUrl . '/api/affectations', 'POST', $affectationData, $token);
    echo "Status création affectation: " . $createAffectationResult['status'] . "\n";
    echo "Réponse: " . json_encode($createAffectationResult['body'], JSON_PRETTY_PRINT) . "\n\n";
    
    // Re-test de l'API des affectations après création
    echo "6️⃣ Re-test de l'API des affectations après création...\n";
    $affectationsResult2 = makeApiCall($affectationsUrl, 'GET', null, $token);
    echo "Status: " . $affectationsResult2['status'] . "\n";
    echo "Réponse: " . json_encode($affectationsResult2['body'], JSON_PRETTY_PRINT) . "\n\n";
} else {
    echo "❌ Aucun cours disponible pour créer une affectation.\n\n";
}

// Étape 7: Test des endpoints potentiellement problématiques
echo "7️⃣ Test d'autres endpoints potentiellement utilisés...\n";

// Test endpoint alternatif
$altUrl = $baseUrl . '/api/affectations/user/' . $userId;
$altResult = makeApiCall($altUrl, 'GET', null, $token);
echo "Test endpoint alternatif: {$altUrl}\n";
echo "Status: " . $altResult['status'] . "\n";
echo "Réponse: " . json_encode($altResult['body'], JSON_PRETTY_PRINT) . "\n\n";

// Test endpoint général affectations
$generalUrl = $baseUrl . '/api/affectations';
$generalResult = makeApiCall($generalUrl, 'GET', null, $token);
echo "Test endpoint général: {$generalUrl}\n";
echo "Status: " . $generalResult['status'] . "\n";
echo "Réponse: " . json_encode($generalResult['body'], JSON_PRETTY_PRINT) . "\n\n";

// Étape 8: Vérification des headers CORS
echo "8️⃣ Test des headers CORS...\n";
$corsResult = makeApiCall($affectationsUrl, 'OPTIONS', null, $token);
echo "Status OPTIONS: " . $corsResult['status'] . "\n";
echo "Réponse OPTIONS: " . json_encode($corsResult['body'], JSON_PRETTY_PRINT) . "\n\n";

echo "🔧 ANALYSE DES RÉSULTATS\n";
echo "=" . str_repeat("=", 25) . "\n";

if ($affectationsResult['status'] === 200) {
    echo "✅ L'API des affectations fonctionne (status 200)\n";
    if (empty($affectationsResult['body']) || (is_array($affectationsResult['body']) && count($affectationsResult['body']) === 0)) {
        echo "ℹ️ Aucune affectation trouvée (normal pour un nouvel utilisateur)\n";
    } else {
        echo "✅ Affectations trouvées: " . count($affectationsResult['body']) . "\n";
    }
} else {
    echo "❌ L'API des affectations ne fonctionne pas (status: " . $affectationsResult['status'] . ")\n";
    echo "   Erreur possible: " . ($affectationsResult['error'] ?: 'Inconnue') . "\n";
}

echo "\n📋 PROCHAINES ÉTAPES:\n";
echo "1. Vérifier la configuration CORS dans Symfony\n";
echo "2. Vérifier les routes API Platform\n";
echo "3. Vérifier la configuration JWT\n";
echo "4. Vérifier le frontend (URL API, gestion d'erreurs)\n";
echo "5. Vérifier les logs du serveur Symfony\n\n";

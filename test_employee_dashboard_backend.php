<?php
// Script pour tester le backend de l'API employee affectations

$baseUrl = 'http://localhost:8000/api';

// Test 1: Vérifier que le serveur répond
echo "=== TEST 1: Connexion au serveur ===\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false) {
    echo "❌ ERREUR: Impossible de se connecter au serveur backend\n";
    echo "Assurez-vous que le serveur Symfony est démarré sur http://localhost:8000\n";
    exit(1);
} else {
    echo "✅ Serveur backend accessible (HTTP $httpCode)\n";
}

// Test 2: Login pour obtenir un token
echo "\n=== TEST 2: Connexion utilisateur ===\n";

// Essayer de se connecter avec des identifiants test
$loginData = [
    'email' => 'john.doe@lms.com',
    'password' => 'password123'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Code HTTP: $httpCode\n";
echo "Réponse: $response\n";

$responseData = json_decode($response, true);
$token = null;

if ($httpCode == 200 && isset($responseData['token'])) {
    $token = $responseData['token'];
    echo "✅ Connexion réussie, token obtenu\n";
} else {
    echo "❌ Échec de la connexion. Essayons avec d'autres identifiants...\n";
    
    // Essayer avec d'autres identifiants possibles
    $altLoginData = [
        'email' => 'jane.smith@lms.com',
        'password' => 'password'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/login');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($altLoginData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Tentative alternative - Code HTTP: $httpCode\n";
    echo "Réponse: $response\n";
    
    $responseData = json_decode($response, true);
    if ($httpCode == 200 && isset($responseData['token'])) {
        $token = $responseData['token'];
        echo "✅ Connexion alternative réussie, token obtenu\n";
    }
}

if (!$token) {
    echo "❌ Impossible d'obtenir un token. Vérifiez les utilisateurs en base de données.\n";
    exit(1);
}

// Test 3: Appel de l'API affectations
echo "\n=== TEST 3: Récupération des affectations ===\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/employee/affectations');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Code HTTP: $httpCode\n";
echo "Réponse: $response\n";

$affectationsData = json_decode($response, true);

if ($httpCode == 200) {
    echo "✅ API affectations accessible\n";
    if (isset($affectationsData['courses'])) {
        $courseCount = count($affectationsData['courses']);
        echo "📚 Nombre de cours assignés: $courseCount\n";
        
        if ($courseCount > 0) {
            echo "Cours trouvés:\n";
            foreach ($affectationsData['courses'] as $course) {
                echo "  - ID: {$course['id']}, Titre: {$course['title']}\n";
            }
        } else {
            echo "ℹ️  Aucun cours assigné à cet utilisateur\n";
        }
    }
} else {
    echo "❌ Erreur lors de l'appel API affectations\n";
    if ($httpCode == 401) {
        echo "Erreur d'authentification - le token pourrait être invalide\n";
    } elseif ($httpCode == 403) {
        echo "Accès refusé - l'utilisateur n'a peut-être pas le rôle EMPLOYEE\n";
    }
}

echo "\n=== RÉSUMÉ DES TESTS ===\n";
echo "1. Serveur backend: " . ($response !== false ? "✅ OK" : "❌ ERREUR") . "\n";
echo "2. Authentification: " . ($token ? "✅ OK" : "❌ ERREUR") . "\n";
echo "3. API affectations: " . ($httpCode == 200 ? "✅ OK" : "❌ ERREUR ($httpCode)") . "\n";

if ($httpCode == 200 && isset($affectationsData['courses'])) {
    echo "4. Structure de données: ✅ OK\n";
} else {
    echo "4. Structure de données: ❌ ERREUR\n";
}

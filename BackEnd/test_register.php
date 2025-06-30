<?php

echo "🔍 DIAGNOSTIC - Problème d'enregistrement (Register)\n";
echo "=" . str_repeat("=", 50) . "\n\n";

$baseUrl = 'http://localhost:8000';

function testRegistration($userData) {
    global $baseUrl;
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
        CURLOPT_URL => $baseUrl . '/api/register',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json'
        ],
        CURLOPT_POSTFIELDS => json_encode($userData),
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    return [
        'status' => $httpCode,
        'body' => json_decode($response, true),
        'raw' => $response
    ];
}

// Test 1: Données valides standard
echo "1️⃣ Test avec données valides standard...\n";
$validData = [
    'email' => 'test.user@example.com',
    'password' => 'password123',
    'fullName' => 'Test User'
];

$result = testRegistration($validData);
echo "Status: " . $result['status'] . "\n";
echo "Réponse: " . json_encode($result['body'], JSON_PRETTY_PRINT) . "\n\n";

// Test 2: Données avec rôle spécifique
echo "2️⃣ Test avec rôle ROLE_EMPLOYEE...\n";
$dataWithRole = [
    'email' => 'employee.test@example.com',
    'password' => 'password123',
    'fullName' => 'Employee Test',
    'roles' => 'ROLE_EMPLOYEE'
];

$result2 = testRegistration($dataWithRole);
echo "Status: " . $result2['status'] . "\n";
echo "Réponse: " . json_encode($result2['body'], JSON_PRETTY_PRINT) . "\n\n";

// Test 3: Données invalides pour identifier les problèmes
echo "3️⃣ Test avec email invalide...\n";
$invalidEmail = [
    'email' => 'invalid-email',
    'password' => 'password123',
    'fullName' => 'Test User'
];

$result3 = testRegistration($invalidEmail);
echo "Status: " . $result3['status'] . "\n";
echo "Réponse: " . json_encode($result3['body'], JSON_PRETTY_PRINT) . "\n\n";

// Test 4: Mot de passe trop court
echo "4️⃣ Test avec mot de passe trop court...\n";
$shortPassword = [
    'email' => 'short.pass@example.com',
    'password' => '123',
    'fullName' => 'Test User'
];

$result4 = testRegistration($shortPassword);
echo "Status: " . $result4['status'] . "\n";
echo "Réponse: " . json_encode($result4['body'], JSON_PRETTY_PRINT) . "\n\n";

// Test 5: Champs manquants
echo "5️⃣ Test avec champs manquants...\n";
$missingFields = [
    'email' => 'missing.fields@example.com'
    // password et fullName manquants
];

$result5 = testRegistration($missingFields);
echo "Status: " . $result5['status'] . "\n";
echo "Réponse: " . json_encode($result5['body'], JSON_PRETTY_PRINT) . "\n\n";

echo "🔧 ANALYSE DES PROBLÈMES DÉTECTÉS\n";
echo "=" . str_repeat("=", 35) . "\n";

if ($result['status'] !== 201) {
    echo "❌ L'enregistrement avec des données valides échoue\n";
    echo "   Causes possibles:\n";
    echo "   - Contraintes de validation incorrectes\n";
    echo "   - Problème de configuration des rôles\n";
    echo "   - Contrainte d'unicité sur l'email\n";
    echo "   - Problème avec le hachage du mot de passe\n\n";
} else {
    echo "✅ L'enregistrement avec des données valides fonctionne\n\n";
}

echo "📋 RECOMMANDATIONS POUR LA CORRECTION:\n";
echo "1. Vérifier les contraintes de validation dans l'entité User\n";
echo "2. Corriger la gestion des rôles (array vs string)\n";
echo "3. Améliorer la validation des champs requis\n";
echo "4. Tester avec un email unique à chaque fois\n\n";

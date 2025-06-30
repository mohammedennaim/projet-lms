<?php

// Test script pour vérifier les affectations
// Remplacez ces valeurs par de vraies données de votre base de données

$userId = 1; // ID d'un employé existant
$apiUrl = "http://localhost:8000/api/employee/affectations/{$userId}";

echo "Testing API endpoint: {$apiUrl}\n";

// Test avec cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    // Ajoutez ici votre token d'authentification si nécessaire
    // 'Authorization: Bearer YOUR_TOKEN_HERE'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

echo "HTTP Code: {$httpCode}\n";
echo "Response: {$response}\n";

curl_close($ch);

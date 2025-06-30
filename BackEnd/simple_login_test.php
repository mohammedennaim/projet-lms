<?php

// Test simple pour vérifier le login
$url = 'http://localhost:8000/api/login';
$data = [
    'email' => 'john.doe@lms.com',
    'password' => 'password123'
];

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

echo "Status: $httpCode\n";
echo "Response: $response\n";

if ($httpCode === 200) {
    $decoded = json_decode($response, true);
    if ($decoded) {
        echo "Decoded response:\n";
        print_r($decoded);
        
        if (isset($decoded['userId'])) {
            echo "User ID found: " . $decoded['userId'] . "\n";
        } else {
            echo "No userId in response\n";
        }
    } else {
        echo "Failed to decode JSON\n";
    }
}

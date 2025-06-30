<?php

require_once 'vendor/autoload.php';

// URL de base de l'API
$baseUrl = 'http://localhost:8000';

// Fonction pour faire des requêtes HTTP
function makeRequest($url, $method = 'GET', $data = null, $token = null) {
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
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => $data ? json_encode($data) : null,
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

echo "=== Test des API d'employé ===\n\n";

// 1. Test de login employé (obtenir le token)
echo "1. Connexion employé...\n";
$loginResponse = makeRequest($baseUrl . '/api/login', 'POST', [
    'email' => 'john.doe@lms.com',
    'password' => 'password123'
]);

if ($loginResponse['status'] === 200 && isset($loginResponse['body']['token'])) {
    $token = $loginResponse['body']['token'];
    echo "✅ Connexion réussie\n";
    echo "Token: " . substr($token, 0, 50) . "...\n";
    echo "Réponse complète: " . print_r($loginResponse['body'], true) . "\n";
    
    // Obtenir l'ID de l'utilisateur
    $userId = $loginResponse['body']['userId'] ?? null;
    if ($userId) {
        echo "User ID: $userId\n\n";
        
        // 2. Test de récupération des cours assignés
        echo "2. Récupération des cours assignés...\n";
        $coursesResponse = makeRequest($baseUrl . "/api/employee/affectations/$userId", 'GET', null, $token);
        
        echo "Status: " . $coursesResponse['status'] . "\n";
        if ($coursesResponse['status'] === 200) {
            echo "✅ API accessible\n";
            echo "Réponse:\n";
            print_r($coursesResponse['body']);
            
            $courses = $coursesResponse['body']['courses'] ?? [];
            echo "\nNombre de cours trouvés: " . count($courses) . "\n";
            
            if (count($courses) > 0) {
                echo "✅ Des cours sont assignés à cet employé\n";
                foreach ($courses as $index => $course) {
                    echo "Cours " . ($index + 1) . ": " . $course['title'] . "\n";
                }
            } else {
                echo "❌ Aucun cours assigné trouvé\n";
            }
        } else {
            echo "❌ Erreur lors de la récupération des cours\n";
            echo "Réponse: " . print_r($coursesResponse['body'], true) . "\n";
        }
        
        // 3. Test de l'API alternative
        echo "\n3. Test de l'API alternative /api/employee/courses...\n";
        $altCoursesResponse = makeRequest($baseUrl . '/api/employee/courses', 'GET', null, $token);
        
        echo "Status: " . $altCoursesResponse['status'] . "\n";
        if ($altCoursesResponse['status'] === 200) {
            echo "✅ API alternative accessible\n";
            $altCourses = $altCoursesResponse['body']['data'] ?? [];
            echo "Nombre de cours (API alternative): " . count($altCourses) . "\n";
        } else {
            echo "❌ Erreur avec l'API alternative\n";
            echo "Réponse: " . print_r($altCoursesResponse['body'], true) . "\n";
        }
    } else {
        echo "❌ Impossible d'obtenir l'ID utilisateur\n";
    }
} else {
    echo "❌ Échec de la connexion\n";
    echo "Status: " . $loginResponse['status'] . "\n";
    echo "Réponse: " . print_r($loginResponse['body'], true) . "\n";
}

// 4. Test de debug des affectations
echo "\n4. Test de debug des affectations...\n";
$debugResponse = makeRequest($baseUrl . '/api/employee/debug/affectations', 'GET');

echo "Status: " . $debugResponse['status'] . "\n";
if ($debugResponse['status'] === 200) {
    echo "✅ Debug API accessible\n";
    $affectations = $debugResponse['body']['data'] ?? [];
    echo "Nombre total d'affectations: " . count($affectations) . "\n";
    
    // Filtrer les affectations avec des cours
    $affectationsWithCourses = array_filter($affectations, function($aff) {
        return $aff['has_course'] === true;
    });
    
    echo "Affectations avec cours: " . count($affectationsWithCourses) . "\n";
    
    if (count($affectationsWithCourses) > 0) {
        echo "Exemples d'affectations avec cours:\n";
        foreach (array_slice($affectationsWithCourses, 0, 3) as $aff) {
            echo "- User {$aff['user_id']} ({$aff['user_email']}) -> Cours {$aff['course_id']} ({$aff['course_title']})\n";
        }
    }
} else {
    echo "❌ Debug API non accessible\n";
    echo "Réponse: " . print_r($debugResponse['body'], true) . "\n";
}

echo "\n=== Test terminé ===\n";

<?php

echo "🔍 DIAGNOSTIC - Données de Hassan\n";
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
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => $data ? json_encode($data) : null,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_VERBOSE => false
    ]);
    
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

// Test 1: Récupérer tous les employés pour trouver Hassan
echo "1️⃣ Recherche de Hassan dans les employés...\n";
$employeesResult = makeApiCall($baseUrl . '/api/statistics/debug-employees');

if ($employeesResult['status'] === 200 && isset($employeesResult['body']['employees'])) {
    $employees = $employeesResult['body']['employees'];
    $hassan = null;
    
    foreach ($employees as $emp) {
        if (stripos($emp['email'], 'hassan') !== false || stripos($emp['fullName'], 'hassan') !== false) {
            $hassan = $emp;
            break;
        }
    }
    
    if ($hassan) {
        echo "✅ Hassan trouvé!\n";
        echo "   ID: " . $hassan['id'] . "\n";
        echo "   Nom: " . ($hassan['fullName'] ?? 'N/A') . "\n";
        echo "   Email: " . ($hassan['email'] ?? 'N/A') . "\n\n";
        
        // Test 2: Récupérer les affectations pour Hassan
        echo "2️⃣ Affectations de Hassan...\n";
        $affectationsResult = makeApiCall($baseUrl . '/api/statistics/affectations-simple');
        
        if ($affectationsResult['status'] === 200) {
            $affectations = $affectationsResult['body'];
            $hassanAffectations = [];
            
            foreach ($affectations as $aff) {
                if ($aff['user']['id'] == $hassan['id']) {
                    $hassanAffectations[] = $aff;
                }
            }
            
            echo "✅ " . count($hassanAffectations) . " affectation(s) trouvée(s) pour Hassan\n\n";
            
            foreach ($hassanAffectations as $index => $aff) {
                echo "📚 Affectation " . ($index + 1) . ":\n";
                echo "   Cours: " . ($aff['course']['title'] ?? 'N/A') . "\n";
                echo "   Date assignée: " . ($aff['dateAssigned'] ?? 'N/A') . "\n";
                echo "   Assigné cours: " . ($aff['assigneCours'] ? 'Oui' : 'Non') . "\n";
                echo "   Évaluations: " . count($aff['evaluations'] ?? []) . "\n";
                
                if (!empty($aff['evaluations'])) {
                    echo "   📊 Détail des évaluations:\n";
                    foreach ($aff['evaluations'] as $evalIndex => $eval) {
                        echo "      " . ($evalIndex + 1) . ". Note: " . ($eval['note'] ?? 'N/A') . "\n";
                        echo "         Date: " . ($eval['dateEvaluation'] ?? 'N/A') . "\n";
                        echo "         Quiz ID: " . ($eval['quiz']['id'] ?? 'N/A') . "\n";
                        if (isset($eval['quiz']['title'])) {
                            echo "         Quiz: " . $eval['quiz']['title'] . "\n";
                        }
                    }
                } else {
                    echo "   ❌ Aucune évaluation trouvée!\n";
                }
                echo "\n";
            }
            
        } else {
            echo "❌ Erreur lors de la récupération des affectations: " . $affectationsResult['status'] . "\n";
            echo "   Body: " . print_r($affectationsResult['body'], true) . "\n";
        }
        
    } else {
        echo "❌ Hassan non trouvé dans les employés!\n";
        echo "👥 Employés disponibles:\n";
        foreach ($employees as $emp) {
            echo "   - " . ($emp['fullName'] ?? 'N/A') . " (" . ($emp['email'] ?? 'N/A') . ")\n";
        }
    }
    
} else {
    echo "❌ Erreur lors de la récupération des employés: " . $employeesResult['status'] . "\n";
    echo "   Body: " . print_r($employeesResult['body'], true) . "\n";
}

// Test 3: Test direct de connexion Hassan (si on connaît son mot de passe)
echo "\n3️⃣ Test de connexion directe Hassan...\n";
$loginResult = makeApiCall($baseUrl . '/api/login', 'POST', [
    'email' => 'hassan@gmail.com',
    'password' => 'password123' // Mot de passe par défaut
]);

if ($loginResult['status'] === 200) {
    echo "✅ Connexion Hassan réussie!\n";
    $token = $loginResult['body']['token'] ?? null;
    $user = $loginResult['body']['user'] ?? null;
    
    if ($user) {
        echo "   ID: " . $user['id'] . "\n";
        echo "   Nom: " . ($user['fullName'] ?? 'N/A') . "\n";
        echo "   Email: " . $user['email'] . "\n";
        
        // Test du dashboard employé pour Hassan
        if ($token) {
            echo "\n4️⃣ Dashboard employé pour Hassan...\n";
            $dashboardResult = makeApiCall($baseUrl . '/api/employee/dashboard', 'GET', null, $token);
            
            if ($dashboardResult['status'] === 200) {
                echo "✅ Dashboard Hassan récupéré!\n";
                $dashboard = $dashboardResult['body'];
                
                echo "   Cours assignés: " . count($dashboard['assignedCourses'] ?? []) . "\n";
                
                if (!empty($dashboard['assignedCourses'])) {
                    foreach ($dashboard['assignedCourses'] as $course) {
                        echo "   📚 " . ($course['title'] ?? 'N/A') . "\n";
                        echo "      Évaluations: " . count($course['evaluations'] ?? []) . "\n";
                        if (!empty($course['evaluations'])) {
                            foreach ($course['evaluations'] as $eval) {
                                echo "         - Note: " . ($eval['note'] ?? 'N/A') . "\n";
                            }
                        }
                    }
                }
            } else {
                echo "❌ Erreur dashboard Hassan: " . $dashboardResult['status'] . "\n";
                echo "   Body: " . print_r($dashboardResult['body'], true) . "\n";
            }
        }
    }
} else {
    echo "❌ Connexion Hassan échouée: " . $loginResult['status'] . "\n";
    echo "   Body: " . print_r($loginResult['body'], true) . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "Diagnostic terminé\n";

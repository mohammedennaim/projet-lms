<?php

echo "🔧 CORRECTION - Test Hassan après correction\n";
echo "=" . str_repeat("=", 45) . "\n\n";

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

// Vérifier Hassan après les modifications
echo "1️⃣ Vérification des données Hassan après correction...\n";

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
        echo "✅ Hassan trouvé - ID: {$hassan['id']}\n\n";
        
        // Vérifier les affectations Hassan
        $affectationsResult = makeApiCall($baseUrl . '/api/statistics/affectations-simple');
        
        if ($affectationsResult['status'] === 200) {
            $affectations = $affectationsResult['body'];
            $hassanAffectations = [];
            
            foreach ($affectations as $aff) {
                if ($aff['user']['id'] == $hassan['id']) {
                    $hassanAffectations[] = $aff;
                }
            }
            
            echo "2️⃣ Affectations Hassan:\n";
            foreach ($hassanAffectations as $index => $aff) {
                echo "📚 Affectation " . ($index + 1) . ":\n";
                echo "   Cours: " . ($aff['course']['title'] ?? 'N/A') . "\n";
                echo "   ✅ Évaluations: " . count($aff['evaluations'] ?? []) . "\n";
                
                if (!empty($aff['evaluations'])) {
                    echo "   🎯 SUCCÈS! Détail des évaluations:\n";
                    foreach ($aff['evaluations'] as $evalIndex => $eval) {
                        echo "      " . ($evalIndex + 1) . ". Note: " . ($eval['note'] ?? 'N/A') . "/20\n";
                        echo "         Évalué: " . ($eval['evalueAffectation'] ? 'Oui' : 'Non') . "\n";
                    }
                } else {
                    echo "   ❌ Toujours aucune évaluation!\n";
                    echo "   💡 Hassan doit repasser le quiz après cette correction.\n";
                }
                echo "\n";
            }
            
        } else {
            echo "❌ Erreur récupération affectations: " . $affectationsResult['status'] . "\n";
        }
        
    } else {
        echo "❌ Hassan non trouvé!\n";
    }
    
} else {
    echo "❌ Erreur récupération employés: " . $employeesResult['status'] . "\n";
}

echo "\n3️⃣ Instructions pour Hassan:\n";
echo "1. Hassan doit repasser le quiz pour créer une évaluation\n";
echo "2. Ou bien nous devons créer manuellement une évaluation\n";
echo "3. Après cela, il devrait apparaître dans le tableau de bord\n\n";

echo str_repeat("=", 50) . "\n";
echo "Test terminé\n";

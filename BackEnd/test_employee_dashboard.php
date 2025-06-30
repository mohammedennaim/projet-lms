<?php

echo "🔍 DIAGNOSTIC - Cours assignés dans Dashboard Employé\n";
echo "=" . str_repeat("=", 55) . "\n\n";

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

// Étape 1: Test de connexion employé existant
echo "1️⃣ Test de connexion avec un employé existant...\n";
$loginResult = makeApiCall($baseUrl . '/api/login', 'POST', [
    'email' => 'john.doe@lms.com',
    'password' => 'password123'
]);

if ($loginResult['status'] === 200) {
    $token = $loginResult['body']['token'];
    $userId = $loginResult['body']['userId'];
    
    echo "   ✅ Connexion réussie\n";
    echo "   👤 User: {$loginResult['body']['user']} (ID: $userId)\n";
    echo "   🎭 Role: {$loginResult['body']['role']}\n\n";
    
    // Étape 2: Test de l'API des affectations
    echo "2️⃣ Test de l'API des affectations...\n";
    $affectationsResult = makeApiCall($baseUrl . "/api/employee/affectations/$userId", 'GET', null, $token);
    
    echo "   Status: {$affectationsResult['status']}\n";
    if ($affectationsResult['status'] === 200) {
        echo "   ✅ API accessible\n";
        $courses = $affectationsResult['body']['courses'] ?? [];
        echo "   📚 Nombre de cours: " . count($courses) . "\n";
        
        if (count($courses) > 0) {
            echo "   📋 Liste des cours:\n";
            foreach ($courses as $i => $course) {
                echo "      " . ($i+1) . ". {$course['title']} (ID: {$course['id']})\n";
            }
        } else {
            echo "   ⚠️ Aucun cours trouvé pour cet employé\n";
        }
    } else {
        echo "   ❌ Erreur API: " . ($affectationsResult['body']['message'] ?? 'Erreur inconnue') . "\n";
        echo "   🔍 Réponse brute: " . $affectationsResult['raw'] . "\n";
    }
    echo "\n";
    
    // Étape 3: Test de l'API alternative
    echo "3️⃣ Test de l'API alternative /api/employee/courses...\n";
    $altResult = makeApiCall($baseUrl . '/api/employee/courses', 'GET', null, $token);
    
    echo "   Status: {$altResult['status']}\n";
    if ($altResult['status'] === 200) {
        echo "   ✅ API alternative accessible\n";
        $altCourses = $altResult['body']['data'] ?? [];
        echo "   📚 Nombre de cours (API alt): " . count($altCourses) . "\n";
    } else {
        echo "   ❌ API alternative en erreur\n";
        echo "   🔍 Message: " . ($altResult['body']['message'] ?? 'Erreur inconnue') . "\n";
    }
    echo "\n";
    
} else {
    echo "   ❌ Échec de la connexion\n";
    echo "   Status: {$loginResult['status']}\n";
    echo "   Message: " . ($loginResult['body']['message'] ?? 'Erreur inconnue') . "\n\n";
}

// Étape 4: Vérification des affectations en base
echo "4️⃣ Vérification des affectations en base de données...\n";

// Utiliser une commande SQL directe
$sqlCommands = [
    "SELECT COUNT(*) as total_affectations FROM affectation",
    "SELECT COUNT(*) as total_users FROM user WHERE roles LIKE '%EMPLOYEE%'",
    "SELECT COUNT(*) as total_courses FROM course",
    "SELECT a.id, u.email, c.title FROM affectation a JOIN user u ON a.user_id = u.id JOIN course c ON a.cours_id = c.id LIMIT 5"
];

foreach ($sqlCommands as $i => $sql) {
    echo "   SQL " . ($i+1) . ": $sql\n";
    $output = shell_exec("php bin/console dbal:run-sql \"$sql\" 2>&1");
    echo "   Résultat: " . trim($output) . "\n\n";
}

// Étape 5: Test avec un nouvel employé créé
echo "5️⃣ Test avec un employé nouvellement créé...\n";
$timestamp = time();
$newEmployee = [
    'email' => "test.employee.{$timestamp}@lms.com",
    'password' => 'password123',
    'fullName' => 'Test Employee Dashboard',
    'roles' => 'ROLE_EMPLOYEE'
];

$registerResult = makeApiCall($baseUrl . '/api/register', 'POST', $newEmployee);
if ($registerResult['status'] === 201) {
    echo "   ✅ Nouvel employé créé: {$newEmployee['email']}\n";
    
    // Connexion avec le nouvel employé
    $newLoginResult = makeApiCall($baseUrl . '/api/login', 'POST', [
        'email' => $newEmployee['email'],
        'password' => $newEmployee['password']
    ]);
    
    if ($newLoginResult['status'] === 200) {
        $newToken = $newLoginResult['body']['token'];
        $newUserId = $newLoginResult['body']['userId'];
        
        echo "   ✅ Connexion du nouvel employé réussie (ID: $newUserId)\n";
        
        // Test des affectations pour le nouvel employé
        $newAffectationsResult = makeApiCall($baseUrl . "/api/employee/affectations/$newUserId", 'GET', null, $newToken);
        echo "   📚 Cours assignés au nouvel employé: ";
        
        if ($newAffectationsResult['status'] === 200) {
            $newCourses = $newAffectationsResult['body']['courses'] ?? [];
            echo count($newCourses) . " cours\n";
        } else {
            echo "Erreur - " . ($newAffectationsResult['body']['message'] ?? 'Inconnue') . "\n";
        }
    }
} else {
    echo "   ❌ Impossible de créer un nouvel employé\n";
}

echo "\n🔧 DIAGNOSTIC COMPLET\n";
echo "=" . str_repeat("=", 20) . "\n";
echo "Ce test permet d'identifier la cause du message d'erreur :\n";
echo "'Failed to load your assigned courses. Please try again later.'\n\n";

echo "🔍 Points à vérifier :\n";
echo "1. ✅ API Backend accessible\n";
echo "2. ✅ Authentification JWT fonctionnelle\n";
echo "3. 🔍 Affectations existantes en base\n";
echo "4. 🔍 Réponse de l'API d'affectations\n";
echo "5. 🔍 Configuration CORS si erreur côté frontend\n\n";

echo "📋 Prochaines étapes :\n";
echo "- Si aucun cours n'est trouvé : Créer des affectations via l'admin\n";
echo "- Si API en erreur : Vérifier les logs Symfony\n";
echo "- Si tout fonctionne en CLI : Problème côté frontend React\n\n";

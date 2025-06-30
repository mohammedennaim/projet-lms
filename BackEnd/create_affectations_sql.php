<?php

echo "🔍 CRÉATION D'AFFECTATIONS DIRECTEMENT EN BASE\n";
echo "=" . str_repeat("=", 50) . "\n\n";

// Configuration de la base de données
$host = 'localhost';
$dbname = 'symfony_lms';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host={$host};dbname={$dbname};charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connexion à la base de données réussie\n";
    
    // Récupérer l'ID de l'employé test
    $stmt = $pdo->prepare("SELECT id FROM user WHERE email = ?");
    $stmt->execute(['employee.dashboard@example.com']);
    $employee = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$employee) {
        echo "❌ Employé non trouvé\n";
        exit;
    }
    
    $employeeId = $employee['id'];
    echo "✅ Employé trouvé - ID: {$employeeId}\n";
    
    // Récupérer les cours disponibles
    $stmt = $pdo->query("SELECT id, title FROM course LIMIT 3");
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "✅ " . count($courses) . " cours trouvés\n";
    
    // Supprimer les anciennes affectations
    $stmt = $pdo->prepare("DELETE FROM affectation WHERE user_id = ?");
    $stmt->execute([$employeeId]);
    echo "ℹ️ Anciennes affectations supprimées\n";
    
    // Créer de nouvelles affectations
    $assignedCount = 0;
    foreach ($courses as $course) {
        $stmt = $pdo->prepare("INSERT INTO affectation (user_id, cours_id, date_assigned, assigne_cours) VALUES (?, ?, NOW(), 1)");
        $stmt->execute([$employeeId, $course['id']]);
        echo "✅ Affectation créée: {$course['title']}\n";
        $assignedCount++;
    }
    
    echo "\n🎯 SUCCÈS!\n";
    echo "✅ {$assignedCount} affectations créées\n";
    
    // Vérification finale via API
    echo "\n🔍 Vérification via API...\n";
    
    $baseUrl = 'http://localhost:8000';
    
    // Connexion
    $loginData = json_encode([
        'email' => 'employee.dashboard@example.com',
        'password' => 'employee123'
    ]);
    
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $baseUrl . '/api/login',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => $loginData,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    if ($httpCode === 200) {
        $loginResult = json_decode($response, true);
        $token = $loginResult['token'];
        
        // Test API affectations
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $baseUrl . '/api/employee/affectations/' . $employeeId,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $token
            ],
            CURLOPT_SSL_VERIFYPEER => false,
        ]);
        
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        
        if ($httpCode === 200) {
            $apiResult = json_decode($response, true);
            $coursesCount = count($apiResult['courses'] ?? []);
            echo "✅ API Test réussi - {$coursesCount} cours trouvés\n";
            
            if ($coursesCount > 0) {
                echo "📚 Cours assignés via API:\n";
                foreach ($apiResult['courses'] as $course) {
                    echo "   - {$course['title']}\n";
                }
            }
        } else {
            echo "❌ Erreur API: {$httpCode}\n";
        }
    } else {
        echo "❌ Erreur de connexion API: {$httpCode}\n";
    }
    
    echo "\n🎯 RÉSULTAT FINAL:\n";
    echo "✅ Les affectations sont maintenant créées\n";
    echo "✅ Le dashboard employé devrait maintenant afficher les cours\n";
    echo "✅ Testez avec: http://localhost:3000/login\n";
    echo "   Email: employee.dashboard@example.com\n";
    echo "   Mot de passe: employee123\n";
    
} catch (PDOException $e) {
    echo "❌ Erreur de base de données: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}

<?php

echo "🔍 VÉRIFICATION STRUCTURE BASE DE DONNÉES\n";
echo "=" . str_repeat("=", 45) . "\n\n";

$host = 'localhost';
$dbname = 'symfony_lms';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host={$host};dbname={$dbname};charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connexion à la base de données réussie\n\n";
    
    // Vérifier les tables disponibles
    echo "📋 Tables disponibles:\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        echo "  - {$table}\n";
    }
    
    echo "\n📋 Structure de la table affectation:\n";
    $stmt = $pdo->query("DESCRIBE affectation");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $column) {
        echo "  - {$column['Field']} ({$column['Type']})\n";
    }
    
    echo "\n📊 Données actuelles dans affectation:\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM affectation");
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "  Total: {$count['total']} enregistrements\n";
    
    if ($count['total'] > 0) {
        $stmt = $pdo->query("SELECT * FROM affectation LIMIT 3");
        $affectations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "\n  Exemples:\n";
        foreach ($affectations as $aff) {
            echo "    " . json_encode($aff) . "\n";
        }
    }
    
    echo "\n📊 Utilisateurs (employés):\n";
    $stmt = $pdo->query("SELECT id, email, full_name, roles FROM user WHERE JSON_CONTAINS(roles, '\"ROLE_EMPLOYEE\"') LIMIT 5");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($users as $user) {
        echo "  - ID: {$user['id']}, Email: {$user['email']}, Nom: {$user['full_name']}\n";
    }
    
    echo "\n📊 Cours disponibles:\n";
    $stmt = $pdo->query("SELECT id, title FROM course LIMIT 5");
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($courses as $course) {
        echo "  - ID: {$course['id']}, Titre: {$course['title']}\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Erreur de base de données: " . $e->getMessage() . "\n";
}

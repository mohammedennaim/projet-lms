<?php
// Script pour lister les utilisateurs existants dans la base

require_once 'BackEnd/vendor/autoload.php';

use Doctrine\DBAL\DriverManager;

try {
    // Configuration de la base de données (ajustez selon votre config)
    $connectionParams = [
        'dbname' => 'symfony_lms',
        'user' => 'root',
        'password' => '',
        'host' => 'localhost',
        'driver' => 'pdo_mysql',
    ];

    $conn = DriverManager::getConnection($connectionParams);

    echo "=== UTILISATEURS DANS LA BASE DE DONNÉES ===\n";
    
    $sql = "SELECT id, email, full_name, roles FROM user LIMIT 10";
    $stmt = $conn->executeQuery($sql);
    $users = $stmt->fetchAllAssociative();

    if (empty($users)) {
        echo "❌ Aucun utilisateur trouvé dans la base de données\n";
        echo "Vous devrez peut-être créer des utilisateurs de test\n";
    } else {
        echo "✅ Utilisateurs trouvés:\n";
        foreach ($users as $user) {
            echo "  - ID: {$user['id']}, Email: {$user['email']}, Nom: {$user['full_name']}, Rôles: {$user['roles']}\n";
        }
    }

    // Vérifier les affectations
    echo "\n=== AFFECTATIONS DANS LA BASE ===\n";
    $sql = "SELECT a.id, a.user_id, u.email, a.cours_id, c.title as course_title 
            FROM affectation a 
            LEFT JOIN user u ON a.user_id = u.id 
            LEFT JOIN course c ON a.cours_id = c.id 
            LIMIT 10";
    
    $stmt = $conn->executeQuery($sql);
    $affectations = $stmt->fetchAllAssociative();

    if (empty($affectations)) {
        echo "❌ Aucune affectation trouvée\n";
    } else {
        echo "✅ Affectations trouvées:\n";
        foreach ($affectations as $affectation) {
            echo "  - Affectation ID: {$affectation['id']}, User: {$affectation['email']}, Cours: {$affectation['course_title']}\n";
        }
    }

} catch (Exception $e) {
    echo "❌ Erreur de connexion à la base de données: " . $e->getMessage() . "\n";
    echo "Vérifiez vos paramètres de connexion dans ce script.\n";
}

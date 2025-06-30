<?php

require_once 'vendor/autoload.php';

use App\Entity\User;
use Doctrine\ORM\EntityManager;

$kernel = new App\Kernel('dev', true);
$kernel->boot();
$container = $kernel->getContainer();
$em = $container->get('doctrine')->getManager();

echo "=== Liste des utilisateurs ===\n";
$users = $em->getRepository(User::class)->findAll();

foreach($users as $user) {
    echo 'ID: ' . $user->getId() . 
         ', Email: ' . $user->getEmail() . 
         ', Role: ' . implode(', ', $user->getRoles()) . 
         ', FullName: ' . $user->getFullName() . 
         PHP_EOL;
}

echo "\nNombre total d'utilisateurs: " . count($users) . "\n";

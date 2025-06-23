<?php

// Router pour le serveur PHP simple
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Si c'est une requête API ou si le fichier n'existe pas, rediriger vers index.php
if (strpos($uri, '/api/') === 0 || !file_exists(__DIR__ . $uri)) {
    // Conserver l'URI originale pour que Symfony puisse la traiter
    require __DIR__ . '/index.php';
    return true;
}

// Pour les fichiers statiques existants, utiliser le comportement par défaut
return false;

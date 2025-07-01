<?php
// Script pour corriger les erreurs getCreatedAt dans EmployeeController

$file = 'BackEnd/src/Controller/EmployeeController.php';
$content = file_get_contents($file);

if ($content === false) {
    die("Erreur: Impossible de lire le fichier $file\n");
}

echo "=== Correction des erreurs getCreatedAt() ===\n";

// Corriger les lignes problématiques pour Quiz
$content = str_replace(
    "'createdAt' => \$quiz->getCreatedAt() ? \$quiz->getCreatedAt()->format('Y-m-d H:i:s') : null,",
    "// 'createdAt' => 'N/A', // Quiz n'a pas de createdAt",
    $content
);

// Corriger les lignes problématiques pour Resource
$content = str_replace(
    "'createdAt' => \$resource->getCreatedAt() ? \$resource->getCreatedAt()->format('Y-m-d H:i:s') : null,",
    "// 'createdAt' => 'N/A', // Resource n'a pas de createdAt",
    $content
);

// Sauvegarder le fichier corrigé
if (file_put_contents($file, $content) !== false) {
    echo "✅ Fichier corrigé avec succès\n";
} else {
    echo "❌ Erreur lors de la sauvegarde\n";
}

echo "=== Vérification ===\n";
// Compter les occurrences restantes de getCreatedAt() pour quiz et resource
$remaining_quiz = substr_count($content, 'quiz->getCreatedAt()');
$remaining_resource = substr_count($content, 'resource->getCreatedAt()');

if ($remaining_quiz === 0 && $remaining_resource === 0) {
    echo "✅ Toutes les erreurs getCreatedAt() ont été corrigées\n";
} else {
    echo "⚠️  Il reste $remaining_quiz occurrences pour quiz et $remaining_resource pour resource\n";
}

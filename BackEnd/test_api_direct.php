<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

echo "🧪 TEST API DIRECT\n";
echo "==================\n\n";

echo "1️⃣ Test employees:\n";
$employeesUrl = 'http://localhost:8000/api/statistics/debug-employees';
$employeesResponse = file_get_contents($employeesUrl);
if ($employeesResponse) {
    $employeesData = json_decode($employeesResponse, true);
    echo "✅ Succès - " . $employeesData['count'] . " employés trouvés\n";
    echo "📝 Premiers employés:\n";
    foreach (array_slice($employeesData['employees'], 0, 3) as $emp) {
        echo "   - " . $emp['fullName'] . " (" . $emp['email'] . ")\n";
    }
} else {
    echo "❌ Échec de récupération des employés\n";
}

echo "\n2️⃣ Test affectations:\n";
$affectationsUrl = 'http://localhost:8000/api/statistics/affectations-simple';
$affectationsResponse = file_get_contents($affectationsUrl);
if ($affectationsResponse) {
    $affectationsData = json_decode($affectationsResponse, true);
    echo "✅ Succès - " . count($affectationsData) . " affectations trouvées\n";
    echo "📝 Première affectation:\n";
    $first = $affectationsData[0];
    echo "   - Employé: " . $first['user']['fullName'] . "\n";
    echo "   - Cours: " . $first['course']['title'] . "\n";
    echo "   - Évaluations: " . count($first['evaluations']) . "\n";
} else {
    echo "❌ Échec de récupération des affectations\n";
}

echo "\n3️⃣ Test Hassan spécifiquement:\n";
$hassanFound = false;
if ($affectationsResponse) {
    $affectationsData = json_decode($affectationsResponse, true);
    foreach ($affectationsData as $affectation) {
        if ($affectation['user']['email'] === 'hassan@gmail.com') {
            $hassanFound = true;
            echo "✅ Hassan trouvé!\n";
            echo "   - Cours: " . $affectation['course']['title'] . "\n";
            echo "   - Évaluations: " . count($affectation['evaluations']) . "\n";
            if (!empty($affectation['evaluations'])) {
                echo "   - Dernière note: " . $affectation['evaluations'][0]['note'] . "/20\n";
            }
            break;
        }
    }
}
if (!$hassanFound) {
    echo "❌ Hassan non trouvé dans les affectations\n";
}

echo "\n✅ Test terminé\n";
?>

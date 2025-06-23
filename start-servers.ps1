# Script PowerShell pour démarrer les serveurs Frontend et Backend
# Script to start both Frontend and Backend servers

Write-Host "🚀 Démarrage des serveurs LMS..." -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# Vérifier si les dossiers existent
if (-not (Test-Path "BackEnd")) {
    Write-Host "❌ Dossier BackEnd introuvable!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "FrontEnd")) {
    Write-Host "❌ Dossier FrontEnd introuvable!" -ForegroundColor Red
    exit 1
}

# Vérifier si PHP est installé
try {
    $phpVersion = php -v 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "PHP non trouvé"
    }
    Write-Host "✅ PHP détecté" -ForegroundColor Green
} catch {
    Write-Host "❌ PHP n'est pas installé ou non accessible depuis le PATH" -ForegroundColor Red
    Write-Host "   Veuillez installer PHP et l'ajouter au PATH système" -ForegroundColor Yellow
    exit 1
}

# Vérifier si Node.js est installé
try {
    $nodeVersion = node -v 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js non trouvé"
    }
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé ou non accessible depuis le PATH" -ForegroundColor Red
    Write-Host "   Veuillez installer Node.js depuis https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Fonction pour démarrer le backend
function Start-Backend {
    Write-Host ""
    Write-Host "🔧 Démarrage du serveur Backend..." -ForegroundColor Yellow
    
    Push-Location "BackEnd"
    
    # Vérifier si composer est installé et les dépendances
    if (-not (Test-Path "vendor")) {
        Write-Host "   📦 Installation des dépendances PHP..." -ForegroundColor Cyan
        composer install
    }
    
    # Démarrer le serveur PHP
    Write-Host "   🌐 Serveur Backend sur http://localhost:8000" -ForegroundColor Green
    Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; php -S localhost:8000 -t public; Read-Host 'Appuyez sur Entrée pour fermer'" -WindowStyle Normal
    
    Pop-Location
}

# Fonction pour démarrer le frontend
function Start-Frontend {
    Write-Host ""
    Write-Host "🔧 Démarrage du serveur Frontend..." -ForegroundColor Yellow
    
    Push-Location "FrontEnd"
    
    # Vérifier si les dépendances npm sont installées
    if (-not (Test-Path "node_modules")) {
        Write-Host "   📦 Installation des dépendances npm..." -ForegroundColor Cyan
        npm install
    }
    
    # Démarrer le serveur React
    Write-Host "   🌐 Serveur Frontend sur http://localhost:3000" -ForegroundColor Green
    Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm start; Read-Host 'Appuyez sur Entrée pour fermer'" -WindowStyle Normal
    
    Pop-Location
}

# Démarrer les serveurs
Start-Backend
Start-Sleep -Seconds 2
Start-Frontend

Write-Host ""
Write-Host "🎉 Les deux serveurs sont en cours de démarrage!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 URLs d'accès:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Les serveurs s'ouvrent dans des fenêtres séparées" -ForegroundColor Yellow
Write-Host "   Fermez ces fenêtres pour arrêter les serveurs" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Logs et diagnostics:" -ForegroundColor Cyan
Write-Host "   - Vérifiez les consoles des serveurs pour les erreurs" -ForegroundColor White
Write-Host "   - Le statut du serveur est affiché dans l'interface web" -ForegroundColor White
Write-Host ""

Read-Host "Appuyez sur Entrée pour fermer cette fenêtre"

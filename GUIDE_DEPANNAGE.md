# Guide de Dépannage - LMS Project

## Problèmes Courants et Solutions

### 🔴 "Données de démonstration (serveur non accessible)"

**Symptôme :** L'interface affiche ce message et utilise des données factices.

**Cause :** Le serveur backend n'est pas accessible ou démarré.

**Solutions :**

1. **Vérifier que le serveur backend est démarré :**
   ```powershell
   # Aller dans le dossier BackEnd
   cd BackEnd
   
   # Démarrer le serveur PHP
   php -S localhost:8000 -t public
   ```

2. **Vérifier la connectivité :**
   ```powershell
   # Tester si le serveur répond
   Invoke-WebRequest -Uri "http://localhost:8000/api" -Method GET
   # Devrait retourner une erreur 401 (normal, authentification requise)
   ```

3. **Utiliser le script de démarrage automatique :**
   ```powershell
   # À la racine du projet
   .\start-servers.ps1
   ```

### 🔴 Erreurs d'Assignation de Cours

**Symptôme :** Erreur lors de l'assignation d'un cours à un employé.

**Solutions :**

1. **Vérifier l'authentification :**
   - Connectez-vous avec un compte administrateur
   - Vérifiez que le token JWT n'a pas expiré

2. **Vérifier les données :**
   - Assurez-vous que le cours et l'employé existent
   - Vérifiez qu'il n'y a pas de doublon d'assignation

### 🔴 Erreurs de Connexion (401 Unauthorized)

**Symptôme :** "Session expirée" ou erreurs 401.

**Solutions :**

1. **Reconnecter :**
   - Déconnectez-vous et reconnectez-vous
   - Vérifiez vos identifiants

2. **Vérifier la configuration JWT :**
   ```bash
   # Dans le dossier BackEnd
   # Vérifiez que la clé JWT est configurée
   cat .env | grep JWT
   ```

### 🔴 Serveurs qui ne Démarrent Pas

**Solutions :**

1. **Vérifier les prérequis :**
   ```powershell
   # Vérifier PHP
   php -v
   
   # Vérifier Node.js
   node -v
   npm -v
   ```

2. **Installer les dépendances :**
   ```powershell
   # Backend
   cd BackEnd
   composer install
   
   # Frontend
   cd ../FrontEnd
   npm install
   ```

3. **Vérifier les ports :**
   ```powershell
   # Vérifier si les ports sont libres
   netstat -an | findstr ":8000"
   netstat -an | findstr ":3000"
   ```

### 🔴 Erreurs de Base de Données

**Solutions :**

1. **Exécuter les migrations :**
   ```bash
   cd BackEnd
   php bin/console doctrine:migrations:migrate
   ```

2. **Charger les données de test :**
   ```bash
   php bin/console doctrine:fixtures:load
   ```

## 🛠️ Outils de Diagnostic

### Statut du Serveur
L'interface web affiche un indicateur de statut en temps réel :
- 🟢 Vert : Serveur accessible
- 🟡 Jaune : Vérification en cours
- 🔴 Rouge : Serveur non accessible

### Console de Debug
Ouvrez les outils de développement (F12) pour voir les logs détaillés :
- Onglet "Console" pour les messages JavaScript
- Onglet "Network" pour voir les requêtes HTTP

### Test Manuel des API
```powershell
# Test de connectivité de base
curl http://localhost:8000/api

# Test avec authentification (remplacez YOUR_TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/admin/affectations
```

## 📞 Support

Si les problèmes persistent :

1. Vérifiez les logs dans les consoles des serveurs
2. Consultez la documentation technique
3. Redémarrez complètement les serveurs
4. Vérifiez les prérequis système

## 🚀 Démarrage Rapide

1. **Installation initiale :**
   ```powershell
   # Backend
   cd BackEnd
   composer install
   php bin/console doctrine:database:create
   php bin/console doctrine:migrations:migrate
   php bin/console doctrine:fixtures:load
   
   # Frontend
   cd ../FrontEnd
   npm install
   ```

2. **Démarrage quotidien :**
   ```powershell
   # À la racine du projet
   .\start-servers.ps1
   ```

3. **Accès :**
   - Frontend : http://localhost:3000
   - Backend API : http://localhost:8000/api

# Guide de Résolution - Erreur lors de la création de la ressource

## Problème
Message d'erreur : "Erreur lors de la création de la ressource"

## Solutions par ordre de priorité

### 1. 🔐 **Vérifier l'authentification** (CAUSE LA PLUS FRÉQUENTE)

**Symptômes :**
- Erreur 401 (Non autorisé)
- Message "Utilisateur non authentifié"

**Solution :**
1. Se connecter avec un compte administrateur :
   - Email : `admin@lms.com`
   - Mot de passe : `admin123`

2. Vérifier que le token est présent :
   - Ouvrir la console du navigateur (F12)
   - Vérifier `localStorage.getItem('token')`

### 2. 🖥️ **Vérifier que le serveur backend est démarré**

**Symptômes :**
- Erreur de connexion
- Impossible de contacter le serveur

**Solution :**
```bash
cd "c:\Users\Youcode\Videos\projet-lms\BackEnd\public"
php -S localhost:8000
```

### 3. 🔧 **Vérifier la configuration**

**Vérifications :**
- Backend accessible sur http://localhost:8000
- Frontend sur le bon port (généralement 3000)
- CORS configuré correctement

### 4. 📊 **Vérifier les données du formulaire**

**Vérifications :**
- URL valide (commence par http:// ou https://)
- Cours sélectionné
- Formulaire correctement rempli

## Tests de diagnostic

### Test 1: Authentification
```javascript
// Dans la console du navigateur
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### Test 2: API Backend
```bash
# Test de connexion admin
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.com","password":"admin123"}'
```

### Test 3: Création de ressource
```bash
# Avec le token obtenu
curl -X POST http://localhost:8000/api/admin/ressources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"contenu":"https://example.com/video.mp4","course_id":35}'
```

## Messages d'erreur courants

| Erreur | Cause | Solution |
|--------|-------|----------|
| 401 - Non autorisé | Pas connecté | Se connecter avec admin@lms.com |
| 403 - Accès refusé | Pas le bon rôle | Utiliser un compte admin |
| 400 - Données invalides | URL ou course_id incorrect | Vérifier les données |
| 500 - Erreur serveur | Problème backend | Vérifier les logs |
| Erreur de connexion | Serveur arrêté | Démarrer le serveur backend |

## Fichiers modifiés pour le débogage

1. **AddVideoResource.js** - Logs de débogage ajoutés
2. **RessourceAdminController.php** - Messages d'erreur améliorés
3. **Ressource.php** - Mapping corrigé

## Utilisation des composants de test

### AuthTest.js
Composant pour tester l'authentification rapidement.

### ResourceDiagnostic.js
Composant complet de diagnostic des ressources.

## Contact technique
En cas de problème persistant, vérifier :
1. Console du navigateur (F12)
2. Logs du serveur PHP
3. Base de données (utilisateur admin existe-t-il ?)

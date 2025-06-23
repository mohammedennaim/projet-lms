# Guide de Dépannage - Assignation des Cours

## Problème : "Erreur lors de l'assignation du cours"

### Étapes de Diagnostic

#### 1. Vérifier que le serveur backend est démarré
```bash
cd c:\Users\Youcode\Videos\projet-lms\BackEnd
php -S localhost:8000 -t public
```

**Signes que le serveur fonctionne :**
- Message : `PHP 8.2.x Development Server (http://localhost:8000) started`
- Pas de message d'erreur "Directory public does not exist"

#### 2. Vérifier la connectivité API
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api" -Method GET
```

**Réponses attendues :**
- ✅ Erreur 401 (Non autorisé) = Serveur fonctionne, authentification requise
- ❌ Erreur de connexion = Serveur non démarré
- ❌ Erreur 404 = Problème de configuration des routes

#### 3. Vérifier l'authentification
- Assurez-vous d'être connecté avec un compte administrateur
- Vérifiez que le token JWT est présent dans localStorage
- Si erreur 401, reconnectez-vous

#### 4. Vérifier les données d'entrée
- Cours sélectionné (ID valide)
- Au moins un employé sélectionné
- Date d'assignation valide (pas dans le passé)

### Messages d'Erreur Courants

| Message | Cause | Solution |
|---------|-------|----------|
| "Données de démonstration (serveur non accessible)" | Serveur backend arrêté | Démarrer le serveur backend |
| "Session expirée" | Token JWT expiré | Se reconnecter |
| "Permissions insuffisantes" | Pas de droits admin | Vérifier le rôle utilisateur |
| "Cours ou employé introuvable" | IDs invalides | Vérifier les données |
| "Employé déjà assigné" | Assignation existante | Choisir d'autres employés |

### Actions de Résolution

#### Résolution Rapide
1. **Redémarrer les serveurs :**
   ```bash
   # Backend
   cd c:\Users\Youcode\Videos\projet-lms\BackEnd
   php -S localhost:8000 -t public
   
   # Frontend (nouveau terminal)
   cd c:\Users\Youcode\Videos\projet-lms\FrontEnd
   npm start
   ```

2. **Se reconnecter :**
   - Aller à la page de connexion
   - Utiliser un compte administrateur
   - Vérifier que vous êtes bien sur la page d'assignation

3. **Vider le cache du navigateur :**
   - Ctrl + F5 pour actualiser
   - Ou vider localStorage : `localStorage.clear()`

#### Diagnostic Avancé
1. **Vérifier les logs du serveur :**
   - Regarder la console du terminal backend
   - Vérifier les erreurs PHP

2. **Vérifier la base de données :**
   ```bash
   cd c:\Users\Youcode\Videos\projet-lms\BackEnd
   php bin/console doctrine:schema:validate
   php bin/console doctrine:migrations:migrate
   ```

3. **Vérifier les logs frontend :**
   - Ouvrir les DevTools (F12)
   - Onglet Console pour voir les erreurs JavaScript
   - Onglet Network pour voir les requêtes API

### Configuration de Développement

#### Variables d'Environnement Backend
Vérifier le fichier `.env` :
```
DATABASE_URL="mysql://user:password@127.0.0.1:3306/lms_db"
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
```

#### Configuration Frontend
Vérifier `src/services/api.js` :
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### Tests de Validation

#### Test Complet d'Assignation
1. Se connecter en tant qu'admin
2. Aller sur la page d'assignation
3. Sélectionner un cours
4. Sélectionner un ou plusieurs employés
5. Définir une date (aujourd'hui ou future)
6. Cliquer sur "Assigner le cours"
7. Vérifier le message de succès
8. Vérifier que l'assignation apparaît dans la liste

#### Commandes de Test API
```bash
# Tester l'endpoint d'assignation (avec token valide)
curl -X POST http://localhost:8000/api/admin/affectations/bulk-assign-users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"courseId": 1, "userIds": [1, 2], "dateAssigned": "2025-06-23"}'
```

### Maintenance Préventive

1. **Démarrage Automatique :**
   - Créer des scripts batch pour démarrer les deux serveurs
   - Ajouter des raccourcis sur le bureau

2. **Surveillance :**
   - Vérifier régulièrement les logs
   - Monitorer l'espace disque et la mémoire

3. **Sauvegardes :**
   - Sauvegarder la base de données régulièrement
   - Versionner le code avec Git

---

**Note :** Ce guide couvre les problèmes les plus courants. Pour des erreurs spécifiques non couvertes, vérifiez les logs détaillés et contactez l'équipe de développement.

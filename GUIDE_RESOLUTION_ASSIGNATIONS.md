# Guide de Résolution des Problèmes d'Assignation des Cours

## Problèmes Communs et Solutions

### 1. "Erreur lors du chargement des assignations"

**Causes possibles :**
- Serveur backend non démarré
- Problème de connexion réseau
- Token d'authentification expiré
- Configuration CORS incorrecte

**Solutions :**

#### Étape 1: Vérifier le serveur backend
```bash
cd BackEnd
php -S localhost:8000 -t public
```

#### Étape 2: Vérifier l'authentification
- Assurez-vous d'être connecté avec un compte administrateur
- Vérifiez que le token JWT n'est pas expiré
- Déconnectez-vous et reconnectez-vous si nécessaire

#### Étape 3: Utiliser les outils de diagnostic
Dans l'interface d'assignation des cours :
1. Cliquez sur "🔍 Diagnostic Complet" pour identifier le problème
2. Utilisez "🔄 Actualiser les données" pour recharger
3. Si le serveur n'est pas accessible, utilisez "📝 Charger les données de test"

### 2. Données de démonstration affichées

Si vous voyez l'indicateur "Données de démonstration", cela signifie que l'API n'est pas accessible et que l'application utilise des données fictives.

**Solutions :**
1. Vérifiez que le serveur Symfony est démarré
2. Vérifiez l'URL de l'API dans `src/services/api.js`
3. Consultez la console du navigateur pour les erreurs détaillées

### 3. Erreur 401 (Non autorisé)

**Causes :**
- Token JWT expiré
- Utilisateur sans privilèges administrateur
- Headers d'authentification manquants

**Solutions :**
1. Déconnexion/reconnexion
2. Vérifier les rôles de l'utilisateur
3. Nettoyer le localStorage du navigateur

### 4. Erreur 403 (Accès refusé)

**Cause :** L'utilisateur n'a pas les permissions ROLE_ADMIN

**Solution :** Créer un utilisateur administrateur ou modifier les rôles

### 5. Erreur CORS

**Symptômes :** Erreurs dans la console mentionnant CORS

**Solution :** Configurer Nelmio CORS Bundle dans le backend :
```yaml
# config/packages/nelmio_cors.yaml
nelmio_cors:
    defaults:
        origin_regex: true
        allow_origin: ['%env(CORS_ALLOW_ORIGIN)%']
        allow_methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']
        allow_headers: ['Content-Type', 'Authorization']
        expose_headers: ['Link']
        max_age: 3600
```

## Diagnostic Avancé

### Console du Navigateur
Ouvrez les outils de développeur (F12) et consultez l'onglet Console pour :
- Erreurs JavaScript
- Erreurs d'API
- Messages de débogage détaillés

### Onglet Réseau
Vérifiez les requêtes HTTP dans l'onglet Réseau :
- Statut des requêtes (200, 401, 403, 404, 500...)
- Headers d'autorisation
- Réponses du serveur

### Logs Backend
Consultez les logs Symfony :
```bash
cd BackEnd
tail -f var/log/dev.log
```

## Structure des Données d'Assignation

Une assignation valide contient :
```json
{
  "id": 1,
  "dateAssigned": "2025-06-23",
  "assigneCours": true,
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "cours": {
    "id": 1,
    "title": "Cours de JavaScript",
    "description": "Formation complète"
  }
}
```

## Contacts de Support

En cas de problème persistant :
1. Vérifiez la documentation API
2. Consultez les logs d'erreur
3. Utilisez les outils de diagnostic intégrés
4. Contactez l'équipe de développement

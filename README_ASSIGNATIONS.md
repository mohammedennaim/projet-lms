# Système d'Assignation des Cours - Mode d'Emploi

## Vue d'ensemble

Le système d'assignation des cours permet aux administrateurs d'assigner des formations spécifiques aux employés. Il inclut une gestion robuste des erreurs et des outils de diagnostic intégrés.

## Fonctionnalités

### 🎯 Assignation des Cours
- Assignation individuelle ou en lot
- Sélection multiple d'employés
- Planification avec date d'assignation
- Suivi du statut des assignations

### 🔍 Outils de Diagnostic
- Test de connectivité API
- Vérification de l'authentification
- Diagnostic complet du système
- Mode de données de démonstration

### 📊 Gestion des Données
- Affichage des assignations existantes
- Modification et suppression d'assignations
- Export et import (à venir)

## Interface Utilisateur

### Page d'Assignation (`/assignments`)

#### Section Diagnostic
- **🔍 Diagnostic Complet** : Teste la connectivité, l'authentification et les endpoints
- **🔄 Actualiser les données** : Recharge toutes les données depuis l'API
- **📝 Charger les données de test** : Force l'utilisation de données de démonstration

#### Section Assignations Existantes
- Tableau avec employé, cours, date et statut
- Boutons d'action (Modifier, Supprimer)
- Indicateurs visuels pour le statut

#### Nouvelle Assignation
- Sélection du cours (liste déroulante)
- Sélection multiple d'employés (cases à cocher)
- Date d'assignation personnalisable
- Boutons de sélection/désélection globale

## États du Système

### 🟢 Fonctionnement Normal
- API accessible
- Données réelles affichées
- Toutes les fonctionnalités disponibles

### 🟡 Mode Dégradé (Données de Test)
- API non accessible
- Données de démonstration affichées
- Fonctionnalités limitées
- Indicateur visuel affiché

### 🔴 Erreur
- Problème de connexion ou d'authentification
- Messages d'erreur détaillés
- Boutons de diagnostic disponibles

## Messages de Statut

### Toasts de Notification
- **Succès (Vert)** : Action réalisée avec succès
- **Avertissement (Jaune)** : Mode dégradé ou données de test
- **Erreur (Rouge)** : Problème nécessitant une action

### Indicateurs Visuels
- 🟢 Assigné : L'employé a accès au cours
- 🟡 En attente : Assignation créée mais non finalisée
- 📊 Données de démonstration : Mode de test actif

## Workflow d'Assignation

1. **Préparation**
   - Vérifier la connectivité (Diagnostic Complet)
   - S'assurer d'être connecté en tant qu'administrateur

2. **Sélection**
   - Choisir le cours à assigner
   - Sélectionner un ou plusieurs employés
   - Définir la date d'assignation (optionnel)

3. **Validation**
   - Cliquer sur "Assigner"
   - Attendre la confirmation
   - Vérifier dans la liste des assignations existantes

4. **Suivi**
   - Monitoring des statuts d'assignation
   - Modification si nécessaire
   - Export des rapports (à venir)

## Résolution des Problèmes

### Problème : "Erreur lors du chargement des assignations"

**Solution rapide :**
1. Cliquer sur "🔍 Diagnostic Complet"
2. Suivre les recommandations affichées
3. Utiliser "📝 Charger les données de test" si nécessaire

**Solution détaillée :**
Consulter le [Guide de Résolution](./GUIDE_RESOLUTION_ASSIGNATIONS.md)

### Problème : Données de démonstration affichées

**Cause :** API backend non accessible

**Solutions :**
1. Démarrer le serveur Symfony : `php -S localhost:8000 -t public`
2. Vérifier la configuration dans `src/services/api.js`
3. Consulter les logs d'erreur

### Problème : Erreur 401/403

**Cause :** Problème d'authentification ou de permissions

**Solutions :**
1. Se déconnecter et se reconnecter
2. Vérifier les rôles utilisateur (ROLE_ADMIN requis)
3. Nettoyer le cache du navigateur

## API Endpoints Utilisés

- `GET /api/admin/affectations` - Liste des assignations
- `POST /api/admin/affectations` - Créer une assignation
- `POST /api/admin/affectations/bulk-assign-users` - Assignation en lot
- `DELETE /api/admin/affectations/{id}` - Supprimer une assignation
- `GET /api/admin/affectations/course/{id}` - Assignations par cours
- `GET /api/admin/affectations/user/{id}` - Assignations par utilisateur

## Données de Test Disponibles

Le système inclut des données de démonstration pour les tests :
- 5 assignations exemple
- 3 cours de formation
- 3 employés fictifs
- Différents statuts d'assignation

Ces données permettent de tester l'interface même sans connexion backend.

## Support et Maintenance

### Logs de Débogage
- Console du navigateur (F12)
- Messages détaillés pour chaque opération
- Codes d'erreur explicites

### Monitoring
- Tests de connectivité automatiques
- Fallback vers les données de test
- Indicateurs de santé du système

### Mise à Jour
- Version des données mock dans `utils/errorUtils.js`
- Configuration API dans `services/api.js`
- Interface utilisateur dans `components/CourseAssignment.js`

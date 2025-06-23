# Guide - Affichage des Ressources

## 🎯 Objectif
Afficher toutes les ressources pédagogiques disponibles dans le système LMS.

## ✅ Vérifications avant utilisation

### 1. **Serveur Backend démarré**
```bash
cd "c:\Users\Youcode\Videos\projet-lms\BackEnd\public"
php -S localhost:8000
```

### 2. **Authentification requise**
- Se connecter avec : `admin@lms.com` / `admin123`
- Ou un compte avec les permissions appropriées

## 📋 Composants disponibles pour afficher les ressources

### 1. **RessourcesListDisplay** (Complet)
- Affichage en grille moderne
- Recherche et filtrage
- Pagination
- Actions (modifier/supprimer)
- Navigation complète

### 2. **SimpleResourceDisplay** (Simple)
- Liste simple et claire
- Diagnostic intégré
- Parfait pour tester

### 3. **RessourcesList** (Original - À corriger)
- Composant original avec problèmes de syntaxe
- Nécessite des corrections

## 🚀 Utilisation recommandée

### Option 1: Composant complet
```javascript
import RessourcesListDisplay from './components/RessourcesListDisplay';

// Dans votre page/composant
<RessourcesListDisplay />
```

### Option 2: Composant simple pour test
```javascript
import SimpleResourceDisplay from './components/SimpleResourceDisplay';

// Pour tester rapidement
<SimpleResourceDisplay />
```

## 📊 Données affichées

Pour chaque ressource :
- **ID unique** de la ressource
- **Contenu** (texte ou URL)
- **Cours associé** avec titre
- **Type** (lien externe ou contenu texte)
- **Date de création**
- **Actions** (modifier/supprimer)

## 🔍 Fonctionnalités

### Recherche
- Recherche par titre de cours
- Recherche par contenu
- Filtrage en temps réel

### Navigation
- Pagination (10 ressources par page)
- Navigation précédent/suivant
- Compteur de résultats

### Actions
- **Voir** : Ouvrir les liens externes
- **Modifier** : Redirection vers `/ressources/{id}/edit`
- **Supprimer** : Suppression avec confirmation

## 🎨 Interface

### État vide
- Message informatif
- Bouton pour ajouter une ressource
- Icônes visuelles

### État de chargement
- Spinner animé
- Message de chargement

### État d'erreur
- Messages d'erreur clairs
- Codes couleur (rouge/jaune/vert)
- Instructions de résolution

## 📱 Responsive Design

- **Mobile** : Affichage en colonne simple
- **Tablette** : Grille 2 colonnes
- **Desktop** : Grille 3 colonnes
- Navigation adaptative

## 🔧 Configuration

### Variables d'environnement
```env
REACT_APP_API_URL=http://localhost:8000
```

### URLs API utilisées
- `GET /api/admin/ressources` : Liste des ressources
- `DELETE /api/admin/ressources/{id}` : Supprimer une ressource

## 🐛 Dépannage

### Problème : Ressources non affichées
1. Vérifier l'authentification
2. Vérifier la console (F12)
3. Vérifier que le serveur backend fonctionne
4. Tester l'API directement

### Problème : Erreur de permissions
- S'assurer d'être connecté en tant qu'admin
- Vérifier le token JWT dans localStorage

### Problème : Données de test affichées
- Indication que le serveur n'est pas accessible
- Les fonctionnalités de base restent utilisables

## 📈 Données actuellement disponibles

Le système contient actuellement **25+ ressources** réparties sur 5 cours :
- Introduction à la programmation
- Développement web avec PHP  
- Bases de données relationnelles
- Gestion de projet agile
- Sécurité informatique

## 🎯 Prochaines étapes

1. Utiliser `RessourcesListDisplay` pour un affichage complet
2. Tester avec `SimpleResourceDisplay` si nécessaire
3. Corriger `RessourcesList` original si souhaité
4. Ajouter des filtres par cours
5. Implémenter l'édition en ligne

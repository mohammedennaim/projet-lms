# Test du Workflow de Création de Cours

## Étapes à suivre pour tester le workflow :

### 1. Accès au workflow
- Se connecter en tant qu'administrateur
- Aller sur la page "Gestion des Cours" 
- Cliquer sur le bouton "Créer avec Assistant"
- **Vérifier** : L'URL doit être `/workflow/course`

### 2. Création du cours (Étape 1)
- Remplir le formulaire de création de cours :
  - Titre du cours
  - Description
  - Image (optionnel)
  - URL vidéo (optionnel)
- Cliquer sur "Créer le cours"
- **Vérifier** : Redirection automatique vers `/workflow/resource/{courseId}`

### 3. Ajout de ressources (Étape 2)  
- Ajouter une ou plusieurs ressources vidéo
- Utiliser le bouton "Continuer vers la création de quiz"
- **Vérifier** : Redirection automatique vers `/workflow/quiz/{courseId}`

### 4. Création du quiz (Étape 3)
- Remplir le formulaire de création de quiz :
  - Titre du quiz
  - Description
- Soumettre le formulaire
- **Vérifier** : Redirection automatique vers `/workflow/question/{quizId}`

### 5. Ajout de questions (Étape 4)
- Ajouter des questions avec leurs réponses
- Marquer les bonnes réponses
- Utiliser le bouton "Terminer la création"
- **Vérifier** : Redirection vers la page de détails du cours

## Corrections apportées :

1. **Correction des imports de services** : Changement de `import { service }` vers `import service`
2. **Ajout des routes workflow dans le RoleGuard** : `/workflow` ajouté aux routes autorisées pour les admins
3. **Amélioration des logs de débogage** : Ajout de console.log pour tracer les transitions
4. **Sauvegarde du titre du cours** : Pour affichage dans les étapes suivantes

## Structure du workflow :

```
CourseManagement 
    ↓ (click "Créer avec Assistant")
CourseCreationWorkflow (/workflow/course)
    ↓ (après création cours)
AddVideoResource (/workflow/resource/{courseId})
    ↓ (après ajout ressources)
QuizForm (/workflow/quiz/{courseId})
    ↓ (après création quiz)
QuestionForm (/workflow/question/{quizId})
    ↓ (après ajout questions)
CourseDetailsPage (/courses/{courseId})
```

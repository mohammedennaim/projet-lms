<?php

namespace App\DataFixtures;

use App\Entity\Question;
use App\Entity\Reponse;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory as FakerFactory;

class ReponseFixtures extends Fixture implements DependentFixtureInterface
{    public function load(ObjectManager $manager): void
    {
        // Réponses prédéfinies pour chaque question
        $answerTemplates = [
            // Réponses pour questions de programmation (Quiz 0)
            [
                ['Un espace de stockage nommé pour les données', 'Un type de fonction', 'Un opérateur logique', 'Une boucle conditionnelle'],
                ['For a un nombre d\'itérations connu, while dépend d\'une condition', 'Aucune différence', 'While est plus rapide', 'For est obsolète'],
                ['function nomFonction() { }', 'def nomFonction() { }', 'func nomFonction() { }', 'method nomFonction() { }'],
                ['Cacher les détails internes d\'un objet', 'Créer plusieurs objets', 'Supprimer des données', 'Optimiser le code'],
                ['Expliquer le code aux développeurs', 'Ralentir l\'exécution', 'Créer des bugs', 'Compliquer le code']
            ],
            // Réponses pour développement web (Quiz 1)
            [
                ['GET récupère des données, POST envoie des données', 'Aucune différence', 'POST est plus rapide', 'GET est sécurisé'],
                ['Document Object Model - représentation de la page web', 'Un langage de programmation', 'Un serveur web', 'Une base de données'],
                ['Utiliser des requêtes préparées', 'Éviter les bases de données', 'Utiliser uniquement GET', 'Désactiver PHP'],
                ['Un ensemble d\'outils pour développer', 'Un langage de programmation', 'Un serveur web', 'Une base de données'],
                ['Adapter l\'affichage à tous les appareils', 'Accélérer le site', 'Réduire le code', 'Améliorer le SEO']
            ],
            // Réponses pour bases de données (Quiz 2)
            [
                ['Un identifiant unique pour chaque ligne', 'Une colonne facultative', 'Un type de données', 'Une contrainte optionnelle'],
                ['INNER JOIN retourne les correspondances, LEFT JOIN toutes les lignes de gauche', 'Aucune différence', 'LEFT JOIN est plus rapide', 'INNER JOIN inclut les NULL'],
                ['Utiliser des index et optimiser les requêtes', 'Augmenter la RAM', 'Utiliser plus de tables', 'Éviter les JOIN'],
                ['Organiser les données pour éviter la redondance', 'Accélérer les requêtes', 'Sauvegarder les données', 'Chiffrer les données'],
                ['Accélérer les recherches dans les tables', 'Sauvegarder les données', 'Chiffrer les colonnes', 'Valider les données']
            ],
            // Réponses pour gestion de projet (Quiz 3)
            [
                ['Collaboration, adaptation, livraison fréquente', 'Planification rigide', 'Documentation exhaustive', 'Processus longs'],
                ['Une période de développement courte et définie', 'Une réunion longue', 'Un type de test', 'Une documentation'],
                ['Identifier, évaluer et mitiger les risques', 'Les ignorer', 'Les éviter complètement', 'Les reporter'],
                ['Assurer la coordination et la compréhension', 'Ralentir le projet', 'Augmenter les coûts', 'Créer des conflits'],
                ['Atteinte des objectifs dans les délais et budget', 'Nombre de réunions', 'Quantité de code', 'Nombre d\'employés']
            ],
            // Réponses pour sécurité (Quiz 4)
            [
                ['Même clé pour chiffrer et déchiffrer', 'Clés différentes', 'Pas de clé', 'Plusieurs clés'],
                ['Limiter les tentatives et utiliser des mots de passe forts', 'Utiliser des mots de passe simples', 'Désactiver l\'authentification', 'Ignorer les tentatives'],
                ['Un document numérique qui authentifie l\'identité', 'Un mot de passe', 'Un fichier de sauvegarde', 'Un script de sécurité'],
                ['Corriger les vulnérabilités connues', 'Améliorer les performances', 'Ajouter des fonctionnalités', 'Réduire la taille'],
                ['Ajouter une couche de sécurité supplémentaire', 'Compliquer la connexion', 'Ralentir l\'authentification', 'Augmenter les coûts']
            ]
        ];

        $correctAnswers = [0, 0, 0, 0, 0]; // Index de la bonne réponse pour chaque question

        $reponseCounter = 0;
        
        for ($quizIndex = 0; $quizIndex < 5; $quizIndex++) {
            for ($questionIndex = 0; $questionIndex < 5; $questionIndex++) {
                $question = $this->getReference(QuestionFixtures::QUESTION_REFERENCE . ($quizIndex * 5 + $questionIndex), Question::class);
                
                // Créer 4 réponses par question
                for ($answerIndex = 0; $answerIndex < 4; $answerIndex++) {
                    $reponse = new Reponse();
                    $reponse->setContent($answerTemplates[$quizIndex][$questionIndex][$answerIndex]);
                    $reponse->setIsCorrect($answerIndex === $correctAnswers[$questionIndex]);
                    $reponse->setQuestion($question);
                    
                    $manager->persist($reponse);
                    $reponseCounter++;
                }
            }
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            QuestionFixtures::class,
        ];
    }
}

# PLANIGO 🍳: Organisez, cuisinez, économisez!

Vous cherchez à simplifier la planification de vos repas ? Découvrez PLANIGO, une application conçue pour vous aider à organiser vos repas de la semaine efficacement.
Accédez à une large sélection de recettes ou ajoutez les vôtres, puis créez facilement votre menu hebdomadaire.
PLANIGO calcule automatiquement votre liste de courses, en tenant compte des ingrédients nécessaires et de ceux que vous avez déjà, ce qui vous permet d'économiser du temps et de réduire le gaspillage.
En résumé, PLANIGO est un outil pratique pour mieux gérer vos repas, gagner du temps et faire des économies. Simplifiez-vous la vie avec PLANIGO !

---

## Contributions

Ce projet a été développé par l'équipe C:

*   Yasmine Beddouch
*   Simon Bégin
*   Yanis Chabane
*   Jonathan Chartier
*   Myriam Kechad

---

## Aperçu du Projet

PLANIGO est une application duale (Web et Mobile) conçue pour optimiser la planification de repas, réduire le gaspillage alimentaire et gérer les dépenses culinaires. Elle s'adresse aux individus et aux familles. Ce dépôt contient le code source de l'application **Web** et du **Backend API**.

Fonctionnalités clés :

*   **Gestion des recettes:** Ajouter, modifier, supprimer, rechercher et consulter des recettes (personnelles et communautaires). Inclut la gestion des images associées aux recettes.
*   **Planification hebdomadaire:** Créer, modifier et supprimer des plans de repas pour la semaine.
*   **Suivi du stock personnel:** Gérer un inventaire des ingrédients disponibles à la maison.
*   **Liste de courses intelligente:** Générer automatiquement une liste d'achats basée sur le plan de repas et le stock personnel.
*   **Consultation des promotions:** Accès aux circulaires des épiceries partenaires (Note: Cette fonctionnalité a été initiée mais n'est pas entièrement déployée dans la version finale).
*   **Fonctionnalités communautaires:** Suivre d'autres utilisateurs, commenter, aimer et noter les recettes (via un système d'étoiles).
*   **Organisation:** Créer des listes personnalisées de plans de repas.
*   **Gestion de profil:** Permet aux utilisateurs authentifiés de gérer leurs informations.
*   **Sécurité:** Inscription, Connexion, Déconnexion, restriction d'accès aux utilisateurs non connectés.

---

## Installation

Pour installer et exécuter PLANIGO, suivez les étapes ci-dessous pour les applications Web et Mobile.

### Application Web

1.  **Cloner le dépôt:**
    ```bash
    git clone [https://github.com/yan32323/H2025_TCH099_02_C1.git]
    ```
2.  **Configuration de la base de données (via phpMyAdmin):**
    *   Ouvrez phpMyAdmin dans votre navigateur (généralement `http://localhost/phpmyadmin/`).
    *   Connectez-vous avec votre utilisateur et mot de passe MySQL.
    *   Cliquez sur l'onglet "Databases" (Bases de données) et créez une nouvelle base de données nommée `planigo_database`.
    *   Dans la liste des bases de données à gauche, cliquez sur `planigo_database` pour la sélectionner.
    *   Cliquez sur l'onglet "Import" (Importer).
    *   Cliquez sur le bouton "Choose File" (Choisir un fichier) et sélectionnez le fichier `databasePlanigo.sql` qui se trouve dans le répertoire `database/` du dépôt que vous avez cloné.
    *   Laissez les options par défaut telles quelles.
    *   Cliquez sur le bouton "Go" (Exécuter) ou "Import" (Importer) en bas de la page pour exécuter le script SQL et créer les tables.
3.  **Déploiement sur serveur Web:**
    *   Copiez le contenu du répertoire `web/` dans le répertoire racine de votre serveur Web (ex: `htdocs` ou `www` si vous utilisez XAMPP/WAMP, ou le répertoire configuré par votre serveur Web).
4.  **Configuration de la connexion à la base de données:**
    *   Ouvrez le fichier `web/includes/config.php` (le chemin exact peut varier en fonction de votre structure) dans un éditeur de texte.
    *   Modifiez les valeurs des variables de connexion à la base de données pour qu'elles correspondent à votre configuration MySQL (hôte, nom de la base de données (`planigo_database`), nom d'utilisateur, mot de passe).
5.  **Accès à l'application:**
    *   Ouvrez votre navigateur Web et accédez à l'URL où l'application est déployée (ex: `http://localhost/` si vous avez copié les fichiers à la racine du serveur, ou `http://localhost/nom_du_dossier/` si vous les avez placés dans un sous-répertoire).
---

## Technologies

*   **Backend (API & Web):** PHP, MySQL
*   **Frontend (Web):** HTML, CSS, JavaScript
*   **Mobile:** Java (Android Studio), XML (Layouts)
*   **Modélisation:** UML (Diagrammes de Classe, Séquence), PlantUML
*   **Design/Prototypage:** Figma
*   **Outils:** GitHub, OCR, AI Studio (pour exploration)

---

## Sprints de Développement

Le projet a suivi une méthodologie Scrum, structurée en 4 sprints principaux pour construire l'application de manière itérative :

*   **Sprint 1 (01/03 - 14/03/2025):** Mise en place de l'environnement de développement, base de données initiale, implémentation des fonctionnalités d'authentification (Inscription, Connexion, Déconnexion) et de gestion de recettes (Ajout, Modification, Suppression) pour l'application Web. Création des premiers wireframes.
*   **Sprint 2 (15/03 - 28/03/2025):** Ajout des fonctionnalités de recherche et consultation de recettes, gestion des plans de repas (Création, Modification, Suppression), gestion du stock d'ingrédients (Web). Début du développement mobile avec l'implémentation de l'authentification et la structuration des interfaces. Développement de l'architecture API.
*   **Sprint 3 (29/03 - 11/04/2025):** Poursuite du développement mobile pour aligner les fonctionnalités avec la version Web (consultation de contenu, gestion du stock, liste de courses mobile). Intégration partielle de la consultation des promotions. Améliorations de navigation et de l'intégration des données dynamiques.
*   **Sprint 4 (12/04 - 25/04/2025):** Intégration des fonctionnalités sociales (Commentaires, Likes, Notation, Suivi d'utilisateurs). Outils d'organisation (Création de listes de plans de repas). Implémentation de la génération de liste de courses sur le Web et restriction d'accès pour les utilisateurs non connectés. Finalisation de l'intégration Web/Mobile et aspects de sécurité essentiels.

---

## Diagrammes

Consultez les diagrammes pour une meilleure compréhension de la structure et des interactions du système:

*   **Diagramme des Cas d'Utilisation:**
    ![Diagramme des Cas d'Utilisation](https://github.com/user-attachments/assets/0d341761-e468-4c91-9da3-20ca307ce53b)

*   **Diagramme d'Architecture:**
    ![Diagramme d'Architecture](https://github.com/user-attachments/assets/0dae0432-fd48-4c76-9439-2377550d5c2f)

*   **Diagramme de Classe:**
    ![image](https://github.com/user-attachments/assets/8eb4ed8d-d6ec-488a-81ff-e82881eb03a9)

*   **Diagrammes de Séquences (Résumé):** Détaille les interactions pour les cas d'utilisation clés. 
    ![image](https://github.com/user-attachments/assets/02a8799e-df6e-4cc4-aa56-687f3b5fffe2)

# PLANIGO 🍳: Votre Compagnon de Planification de Repas

Vous cherchez à simplifier la planification de vos repas ? Découvrez PLANIGO, une application conçue pour vous aider à organiser vos repas de la semaine efficacement. 
Accédez à une large sélection de recettes ou ajoutez les vôtres, puis créez facilement votre menu hebdomadaire. 
PLANIGO calcule automatiquement votre liste de courses, en tenant compte des ingrédients nécessaires et de ceux que vous avez déjà, ce qui vous permet d'économiser du temps et de réduire le gaspillage. 
En résumé, PLANIGO est un outil pratique pour mieux gérer vos repas, gagner du temps et faire des économies. Simplifiez-vous la vie avec PLANIGO !
## Contributions

Yasmine Beddouch

Simon Bégin

Jonathan Chartier

Myriam Kechad

---


## Aperçu du Projet

PLANIGO offre une solution complète pour gérer vos repas de la semaine.  Les utilisateurs peuvent:

* **Explorer des recettes:** Rechercher des recettes par ingrédients, nom, ou type.  Accéder à des informations détaillées sur chaque recette, y compris les ingrédients, les instructions, les valeurs nutritionnelles et les commentaires d'autres utilisateurs.
* **Créer des plans de repas:**  Planifier les repas de la semaine en sélectionnant des recettes et en générant automatiquement une liste de courses optimisée.
* **Gérer les ingrédients:**  Créer un inventaire des ingrédients disponibles et suivre les promotions pour économiser de l'argent.
* **Interagir avec la communauté:**  Partager des recettes, laisser des commentaires et découvrir les créations d'autres utilisateurs (fonctionnalité à venir).


## Structure du Projet
```
├── README.md 
├── database/ <-- Schéma de la base de données (SQL)
│ └── planigo.sql
├── api/ <-- Code API partagé 
├── web/ <-- Code de l'application web
│ ├── index.php 
│ ├── js/ <-- Code JavaScript
│ │ └── scripts.js 
│ └── css/ <-- Styles CSS
│ └── style.css   
└── mobile/ <-- Code de l'application mobile
├── AndroidManifest.xml
├── java/ <-- Code Java
│ └── ... 
└── res/ <-- Ressources
```
## Installation

**Web:**

1. Cloner le dépôt: `git clone https://github.com/Yasmtidk/H2025_TCH099_02_C1.git`
2. Créer une base de données MySQL nommée `planigo`.
3. Importer le schéma SQL: `database/planigo.sql` dans votre base de données.
4. Copier le contenu du répertoire `web/` dans la racine de votre serveur web.
5. Configurer la connexion à la base de données dans `web/includes/config.php`.
6. Accéder à l'application via votre navigateur:  `http://localhost/planigo` (ou l'URL appropriée).

**Mobile:**

1. Cloner le dépôt: `git clone https://github.com/Yasmtidk/H2025_TCH099_02_C1.git`
2. Ouvrir le projet `mobile/` dans Android Studio.
3. Configurer la connexion à la base de données dans le fichier approprié de l'application mobile.
4. Compiler et exécuter l'application sur un émulateur ou un appareil Android.


## Technologies

* **Backend (API et Web):** PHP, MySQL
* **Frontend (Web):** HTML, CSS, JavaScript
* **Mobile:** Java (Android Studio)

## Cas d'Utilisation (Sprints)

**Sprint 1:** Inscription, Connexion, Déconnexion, Ajout de recettes, Suppression de recettes, Modification de recettes.

**Sprint 2:** Recherche de recettes, Création de plans de repas, Modification/Suppression de plans de repas, Consultation des promotions, Gestion des ingrédients, Création de listes de courses.

**Sprint 3:** Recherche de recettes (améliorations?), Sauvegarde de recettes d'autres utilisateurs, Navigation (retour en arrière), Page de profil, Consultation des recettes sauvegardées, Affichage détaillé des recettes (popup).

**Sprint 4:**  (Fonctionnalités additionnelles ou améliorations des sprints précédents).

## Diagramme de cas d'utilisation
![image](https://github.com/user-attachments/assets/0d341761-e468-4c91-9da3-20ca307ce53b)

## Diagramme d'Architecture
![image](https://github.com/user-attachments/assets/0dae0432-fd48-4c76-9439-2377550d5c2f)

## Licence
Ce projet est sous licence [MIT License](LICENSE).


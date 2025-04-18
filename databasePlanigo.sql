CREATE TABLE Clients (
    nom_utilisateur VARCHAR(255) NOT NULL PRIMARY KEY,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE Recettes (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('Déjeuner', 'Dîner', 'Souper', 'Collation', 'Apéritif', 'Entrée', 'Plat principal', 'Dessert') NOT NULL,
    difficulter ENUM('facile', 'moyen', 'difficile') NOT NULL,
    temps_de_cuisson INT NOT NULL,
    image MEDIUMBLOB,
    portions INT NOT NULL DEFAULT 1,
    createur_nom_utilisateur VARCHAR(255) NOT NULL,
    FOREIGN KEY (createur_nom_utilisateur) REFERENCES Clients (nom_utilisateur)
);

CREATE TABLE Ingredients (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    unite_de_mesure VARCHAR(255) NOT NULL,
    nom VARCHAR(255) NOT NULL
);

CREATE TABLE Restrictions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE Recettes_Restrictions (
    recette_id INT NOT NULL,
    restriction_id INT NOT NULL,
    FOREIGN KEY (recette_id) REFERENCES Recettes (id) ON DELETE CASCADE,
    FOREIGN KEY (restriction_id) REFERENCES Restrictions (id) ON DELETE CASCADE
);

CREATE TABLE Recettes_Ingredients (
    recette_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantite DECIMAL(10,2) NOT NULL,
    unite_de_mesure VARCHAR(255) NULL,
    PRIMARY KEY (recette_id, ingredient_id),
    FOREIGN KEY (recette_id) REFERENCES Recettes (id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients (id)
);

CREATE TABLE Recettes_Etapes (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    recette_id INT NOT NULL,
    numero_etape INT NOT NULL,
    texte TEXT NOT NULL,
    FOREIGN KEY (recette_id) REFERENCES Recettes(id) ON DELETE CASCADE
);

CREATE TABLE Plan_de_repas (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    nom_utilisateur VARCHAR(255) NOT NULL,
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients (nom_utilisateur)
);

CREATE TABLE Repas_Planifies (
    plan_id INT NOT NULL,
    recette_id INT NOT NULL,
    PRIMARY KEY (plan_id, recette_id),
    FOREIGN KEY (plan_id) REFERENCES Plan_de_repas (id) ON DELETE CASCADE,
    FOREIGN KEY (recette_id) REFERENCES Recettes (id) ON DELETE CASCADE
);

CREATE TABLE Liste_de_courses (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantite DECIMAL(10,2) NOT NULL,
    achete TINYINT(1) NOT NULL,
    FOREIGN KEY (plan_id) REFERENCES Plan_de_repas (id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients (id) ON DELETE CASCADE
);

CREATE TABLE Promotions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nom_enseigne VARCHAR(255) NOT NULL,
    url_promotion VARCHAR(255) NOT NULL
);

CREATE TABLE Stock_Ingredients (
    nom_utilisateur VARCHAR(255) NOT NULL,
    ingredient_id INT NOT NULL,
    quantite_disponible DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (nom_utilisateur, ingredient_id),
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients (nom_utilisateur),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients (id)
);

CREATE TABLE Recettes_Sauvegardees (
    nom_utilisateur VARCHAR(255) NOT NULL,
    recette_id INT NOT NULL,
    PRIMARY KEY (nom_utilisateur, recette_id),
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients (nom_utilisateur),
    FOREIGN KEY (recette_id) REFERENCES Recettes (id)
);

CREATE TABLE Commentaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recette_id INT NOT NULL,
    nom_utilisateur VARCHAR(255) NOT NULL,
    texte TEXT NOT NULL,
    date_commentaire DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nb_likes INT DEFAULT 0 NOT NULL,
    CONSTRAINT fk_commentaire_recette FOREIGN KEY (recette_id)
        REFERENCES Recettes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_commentaire_utilisateur FOREIGN KEY (nom_utilisateur)
        REFERENCES Clients(nom_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Likes_Commentaires (
    commentaire_id INT NOT NULL,
    nom_utilisateur VARCHAR(255) NOT NULL,
    PRIMARY KEY (commentaire_id, nom_utilisateur),
    FOREIGN KEY (commentaire_id) REFERENCES Commentaires(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients(nom_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Recettes_Notes (
    nom_utilisateur VARCHAR(255) NOT NULL,
    recette_id INT NOT NULL,
    note INT DEFAULT 5 NOT NULL,
    PRIMARY KEY (nom_utilisateur, recette_id),
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients (nom_utilisateur),
    FOREIGN KEY (recette_id) REFERENCES Recettes (id)
);

CREATE TABLE Utilisateurs_suivi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_utilisateur VARCHAR(255) NOT NULL,
    user_suivi_id VARCHAR(255),
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients (nom_utilisateur),
    FOREIGN KEY (user_suivi_id) REFERENCES Clients (nom_utilisateur)
);

-- Insertion des données dans les tables

INSERT INTO Clients (nom_utilisateur, mot_de_passe, prenom, nom, description)
VALUES
    ('john_doe', 'password123', 'John', 'Doe', 'Passionné de cuisine et de voyages'),
    ('jane_doe', 'mypassword', 'Jane', 'Doe', 'Amatrice de cuisine italienne'),
    ('alice_smith', 'alicepassword', 'Alice', 'Smith', 'Cuisinière végétarienne et expérimentée');

INSERT INTO Recettes (nom, description, type, difficulter, temps_de_cuisson, image, portions, createur_nom_utilisateur)
VALUES
    ('Salade César', 'Une salade avec du poulet, de la laitue et de la sauce César', 'Dîner', 'facile', 15, NULL, 2, 'john_doe'),
    ('Spaghetti Bolognese', 'Des pâtes avec une sauce bolognaise savoureuse', 'Plat principal', 'moyen', 30, NULL, 4, 'jane_doe'),
    ('Soupe à l\'oignon', 'Une soupe chaude avec des oignons caramélisés', 'Entrée', 'facile', 45, NULL, 2, 'alice_smith');

INSERT INTO Ingredients (unite_de_mesure, nom)
VALUES
    ('g', 'Poulet'),
    ('g', 'Laitue Romaine'),
    ('ml', 'Sauce César'),
    ('g', 'Fromage Parmesan'),
    ('g', 'Croutons'),
    ('g', 'Pâtes'),
    ('ml', 'Sauce tomate'),
    ('g', 'Viande hachée'),
    ('g', 'Oignon'),
    ('g', 'Ail'),
    ('g', 'Pain'),
    ('g', 'Beurre'),
    ('g', 'Fromage Gruyère'),
    ('ml', 'Bouillon de boeuf');

INSERT INTO Recettes_Ingredients (recette_id, ingredient_id, quantite)
VALUES
    (1, 1, 200),
    (1, 2, 150),
    (1, 3, 100),
    (1, 4, 50),
    (1, 5, 75),
    (2, 6, 250),
    (2, 7, 300),
    (2, 8, 400),
    (2, 9, 150),
    (2, 10, 25),
    (3, 9, 500),
    (3, 11, 200),
    (3, 12, 50),
    (3, 13, 100),
    (3, 14, 750);

INSERT INTO Recettes_Etapes (recette_id, numero_etape, texte)
VALUES
    (1, 1, 'Laver la laitue et la couper grossièrement.'),
    (1, 2, 'Faire griller les morceaux de poulet jusqu’à ce qu’ils soient dorés.'),
    (1, 3, 'Préparer la sauce César.'),
    (1, 4, 'Assembler la salade avec le poulet, la laitue, la sauce et du fromage râpé.'),
    (2, 1, 'Faire revenir l’oignon haché dans une poêle.'),
    (2, 2, 'Ajouter la viande hachée et faire cuire jusqu’à ce qu’elle soit bien dorée.'),
    (2, 3, 'Verser la sauce tomate et laisser mijoter pendant 20 minutes.'),
    (2, 4, 'Cuire les pâtes selon les instructions.'),
    (2, 5, 'Mélanger les pâtes avec la sauce et servir chaud.'),
    (3, 1, 'Éplucher et couper les oignons en fines lamelles.'),
    (3, 2, 'Faire caraméliser les oignons dans une casserole avec un peu d’huile.'),
    (3, 3, 'Ajouter de l’eau ou du bouillon et laisser mijoter 30 minutes.'),
    (3, 4, 'Faire griller des tranches de pain avec du fromage râpé.'),
    (3, 5, 'Servir la soupe chaude avec les tranches de pain gratiné.');

INSERT INTO Plan_de_repas (date, nom_utilisateur)
VALUES
    ('2025-03-26', 'john_doe'),
    ('2025-03-27', 'jane_doe'),
    ('2025-03-28', 'alice_smith');

INSERT INTO Repas_Planifies (plan_id, recette_id)
VALUES
    (1, 1),
    (2, 2),
    (3, 3);

INSERT INTO Promotions (nom_enseigne, url_promotion)
VALUES
    ('Métro', 'https://www.metro.ca/circulaire'),
    ('Maxi', 'https://www.maxi.ca/fr/print-flyer');

INSERT INTO Stock_Ingredients (nom_utilisateur, ingredient_id, quantite_disponible)
VALUES
    ('john_doe', 1, 300),
    ('john_doe', 4, 100),
    ('jane_doe', 6, 500),
    ('jane_doe', 7, 200),
    ('alice_smith', 5, 300);

INSERT INTO Liste_de_courses (plan_id, ingredient_id, quantite, achete)
VALUES
    (1, 1, 0, 0),
    (1, 2, 150, 0),
    (1, 3, 100, 0),
    (1, 4, 0, 0),
    (1, 5, 75, 0),
    (2, 6, 0, 0),
    (2, 7, 100, 0),
    (2, 8, 400, 0),
    (2, 9, 150, 0),
    (2, 10, 25, 0),
    (3, 9, 250, 0),
    (3, 11, 200, 0),
    (3, 12, 50, 0),
    (3, 13, 100, 0),
    (3, 14, 750, 0);

INSERT INTO Recettes_Sauvegardees (nom_utilisateur, recette_id)
VALUES
    ('john_doe', 1),
    ('jane_doe', 2),
    ('alice_smith', 3);

INSERT INTO Commentaires (recette_id, nom_utilisateur, texte, date_commentaire)
VALUES
    (1, 'john_doe', 'Excellente recette!', '2025-03-25 10:00:00'),
    (2, 'jane_doe', 'Vraiment savoureux, à refaire.', '2025-03-25 10:30:00'),
    (3, 'alice_smith', 'Très réconfortant en hiver.', '2025-03-25 11:00:00');

INSERT INTO Likes_Commentaires (commentaire_id, nom_utilisateur)
VALUES
    (1, 'jane_doe'),
    (2, 'alice_smith'),
    (3, 'john_doe');

INSERT INTO Restrictions (nom)
VALUES
    ('Aucune'),
    ('Végétarien'),
    ('Végan'),
    ('Sans gluten'),
    ('Sans lactose'),
    ('Pescatarien');

INSERT INTO Recettes_Restrictions (recette_id, restriction_id)
VALUES
    (1, 2), -- Salade César - Végétarien
    (2, 5), -- Spaghetti Bolognese - Sans lactose
    (3, 4); -- Soupe à l'oignon - Sans gluten
CREATE TABLE Clients (
    nom_utilisateur VARCHAR(255) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    PRIMARY KEY (nom_utilisateur)
);

CREATE TABLE Recettes (
    id INT NOT NULL AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    temps_de_cuisson INT NOT NULL,
    image0 MEDIUMBLOB,
    image1 MEDIUMBLOB,
    image2 MEDIUMBLOB,
    image3 MEDIUMBLOB,
    image4 MEDIUMBLOB,
    createur_nom_utilisateur VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (createur_nom_utilisateur) REFERENCES Clients (nom_utilisateur)
);

CREATE TABLE Ingredients (
    id INT NOT NULL AUTO_INCREMENT,
    unite_de_mesure VARCHAR(255) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Recettes_Ingredients (
    recette_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantite DECIMAL(10,2) NOT NULL,
    unite_de_mesure VARCHAR(255),
    PRIMARY KEY (recette_id, ingredient_id),
    FOREIGN KEY (recette_id) REFERENCES Recettes (id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients (id)
);


CREATE TABLE Plan_de_repas (
    id INT NOT NULL AUTO_INCREMENT,
    date DATE NOT NULL,
    nom_utilisateur VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients (nom_utilisateur)
);

CREATE TABLE Repas_Planifies (
    plan_id INT NOT NULL,
    recette_id INT NOT NULL,
    PRIMARY KEY (plan_id, recette_id),
    FOREIGN KEY (plan_id) REFERENCES Plan_de_repas (id),
    FOREIGN KEY (recette_id) REFERENCES Recettes (id)
);

CREATE TABLE Liste_de_courses (
    id INT NOT NULL AUTO_INCREMENT,
    plan_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantite DECIMAL(10,2) NOT NULL,
    achete TINYINT(1) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (plan_id) REFERENCES Plan_de_repas (id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients (id)
);

CREATE TABLE Promotions (
    id INT NOT NULL AUTO_INCREMENT,
    nom_enseigne VARCHAR(255) NOT NULL,
    url_promotion VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
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
    id INT NOT NULL AUTO_INCREMENT,
    recette_id INT NOT NULL,
    nom_utilisateur VARCHAR(255) NOT NULL,
    texte TEXT NOT NULL,
    date_commentaire DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_commentaire_recette FOREIGN KEY (recette_id) 
        REFERENCES Recettes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_commentaire_utilisateur FOREIGN KEY (nom_utilisateur) 
        REFERENCES Clients(nom_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Likes_Commentaires (
    commentaire_id INT NOT NULL,
    nom_utilisateur VARCHAR(255) NOT NULL,
    PRIMARY KEY (commentaire_id, nom_utilisateur),
    CONSTRAINT fk_like_commentaire FOREIGN KEY (commentaire_id) 
        REFERENCES Commentaires(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_like_utilisateur FOREIGN KEY (nom_utilisateur) 
        REFERENCES Clients(nom_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO Clients (nom_utilisateur, mot_de_passe, prenom, nom)
VALUES
    ('john_doe', 'password123', 'John', 'Doe'),
    ('jane_doe', 'mypassword', 'Jane', 'Doe'),
    ('alice_smith', 'alicepassword', 'Alice', 'Smith');

INSERT INTO Recettes (nom, description, temps_de_cuisson, image, createur_nom_utilisateur)
VALUES
    ('Salade César', 'Une salade avec du poulet, de la laitue et de la sauce César', 15, NULL, 'john_doe'),
    ('Spaghetti Bolognese', 'Des pâtes avec une sauce bolognaise savoureuse', 30, NULL, 'jane_doe'),
    ('Soupe à l\'oignon', 'Une soupe chaude avec des oignons caramélisés', 45, NULL, 'alice_smith');

INSERT INTO Ingredients (unite_de_mesure, nom)
VALUES
    ('g', 'Poulet'),
    ('g', 'Pâtes'),
    ('ml', 'Sauce tomate'),
    ('g', 'Fromage râpé'),
    ('unite', 'Oignons'),
    ('g', 'Pain');

INSERT INTO Recettes_Ingredients (recette_id, ingredient_id, quantite, unite_de_mesure)
VALUES
    (1, 1, 200, 'g'),
    (1, 2, 100, 'g'),
    (1, 3, 50, 'ml'),
    (2, 2, 150, 'g'),
    (2, 3, 200, 'ml'),
    (3, 5, 100, 'g');

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

INSERT INTO Liste_de_courses (plan_id, ingredient_id, quantite, achete)
VALUES
    (1, 1, 200, 0),
    (1, 2, 100, 0),
    (2, 2, 150, 0),
    (2, 3, 200, 0),
    (3, 5, 100, 0);


INSERT INTO Promotions (nom_enseigne, url_promotion)
VALUES
    ('Métro', 'https://www.metro.ca/circulaire'),
    ('Maxi', 'https://www.maxi.ca/fr/print-flyer');


INSERT INTO Stock_Ingredients (nom_utilisateur, ingredient_id, quantite_disponible)
VALUES
    ('john_doe', 1, 500),
    ('jane_doe', 2, 1000),
    ('alice_smith', 5, 300);


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
CREATE TABLE Clients (
    nom_utilisateur VARCHAR(255) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    PRIMARY KEY (nom_utilisateur)
);

CREATE TABLE Recettes (
    id INT NOT NULL AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    temps_de_cuisson INT NOT NULL,
    image MEDIUMBLOB,
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
)

CREATE TABLE Likes_Commentaires (
    commentaire_id INT NOT NULL,
    nom_utilisateur VARCHAR(255) NOT NULL,
    PRIMARY KEY (commentaire_id, nom_utilisateur),
    CONSTRAINT fk_like_commentaire FOREIGN KEY (commentaire_id) 
        REFERENCES Commentaires(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_like_utilisateur FOREIGN KEY (nom_utilisateur) 
        REFERENCES Clients(nom_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE
)

INSERT INTO Clients (nom_utilisateur, mot_de_passe) VALUES
('alice', 'motdepasse123'),
('bob', 'securepass'),
('charlie', '12345678');


INSERT INTO Ingredients (nom) VALUES
('Pâtes'),
('Crème fraîche'),
('Œufs'),
('Laitue'),
('Poulet'),
('Champignons');


INSERT INTO Recettes (nom, description, temps_de_cuisson, image_url, createur_nom_utilisateur) VALUES
('Pâtes Carbonara', 'Délicieuses pâtes à la carbonara', 20, 'images/carbonara.jpg', 'alice'),
('Salade César', 'Salade fraîche avec sauce césar maison', 15, 'images/cesar.jpg', 'bob'),
('Omelette aux champignons', 'Omelette moelleuse avec champignons', 10, 'images/omelette.jpg', 'charlie');

INSERT INTO Recettes_Ingredients (recette_id, ingredient_id, quantite, unite_de_mesure) VALUES
(1, 1, 200, 'g'),  
(1, 2, 100, 'ml'), 
(1, 3, 2, 'pièce'), 
(2, 4, 100, 'g'), 
(2, 5, 150, 'g'), 
(3, 3, 3, 'pièce'), 
(3, 6, 50, 'g'); 


INSERT INTO Plan_de_repas (date, nom_utilisateur) VALUES
('2025-03-25', 'alice'),
('2025-03-26', 'bob');


INSERT INTO Repas_Planifies (plan_id, recette_id, type_repas) VALUES
(1, 1, 'dîner'),    
(1, 2, 'déjeuner'), 
(2, 3, 'petit-déjeuner'); 


INSERT INTO Liste_de_courses (plan_id, ingredient_id, quantite, achete) VALUES
(1, 1, 200, 0), 
(1, 2, 100, 0), 
(2, 6, 50, 1);

INSERT INTO Promotions (nom_enseigne, url_promotion) VALUES
('Supermarché A', 'https://promo.supermarcheA.com'),
('Epicerie B', 'https://promo.epicerieB.com');


INSERT INTO Stock_Ingredients (nom_utilisateur, ingredient_id, quantite_disponible) VALUES
('alice', 3, 10),  
('bob', 5, 200);  

INSERT INTO Recettes_Sauvegardees (nom_utilisateur, recette_id) VALUES
('alice', 2),
('charlie', 1);

INSERT INTO Commentaires (recette_id, nom_utilisateur, texte) VALUES
(1, 'bob', 'Recette super facile et délicieuse !'),
(2, 'alice', 'J’ai ajouté du parmesan, c’était encore meilleur.');


INSERT INTO Likes_Commentaires (commentaire_id, nom_utilisateur) VALUES
(1, 'alice'), 
(2, 'charlie'); 


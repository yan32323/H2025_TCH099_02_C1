CREATE TABLE Produits (
    id INT NOT NULL AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    prix DECIMAL(10,2) NOT NULL,
    unite_de_mesure VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
);

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
    createur_nom_utilisateur VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (createur_nom_utilisateur) REFERENCES Clients (nom_utilisateur)
);

CREATE TABLE Ingredients (
    recette_id INT NOT NULL,
    produit_id INT NOT NULL,
    quantite DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (recette_id, produit_id),
    FOREIGN KEY (recette_id) REFERENCES Recettes (id),
    FOREIGN KEY (produit_id) REFERENCES Produits (id)
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
    produit_id INT NOT NULL,
    quantite DECIMAL(10,2) NOT NULL,
    achete TINYINT(1) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (plan_id) REFERENCES Plan_de_repas (id),
    FOREIGN KEY (produit_id) REFERENCES Produits (id)
);

CREATE TABLE Promotions (
    id INT NOT NULL AUTO_INCREMENT,
    nom_enseigne VARCHAR(255) NOT NULL,
    url_promotion VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Stock_Ingredients (
    nom_utilisateur VARCHAR(255) NOT NULL,
    produit_id INT NOT NULL,
    quantite_disponible DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (nom_utilisateur, produit_id),
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients (nom_utilisateur),
    FOREIGN KEY (produit_id) REFERENCES Produits (id)
);

CREATE TABLE Recettes_Sauvegardees (
    nom_utilisateur VARCHAR(255) NOT NULL,
    recette_id INT NOT NULL,
    PRIMARY KEY (nom_utilisateur, recette_id),
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients (nom_utilisateur),
    FOREIGN KEY (recette_id) REFERENCES Recettes (id)
);

# Insérer des clients
INSERT INTO Clients (nom_utilisateur, mot_de_passe) VALUES
('alice123', 'mdpAlice'),
('bob456', 'mdpBob'),
('charlie789', 'mdpCharlie');

# Insérer des produits
INSERT INTO Produits (nom, prix, unite_de_mesure) VALUES
('Farine', 2.50, 'kg'),
('Sucre', 1.80, 'kg'),
('Lait', 1.20, 'L'),
('Oeufs', 3.00, 'douzaine');

# Insérer des recettes
INSERT INTO Recettes (nom, description, temps_de_cuisson, createur_nom_utilisateur) VALUES
('Crêpes', 'Délicieuses crêpes maison.', 10, 'alice123'),
('Gâteau au chocolat', 'Un gâteau moelleux au chocolat.', 30, 'bob456');

# Insérer des ingrédients pour les recettes
INSERT INTO Ingredients (recette_id, produit_id, quantite) VALUES
(1, 1, 0.5),  # 500g de farine pour les crêpes
(1, 2, 0.2),  # 200g de sucre pour les crêpes
(1, 3, 0.5),  # 500ml de lait pour les crêpes
(2, 1, 0.3),  # 300g de farine pour le gâteau
(2, 2, 0.5),  # 500g de sucre pour le gâteau
(2, 4, 6);    # 6 œufs pour le gâteau

# Insérer des plans de repas
INSERT INTO Plan_de_repas (date, nom_utilisateur) VALUES
('2025-03-10', 'alice123'),
('2025-03-11', 'bob456');

# Associer des repas planifiés aux plans de repas
INSERT INTO Repas_Planifies (plan_id, recette_id) VALUES
(1, 1),  # Crêpes pour le 10 mars
(2, 2);  # Gâteau au chocolat pour le 11 mars

# Insérer une liste de courses
INSERT INTO Liste_de_courses (plan_id, produit_id, quantite, achete) VALUES
(1, 1, 0.5, 0), # 500g de farine non achetés
(1, 3, 0.5, 1), # 500ml de lait déjà achetés
(2, 4, 6, 0);   # 6 œufs non achetés

# Insérer des promotions
INSERT INTO Promotions (nom_enseigne, url_promotion) VALUES
('Supermarché X', 'https://promo.superx.com'),
('Marché Bio', 'https://promo.marchebio.com');

# Insérer des stocks d'ingrédients
INSERT INTO Stock_Ingredients (nom_utilisateur, produit_id, quantite_disponible) VALUES
('alice123', 1, 1.0), # 1kg de farine en stock
('bob456', 2, 0.3);   # 300g de sucre en stock

# Insérer des recettes sauvegardées par les utilisateurs
INSERT INTO Recettes_Sauvegardees (nom_utilisateur, recette_id) VALUES
('alice123', 2),  # Alice sauvegarde le gâteau au chocolat
('bob456', 1);    # Bob sauvegarde la recette des crêpes

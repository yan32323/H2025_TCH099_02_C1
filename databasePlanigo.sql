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
    FOREIGN KEY (createur_nom_utilisateur) REFERENCES Clients (nom_utilisateur) ON UPDATE CASCADE
);

CREATE TABLE Ingredients (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    prix DECIMAL(10,2) NOT NULL DEFAULT 0,
    magasin VARCHAR(255),
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
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients (id) ON DELETE CASCADE
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
    titre VARCHAR(255) NOT NULL,
    descriptions TEXT,
    nom_utilisateur VARCHAR(255) NOT NULL,
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients (nom_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Repas_Planifies (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    recette_id INT NOT NULL,
    journee VARCHAR(255) NOT NULL,
    heure TIME NOT NULL,
    FOREIGN KEY (plan_id) REFERENCES Plan_de_repas (id) ON DELETE CASCADE,
    FOREIGN KEY (recette_id) REFERENCES Recettes (id) ON DELETE CASCADE
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
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients (nom_utilisateur) ON UPDATE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients (id) ON DELETE CASCADE
);

CREATE TABLE Recettes_Sauvegardees (
    nom_utilisateur VARCHAR(255) NOT NULL,
    recette_id INT NOT NULL,
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients (nom_utilisateur) ON UPDATE CASCADE,
    FOREIGN KEY (recette_id) REFERENCES Recettes (id) ON DELETE CASCADE
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
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients (nom_utilisateur) ON UPDATE CASCADE,
    FOREIGN KEY (recette_id) REFERENCES Recettes (id)
);

CREATE TABLE Utilisateurs_suivi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_utilisateur VARCHAR(255) NOT NULL,
    user_suivi_id VARCHAR(255),
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients (nom_utilisateur) ON UPDATE CASCADE,
    FOREIGN KEY (user_suivi_id) REFERENCES Clients (nom_utilisateur) ON UPDATE CASCADE
);

CREATE TABLE Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_utilisateur VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    est_lue TINYINT(1) DEFAULT 0,
    type VARCHAR(255) NOT NULL,
    FOREIGN KEY (nom_utilisateur) REFERENCES Clients(nom_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE
);


--Creation des trigger


DELIMITER //

CREATE TRIGGER notifier_commentaire_sur_recette
AFTER INSERT ON Commentaires
FOR EACH ROW
BEGIN
    DECLARE auteur_recette VARCHAR(255);

    -- Récupère l'auteur de la recette
    SELECT createur_nom_utilisateur
    INTO auteur_recette
    FROM Recettes
    WHERE id = NEW.recette_id;

    -- Si l'auteur de la recette n'est pas celui qui a commenté
    IF auteur_recette != NEW.nom_utilisateur THEN
        INSERT INTO Notifications (nom_utilisateur, message, type)
        VALUES (
            auteur_recette,
            CONCAT('Nouvelle activité : ', NEW.nom_utilisateur, ' a commenté votre recette.'),
            'Nouveau Commentaire'
        );
    END IF;
END;
//


CREATE TRIGGER after_new_follow
AFTER INSERT ON Utilisateurs_suivi
FOR EACH ROW
BEGIN
    DECLARE suivi VARCHAR(255);
    DECLARE suiveur VARCHAR(255);

    SET suiveur = NEW.nom_utilisateur;
    SET suivi = NEW.user_suivi_id;

    -- Crée une notification pour l'utilisateur suivi
    INSERT INTO Notifications (nom_utilisateur, message, type)
    VALUES (
        suivi,
        CONCAT(suiveur, ' a commencé à vous suivre.'),
        'Nouvel Abonné'
    );
END//




CREATE TRIGGER notif_nouvelle_recette
AFTER INSERT ON Recettes
FOR EACH ROW
BEGIN
    -- Insère une notification à tous les utilisateurs qui suivent le créateur de la recette
    INSERT INTO Notifications (nom_utilisateur, message, type)
    SELECT nom_utilisateur, 
           CONCAT('La personne que vous suivez (', NEW.createur_nom_utilisateur, ') a publié une nouvelle recette : ', NEW.nom),
           'Nouvelle Recette'
    FROM Utilisateurs_suivi
    WHERE user_suivi_id = NEW.createur_nom_utilisateur;
END//

DELIMITER ;






-- Insertion des données dans les tables

INSERT INTO Clients (nom_utilisateur, mot_de_passe, nom, prenom, description)
VALUES
('chef_anna', 'secure123', 'Dupont', 'Anna', 'Chef pâtissière passionnée par les desserts français.'),
('healthy_mike', 'fitlife', 'Martin', 'Mike', 'Coach nutritionnel adepte de la cuisine saine.'),
('veggie_sophie', 'plants4life', 'Lemoine', 'Sophie', 'Végétarienne depuis 10 ans, créatrice de recettes vertes.'),
('quick_luke', 'fastandgood', 'Moreau', 'Lucas', 'Spécialiste des repas rapides pour étudiants pressés.'),
('grandma_marie', 'souvenirs1920', 'Durand', 'Marie', 'Recettes traditionnelles transmises depuis des générations.');



    INSERT INTO Recettes (nom, description, type, difficulter, temps_de_cuisson, image, portions, createur_nom_utilisateur)
VALUES
('Tarte aux pommes rustique', 'Recette traditionnelle avec une pâte maison et des pommes caramélisées.', 'Dessert', 'moyen', 50, NULL, 6, 'chef_anna'),
('Buddha Bowl', 'Un bol équilibré avec quinoa, légumes rôtis et houmous.', 'Dîner', 'facile', 20, NULL, 2, 'healthy_mike'),
('Lasagnes végétariennes', 'Version sans viande avec courgettes, épinards et fromage.', 'Plat principal', 'moyen', 45, NULL, 4, 'veggie_sophie'),
('Wrap au thon', 'Wrap rapide au thon, maïs et sauce yaourt.', 'Déjeuner', 'facile', 10, NULL, 1, 'quick_luke'),
('Soupe à la courge', 'Soupe onctueuse à la courge butternut et lait de coco.', 'Souper', 'facile', 30, NULL, 3, 'grandma_marie');


    INSERT INTO Ingredients (prix,magasin, unite_de_mesure, nom)
VALUES
(5.99,'SUPERC','g', 'Pommes'),
(5.99,'SUPERC','g', 'Pâte brisée'),
(5.99,'SUPERC','g', 'Quinoa'),
(5.99,'SUPERC','g', 'Courgettes'),
(5.99,'SUPERC','g', 'Épinards'),
(5.99,'SUPERC','ml', 'Lait de coco'),
(5.99,'SUPERC','g', 'Fromage râpé'),
(5.99,'SUPERC','g', 'Thon'),
(5.99,'SUPERC','g', 'Maïs'),
(5.99,'SUPERC','ml', 'Yaourt'),
(5.99,'SUPERC','g', 'Courge butternut'),
(5.99,'SUPERC','g', 'Carottes');

    INSERT INTO Recettes_Ingredients (recette_id, ingredient_id, quantite)
VALUES
(1, 1, 300), (1, 2, 200),
(2, 3, 150),
(3, 4, 200), (3, 5, 150), (3, 7, 100),
(4, 8, 120), (4, 9, 80), (4, 10, 50),
(5, 11, 250), (5, 12, 100), (5, 6, 100);


INSERT INTO Recettes_Etapes (recette_id, numero_etape, texte)
VALUES
(1, 1, 'Préchauffez le four à 180°C.'),
(1, 2, 'Étalez la pâte brisée dans un moule à tarte.'),
(1, 3, 'Épluchez et tranchez les pommes en fines lamelles.'),
(1, 4, 'Disposez les pommes en rosace sur la pâte.'),
(1, 5, 'Saupoudrez de sucre et enfournez pendant 45 minutes.');

INSERT INTO Recettes_Etapes (recette_id, numero_etape, texte)
VALUES
(2, 1, 'Faites cuire le quinoa selon les instructions du paquet.'),
(2, 2, 'Rôtissez les légumes de saison (carottes, patates douces, etc.) au four avec un filet d’huile d’olive.'),
(2, 3, 'Préparez une sauce à base de tahini, citron, ail et eau.'),
(2, 4, 'Assemblez dans un bol : quinoa, légumes, pois chiches, avocat, et versez la sauce.'),
(2, 5, 'Parsemez de graines de sésame ou de tournesol pour le croquant.');

INSERT INTO Recettes_Etapes (recette_id, numero_etape, texte)
VALUES
(3, 1, 'Préchauffez le four à 190°C.'),
(3, 2, 'Faites revenir les courgettes et épinards à la poêle avec un filet d’huile.'),
(3, 3, 'Alternez dans un plat : feuilles de lasagne, légumes, sauce tomate et fromage râpé.'),
(3, 4, 'Répétez les couches jusqu’à épuisement des ingrédients.'),
(3, 5, 'Enfournez 35 minutes. Laissez reposer 5 minutes avant de servir.');

INSERT INTO Recettes_Etapes (recette_id, numero_etape, texte)
VALUES
(4, 1, 'Mélangez le thon égoutté avec le maïs et le yaourt.'),
(4, 2, 'Ajoutez des épices au goût (curry ou paprika).'),
(4, 3, 'Garnissez une tortilla avec le mélange.'),
(4, 4, 'Roulez fermement le wrap et servez immédiatement ou emballez pour plus tard.');

INSERT INTO Recettes_Etapes (recette_id, numero_etape, texte)
VALUES
(5, 1, 'Épluchez et coupez la courge et les carottes en morceaux.'),
(5, 2, 'Faites revenir dans une casserole avec un peu d’huile.'),
(5, 3, 'Ajoutez de l’eau à hauteur et laissez cuire 20 minutes.'),
(5, 4, 'Mixez la soupe et ajoutez le lait de coco.'),
(5, 5, 'Assaisonnez et servez chaud avec quelques graines grillées en topping.');

INSERT INTO Plan_de_repas (titre, descriptions, nom_utilisateur)
VALUES
('Semaine Détox', 'Plan de repas léger pour une semaine équilibrée.', 'healthy_mike'),
('Végé Tous Les Jours', 'Repas végétariens simples et savoureux.', 'veggie_sophie');


INSERT INTO Repas_Planifies (plan_id, recette_id, journee, heure)
VALUES
(1, 2, 'Lundi', '12:00:00'),
(1, 5, 'Mercredi', '19:00:00'),
(2, 3, 'Mardi', '18:30:00');


INSERT INTO Promotions (nom_enseigne, url_promotion)
VALUES
    ('Métro', 'https://www.metro.ca/circulaire'),
    ('Maxi', 'https://www.maxi.ca/fr/print-flyer');

INSERT INTO Stock_Ingredients (nom_utilisateur, ingredient_id, quantite_disponible)
VALUES
('healthy_mike', 3, 500),
('veggie_sophie', 4, 300),
('chef_anna', 1, 200),
('quick_luke', 8, 150),
('grandma_marie', 11, 400);


INSERT INTO Recettes_Sauvegardees (nom_utilisateur, recette_id)
VALUES
    ('quick_luke', 1),
    ('quick_luke', 2),
    ('quick_luke', 3);

INSERT INTO Commentaires (recette_id, nom_utilisateur, texte, date_commentaire)
VALUES
(1, 'grandma_marie', 'Un vrai délice, cette tarte rappelle les goûters d’antan.', '2025-04-20 16:00:00'),
(2, 'veggie_sophie', 'Super bowl! Très équilibré et rapide à faire.', '2025-04-21 13:30:00'),
(3, 'chef_anna', 'Les lasagnes sont savoureuses, bravo!', '2025-04-22 18:45:00');

INSERT INTO Likes_Commentaires (commentaire_id, nom_utilisateur)
VALUES
(1, 'chef_anna'),
(2, 'quick_luke'),
(3, 'healthy_mike');


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
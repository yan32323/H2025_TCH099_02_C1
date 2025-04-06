<?php

// Inclure le routeur
require_once 'Router.php';

// Instancier le routeur
$router = new Router();


// Route pour la création de recettes
$router->post('/CreationRecettes.php/recettes/creer', function () {
    header('Content-Type: application/json');
    $packet = file_get_contents("php://input");
    $infos = json_decode($packet, true);

    $config = require 'config.php';

    if (
        isset($infos["edit"]) && isset($infos["titre"]) && isset($infos["description"]) &&
        isset($infos["ingredients"]) && isset($infos["etapes"]) && 
        isset($infos["images"]) && isset($infos["username"]) && isset($infos["difficulte"])
    ) {
        if (!isset($infos["images"]) || empty($infos["images"])) {
            // Pas d'image : utilise l'image par défaut
            $defaultImagePath = '../assets/image/recetteDefaut.png';
            $infos["images"] = base64_encode(file_get_contents($defaultImagePath));
        } else {
            // Si c'est un tableau (plusieurs images), on prend la première
            if (is_array($infos["images"])) {
                $firstImage = $infos["images"][0];
            } else {
                $firstImage = $infos["images"];
            }

            console_log($firstImage);
        
            // Vérifie si c’est une chaîne base64 valide
            if (is_string($firstImage) && base64_decode($firstImage, true) !== false) {
                
                $infos["images"] = $firstImage;
            } else {
                // Image invalide : on met l'image par défaut
                $defaultImagePath = '../assets/image/recetteDefaut.png';
                $infos["images"] = base64_encode(file_get_contents($defaultImagePath));
            }
        }
        
        
        try {
            $pdo = new PDO(
                "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8",
                $config['username'],
                $config['password'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );

            if ($infos["edit"] === "true") {
                $requete = $pdo->prepare("UPDATE Recettes SET titre=:titre, description=:description, ingredients=:ingredients, etapes=:etapes, image=:image, difficulte=:difficulte WHERE id=:id");
                $requete->execute([
                    'id' => $infos["id"],
                    'titre' => $infos["titre"],
                    'description' => $infos["description"],
                    'ingredients' => $infos["ingredients"],
                    'etapes' => $infos["etapes"],
                    'images' => base64_decode($infos["images"]),
                    'difficulte' => $infos["difficulte"]
                ]);
                echo json_encode(["success" => true, "message" => "Recette modifiée"]);
            } else {
                $requete = $pdo->prepare("INSERT INTO Recettes (nom, description, image, createur_nom_utilisateur, temps_de_cuisson) 
                                          VALUES (:nom, :description, :image0, :username, :temps_de_cuisson)");
                $requete->execute([
                    'nom' => $infos["titre"],
                    'description' => $infos["description"],
                    'temps_de_cuisson' => $infos["temps"],
                    'image0' => base64_decode($infos["images"]),
                    'username' => $infos["username"]
                ]);

                echo json_encode(["success" => true, "message" => "Recette ajoutée"]);
            }

        } catch (PDOException $e) {
            echo json_encode(["error" => true, "message" => "Erreur base de données", "details" => $e->getMessage()]);
        }
    } else {

        echo json_encode(["error" => true, "message" => "Données manquantes"]);
    }
});

//Route pour la recuperation de recettes
$router->post('/CreationRecettes.php/recettes/{recette}', function ($recette) {
    header('Content-Type: application/json');
    $config = require 'config.php';

    try {
        $pdo = new PDO(
            "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8",
            $config['username'],
            $config['password'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );

        $requete = $pdo->prepare("SELECT * FROM Recettes WHERE id=:id");
        $requete->execute(['id' => $recette]);
        $resultat = $requete->fetch();

        if (!empty($resultat)) {
            // Convertir l'image BLOB en base64
            if (!empty($resultat['image'])) {
                $resultat['image'] = base64_encode($resultat['image']);
            }

            echo json_encode($resultat);
        } else {
            echo json_encode(["error" => true, "message" => "Recette non trouvée"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["error" => true, "message" => "Erreur de base de données"]);
    }
});


// Route pour la suppression de recettes
$router->post('/CreationRecettes.php/recettes/supprimer/', function () {

    header('Content-Type: application/json');

    // recuperer les donnes
    $packet = file_get_contents("php://input");
    $infos = json_decode($packet, true);

    $config = require_once 'config.php';

    if (isset($infos["id"])) {

        try {
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ];

            // connexion a la base de donnees
            $pdo = new PDO(
                "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8",
                $config['username'],
                $config['password'],
                $options
            );


            // on demande le mot de passe de l'utilisateur
            $requete = $pdo->prepare("DELETE FROM Recettes WHERE id=:id");

            $requete->execute(['id' => $infos["id"]]);

            $resultat = $requete->fetchAll();

             echo json_encode($resultat);
  
        } catch (PDOException $e) {

            $tableauReponse = ["error" => true];

            // Base de donnee inaccessible 
            echo json_encode($tableauReponse);
        }
    }
});

// Acheminer la requête
$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);

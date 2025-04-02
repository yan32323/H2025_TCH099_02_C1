<?php

// Inclure le routeur
require_once 'Router.php';

// Instancier le routeur
$router = new Router();


// Route pour la création de recettes
$router->post('/CreationRecettes.php/recettes/creer/', function () {

    // recuperer les donnes
    $packet = file_get_contents("php://input");
    $infos = json_decode($packet, true);

    $config = require_once 'config.php';
    if (isset($infos["edit"])&&isset($infos["id"])
        &&isset($infos["titre"])&&isset($infos["description"])
        &&isset($infos["ingredients"])&&isset($infos["etapes"])
        &&isset($infos["image"])&&isset($infos["username"])) 
    {
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

            if($infos["edit"] == "true"){
                // on met a jour la recette
                $requete = $pdo->prepare("UPDATE Recettes SET titre=:titre, description=:description, ingredients=:ingredients, etapes=:etapes, image=:image, difficulte=:difficulte WHERE id=:id");

                $requete->execute(['id' => $infos["id"], 'titre' => $infos["titre"], 'description' => $infos["description"], 'ingredients' => $infos["ingredients"], 'etapes' => $infos["etapes"], 'image' => $infos["image"], 'difficulte' => $infos["difficulte"]]);

                $resultat = $requete->fetchAll();

                echo json_encode($resultat);
            }else{
                if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_FILES["image"])) {
                    $imageData = file_get_contents($_FILES["image"]["tmp_name"]);
                
                    $requete = $pdo->prepare("INSERT INTO Recettes (titre, description, ingredients, etapes, image, createur_nom_utilisateur, difficulte) 
                                              VALUES (:titre, :description, :ingredients, :etapes, :image, :username, :difficulte)");
                
                    $requete->bindParam(':titre', $_POST["titre"]);
                    $requete->bindParam(':description', $_POST["description"]);
                    $requete->bindParam(':ingredients', $_POST["ingredients"]);
                    $requete->bindParam(':etapes', $_POST["etapes"]);
                    $requete->bindParam(':image', $imageData, PDO::PARAM_LOB);
                    $requete->bindParam(':username', $_POST["username"]);
                    $requete->bindParam(':difficulte', $_POST["difficulte"]);
                
                    $success = $requete->execute();
                
                    echo json_encode(["success" => $success, "message" => $success ? "Recette ajoutée" : "Erreur lors de l'insertion"]);
                } else {
                    echo json_encode(["success" => false, "message" => "Aucune image envoyée"]);
                }
            }
        } catch (PDOException $e) {

            $tableauReponse = ["error" => true, "msgError" => "- La connexion a échoué: La base de donne est inaccessible."];

            // Base de donnee inaccessible 
            echo json_encode($tableauReponse);
        }
        
    }
});
//Route pour la recuperation de recettes
$router->post('/CreationRecettes.php/recettes/{recette}', function ($recette) {

    // Répondre avec les données en format JSON
    header('Content-Type: application/json');

    $config = require_once 'config.php';

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
        $requete = $pdo->prepare("SELECT * FROM Recettes WHERE id=:id");

        $requete->execute(['id' => $recette]);

        $resultat = $requete->fetch();

        // verification de la presence de l'utilisateur si la reponse n'est pas vide
        if (!empty($resultat)) {

            echo json_encode($tableauReponse);
        } else {

            // Recette inexistante
            $tableauReponse = ["error" => true];

            echo json_encode($tableauReponse);
        }
    } catch (PDOException $e) {

        $tableauReponse = ["error" => true];

        // Base de donnee inaccessible 
        echo json_encode($tableauReponse);
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

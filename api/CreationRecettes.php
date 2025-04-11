<?php

// Inclure le routeur
require_once 'Router.php';

// Instancier le routeur
$router = new Router();

// Route pour la création ou modification de recettes
$router->post('/CreationRecettes.php/recettes/creer', function () {
    header('Content-Type: application/json');
    
    $packet = file_get_contents("php://input");
    $infos = json_decode($packet, true);

    $config = require '../includes/config.php';

    // Vérifier que toutes les données nécessaires sont présentes
    if (
        isset($infos["edit"]) && isset($infos["titre"]) && isset($infos["description"]) &&
        isset($infos["ingredients"]) && isset($infos["etapes"]) && 
        isset($infos["username"]) && isset($infos["difficulte"])
    ) {
        
        if (empty($infos["image"])) {
            
            $defaultImagePath = '../assets/image/recetteDefaut.png';
            $imageFinale = base64_encode(file_get_contents($defaultImagePath));
        } else {
            $image = $infos["image"];

            // Supprimer le préfixe s'il est présent
            if (strpos($image, 'base64,') !== false) {
                $image = explode('base64,', $image)[1];
            }

            // Vérification de la validité de l'image
            if (base64_decode($image, true) === false) {
                // Si l'image est invalide, utiliser l'image par défaut
                $defaultImagePath = '../assets/image/recetteDefaut.png';
                $imageFinale = base64_encode(file_get_contents($defaultImagePath));
            } else {
                $imageFinale = $image;
            }
        }

        $infos["image"] = $imageFinale;


        try {
            // Connexion à la base de données
            $pdo = new PDO(
                "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8",
                $config['username'],
                $config['password'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );

            // Si on modifie une recette existante
            if ($infos["edit"] === "true") {
                $requete = $pdo->prepare("UPDATE Recettes SET titre=:titre, description=:description, ingredients=:ingredients, image=:image, difficulte=:difficulte WHERE id=:id");
                $requete->execute([
                    'id' => $infos["id"],
                    'titre' => $infos["titre"],
                    'description' => $infos["description"],
                    'ingredients' => $infos["ingredients"],
                    'image' => base64_decode($infos["image"]),
                    'difficulte' => $infos["difficulte"]
                ]);
                echo json_encode(["success" => true, "message" => "Recette modifiée"]);
            } else {
                // Si on ajoute une nouvelle recette
                $requete = $pdo->prepare("INSERT INTO Recettes (nom, description, image, createur_nom_utilisateur, temps_de_cuisson) 
                                          VALUES (:nom, :description, :image, :username, :temps_de_cuisson)");
                $requete->execute([
                    'nom' => $infos["titre"],
                    'description' => $infos["description"],
                    'temps_de_cuisson' => $infos["temps"],
                    'image' => base64_decode($infos["image"]),
                    'username' => $infos["username"]
                ]);

                // Récupérer l'ID de la nouvelle recette insérée
                $recette_id = $pdo->lastInsertId();

                // Insérer les ingrédients dans la table Recettes_Ingredients
                if (!empty($infos["ingredients"])) {
                    $stmtIngredient = $pdo->prepare("INSERT INTO Recettes_Ingredients (recette_id, ingredient_id, quantite, unite_de_mesure) VALUES (?, ?, ?, ?)");

                    foreach ($infos["ingredients"] as $ingredient) {
                        $stmtIngredient->execute([
                            $recette_id,
                            $ingredient["id"], 
                            $ingredient["quantite"], 
                            $ingredient["unite_de_mesure"]
                        ]);
                    }
                }


                // Insérer les étapes dans la table Recettes_Etapes
                if (!empty($infos["etapes"])) {
                    $stmtEtape = $pdo->prepare("INSERT INTO Recettes_Etapes (recette_id, numero_etape, texte) VALUES (?, ?, ?)");
                    foreach ($infos["etapes"] as $index => $texteEtape) {
                        $stmtEtape->execute([$recette_id, $index + 1, $texteEtape]);
                    }
                }

                echo json_encode(["success" => true, "message" => "Recette ajoutée"]);
            }

        } catch (PDOException $e) {
            echo json_encode(["error" => true, "message" => "Erreur base de données", "details" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["error" => true, "message" => "Données manquantes"]);
    }
});



// Route pour la récupération de recettes
$router->post('/CreationRecettes.php/recettes/{recette}', function ($recette) {
    header('Content-Type: application/json');
    $config = require '../includes/config.php';

    try {
        // Connexion à la base de données
        $pdo = new PDO(
            "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8",
            $config['username'],
            $config['password'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );

        // Récupérer la recette
        $requete = $pdo->prepare("SELECT * FROM Recettes WHERE id=:id");
        $requete->execute(['id' => $recette]);
        $resultat = $requete->fetch();

        if ($resultat) {
            // Convertir l'image BLOB en base64 si elle existe
            if (!empty($resultat['image'])) {
                $resultat['image'] = base64_encode($resultat['image']);
            }

            echo json_encode($resultat);
        } else {
            echo json_encode(["error" => true, "message" => "Recette non trouvée"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["error" => true, "message" => "Erreur de base de données", "details" => $e->getMessage()]);
    }
});

// Route pour la suppression de recettes
$router->post('/CreationRecettes.php/recettes/supprimer', function () {
    header('Content-Type: application/json');

    $packet = file_get_contents("php://input");
    $infos = json_decode($packet, true);

    $config = require '../includes/config.php';

    if (isset($infos["id"])) {
        try {
            // Connexion à la base de données
            $pdo = new PDO(
                "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8",
                $config['username'],
                $config['password'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );

            // Suppression de la recette
            $requete = $pdo->prepare("DELETE FROM Recettes WHERE id=:id");
            $requete->execute(['id' => $infos["id"]]);

            echo json_encode(["success" => true, "message" => "Recette supprimée"]);
        } catch (PDOException $e) {
            echo json_encode(["error" => true, "message" => "Erreur de base de données", "details" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["error" => true, "message" => "ID de recette manquant"]);
    }
});

// Route pour la récupération des ingrédients
$router->get('/CreationRecettes.php/ingredients', function () {
    header('Content-Type: application/json');
    $config = require '../includes/config.php';

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

        $stmt = $pdo->query("SELECT id, nom, unite_de_mesure FROM Ingredients ORDER BY nom ASC");
        $ingredients = $stmt->fetchAll();

        echo json_encode($ingredients);
    } catch (PDOException $e) {
        echo json_encode(["error" => true, "message" => "Erreur lors de la récupération des ingrédients."]);
    }
});


// Acheminer la requête
$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);

<?php
require_once 'Router.php'; 
// Inclure la connexion à la base de données
require_once '../includes/conection.php';  // Assurez-vous que vous avez la connexion PDO ici

$router = new Router();

// Route pour récupérer les ingrédients (GET)
$router->get('/CreationRecettes.php/ingredients', function () use ($pdo) {
    try {
        // Récupérer les ingrédients depuis la base de données
        $stmt = $pdo->query("SELECT * FROM ingredients");
        $ingredients = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Retourner les ingrédients en format JSON
        header('Content-Type: application/json');
        echo json_encode($ingredients);
    } catch (PDOException $e) {
        // Si une erreur se produit, renvoyer une erreur JSON
        header('Content-Type: application/json');
        echo json_encode(["error" => "Erreur lors de la récupération des ingrédients", "details" => $e->getMessage()]);
    }
});

// Route pour créer ou modifier une recette (POST)
$router->post('/CreationRecettes.php/recettes/creer', function () use ($pdo) {
    header('Content-Type: application/json');

    $packet = file_get_contents("php://input");
    $infos = json_decode($packet, true);

    // Vérifier la présence des données nécessaires
    if (
        isset($infos["edit"]) && isset($infos["titre"]) && isset($infos["description"]) &&
        isset($infos["ingredients"]) && isset($infos["etapes"]) &&
        isset($infos["identifiant"]) && isset($infos["difficulte"])
    ) {
        
        // Traitement de l'image
        if (empty($infos["image"])) {
            $defaultImagePath = '../assets/image/recetteDefaut.png';
            $imageFinale = base64_encode(file_get_contents($defaultImagePath));
        } else {
            $image = $infos["image"];
            if (strpos($image, 'base64,') !== false) {
                $image = explode('base64,', $image)[1];
            }
            if (base64_decode($image, true) === false) {
                $defaultImagePath = '../assets/image/recetteDefaut.png';
                $imageFinale = base64_encode(file_get_contents($defaultImagePath));
            } else {
                $imageFinale = $image;
            }
        }
        
        $infos["image"] = $imageFinale;

        try {
            // Si vous modifiez une recette
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
                // Si vous ajoutez une nouvelle recette
                $requete = $pdo->prepare("INSERT INTO Recettes (nom, description, image, createur_nom_utilisateur, temps_de_cuisson) 
                                          VALUES (:nom, :description, :image, :username, :temps_de_cuisson)");
                $requete->execute([
                    'nom' => $infos["titre"],
                    'description' => $infos["description"],
                    'temps_de_cuisson' => $infos["temps"],
                    'image' => base64_decode($infos["image"]),
                    'username' => $infos['identifiant']
                ]);
                // Récupérer l'ID de la recette ajoutée
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
        echo json_encode(["error" => true, "message" => "Données manquantes", "details" => $infos]);
    }
});

$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);

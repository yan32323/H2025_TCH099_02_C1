<?php
session_start();

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
        isset($infos["ingredients"]) && isset($infos["etapes"]) && isset($infos["difficulte"])
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
                    'username' => $_SESSION['user_id']
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


// Route pour récupéré toutes les recettes selon les 2 filtres données
$router->post('/CreationRecettes.php/recuperer-recettes-filtrer', function () 
{

    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    try {

        //extraire les éléments de l'objet JSON
        $data_json = file_get_contents("php://input");
        $data = json_decode($data_json, true);

        $identifiant = trim($data['identifiant']);
        $motDePasse = trim($data['motDePasse']);
        $filtreType = trim($data['filtreType']);
        $filtreRestriction = trim($data['filtreRestriction']);

        //Si le client exite dans la base de donnée, on récupère les recettes dans la base de données selon les filtres données
        if(validateUserCredentials($identifiant, $motDePasse, $pdo)){

            try{
                // On prépare la requête SQL en fonction des filtres et on l'exécute
                if(strcmp($filtreType, "tout") == 0){
                    switch ($filtreRestriction) {
                        case 'tout': 
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image FROM recettes AS r");
                            $requete->execute();
                        break;
                        case 'sauvegarder':
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image FROM recettes AS r INNER JOIN recettes_sauvegardees AS r_s ON r.id = r_s.recette_id WHERE r_s.nom_utilisateur = :identifiant");
                            $requete->execute([':identifiant' => $identifiant]);
                            break;
                        case 'miennes':
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image FROM recettes AS r WHERE r.createur_nom_utilisateur = :identifiant");
                            $requete->execute([':identifiant' => $identifiant]);
                            break;
                        default:
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image FROM recettes AS r WHERE r.restriction = :restriction");
                            $requete->execute([':restriction' => $filtreRestriction]);
                            break;
                    }
                }else{
                    switch ($filtreRestriction) {
                        case 'tout': 
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image FROM recettes AS r WHERE r.type = :typeChoisi");
                            $requete->execute([':typeChoisi' => $filtreType]);
                            break;
                        case 'sauvegarder':
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image FROM recettes AS r INNER JOIN recettes_sauvegardees AS r_s ON r.id = r_s.recette_id WHERE r_s.nom_utilisateur = :identifiant AND r.type = :typeChoisi");
                            $requete->execute([':identifiant' => $identifiant, ':typeChoisi' => $filtreType]);
                            break;
                        case 'miennes':
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image FROM recettes AS r WHERE r.createur_nom_utilisateur = :identifiant AND r.type = :typeChoisi");
                            $requete->execute([':identifiant' => $identifiant, ':typeChoisi' => $filtreType]);
                            break;
                        default:
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image FROM recettes AS r WHERE r.restriction = :restriction AND r.type = :typeChoisi");
                            $requete->execute([':restriction' => $filtreRestriction, ':typeChoisi' => $filtreType]);
                            break;
                    }
                }

            //Erreur de la requête SQL
            }catch(PDOException $e){
                http_response_code(400); 
                echo json_encode(['statut' => 'error', 'message' => 'Le type et/ou la restrictions fournis n\'est pas valide.']);
                exit();
            }

            //On récupère les résultats de la requête et on les encode en JSON
            $resultat = $requete->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['statut' => 'success', 'listeRecette' => $resultat]);
            exit();

        }else{
            //Cas où l'authentification a échoué
            http_response_code(401); 
            echo json_encode(['statut' => 'error', 'message' => 'Authentification requise.']);
            exit();
        }

    } catch (PDOException $e) {
        http_response_code(401); 
        echo json_encode(['statut' => 'error', 'message' => 'Erreur de connexion']);
        exit();
    }
});

function validateUserCredentials($identifiant, $motDePasse, $pdo) {

    $requete = $pdo->prepare("SELECT mot_de_passe FROM clients WHERE nom_utilisateur = :identifiant");
    $requete->execute([':identifiant' => $identifiant]);
    $user = $requete->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($motDePasse, $user['mot_de_passe'])) {
        return true; 
    } else {
        return false; 
    }
}


// Acheminer la requête
$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);

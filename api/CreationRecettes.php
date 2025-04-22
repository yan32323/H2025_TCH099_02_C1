<?php
require_once 'Router.php'; 
// Inclure la connexion à la base de données


$router = new Router();

// Route pour récupérer les ingrédients (GET)
$router->get('/CreationRecettes.php/ingredients', function () {
    try {
        require_once '../includes/conection.php';
        // Récupérer les ingrédients depuis la base de données
        $stmt = $pdo->query("SELECT * FROM Ingredients");
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
$router->post('/CreationRecettes.php/recettes/creer', function () {
    header('Content-Type: application/json');
    require_once '../includes/conection.php';

    $packet = file_get_contents("php://input");
    $infos = json_decode($packet, true);

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

                echo json_encode(["status" => "ok", "message" => "Recette ajoutée"]);
            }

        } catch (PDOException $e) {
            echo json_encode(["error" => true, "message" => "Erreur base de données", "details" => $e->getMessage()]);
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
    require_once '../includes/conection.php';

    $packet = file_get_contents("php://input");
    $infos = json_decode($packet, true);

    $config = require '../includes/config.php';

    if (isset($infos["id"])) {
        try {

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
    require_once '../includes/conection.php';

    try {

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
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image, r.createur_nom_utilisateur FROM recettes AS r");
                            $requete->execute();
                        break;
                        case 'Favoris':
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image, r.createur_nom_utilisateur FROM recettes AS r INNER JOIN recettes_sauvegardees AS r_s ON r.id = r_s.recette_id WHERE r_s.nom_utilisateur = :identifiant");
                            $requete->execute([':identifiant' => $identifiant]);
                            break;
                        case 'miennes':
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image, r.createur_nom_utilisateur FROM recettes AS r WHERE r.createur_nom_utilisateur = :identifiant");
                            $requete->execute([':identifiant' => $identifiant]);
                            break;
                        default:
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image, r.createur_nom_utilisateur FROM recettes AS r INNER JOIN Recettes_Restrictions AS r_r ON r.id = r_r.recette_id INNER JOIN Restrictions AS res ON r_r.restriction_id = res.id WHERE res.nom = :restriction");
                            $requete->execute([':restriction' => $filtreRestriction]);
                            break;
                    }
                }else{
                    switch ($filtreRestriction) {
                        case 'tout': 
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image, r.createur_nom_utilisateur FROM recettes AS r WHERE r.type = :typeChoisi");
                            $requete->execute([':typeChoisi' => $filtreType]);
                            break;
                        case 'Favoris':
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image, r.createur_nom_utilisateur FROM recettes AS r INNER JOIN recettes_sauvegardees AS r_s ON r.id = r_s.recette_id WHERE r_s.nom_utilisateur = :identifiant AND r.type = :typeChoisi");
                            $requete->execute([':identifiant' => $identifiant, ':typeChoisi' => $filtreType]);
                            break;
                        case 'miennes':
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image, r.createur_nom_utilisateur FROM recettes AS r WHERE r.createur_nom_utilisateur = :identifiant AND r.type = :typeChoisi");
                            $requete->execute([':identifiant' => $identifiant, ':typeChoisi' => $filtreType]);
                            break;
                        default:
                            $requete = $pdo->prepare("SELECT r.id, r.nom, r.temps_de_cuisson, r.type, r.image, r.createur_nom_utilisateur FROM recettes AS r INNER JOIN Recettes_Restrictions AS r_r ON r.id = r_r.recette_id INNER JOIN Restrictions AS res ON r_r.restriction_id = res.id WHERE res.nom = :restriction AND r.type = :typeChoisi");
                            $requete->execute([':restriction' => $filtreRestriction, ':typeChoisi' => $filtreType]);
                            break;
                    }
                }

                //On récupère les résultats de la requête et on les encode en JSON
                $resultat = $requete->fetchAll(PDO::FETCH_ASSOC);
                foreach ($resultat as &$recette) {
                    // Convertir l'image BLOB en base64 si elle existe
                    if (!empty($recette['image'])) {
                        $recette['image'] = base64_encode($recette['image']);
                    }

                }

                //Récupéré les recettes sauvegardées (aimé) par l'utilisateur
                $requeteLike = $pdo->prepare("SELECT recette_id FROM Recettes_Sauvegardees WHERE nom_utilisateur = :identifiant");
                $requeteLike->execute([':identifiant' => $identifiant]);
                $recettesLike = $requeteLike->fetchAll(PDO::FETCH_COLUMN, 0);

                
                echo json_encode(['statut' => 'success', 'listeRecette' => $resultat, 'listeRecetteAime' => $recettesLike]);
                exit();

            //Erreur de la requête SQL
            }catch(PDOException $e){
                http_response_code(400); 
                echo json_encode(['statut' => 'error', 'message' => 'Le type et/ou la restrictions fournis n\'est pas valide.']);
                exit();
            }

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


//Route pour récupérer une recette spécifique avec toutes c'est informations (détail recette + liste des ingrédients + liste des étapes + liste de restricctions)
$router->post('/CreationRecettes.php/recuperer-recette-complete', function () {
    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    try {

        // extraire les éléments de l'objet JSON
        $data_json = file_get_contents("php://input");
        $data = json_decode($data_json, true);

        $identifiant = trim($data['identifiant']);
        $motDePasse = trim($data['motDePasse']);
        $idRecette = trim($data['idRecette']);

        //Si le client exite dans la base de donnée, on récupère les recettes dans la base de données selon les filtres données
        if(validateUserCredentials($identifiant, $motDePasse, $pdo)){

            // Récupérer la recette
            $requete = $pdo->prepare("SELECT * FROM Recettes WHERE id=:id");
            $requete->execute(['id' => $idRecette]);
            $resultat = $requete->fetch();


            if ($resultat) {
                // Convertir l'image BLOB en base64 si elle existe
                if (!empty($resultat['image'])) {
                    $resultat['image'] = base64_encode($resultat['image']);
                }

            } else {
                echo json_encode(["statut" => "error", "message" => "Recette non trouvée"]);
                exit();
            }

            //Récupérer les ingrédients de la recette
            $requeteIngredient = $pdo->prepare("SELECT i.nom, r_i.quantite, r_i.unite_de_mesure FROM Recettes_Ingredients AS r_i INNER JOIN Ingredients AS i ON r_i.ingredient_id = i.id WHERE r_i.recette_id = :idRecette");
            $requeteIngredient->execute(['idRecette' => $idRecette]);
            $ingredients = $requeteIngredient->fetchAll(PDO::FETCH_ASSOC);

            //Récupérer les étapes de la recette (uniquement le texte)
            $requeteEtape = $pdo->prepare("SELECT texte FROM Recettes_Etapes WHERE recette_id = :idRecette ORDER BY numero_etape ASC");
            $requeteEtape->execute(['idRecette' => $idRecette]);
            $etapes = $requeteEtape->fetchAll(PDO::FETCH_COLUMN, 0);

            //Récupérer les restrictions de la recette (uniquement le nom)
            $requeteRestriction = $pdo->prepare("SELECT r.nom FROM Restrictions AS r INNER JOIN Recettes_Restrictions AS r_r ON r.id = r_r.restriction_id WHERE r_r.recette_id = :idRecette");
            $requeteRestriction->execute(['idRecette' => $idRecette]);
            $restrictions = $requeteRestriction->fetchAll(PDO::FETCH_COLUMN, 0);

            //Renvoyer la recette complète
            $resultat['ingredients'] = $ingredients;
            $resultat['etapes'] = $etapes;
            $resultat['restrictions'] = $restrictions;
            echo json_encode(["statut" => "success", "recetteComplete" => $resultat]);
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


// Route pour ajouter une like (sauvegarder) une recette
$router->post('/CreationRecettes.php/ajouter-recette-aime', function() {

    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    try {
        //extraire les éléments de l'objet JSON
        $data_json = file_get_contents("php://input");
        $data = json_decode($data_json, true);

        $identifiant = trim($data['identifiant']);
        $motDePasse = trim($data['motDePasse']);
        $idRecette = trim($data['idRecette']);

        //Si le client exite dans la base de donnée, on ajoute la recette à ses recettes aimées
        if(validateUserCredentials($identifiant, $motDePasse, $pdo)){
            $requete = $pdo->prepare("INSERT INTO recettes_sauvegardees (recette_id, nom_utilisateur) VALUES (:idRecette, :nom_utilisateur)");
            $requete->execute([':idRecette' => $idRecette, ':nom_utilisateur' => $identifiant]);
            echo json_encode(['statut' => 'success']);
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


// Route pour supprimer une like (sauvegarder) une recette
$router->delete('/CreationRecettes.php/delete-recette-aime', function() {

    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    try {
        //extraire les éléments de l'objet JSON
        $data_json = file_get_contents("php://input");
        $data = json_decode($data_json, true);

        $identifiant = trim($data['identifiant']);
        $motDePasse = trim($data['motDePasse']);
        $idRecette = trim($data['idRecette']);

        //Si le client exite dans la base de donnée, on ajoute la recette à ses recettes aimées
        if(validateUserCredentials($identifiant, $motDePasse, $pdo)){
            $requete = $pdo->prepare("DELETE FROM recettes_sauvegardees WHERE recette_id = :idRecette AND nom_utilisateur = :nom_utilisateur");
            $requete->execute([':idRecette' => $idRecette, ':nom_utilisateur' => $identifiant]);
            echo json_encode(['statut' => 'success']);
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


/**
 * Vérifier si l'usager est valide
 * @param string $identifiant L'identifiant de l'utilisateur
 * @param string $motDePasse Le mot de passe de l'utilisateur
 * @param PDO $pdo L'objet PDO pour la connexion à la base de données
 * @return boolean Vraie si l'utilisateur est valide, faux sinon
 */
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

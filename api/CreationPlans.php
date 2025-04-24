<?php
require_once 'Router.php'; 
// Inclure la connexion à la base de données

$router = new Router();

// Route pour récupérer les recettes (GET)
$router->get('/CreationPlans.php/recettes', function () {
    header('Content-Type: application/json');
    try {
        require '../includes/conection.php';
        // Récupérer les ingrédients depuis la base de données
        $stmt = $pdo->query("SELECT 
    r.id,
    r.nom,
    r.description,
    r.type,
    r.difficulter,
    r.temps_de_cuisson,
    r.portions,
    r.createur_nom_utilisateur,
    COUNT(DISTINCT e.id) AS nombre_etapes,
    COUNT(DISTINCT ri.ingredient_id) AS nombre_ingredients
    FROM Recettes r
    LEFT JOIN Recettes_Restrictions rr ON r.id = rr.recette_id
    LEFT JOIN Recettes_Etapes e ON r.id = e.recette_id
    LEFT JOIN Recettes_Ingredients ri ON r.id = ri.recette_id
    GROUP BY r.id;");
        $recettes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Retourner les ingrédients en format JSON
        echo json_encode($recettes);
    } catch (PDOException $e) {
        // Si une erreur se produit, renvoyer une erreur JSON
        echo json_encode(["error" => "Erreur lors de la récupération des recettes", "details" => $e->getMessage()]);
    }
});

// Route pour créer ou modifier un plan (POST)
$router->post('/CreationPlans.php/plans/creer', function () {
    header('Content-Type: application/json');
    require '../includes/conection.php';

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
            // Si vous modifiez un plan
            if ($infos["edit"] === "true") {
                $requete = $pdo->prepare("DELETE FROM Plan_de_repas WHERE id = :plan_id ;");
                $requete->execute(['plan_id' => $infos["id"]]);
            }

                // Ajout d'un nouveau plan

                $pdo = new PDO(
                    "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8",
                    $config['username'],
                    $config['password'],
                    $options
                );
                $requete = $pdo->prepare("INSERT INTO Plan_de_repas (nom_utilisateur, titre, descriptions)
                                           VALUES ( :nom_utilisateur,:titre, :descriptions )");

                $requete->execute(['nom_utilisateur' => $infos["username"],
                                    'titre' => $infos["titre"],
                                    'descriptions' => $infos["description"]
                                ]);

                // Récupérer l'ID du plan ajouté
                $plan_id = $pdo->lastInsertId();

                // Insérer les recettes dans la table Recettes_Planifiees
                for ($i=0;$i<count($infos['recettes']); $i++) {
                    $journee="";
                switch ($i) {
                    case 0: $journee = 'Lundi'; break;
                    case 1: $journee = 'Mardi'; break;
                    case 2: $journee = 'Mercredi'; break;
                    case 3: $journee = 'Jeudi'; break;
                    case 4: $journee = 'Vendredi'; break;
                    case 5: $journee = 'Samedi'; break;
                    case 6: $journee = 'Dimanche'; break;
                    default: $journee = 'ERROR'; break;
                }
                    $pdo = new PDO(
                        "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8",
                        $config['username'],
                        $config['password'],
                        $options
                    );
                    
                    $requete = $pdo->prepare("INSERT INTO Repas_Planifies (plan_id, recette_id, journee, heure)
                                            VALUES (:plan_id, :recette_id, :journee, :heure)");

                    foreach ($infos["recettes"][$i] as $recettesJournee) {
                        $requete->execute([
                            'plan_id' => $plan_id,
                            'recette_id' => $recettesJournee["id"],
                            'journee' => $journee,
                            'heure' => $recettesJournee["heure"]
                        ]);
                }
            }
                echo json_encode(["status" => "ok", "message" => "Plan ajouté"]);

        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur base de données", "details" => $e->getMessage()]);
        }
});

// Route pour la récupération de plans
$router->post('/CreationPlans.php/plans/{plan}', function ($plan) {

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

        // Récupérer le plan
        $requete = $pdo->prepare("SELECT p.titre, p.descriptions, p.id AS plan_id,  p.nom_utilisateur, rp.journee, DATE_FORMAT(rp.heure, '%H:%i') AS heure, r.id AS recette_id, r.nom AS recette_nom,
    r.description, r.type, r.difficulter, r.temps_de_cuisson, r.portions
    FROM Plan_de_repas p JOIN Repas_Planifies rp ON p.id = rp.plan_id JOIN Recettes r ON rp.recette_id = r.id WHERE p.id = :id
    ORDER BY  FIELD(rp.journee, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'), rp.heure;
    ");
        $requete->execute(['id' => $plan]);
        $resultat = $requete->fetchAll(PDO::FETCH_ASSOC);

        if ($resultat) {
            echo json_encode($resultat);
        } else {
            echo json_encode(["error" => true, "message" => "Plan non trouvé"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["error" => true, "message" => "Erreur de base de données", "details" => $e->getMessage()]);
    }
});

// Route pour la suppression de plans
$router->post('/CreationPlans.php/planSupprimer/', function () {

    header('Content-Type: application/json');
    require '../includes/conection.php';

    $packet = file_get_contents("php://input");
    $infos = json_decode($packet, true);

    // Vérifier si l'identifiant du plan est présent
    if (isset($infos["id"])) {
        try {
            $pdo = new PDO(
                "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8",
                $config['username'],
                $config['password'],
                $options
            );
            // Suppression du plan de repas
            $requete = $pdo->prepare("DELETE FROM Plan_de_repas WHERE id=:id");
            $requete->execute(['id' => $infos["id"]]);

            echo json_encode(["success" => true, "message" => "Plan supprimé"]);
        } catch (PDOException $e) {
            echo json_encode(["error" => true, "message" => "Erreur de base de données", "details" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["error" => true, "message" => "Impossible de supprimer le plan"]);
    }
});

/**
 * Vérifier si l'usager est valide
 * @param string $identifiant L'identifiant de l'utilisateur
 * @param string $motDePasse Le mot de passe de l'utilisateur
 * @param PDO $pdo L'objet PDO pour la connexion à la base de données
 * @return boolean Vraie si l'utilisateur est valide, faux sinon
 */
function validateUserCredentials($identifiant, $motDePasse) {
        // Connexion à la base de données
    require '../includes/conection.php';
    $pdo = new PDO(
        "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8",
        $config['username'],
        $config['password'],
        $options
    );
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

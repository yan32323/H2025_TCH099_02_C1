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
                // on cree une nouvelle recette
                $requete = $pdo->prepare("INSERT INTO Recettes (titre, description, ingredients, etapes, image, createur_nom_utilisateur, difficulte) VALUES (:titre, :description, :ingredients, :etapes, :image, :username, :difficulte)");

                $requete->execute(['titre' => $infos["titre"], 'description' => $infos["description"], 'ingredients' => $infos["ingredients"], 'etapes' => $infos["etapes"], 'image' => $infos["image"], 'username' => $infos["username"], 'difficulte' => $infos["difficulte"]]);

                $resultat = $requete->fetchAll();

                echo json_encode($resultat);
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

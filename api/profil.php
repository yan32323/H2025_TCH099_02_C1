<?php

require_once 'Router.php';
$router = new Router();


$router->post('/profil.php/afficher', function () {

    header("Content-Type: application/json");
    include '../includes/config.php';
    include '../includes/conection.php';

    $data = json_decode(file_get_contents("php://input"), true);
    $userId = $data['user'] ?? null;
    $userConnecte = $data['nom_utilisateur'] ?? null;

    // Récupérer les infos du client
    $stmtClient = $pdo->prepare("SELECT nom_utilisateur, nom, prenom, COALESCE(description, 'Aucune Description') AS description FROM Clients WHERE nom_utilisateur = ?");
    $stmtClient->execute([$userId]);
    $client = $stmtClient->fetch(PDO::FETCH_ASSOC);

    if (!$client) {
        echo json_encode(["success" => false, "message" => "Utilisateur introuvable"]);
        exit;
    }

    // Récupérer les recettes créées par ce client
    $stmtRecettes = $pdo->prepare("SELECT id, nom, description, image FROM Recettes WHERE createur_nom_utilisateur = ?");
    $stmtRecettes->execute([$userId]);
    $recettes = $stmtRecettes->fetchAll(PDO::FETCH_ASSOC);

    // Vérifier et convertir l'image en base64 si elle existe
    foreach ($recettes as &$recette) {
        if ($recette['image']) {
            $recette['image'] = base64_encode($recette['image']);
        }
    }

    if (!$recettes) {
        $recettes = [];
    }

    echo json_encode([
        "success" => true,
        "profil" => [
            "utilisateur" => $client,
            "recettes" => $recettes,
            "est_connecte" => $userConnecte ?? null
        ]
    ]);
});

//Route pour afficher les informations d'un usager
$router->post('/profil.php/afficher-compte/', function () {
    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    try {
        //extraire les éléments de l'objet JSON
        $data_json = file_get_contents("php://input");
        $data = json_decode($data_json, true);

        $identifiant = trim($data['identifiant']);
        $motDePasse = trim($data['motDePasse']);
        $userAVoir = trim($data['userAVoir']); //Usager qu'on veut afficher

        //Si le client exite dans la base de donnée, on récupère ses produits du stock_ingredients
        if(validateUserCredentials($identifiant, $motDePasse, $pdo)){
            $requete = $pdo->prepare("SELECT nom, prenom, COALESCE(description, 'Aucune Description') AS description 
            FROM Clients WHERE nom_utilisateur = :nom_utilisateur");
            $requete->execute([':nom_utilisateur' => $userAVoir]);
            $client = $requete->fetch(PDO::FETCH_ASSOC);
            if($client){
                echo json_encode(['statut' => 'success','client' => $client]);
                exit();
            }else{
                //Cas où l'usager n'existe pas dans la base de donnée
                http_response_code(404); 
                echo json_encode(['statut' => 'error', 'message' => 'Utilisateur introuvable.']);
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

$router->post('/profil.php/suivre-user', function () {
    header("Content-Type: application/json; charset=UTF-8");
    require_once '../includes/conection.php';

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Vérification du statut de suivi
        if (isset($_GET['suivi_id']) && isset($_GET['nom_utilisateur'])) {
            $suivi_id = $_GET['suivi_id'];
            $nom_utilisateur = $_GET['nom_utilisateur'];

            $stmt = $pdo->prepare("SELECT COUNT(*) FROM utilisateurs_suivi WHERE nom_utilisateur = :nom_utilisateur AND user_suivi_id = :suivi_id");
            $stmt->execute([
                ':nom_utilisateur' => $nom_utilisateur,
                ':suivi_id' => $suivi_id
            ]);
            $suivi = $stmt->fetchColumn() > 0;

            echo json_encode([
                "suivi" => $suivi
            ]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Paramètres GET requis manquants."]);
        }

    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['action'])) {
            http_response_code(400);
            echo json_encode(["message" => "Action non spécifiée."]);
            exit;
        }

        if ($data['action'] === "verifier_suivi") {
            if (isset($data['suivi_id']) && isset($data['nom_utilisateur'])) {
                $suivi_id = $data['suivi_id'];
                $nom_utilisateur = $data['nom_utilisateur'];

                $stmt = $pdo->prepare("SELECT COUNT(*) FROM utilisateurs_suivi WHERE nom_utilisateur = :nom_utilisateur AND user_suivi_id = :suivi_id");
                $stmt->execute([
                    ':nom_utilisateur' => $nom_utilisateur,
                    ':suivi_id' => $suivi_id
                ]);
                $suivi = $stmt->fetchColumn() > 0;

                echo json_encode(["suivi" => $suivi]);
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Paramètres requis manquants pour vérification."]);
            }
        } elseif ($data['action'] === "ajouter_suivi") {
            if (isset($data['suivi_id']) && isset($data['nom_utilisateur'])) {
                $suivi_id = $data['suivi_id'];
                $nom_utilisateur = $data['nom_utilisateur'];

                try {
                    $stmt = $pdo->prepare("INSERT INTO utilisateurs_suivi (nom_utilisateur, user_suivi_id) VALUES (:nom_utilisateur, :suivi_id)");
                    $stmt->execute([
                        ':nom_utilisateur' => $nom_utilisateur,
                        ':suivi_id' => $suivi_id
                    ]);

                    echo json_encode(["success" => true, "message" => "Suivi effectué avec succès."]);
                } catch (PDOException $e) {
                    http_response_code(500);
                    echo json_encode(["success" => false, "message" => "Erreur SQL : " . $e->getMessage()]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Paramètres requis manquants pour ajout."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Action inconnue."]);
        }
    } else {
        http_response_code(405);
        echo json_encode(["message" => "Méthode non autorisée."]);
    }
});
$router->post('/profil.php/modifier',function(){
    header("Content-Type: application/json; charset=UTF-8");
    include '../includes/config.php';
    include '../includes/conection.php';

    $data = json_decode(file_get_contents("php://input"), true);
    $userId = $data['nom_utilisateur'] ?? null;
    $new_username = $data['new_username'] ?? null;
    $description = $data['new_description'] ?? null;
    $imagebase64 = $data['new_imagebase64'] ?? null;

    if($new_username != null){

        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM Clients WHERE nom_utilisateur = :new_username");
        $stmtCheck->execute([':new_username' => $new_username]);
        $count = $stmtCheck->fetchColumn();

        if ($count != 1) {
            $stmtUpdate = $pdo->prepare("UPDATE Clients SET nom_utilisateur = :new_username WHERE nom_utilisateur = :current_username");
            $stmtUpdate->execute([
                ':new_username' => $new_username,
                ':current_username' => $userId
            ]);
            echo json_encode(["success" => true, "message" => "Nom d'utilisateur mis à jour avec succès.", "changedUsername" => true, "newUsername" => $new_username]);
        } else {
            echo json_encode(["success" => false, "message" => "Le nouveau nom d'utilisateur est déjà pris."]);
        }
    
    }

    if($description != null){
        $stmt = $pdo->prepare("UPDATE Clients SET description = :description WHERE nom_utilisateur = :nom_utilisateur");
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':nom_utilisateur', $userId);
        $stmt->execute();
    }
});

//Route pour modifier le mot de passe, l'identifiant et la description d'un usager (vérifie que le nouvelle identifiant n'est pas déjà utilisé)
$router->post('/profil.php/modifer-client/', function(){


    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    try {
        //extraire les éléments de l'objet JSON
        $data_json = file_get_contents("php://input");
        $data = json_decode($data_json, true);

        $identifiant = trim($data['identifiant']);
        $motDePasse = trim($data['motDePasse']);
        $nouveau_identifiant = trim($data['nouveau_identifiant']);
        $nouveau_motDePasse = trim($data['nouveau_motDePasse']);
        $description = trim($data['description']);

        //Si le client exite dans la base de donnée, on récupère ses produits du stock_ingredients
        if(validateUserCredentials($identifiant, $motDePasse, $pdo)){

            //Vérifier si le nouvel identifiant est déjà utilisé et si le mot de passe respecte les règles
            $erreurs = [];
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM clients WHERE nom_utilisateur = :identifiant");
            $stmt->execute(['identifiant' => $nouveau_identifiant]);
            $count = $stmt->fetchColumn();
            if ($count > 0) {
                $erreurs[] = "Cet identifiant est déjà utilisé.\n";
            }

            // Password Validation (same rules as client-side and gestion_inscription.php)
            if (strlen($nouveau_motDePasse) < 8 || strlen($nouveau_motDePasse) > 32) {
                $erreurs[] = "Le mot de passe doit contenir entre 8 et 32 caractères.";
            }
            if (!preg_match('/[A-Z]/', $nouveau_motDePasse)) {
                $erreurs[] = "Le mot de passe doit contenir au moins une majuscule.";
            }
            if (!preg_match('/[a-z]/', $nouveau_motDePasse)) {
                $erreurs[] = "Le mot de passe doit contenir au moins une minuscule.";
            }
            if (!preg_match('/[0-9]/', $nouveau_motDePasse)) {
                $erreurs[] = "Le mot de passe doit contenir au moins un chiffre.";
            }

            if (!empty($erreurs)) {
                echo json_encode(['statut' => 'error', 'message' => implode(" ", $erreurs)]); // Send back validation errors
                exit();
            }

            //L'identifiant n'est pas déjà utilisé et le mot de passe respecte les règles
            //On peut donc modifier les informations de l'utilisateur
            try{
                // Password Hashing
                $motDePasseHash = password_hash($nouveau_motDePasse, PASSWORD_DEFAULT);

                // Changer les informations de l'utilisateur
                $requete = $pdo->prepare("UPDATE Clients SET nom_utilisateur = :nouveau_identifiant, mot_de_passe = :mot_de_passe, description = :description WHERE nom_utilisateur = :identifiant");
                $requete->execute([
                    ':nouveau_identifiant' => $nouveau_identifiant,
                    ':mot_de_passe' => $motDePasseHash,
                    ':description' => $description,
                    ':identifiant' => $identifiant
                ]);
                echo json_encode(['statut' => 'success']);
                exit();

            //Erreur si l'identifiant est déjà utiliser
            }catch (PDOException $e) {
                http_response_code(400); 
                echo json_encode(['statut' => 'error', 'message' => 'Erreur d\éxécution de l\'update']);
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

$router->post('/profil.php/nb-abonne-nb-abonnement', function () {
    header("Content-Type: application/json; charset=UTF-8");
    include '../includes/conection.php';

    $data = json_decode(file_get_contents("php://input"), true);
    $userId = $data['user'] ?? null;

    // Récupérer le nombre d'abonnés
    $stmtAbonnes = $pdo->prepare("SELECT COUNT(*) AS nb_abonnes FROM utilisateurs_suivi WHERE user_suivi_id = ?");
    $stmtAbonnes->execute([$userId]);
    $nbAbonnes = $stmtAbonnes->fetchColumn();

    // Récupérer le nombre d'abonnements
    $stmtAbonnements = $pdo->prepare("SELECT COUNT(*) AS nb_abonnements FROM utilisateurs_suivi WHERE nom_utilisateur = ?");
    $stmtAbonnements->execute([$userId]);
    $nbAbonnements = $stmtAbonnements->fetchColumn();

    echo json_encode([
        "success" => true,
        "nb_abonnes" => (int)$nbAbonnes,
        "nb_abonnements" => (int)$nbAbonnements
    ]);
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

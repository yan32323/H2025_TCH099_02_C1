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

// Acheminer la requête
$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);

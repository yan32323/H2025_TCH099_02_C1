<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once '../includes/conection.php';

if (!isset($_GET['user'])) {
    echo json_encode(["success" => false, "message" => "ID de user manquant"]);
    exit;
}

$utilisateur = $_GET['user'];

// Récupérer les infos du client
$stmtClient = $pdo->prepare("SELECT nom_utilisateur, nom, prenom, COALESCE(description, 'Aucune Description') AS description FROM Clients WHERE nom_utilisateur = ?");
$stmtClient->execute([$utilisateur]);
$client = $stmtClient->fetch(PDO::FETCH_ASSOC);

if (!$client) {
    echo json_encode(["success" => false, "message" => "Utilisateur introuvable"]);
    exit;
}

// Récupérer les recettes créées par ce client
$stmtRecettes = $pdo->prepare("SELECT id, nom, description, image FROM Recettes WHERE createur_nom_utilisateur = ?");
$stmtRecettes->execute([$utilisateur]);
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
        "est_connecte" => $_SESSION['user_id'] ?? null
    ]
]);
?>

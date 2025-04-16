<?php
session_start();
header("Content-Type: application/json");
require_once '../includes/conection.php';

if (!isset($_GET['user'])) {
    echo json_encode(["success" => false, "message" => "ID de user manquant"]);
    exit;
}

$utilisateur = $_GET['user'];

// Récupérer les infos du client
$stmtClient = $pdo->prepare("SELECT nom_utilisateur, nom, prenom, description FROM Clients WHERE nom_utilisateur = ?");
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

echo json_encode([
    "success" => true,
    "profil" => [
        "utilisateur" => $client,
        "recettes" => $recettes,
        "est_connecte" => $_SESSION['user_id'] ?? null
    ]
]);
?>

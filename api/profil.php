<?php
header("Content-Type: application/json");
include '../includes/config.php';
include '../includes/conection.php';

$data = json_decode(file_get_contents("php://input"), true);
$userId = $data['user'] ?? null;
$userConnecte = $data['nom_utilisateur'] ?? null;

// Récupérer les infos du client
$stmtClient = $pdo->prepare("SELECT nom_utilisateur, nom, prenom, COALESCE(description, 'Aucune Description') AS description FROM Clients WHERE nom_utilisateur = ?");
$stmtClient->execute([$userConnecte]);
$client = $stmtClient->fetch(PDO::FETCH_ASSOC);

if (!$client) {
    echo json_encode(["success" => false, "message" => "Utilisateur introuvable"]);
    exit;
}

// Récupérer les recettes créées par ce client
$stmtRecettes = $pdo->prepare("SELECT id, nom, description, image FROM Recettes WHERE createur_nom_utilisateur = ?");
$stmtRecettes->execute([$userConnecte]);
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
?>

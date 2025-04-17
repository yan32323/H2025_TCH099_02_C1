<?php
session_start();
header("Content-Type: application/json");
require_once '../includes/conection.php';

if (!isset($_GET['id'])) {
    echo json_encode(["success" => false, "message" => "ID de recette manquant"]);
    exit;
}

$id = intval($_GET['id']);

// Récupérer les infos de la recette
$sql = "SELECT r.*, c.nom AS nom_client, c.prenom 
        FROM Recettes r
        JOIN Clients c ON r.createur_nom_utilisateur = c.nom_utilisateur
        WHERE r.id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$id]);
$recette = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$recette) {
    echo json_encode(["success" => false, "message" => "Recette non trouvée"]);
    exit;
}

// Récupérer les ingrédients
$sqlIng = "SELECT i.nom, ri.quantite, 
                  COALESCE(ri.unite_de_mesure, i.unite_de_mesure) AS unite 
           FROM Recettes_Ingredients ri
           JOIN Ingredients i ON ri.ingredient_id = i.id
           WHERE ri.recette_id = ?";
$stmtIng = $pdo->prepare($sqlIng);
$stmtIng->execute([$id]);
$ingredients = $stmtIng->fetchAll(PDO::FETCH_ASSOC);

// Récupérer les étapes
$sqlEtapes = "SELECT numero_etape, texte 
              FROM Recettes_Etapes 
              WHERE recette_id = ? 
              ORDER BY numero_etape";
$stmtEtapes = $pdo->prepare($sqlEtapes);
$stmtEtapes->execute([$id]);
$etapesBrutes = $stmtEtapes->fetchAll(PDO::FETCH_ASSOC);


// Reformater les étapes
$etapes = [];
foreach ($etapesBrutes as $etape) {
    $etapes[] = [
        "numero_etape" => $etape["numero_etape"],
        "titre" => "Étape " . $etape["numero_etape"],
        "description" => $etape["texte"]
    ];
}

// Encoder l’image de la recette si elle existe
$recette["image"] = $recette["image"] ? base64_encode($recette["image"]) : null;

// Récupérer les commentaires
$sqlCommentaires = "SELECT c.id, c.texte, c.date_commentaire, cl.nom, cl.prenom, c.nb_likes, c.nom_utilisateur
                    FROM Commentaires c
                    JOIN Clients cl ON c.nom_utilisateur = cl.nom_utilisateur
                    WHERE c.recette_id = ? 
                    ORDER BY c.nb_likes DESC";
$stmtCommentaires = $pdo->prepare($sqlCommentaires);
$stmtCommentaires->execute([$id]);
$commentaires = $stmtCommentaires->fetchAll(PDO::FETCH_ASSOC);
foreach ($commentaires as &$commentaire) {
    $commentaire['a_deja_like'] = false;
    if ($_SESSION['user_id']) {
        // Vérifie si l'utilisateur a déjà liké
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM Likes_Commentaires WHERE nom_utilisateur = ? AND commentaire_id = ?");
        $stmt->execute([$_SESSION['user_id'], $commentaire['id']]);
        $commentaire['a_deja_like'] = $stmt->fetchColumn() > 0;
    }
}


// Ajouter les commentaires à la réponse JSON
$recette["commentaires"] = $commentaires;

echo json_encode([
    "success" => true,
    "recette" => [
        "id" => $recette["id"],
        "nom" => $recette["nom"],
        "description" => $recette["description"],
        "type" => null, // Champ "type" non présent dans la table actuelle
        "temps_preparation" => $recette["temps_de_cuisson"],
        "portions" => null, // Champ "portions" non présent dans la table actuelle
        "image" => $recette["image"],
        "createur" => [
            "nom" => $recette["nom_client"],
            "prenom" => $recette["prenom"],
            "nom_utilisateur" => $recette["createur_nom_utilisateur"]
        ],
        "ingredients" => $ingredients,
        "etapes" => $etapes,
        "commentaires" => $recette["commentaires"],
        "user_connecte" => $_SESSION['user_id'] ?? null
    ],
    "user_id" => $_SESSION['user_id'] ?? null
]);

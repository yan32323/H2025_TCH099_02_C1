<?php
header("Content-Type: application/json; charset=UTF-8");
require_once '../includes/conection.php';

// Lire le corps JSON brut
$input = json_decode(file_get_contents("php://input"), true);

// Vérifie si les données nécessaires sont présentes
if (!isset($input['id']) || !isset($input['nom_utilisateur'])) {
    echo json_encode(["success" => false, "message" => "Paramètres requis manquants"]);
    exit;
}
$id = intval($input['id']);
$nom_utilisateur = $input['nom_utilisateur'];

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
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM Likes_Commentaires WHERE nom_utilisateur = ? AND commentaire_id = ?");
    $stmt->execute([$nom_utilisateur, $commentaire['id']]);
    $commentaire['a_deja_like'] = $stmt->fetchColumn() > 0;
}

// Récupérer la moyenne des notes et le nombre de votes
$stmtNote = $pdo->prepare("SELECT ROUND(AVG(note), 1) AS moyenne_notes, COUNT(*) AS nb_votes FROM Recettes_Notes WHERE recette_id = :recette_id");
$stmtNote->execute(['recette_id' => $id]);
$noteInfo = $stmtNote->fetch(PDO::FETCH_ASSOC);
$moyenne = $noteInfo['moyenne_notes'] !== null ? $noteInfo['moyenne_notes'] : null;
$nbVotes = $noteInfo['nb_votes'] ?? 0;

// Vérifier si l'utilisateur a déjà voté
$stmtDejaVote = $pdo->prepare("SELECT COUNT(*) FROM Recettes_Notes WHERE nom_utilisateur = ? AND recette_id = ?");
$stmtDejaVote->execute([$nom_utilisateur, $id]);
$deja_vote = $stmtDejaVote->fetchColumn() > 0;

// Réponse JSON
echo json_encode([
    "success" => true,
    "recette" => [
        "id" => $recette["id"],
        "nom" => $recette["nom"],
        "description" => $recette["description"],
        "type" => null, // Champ "type" non présent dans la table actuelle
        "difficulte" => $recette["difficulter"],
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
        "commentaires" => $commentaires,
        "moyenne_note" => $moyenne,
        "nombre_votes" => $nbVotes,
        "user_connecte" => $nom_utilisateur,
        "a_vote" => $deja_vote
    ],
    "user_id" => $nom_utilisateur
]);

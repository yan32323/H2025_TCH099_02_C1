<?php
// Inclure la configuration de la base de données
include '../includes/config.php';
include '../includes/conection.php';

// Démarrer la session pour accéder aux variables de session
session_start();

$donneesJSON = json_decode(file_get_contents("php://input"), true);

// Récupérer les données avec null par défaut
$commentaire = $donneesJSON['commentaire'] ?? null;
$recetteId = $donneesJSON['recette_id'] ?? null;
$nomUtilisateur = $_SESSION['user_id'];

// Validation simple
if (empty($commentaire) || empty($recetteId)) {
    echo json_encode(['success' => false, 'message' => 'Le commentaire ou l\'ID de la recette est manquant.']);
    exit;
}

try {
    // Préparer la requête d'insertion avec le nom d'utilisateur
    $stmt = $pdo->prepare("INSERT INTO Commentaires (recette_id, nom_utilisateur, texte, date_commentaire) VALUES (?, ?, ?, NOW())");
    $stmt->execute([$recetteId, $nomUtilisateur, $commentaire]);

    echo json_encode(['success' => true, 'message' => 'Commentaire ajouté avec succès.']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'ajout du commentaire : ' . $e->getMessage()]);
}
?>

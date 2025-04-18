<?php
// Inclure la configuration de la base de données
include '../includes/config.php';
include '../includes/conection.php';

// Lire les données JSON
$donneesJSON = json_decode(file_get_contents("php://input"), true);

// Récupérer les données avec null par défaut
$commentaire = $donneesJSON['commentaire'] ?? null;
$recetteId = $donneesJSON['recette_id'] ?? null;
$nomUtilisateur = $donneesJSON['nom_utilisateur'] ?? null;

// Validation simple
if (empty($commentaire) || empty($recetteId) || empty($nomUtilisateur)) {
    echo json_encode([
        'success' => false,
        'message' => 'Le commentaire, l\'ID de la recette ou le nom d\'utilisateur est manquant.'
    ]);
    exit;
}

try {
    // Préparer la requête d'insertion
    $stmt = $pdo->prepare("INSERT INTO Commentaires (recette_id, nom_utilisateur, texte, date_commentaire) VALUES (?, ?, ?, NOW())");
    $stmt->execute([$recetteId, $nomUtilisateur, $commentaire]);

    echo json_encode([
        'success' => true,
        'message' => 'Commentaire ajouté avec succès.'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de l\'ajout du commentaire : ' . $e->getMessage()
    ]);
}

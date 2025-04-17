<?php
require_once '../includes/conection.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Utilisateur non connecté']);
    exit;
}

$idUtilisateur = $_SESSION['user_id'];
$recette_id = $_POST['recette_id'] ?? null;
$note = $_POST['note'] ?? null;

if (!$recette_id || !$note) {
    echo json_encode(['success' => false, 'message' => 'Données incomplètes']);
    exit;
}

try {
    // Vérifier si déjà notée
    $stmt = $pdo->prepare("SELECT * FROM Recettes_Notes WHERE nom_utilisateur = ? AND recette_id = ?");
    $stmt->execute([$idUtilisateur, $recette_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Vous avez déjà noté cette recette']);
        exit;
    }

    // Insérer la note
    $stmt = $pdo->prepare("INSERT INTO Recettes_Notes (nom_utilisateur, recette_id, note) VALUES (?, ?, ?)");
    $stmt->execute([$idUtilisateur, $recette_id, $note]);

    // Recalculer moyenne et nombre de votes
    $stmt = $pdo->prepare("SELECT AVG(note) as moyenne, COUNT(*) as total FROM Recettes_Notes WHERE recette_id = ?");
    $stmt->execute([$recette_id]);
    $row = $stmt->fetch();

    echo json_encode([
        'success' => true,
        'nouvelle_moyenne' => round($row['moyenne'], 1),
        'nouveau_nombre_votes' => $row['total']
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}

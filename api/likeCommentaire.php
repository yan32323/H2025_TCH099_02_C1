<?php
session_start();
require_once '../includes/conection.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $id_commentaire = $_POST["id_commentaire"] ?? null;
    $nom_utilisateur = $_SESSION['user_id'] ?? null;

    if (!$id_commentaire || !$nom_utilisateur) {
        echo json_encode(["success" => false, "message" => "Paramètres manquants."]);
        exit;
    }

    try {
        // Vérifie si ce like existe déjà
        $stmt = $pdo->prepare("SELECT * FROM Likes_Commentaires WHERE commentaire_id = ? AND nom_utilisateur = ?");
        $stmt->execute([$id_commentaire, $nom_utilisateur]);

        if ($stmt->fetch()) {
            echo json_encode(["success" => false, "message" => "Vous avez déjà liké ce commentaire."]);
            exit;
        }

        // Ajoute le like
        $stmt = $pdo->prepare("INSERT INTO Likes_Commentaires (commentaire_id, nom_utilisateur) VALUES (?, ?)");
        $stmt->execute([$id_commentaire, $nom_utilisateur]);

        // Incrémente le compteur de likes
        $stmt = $pdo->prepare("UPDATE Commentaires SET nb_likes = nb_likes + 1 WHERE id = ?");
        $stmt->execute([$id_commentaire]);

        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Erreur serveur : " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Requête invalide."]);
}
?>


<?php
require_once '../includes/conection.php';
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Lire le corps de la requête JSON
    $input = json_decode(file_get_contents("php://input"), true);

    if (!isset($input['id_commentaire']) || !isset($input['user_id'])) {
        echo json_encode(["success" => false, "message" => "Paramètres manquants."]);
        exit;
    }

    $id_commentaire = $input['id_commentaire'];
    $nom_utilisateur = $input['user_id'];

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

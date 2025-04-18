<?php
header("Content-Type: application/json; charset=UTF-8");
require_once '../includes/conection.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Vérification du statut de suivi
    if (isset($_GET['suivi_id']) && isset($_GET['nom_utilisateur'])) {
        $suivi_id = $_GET['suivi_id'];
        $nom_utilisateur = $_GET['nom_utilisateur'];

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM utilisateurs_suivi WHERE nom_utilisateur = :nom_utilisateur AND user_suivi_id = :suivi_id");
        $stmt->execute([
            ':nom_utilisateur' => $nom_utilisateur,
            ':suivi_id' => $suivi_id
        ]);
        $suivi = $stmt->fetchColumn() > 0;

        echo json_encode([
            "suivi" => $suivi
        ]);
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Paramètres GET requis manquants."]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ajout du suivi
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['suivi_id']) && isset($data['nom_utilisateur'])) {
        $suivi_id = $data['suivi_id'];
        $nom_utilisateur = $data['nom_utilisateur'];

        try {
            $stmt = $pdo->prepare("INSERT INTO utilisateurs_suivi (nom_utilisateur, user_suivi_id) VALUES (:nom_utilisateur, :suivi_id)");
            $stmt->execute([
                ':nom_utilisateur' => $nom_utilisateur,
                ':suivi_id' => $suivi_id
            ]);

            echo json_encode(["success" => true, "message" => "Suivi effectué avec succès."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Erreur SQL : " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Paramètres requis manquants (suivi_id ou nom_utilisateur)."]);
    }

} else {
    http_response_code(405);
    echo json_encode(["message" => "Méthode non autorisée."]);
}

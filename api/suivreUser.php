<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once '../includes/conection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['suivi_id']) && isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
        $suivi_id = $data['suivi_id'];

        try {
            $sql = "INSERT INTO utilisateurs_suivi (nom_utilisateur, user_suivi_id) VALUES (:nom_utilisateur, :suivi_id)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':nom_utilisateur' => $user_id,
                ':suivi_id' => $suivi_id
            ]);

            http_response_code(201);
            echo json_encode(["message" => "Suivi effectué avec succès."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Erreur SQL : " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Utilisateur non connecté ou ID suivi manquant."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Méthode non autorisée."]);
}

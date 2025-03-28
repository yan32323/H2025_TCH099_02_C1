<?php

// Inclure le routeur
require_once 'Router.php';

// Instancier le routeur
$router = new Router();

// Route pour l'inscription
$router->post('/login.php/login/', function() {

    require_once '../includes/conection.php'; // Adjust path if needed

    header('Content-Type: application/json'); // Set response header to JSON

    try {
        //extraire les éléments de l'objet JSON
        $client_data_json = file_get_contents("php://input");
        $client_data = json_decode($client_data_json, true);

        $identifiant = trim($client_data['identifiant']);
        $motDePasse = trim($client_data['motDePasse']);

        $stmt = $pdo->prepare("SELECT nom_utilisateur, mot_de_passe, nom, prenom FROM clients WHERE nom_utilisateur = :identifiant");
        $stmt->execute([':identifiant' => $identifiant]);
        $user = $stmt->fetch();

        if ($user) {

            if (password_verify($motDePasse, $user['mot_de_passe'])) {
                // For this lab, we're just returning success. In a real API, you might return a token.
                echo json_encode(['statut' => 'success', 'nom' => $user['nom'], 'prenom' => $user['prenom']]);
                exit();
            }
        }

        echo json_encode(['statut' => 'error', 'message' => 'Identifiant ou mot de passe incorrect.']);
        exit();

    } catch (PDOException $e) {
        http_response_code(401); 
        echo json_encode(['statut' => 'error', 'message' => 'Erreur de connexion']);
        exit();
    }
});

// Acheminer la requête
$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);
?>
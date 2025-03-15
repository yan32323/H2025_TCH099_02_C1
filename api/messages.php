<?php

// Inclure le routeur
require_once 'Router.php';

// Instancier le routeur
$router = new Router();

//route 
$router->post('/messages.php/recuperer-message/', function() {

    include_once '../includes/conection.php'; // Adjust path if needed

    header('Content-Type: application/json');

    try {
        
        //extraire les éléments de l'objet JSON
        $client_data_json = file_get_contents("php://input");
        $client_data = json_decode($client_data_json, true);

        $identifiant = trim($client_data['identifiant']);
        $motDePasse = trim($client_data['motDePasse']);

        // **Authentication for GET request (get messages)**
        if (!validateUserCredentials($identifiant, $motDePasse)) {
            http_response_code(401); // Unauthorized
            echo json_encode(['statut' => 'error', 'message' => 'Authentification requise.']);
            exit();
        }


        // Fetch messages from the database
        $stmt = $pdo->prepare("SELECT m.contenu, m.date_soumission, u.identifiant AS auteur
                            FROM messages m
                            JOIN usagers u ON m.id_usager = u.id
                            ORDER BY m.date_soumission DESC");
        $stmt->execute();
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['statut' => 'success', 'messages' => $messages]);

    } catch (PDOException $e) {
        echo json_encode(['statut' => 'error', 'message' => 'Erreur de connexion : ' . $e->getMessage()]);
    }

});

$router->post('/messages.php/poster-message/', function() {

    include_once '../includes/conection.php'; // Adjust path if needed

    header('Content-Type: application/json');


    try {

        //extraire les éléments de l'objet JSON
        $client_data_json = file_get_contents("php://input");
        $client_data = json_decode($client_data_json, true);

        $identifiant = trim($client_data['identifiant']);
        $motDePasse = trim($client_data['motDePasse']);
        $nouveau_message = trim($client_data['nouveau_message']);
        
        // **Authentication for GET request (get messages)**
        if (!validateUserCredentials($identifiant, $motDePasse)) {
            http_response_code(401); // Unauthorized
            echo json_encode(['statut' => 'error', 'message' => 'Authentification requise.']);
            exit();
        }

        // Get and validate new message content
        if (empty($nouveau_message)) {
            echo json_encode(['statut' => 'error', 'message' => 'Le message ne peut pas être vide.']);
            exit();
        }


        // Get user ID from identifiant (assuming identifiant is available from authentication)
        $identifiant = $_SERVER['PHP_AUTH_USER']; // Get identifiant from authentication
        $stmt = $pdo->prepare("SELECT id FROM clients WHERE identifiant = :identifiant");
        $stmt->execute([':identifiant' => $identifiant]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        $id_usager = $user['id'];


        // Insert new message into database
        date_default_timezone_set('America/Montreal'); // Set timezone as in forum.php
        $date_soumission = date('Y-m-d H:i:s');
        $stmt = $pdo->prepare("INSERT INTO messages (id_usager, date_soumission, contenu) VALUES (?, ?, ?)");
        $stmt->execute([$id_usager, $date_soumission, $nouveau_message]);

        echo json_encode(['statut' => 'success']); // Message added successfully

    } catch (PDOException $e) {
        echo json_encode(['statut' => 'error', 'message' => 'Erreur de connexion : ' . $e->getMessage()]);
    }

});



// Acheminer la requête
$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);



// Function to validate user credentials (reusable for all API endpoints)
function validateUserCredentials($identiifant, $motDePasse) {

    $stmt = $pdo->prepare("SELECT mot_de_passe FROM clients WHERE identifiant = :identifiant");
    $stmt->execute([':identifiant' => $identifiant]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($motDePasse, $user['mot_de_passe'])) {
        return true; // Credentials valid
    } else {
        return false; // Invalid credentials
    }
}

?>
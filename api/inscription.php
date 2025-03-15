<?php

// Inclure le routeur
require_once 'Router.php';

// Instancier le routeur
$router = new Router();

//Test de connextion avec la route POUR TESTER
$router->get('/inscription.php/test/', function() {
    echo json_encode(['statut' => 'success', 'message' => 'Route test OK']);
});

// Route pour l'inscription
$router->post('/inscription.php/inscrire/', function() {

    require_once '../includes/conection.php'; // Adjust path if needed

    header('Content-Type: application/json');

    try {

        //extraire les éléments de l'objet JSON
        $client_data_json = file_get_contents("php://input");
        $client_data = json_decode($client_data_json, true);

        $identifiant = trim($client_data['identifiant']);
        $motDePasse = trim($client_data['motDePasse']);

        $erreurs = [];

        // Server-side validation (similar to your gestion_inscription.php)

        // Check if username is already taken
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM clients WHERE nom_utilisateur = :identifiant");
        $stmt->execute(['identifiant' => $identifiant]);
        $count = $stmt->fetchColumn();
        if ($count > 0) {
            $erreurs[] = "Cet identifiant est déjà utilisé.";
        }

        // Password Validation (same rules as client-side and gestion_inscription.php)
        if (strlen($motDePasse) < 8 || strlen($motDePasse) > 32) {
            $erreurs[] = "Le mot de passe doit contenir entre 8 et 32 caractères.";
        }
        if (!preg_match('/[A-Z]/', $motDePasse)) {
            $erreurs[] = "Le mot de passe doit contenir au moins une majuscule.";
        }
        if (!preg_match('/[a-z]/', $motDePasse)) {
            $erreurs[] = "Le mot de passe doit contenir au moins une minuscule.";
        }
        if (!preg_match('/[0-9]/', $motDePasse)) {
            $erreurs[] = "Le mot de passe doit contenir au moins un chiffre.";
        }

        if (!empty($erreurs)) {
            echo json_encode(['statut' => 'error', 'message' => implode(" ", $erreurs)]); // Send back validation errors
        }else{

            // Password Hashing
            $motDePasseHash = password_hash($motDePasse, PASSWORD_DEFAULT);

            // Insert User into Database
            $stmt = $pdo->prepare("INSERT INTO clients (nom_utilisateur, mot_de_passe) VALUES (:identifiant , :motDePasse)");
            $stmt->execute([':identifiant' => $identifiant, ':motDePasse' => $motDePasseHash]);

            echo json_encode(['statut' => 'success']); // Registration successful
        }

    } catch (PDOException $e) {
        echo json_encode(['statut' => 'error', 'message' => 'Erreur de connexion : ' . $e->getMessage()]);
    }
});



// Acheminer la requête
$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);
?>
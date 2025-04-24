<?php
require_once 'Router.php'; 
// Inclure la connexion à la base de données

$router = new Router();

// Route pour la récupération de plans
$router->post('/UploadNouvProduits.php', function () {
    header('Content-Type: application/json');
    $config = require '../includes/config.php';

    $packet = file_get_contents("php://input");
    $infos = json_decode($packet, true);

    try {
        // Connexion à la base de données
        $pdo = new PDO(
            "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8",
            $config['username'],
            $config['password'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );

        // Récupérer le plan
        $requete = $pdo->prepare("INSERT INTO Ingredients (prix,magasin, unite_de_mesure, nom)
                VALUES (:prix,:magasin, :unite_de_mesure, :nom)");
        $requete->execute(['prix' => $infos['prix'],'magasin' => $infos['magasin'], 'unite_de_mesure' => $infos['unite_de_mesure'], 'nom' => $infos['nom']]);


         echo json_encode(["statut" => true, "message" => "Ingredient ajouté avec succès"]);
        
    } catch (PDOException $e) {
        echo json_encode(["statut" => false, "message" => "Erreur de base de données", "details" => $e->getMessage()]);
    }
});

// Acheminer la requête
$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);

<?php
require_once 'Router.php'; 
// Inclure la connexion à la base de données

$router = new Router();

// Route pour la récupération de plans
$router->post('/getListeEpicerie.php/liste', function () {
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
        $requete = $pdo->prepare("SELECT i.id, i.unite_de_mesure, i.nom, SUM(ri.quantite) AS quantite_requise, COALESCE(si.quantite_disponible, 0)AS quantite_disponible, (SUM(ri.quantite) - COALESCE(si.quantite_disponible, 0)) AS quantite_manquante
FROM Repas_Planifies rp
JOIN Plan_de_repas p ON rp.plan_id = p.id
JOIN Recettes_Ingredients ri ON rp.recette_id = ri.recette_id
JOIN Ingredients i ON ri.ingredient_id = i.id
LEFT JOIN Stock_Ingredients si ON si.ingredient_id = i.id AND si.nom_utilisateur = :username
WHERE rp.plan_id = :plan_id
GROUP BY i.id
HAVING quantite_disponible < SUM(ri.quantite);");
        $requete->execute(['plan_id' => $infos['plan'],'username' => $infos['username']]);
        $resultat = $requete->fetchAll();

        if ($resultat) {
            echo json_encode($resultat);
        } else {
            die(var_dump($resultat));
            echo json_encode(["error" => true, "message" => "Plan non trouvé"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["error" => true, "message" => "Erreur de base de données", "details" => $e->getMessage()]);
    }
});

// Acheminer la requête
$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);

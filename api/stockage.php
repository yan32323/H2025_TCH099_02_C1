<?php 

// Inclure le routeur et l'instancier
require_once 'Router.php';
$router = new Router();


//Test de connextion avec la route POUR TESTER
$router->get('/stockage.php/test/', function() {
    echo "succès";
});


//route pour récupéré tout les produits du stock_ingredient appartenant à l'identifiant donné
$router->post('/stockage.php/recuperer-produit/', function() {

    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    try {
        //extraire les éléments de l'objet JSON
        $data_json = file_get_contents("php://input");
        $data = json_decode($data_json, true);

        $identifiant = trim($data['identifiant']);
        $motDePasse = trim($data['motDePasse']);

        //Si le client exite dans la base de donnée, on récupère ses produits du stock_ingredients
        if(validateUserCredentials($identifiant, $motDePasse, $pdo)){

            $requete = $pdo->prepare("SELECT nom, unite_de_mesure, quantite_disponible FROM stock_ingredients s LEFT JOIN ingredients i ON s.ingredient_id = i.id WHERE nom_utilisateur = :identifiant");
            $requete->execute([':identifiant' => $identifiant]);
            $stock_ingredient = $requete->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['statut' => 'success', 'stock_ingredient' => $stock_ingredient]);
            exit();

        }else{
            //Cas où l'authentification a échoué
            http_response_code(401); 
            echo json_encode(['statut' => 'error', 'message' => 'Authentification requise.']);
            exit();
        }
    } catch (PDOException $e) {
        http_response_code(401); 
        echo json_encode(['statut' => 'error', 'message' => 'Erreur de connexion']);
        exit();
    }
});


//route pour récupérer tout les ingredients de la base de donnée (produits)
$router->get('/stockage.php/recuperer-ingredient/', function() {

    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    try {
        $requete = $pdo->prepare("SELECT id, nom, unite_de_mesure FROM ingredients");
        $requete->execute();
        $resultat = $requete->fetchAll(PDO::FETCH_ASSOC);
        
        if($resultat){

            echo json_encode(['statut' => 'success', 'listeIngredient' => $resultat]);
            exit();

        }else{
            http_response_code(404);
            echo json_encode(['statut' => 'error', 'message' => 'Aucun ingredient trouver dans le système communiquer avec l\'administrateur.']);
            exit();
        }
    } catch (PDOException $e) {
        http_response_code(401); 
        echo json_encode(['statut' => 'error', 'message' => 'Erreur de connexion']);
        exit();
    }
});


//route pour récupérer l'id d'un produit par son nom
$router->get('/stockage.php/recuperer-id-produit/{nom}', function($nomProduit) {
    
    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    try {
        $requete = $pdo->prepare("SELECT id, unite_de_mesure FROM ingredients WHERE nom = :nom");
        $requete->execute([':nom' => $nomProduit]);
        $resultat = $requete->fetch(PDO::FETCH_ASSOC);
        
        if($resultat){

            echo json_encode(['statut' => 'success', 'idProduit' => $resultat['id'], 'uniteDeMesure' => $resultat['unite_de_mesure']]);
            exit();

        }else{
            echo json_encode(['statut' => 'error', 'message' => 'L\'ingredient est introuvable. Vérifier l\'orthographe, puis réessayer, sinon communiquer avec l\'administrateur']);
            exit();
        }
    } catch (PDOException $e) {
        http_response_code(401); 
        echo json_encode(['statut' => 'error', 'message' => 'Erreur de connexion']);
        exit();
    }
});


//route pour ajouter un produit au stock_ingredient
$router->post('/stockage.php/ajouter-produit/', function() {

    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    try {
        //extraire les éléments de l'objet JSON
        $data_json = file_get_contents("php://input");
        $data = json_decode($data_json, true);

        $identifiant = trim($data['identifiant']);
        $motDePasse = trim($data['motDePasse']);
        $idProduit = trim($data['idProduit']);
        $quantite = trim($data['quantite']);

        //Si le client exite dans la base de donnée, on récupère ses produits du stock_ingredients
        if(validateUserCredentials($identifiant, $motDePasse, $pdo)){

            //Vérifier si le produit est déjà présent dans le stock_ingredients
            $requete = $pdo->prepare('SELECT * FROM stock_ingredients WHERE nom_utilisateur = :identifiant AND ingredient_id = :idProduit');
            $requete->execute([':identifiant' => $identifiant, ':idProduit' => $idProduit]);
            $resultat = $requete->fetch(PDO::FETCH_ASSOC);

            if($resultat){
                echo json_encode(['statut' => 'error', 'message' => 'Le produit est déjà présent dans le stock.']);
                exit();
            }else{

                //Le produit n'est pas présent dans le stock_ingredients, on l'ajoute
                $requete = $pdo->prepare("INSERT INTO stock_ingredients VALUES (:nom_utilisateur, :produit_id, :quantite_disponible)");
                $requete->execute([':nom_utilisateur' => $identifiant, ':produit_id' => $idProduit, ':quantite_disponible' => $quantite]);
                echo json_encode(['statut' => 'success']);
                exit();
            }

        }else{
            //Cas où l'authentification a échoué
            http_response_code(401); 
            echo json_encode(['statut' => 'error', 'message' => 'Authentification requise.']);
            exit();
        }
    } catch (PDOException $e) {
        http_response_code(401); 
        echo json_encode(['statut' => 'error', 'message' => 'Erreur de connexion']);
        exit();
    }
});


//route pour retirer un produit au stock_ingredient
$router->delete('/stockage.php/supprimer-produit/', function() {

    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    try {
        //extraire les éléments de l'objet JSON
        $data_json = file_get_contents("php://input");
        $data = json_decode($data_json, true);

        $identifiant = trim($data['identifiant']);
        $motDePasse = trim($data['motDePasse']);
        $ingredient = trim($data['ingredient']);

        //Si le client exite dans la base de donnée, on détruit la colonne correspondant à l'ingrédient donné
        if(validateUserCredentials($identifiant, $motDePasse, $pdo)){
            $requete = $pdo->prepare("DELETE s FROM stock_ingredients AS s JOIN ingredients AS i ON s.ingredient_id = i.id WHERE i.nom = :nom AND s.nom_utilisateur = :nom_utilisateur");
            $requete->execute([':nom' => $ingredient, ':nom_utilisateur' => $identifiant]);
            echo json_encode(['statut' => 'success']);
            exit();

        }else{
            //Cas où l'authentification a échoué
            http_response_code(401); 
            echo json_encode(['statut' => 'error', 'message' => 'Authentification requise.']);
            exit();
        }
    } catch (PDOException $e) {
        http_response_code(401); 
        echo json_encode(['statut' => 'error', 'message' => 'Erreur de connexion']);
        exit();
    }
});


//route pour modifier la quantité d'un produit dans le stock_ingredient
$router->put('/stockage.php/update-produit/', function() {

    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    try {
        //extraire les éléments de l'objet JSON
        $data_json = file_get_contents("php://input");
        $data = json_decode($data_json, true);

        $identifiant = trim($data['identifiant']);
        $motDePasse = trim($data['motDePasse']);
        $nomProduit = trim($data['nomProduit']);
        $quantite = trim($data['quantite']);

        //Si le client exite dans la base de donnée, on récupère ses produits du stock_ingredients
        if(validateUserCredentials($identifiant, $motDePasse, $pdo)){
            $requete = $pdo->prepare("UPDATE stock_ingredients AS s JOIN ingredients AS i ON s.ingredient_id = i.id SET s.quantite_disponible = :quantite WHERE i.nom = :nom AND s.nom_utilisateur = :nom_utilisateur");
            $requete->execute([':quantite' => $quantite, ':nom' => $nomProduit, ':nom_utilisateur' => $identifiant]);
            echo json_encode(['statut' => 'success']);
            exit();

        }else{
            //Cas où l'authentification a échoué
            http_response_code(401); 
            echo json_encode(['statut' => 'error', 'message' => 'Authentification requise.']);
            exit();
        }
    } catch (PDOException $e) {
        http_response_code(401); 
        echo json_encode(['statut' => 'error', 'message' => 'Erreur de connexion']);
        exit();
    }
});


// Function to validate user credentials (reusable for all API endpoints)
function validateUserCredentials($identifiant, $motDePasse, $pdo) {

    $requete = $pdo->prepare("SELECT mot_de_passe FROM clients WHERE nom_utilisateur = :identifiant");
    $requete->execute([':identifiant' => $identifiant]);
    $user = $requete->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($motDePasse, $user['mot_de_passe'])) {
        return true; 
    } else {
        return false; 
    }
}


// Acheminer la requête
$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);
?>
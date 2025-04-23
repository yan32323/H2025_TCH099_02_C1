<?php
require_once 'Router.php';
// Inclure la connexion à la base de données


$router = new Router();

$router->post('/consulterRecette.php/afficher', function () {


    require_once '../includes/conection.php';
    header("Content-Type: application/json");

    // Lire le corps JSON brut
    $input = json_decode(file_get_contents("php://input"), true);

    // Vérifie si les données nécessaires sont présentes
    if (!isset($input['id']) || !isset($input['nom_utilisateur'])) {
        echo json_encode(["success" => false, "message" => "Paramètres requis manquants"]);
        exit;
    }
    $id = intval($input['id']);
    $nom_utilisateur = $input['nom_utilisateur'];

    // Récupérer les infos de la recette
    $sql = "SELECT r.*, c.nom AS nom_client, c.prenom 
            FROM Recettes r
            JOIN Clients c ON r.createur_nom_utilisateur = c.nom_utilisateur
            WHERE r.id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    $recette = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$recette) {
        echo json_encode(["success" => false, "message" => "Recette non trouvée"]);
        exit;
    }

    // Récupérer les ingrédients
    $sqlIng = "SELECT i.nom, ri.quantite, 
                    COALESCE(ri.unite_de_mesure, i.unite_de_mesure) AS unite 
            FROM Recettes_Ingredients ri
            JOIN Ingredients i ON ri.ingredient_id = i.id
            WHERE ri.recette_id = ?";
    $stmtIng = $pdo->prepare($sqlIng);
    $stmtIng->execute([$id]);
    $ingredients = $stmtIng->fetchAll(PDO::FETCH_ASSOC);

    // Récupérer les étapes
    $sqlEtapes = "SELECT numero_etape, texte 
                FROM Recettes_Etapes 
                WHERE recette_id = ? 
                ORDER BY numero_etape";
    $stmtEtapes = $pdo->prepare($sqlEtapes);
    $stmtEtapes->execute([$id]);
    $etapesBrutes = $stmtEtapes->fetchAll(PDO::FETCH_ASSOC);

    // Reformater les étapes
    $etapes = [];
    foreach ($etapesBrutes as $etape) {
        $etapes[] = [
            "numero_etape" => $etape["numero_etape"],
            "titre" => "Étape " . $etape["numero_etape"],
            "description" => $etape["texte"]
        ];
    }

    // Encoder l’image de la recette si elle existe
    $recette["image"] = $recette["image"] ? base64_encode($recette["image"]) : null;

    // Récupérer les commentaires
    $sqlCommentaires = "SELECT c.id, c.texte, c.date_commentaire, cl.nom, cl.prenom, c.nb_likes, c.nom_utilisateur
                        FROM Commentaires c
                        JOIN Clients cl ON c.nom_utilisateur = cl.nom_utilisateur
                        WHERE c.recette_id = ? 
                        ORDER BY c.nb_likes DESC";
    $stmtCommentaires = $pdo->prepare($sqlCommentaires);
    $stmtCommentaires->execute([$id]);
    $commentaires = $stmtCommentaires->fetchAll(PDO::FETCH_ASSOC);

    foreach ($commentaires as &$commentaire) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM Likes_Commentaires WHERE nom_utilisateur = ? AND commentaire_id = ?");
        $stmt->execute([$nom_utilisateur, $commentaire['id']]);
        $commentaire['a_deja_like'] = $stmt->fetchColumn() > 0;
    }

    // Récupérer la moyenne des notes et le nombre de votes
    $stmtNote = $pdo->prepare("SELECT ROUND(AVG(note), 1) AS moyenne_notes, COUNT(*) AS nb_votes FROM Recettes_Notes WHERE recette_id = :recette_id");
    $stmtNote->execute(['recette_id' => $id]);
    $noteInfo = $stmtNote->fetch(PDO::FETCH_ASSOC);
    $moyenne = $noteInfo['moyenne_notes'] !== null ? $noteInfo['moyenne_notes'] : null;
    $nbVotes = $noteInfo['nb_votes'] ?? 0;

    // Vérifier si l'utilisateur a déjà voté
    $stmtDejaVote = $pdo->prepare("SELECT COUNT(*) FROM Recettes_Notes WHERE nom_utilisateur = ? AND recette_id = ?");
    $stmtDejaVote->execute([$nom_utilisateur, $id]);
    $deja_vote = $stmtDejaVote->fetchColumn() > 0;

    // Réponse JSON
    echo json_encode([
        "success" => true,
        "recette" => [
            "id" => $recette["id"],
            "nom" => $recette["nom"],
            "description" => $recette["description"],
            "type" => null, // Champ "type" non présent dans la table actuelle
            "difficulte" => $recette["difficulter"],
            "temps_preparation" => $recette["temps_de_cuisson"],
            "portions" => null, // Champ "portions" non présent dans la table actuelle
            "image" => $recette["image"],
            "createur" => [
                "nom" => $recette["nom_client"],
                "prenom" => $recette["prenom"],
                "nom_utilisateur" => $recette["createur_nom_utilisateur"]
            ],
            "ingredients" => $ingredients,
            "etapes" => $etapes,
            "commentaires" => $commentaires,
            "moyenne_note" => $moyenne,
            "nombre_votes" => $nbVotes,
            "user_connecte" => $nom_utilisateur,
            "a_vote" => $deja_vote
        ],
        "user_id" => $nom_utilisateur
    ]);

});

$router->post('/consulterRecette.php/ajouterCommentaire', function () {
    require_once '../includes/config.php';
    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    // Lire les données JSON
    $donneesJSON = json_decode(file_get_contents("php://input"), true);

    // Récupérer les données avec null par défaut
    $commentaire = $donneesJSON['commentaire'] ?? null;
    $recetteId = $donneesJSON['recette_id'] ?? null;
    $nomUtilisateur = $donneesJSON['nom_utilisateur'] ?? null;

    // Validation simple
    if (empty($commentaire) || empty($recetteId) || empty($nomUtilisateur)) {
        echo json_encode([
            'success' => false,
            'message' => 'Le commentaire, l\'ID de la recette ou le nom d\'utilisateur est manquant.'
        ]);
        exit;
    }

    try {
        // Préparer la requête d'insertion
        $stmt = $pdo->prepare("INSERT INTO Commentaires (recette_id, nom_utilisateur, texte, date_commentaire) VALUES (?, ?, ?, NOW())");
        $stmt->execute([$recetteId, $nomUtilisateur, $commentaire]);

        echo json_encode([
            'success' => true,
            'message' => 'Commentaire ajouté avec succès.'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de l\'ajout du commentaire : ' . $e->getMessage()
        ]);
    }
});

$router->post('/consulterRecette.php/likeCommentaire', function () {
    require_once '../includes/config.php';
    require_once '../includes/conection.php';
    header('Content-Type: application/json');

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

});

$router->post('/consulterRecette.php/ajouterNote', function () {
    require_once '../includes/conection.php';

    // Lire les données JSON
    $donneesJSON = json_decode(file_get_contents("php://input"), true);

    // Récupération des données
    $idUtilisateur = $donneesJSON['nom_utilisateur'] ?? null;
    $recette_id = $donneesJSON['recette_id'] ?? null;
    $note = $donneesJSON['note'] ?? null;

    // Vérification de la présence des données
    if (!$idUtilisateur || !$recette_id || !$note) {
        echo json_encode(['success' => false, 'message' => 'Données incomplètes']);
        exit;
    }

    try {
        // Vérifier si déjà notée
        $stmt = $pdo->prepare("SELECT * FROM Recettes_Notes WHERE nom_utilisateur = ? AND recette_id = ?");
        $stmt->execute([$idUtilisateur, $recette_id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'Vous avez déjà noté cette recette']);
            exit;
        }

        // Insérer la note
        $stmt = $pdo->prepare("INSERT INTO Recettes_Notes (nom_utilisateur, recette_id, note) VALUES (?, ?, ?)");
        $stmt->execute([$idUtilisateur, $recette_id, $note]);

        // Recalculer moyenne et nombre de votes
        $stmt = $pdo->prepare("SELECT AVG(note) as moyenne, COUNT(*) as total FROM Recettes_Notes WHERE recette_id = ?");
        $stmt->execute([$recette_id]);
        $row = $stmt->fetch();

        echo json_encode([
            'success' => true,
            'nouvelle_moyenne' => round($row['moyenne'], 1),
            'nouveau_nombre_votes' => $row['total']
        ]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
    }
});


// Acheminer la requête
$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);

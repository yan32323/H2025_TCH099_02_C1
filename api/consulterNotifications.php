<?php
require_once 'Router.php';

$router = new Router();

$router->post('/consulterNotifications.php/afficher', function() {
    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    // Vérification de la connexion PDO
    if (!$pdo) {
        echo json_encode(['success' => false, 'message' => 'Erreur de connexion à la base de données']);
        return;
    }

    // Récupérer l'utilisateur à partir de la requête
    $data = json_decode(file_get_contents('php://input'), true);

    // Vérification de l'existence de 'user_id' dans les données
    if (!isset($data['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'L\'ID de l\'utilisateur est requis']);
        return;
    }

    $current_user = $data['user_id']; // L'utilisateur connecté

    // Vérifier si l'utilisateur existe dans la base de données (facultatif, selon ton modèle)
    $sql_user_check = "SELECT COUNT(*) FROM Clients WHERE nom_utilisateur = :user_id";
    $stmt_user_check = $pdo->prepare($sql_user_check);
    $stmt_user_check->execute(['user_id' => $current_user]);
    $user_exists = $stmt_user_check->fetchColumn();

    if (!$user_exists) {
        echo json_encode(['success' => false, 'message' => 'Utilisateur introuvable']);
        return;
    }

    // Récupérer les notifications non lues pour cet utilisateur
    $sql = "SELECT * FROM Notifications WHERE nom_utilisateur = :user_id AND est_lue = 0 ORDER BY date_creation DESC";
    $stmt = $pdo->prepare($sql);

    try {
        $stmt->execute(['user_id' => $current_user]);
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($notifications) {
            // Retourner les notifications sous forme de JSON
            echo json_encode(['success' => true, 'notifications' => $notifications]);
        } else {
            // Pas de notifications à retourner
            echo json_encode(['success' => false, 'message' => 'Aucune notification non lue']);
        }
    } catch (PDOException $e) {
        // Gérer les erreurs de la requête SQL
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la récupération des notifications : ' . $e->getMessage()]);
    }
});
// Route pour marquer une notification comme lue
$router->post('/consulterNotifications.php/marquerNotificationLue', function() {
    require_once '../includes/conection.php';
    header('Content-Type: application/json');
    $data = json_decode(file_get_contents('php://input'), true);
    $notificationId = $data['id'];  // ID de la notification à marquer comme lue

    // Mettre à jour la notification dans la base de données
    $sql = "UPDATE Notifications SET est_lue = 1 WHERE id = :id";
    $stmt = $pdo->prepare($sql);

    if ($stmt->execute(['id' => $notificationId])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour']);
    }
});

// Route pour obtenir le nombre de notifications non lues
$router->post('/consulterNotifications.php/nombre-Notifications-non-lue', function() {
    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    // Récupérer l'utilisateur à partir de la requête
    $data = json_decode(file_get_contents('php://input'), true);
    $current_user = $data['user_id']; // L'utilisateur connecté

    // Requête pour obtenir le nombre de notifications non lues
    $sql = "SELECT COUNT(*) AS unreadCount FROM Notifications WHERE nom_utilisateur = :user_id AND est_lue = 0";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => $current_user]);

    $result = 0; // Initialiser le résultat à 0

    // Récupérer le nombre de notifications non lues
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    // Retourner le nombre de notifications non lues en JSON
    echo json_encode(['success' => true, 'unreadCount' => $result['unreadCount']]);
});

$router->post('/consulterNotifications.php/afficherToutes', function() {
    require_once '../includes/conection.php';
    header('Content-Type: application/json');

    // Vérification de la connexion PDO
    if (!$pdo) {
        echo json_encode(['success' => false, 'message' => 'Erreur de connexion à la base de données']);
        return;
    }

    // Récupérer l'utilisateur à partir de la requête
    $data = json_decode(file_get_contents('php://input'), true);

    // Vérification de l'existence de 'user_id' dans les données
    if (!isset($data['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'L\'ID de l\'utilisateur est requis']);
        return;
    }

    $current_user = $data['user_id']; // L'utilisateur connecté

    // Vérifier si l'utilisateur existe dans la base de données (facultatif, selon ton modèle)
    $sql_user_check = "SELECT COUNT(*) FROM Clients WHERE nom_utilisateur = :user_id";
    $stmt_user_check = $pdo->prepare($sql_user_check);
    $stmt_user_check->execute(['user_id' => $current_user]);
    $user_exists = $stmt_user_check->fetchColumn();

    if (!$user_exists) {
        echo json_encode(['success' => false, 'message' => 'Utilisateur introuvable']);
        return;
    }

    // Récupérer les notifications non lues pour cet utilisateur
    $sql = "SELECT * FROM Notifications WHERE nom_utilisateur = :user_id ORDER BY date_creation DESC";
    $stmt = $pdo->prepare($sql);

    try {
        $stmt->execute(['user_id' => $current_user]);
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($notifications) {
            // Retourner les notifications sous forme de JSON
            echo json_encode(['success' => true, 'notifications' => $notifications]);
        } else {
            // Pas de notifications à retourner
            echo json_encode(['success' => false, 'message' => 'Aucune notification non lue']);
        }
    } catch (PDOException $e) {
        // Gérer les erreurs de la requête SQL
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la récupération des notifications : ' . $e->getMessage()]);
    }
});

// Acheminer la requête
$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);

<?php
$pdo = new PDO("mysql:host=localhost;dbname=ta_base", "utilisateur", "motdepasse");

if (isset($_GET["id"])) {
    $requete = $pdo->prepare("SELECT image FROM Recettes WHERE id = ?");
    $requete->execute([$_GET["id"]]);
    $row = $requete->fetch(PDO::FETCH_ASSOC);

    if ($row && $row["image"]) {
        header("Content-Type: image/png"); // Ne prends que les images en format PNG
        echo $row["image"];
    } else {
        header("Content-Type: image/png");
        readfile("default.png"); // Nous permet d'ajouter l'image par defaut quand il n'y en a pas
    }
}
?>

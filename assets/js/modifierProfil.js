document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("user");

    const idConnecte = sessionStorage.getItem("identifiant");

    
    if (!userId && !idConnecte) {
        alert("Aucun utilisateur spécifié.");
        return;
    }
    else if(!userId) {
        window.location.href = `page-profil.html?user=${idConnecte}`;
    }
    
    if (!idConnecte || idConnecte !== userId) {
        alert("Vous devez être connecté à ce compte pour pouvoir le modifier. idConnecte null");
        return;
    }
});

function modifierProfil() {
    let newNom = document.getElementById("new_username");
    let newDescription = document.getElementById("new_description");
    let idConnecte = sessionStorage.getItem("identifiant");

    let data = {
        nom_utilisateur: idConnecte,
        new_username: newNom.value,
        new_description: newDescription.value,
        new_imagebase64: null,
    };

    fetch("./api/profil.php/modifier", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    .then((response) => response.text())
    .then((text) => {
        console.log("Réponse du serveur :", text);
        return JSON.parse(text);
    })
    .then((result) => {
        if (result.success) {
            alert("Profil mis à jour avec succès !");
            if(result.changedUsername) {
                alert("Votre nom d'utilisateur a été changé");
                sessionStorage.setItem("identifiant", result.newUsername);
                let newUsername = result.newUsername;
                window.location.href = `page-profil.html?user=${newUsername}`;
            }
            
        } else {
            alert("Erreur : " + result.message);
        }
    })
    .catch((error) => {
        console.error("Erreur réseau :", error);
        alert("Erreur lors de la mise à jour du profil.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("user");

    if (!userId) {
        alert("Aucun utilisateur spécifié.");
        return;
    }

    fetch(`http://localhost/planigo/H2025_TCH099_02_C1/api/profil.php?user=${userId}`)
        .then(response => response.text())
        .then(text => {
            const data = JSON.parse(text);

            if (data.success) {
                afficheProfil(data.profil);
            } else {
                alert("Erreur : " + data.message);
            }
        })
        .catch(error => {
            console.error("Erreur réseau :", error);
            alert("Erreur lors du chargement de la page de profil.");
        });
});

function afficheProfil(profilData) {
    const profil = profilData.utilisateur;
    const recettes = profilData.recettes;
    const idConnecte = profilData.est_connecte; // ID de l'utilisateur connecté

    // Remplir les infos du profil
    document.querySelector(".profile-name").textContent = `${profil.prenom} ${profil.nom}`;
    document.querySelector(".profile-bio").textContent = profil.description || "Aucune description.";

    // Bouton "Modifier le profil" : afficher ou masquer en fonction de l'utilisateur connecté
    const modifierBtn = document.getElementById("modifier-profil-btn");
    const titre = document.getElementById("titre-profil");
    if (profil.nom_utilisateur !== idConnecte) {
        titre.textContent = "Profil de " + profil.nom_utilisateur; // Titre du profil
        modifierBtn.style.display = "none"; // Masquer si ce n'est pas l'utilisateur connecté
        const suivreBtn = document.getElementById("suivre-profil-btn");
        suivreBtn.style.display = "inline-block"; // Afficher le bouton "Suivre"
        
        // Gestion de l'action "Suivre"
        suivreBtn.addEventListener("click", () => {
            // Logique pour suivre l'utilisateur (ajout à une liste de suivi)
            alert(`Vous avez suivi ${profil.prenom} ${profil.nom}`);
        });
    } else {
        modifierBtn.style.display = "inline-block"; // Afficher si c'est le profil de l'utilisateur connecté
    }

    // Insérer les recettes
    const grid = document.querySelector(".recipe-grid");
    grid.innerHTML = "";

    if (recettes.length === 0) {
        // Si aucune recette, afficher le message "Aucune recette publiée"
        const noRecipeMessage = document.createElement("div");
        noRecipeMessage.classList.add("no-recipes-message");
        noRecipeMessage.textContent = "Aucune recette publiée";
        grid.appendChild(noRecipeMessage);
    } else {
        // Afficher les recettes si elles existent
        recettes.forEach(recette => {
            const card = document.createElement("div");
            card.classList.add("recipe-card");
            card.style.cursor = "pointer"; // Curseur interactif
        
            const image = recette.image ? `data:image/jpeg;base64,${recette.image}` : "assets/image/image_tmp_recette.png";
        
            card.innerHTML = `
                <img src="${image}" alt="${recette.nom}">
                <div class="recipe-content">
                    <div class="recipe-title">${recette.nom}</div>
                    <div class="recipe-info">
                        <div class="recipe-time">30 Minutes</div>
                        <div class="recipe-type">Santé</div>
                    </div>
                </div>
            `;
        
            // 🔗 Redirection au clic
            card.addEventListener("click", () => {
                window.location.href = `consulter-recette.html?id=${recette.id}`;
            });
        
            grid.appendChild(card);
        });
    }
}

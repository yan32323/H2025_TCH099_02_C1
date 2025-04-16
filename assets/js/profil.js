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
            console.log("Texte brut reçu :", text);
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

    // Remplir les infos du profil
    document.querySelector(".profile-name").textContent = `${profil.prenom} ${profil.nom}`;
    document.querySelector(".profile-bio").textContent = profil.description || "Aucune description.";

    // Insérer les recettes
    const grid = document.querySelector(".recipe-grid");
    grid.innerHTML = ""; // On vide le contenu existant

    recettes.forEach(recette => {
        const card = document.createElement("div");
        card.classList.add("recipe-card");

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

        grid.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("user");

    if (!userId) {
        alert("Aucun utilisateur spécifié.");
        return;
    }

    fetch("./api/profil.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user: userId,
            nom_utilisateur: sessionStorage.getItem("identifiant"),
        }),
    })
        .then((response) => response.text())
        .then((text) => {
            console.log(text);
            return JSON.parse(text);
        })
        .then((data) => {
            if (data.success) {
                afficheProfil(data.profil);
            } else {
                alert("Erreur : " + data.message);
            }
        })
        .catch((error) => {
            console.error("Erreur réseau :", error);
            alert("Erreur lors du chargement de la page de profil.");
        });
});

function afficheProfil(profilData) {
    const profil = profilData.utilisateur;
    const recettes = profilData.recettes;
    const idConnecte = sessionStorage.getItem("identifiant");

    document.querySelector(
        ".profile-name"
    ).textContent = `${profil.prenom} ${profil.nom}`;
    document.querySelector(".profile-bio").textContent =
        profil.description || "Aucune description.";

    const modifierBtn = document.getElementById("modifier-profil-btn");
    const titre = document.getElementById("titre-profil");
    const suivreBtn = document.getElementById("suivre-profil-btn");

    if (profil.nom_utilisateur !== idConnecte) {
        titre.textContent = "Profil de " + profil.nom_utilisateur;
        modifierBtn.style.display = "none";
        suivreBtn.style.display = "inline-block";

        // Vérifie si l'utilisateur est déjà suivi
        fetch(
            "./api/suivreUser.php",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "verifier_suivi",
                    suivi_id: profil.nom_utilisateur,
                    nom_utilisateur: idConnecte,
                }),
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.suivi) {
                    suivreBtn.textContent = "Suivi";
                    suivreBtn.disabled = true;
                } else {
                    suivreBtn.textContent = "Suivre";
                    suivreBtn.disabled = false;
                }
            });

        // Suivre un utilisateur
        suivreBtn.addEventListener("click", () => {
            fetch(
                "./api/suivreUser.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action: "ajouter_suivi",
                        suivi_id: profil.nom_utilisateur,
                        nom_utilisateur: idConnecte,
                    }),
                }
            )
                .then((res) => res.json())
                .then((result) => {
                    if (result.success) {
                        suivreBtn.textContent = "Suivi";
                        suivreBtn.disabled = true;
                    } else {
                        alert("Erreur : " + result.message);
                    }
                });
        });
    } else {
        modifierBtn.style.display = "inline-block";
    }

    // Affichage des recettes
    const grid = document.querySelector(".recipe-grid");
    grid.innerHTML = "";

    if (recettes.length === 0) {
        const noRecipeMessage = document.createElement("div");
        noRecipeMessage.classList.add("no-recipes-message");
        noRecipeMessage.textContent = "Aucune recette publiée";
        grid.appendChild(noRecipeMessage);
    } else {
        recettes.forEach((recette) => {
            const card = document.createElement("div");
            card.classList.add("recipe-card");
            card.style.cursor = "pointer";

            const image = recette.image
                ? `data:image/jpeg;base64,${recette.image}`
                : "assets/image/image_tmp_recette.png";

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

            card.addEventListener("click", () => {
                window.location.href = `consulter-recette.html?id=${recette.id}`;
            });

            grid.appendChild(card);
        });
    }
}

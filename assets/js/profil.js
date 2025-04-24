document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    let userId = urlParams.get("user");
    const idConnecte = sessionStorage.getItem("identifiant");
    const MOT_DE_PASSE = sessionStorage.getItem('motDePasse');

    // Si l'usager n'est pas loguer, on le redirige vers la page de connextion
    if (!idConnecte || !MOT_DE_PASSE) {
        window.location.href = 'index.html';
    }
    if(!userId) {
        userId = idConnecte;
    }

    updateNotificationBadge();
    consulterNotifications(idConnecte);

    fetch("./api/profil.php/afficher", {
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
        fetch("./api/profil.php/suivre-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action: "verifier_suivi",
                suivi_id: profil.nom_utilisateur,
                nom_utilisateur: idConnecte,
            }),
        })
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
            fetch("./api/profil.php/suivre-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "ajouter_suivi",
                    suivi_id: profil.nom_utilisateur,
                    nom_utilisateur: idConnecte,
                }),
            })
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

    // Mettre à jour le nombre de recettes
document.querySelector("#nbRecetteStat .stat-number").textContent = profilData.recettes.length;

// Mettre à jour le nombre d'abonnés et abonnements via la route API
fetch("./api/profil.php/nb-abonne-nb-abonnement", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: profil.nom_utilisateur }),
})
    .then((res) => res.json())
    .then((stats) => {
        if (stats.success) {
            document.querySelector("#nbAbonneStat .stat-number").textContent = formatNombre(stats.nb_abonnes);
            document.querySelector("#nbAbonnementStat .stat-number").textContent = formatNombre(stats.nb_abonnements);
        } else {
            console.error("Erreur lors de la récupération des stats :", stats);
        }
    })
    .catch((err) => console.error("Erreur réseau stats :", err));


    function formatNombre(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
        if (n >= 1000) return (n / 1000).toFixed(1) + "k";
        return n;
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

function consulterNotifications(userId) {
    fetch("./api/consulterNotifications.php/afficher", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: userId,
        }),
    })
        .then((response) => response.text())
        .then((text) => {
            //console.log("Réponse brute:", text); // Afficher la réponse brute dans la console
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    afficherNotifications(data.notifications);
                } else {
                    //alert("Erreur : " + data.message);
                }
            } catch (e) {
                console.error("Erreur de parsing JSON:", e);
            }
        })
        .catch((error) => {
            console.error(
                "Erreur lors de la récupération des notifications :",
                error
            );
        });
}
// Fonction pour afficher les notifications
function afficherNotifications(notifications) {
    const notificationList = document.querySelector(".notification-list");
    notificationList.innerHTML = ""; // Réinitialiser la liste de notifications

    notifications.forEach((notification) => {
        const notificationItem = document.createElement("div");
        notificationItem.classList.add("notification-item");

        // Ajout de l'attribut data-id pour cibler la notification
        notificationItem.setAttribute("data-id", notification.id); 

        if (notification.est_lue === 0) {
            notificationItem.classList.add("unread");
        }

        // Ajoute le contenu de la notification
        notificationItem.innerHTML = `
        <div class="notification-item-flex">
            <div class="notification-icon">
                <i class="fas fa-utensils"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.message}</div>
                <div class="notification-time">${notification.date_creation}</div>
            </div>
        </div>
    `;

        // Ajout d'un gestionnaire de clic pour marquer comme lue
        notificationItem.addEventListener("click", () => {
            marquerNotificationLue(notification.id);
        });

        notificationList.appendChild(notificationItem);
    });
    updateNotificationBadge();
}


// Fonction pour marquer une notification comme lue
function marquerNotificationLue(notificationId) {
    fetch("./api/consulterNotifications.php/marquerNotificationLue", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: notificationId }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Mettre à jour l'interface (enlève la classe 'unread' et met à jour le badge)
                const notificationItem = document.querySelector(
                    `.notification-item[data-id="${notificationId}"]`
                );
                if (notificationItem) {
                    notificationItem.classList.remove("unread");
                }

                // Mise à jour du badge de notification non lue
                updateNotificationBadge();
            } else {
                alert("Erreur lors de la mise à jour de la notification.");
            }
        });
}
// Fonction pour mettre à jour le badge de notification avec le nombre de notifications non lues
function updateNotificationBadge() {
    fetch("./api/consulterNotifications.php/nombre-Notifications-non-lue", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: sessionStorage.getItem("identifiant"),
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                const notificationBadge = document.querySelector(".notification-badge");
                const unreadCount = data.unreadCount;

                if (typeof unreadCount === 'number' && unreadCount > 0) {
                    notificationBadge.textContent = unreadCount;
                    notificationBadge.style.display = "block";
                } else {
                    notificationBadge.style.display = "none";
                }
            }
        })
        .catch((error) => console.error("Erreur:", error));
}

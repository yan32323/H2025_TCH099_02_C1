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

    updateNotificationBadge();
    consulterNotifications(userId);

    const cancelBtn = document.getElementById("cancel-btn");

    cancelBtn.addEventListener("click", (event) => {
        event.preventDefault(); // Empêche le rechargement de la page
        window.location.href = `page-profil.html?user=${userId}`; // Redirige vers la page de profil
    });
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


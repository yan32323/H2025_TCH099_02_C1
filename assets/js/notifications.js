document.addEventListener("DOMContentLoaded", function () {
    // Éléments DOM
    const btnFiltres = document.querySelectorAll(".btn-filtre");
    const notificationItems = document.querySelectorAll(".notification-item");
    const etatVide = document.getElementById("etatVide");
    const btnMarquerLus = document.getElementById("btnMarquerLus");
    const notificationBadge = document.getElementById("notificationBadge");
    const notificationBell = document.getElementById("notificationBell");

    let userId = sessionStorage.getItem("identifiant");

    if (userId) {
        consulterNotifications(userId);
    } else {
        console.error("Aucun identifiant utilisateur trouvé dans le stockage.");
        window.location.href = "index.html";
    }

    function mettreAJourBadge() {
        const nombreNonLus = document.querySelectorAll(
            ".notification-item.non-lu"
        ).length;
        notificationBadge.textContent = nombreNonLus;

        if (nombreNonLus === 0) {
            notificationBadge.style.display = "none";
        } else {
            notificationBadge.style.display = "block";
        }
    }
    
    

    btnFiltres.forEach((btn) => {
        btn.addEventListener("click", function () {
            // Changer le style actif
            btnFiltres.forEach((b) => b.classList.remove("actif"));
            this.classList.add("actif");
    
            const filtre = this.getAttribute("data-filtre");
            const items = document.querySelectorAll(".notification-item");
            let visibles = 0;
    
            items.forEach((item) => {
                if (
                    filtre === "tout" ||
                    item.dataset.type === filtre
                ) {
                    item.style.display = "flex";
                    visibles++;
                } else {
                    item.style.display = "none";
                }
            });
    
            const etatVide = document.getElementById("etatVide");
            if (etatVide) {
                etatVide.style.display = visibles === 0 ? "block" : "none";
            }
        });
    });
    

    btnMarquerLus.addEventListener("click", function () {
        const notificationsVisibles = document.querySelectorAll(
            ".notification-item.non-lu"
        );
    
        notificationsVisibles.forEach((item) => {
            if (item.style.display !== "none") {
                const notificationId = item.dataset.id;
                marquerNotificationLue(notificationId);
            }
        });
    
        mettreAJourBadge();
    });
    

    notificationItems.forEach((item) => {
        item.addEventListener("click", function () {
            this.classList.remove("non-lu");
            mettreAJourBadge();
        });
    });

    const btnPagination = document.querySelectorAll(".btn-pagination");
    btnPagination.forEach((btn) => {
        btn.addEventListener("click", function () {
            btnPagination.forEach((b) => b.classList.remove("actif"));
            this.classList.add("actif");
        });
    });
});

function consulterNotifications(userId) {
    fetch("./api/consulterNotifications.php/afficherToutes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erreur serveur : " + response.status);
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                afficherNotifications(data.notifications);
            } else {
                afficherNotifications([]);
            }
        })
        .catch((error) => {
            console.error(
                "Erreur lors de la récupération des notifications :",
                error
            );
        });
}
function afficherNotifications(notifications) {
    const liste = document.getElementById("listeNotifications");
    liste.innerHTML = ""; // Vider la liste avant affichage

    if (!notifications || notifications.length === 0) {
        const messageVide = document.createElement("div");
        messageVide.classList.add("notification-item", "notification-vide");
        messageVide.innerHTML = `
            <div class="notification-icone systeme">
                <i class="fas fa-bell-slash"></i>
            </div>
            <div class="notification-contenu">
                <div class="notification-titre">Aucune notification</div>
                <div class="notification-message">Vous n’avez pas de notifications pour le moment.</div>
            </div>
        `;
        liste.appendChild(messageVide);
        return;
    }
    

    notifications.forEach((notification) => {
        const { id, type, titre, message, date_creation, est_lue } =
            notification;

        const item = document.createElement("div");
        item.classList.add("notification-item");
        const typeMap = {
            "Nouvelle Recette": "recette",
            "Nouveau Commentaire": "commentaire",
            "Nouvel Abonné": "jaime"
        };
        item.dataset.type = typeMap[type] || "autre"; // fallback si jamais un type est inconnu
        
        item.dataset.id = id;

        if (est_lue === 0) {
            item.classList.add("non-lu");
        }

        item.innerHTML = `
            <div class="notification-icone ${type}">
                <i class="fas fa-${getIconClassByType(type)}"></i>
            </div>
            <div class="notification-contenu">
                <div class="notification-titre">${getTitleLabel(type)}</div>
                <div class="notification-message">${message}</div>
                <div class="notification-meta">
                    <span class="notification-temps">${formatRelativeDate(
                        date_creation
                    )}</span>
                    <span class="notification-categorie ${type}">${getCategorieLabel(
            type
        )}</span>
                </div>
            </div>
        `;

        // Marquer comme lue au clic
        item.addEventListener("click", () => {
            marquerNotificationLue(id);
        });

        liste.appendChild(item);
    });

    updateNotificationBadge();
}
function getIconClassByType(type) {
    const icons = {
        "Nouvelle Recette": "utensils",
        "Nouveau Commentaire": "comment",
        "Nouvel Abonné": "user-plus",
    };
    return icons[type] || "info-circle";
}

function getCategorieLabel(type) {
    const labels = {
        "Nouvelle Recette": "Nouvelle recette",
        "Nouveau Commentaire": "Commentaire",
        "Nouvel Abonné": "Abonnement",
    };
    return labels[type] || "Notification";
}
function getTitleLabel(type) {
    const labels = {
        "Nouvelle Recette": "Nouvelle recette ajoutée par un utilisateur",
        "Nouveau Commentaire": "Nouveau commentaire sur votre recette",
        "Nouvel Abonné": "Vous avez un nouvel abonné!",
    };
    return labels[type] || "Notification";
}
function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString("fr-FR");
}
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
                // Mettre à jour l'interface (enlève la classe 'non-lu' et met à jour le badge)
                const notificationItem = document.querySelector(
                    `.notification-item[data-id="${notificationId}"]`
                );
                if (notificationItem) {
                    notificationItem.classList.remove("non-lu");
                }

                // Mise à jour du badge de notification non lue
                updateNotificationBadge();
            } else {
                alert("Erreur lors de la mise à jour de la notification.");
            }
        });
}

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
                const notificationBadge = document.querySelector(
                    ".notification-badge"
                );
                const unreadCount = data.unreadCount;

                // Vérifier si unreadCount est un nombre valide et supérieur à 0
                if (typeof unreadCount === "number" && unreadCount > 0) {
                    notificationBadge.textContent = unreadCount;
                    notificationBadge.style.display = "block";
                } else {
                    notificationBadge.style.display = "none";
                }
            }
        })
        .catch((error) => console.error("Erreur:", error));
}

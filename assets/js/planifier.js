document.addEventListener('DOMContentLoaded', function () {
    const IDENTIFIANT = sessionStorage.getItem('identifiant');
    const MOT_DE_PASSE = sessionStorage.getItem('motDePasse');

    const DIV_CONTENEUR_PLAN = document.getElementById('compteneur-plan-hebdomadaire');
    const MSG_ERREUR = document.getElementById('message-erreur');

    // Si l'usager n'est pas loguer, on le redirige vers la page de connextion
    if (!IDENTIFIANT || !MOT_DE_PASSE) {
        window.location.href = 'index.html';
    }

    updateNotificationBadge();
    consulterNotifications(IDENTIFIANT);

    const boutonCreer = document.querySelector('.btn-creer');
    boutonCreer.addEventListener('click', () => {
        window.location.href = 'creationPlan.html';
    });

    const logo = document.querySelector('.logo'); 
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', function () {
        window.location.href = 'accueil-recette.html'; 
    });


    //Récupéré les plans de repas de l'usager
    initialiserPlanHebdomadaire();


    /**
     * Initialiser le plan de la semaine (Récupéré les données de l'API)
     */
    async function initialiserPlanHebdomadaire() {
        event.preventDefault();

        const FORM_DATA = {identifiant: IDENTIFIANT, motDePasse: MOT_DE_PASSE};

        //Exécuter la requête API pour récupérer les plans de l'usager
        fetch('./api/CreationPlans.php/recuperer-plant-personnel/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(FORM_DATA)
        })
            .then(response => response.json())
            .then(data => {
                if (data.statut === 'success') {

                    genereItemsPlan(data.listePlans);
                   
                } else {
                    MSG_ERREUR.textContent = "Une erreur imprévue est survenue. Veuillez réessayer.";
                }
            }).catch(error => {
                if (error && typeof error === "object" && error.statut === "error" && typeof error["message"] === "string") {
                    // Si c'est une erreur attendu (rédiger par nous même dans l'API)
                    MSG_ERREUR.textContent = error["message"];
                } else {
                    // Si l'erreur n'est pas formatée comme prévu (autre source)
                    console.error("Erreur inattendue :", error);
                    MSG_ERREUR.textContent = "Une erreur imprévue est survenue. Veuillez réessayer.";
                }
            });
    }


    /**
     * Initialiser le somaire du plan de la semaine pour chaque planification
     * @param {Liste d'ojet} listePlans Liste des plans de repas de l'usager
     * @returns Un composant div remplie avec les items de plan de repas
     */
    function genereItemsPlan(listePlans){
        if (listePlans.length === 0) {
            MSG_ERREUR.textContent = "Aucun plan de repas trouvé.";
            return;
        }

        //vider le compteneur avant de le remplir
        DIV_CONTENEUR_PLAN.innerHTML = '';
        MSG_ERREUR.textContent = ''; 

        //Image par défaut pour les plans de repas
        const IMAGE_PLAN = document.createElement('img');
        IMAGE_PLAN.src = 'assets/image/semaine-gourmande.jpg'; 
        IMAGE_PLAN.alt = 'gourmandes';
        IMAGE_PLAN.className = 'image-categorie';

        //Créer chaque item de plan de repas dans le compteneur
        for(let i = 0; i < listePlans.length; i++) {
            const PLAN = listePlans[i];
            const ITEM_PLAN = document.createElement('section');
            ITEM_PLAN.className = 'mb-12';

            const TITRE_PLAN = document.createElement('h3');
            TITRE_PLAN.className = 'titre-section text-left';
            TITRE_PLAN.textContent = PLAN.titre;

            const DESCRIPTION_PLAN = document.createElement('p');
            DESCRIPTION_PLAN.textContent = PLAN.descriptions;

            ITEM_PLAN.appendChild(TITRE_PLAN);
            ITEM_PLAN.appendChild(DESCRIPTION_PLAN);
            ITEM_PLAN.appendChild(IMAGE_PLAN);

            //Ajouter un écouteur d'événement pour rediriger vers la page de détails du plan de repas
            ITEM_PLAN.addEventListener('click', function () {
                window.location.href = 'plan.html?id=' + PLAN.id;
            });

            DIV_CONTENEUR_PLAN.appendChild(ITEM_PLAN);

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
});
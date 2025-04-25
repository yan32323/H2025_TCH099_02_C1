document.addEventListener('DOMContentLoaded', function () {

    const urlParams = new URLSearchParams(window.location.search);
    const recetteId = urlParams.get("id");
    const IDENTIFIANT = sessionStorage.getItem('identifiant');
    const MOT_DE_PASSE = sessionStorage.getItem('motDePasse');

    const DIV_CONTENEUR_PLAN = document.getElementById('conteneur-plan-hebdomadaire');
    const MSG_ERREUR = document.getElementById('message-erreur');

    // Si l'usager n'est pas loguer, on le redirige vers la page de connextion
    if (!IDENTIFIANT || !MOT_DE_PASSE) {
        window.location.href = 'index.html';
    }

    updateNotificationBadge();
    consulterNotifications(IDENTIFIANT);

    if (!recetteId) {
        window.location.href = 'planifier.html';
    }

    document.querySelector(".btn-charger").addEventListener("click", function () {
        window.location.href = "creationPlan.html";
      });

    const logo = document.querySelector('.logo'); 
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', function () {
        window.location.href = 'accueil-recette.html';
    });

    // Gestion de la modification du plan de la semaine
    document.getElementById('btn-modifier-plan').addEventListener('click', function () {
        window.location.href = 'creationPlan.html?id=' + recetteId;
    });


    initialiserPlanDesSemaine(); 

    /**
     * Initialiser le plan de la semaine (Récupéré les données de l'API)
     */
    async function initialiserPlanDesSemaine(){
        event.preventDefault();

        const FORM_DATA = {identifiant: IDENTIFIANT, motDePasse: MOT_DE_PASSE, id: recetteId};

        //Exécuter la requête API pour récupérer les plans de l'usager
        fetch('./api/CreationPlans.php/recuperer-plan-specifique/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(FORM_DATA)
        })
            .then(response => response.json())
            .then(data => {
                if (data.statut === 'success') {

                    genereItemsPlanSemaine(data.planification, data.listeRecettesLundi, data.listeRecettesMardi, data.listeRecettesMercredi, data.listeRecettesJeudi,
                         data.listeRecettesVendredi, data.listeRecettesSamedi, data.listeRecettesDimanche);
                   
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
     * Inititialiser le plan de la semaine avec le plan de repas donner avec c'est liste de reste pour chaque jours de la semaine
     * @param {Objet} planification L'objet de planification contenant le titre et la description
     * @param {Liste d'objet} listeLundi Liste de recette du lundi
     * @param {Liste d'objet} listeMardi Liste de recette du mardi
     * @param {Liste d'objet} listeMercredi Liste de recette du mercredi
     * @param {Liste d'objet} listeJeudi Liste de recette du jeudi
     * @param {Liste d'objet} listeVendredi Liste de recette du vendredi
     * @param {Liste d'objet} listeSamedi Liste de recette du samedi
     * @param {Liste d'objet} listeDimanche Liste de recette du dimanche
     */
    function genereItemsPlanSemaine(planification, listeLundi, listeMardi, listeMercredi, listeJeudi,
        listeVendredi, listeSamedi, listeDimanche) {
        DIV_CONTENEUR_PLAN.innerHTML = "";

        //Ajouter la description sommaire du plan de repas
        const TITRE = document.createElement('h2');
        TITRE.textContent = planification.titre;

        const DESCRIPTION = document.createElement('p');
        DESCRIPTION.textContent = planification.descriptions;

        DIV_CONTENEUR_PLAN.appendChild(TITRE);
        DIV_CONTENEUR_PLAN.appendChild(DESCRIPTION);

        //Ajouter les recettes dans chaque blocs de semaines
        for (let i = 0; i < 7; i++) {
            const BLOC_JOUR = document.createElement('div');
            BLOC_JOUR.className = 'bloc-semaine';

            const JOUR = document.createElement('div');
            JOUR.className = 'etiquette-semaine';

            const BLOC_RECETTE = document.createElement('div');
            BLOC_RECETTE.className = 'cartes';

            //Envoyer la bonne liste de recette selon le jour de la semaine
            switch(i) {
                case 0:
                    JOUR.textContent = 'Lundi';
                    genereItemsJours(BLOC_RECETTE, listeLundi);
                    break;
                case 1:
                    JOUR.textContent = 'Mardi';
                    genereItemsJours(BLOC_RECETTE, listeMardi);
                    break;
                case 2:
                    JOUR.textContent = 'Mercredi';
                    genereItemsJours(BLOC_RECETTE, listeMercredi);
                    break;
                case 3:
                    JOUR.textContent = 'Jeudi';
                    genereItemsJours(BLOC_RECETTE, listeJeudi);
                    break;
                case 4:
                    JOUR.textContent = 'Vendredi';
                    genereItemsJours(BLOC_RECETTE, listeVendredi);
                    break;
                case 5:
                    JOUR.textContent = 'Samedi';
                    genereItemsJours(BLOC_RECETTE, listeSamedi);
                    break;
                case 6:
                    JOUR.textContent = 'Dimanche';
                    genereItemsJours(BLOC_RECETTE, listeDimanche);
                    break;
            }
            BLOC_JOUR.appendChild(JOUR);
            BLOC_JOUR.appendChild(BLOC_RECETTE);
            DIV_CONTENEUR_PLAN.appendChild(BLOC_JOUR);
        }
    }


    /**
     * Initialiser le bloc de recette avec les recettes de la liste
     * @param {Composant div} BLOC_RECETTE Le bloc de recette à remplir
     * @param {Liste d'objet} listeRecettes La liste de recette à afficher
     * @returns Le div passer en paramètre avec les recettes de la liste
     */
    function genereItemsJours(BLOC_RECETTE, listeRecettes) {

        if (listeRecettes.length === 0) {
            MSG_ERREUR.textContent = "Aucune recette trouvée pour l'un des jours.";
            return;
        }

        //Remplir chaque bloc de recette avec les recettes de la liste
        listeRecettes.forEach(recette => {
            const RECETTE = document.createElement('div');
            RECETTE.className = 'carte';

            const IMAGE = document.createElement('img');
            IMAGE.src = `data:image/jpeg;base64,${recette.image}`;
            IMAGE.alt = recette.nom;

            const TITRE_RECETTE = document.createElement('h3');
            TITRE_RECETTE.textContent = recette.nom;

            const TEMPS_RECETTE = document.createElement('p');
            TEMPS_RECETTE.textContent = `⏱ ${recette.temps_de_cuisson} minutes`;

            const TYPE = document.createElement('p');
            TYPE.textContent = imageType(recette.type) + ' ' + recette.type;

            RECETTE.appendChild(IMAGE);
            RECETTE.appendChild(TITRE_RECETTE);
            RECETTE.appendChild(TEMPS_RECETTE);
            RECETTE.appendChild(TYPE);

            //Rediriger vers la page des détails des recettes 
            RECETTE.addEventListener('click', () => {
                window.location.href = 'consulter-recette.html?id=' + recette.id;
            });

            BLOC_RECETTE.appendChild(RECETTE);
        });
    }


    /**
     * Obtenir l'image coorespondant au type de la recette.
     * @param {String} typeRecette Le type de la recette
     * @returns l'image coorespondant au type de la recette
     */
    function imageType(typeRecette){
        switch(typeRecette){
            case 'Déjeuner': return '🍳';
            case 'Dîner': return '🍝';
            case 'Souper': return '🍲';
            case 'Collation': return '🧃';
            case 'Apéritif': return '🍙';
            case 'Entrée': return '🥗';
            case 'Plat principal': return '🍛';
            case 'Dessert': return '🍰';
            default: return '🥪';
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
document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logoutButton");
    const MSG_ERREUR = document.getElementById("message-erreur");

    // Get identifiant and motDePasse from sessionStorage
    const IDENTIFIANT = sessionStorage.getItem("identifiant");
    const MOT_DE_PASSE = sessionStorage.getItem("motDePasse");

    let filtreType = "tout";
    let filtreRestriction = "tout";
    let listeRecettesActuel = [];
    let listeRecetteAimee = [];

    // Check if user is logged in (identifiant and motDePasse are in sessionStorage)
    if (!IDENTIFIANT || !MOT_DE_PASSE) {
        window.location.href = "index.html"; // Redirect to login page if not logged in
        return;
    }

    //Initialiser la liste des recettes initiale
    updateListeRecettesActuel(filtreType, filtreRestriction);
    updateNotificationBadge()

    //Consulter les notifications de l'utilisateur
    consulterNotifications(IDENTIFIANT);

    /*Ajouter l'intérections sur les composants*/

    // Initialisation du carrousel Bootstrap
    const carousel = new bootstrap.Carousel(
        document.getElementById("carouselCategoriesBootstrap"),
        {
            interval: 5000, // temps entre les slides en ms
            wrap: true,
        }
    );

    // Pour les cartes de recettes
    /*const cards = document.querySelectorAll('.carte');
    cards.forEach(card => {
        card.addEventListener('click', () => {
        window.location.href = 'consulter-recette.html'; 
        });
    });*/

    // Pour les boutons coeur
    /*document.querySelectorAll('.coeur').forEach(btn => {
        btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêche la propagation au parent (carte)
        btn.classList.toggle('aime');
        });
    });*/

    new bootstrap.Carousel(
        document.getElementById("carouselCategoriesBootstrap2"),
        {
            interval: 5000,
            wrap: true,
        }
    );

    // Event listener for logout button
    logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem("identifiant"); // Clear identifiant from sessionStorage
        sessionStorage.removeItem("motDePasse"); // Clear motDePasse from sessionStorage
        window.location.href = "index.html"; // Redirect to login page
    });

    //Mettre à jour la liste des recettes en fonction du filtre sélectionné
    document.querySelectorAll(".categorie").forEach((categorie) => {
        categorie.addEventListener("click", function () {
            let valeurDiv = categorie
                .querySelector(".texte-categorie")
                .textContent.trim();
            const typeAutorise = [
                "Déjeuner",
                "Dîner",
                "Souper",
                "Collation",
                "Apéritif",
                "Entrée",
                "Plat principal",
                "Dessert",
            ];
            const restrictionAutorise = [
                "Végétarien",
                "Végan",
                "Sans gluten",
                "Sans lactose",
                "Pescatarien",
                "Favoris",
            ];

            // Modifier la valeur du filtre et arrêter l'exécution si la valeur n'est pas reconnue
            if (typeAutorise.includes(valeurDiv)) {
                filtreType = valeurDiv;
            } else if (restrictionAutorise.includes(valeurDiv)) {
                filtreRestriction = valeurDiv;
            } else if (valeurDiv === "Mes recettes") {
                filtreRestriction = "miennes";
            } else if (valeurDiv === "Aucune") {
                filtreRestriction = "tout";
            } else if (valeurDiv === "Voir tout") {
                filtreType = "tout";
            } else {
                return;
            }

            // Mettre à jour la liste des recettes en fonction des filtres sélectionnés
            updateListeRecettesActuel(filtreType, filtreRestriction);
        });
    });

    //Faire la sélection des recettes en fonction de la barre de recherche
    const barreRecherche = document.getElementById("zone-recherche");
    barreRecherche.addEventListener("input", function () {
        if (barreRecherche.value.length === 0) {
            genereItemsRecettes(listeRecettesActuel, listeRecetteAimee);
        }
        let motEnCreation = barreRecherche.value.trim();
        let nouvelleListeRecette = listeRecettesActuel.filter((recette) =>
            recette.nom.toLowerCase().includes(motEnCreation.toLowerCase())
        );
        genereItemsRecettes(nouvelleListeRecette, listeRecetteAimee);
    });

    /**
     * Méthode pour générer la nouvelle liste des recettes en fonctions des filtres données.
     * @param {String} filtreType Le nom du filtre du type de la recette
     * @param {String} filtreRestriction Le nom du filtre de la restriction de la recette
     */
    async function updateListeRecettesActuel(filtreType, filtreRestriction) {
        event.preventDefault();

        //Plannifier le message d'erreur
        const grilleRecettes = document.getElementById("contenant-recettes");
        grilleRecettes.innerHTML = "";

        //Chercher la liste des recettes
        let dataJSON = {
            identifiant: IDENTIFIANT,
            motDePasse: MOT_DE_PASSE,
            filtreType: filtreType,
            filtreRestriction: filtreRestriction,
        };
        fetch("./api/CreationRecettes.php/recuperer-recettes-filtrer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataJSON),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.statut === "success") {
                    //vérifier si on a des éléments dans la liste des recettes
                    listeRecettesActuel = data.listeRecette;
                    listeRecetteAimee = data.listeRecetteAime;
                    const motEncreation = document
                        .getElementById("zone-recherche")
                        .value.trim();
                    let listeRecetteFiltrerRecherche = data.listeRecette.filter(
                        (recette) =>
                            recette.nom
                                .toLowerCase()
                                .includes(motEncreation.toLowerCase())
                    );
                    MSG_ERREUR.textContent = "";
                    if (listeRecetteFiltrerRecherche.length === 0) {
                        MSG_ERREUR.textContent =
                            "Aucune recette trouvée avec les filtres sélectionnés.";
                    }
                    //filtrer selon le texte inscrit dans la bare de recherche
                    genereItemsRecettes(
                        listeRecetteFiltrerRecherche,
                        data.listeRecetteAime
                    );
                } else {
                    MSG_ERREUR.textContent =
                        data.message + " Lors de l'intialisation des recettes";
                }
            })
            .catch((error) => {
                if (
                    error &&
                    typeof error === "object" &&
                    error.statut === "error" &&
                    typeof error["message"] === "string"
                ) {
                    // Si c'est une erreur attendu (rédiger par nous même dans l'API)
                    MSG_ERREUR.textContent = error["message"];
                } else {
                    // Si l'erreur n'est pas formatée comme prévu (autre source)
                    console.error("Erreur inattendue :", error);
                    MSG_ERREUR.textContent =
                        "Une erreur imprévue est survenue. Veuillez réessayer.";
                }
            });
    }

    /**
     * Gènère les éléments d'une recette abrégé dans la grille des recettes.
     * @param {Array} nouvelleListeRecette La liste des recettes à afficher
     * @param {Array} listeRecetteAime La liste des recettes aimées par l'utilisateur
     */
    function genereItemsRecettes(nouvelleListeRecette, listeRecetteAime) {
        // Vider la liste actuelle
        const grilleRecettes = document.getElementById("contenant-recettes");
        grilleRecettes.innerHTML = "";

        // Créer les nouveaux éléments de recette
        nouvelleListeRecette.forEach((recette) => {
            const carte = document.createElement("div");
            carte.className = "carte";
            //Rediriger vers la page des détails des recettes
            carte.addEventListener("click", () => {
                window.location.href =
                    "consulter-recette.html?id=" + recette.id;
            });

            //Créer le bouton coeur (il sera remplie si il est aimé)
            const button = document.createElement("button");
            if (listeRecetteAime.includes(recette.id)) {
                button.className = "coeur aime";
            } else {
                button.className = "coeur";
            }
            //Ajouter le like et faire la requête à la base de données
            button.addEventListener("click", (e) => {
                e.stopPropagation(); // Empêche la propagation au parent (carte)
                button.classList.toggle("aime");
                let ajouterLike = false;
                if (button.classList.contains("aime")) {
                    ajouterLike = true;
                }
                ajouterRetirerLike(recette.id, ajouterLike);
            });
            button.innerHTML = '<i class="fas fa-heart"></i>';

            //Créer l'image de la recette
            const image = document.createElement("img");
            image.src = `data:image/jpeg;base64,${recette.image}`;
            image.alt = recette.nom;
            image.className = "image-carte";

            //Créer les informations de la recette
            const contenuCarte = document.createElement("div");
            contenuCarte.className = "contenu-carte";
            const titre = document.createElement("h3");
            titre.textContent = recette.nom;
            const description = document.createElement("p");
            description.textContent =
                imageType(recette.type) +
                " " +
                recette.type +
                " · " +
                recette.temps_de_cuisson +
                " min";
            description.className = "info-carte";

            //Ajouter les éléments
            contenuCarte.appendChild(titre);
            contenuCarte.appendChild(description);

            carte.appendChild(button);
            carte.appendChild(image);
            carte.appendChild(contenuCarte);
            grilleRecettes.appendChild(carte);
        });
    }

    /**
     * Ajouter ou retirer un like à une recette.
     * @param {int} idRecette L'identifiant de la recette
     * @param {boolean} ajouterLike True si on veut ajouter un like, false si on veut le retirer
     */
    async function ajouterRetirerLike(idRecette, ajouterLike) {
        event.preventDefault();
        let dataJSON = {
            identifiant: IDENTIFIANT,
            motDePasse: MOT_DE_PASSE,
            idRecette: idRecette,
        };

        if (ajouterLike) {
            //lancer une demande pour ajouter un like
            fetch("./api/CreationRecettes.php/ajouter-recette-aime", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataJSON),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.statut === "success") {
                    } else {
                        MSG_ERREUR.textContent = data.message;
                    }
                })
                .catch((error) => {
                    if (
                        error &&
                        typeof error === "object" &&
                        error.statut === "error" &&
                        typeof error["message"] === "string"
                    ) {
                        // Si c'est une erreur attendu (rédiger par nous même dans l'API)
                        MSG_ERREUR.textContent = error["message"];
                    } else {
                        // Si l'erreur n'est pas formatée comme prévu (autre source)
                        console.error("Erreur inattendue :", error);
                        MSG_ERREUR.textContent =
                            "Une erreur imprévue est survenue. Veuillez réessayer.";
                    }
                });
        } else {
            //lancer une demande pour retirer un like
            fetch("./api/CreationRecettes.php/delete-recette-aime", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataJSON),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.statut === "success") {
                    } else {
                        MSG_ERREUR.textContent = data.message;
                    }
                })
                .catch((error) => {
                    if (
                        error &&
                        typeof error === "object" &&
                        error.statut === "error" &&
                        typeof error["message"] === "string"
                    ) {
                        // Si c'est une erreur attendu (rédiger par nous même dans l'API)
                        MSG_ERREUR.textContent = error["message"];
                    } else {
                        // Si l'erreur n'est pas formatée comme prévu (autre source)
                        console.error("Erreur inattendue :", error);
                        MSG_ERREUR.textContent =
                            "Une erreur imprévue est survenue. Veuillez réessayer.";
                    }
                });
        }
    }

    /**
     * Obtenir l'image coorespondant au type de la recette.
     * @param {String} typeRecette Le type de la recette
     * @returns l'image coorespondant au type de la recette
     */
    function imageType(typeRecette) {
        switch (typeRecette) {
            case "Déjeuner":
                return "🍳";
            case "Dîner":
                return "🍝";
            case "Souper":
                return "🍲";
            case "Collation":
                return "🧃";
            case "Apéritif":
                return "🍙";
            case "Entrée":
                return "🥗";
            case "Plat principal":
                return "🍛";
            case "Dessert":
                return "🍰";
            default:
                return "🥪";
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
            .then((response) => response.text()) // Utilisation de response.text() pour obtenir la réponse brute
            .then((text) => {
                //console.log("Réponse brute:", text); // Afficher la réponse brute dans la console

                // Ensuite, tu peux essayer de convertir le texte en JSON si c'est nécessaire
                try {
                    const data = JSON.parse(text);
                    if (data.success) {
                        afficherNotifications(data.notifications); // Fonction pour afficher les notifications dans l'UI
                    } else {
                        //alert("Erreur : " + data.message); // Afficher l'erreur
                    }
                } catch (e) {
                    console.error("Erreur de parsing JSON:", e); // Afficher l'erreur si le JSON est invalide
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
                user_id: IDENTIFIANT,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    const notificationBadge = document.querySelector(".notification-badge");
                    const unreadCount = data.unreadCount;
    
                    // Vérifier si unreadCount est un nombre valide et supérieur à 0
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

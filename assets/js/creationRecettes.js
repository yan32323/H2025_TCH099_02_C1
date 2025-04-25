document.addEventListener("DOMContentLoaded", async function () {

    const chemin ="http://localhost/H2025_TCH099_02_C1";

    let effacerRecette = document.getElementById("btn-suppression-recette");
    let imageRecette = document.getElementById("prochaine-image");
    let aperçu = document.getElementById("aperçu-image");
    let boutonSupprimerImage = document.getElementById("supprimer-image");
    let zoneDragDrop = document.getElementById("nouvelles-images-recette");
    let ajouterIngredient = document.getElementById(
        "btn-creation-recette-ingredient"
    );
    let ajouterIngredientListe = document.getElementById("liste-ingredients");
    let ajouterEtape = document.getElementById("btn-creation-recette-etape");
    let envoyerRecette = document.getElementById("btn-envoi-recette");

      // sliders de temps et de portions
    let sliderTemps = document.getElementById("estimation-temps");
    let texteTemps = document.getElementById("temps-estime");
    let sliderPortions = document.getElementById("estimation-portions");
    let textePortions = document.getElementById("portions-estime");

      // boutons radio des difficultes
    let diffiulte1 = document.getElementById("facile");
    let diffiulte2 = document.getElementById("moyen");
    let diffiulte3 = document.getElementById("difficile");

    //checkboxes des restrictions alimentaires
    let restriction1 = document.getElementById("res-vegetarien");
    let restriction2 = document.getElementById("res-vegan");
    let restriction3 = document.getElementById("res-sans-gluten");
    let restriction4 = document.getElementById("res-sans-lactose");
    let restriction5 = document.getElementById("res-pescetarien");

      // differentes zones de texte
    let zoneIngredient = document.getElementById("zone-ingredients");
    let zoneImages = document.getElementById("zone-images");

    let zoneEtape = document.getElementById("zone-etape");
    let texteTitre = document.getElementById("titre-recette");
    let texteDescription = document.getElementById("description-recette");

      // variables de la recette
    let editRecette = false;
    let recetteLocale;
    let imageUnique = null;
    let tableauIngredients = [];
    let objListeTousIngredients = [];
    let tableauEtapes = [];
    let idRecette = null;

    const idConnecte = sessionStorage.getItem("identifiant");

    updateNotificationBadge();
    consulterNotifications(idConnecte);

    /**
     * Ecouteur d'événement pour le bouton d'image
     */
    imageRecette.addEventListener("change", function () {
        aperçu.querySelectorAll("img").forEach((img) => img.remove());
        
        const fichier = this.files[0];
        if (!fichier) {
            boutonSupprimer.style.display = "none";
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const image = document.createElement("img");
            image.src = e.target.result;
            aperçu.insertBefore(image, boutonSupprimerImage);
            boutonSupprimerImage.style.display = "inline-block";
        };
        reader.readAsDataURL(fichier);
    });
/**
 * Ecouteur d'événement pour le bouton de suppression d'image
 */
    boutonSupprimerImage.addEventListener("click", function (e) {
        event.preventDefault();
        aperçu.querySelectorAll("img").forEach((img) => img.remove());
        imageRecette.value = ""; // Réinitialise le champ input
        boutonSupprimerImage.style.display = "none";
    });
    // Ajout drag and drop sur toute la zone
    ["dragenter", "dragover"].forEach((eventName) => {
        zoneDragDrop.addEventListener(eventName, (e) => {
            event.preventDefault();
            e.stopPropagation();
            zoneDragDrop.classList.add("dragover");
        });
    });

    ["dragleave", "drop"].forEach((eventName) => {
        zoneDragDrop.addEventListener(eventName, (e) => {
            event.preventDefault();
            e.stopPropagation();
            zoneDragDrop.classList.remove("dragover");
        });
    });

    // Lorsqu’un fichier est déposé
    zoneDragDrop.addEventListener("drop", (e) => {
        const fichier = e.dataTransfer.files[0];
        if (!fichier || !fichier.type.startsWith("image/")) return;

        // Met à jour le champ input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(fichier);
        imageRecette.files = dataTransfer.files;

        // Déclenche le comportement d’affichage existant
        imageRecette.dispatchEvent(new Event("change"));
    });

    let identifiant = sessionStorage.getItem('identifiant');

    /**
     * Ecouteur d'événement pour le bouton de suppression de la recette
     */
effacerRecette.addEventListener("click", async function () {
    event.preventDefault();

    if (confirm("Etes-vous sûr de vouloir supprimer cette recette?")) {
        try {

            // si pas une recette presente dans la base de donnees
            if (!editRecette) {
                alert("Recette supprimee.");
                back();
            } else {

                //demande de suppression cote serveur
                let response = await fetch(
                    "./api/CreationRecettes.php/recettes/supprimer/" +
                        recetteLocale,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: recetteLocale,
                            identifiant: identifiant
                        }),
                    }
                );

                let text = await response.text();
                let reponse = JSON.parse(text);

                if (reponse.status === "ok") {
                    alert("Recette supprimee.");
                    back();
                } else {
                    erreurSuppression();
                }
            }
        } catch (error) {
            erreurSuppression();
        }
    }
});

    /**
     * Ecouteur d'événement pour le slider d'estimation du temps
     */
    sliderTemps.oninput = function () {
        texteTemps.textContent =
            this.value < 2
                ? this.value + " minute"
                : this.value > 180
                ? "180 minutes et +"
                : this.value + " minutes";
    };

    /**
     * Ecouteur d'événement pour le slider d'estimation des portions
     */
    sliderPortions.oninput = function () {
        textePortions.textContent =
            this.value < 2
                ? this.value + " portion"
                : this.value > 16
                ? "16 portions et +"
                : this.value + " portions";
    };
/**
 * Ecouteur d'événement pour le bouton d'ajout d'ingrédients
 */
    ajouterIngredient.addEventListener("click", function () {
        event.preventDefault();
        const zoneProchainIngredient = document.getElementById(
            "prochain-ingredient-s"
        );
        // Récupérer l'ingrédient sélectionné
        const nomIngredient = zoneProchainIngredient.value.trim();
        zoneProchainIngredient.value = "";

        // seulement mettre a jour si du texte a ete recu et est valide
        if (!nomIngredient) return;

        // Cherche l'objet ingredient dans la liste complète
        const ingredientTrouve = objListeTousIngredients.find(
            (ing) => ing.nom === nomIngredient
        );

        if (!ingredientTrouve) {
            alert("Ingrédient non trouvé dans la liste !");
            return;
        }

        // Vérifie s'il est déjà dans la liste
        const dejaAjoute = tableauIngredients.some(
            (ing) => ing.nom === nomIngredient
        );
        if (dejaAjoute) return;

        // Ajouter à la liste
        tableauIngredients.push({
            id: ingredientTrouve.id,
            nom: ingredientTrouve.nom,
            unite_de_mesure: ingredientTrouve.unite_de_mesure,
            quantite: "",
        });

        updateIngredient();
    });

  /**
   * Ajoute une etape a la recette
   */
    ajouterEtape.addEventListener("click", function () {
        event.preventDefault();
        let zoneProchaineEtape = document.getElementById("prochaine-etape");
        let texteProchaineEtape = zoneProchaineEtape.value.trim();
        zoneProchaineEtape.classList.add("zone-instruction");
        zoneProchaineEtape.value = "";

        if (texteProchaineEtape) {
            tableauEtapes.push(texteProchaineEtape);
            updateEtape();
        }
    });

    envoyerRecette.addEventListener("click", sendRecette);

    /**
     * Fonction recuperant la recette a editer
     * @param {*} recette l'identifiant de la recette a editer
     */
    async function fetchRecette(recette) {
        try {
            let response = await fetch(
                "./api/CreationRecettes.php/recuperer-recette-complete", 
            { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({"identifiant":sessionStorage.getItem("identifiant"),"motDePasse" : sessionStorage.getItem("motDePasse"), "idRecette" : recette})
            });;
            let objReponse = await response.json();

            let objRecette = objReponse.recetteComplete;

            if (!objRecette["error"]!=null) {
                texteTitre.value = objRecette.nom;
                imageUnique = objRecette.image;
                tableauIngredients = objRecette.ingredients;
                tableauEtapes = objRecette.etapes;
                texteDescription.value = objRecette.description;
                sliderTemps.value = objRecette.temps;
                sliderPortions.value = objRecette.portion;
                sliderTemps.oninput();
                sliderPortions.oninput();

                if (objRecette.difficulter == "facile") diffiulte1.checked = true;
                else if (objRecette.difficulter == "moyen") diffiulte2.checked = true;
                else diffiulte3.checked = true;

                if (imageUnique) {
                    let divImage = document.createElement("div");
                    divImage.innerHTML = "<img src='" + imageUnique + "'>";
                    zoneImages.appendChild(divImage);
                }

                tableauIngredients.forEach((ingredient, i) => {
                    let divIngredient = document.createElement("div");
                    divIngredient.classList.add("groupe_ingredient");
                    divIngredient.innerHTML = `
            <p class='nom_ingredient' id='ing${i}'>${ingredient.nom}</p>
            <input class='zone_ingredient' id='mesure${i}' placeholder='Entrez une valeur' value='${ingredient.quantite}' required></input>
            <p class='mesure_ingredient'>${ingredient.unite_de_mesure}</p>
            <button class='btn_ingredient remove-item-button' id='supr-ing${i}'>X</button>`;

                    zoneIngredient.appendChild(divIngredient);

                    document.getElementById(`quantite${i}`).addEventListener("input", function () {
                        tableauIngredients[i].quantite = this.value;
                      });

                    document
                        .getElementById(`supr-ing${i}`)
                        .addEventListener("click", function () {
                            tableauIngredients = remove(tableauIngredients, i);
                            updateIngredient();
                        });
                });

                for (let radio of getElementById("type")) {
                    if (radio.value == objRecette.type) {
                        radio.checked = true;
                        break;
                    }
                }

                if(objRecette.restrictions.includes(restriction1.value)){
                    restriction1.checked = true;
                }
                if(objRecette.restrictions.includes(restriction2.value)){
                    restriction2.checked = true;
                }
                if(objRecette.restrictions.includes(restriction3.value)){
                    restriction3.checked = true;
                }
                if(objRecette.restrictions.includes(restriction4.value)){
                    restriction4.checked = true;
                }
                if(objRecette.restrictions.includes(restriction5.value)){
                    restriction5.checked = true;
                }

                tableauEtapes.forEach((etape, i) => {
                    let divEtape = document.createElement("div");
                    divEtape.innerHTML = `<p id='etape${i}'>${etape}</p><button id='supr-etape${i}'>X</button>`;
                    zoneEtape.appendChild(divEtape);

                    document
                        .getElementById(`supr-etape${i}`)
                        .addEventListener("click", function () {
                            tableauEtapes = remove(tableauEtapes, i);
                            updateEtape();
                        });
                });
            } else {
                erreurFetchRecette();
            }
        } catch (error) {
            erreurFetchRecette();
        }
    }
    
/**
 * Fonction pour recuperer la liste des ingredients
 */
    async function fetchIngredients() {
        try {
            let response = await fetch(
                "./api/CreationRecettes.php/ingredients");

            if (!response.ok) {
                throw new Error(
                    "Erreur lors de la récupération des ingrédients"
                );
            }


            let resultat = await response.json();

            if (resultat["error"]!=null) {
                erreurFetchIngredients();
            } else {
                let ajouterIngredientListe =
                    document.getElementById("liste-ingredients");

                ajouterIngredientListe.innerHTML = "";

                resultat.forEach((ingredient) => {
                    let divIngredient = document.createElement("option");
                    divIngredient.innerHTML = ingredient.nom;
                    divIngredient.id = ingredient.id;
                    ajouterIngredientListe.appendChild(divIngredient);
                });

                ajouterIngredientListe.selectedIndex = -1;
                objListeTousIngredients = resultat;
            }
        } catch (error) {
            console.error(error);

            erreurFetchIngredients();
        }
    }

    function toBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result); // contient le prefix data:image/png;base64,...
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

    async function sendRecette() {
        event.preventDefault();

    // Vérification des champs

    if (!texteTitre.value.trim()) {
      alert("Veuillez entrer un titre pour votre recette.");
      return;
    }

    if (!diffiulte1.checked && !diffiulte2.checked && !diffiulte3.checked) {
      alert("Veuillez entrer une difficulte pour votre recette.");
      return;
    }

    if (!texteDescription.value.trim()) {
      alert("Veuillez entrer une description pour votre recette.");
      return;
    }
    if (tableauEtapes.length == 0) {
      alert("Veuillez entrer au moins une etape pour votre recette.");
      return;
    }
    if (tableauIngredients.length == 0) {
      alert("Veuillez entrer au moins un ingredient pour votre recette.");
      return;
    }
    if (tableauIngredients.some(
        (ing) => ing.quantite == null || ing.quantite == "" || ing.quantite <= 0
    )){
       alert("Veuillez entrer une unité de mesure pour chaque ingrédient plus grande que 0.");
        return; 
    }
    let isCheckedType = null;
    for (let radio of document.getElementsByName("type")) {
        if (radio.checked) {
          isCheckedType = radio;
          break;
        }
    }
    if (isCheckedType == null) {
        alert("Veuillez choisir un type de recette.");
        return;
    }

    // Envoi des données
        let restrictionsToSend=[];
        if (restriction1.checked) {
            restrictionsToSend.push(restriction1.value);
        }    
        if (restriction2.checked) {
            restrictionsToSend.push(restriction2.value);
        }
        if (restriction3.checked) {
            restrictionsToSend.push(restriction3.value);
        }
        if (restriction4.checked) {
            restrictionsToSend.push(restriction4.value);
        }
        if (restriction5.checked) {
            restrictionsToSend.push(restriction5.value);
        }

        let imageBase64 

        if (imageRecette.files.length > 0) {
        // Vérifie si une image a été sélectionné
        // Convertit l'image en base64
                   const imagefile = imageRecette.files[0];
         imageBase64 = await toBase64(imagefile);
        } else {
         imageBase64 = null;
        }

        const bodyData = {
            edit: editRecette,
            titre: texteTitre.value.trim(),
            description: texteDescription.value.trim(),
            ingredients: tableauIngredients,
            etapes: tableauEtapes,
            type: isCheckedType.value,
            restrictions: restrictionsToSend,
            temps: parseInt(sliderTemps.value),
            portion: parseInt(sliderPortions.value),
            difficulte: diffiulte1.checked ? "facile" : diffiulte2.checked ? "moyen" : "difficile",
            personne: IDENTIFIANT,
            id: recetteLocale,
            image: imageBase64,
        };

        // Envoi du corps au serveur
        try {
            const response = await fetch("./api/CreationRecettes.php/recettes/creer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData)
            });

            let text = await response.text();

            let result = JSON.parse(text);
    
            if (result.hasOwnProperty("success")) {
                alert("Recette envoyée !");

            } else {
                alert("Erreur lors de l’envoi."+ result.message);
            }
        } catch (error) {
            console.error("Erreur fetch :", error);
            alert("Erreur réseau !");
        }
    }
    
    /**
     * Fonction pour mettre à jour la liste des ingrédients
     */
    function updateIngredient() {
        zoneIngredient.innerHTML = "";
        tableauIngredients.forEach((ingredient, i) => {
            let divIngredient = document.createElement("div");
            divIngredient.classList.add("groupe_ingredient");

            // Creation de l'element HTML de l'ingrédient
            divIngredient.innerHTML = `
            <p class='nom_ingredient' id='ing${i}'>${ingredient.nom}</p>
            <input class='zone_ingredient' id='quantite${i}' placeholder='Quantité' value='${ingredient.quantite}' required>
            <input class='unite_ingredient' id='unite_de_mesure${i}' placeholder='Unité' value='${ingredient.unite_de_mesure}' readonly>
            <button class='btn_ingredient remove-item-button' id='supr-ing${i}'>
                <img src="assets/image/trash.png" alt="Supprimer" class="icon-delete">
            </button>
        `;

            zoneIngredient.appendChild(divIngredient);

            document.getElementById(`quantite${i}`).addEventListener("input", function () {
                tableauIngredients[i].quantite = this.value;
              });

            document
                .getElementById(`supr-ing${i}`)
                .addEventListener("click", function () {
                    tableauIngredients = remove(tableauIngredients, i);
                    updateIngredient();
                });
        });
    }

    /**
     * Fonction pour mettre à jour la liste des étapes
     */
    function updateEtape() {
        zoneEtape.innerHTML = "";
        tableauEtapes.forEach((etape, i) => {
            let divEtape = document.createElement("div");

            // Creation de l'element HTML de l'étape
            divEtape.innerHTML = `
                <p id='etape${i}'>${etape}</p>
                <button id='supr-etape${i}'>
               <img src="assets/image/trash.png" alt="Supprimer" class="icon-delete">
                </button>`;
            zoneEtape.appendChild(divEtape);
            document
                .getElementById(`supr-etape${i}`)
                .addEventListener("click", function () {
                    tableauEtapes = remove(tableauEtapes, i);
                    updateEtape();
                });
        });
    }

    function remove(tableau, i) {
        if (i > -1&&i<tableau.length) {
          tableau.splice(i, 1);
        }
        return tableau;
      }

    // Fonctions lancees en cas d'erreurs

    function erreurFetchRecette() {
        alert("Erreur lors de la récupération de la recette.");
    }

    function erreurFetchIngredients() {
        alert("Erreur lors de la récupération des ingrédients.");
    }

    function erreurEnvoi() {
        alert("Erreur lors de l'envoi de la recette.");
    }

    function erreurSuppression() {
        alert("Erreur lors de la suppression de la recette.");
    }

    function back() {
        window.history.back();
    }
    
    // Initialisation

   // Récupérer les données utilisateur de sessionStorage
   const IDENTIFIANT = sessionStorage.getItem('identifiant');
   const MOT_DE_PASSE = sessionStorage.getItem("motDePasse");

    if (!IDENTIFIANT || !MOT_DE_PASSE) {
        alert("Vous devez être connecté pour interagir avec cette page.");
        window.location.href = 'page-connexion.html'; // Redirige vers la page de connexion si non connecté
        return;
    }

        //recuperation de la recette si demande
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("id")) {
        idRecette = urlParams.get("id");
        editRecette = true;
        fetchRecette(idRecette);
      } else {
        editRecette = null;
      }

    await fetchIngredients();

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

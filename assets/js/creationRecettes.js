document.addEventListener("DOMContentLoaded", async function () {

    const chemin ="http://localhost/planigo/H2025_TCH099_02_C1";

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

      // differentes zones de texte
    let zoneIngredient = document.getElementById("zone-ingredients");
    let zoneImages = document.getElementById("zone-images");

    let zoneEtape = document.getElementById("zone-etape");
    let texteTitre = document.getElementById("titre-recette");
    let texteDescription = document.getElementById("description-recette");

      // variables de la recette
    let objRecetteJSON = null;
    let editRecette = false;
    let objRecette = null;
    let recetteLocale;
    let titre = "";
    let imageUnique = null;
    let tableauIngredients = [];
    let objListeTousIngredients = [];
    let tableauEtapes = [];
    let description = "";

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
        e.preventDefault();
        aperçu.querySelectorAll("img").forEach((img) => img.remove());
        imageRecette.value = ""; // Réinitialise le champ input
        boutonSupprimerImage.style.display = "none";
    });
    // Ajout drag and drop sur toute la zone
    ["dragenter", "dragover"].forEach((eventName) => {
        zoneDragDrop.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            zoneDragDrop.classList.add("dragover");
        });
    });

    ["dragleave", "drop"].forEach((eventName) => {
        zoneDragDrop.addEventListener(eventName, (e) => {
            e.preventDefault();
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
    e.preventDefault();

    if (confirm("Etes-vous sûr de vouloir supprimer cette recette?")) {
        try {

            // si pas une recette presente dans la base de donnees
            if (!editRecette) {
                alert("Recette supprimee.");
                back();
            } else {

                //demande de suppression cote serveur
                let response = await fetch(
                    chemin+ "/api/CreationRecettes.php/recettes/supprimer/" +
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
        e.preventDefault();
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
        });

        updateIngredient();
    });

  /**
   * Ajoute une etape a la recette
   */
    ajouterEtape.addEventListener("click", function () {
        e.preventDefault();
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
                chemin+"/api/CreationRecettes.php/recuperer-recette-complete", 
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

                    document
                        .getElementById(`supr-ing${i}`)
                        .addEventListener("click", function () {
                            tableauIngredients = remove(tableauIngredients, i);
                            updateIngredient();
                        });
                });

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
                chemin + "/api/CreationRecettes.php/ingredients");

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
        const identifiant = sessionStorage.getItem('identifiant');

        tableauIngredients = tableauIngredients.map((ingredient, i) => {
            const quantiteInput = document.getElementById(`quantite${i}`);
            const uniteInput = document.getElementById(
                `unite_de_mesure${i}`
            );

            return {
                ...ingredient,
                quantite: parseFloat(quantiteInput.value),
                unite_de_mesure: uniteInput.value.trim(),
            };
        });
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
            edit: false,
            titre: texteTitre.value.trim(),
            description: texteDescription.value.trim(),
            ingredients: tableauIngredients,
            etapes: tableauEtapes,
            temps: parseInt(sliderTemps.value),
            portion: parseInt(sliderPortions.value),
            difficulte: diffiulte1.checked
                ? 1
                : diffiulte2.checked
                ? 2
                : 3,
            identifiant: identifiant,
            image: imageBase64,
        };

        // Envoi du corps au serveur
        try {
            const response = await fetch(chemin+"/api/CreationRecettes.php/recettes/creer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData)
            });

            let text = await response.text();

            let result = JSON.parse(text);
    
            if (result.status === "ok") {
                alert("Recette envoyée !");

            } else {
                alert("Erreur lors de l’envoi."+ result.status);
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
        <input class='zone_ingredient' id='quantite${i}' placeholder='Quantité' required>
        <input class='unite_ingredient' id='unite_de_mesure${i}' placeholder='Unité' value='${ingredient.unite_de_mesure}' required>
        <button class='btn_ingredient remove-item-button' id='supr-ing${i}'>X</button>
      `;

            zoneIngredient.appendChild(divIngredient);

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
            divEtape.innerHTML = `<p id='etape${i}'>${etape}</p><button id='supr-etape${i}'>X</button>`;
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
   // Récupérer les données utilisateur de sessionStorage
   const utilisateurId = sessionStorage.getItem("identifiant");
   const utilisateurMotDePasse = sessionStorage.getItem("motDePasse");

    // if (!utilisateurId || !utilisateurMotDePasse) {
    //     alert("Vous devez être connecté pour interagir avec cette page.");
    //     window.location.href = 'page-connexion.html'; // Redirige vers la page de connexion si non connecté
    //     return;
    // }

    //if (localStorage.getItem("recette-a-editer") != null) {

        // Recuperation du plan
  //      planLocal = localStorage.getItem("recette-a-editer");
  planLocal=1;
        editRecette = true;
        fetchRecette(planLocal);
  
    //   } else {
    //     editRecette = null;
    //   }
    // Initialisation
    await fetchIngredients();
});

document.addEventListener("DOMContentLoaded", async function () {
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

    let sliderTemps = document.getElementById("estimation-temps");
    let texteTemps = document.getElementById("temps-estime");
    let sliderPortions = document.getElementById("estimation-portions");
    let textePortions = document.getElementById("portions-estime");

    let diffiulte1 = document.getElementById("facile");
    let diffiulte2 = document.getElementById("moyen");
    let diffiulte3 = document.getElementById("difficile");

    let zoneIngredient = document.getElementById("zone-ingredients");
    let zoneImages = document.getElementById("zone-images");
    let zoneEtape = document.getElementById("zone-etape");
    let texteTitre = document.getElementById("titre-recette");
    let texteDescription = document.getElementById("description-recette");

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

effacerRecette.addEventListener("click", async function () {
    event.preventDefault();

    if (confirm("Etes-vous sûr de vouloir supprimer cette recette?")) {
        try {
            if (!editRecette) {
                alert("Recette supprimee.");
                back();
            } else {
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
                console.log("Réponse suppression brute:", text);

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


    sliderTemps.oninput = function () {
        texteTemps.textContent =
            this.value < 2
                ? this.value + " minute"
                : this.value > 180
                ? "180 minutes et +"
                : this.value + " minutes";
    };

    sliderPortions.oninput = function () {
        textePortions.textContent =
            this.value < 2
                ? this.value + " portion"
                : this.value > 16
                ? "16 portions et +"
                : this.value + " portions";
    };

    ajouterIngredient.addEventListener("click", function () {
        event.preventDefault();
        const zoneProchainIngredient = document.getElementById(
            "prochain-ingredient-s"
        );
        const nomIngredient = zoneProchainIngredient.value.trim();
        zoneProchainIngredient.value = "";

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

        // Ajoute à la liste
        tableauIngredients.push({
            id: ingredientTrouve.id,
            nom: ingredientTrouve.nom,
            unite_de_mesure: ingredientTrouve.unite_de_mesure,
        });

        updateIngredient();
    });

    document
        .getElementById("btn-creation-recette-ingredient")
        .addEventListener("click", function () {
            // Récupérer l'ingrédient sélectionné
            const ingredient = document.getElementById(
                "prochain-ingredient-s"
            ).value;

            // Vérifier si l'ingrédient n'est pas vide
            if (ingredient) {
                // Créer un div pour l'ingrédient
                const ingredientDiv = document.createElement("div");
                ingredientDiv.classList.add("ingredient");

                // Ajouter l'ingrédient dans le div
                const ingredientText = document.createElement("span");
                ingredientText.textContent = ingredient;
                ingredientDiv.appendChild(ingredientText);

                // Créer un input pour la quantité
                const quantityInput = document.createElement("input");
                quantityInput.type = "number";
                quantityInput.placeholder = "Quantité";
                ingredientDiv.appendChild(quantityInput);

                // Ajouter l'élément à la zone des ingrédients
                document
                    .getElementById("zone-ingredients")
                    .appendChild(ingredientDiv);

                // Réinitialiser le champ d'entrée
                document.getElementById("prochain-ingredient-s").value = "";
            }
        });

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

    async function fetchRecette(recette) {
        try {
            let response = await fetch(
                "./api/CreationRecettes.php/recettes/" +
                    recette
            );
            let objRecette = await response.json();

            if (!objRecette.error) {
                titre = objRecette.titre;
                imageUnique = objRecette.image;
                tableauIngredients = objRecette.ingredients;
                tableauEtapes = objRecette.etapes;
                description = objRecette.description;
                sliderTemps.value = objRecette.temps;
                sliderPortions.value = objRecette.portion;
                sliderTemps.oninput();
                sliderPortions.oninput();

                if (objRecette.difficulte === 3) diffiulte3.checked = true;
                else if (objRecette.difficulte === 2) diffiulte2.checked = true;
                else diffiulte1.checked = true;

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
            <input class='zone_ingredient' id='mesure${i}' placeholder='Entrez une valeur' required></input>
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

    async function fetchIngredients() {
        try {
            let response = await fetch(
                "./api/CreationRecettes.php/ingredients"
            );

            if (!response.ok) {
                throw new Error(
                    "Erreur lors de la récupération des ingrédients"
                );
            }


            let resultat = await response.json();

            if (resultat.error) {
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
            alert(
                "Une erreur s'est produite lors du chargement des ingrédients."
            );
            erreurFetchIngredients();
        }
    }

    async function sendRecette() {
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
            identifiant: identifiant
        };
    
        // Envoie du corps au serveur
        try {
            const response = await fetch("./api/CreationRecettes.php/recettes/creer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData)
            });
    
            let text = await response.text();
            console.log("Réponse suppression brute:", text);

            let result = JSON.parse(text);
    
            if (result.status === "ok") {
                alert("Recette envoyée !");
                back();
            } else {
                alert("Erreur lors de l’envoi.");
            }
        } catch (error) {
            console.error("Erreur fetch :", error);
            alert("Erreur réseau !");
        }
    }
    

    function updateIngredient() {
        zoneIngredient.innerHTML = "";
        tableauIngredients.forEach((ingredient, i) => {
            let divIngredient = document.createElement("div");
            divIngredient.classList.add("groupe_ingredient");

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

    function updateEtape() {
        zoneEtape.innerHTML = "";
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
    }

    function remove(tableau, index) {
        return tableau.filter((_, i) => i !== index);
    }

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
    await fetchIngredients();
});

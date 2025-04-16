document.addEventListener("DOMContentLoaded", async function () {
  let effacerRecette = document.getElementById("btn-suppression-recette");
  let imageRecette = document.getElementById("prochaine-image");
  let ajouterIngredient = document.getElementById("btn-creation-recette-ingredient");
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

  effacerRecette.addEventListener("click", async function () {
    event.preventDefault();

    if (confirm("Etes-vous sûr de vouloir supprimer cette recette?")) {
      try {
        if (!editRecette) {
          alert("Recette supprimee.");
          back();
        } else {
          let response = await fetch("http://localhost/planigo/H2025_TCH099_02_C1/api/CreationRecettes.php/recettes/supprimer/" + recetteLocale, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: recetteLocale })
          });

          let reponse = await response.json();

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
    texteTemps.textContent = this.value < 2 ? this.value + " minute" :
                             this.value > 180 ? "180 minutes et +" :
                             this.value + " minutes";
  };

  sliderPortions.oninput = function () {
    textePortions.textContent = this.value < 2 ? this.value + " portion" :
                                this.value > 16 ? "16 portions et +" :
                                this.value + " portions";
  };

  ajouterIngredient.addEventListener("click", function () {
    event.preventDefault();
    const zoneProchainIngredient = document.getElementById("prochain-ingredient-s");
    const nomIngredient = zoneProchainIngredient.value.trim();
    zoneProchainIngredient.value = "";
  
    if (!nomIngredient) return;
  
    // Cherche l'objet ingredient dans la liste complète
    const ingredientTrouve = objListeTousIngredients.find(ing => ing.nom === nomIngredient);
  
    if (!ingredientTrouve) {
      alert("Ingrédient non trouvé dans la liste !");
      return;
    }
  
    // Vérifie s'il est déjà dans la liste
    const dejaAjoute = tableauIngredients.some(ing => ing.nom === nomIngredient);
    if (dejaAjoute) return;
  
    // Ajoute à la liste
    tableauIngredients.push({
      id: ingredientTrouve.id,
      nom: ingredientTrouve.nom,
      unite_de_mesure: ingredientTrouve.unite_de_mesure // <-- on récupère l’unité
    });
  
    updateIngredient();
  });
  
  document.getElementById('btn-creation-recette-ingredient').addEventListener('click', function() {
    // Récupérer l'ingrédient sélectionné
    const ingredient = document.getElementById('prochain-ingredient-s').value;
    
    // Vérifier si l'ingrédient n'est pas vide
    if (ingredient) {
      // Créer un div pour l'ingrédient
      const ingredientDiv = document.createElement('div');
      ingredientDiv.classList.add('ingredient');
  
      // Ajouter l'ingrédient dans le div
      const ingredientText = document.createElement('span');
      ingredientText.textContent = ingredient;
      ingredientDiv.appendChild(ingredientText);
  
      // Créer un input pour la quantité
      const quantityInput = document.createElement('input');
      quantityInput.type = 'number';
      quantityInput.placeholder = 'Quantité';
      ingredientDiv.appendChild(quantityInput);
  
      // Ajouter l'élément à la zone des ingrédients
      document.getElementById('zone-ingredients').appendChild(ingredientDiv);
  
      // Réinitialiser le champ d'entrée
      document.getElementById('prochain-ingredient-s').value = '';
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
      let response = await fetch("http://localhost/planigo/H2025_TCH099_02_C1/api/CreationRecettes.php/recettes/" + recette);
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

          document.getElementById(`supr-ing${i}`).addEventListener("click", function () {
            tableauIngredients = remove(tableauIngredients, i);
            updateIngredient();
          });
        });

        tableauEtapes.forEach((etape, i) => {
          let divEtape = document.createElement("div");
          divEtape.innerHTML = `<p id='etape${i}'>${etape}</p><button id='supr-etape${i}'>X</button>`;
          zoneEtape.appendChild(divEtape);

          document.getElementById(`supr-etape${i}`).addEventListener("click", function () {
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
      
      let response = await fetch("http://localhost/planigo/H2025_TCH099_02_C1/api/CreationRecettes.php/ingredients");

      
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des ingrédients');
      }
  
      
      let resultat = await response.json();
  
      
      if (resultat.error) {
        erreurFetchIngredients();  
      } else {
        let ajouterIngredientListe = document.getElementById('liste-ingredients');
        
        ajouterIngredientListe.innerHTML = '';
        
        resultat.forEach(ingredient => {
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
      alert('Une erreur s\'est produite lors du chargement des ingrédients.');
      erreurFetchIngredients();
    }
  }
  

  async function sendRecette(event) {
    event.preventDefault();
    titre = texteTitre.value.trim();
    description = texteDescription.value.trim();

    if (!titre) 
      return alert("Veuillez entrer un titre pour votre recette.");
    if (!diffiulte1.checked && !diffiulte2.checked && !diffiulte3.checked)
      return alert("Veuillez entrer une difficulte pour votre recette.");
    if (!description) 
      return alert("Veuillez entrer une description pour votre recette.");
    if (tableauEtapes.length === 0) 
      return alert("Veuillez entrer au moins une etape pour votre recette.");
    if (tableauIngredients.length === 0)
       return alert("Veuillez entrer au moins un ingredient pour votre recette.");

    try {
      let difficulte = diffiulte3.checked ? 3 : diffiulte2.checked ? 2 : 1;
      let envoiID = editRecette ? recetteLocale : null;

      let imageUnique = imageRecette.files[0];
      let imageBase64 = null;

      if (imageUnique) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imageUnique);
        });
      }

      tableauIngredients = tableauIngredients.map((ingredient, i) => {
        const quantiteInput = document.getElementById(`quantite${i}`);
        const uniteInput = document.getElementById(`unite_de_mesure${i}`);
      
        return {
          ...ingredient,
          quantite: parseFloat(quantiteInput.value),
          unite_de_mesure: uniteInput.value.trim(),
        };
      });
      

      objRecetteJSON = JSON.stringify({
        edit: editRecette,
        id: envoiID,
        titre: titre,
        description: description,
        temps: sliderTemps.value,
        portion: sliderPortions.value,
        image: imageBase64,
        ingredients: tableauIngredients,
        etapes: tableauEtapes,
        difficulte: difficulte
      });
      
      let response = await fetch("http://localhost/planigo/H2025_TCH099_02_C1/api/CreationRecettes.php/recettes/creer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: objRecetteJSON,
      });

      let reponse = await response.json();

      if (reponse.success) {
        alert("Recette sauvegardée avec succès.");
        back();
      } else {
        erreurEnvoi();
      }
    } catch (error) {
      console.log(error);
      erreurEnvoi();
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
  
      document.getElementById(`supr-ing${i}`).addEventListener("click", function () {
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

      document.getElementById(`supr-etape${i}`).addEventListener("click", function () {
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

document.addEventListener("DOMContentLoaded", async function () {
  let effacerRecette = document.getElementById("btn-suppression-recette");
  let prochaineImage = document.getElementById("prochaine-image");
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
  let tableauImages = [];
  let tableauIngredients = [];
  let objListeTousIngredients = [];
  let tableauEtapes = [];
  let description = "";


  /**
   *  Efface la recette et retourne a la page precedente
   */
  effacerRecette.addEventListener("click", async function () {
    event.preventDefault();

    if (confirm("Etes-vous sûr de vouloir supprimer cette recette?")) {
      // si c'est une nouvelle recette, pas d'appel a faire a la base de donnees
      if (!editRecette) {
        alert("Recette supprimee.");
        back();
      } else {
        //tentative de suppression de la recette cote serveur
        try {
          let response = await fetch(
            "http://localhost/planigo/H2025_TCH099_02_C1/api/CreationRecettes.php/recettes/supprimer/" +
              recetteLocale,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id: recetteLocale }),
            }
          );

          let reponse = await response.json();

          // supression reussie cote serveur
          if (reponse.status == "ok") {
            alert("Recette supprimee.");
            back();
          } else {
            erreurSuppression();
          }
        } catch (error) {
          erreurSuppression();
        }
      }
    }
  });

  /**
   *  controle sur mesure du slider de temps
   */
  sliderTemps.oninput = function () {
    if (this.value < 2) {
      texteTemps.textContent = this.value + " minute";
    } else if (this.value > 180) {
      texteTemps.textContent = "180 minutes et +";
    } else {
      texteTemps.textContent = this.value + " minutes";
    }
  };

  /**
   * controle sur mesure du slider de portions
   */
  sliderPortions.oninput = function () {
    if (sliderPortions.value < 2) {
      textePortions.textContent = sliderPortions.value + " portion";
    } else if (sliderPortions.value > 16) {
      textePortions.textContent = "16 portions et +";
    } else {
      textePortions.textContent = sliderPortions.value + " portions";
    }
  };

  /**
   * Ajoute un ingredient a la recette
   */
  ajouterIngredient.addEventListener("click", function () {
    event.preventDefault();

    let zoneProchainIngredient = document.getElementById(
      "prochain-ingredient-s"
    );
    let textProchainIngredient = zoneProchainIngredient.value.trim();
    zoneProchainIngredient.value = "";

    // seulement mettre a jour si du texte a ete recu et est valide
    if (textProchainIngredient) {
      let indexDansListe = -1;
      let estNouveau = true;
      for (let i = 0; i < tableauIngredients.length; i++) {
        if (tableauIngredients[i].nom==textProchainIngredient){
          estNouveau=false;
        }
      }
      if (estNouveau){
      for (let i = 1; i < objListeTousIngredients.length; i++) {
        if (objListeTousIngredients[i].nom == textProchainIngredient) {
          indexDansListe = i;
        }
      }
    }
      if (indexDansListe != -1) {
        tableauIngredients.push(objListeTousIngredients[indexDansListe]);
        updateIngredient();
      }
    }
  });

  /**
   * Ajoute une etape a la recette
   */
  ajouterEtape.addEventListener("click", function () {
    event.preventDefault();

    let zoneProchaineEtape = document.getElementById("prochaine-etape");
    let texteProchaineEtape = zoneProchaineEtape.value.trim();
    zoneProchaineEtape.value = "";

    // seulement mettre a jour si du texte a ete recu

    if (texteProchaineEtape) {
      tableauEtapes.push(texteProchaineEtape);
      updateEtape();
    }
  });

  envoyerRecette.addEventListener("click", sendRecette);
  /**
   * recuperation de la recette dans la base de donnee via son id
   * @param {String} recette l'id de la recette a recuperer
   */
  async function fetchRecette(recette) {
    try {
      let response = await fetch(
        "http://localhost/planigo/H2025_TCH099_02_C1/api/CreationRecettes.php/recettes/" +
          recette
      );
      if (!response(error)){

        for(let i = 1; i <= 5; i++){
          let prochImage = response("image"+i);
          if (prochImage!=null){
            tableauImages.push(prochImage);
          }
         }

        objRecette = await response(json).json();

      if (!objRecette.error) {
        // recuperation des variables
        titre = objRecette.titre;
        tableauImages = objRecette.images;
        tableauIngredients = objRecette.ingredients;
        tableauEtapes = objRecette.etapes;
        let difficulte = objRecette.difficulte;
        description = objRecette.description;
        sliderTemps.value = objRecette.temps;
        sliderPortions.value = objRecette.portion;

        // application des variables a la page
        if (sliderTemps.value < 2) {
          texteTemps.textContent = sliderTemps.value + " minute";
        } else if (sliderTemps.value > 180) {
          texteTemps.textContent = "180 minutes et +";
        } else {
          texteTemps.textContent = sliderTemps.value + " minutes";
        }

        if (sliderPortions.value < 2) {
          textePortions.textContent = sliderPortions.value + " portion";
        } else if (sliderPortions.value > 16) {
          textePortions.textContent = "16 portions et +";
        } else {
          textePortions.textContent = sliderPortions.value + " portions";
        }

        if (difficulte == 3) {
          diffiulte3.checked = true;
        } else if (difficulte == 2) {
          diffiulte2.checked = true;
        } else {
          diffiulte1.checked = true;
        }

        for (let i = 0; i < tableauImages.length; i++) {
          let divImage = document.createElement("div");
          divImage.innerHTML = "<img src='" + tableauImages[i].src + "'>";
          zoneImages.appendChild(divImage);
        }

        for (let i = 0; i < tableauIngredients.length; i++) {
          let divIngredient = document.createElement("div");
          divIngredient.classList.add("groupe_ingredient");
          divIngredient.innerHTML =
            "<p class='nom_ingredient' id='ig" +
            i +
            "'>" +
            tableauIngredients[i] +
            "</p><button class='btn_ingredient' id='supr-ing" +
            i +
            "'>X</button>";
          zoneIngredient.appendChild(divIngredient);
          let buttonIng = document.getElementById("supr-ing" + i);
          buttonIng.addEventListener("click", function () {
            tableauIngredients = remove(tableauIngredients, i);
            updateIngredient();
          });
        }

        for (let i = 0; i < tableauEtapes.length; i++) {
          let divEtape = document.createElement("div");
          divEtape.innerHTML =
            "<p id='etape" +
            i +
            "'>" +
            tableauEtapes[i] +
            "</p><button id='supr-etape" +
            i +
            "'>X</button>";
          zoneEtape.appendChild(divEtape);
          let buttonEtape = document.getElementById("supr-etape" + i);
          buttonEtape.addEventListener("click", function () {
            tableauEtapes = remove(tableauEtapes, i);
            updateEtape();
          });
        }
      } else {
        erreurFetchRecette();
      }
    } else {
      erreurFetchRecette();
    }
    } catch (error) {
      erreurFetchRecette();
    }
  }

  async function fetchIngredients() {
    try {
      //let response = await fetch("http://localhost/planigo/H2025_TCH099_02_C1/api/CreationRecettes.php/ingredients/");

      //let resultat = await response.json();
      let resultat = [
        { error: false },
        { id: 1, nom: "poire", mesure : "qte"},
        { id: 2, nom: "pomme", mesure : "g" },
      ];

      if (resultat[0].error) {
        erreurFetchIngredients();
      } else {
        for (let i = 1; i < resultat.length; i++) {
          let divIngredient = document.createElement("option");
          divIngredient.innerHTML = resultat[i].nom;
          divIngredient.id = resultat[i].id;
          ajouterIngredientListe.appendChild(divIngredient);
        }
        ajouterIngredientListe.selectedIndex = -1;
        objListeTousIngredients = resultat;
      }
    } catch (error) {
      alert(error);
      erreurFetchIngredients();
    }
  }
  // Fonction pour envoyer la recette au serveur
  async function sendRecette(event) {
    event.preventDefault();
    titre = texteTitre.value.trim();
    description = texteDescription.value.trim();

    if (!titre) {
      alert("Veuillez entrer un titre pour votre recette.");
      return;
    }

    if (!diffiulte1.checked && !diffiulte2.checked && !diffiulte3.checked) {
      alert("Veuillez entrer une difficulte pour votre recette.");
      return;
    }

    if (!description) {
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
    try {
      let difficulte;
      if (diffiulte3.checked) {
        difficulte = 3;
      } else if (diffiulte2.checked) {
        difficulte = 2;
      } else {
        difficulte = 1;
      }
      let envoiID = null;
      if (editRecette) {
        envoiID = recetteLocale;
      }
      objRecetteJSON = JSON.stringify({
        edit: editRecette,
        id: envoiID,
        titre: titre,
        description: description,
        temps: sliderTemps.value,
        portion: sliderPortions.value,
        images: tableauImages,
        ingredients: tableauIngredients,
        etapes: tableauEtapes,
        difficulte: difficulte,
        username: sessionStorage.getItem("username"),
      });

      let paquet = new formData();
      for (let i = 0; i < tableauImages.length; i++) {

        paquet.append("image" + i, tableauImages[i].src);

      }

      paquet.append("json", objRecetteJSON);  

      let response = await fetch(
        "http://localhost/planigo/H2025_TCH099_02_C1/api/CreationRecettes.php/recettes/creer/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: paquet
        }
      );

      let reponse = await response.json();
      if (reponse.status == "ok") {
        alert("Recette sauvegardee avec succès.");
        back();
      } else {
        erreurEnvoi();
      }
    } catch (error) {
      erreurEnvoi();
    }
  }
  /**
   *  recharge la liste d'ingredients
   */
  function updateIngredient() {
    zoneIngredient.innerHTML = "";

    for (let i = 0; i < tableauIngredients.length; i++) {
      let divIngredient = document.createElement("div");
      divIngredient.innerHTML =
        "<p id='ing" +
        i +
        "'>" +
        tableauIngredients[i].nom +
        "</p><textarea id='mesure"+i
        +"'placeholder='val'required></textarea><p>"
        +tableauIngredients[i].mesure+"</p><button id='supr-ing" +
        i +"'>X</button>";
      zoneIngredient.appendChild(divIngredient);
      let buttonIng = document.getElementById("supr-ing" + i);
      buttonIng.addEventListener("click", function () {
        tableauIngredients = remove(tableauIngredients, i);
        updateIngredient();
      });
    }
  }
  /**
   *  recharge la liste d'etapes
   */
  function updateEtape() {
    zoneEtape.innerHTML = "";

    for (let i = 0; i < tableauEtapes.length; i++) {
      let divEtape = document.createElement("div");
      divEtape.innerHTML =
        "<p id='ing" +
        i +
        "'>" +
        tableauEtapes[i] +
        "</p><button id='supr-etape" +
        i +
        "'>X</button>";
      zoneEtape.appendChild(divEtape);
      let buttonEtape = document.getElementById("supr-etape" + i);
      buttonEtape.addEventListener("click", function () {
        tableauEtapes = remove(tableauEtapes, i);
        updateEtape();
      });
    }
  }
  /**
   *  Traitement en cas d'erreur lors de la recuperation de la recette depuis le serveur
   */
  function erreurFetchRecette() {
    let zonePrincipale = document.getElementById("contenu-principal");
    zonePrincipale.innerHTML =
      "<p class='erreur-fatale'> Erreur lors de la recuperation de la recette, veuillez essayer de recharger la page. </p>";
  }
  /**
   *  Traitement en cas d'erreur lors de la recuperation des ingredients depuis le serveur
   */
  function erreurFetchIngredients() {
    let zonePrincipale = document.getElementById("contenu-principal");
    zonePrincipale.innerHTML =
      "<p class='erreur-fatale'> Erreur lors de la recuperation des ingredients, veuillez essayer de recharger la page. </p>";
  }
  function erreurEnvoi() {
    alert(
      "Erreur lors de l'envoi de la recette, veuillez reessayer plus tard."
    );
  }
  function erreurSuppression() {
    alert(
      "Erreur lors de la suppression de la recette, veuillez reessayer plus tard."
    );
  }
  function remove(tableau, i) {
    if (i > -1&&i<tableau.length) {
      tableau.splice(i, 1);
    }
    return tableau;
  }
/**
 * accepte les images et les ajoute a la liste d'images
 */
  prochaineImage.addEventListener("change", function(){
    let images = prochaineImage.files;

    for (let i = 0; i < images.length; i++) {
      tableauImages.push(images[i]);
    }
    updateImages();
  });

  /**
   * accepte les images glissees et les ajoute a la liste d'images
   */
  zoneImages.addEventListener("drop", function(event){
    event.preventDefault();
    let images = event.dataTransfer.files;
    for (let i =0; i < images.length; i++){
      if (file[0].type.match("image")){
        let newImage = true;
       for (let i =0; i < tableauImages.length; i++){
        if (tableauImages[i].name == images[i].name){
          newImage = false;
          break;
        }
        if (newImage){
          tableauImages.push(images[i]);
        }
      }
    }
  }
updateImages();
  });
/**
 * affiche les images de la liste dans la zone d'images
 */
  function updateImages(){
    zoneImages.innerHTML = "";
    for (let i = 0; i < tableauImages.length; i++){
      let image = tableauImages[i];
      let imageElement = document.createElement("img");
      let suppr = document.createElement("button");
      suppr.textContent = "Supprimer"; 
      suppr.width = 20;
      suppr.height = 20;
      suppr.style.backgroundColor = "red";
      suppr.addEventListener("click", function(){
        tableauImages.splice(i, 1);
        updateImages();
      });
      imageElement.src = URL.createObjectURL(image);
      imageElement.alt = image.name;
      imageElement.width=200;
      imageElement.height = 200;
      imageElement.classList.add("image-recette");
      zoneImages.prepend(suppr);
      zoneImages.prepend(imageElement);
    }
  }

  if (
    localStorage.getItem("connecte") == null ||
    localStorage.getItem("connecte") == false
  ) {
    if (!localStorage.getItem("recette") == null) {
      //recuperation de la recette
      recetteLocale = localStorage.getItem("recette");
      editRecette = true;
      fetchRecette(recetteLocale);
    } else {
      recetteLocale = null;
    }

    fetchIngredients();
  } else {
    //utilisateur non connecte
    location.replace("index.html");
  }
});

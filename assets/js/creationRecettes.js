document.addEventListener("DOMContentLoaded", async function () {
  let effacerRecette = document.getElementById("btn-suppression-recette");
  let ajouterImage = document.getElementById("btn-creation-recette-image");
  let ajouterIngredient = document.getElementById("btn-creation-recette-ingredient");
  let ajouterEtape = document.getElementById("btn-creation-recette-etape");
  let envoyerRecette = document.getElementById("btn-envoi-recette");

  let sliderTemps = document.getElementById("estimation-temps");
  let texteTemps = document.getElementById("temps-estime");

  // sboutons radio des difficultes
  let diffiulte1 = document.getElementById("facile");
  let diffiulte2 = document.getElementById("moyen");
  let diffiulte3 = document.getElementById("difficile");

 // differentes zones de texte
  let zoneImage = document.getElementById("zone-images");
  let zoneIngredient = document.getElementById("zone-ingredients");
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
  let tableauEtapes = [];
  let description = "";



  /**
   *  Efface la recette et retourne a la page precedente
   */
  effacerRecette.addEventListener("click", async function () {
    event.preventDefault();
    if (confirm("Etes-vous sûr de vouloir supprimer cette recette?")) {
      if (!editRecette) {
        alert("Recette supprimee.");
        back();
      } else {
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

  sliderTemps.oninput = function() {
    if (this.value<2){
           texteTemps.textContent = this.value+" minute";
    } else if (this.value>180) {
        texteTemps.textContent = "180 minutes et +";

    }else {
        texteTemps.textContent = this.value+" minutes";
    }
 
  } 
  /**
   * Ajoute un ingredient a la recette
   */
  ajouterIngredient.addEventListener("click", function () {
    event.preventDefault();
    let zoneProchainIngredient=document.getElementById("prochain-ingredient");
    let texteProchainIngredient = document.getElementById("prochain-ingredient").value.trim();
    zoneProchainIngredient.value="";
    if (texteProchainIngredient) {
      tableauIngredients.push(texteProchainIngredient);
      updateIngredient();
    }
  });
  /**
   * Ajoute une etape a la recette
   */
  ajouterEtape.addEventListener("click", function () {
    event.preventDefault();
    let zoneProchaineEtape=document.getElementById("prochaine-etape");
    let texteProchaineEtape = zoneProchaineEtape.value.trim();
    zoneProchaineEtape.value="";
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
      objRecette = await response.json();
      if (!objRecette.error) {
        titre = objRecette.titre;
        tableauImages = objRecette.images;
        tableauIngredients = objRecette.ingredients;
        tableauEtapes = objRecette.etapes;
        let difficulte = objRecette.difficulte;
        description = objRecette.description;
        sliderTemps.value = objRecette.temps;
        
        if (sliderTemps.value<2){
            texteTemps.textContent = sliderTemps.value+" minute";
     } else if (sliderTemps.value>180) {
         texteTemps.textContent = "180 minutes et +";
 
     }else {
         texteTemps.textContent = sliderTemps.value+" minutes";
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
          zoneImage.appendChild(divImage);
        }

        for (let i = 0; i < tableauIngredients.length; i++) {
          let divIngredient = document.createElement("div");
          divIngredient.innerHTML =
            "<p id='ing" +
            i +
            "'>" +
            tableauIngredients[i] +
            "</p><button id='supr-ing" +
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
        erreurFetch();
      }
    } catch (error) {
      erreurFetch();
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

    if (!diffiulte1.checked&&!diffiulte2.checked&&!diffiulte3.checked) {
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

    if (!localStorage.getItem("recette") == null) {
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
          temps : sliderTemps.value,
          images: tableauImages,
          ingredients: tableauIngredients,
          etapes: tableauEtapes,
          difficulte: difficulte,
          username: sessionStorage.getItem("username"),
        });
      
      let response = await fetch(
        "http://localhost/planigo/H2025_TCH099_02_C1/api/CreationRecettes.php/recettes/creer/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: objRecetteJSON,
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
        tableauIngredients[i] +
        "</p><button id='supr-ing" +
        i +
        "'>X</button>";
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
        "<p id='ing" +i + "'>" + tableauEtapes[i] + "</p><button id='supr-etape" + i + "'>X</button>";
      zoneEtape.appendChild(divEtape);
      let buttonEtape = document.getElementById("supr-etape" + i);
      buttonEtape.addEventListener("click", function () {
        tableauEtapes = remove(tableauEtapes, i);
        updateEtape();
      });
    }
  }
  /**
   *  Traitement en cas d'erreur lors de la recuperation de la receptte depuis le serveur
   */
  function erreurFetch() {
    let zonePrincipale = document.getElementById("contenu-principal");
    zonePrincipale.innerHTML =
      "<p class='erreur-fatale'> Erreur lors de la recuperation de la recette, veuillez essayer de recharger la page. </p>";
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
    const index = tableau.indexOf(5);
    if (i > -1) {
      tableau.splice(i, 1);
    }
    return tableau;
  }
  if (
    localStorage.getItem("connecte") == null ||
    localStorage.getItem("connecte") == false
  ) {
    if (!localStorage.getItem("recette") == null) {
      //recuperation de la recette
      recetteLocale = localStorage.getItem("recette");
      editRecette = true;
      await fetchRecette(recetteLocale);
    } else {
      recetteLocale = null;
    }
  } else {
    //utilisateur non connecte
    location.replace("index.html");
  }
});

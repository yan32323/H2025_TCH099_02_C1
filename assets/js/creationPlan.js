document.addEventListener("DOMContentLoaded", async function () {
  // URL de l'API
  const chemin = "http://localhost/planigo/H2025_TCH099_02_C1";

  // Boutton de suppression du plan
  let effacerPlan = document.getElementById("btn-suppression-plan");
  let prochaineImage = document.getElementById("prochaine-image");

  // Zones de texte pour les recettes
  let prochaineRecetteLundi = document.getElementById(
    "prochaine-recette-lundi"
  );
  let prochaineRecetteMardi = document.getElementById(
    "prochaine-recette-mardi"
  );
  let prochaineRecetteMercredi = document.getElementById(
    "prochaine-recette-mercredi"
  );
  let prochaineRecetteJeudi = document.getElementById(
    "prochaine-recette-jeudi"
  );
  let prochaineRecetteVendredi = document.getElementById(
    "prochaine-recette-vendredi"
  );
  let prochaineRecetteSamedi = document.getElementById(
    "prochaine-recette-samedi"
  );
  let prochaineRecetteDimanche = document.getElementById(
    "prochaine-recette-dimanche"
  );

  // Boutons pour ajouter les recettes
  let ajouterRecetteLundi = document.getElementById(
    "btn-creation-plan-recette-lundi"
  );
  let ajouterRecetteMardi = document.getElementById(
    "btn-creation-plan-recette-mardi"
  );
  let ajouterRecetteMercredi = document.getElementById(
    "btn-creation-plan-recette-mercredi"
  );
  let ajouterRecetteJeudi = document.getElementById(
    "btn-creation-plan-recette-jeudi"
  );
  let ajouterRecetteVendredi = document.getElementById(
    "btn-creation-plan-recette-vendredi"
  );
  let ajouterRecetteSamedi = document.getElementById(
    "btn-creation-plan-recette-samedi"
  );
  let ajouterRecetteDimanche = document.getElementById(
    "btn-creation-plan-recette-dimanche"
  );
  let envoyerPlan = document.getElementById("btn-envoi-plan");

  // Differentes zones de texte
  let zoneImages = document.getElementById("zone-images");

  // Recettes selon les jours
  let listeRecettesLundi = document.getElementById("liste-recette-lundi");
  let listeRecettesMardi = document.getElementById("liste-recette-mardi");
  let listeRecettesMercredi = document.getElementById("liste-recette-mercredi");
  let listeRecettesJeudi = document.getElementById("liste-recette-jeudi");
  let listeRecettesVendredi = document.getElementById("liste-recette-vendredi");
  let listeRecettesSamedi = document.getElementById("liste-recette-samedi");
  let listeRecettesDimanche = document.getElementById("liste-recette-dimanche");

  // Zone d'affichage des recettes
  let affichageRecetteLundi = document.getElementById(
    "affichage-recettes-lundi"
  );
  let affichageRecetteMardi = document.getElementById(
    "affichage-recettes-mardi"
  );
  let affichageRecetteMercredi = document.getElementById(
    "affichage-recettes-mercredi"
  );
  let affichageRecetteJeudi = document.getElementById(
    "affichage-recettes-jeudi"
  );
  let affichageRecetteVendredi = document.getElementById(
    "affichage-recettes-vendredi"
  );
  let affichageRecetteSamedi = document.getElementById(
    "affichage-recettes-samedi"
  );
  let affichageRecetteDimanche = document.getElementById(
    "affichage-recettes-dimanche"
  );
  let texteTitre = document.getElementById("titre-plan");
  let texteDescription = document.getElementById("description-plan");

  // variables du plan
  let objPlanJSON = null;
  let editPlan = false;
  let objPlan = null;
  let planLocal;
  let titre = "";
  let tableauImages = [];
  let description = "";
  let tableauRecettesLundi = [];
  let tableauRecettesMardi = [];
  let tableauRecettesMercredi = [];
  let tableauRecettesJeudi = [];
  let tableauRecettesVendredi = [];
  let tableauRecettesSamedi = [];
  let tableauRecettesDimanche = [];

  /**
   *  Efface la plan et retourne a la page precedente
   */
  effacerPlan.addEventListener("click", async function () {
    event.preventDefault();

    if (confirm("Etes-vous sûr de vouloir supprimer ce plan?")) {
      // si c'est un nouveau plan, pas d'appel a faire a la base de donnees
      if (!editPlan) {
        alert("Plan supprime.");
        back();
      } else {
        //tentative de suppression du plan cote serveur
        try {
          let response = await fetch(
            chemin + "/api/CreationPlans.php/planSupprimer/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id: planLocal }),
            }
          );

          let reponse = await response.json();

          // supression reussie cote serveur
          if (reponse.status == "ok") {
            alert("Plan supprime.");
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
   * Ajoute une recette au plan le Lundi
   */
  ajouterRecetteLundi.addEventListener("click", function () {
    event.preventDefault();

    let textProchainRecette = prochaineRecetteLundi.value.trim();
    prochaineRecetteLundi.value = "";

    // seulement mettre a jour si du texte a ete recu et est valide
    if (textProchainRecette) {
      let indexDansListe = -1;
      let estNouveau = true;
      for (let i = 0; i < tableauRecettesLundi.length; i++) {
        if (tableauRecettesLundi[i].nom == textProchainRecette) {
          estNouveau = false;
        }
      }
      if (estNouveau) {
        for (let i = 0; i < objListeTousRecettes.length; i++) {
          if (objListeTousRecettes[i].nom == textProchainRecette) {
            indexDansListe = i;
          }
        }
      }
      if (indexDansListe != -1) {
        tableauRecettesLundi.push(objListeTousRecettes[indexDansListe]);
        updateRecetteLundi();
      } else {
        alert("Cette recette n'est pas dans les recettes disponibles presentement.");
      }
    }
  });
  /**
   *  recharge la liste de recettes du Lundi
   */
  function updateRecetteLundi() {
    affichageRecetteLundi.innerHTML = "";

    for (let i = 0; i < tableauRecettesLundi.length; i++) {
      let divRecette = document.createElement("div");
      divRecette.className = "recipe-entry";

      let aAfficher = document.createElement("div");
      aAfficher.className = "popup-recette";
      let imgSrc;
      if (tableauRecettesLundi[i].image) {
        imgSrc = `data:image/jpeg;base64,${tableauRecettesLundi[i].image}`;
      } else {
        imgSrc = "assets/image/image_tmp_recette.png";
      }

      aAfficher.innerHTML =
        "<div class='popup-content'><div class='left-column'><img class='recipe-image' src='" +
        imgSrc +
        "' alt='Recipe Image'><p class='recipe-description'>" +
        tableauRecettesLundi[i].descriptions +
        "</p></div><div class='right-column'><div class='ingredients-box'><h2 class='ingredients-title'>DÉTAILS</h2><div class='recipe-info-section'><h3 class='info-title'>NOMBRE DE PORTIONS</h3><p class='info-value'>" +
        tableauRecettesLundi[i].portions +
        " Portions</p></div><div class='recipe-info-section'><h3 class='info-title'>TEMPS DE PRÉPARATION</h3><p class='info-value'>" +
        tableauRecettesLundi[i].temps_de_cuisson +
        " Minutes</p></div><div class='recipe-info-section'><h3 class='info-title'>NOMBRE D'INGRÉDIENTS</h3><p class='info-value'>" +
        tableauRecettesLundi[i].nombre_ingredients +
        " Portions</p></div><div class='recipe-info-section'><h3 class='info-title'>NOMBRE D'ÉTAPES</h3><p class='info-value'>" +
        tableauRecettesLundi[i].nombre_etapes +
        " Etapes</p></div></div></div></div>";

      divRecette.innerHTML =
        "<div style='border=1px solid black'><p id='rec-l" +
        i +
        "'>" +
        tableauRecettesLundi[i].nom +
        "</p><input id='heure-l" +
        i +
        "' value='" +
        tableauRecettesLundi[i].heure +
        "'type='time'><button class='remove-item-button' id='supr-rec-l" +
        i +
        "'>X</button></div>";
      affichageRecetteLundi.appendChild(divRecette);
      aAfficher.style.display = "none";
      aAfficher.style.position = "absolute";
      aAfficher.style.top = divRecette.offsetTop + 50 + "px";
      aAfficher.style.left = divRecette.offsetLeft + 50 + "px";
      aAfficher.style.width = "400px";
      aAfficher.style.height = "300px";
      aAfficher.style.border = "1px solid black";
      affichageRecetteLundi.appendChild(aAfficher);
      let buttonIng = document.getElementById("supr-rec-l" + i);
      let heure = document.getElementById("heure-l" + i);
      buttonIng.addEventListener("click", function () {
        tableauRecettesLundi = remove(tableauRecettesLundi, i);
        updateRecetteLundi();
      });
      heure.addEventListener("change", function () {
        tableauRecettesLundi[i].heure = heure.value;
      });
      affichageRecetteLundi.appendChild(aAfficher);
      document.getElementById("rec-l" + i).addEventListener("mouseover", () => {
        aAfficher.style.display = "block";
      });
      document.getElementById("rec-l" + i).addEventListener("mouseout", () => {
        aAfficher.style.display = "none";
      });
    }
  }

  /**
   * Ajoute une recette au plan le Mardi
   */
  ajouterRecetteMardi.addEventListener("click", function () {
    event.preventDefault();

    let textProchainRecette = prochaineRecetteMardi.value.trim();
    prochaineRecetteMardi.value = "";

    // seulement mettre a jour si du texte a ete recu et est valide
    if (textProchainRecette) {
      let indexDansListe = -1;
      let estNouveau = true;
      for (let i = 0; i < tableauRecettesMardi.length; i++) {
        if (tableauRecettesMardi[i].nom == textProchainRecette) {
          estNouveau = false;
        }
      }
      if (estNouveau) {
        for (let i = 0; i < objListeTousRecettes.length; i++) {
          if (objListeTousRecettes[i].nom == textProchainRecette) {
            indexDansListe = i;
          }
        }
      }
      if (indexDansListe != -1) {
        tableauRecettesMardi.push(objListeTousRecettes[indexDansListe]);
        updateRecetteMardi();
      } else {
        alert("Cette recette n'est pas dans les recettes disponibles presentement.");
      }
    }
  });
  /**
   *  recharge la liste de recettes du Mardi
   */
  function updateRecetteMardi() {
    affichageRecetteMardi.innerHTML = "";

    for (let i = 0; i < tableauRecettesMardi.length; i++) {
      let divRecette = document.createElement("div");
      divRecette.className = "recipe-entry";
      let aAfficher = document.createElement("div");
      aAfficher.className = "popup-recette";
      let imgSrc;
      if (tableauRecettesMardi[i].image) {
        imgSrc = `data:image/jpeg;base64,${tableauRecettesMardi[i].image}`;
      } else {
        imgSrc = "assets/image/image_tmp_recette.png";
      }

      aAfficher.innerHTML =
        "<div class='popup-content'><div class='left-column'><img class='recipe-image' src='" +
        imgSrc +
        "' alt='Recipe Image'><p class='recipe-description'>" +
        tableauRecettesMardi[i].descriptions +
        "</p></div><div class='right-column'><div class='ingredients-box'><h2 class='ingredients-title'>DÉTAILS</h2><div class='recipe-info-section'><h3 class='info-title'>NOMBRE DE PORTIONS</h3><p class='info-value'>" +
        tableauRecettesMardi[i].portions +
        " Portions</p></div><div class='recipe-info-section'><h3 class='info-title'>TEMPS DE PRÉPARATION</h3><p class='info-value'>" +
        tableauRecettesMardi[i].temps_de_cuisson +
        " Minutes</p></div><div class='recipe-info-section'><h3 class='info-title'>NOMBRE D'INGRÉDIENTS</h3><p class='info-value'>" +
        tableauRecettesMardi[i].nombre_ingredients +
        " Portions</p></div><div class='recipe-info-section'><h3 class='info-title'>NOMBRE D'ÉTAPES</h3><p class='info-value'>" +
        tableauRecettesMardi[i].nombre_etapes +
        " Portions</p></div></div></div></div>";

      divRecette.innerHTML =
        "<div style='border=1px solid black'><p id='rec-ma" +
        i +
        "'>" +
        tableauRecettesMardi[i].nom +
        "</p><input id='heure-ma" +
        i +
        "' value='" +
        tableauRecettesMardi[i].heure +
        "'type='time'><button class='remove-item-button' id='supr-rec-ma" +
        i +
        "'>X</button></div>";
      affichageRecetteMardi.appendChild(divRecette);
      aAfficher.style.display = "none";
      aAfficher.style.position = "absolute";
      aAfficher.style.top = divRecette.offsetTop + 50 + "px";
      aAfficher.style.left = divRecette.offsetLeft + 50 + "px";
      aAfficher.style.width = "400px";
      aAfficher.style.height = "300px";
      aAfficher.style.border = "1px solid black";
      affichageRecetteMardi.appendChild(aAfficher);
      let buttonIng = document.getElementById("supr-rec-ma" + i);

      let heure = document.getElementById("heure-ma" + i);
      buttonIng.addEventListener("click", function () {
        tableauRecettesMardi = remove(tableauRecettesMardi, i);
        updateRecetteMardi();
      });
      heure.addEventListener("change", function () {
        tableauRecettesMardi[i].heure = heure.value;
      });
      affichageRecetteMardi.appendChild(aAfficher);
      document
        .getElementById("rec-ma" + i)
        .addEventListener("mouseover", () => {
          aAfficher.style.display = "block";
        });
      document.getElementById("rec-ma" + i).addEventListener("mouseout", () => {
        aAfficher.style.display = "none";
      });
    }
  }

  /**
   * Ajoute une recette au plan le Mercredi
   */
  ajouterRecetteMercredi.addEventListener("click", function () {
    event.preventDefault();

    let textProchainRecette = prochaineRecetteMercredi.value.trim();
    prochaineRecetteMercredi.value = "";

    // seulement mettre a jour si du texte a ete recu et est valide
    if (textProchainRecette) {
      let indexDansListe = -1;
      let estNouveau = true;
      for (let i = 0; i < tableauRecettesMercredi.length; i++) {
        if (tableauRecettesMercredi[i].nom == textProchainRecette) {
          estNouveau = false;
        }
      }
      if (estNouveau) {
        for (let i = 0; i < objListeTousRecettes.length; i++) {
          if (objListeTousRecettes[i].nom == textProchainRecette) {
            indexDansListe = i;
          }
        }
      }
      if (indexDansListe != -1) {
        tableauRecettesMercredi.push(objListeTousRecettes[indexDansListe]);
        updateRecetteMercredi();
      } else {
        alert("Cette recette n'est pas dans les recettes disponibles presentement.");
      }
    }
  });
  /**
   *  recharge la liste de recettes du Mercredi
   */
  function updateRecetteMercredi() {
    affichageRecetteMercredi.innerHTML = "";

    for (let i = 0; i < tableauRecettesMercredi.length; i++) {
      let divRecette = document.createElement("div");
      divRecette.className = "recipe-entry";
      let aAfficher = document.createElement("div");
      aAfficher.className = "popup-recette";
      let imgSrc;
      if (tableauRecettesMercredi[i].image) {
        imgSrc = `data:image/jpeg;base64,${tableauRecettesMercredi[i].image}`;
      } else {
        imgSrc = "assets/image/image_tmp_recette.png";
      }

      aAfficher.innerHTML =
        "<div class='popup-content'><div class='left-column'><img class='recipe-image' src='" +
        imgSrc +
        "' alt='Recipe Image'><p class='recipe-description'>" +
        tableauRecettesMercredi[i].descriptions +
        "</p></div><div class='right-column'><div class='ingredients-box'><h2 class='ingredients-title'>DÉTAILS</h2><div class='recipe-info-section'><h3 class='info-title'>NOMBRE DE PORTIONS</h3><p class='info-value'>" +
        tableauRecettesMercredi[i].portions +
        " Portions</p></div><div class='recipe-info-section'><h3 class='info-title'>TEMPS DE PRÉPARATION</h3><p class='info-value'>" +
        tableauRecettesMercredi[i].temps_de_cuisson +
        " Minutes</p></div><div class='recipe-info-section'><h3 class='info-title'>NOMBRE D'INGRÉDIENTS</h3><p class='info-value'>" +
        tableauRecettesMercredi[i].nombre_ingredients +
        " Portions</p></div><div class='recipe-info-section'><h3 class='info-title'>NOMBRE D'ÉTAPES</h3><p class='info-value'>" +
        tableauRecettesMercredi[i].nombre_etapes +
        " Portions</p></div></div></div></div>";

      divRecette.innerHTML =
        "<div style='border=1px solid black'><p id='rec-me" +
        i +
        "'>" +
        tableauRecettesMercredi[i].nom +
        "</p><input id='heure-me" +
        i +
        "' value='" +
        tableauRecettesMercredi[i].heure +
        "'type='time'><button  class='remove-item-button' id='supr-rec-me" +
        i +
        "'>X</button></div>";
      affichageRecetteMercredi.appendChild(divRecette);
      aAfficher.style.display = "none";
      aAfficher.style.position = "absolute";
      aAfficher.style.top = divRecette.offsetTop + 50 + "px";
      aAfficher.style.left = divRecette.offsetLeft + 50 + "px";
      aAfficher.style.width = "400px";
      aAfficher.style.height = "300px";
      aAfficher.style.border = "1px solid black";
      affichageRecetteMercredi.appendChild(aAfficher);
      let buttonIng = document.getElementById("supr-rec-me" + i);
      let heure = document.getElementById("heure-me" + i);
      buttonIng.addEventListener("click", function () {
        tableauRecettesMercredi = remove(tableauRecettesMercredi, i);
        updateRecetteMercredi();
      });
      heure.addEventListener("change", function () {
        tableauRecettesMercredi[i].heure = heure.value;
      });
      affichageRecetteMercredi.appendChild(aAfficher);
      document
        .getElementById("rec-me" + i)
        .addEventListener("mouseover", () => {
          aAfficher.style.display = "block";
        });
      document.getElementById("rec-me" + i).addEventListener("mouseout", () => {
        aAfficher.style.display = "none";
      });
    }
  }

  /**
   * Ajoute une recette au plan le Jeudi
   */
  ajouterRecetteJeudi.addEventListener("click", function () {
    event.preventDefault();

    let textProchainRecette = prochaineRecetteJeudi.value.trim();
    prochaineRecetteJeudi.value = "";

    // seulement mettre a jour si du texte a ete recu et est valide
    if (textProchainRecette) {
      let indexDansListe = -1;
      let estNouveau = true;
      for (let i = 0; i < tableauRecettesJeudi.length; i++) {
        if (tableauRecettesJeudi[i].nom == textProchainRecette) {
          estNouveau = false;
        }
      }
      if (estNouveau) {
        for (let i = 0; i < objListeTousRecettes.length; i++) {
          if (objListeTousRecettes[i].nom == textProchainRecette) {
            indexDansListe = i;
          }
        }
      }
      if (indexDansListe != -1) {
        tableauRecettesJeudi.push(objListeTousRecettes[indexDansListe]);
        updateRecetteJeudi();
      } else {
        alert("Cette recette n'est pas dans les recettes disponibles presentement.");
      }
    }
  });

  /**
   *  recharge la liste de recettes du Jeudi
   */
  function updateRecetteJeudi() {
    affichageRecetteJeudi.innerHTML = "";

    for (let i = 0; i < tableauRecettesJeudi.length; i++) {
      let divRecette = document.createElement("div");
      divRecette.className = "recipe-entry";
      let aAfficher = document.createElement("div");
      aAfficher.className = "popup-recette";
      let imgSrc;
      if (tableauRecettesJeudi[i].image) {
        imgSrc = `data:image/jpeg;base64,${tableauRecettesJeudi[i].image}`;
      } else {
        imgSrc = "assets/image/image_tmp_recette.png";
      }

      aAfficher.innerHTML =
        "<div class='popup-content'><div class='left-column'><img class='recipe-image' src='" +
        imgSrc +
        "' alt='Recipe Image'><p class='recipe-description'>" +
        tableauRecettesJeudi[i].descriptions +
        "</p></div><div class='right-column'><div class='ingredients-box'><h2 class='ingredients-title'>DÉTAILS</h2><div class='recipe-info-section'><h3 class='info-title'>NOMBRE DE PORTIONS</h3><p class='info-value'>" +
        tableauRecettesJeudi[i].portions +
        " Portions</p></div><div class='recipe-info-section'><h3 class='info-title'>TEMPS DE PRÉPARATION</h3><p class='info-value'>" +
        tableauRecettesJeudi[i].temps_de_cuisson +
        " Minutes</p></div><div class='recipe-info-section'><h3 class='info-title'>NOMBRE D'INGRÉDIENTS</h3><p class='info-value'>" +
        tableauRecettesJeudi[i].nombre_ingredients +
        " Portions</p></div><div class='recipe-info-section'><h3 class='info-title'>NOMBRE D'ÉTAPES</h3><p class='info-value'>" +
        tableauRecettesJeudi[i].nombre_etapes +
        " Portions</p></div></div></div></div>";

      divRecette.innerHTML =
        "<div style='border=1px solid black'><p id='rec-j" +
        i +
        "'>" +
        tableauRecettesJeudi[i].nom +
        "</p><input id='heure-j" +
        i +
        "' value='" +
        tableauRecettesJeudi[i].heure +
        "'type='time'><button  class='remove-item-button' id='supr-rec-j" +
        i +
        "'>X</button></div>";
      affichageRecetteJeudi.appendChild(divRecette);
      aAfficher.style.display = "none";
      aAfficher.style.position = "absolute";
      aAfficher.style.top = divRecette.offsetTop + 50 + "px";
      aAfficher.style.left = divRecette.offsetLeft + 50 + "px";
      aAfficher.style.width = "400px";
      aAfficher.style.height = "300px";
      aAfficher.style.border = "1px solid black";
      affichageRecetteJeudi.appendChild(aAfficher);
      let buttonIng = document.getElementById("supr-rec-j" + i);
      let heure = document.getElementById("heure-j" + i);
      buttonIng.addEventListener("click", function () {
        tableauRecettesJeudi = remove(tableauRecettesJeudi, i);
        updateRecetteJeudi();
      });
      heure.addEventListener("change", function () {
        tableauRecettesJeudi[i].heure = heure.value;
      });
      affichageRecetteJeudi.appendChild(aAfficher);
      document.getElementById("rec-j" + i).addEventListener("mouseover", () => {
        aAfficher.style.display = "block";
      });
      document.getElementById("rec-j" + i).addEventListener("mouseout", () => {
        aAfficher.style.display = "none";
      });
    }
  }

  /**
   * Ajoute une recette au plan le Vendredi
   */
  ajouterRecetteVendredi.addEventListener("click", function () {
    event.preventDefault();

    let textProchainRecette = prochaineRecetteVendredi.value.trim();
    prochaineRecetteVendredi.value = "";

    // seulement mettre a jour si du texte a ete recu et est valide
    if (textProchainRecette) {
      let indexDansListe = -1;
      let estNouveau = true;
      for (let i = 0; i < tableauRecettesVendredi.length; i++) {
        if (tableauRecettesVendredi[i].nom == textProchainRecette) {
          estNouveau = false;
        }
      }
      if (estNouveau) {
        for (let i = 0; i < objListeTousRecettes.length; i++) {
          if (objListeTousRecettes[i].nom == textProchainRecette) {
            indexDansListe = i;
          }
        }
      }
      if (indexDansListe != -1) {
        tableauRecettesVendredi.push(objListeTousRecettes[indexDansListe]);
        updateRecetteVendredi();
      } else {
        alert("Cette recette n'est pas dans les recettes disponibles presentement.");
      }
    }
  });

  /**
   *  recharge la liste de recettes du Vendredi
   */
  function updateRecetteVendredi() {
    affichageRecetteVendredi.innerHTML = "";

    for (let i = 0; i < tableauRecettesVendredi.length; i++) {
      let divRecette = document.createElement("div");
      divRecette.className = "recipe-entry";
      let aAfficher = document.createElement("div");
      aAfficher.className = "popup-recette";
      let imgSrc;
      if (tableauRecettesVendredi[i].image) {
        imgSrc = `data:image/jpeg;base64,${tableauRecettesVendredi[i].image}`;
      } else {
        imgSrc = "assets/image/image_tmp_recette.png";
      }

      aAfficher.innerHTML =
        "<div class='popup-content'><div class='left-column'><img class='recipe-image' src='" +
        imgSrc +
        "' alt='Recipe Image'><p class='recipe-description'>" +
        tableauRecettesVendredi[i].descriptions +
        "</p></div><div class='right-column'><div class='ingredients-box'><h2 class='ingredients-title'>DÉTAILS</h2><div class='recipe-info-section'><h3 class='info-title'>NOMBRE DE PORTIONS</h3><p class='info-value'>" +
        tableauRecettesVendredi[i].portions +
        " Portions</p></div><div class='recipe-info-section'><h3 class='info-title'>TEMPS DE PRÉPARATION</h3><p class='info-value'>" +
        tableauRecettesVendredi[i].temps_de_cuisson +
        " Minutes</p></div><div class='recipe-info-section'><h3 class='info-title'>NOMBRE D'INGRÉDIENTS</h3><p class='info-value'>" +
        tableauRecettesVendredi[i].nombre_ingredients +
        " Portions</p></div><div class='recipe-info-section'><h3 class='info-title'>NOMBRE D'ÉTAPES</h3><p class='info-value'>" +
        tableauRecettesVendredi[i].nombre_etapes +
        " Portions</p></div></div></div></div>";

      divRecette.innerHTML =
        "<div style='border=1px solid black'><p id='rec-v" +
        i +
        "'>" +
        tableauRecettesVendredi[i].nom +
        "</p><input id='heure-v" +
        i +
        "' value='" +
        tableauRecettesVendredi[i].heure +
        "'type='time'><button  class='remove-item-button' id='supr-rec-v" +
        i +
        "'>X</button></div>";
      affichageRecetteVendredi.appendChild(divRecette);
      aAfficher.style.display = "none";
      aAfficher.style.position = "absolute";
      aAfficher.style.top = divRecette.offsetTop + 50 + "px";
      aAfficher.style.left = divRecette.offsetLeft + 50 + "px";
      aAfficher.style.width = "400px";
      aAfficher.style.height = "300px";
      aAfficher.style.border = "1px solid black";
      affichageRecetteVendredi.appendChild(aAfficher);
      let buttonIng = document.getElementById("supr-rec-v" + i);
      let heure = document.getElementById("heure-v" + i);
      buttonIng.addEventListener("click", function () {
        tableauRecettesVendredi = remove(tableauRecettesVendredi, i);
        updateRecetteVendredi();
      });
      heure.addEventListener("change", function () {
        tableauRecettesVendredi[i].heure = heure.value;
      });
      affichageRecetteVendredi.appendChild(aAfficher);
      document.getElementById("rec-v" + i).addEventListener("mouseover", () => {
        aAfficher.style.display = "block";
      });
      document.getElementById("rec-v" + i).addEventListener("mouseout", () => {
        aAfficher.style.display = "none";
      });
    }
  }

  /**
   * Ajoute une recette au plan le Samedi
   */
  ajouterRecetteSamedi.addEventListener("click", function () {
    event.preventDefault();

    let textProchainRecette = prochaineRecetteSamedi.value.trim();
    prochaineRecetteSamedi.value = "";

    // seulement mettre a jour si du texte a ete recu et est valide
    if (textProchainRecette) {
      let indexDansListe = -1;
      let estNouveau = true;
      for (let i = 0; i < tableauRecettesSamedi.length; i++) {
        if (tableauRecettesSamedi[i].nom == textProchainRecette) {
          estNouveau = false;
        }
      }
      if (estNouveau) {
        for (let i = 0; i < objListeTousRecettes.length; i++) {
          if (objListeTousRecettes[i].nom == textProchainRecette) {
            indexDansListe = i;
          }
        }
      }
      if (indexDansListe != -1) {
        tableauRecettesSamedi.push(objListeTousRecettes[indexDansListe]);
        updateRecetteSamedi();
      } else {
        alert("Cette recette n'est pas dans les recettes disponibles presentement.");
      }
    }
  });

  /**
   *  recharge la liste de recettes du Samedi
   */
  function updateRecetteSamedi() {
    affichageRecetteSamedi.innerHTML = "";

    for (let i = 0; i < tableauRecettesSamedi.length; i++) {
      let divRecette = document.createElement("div");
      divRecette.className = "recipe-entry";
      let aAfficher = document.createElement("div");
      aAfficher.className = "popup-recette";
      let imgSrc;
      if (tableauRecettesSamedi[i].image) {
        imgSrc = `data:image/jpeg;base64,${tableauRecettesSamedi[i].image}`;
      } else {
        imgSrc = "assets/image/image_tmp_recette.png";
      }

      aAfficher.innerHTML =
        "<div class='popup-content'><div class='left-column'><img class='recipe-image' src='" +
        imgSrc +
        "' alt='Recipe Image'><p class='recipe-description'>" +
        tableauRecettesSamedi[i].descriptions +
        "</p></div><div class='right-column'><div class='ingredients-box'><h2 class='ingredients-title'>DÉTAILS</h2><div class='recipe-info-section'><h3 class='info-title'>NOMBRE DE PORTIONS</h3><p class='info-value'>" +
        tableauRecettesSamedi[i].portions +
        " Portions</p></div><div class='recipe-info-section'><h3 class='info-title'>TEMPS DE PRÉPARATION</h3><p class='info-value'>" +
        tableauRecettesSamedi[i].temps_de_cuisson +
        " Minutes</p></div><div class='recipe-info-section'><h3 class='info-title'>NOMBRE D'INGRÉDIENTS</h3><p class='info-value'>" +
        tableauRecettesSamedi[i].nombre_ingredients +
        " Portions</p></div><div class='recipe-info-section'><h3 class='info-title'>NOMBRE D'ÉTAPES</h3><p class='info-value'>" +
        tableauRecettesSamedi[i].nombre_etapes +
        " Portions</p></div></div></div></div>";

      divRecette.innerHTML =
        "<div style='border=1px solid black'><p id='rec-s" +
        i +
        "'>" +
        tableauRecettesSamedi[i].nom +
        "</p><input id='heure-s" +
        i +
        "' value='" +
        tableauRecettesSamedi[i].heure +
        "'type='time'><button  class='remove-item-button' id='supr-rec-s" +
        i +
        "'>X</button></div>";
      affichageRecetteSamedi.appendChild(divRecette);
      aAfficher.style.display = "none";
      aAfficher.style.position = "absolute";
      aAfficher.style.top = divRecette.offsetTop + 50 + "px";
      aAfficher.style.left = divRecette.offsetLeft + 50 + "px";
      aAfficher.style.width = "400px";
      aAfficher.style.height = "300px";
      aAfficher.style.border = "1px solid black";
      affichageRecetteSamedi.appendChild(aAfficher);
      let buttonIng = document.getElementById("supr-rec-s" + i);
      let heure = document.getElementById("heure-s" + i);
      buttonIng.addEventListener("click", function () {
        tableauRecettesSamedi = remove(tableauRecettesSamedi, i);
        updateRecetteSamedi();
      });
      heure.addEventListener("change", function () {
        tableauRecettesSamedi[i].heure = heure.value;
      });
      affichageRecetteSamedi.appendChild(aAfficher);
      document.getElementById("rec-s" + i).addEventListener("mouseover", () => {
        aAfficher.style.display = "block";
      });
      document.getElementById("rec-s" + i).addEventListener("mouseout", () => {
        aAfficher.style.display = "none";
      });
    }
  }

  /**
   * Ajoute une recette au plan le Dimanche
   */
  ajouterRecetteDimanche.addEventListener("click", function () {
    event.preventDefault();

    let textProchainRecette = prochaineRecetteDimanche.value.trim();
    prochaineRecetteDimanche.value = "";

    // seulement mettre a jour si du texte a ete recu et est valide
    if (textProchainRecette) {
      let indexDansListe = -1;
      let estNouveau = true;
      for (let i = 0; i < tableauRecettesDimanche.length; i++) {
        if (tableauRecettesDimanche[i].nom == textProchainRecette) {
          estNouveau = false;
        }
      }
      if (estNouveau) {
        for (let i = 0; i < objListeTousRecettes.length; i++) {
          if (objListeTousRecettes[i].nom == textProchainRecette) {
            indexDansListe = i;
          }
        }
      }
      if (indexDansListe != -1) {
        tableauRecettesDimanche.push(objListeTousRecettes[indexDansListe]);
        updateRecetteDimanche();
      } else {
        alert("Cette recette n'est pas dans les recettes disponibles presentement.");
      }
    }
  });

  /**
   *  recharge la liste de recettes du Dimanche
   */
  function updateRecetteDimanche() {
    affichageRecetteDimanche.innerHTML = "";

    for (let i = 0; i < tableauRecettesDimanche.length; i++) {
      let divRecette = document.createElement("div");
      divRecette.className = "recipe-entry";
      let aAfficher = document.createElement("div");
      aAfficher.className = "popup-recette";
      let imgSrc;
      if (tableauRecettesDimanche[i].image) {
        imgSrc = `data:image/jpeg;base64,${tableauRecettesDimanche[i].image}`;
      } else {
        imgSrc = "assets/image/image_tmp_recette.png";
      }

      aAfficher.innerHTML =
        "<div class='popup-content'><div class='left-column'><img class='recipe-image' src='" +
        imgSrc +
        "' alt='Recipe Image'><p class='recipe-description'>" +
        tableauRecettesDimanche[i].descriptions +
        "</p></div><div class='right-column'><div class='ingredients-box'><h2 class='ingredients-title'>DÉTAILS</h2><div class='recipe-info-section'><h3 class='info-title'>NOMBRE DE PORTIONS</h3><p class='info-value'>" +
        tableauRecettesDimanche[i].portions +
        " Portions</p></div><div class='recipe-info-section'><h3 class='info-title'>TEMPS DE PRÉPARATION</h3><p class='info-value'>" +
        tableauRecettesDimanche[i].temps_de_cuisson +
        " Minutes</p></div><div class='recipe-info-section'><h3 class='info-title'>NOMBRE D'INGRÉDIENTS</h3><p class='info-value'>" +
        tableauRecettesDimanche[i].nombre_ingredients +
        " Portions</p></div><div class='recipe-info-section'><h3 class='info-title'>NOMBRE D'ÉTAPES</h3><p class='info-value'>" +
        tableauRecettesDimanche[i].nombre_etapes +
        " Portions</p></div></div></div></div>";

      divRecette.innerHTML =
        "<div style='border=1px solid black'><p id='rec-d" +
        i +
        "'>" +
        tableauRecettesDimanche[i].nom +
        "</p><input id='heure-d" +
        i +
        "' value='" +
        tableauRecettesDimanche[i].heure +
        "'type='time'><button  class='remove-item-button' id='supr-rec-d" +
        i +
        "'>X</button></div>";
      affichageRecetteDimanche.appendChild(divRecette);
      aAfficher.style.display = "none";
      aAfficher.style.position = "absolute";
      aAfficher.style.top = divRecette.offsetTop + 50 + "px";
      aAfficher.style.left = divRecette.offsetLeft + 50 + "px";
      aAfficher.style.width = "400px";
      aAfficher.style.height = "300px";
      aAfficher.style.border = "1px solid black";
      affichageRecetteDimanche.appendChild(aAfficher);
      let buttonIng = document.getElementById("supr-rec-d" + i);
      let heure = document.getElementById("heure-d" + i);
      buttonIng.addEventListener("click", function () {
        tableauRecettesDimanche = remove(tableauRecettesDimanche, i);
        updateRecetteDimanche();
      });
      heure.addEventListener("change", function () {
        tableauRecettesDimanche[i].heure = heure.value;
      });
      affichageRecetteDimanche.appendChild(aAfficher);
      document.getElementById("rec-d" + i).addEventListener("mouseover", () => {
        aAfficher.style.display = "block";
      });
      document.getElementById("rec-d" + i).addEventListener("mouseout", () => {
        aAfficher.style.display = "none";
      });
    }
  }

  /**
   * accepte les images glissees et les ajoute a la liste d'images
   */
  zoneImages.addEventListener("drop", function (event) {
    event.preventDefault();

    let images = event.dataTransfer.files;

    for (let i = 0; i < images.length; i++) {
      if (file[0].type.match("image")) {
        let newImage = true;

        for (let i = 0; i < tableauImages.length; i++) {
          if (tableauImages[i].name == images[i].name) {
            newImage = false;
            break;
          }
          if (newImage) {
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
  function updateImages() {
    zoneImages.innerHTML = "";
    for (let i = 0; i < tableauImages.length; i++) {
      let image = tableauImages[i];
      let imageElement = document.createElement("img");
      let suppr = document.createElement("button");
      suppr.textContent = "Supprimer";
      suppr.width = 20;
      suppr.height = 20;
      suppr.style.backgroundColor = "red";
      suppr.addEventListener("click", function () {
        tableauImages.splice(i, 1);
        updateImages();
      });
      imageElement.src = URL.createObjectURL(image);
      imageElement.alt = image.name;
      imageElement.width = 200;
      imageElement.height = 200;
      imageElement.classList.add("image-recette");
      zoneImages.prepend(suppr);
      zoneImages.prepend(imageElement);
    }
  }

  envoyerPlan.addEventListener("click", sendPlan);

  /**
   * recuperation du plan dans la base de donnee via son id
   * @param {String} plan l'id du plan a recuperer
   */
  async function fetchPlan(plan) {
    try {
      let response = await fetch(
        chemin + "/api/CreationPlans.php/plans/" + plan,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // verification de la reponse
      if (response["ok"]) {


        objPlan = await response.json();

        if (!objPlan.error) {
          // recuperation des variables
          titre = objPlan[0].titre;
          texteTitre.value = titre;

          description = objPlan[0].description;
          texteDescription.value = description;

        for(let i = 0; i < objPlan.length; i++){
        switch (objPlan[i].journee) {
          case "Lundi":
            tableauRecettesLundi.push(objPlan[i]);
            break;
          case "Mardi":
            tableauRecettesMardi.push(objPlan[i]);
            break;
          case "Mercredi":
            tableauRecettesMercredi.push(objPlan[i]);
            break;
          case "Jeudi":
            tableauRecettesJeudi.push(objPlan[i]);
            break;
          case "Vendredi":
            tableauRecettesVendredi.push(objPlan[i]);
            break; 
          case "Samedi":
            tableauRecettesSamedi.push(objPlan[i]);
            break;
          case "Dimanche":
            tableauRecettesDimanche.push(objPlan[i]);
            break;
          default:
            erreurFetchPlan();
            break;
        }
        }
          updateRecetteLundi();
          updateRecetteMardi();
          updateRecetteMercredi();
          updateRecetteJeudi();
          updateRecetteVendredi();
          updateRecetteSamedi();
          updateRecetteDimanche();
          updateImages();
        } else {
          erreurFetchPlan();
        }
      } else {
        erreurFetchPlan();
      }
    } catch (error) {
      erreurFetchPlan();
    }
  }

  /**
   * recuperation de la liste de recettes dans la base de donnee
   */
  async function fetchRecettes() {
    try {
      let response = await fetch(chemin + "/api/CreationPlans.php/recettes");
      
      // verification de la reponse
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des recettes");
      }
      let resultat = await response.json();

      if (resultat[0].error) {
        erreurFetchRecettes();
      } else {
        // Recuperation et creation des recettes
        for (let i = 0; i < resultat.length; i++) {

          let divRecette = document.createElement("option");
          divRecette.innerHTML = resultat[i].nom;
          divRecette.id = resultat[i].id;

          listeRecettesLundi.appendChild(divRecette.cloneNode(true));
          listeRecettesMardi.appendChild(divRecette.cloneNode(true));
          listeRecettesMercredi.appendChild(divRecette.cloneNode(true));
          listeRecettesJeudi.appendChild(divRecette.cloneNode(true));
          listeRecettesVendredi.appendChild(divRecette.cloneNode(true));
          listeRecettesSamedi.appendChild(divRecette.cloneNode(true));
          listeRecettesDimanche.appendChild(divRecette.cloneNode(true));

        }

        listeRecettesLundi.selectedIndex = -1;
        listeRecettesMardi.selectedIndex = -1;
        listeRecettesMercredi.selectedIndex = -1;
        listeRecettesJeudi.selectedIndex = -1;
        listeRecettesVendredi.selectedIndex = -1;
        listeRecettesSamedi.selectedIndex = -1;
        listeRecettesDimanche.selectedIndex = -1;

        objListeTousRecettes = resultat;

      }
    } catch (error) {
      alert(error);
      erreurFetchRecettes();
    }
  }
  /**
   * Envoie le plan au serveur
   */
  async function sendPlan(event) {
    event.preventDefault();

    // recuperation du titre et de la description pour verification
    titre = texteTitre.value.trim();
    description = texteDescription.value.trim();

    if (!titre) {
      alert("Veuillez entrer un titre pour votre plan.");
      return;
    }

    if (!description) {
      alert("Veuillez entrer une description pour votre plan.");
      return;
    }

    try {

      // recuperation des variables et creation de l'objet JSON
      let envoiID = null;
      let tableauRecettes = [];
      tableauRecettes.push(tableauRecettesLundi);
      tableauRecettes.push(tableauRecettesMardi);
      tableauRecettes.push(tableauRecettesMercredi);
      tableauRecettes.push(tableauRecettesJeudi);
      tableauRecettes.push(tableauRecettesVendredi);
      tableauRecettes.push(tableauRecettesSamedi);
      tableauRecettes.push(tableauRecettesDimanche);

      if (editPlan) {
        envoiID = planLocal;
      }
      paquetTest = new FormData();
      objPlanJSON = JSON.stringify({
        edit: editPlan,
        id: envoiID,
        titre: titre,
        description: description,
        images: tableauImages,
        recettes: tableauRecettes,
        username: sessionStorage.getItem("username"),
      });

      let paquet = new FormData();

      for (let i = 0; i < tableauImages.length; i++) {
        paquet.append("image" + i, tableauImages[i].src);
      }

      paquet.append("json", objPlanJSON);

      let response = await fetch(
        chemin + "/api/CreationPlans.php/plans/creer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: paquet,
        }
      );

      let reponse = await response.json();
      if (reponse.status == "ok") {
        alert("Plan sauvegardee avec succès.");
        back();
      } else {
        erreurEnvoi();
      }
    } catch (error) {
      erreurEnvoi();
    }
  }

  /**
   *  Traitement en cas d'erreur lors de la recuperation du plan depuis le serveur
   */
  function erreurFetchPlan() {
    let zonePrincipale = document.getElementById("contenu-principal");
    zonePrincipale.innerHTML =
      "<p class='erreur-fatale'> Erreur lors de la recuperation du plan, veuillez essayer de recharger la page. </p>";
  }
  /**
   *  Traitement en cas d'erreur lors de la recuperation des recettes depuis le serveur
   */
  function erreurFetchRecettes() {
    let zonePrincipale = document.getElementById("contenu-principal");
    zonePrincipale.innerHTML =
      "<p class='erreur-fatale'> Erreur lors de la recuperation des recettes, veuillez essayer de recharger la page. </p>";
  }
  function erreurEnvoi() {
    alert("Erreur lors de l'envoi du plan, veuillez reessayer plus tard.");
  }
  function erreurSuppression() {
    alert(
      "Erreur lors de la suppression du plan du cote serveur, veuillez reessayer plus tard."
    );
  }
  function remove(tableau, i) {
    if (i > -1 && i < tableau.length) {
      tableau.splice(i, 1);
    }
    return tableau;
  }

  /**
   * accepte les images et les ajoute a la liste d'images
   */
  prochaineImage.addEventListener("change", function () {
    let images = prochaineImage.files;

    for (let i = 0; i < images.length; i++) {
      tableauImages.push(images[i]);
    }
    updateImages();
  });

  /**
   * accepte les images glissees et les ajoute a la liste d'images
   */
  zoneImages.addEventListener("drop", function (event) {
    event.preventDefault();
    let images = event.dataTransfer.files;
    for (let i = 0; i < images.length; i++) {
      if (file[0].type.match("image")) {
        let newImage = true;
        for (let i = 0; i < tableauImages.length; i++) {
          if (tableauImages[i].name == images[i].name) {
            newImage = false;
            break;
          }
          if (newImage) {
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
  function updateImages() {
    zoneImages.innerHTML = "";
    for (let i = 0; i < tableauImages.length; i++) {
      let image = tableauImages[i];
      let imageElement = document.createElement("img");
      let suppr = document.createElement("button");
      suppr.textContent = "Supprimer";
      suppr.width = 20;
      suppr.height = 20;
      suppr.style.backgroundColor = "red";
      suppr.addEventListener("click", function () {
        tableauImages.splice(i, 1);
        updateImages();
      });
      imageElement.src = URL.createObjectURL(image);
      imageElement.alt = image.name;
      imageElement.width = 200;
      imageElement.height = 200;
      imageElement.classList.add("image-recette");
      zoneImages.prepend(suppr);
      zoneImages.prepend(imageElement);
    }
  }

   // Récupérer les données utilisateur de sessionStorage
   const IDENTIFIANT = sessionStorage.getItem('identifiant');
   const MOT_DE_PASSE = sessionStorage.getItem("motDePasse");

    if (!IDENTIFIANT || !MOT_DE_PASSE) {
        alert("Vous devez être connecté pour interagir avec cette page.");
        window.location.href = 'index.html'; // Redirige vers la page de connexion si non connecté
        return;
    }
    if (localStorage.getItem("plan-a-editer") != null) {

      //recuperation du plan si demande
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("id")) {
        planLocal = urlParams.get("id");
        editPlan = true;
        fetchPlan(planLocal);
      } else {
        planLocal = null;
      }
    } else {
      planLocal = null;
    }
    fetchRecettes();
});
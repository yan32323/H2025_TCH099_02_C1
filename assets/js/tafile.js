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
          if (tableauRecettesDimanche[i].nom==textProchainRecette){
            estNouveau=false;
          }
        }
        if (estNouveau){
        for (let i = 1; i < objListeTousRecettes.length; i++) {
          if (objListeTousRecettes[i].nom == textProchainRecette) {
            indexDansListe = i;
          }
        }
      }
        if (indexDansListe != -1) {
          tableauRecettesDimanche.push(objListeTousRecettes[indexDansListe]);
          updateRecetteDimanche();
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
        let aAfficher = document.createElement("div");
        aAfficher.innerHTML = "<img src='https://picsum.photos/200'><p>"+tableauRecettesDimanche[i].nom+"</p><p>"+tableauRecettesDimanche[i].description+"</p>";

        divRecette.innerHTML =
          "<div style='border=1px solid black'><p id='rec-d" +
          i +
          "'>" +
          tableauRecettesDimanche[i].nom +
          "</p><p>"
          +tableauRecettesDimanche[i].description+"</p><input id='heure-d"+i+"' value='"+tableauRecettesDimanche[i].heure+"'type='time'><button id='supr-rec-d" +
          i +"'>X</button></div>";
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
        let heure = document.getElementById("heure-d"+i);
        buttonIng.addEventListener("click", function () {
          tableauRecettesDimanche = remove(tableauRecettesDimanche, i);
          updateRecetteDimanche();
        });
        heure.addEventListener("change", function () {
          tableauRecettesDimanche[i].heure = heure.value;
        });
        affichageRecetteDimanche.appendChild(aAfficher);
        document.getElementById("rec-d"+i).addEventListener("mouseover", () => {
          aAfficher.style.display = "block";
        });
        document.getElementById("rec-d"+i).addEventListener("mouseout", () => {
          aAfficher.style.display = "none";
        });
      }
    }

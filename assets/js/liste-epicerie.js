document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get("plan");
  const chemin = "http://localhost/planigo/H2025_TCH099_02_C1";
  let liste;

  // Récupérer les données utilisateur de sessionStorage
  const utilisateurId = sessionStorage.getItem("identifiant");
  const utilisateurMotDePasse = sessionStorage.getItem("motDePasse");

  //verifier si l'utilisateur est connecté
  if (!utilisateurId || !utilisateurMotDePasse) {
    alert("Vous devez être connecté pour interagir avec cette recette.");
    window.location.href = "index.html"; // Redirige vers la page de connexion si pas connecté
    return;
  }

  //verifier qu'on a les parametres requis
  if (!utilisateurId || !planId) {
    alert("Aucun utilisateur spécifié.");
    return;
  }
  fetchListe(utilisateurId, planId, chemin);

  /**
   * recuperee une liste d'epicerie selon l'utilisateur et le plan passes en parametre
   * @param {*} utilisateurId L'identifiant de l'utilisateur
   * @param {*} planId L'identifiant du plan
   * @param {*} chemin L'url de l'API
   */
  async function fetchListe(utilisateurId, planId, chemin) {
    try {
      const bodyData = {
        username: utilisateurId,
        plan: planId,
      };
      let response = await fetch(chemin + "/api/getListeEpicerie.php/liste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      // Vérifier si la réponse est correcte
      if (!response.ok) {
        throw new Error();
      }

      liste = await response.json();

      genereItemsStockage(liste);

    } catch (error) {
      alert(error);
      erreurFetchRecettes();
    }
  }

  function erreurFetchRecettes() {
    alert(
      "Erreur lors de la recuperation des recettes, veuillez essayer de recharger la page."
    );
  }

  /**
   * Fonction pour générer les items de stockage à partir de la liste d'items recue en parametre
   * @param {Array} listeItemsStockage - La liste d'items de stockage à afficher
   */
  function genereItemsStockage(listeItemsStockage) {
    const CONTENEUR_PRODUITS = document.getElementById("contenant_produit");

    //Créer les éléments HTML du conteneur de produits
    for (let nuObjet = 0; nuObjet < listeItemsStockage.length; nuObjet++) {
      const OBJET_PRODUIT = document.createElement("div");
      OBJET_PRODUIT.className = "object_produit";

      //Créer les éléments HTML des items de chaque objet de la liste (ingredient, quantite et unite)
      for (
        let nuItems = 0;
        nuItems < Object.keys(listeItemsStockage[0]).length;
        nuItems++
      ) {
        const ITEM = document.createElement("div");
        ITEM.className = "item_produit";

        const TEXT = document.createElement("p");
        TEXT.className = "text_produit";

        //Sélectionner le texte bon texte de l'objet à afficher
        switch (nuItems) {
          case 0:
            TEXT.textContent = listeItemsStockage[nuObjet].nom;
            break;
          case 1:
            TEXT.textContent = listeItemsStockage[nuObjet].quantite_manquante;
            break;
          case 2:
            TEXT.textContent = listeItemsStockage[nuObjet].unite_de_mesure;
            break;
        }

        ITEM.append(TEXT);
        OBJET_PRODUIT.append(ITEM);
      }

      //Ajouter les compoants à leurs parents
      CONTENEUR_PRODUITS.appendChild(OBJET_PRODUIT);
    }
  }
});

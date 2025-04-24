document.addEventListener('DOMContentLoaded', function () {
    const IDENTIFIANT = sessionStorage.getItem('identifiant');
    const MOT_DE_PASSE = sessionStorage.getItem('motDePasse');

    const MSG_ERREUR = document.getElementById('message-erreur1');
    const MSG_SUCCES = document.getElementById('message-succes');
    const BTN_ADD = document.getElementById('add');
    const LOGOUT_BUTTON = document.getElementById("logoutButton");
    const DIV_PAGE_POPUP = document.getElementById("exampleModal");
    

    // Si l'usager n'est pas loguer, on le redirige vers la page de connextion
    // if (!IDENTIFIANT || !MOT_DE_PASSE) {
    //     window.location.href = 'index.html';
    // }

    //Afficher le message de base si présent
    if(sessionStorage.getItem('message_affichage')){
        MSG_SUCCES.textContent = sessionStorage.getItem('message_affichage');
        sessionStorage.removeItem("message_affichage");
    }
    //libéré les données inutiles du session storage
    sessionStorage.removeItem('action');
    sessionStorage.removeItem('produit');

    initialiserContenantProduit();

    BTN_ADD.addEventListener('click', function () {
        sessionStorage.setItem("action", "add");
        const LANCER_POPUP = new Event('lancer-popup');
        document.dispatchEvent(LANCER_POPUP);
    });

    //Déconnexxion de l'utilisateur
    LOGOUT_BUTTON.addEventListener('click', function () {
        sessionStorage.removeItem('identifiant');
        sessionStorage.removeItem('motDePasse');
        window.location.href = 'accueil-recette.html'; 
    });

    //Sortie du popup produit, on retire les données de session storage inutile
    DIV_PAGE_POPUP.addEventListener("hidden.bs.modal", function () {
        sessionStorage.removeItem('action');
        sessionStorage.removeItem('produit');
    });


    /*Début des fonctions*/

    /** 
     * Initialier la liste des différents produits appartenant à l'utilisateur dans son stockage
    */
    async function initialiserContenantProduit(){
        event.preventDefault(); 
        
        // Créer l'objet contenant les informations nécessaires pour la route
        const FORM_DATA = {identifiant: IDENTIFIANT, motDePasse: MOT_DE_PASSE};

        //Exécuter la requête API pour récupérer le contenu du stock de l'utilisateur
        fetch('./api/stockage.php/recuperer-produit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(FORM_DATA)
        })
            .then(response => response.json())
            .then(data => {
                if (data.statut === 'success') {

                    genereItemsStockage(data.stock_ingredient);
                   
                } else {
                    MSG_ERREUR.textContent = "Une erreur imprévue est survenue. Veuillez réessayer.";
                }
            }).catch(error => {
                if (error && typeof error === "object" && error.statut === "error" && typeof error["message"] === "string") {
                    // Si c'est une erreur attendu (rédiger par nous même dans l'API)
                    MSG_ERREUR.textContent = error["message"];
                } else {
                    // Si l'erreur n'est pas formatée comme prévu (autre source)
                    console.error("Erreur inattendue :", error);
                    MSG_ERREUR.textContent = "Une erreur imprévue est survenue. Veuillez réessayer.";
                }
            });
    }

    /**
     * Remplie le conteneur de produits avec les produits données en paramètre en HTML
     * @param {liste objet d'un produit} listeItemsStockage 
     */
    function genereItemsStockage(listeItemsStockage){
        const CONTENEUR_PRODUITS = document.getElementById('contenant_produit');

        //Créer les éléments HTML du conteneur de produits
        for(let nuObjet = 0; nuObjet < listeItemsStockage.length; nuObjet++){

            const OBJET_PRODUIT = document.createElement("div");
            OBJET_PRODUIT.className = "object_produit";

            //Créer les éléments HTML des items de chaque objet de la liste (ingredient, quantite et unite)
            for(let nuItems = 0; nuItems < Object.keys(listeItemsStockage[0]).length; nuItems++){

                const ITEM = document.createElement("div");
                ITEM.className = "item_produit";

                const TEXT = document.createElement("p");
                TEXT.className = "text_produit";

                //Sélectionner le texte bon texte de l'objet à afficher
                switch(nuItems){
                    case 0:
                        TEXT.textContent = listeItemsStockage[nuObjet].nom;
                        break;
                    case 1:
                        TEXT.textContent = listeItemsStockage[nuObjet].quantite_disponible;
                        break;
                    case 2:
                        TEXT.textContent = listeItemsStockage[nuObjet].unite_de_mesure;
                        break;
                }

                ITEM.append(TEXT);
                OBJET_PRODUIT.append(ITEM);
            }

            //créer le div des bouttons
            const DIV_BOUTTON = document.createElement("div");
            DIV_BOUTTON.className = "div_btn_item";

            //Créer les 2 boutons d'action (modifier et supprimer)
            const BTN_MODIFIER = document.createElement("button");
            BTN_MODIFIER.className = "btn_modifier";
            BTN_MODIFIER.setAttribute("data-bs-toggle", "modal");
            BTN_MODIFIER.setAttribute("data-bs-target", "#exampleModal"); 
            
            //Ajouter l'image au bouton de modifier
            const IMG_MODIFIER = document.createElement("img");
            IMG_MODIFIER.src = "assets/image/pencil.png";  
            IMG_MODIFIER.alt = "Modifier";
            IMG_MODIFIER.style.width = "20px";  
            IMG_MODIFIER.style.height = "20px";
            BTN_MODIFIER.appendChild(IMG_MODIFIER);

      
            //Ajouter l'image au bouton de supprimer
            const BTN_SUPPRIMER = document.createElement("button");
            BTN_SUPPRIMER.className = "btn_supprimer";
            const IMG_SUPPRIMER = document.createElement("img");
            IMG_SUPPRIMER.src = "assets/image/trash.png";  
            IMG_SUPPRIMER.alt = "Supprimer";
            IMG_SUPPRIMER.style.width = "20px";  
            IMG_SUPPRIMER.style.height = "20px";
            BTN_SUPPRIMER.appendChild(IMG_SUPPRIMER);

            //Ajouter les compoants à leurs parents
            DIV_BOUTTON.append(BTN_MODIFIER);
            DIV_BOUTTON.append(BTN_SUPPRIMER);
            OBJET_PRODUIT.append(DIV_BOUTTON);
            CONTENEUR_PRODUITS.appendChild(OBJET_PRODUIT);

            //Setter les actions sur les boutons
            BTN_MODIFIER.addEventListener('click', function () {event.preventDefault(); modifierObjet(OBJET_PRODUIT)});
            BTN_SUPPRIMER.addEventListener('click', function () {event.preventDefault(); supprimerObjet(OBJET_PRODUIT)});
        }
    }

    /**
     * Transféré les informations de l'objet à modifier au popup-produit
     * @param {div} OBJET_PARENT Le composant contenant toutes les autres composantsde l'objet d'un item du stockage
     */
    function modifierObjet(OBJET_PARENT){

        //Récupérer les informations de l'objet à modifier
        const TEXT_PRODUIT = OBJET_PARENT.getElementsByClassName("text_produit");
        const INGREDIENT = TEXT_PRODUIT[0].textContent;
        const QUANTITE = TEXT_PRODUIT[1].textContent;
        const UNITE = TEXT_PRODUIT[2].textContent;

        //Envoyer les données nécessaires au popup-produit pour modifier l'objet
        let dataJSON = {ingredient: INGREDIENT, quantite: QUANTITE, unite: UNITE};
        sessionStorage.setItem("produit", JSON.stringify(dataJSON));
        sessionStorage.setItem("action", "edit");
        
        const LANCER_POPUP = new Event('lancer-popup');
        document.dispatchEvent(LANCER_POPUP);
        
    }

    /**
     * Supprimé l'objet donné en paramètre de la vue de l'utilisateur et dans la base de données
     * @param {div} OBJET_PARENT Le composant contenant toutes les autres composantsde l'objet d'un item du stockage
     */
    function supprimerObjet(OBJET_PARENT){

        //Récupérer l'ingredient de l'objet à modifier
        const TEXT_PRODUIT = OBJET_PARENT.getElementsByClassName("text_produit");
        const INGREDIENT = TEXT_PRODUIT[0].textContent;
        
        // Créer l'objet contenant les informations nécessaires pour la route
        const FORM_DATA = {identifiant: IDENTIFIANT, motDePasse: MOT_DE_PASSE, ingredient: INGREDIENT};

        //Exécuter la requête API pour supprimer un produit au stock
        fetch('./api/stockage.php/supprimer-produit/', { 
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(FORM_DATA)
        })
            .then(response => response.json())
            .then(data => {
                if (data.statut === 'success') {
                    //Si le retrai est un succès, on retire l'objet au visuel
                    OBJET_PARENT.remove();
                    MSG_SUCCES.textContent = "L'item a été supprimé avec succès.";
                } else {
                    MSG_ERREUR.textContent = "Une erreur imprévue est survenue. Veuillez réessayer.";
                }
            }).catch(error => {
                if (error && typeof error === "object" && error.statut === "error" && typeof error["message"] === "string") {
                    // Si c'est une erreur attendu (rédiger par nous même dans l'API)
                    MSG_ERREUR.textContent = error["message"];
                } else {
                    // Si l'erreur n'est pas formatée comme prévu (autre source)
                    console.error("Erreur inattendue :", error);
                    MSG_ERREUR.textContent = "Une erreur imprévue est survenue. Veuillez réessayer.";
                }
            });
    }

});
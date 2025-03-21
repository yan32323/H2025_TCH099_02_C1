document.addEventListener('DOMContentLoaded', function () {
    const IDENTIFIANT = sessionStorage.getItem('identifiant');
    const MOT_DE_PASSE = sessionStorage.getItem('motDePasse');

    const BTN_RECUPERER_PRODUIT = document.getElementById('test_recuperer_produit');
    const BTN_AJOUTER_PRODUIT = document.getElementById('test_ajouter_produit');
    const BTN_SUPPRIMER_PRODUIT = document.getElementById('test_supprimer_produit');
    const BTN_UPDATE_PRODUIT = document.getElementById('test_update_produit');
    
    const BTN_EDIT = document.getElementById('edit');
    const BTN_ADD = document.getElementById('add');
    

    BTN_RECUPERER_PRODUIT.addEventListener('click', function (event) {
        event.preventDefault(); 
        
        // Créer l'objet contenant les informations nécessaires pour la route
        const FORM_DATA = {identifiant: IDENTIFIANT, motDePasse: MOT_DE_PASSE};

        //Exécuter la requête API pour récupérer le contenu du stock
        fetch('http://localhost/labo-tch099/api/stockage.php/recuperer-produit/', {
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
                    alert ("Échec de l'optention du contenu du stock");
                }
            })
            .catch(error => {
                console.error('Erreur d\'inscription:', error);
            });
    });

    BTN_AJOUTER_PRODUIT.addEventListener('click', function (event) {
        event.preventDefault(); 
        
        // Créer l'objet contenant les informations nécessaires pour la route
        const FORM_DATA = {identifiant: IDENTIFIANT, motDePasse: MOT_DE_PASSE, idProduit: 1, quantite: 6};

        //Exécuter la requête API pour ajouter un produit au stock
        fetch('http://localhost/labo-tch099/api/stockage.php/ajouter-produit/', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(FORM_DATA)
        })
            .then(response => response.json())
            .then(data => {
                if (data.statut === 'success') {
                    alert("Réusssit à l'ajout d'un produit au stock");
                } else {
                    alert ("Échec à l'ajout d'un produit au stock");
                }
            })
            .catch(error => {
                console.error('Erreur d\'inscription:', error);
            });
    });

    BTN_SUPPRIMER_PRODUIT.addEventListener('click', function (event) {
        event.preventDefault(); 
        
        // Créer l'objet contenant les informations nécessaires pour la route
        const FORM_DATA = {identifiant: IDENTIFIANT, motDePasse: MOT_DE_PASSE, idProduit: 1};

        //Exécuter la requête API pour ajouter un produit au stock
        fetch('http://localhost/labo-tch099/api/stockage.php/supprimer-produit/', { 
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(FORM_DATA)
        })
            .then(response => response.json())
            .then(data => {
                if (data.statut === 'success') {
                    alert("Réusssit à supprimer le produit au stock");
                } else {
                    alert ("Échec à supprimer le produit au stock");
                }
            })
            .catch(error => {
                console.error('Erreur d\'inscription:', error);
            });
    });

    BTN_UPDATE_PRODUIT.addEventListener('click', function (event) {
        event.preventDefault(); 
        
        // Créer l'objet contenant les informations nécessaires pour la route
        const FORM_DATA = {identifiant: IDENTIFIANT, motDePasse: MOT_DE_PASSE, idProduit: 1, quantite: 4};

        //Exécuter la requête API pour modifier un produit au stock
        fetch('http://localhost/labo-tch099/api/stockage.php/update-produit/', { 
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(FORM_DATA)
        })
            .then(response => response.json())
            .then(data => {
                if (data.statut === 'success') {
                    alert("Réusssit à modifier le produit au stock");
                } else {
                    alert ("Échec à modifier le produit au stock");
                }
            })
            .catch(error => {
                console.error('Erreur d\'inscription:', error);
            });
    });

    BTN_EDIT.addEventListener('click', function () {
        sessionStorage.setItem("action", "edit");
        let dataJSON = {ingredient: "oeufs", quantite: "6", unite: "unité"};
        sessionStorage.setItem("produit", JSON.stringify(dataJSON));

        window.location.href = 'popup-produit.html';
    });

    BTN_ADD.addEventListener('click', function () {
        sessionStorage.setItem("action", "add");
        window.location.href = 'popup-produit.html';
    });

    /**
     * Remplie le conteneur de produits avec les produits données en paramètre en HTML
     * @param {liste objet d'un produit} listeItemsStockage 
     */
    function genereItemsStockage(listeItemsStockage){
console.log(listeItemsStockage);
console.log(listeItemsStockage.length);
console.log(Object.keys(listeItemsStockage[0]).length);
        const CONTENEUR_PRODUITS = document.getElementById('contenant_produit');

        //Créer les éléments HTML du conteneur de produits
        for(let nuObjet = 0; nuObjet < listeItemsStockage.length; nuObjet++){

            const OBJET_PRODUIT = document.createElement("div");//"<div class='object_produit'></div>";
            OBJET_PRODUIT.className = "object_produit";

            //Créer les éléments HTML des items de chaque objet de la liste (ingredient, quantite et unite)
            for(let nuItems = 0; nuItems < Object.keys(listeItemsStockage[0]).length; nuItems++){

                const ITEM = document.createElement("div");
                ITEM.className = "item_produit";

                const TEXT = document.createElement("p");
                TEXT.className = "text_produit";

                //AJOUTER LE POINT NOIR ICI
                //ITEM.append(pointnoir);

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

            //Ajouter les 2 boutons d'action (modifier et supprimer)
            const BTN_MODIFIER = document.createElement("button");
            BTN_MODIFIER.className = "btn_modifier";
            BTN_MODIFIER.textContent = "Edit"; //MODIFIER POUR UN OBJET BOOTSTRAP

            const BTN_SUPPRIMER = document.createElement("button");
            BTN_SUPPRIMER.className = "btn_supprimer";
            BTN_SUPPRIMER.textContent = "Delete"; //MODIFIER POUR UN OBJET BOOTSTRAP

            OBJET_PRODUIT.append(BTN_MODIFIER);
            OBJET_PRODUIT.append(BTN_SUPPRIMER);

            CONTENEUR_PRODUITS.appendChild(OBJET_PRODUIT);
        }
    }

});
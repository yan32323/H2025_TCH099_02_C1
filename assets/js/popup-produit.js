document.addEventListener('lancer-popup', function () {

    const IDENTIFIANT = sessionStorage.getItem('identifiant');
    const MOT_DE_PASSE = sessionStorage.getItem('motDePasse');
    const ACTION = sessionStorage.getItem('action');

    const H1_TITRE = document.getElementsByTagName('h1')[1];
    const T_INGREDIENT = document.getElementById('ingredient');
    const T_QUANTITE = document.getElementById('quantite');
    const T_UNITE = document.getElementById('unite');
    const B_SOUMETTRE = document.getElementById('btn-soumettre');
    const B_ANNULER = document.getElementById('btn-annuler');
    const MSG_ERREUR = document.getElementById('message-erreur2');

    let listeIngredient = [];

    // Si l'usager n'est pas loguer, on le redirige vers la page de connextion
    if (!IDENTIFIANT || !MOT_DE_PASSE) {
        window.location.href = 'index.html';
    }

    //Modifier la page dépendamment de l'action (edit ou add)
    if(ACTION === 'edit') {
        //Récupérer les données du produit à modifier
        let itemProduit = JSON.parse(sessionStorage.getItem('produit'));
        let ingredient = itemProduit.ingredient;
        let quantite = itemProduit.quantite;
        let unite = itemProduit.unite;

        //Pré-remplir le formulaire et modifier le titre
        H1_TITRE.textContent = 'Modifier la quantité du produit';
        T_INGREDIENT.value = ingredient;
        T_INGREDIENT.setAttribute('readonly', true);
        T_UNITE.value = unite;

        //modifier la graduation de la quantité selon l'unité de mesure
        nouvelleUniteDeMesure(unite);
        if(unite == 'unite'){
            T_QUANTITE.value = Number.parseInt(quantite);
        }else{
            T_QUANTITE.value = quantite;

        }

    }else {
        if(ACTION === 'add'){

            //Configurer la configuration initial du formulaire
            H1_TITRE.textContent = 'Ajouter un produit';
            T_INGREDIENT.value = "";
            T_INGREDIENT.removeAttribute('readonly');
            T_UNITE.value = "Selon l'ingredient";
            T_QUANTITE.value = "";

            //Récupéré les ingrédients dans la base de données et remplir la liste local
            fetch('./api/stockage.php/recuperer-ingredient/')
            .then(response => response.json())
            .then(data => {
                
                if(data.statut === 'success'){
                    listeIngredient = data.listeIngredient;
                }
            }).catch(error => {
                if (error && typeof error === "object" && error.statut === "error" && typeof error["message"] === "string") {
                    // Si c'est une erreur attendu (rédiger par nous même dans l'API)
                    MSG_ERREUR.textContent = error["message"];
                    MSG_ERREUR.style.display = "block";
                } else {
                    // Si l'erreur n'est pas formatée comme prévu (autre source)
                    console.error("Erreur inattendue :", error);
                    MSG_ERREUR.textContent = "Une erreur imprévue est survenue. Veuillez réessayer.";
                    MSG_ERREUR.style.display = "block";
                }
            });
        }else{
            //erreur on redirige vers la page de navigation
            window.location.href = 'accueil-recette.html';
        }
    }


    T_QUANTITE.addEventListener("beforeinput", (event) => {
        const VALEUR_PERMIT = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

        //Toujour permettre d'incrémenter, de d'ésincrémenter, et de supprimer
        if(event.inputType == "deleteContentBackward" || event.inputType == "deleteContentForward"){
            return;
        }

        //cas ou on veut juste des valeur entier
        if(T_UNITE.value == "unite"){
            if(VALEUR_PERMIT.indexOf(event.data) == -1){
                event.preventDefault();
            }
            return;
        }

        //+++Permettre l'incrémentation ou le copier coller
        if(event.data.length > 1 && (event.data.indexOf('.') != -1 || event.data.indexOf(',') != -1)){
            T_QUANTITE.value = event.data;
        }

        //Permettre de débuter avec 0 . ,
        if(T_QUANTITE.value.length == 0 && ((event.data == '0') || (event.data == '.') || (event.data == ','))){
            T_QUANTITE.value = '0.01';
        }

        // Bloqué l'entrée si la valeur donné n'est pas un chiffre
        if(VALEUR_PERMIT.indexOf(event.data) == -1 && !(event.data.indexOf('.') != -1 || event.data.indexOf(',') != -1)){
            event.preventDefault();
        }
    });
    

    T_QUANTITE.addEventListener('input', function () {
        
        //Empécher de rentrer plus de 2 valeur après la virgule
        let positionVirgule = T_QUANTITE.value.indexOf('.');
        if(positionVirgule != -1 && T_QUANTITE.value.length > (positionVirgule + 2)){
            T_QUANTITE.value = T_QUANTITE.value.slice(0, positionVirgule + 3);
        }
    });


    T_INGREDIENT.addEventListener('input', function () {
        const LISTE_INGREDIENT_CONCORDANT = document.getElementById("liste-ingredient-concordant");
        LISTE_INGREDIENT_CONCORDANT.innerHTML = "";


        //Récupéré les ingredients concordant
        let motEnCreation = T_INGREDIENT.value.trim();
        let listeIngredientConcordant = listeIngredient.filter((ingredientObjetListe) => ingredientObjetListe.nom.toLowerCase().includes(motEnCreation.toLowerCase()));

        //Créer l'affichage des ingredients pouvant être sélectionner
        if(listeIngredientConcordant.length != 0){

            //Limiter le nombre d'élément qu'on affiche à 15
            let nbrMaxAffichage = listeIngredientConcordant.length;
            if(nbrMaxAffichage > 15){
                nbrMaxAffichage = 15;
            }
            
            for(let i = 0; i < nbrMaxAffichage; i++){
                const INGREDIENT_CONCORDANT = document.createElement("option");
                INGREDIENT_CONCORDANT.value = listeIngredientConcordant[i].nom;

                //Ajouter la description de l'unité de mesure si on sélectionne le produit en question
                if(motEnCreation.length == listeIngredientConcordant[i].nom.length){
                    T_UNITE.value = listeIngredientConcordant[i].unite_de_mesure;
                }

                LISTE_INGREDIENT_CONCORDANT.appendChild(INGREDIENT_CONCORDANT);
            }

            //Empécher l'affichage si c'est le bon produit sélectionner et géré l'unité de mesure de la quantite
            if(listeIngredientConcordant.length == 1 && motEnCreation.trim().length == listeIngredientConcordant[0].nom.length){
                T_INGREDIENT.value = listeIngredientConcordant[0].nom;
                LISTE_INGREDIENT_CONCORDANT.innerHTML = "";
                nouvelleUniteDeMesure(listeIngredientConcordant[0].unite_de_mesure);
            }else{
                T_UNITE.value = "Selon l'ingrédient"
            }

            MSG_ERREUR.textContent = "";
            MSG_ERREUR.style.display = "none";

        }else{
            MSG_ERREUR.textContent = "Attention! L'ingrédient donné est invalide. Vérifier l\'orthographe, puis réessayer, sinon communiquer avec l\'administrateur";
            MSG_ERREUR.style.display = "block";
        } 
    });


    B_SOUMETTRE.addEventListener('click', async function () {
        event.preventDefault();

        //Vérifier si le formulaire est valide
        if(document.getElementsByTagName('form')[0].checkValidity() === false){
            MSG_ERREUR.textContent = "Veuillez remplir tous les champs obligatoires";
            MSG_ERREUR.style.display = "block";
            return;
        }
        
        //Récupéré les données du formulaire
        let ingredient = T_INGREDIENT.value;
        let quantite = T_QUANTITE.value;

        //Vérifier si les données sont valides
        if(ACTION === 'add'){
            
            //vérifier si le produit existe déjà
            await fetch('./api/stockage.php/recuperer-id-produit/' + ingredient)
            .then(response => response.json())
            .then( async function(data) {

                if(data.statut === 'success'){
                
                    //Si le produit existe déjà, on affiche un message d'erreur
                    const FORM_DATA = {identifiant: IDENTIFIANT, motDePasse: MOT_DE_PASSE, idProduit: data.idProduit, quantite: quantite};
    
                    await fetch("./api/stockage.php/ajouter-produit/", {
                        method: 'POST',
                        body: JSON.stringify(FORM_DATA),
                        headers: { 'Content-Type': 'application/json' }
                    })
                    .then(response => response.json())
                    .then(data2 => {

                        //Si l'ajout est un succès, on revient aux stockages, sinon on affiche le message d'erreur
                        if(data2.statut === 'success'){
                            sessionStorage.setItem('message_affichage', `L'ingrédient ${ingredient} a été ajouté avec succès`);
                            revenirPageAcceuil();
                        }else if(data2.statut === 'error'){
                            MSG_ERREUR.textContent = data2.message;
                            MSG_ERREUR.style.display = "block";
                        }
                    }).catch(error => {
                        if (error && typeof error === "object" && error.statut === "error" && typeof error["message"] === "string") {
                            // Si c'est une erreur attendu (rédiger par nous même dans l'API)
                            MSG_ERREUR.textContent = error["message"];
                            MSG_ERREUR.style.display = "block";
                        } else {
                            // Si l'erreur n'est pas formatée comme prévu (autre source)
                            console.error("Erreur inattendue :", error);
                            MSG_ERREUR.textContent = "Une erreur imprévue est survenue. Veuillez réessayer.";
                            MSG_ERREUR.style.display = "block";
                        }
                    });
    
                }else if(data.statut === 'error'){ //afficher une erreur si le produit n'existe pas dans la base de données
                    MSG_ERREUR.textContent = data.message;
                    MSG_ERREUR.style.display = "block";
                }

            }).catch(error => {
                if (error && typeof error === "object" && error.statut === "error" && typeof error["message"] === "string") {
                    // Si c'est une erreur attendu (rédiger par nous même dans l'API)
                    MSG_ERREUR.textContent = error["message"];
                    MSG_ERREUR.style.display = "block";
                } else {
                    // Si l'erreur n'est pas formatée comme prévu (autre source)
                    console.error("Erreur inattendue :", error);
                    MSG_ERREUR.textContent = "Une erreur imprévue est survenue. Veuillez réessayer.";
                    MSG_ERREUR.style.display = "block";
                }
            });

        }else if(ACTION === 'edit'){
            
            //Modifier la quantite du produit
            //Exécuter la requête API pour modifier un produit au stock
            const FORM_DATA = {identifiant: IDENTIFIANT, motDePasse: MOT_DE_PASSE, nomProduit: ingredient, quantite: quantite};

            fetch('./api/stockage.php/update-produit/', { 
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(FORM_DATA)
            })
                .then(response => response.json())
                .then(data => {
                    
                    if(data.statut === 'success'){
                        sessionStorage.setItem('message_affichage', `L'ingrédient ${ingredient} a été modifié avec succès`);
                        revenirPageAcceuil();
                    }
                }).catch(error => {
                    if (error && typeof error === "object" && error.statut === "error" && typeof error["message"] === "string") {
                        // Si c'est une erreur attendu (rédiger par nous même dans l'API)
                        MSG_ERREUR.textContent = error["message"];
                        MSG_ERREUR.style.display = "block";
                    } else {
                        // Si l'erreur n'est pas formatée comme prévu (autre source)
                        console.error("Erreur inattendue :", error);
                        MSG_ERREUR.textContent = "Une erreur imprévue est survenue. Veuillez réessayer.";
                        MSG_ERREUR.style.display = "block";
                    }
                });
        }
    });


    //Retirer les données de la session et revenir à la page précédente
    B_ANNULER.addEventListener('click', function () {
        event.preventDefault();
        revenirPageAcceuil();        
    });


    /**
     * Modifier la graduation de la quantité selon l'unite de mesure donné
     * @param {String} uniteDeMesure 
     */
    function nouvelleUniteDeMesure(uniteDeMesure){
        if(uniteDeMesure == 'unite'){
            T_QUANTITE.max = '300';
            T_QUANTITE.min = '1';
            T_QUANTITE.step = '1';

        }else{
            T_QUANTITE.step = '0.01';
            T_QUANTITE.max = '300.00';
            T_QUANTITE.min = '0.01';
        }
        T_QUANTITE.value = '';
    }


    /**
     * Retirer les données de session plus nécessaire et revenir au stockage
     */
    function revenirPageAcceuil(){
        sessionStorage.removeItem('action');
        sessionStorage.removeItem('produit');
    
        window.location.href = 'stockage.html';
    };
});




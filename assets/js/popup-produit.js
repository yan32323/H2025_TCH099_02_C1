document.addEventListener('DOMContentLoaded', function () {

    const IDENTIFIANT = sessionStorage.getItem('identifiant');
    const MOT_DE_PASSE = sessionStorage.getItem('motDePasse');
    const ACTION = sessionStorage.getItem('action');

    const T_INGREDIENT = document.getElementById('ingredient');
    const T_QUANTITE = document.getElementById('quantite');
    const T_UNITE = document.getElementById('unite');
    const B_SOUMETTRE = document.getElementById('form-produit');
    const B_ANNULER = document.getElementById('btn-annuler');
    const H1_TITRE = document.getElementsByTagName('h1')[0];
    const MSG_ERREUR = document.getElementById('message-erreur');

    // Check if user is logged in (identifiant and motDePasse are in sessionStorage)
    if (!IDENTIFIANT || !MOT_DE_PASSE) {
        window.location.href = 'index.html'; 
        return;
    }

    //Modifier la page dépendamment de l'action (edit ou add)
    if(ACTION === 'edit') {
        //Récupérer les données du produit à modifier
        let itemProduit = JSON.parse(sessionStorage.getItem('produit'));
        let ingredient = itemProduit.ingredient;
        let quantite = itemProduit.quantite;
        let unite = itemProduit.unite;

        //Pré-remplir le formulaire et modifier le titre
        H1_TITRE.innerHTML = 'Modifier la quantité du produit';
        T_INGREDIENT.value = ingredient;
        T_QUANTITE.value = quantite;
        T_UNITE.value = unite;

        T_INGREDIENT.setAttribute('readonly', true);

    }else if(!ACTION === 'add') {
        //erreur on redirige vers la page de navigation
        window.location.href = 'forum.html';
    }



    B_SOUMETTRE.addEventListener('submit', async function () {
        event.preventDefault();
        
        //Récupéré les données du formulaire
        let ingredient = T_INGREDIENT.value;
        let quantite = T_QUANTITE.value;
        let unite = T_UNITE.value;

        //Vérifier si les données sont valides
        if(ACTION === 'add'){
            
            //vérifier si le produit existe déjà
            const DATA_REQUETE_1 = await fetch('./api/stockage.php/recuperer-id-produit/' + ingredient);
            const DATA = await DATA_REQUETE_1.json();

            if(DATA.statut === 'success'){
                
                //Si le produit existe déjà, on affiche un message d'erreur
                const FORM_DATA = {identifiant: IDENTIFIANT, motDePasse: MOT_DE_PASSE, idProduit: DATA.idProduit, quantite: quantite};

                await fetch("./api/stockage.php/ajouter-produit/", {
                    method: 'POST',
                    body: JSON.stringify(FORM_DATA),
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(response => response.json())
                .then(data2 => {
                    //Si l'ajout est un succès, on revient aux stockages
                    if(data2.statut === 'success'){
                        revenirPageAcceuil();

                    }else if(data2.statut === 'error'){
                        //afficher une erreur si l'ajout à échouer
                        MSG_ERREUR.innerHTML = data2.message;
                    }
                });

            }else if(DATA.statut === 'not found'){
                //afficher une erreur si le produit n'existe pas dans la base de données
                MSG_ERREUR.innerHTML = DATA.message;
            }

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
                        revenirPageAcceuil();

                    }else if(data.statut === 'error'){
                        //afficher une erreur si la modification à échouer
                        MSG_ERREUR.innerHTML = data.message;
                    }
                })
                .catch(error => {
                    MSG_ERREUR.innerHTML = 'Erreur d\'inscription:';
                });
        }


    });


    //Retirer les données de la session et revenir à la page précédente
    B_ANNULER.addEventListener('click', function () {
        event.preventDefault();
        revenirPageAcceuil();        
    });

    function revenirPageAcceuil(){
        sessionStorage.removeItem('action');
        sessionStorage.removeItem('produit');
    
        window.location.href = 'stockage.html';
    };
});




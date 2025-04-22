document.addEventListener('DOMContentLoaded', () => {

    const logoutButton = document.getElementById('logoutButton');
    const MSG_ERREUR = document.getElementById('message-erreur'); 

    // Get identifiant and motDePasse from sessionStorage
    const IDENTIFIANT = sessionStorage.getItem('identifiant');
    const MOT_DE_PASSE = sessionStorage.getItem('motDePasse');

    let filtreType = 'tout';
    let filtreRestriction = 'miennes';

    // Check if user is logged in (identifiant and motDePasse are in sessionStorage)
    if (!IDENTIFIANT || !MOT_DE_PASSE) {
        window.location.href = 'index.html'; // Redirect to login page if not logged in
        return;
    }

    //Initialiser la liste des recettes initiale 
    updateListeRecettesActuel(filtreType, filtreRestriction);

    // Initialisation du carrousel Bootstrap
    const carousel = new bootstrap.Carousel(document.getElementById('carouselCategoriesBootstrap'), {
      interval: 5000, // temps entre les slides en ms
      wrap: true
    });
    new bootstrap.Carousel(document.getElementById('carouselCategoriesBootstrap2'), {
      interval: 5000,
      wrap: true
    });
  
    // Pour les cartes de recettes
    /*const cards = document.querySelectorAll('.carte');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Ne pas déclencher si on clique sur le bouton like
        if (!e.target.closest('.btn-like')) {
          window.location.href = 'consulter-recette.html';
        }
      });
    });
  });
  document.querySelector(".btn-charger").addEventListener("click", function () {
    window.location.href = "creationRecettes.html";
  });*/


    // Event listener for logout button
    logoutButton.addEventListener('click', function () {
        sessionStorage.removeItem('identifiant'); // Clear identifiant from sessionStorage
        sessionStorage.removeItem('motDePasse'); // Clear motDePasse from sessionStorage
        window.location.href = 'index.html'; // Redirect to login page
    });

    //Mettre à jour la liste des recettes en fonction du filtre sélectionné
    document.querySelectorAll('.categorie').forEach(categorie => {
        categorie.addEventListener('click', function (){
            
            let valeurDiv = categorie.querySelector('.texte-categorie').textContent.trim();
            const typeAutorise = ['Déjeuner', 'Dîner', 'Souper', 'Collation', 'Apéritif', 'Entrée', 'Plat principal', 'Dessert'];
            const restrictionAutorise = ['Végétarien','Végan','Sans gluten','Sans lactose', 'Pescatarien', 'Favoris'];

            // Modifier la valeur du filtre et arrêter l'exécution si la valeur n'est pas reconnue
            if(typeAutorise.includes(valeurDiv)){
                filtreType = valeurDiv;
            }else if(restrictionAutorise.includes(valeurDiv)){
                filtreRestriction = valeurDiv;
            }else if(valeurDiv === 'Aucune'){
                filtreRestriction = 'miennes';
            }else if(valeurDiv === 'Voir tout'){
                filtreType = 'tout';
            }else{
                return;
            }

            // Mettre à jour la liste des recettes en fonction des filtres sélectionnés
            updateListeRecettesActuel(filtreType, filtreRestriction);
        });
    });

    /**
     * Méthode pour générer la nouvelle liste des recettes en fonctions des filtres données.
     * @param {String} filtreType Le nom du filtre du type de la recette
     * @param {String} filtreRestriction Le nom du filtre de la restriction de la recette
     */
    async function updateListeRecettesActuel(filtreType, filtreRestriction) {
        event.preventDefault();

        //Plannifier le message d'erreur
        const grilleRecettes = document.getElementById('contenant-recettes');
        grilleRecettes.innerHTML = '';
        
        //Chercher la liste des recettes
        let dataJSON = {identifiant: IDENTIFIANT, motDePasse: MOT_DE_PASSE, filtreType: filtreType, filtreRestriction: filtreRestriction};
        fetch('./api/CreationRecettes.php/recuperer-recettes-filtrer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataJSON)
        })
        .then(response => response.json())
        .then(data => {
            if(data.statut === 'success'){
                //vérifier si on a des éléments dans la liste des recettes
                let listeRecettesActuel = data.listeRecette;
                MSG_ERREUR.textContent = "";

                if(!(filtreRestriction === 'miennes')){
                    listeRecettesActuel = data.listeRecette.filter((recette) => recette.createur_nom_utilisateur === IDENTIFIANT);
                }
                if(listeRecettesActuel.length === 0){
                    MSG_ERREUR.textContent = "Aucune recette trouvée avec les filtres sélectionnés.";
                }
                //filtrer selon le texte inscrit dans la bare de recherche
                genereItemsRecettes(listeRecettesActuel, data.listeRecetteAime);
            }else{
                MSG_ERREUR.textContent = data.message + " Lors de l'intialisation des recettes";
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
     * Gènère les éléments d'une recette abrégé dans la grille des recettes.
     * @param {Array} nouvelleListeRecette La liste des recettes à afficher
     * @param {Array} listeRecetteAime La liste des recettes aimées par l'utilisateur
     */
    function genereItemsRecettes(nouvelleListeRecette, listeRecetteAime){
        // Vider la liste actuelle
        const grilleRecettes = document.getElementById('contenant-recettes');
        grilleRecettes.innerHTML = '';

        // Créer les nouveaux éléments de recette
        nouvelleListeRecette.forEach(recette =>{
            const carte = document.createElement('div');
            carte.className = 'carte';
            //Rediriger vers la page des détails des recettes 
            carte.addEventListener('click', () => {
                window.location.href = 'consulter-recette.html?id=' + recette.id;
            });

            //Créer le bouton coeur (il sera remplie si il est aimé)
            const button = document.createElement('button');
            if(listeRecetteAime.includes(recette.id)){
                button.className = 'coeur aime';
            }else{
                button.className = 'coeur';
            }
            //Ajouter le like et faire la requête à la base de données 
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Empêche la propagation au parent (carte)
                button.classList.toggle('aime');
                let ajouterLike = false;
                if(button.classList.contains('aime')){
                    ajouterLike = true;
                }
                ajouterRetirerLike(recette.id, ajouterLike);
            });
            button.innerHTML = '<i class="fas fa-heart"></i>';

            //Créer l'image de la recette
            const image = document.createElement('img');
            image.src = `data:image/jpeg;base64,${recette.image}`;
            image.alt = recette.nom;
            image.className = 'image-carte';

            //Créer les informations de la recette
            const contenuCarte = document.createElement('div');
            contenuCarte.className = 'contenu-carte';
            const titre = document.createElement('h3');
            titre.textContent = recette.nom;
            const description = document.createElement('p');
            description.textContent = imageType(recette.type) + ' ' + recette.type + ' · ' + recette.temps_de_cuisson + ' min';
            description.className = 'info-carte';


            //Ajouter les éléments 
            contenuCarte.appendChild(titre);
            contenuCarte.appendChild(description);

            carte.appendChild(button);
            carte.appendChild(image);
            carte.appendChild(contenuCarte);
            grilleRecettes.appendChild(carte);
        });
    }

    /**
     * Obtenir l'image coorespondant au type de la recette.
     * @param {String} typeRecette Le type de la recette
     * @returns l'image coorespondant au type de la recette
     */
    async function ajouterRetirerLike(idRecette, ajouterLike) {

        event.preventDefault();
        let dataJSON = {identifiant: IDENTIFIANT, motDePasse: MOT_DE_PASSE, idRecette: idRecette};

        if(ajouterLike){
            //lancer une demande pour ajouter un like
            fetch('./api/CreationRecettes.php/ajouter-recette-aime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataJSON)
            })
            .then(response => response.json())
            .then(data => {
                if(data.statut === 'success'){

                } else {
                    MSG_ERREUR.textContent = data.message;
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
        }else{

            //lancer une demande pour retirer un like
            fetch('./api/CreationRecettes.php/delete-recette-aime', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataJSON)
            })
            .then(response => response.json())
            .then(data => {
                if(data.statut === 'success'){

                } else {
                    MSG_ERREUR.textContent = data.message;
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
    }

    /**
     * Obtenir l'image coorespondant au type de la recette.
     * @param {String} typeRecette Le type de la recette
     * @returns l'image coorespondant au type de la recette
     */
    function imageType(typeRecette){
        switch(typeRecette){
            case 'Déjeuner': return '🍳';
            case 'Dîner': return '🍝';
            case 'Souper': return '🍲';
            case 'Collation': return '🧃';
            case 'Apéritif': return '🍙';
            case 'Entrée': return '🥗';
            case 'Plat principal': return '🍛';
            case 'Dessert': return '🍰';
            default: return '🥪';
        }
    }
    
});
document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logoutButton');
    const MSG_ERREUR = document.getElementById('message-erreur'); 

    // Get identifiant and motDePasse from sessionStorage
    const IDENTIFIANT = sessionStorage.getItem('identifiant');
    const MOT_DE_PASSE = sessionStorage.getItem('motDePasse');

    let filtreType = 'tout';
    let filtreRestriction = 'tout';
    let listeRecettesActuel = [];

    // Check if user is logged in (identifiant and motDePasse are in sessionStorage)
    if (!IDENTIFIANT || !MOT_DE_PASSE) {
        window.location.href = 'index.html'; // Redirect to login page if not logged in
        return;
    }

    //Initialiser la liste des recettes initiale 
    updateListeRecettesActuel(filtreType, filtreRestriction);


    /*Ajouter l'intérections sur les composants*/

    // Initialisation du carrousel Bootstrap
    const carousel = new bootstrap.Carousel(document.getElementById('carouselCategoriesBootstrap'), {
        interval: 5000, // temps entre les slides en ms
        wrap: true
    });
    
    // Pour les cartes de recettes
    const cards = document.querySelectorAll('.carte');
    cards.forEach(card => {
        card.addEventListener('click', () => {
        window.location.href = 'consulter-recette.html'; 
        });
    });
    
    // Pour les boutons coeur
    document.querySelectorAll('.coeur').forEach(btn => {
        btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêche la propagation au parent (carte)
        btn.classList.toggle('aime');
        });
    });

    new bootstrap.Carousel(document.getElementById('carouselCategoriesBootstrap2'), {
        interval: 5000,
        wrap: true
    });

    // Event listener for logout button
    logoutButton.addEventListener('click', function () {
        sessionStorage.removeItem('identifiant'); // Clear identifiant from sessionStorage
        sessionStorage.removeItem('motDePasse'); // Clear motDePasse from sessionStorage
        window.location.href = 'index.html'; // Redirect to login page
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
                genereItemsRecettes(data.listeRecette);
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
     */
    function genereItemsRecettes(nouvelleListeRecette){
        // Vider la liste actuelle
        const grilleRecettes = document.getElementById('contenant-recettes');
        grilleRecettes.innerHTML = '';

        // Créer les nouveaux éléments de recette
        nouvelleListeRecette.forEach(recette =>{
            const carte = document.createElement('div');
            carte.className = 'carte';

            const button = document.createElement('button');
            button.className = 'coeur';
            button.innerHTML = '<i class="fas fa-heart"></i>';

            const image = document.createElement('img');
            image.src = `data:image/jpeg;base64,${recette.image}`;
            image.alt = recette.nom;
            image.className = 'image-carte';

            const contenuCarte = document.createElement('div');
            contenuCarte.className = 'contenu-carte';
            const titre = document.createElement('h3');
            titre.textContent = recette.nom;
            const description = document.createElement('p');
            description.textContent = imageType(recette.type) + ' ' + recette.type + ' · ' + recette.temps_de_cuisson + ' min';
            description.className = 'info-carte';

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
    function imageType(typeRecette){
        switch(typeRecette){
            case 'Déjeuner': return '🍙';
            case 'Dîner': return '🥪';
            case 'Souper': return '🍜';
            case 'Collation': return '🍪';
            case 'Apéritif': return '🍷';
            case 'Entrée': return '🍴';
            case 'Plat principal': return '🍽️';
            case 'Dessert': return '🍰';
            default: return '🥪';
        }
    }
    
});
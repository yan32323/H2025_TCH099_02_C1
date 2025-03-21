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
                    alert("Réusssit à l'optention du contenu du stock");
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
});
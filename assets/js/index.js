document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('pageAccueil');
    const loginErrorDiv = document.getElementById('loginError');
    const loginSuccessDiv = document.getElementById('loginSuccess');
    const identifiantInput = document.getElementById('identifiant');

    // Autofill identifiant from sessionStorage if available
    if (sessionStorage.getItem('autofill_identifiant')) {
        identifiantInput.value = sessionStorage.getItem('autofill_identifiant');
        sessionStorage.removeItem('autofill_identifiant'); // Clear after use
    }

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission

        const identifiant = document.getElementById('identifiant').value;
        const motDePasse = document.getElementById('motDePasse').value;

        // Clear previous error/success messages
        loginErrorDiv.textContent = '';
        loginSuccessDiv.textContent = '';

        // Prepare data for API request
        const formData = {identifiant: identifiant, motDePasse: motDePasse};

        // Make API request to /api/login (we'll create this API endpoint next)
        await fetch('./api/login.php/login/', { // Assuming your API files will be in an 'api' folder
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Or 'application/json' if you prefer JSON
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.statut === 'success') {
                    loginSuccessDiv.textContent = 'Connexion réussie!';
                    
                    // Redirect to forum page after a short delay for success message to be seen
                    setTimeout(() => {
                        sessionStorage.setItem("identifiant", identifiant);
                        sessionStorage.setItem("motDePasse", motDePasse);
                        window.location.href = 'accueil-recette.html';
                    }, 1000); // 1 second delay
                } else {
                    loginErrorDiv.textContent = data.message || 'Identifiant ou mot de passe incorrect.';
                }
            })
            .catch(error => {
                console.error('Erreur de connexion:', error);
                loginErrorDiv.textContent = 'Erreur de connexion au serveur.';
            });
    });
});
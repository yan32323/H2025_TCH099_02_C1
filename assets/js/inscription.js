document.addEventListener('DOMContentLoaded', function () {
    const inscriptionForm = document.getElementById('inscriptionForm');
    const inscriptionErrorDiv = document.getElementById('inscriptionError');
    const inscriptionSuccessDiv = document.getElementById('inscriptionSuccess');
    const passwordInput = document.getElementById('motDePasse');
    const passwordConfirmInput = document.getElementById('motDePasseConfirmation');
    const passwordValidationErrorDiv = document.getElementById('passwordValidationError');

    inscriptionForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        const identifiant = document.getElementById('identifiant').value;
        const motDePasse = passwordInput.value;

        // Clear previous error/success messages
        inscriptionErrorDiv.textContent = '';
        inscriptionSuccessDiv.textContent = '';
        passwordValidationErrorDiv.textContent = '';

        // Client-side password validation (same rules as server-side)
        const passwordErrors = [];
        if (motDePasse.length < 8 || motDePasse.length > 32) {
            passwordErrors.push("Le mot de passe doit contenir entre 8 et 32 caractères.");
        }
        if (!/[A-Z]/.test(motDePasse)) {
            passwordErrors.push("Le mot de passe doit contenir au moins une majuscule.");
        }
        if (!/[a-z]/.test(motDePasse)) {
            passwordErrors.push("Le mot de passe doit contenir au moins une minuscule.");
        }
        if (!/[0-9]/.test(motDePasse)) {
            passwordErrors.push("Le mot de passe doit contenir au moins un chiffre.");
        }

        if (motDePasse !== passwordConfirmInput.value) {
            passwordErrors.push("Les mots de passe ne correspondent pas.");
        }

        if (passwordErrors.length > 0) {
            passwordValidationErrorDiv.textContent = passwordErrors.join(" "); // Display all errors
            return; // Stop further processing
        }


        // Prepare data for API request
        const formData = {identifiant: identifiant, motDePasse: motDePasse};

        // Make API request to /api/inscription.php (or /api/users - POST)
        
        fetch('./api/inscription.php/inscrire/', { // Adjust API endpoint if needed
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.statut === 'success') {
                    inscriptionSuccessDiv.textContent = 'Inscription réussie. Veuillez vous connecter.';
                    // Autofill username on login page after successful registration
                    sessionStorage.setItem('autofill_identifiant', identifiant);
                    // Redirect to login page after a delay
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500); // 1.5 second delay
                } else {
                    inscriptionErrorDiv.textContent = data.message || 'Erreur lors de l\'inscription.';
                }
            })
            .catch(error => {
                console.error('Erreur d\'inscription:', error);
                inscriptionErrorDiv.textContent = 'Erreur de connexion au serveur.';
            });
    });
});
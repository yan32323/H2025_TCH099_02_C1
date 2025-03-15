document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logoutButton');

    // Get identifiant and motDePasse from sessionStorage
    const IDENTIFIANT = sessionStorage.getItem('identifiant');
    const MOT_DE_PASSE = sessionStorage.getItem('motDePasse');

    // Check if user is logged in (identifiant and motDePasse are in sessionStorage)
    if (!IDENTIFIANT || !MOT_DE_PASSE) {
        window.location.href = 'index.html'; // Redirect to login page if not logged in
        return;
    }

    // Event listener for logout button
    logoutButton.addEventListener('click', function () {
        sessionStorage.removeItem('identifiant'); // Clear identifiant from sessionStorage
        sessionStorage.removeItem('motDePasse'); // Clear motDePasse from sessionStorage
        window.location.href = 'index.html'; // Redirect to login page
    });
});
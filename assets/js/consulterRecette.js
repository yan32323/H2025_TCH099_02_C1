document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recetteId = urlParams.get("id");

    if (!recetteId) {
        alert("Aucune recette spécifiée.");
        return;
    }

    fetch(
        `http://localhost/planigo/H2025_TCH099_02_C1/api/consulterRecette.php?id=${recetteId}`
    )
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                afficherRecette(data.recette);
            } else {
                alert("Erreur : " + data.message);
            }
        })
        .catch((error) => {
            console.error("Erreur réseau :", error);
            alert("Erreur lors du chargement de la recette.");
        });
});

function afficherRecette(recette) {
    // Affichage des détails de la recette
    document.querySelector(".recipe-title").textContent = recette.nom;
    document.querySelector(".author-name").textContent =
        recette.createur.nom + " " + recette.createur.prenom;
    document.querySelector(".author-date").textContent = recette.date_creation;
    document.querySelector(".time-value").textContent =
        recette.temps_preparation + " minutes";
    document.querySelector(".recipe-description").textContent =
        recette.description;
    document.querySelector(".recipe-category").textContent = recette.type;

    if (recette.image) {
        const imageEl = document.querySelector(".recipe-main-image");
        imageEl.style.backgroundImage = `url('data:image/jpeg;base64,${recette.image}')`;
        imageEl.style.backgroundSize = "cover";
        imageEl.style.backgroundPosition = "center";
    }

    // Affichage des ingrédients
    const ingredientsSection = document.querySelector(".ingredients-section");
    ingredientsSection.innerHTML =
        '<h3 class="section-title ingredients-title">Ingrédients</h3>';
    recette.ingredients.forEach((ingredient) => {
        const item = document.createElement("div");
        item.classList.add("ingredient-item-wrapper", "checkbox-list");

        item.innerHTML = `
            <label class="checkbox-ingredient">
                <input type="checkbox">
                <span>${ingredient.nom} - ${ingredient.quantite} ${ingredient.unite}</span>
            </label>
            <hr class="ingredient-divider">
        `;

        ingredientsSection.appendChild(item);
    });

    // Affichage des étapes
    const stepsSection = document.querySelector(".directions-section");
    stepsSection.innerHTML =
        '<h3 class="section-title directions-title">Étapes</h3>';
    recette.etapes.forEach((etape, index) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("direction-step-wrapper");

        wrapper.innerHTML = `
            <div class="direction-step">
                <div class="step-number" data-number="${index + 1}">${
            index + 1
        }</div>
                <h4 class="step-title">${etape.titre}</h4>
                <p class="step-description">${etape.description}</p>
                ${
                    etape.image
                        ? `<div class="step-image direction-image-square" style="background-image: url('data:image/jpeg;base64,${etape.image}'); background-size: cover; background-position: center;"></div>`
                        : ""
                }
            </div>
        `;
        stepsSection.appendChild(wrapper);
    });

    // Affichage des commentaires
    const commentsSection = document.querySelector(".comments-section");
    commentsSection.innerHTML =
        '<h3 class="section-title comments-title">Commentaires</h3>';

    if (
        Array.isArray(recette.commentaires) &&
        recette.commentaires.length > 0
    ) {
        recette.commentaires.forEach((commentaire) => {
            const commentWrapper = document.createElement("div");
            commentWrapper.classList.add("comment-item");

            commentWrapper.innerHTML = `
                <div class="comment-author">${commentaire.nom} ${
                commentaire.prenom
            }</div>
                <div class="comment-text">${commentaire.texte}</div>
                <div class="comment-date">${new Date(
                    commentaire.date_commentaire
                ).toLocaleString()}</div>
            `;

            commentsSection.appendChild(commentWrapper);
        });
    } else {
        commentsSection.innerHTML +=
            "<p>Aucun commentaire pour cette recette.</p>";
    }

    // Ajouter un formulaire de commentaire
    const commentFormWrapper = document.createElement("div");
    commentFormWrapper.classList.add("comment-form-wrapper");
    commentFormWrapper.innerHTML = `
        <div class="comment-form" style="display: none;">
            <textarea id="comment-text" placeholder="Écrivez votre commentaire ici..."></textarea>
            <button id="submit-comment">Envoyer</button>
        </div>
    `;
    commentsSection.appendChild(commentFormWrapper);

    // Bouton pour afficher le formulaire de commentaire
    const addCommentButton = document.createElement("button");
    addCommentButton.classList.add("comment-button", "add-comment-button");
    addCommentButton.textContent = "Ajouter un commentaire";

    addCommentButton.addEventListener("click", () => {
        const form = document.querySelector(".comment-form");
        form.style.display = "block"; // Afficher le formulaire
        addCommentButton.style.display = "none"; // Cacher le bouton "Ajouter un commentaire"
    });

    commentsSection.appendChild(addCommentButton);

    // Soumettre le commentaire
    const submitCommentButton = document.querySelector("#submit-comment");
    submitCommentButton.addEventListener("click", async () => {
        const commentText = document.querySelector("#comment-text").value;
    
        if (commentText.trim()) {
            const data = {
                recette_id: recette.id, // ou recetteId si tu préfères
                commentaire: commentText
            };
    
            try {
                const response = await fetch('http://localhost/planigo/H2025_TCH099_02_C1/api/ajouterCommentaire.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
    
                // Pour affichage brut de la réponse du serveur (debug)
                let text = await response.text();
                console.log("Réponse brute du serveur :", text);
    
                // Re-tenter d'interpréter comme JSON
                let result;
                try {
                    result = JSON.parse(text);
                } catch (e) {
                    alert("Réponse du serveur invalide.");
                    return;
                }
    
                if (result.success) {
                    const newComment = document.createElement("div");
                    newComment.classList.add("comment-item");
                    newComment.innerHTML = `
                        <div class="comment-author">Vous</div>
                        <div class="comment-text">${commentText}</div>
                        <div class="comment-date">${new Date().toLocaleString()}</div>
                    `;
                    commentsSection.insertBefore(newComment, commentFormWrapper);
    
                    document.querySelector("#comment-text").value = "";
                    document.querySelector(".comment-form").style.display = "none";
                    addCommentButton.style.display = "block";
                } else {
                    alert("Erreur serveur : " + result.message);
                }
            } catch (error) {
                console.error("Erreur réseau :", error);
                alert("Erreur lors de l'envoi du commentaire.");
            }
        }
    });
    
}

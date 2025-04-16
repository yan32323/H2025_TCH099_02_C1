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
                const userId = data.user_id;
                afficherRecette(data.recette, userId);
            } else {
                alert("Erreur : " + data.message);
            }
        })
        .catch((error) => {
            console.error("Erreur réseau :", error);
            alert("Erreur lors du chargement de la recette.");
        });
});

function afficherRecette(recette, userId) {
    // Affichage des détails de la recette
    document.querySelector(".recipe-title").textContent = recette.nom;
    const authorNameElement = document.querySelector(".author-name");
    authorNameElement.textContent = recette.createur.prenom + " " + recette.createur.nom;

    authorNameElement.addEventListener("click", () => {
            window.location.href = `page_profil.html?user=${recette.createur.nom_utilisateur}`; // Redirection vers la page du profil
        });
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

    if (Array.isArray(recette.commentaires) && recette.commentaires.length > 0) {
        const sessionUserId = recette.utilisateur_connecte;

recette.commentaires.forEach((commentaire) => {
    const commentWrapper = document.createElement("div");
    commentWrapper.classList.add("comment-item", "commentaire");
    commentWrapper.setAttribute("data-id-commentaire", commentaire.id);

    // Si c’est l’auteur, afficher "Vous" à la place du nom
    const isAuthor = sessionUserId && commentaire.id_utilisateur == sessionUserId;

    let commentHtml = `
        <div class="comment-author">${isAuthor ? "Vous" : commentaire.prenom + " " + commentaire.nom}</div>
        <div class="comment-text">${commentaire.texte}</div>
        <div class="comment-date">${new Date(commentaire.date_commentaire).toLocaleString()}</div>`;

    // Ajouter le bouton j'aime si ce n'est pas l'auteur
    const hasLiked = commentaire.a_deja_like;
    const shouldDisable = isAuthor || hasLiked;

    commentHtml += `
        <button class="like-button" ${shouldDisable ? "disabled" : ""} style="${shouldDisable ? "opacity: 0.5; cursor: not-allowed;" : ""}">
            ❤️ J'aime (<span class="like-count">${commentaire.nb_likes || 0}</span>)
        </button>`;

    commentWrapper.innerHTML = commentHtml;

    const likeButton = commentWrapper.querySelector(".like-button");

    if (!shouldDisable) {
        likeButton.addEventListener("click", async () => {
            const idCommentaire = commentaire.id;

            try {
                const response = await fetch("http://localhost/planigo/H2025_TCH099_02_C1/api/likeCommentaire.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: `id_commentaire=${idCommentaire}`,
                });

                const text = await response.text();
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    alert("Erreur : réponse invalide du serveur.");
                    return;
                }

                if (data.success) {
                    const countSpan = likeButton.querySelector(".like-count");
                    countSpan.textContent = parseInt(countSpan.textContent) + 1;
                    likeButton.disabled = true;
                    likeButton.style.opacity = "0.5";
                    likeButton.style.cursor = "not-allowed";
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error("Erreur lors du like :", error);
                alert("Erreur lors de l'envoi du like.");
            }
        });
    }

    commentsSection.appendChild(commentWrapper);
});

        
    } else {
    commentsSection.innerHTML += "<p>Aucun commentaire pour cette recette.</p>";
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
                recette_id: recette.id,
                commentaire: commentText,
            };

            try {
                const response = await fetch(
                    "http://localhost/planigo/H2025_TCH099_02_C1/api/ajouterCommentaire.php",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(data),
                    }
                );

                // Pour debug
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
                    commentsSection.insertBefore(
                        newComment,
                        commentFormWrapper
                    );

                    document.querySelector("#comment-text").value = "";
                    document.querySelector(".comment-form").style.display =
                        "none";
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

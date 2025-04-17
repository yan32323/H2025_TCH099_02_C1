//TODO : CLEAN_UP CODE
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recetteId = urlParams.get("id");

    if (!recetteId) {
        alert("Aucune recette spécifiée.");
        return;
    }

    fetch(`http://localhost/planigo/H2025_TCH099_02_C1/api/consulterRecette.php?id=${recetteId}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                console.log("Données de la recette :", data);
                const userId = data.user_id;
                afficherRecette(data.recette, userId);
            } else {
                alert("Erreur : " + data.message);
                console.log(data);
            }
        })
        .catch((error) => {
            console.error("Erreur réseau :", error);
            alert("Erreur lors du chargement de la recette.");
        });
});

function afficherRecette(recette, userId) {
    // Affichage des détails
    document.getElementById("recipe-title").textContent = recette.nom;

    const authorNameElement = document.getElementById("author-name");
    authorNameElement.textContent = recette.createur.prenom + " " + recette.createur.nom;
    authorNameElement.addEventListener("click", () => {
        window.location.href = `page_profil.html?user=${recette.createur.nom_utilisateur}`;
    });
    document.getElementById("time-value").textContent = recette.temps_preparation + " minutes";
    document.getElementById("recipe-description").textContent = recette.description;
    document.getElementById("recipe-category").textContent = recette.type;

    if (recette.image) {
        const imageEl = document.getElementById("recipe-main-image");
        imageEl.style.backgroundImage = `url('data:image/jpeg;base64,${recette.image}')`;
        imageEl.style.backgroundSize = "cover";
        imageEl.style.backgroundPosition = "center";
    }



// Section des Ingrédients
const ingredientsSection = document.getElementById("ingredients-section");
ingredientsSection.innerHTML = '<h3 class="section-title ingredients-title"></h3>';

recette.ingredients.forEach((ingredient) => {
    const item = document.createElement("div");
    item.classList.add("ingredient-item-wrapper", "checkbox-list");

    item.innerHTML = `
        <label class="ingredient-item">
            <input type="checkbox" class="ingredient-checkbox">
            <span>${ingredient.nom} - ${ingredient.quantite} ${ingredient.unite}</span>
        </label>
    `;

    ingredientsSection.appendChild(item);
});



    // Étapes
const stepsSection = document.getElementById("directions-section");
stepsSection.innerHTML = ''; // Nettoyer les anciennes étapes (HTML statique)

const ol = document.createElement("ol");
ol.classList.add("liste", "instructions");

recette.etapes.forEach((etape, index) => {
    const li = document.createElement("li");

    const titre = "";
    const description = etape.description || "";

    li.innerHTML = `${titre}${description}`;

    ol.appendChild(li);
});

stepsSection.appendChild(ol);



    // Commentaires
    const commentsSection = document.getElementById("comments-section");
    commentsSection.innerHTML = '<h3 class="section-title comments-title">Commentaires</h3>';

    if (Array.isArray(recette.commentaires) && recette.commentaires.length > 0) {
        const sessionUserId = recette.utilisateur_connecte;

        recette.commentaires.forEach((commentaire) => {
            const commentWrapper = document.createElement("div");
            commentWrapper.classList.add("comment-item", "commentaire");
            commentWrapper.setAttribute("data-id-commentaire", commentaire.id);

            const isAuthor = sessionUserId && commentaire.id_utilisateur == sessionUserId;

            let commentHtml = `
                <div class="comment-author">${isAuthor ? "Vous" : commentaire.prenom + " " + commentaire.nom}</div>
                <div class="comment-text">${commentaire.texte}</div>
                <div class="comment-date">${new Date(commentaire.date_commentaire).toLocaleString()}</div>
            `;

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
                    try {
                        const response = await fetch("http://localhost/planigo/H2025_TCH099_02_C1/api/likeCommentaire.php", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                            body: `id_commentaire=${commentaire.id}`,
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

    // Formulaire de commentaire
    const commentFormWrapper = document.createElement("div");
    commentFormWrapper.innerHTML = `
        <div id="comment-form" style="display: none;">
            <textarea id="comment-text" placeholder="Écrivez votre commentaire ici..."></textarea>
            <button id="submit-comment">Envoyer</button>
        </div>
    `;
    commentsSection.appendChild(commentFormWrapper);

    const addCommentButton = document.createElement("button");
    addCommentButton.id = "add-comment-button";
    addCommentButton.textContent = "Ajouter un commentaire";

    addCommentButton.addEventListener("click", () => {
        const form = document.getElementById("comment-form");
        form.style.display = "block";
        addCommentButton.style.display = "none";
    });

    commentsSection.appendChild(addCommentButton);

    document.getElementById("submit-comment").addEventListener("click", async () => {
        const commentText = document.getElementById("comment-text").value;

        if (commentText.trim()) {
            const data = {
                recette_id: recette.id,
                commentaire: commentText,
            };

            try {
                const response = await fetch("http://localhost/planigo/H2025_TCH099_02_C1/api/ajouterCommentaire.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                let text = await response.text();
                console.log("Réponse brute du serveur :", text);

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

                    document.getElementById("comment-text").value = "";
                    document.getElementById("comment-form").style.display = "none";
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

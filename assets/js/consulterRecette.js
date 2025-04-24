document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const recetteId = urlParams.get("id");

    if (!recetteId) {
        alert("Aucune recette spécifiée.");
        return;
    }

    // Récupérer les données utilisateur de sessionStorage
    const utilisateurId = sessionStorage.getItem("identifiant");
    const utilisateurMotDePasse = sessionStorage.getItem("motDePasse");

    if (!utilisateurId || !utilisateurMotDePasse) {
        alert("Vous devez être connecté pour interagir avec cette recette.");
        window.location.href = 'index.html'; // Redirige vers la page de connexion si pas connecté
        return;
    }

    consulterNotifications(utilisateurId);

    fetch("./api/consulterRecette.php/afficher", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: recetteId,
            nom_utilisateur: utilisateurId
        })
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            afficherRecette(data.recette, data.user_id);
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

function afficherNoteMoyenne(noteSur5, nbVotes) {
    const etoilesContainer = document.getElementById("etoiles-container");
    const nbVotesElement = document.getElementById("nb-votes");

    etoilesContainer.innerHTML = "";
    if (nbVotes === 0) {
        etoilesContainer.classList.add("etoiles-grisees");
    } else {
        etoilesContainer.classList.remove("etoiles-grisees");
    }

    for (let i = 1; i <= 5; i++) {
        if (noteSur5 >= i) {
            etoilesContainer.innerHTML += '<i class="fas fa-star"></i>';
        } else if (noteSur5 >= i - 0.5) {
            etoilesContainer.innerHTML += '<i class="fas fa-star-half-alt"></i>';
        } else {
            etoilesContainer.innerHTML += '<i class="far fa-star"></i>';
        }
    }

    nbVotesElement.textContent = `(${nbVotes})`;
}

function afficherRecette(recette, userId) {
    // Stocker l'ID utilisateur en sessionStorage pour les commentaires et actions

    document.getElementById("recipe-title").textContent = recette.nom;
    afficherNoteMoyenne(recette.moyenne_note, recette.nombre_votes);

    if (recette.a_vote) {
        document.getElementById("ajouter-note-btn").style.display = "none";
    }

    // Author details
    const authorNameElement = document.getElementById("author-name");
    authorNameElement.textContent =
        recette.createur.prenom + " " + recette.createur.nom;
    authorNameElement.addEventListener("click", () => {
        window.location.href = `page-profil.html?user=${recette.createur.nom_utilisateur}`;
    });

    document.getElementById("time-value").textContent =
        recette.temps_preparation + " minutes";
    document.getElementById("recipe-description").textContent =
        recette.description;
    document.getElementById("recipe-category").textContent = recette.difficulte;

    if (recette.image) {
        const imageEl = document.querySelector("#recipe-main-image img");
        imageEl.src = `data:image/jpeg;base64,${recette.image}`;
    }

    // Ingrédients section
    const ingredientsSection = document.getElementById("ingredients-section");
    ingredientsSection.innerHTML = ""; // Nettoyer les anciens ingrédients
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
    stepsSection.innerHTML = ""; // Nettoyer les anciennes étapes

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

    // Comments section
    const commentsSection = document.getElementById("comments-section");
    commentsSection.innerHTML =
        '<h3 class="section-title comments-title">Commentaires</h3>';

    commentsSection.style.maxHeight = "300px";
    commentsSection.style.overflowY = "auto";
    commentsSection.style.paddingRight = "10px";

    if (Array.isArray(recette.commentaires) && recette.commentaires.length > 0) {
        const sessionUserId = userId;
        recette.commentaires.forEach((commentaire) => {
            const commentWrapper = document.createElement("div");
            commentWrapper.classList.add("commentaire");
            commentWrapper.style.borderBottom = "1px solid #ccc";
            commentWrapper.style.padding = "0.5rem 0";

            let commentHtml = `
                <div class="comment-author" style="font-weight: bold; margin-bottom: 0.25rem;">
                    ${commentaire.id_utilisateur === sessionUserId ? "Vous" : commentaire.prenom + " " + commentaire.nom}
                </div>
                <div class="comment-text" style="margin-bottom: 0.25rem;">
                    ${commentaire.texte}
                </div>
                <div class="comment-date" style="font-size: 0.8rem; color: #666;">
                    ${new Date(commentaire.date_commentaire).toLocaleString()}
                </div>
            `;

            const hasLiked = commentaire.a_deja_like;
            const shouldDisable = commentaire.id_utilisateur === sessionUserId || hasLiked;

            commentHtml += `
                <button class="like-button" ${shouldDisable ? "disabled" : ""} 
                    style="margin-top: 0.5rem; background-color: #e74c3c; color: white; border: none; padding: 0.3rem 0.7rem; border-radius: 5px; cursor: ${shouldDisable ? "not-allowed" : "pointer"}; opacity: ${shouldDisable ? "0.5" : "1"};">
                    ❤️ J'aime (<span class="like-count">${commentaire.nb_likes || 0}</span>)
                </button>
            `;

            commentWrapper.innerHTML = commentHtml;

            const likeButton = commentWrapper.querySelector(".like-button");

            if (!shouldDisable) {
                likeButton.addEventListener("click", async () => {
                    try {
                        const response = await fetch(
                            "./api/consulterRecette.php/likeCommentaire",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },
                                body: JSON.stringify({id_commentaire: commentaire.id, user_id: sessionStorage.getItem("identifiant")})
                            }
                        );

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
                            countSpan.textContent =
                                parseInt(countSpan.textContent) + 1;
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
        commentsSection.innerHTML +=
            "<p style='margin-top: 0.5rem;'>Aucun commentaire pour cette recette.</p>";
    }

    // Comment form
    const commentFormWrapper = document.createElement("div");
    commentFormWrapper.classList.add("comment-form-wrapper");
    commentFormWrapper.innerHTML = `
        <textarea id="commentaire-textarea" placeholder="Laissez un commentaire" style="width: 100%; padding: 0.5rem;"></textarea>
        <button id="commentaire-btn" style="margin-top: 0.5rem; background-color: #3498db; color: white; border: none; padding: 0.3rem 0.7rem; border-radius: 5px; cursor: pointer;">
            Ajouter un commentaire
        </button>
    `;

    commentsSection.appendChild(commentFormWrapper);

    document.getElementById("commentaire-btn").addEventListener("click", () => {
        const textarea = document.getElementById("commentaire-textarea");
        const commentaireText = textarea.value.trim();

        if (commentaireText === "") {
            alert("Veuillez entrer un commentaire.");
            return;
        }

        const userId = sessionStorage.getItem("identifiant");

        fetch("./api/consulterRecette.php/ajouterCommentaire", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                recette_id: recette.id,
                nom_utilisateur: userId,
                commentaire: commentaireText,
            })
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert("Commentaire ajouté avec succès!");
                    window.location.reload();
                } else {
                    alert("Erreur lors de l'ajout du commentaire.");
                }
            })
            .catch((error) => {
                console.error("Erreur réseau :", error);
                alert("Erreur lors de l'ajout du commentaire.");
            });
    });

    let noteChoisie = 0;
    document
        .getElementById("ajouter-note-btn")
        .addEventListener("click", () => {
            document.getElementById("popup-note").style.display = "flex";
        });

    // Gestion clic sur étoiles
    document.querySelectorAll("#etoiles-selection .star").forEach((star) => {
        star.addEventListener("click", () => {
            noteChoisie = parseInt(star.dataset.value);

            document
                .querySelectorAll("#etoiles-selection .star")
                .forEach((s) => {
                    s.classList.toggle(
                        "active",
                        parseInt(s.dataset.value) <= noteChoisie
                    );
                });
        });
    });

    document
        .getElementById("annuler-note-btn")
        .addEventListener("click", () => {
            document.getElementById("popup-note").style.display = "none";
        });

    document
        .getElementById("valider-note-btn")
        .addEventListener("click", async () => {
            if (noteChoisie < 1 || noteChoisie > 5) {
                alert("Veuillez sélectionner une note entre 1 et 5.");
                return;
            }

            try {
                const response = await fetch(
                    "./api/consulterRecette.php/ajouterNote",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/JSON",
                        },
                        body: JSON.stringify({
                            recette_id: recette.id,
                            note: noteChoisie,
                            nom_utilisateur: sessionStorage.getItem("identifiant"),
                        }),
                    }
                );

                const text = await response.text();
                let data;

                try {
                    data = JSON.parse(text);
                } catch (e) {
                    alert("Réponse invalide du serveur.");
                    return;
                }

                if (data.success) {
                    alert("Merci pour votre note !");
                    document.getElementById("ajouter-note-btn").style.display =
                        "none";
                    document.getElementById("popup-note").style.display =
                        "none";

                    afficherNoteMoyenne(
                        data.nouvelle_moyenne,
                        data.nouveau_nombre_votes
                    );
                } else {
                    alert("Erreur : " + data.message);
                }
            } catch (error) {
                console.error("Erreur réseau :", error);
                alert("Impossible d'envoyer la note.");
            }
        });
}
function consulterNotifications(userId) {
    fetch("./api/consulterNotifications.php/afficher", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: userId,
        }),
    })
        .then((response) => response.text())
        .then((text) => {
            //console.log("Réponse brute:", text); // Afficher la réponse brute dans la console
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    afficherNotifications(data.notifications);
                } else {
                    //alert("Erreur : " + data.message);
                }
            } catch (e) {
                console.error("Erreur de parsing JSON:", e);
            }
        })
        .catch((error) => {
            console.error(
                "Erreur lors de la récupération des notifications :",
                error
            );
        });
}
// Fonction pour afficher les notifications
function afficherNotifications(notifications) {
    const notificationList = document.querySelector(".notification-list");
    notificationList.innerHTML = ""; // Réinitialiser la liste de notifications

    notifications.forEach((notification) => {
        const notificationItem = document.createElement("div");
        notificationItem.classList.add("notification-item");

        // Ajout de l'attribut data-id pour cibler la notification
        notificationItem.setAttribute("data-id", notification.id); 

        if (notification.est_lue === 0) {
            notificationItem.classList.add("unread");
        }

        // Ajoute le contenu de la notification
        notificationItem.innerHTML = `
        <div class="notification-item-flex">
            <div class="notification-icon">
                <i class="fas fa-utensils"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.message}</div>
                <div class="notification-time">${notification.date_creation}</div>
            </div>
        </div>
    `;

        // Ajout d'un gestionnaire de clic pour marquer comme lue
        notificationItem.addEventListener("click", () => {
            marquerNotificationLue(notification.id);
        });

        notificationList.appendChild(notificationItem);
    });
    updateNotificationBadge();
}


// Fonction pour marquer une notification comme lue
function marquerNotificationLue(notificationId) {
    fetch("./api/consulterNotifications.php/marquerNotificationLue", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: notificationId }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Mettre à jour l'interface (enlève la classe 'unread' et met à jour le badge)
                const notificationItem = document.querySelector(
                    `.notification-item[data-id="${notificationId}"]`
                );
                if (notificationItem) {
                    notificationItem.classList.remove("unread");
                }

                // Mise à jour du badge de notification non lue
                updateNotificationBadge();
            } else {
                alert("Erreur lors de la mise à jour de la notification.");
            }
        });
}
// Fonction pour mettre à jour le badge de notification avec le nombre de notifications non lues
function updateNotificationBadge() {
    fetch("./api/consulterNotifications.php/nombre-Notifications-non-lue", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: sessionStorage.getItem("identifiant"),
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                const notificationBadge = document.querySelector(".notification-badge");
                const unreadCount = data.unreadCount;

                if (typeof unreadCount === 'number' && unreadCount > 0) {
                    notificationBadge.textContent = unreadCount;
                    notificationBadge.style.display = "block";
                } else {
                    notificationBadge.style.display = "none";
                }
            }
        })
        .catch((error) => console.error("Erreur:", error));
}

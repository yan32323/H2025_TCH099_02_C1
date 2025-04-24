document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("user");
    const idConnecte = sessionStorage.getItem("identifiant");
    const MOT_DE_PASSE = sessionStorage.getItem("motDePasse");
    
    const DIV_CONTENEUR_PLAN = document.getElementById('conteneur-plan-hebdomadaire');
    const MSG_ERREUR = document.getElementById('message-erreur');
    
    if (!userId && !idConnecte) {
      alert("Aucun utilisateur spécifié.");
      return;
    } else if (!userId) {
      window.location.href = `page-profil.html?user=${idConnecte}`;
    }

    updateNotificationBadge();
    consulterNotifications(userId);
  
    // Récupération des données utilisateur
    fetchData('./api/profil.php/afficher', {
      user: userId,
      nom_utilisateur: sessionStorage.getItem("identifiant"),
    })
    .then(data => {
      if (data.success) {
        afficheProfil(data.profil);
      } else {
        alert("Erreur : " + data.message);
      }
    })
    .catch(error => console.error("Erreur réseau :", error));
  
    // Récupération des plans
    fetchData('./api/CreationPlans.php/recuperer-plant-personnel/', {
      identifiant: idConnecte,
      motDePasse: MOT_DE_PASSE
    })
    .then(data => {
      if (data.statut === 'success' && data.listePlans.length > 0) {
        afficherPlans(data.listePlans);
      } else {
        MSG_ERREUR.textContent = "Aucun plan trouvé pour cet utilisateur.";
      }
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des plans :", error);
      MSG_ERREUR.textContent = "Erreur inattendue. Veuillez réessayer.";
    });
  
    function fetchData(url, bodyData) {
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      })
      .then(response => response.json());
    }
  
    function afficherPlans(plans) {
      DIV_CONTENEUR_PLAN.innerHTML = '';
      plans.forEach(plan => {
        const planDiv = document.createElement('div');
        planDiv.classList.add('plan-hebdo');
    
        const titre = document.createElement('h3');
        titre.textContent = plan.titre;
    
        const desc = document.createElement('p');
        desc.textContent = plan.descriptions;
    
        const image = document.createElement('img');
        image.src = plan.image || 'assets/image/semaine-gourmande.jpg';  // image par défaut si pas d'image
        image.alt = plan.titre;
        image.classList.add('image-plan');
    
        const bouton = document.createElement('button');
        bouton.textContent = "Voir ce plan";
        bouton.addEventListener('click', function () {
          window.location.href = `plan.html?id=${plan.id}`;
        });
    
        planDiv.appendChild(image);
        planDiv.appendChild(titre);
        planDiv.appendChild(desc);
        planDiv.appendChild(bouton);
        DIV_CONTENEUR_PLAN.appendChild(planDiv);
      });
    }
  
    function afficheProfil(profilData) {
      const profil = profilData.utilisateur;
      const recettes = profilData.recettes;
      const idConnecte = sessionStorage.getItem("identifiant");
  
      document.querySelector(".profile-name").textContent = `${profil.prenom} ${profil.nom}`;
      document.querySelector(".profile-bio").textContent = profil.description || "Aucune description.";
    
      const modifierBtn = document.getElementById("modifier-profil-btn");
      const titre = document.getElementById("titre-profil");
      const suivreBtn = document.getElementById("suivre-profil-btn");
  
      if (profil.nom_utilisateur !== idConnecte) {
        titre.textContent = "Profil de " + profil.nom_utilisateur;
        modifierBtn.style.display = "none";
        suivreBtn.style.display = "inline-block";
  
        // Vérifie si l'utilisateur est déjà suivi
        fetchData('./api/profil.php/suivre-user', {
          action: "verifier_suivi",
          suivi_id: profil.nom_utilisateur,
          nom_utilisateur: idConnecte,
        })
        .then(data => {
          if (data.suivi) {
            suivreBtn.textContent = "Suivi";
            suivreBtn.disabled = true;
          } else {
            suivreBtn.textContent = "Suivre";
            suivreBtn.disabled = false;
          }
        });
  
        // Suivre un utilisateur
        suivreBtn.addEventListener("click", () => {
          fetchData('./api/profil.php/suivre-user', {
            action: "ajouter_suivi",
            suivi_id: profil.nom_utilisateur,
            nom_utilisateur: idConnecte,
          })
          .then(result => {
            if (result.success) {
              suivreBtn.textContent = "Suivi";
              suivreBtn.disabled = true;
            } else {
              alert("Erreur : " + result.message);
            }
          });
        });
      } else {
        modifierBtn.style.display = "inline-block";
      }
  
      // Mettre à jour le nombre de recettes
      document.querySelector("#nbRecetteStat .stat-number").textContent = profilData.recettes.length;
  
      // Mettre à jour le nombre d'abonnés et abonnements
      fetchData('./api/profil.php/nb-abonne-nb-abonnement', {
        user: profil.nom_utilisateur
      })
      .then(stats => {
        if (stats.success) {
          document.querySelector("#nbAbonneStat .stat-number").textContent = formatNombre(stats.nb_abonnes);
          document.querySelector("#nbAbonnementStat .stat-number").textContent = formatNombre(stats.nb_abonnements);
        } else {
          console.error("Erreur lors de la récupération des stats :", stats);
        }
      })
      .catch(err => console.error("Erreur réseau stats :", err));
  
      // Affichage des recettes
      const grid = document.querySelector(".recipe-grid");
      grid.innerHTML = "";
  
      if (recettes.length === 0) {
        const noRecipeMessage = document.createElement("div");
        noRecipeMessage.classList.add("no-recipes-message");
        noRecipeMessage.textContent = "Aucune recette publiée";
        grid.appendChild(noRecipeMessage);
      } else {
        recettes.forEach((recette) => {
          const card = document.createElement("div");
          card.classList.add("recipe-card");
          card.style.cursor = "pointer";
  
          const image = recette.image
              ? `data:image/jpeg;base64,${recette.image}`
              : "assets/image/image_tmp_recette.png";
  
          card.innerHTML = `
            <img src="${image}" alt="${recette.nom}">
            <div class="recipe-content">
              <div class="recipe-title">${recette.nom}</div>
              <div class="recipe-info">
                <div class="recipe-time">30 Minutes</div>
                <div class="recipe-type">Santé</div>
              </div>
            </div>
          `;
  
          card.addEventListener("click", () => {
            window.location.href = `consulter-recette.html?id=${recette.id}`;
          });
  
          grid.appendChild(card);
        });
      }
    }
  
    function formatNombre(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
      if (n >= 1000) return (n / 1000).toFixed(1) + "k";
      return n;
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
    
  });
  
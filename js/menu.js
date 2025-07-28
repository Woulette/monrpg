// Afficher le menu au chargement
window.addEventListener('DOMContentLoaded', function() {
  const menu = document.getElementById('game-menu');
  const playBtn = document.getElementById('play-btn');
  const nameInput = document.getElementById('player-name-input');
  const menuPlayerName = document.getElementById('menu-player-name');
  const menuBtn = document.getElementById('game-menu-btn');
  const avatarOptions = document.querySelectorAll('.menu-avatar-option');
  const nameForm = document.getElementById('menu-name-form');
  const profileMenu = document.getElementById('profile-menu');
  const profileAvatar = document.getElementById('profile-avatar');
  const profileName = document.getElementById('profile-name');
  const profileLevel = document.getElementById('profile-level');
  const profilePlayBtn = document.getElementById('profile-play-btn');
  const deleteCharacterX = document.getElementById('delete-character-x');
  const deleteConfirmOverlay = document.getElementById('delete-confirm-overlay');
  const deleteConfirmYes = document.getElementById('delete-confirm-yes');
  const deleteConfirmNo = document.getElementById('delete-confirm-no');
  const toCreationBtn = document.getElementById('to-creation-btn');
  const toProfileBtn = document.getElementById('to-profile-btn');
  const profileLevelValue = document.getElementById('profile-level-value');

  // Empêcher le scroll
  document.body.classList.add('menu-active');
  menuBtn.style.display = 'none';
  
  // Vérifier s'il y a une sauvegarde existante
  if (typeof hasSave === 'function' && hasSave()) {
    // Il y a une sauvegarde, afficher directement le menu de sélection
    if(profileMenu && profileAvatar && profileName && profileLevel) {
      profileMenu.style.display = 'flex';
      menu.style.display = 'none';
      
             // Charger les infos du personnage depuis la sauvegarde
       const saveData = localStorage.getItem('monrpg_save');
       if (saveData) {
         try {
           const data = JSON.parse(saveData);
           
           // Récupérer le nom et l'avatar depuis la sauvegarde
           if (data.character) {
             window.playerName = data.character.name;
             window.playerAvatar = data.character.avatar;
           } else {
             // Fallback si pas d'infos de personnage
             window.playerName = 'Mon Personnage';
             window.playerAvatar = 'assets/personnages/player.png';
           }
           
           profileAvatar.src = window.playerAvatar;
           profileName.textContent = window.playerName;
           profileLevelValue.textContent = data.player ? data.player.level : '1';
           
           // Mettre à jour le texte du bouton Continuer
           if (typeof getContinueButtonText === 'function') {
             profilePlayBtn.textContent = getContinueButtonText();
           }
         } catch (error) {
           console.error('Erreur lors du chargement des infos de sauvegarde:', error);
         }
       }
    }
  } else {
    // Pas de sauvegarde, afficher le menu de création
    menu.style.display = 'flex';
    nameForm.style.display = 'none';
    menuPlayerName.textContent = '\u00A0';
    if(profileMenu) profileMenu.style.display = 'none';
  }

  let selectedAvatar = null;

  // Sélection d'avatar
  avatarOptions.forEach(img => {
    img.addEventListener('click', function() {
      avatarOptions.forEach(i => i.style.borderColor = 'transparent');
      img.style.borderColor = '#ffd952';
      selectedAvatar = img.getAttribute('data-avatar');
      window.playerAvatar = selectedAvatar;
      nameForm.style.display = 'flex';
      nameInput.focus();
    });
  });

  // Affichage du nom en temps réel
  nameInput.addEventListener('input', function() {
    menuPlayerName.textContent = nameInput.value.trim() || '\u00A0';
  });

  // Créer le personnage
  playBtn.addEventListener('click', function() {
    const name = nameInput.value.trim();
    if (!selectedAvatar) {
      alert('Sélectionne d\'abord un personnage !');
      return;
    }
    if (!name) {
      nameInput.style.borderColor = '#ff4e4e';
      nameInput.focus();
      return;
    }
    
    // Réinitialiser l'inventaire et le joueur pour un nouveau personnage
    if (typeof resetInventory === 'function') {
      resetInventory();
      console.log('🆕 Inventaire réinitialisé pour le nouveau personnage');
    }
    if (typeof resetPlayer === 'function') {
      resetPlayer();
      console.log('🆕 Joueur réinitialisé pour le nouveau personnage');
    }
    
    window.playerName = name;
    
    // Afficher directement le menu de profil
    showProfileMenu();
  });

  // Sélection de l'avatar dans le menu de profil
  if(profileAvatar && profilePlayBtn) {
    profileAvatar.addEventListener('click', function() {
      profileAvatar.classList.add('selected');
      profilePlayBtn.disabled = false;
    });
  }

  // Bouton Continuer du menu de jeu/profil
  if(profilePlayBtn) {
    profilePlayBtn.addEventListener('click', function() {
      if (profilePlayBtn.disabled) return;
      
      // Essayer de charger une sauvegarde existante
      if (typeof loadGame === 'function') {
        const loaded = loadGame();
        if (loaded) {
          console.log('Partie chargée depuis le menu');
        } else {
          console.log('Aucune sauvegarde trouvée, démarrage d\'une nouvelle partie');
          // Afficher le dialogue de bienvenue de Papi pour une nouvelle partie
          setTimeout(() => {
            if (typeof showCharacterCreationDialog === 'function') {
              showCharacterCreationDialog();
            }
          }, 1000); // Délai de 1 seconde après le démarrage
        }
      }
      
      profileMenu.style.display = 'none';
      document.body.classList.remove('menu-active');
      menuBtn.style.display = 'block';
    });
  }

  // Fonction pour afficher le menu de profil
  function showProfileMenu() {
    if(profileMenu && profileAvatar && profileName && profileLevel) {
      menu.style.display = 'none';
      profileMenu.style.display = 'flex';
      document.body.classList.add('menu-active');
      profileAvatar.src = window.playerAvatar;
      profileName.textContent = window.playerName;
      // Affichage dynamique du niveau
      if (typeof player !== 'undefined' && player.level) {
        profileLevelValue.textContent = player.level;
      } else {
        profileLevelValue.textContent = '1';
      }
      profileAvatar.classList.remove('selected');
      profilePlayBtn.disabled = true;
      
      // Mettre à jour le texte du bouton Continuer avec l'info de sauvegarde
      if (typeof getContinueButtonText === 'function') {
        profilePlayBtn.textContent = getContinueButtonText();
      }
    }
  }

  // Croix rouge pour suppression
  if(deleteCharacterX && deleteConfirmOverlay) {
    deleteCharacterX.addEventListener('click', function() {
      deleteConfirmOverlay.style.display = 'flex';
    });
  }
  // Confirmation suppression : Oui
  if(deleteConfirmYes) {
    deleteConfirmYes.addEventListener('click', function() {
      // Supprimer la sauvegarde du personnage
      if (typeof deleteSave === 'function') {
        deleteSave();
        console.log('🗑️ Sauvegarde supprimée lors de la suppression du personnage');
      }
      
      // Réinitialiser l'inventaire et l'équipement
      if (typeof resetInventory === 'function') {
        resetInventory();
        console.log('🗑️ Inventaire réinitialisé lors de la suppression du personnage');
      }
      
      // Réinitialiser le joueur
      if (typeof resetPlayer === 'function') {
        resetPlayer();
        console.log('🗑️ Joueur réinitialisé lors de la suppression du personnage');
      }
      
      // Réinitialiser les infos du personnage
      window.playerName = undefined;
      window.playerAvatar = undefined;
      selectedAvatar = null;
      // Réinitialiser le menu de création
      avatarOptions.forEach(i => i.style.borderColor = 'transparent');
      nameForm.style.display = 'none';
      nameInput.value = '';
      menuPlayerName.textContent = '\u00A0';
      // Fermer tout et afficher le menu de création
      deleteConfirmOverlay.style.display = 'none';
      profileMenu.style.display = 'none';
      menu.style.display = 'flex';
      document.body.classList.add('menu-active');
      menuBtn.style.display = 'none';
      updateToProfileBtnVisibility();
    });
  }
  // Confirmation suppression : Non
  if(deleteConfirmNo) {
    deleteConfirmNo.addEventListener('click', function() {
      deleteConfirmOverlay.style.display = 'none';
    });
  }

  // Bouton Menu en jeu
  menuBtn.addEventListener('click', function() {
    // Si un personnage existe, afficher le menu de jeu/profil
    if(window.playerName && window.playerAvatar && profileMenu && profileAvatar && profileName && profileLevel) {
      profileMenu.style.display = 'flex';
      document.body.classList.add('menu-active');
      menuBtn.style.display = 'none';
      profileAvatar.src = window.playerAvatar;
      profileName.textContent = window.playerName;
      // Affichage dynamique du niveau
      if (typeof player !== 'undefined' && player.level) {
        profileLevelValue.textContent = player.level;
      } else {
        profileLevelValue.textContent = '1';
      }
      profileAvatar.classList.remove('selected');
      profilePlayBtn.disabled = true;
      
      // Mettre à jour le texte du bouton Continuer avec l'info de sauvegarde
      if (typeof getContinueButtonText === 'function') {
        profilePlayBtn.textContent = getContinueButtonText();
      }
      
      if(deleteConfirmOverlay) deleteConfirmOverlay.style.display = 'none';
      // Afficher le bouton retour si un personnage existe
      if (window.playerName && window.playerAvatar) {
        toProfileBtn.style.display = 'block';
      } else {
        toProfileBtn.style.display = 'none';
      }
    } else {
      // Sinon, afficher le menu de création
      menu.style.display = 'flex';
      document.body.classList.add('menu-active');
      menuBtn.style.display = 'none';
      // Rétablir l'état précédent
      avatarOptions.forEach(i => i.style.borderColor = 'transparent');
      nameForm.style.display = 'none';
      nameInput.value = '';
      menuPlayerName.textContent = '\u00A0';
      selectedAvatar = null;
      nameInput.focus();
      updateToProfileBtnVisibility();
    }
  });

  // Bouton porte de sortie : retour à la création depuis le menu de profil
  if(toCreationBtn) {
    toCreationBtn.addEventListener('click', function() {
      profileMenu.style.display = 'none';
      menu.style.display = 'flex';
      document.body.classList.add('menu-active');
      menuBtn.style.display = 'none';
      // Afficher le bouton retour si un personnage existe
      if (window.playerName && window.playerAvatar) {
        toProfileBtn.style.display = 'block';
      } else {
        toProfileBtn.style.display = 'none';
      }
    });
  }

  // Bouton porte de sortie : retour au menu de profil depuis la création
  if(toProfileBtn) {
    toProfileBtn.addEventListener('click', function() {
      menu.style.display = 'none';
      profileMenu.style.display = 'flex';
      document.body.classList.add('menu-active');
      menuBtn.style.display = 'none';
      profileAvatar.src = window.playerAvatar;
      profileName.textContent = window.playerName;
      if (typeof player !== 'undefined' && player.level) {
        profileLevelValue.textContent = player.level;
      } else {
        profileLevelValue.textContent = '1';
      }
      profileAvatar.classList.remove('selected');
      profilePlayBtn.disabled = true;
    });
  }

  // Afficher/cacher le bouton retour dans le menu de création selon qu'un personnage existe
  function updateToProfileBtnVisibility() {
    if (toProfileBtn) {
      if (window.playerName && window.playerAvatar) {
        toProfileBtn.style.display = 'block';
      } else {
        toProfileBtn.style.display = 'none';
      }
    }
  }
  // Appeler au chargement
  updateToProfileBtnVisibility();

  // Appeler aussi après suppression du personnage
  if(deleteConfirmYes) {
    deleteConfirmYes.addEventListener('click', function() {
      updateToProfileBtnVisibility();
    });
  }

  // Quand le joueur gagne un niveau, mettre à jour le menu de profil si ouvert
  window.addEventListener('playerLevelUp', function() {
    if (profileMenu.style.display === 'flex' && profileLevelValue) {
      profileLevelValue.textContent = player.level;
    }
  });
});

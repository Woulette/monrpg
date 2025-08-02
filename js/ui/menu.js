// ===== SYSTÈME DE GESTION MULTI-PERSONNAGES =====

// État global du jeu
window.gameState = "menu"; // "menu", "creation", "playing"
window.characterSlots = [null, null, null, null, null]; // 5 slots de personnages
window.currentCharacterSlot = null; // Slot actuellement sélectionné

// Variables pour les éléments DOM (seront initialisées dans DOMContentLoaded)
let characterSelectionMenu;
let characterCreationMenu;
let deleteConfirmMenu;
let loadingScreen;
let gameMenuBtn;

// ===== INITIALISATION =====
window.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Initialisation du système multi-personnages...');
    
    // Initialiser les éléments DOM
    characterSelectionMenu = document.getElementById('character-selection-menu');
    characterCreationMenu = document.getElementById('character-creation-menu');
    deleteConfirmMenu = document.getElementById('delete-confirm-menu');
    loadingScreen = document.getElementById('loading-screen');
    gameMenuBtn = document.getElementById('game-menu-btn');
    
    // Vérifier que tous les éléments sont trouvés
    if (!characterSelectionMenu || !characterCreationMenu || !deleteConfirmMenu || !loadingScreen || !gameMenuBtn) {
        console.error('❌ Éléments DOM manquants pour le menu multi-personnages');
        return;
    }
    
    // Empêcher le scroll
    document.body.classList.add('menu-active');
    gameMenuBtn.style.display = 'none';
    
    // Cacher le bouton multijoueur aussi
    const multiplayerBtn = document.getElementById('multiplayer-btn');
    if (multiplayerBtn) {
        multiplayerBtn.style.display = 'none';
    }
    
    // Charger les personnages sauvegardés
    loadCharacterSlots();
    
    // Afficher le menu de sélection
    showCharacterSelectionMenu();
    
    // Initialiser les événements
    initializeEvents();
});

// ===== GESTION DES PERSONNAGES =====

// Charger les personnages depuis localStorage
function loadCharacterSlots() {
    console.log('📂 Chargement des slots de personnages...');
    
    try {
        const savedSlots = localStorage.getItem('monrpg_character_slots');
        if (savedSlots) {
            window.characterSlots = JSON.parse(savedSlots);
            console.log('✅ Slots chargés:', window.characterSlots);
        } else {
            console.log('🆕 Aucun slot sauvegardé, initialisation avec des slots vides');
            window.characterSlots = [null, null, null, null, null];
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement des slots:', error);
        window.characterSlots = [null, null, null, null, null];
    }
}

// Sauvegarder les personnages dans localStorage
function saveCharacterSlots() {
    try {
        localStorage.setItem('monrpg_character_slots', JSON.stringify(window.characterSlots));
        console.log('💾 Slots sauvegardés');
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde des slots:', error);
    }
}

// Créer un nouveau personnage
function createCharacter(slotIndex, name, avatar) {
    console.log(`👤 Création du personnage ${name} dans le slot ${slotIndex}`);
    
    const character = {
        id: Date.now() + Math.random(),
        name: name,
        avatar: avatar,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        life: 100,
        maxLife: 100,
        // Stats de base
        baseForce: 1,
        baseIntelligence: 1,
        baseAgilite: 1,
        baseDefense: 1,
        baseChance: 1,
        baseVitesse: 1,
        baseVie: 1,
        // Stats de combat
        combatForce: 0,
        combatIntelligence: 0,
        combatAgilite: 0,
        combatDefense: 0,
        combatChance: 0,
        combatVitesse: 0,
        combatVie: 0,
        // Stats d'équipement
        equipForce: 0,
        equipIntelligence: 0,
        equipAgilite: 0,
        equipDefense: 0,
        equipChance: 0,
        equipVitesse: 0,
        equipVie: 0,
        // Stats totales
        force: 1,
        intelligence: 1,
        agilite: 1,
        defense: 1,
        chance: 1,
        vitesse: 1,
        vie: 1,
        // XP des stats
        forceXp: 0,
        intelligenceXp: 0,
        agiliteXp: 0,
        defenseXp: 0,
        chanceXp: 0,
        vitesseXp: 0,
        // Points et monnaie
        statPoints: 0,
        pecka: 0,
        // Position de départ
        x: 25,
        y: 12,
        px: 25 * 32,
        py: 12 * 32,
        spawnX: 25,
        spawnY: 12,
        // Autres propriétés
        direction: 0,
        frame: 0,
        moving: false,
        moveTarget: { x: 25, y: 12 },
        path: [],
        inCombat: false,
        lastCombatTime: 0,
        lastRegenTime: 0,
        autoFollow: false,
        isDead: false,
        deathTime: 0,
        respawnTime: 30000,
        // Date de création
        createdAt: Date.now(),
        lastPlayed: Date.now()
    };
    
    // Sauvegarder dans le slot
    window.characterSlots[slotIndex] = character;
    saveCharacterSlots();
    
    console.log('✅ Personnage créé et sauvegardé');
    
    // Réinitialiser les quêtes pour le nouveau personnage
    if (typeof window.resetQuestsToInitial === 'function') {
        window.resetQuestsToInitial();
        console.log('🔄 Quêtes réinitialisées pour le nouveau personnage');
    }
    
    // Réinitialiser l'inventaire pour le nouveau personnage
    if (typeof window.resetInventory === 'function') {
        window.resetInventory();
        console.log('🔄 Inventaire réinitialisé pour le nouveau personnage');
    }
    
    // Forcer la réinitialisation complète de toutes les données
    if (typeof window.forceResetAllQuests === 'function') {
        window.forceResetAllQuests();
        console.log('🔄 Toutes les données de quêtes réinitialisées');
    }
    
    // Réinitialiser le joueur global
    if (typeof window.resetPlayer === 'function') {
        window.resetPlayer();
        console.log('🔄 Joueur global réinitialisé');
    }
    
    // Réinitialiser les propriétés des PNJ
    if (typeof window.resetPNJProperties === 'function') {
        window.resetPNJProperties();
        console.log('🔄 Propriétés des PNJ réinitialisées');
    }
    
    // Démarrer automatiquement le jeu avec le nouveau personnage
    startGame(slotIndex);
    
    return character;
}

// Supprimer un personnage
function deleteCharacter(slotIndex) {
    console.log(`🗑️ Suppression du personnage du slot ${slotIndex}`);
    
    if (window.characterSlots[slotIndex]) {
        const character = window.characterSlots[slotIndex];
        
        console.log(`🗑️ Suppression de toutes les données pour le personnage ${character.name} (ID: ${character.id})`);
        
        // Supprimer toutes les données liées à ce personnage
        localStorage.removeItem(`monrpg_save_${character.id}`);
        localStorage.removeItem(`monrpg_monsters_${character.id}`);
        localStorage.removeItem(`monrpg_crowKillCounts_${character.id}`);
        localStorage.removeItem(`monrpg_inventory_${character.id}`);
        localStorage.removeItem(`monrpg_quests_${character.id}`);
        
        // Supprimer l'inventaire via la fonction dédiée
        if (typeof window.deleteInventoryForCharacter === 'function') {
            window.deleteInventoryForCharacter(character.id);
        }
        
        // Supprimer les quêtes via la fonction dédiée
        if (typeof window.deleteQuestsForCharacter === 'function') {
            window.deleteQuestsForCharacter(character.id);
        }
        
        // Nettoyer les données de monstres pour toutes les maps
        if (typeof window.clearAllMonsterData === 'function') {
            window.clearAllMonsterData();
        }
        
        // Vider le slot
        window.characterSlots[slotIndex] = null;
        saveCharacterSlots();
        
        console.log('✅ Personnage et toutes ses données supprimés complètement');
        return true;
    }
    
    return false;
}

// ===== AFFICHAGE DES MENUS =====

// Afficher le menu de sélection
function showCharacterSelectionMenu() {
    console.log('🎮 Affichage du menu de sélection');
    
    gameState = "menu";
    characterSelectionMenu.style.display = 'flex';
    characterCreationMenu.style.display = 'none';
    deleteConfirmMenu.style.display = 'none';
    loadingScreen.style.display = 'none';
    
    // Désactiver les systèmes de jeu
    if (typeof window.disableGameSystems === 'function') {
        window.disableGameSystems();
    }
    
    // Mettre à jour l'affichage des slots
    updateCharacterSlotsDisplay();
}

// Afficher le menu de création
function showCharacterCreationMenu(slotIndex) {
    console.log(`🎮 Affichage du menu de création pour le slot ${slotIndex}`);
    
    gameState = "creation";
    window.currentCharacterSlot = slotIndex;
    
    characterSelectionMenu.style.display = 'none';
    characterCreationMenu.style.display = 'flex';
    deleteConfirmMenu.style.display = 'none';
    loadingScreen.style.display = 'none';
    
    // Désactiver les systèmes de jeu
    if (typeof window.disableGameSystems === 'function') {
        window.disableGameSystems();
    }
    
    // Réinitialiser le formulaire
    resetCreationForm();
}

// Afficher l'écran de chargement
function showLoadingScreen() {
    console.log('⏳ Affichage de l\'écran de chargement');
    
    loadingScreen.style.display = 'flex';
    characterSelectionMenu.style.display = 'none';
    characterCreationMenu.style.display = 'none';
    deleteConfirmMenu.style.display = 'none';
}

// Mettre à jour l'affichage des slots
function updateCharacterSlotsDisplay() {
    const slots = document.querySelectorAll('.character-slot');
    
    slots.forEach((slot, index) => {
        const character = window.characterSlots[index];
        const slotContent = slot.querySelector('.slot-content');
        
        if (character) {
            // Slot avec personnage
            slot.classList.add('has-character');
            slotContent.innerHTML = `
                <div class="character-info">
                    <img class="character-avatar" src="${character.avatar}" alt="${character.name}" />
                    <div class="character-name">${character.name}</div>
                    <div class="character-level">Niveau ${character.level}</div>
                    <div class="character-playtime">${formatPlayTime(character.lastPlayed)}</div>
                </div>
                <button class="delete-character-btn" data-slot="${index}">×</button>
            `;
        } else {
            // Slot vide
            slot.classList.remove('has-character');
            slotContent.innerHTML = `
                <div class="slot-icon">+</div>
                <div class="slot-text">Créer un personnage</div>
            `;
        }
    });
}

// ===== GESTION DES ÉVÉNEMENTS =====

function initializeEvents() {
    // Gestion des clics sur les slots
    document.addEventListener('click', function(e) {
        const slot = e.target.closest('.character-slot');
        if (slot) {
            const slotIndex = parseInt(slot.dataset.slot);
            const character = window.characterSlots[slotIndex];
            
            // Vérifier si on a cliqué sur le bouton de suppression
            if (e.target.classList.contains('delete-character-btn')) {
                e.stopPropagation(); // Empêcher le déclenchement du clic sur le slot
                showDeleteConfirmation(slotIndex);
                return;
            }
            
            if (character) {
                // Personnage existant - ne rien faire au clic simple (seul le double-clic lance le jeu)
                return;
            } else {
                // Slot vide - créer un personnage
                showCharacterCreationMenu(slotIndex);
            }
        }
    });
    
    // Gestion des double-clics sur les slots
    document.addEventListener('dblclick', function(e) {
        const slot = e.target.closest('.character-slot');
        if (slot) {
            const slotIndex = parseInt(slot.dataset.slot);
            const character = window.characterSlots[slotIndex];
            
            if (character) {
                // Personnage existant - démarrer le jeu
                startGame(slotIndex);
            }
        }
    });
    
    // Gestion des boutons de formulaire
    const createCharacterBtn = document.getElementById('create-character-btn');
    const backToSelectionBtn = document.getElementById('back-to-selection-btn');
    const characterNameInput = document.getElementById('character-name-input');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    
    // Bouton de création
    if (createCharacterBtn) {
        createCharacterBtn.addEventListener('click', function() {
            console.log('🎯 Bouton de création cliqué');
            const name = characterNameInput.value.trim();
            const selectedAvatar = document.querySelector('.avatar-option.selected');
            
            console.log('📝 Nom saisi:', name);
            console.log('🖼️ Avatar sélectionné:', selectedAvatar);
            
            if (name && selectedAvatar) {
                const avatar = selectedAvatar.dataset.avatar;
                console.log('🎮 Création du personnage avec avatar:', avatar);
                createCharacter(window.currentCharacterSlot, name, avatar);
            } else {
                console.log('❌ Données manquantes pour la création');
                if (!name) console.log('❌ Nom manquant');
                if (!selectedAvatar) console.log('❌ Avatar non sélectionné');
            }
        });
    }
    
    // Bouton retour
    if (backToSelectionBtn) {
        backToSelectionBtn.addEventListener('click', function() {
            showCharacterSelectionMenu();
        });
    }
    
    // Sélection d'avatar
    avatarOptions.forEach(option => {
        option.addEventListener('click', function() {
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            updateCreateButton();
        });
    });
    
    // Input du nom
    if (characterNameInput) {
        characterNameInput.addEventListener('input', updateCreateButton);
        characterNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                createCharacterBtn.click();
            }
        });
    }
    
    // Boutons de confirmation de suppression
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const slotIndex = parseInt(this.dataset.slot);
            if (deleteCharacter(slotIndex)) {
                showCharacterSelectionMenu();
            }
        });
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function() {
            showCharacterSelectionMenu();
        });
    }
    
    // Bouton menu du jeu
    if (gameMenuBtn) {
        gameMenuBtn.addEventListener('click', function() {
            if (typeof window.returnToMenu === 'function') {
                window.returnToMenu();
            }
        });
    }
}

// ===== FONCTIONS UTILITAIRES =====

// Réinitialiser le formulaire de création
function resetCreationForm() {
    const nameInput = document.getElementById('character-name-input');
    const previewName = document.getElementById('preview-name');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    
    nameInput.value = '';
    previewName.textContent = '\u00A0';
    avatarOptions.forEach(a => a.classList.remove('selected'));
    
    updateCreateButton();
    nameInput.focus();
}

// Mettre à jour l'état du bouton de création
function updateCreateButton() {
    const nameInput = document.getElementById('character-name-input');
    const selectedAvatar = document.querySelector('.avatar-option.selected');
    const createBtn = document.getElementById('create-character-btn');
    const previewName = document.getElementById('preview-name');
    
    if (nameInput && previewName) {
        const name = nameInput.value.trim();
        previewName.textContent = name || '\u00A0';
        
        const hasAvatar = selectedAvatar !== null;
        
        if (createBtn) {
            createBtn.disabled = !name || !hasAvatar;
        }
    }
}

// Afficher la confirmation de suppression
function showDeleteConfirmation(slotIndex) {
    const character = window.characterSlots[slotIndex];
    if (!character) return;
    
    // Remplir les informations du personnage
    document.getElementById('confirm-avatar').src = character.avatar;
    document.getElementById('confirm-name').textContent = character.name;
    document.getElementById('confirm-level').textContent = `Niveau ${character.level}`;
    
    // Stocker le slot dans le bouton de confirmation
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.dataset.slot = slotIndex;
    }
    
    deleteConfirmMenu.style.display = 'flex';
}

// Formater le temps de jeu
function formatPlayTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
}

// Démarrer le jeu
function startGame(slotIndex) {
    console.log(`🎮 Démarrage du jeu avec le personnage du slot ${slotIndex}`);
    
    const character = window.characterSlots[slotIndex];
    if (!character) {
        console.error('❌ Aucun personnage trouvé dans ce slot');
        return;
    }
    
    // Mettre à jour le temps de dernière connexion
    character.lastPlayed = Date.now();
    saveCharacterSlots();
    
    // Afficher l'écran de chargement
    showLoadingScreen();
    
    // Initialiser le jeu après un délai
    setTimeout(() => {
        initializeGame(character);
    }, 1500);
}

// Sauvegarder le personnage actuel
function saveCurrentCharacter(character) {
    try {
        const saveData = {
            timestamp: Date.now(),
            characterId: character.id,
            player: character,
            gameState: {
                currentMap: "map1",
                lastSaveTime: Date.now()
            },
            quests: {
                crowHunt: { accepted: false, completed: false, readyToComplete: false },
                crowCraft: { accepted: false, completed: false, readyToComplete: false },
                slimeBoss: { accepted: false, completed: false, readyToComplete: false },
                slimeBossFinal: { accepted: false, completed: false, readyToComplete: false }
            }
        };
        
        localStorage.setItem(`monrpg_save_${character.id}`, JSON.stringify(saveData));
        
        // Sauvegarder l'inventaire séparément
        if (typeof window.saveInventoryForCharacter === 'function') {
            window.saveInventoryForCharacter(character.id);
        }
        
        // Sauvegarder les quêtes séparément
        if (typeof window.saveQuestsForCharacter === 'function') {
            window.saveQuestsForCharacter(character.id);
        }
        
        console.log('💾 Personnage sauvegardé pour le jeu');
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde du personnage:', error);
    }
}

// Initialiser le jeu
function initializeGame(character) {
    console.log('🎮 Initialisation du jeu...');
    
    // Définir les variables globales
    window.playerName = character.name;
    window.playerAvatar = character.avatar;
    window.currentCharacterId = character.id;
    
    // Réinitialiser les quêtes pour ce personnage spécifique
    console.log('🔄 Réinitialisation des quêtes pour le nouveau personnage...');
    if (typeof window.switchCharacterQuests === 'function') {
        window.switchCharacterQuests(character.id);
    } else {
        // Fallback vers l'ancienne méthode
        if (typeof window.resetQuestsToInitial === 'function') {
            window.resetQuestsToInitial();
        }
        if (typeof window.loadQuestsForCharacter === 'function') {
            window.loadQuestsForCharacter(character.id);
        }
    }
    
    // Réinitialiser le compteur de corbeaux pour ce personnage
    console.log('🔄 Réinitialisation du compteur de corbeaux pour le nouveau personnage...');
    if (typeof window.resetCrowKillCounts === 'function') {
        window.resetCrowKillCounts();
    }
    
    // Passer en mode jeu
    gameState = "playing";
    
    // Masquer tous les menus
    characterSelectionMenu.style.display = 'none';
    characterCreationMenu.style.display = 'none';
    deleteConfirmMenu.style.display = 'none';
    loadingScreen.style.display = 'none';
    
    // Retirer la classe menu-active
    document.body.classList.remove('menu-active');
    
    // Afficher le bouton menu
    gameMenuBtn.style.display = 'block';
    
    // Afficher le bouton multijoueur
    const multiplayerBtn = document.getElementById('multiplayer-btn');
    if (multiplayerBtn) {
        multiplayerBtn.style.display = 'block';
        
        // Gestion du clic sur le bouton multijoueur
        multiplayerBtn.onclick = () => {
            if (window.multiplayerManager && !window.multiplayerManager.connected) {
                // Activer le multijoueur
                enableMultiplayer();
                multiplayerBtn.textContent = 'Multijoueur ON';
                multiplayerBtn.style.background = '#f44336';
            } else if (window.multiplayerManager && window.multiplayerManager.connected) {
                // Désactiver le multijoueur
                disableMultiplayer();
                multiplayerBtn.textContent = 'Multijoueur OFF';
                multiplayerBtn.style.background = '#4CAF50';
            }
        };
    }
    
    // Activer les systèmes de jeu
    if (typeof window.enableGameSystems === 'function') {
        window.enableGameSystems();
    }
    
    // LANCER VRAIMENT LE JEU maintenant
    console.log('🚀 Lancement complet du jeu...');
    
    // Initialiser tous les systèmes de jeu
    if (typeof window.startGameDirectly === 'function') {
        window.startGameDirectly();
    } else {
        console.error('❌ Fonction startGameDirectly non trouvée');
        // Fallback : charger directement
        if (typeof window.loadGame === 'function') {
            window.loadGame();
        }
    }
}

// ===== FONCTIONS EXPORTÉES =====

// Fonction pour retourner au menu (depuis le jeu)
window.returnToMenu = function() {
    console.log('🏠 Retour au menu principal - arrêt complet du jeu');
    
    // Sauvegarder l'état actuel si on est en jeu
    if (gameState === "playing" && window.currentCharacterId) {
        if (typeof window.autoSaveOnEvent === 'function') {
            window.autoSaveOnEvent();
        }
    }
    
    // Arrêter complètement le jeu
    gameState = "menu";
    
    // Nettoyer tous les effets de dégâts
    if (typeof window.clearAllDamageEffects === 'function') {
        window.clearAllDamageEffects();
    }
    
    // Masquer tous les éléments de jeu
    const gameElements = [
        'inventory-modal',
        'stats-modal',
        'quests-main-modal',
        'chat-window',
        'floating-chat',
        'gameCanvas'
    ];
    
    gameElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // Désactiver les systèmes de jeu
    if (typeof window.disableGameSystems === 'function') {
        window.disableGameSystems();
    }
    
    // Afficher le menu de sélection
    showCharacterSelectionMenu();
    
    console.log('✅ Jeu complètement arrêté, retour au menu');
};

// Fonction pour réinitialiser le dialogue de création
window.resetCharacterCreationDialog = function() {
    window.characterCreationDialogShown = false;
    console.log('🎮 Flag du dialogue de création de personnage réinitialisé');
};
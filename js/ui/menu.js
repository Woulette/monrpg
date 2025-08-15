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
let characterMenuInitialized = false;
const API_BASE = (typeof window.API_BASE_URL !== 'undefined') ? window.API_BASE_URL : (location.hostname === 'localhost' ? 'http://localhost:3001' : '/');

async function apiGetCharacters(){
    const t = localStorage.getItem('monrpg_token');
    const res = await fetch(API_BASE + '/characters', { headers: { 'Authorization': 'Bearer ' + t }});
    if (!res.ok) throw new Error('Erreur /characters');
    return res.json();
}

async function apiCreateCharacter(name, avatar){
    const t = localStorage.getItem('monrpg_token');
    const res = await fetch(API_BASE + '/characters', { method:'POST', headers: { 'Authorization': 'Bearer ' + t, 'Content-Type':'application/json' }, body: JSON.stringify({ name, avatar }) });
    if (res.status === 401) { throw new Error('401'); }
    if (!res.ok) throw new Error('Erreur création personnage');
    return res.json();
}

async function apiDeleteCharacter(id){
    const t = localStorage.getItem('monrpg_token');
    const res = await fetch(API_BASE + '/characters/'+id, { method:'DELETE', headers: { 'Authorization': 'Bearer ' + t }});
    if (res.status === 401) { throw new Error('401'); }
    if (!res.ok) throw new Error('Erreur suppression personnage');
    return res.json();
}

// ===== INITIALISATION =====
window.addEventListener('DOMContentLoaded', function() {
    
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
    
    // Ne pas initialiser automatiquement le menu personnages au chargement.
    // On laisse le module login gérer l'affichage: Login d'abord, puis onLoginSuccess() → menu personnages.
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.style.display = 'block';
    return;
});

// Appelé après un login réussi côté client
window.onLoginSuccess = function() {
    if (characterMenuInitialized) return;
    try {
        // Cacher l'écran de login si présent
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.style.display = 'none';
        // Charger et afficher le menu (attendre le chargement)
        (async () => {
            await loadCharacterSlots();
            showCharacterSelectionMenu();
            initializeEvents();
            characterMenuInitialized = true;
        })();
    } catch (e) {
        console.error('Erreur onLoginSuccess:', e);
    }
};

// Permettre au module login de réinitialiser l'init du menu après déconnexion
window.resetCharacterMenuInit = function(){ characterMenuInitialized = false; };

// ===== GESTION DES PERSONNAGES =====

// Charger les personnages depuis localStorage
async function loadCharacterSlots() {
    try {
        const chars = await apiGetCharacters();
        // Convertir liste → 5 slots (remplir depuis l’index 0)
        const slots = [null, null, null, null, null];
        chars.slice(0,5).forEach((c, i) => {
            slots[i] = {
                id: c.id,
                name: c.name,
                avatar: c.avatar,
                level: 1,
                lastPlayed: c.createdAt
            };
        });
        window.characterSlots = slots;
        // Rafraîchir l'affichage si le menu est présent
        try { updateCharacterSlotsDisplay(); } catch(_) {}
    } catch(error) {
        console.error('❌ Erreur /characters:', error);
        // Ne pas écraser les slots existants en cas d'erreur réseau
    }
}

// Sauvegarder les personnages dans localStorage
function saveCharacterSlots() {
    try {
        localStorage.setItem('monrpg_character_slots', JSON.stringify(window.characterSlots));
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde des slots:', error);
    }
}

// Créer un nouveau personnage
async function createCharacter(slotIndex, name, avatar) {
    
    // Crée côté serveur
    let serverChar;
    try {
        serverChar = await apiCreateCharacter(name, avatar);
    } catch (e) {
        console.error('❌ Création personnage échouée:', e);
        // Ne pas forcer logout ici. Afficher un message si besoin, rester sur le menu.
        return null;
    }
    // Recharge les slots depuis serveur
    await loadCharacterSlots();
    
    // Réinitialiser les quêtes pour le nouveau personnage
    if (typeof window.resetQuestsToInitial === 'function') {
        window.resetQuestsToInitial();
    }
    
    // Réinitialiser l'inventaire pour le nouveau personnage
    if (typeof window.resetInventory === 'function') {
        window.resetInventory();
    }
    
    // Forcer la réinitialisation complète de toutes les données
    if (typeof window.forceResetAllQuests === 'function') {
        window.forceResetAllQuests();
    }
    
    // Réinitialiser le joueur global
    if (typeof window.resetPlayer === 'function') {
        window.resetPlayer();
    }
    
    // RÉINITIALISER LES SORTS POUR LE NOUVEAU PERSONNAGE
    if (typeof window.resetSpellsToDefault === 'function') {
        try {
            window.resetSpellsToDefault();
        } catch (error) {
            console.error('Erreur lors de la réinitialisation des sorts:', error);
        }
    }
    
    // RÉINITIALISER LES ORBES ÉQUIPÉES POUR LE NOUVEAU PERSONNAGE
    if (typeof window.resetSpellUpgrades === 'function') {
        try {
            window.resetSpellUpgrades();
        } catch (error) {
            console.error('Erreur lors de la réinitialisation des orbes:', error);
        }
    }
    
    console.log(`✅ Personnage "${name}" créé avec succès dans le slot ${slotIndex}`);
    
    // Mettre à jour l'affichage des slots
    updateCharacterSlotsDisplay();

    // Démarrer directement le jeu avec le personnage créé (trouve son slot réel)
    try {
        const idx = (window.characterSlots || []).findIndex(s => s && s.id === serverChar.id);
        const toStart = idx >= 0 ? idx : slotIndex;
        startGame(toStart);
        return serverChar;
    } catch(e) {
        console.error('Erreur startGame après création:', e);
        // Si échec, revenir au menu de sélection
        showCharacterSelectionMenu();
    }
    
    return serverChar;
}

// Supprimer un personnage
async function deleteCharacter(slotIndex) {
    
    if (window.characterSlots[slotIndex]) {
        const character = window.characterSlots[slotIndex];
        try { await apiDeleteCharacter(character.id); } catch(e) { console.error(e); }
        
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
        
        return true;
    }
    
    return false;
}

// ===== AFFICHAGE DES MENUS =====

// Afficher le menu de sélection
function showCharacterSelectionMenu() {
    // Sécurité: si pas de token, ne pas afficher le menu, montrer le login
    try {
        const t = localStorage.getItem('monrpg_token');
        if (!t) {
            const login = document.getElementById('login-screen');
            if (login) { login.style.display = 'block'; document.body.classList.add('login-open'); }
            if (characterSelectionMenu) characterSelectionMenu.style.display = 'none';
            return;
        }
    } catch(_) {}

    gameState = "menu";
    characterSelectionMenu.style.display = 'flex';
    characterCreationMenu.style.display = 'none';
    deleteConfirmMenu.style.display = 'none';
    loadingScreen.style.display = 'none';
    
    // PROTECTION : Masquer complètement l'inventaire et sa poubelle
    const inventoryModal = document.getElementById('inventory-modal');
    if (inventoryModal) {
        inventoryModal.style.display = 'none';
    }
    
    // PROTECTION : Supprimer la classe inventory-open du body
    document.body.classList.remove('inventory-open');
    
    // PROTECTION : Masquer la zone de poubelle directement
    const trashZone = document.getElementById('inventory-trash-zone');
    if (trashZone) {
        trashZone.style.display = 'none';
    }
    
    // Désactiver les systèmes de jeu
    if (typeof window.disableGameSystems === 'function') {
        window.disableGameSystems();
    }
    
    // Mettre à jour l'affichage des slots
    updateCharacterSlotsDisplay();
}

// Afficher le menu de création
function showCharacterCreationMenu(slotIndex) {
    
    gameState = "creation";
    window.currentCharacterSlot = slotIndex;
    // Bloquer l'overlay login pendant la création (évite un flash retour login si une requête lente répond)
    window.__blockLoginOverlay = true;
    
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
        try { createCharacterBtn.setAttribute('type', 'button'); } catch(_){}
        createCharacterBtn.addEventListener('click', function(e) {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
            handleCharacterCreation();
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
        characterNameInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                if (e && typeof e.preventDefault === 'function') e.preventDefault();
                if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
                handleCharacterCreation();
            }
        });
    }
    
    // Fonction centralisée pour la création de personnage (évite la double exécution)
    function handleCharacterCreation() {
        const name = characterNameInput.value.trim();
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        
        if (name && selectedAvatar) {
            const avatar = selectedAvatar.dataset.avatar;
            // Protéger le flux de création (éviter overlays)
            window.__blockLoginOverlay = true;
            createCharacter(window.currentCharacterSlot, name, avatar).finally(() => {
                // Si on est resté en menu (pas de startGame), on peut débloquer
                setTimeout(() => { if (gameState !== 'playing') window.__blockLoginOverlay = false; }, 500);
            });
        }
    }
    
    // Boutons de confirmation de suppression
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const slotIndex = parseInt(this.dataset.slot);
            
            console.log('🗑️ Confirmation de la suppression du personnage');
            
            // NETTOYAGE COMPLET lors de la confirmation
            document.body.classList.remove('character-menu-active');
            
            // Remettre les éléments de l'inventaire dans leur état normal
            const inventoryModal = document.getElementById('inventory-modal');
            const trashZone = document.getElementById('inventory-trash-zone');
            const trashContainer = document.getElementById('trash-container');
            
            if (inventoryModal) {
                inventoryModal.style.display = '';
                inventoryModal.style.visibility = '';
                inventoryModal.style.zIndex = '';
            }
            if (trashZone) {
                trashZone.style.display = '';
                trashZone.style.visibility = '';
                trashZone.style.zIndex = '';
            }
            if (trashContainer) {
                trashContainer.style.display = '';
                trashContainer.style.visibility = '';
                trashContainer.style.zIndex = '';
            }
            
            // Procéder à la suppression
            if (deleteCharacter(slotIndex)) {
                console.log('✅ Personnage supprimé - retour au menu de sélection');
                showCharacterSelectionMenu();
            }
        });
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function() {
            console.log('🚫 Annulation de la suppression');
            
            // NETTOYAGE COMPLET lors de l'annulation
            document.body.classList.remove('character-menu-active');
            
            // Remettre les éléments de l'inventaire dans leur état normal
            const inventoryModal = document.getElementById('inventory-modal');
            const trashZone = document.getElementById('inventory-trash-zone');
            const trashContainer = document.getElementById('trash-container');
            
            if (inventoryModal) {
                inventoryModal.style.display = '';
                inventoryModal.style.visibility = '';
                inventoryModal.style.zIndex = '';
            }
            if (trashZone) {
                trashZone.style.display = '';
                trashZone.style.visibility = '';
                trashZone.style.zIndex = '';
            }
            if (trashContainer) {
                trashContainer.style.display = '';
                trashContainer.style.visibility = '';
                trashContainer.style.zIndex = '';
            }
            
            console.log('✅ Nettoyage terminé - retour au menu de sélection');
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
    
    // PROTECTION MAXIMALE : Masquer complètement tout ce qui concerne l'inventaire
    const inventoryModal = document.getElementById('inventory-modal');
    if (inventoryModal) {
        inventoryModal.style.display = 'none';
    }
    
    const trashZone = document.getElementById('inventory-trash-zone');
    if (trashZone) {
        trashZone.style.display = 'none';
        trashZone.style.visibility = 'hidden';
    }
    
    const trashContainer = document.getElementById('trash-container');
    if (trashContainer) {
        trashContainer.style.display = 'none';
        trashContainer.style.visibility = 'hidden';
    }
    
    // PROTECTION : Supprimer la classe inventory-open du body
    document.body.classList.remove('inventory-open');
    document.body.classList.add('character-menu-active');
    
    // Remplir les informations du personnage
    document.getElementById('confirm-avatar').src = character.avatar;
    document.getElementById('confirm-name').textContent = character.name;
    document.getElementById('confirm-level').textContent = `Niveau ${character.level}`;
    
    // ÉTAPE CRUCIALE : FORCER l'icône d'avertissement ⚠️ (pas la poubelle 🗑️)
    const confirmIcon = document.querySelector('.confirm-icon');
    if (confirmIcon) {
        // Forcer le contenu avec l'icône d'avertissement
        confirmIcon.textContent = '⚠️';
        confirmIcon.innerHTML = '⚠️';
        // Protection supplémentaire via CSS
        confirmIcon.style.setProperty('content', '"⚠️"', 'important');
        console.log('✅ Icône d\'avertissement ⚠️ forcée (PAS la poubelle 🗑️)');
    } else {
        console.warn('❌ Élément .confirm-icon non trouvé !');
    }
    
    // Stocker le slot dans le bouton de confirmation
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.dataset.slot = slotIndex;
    }
    
    // Afficher le menu avec priorité maximale
    deleteConfirmMenu.style.display = 'flex';
    deleteConfirmMenu.style.zIndex = '9999';
    
    console.log("🎯 Menu de confirmation de suppression affiché pour:", character.name);
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
    
    // NETTOYAGE CRITIQUE : Supprimer toutes les classes de menu pour débloquer l'inventaire
    document.body.classList.remove('character-menu-active', 'menu-active');
    console.log('🧹 Classes de menu nettoyées pour débloquer l\'inventaire');
    window.__blockLoginOverlay = true;
    
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
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde du personnage:', error);
    }
}

// Initialiser le jeu
function initializeGame(character) {
    
    // Définir les variables globales
    window.playerName = character.name;
    window.playerAvatar = character.avatar;
    window.currentCharacterId = character.id;
    
    // RÉINITIALISER COMPLÈTEMENT LE JOUEUR GLOBAL AVANT DE CHARGER LES DONNÉES
    // Cela évite que le joueur hérite des données du personnage précédent
    if (typeof player !== 'undefined') {
        // Réinitialiser toutes les propriétés du joueur aux valeurs par défaut
        player.level = 1;
        player.xp = 0;
        player.xpToNextLevel = 100;
        player.life = 100;
        player.maxLife = 100;
        player.x = 25;
        player.y = 12;
        player.px = 25 * 32;
        player.py = 12 * 32;
        player.spawnX = 25;
        player.spawnY = 12;
        player.direction = 0;
        player.frame = 0;
        player.moving = false;
        player.moveTarget = { x: 25, y: 12 };
        player.path = [];
        player.inCombat = false;
        player.lastCombatTime = 0;
        player.lastRegenTime = 0;
        player.autoFollow = false;
        player.isDead = false;
        player.deathTime = 0;
        player.respawnTime = 3000; // 3 secondes pour le respawn
        
        // Stats de base
        player.baseForce = 1;
        player.baseIntelligence = 1;
        player.baseAgilite = 1;
        player.baseDefense = 1;
        player.baseChance = 1;
        player.baseVitesse = 1;
        player.baseVie = 1;
        
        // Stats de combat
        player.combatForce = 0;
        player.combatIntelligence = 0;
        player.combatAgilite = 0;
        player.combatDefense = 0;
        player.combatChance = 0;
        player.combatVitesse = 0;
        player.combatVie = 0;
        
        // Stats d'équipement
        player.equipForce = 0;
        player.equipIntelligence = 0;
        player.equipAgilite = 0;
        player.equipDefense = 0;
        player.equipChance = 0;
        player.equipVitesse = 0;
        player.equipVie = 0;
        
        // Stats totales
        player.force = 1;
        player.intelligence = 1;
        player.agilite = 1;
        player.defense = 1;
        player.chance = 1;
        player.vitesse = 1;
        player.vie = 1;
        
        // XP des stats
        player.forceXp = 0;
        player.intelligenceXp = 0;
        player.agiliteXp = 0;
        player.defenseXp = 0;
        player.chanceXp = 0;
        player.vitesseXp = 0;
        
        // Points et monnaie
        player.statPoints = 0;
        player.pecka = 0;
    }
    
    // RÉINITIALISER LES SORTS POUR LE NOUVEAU PERSONNAGE
    if (typeof window.resetSpellsToDefault === 'function') {
        try {
            window.resetSpellsToDefault();
        } catch (error) {
            console.error('Erreur lors de la réinitialisation des sorts:', error);
        }
    }
    
    // RÉINITIALISER LES ORBES ÉQUIPÉES POUR LE NOUVEAU PERSONNAGE
    if (typeof window.resetSpellUpgrades === 'function') {
        try {
            window.resetSpellUpgrades();
        } catch (error) {
            console.error('Erreur lors de la réinitialisation des orbes:', error);
        }
    }
    
    // Charger les sorts débloqués pour ce personnage
    if (typeof window.loadUnlockedSpells === 'function') {
        window.loadUnlockedSpells();
    }
    
    // Mettre à jour l'état de déverrouillage des sorts après le chargement
    if (typeof window.updateSpellUnlockStatus === 'function') {
        window.updateSpellUnlockStatus();
    }
    
    // Réinitialiser les quêtes pour ce personnage spécifique
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
    
    // Afficher le bouton multijoueur (caché car remplacé par le panneau MMO)
    const multiplayerBtn = document.getElementById('multiplayer-btn');
    if (multiplayerBtn) {
        multiplayerBtn.style.display = 'none'; // Caché car remplacé par le panneau MMO
        
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
    
    // NETTOYAGE CRITIQUE FINAL : S'assurer que les classes sont supprimées avant le lancement
    document.body.classList.remove('character-menu-active', 'menu-active');
    console.log('🧹 Nettoyage final avant lancement du jeu après création de personnage');
    
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
    
    // Débloquer l'inventaire après un court délai pour s'assurer que tout est initialisé
    setTimeout(() => {
        if (typeof window.debloquerInventaireEtStats === 'function') {
            window.debloquerInventaireEtStats();
        }
        // Une fois le jeu lancé, on réautorise le login overlay (utile pour futures 401)
        window.__blockLoginOverlay = false;
    }, 1000);
}

// ===== FONCTIONS EXPORTÉES =====

// Fonction pour retourner au menu (depuis le jeu)
window.returnToMenu = function() {
    
    // Sauvegarder l'état actuel si on est en jeu
    if (gameState === "playing" && window.currentCharacterId) {
        if (typeof window.autoSaveOnEvent === 'function') {
            window.autoSaveOnEvent();
        }
    }
    
    // RÉINITIALISER LES SORTS À LEUR ÉTAT PAR DÉFAUT
    // Cela évite que les sorts débloqués d'un personnage soient hérités par un autre
    if (typeof window.resetSpellsToDefault === 'function') {
        try {
            window.resetSpellsToDefault();
        } catch (error) {
            console.error('Erreur lors de la réinitialisation des sorts:', error);
        }
    }
    
    // RÉINITIALISER LES ORBES ÉQUIPÉES À LEUR ÉTAT PAR DÉFAUT
    // Cela évite que les orbes équipées d'un personnage soient héritées par un autre
    if (typeof window.resetSpellUpgrades === 'function') {
        try {
            window.resetSpellUpgrades();
        } catch (error) {
            console.error('Erreur lors de la réinitialisation des orbes:', error);
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
    
};

// Fonction pour réinitialiser le dialogue de création
window.resetCharacterCreationDialog = function() {
    window.characterCreationDialogShown = false;
};

// FONCTION DE DIAGNOSTIC : Vérifier l'état des systèmes
window.debugCharacterMenu = function() {
    console.log("🔍 === DIAGNOSTIC MENU PERSONNAGES ===");
    
    // Vérifier les éléments du menu de confirmation
    const confirmMenu = document.getElementById('delete-confirm-menu');
    const confirmAvatar = document.getElementById('confirm-avatar');
    const confirmName = document.getElementById('confirm-name');
    const deleteBtn = document.getElementById('confirm-delete-btn');
    
    console.log("Éléments du menu de confirmation:");
    console.log("- Menu:", confirmMenu ? "✅ Trouvé" : "❌ Manquant");
    console.log("- Avatar:", confirmAvatar ? "✅ Trouvé" : "❌ Manquant");
    console.log("- Nom:", confirmName ? "✅ Trouvé" : "❌ Manquant");
    console.log("- Bouton:", deleteBtn ? "✅ Trouvé" : "❌ Manquant");
    
    // Vérifier les éléments de l'inventaire
    const inventoryModal = document.getElementById('inventory-modal');
    const trashZone = document.getElementById('inventory-trash-zone');
    const trashContainer = document.getElementById('trash-container');
    const trashIcon = document.getElementById('trash-icon');
    
    console.log("Éléments de l'inventaire:");
    console.log("- Inventaire:", inventoryModal ? "✅ Trouvé" : "❌ Manquant");
    console.log("- Zone poubelle:", trashZone ? "✅ Trouvé" : "❌ Manquant");
    console.log("- Container poubelle:", trashContainer ? "✅ Trouvé" : "❌ Manquant");
    console.log("- Icône poubelle:", trashIcon ? "✅ Trouvé" : "❌ Manquant");
    
    // Vérifier la visibilité des éléments
    if (trashZone) {
        console.log("État de la poubelle:");
        console.log("- Display:", window.getComputedStyle(trashZone).display);
        console.log("- Visibility:", window.getComputedStyle(trashZone).visibility);
        console.log("- Z-index:", window.getComputedStyle(trashZone).zIndex);
    }
    
    // Vérifier les classes du body
    console.log("Classes du body:", document.body.className);
    
    console.log("=======================================");
    
    return {
        confirmMenuExists: !!confirmMenu,
        trashSystemExists: !!trashZone,
        bodyClasses: document.body.className
    };
};

// FONCTION DE TEST : Tester le menu de suppression de personnage
window.testCharacterDeletionMenu = function() {
    console.log("🧪 === TEST MENU SUPPRESSION PERSONNAGE ===");
    
    // Vérifier les éléments nécessaires
    const confirmMenu = document.getElementById('delete-confirm-menu');
    const confirmIcon = document.querySelector('.confirm-icon');
    const trashContainer = document.getElementById('trash-container');
    
    console.log("Éléments vérifiés:");
    console.log("- Menu confirmation:", confirmMenu ? "✅" : "❌");
    console.log("- Icône confirmation:", confirmIcon ? "✅" : "❌");
    console.log("- Container poubelle:", trashContainer ? "✅" : "❌");
    
    if (confirmIcon) {
        console.log("Contenu icône actuel:", confirmIcon.textContent || confirmIcon.innerHTML);
    }
    
    // Test : Simuler l'ouverture du menu
    if (window.characterSlots && window.characterSlots[0]) {
        console.log("🎯 Test : Simulation ouverture menu de suppression");
        
        // Ajouter la classe de protection
        document.body.classList.add('character-menu-active');
        
        // Forcer l'icône
        if (confirmIcon) {
            confirmIcon.textContent = '⚠️';
            confirmIcon.innerHTML = '⚠️';
        }
        
        // Masquer la poubelle
        if (trashContainer) {
            trashContainer.style.display = 'none';
        }
        
        console.log("✅ Test terminé - vérifiez l'icône d'avertissement");
        console.log("Pour nettoyer : window.cleanupCharacterMenuTest()");
        
        return true;
    } else {
        console.log("❌ Aucun personnage trouvé pour le test");
        return false;
    }
};

// Fonction de nettoyage du test
window.cleanupCharacterMenuTest = function() {
    console.log("🧹 Nettoyage du test");
    
    document.body.classList.remove('character-menu-active');
    
    const trashContainer = document.getElementById('trash-container');
    if (trashContainer) {
        trashContainer.style.display = '';
    }
    
    console.log("✅ Test nettoyé");
};

// FONCTION D'URGENCE : Restaurer complètement le menu de suppression original
window.restoreOriginalCharacterMenu = function() {
    console.log("🔄 === RESTAURATION COMPLÈTE DU MENU ORIGINAL ===");
    
    // Étape 1 : Nettoyer toutes les interférences
    document.body.classList.remove('character-menu-active', 'menu-active');
    
    // Étape 2 : Restaurer l'HTML original de l'icône de confirmation
    const confirmIcon = document.querySelector('.confirm-icon');
    if (confirmIcon) {
        // Remettre l'icône d'avertissement original
        confirmIcon.innerHTML = '⚠️';
        confirmIcon.textContent = '⚠️';
        
        // Supprimer toutes les modifications de style
        confirmIcon.removeAttribute('style');
        confirmIcon.removeAttribute('data-protected');
        
        console.log('✅ Icône de confirmation restaurée');
    }
    
    // Étape 3 : Masquer complètement tout ce qui concerne la poubelle
    const trashElements = [
        '#trash-container',
        '#trash-icon', 
        '#inventory-trash-zone'
    ];
    
    trashElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            element.style.zIndex = '-9999';
        }
    });
    
    // Étape 4 : Forcer la priorité CSS du menu de confirmation
    const confirmMenu = document.getElementById('delete-confirm-menu');
    if (confirmMenu) {
        confirmMenu.style.zIndex = '10000';
        confirmMenu.style.position = 'fixed';
    }
    
    console.log('✅ Menu de suppression restauré à son état original');
    console.log('🎯 Teste maintenant la suppression de personnage !');
};

// FONCTION D'URGENCE : Forcer l'affichage correct du menu de suppression
window.forceFixCharacterMenu = function() {
    console.log("🚨 CORRECTION FORCÉE du menu de suppression");
    
    // Masquer complètement tout ce qui concerne l'inventaire
    const elementsToHide = [
        'inventory-modal',
        'inventory-trash-zone',
        'trash-container'
    ];
    
    elementsToHide.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            element.style.opacity = '0';
            element.style.zIndex = '-1';
        }
    });
    
    // Nettoyer les classes du body
    document.body.classList.remove('inventory-open');
    document.body.classList.add('character-menu-active');
    
    // Vérifier le menu de confirmation
    const confirmMenu = document.getElementById('delete-confirm-menu');
    if (confirmMenu) {
        confirmMenu.style.zIndex = '5000';
        console.log("✅ Menu de confirmation priorité maximale");
    }
    
    console.log("✅ Correction forcée terminée");
};
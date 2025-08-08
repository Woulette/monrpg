// Moteur principal du jeu - Core
// Nettoyé et validé le 30/07/2025 - par Cursor

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Compatibilité menu: shims sûrs si les modules de sorts ne sont pas encore prêts
if (typeof window.resetSpellsToDefault !== 'function') {
  window.resetSpellsToDefault = function(){};
}
if (typeof window.resetSpellUpgrades !== 'function') {
  window.resetSpellUpgrades = function(){};
}
if (typeof window.loadUnlockedSpells !== 'function') {
  window.loadUnlockedSpells = function(){};
}
if (typeof window.updateSpellUnlockStatus !== 'function') {
  window.updateSpellUnlockStatus = function(){};
}

// Système de traçage des modifications des sorts (version simplifiée)
function traceSpellModification(slotId, oldValue, newValue, reason) {
  // Fonction vide - logs supprimés
}

// Variables globales pour le combo Triple Coup de Poing
window.triplePunchCombo = {
  currentStep: 0,        // 0, 1, 2, 3 (étape actuelle du combo)
  lastPressTime: 0,      // Timestamp du dernier appui
  comboTimeout: 2000,    // 2 secondes pour compléter le combo
  isActive: false        // Si le combo est en cours
};

// Attendre que tous les scripts soient chargés
document.addEventListener('DOMContentLoaded', () => {
    // Si le menu personnages est actif, NE PAS toucher aux classes. Le menu contrôle l'UI.
    if (typeof window.gameState !== 'undefined' && window.gameState === "menu") {
        return;
    }
    
    // Pas de menu → démarrage direct (legacy)
    startGameDirectly();
});

// Fonction pour démarrer le jeu directement (fallback)
function startGameDirectly() {
    // Vérifier qu'on est bien en mode jeu
    if (window.gameState !== "playing") {
        return;
    }

    // On entre en jeu → nettoyer les classes de menu maintenant seulement
    document.body.classList.remove('character-menu-active', 'menu-active');
    
    
    // Nettoyer l'écran noir au démarrage pour éviter les blocages sur Vercel
    if (typeof clearBlackScreen === "function") {
        clearBlackScreen();
    } else if (window.blackScreenStartTime) {
        window.blackScreenStartTime = null;
        window.blackScreenDuration = 250;
    }
    
    // S'assurer que le canvas et le HUD sont visibles
    if (canvas) {
        canvas.style.display = 'block';
        canvas.style.pointerEvents = '';
    }
    const hudLayerEl = document.getElementById('hud-layer');
    if (hudLayerEl) hudLayerEl.style.display = 'block';
    const spellBarEl = document.getElementById('spell-shortcut-bar');
    if (spellBarEl) spellBarEl.style.display = 'flex';
    const utilBarEl = document.getElementById('utility-bar');
    if (utilBarEl) utilBarEl.style.display = 'flex';
    
    try {
        // Charger la sauvegarde AVANT de charger la map pour connaître la map actuelle
        let targetMap = 'map1'; // Map par défaut
        
        if (typeof window.loadGame === "function") {
            const loadSuccess = window.loadGame();
            if (loadSuccess && window.currentMap) {
                targetMap = window.currentMap;
            }
        }
        
        // Charger la map appropriée
        loadMap(targetMap)
            .then(success => {
                if (!success) {
                    throw new Error(`Impossible de charger ${targetMap} !`);
                }
                return new Promise(resolve => {
                    // Attendre que toutes les images nécessaires soient chargées
                    const checkImages = () => {
                        // Vérifier que playerImg est défini et chargé
                        if (window.playerImg && window.playerImg.complete && 
                            window.mapData && window.mapData.layers) {
                            resolve();
                        } else {
                            setTimeout(checkImages, 100);
                        }
                    };
                    checkImages();
                });
            })
            .then(() => {
                
                // S'assurer que playerImg est initialisé
                if (!window.playerImg) {
                    const playerImg = new Image();
                    playerImg.onload = () => {
                    };
                    playerImg.onerror = () => {
                        console.error('❌ Erreur de chargement de l\'image du joueur');
                    };
                    playerImg.src = 'assets/personnages/player.png';
                    window.playerImg = playerImg;
                }
                
                // Initialize game systems
                if (typeof initMap === "function") {
                    initMap();
                }
                if (typeof initPlayer === "function") {
                    initPlayer(); // Initialiser le joueur avec les valeurs par défaut
                }
                
                // Initialiser les événements de souris pour les tooltips
                canvas.addEventListener('mousemove', handleMouseMove);
                
                // Initialiser le panneau MMO du joueur
                if (typeof updatePlayerMMOPanel === "function") {
                    updatePlayerMMOPanel();
                }
                
                // Initialiser les événements du panneau MMO
                if (typeof initMMOPanelEvents === "function") {
                    initMMOPanelEvents();
                }
                
                // Mettre à jour les coordonnées pixel après l'initialisation
                if (typeof player !== 'undefined') {
                    player.px = player.x * TILE_SIZE;
                    player.py = player.y * TILE_SIZE;
                }
                
                // Nettoyage des données corrompues au démarrage
                if (typeof window.cleanCorruptedSaveData === "function") {
                    window.cleanCorruptedSaveData();
                }
                
                // Initialiser l'état du boss slime
                if (window.slimeBossDefeated === undefined) {
                    window.slimeBossDefeated = false;
                }
                
                // Initialiser l'inventaire
                if (typeof initInventory === "function") {
                    initInventory();
                }
                if (typeof initStats === "function") {
                    initStats();
                }
                if (typeof initHUD === "function") {
                    initHUD();
                }
                // Afficher/positionner les icônes HUD et barres
                if (typeof resizeGameCanvas === 'function') resizeGameCanvas();
                if (typeof positionHudIcons === 'function') positionHudIcons();
                
                // Initialiser les établies
                if (typeof initEtablies === "function") {
                    initEtablies();
                }
                
                // Initialiser les PNJs
                if (typeof initPNJs === "function") {
                    initPNJs();
                }
                
                // Initialiser le chat
                if (typeof initChat === "function") {
                    initChat();
                }
                
                // Initialiser/Charger les quêtes du personnage
                if (window.currentCharacterId) {
                    if (typeof window.switchCharacterQuests === 'function') {
                        window.switchCharacterQuests(window.currentCharacterId);
                    } else if (typeof window.loadQuestsForCharacter === 'function') {
                        window.loadQuestsForCharacter(window.currentCharacterId);
                    }
                }

                // Initialiser la fenêtre/quand l'UI quêtes est prête (clic sur l'icône, onglets, fermeture)
                if (typeof window.initQuestsWindow === "function") {
                    window.initQuestsWindow();
                }
                
                // Initialiser l'UI des sorts (déplacée dans js/sort/ui.js)
                if (typeof window.initSortUI === 'function') window.initSortUI();
                if (typeof window.initSpellUpgradeSystem === 'function') window.initSpellUpgradeSystem();
                
                // Forcer un premier rendu
                if (typeof drawGame === "function") {
                    drawGame();
                }
                
                requestAnimationFrame(gameLoop);
            })
            .catch(e => {
                console.error("❌ Erreur lors du chargement:", e);
                alert("Erreur de chargement : " + e.message);
            });
    } catch (error) {
        console.error("❌ Erreur critique dans startGameDirectly:", error);
        alert("Erreur critique : " + error.message);
    }
}

// Exporter la fonction pour qu'elle soit accessible depuis menu.js
window.startGameDirectly = startGameDirectly;
window.disableGameSystems = disableGameSystems;
window.enableGameSystems = enableGameSystems;

// Fonction pour désactiver les systèmes en mode menu
function disableGameSystems() {
    // Désactiver les touches du jeu
    if (typeof window.disableGameInputs === 'function') {
        window.disableGameInputs();
    }
    
    // Masquer les éléments de jeu
    const gameElements = [
        'inventory-modal',
        'stats-modal',
        'quests-main-modal',
        'chat-window',
        'floating-chat'
    ];
    
    gameElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// Fonction pour activer les systèmes en mode jeu
function enableGameSystems() {
    // Activer les touches du jeu
    if (typeof window.enableGameInputs === 'function') {
        window.enableGameInputs();
    }
}

// Fonction pour dessiner le jeu (séparée de la boucle)
function drawGame() {
    if (!canvas || !ctx) { 
        return; 
    }
    
    try {
        // Dessiner la map (qui inclut déjà le joueur, monstres, PNJs et calque 3)
        if (typeof drawMap === "function" && window.mapData && window.mapData.layers) { 
            try { 
                drawMap(); 
            } catch (error) { 
                // Erreur silencieuse
            } 
        }
        
        // Dessiner les effets de dégâts (pas inclus dans drawMap)
        if (typeof window.drawDamageEffects === "function") {
            try {
                window.drawDamageEffects(ctx);
            } catch (error) {
                // Erreur silencieuse
            }
        }
        
        // Dessiner le HUD (pas inclus dans drawMap)
        if (typeof drawHUD === "function") {
            try {
                drawHUD(ctx);
            } catch (error) {
                // Erreur silencieuse
            }
        }
        
        // Dessiner les autres joueurs (multijoueur)
        if (typeof drawMultiplayerPlayers === "function") {
            try {
                drawMultiplayerPlayers(ctx);
            } catch (error) {
                // Erreur silencieuse
            }
        }
        
        // Dessiner les monstres synchronisés (multijoueur)
        if (typeof drawSyncedMonsters === "function") {
            try {
                drawSyncedMonsters(ctx);
            } catch (error) {
                // Erreur silencieuse
            }
        }
        
        // Dessiner les tooltips au survol
        if (typeof drawAllTooltips === "function") {
            try {
                drawAllTooltips(ctx);
            } catch (error) {
                // Erreur silencieuse
            }
        }
        
    } catch (error) {
        // Erreur silencieuse
    }
}

// La boucle principale du jeu
function gameLoop(ts) {
    // Vérifier STRICTEMENT si nous sommes en mode jeu
    if (window.gameState !== "playing") {
        // En mode menu, arrêter complètement la boucle
        return;
    }
    
    // Optimisation : limiter le framerate pour éviter la surcharge
    if (window.lastFrameTime && ts - window.lastFrameTime < 16) { // ~60 FPS max
        requestAnimationFrame(gameLoop);
        return;
    }
    window.lastFrameTime = ts;
   
    // Mise à jour du joueur (toujours nécessaire)
    updatePlayer(ts);

    // Mise à jour des monstres (seulement si ils existent)
    if (window.monsters && window.monsters.length > 0) {
        // Déplacement pixel par pixel des monstres
        if (typeof moveMonsters === "function") {
            moveMonsters(ts);
        }

        // Logique IA des monstres
        if (typeof updateMonsters === "function") {
            updateMonsters(ts);
        }

        // Mise à jour des respawns de monstres
        if (typeof updateMonsterRespawn === "function") {
            updateMonsterRespawn(ts);
        }
    }

    // Mise à jour du système de combat (seulement si le joueur est en combat)
    if (window.player && window.player.inCombat && typeof updateCombat === "function") {
        updateCombat(ts);
    }

    // Mise à jour du système de régénération (seulement si nécessaire)
    if (window.player && window.player.life < window.player.maxLife && typeof updateRegeneration === "function") {
        updateRegeneration(ts);
    }

    // Mise à jour du système de mort et respawn du joueur (seulement si mort)
    if (window.player && window.player.isDead && typeof updatePlayerRespawn === "function") {
        updatePlayerRespawn(ts);
    }

    // Mise à jour du système de suivi automatique (seulement si activé)
    if (window.player && window.player.autoFollow && typeof updateAutoFollow === "function") {
        updateAutoFollow(ts);
    }

    // Mise à jour du système de pathfinding (seulement si le joueur bouge)
    if (window.player && window.player.moving && typeof updatePathfinding === "function") {
        updatePathfinding(ts);
    }

    // Mise à jour du système de chat flottant (seulement si actif)
    if (typeof updateFloatingChat === "function") {
        updateFloatingChat(ts);
    }

    // Mise à jour du système d'affichage des dégâts (toujours nécessaire)
    if (typeof updateDamageDisplay === "function") {
        updateDamageDisplay(ts);
    }

    // Mise à jour des effets de dégâts (toujours nécessaire)
    if (typeof window.updateDamageEffects === "function") {
        window.updateDamageEffects();
    }

    // Mise à jour du système de loot (seulement si il y a du loot)
    if (window.lootItems && window.lootItems.length > 0 && typeof updateLootSystem === "function") {
        updateLootSystem(ts);
    }

    // Mise à jour du système d'établies (seulement si on est près d'une établie)
    if (typeof updateEtablies === "function") {
        updateEtablies(ts);
    }

    // Mise à jour du système de quêtes (seulement si il y a des quêtes actives)
    if (window.activeQuests && window.activeQuests.length > 0 && typeof updateQuests === "function") {
        updateQuests(ts);
    }

    // Mise à jour du système de sauvegarde automatique (seulement toutes les 30 secondes)
    if (window.saveSystem && window.saveSystem.autoSave && (!window.lastAutoSave || ts - window.lastAutoSave > 30000)) {
        window.saveSystem.autoSave();
        window.lastAutoSave = ts;
    }

    // Mise à jour du panneau MMO du joueur
    if (typeof updatePlayerMMOPanel === "function") {
        updatePlayerMMOPanel();
    }

    // Dessiner le jeu
    drawGame();

    // Continuer la boucle SEULEMENT si on est en mode jeu
    if (window.gameState === "playing") {
        requestAnimationFrame(gameLoop);
    } else {
        // Boucle de jeu arrêtée
    }
}

// Chat unifié géré par js/systems/chat.js (window.initChat, add*Message)

function addChatMessage(message, type = 'system') {
    // Adaptateur vers js/systems/chat.js s'il est présent
    const hasSystem = typeof window.addSystemMessage === 'function';
    const hasGame = typeof window.addGameMessage === 'function';
    const hasDrop = typeof window.addDropMessage === 'function';
    const hasTrade = typeof window.addTradeMessage === 'function';
    const hasRecruit = typeof window.addRecruitMessage === 'function';

    if (hasSystem || hasGame || hasDrop || hasTrade || hasRecruit) {
        switch ((type || 'game').toLowerCase()) {
            case 'system':
                hasSystem ? window.addSystemMessage(message) : (hasGame && window.addGameMessage(message));
                break;
            case 'drop':
                hasDrop ? window.addDropMessage(message) : (hasGame && window.addGameMessage(message));
                break;
            case 'trade':
                hasTrade ? window.addTradeMessage(message) : (hasGame && window.addGameMessage(message));
                break;
            case 'recruit':
                hasRecruit ? window.addRecruitMessage(message) : (hasGame && window.addGameMessage(message));
                break;
            case 'combat':
            default:
                hasGame ? window.addGameMessage(message) : (hasSystem && window.addSystemMessage(message));
                break;
        }
        return;
    }
    
        // Fallback minimal si le système de chat modulaire n'est pas chargé
    const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) { return; }
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    while (chatMessages.children.length > 20) chatMessages.removeChild(chatMessages.firstChild);
}

// Démo : cooldown au clic sur le slot
window.addEventListener('DOMContentLoaded', () => {
  // Initialiser l'affichage des détails des sorts seulement
  setTimeout(() => {
    if (typeof updateSpellDetailsDisplay === 'function') {
      updateSpellDetailsDisplay();
    }
  }, 100);
  const slot1 = document.getElementById('spell-slot-1');
  const slot2 = document.getElementById('spell-slot-2');
  const slot3 = document.getElementById('spell-slot-3');
  if (slot1) slot1.addEventListener('click', () => { if (typeof window.castPunch === 'function') window.castPunch(); });
  if (slot2) slot2.addEventListener('click', () => { if (typeof window.castExplosivePunch === 'function') window.castExplosivePunch(); });
  if (slot3) slot3.addEventListener('click', () => { if (typeof window.handleTriplePunchCombo === 'function') window.handleTriplePunchCombo(); });
});

// Fonction pour vérifier s'il existe une sauvegarde explicite des sorts pour ce personnage
function hasExplicitSpellSave() {
  if (!window.currentCharacterId) return false;
  
  const saveKey = `monrpg_unlocked_spells_${window.currentCharacterId}`;
  const savedData = localStorage.getItem(saveKey);
  
  return savedData !== null;
}

// Fonction pour mettre à jour l'affichage des détails des sorts
function updateSpellDetailsDisplay() {
  const spells = (window && window.SPELLS) ? window.SPELLS : null;
  if (!spells) return;
  const explosiveLevelElement = document.querySelector('#sort-damage-panel-explosive .sort-detail-level-star');
  if (explosiveLevelElement && spells['spell-slot-2']) {
    explosiveLevelElement.textContent = `⭐ ${spells['spell-slot-2'].levelRequired}`;
  }
  const tripleLevelElement = document.querySelector('#sort-damage-panel-triple .sort-detail-level-star');
  if (tripleLevelElement && spells['spell-slot-3']) {
    tripleLevelElement.textContent = `⭐ ${spells['spell-slot-3'].levelRequired}`;
  }
}

// Fonction de test pour forcer le déverrouillage des sorts (accessible depuis la console)
window.testSpellUnlock = function() {
  if (typeof updateSpellUnlockStatus === 'function') {
    updateSpellUnlockStatus();
  }
  
  if (typeof updateSpellVisuals === 'function') {
    updateSpellVisuals();
  }
  
  if (typeof updateSpellDetailsDisplay === 'function') {
    updateSpellDetailsDisplay();
  }
};

// Export sécurisé uniquement pour updateSpellDetailsDisplay si nécessaire
window.updateSpellDetailsDisplay = updateSpellDetailsDisplay;
window.hasExplicitSpellSave = hasExplicitSpellSave;

function initEtablies() {
    // Initialisation du système d'établies
    
    // Vérifier que les fonctions des établies sont disponibles
    if (typeof window.openTailorWorkshopModal === 'function') {
        // Fonction openTailorWorkshopModal disponible
    } else {
        console.error("✗ Fonction openTailorWorkshopModal manquante");
    }
    
    if (typeof window.openCordonnierWorkshopModal === 'function') {
        // Fonction openCordonnierWorkshopModal disponible
    } else {
        console.error("✗ Fonction openCordonnierWorkshopModal manquante");
    }
    
    if (typeof window.openBijoutierWorkshopModal === 'function') {
        // Fonction openBijoutierWorkshopModal disponible
    } else {
        console.error("✗ Fonction openBijoutierWorkshopModal manquante");
    }
    
    // Système d'établies initialisé avec succès
}

// (showHouseChestWindow déplacé vers js/systems/house-chest.js)

// (Gestion des touches centralisée dans js/systems/input.js)

// Fonction utilitaire pour débloquer l'inventaire et statistiques
window.debloquerInventaireEtStats = function() {
    document.body.classList.remove('character-menu-active', 'menu-active');
    if (typeof window.initInventoryEvents === 'function') {
        window.initInventoryEvents();
    }
};

// RÉPARATION ÉQUIPEMENT D'URGENCE - Accessible depuis main.js
window.urgenceEquipement = function() {
    if (window.equippedItems) {
        Object.entries(window.equippedItems).forEach(([slot, item]) => {
            if (item) {
                
            } else {
                
            }
        });
    } else {
        
    }
    
    // 1. Corriger les fonctions manquantes
    if (typeof window.unequipItem !== 'function') {
        
        window.unequipItem = function(slot) {
            if (!window.equippedItems) return false;
            const item = window.equippedItems[slot];
            if (!item) return false;
            window.equippedItems[slot] = null;
            if (typeof window.applyEquipmentStats === 'function') {
                window.applyEquipmentStats();
            }
            
            return true;
        };
    }
    
    if (typeof window.getItemInSlot !== 'function') {
        
        window.getItemInSlot = function(slot) {
            if (!window.equippedItems) return null;
            return window.equippedItems[slot];
        };
    }
    
    if (typeof window.closeEquipmentDetailModal !== 'function') {
        
        window.closeEquipmentDetailModal = function() {
            const modal = document.getElementById('equipment-detail-modal');
            if (modal) {
                modal.style.display = 'none';
                console.log('✅ Modal fermée');
            }
        };
    }
    
    // 2. FORCER les événements de déséquipement sur les slots équipés
    const equipSlots = document.querySelectorAll('.equip-slot');
    
    
    equipSlots.forEach(slot => {
        const slotType = slot.dataset.slot;
        
        // Supprimer tous les anciens événements
        const newSlot = slot.cloneNode(true);
        slot.parentNode.replaceChild(newSlot, slot);
        
        // Ajouter le nouvel événement de double-clic
        newSlot.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            
            const equippedItem = window.getItemInSlot(slotType);
            
            
            if (equippedItem) {
                const success = window.unequipItem(slotType);
                
                if (success) {
                // Remettre dans les inventaires
                if (window.inventoryEquipement) {
                    const emptySlot = window.inventoryEquipement.findIndex(s => s.item === null);
                    if (emptySlot !== -1) {
                        window.inventoryEquipement[emptySlot] = {
                            item: equippedItem,
                            category: 'equipement'
                        };
                    }
                }
                
                if (window.inventoryAll) {
                    const emptyMainSlot = window.inventoryAll.findIndex(s => s.item === null);
                    if (emptyMainSlot !== -1) {
                        window.inventoryAll[emptyMainSlot] = {
                            item: equippedItem,
                            category: 'equipement'
                        };
                    }
                }
                
                // Mettre à jour l'affichage
                if (typeof window.updateAllGrids === 'function') {
                    window.updateAllGrids();
                }
                if (typeof window.updateEquipmentDisplay === 'function') {
                    window.updateEquipmentDisplay();
                }
                
                
                }
            } else {
                
            }
        });
    });
    
    // 3. FORCER les événements de fermeture des fiches (AGGRESSIF)
    setTimeout(() => {
        console.log('🔧 Forçage AGRESSIF événements fermeture');
        
        // MÉTHODE 1: Forcer sur l'ID spécifique avec logs
        const closeBtn = document.getElementById('close-equipment-detail');
        if (closeBtn) {
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            ['click', 'mousedown', 'touchstart'].forEach(eventType => {
                newCloseBtn.addEventListener(eventType, function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    const modal = document.getElementById('equipment-detail-modal');
                    if (modal) {
                        modal.style.display = 'none';
                    }
                });
            });
        } else {
                
        }
        
        // MÉTHODE 2: Forcer sur TOUS les éléments × avec logs
        const allCloseElements = document.querySelectorAll('span, button, div');
        let foundCloseElements = 0;
        allCloseElements.forEach(element => {
            if (element.innerHTML === '&times;' || element.textContent === '×' || element.id === 'close-equipment-detail') {
                foundCloseElements++;
                
                
                ['click', 'mousedown', 'touchstart'].forEach(eventType => {
                    element.addEventListener(eventType, function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        
                        
                        // Chercher le modal parent
                        let currentElement = e.target;
                        while (currentElement && currentElement !== document) {
                            if (currentElement.id === 'equipment-detail-modal' || 
                                currentElement.className.includes('equipment-detail') ||
                                currentElement.className.includes('modal')) {
                                currentElement.style.display = 'none';
                                
                                return;
                            }
                            currentElement = currentElement.parentElement;
                        }
                        
                        // Si pas trouvé, fermer le modal par ID
                        const modal = document.getElementById('equipment-detail-modal');
                        if (modal) {
                            modal.style.display = 'none';
                            
                        }
                    });
                });
            }
        });
        console.log(`📊 ${foundCloseElements} éléments de fermeture traités`);
        
        // MÉTHODE 3: Clic extérieur
        const modal = document.getElementById('equipment-detail-modal');
        if (modal) {
            const newModal = modal.cloneNode(true);
            modal.parentNode.replaceChild(newModal, modal);
            
            newModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.style.display = 'none';
                }
            });
        }
    }, 200);
    
    console.log('✅ Réparation d\'urgence terminée !');
    console.log('🧪 Teste maintenant :');
    console.log('  - Double-clic sur équipement équipé → déséquiper');
    console.log('  - Clic simple sur item → ouvrir fiche');
    console.log('  - Clic sur X → fermer fiche');
};

// Version silencieuse pour application automatique
window.urgenceEquipementSilencieux = function() {
    // 1. Corriger les fonctions manquantes (sans logs)
    if (typeof window.unequipItem !== 'function') {
        window.unequipItem = function(slot) {
            if (!window.equippedItems) return false;
            const item = window.equippedItems[slot];
            if (!item) return false;
            window.equippedItems[slot] = null;
            if (typeof window.applyEquipmentStats === 'function') {
                window.applyEquipmentStats();
            }
            return true;
        };
    }
    
    if (typeof window.getItemInSlot !== 'function') {
        window.getItemInSlot = function(slot) {
            if (!window.equippedItems) return null;
            return window.equippedItems[slot];
        };
    }
    
    if (typeof window.closeEquipmentDetailModal !== 'function') {
        window.closeEquipmentDetailModal = function() {
            const modal = document.getElementById('equipment-detail-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        };
    }
    
    // 2. FORCER les événements de déséquipement sur les slots équipés (silencieux)
    const equipSlots = document.querySelectorAll('.equip-slot');
    
    equipSlots.forEach(slot => {
        const slotType = slot.dataset.slot;
        
        // Supprimer tous les anciens événements
        const newSlot = slot.cloneNode(true);
        slot.parentNode.replaceChild(newSlot, slot);
        
        // Ajouter le nouvel événement de double-clic
        newSlot.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const equippedItem = window.getItemInSlot(slotType);
            if (equippedItem && window.unequipItem(slotType)) {
                // Remettre dans les inventaires
                if (window.inventoryEquipement) {
                    const emptySlot = window.inventoryEquipement.findIndex(s => s.item === null);
                    if (emptySlot !== -1) {
                        window.inventoryEquipement[emptySlot] = {
                            item: equippedItem,
                            category: 'equipement'
                        };
                    }
                }
                
                if (window.inventoryAll) {
                    const emptyMainSlot = window.inventoryAll.findIndex(s => s.item === null);
                    if (emptyMainSlot !== -1) {
                        window.inventoryAll[emptyMainSlot] = {
                            item: equippedItem,
                            category: 'equipement'
                        };
                    }
                }
                
                // Mettre à jour l'affichage
                if (typeof window.updateAllGrids === 'function') {
                    window.updateAllGrids();
                }
                if (typeof window.updateEquipmentDisplay === 'function') {
                    window.updateEquipmentDisplay();
                }
            }
        });
    });
    
    // 3. FORCER les événements de fermeture des fiches (silencieux + aggressif)
    setTimeout(() => {
        // MÉTHODE 1: Forcer sur l'ID spécifique
        const closeBtn = document.getElementById('close-equipment-detail');
        if (closeBtn) {
            // Supprimer TOUS les événements existants
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            // Ajouter plusieurs types d'événements pour être sûr
            ['click', 'mousedown', 'touchstart'].forEach(eventType => {
                newCloseBtn.addEventListener(eventType, function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    const modal = document.getElementById('equipment-detail-modal');
                    if (modal) {
                        modal.style.display = 'none';
                    }
                });
            });
        }
        
        // MÉTHODE 2: Forcer sur TOUS les éléments avec &times;
        const allCloseElements = document.querySelectorAll('span, button, div');
        allCloseElements.forEach(element => {
            if (element.innerHTML === '&times;' || element.textContent === '×' || element.id === 'close-equipment-detail') {
                ['click', 'mousedown', 'touchstart'].forEach(eventType => {
                    element.addEventListener(eventType, function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        
                        // Chercher le modal parent
                        let currentElement = e.target;
                        while (currentElement && currentElement !== document) {
                            if (currentElement.id === 'equipment-detail-modal' || 
                                currentElement.className.includes('equipment-detail') ||
                                currentElement.className.includes('modal')) {
                                currentElement.style.display = 'none';
                                return;
                            }
                            currentElement = currentElement.parentElement;
                        }
                        
                        // Si pas trouvé, fermer le modal par ID
                        const modal = document.getElementById('equipment-detail-modal');
                        if (modal) {
                            modal.style.display = 'none';
                        }
                    });
                });
            }
        });
        
        // MÉTHODE 3: Clic extérieur sur le modal
        const modal = document.getElementById('equipment-detail-modal');
        if (modal) {
            const newModal = modal.cloneNode(true);
            modal.parentNode.replaceChild(newModal, modal);
            
            newModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.style.display = 'none';
                }
            });
        }
    }, 100);
};

// Fonction pour tester la théorie des équipements corrompus
// testTheorieEquipement: logs supprimés pour alléger la console
window.testTheorieEquipement = function() {
    if (!window.equippedItems) return;
    let testSlot = null;
    let testItem = null;
    Object.entries(window.equippedItems).forEach(([slot, item]) => {
        if (item && !testSlot) { testSlot = slot; testItem = item; }
    });
    if (!testItem) return;
    if (window.equipmentDatabase && window.equipmentDatabase[testItem.id]) {
        const dbItem = window.equipmentDatabase[testItem.id];
            window.corrigerEquipementCorrompu = function() {
                window.equippedItems[testSlot] = { ...dbItem };
            if (typeof window.updateEquipmentDisplay === 'function') window.updateEquipmentDisplay();
        };
    }
};

// APPLICATION AUTOMATIQUE DES CORRECTIONS D'ÉQUIPEMENT À CHAQUE CHARGEMENT
setTimeout(() => {
    
    if (typeof window.urgenceEquipementSilencieux === 'function') {
        window.urgenceEquipementSilencieux();
        
    }
}, 3000); // 3 secondes après le chargement pour être sûr que tout est initialisé

// Exporter les fonctions
window.disableGameInputs = disableGameInputs;
window.enableGameInputs = enableGameInputs;

// Fonction pour réinitialiser les orbes équipées
function resetSpellUpgrades() {}
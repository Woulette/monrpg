
// Moteur principal du jeu - Core
// Nettoyé et validé le 30/07/2025 - par Cursor

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Système de gestion des sorts avec niveaux requis
const SPELLS = {
  'spell-slot-1': {
    name: 'Coup de poing',
    icon: '👊',
    levelRequired: 1,
    baseMin: 3,
    baseMax: 6,
    cooldown: 1.0,
    specialEffect: null,
    unlocked: true // Déverrouillé par défaut
  },
  'spell-slot-2': {
    name: 'Coup de poing explosif',
    icon: '👊💥',
    levelRequired: 3,
    baseMin: 12,
    baseMax: 20,
    cooldown: 15.0,
    specialEffect: 'createExplosionEffect',
    unlocked: false
  },
          'spell-slot-3': {
          name: 'Triple Coup de Poing',
          icon: 'triplecoupdepoing.png',
          levelRequired: 7,
          baseMin: 6,
          baseMax: 10,
          cooldown: 8.0,
          specialEffect: 'triplePunch',
          unlocked: false
        },
        'spell-slot-4': {
          name: 'Poingheal',
          icon: '💚',
          levelRequired: 15,
          baseMin: 10,
          baseMax: 15,
          cooldown: 12.0,
          specialEffect: 'poinghealEffect',
          unlocked: false
        },
        'spell-slot-5': {
          name: 'Rassemblement',
          icon: 'assets/sorts/rassemblement.png',
          levelRequired: 25,
          baseMin: 10,
          baseMax: 15,
          cooldown: 20.0,
          specialEffect: 'rassemblementEffect',
          unlocked: false,
          gatherRadius: 5,
          gatherDuration: 3000,
          showPreview: true
        }
};

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
    // NETTOYAGE CRITIQUE : Supprimer toutes les classes bloquantes dès le chargement
    document.body.classList.remove('character-menu-active', 'menu-active');
    console.log('🧹 Classes bloquantes nettoyées au chargement de la page');
    
    // Vérifier si le système de menu multi-personnages est actif
    if (typeof window.gameState !== 'undefined' && window.gameState === "menu") {
        // Ne rien initialiser, ne pas lancer la boucle de jeu
        return;
    }
    
    // Si pas de menu actif, démarrer le jeu directement (mode legacy)
    startGameDirectly();
});

// Fonction pour démarrer le jeu directement (fallback)
function startGameDirectly() {
    // NETTOYAGE CRITIQUE : Supprimer les classes bloquantes au démarrage du jeu
    document.body.classList.remove('character-menu-active', 'menu-active');
    console.log('🧹 Classes bloquantes nettoyées dans startGameDirectly');
    
    // Vérifier qu'on est bien en mode jeu
    if (window.gameState !== "playing") {
        return;
    }
    
    // Nettoyer l'écran noir au démarrage pour éviter les blocages sur Vercel
    if (typeof clearBlackScreen === "function") {
        clearBlackScreen();
    } else if (window.blackScreenStartTime) {
        window.blackScreenStartTime = null;
        window.blackScreenDuration = 250;
    }
    
    // S'assurer que le canvas est visible
    if (canvas) {
        canvas.style.display = 'block';
    }
    
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
                
                // Initialiser la fenêtre des quêtes
                if (typeof window.initQuestsWindow === "function") {
                    window.initQuestsWindow();
                }
                
                // Initialiser les gestionnaires d'événements UI
                initUIEventHandlers();
    initSpellUpgradeSystem();
                
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

// Initialiser les gestionnaires d'événements UI
function initUIEventHandlers() {
    // Gestion de la fenêtre des sorts (nouvelle version)
    const sortIcon = document.getElementById('sort-icon');
    const sortModal = document.getElementById('sort-modal');
    const closeSortModal = document.getElementById('close-sort-modal');
    if (sortIcon && sortModal && closeSortModal) {
        sortIcon.onclick = () => {
            sortModal.style.display = 'flex';
            // Forcer la mise à jour de l'affichage des dégâts
            setTimeout(() => {
                updateAllSpellDamageDisplays();
            }, 50);
        };
        closeSortModal.onclick = () => {
            sortModal.style.display = 'none';
        };
        sortModal.onclick = (e) => {
            if (e.target === sortModal) sortModal.style.display = 'none';
        };
    }

    const punchRow = document.getElementById('sort-punch-row');
    const explosiveRow = document.getElementById('sort-doublepunch-row');
    const tripleRow = document.getElementById('sort-triplepunch-row');
    const poinghealRow = document.getElementById('sort-poingheal-row');
    const rassemblementRow = document.getElementById('sort-rassemblement-row');
    const punchPanel = document.getElementById('sort-damage-panel-punch');
    const explosivePanel = document.getElementById('sort-damage-panel-explosive');
    const triplePanel = document.getElementById('sort-damage-panel-triple');
    const poinghealPanel = document.getElementById('sort-damage-panel-poingheal');
    const rassemblementPanel = document.getElementById('sort-damage-panel-rassemblement');

    if (punchRow && explosiveRow && tripleRow && punchPanel && explosivePanel && triplePanel) {
        punchRow.addEventListener('click', () => {
            punchPanel.style.display = '';
            explosivePanel.style.display = 'none';
            triplePanel.style.display = 'none';
            poinghealPanel.style.display = 'none';
            rassemblementPanel.style.display = 'none';
            punchRow.classList.add('selected');
            explosiveRow.classList.remove('selected');
            tripleRow.classList.remove('selected');
            poinghealRow.classList.remove('selected');
            rassemblementRow.classList.remove('selected');
        });
        explosiveRow.addEventListener('click', () => {
            punchPanel.style.display = 'none';
            explosivePanel.style.display = '';
            triplePanel.style.display = 'none';
            poinghealPanel.style.display = 'none';
            rassemblementPanel.style.display = 'none';
            punchRow.classList.remove('selected');
            explosiveRow.classList.add('selected');
            tripleRow.classList.remove('selected');
            poinghealRow.classList.remove('selected');
            rassemblementRow.classList.remove('selected');
        });
        tripleRow.addEventListener('click', () => {
            punchPanel.style.display = 'none';
            explosivePanel.style.display = 'none';
            triplePanel.style.display = '';
            poinghealPanel.style.display = 'none';
            rassemblementPanel.style.display = 'none';
            punchRow.classList.remove('selected');
            explosiveRow.classList.remove('selected');
            tripleRow.classList.add('selected');
            poinghealRow.classList.remove('selected');
            rassemblementRow.classList.remove('selected');
        });
    }
    
    // Ajouter les gestionnaires pour les nouveaux sorts
    if (poinghealRow && poinghealPanel) {
        poinghealRow.addEventListener('click', () => {
            punchPanel.style.display = 'none';
            explosivePanel.style.display = 'none';
            triplePanel.style.display = 'none';
            poinghealPanel.style.display = '';
            rassemblementPanel.style.display = 'none';
            punchRow.classList.remove('selected');
            explosiveRow.classList.remove('selected');
            tripleRow.classList.remove('selected');
            poinghealRow.classList.add('selected');
            rassemblementRow.classList.remove('selected');
        });
    }
    
    if (rassemblementRow && rassemblementPanel) {
        rassemblementRow.addEventListener('click', () => {
            punchPanel.style.display = 'none';
            explosivePanel.style.display = 'none';
            triplePanel.style.display = 'none';
            poinghealPanel.style.display = 'none';
            rassemblementPanel.style.display = '';
            punchRow.classList.remove('selected');
            explosiveRow.classList.remove('selected');
            tripleRow.classList.remove('selected');
            poinghealRow.classList.remove('selected');
            rassemblementRow.classList.add('selected');
        });
    }
}

// Système d'amélioration de sorts
function initSpellUpgradeSystem() {
    // Initialiser les variables de dégâts de base pour les sorts
    if (!window.punchDamageMin) window.punchDamageMin = 3;
    if (!window.punchDamageMax) window.punchDamageMax = 6;
    if (!window.explosiveDamageMin) window.explosiveDamageMin = 12;
    if (!window.explosiveDamageMax) window.explosiveDamageMax = 20;
    if (!window.tripleDamageMin) window.tripleDamageMin = 6;
    if (!window.tripleDamageMax) window.tripleDamageMax = 10;
    
    console.log('Variables de dégâts initialisées:', {
        punch: `${window.punchDamageMin}-${window.punchDamageMax}`,
        explosive: `${window.explosiveDamageMin}-${window.explosiveDamageMax}`,
        triple: `${window.tripleDamageMin}-${window.tripleDamageMax}`
    });
    
    // Variables globales pour l'amélioration de sorts
    window.currentSpellUpgrade = {
        spellId: null,
        slotIndex: null,
        orbeType: null
    };

    // Fonction pour vérifier si l'orbe est dans l'inventaire
    function hasOrbeInInventory(orbeId) {
        for (let slot of window.inventoryAll) {
            if (slot.item && slot.item.id === orbeId) {
                return true;
            }
        }
        return false;
    }

    // Fonction pour retirer l'orbe de l'inventaire
    function removeOrbeFromInventory(orbeId) {
        for (let slot of window.inventoryAll) {
            if (slot.item && slot.item.id === orbeId) {
                if (slot.item.quantity && slot.item.quantity > 1) {
                    slot.item.quantity--;
                } else {
                    slot.item = null;
                }
                return true;
            }
        }
        return false;
    }

    // Fonction pour afficher la modal de déséquipement
    function showSpellUnequipModal(slot) {
        const modal = document.getElementById('spell-upgrade-modal');
        const orbeImg = document.getElementById('spell-upgrade-orbe-img');
        const text = document.getElementById('spell-upgrade-text');
        
        const orbeId = slot.getAttribute('data-orbe-id');
        const orbeType = slot.getAttribute('data-orbe-type');
        const spellId = slot.getAttribute('data-spell');
        
        console.log('🔧 showSpellUnequipModal: Début', { orbeId, orbeType, spellId });
        
        // Définir l'orbe selon le type
        let orbeName;
        switch(orbeType) {
            case 'atypique':
                orbeName = 'orbe atypique';
                orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png';
                break;
            case 'rare':
                orbeName = 'orbe rare';
                orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png'; // Temporaire
                break;
            case 'epique':
                orbeName = 'orbe épique';
                orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png'; // Temporaire
                break;
            case 'legendaire':
                orbeName = 'orbe légendaire';
                orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png'; // Temporaire
                break;
            default:
                console.error('❌ showSpellUnequipModal: Type d\'orbe inconnu', orbeType);
                return;
        }

        // Stocker les informations du déséquipement
        window.currentSpellUnequip = {
            slot: slot,
            orbeId: orbeId,
            orbeType: orbeType,
            spellId: spellId
        };

        text.textContent = `Voulez-vous vraiment déséquiper votre ${orbeName} ?`;
        modal.style.display = 'block';
    }

    // Fonction pour afficher la modal d'amélioration
    function showSpellUpgradeModal(spellId, slotIndex, orbeType) {
        console.log('🔧 showSpellUpgradeModal: Début', { spellId, slotIndex, orbeType });
        
        const modal = document.getElementById('spell-upgrade-modal');
        const orbeImg = document.getElementById('spell-upgrade-orbe-img');
        const text = document.getElementById('spell-upgrade-text');
        
        // Définir l'orbe selon le type
        let orbeId, orbeName;
        switch(orbeType) {
            case 'atypique':
                orbeId = 'orbe_atypique_sort_niveau10';
                orbeName = 'orbe atypique';
                orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png';
                break;
            case 'rare':
                orbeId = 'orbe_rare_sort_niveau10';
                orbeName = 'orbe rare';
                orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png'; // Temporaire
                break;
            case 'epique':
                orbeId = 'orbe_epique_sort_niveau10';
                orbeName = 'orbe épique';
                orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png'; // Temporaire
                break;
            case 'legendaire':
                orbeId = 'orbe_legendaire_sort_niveau10';
                orbeName = 'orbe légendaire';
                orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png'; // Temporaire
                break;
            default:
                return;
        }

        // Vérifier si l'orbe est dans l'inventaire
        if (!hasOrbeInInventory(orbeId)) {
            text.textContent = `Vous n'avez pas d'${orbeName} dans votre inventaire.`;
            return;
        }

        // Stocker les informations de l'amélioration
        window.currentSpellUpgrade = {
            spellId: spellId,
            slotIndex: slotIndex,
            orbeType: orbeType,
            orbeId: orbeId
        };

        text.textContent = `Voulez-vous équiper votre ${orbeName} ?`;
        modal.style.display = 'block';
    }

    // Fonction pour appliquer le déséquipement
    function applySpellUnequip() {
        const unequip = window.currentSpellUnequip;
        if (!unequip) {
            console.log('❌ applySpellUnequip: Aucun déséquipement en cours');
            return;
        }
        
        console.log('🔧 applySpellUnequip: Début du déséquipement', unequip);
        
        // Retirer l'orbe du slot
        removeOrbeFromSlot(unequip.slot);
        
        // Fermer la modal
        document.getElementById('spell-upgrade-modal').style.display = 'none';
        window.currentSpellUnequip = null;
        
        console.log('✅ applySpellUnequip: Déséquipement terminé');
    }

    // Fonction pour appliquer l'amélioration
    function applySpellUpgrade() {
        const upgrade = window.currentSpellUpgrade;
        if (!upgrade) {
            console.log('❌ applySpellUpgrade: Aucun upgrade en cours');
            return;
        }
        
        console.log('🔧 applySpellUpgrade: Début de l\'amélioration', upgrade);

        // Retirer l'orbe de l'inventaire
        console.log('🔍 applySpellUpgrade: Tentative de retrait de l\'orbe', upgrade.orbeId);
        if (removeOrbeFromInventory(upgrade.orbeId)) {
            console.log('✅ applySpellUpgrade: Orbe retiré avec succès');
            // Appliquer l'amélioration au sort
            const spellSlot = document.querySelector(`.sort-upgrade-slot[data-spell="${upgrade.spellId}"][data-slot="${upgrade.slotIndex}"]`);
            console.log('🔍 applySpellUpgrade: Recherche du slot', upgrade.spellId, upgrade.slotIndex, 'Slot trouvé:', !!spellSlot);
            if (spellSlot) {
                // Créer l'image de l'orbe dans le slot
                const orbeImg = document.createElement('img');
                orbeImg.src = `assets/objets/orbesatypiquesortniveau10.png`;
                orbeImg.style.width = '32px';
                orbeImg.style.height = '32px';
                orbeImg.style.objectFit = 'contain';
                
                // Vider le slot et ajouter l'orbe
                spellSlot.innerHTML = '';
                spellSlot.appendChild(orbeImg);
                spellSlot.classList.add('upgraded');
                spellSlot.style.borderColor = '#4e9cff';
                
                // Stocker les informations de l'orbe dans le slot pour pouvoir le retirer plus tard
                spellSlot.setAttribute('data-orbe-id', upgrade.orbeId);
                spellSlot.setAttribute('data-orbe-type', upgrade.orbeType);
                
                // Appliquer les bonus de dégâts selon le type d'orbe
                console.log('🎯 applySpellUpgrade: Application des bonus de dégâts', upgrade.spellId, upgrade.orbeType);
                applySpellDamageBonus(upgrade.spellId, upgrade.orbeType);
                
                // Sauvegarder l'état des orbes équipés
                console.log('💾 applySpellUpgrade: Sauvegarde des orbes équipés');
                saveSpellUpgrades();
                
                console.log(`✅ Sort ${upgrade.spellId} amélioré avec ${upgrade.orbeType} dans le slot ${upgrade.slotIndex}`);
            }

            // Mettre à jour l'inventaire
            if (typeof updateAllGrids === 'function') {
                updateAllGrids();
            }
        } else {
            console.error('❌ applySpellUpgrade: Impossible de retirer l\'orbe de l\'inventaire');
        }

        // Fermer la modal
        document.getElementById('spell-upgrade-modal').style.display = 'none';
        window.currentSpellUpgrade = null;
    }
    
    // Fonction pour sauvegarder les orbes équipés
    function saveSpellUpgrades() {
        if (!window.currentCharacterId) {
            return;
        }
        
        const upgrades = [];
        const upgradeSlots = document.querySelectorAll('.sort-upgrade-slot.upgraded');
        
        upgradeSlots.forEach(slot => {
            const spellId = slot.getAttribute('data-spell');
            const slotIndex = slot.getAttribute('data-slot');
            const orbeId = slot.getAttribute('data-orbe-id');
            const orbeType = slot.getAttribute('data-orbe-type');
            
            if (spellId && slotIndex && orbeId && orbeType) {
                upgrades.push({
                    spellId: spellId,
                    slotIndex: parseInt(slotIndex),
                    orbeId: orbeId,
                    orbeType: orbeType
                });
            }
        });
        
        const saveKey = `monrpg_spell_upgrades_${window.currentCharacterId}`;
        localStorage.setItem(saveKey, JSON.stringify(upgrades));
    }
    
    // Fonction pour charger les orbes équipés
    function loadSpellUpgrades() {
        if (!window.currentCharacterId) {
            return;
        }
        
        const saveKey = `monrpg_spell_upgrades_${window.currentCharacterId}`;
        const savedUpgrades = localStorage.getItem(saveKey);
        
        if (savedUpgrades) {
            try {
                const upgrades = JSON.parse(savedUpgrades);
                
                upgrades.forEach(upgrade => {
                    const spellSlot = document.querySelector(`.sort-upgrade-slot[data-spell="${upgrade.spellId}"][data-slot="${upgrade.slotIndex}"]`);
                    if (spellSlot) {
                        // Créer l'image de l'orbe dans le slot
                        const orbeImg = document.createElement('img');
                        orbeImg.src = `assets/objets/orbesatypiquesortniveau10.png`;
                        orbeImg.style.width = '32px';
                        orbeImg.style.height = '32px';
                        orbeImg.style.objectFit = 'contain';
                        
                        // Vider le slot et ajouter l'orbe
                        spellSlot.innerHTML = '';
                        spellSlot.appendChild(orbeImg);
                        spellSlot.classList.add('upgraded');
                        spellSlot.style.borderColor = '#4e9cff';
                        
                        // Stocker les informations de l'orbe
                        spellSlot.setAttribute('data-orbe-id', upgrade.orbeId);
                        spellSlot.setAttribute('data-orbe-type', upgrade.orbeType);
                        
                        // Appliquer les bonus de dégâts
                        applySpellDamageBonus(upgrade.spellId, upgrade.orbeType);
                    }
                });
            } catch (error) {
                console.error('Erreur lors du chargement des orbes équipés:', error);
            }
        }
    }
    
    // Fonction pour appliquer les bonus de dégâts aux sorts
    function applySpellDamageBonus(spellId, orbeType) {
        console.log('🎯 applySpellDamageBonus: Début', spellId, orbeType);
        let damageMultiplier = 1;
        
        // Définir le multiplicateur selon le type d'orbe
        switch(orbeType) {
            case 'atypique':
                damageMultiplier = 1.5; // +50%
                console.log('🎯 applySpellDamageBonus: Multiplicateur atypique = 1.5 (+50%)');
                break;
            case 'rare':
                damageMultiplier = 2.0; // +100%
                console.log('🎯 applySpellDamageBonus: Multiplicateur rare = 2.0 (+100%)');
                break;
            case 'epique':
                damageMultiplier = 2.5; // +150%
                console.log('🎯 applySpellDamageBonus: Multiplicateur épique = 2.5 (+150%)');
                break;
            case 'legendaire':
                damageMultiplier = 3.0; // +200%
                console.log('🎯 applySpellDamageBonus: Multiplicateur légendaire = 3.0 (+200%)');
                break;
            default:
                console.error('❌ applySpellDamageBonus: Type d\'orbe inconnu', orbeType);
                return;
        }
        
        // Appliquer les bonus selon le sort
        console.log('🎯 applySpellDamageBonus: Application pour le sort', spellId);
        switch(spellId) {
            case 'punch':
                // Coup de Poing : 3-6 → 5-9 (arrondi)
                window.punchDamageMin = Math.round(3 * damageMultiplier);
                window.punchDamageMax = Math.round(6 * damageMultiplier);
                console.log('🎯 applySpellDamageBonus: Punch - Base 3-6 → Amélioré', window.punchDamageMin + '-' + window.punchDamageMax);
                updateSpellDamageDisplay('punch', window.punchDamageMin, window.punchDamageMax);
                break;
            case 'explosive':
                // Coup Explosif : 12-20 → 18-30 (arrondi)
                window.explosiveDamageMin = Math.round(12 * damageMultiplier);
                window.explosiveDamageMax = Math.round(20 * damageMultiplier);
                console.log('🎯 applySpellDamageBonus: Explosive - Base 12-20 → Amélioré', window.explosiveDamageMin + '-' + window.explosiveDamageMax);
                updateSpellDamageDisplay('explosive', window.explosiveDamageMin, window.explosiveDamageMax);
                break;
            case 'triple':
                // Triple Coup : 6-10 (x3) → 9-15 (x3) (arrondi)
                window.tripleDamageMin = Math.round(6 * damageMultiplier);
                window.tripleDamageMax = Math.round(10 * damageMultiplier);
                console.log('🎯 applySpellDamageBonus: Triple - Base 6-10 → Amélioré', window.tripleDamageMin + '-' + window.tripleDamageMax);
                updateSpellDamageDisplay('triple', window.tripleDamageMin, window.tripleDamageMax);
                break;
            case 'poingheal':
                // Poingheal : 10-15 → 15-23 (arrondi)
                window.poinghealDamageMin = Math.round(10 * damageMultiplier);
                window.poinghealDamageMax = Math.round(15 * damageMultiplier);
                console.log('🎯 applySpellDamageBonus: Poingheal - Base 10-15 → Amélioré', window.poinghealDamageMin + '-' + window.poinghealDamageMax);
                updateSpellDamageDisplay('poingheal', window.poinghealDamageMin, window.poinghealDamageMax);
                break;
            case 'rassemblement':
                // Rassemblement : 10-15 → 15-23 (arrondi)
                window.rassemblementDamageMin = Math.round(10 * damageMultiplier);
                window.rassemblementDamageMax = Math.round(15 * damageMultiplier);
                console.log('🎯 applySpellDamageBonus: Rassemblement - Base 10-15 → Amélioré', window.rassemblementDamageMin + '-' + window.rassemblementDamageMax);
                updateSpellDamageDisplay('rassemblement', window.rassemblementDamageMin, window.rassemblementDamageMax);
                break;
            default:
                console.error('❌ applySpellDamageBonus: Sort inconnu', spellId);
                return;
        }
        
        console.log(`Bonus de dégâts ${orbeType} appliqué au sort ${spellId}: +${Math.round((damageMultiplier - 1) * 100)}%`);
        console.log(`Variables mises à jour: window.${spellId}DamageMin = ${window[spellId + 'DamageMin']}, window.${spellId}DamageMax = ${window[spellId + 'DamageMax']}`);
    }
    
    // Fonction pour mettre à jour l'affichage des dégâts
    function updateSpellDamageDisplay(spellId, minDamage, maxDamage) {
        let damageElement;
        
        switch(spellId) {
            case 'punch':
                // Chercher dans le panel punch
                const punchPanel = document.getElementById('sort-damage-panel-punch');
                if (punchPanel) {
                    damageElement = punchPanel.querySelector('.sort-detail-damage-value');
                    if (damageElement) {
                        damageElement.textContent = `${minDamage}-${maxDamage}`;
                        console.log(`Dégâts punch mis à jour: ${minDamage}-${maxDamage}`);
                    }
                }
                break;
            case 'explosive':
                // Chercher dans le panel explosive
                const explosivePanel = document.getElementById('sort-damage-panel-explosive');
                if (explosivePanel) {
                    damageElement = explosivePanel.querySelector('.sort-detail-damage-value');
                    if (damageElement) {
                        damageElement.textContent = `${minDamage}-${maxDamage}`;
                        console.log(`Dégâts explosive mis à jour: ${minDamage}-${maxDamage}`);
                    }
                }
                break;
            case 'triple':
                // Chercher dans le panel triple
                const triplePanel = document.getElementById('sort-damage-panel-triple');
                if (triplePanel) {
                    damageElement = triplePanel.querySelector('.sort-detail-damage-value');
                    if (damageElement) {
                        damageElement.textContent = `${minDamage}-${maxDamage} (x3)`;
                        console.log(`Dégâts triple mis à jour: ${minDamage}-${maxDamage} (x3)`);
                    }
                }
                break;
            case 'poingheal':
                // Chercher dans le panel poingheal
                const poinghealPanel = document.getElementById('sort-damage-panel-poingheal');
                if (poinghealPanel) {
                    damageElement = poinghealPanel.querySelector('.sort-detail-damage-value');
                    if (damageElement) {
                        damageElement.textContent = `${minDamage}-${maxDamage}`;
                        console.log(`Dégâts poingheal mis à jour: ${minDamage}-${maxDamage}`);
                    }
                }
                break;
            case 'rassemblement':
                // Chercher dans le panel rassemblement
                const rassemblementPanel = document.getElementById('sort-damage-panel-rassemblement');
                if (rassemblementPanel) {
                    damageElement = rassemblementPanel.querySelector('.sort-detail-damage-value');
                    if (damageElement) {
                        damageElement.textContent = `${minDamage}-${maxDamage}`;
                        console.log(`Dégâts rassemblement mis à jour: ${minDamage}-${maxDamage}`);
                    }
                }
                break;
        }
    }

    // Initialiser les événements des slots d'amélioration
    function initSpellUpgradeSlots() {
        const upgradeSlots = document.querySelectorAll('.sort-upgrade-slot');
        console.log('🔧 initSpellUpgradeSlots: Nombre de slots trouvés:', upgradeSlots.length);
        
        upgradeSlots.forEach((slot, globalIndex) => {
            // Ajouter les attributs data pour identifier le sort et le slot
            const spellContainer = slot.closest('.sort-upgrade-slots');
            let spellId = '';
            let localIndex = 0;
            
            if (spellContainer.classList.contains('sort-upgrade-slots-punch')) {
                spellId = 'punch';
                // Calculer l'index local (0-4) pour les slots punch
                localIndex = globalIndex % 5;
            } else if (spellContainer.classList.contains('sort-upgrade-slots-explosive')) {
                spellId = 'explosive';
                // Calculer l'index local (0-4) pour les slots explosive
                localIndex = (globalIndex - 5) % 5;
            } else if (spellContainer.classList.contains('sort-upgrade-slots-triple')) {
                spellId = 'triple';
                // Calculer l'index local (0-4) pour les slots triple
                localIndex = (globalIndex - 10) % 5;
            } else if (spellContainer.classList.contains('sort-upgrade-slots-poingheal')) {
                spellId = 'poingheal';
                // Calculer l'index local (0-4) pour les slots poingheal
                localIndex = (globalIndex - 15) % 5;
            } else if (spellContainer.classList.contains('sort-upgrade-slots-rassemblement')) {
                spellId = 'rassemblement';
                // Calculer l'index local (0-4) pour les slots rassemblement
                localIndex = (globalIndex - 20) % 5;
            }
            
            console.log('🔧 Slot global', globalIndex, '- Container classes:', spellContainer.className, '- SpellId:', spellId, '- LocalIndex:', localIndex);
            
            slot.setAttribute('data-spell', spellId);
            slot.setAttribute('data-slot', localIndex);
            
            // Ajouter l'événement de clic gauche pour équiper
            slot.addEventListener('click', (e) => {
                // Si le slot est déjà amélioré, ne rien faire au clic gauche
                if (slot.classList.contains('upgraded')) {
                    console.log('🔧 Slot déjà amélioré, clic ignoré');
                    return;
                }
                
                const slotIndex = parseInt(slot.getAttribute('data-slot'));
                let orbeType = '';
                
                // Déterminer le type d'orbe selon le slot
                switch(slotIndex) {
                    case 0: orbeType = 'atypique'; break;
                    case 1: orbeType = 'rare'; break;
                    case 2: orbeType = 'epique'; break;
                    case 3: orbeType = 'legendaire'; break;
                    case 4: orbeType = 'mythique'; break; // Réservé pour l'instant
                    default: return;
                }
                
                if (orbeType === 'mythique') {
                    console.log('Slot mythique réservé pour l\'instant');
                    return;
                }
                
                console.log('🔧 Clic sur slot d\'amélioration:', { spellId, slotIndex, orbeType });
                showSpellUpgradeModal(spellId, slotIndex, orbeType);
            });
            
            // Ajouter l'événement de double-clic pour retirer l'orbe
            slot.addEventListener('dblclick', (e) => {
                e.preventDefault(); // Empêcher la sélection de texte
                
                // Si le slot n'est pas amélioré, ne rien faire
                if (!slot.classList.contains('upgraded')) {
                    return;
                }
                
                // Afficher la modal de confirmation pour retirer l'orbe
                showSpellUnequipModal(slot);
            });
        });
    }
    
    // Fonction pour retirer l'orbe d'un slot
    function removeOrbeFromSlot(slot) {
        const orbeId = slot.getAttribute('data-orbe-id');
        const orbeType = slot.getAttribute('data-orbe-type');
        const spellId = slot.getAttribute('data-spell');
        
        console.log('🔧 removeOrbeFromSlot: Début', { orbeId, orbeType, spellId });
        
        // Vider le slot
        slot.innerHTML = '';
        slot.classList.remove('upgraded');
        slot.style.borderColor = '#444a55';
        slot.removeAttribute('data-orbe-id');
        slot.removeAttribute('data-orbe-type');
        
        // Retirer les bonus de dégâts
        if (spellId && orbeType) {
            console.log('🔧 removeOrbeFromSlot: Retrait des bonus de dégâts');
            removeSpellDamageBonus(spellId, orbeType);
        }
        
        // Remettre l'orbe dans l'inventaire
        if (orbeId && typeof addItemToInventory === 'function') {
            console.log('🔧 removeOrbeFromSlot: Remise de l\'orbe dans l\'inventaire');
            const result = addItemToInventory(orbeId, 'equipement');
            if (result) {
                console.log(`✅ Orbe ${orbeType} remis dans l'inventaire`);
            } else {
                console.error('❌ Inventaire plein, impossible de remettre l\'orbe');
            }
        }
        
        // Sauvegarder l'état des orbes équipés
        console.log('🔧 removeOrbeFromSlot: Sauvegarde des orbes équipés');
        saveSpellUpgrades();
        
        // Mettre à jour l'inventaire
        if (typeof updateAllGrids === 'function') {
            console.log('🔧 removeOrbeFromSlot: Mise à jour de l\'inventaire');
            updateAllGrids();
        }
        
        console.log('✅ removeOrbeFromSlot: Déséquipement terminé');
    }
    
    // Fonction pour retirer les bonus de dégâts
    function removeSpellDamageBonus(spellId, orbeType) {
        console.log(`Tentative de retrait du bonus ${orbeType} pour le sort ${spellId}`);
        
        // Remettre les dégâts de base
        switch(spellId) {
            case 'punch':
                window.punchDamageMin = 3;
                window.punchDamageMax = 6;
                updateSpellDamageDisplay('punch', 3, 6);
                break;
            case 'explosive':
                window.explosiveDamageMin = 12;
                window.explosiveDamageMax = 20;
                updateSpellDamageDisplay('explosive', 12, 20);
                break;
            case 'triple':
                window.tripleDamageMin = 6;
                window.tripleDamageMax = 10;
                updateSpellDamageDisplay('triple', 6, 10);
                break;
            case 'poingheal':
                window.poinghealDamageMin = 10;
                window.poinghealDamageMax = 15;
                updateSpellDamageDisplay('poingheal', 10, 15);
                break;
            case 'rassemblement':
                window.rassemblementDamageMin = 10;
                window.rassemblementDamageMax = 15;
                updateSpellDamageDisplay('rassemblement', 10, 15);
                break;
        }
        
        console.log(`Bonus de dégâts ${orbeType} retiré du sort ${spellId}`);
    }

    // Initialiser les événements de la modal
    function initSpellUpgradeModalEvents() {
        const modal = document.getElementById('spell-upgrade-modal');
        const closeBtn = document.getElementById('close-spell-upgrade');
        const yesBtn = document.getElementById('spell-upgrade-yes');
        const noBtn = document.getElementById('spell-upgrade-no');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                window.currentSpellUpgrade = null;
            });
        }

        if (yesBtn) {
            yesBtn.addEventListener('click', () => {
                // Vérifier si c'est un équipement ou un déséquipement
                if (window.currentSpellUpgrade) {
                    applySpellUpgrade();
                } else if (window.currentSpellUnequip) {
                    applySpellUnequip();
                }
            });
        }

        if (noBtn) {
            noBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                window.currentSpellUpgrade = null;
                window.currentSpellUnequip = null;
            });
        }

        // Fermer en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                window.currentSpellUpgrade = null;
                window.currentSpellUnequip = null;
            }
        });
    }

    // Initialiser le système
    initSpellUpgradeSlots();
    initSpellUpgradeModalEvents();
    
    // Charger les orbes équipés au démarrage
    setTimeout(() => {
        loadSpellUpgrades();
    }, 100);
}

// Fonction de diagnostic des performances
function diagnosePerformance() {
    // Diagnostic des performances
}

// Export de la fonction de diagnostic
window.diagnosePerformance = diagnosePerformance;

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

// Chat System
let chatOpen = false;

function initChat() {
    const chatButton = document.getElementById('chat-button');
    const chatWindow = document.getElementById('chat-window');
    const closeChat = document.getElementById('close-chat');

    chatButton.addEventListener('click', () => {
        if (chatOpen) {
            closeChatWindow();
        } else {
            openChatWindow();
        }
    });

    closeChat.addEventListener('click', closeChatWindow);
}

function openChatWindow() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.classList.remove('chat-hidden');
    chatWindow.classList.add('chat-visible');
    chatOpen = true;
}

function closeChatWindow() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.classList.remove('chat-visible');
    chatWindow.classList.add('chat-hidden');
    chatOpen = false;
}

function addChatMessage(message, type = 'system') {
    const chatMessages = document.getElementById('chat-messages');
    
    // Vérifier si l'élément chat existe avant d'essayer d'ajouter le message
    if (!chatMessages) {
        console.log('Élément chat-messages non trouvé, message ignoré:', message);
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    messageDiv.textContent = message;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Limiter le nombre de messages (garder les 20 derniers)
    while (chatMessages.children.length > 20) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
}

// Gestion du cooldown visuel sur les slots de sort
function startSpellCooldown(slotId, duration) {
  const slot = document.getElementById(slotId);
  const cooldown = slot.querySelector('.spell-cooldown');
  if (!slot || !cooldown) return;
  // Annule le cooldown précédent si existant
  if (slot._cooldownInterval) {
    clearInterval(slot._cooldownInterval);
    slot._cooldownInterval = null;
  }
  slot.classList.add('cooldown');
  let remaining = duration;
  cooldown.textContent = remaining.toFixed(1);
  slot._cooldownInterval = setInterval(() => {
    remaining -= 0.1;
    if (remaining <= 0) {
      slot.classList.remove('cooldown');
      cooldown.textContent = '';
      clearInterval(slot._cooldownInterval);
      slot._cooldownInterval = null;
    } else {
      cooldown.textContent = remaining.toFixed(1);
    }
  }, 100);
}

// Calcule les dégâts d'un sort avec bonus de force et coup critique
function computeSpellDamage(baseMin, baseMax) {
  console.log(`🎲 computeSpellDamage: Calcul avec baseMin=${baseMin}, baseMax=${baseMax}`);
  const base = Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;
  const bonus = 1 + (player.force * 0.05); // 1 de force = 5% de dégâts en plus
  let damage = Math.floor(base * bonus);
  let isCrit = false;
  if (typeof isPlayerCrit === 'function' && isPlayerCrit()) {
    const critMultiplier = 1.5;
    const critBonus = (typeof getPlayerCritDamage === 'function') ? getPlayerCritDamage() : 0;
    damage = Math.floor(damage * critMultiplier * (1 + critBonus));
    isCrit = true;
  }
  console.log(`🎲 computeSpellDamage: Résultat - base=${base}, bonus=${bonus}, damage=${damage}, isCrit=${isCrit}`);
  return { damage, isCrit };
}

// Lancer le sort Coup de poing explosif (slot 2)
function castExplosivePunch() {
  const slot2 = document.getElementById('spell-slot-2');
  if (slot2 && !slot2.classList.contains('cooldown')) {
    if (typeof attackTarget === 'object' && attackTarget && Math.abs(player.x - attackTarget.x) + Math.abs(player.y - attackTarget.y) === 1 && attackTarget.hp > 0) {
      // Démarrer le cooldown immédiatement pour éviter les abus
      startSpellCooldown('spell-slot-2', 15.0);
      // Utiliser les dégâts améliorés s'ils existent, sinon les dégâts de base
      let minDamage = 12;
      let maxDamage = 20;
      if (window.explosiveDamageMin !== 12 || window.explosiveDamageMax !== 20) {
        minDamage = window.explosiveDamageMin;
        maxDamage = window.explosiveDamageMax;
        console.log(`⚔️ Coup Explosif - Dégâts améliorés utilisés: ${minDamage}-${maxDamage} (base: 12-20)`);
        console.log(`⚔️ Variables actuelles: window.explosiveDamageMin=${window.explosiveDamageMin}, window.explosiveDamageMax=${window.explosiveDamageMax}`);
      } else {
        console.log(`⚔️ Coup Explosif - Dégâts de base utilisés: ${minDamage}-${maxDamage}`);
        console.log(`⚔️ Variables actuelles: window.explosiveDamageMin=${window.explosiveDamageMin}, window.explosiveDamageMax=${window.explosiveDamageMax}`);
      }
      const { damage, isCrit } = computeSpellDamage(minDamage, maxDamage);
      
      // Gain d'XP de force à chaque attaque
      if (typeof gainStatXP === "function") {
        gainStatXP('force', 1);
      }
      if (isCrit) {
        // Gain d'XP d'agilité lors d'un coup critique
        if (typeof gainStatXP === "function") {
          gainStatXP('agilite', 1);
        }
      }
      
      // Attaque du joueur
      const baseDamage = damage;
      // Prendre en compte la défense du monstre, minimum 1 dégât
      const finalDamage = Math.max(1, baseDamage - (attackTarget.defense || 0));
      attackTarget.hp -= finalDamage;
      
      // DÉCLENCHER L'AGGRO SEULEMENT LORS D'UNE VRAIE ATTAQUE
      attackTarget.aggro = true;
      attackTarget.aggroTarget = player;
      attackTarget.lastCombat = Date.now(); // Mettre à jour le timer de combat pour maintenir l'aggro
      player.inCombat = true;
      
      if (typeof displayDamage === 'function') {
        displayDamage(attackTarget.px, attackTarget.py, finalDamage, isCrit ? 'critique' : 'damage', false);
      }
      if (typeof createExplosionEffect === 'function') {
        createExplosionEffect(attackTarget.px, attackTarget.py);
      }
      
      // Aligner le monstre sur sa case pendant le combat
      // Système de replacement supprimé pour la nouvelle IA des monstres

      // Riposte du monstre si vivant (sauf pour les slimes et boss slime qui ont leur propre système d'attaque)
      if (attackTarget.hp > 0 && attackTarget.type !== "slime" && attackTarget.type !== "slimeboss") {
        // Cooldown de riposte pour éviter les attaques doubles
        const riposteCooldown = 1000; // 1 seconde de cooldown
        if (!attackTarget.lastRiposte || (currentTime - attackTarget.lastRiposte) >= riposteCooldown) {
          // Calcul des dégâts du monstre : dégâts de base + force du monstre avec variation de 25%
          const monsterBaseDamage = attackTarget.damage !== undefined ? attackTarget.damage : 3;
          const monsterTotalDamage = monsterBaseDamage + (attackTarget.force || 0);
          const variation = 0.25; // 25% de variation
          const randomFactor = 1 + (Math.random() * 2 - 1) * variation; // Entre 0.75 et 1.25
          const monsterDamage = Math.max(1, Math.floor(monsterTotalDamage * randomFactor) - player.defense);
          player.life -= monsterDamage;
          if (player.life < 0) player.life = 0;
          
          // Afficher les dégâts reçus par le joueur
          if (typeof displayDamage === "function") {
            displayDamage(player.px, player.py, monsterDamage, 'damage', true);
          }
          
          // XP défense pour avoir reçu des dégâts
          if (typeof gainStatXP === "function") {
            gainStatXP('defense', 1);
          }
          
          // Marquer le temps de la dernière riposte
          attackTarget.lastRiposte = currentTime;
        }
      }

      // Monstre mort
      if (attackTarget.hp <= 0) {
        if (typeof release === "function") release(attackTarget.x, attackTarget.y);
        
        // Afficher l'XP gagné au-dessus du joueur
        if (typeof displayDamage === "function") {
          displayDamage(player.px, player.py, `+${attackTarget.xpValue || 0} XP`, 'xp', true);
        }
        
        if (typeof gainXP === "function") gainXP(attackTarget.xpValue || 0);
        
        // Déclencher le système de loot
        if (typeof triggerLoot === 'function') {
          triggerLoot(attackTarget);
        }
        
        if (typeof killMonster === "function") {
          killMonster(attackTarget);
        }
        attackTarget.aggro = false;
        attackTarget.aggroTarget = null;
        attackTarget = null;
        window.attackTarget = null;
        player.inCombat = false;
      }
      
      startSpellCooldown('spell-slot-2', 15.0);
    }
  }
}

// Fonction pour gérer le combo Triple Coup de Poing
function handleTriplePunchCombo() {
  const now = Date.now();
  const combo = window.triplePunchCombo;
  
  // Si le combo a expiré, le réinitialiser
  if (combo.isActive && (now - combo.lastPressTime) > combo.comboTimeout) {
    console.log('🔧 Triple Coup: Combo expiré, réinitialisation');
    combo.currentStep = 0;
    combo.isActive = false;
  }
  
  // Vérifier les conditions de base
  const slot3 = document.getElementById('spell-slot-3');
  if (!slot3 || slot3.classList.contains('cooldown')) {
    console.log('🔧 Triple Coup: Sort en cooldown ou non disponible');
    return;
  }
  
  if (!attackTarget || attackTarget.hp <= 0 || 
      Math.abs(player.x - attackTarget.x) + Math.abs(player.y - attackTarget.y) !== 1) {
    console.log('🔧 Triple Coup: Cible invalide ou trop éloignée');
    // Réinitialiser le combo si pas de cible valide
    combo.currentStep = 0;
    combo.isActive = false;
    return;
  }
  
  // Démarrer ou continuer le combo
  if (!combo.isActive) {
    console.log('🔧 Triple Coup: Début du combo');
    combo.isActive = true;
    combo.currentStep = 1;
    combo.lastPressTime = now;
    
    // NE PAS démarrer le cooldown ici, seulement à la fin du combo
  } else {
    combo.currentStep++;
    combo.lastPressTime = now;
    console.log(`🔧 Triple Coup: Combo étape ${combo.currentStep}/3`);
  }
  
  // Exécuter le coup correspondant à l'étape
  executeTriplePunchStep(combo.currentStep);
  
  // Si le combo est complet, le réinitialiser ET démarrer le cooldown
  if (combo.currentStep >= 3) {
    console.log('🔧 Triple Coup: Combo terminé, démarrage du cooldown');
    startSpellCooldown('spell-slot-3', 10.0); // Cooldown seulement à la fin
    combo.currentStep = 0;
    combo.isActive = false;
  }
}

// Fonction pour exécuter une étape du combo
function executeTriplePunchStep(step) {
  if (!attackTarget || attackTarget.hp <= 0) {
    console.log(`🔧 Triple Coup étape ${step}: Cible invalide`);
    return;
  }
  
  console.log(`🔧 Triple Coup étape ${step}: Exécution`);
  
  // Utiliser les dégâts améliorés s'ils existent, sinon les dégâts de base
  let minDamage = 6;
  let maxDamage = 10;
  if (window.tripleDamageMin !== 6 || window.tripleDamageMax !== 10) {
    minDamage = window.tripleDamageMin;
    maxDamage = window.tripleDamageMax;
    console.log(`⚔️ Triple Coup (${step}) - Dégâts améliorés utilisés: ${minDamage}-${maxDamage} (base: 6-10)`);
  } else {
    console.log(`⚔️ Triple Coup (${step}) - Dégâts de base utilisés: ${minDamage}-${maxDamage}`);
  }
  
  const { damage, isCrit } = computeSpellDamage(minDamage, maxDamage);
  
  // Gain d'XP de force à chaque attaque
  if (typeof gainStatXP === "function") {
    gainStatXP('force', 1);
  }
  if (isCrit) {
    // Gain d'XP d'agilité lors d'un coup critique
    if (typeof gainStatXP === "function") {
      gainStatXP('agilite', 1);
    }
  }
  
  // Attaque du joueur
  const baseDamage = damage;
  // Prendre en compte la défense du monstre, minimum 1 dégât
  const finalDamage = Math.max(1, baseDamage - (attackTarget.defense || 0));
  attackTarget.hp -= finalDamage;
  
  // DÉCLENCHER L'AGGRO SEULEMENT LORS D'UNE VRAIE ATTAQUE
  attackTarget.aggro = true;
  attackTarget.aggroTarget = player;
  attackTarget.lastCombat = Date.now(); // Mettre à jour le timer de combat pour maintenir l'aggro
  player.inCombat = true;
  
  if (typeof displayDamage === 'function') {
    displayDamage(attackTarget.px, attackTarget.py, finalDamage, isCrit ? 'critique' : 'damage', false);
  }
  
  // Aligner le monstre sur sa case pendant le combat
  // Système de replacement supprimé pour la nouvelle IA des monstres

  // Riposte du monstre si vivant (sauf pour les slimes et boss slime qui ont leur propre système d'attaque)
  if (attackTarget.hp > 0 && attackTarget.type !== "slime" && attackTarget.type !== "slimeboss") {
    // Cooldown de riposte pour éviter les attaques doubles
    const riposteCooldown = 1000; // 1 seconde de cooldown
    if (!attackTarget.lastRiposte || (Date.now() - attackTarget.lastRiposte) >= riposteCooldown) {
      // Calcul des dégâts du monstre : dégâts de base + force du monstre avec variation de 25%
      const monsterBaseDamage = attackTarget.damage !== undefined ? attackTarget.damage : 3;
      const monsterTotalDamage = monsterBaseDamage + (attackTarget.force || 0);
      const variation = 0.25; // 25% de variation
      const randomFactor = 1 + (Math.random() * 2 - 1) * variation; // Entre 0.75 et 1.25
      const monsterDamage = Math.max(1, Math.floor(monsterTotalDamage * randomFactor) - player.defense);
      player.life -= monsterDamage;
      if (player.life < 0) player.life = 0;
      
      // Afficher les dégâts reçus par le joueur
      if (typeof displayDamage === "function") {
        displayDamage(player.px, player.py, monsterDamage, 'damage', true);
      }
      
      // XP défense pour avoir reçu des dégâts
      if (typeof gainStatXP === "function") {
        gainStatXP('defense', 1);
      }
      
      // Marquer le temps de la dernière riposte
      attackTarget.lastRiposte = Date.now();
    }
  }
  
  // Vérifier si le monstre meurt
  if (attackTarget.hp <= 0) {
    console.log(`🔧 Triple Coup étape ${step}: Monstre vaincu`);
    
    // Appeler killMonster immédiatement
    if (typeof killMonster === "function") {
      killMonster(attackTarget);
    }
    
    // Nettoyer les références
    if (typeof release === "function") release(attackTarget.x, attackTarget.y);
    if (typeof displayDamage === "function") {
      displayDamage(player.px, player.py, `+${attackTarget.xpValue || 0} XP`, 'xp', true);
    }
    if (typeof gainXP === "function") gainXP(attackTarget.xpValue || 0);
    if (typeof triggerLoot === 'function') {
      triggerLoot(attackTarget);
    }
    attackTarget.aggro = false;
    attackTarget.aggroTarget = null;
    attackTarget = null;
    window.attackTarget = null;
    player.inCombat = false;
    
    // Réinitialiser le combo ET déclencher le cooldown car la cible est morte
    console.log('🔧 Triple Coup: Monstre vaincu, déclenchement du cooldown');
    startSpellCooldown('spell-slot-3', 10.0);
    window.triplePunchCombo.currentStep = 0;
    window.triplePunchCombo.isActive = false;
  }
}

// Lancer le sort Triple Coup de Poing (slot 3) - ANCIENNE VERSION (gardée pour compatibilité)
function castTriplePunch() {
  console.log('🔧 castTriplePunch: Début du lancement');
  const slot3 = document.getElementById('spell-slot-3');
  if (slot3 && !slot3.classList.contains('cooldown')) {
    if (typeof attackTarget === 'object' && attackTarget && Math.abs(player.x - attackTarget.x) + Math.abs(player.y - attackTarget.y) === 1 && attackTarget.hp > 0) {
      console.log('🔧 castTriplePunch: Conditions remplies, lancement du sort');
      // Démarrer le cooldown immédiatement pour éviter les abus
      startSpellCooldown('spell-slot-3', 10.0);
      
      // Premier coup
      setTimeout(() => {
        console.log('🔧 castTriplePunch: Premier coup - Variables actuelles:', {
          tripleDamageMin: window.tripleDamageMin,
          tripleDamageMax: window.tripleDamageMax
        });
        if (attackTarget && attackTarget.hp > 0) {
          // Utiliser les dégâts améliorés s'ils existent, sinon les dégâts de base
          let minDamage = 6;
          let maxDamage = 10;
          if (window.tripleDamageMin !== 6 || window.tripleDamageMax !== 10) {
            minDamage = window.tripleDamageMin;
            maxDamage = window.tripleDamageMax;
            console.log(`⚔️ Triple Coup (1er) - Dégâts améliorés utilisés: ${minDamage}-${maxDamage} (base: 6-10)`);
            console.log(`⚔️ Variables actuelles: window.tripleDamageMin=${window.tripleDamageMin}, window.tripleDamageMax=${window.tripleDamageMax}`);
          } else {
            console.log(`⚔️ Triple Coup (1er) - Dégâts de base utilisés: ${minDamage}-${maxDamage}`);
            console.log(`⚔️ Variables actuelles: window.tripleDamageMin=${window.tripleDamageMin}, window.tripleDamageMax=${window.tripleDamageMax}`);
          }
          const { damage: damage1, isCrit: isCrit1 } = computeSpellDamage(minDamage, maxDamage);
          attackTarget.hp -= damage1;
          if (typeof displayDamage === 'function') {
            displayDamage(attackTarget.px, attackTarget.py, damage1, isCrit1 ? 'critique' : 'damage', false);
          }
          
          // Vérifier si le monstre meurt après le premier coup
          if (attackTarget.hp <= 0) {
            // Appeler killMonster immédiatement
            if (typeof killMonster === "function") {
              killMonster(attackTarget);
            }
            
            // Nettoyer les références
            if (typeof release === "function") release(attackTarget.x, attackTarget.y);
            if (typeof displayDamage === "function") {
              displayDamage(player.px, player.py, `+${attackTarget.xpValue || 0} XP`, 'xp', true);
            }
            if (typeof gainXP === "function") gainXP(attackTarget.xpValue || 0);
            if (typeof triggerLoot === 'function') {
              triggerLoot(attackTarget);
            }
            attackTarget.aggro = false;
            attackTarget.aggroTarget = null;
            attackTarget = null;
            window.attackTarget = null;
            player.inCombat = false;
          }
        }
      }, 0);
      
      // Deuxième coup
      setTimeout(() => {
        if (attackTarget && attackTarget.hp > 0) {
          // Utiliser les dégâts améliorés s'ils existent, sinon les dégâts de base
          let minDamage = 6;
          let maxDamage = 10;
          if (window.tripleDamageMin !== 6 || window.tripleDamageMax !== 10) {
            minDamage = window.tripleDamageMin;
            maxDamage = window.tripleDamageMax;
            console.log(`⚔️ Triple Coup (2ème) - Dégâts améliorés utilisés: ${minDamage}-${maxDamage} (base: 6-10)`);
            console.log(`⚔️ Variables actuelles: window.tripleDamageMin=${window.tripleDamageMin}, window.tripleDamageMax=${window.tripleDamageMax}`);
          } else {
            console.log(`⚔️ Triple Coup (2ème) - Dégâts de base utilisés: ${minDamage}-${maxDamage}`);
            console.log(`⚔️ Variables actuelles: window.tripleDamageMin=${window.tripleDamageMin}, window.tripleDamageMax=${window.tripleDamageMax}`);
          }
          const { damage: damage2, isCrit: isCrit2 } = computeSpellDamage(minDamage, maxDamage);
          attackTarget.hp -= damage2;
          if (typeof displayDamage === 'function') {
            displayDamage(attackTarget.px, attackTarget.py, damage2, isCrit2 ? 'critique' : 'damage', false);
          }
          
          // Vérifier si le monstre meurt après le deuxième coup
          if (attackTarget.hp <= 0) {
            // Appeler killMonster immédiatement
            if (typeof killMonster === "function") {
              killMonster(attackTarget);
            }
            
            // Nettoyer les références
            if (typeof release === "function") release(attackTarget.x, attackTarget.y);
            if (typeof displayDamage === "function") {
              displayDamage(player.px, player.py, `+${attackTarget.xpValue || 0} XP`, 'xp', true);
            }
            if (typeof gainXP === "function") gainXP(attackTarget.xpValue || 0);
            if (typeof triggerLoot === 'function') {
              triggerLoot(attackTarget);
            }
            attackTarget.aggro = false;
            attackTarget.aggroTarget = null;
            attackTarget = null;
            window.attackTarget = null;
            player.inCombat = false;
          }
        }
      }, 300);
      
      // Troisième coup
      setTimeout(() => {
        if (attackTarget && attackTarget.hp > 0) {
          // Utiliser les dégâts améliorés s'ils existent, sinon les dégâts de base
          let minDamage = 6;
          let maxDamage = 10;
          if (window.tripleDamageMin !== 6 || window.tripleDamageMax !== 10) {
            minDamage = window.tripleDamageMin;
            maxDamage = window.tripleDamageMax;
            console.log(`⚔️ Triple Coup (3ème) - Dégâts améliorés utilisés: ${minDamage}-${maxDamage} (base: 6-10)`);
            console.log(`⚔️ Variables actuelles: window.tripleDamageMin=${window.tripleDamageMin}, window.tripleDamageMax=${window.tripleDamageMax}`);
          } else {
            console.log(`⚔️ Triple Coup (3ème) - Dégâts de base utilisés: ${minDamage}-${maxDamage}`);
            console.log(`⚔️ Variables actuelles: window.tripleDamageMin=${window.tripleDamageMin}, window.tripleDamageMax=${window.tripleDamageMax}`);
          }
          const { damage: damage3, isCrit: isCrit3 } = computeSpellDamage(minDamage, maxDamage);
          attackTarget.hp -= damage3;
          if (typeof displayDamage === 'function') {
            displayDamage(attackTarget.px, attackTarget.py, damage3, isCrit3 ? 'critique' : 'damage', false);
          }
          
          // Vérifier si le monstre meurt après le troisième coup
          if (attackTarget.hp <= 0) {
            // Appeler killMonster immédiatement
            if (typeof killMonster === "function") {
              killMonster(attackTarget);
            }
            
            // Nettoyer les références
            if (typeof release === "function") release(attackTarget.x, attackTarget.y);
            if (typeof displayDamage === "function") {
              displayDamage(player.px, player.py, `+${attackTarget.xpValue || 0} XP`, 'xp', true);
            }
            if (typeof gainXP === "function") gainXP(attackTarget.xpValue || 0);
            if (typeof triggerLoot === 'function') {
              triggerLoot(attackTarget);
            }
            attackTarget.aggro = false;
            attackTarget.aggroTarget = null;
            attackTarget = null;
            window.attackTarget = null;
            player.inCombat = false;
          }
        }
      }, 600);
    }
  }
}

// Fonction générique pour lancer un sort (clic ou clavier)
function castSpell(slotId, baseMin, baseMax, cooldown, effetSpecial) {
  if (!player.inCombat) return;
  
  // Vérifier si le sort est déverrouillé
  const spell = SPELLS[slotId];
  if (spell && !spell.unlocked) {
    if (typeof addChatMessage === 'function') {
      addChatMessage(`Niveau ${spell.levelRequired} requis pour ${spell.name}`, 'system');
    }
    return;
  }
  
  const slot = document.getElementById(slotId);
  if (slot && !slot.classList.contains('cooldown')) {
    if (typeof attackTarget === 'object' && attackTarget && Math.abs(player.x - attackTarget.x) + Math.abs(player.y - attackTarget.y) === 1 && attackTarget.hp > 0) {
      // Démarrer le cooldown immédiatement pour éviter les abus
      startSpellCooldown(slotId, cooldown);
      
      // Utiliser les dégâts améliorés selon le slot (ignorer les paramètres baseMin/baseMax)
      let minDamage, maxDamage;
      
      if (slotId === 'spell-slot-1') {
        // Vérifier si les dégâts ont été améliorés (différents des valeurs de base)
        if (window.punchDamageMin !== 3 || window.punchDamageMax !== 6) {
          minDamage = window.punchDamageMin;
          maxDamage = window.punchDamageMax;
          console.log(`⚔️ Coup de Poing - Dégâts améliorés utilisés: ${minDamage}-${maxDamage} (base: 3-6)`);
          console.log(`⚔️ Variables actuelles: window.punchDamageMin=${window.punchDamageMin}, window.punchDamageMax=${window.punchDamageMax}`);
          console.log(`⚔️ Dégâts finaux calculés: ${minDamage}-${maxDamage}`);
        } else {
          minDamage = 3;
          maxDamage = 6;
          console.log(`⚔️ Coup de Poing - Dégâts de base utilisés: ${minDamage}-${maxDamage}`);
          console.log(`⚔️ Variables actuelles: window.punchDamageMin=${window.punchDamageMin}, window.punchDamageMax=${window.punchDamageMax}`);
          console.log(`⚔️ Dégâts finaux calculés: ${minDamage}-${maxDamage}`);
        }
      } else {
        // Pour les autres sorts, utiliser les paramètres de base
        minDamage = baseMin;
        maxDamage = baseMax;
      }
      
      const { damage, isCrit } = computeSpellDamage(minDamage, maxDamage);
      attackTarget.hp -= damage;
      if (typeof displayDamage === 'function') {
        displayDamage(attackTarget.px, attackTarget.py, damage, isCrit ? 'critique' : 'damage', false);
      }
      if (typeof effetSpecial === 'function') {
        effetSpecial(attackTarget.px, attackTarget.py);
      }

      // NOUVEAU : gestion de la mort du monstre et attribution de l'XP
      if (attackTarget.hp <= 0) {
        // Appeler killMonster AVANT de nettoyer les références
        if (typeof killMonster === "function") {
          killMonster(attackTarget);
        }
        
        // Ensuite nettoyer les références
        if (typeof release === "function") release(attackTarget.x, attackTarget.y);
        if (typeof displayDamage === "function") {
          displayDamage(player.px, player.py, `+${attackTarget.xpValue || 0} XP`, 'xp', true);
        }
        if (typeof gainXP === "function") gainXP(attackTarget.xpValue || 0);
        if (typeof triggerLoot === 'function') {
          triggerLoot(attackTarget);
        }
        attackTarget.aggro = false;
        attackTarget.aggroTarget = null;
        attackTarget = null;
        window.attackTarget = null;
        player.inCombat = false;
      }
    }
  }
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
  if (slot1) {
    slot1.addEventListener('click', () => {
      const spell = SPELLS['spell-slot-1'];
      if (spell && spell.unlocked) {
        castSpell('spell-slot-1', spell.baseMin, spell.baseMax, spell.cooldown, null);
      } else if (spell) {
        if (typeof addChatMessage === 'function') {
          addChatMessage(`Niveau ${spell.levelRequired} requis pour ${spell.name}`, 'system');
        }
      }
    });
  }
  if (slot2) {
    slot2.addEventListener('click', () => {
      const spell = SPELLS['spell-slot-2'];
      if (spell && spell.unlocked) {
        castExplosivePunch();
      } else if (spell) {
        if (typeof addChatMessage === 'function') {
          addChatMessage(`Niveau ${spell.levelRequired} requis pour ${spell.name}`, 'system');
        }
      }
    });
  }
  if (slot3) {
    slot3.addEventListener('click', () => {
      const spell = SPELLS['spell-slot-3'];
      if (spell && spell.unlocked) {
        handleTriplePunchCombo(); // Utiliser le nouveau système de combo
      } else if (spell) {
        if (typeof addChatMessage === 'function') {
          addChatMessage(`Niveau ${spell.levelRequired} requis pour ${spell.name}`, 'system');
        }
      }
    });
  }

  // Gestion du clavier pour lancer les sorts
  window.addEventListener('keydown', (e) => {
    // Sort 1 : Coup de poing (touches '1' ou '&')
    if (e.key === '1' || e.key === '&') {
      const spell = SPELLS['spell-slot-1'];
      if (spell && spell.unlocked) {
        castSpell('spell-slot-1', spell.baseMin, spell.baseMax, spell.cooldown, null);
      } else if (spell) {
        if (typeof addChatMessage === 'function') {
          addChatMessage(`Niveau ${spell.levelRequired} requis pour ${spell.name}`, 'system');
        }
      }
    }
    // Sort 2 : Coup de poing explosif (touches '2' ou 'é')
    if (e.key === '2' || e.key === 'é' || e.key === 'É') {
      const spell = SPELLS['spell-slot-2'];
      if (spell && spell.unlocked) {
        castExplosivePunch();
      } else if (spell) {
        if (typeof addChatMessage === 'function') {
          addChatMessage(`Niveau ${spell.levelRequired} requis pour ${spell.name}`, 'system');
        }
      }
    }
    // Sort 3 : Triple Coup de Poing (touches '3' ou '#')
    if (e.key === '3' || e.key === '#' || e.code === 'Digit3' || e.code === 'Key3') {
      const spell = SPELLS['spell-slot-3'];
      if (spell && spell.unlocked) {
        handleTriplePunchCombo(); // Utiliser le nouveau système de combo
      } else if (spell) {
        if (typeof addChatMessage === 'function') {
          addChatMessage(`Niveau ${spell.levelRequired} requis pour ${spell.name}`, 'system');
        }
      }
    }
    
    // Debug: Afficher les coordonnées du joueur (touche 'G')
    if (e.key === 'g' || e.key === 'G') {
      if (window.player) {
        console.log(`Position du joueur: X=${window.player.x}, Y=${window.player.y}`);
        
        // Créer un élément visuel pour afficher les coordonnées
        let coordDisplay = document.getElementById('coord-debug');
        if (!coordDisplay) {
          coordDisplay = document.createElement('div');
          coordDisplay.id = 'coord-debug';
          coordDisplay.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            z-index: 1000;
            pointer-events: none;
          `;
          document.body.appendChild(coordDisplay);
        }
        coordDisplay.textContent = `X: ${window.player.x}, Y: ${window.player.y}`;
        coordDisplay.style.display = 'block';
        
        // Masquer après 5 secondes
        setTimeout(() => {
          coordDisplay.style.display = 'none';
        }, 5000);
      }
    }
  });
});

// (Tout le code des établies a été déplacé dans js/metier/etablie.js)

// Fonction pour vérifier et mettre à jour le déverrouillage des sorts
function updateSpellUnlockStatus() {
  if (!player || !player.level) {
    return;
  }
  
  let anySpellUnlocked = false;

  Object.keys(SPELLS).forEach(slotId => {
    const spell = SPELLS[slotId];
    const wasUnlocked = spell.unlocked;
    
    // Vérifier si le sort doit être déverrouillé basé sur le niveau actuel
    const shouldBeUnlocked = player.level >= spell.levelRequired;
    
    // Débloquer le sort si le niveau requis est atteint
    if (!spell.unlocked && shouldBeUnlocked) {
      spell.unlocked = true;
      anySpellUnlocked = true;
    }
  });

  // Sauvegarder l'état des sorts débloqués APRÈS avoir traité tous les sorts
  // Seulement si un personnage est connecté
  if (window.currentCharacterId) {
    saveUnlockedSpells();
  }
  
  // Mettre à jour l'affichage visuel des sorts de manière différée pour éviter les freezes
  requestAnimationFrame(() => {
    updateSpellVisuals();
  });
}

// Fonction pour vérifier s'il existe une sauvegarde explicite des sorts pour ce personnage
function hasExplicitSpellSave() {
  if (!window.currentCharacterId) return false;
  
  const saveKey = `monrpg_unlocked_spells_${window.currentCharacterId}`;
  const savedData = localStorage.getItem(saveKey);
  
  return savedData !== null;
}

// Fonction pour sauvegarder les sorts débloqués
function saveUnlockedSpells() {
  if (!window.currentCharacterId) {
    return;
  }
  
  const unlockedSpellsData = {};
  Object.keys(SPELLS).forEach(slotId => {
    const spell = SPELLS[slotId];
    unlockedSpellsData[slotId] = {
      name: spell.name,
      unlocked: spell.unlocked,
      levelRequired: spell.levelRequired
    };
  });
  
  const saveKey = `monrpg_unlocked_spells_${window.currentCharacterId}`;
  localStorage.setItem(saveKey, JSON.stringify(unlockedSpellsData));
}

// Fonction pour charger les sorts débloqués
function loadUnlockedSpells() {
  if (!window.currentCharacterId) {
    return;
  }
  
  // RÉINITIALISER COMPLÈTEMENT L'ÉTAT DES SORTS AVANT TOUT
  // Cela évite que les sorts débloqués d'un personnage soient hérités par un autre
  Object.keys(SPELLS).forEach(slotId => {
    const spell = SPELLS[slotId];
    // Réinitialiser à l'état par défaut (seul le premier sort est débloqué par défaut)
    spell.unlocked = (slotId === 'spell-slot-1');
  });
  
  const saveKey = `monrpg_unlocked_spells_${window.currentCharacterId}`;
  const savedData = localStorage.getItem(saveKey);
  
  if (savedData) {
    try {
      const unlockedSpellsData = JSON.parse(savedData);
      
      Object.keys(unlockedSpellsData).forEach(slotId => {
        if (SPELLS[slotId]) {
          const savedSpell = unlockedSpellsData[slotId];
          const currentSpell = SPELLS[slotId];
          
          // Si le sort était débloqué dans la sauvegarde, le restaurer comme débloqué
          if (savedSpell.unlocked) {
            currentSpell.unlocked = true;
          } else {
            // Si le sort n'était pas débloqué dans la sauvegarde, vérifier le niveau actuel
            currentSpell.unlocked = player && player.level >= currentSpell.levelRequired;
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des sorts débloqués:', error);
    }
  } else {
    // Pour un nouveau personnage, initialiser les sorts basés sur son niveau
    Object.keys(SPELLS).forEach(slotId => {
      const spell = SPELLS[slotId];
      spell.unlocked = player && player.level >= spell.levelRequired;
    });
  }
}

// Fonction pour mettre à jour l'affichage visuel des sorts
function updateSpellVisuals() {
  Object.keys(SPELLS).forEach(slotId => {
    const spell = SPELLS[slotId];
    const slotElement = document.getElementById(slotId);
    
    if (slotElement) {
      const wasLocked = slotElement.classList.contains('locked');
      
      if (spell.unlocked) {
        slotElement.classList.remove('locked');
        slotElement.classList.add('unlocked');
        slotElement.style.opacity = '1';
        slotElement.style.cursor = 'pointer';
        
        // Animation si le sort vient d'être déverrouillé
        if (wasLocked) {
          slotElement.classList.add('unlocking');
          setTimeout(() => {
            slotElement.classList.remove('unlocking');
          }, 500);
        }
      } else {
        slotElement.classList.add('locked');
        slotElement.classList.remove('unlocked');
        slotElement.style.opacity = '0.5';
        slotElement.style.cursor = 'not-allowed';
      }
    }
  });
}

// Fonction pour mettre à jour l'affichage des détails des sorts
function updateSpellDetailsDisplay() {
  // Mettre à jour le niveau requis pour le Coup de poing explosif
  const explosiveLevelElement = document.querySelector('#sort-damage-panel-explosive .sort-detail-level-star');
  if (explosiveLevelElement) {
    explosiveLevelElement.textContent = `⭐ ${SPELLS['spell-slot-2'].levelRequired}`;
  }
  
  // Mettre à jour le niveau requis pour le Triple Coup de Poing
  const tripleLevelElement = document.querySelector('#sort-damage-panel-triple .sort-detail-level-star');
  if (tripleLevelElement) {
    tripleLevelElement.textContent = `⭐ ${SPELLS['spell-slot-3'].levelRequired}`;
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

// Export global des fonctions de gestion des sorts
window.updateSpellUnlockStatus = updateSpellUnlockStatus;
window.updateSpellVisuals = updateSpellVisuals;
window.updateSpellDetailsDisplay = updateSpellDetailsDisplay;
window.saveUnlockedSpells = saveUnlockedSpells;
window.loadUnlockedSpells = loadUnlockedSpells;
window.resetSpellsToDefault = resetSpellsToDefault;
window.resetSpellUpgrades = resetSpellUpgrades;
window.hasExplicitSpellSave = hasExplicitSpellSave;
window.SPELLS = SPELLS;

// Fonction utilitaire pour spawn un monstre depuis la console
window.spawnMonster = function(type) {
  let img = null;
  if (type === 'maitrecorbeau') {
    img = window.maitreCorbeauImg || new Image();
  } else if (type === 'corbeau') {
    img = window.corbeauImg || new Image();
  }
  const monstre = {
    type: type,
    x: player.x + 1,
    y: player.y,
    px: (player.x + 1) * TILE_SIZE,
    py: player.y * TILE_SIZE,
    hp: 100,
    maxHp: 100,
    level: 5,
    force: 5,
    damage: 8,
    state: 'idle',
    img: img,
    frame: 0,
    isDead: false,
    aggro: false,
    aggroTarget: null,
    movePath: [],
    moving: false,
    spawnX: player.x + 1,
    spawnY: player.y
  };
  monsters.push(monstre);
  if (typeof assignMonsterImages === 'function') assignMonsterImages();
  return monstre;
};

// Fonction de téléportation globale (accessible depuis la console)
window.teleportToMap = function(mapName, x = 400, y = 300) {
    if (!mapName) {
        // Usage: teleportToMap('nomDeLaMap', x, y)
        return;
    }
    
    // Téléportation vers la map
    
    // Sauvegarder la position actuelle
    if (window.saveGame) {
        window.saveGame();
    }
    
    // Changer de map
    window.currentMap = mapName;
    window.player.x = x;
    window.player.y = y;
    
    // Charger la nouvelle map
    if (window.loadMap) {
        window.loadMap(mapName);
    }
    
    // Recharger les monstres
    if (window.loadMonstersForMap) {
        window.loadMonstersForMap(mapName);
    }
    
    // Recharger les PNJ
    if (window.loadPNJsForMap) {
        window.loadPNJsForMap(mapName);
    }
    
            // Téléportation réussie
};

// Afficher les commandes disponibles au démarrage
    // Commandes de téléportation disponibles

function resizeGameCanvas() {
    const canvas = document.getElementById('gameCanvas');
    const ratio = 1536 / 910; // Ratio d'origine du canvas
    let w = window.innerWidth;
    let h = window.innerHeight;
    if (w / h > ratio) {
        w = h * ratio;
    } else {
        h = w / ratio;
    }
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
}


window.addEventListener('resize', () => {
    resizeGameCanvas();
    positionHudIcons();
});
document.addEventListener('DOMContentLoaded', () => {
    resizeGameCanvas();
    positionHudIcons();
});

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

// Fonction pour afficher la popup de victoire du boss
window.showBossVictoryPopup = function() {
    // Créer la popup
    const popup = document.createElement('div');
    popup.id = 'boss-victory-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #2c3e50, #34495e);
        border: 3px solid #f39c12;
        border-radius: 15px;
        padding: 30px;
        color: white;
        font-family: 'Arial', sans-serif;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        min-width: 400px;
    `;
    
    popup.innerHTML = `
        <h2 style="color: #f39c12; margin-bottom: 20px; font-size: 24px;">🏆 FÉLICITATIONS ! 🏆</h2>
        <p style="font-size: 18px; margin-bottom: 15px;">Vous avez éliminé le SlimeBoss !</p>
        <p style="font-size: 16px; margin-bottom: 25px; color: #ecf0f1;">Récupérez votre récompense dans le coffre du donjon.</p>
        <button id="close-boss-popup" style="
            background: linear-gradient(45deg, #e74c3c, #c0392b);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        ">Fermer</button>
    `;
    
    document.body.appendChild(popup);
    
    // Gestionnaire pour fermer la popup
    document.getElementById('close-boss-popup').addEventListener('click', function() {
        document.body.removeChild(popup);
    });
    
            // Popup de victoire du SlimeBoss affichée
};

// Fonction pour afficher la fenêtre de sélection d'objets du coffre
window.showBossChestWindow = function() {
            // Affichage de la fenêtre de sélection du coffre du SlimeBoss
    
    // Créer la fenêtre du coffre
    const chestWindow = document.createElement('div');
    chestWindow.id = 'boss-chest-window';
    chestWindow.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #2c3e50, #34495e);
        border: 3px solid #f39c12;
        border-radius: 15px;
        padding: 30px;
        color: white;
        font-family: 'Arial', sans-serif;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        min-width: 500px;
    `;
    
    // Définir les 3 objets disponibles
            const chestItems = [
            {
                id: "orbe_atypique_niveau10",
                name: "Orbe Atypique Niveau 10",
                type: "objet_special",
                category: "objet_special",
                description: "Un orbe mystérieux qui dégage une énergie particulière. Permet d'améliorer les équipements de niveau 10 ou inférieur.",
                image: "assets/objets/orbesatypiqueniveau10.png"
            },
        {
            id: "dague_slime",
            name: "Dague de Slime",
            type: "arme",
            category: "équipement",
            description: "Une dague visqueuse qui colle à vos ennemis",
            image: "assets/equipements/armes/dagueslime.png",
            stats: { force: 3, agilite: 1 },
            levelRequired: 10
        },
        {
            id: "orbe_atypique_sort_niveau10",
            name: "Orbe Atypique Sort Niveau 10",
            type: "objet_special",
            category: "objet_special",
            description: "Un orbe mystérieux qui dégage une énergie magique particulière. Permet d'améliorer les sorts de niveau 10 ou inférieur.",
            image: "assets/objets/orbesatypiquesortniveau10.png"
        }
    ];
    
    chestWindow.innerHTML = `
        <h2 style="color: #f39c12; margin-bottom: 20px; font-size: 24px;">🎁 Coffre du SlimeBoss</h2>
        <p style="font-size: 16px; margin-bottom: 25px; color: #ecf0f1;">Choisissez votre récompense :</p>
        <div style="display: flex; justify-content: space-around; gap: 20px; margin-bottom: 25px;">
            ${chestItems.map((item, index) => `
                <div class="chest-item" data-item-index="${index}" style="
                    background: rgba(255,255,255,0.1);
                    border: 2px solid #f39c12;
                    border-radius: 10px;
                    padding: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 120px;
                " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                    <div style="width: 64px; height: 64px; background: #555; margin: 0 auto 10px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                        <img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: contain;">
                    </div>
                    <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
                    <div style="font-size: 12px; color: #bdc3c7;">${item.description}</div>
                </div>
            `).join('')}
        </div>
        <button id="close-chest-window" style="
            background: linear-gradient(45deg, #e74c3c, #c0392b);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        ">Fermer</button>
    `;
    
    document.body.appendChild(chestWindow);
    
    // Gestionnaires pour les clics sur les objets
    const itemElements = chestWindow.querySelectorAll('.chest-item');
    itemElements.forEach((element, index) => {
        element.addEventListener('click', function() {
            const selectedItem = chestItems[index];
            
            // Ajouter l'objet à l'inventaire
            if (typeof window.addItemToInventory === "function") {
                // Déterminer la catégorie selon le type d'objet
                let category = 'equipement';
                if (selectedItem.type === 'potion') {
                    category = 'potions';
                } else if (selectedItem.type === 'objet_special') {
                    category = 'equipement'; // Les objets spéciaux vont dans l'équipement
                }
                window.addItemToInventory(selectedItem.id, category);
            }
            
            // Fermer la fenêtre
            document.body.removeChild(chestWindow);
            
            // Téléporter vers map3 après un délai
            setTimeout(() => {
                if (typeof window.teleportPlayer === "function") {
                    window.teleportPlayer("map3", 10, 10);
                }
                
                // Sauvegarde immédiate après téléportation
                setTimeout(() => {
                    if (typeof window.saveGameStateData === "function" && window.currentCharacterId) {
                        window.saveGameStateData(window.currentCharacterId);
                    }
                }, 500);
            }, 1000);
        });
    });
    
    // Gestionnaire pour fermer la fenêtre
    document.getElementById('close-chest-window').addEventListener('click', function() {
        document.body.removeChild(chestWindow);
    });
    
            // Fenêtre de sélection du coffre affichée
};

// Fonction pour donner la récompense du boss (remplacée par la fenêtre de sélection)
window.giveBossReward = function() {
            // Ouverture de la fenêtre de sélection du coffre
    
    // Afficher la fenêtre de sélection
    if (typeof window.showBossChestWindow === "function") {
        window.showBossChestWindow();
    }
};

// Fonction pour ouvrir le coffre de la maison
window.openHouseChest = function() {
    if (window.currentMap !== "maison") {
        // Erreur: Le coffre ne peut être ouvert que dans la maison
        return;
    }
    
            // Ouverture du coffre de la maison
    
    // Afficher la fenêtre de sélection
    if (typeof window.showHouseChestWindow === "function") {
        window.showHouseChestWindow();
    }
};

// Fonction pour afficher la fenêtre de sélection d'objets du coffre de la maison
window.showHouseChestWindow = function() {
            // Affichage de la fenêtre de sélection du coffre de la maison
    
    // Créer la fenêtre du coffre
    const chestWindow = document.createElement('div');
    chestWindow.id = 'house-chest-window';
    chestWindow.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #2c3e50, #34495e);
        border: 3px solid #f39c12;
        border-radius: 15px;
        padding: 30px;
        color: white;
        font-family: 'Arial', sans-serif;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        min-width: 500px;
    `;
    
    // Définir les 2 objets disponibles (sort et orbe)
    const chestItems = [
        {
            id: "nouveau_sort",
            name: "Nouveau Sort",
            type: "sort",
            category: "magie",
            description: "Un sort puissant découvert dans les profondeurs",
            image: "assets/objets/nouveau_sort.png",
            effect: "nouveau_sort_power"
        },
        {
            id: "orbe_speciale",
            name: "Orbe Spéciale",
            type: "orbe",
            category: "artefact",
            description: "Une orbe mystérieuse aux pouvoirs inconnus",
            image: "assets/objets/orbe_speciale.png",
            effect: "orbe_speciale_power"
        }
    ];
    
    chestWindow.innerHTML = `
        <h2 style="color: #f39c12; margin-bottom: 20px; font-size: 24px;">🎁 Coffre de la Maison</h2>
        <p style="font-size: 16px; margin-bottom: 25px; color: #ecf0f1;">Contenu du coffre :</p>
        <div style="display: flex; justify-content: space-around; gap: 20px; margin-bottom: 25px;">
            ${chestItems.map((item, index) => `
                <div class="chest-item" data-item-index="${index}" style="
                    background: rgba(255,255,255,0.1);
                    border: 2px solid #f39c12;
                    border-radius: 10px;
                    padding: 15px;
                    min-width: 120px;
                ">
                    <div style="width: 64px; height: 64px; background: #555; margin: 0 auto 10px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 24px;">📦</div>
                    <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
                    <div style="font-size: 12px; color: #bdc3c7;">${item.description}</div>
                </div>
            `).join('')}
        </div>
        <button id="recover-house-chest-items" style="
            background: linear-gradient(45deg, #27ae60, #2ecc71);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-right: 10px;
        ">Récupérer</button>
        <button id="close-house-chest-window" style="
            background: linear-gradient(45deg, #e74c3c, #c0392b);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        ">Fermer</button>
    `;
    
    document.body.appendChild(chestWindow);
    
    // Gestionnaire pour le bouton récupérer
    const recoverButton = chestWindow.querySelector('#recover-house-chest-items');
    recoverButton.addEventListener('click', function() {
        // Récupération de tous les objets du coffre
        
        // Ajouter tous les objets à l'inventaire
        if (typeof window.addItemToInventory === 'function') {
            chestItems.forEach(item => {
                window.addItemToInventory(item.id, 1);
            });
        }
        
        // Afficher un message de confirmation
        if (typeof window.showMessage === "function") {
            window.showMessage("Vous avez récupéré tous les objets du coffre !", "success");
        }
        
        // Fermer la fenêtre
        document.body.removeChild(chestWindow);
    });
    
    // Gestionnaire pour le bouton fermer
    const closeButton = chestWindow.querySelector('#close-house-chest-window');
    closeButton.addEventListener('click', function() {
        document.body.removeChild(chestWindow);
    });
};

// Système de gestion des touches du jeu
let gameInputsEnabled = false;

// Fonction pour désactiver les touches du jeu
function disableGameInputs() {
    gameInputsEnabled = false;
}

// Fonction pour activer les touches du jeu
function enableGameInputs() {
    gameInputsEnabled = true;
}

// Gestionnaire global des touches
window.addEventListener('keydown', (e) => {
    // Vérifier si les touches du jeu sont activées
    if (!gameInputsEnabled || window.gameState !== "playing") {
        return;
    }
    
    // Gestion des touches du jeu
    switch(e.key.toLowerCase()) {
        case 'i':
            e.preventDefault();
            if (typeof window.openInventoryModal === 'function') {
                window.openInventoryModal();
            }
            break;
        case 's':
            e.preventDefault();
            if (typeof window.openStatsModal === 'function') {
                window.openStatsModal();
            }
            break;
        case 'q':
            e.preventDefault();
            // Ouvrir/fermer les quêtes avec la touche Q
            const questsModalQ = document.getElementById('quests-main-modal');
            if (questsModalQ) {
                const isOpenQ = questsModalQ.style.display === 'flex';
                questsModalQ.style.display = isOpenQ ? 'none' : 'flex';
                console.log('📋 Quêtes ' + (isOpenQ ? 'fermées' : 'ouvertes') + ' avec la touche Q');
            } else if (typeof window.openQuestsModal === 'function') {
                window.openQuestsModal();
            }
            break;
        case 'm':
            e.preventDefault();
            // Ouvrir/fermer la carte
            const mapModalM = document.getElementById('map-modal');
            if (mapModalM) {
                const isOpenM = mapModalM.style.display === 'flex';
                mapModalM.style.display = isOpenM ? 'none' : 'flex';
                console.log('🗺️ Carte ' + (isOpenM ? 'fermée' : 'ouverte') + ' avec la touche M');
            }
            break;
        case 'f':
            e.preventDefault();
            // Ouvrir/fermer les quêtes
            const questsModalF = document.getElementById('quests-main-modal');
            if (questsModalF) {
                const isOpenF = questsModalF.style.display === 'flex';
                questsModalF.style.display = isOpenF ? 'none' : 'flex';
                console.log('📋 Quêtes ' + (isOpenF ? 'fermées' : 'ouvertes') + ' avec la touche F');
            } else if (typeof window.openQuestsModal === 'function') {
                window.openQuestsModal();
            }
            break;
        case 'p':
            e.preventDefault();
            // Ouvrir/fermer les sorts
            const sortModal = document.getElementById('sort-modal');
            if (sortModal) {
                const isOpen = sortModal.style.display === 'flex' || sortModal.style.display === 'block';
                sortModal.style.display = isOpen ? 'none' : 'flex';
                console.log('⚡ Sorts ' + (isOpen ? 'fermés' : 'ouverts') + ' avec la touche P');
            }
            break;
        case 'escape':
            e.preventDefault();
            // Fermer toutes les modales avec Échap
            const modalsToClose = [
                document.getElementById('map-modal'),
                document.getElementById('quests-main-modal'),
                document.getElementById('sort-modal'),
                document.getElementById('inventory-modal'),
                document.getElementById('stats-modal')
            ];
            
            let modalClosed = false;
            modalsToClose.forEach(modal => {
                if (modal && (modal.style.display === 'flex' || modal.style.display === 'block')) {
                    modal.style.display = 'none';
                    modalClosed = true;
                }
            });
            
            if (modalClosed) {
                console.log('🚪 Modales fermées avec Échap');
            } else if (typeof window.closeAllModals === 'function') {
                window.closeAllModals();
            }
            break;
    }
});

// Fonction utilitaire pour débloquer l'inventaire et statistiques
window.debloquerInventaireEtStats = function() {
    console.log('🔧 === DÉBLOQUAGE INVENTAIRE ET STATISTIQUES ===');
    
    // Nettoyer les classes bloquantes
    document.body.classList.remove('character-menu-active', 'menu-active');
    console.log('✅ Classes bloquantes supprimées');
    
    // Vérifier les éléments d'inventaire
    const inventoryIcon = document.getElementById('inventory-icon');
    const statsIcon = document.getElementById('stats-icon');
    const inventoryModal = document.getElementById('inventory-modal');
    const statsModal = document.getElementById('stats-modal');
    
    console.log('📊 État des éléments:');
    console.log('- Icône inventaire:', inventoryIcon ? '✅' : '❌');
    console.log('- Icône stats:', statsIcon ? '✅' : '❌');
    console.log('- Modal inventaire:', inventoryModal ? '✅' : '❌');
    console.log('- Modal stats:', statsModal ? '✅' : '❌');
    
    // Forcer la réinitialisation des événements d'inventaire
    if (typeof window.initInventoryEvents === 'function') {
        window.initInventoryEvents();
        console.log('✅ Événements d\'inventaire réinitialisés');
    }
    
    console.log('🎯 Teste maintenant avec les touches I (inventaire) et S (stats)');
    console.log('🎯 Ou utilise directement les icônes en bas à droite');
};

// RÉPARATION ÉQUIPEMENT D'URGENCE - Accessible depuis main.js
window.urgenceEquipement = function() {
    console.log('🚑 === RÉPARATION D\'URGENCE ÉQUIPEMENT ===');
    
    // DIAGNOSTIC PRÉALABLE : Vérifier l'état des équipements existants
    console.log('🔍 === DIAGNOSTIC ÉQUIPEMENTS EXISTANTS ===');
    if (window.equippedItems) {
        Object.entries(window.equippedItems).forEach(([slot, item]) => {
            if (item) {
                console.log(`📋 ${slot}: ${item.name || 'SANS NOM'} (ID: ${item.id || 'SANS ID'})`);
                console.log(`   Structure:`, typeof item, Object.keys(item));
            } else {
                console.log(`📋 ${slot}: Vide`);
            }
        });
    } else {
        console.log('❌ window.equippedItems n\'existe pas !');
    }
    
    // 1. Corriger les fonctions manquantes
    if (typeof window.unequipItem !== 'function') {
        console.log('🔧 Création: unequipItem manquant');
        window.unequipItem = function(slot) {
            if (!window.equippedItems) return false;
            const item = window.equippedItems[slot];
            if (!item) return false;
            window.equippedItems[slot] = null;
            if (typeof window.applyEquipmentStats === 'function') {
                window.applyEquipmentStats();
            }
            console.log(`✅ Déséquipé: ${item.name}`);
            return true;
        };
    }
    
    if (typeof window.getItemInSlot !== 'function') {
        console.log('🔧 Création: getItemInSlot manquant');
        window.getItemInSlot = function(slot) {
            if (!window.equippedItems) return null;
            return window.equippedItems[slot];
        };
    }
    
    if (typeof window.closeEquipmentDetailModal !== 'function') {
        console.log('🔧 Création: closeEquipmentDetailModal manquant');
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
    console.log(`🔧 Réparation sur ${equipSlots.length} slots d'équipement`);
    
    equipSlots.forEach(slot => {
        const slotType = slot.dataset.slot;
        
        // Supprimer tous les anciens événements
        const newSlot = slot.cloneNode(true);
        slot.parentNode.replaceChild(newSlot, slot);
        
        // Ajouter le nouvel événement de double-clic
        newSlot.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🔧 Double-clic d'urgence sur ${slotType}`);
            
            const equippedItem = window.getItemInSlot(slotType);
            console.log(`🔍 Item trouvé dans slot ${slotType}:`, equippedItem);
            
            if (equippedItem) {
                console.log(`🔍 Tentative de déséquipement de: ${equippedItem.name}`);
                const success = window.unequipItem(slotType);
                console.log(`🔍 Résultat déséquipement: ${success}`);
                
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
                
                console.log(`✅ ${equippedItem.name} déséquipé et remis en inventaire`);
                }
            } else {
                console.log('❌ Aucun item trouvé dans le slot ou échec du déséquipement');
            }
        });
    });
    
    // 3. FORCER les événements de fermeture des fiches (AGGRESSIF)
    setTimeout(() => {
        console.log('🔧 Forçage AGRESSIF événements fermeture');
        
        // MÉTHODE 1: Forcer sur l'ID spécifique avec logs
        const closeBtn = document.getElementById('close-equipment-detail');
        if (closeBtn) {
            console.log('✅ Bouton X trouvé:', closeBtn);
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            ['click', 'mousedown', 'touchstart'].forEach(eventType => {
                newCloseBtn.addEventListener(eventType, function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log(`🔧 Fermeture via ${eventType} sur X`);
                    const modal = document.getElementById('equipment-detail-modal');
                    if (modal) {
                        modal.style.display = 'none';
                        console.log('✅ Fiche fermée via X');
                    }
                });
            });
        } else {
            console.log('❌ Bouton X non trouvé !');
        }
        
        // MÉTHODE 2: Forcer sur TOUS les éléments × avec logs
        const allCloseElements = document.querySelectorAll('span, button, div');
        let foundCloseElements = 0;
        allCloseElements.forEach(element => {
            if (element.innerHTML === '&times;' || element.textContent === '×' || element.id === 'close-equipment-detail') {
                foundCloseElements++;
                console.log(`🔧 Élément de fermeture ${foundCloseElements} trouvé:`, element);
                
                ['click', 'mousedown', 'touchstart'].forEach(eventType => {
                    element.addEventListener(eventType, function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        console.log(`🔧 Fermeture via ${eventType} sur élément ×`);
                        
                        // Chercher le modal parent
                        let currentElement = e.target;
                        while (currentElement && currentElement !== document) {
                            if (currentElement.id === 'equipment-detail-modal' || 
                                currentElement.className.includes('equipment-detail') ||
                                currentElement.className.includes('modal')) {
                                currentElement.style.display = 'none';
                                console.log('✅ Fiche fermée via élément parent');
                                return;
                            }
                            currentElement = currentElement.parentElement;
                        }
                        
                        // Si pas trouvé, fermer le modal par ID
                        const modal = document.getElementById('equipment-detail-modal');
                        if (modal) {
                            modal.style.display = 'none';
                            console.log('✅ Fiche fermée via ID direct');
                        }
                    });
                });
            }
        });
        console.log(`📊 ${foundCloseElements} éléments de fermeture traités`);
        
        // MÉTHODE 3: Clic extérieur
        const modal = document.getElementById('equipment-detail-modal');
        if (modal) {
            console.log('🔧 Forçage clic extérieur sur modal');
            const newModal = modal.cloneNode(true);
            modal.parentNode.replaceChild(newModal, modal);
            
            newModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    console.log('🔧 Fermeture via clic extérieur');
                    this.style.display = 'none';
                    console.log('✅ Fiche fermée via extérieur');
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
window.testTheorieEquipement = function() {
    console.log('🧪 === TEST THÉORIE ÉQUIPEMENTS CORROMPUS ===');
    
    if (!window.equippedItems) {
        console.log('❌ Aucun équipement trouvé');
        return;
    }
    
    // Trouver un équipement à tester
    let testSlot = null;
    let testItem = null;
    
    Object.entries(window.equippedItems).forEach(([slot, item]) => {
        if (item && !testSlot) {
            testSlot = slot;
            testItem = item;
        }
    });
    
    if (!testItem) {
        console.log('❌ Aucun équipement équipé à tester');
        return;
    }
    
    console.log(`🔍 Test sur: ${testItem.name} (slot: ${testSlot})`);
    console.log('🔍 Structure actuelle:', testItem);
    
    // Test 1: Vérifier si l'item existe dans la base de données
    if (window.equipmentDatabase && window.equipmentDatabase[testItem.id]) {
        const dbItem = window.equipmentDatabase[testItem.id];
        console.log('✅ Item trouvé dans equipmentDatabase');
        console.log('🔍 Version base de données:', dbItem);
        
        // Comparer les structures
        const currentKeys = Object.keys(testItem).sort();
        const dbKeys = Object.keys(dbItem).sort();
        
        console.log('🔍 Clés équipement actuel:', currentKeys);
        console.log('🔍 Clés base de données:', dbKeys);
        
        if (JSON.stringify(currentKeys) !== JSON.stringify(dbKeys)) {
            console.log('⚠️ STRUCTURE DIFFÉRENTE DÉTECTÉE !');
            console.log('💡 Solution: Remplacer par la version propre de la base');
            
            // Proposition de correction
            window.corrigerEquipementCorrompu = function() {
                console.log('🔧 Correction de l\'équipement corrompu...');
                window.equippedItems[testSlot] = { ...dbItem };
                console.log('✅ Équipement corrigé avec la version de la base');
                
                if (typeof window.updateEquipmentDisplay === 'function') {
                    window.updateEquipmentDisplay();
                }
                
                console.log('🧪 Teste maintenant le double-clic pour déséquiper');
            };
            
            console.log('📋 Pour corriger, tape: corrigerEquipementCorrompu()');
        } else {
            console.log('✅ Structure identique - pas de corruption détectée');
        }
    } else {
        console.log('❌ Item NON TROUVÉ dans equipmentDatabase !');
        console.log('💡 C\'est probablement ça le problème !');
        console.log('🔍 ID recherché:', testItem.id);
        console.log('🔍 IDs disponibles:', window.equipmentDatabase ? Object.keys(window.equipmentDatabase) : 'equipmentDatabase manquant');
    }
};

// Nettoyage automatique périodique pour éviter les blocages persistants
let autoCleanupInterval = null;

function startAutoCleanup() {
    // Nettoyer d'abord
    if (autoCleanupInterval) {
        clearInterval(autoCleanupInterval);
    }
    
    // Vérifier et nettoyer toutes les 5 secondes
    autoCleanupInterval = setInterval(() => {
        if (window.gameState === "playing" && 
            (document.body.classList.contains('character-menu-active') || 
             document.body.classList.contains('menu-active'))) {
            console.log('🧹 Nettoyage automatique : classes bloquantes détectées et supprimées');
            document.body.classList.remove('character-menu-active', 'menu-active');
        }
    }, 5000);
}

// Démarrer le nettoyage automatique dès que possible
setTimeout(startAutoCleanup, 2000);

// APPLICATION AUTOMATIQUE DES CORRECTIONS D'ÉQUIPEMENT À CHAQUE CHARGEMENT
setTimeout(() => {
    console.log('🔧 Application automatique des corrections d\'équipement...');
    if (typeof window.urgenceEquipementSilencieux === 'function') {
        window.urgenceEquipementSilencieux();
        console.log('✅ Corrections d\'équipement appliquées automatiquement (silencieux)');
    }
}, 3000); // 3 secondes après le chargement pour être sûr que tout est initialisé

// Exporter les fonctions
window.disableGameInputs = disableGameInputs;
window.enableGameInputs = enableGameInputs;

// Fonction utilitaire pour forcer un rendu
window.forceRender = function() {
    if (window.gameState === "playing" && canvas && ctx) {
        drawGame();
    }
};

// Fonction pour forcer le rechargement des images
// Fonction utilitaire pour recharger les images
window.reloadImages = function() {
    if (window.playerImg) {
        window.playerImg.src = window.playerImg.src;
    }
    
    if (window.mapData && window.mapData.tilesets) {
        window.mapData.tilesets.forEach((tileset, index) => {
            if (tileset.image) {
                tileset.image.src = tileset.image.src;
            }
        });
    }
};

// Fonction d'urgence pour nettoyer tous les effets visuels problématiques
window.emergencyClearAllVisualEffects = function() {
    // Nettoyage d'urgence de tous les effets visuels
    
    // Nettoyer l'écran noir
    if (typeof clearBlackScreen === "function") {
        clearBlackScreen();
    }
    
    // Nettoyer les effets de combat
    if (typeof clearAllDamageEffects === "function") {
        clearAllDamageEffects();
    }
    
    // Nettoyer les effets d'urgence spécifiques
    if (typeof emergencyClearCombatEffects === "function") {
        emergencyClearCombatEffects();
    }
    
    // Forcer un redessinage complet
    if (typeof drawMap === "function") {
        drawMap();
    }
    
    // Tous les effets visuels nettoyés
};

// Fonction pour mettre à jour tous les affichages de dégâts
function updateAllSpellDamageDisplays() {
    // Mettre à jour les dégâts punch
    if (window.punchDamageMin && window.punchDamageMax) {
        updateSpellDamageDisplay('punch', window.punchDamageMin, window.punchDamageMax);
    }
    
    // Mettre à jour les dégâts explosive
    if (window.explosiveDamageMin && window.explosiveDamageMax) {
        updateSpellDamageDisplay('explosive', window.explosiveDamageMin, window.explosiveDamageMax);
    }
    
    // Mettre à jour les dégâts triple
    if (window.tripleDamageMin && window.tripleDamageMax) {
        updateSpellDamageDisplay('triple', window.tripleDamageMin, window.tripleDamageMax);
    }
}

// Fonction pour réinitialiser complètement l'état des sorts
function resetSpellsToDefault() {
    // Vérifier que SPELLS existe
    if (!SPELLS || typeof SPELLS !== 'object') {
        return;
    }
    
    Object.keys(SPELLS).forEach(slotId => {
        const spell = SPELLS[slotId];
        if (spell && typeof spell === 'object') {
            // Réinitialiser à l'état par défaut (seul le premier sort est débloqué par défaut)
            spell.unlocked = (slotId === 'spell-slot-1');
        }
    });
}

// Fonction pour réinitialiser les orbes équipées
function resetSpellUpgrades() {
    // Vérifier que le DOM est prêt
    if (!document || !document.querySelectorAll) {
        return;
    }
    
    const upgradeSlots = document.querySelectorAll('.sort-upgrade-slot.upgraded');
    upgradeSlots.forEach(slot => {
        // Retirer l'orbe du slot
        slot.innerHTML = '';
        slot.classList.remove('upgraded');
        slot.style.borderColor = '';
        slot.removeAttribute('data-orbe-id');
        slot.removeAttribute('data-orbe-type');
    });
    
    // Réinitialiser les dégâts de base
    window.punchDamageMin = 3;
    window.punchDamageMax = 6;
    window.explosiveDamageMin = 12;
    window.explosiveDamageMax = 20;
    window.tripleDamageMin = 6;
    window.tripleDamageMax = 10;
    
    // Mettre à jour l'affichage des dégâts seulement si la fonction existe
    if (typeof updateAllSpellDamageDisplays === 'function') {
        updateAllSpellDamageDisplays();
    }
}
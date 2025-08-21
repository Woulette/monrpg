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
                
                            // Initialiser les mentors (déjà fait dans map.js)
            // if (typeof window.initMentorsByMap === "function") {
            //     window.initMentorsByMap();
            // }
                
                // Initialiser les banquiers
                if (typeof window.initBanquiers === "function") {
                    window.initBanquiers();
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
    
    // OPTIMISATION PERFORMANCE : Système de framerate adaptatif
    if (!window.performanceConfig) {
        window.performanceConfig = {
            targetFPS: 60,
            minFPS: 20,
            currentFPS: 60,
            frameCount: 0,
            lastFPSUpdate: 0,
            needsRedraw: true,
            lastRedraw: 0,
            redrawInterval: 16 // 60 FPS par défaut
        };
    }
    
    const config = window.performanceConfig;
    
    // Calculer le FPS actuel
    if (window.lastFrameTime) {
        const frameDelta = ts - window.lastFrameTime;
        config.frameCount++;
        
        // Mettre à jour le FPS toutes les 60 frames
        if (config.frameCount >= 60) {
            config.currentFPS = Math.round(1000 / (frameDelta / config.frameCount));
            config.frameCount = 0;
            config.lastFPSUpdate = ts;
            
            // Ajuster le framerate cible selon les performances
            if (config.currentFPS < config.minFPS) {
                config.targetFPS = Math.max(config.minFPS, config.currentFPS - 5);
                config.redrawInterval = Math.max(33, 1000 / config.targetFPS); // 30 FPS max
            } else if (config.currentFPS > config.targetFPS + 10) {
                config.targetFPS = Math.min(60, config.targetFPS + 5);
                config.redrawInterval = Math.max(16, 1000 / config.targetFPS); // 60 FPS max
            }
        }
        
        // Limiter le framerate pour éviter la surcharge
        if (frameDelta < config.redrawInterval) {
            requestAnimationFrame(gameLoop);
            return;
        }
    }
    
    window.lastFrameTime = ts;
    
    // DÉTERMINER SI UN REDESSINAGE EST NÉCESSAIRE
    config.needsRedraw = false;
    
    // Toujours redessiner si le joueur bouge
    if (window.player && window.player.moving) {
        config.needsRedraw = true;
    }
    
    // Toujours redessiner si il y a des monstres qui bougent OU qui font des animations
    if (window.monsters && window.monsters.some(m => m && (m.moving || m.animating || m.idle || m.animationFrame > 0))) {
        config.needsRedraw = true;
    }
    
    // Toujours redessiner si il y a des effets de dégâts OU XP
    if (window.damageEffects && window.damageEffects.length > 0) {
        config.needsRedraw = true;
    }
    
    // Toujours redessiner si le joueur est en combat
    if (window.player && window.player.inCombat) {
        config.needsRedraw = true;
    }
    
    // Toujours redessiner si il y a des animations en cours (sorts, effets)
    if (window.animations && window.animations.length > 0) {
        config.needsRedraw = true;
    }
    
    // Toujours redessiner si il y a des particules ou effets visuels
    if (window.particles && window.particles.length > 0) {
        config.needsRedraw = true;
    }
    
    // Redessiner périodiquement même si rien ne bouge (pour les animations d'idle)
    if (ts - config.lastRedraw > 50) { // 20 FPS minimum pour les animations fluides
        config.needsRedraw = true;
        config.lastRedraw = ts;
    }
   
    // Mise à jour du joueur (toujours nécessaire)
    updatePlayer(ts);

    // OPTIMISATION : Mise à jour des monstres avec culling de distance
    if (window.monsters && window.monsters.length > 0) {
        const isMultiplayer = !!(window.multiplayerManager && window.multiplayerManager.connected);
        if (!isMultiplayer) {
            // SOLO: optimiser en ne mettant à jour que les monstres proches
            const playerX = window.player ? window.player.x : 0;
            const playerY = window.player ? window.player.y : 0;
            const updateDistance = 15; // Distance en cases pour mettre à jour les monstres
            
            // Mettre à jour les monstres UNE SEULE FOIS par frame (pas par monstre !)
            let shouldUpdateMonsters = false;
            let shouldMoveMonsters = false;
            
            window.monsters.forEach(monster => {
                if (!monster) return;
                
                // Calculer la distance au joueur
                const distance = Math.abs(monster.x - playerX) + Math.abs(monster.y - playerY);
                
                // Vérifier si on doit mettre à jour les monstres
                if (distance <= updateDistance || monster.moving || monster.hp < monster.maxHp) {
                    shouldUpdateMonsters = true;
                    if (monster.moving) {
                        shouldMoveMonsters = true;
                    }
                }
            });
            
            // Mettre à jour UNE SEULE FOIS si nécessaire
            if (shouldMoveMonsters && typeof moveMonsters === "function") {
                moveMonsters(ts);
            }
            if (shouldUpdateMonsters && typeof updateMonsters === "function") {
                updateMonsters(ts);
            }
            if (shouldUpdateMonsters && typeof updateMonsterRespawn === "function") {
                updateMonsterRespawn(ts);
            }
        } else {
            // MULTI: serveur autoritaire → pas d'IA/mouvement local
            // Interpolation client: lisser des chemins complets (monster_paths) ou fallback case-à-case
            const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            for (const m of window.monsters) {
                if (!m) continue;
                if (Array.isArray(m.lerpSegments) && m.lerpSegments.length > 0) {
                    // Suivre les segments séquentiellement
                    if (typeof m.lerpIndex !== 'number') m.lerpIndex = 0;
                    // Avancer les segments déjà écoulés en mettant à jour x/y au passage
                    while (m.lerpIndex < m.lerpSegments.length && now >= m.lerpSegments[m.lerpIndex].end) {
                        const seg = m.lerpSegments[m.lerpIndex];
                        m.x = seg.tx; m.y = seg.ty; // mettre à jour la tuile courante
                        m.px = seg.ex; m.py = seg.ey; // finir le segment proprement
                        m.lerpIndex++;
                    }
                    if (m.lerpIndex >= m.lerpSegments.length) {
                        // Chemin terminé
                        m.lerpSegments = [];
                        m.moving = false;
                        continue;
                    }
                    const seg = m.lerpSegments[m.lerpIndex];
                    const dur = Math.max(1, seg.end - seg.start);
                    const t = Math.max(0, Math.min(1, (now - seg.start) / dur));
                    m.px = seg.sx + (seg.ex - seg.sx) * t;
                    m.py = seg.sy + (seg.ey - seg.sy) * t;
                    // Ne pas forcer moving=false tant que le chemin n'est pas fini
                    m.moving = true;
                } else if (typeof m.nextPx === 'number' && typeof m.prevPx === 'number' && typeof m.lerpStart === 'number' && typeof m.lerpEnd === 'number') {
                    // Fallback: interpolation d'une case vers l'autre
                    const t = Math.max(0, Math.min(1, (now - m.lerpStart) / (m.lerpEnd - m.lerpStart)));
                    m.px = m.prevPx + (m.nextPx - m.prevPx) * t;
                    m.py = m.prevPy + (m.nextPy - m.prevPy) * t;
                    if (t >= 1) {
                        m.px = m.nextPx; m.py = m.nextPy;
                        m.moving = false;
                        m.prevPx = m.nextPx; m.prevPy = m.nextPy;
                    }
                }
            }
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
    
    // Mise à jour des banquiers si on est sur la map banque
    if (window.currentMap === "banque" && typeof window.updateBanquiers === "function") {
        window.updateBanquiers(ts);
    }
    
    // Mise à jour des mentors
    if (typeof window.MentorManager !== 'undefined' && window.MentorManager.update) {
        window.MentorManager.update(ts);
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

    // OPTIMISATION : Dessiner le jeu seulement si nécessaire
    if (config.needsRedraw) {
        drawGame();
    }

    // Continuer la boucle SEULEMENT si on est en mode jeu
    if (window.gameState === "playing") {
        requestAnimationFrame(gameLoop);
    } else {
        // Boucle de jeu arrêtée
    }
}

// SYSTÈME DE MONITORING DES PERFORMANCES
function initPerformanceMonitor() {
    if (window.performanceMonitor) return;
    
    // Créer l'élément d'affichage des performances
    const perfDiv = document.createElement('div');
    perfDiv.id = 'performance-monitor';
    perfDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        display: none;
    `;
    
    document.body.appendChild(perfDiv);
    
    // Fonction de mise à jour des performances
    window.updatePerformanceDisplay = function() {
        if (!window.performanceConfig || !perfDiv) return;
        
        const config = window.performanceConfig;
        const fps = config.currentFPS || 0;
        const target = config.targetFPS || 60;
        
        // Couleur selon les performances
        let color = 'lime';
        if (fps < 30) color = 'orange';
        if (fps < 20) color = 'red';
        
        perfDiv.innerHTML = `
            <div style="color: ${color}">FPS: ${fps}</div>
            <div style="color: #ccc">Cible: ${target}</div>
            <div style="color: #ccc">Redessinage: ${config.needsRedraw ? 'OUI' : 'NON'}</div>
        `;
    };
    
    // Afficher/masquer avec F3
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F3') {
            perfDiv.style.display = perfDiv.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    // Mettre à jour toutes les secondes
    setInterval(() => {
        if (window.gameState === 'playing') {
            window.updatePerformanceDisplay();
        }
    }, 1000);
    
    window.performanceMonitor = true;
}

// Initialiser le moniteur de performances
setTimeout(initPerformanceMonitor, 2000);

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
  
  // Sort explosif (slot 2)
  const explosiveLevelElement = document.querySelector('#sort-damage-panel-explosive .sort-detail-level-star');
  if (explosiveLevelElement && spells['spell-slot-2']) {
    explosiveLevelElement.textContent = `⭐ ${spells['spell-slot-2'].levelRequired}`;
  }
  
  // Sort triple (slot 3)
  const tripleLevelElement = document.querySelector('#sort-damage-panel-triple .sort-detail-level-star');
  if (tripleLevelElement && spells['spell-slot-3']) {
    tripleLevelElement.textContent = `⭐ ${spells['spell-slot-3'].levelRequired}`;
  }
  
  // Sort Rassemblement (slot 5)
  const rassemblementLevelElement = document.querySelector('#sort-damage-panel-rassemblement .sort-detail-level-star');
  if (rassemblementLevelElement && spells['spell-slot-5']) {
    rassemblementLevelElement.textContent = `⭐ ${spells['spell-slot-5'].levelRequired}`;
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
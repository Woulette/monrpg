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
        }
};

// Attendre que tous les scripts soient chargés
document.addEventListener('DOMContentLoaded', () => {
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
    const punchPanel = document.getElementById('sort-damage-panel-punch');
    const explosivePanel = document.getElementById('sort-damage-panel-explosive');
    const triplePanel = document.getElementById('sort-damage-panel-triple');

    if (punchRow && explosiveRow && tripleRow && punchPanel && explosivePanel && triplePanel) {
        punchRow.addEventListener('click', () => {
            punchPanel.style.display = '';
            explosivePanel.style.display = 'none';
            triplePanel.style.display = 'none';
            punchRow.classList.add('selected');
            explosiveRow.classList.remove('selected');
            tripleRow.classList.remove('selected');
        });
        explosiveRow.addEventListener('click', () => {
            punchPanel.style.display = 'none';
            explosivePanel.style.display = '';
            triplePanel.style.display = 'none';
            punchRow.classList.remove('selected');
            explosiveRow.classList.add('selected');
            tripleRow.classList.remove('selected');
        });
        tripleRow.addEventListener('click', () => {
            punchPanel.style.display = 'none';
            explosivePanel.style.display = 'none';
            triplePanel.style.display = '';
            punchRow.classList.remove('selected');
            explosiveRow.classList.remove('selected');
            tripleRow.classList.add('selected');
        });
    }
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
  return { damage, isCrit };
}

// Lancer le sort Coup de poing explosif (slot 2)
function castExplosivePunch() {
  const slot2 = document.getElementById('spell-slot-2');
  if (slot2 && !slot2.classList.contains('cooldown')) {
    if (typeof attackTarget === 'object' && attackTarget && Math.abs(player.x - attackTarget.x) + Math.abs(player.y - attackTarget.y) === 1 && attackTarget.hp > 0) {
      const { damage, isCrit } = computeSpellDamage(12, 20);
      attackTarget.hp -= damage;
      if (typeof displayDamage === 'function') {
        displayDamage(attackTarget.px, attackTarget.py, damage, isCrit ? 'critique' : 'damage', false);
      }
      if (typeof createExplosionEffect === 'function') {
        createExplosionEffect(attackTarget.px, attackTarget.py);
      }
      startSpellCooldown('spell-slot-2', 15.0);
    }
  }
}

// Lancer le sort Triple Coup de Poing (slot 3)
function castTriplePunch() {
  const slot3 = document.getElementById('spell-slot-3');
  if (slot3 && !slot3.classList.contains('cooldown')) {
    if (typeof attackTarget === 'object' && attackTarget && Math.abs(player.x - attackTarget.x) + Math.abs(player.y - attackTarget.y) === 1 && attackTarget.hp > 0) {
      // Démarrer le cooldown immédiatement pour éviter les abus
      startSpellCooldown('spell-slot-3', 10.0);
      
      // Premier coup
      setTimeout(() => {
        if (attackTarget && attackTarget.hp > 0) {
          const { damage: damage1, isCrit: isCrit1 } = computeSpellDamage(6, 10);
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
          const { damage: damage2, isCrit: isCrit2 } = computeSpellDamage(6, 10);
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
          const { damage: damage3, isCrit: isCrit3 } = computeSpellDamage(6, 10);
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
      const { damage, isCrit } = computeSpellDamage(baseMin, baseMax);
      attackTarget.hp -= damage;
      if (typeof displayDamage === 'function') {
        displayDamage(attackTarget.px, attackTarget.py, damage, isCrit ? 'critique' : 'damage', false);
      }
      if (typeof effetSpecial === 'function') {
        effetSpecial(attackTarget.px, attackTarget.py);
      }
      startSpellCooldown(slotId, cooldown);

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
        castSpell('spell-slot-2', spell.baseMin, spell.baseMax, spell.cooldown, createExplosionEffect);
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
        castTriplePunch();
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
        castSpell('spell-slot-2', spell.baseMin, spell.baseMax, spell.cooldown, createExplosionEffect);
      } else if (spell) {
        if (typeof addChatMessage === 'function') {
          addChatMessage(`Niveau ${spell.levelRequired} requis pour ${spell.name}`, 'system');
        }
      }
    }
    // Sort 3 : Triple Coup de Poing (touches '3' ou '#')
    if (e.key === '3' || e.key === '#') {
      const spell = SPELLS['spell-slot-3'];
      if (spell && spell.unlocked) {
        castTriplePunch();
      } else if (spell) {
        if (typeof addChatMessage === 'function') {
          addChatMessage(`Niveau ${spell.levelRequired} requis pour ${spell.name}`, 'system');
        }
      }
    }
  });
});

// (Tout le code des établies a été déplacé dans js/metier/etablie.js)

// Fonction pour vérifier et mettre à jour le déverrouillage des sorts
function updateSpellUnlockStatus() {
  console.log('updateSpellUnlockStatus appelée');
  console.log('player:', player);
  console.log('player.level:', player ? player.level : 'player non défini');
  console.log('window.currentCharacterId:', window.currentCharacterId);
  
  if (!player || !player.level) {
    console.log('Player ou player.level non défini, sortie de la fonction');
    return;
  }
  
  let anySpellUnlocked = false;

  Object.keys(SPELLS).forEach(slotId => {
    const spell = SPELLS[slotId];
    const wasUnlocked = spell.unlocked;
    
    // Vérifier si le sort doit être déverrouillé basé sur le niveau actuel
    const shouldBeUnlocked = player.level >= spell.levelRequired;
    
    // Si le sort n'est pas encore débloqué ET que le joueur a le niveau requis, le déverrouiller
    if (!spell.unlocked && shouldBeUnlocked) {
      spell.unlocked = true;
      anySpellUnlocked = true;
      console.log(`Nouveau sort déverrouillé: ${spell.name}`);
      console.log(`🎉 Nouveau sort déverrouillé : ${spell.name} !`);
    }
    
    console.log(`Sort ${spell.name}: niveau requis ${spell.levelRequired}, niveau joueur ${player.level}, déverrouillé: ${spell.unlocked}`);
  });

  // Sauvegarder l'état des sorts débloqués APRÈS avoir traité tous les sorts
  // Seulement si un personnage est connecté
  if (window.currentCharacterId) {
    saveUnlockedSpells();
  } else {
    console.log('Aucun personnage connecté, pas de sauvegarde des sorts');
  }
  
  // Mettre à jour l'affichage visuel des sorts de manière différée pour éviter les freezes
  requestAnimationFrame(() => {
    updateSpellVisuals();
  });
}

// Fonction pour sauvegarder les sorts débloqués
function saveUnlockedSpells() {
  if (!window.currentCharacterId) {
    console.log('Aucun personnage connecté, impossible de sauvegarder les sorts');
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
  console.log('Sorts débloqués sauvegardés:', unlockedSpellsData);
}

// Fonction pour charger les sorts débloqués
function loadUnlockedSpells() {
  console.log('loadUnlockedSpells appelée');
  console.log('window.currentCharacterId:', window.currentCharacterId);
  console.log('player:', player);
  console.log('player.level:', player ? player.level : 'N/A');
  
  if (!window.currentCharacterId) {
    console.log('Aucun personnage connecté, impossible de charger les sorts');
    return;
  }
  
  const saveKey = `monrpg_unlocked_spells_${window.currentCharacterId}`;
  const savedData = localStorage.getItem(saveKey);
  
  console.log('Clé de sauvegarde:', saveKey);
  console.log('Données sauvegardées trouvées:', !!savedData);
  
  if (savedData) {
    try {
      const unlockedSpellsData = JSON.parse(savedData);
      console.log('Données de sorts débloqués chargées:', unlockedSpellsData);
      
      Object.keys(unlockedSpellsData).forEach(slotId => {
        if (SPELLS[slotId]) {
          const savedSpell = unlockedSpellsData[slotId];
          const currentSpell = SPELLS[slotId];
          
          console.log(`Traitement du sort ${currentSpell.name}: sauvegardé comme débloqué = ${savedSpell.unlocked}`);
          
          // Si le sort était débloqué dans la sauvegarde, le restaurer comme débloqué
          if (savedSpell.unlocked) {
            currentSpell.unlocked = true;
            console.log(`Sort ${currentSpell.name} restauré comme débloqué (était sauvegardé comme débloqué)`);
          } else {
            // Si le sort n'était pas débloqué dans la sauvegarde, utiliser la logique normale
            currentSpell.unlocked = player && player.level >= currentSpell.levelRequired;
            console.log(`Sort ${currentSpell.name} non sauvegardé, vérification niveau: ${player ? player.level : 'N/A'} >= ${currentSpell.levelRequired}`);
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des sorts débloqués:', error);
    }
  } else {
    console.log('Aucune sauvegarde de sorts débloqués trouvée');
    // Pour un nouveau personnage, initialiser les sorts basés sur son niveau
    console.log('Initialisation des sorts pour nouveau personnage basée sur le niveau');
    Object.keys(SPELLS).forEach(slotId => {
      const spell = SPELLS[slotId];
      spell.unlocked = player && player.level >= spell.levelRequired;
      console.log(`Sort ${spell.name}: niveau requis ${spell.levelRequired}, niveau joueur ${player ? player.level : 'N/A'}, déverrouillé: ${spell.unlocked}`);
    });
  }
}

// Fonction pour mettre à jour l'affichage visuel des sorts
function updateSpellVisuals() {
  console.log('updateSpellVisuals appelée');
  
  Object.keys(SPELLS).forEach(slotId => {
    const spell = SPELLS[slotId];
    const slotElement = document.getElementById(slotId);
    
    console.log(`Traitement du sort ${spell.name} (${slotId}): déverrouillé = ${spell.unlocked}`);
    
    if (slotElement) {
      const wasLocked = slotElement.classList.contains('locked');
      
      if (spell.unlocked) {
        slotElement.classList.remove('locked');
        slotElement.classList.add('unlocked');
        slotElement.style.opacity = '1';
        slotElement.style.cursor = 'pointer';
        
        // Animation si le sort vient d'être déverrouillé
        if (wasLocked) {
          console.log(`Animation de déverrouillage pour ${spell.name}`);
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
    } else {
      console.log(`Élément DOM non trouvé pour ${slotId}`);
    }
  });
  
  console.log('updateSpellVisuals terminée');
  
  // Ne pas appeler updateSpellDetailsDisplay ici pour éviter les problèmes de performance
  // updateSpellDetailsDisplay sera appelée séparément si nécessaire
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
  console.log('Test de déverrouillage des sorts...');
  console.log('Player:', player);
  console.log('Player level:', player ? player.level : 'non défini');
  console.log('SPELLS:', SPELLS);
  
  if (typeof updateSpellUnlockStatus === 'function') {
    updateSpellUnlockStatus();
  } else {
    console.log('updateSpellUnlockStatus non disponible');
  }
  
  if (typeof updateSpellVisuals === 'function') {
    updateSpellVisuals();
  } else {
    console.log('updateSpellVisuals non disponible');
  }
  
  if (typeof updateSpellDetailsDisplay === 'function') {
    updateSpellDetailsDisplay();
  } else {
    console.log('updateSpellDetailsDisplay non disponible');
  }
};

// Export global des fonctions de gestion des sorts
window.updateSpellUnlockStatus = updateSpellUnlockStatus;
window.updateSpellVisuals = updateSpellVisuals;
window.updateSpellDetailsDisplay = updateSpellDetailsDisplay;
window.saveUnlockedSpells = saveUnlockedSpells;
window.loadUnlockedSpells = loadUnlockedSpells;
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
            id: "boss_potion_slime",
            name: "Potion du SlimeBoss",
            type: "potion",
            category: "consommable",
            description: "Une potion magique qui restaure complètement la vie",
            image: "assets/objets/potion_slimeboss.png",
            effect: "restore_full_hp"
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
            if (typeof window.openQuestsModal === 'function') {
                window.openQuestsModal();
            }
            break;
        case 'escape':
            e.preventDefault();
            if (typeof window.closeAllModals === 'function') {
                window.closeAllModals();
            }
            break;
    }
});

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




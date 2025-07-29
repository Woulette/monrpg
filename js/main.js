const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Attendre que tous les scripts soient chargés
document.addEventListener('DOMContentLoaded', () => {
    // Charger la map1 par défaut
    loadMap('map1')
        .then(success => {
            if (!success) {
                throw new Error("Impossible de charger map1 !");
            }
            return new Promise(resolve => {
                if (playerImg.complete) resolve();
                else playerImg.onload = resolve;
            });
        })
        .then(() => {
            // Plus de nettoyage des données de monstres - système supprimé
            
            // Initialize game systems
            initMap();
            initPlayer();
            // initMonsters() est maintenant appelé automatiquement dans loadMap()
            // Nettoyage des données corrompues au démarrage
            if (typeof window.cleanCorruptedSaveData === "function") {
                window.cleanCorruptedSaveData();
            }
            
            // Initialiser l'inventaire AVANT de charger la sauvegarde
            initInventory();
            initStats();
            
            // Charger la sauvegarde si elle existe APRÈS l'initialisation
            if (typeof window.loadGame === "function") {
                window.loadGame();
            }
            initHUD();
            initPathfinding();
            initChat(); // Système de chat séparé
            initFloatingChat(); // Système de chat flottant
            initEquipmentSystem(); // Système d'équipement
            initEtablies(); // Système d'établies
            initQuestsWindow(); // Système de fenêtre des quêtes
            
            requestAnimationFrame(gameLoop);
        })
        .catch(e => {
            alert("Erreur de chargement : " + e.message);
        });

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
    const punchPanel = document.getElementById('sort-damage-panel-punch');
    const explosivePanel = document.getElementById('sort-damage-panel-explosive');

    if (punchRow && explosiveRow && punchPanel && explosivePanel) {
        punchRow.addEventListener('click', () => {
            punchPanel.style.display = '';
            explosivePanel.style.display = 'none';
            punchRow.classList.add('selected');
            explosiveRow.classList.remove('selected');
        });
        explosiveRow.addEventListener('click', () => {
            punchPanel.style.display = 'none';
            explosivePanel.style.display = '';
            punchRow.classList.remove('selected');
            explosiveRow.classList.add('selected');
        });
    }
});

// La boucle principale du jeu
function gameLoop(ts) {
   
    updatePlayer(ts);

    // Déplacement pixel par pixel des monstres
    if (typeof moveMonsters === "function") {
        moveMonsters(ts);
    }

    // Logique IA des monstres
    if (typeof updateMonsters === "function") {
        updateMonsters(ts);
    }
    
    if (typeof updatePNJs === "function") {
        updatePNJs(ts);
    }

    // Mise à jour des effets de dégâts
    if (typeof updateDamageEffects === "function") {
        updateDamageEffects();
    }

    // Gestion du respawn des monstres
    if (typeof updateMonsterRespawn === "function") {
        updateMonsterRespawn();
    }
    
    // Système de respawn automatique du joueur
    if (player.isDead) {
        const currentTime = Date.now();
        const elapsed = currentTime - player.deathTime;
        console.log("Temps écoulé depuis la mort:", elapsed, "ms");
        if (currentTime - player.deathTime >= player.respawnTime) {
            console.log("Respawn automatique déclenché !");
            respawnPlayer();
        }
    }

    if (player.moving) {
        if (!lastAnim || ts - lastAnim > animDelay) {
            player.frame = (player.frame + 1) % 4;
            lastAnim = ts;
        }
    } else {
        player.frame = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    // drawMonsters(ctx); // Retiré car déjà appelé dans drawMap

    if (typeof drawHUD === "function") {
        drawHUD(ctx);
    }

    requestAnimationFrame(gameLoop);
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

// Fonction générique pour lancer un sort (clic ou clavier)
function castSpell(slotId, baseMin, baseMax, cooldown, effetSpecial) {
  if (!player.inCombat) return;
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
        if (typeof release === "function") release(attackTarget.x, attackTarget.y);
        if (typeof displayDamage === "function") {
          displayDamage(player.px, player.py, `+${attackTarget.xpValue || 0} XP`, 'xp', true);
        }
        if (typeof gainXP === "function") gainXP(attackTarget.xpValue || 0);
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
    }
  }
}

// Démo : cooldown au clic sur le slot
window.addEventListener('DOMContentLoaded', () => {
  const slot1 = document.getElementById('spell-slot-1');
  const slot2 = document.getElementById('spell-slot-2');
  if (slot1) {
    slot1.addEventListener('click', () => {
      castSpell('spell-slot-1', 3, 6, 1.0, null);
    });
  }
  if (slot2) {
    slot2.addEventListener('click', () => {
      castSpell('spell-slot-2', 12, 20, 15.0, createExplosionEffect);
    });
  }

  // Gestion du clavier pour lancer les sorts
  window.addEventListener('keydown', (e) => {
    // Sort 1 : Coup de poing (touches '1' ou '&')
    if (e.key === '1' || e.key === '&') {
      castSpell('spell-slot-1', 3, 6, 1.0, null);
    }
    // Sort 2 : Coup de poing explosif (touches '2' ou 'é')
    if (e.key === '2' || e.key === 'é' || e.key === 'É') {
      castSpell('spell-slot-2', 12, 20, 15.0, createExplosionEffect);
    }
  });
});

// (Tout le code des établies a été déplacé dans js/metier/etablie.js)

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
        console.log("❌ Usage: teleportToMap('nomDeLaMap', x, y)");
        console.log("📋 Maps disponibles: map1, map2, map3, mapdonjonslime, mapdonjonslime2, mapdonjonslimeboss");
        return;
    }
    
    console.log(`🚀 Téléportation vers ${mapName} aux coordonnées (${x}, ${y})`);
    
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
    
    console.log(`✅ Téléportation réussie vers ${mapName}`);
};

// Afficher les commandes disponibles au démarrage
console.log("🎮 Commandes de téléportation disponibles:");
console.log("teleportToMap('map1') - Téléportation vers map1");
console.log("teleportToMap('map2') - Téléportation vers map2");
console.log("teleportToMap('map3') - Téléportation vers map3");
console.log("teleportToMap('mapdonjonslime') - Téléportation vers le donjon slime");
console.log("teleportToMap('mapdonjonslime2') - Téléportation vers le donjon slime niveau 2");
console.log("teleportToMap('mapdonjonslimeboss') - Téléportation vers l'antre du SlimeBoss");
console.log("teleportToMap('nomMap', x, y) - Téléportation avec coordonnées personnalisées");

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
    console.log("Initialisation du système d'établies...");
    
    // Vérifier que les fonctions des établies sont disponibles
    if (typeof window.openTailorWorkshopModal === 'function') {
        console.log("✓ Fonction openTailorWorkshopModal disponible");
    } else {
        console.error("✗ Fonction openTailorWorkshopModal manquante");
    }
    
    if (typeof window.openCordonnierWorkshopModal === 'function') {
        console.log("✓ Fonction openCordonnierWorkshopModal disponible");
    } else {
        console.error("✗ Fonction openCordonnierWorkshopModal manquante");
    }
    
    if (typeof window.openBijoutierWorkshopModal === 'function') {
        console.log("✓ Fonction openBijoutierWorkshopModal disponible");
    } else {
        console.error("✗ Fonction openBijoutierWorkshopModal manquante");
    }
    
    console.log("Système d'établies initialisé avec succès");
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
    
    console.log("🎉 Popup de victoire du SlimeBoss affichée");
};

// Fonction pour afficher la fenêtre de sélection d'objets du coffre
window.showBossChestWindow = function() {
    console.log("🎁 Affichage de la fenêtre de sélection du coffre du SlimeBoss...");
    
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
            id: "boss_sword_slime",
            name: "Épée du SlimeBoss",
            type: "arme",
            category: "équipement",
            description: "Une épée forgée dans l'essence du SlimeBoss",
            image: "assets/equipements/epee_slimeboss.png",
            stats: { force: 15, defense: 5 }
        },
        {
            id: "boss_armor_slime",
            name: "Armure du SlimeBoss",
            type: "armure",
            category: "équipement",
            description: "Une armure résistante créée à partir du SlimeBoss",
            image: "assets/equipements/armure_slimeboss.png",
            stats: { defense: 20, hp: 50 }
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
                    <div style="width: 64px; height: 64px; background: #555; margin: 0 auto 10px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 24px;">📦</div>
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
            console.log(`🎁 Objet sélectionné: ${selectedItem.name}`);
            
            // Ajouter l'objet à l'inventaire
            if (typeof window.addItemToInventory === "function") {
                window.addItemToInventory(selectedItem);
                console.log(`✅ ${selectedItem.name} ajouté à l'inventaire`);
            }
            
            // Fermer la fenêtre
            document.body.removeChild(chestWindow);
            
            // Téléporter vers map3 après un délai
            setTimeout(() => {
                console.log("🚪 Téléportation vers map3 après sélection de la récompense...");
                if (typeof window.teleportPlayer === "function") {
                    window.teleportPlayer("map3", 10, 10);
                }
                
                // Sauvegarde immédiate après téléportation
                setTimeout(() => {
                    if (typeof window.saveGameState === "function") {
                        window.saveGameState();
                        console.log("💾 Sauvegarde automatique effectuée après sélection de la récompense");
                    }
                }, 500);
            }, 1000);
        });
    });
    
    // Gestionnaire pour fermer la fenêtre
    document.getElementById('close-chest-window').addEventListener('click', function() {
        document.body.removeChild(chestWindow);
    });
    
    console.log("🎁 Fenêtre de sélection du coffre affichée");
};

// Fonction pour donner la récompense du boss (remplacée par la fenêtre de sélection)
window.giveBossReward = function() {
    console.log("🎁 Ouverture de la fenêtre de sélection du coffre...");
    
    // Afficher la fenêtre de sélection
    if (typeof window.showBossChestWindow === "function") {
        window.showBossChestWindow();
    }
};


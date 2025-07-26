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
            // Initialize game systems
            initMap();
            initPlayer();
            initMonsters();
            initInventory();
            initStats();
            initHUD();
            initPathfinding();
            initChat(); // Système de chat séparé
            initFloatingChat(); // Système de chat flottant
            initEquipmentSystem(); // Système d'équipement
            
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

function positionHudIcons() {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();

    // Inventaire (en bas à droite)
    const inventoryIcon = document.getElementById('inventory-icon');
    inventoryIcon.style.left = (rect.width * 0.96) + 'px';
    inventoryIcon.style.top = (rect.height * 0.91) + 'px';

    // Stats (à gauche de l'inventaire)
    const statsIcon = document.getElementById('stats-icon');
    statsIcon.style.left = (rect.width * 0.92) + 'px';
    statsIcon.style.top = (rect.height * 0.91) + 'px';

    // Métier (encore à gauche)
    const metierIcon = document.getElementById('metier-icon');
    metierIcon.style.left = (rect.width * 0.88) + 'px';
    metierIcon.style.top = (rect.height * 0.91) + 'px';

    // Sort (encore à gauche)
    const sortIcon = document.getElementById('sort-icon');
    sortIcon.style.left = (rect.width * 0.84) + 'px';
    sortIcon.style.top = (rect.height * 0.91) + 'px';

    const spellBar = document.getElementById('spell-shortcut-bar');
    if (spellBar && canvas) {
        const rect = canvas.getBoundingClientRect();
        spellBar.style.position = 'fixed'; // Utilise fixed, pas absolute !
        spellBar.style.left = (rect.left + rect.width * 0.01) + 'px';
        spellBar.style.top  = (rect.top  + rect.height * 0.915) + 'px';
        spellBar.style.zIndex = 1200;
        spellBar.style.display = 'flex';
        // Largeur proportionnelle au canvas, mais jamais trop petite
        const slotCount = spellBar.querySelectorAll('.spell-slot').length;
        const minWidth = slotCount * 36 + (slotCount - 1) * 8 + 10;
        spellBar.style.width = Math.max(rect.width * 0.38, minWidth) + 'px';
    }    
}
window.addEventListener('resize', () => {
    resizeGameCanvas();
    positionHudIcons();
});
document.addEventListener('DOMContentLoaded', () => {
    resizeGameCanvas();
    positionHudIcons();
});


// js/systems/dev-utils.js
// Utilitaires de développement et fonctions d'urgence (extraites de main.js)

(function(){
  // Diagnostic perfs
  function diagnosePerformance(){ /* no-op or future metrics */ }
  window.diagnosePerformance = diagnosePerformance;

  // Spawn rapide d'un monstre pour tests
  window.spawnMonster = function(type) {
    let img = null;
    if (type === 'maitrecorbeau') {
      img = window.maitreCorbeauImg || new Image();
    } else if (type === 'corbeau') {
      img = window.corbeauImg || new Image();
    }
    const monstre = {
      type,
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
      img,
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

  // Téléportation utilitaire
  window.teleportToMap = function(mapName, x = 400, y = 300) {
    if (!mapName) return;
    if (window.saveGame) window.saveGame();
    window.currentMap = mapName;
    window.player.x = x;
    window.player.y = y;
    if (window.loadMap) window.loadMap(mapName);
    if (window.loadMonstersForMap) window.loadMonstersForMap(mapName);
    if (window.loadPNJsForMap) window.loadPNJsForMap(mapName);
  };

  // Force render
  window.forceRender = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    if (window.gameState === 'playing' && canvas && ctx && typeof drawGame === 'function') {
      drawGame();
    }
  };

  // Rechargement images
  window.reloadImages = function() {
    if (window.playerImg) {
      window.playerImg.src = window.playerImg.src;
    }
    if (window.mapData && window.mapData.tilesets) {
      window.mapData.tilesets.forEach((tileset) => {
        if (tileset.image) tileset.image.src = tileset.image.src;
      });
    }
  };

  // Nettoyage visuel d'urgence
  window.emergencyClearAllVisualEffects = function() {
    if (typeof clearBlackScreen === 'function') clearBlackScreen();
    if (typeof clearAllDamageEffects === 'function') clearAllDamageEffects();
    if (typeof emergencyClearCombatEffects === 'function') emergencyClearCombatEffects();
    if (typeof drawMap === 'function') drawMap();
  };

  // Nettoyage auto (supprimer classes menu actives en jeu)
  let autoCleanupInterval = null;
  function startAutoCleanup(){
    if (autoCleanupInterval) clearInterval(autoCleanupInterval);
    autoCleanupInterval = setInterval(() => {
      if (window.gameState === 'playing' && (document.body.classList.contains('character-menu-active') || document.body.classList.contains('menu-active'))){
        document.body.classList.remove('character-menu-active', 'menu-active');
      }
    }, 5000);
  }
  window.startAutoCleanup = startAutoCleanup;
  setTimeout(startAutoCleanup, 2000);

  // Outils d'équipement d'urgence
  window.urgenceEquipement = function() {
    if (typeof window.unequipItem !== 'function') {
      window.unequipItem = function(slot) {
        if (!window.equippedItems) return false;
        const item = window.equippedItems[slot];
        if (!item) return false;
        window.equippedItems[slot] = null;
        if (typeof window.applyEquipmentStats === 'function') window.applyEquipmentStats();
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
        if (modal) modal.style.display = 'none';
      };
    }
  };

  window.urgenceEquipementSilencieux = function() {
    if (typeof window.unequipItem !== 'function') {
      window.unequipItem = function(slot) {
        if (!window.equippedItems) return false;
        const item = window.equippedItems[slot];
        if (!item) return false;
        window.equippedItems[slot] = null;
        if (typeof window.applyEquipmentStats === 'function') window.applyEquipmentStats();
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
        if (modal) modal.style.display = 'none';
      };
    }
  };

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

})();



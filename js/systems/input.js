// js/systems/input.js
// Centralisation des entrées clavier UI (I, S, Q, F, M, Escape)

(function(){
  let gameInputsEnabled = false;

  function disableGameInputs(){ gameInputsEnabled = false; }
  function enableGameInputs(){ gameInputsEnabled = true; }

  function handleUiKeydown(e){
    if (!gameInputsEnabled || window.gameState !== 'playing') return;
    // Affichage rapide des coordonnées avec G
    if (e.key === 'g' || e.key === 'G') {
      e.preventDefault();
      const map = window.currentMap || 'unknown';
      const x = window.player ? window.player.x : '?';
      const y = window.player ? window.player.y : '?';
      const msg = `📍 ${map} (${x}, ${y})`;
      if (typeof window.showFloatingMessage === 'function' && window.player) {
        window.showFloatingMessage(msg, window.player.x, window.player.y - 60, '#00E676', '14px');
      } else {
        console.log(msg);
      }
      return;
    }
    // Raccourcis sorts 1/2/3
    if (e.key === '1' || e.key === '&') {
      const spell = window.SPELLS && window.SPELLS['spell-slot-1'];
      if (spell && spell.unlocked) {
        e.preventDefault(); e.stopPropagation();
        if (typeof window.castPunch === 'function') window.castPunch();
      }
      return;
    }
    if (e.key === '2' || e.key === 'é' || e.key === 'É') {
      const spell = window.SPELLS && window.SPELLS['spell-slot-2'];
      if (spell && spell.unlocked) {
        e.preventDefault(); e.stopPropagation();
        if (typeof window.castExplosivePunch === 'function') window.castExplosivePunch();
      }
      return;
    }
    if (e.key === '3' || e.key === '#' || e.code === 'Digit3' || e.code === 'Key3') {
      const spell = window.SPELLS && window.SPELLS['spell-slot-3'];
      if (spell && spell.unlocked) {
        e.preventDefault(); e.stopPropagation();
        if (typeof window.handleTriplePunchCombo === 'function') window.handleTriplePunchCombo();
      }
      return;
    }
    // Raccourci sort 4: Poingheal
    if (e.key === '4' || e.key === '$' || e.code === 'Digit4' || e.code === 'Key4') {
      const spell = window.SPELLS && window.SPELLS['spell-slot-4'];
      if (spell && spell.unlocked) {
        e.preventDefault(); e.stopPropagation();
        if (typeof window.castPoingheal === 'function') window.castPoingheal();
      }
      return;
    }
    // Raccourci sort 5: Rassemblement (active le mode ciblage)
    if (e.key === '5' || e.key === '%' || e.code === 'Digit5' || e.code === 'Key5') {
      const spell = window.SPELLS && window.SPELLS['spell-slot-5'];
      if (spell && spell.unlocked) {
        e.preventDefault(); e.stopPropagation();
        if (typeof window.castRassemblement === 'function') window.castRassemblement();
      }
      return;
    }
    const k = e.key.toLowerCase();
    switch(k){
      case 'i':
        e.preventDefault();
        if (typeof window.openInventoryModal === 'function') window.openInventoryModal();
        break;
      case 's':
        e.preventDefault();
        if (typeof window.openStatsModal === 'function') window.openStatsModal();
        break;
      case 'q':
      case 'f': {
        e.preventDefault();
        const questsModal = document.getElementById('quests-main-modal');
        if (questsModal) {
          const isOpen = questsModal.style.display === 'flex';
          questsModal.style.display = isOpen ? 'none' : 'flex';
        } else if (typeof window.openQuestsModal === 'function') {
          window.openQuestsModal();
        }
        break;
      }
      case 'm': {
        e.preventDefault();
        const mapModal = document.getElementById('map-modal');
        if (mapModal) {
          const isOpen = mapModal.style.display === 'flex';
          mapModal.style.display = isOpen ? 'none' : 'flex';
        }
        break;
      }
      case 'escape': {
        e.preventDefault();
        const modalsToClose = [
          document.getElementById('map-modal'),
          document.getElementById('quests-main-modal'),
          document.getElementById('sort-modal'),
          document.getElementById('inventory-modal'),
          document.getElementById('stats-modal')
        ];
        let closed = false;
        modalsToClose.forEach(modal => {
          if (modal && (modal.style.display === 'flex' || modal.style.display === 'block')) {
            modal.style.display = 'none';
            closed = true;
          }
        });
        if (!closed && typeof window.closeAllModals === 'function') window.closeAllModals();
        break;
      }
      default:
        break;
    }
  }

  window.addEventListener('keydown', handleUiKeydown);
  // Délégation de fermeture des modales (fiabilise les boutons X)
  // Capture pour contourner d'éventuels stopPropagation ou overlays
  document.addEventListener('click', (e) => {
    const getPath = () => (typeof e.composedPath === 'function') ? e.composedPath() : (function(){
      const path = []; let node = e.target; while(node){ path.push(node); node = node.parentNode; } return path;
    })();
    const path = getPath();
    const includesId = (id) => path && path.some(n => n && n.id === id);
    // Inventaire
    if (includesId('close-inventory')) {
      e.preventDefault();
      const m = document.getElementById('inventory-modal');
      if (m) m.style.display = 'none';
    }
    // Statistiques
    if (includesId('close-stats')) {
      e.preventDefault();
      const m = document.getElementById('stats-modal');
      if (m) m.style.display = 'none';
    }
    // Sorts
    if (includesId('close-sort-modal')) {
      e.preventDefault();
      const m = document.getElementById('sort-modal');
      if (m) m.style.display = 'none';
    }
    // Fiche équipement (X)
    if (includesId('close-equipment-detail')) {
      e.preventDefault();
      const m = document.getElementById('equipment-detail-modal');
      if (m) m.style.display = 'none';
    }
  }, true);
  window.disableGameInputs = disableGameInputs;
  window.enableGameInputs = enableGameInputs;
})();



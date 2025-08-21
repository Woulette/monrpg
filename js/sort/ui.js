// UI des sorts: modale, panneaux, slots d'orbes, sauvegarde/chargement des upgrades

(function(){
  function updateSpellDamageDisplay(spellId, minDamage, maxDamage){
    let panel, text;
    switch(spellId){
      case 'punch':
        panel = document.getElementById('sort-damage-panel-punch');
        text = panel && panel.querySelector('.sort-detail-damage-value');
        if (text) text.textContent = `${minDamage}-${maxDamage}`;
        break;
      case 'explosive':
        panel = document.getElementById('sort-damage-panel-explosive');
        text = panel && panel.querySelector('.sort-detail-damage-value');
        if (text) text.textContent = `${minDamage}-${maxDamage}`;
        break;
      case 'triple':
        panel = document.getElementById('sort-damage-panel-triple');
        text = panel && panel.querySelector('.sort-detail-damage-value');
        if (text) text.textContent = `${minDamage}-${maxDamage} (x3)`;
        break;
      case 'poingheal':
        panel = document.getElementById('sort-damage-panel-poingheal');
        text = panel && panel.querySelector('.sort-detail-damage-value');
        if (text) text.textContent = `${minDamage}-${maxDamage}`;
        break;
      case 'rassemblement':
        panel = document.getElementById('sort-damage-panel-rassemblement');
        text = panel && panel.querySelector('.sort-detail-damage-value');
        if (text) text.textContent = `${minDamage}-${maxDamage}`;
        break;
    }
  }

  function updateAllSpellDamageDisplays() {
    if (window.punchDamageMin && window.punchDamageMax) updateSpellDamageDisplay('punch', window.punchDamageMin, window.punchDamageMax);
    if (window.explosiveDamageMin && window.explosiveDamageMax) updateSpellDamageDisplay('explosive', window.explosiveDamageMin, window.explosiveDamageMax);
    if (window.tripleDamageMin && window.tripleDamageMax) updateSpellDamageDisplay('triple', window.tripleDamageMin, window.tripleDamageMax);
    if (window.poinghealDamageMin && window.poinghealDamageMax) updateSpellDamageDisplay('poingheal', window.poinghealDamageMin, window.poinghealDamageMax);
    if (window.rassemblementDamageMin && window.rassemblementDamageMax) updateSpellDamageDisplay('rassemblement', window.rassemblementDamageMin, window.rassemblementDamageMax);
  }

  function initUIEventHandlers() {
    const sortIcon = document.getElementById('sort-icon');
    const sortModal = document.getElementById('sort-modal');
    const closeSortModal = document.getElementById('close-sort-modal');
    if (sortIcon && sortModal && closeSortModal) {
      sortIcon.onclick = () => { sortModal.style.display = 'flex'; setTimeout(() => updateAllSpellDamageDisplays(), 50); };
      closeSortModal.onclick = () => { sortModal.style.display = 'none'; };
      sortModal.onclick = (e) => { if (e.target === sortModal) sortModal.style.display = 'none'; };
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
        poinghealPanel && (poinghealPanel.style.display = 'none');
        rassemblementPanel && (rassemblementPanel.style.display = 'none');
        punchRow.classList.add('selected');
        explosiveRow.classList.remove('selected');
        tripleRow.classList.remove('selected');
        poinghealRow && poinghealRow.classList.remove('selected');
        rassemblementRow && rassemblementRow.classList.remove('selected');
      });
      explosiveRow.addEventListener('click', () => {
        punchPanel.style.display = 'none';
        explosivePanel.style.display = '';
        triplePanel.style.display = 'none';
        poinghealPanel && (poinghealPanel.style.display = 'none');
        rassemblementPanel && (rassemblementPanel.style.display = 'none');
        punchRow.classList.remove('selected');
        explosiveRow.classList.add('selected');
        tripleRow.classList.remove('selected');
        poinghealRow && poinghealRow.classList.remove('selected');
        rassemblementRow && rassemblementRow.classList.remove('selected');
      });
      tripleRow.addEventListener('click', () => {
        punchPanel.style.display = 'none';
        explosivePanel.style.display = 'none';
        triplePanel.style.display = '';
        poinghealPanel && (poinghealPanel.style.display = 'none');
        rassemblementPanel && (rassemblementPanel.style.display = 'none');
        punchRow.classList.remove('selected');
        explosiveRow.classList.remove('selected');
        tripleRow.classList.add('selected');
        poinghealRow && poinghealRow.classList.remove('selected');
        rassemblementRow && rassemblementRow.classList.remove('selected');
      });
    }
    if (poinghealRow && poinghealPanel) {
      poinghealRow.addEventListener('click', () => {
        punchPanel.style.display = 'none';
        explosivePanel.style.display = 'none';
        triplePanel.style.display = 'none';
        poinghealPanel.style.display = '';
        rassemblementPanel && (rassemblementPanel.style.display = 'none');
        punchRow.classList.remove('selected');
        explosiveRow.classList.remove('selected');
        tripleRow.classList.remove('selected');
        poinghealRow.classList.add('selected');
        rassemblementRow && rassemblementRow.classList.remove('selected');
      });
    }
    if (rassemblementRow && rassemblementPanel) {
      rassemblementRow.addEventListener('click', () => {
        punchPanel.style.display = 'none';
        explosivePanel.style.display = 'none';
        triplePanel.style.display = 'none';
        poinghealPanel && (poinghealPanel.style.display = 'none');
        rassemblementPanel.style.display = '';
        punchRow.classList.remove('selected');
        explosiveRow.classList.remove('selected');
        tripleRow.classList.remove('selected');
        poinghealRow && poinghealRow.classList.remove('selected');
        rassemblementRow.classList.add('selected');
      });
    }
  }

  function initSpellUpgradeSystem() {
    if (!window.punchDamageMin) window.punchDamageMin = 3;
    if (!window.punchDamageMax) window.punchDamageMax = 6;
    if (!window.explosiveDamageMin) window.explosiveDamageMin = 12;
    if (!window.explosiveDamageMax) window.explosiveDamageMax = 20;
    if (!window.tripleDamageMin) window.tripleDamageMin = 6;
    if (!window.tripleDamageMax) window.tripleDamageMax = 10;

    function hasOrbeInInventory(orbeId) {
      if (!window.inventoryAll) return false;
      for (let slot of window.inventoryAll) {
        if (slot.item && slot.item.id === orbeId) return true;
      }
      return false;
    }
    function removeOrbeFromInventory(orbeId) {
      if (!window.inventoryAll) return false;
      for (let slot of window.inventoryAll) {
        if (slot.item && slot.item.id === orbeId) {
          if (slot.item.quantity && slot.item.quantity > 1) slot.item.quantity--; else slot.item = null;
          return true;
        }
      }
      return false;
    }

    function applySpellDamageBonus(spellId, orbeType) {
      let damageMultiplier = 1;
      switch(orbeType){
        case 'atypique': damageMultiplier = 1.5; break;
        case 'rare': damageMultiplier = 2.0; break;
        case 'epique': damageMultiplier = 2.5; break;
        case 'legendaire': damageMultiplier = 3.0; break;
        default: return;
      }
      switch(spellId){
        case 'punch': window.punchDamageMin = Math.round(3 * damageMultiplier); window.punchDamageMax = Math.round(6 * damageMultiplier); updateSpellDamageDisplay('punch', window.punchDamageMin, window.punchDamageMax); break;
        case 'explosive': window.explosiveDamageMin = Math.round(12 * damageMultiplier); window.explosiveDamageMax = Math.round(20 * damageMultiplier); updateSpellDamageDisplay('explosive', window.explosiveDamageMin, window.explosiveDamageMax); break;
        case 'triple': window.tripleDamageMin = Math.round(6 * damageMultiplier); window.tripleDamageMax = Math.round(10 * damageMultiplier); updateSpellDamageDisplay('triple', window.tripleDamageMin, window.tripleDamageMax); break;
        case 'poingheal': window.poinghealDamageMin = Math.round(10 * damageMultiplier); window.poinghealDamageMax = Math.round(15 * damageMultiplier); updateSpellDamageDisplay('poingheal', window.poinghealDamageMin, window.poinghealDamageMax); break;
        case 'rassemblement': window.rassemblementDamageMin = Math.round(10 * damageMultiplier); window.rassemblementDamageMax = Math.round(15 * damageMultiplier); updateSpellDamageDisplay('rassemblement', window.rassemblementDamageMin, window.rassemblementDamageMax); break;
      }
    }

    // updateSpellDamageDisplay déplacée au niveau supérieur et exposée globalement

    function removeOrbeFromSlot(slot){
      slot.innerHTML = '';
      slot.classList.remove('upgraded');
      slot.style.borderColor = '';
      slot.removeAttribute('data-orbe-id');
      slot.removeAttribute('data-orbe-type');
      const spellId = slot.getAttribute('data-spell');
      switch(spellId){
        case 'punch': window.punchDamageMin = 3; window.punchDamageMax = 6; updateSpellDamageDisplay('punch', 3, 6); break;
        case 'explosive': window.explosiveDamageMin = 12; window.explosiveDamageMax = 20; updateSpellDamageDisplay('explosive', 12, 20); break;
        case 'triple': window.tripleDamageMin = 6; window.tripleDamageMax = 10; updateSpellDamageDisplay('triple', 6, 10); break;
        case 'poingheal': window.poinghealDamageMin = 10; window.poinghealDamageMax = 15; updateSpellDamageDisplay('poingheal', 10, 15); break;
        case 'rassemblement': window.rassemblementDamageMin = 10; window.rassemblementDamageMax = 15; updateSpellDamageDisplay('rassemblement', 10, 15); break;
      }
    }

    function showSpellUnequipModal(slot){
      const modal = document.getElementById('spell-upgrade-modal');
      const orbeImg = document.getElementById('spell-upgrade-orbe-img');
      const text = document.getElementById('spell-upgrade-text');
      const orbeId = slot.getAttribute('data-orbe-id');
      const orbeType = slot.getAttribute('data-orbe-type');
      let orbeName = 'orbe';
      switch(orbeType){
        case 'atypique': orbeName = 'orbe atypique'; orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png'; break;
        case 'rare': orbeName = 'orbe rare'; orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png'; break;
        case 'epique': orbeName = 'orbe épique'; orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png'; break;
        case 'legendaire': orbeName = 'orbe légendaire'; orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png'; break;
      }
      window.currentSpellUnequip = { slot, orbeId, orbeType, spellId: slot.getAttribute('data-spell') };
      text.textContent = `Voulez-vous vraiment déséquiper votre ${orbeName} ?`;
      modal.style.display = 'block';
    }

    function showSpellUpgradeModal(spellId, slotIndex, orbeType){
      const modal = document.getElementById('spell-upgrade-modal');
      const orbeImg = document.getElementById('spell-upgrade-orbe-img');
      const text = document.getElementById('spell-upgrade-text');
      let orbeId, orbeName;
      switch(orbeType){
        case 'atypique': orbeId = 'orbe_atypique_sort_niveau10'; orbeName = 'orbe atypique'; orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png'; break;
        case 'rare': orbeId = 'orbe_rare_sort_niveau10'; orbeName = 'orbe rare'; orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png'; break;
        case 'epique': orbeId = 'orbe_epique_sort_niveau10'; orbeName = 'orbe épique'; orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png'; break;
        case 'legendaire': orbeId = 'orbe_legendaire_sort_niveau10'; orbeName = 'orbe légendaire'; orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png'; break;
        default: return;
      }
      if (!hasOrbeInInventory(orbeId)) { text.textContent = `Vous n'avez pas d'${orbeName} dans votre inventaire.`; return; }
      window.currentSpellUpgrade = { spellId, slotIndex, orbeType, orbeId };
      text.textContent = `Voulez-vous équiper votre ${orbeName} ?`;
      modal.style.display = 'block';
    }

    function applySpellUnequip(){
      const unequip = window.currentSpellUnequip; if (!unequip) return;
      removeOrbeFromSlot(unequip.slot);
      document.getElementById('spell-upgrade-modal').style.display = 'none';
      window.currentSpellUnequip = null;
    }

    function applySpellUpgrade(){
      const upgrade = window.currentSpellUpgrade; if (!upgrade) return;
      if (removeOrbeFromInventory(upgrade.orbeId)){
        const spellSlot = document.querySelector(`.sort-upgrade-slot[data-spell="${upgrade.spellId}"][data-slot="${upgrade.slotIndex}"]`);
        if (spellSlot){
          const orbeImg = document.createElement('img');
          orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png';
          orbeImg.style.width = '32px'; orbeImg.style.height = '32px'; orbeImg.style.objectFit = 'contain';
          spellSlot.innerHTML = ''; spellSlot.appendChild(orbeImg);
          spellSlot.classList.add('upgraded'); spellSlot.style.borderColor = '#4e9cff';
          spellSlot.setAttribute('data-orbe-id', upgrade.orbeId);
          spellSlot.setAttribute('data-orbe-type', upgrade.orbeType);
          applySpellDamageBonus(upgrade.spellId, upgrade.orbeType);
          saveSpellUpgrades();
        }
        if (typeof window.updateAllGrids === 'function') window.updateAllGrids();
      }
      document.getElementById('spell-upgrade-modal').style.display = 'none';
      window.currentSpellUpgrade = null;
    }

    function saveSpellUpgrades(){
      if (!window.currentCharacterId) return;
      const upgrades = [];
      const upgradeSlots = document.querySelectorAll('.sort-upgrade-slot.upgraded');
      upgradeSlots.forEach(slot => {
        const spellId = slot.getAttribute('data-spell');
        const slotIndex = slot.getAttribute('data-slot');
        const orbeId = slot.getAttribute('data-orbe-id');
        const orbeType = slot.getAttribute('data-orbe-type');
        if (spellId && slotIndex && orbeId && orbeType) upgrades.push({ spellId, slotIndex: parseInt(slotIndex), orbeId, orbeType });
      });
      const key = `monrpg_spell_upgrades_${window.currentCharacterId}`;
      localStorage.setItem(key, JSON.stringify(upgrades));
    }

    function loadSpellUpgrades(){
      if (!window.currentCharacterId) return;
      const key = `monrpg_spell_upgrades_${window.currentCharacterId}`;
      const saved = localStorage.getItem(key);
      if (!saved) return;
      try {
        const upgrades = JSON.parse(saved);
        upgrades.forEach(upg => {
          const spellSlot = document.querySelector(`.sort-upgrade-slot[data-spell="${upg.spellId}"][data-slot="${upg.slotIndex}"]`);
          if (!spellSlot) return;
          const orbeImg = document.createElement('img');
          orbeImg.src = 'assets/objets/orbesatypiquesortniveau10.png';
          orbeImg.style.width = '32px'; orbeImg.style.height = '32px'; orbeImg.style.objectFit = 'contain';
          spellSlot.innerHTML = '';
          spellSlot.appendChild(orbeImg);
          spellSlot.classList.add('upgraded');
          spellSlot.style.borderColor = '#4e9cff';
          spellSlot.setAttribute('data-orbe-id', upg.orbeId);
          spellSlot.setAttribute('data-orbe-type', upg.orbeType);
          applySpellDamageBonus(upg.spellId, upg.orbeType);
        });
      } catch(e) { console.error('Erreur loadSpellUpgrades:', e); }
    }

    function initSpellUpgradeSlots(){
      const upgradeSlots = document.querySelectorAll('.sort-upgrade-slot');
      upgradeSlots.forEach((slot, globalIndex) => {
        const container = slot.closest('.sort-upgrade-slots');
        let spellId = ''; let localIndex = 0;
        if (container.classList.contains('sort-upgrade-slots-punch')) { spellId = 'punch'; localIndex = globalIndex % 5; }
        else if (container.classList.contains('sort-upgrade-slots-explosive')) { spellId = 'explosive'; localIndex = (globalIndex - 5) % 5; }
        else if (container.classList.contains('sort-upgrade-slots-triple')) { spellId = 'triple'; localIndex = (globalIndex - 10) % 5; }
        else if (container.classList.contains('sort-upgrade-slots-poingheal')) { spellId = 'poingheal'; localIndex = (globalIndex - 15) % 5; }
        else if (container.classList.contains('sort-upgrade-slots-rassemblement')) { spellId = 'rassemblement'; localIndex = (globalIndex - 20) % 5; }
        slot.setAttribute('data-spell', spellId);
        slot.setAttribute('data-slot', localIndex);
        slot.addEventListener('click', () => {
          if (slot.classList.contains('upgraded')) return;
          const idx = parseInt(slot.getAttribute('data-slot'));
          let orbeType = '';
          switch(idx){ case 0: orbeType = 'atypique'; break; case 1: orbeType = 'rare'; break; case 2: orbeType = 'epique'; break; case 3: orbeType = 'legendaire'; break; case 4: orbeType = 'mythique'; break; default: return; }
          if (orbeType === 'mythique') return;
          showSpellUpgradeModal(spellId, idx, orbeType);
        });
        slot.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          if (!slot.classList.contains('upgraded')) return;
          showSpellUnequipModal(slot);
        });
      });
    }

    const modalYes = document.getElementById('spell-upgrade-yes');
    const modalNo = document.getElementById('spell-upgrade-no');
    if (modalYes) modalYes.addEventListener('click', () => applySpellUpgrade());
    if (modalNo) modalNo.addEventListener('click', () => { const m = document.getElementById('spell-upgrade-modal'); if (m) m.style.display = 'none'; window.currentSpellUpgrade = null; window.currentSpellUnequip = null; });

    initSpellUpgradeSlots();
    loadSpellUpgrades();
    updateAllSpellDamageDisplays();

    // API globale
    window.updateSpellDamageDisplay = updateSpellDamageDisplay;
    window.updateAllSpellDamageDisplays = updateAllSpellDamageDisplays;
    window.resetSpellUpgrades = function(){
      const upgraded = document.querySelectorAll('.sort-upgrade-slot.upgraded');
      upgraded.forEach(removeOrbeFromSlot);
      updateAllSpellDamageDisplays();
    };
  }

  // Expose et init
  window.initSortUI = initUIEventHandlers;
  window.initSpellUpgradeSystem = initSpellUpgradeSystem;
})();



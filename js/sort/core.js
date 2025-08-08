// Noyau léger pour le registre des sorts

function ensureSpellRegistry() {
  if (!window.SPELLS) {
    window.SPELLS = {};
  }
  return window.SPELLS;
}

function registerSpell(spellDef) {
  if (!spellDef || !spellDef.id) return;
  const registry = ensureSpellRegistry();
  if (!registry[spellDef.id]) {
    registry[spellDef.id] = spellDef;
  } else {
    // Merge non-destructive
    Object.keys(spellDef).forEach((key) => {
      if (registry[spellDef.id][key] === undefined) {
        registry[spellDef.id][key] = spellDef[key];
      }
    });
  }
}

// Exports globaux
window.registerSpell = registerSpell;

// État des sorts: unlock/save/load/visuals
function updateSpellUnlockStatus() {
  if (!window.player || !window.player.level || !window.SPELLS) return;
  Object.keys(window.SPELLS).forEach((slotId) => {
    const spell = window.SPELLS[slotId];
    const shouldBeUnlocked = window.player.level >= (spell.levelRequired || 1);
    if (!spell.unlocked && shouldBeUnlocked) spell.unlocked = true;
  });
  if (window.currentCharacterId) saveUnlockedSpells();
  if (typeof window.requestAnimationFrame === 'function') requestAnimationFrame(() => updateSpellVisuals());
}

function saveUnlockedSpells() {
  if (!window.currentCharacterId || !window.SPELLS) return;
  const data = {};
  Object.keys(window.SPELLS).forEach((slotId) => {
    const s = window.SPELLS[slotId];
    data[slotId] = { name: s.name, unlocked: !!s.unlocked, levelRequired: s.levelRequired };
  });
  const key = `monrpg_unlocked_spells_${window.currentCharacterId}`;
  localStorage.setItem(key, JSON.stringify(data));
}

function loadUnlockedSpells() {
  if (!window.currentCharacterId || !window.SPELLS) return;
  // Réinitialiser (slot 1 par défaut)
  Object.keys(window.SPELLS).forEach((slotId) => {
    window.SPELLS[slotId].unlocked = (slotId === 'spell-slot-1');
  });
  const key = `monrpg_unlocked_spells_${window.currentCharacterId}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.keys(parsed).forEach((slotId) => {
        if (window.SPELLS[slotId]) {
          const savedSpell = parsed[slotId];
          const currentSpell = window.SPELLS[slotId];
          currentSpell.unlocked = savedSpell.unlocked ? true : (window.player && window.player.level >= (currentSpell.levelRequired || 1));
        }
      });
    } catch {}
  } else {
    Object.keys(window.SPELLS).forEach((slotId) => {
      const s = window.SPELLS[slotId];
      s.unlocked = window.player && window.player.level >= (s.levelRequired || 1);
    });
  }
}

function updateSpellVisuals() {
  if (!window.SPELLS) return;
  Object.keys(window.SPELLS).forEach((slotId) => {
    const spell = window.SPELLS[slotId];
    const slotElement = document.getElementById(slotId);
    if (!slotElement) return;
    const wasLocked = slotElement.classList.contains('locked');
    if (spell.unlocked) {
      slotElement.classList.remove('locked');
      slotElement.classList.add('unlocked');
      slotElement.style.opacity = '1';
      slotElement.style.cursor = 'pointer';
      if (wasLocked) {
        slotElement.classList.add('unlocking');
        setTimeout(() => slotElement.classList.remove('unlocking'), 500);
      }
    } else {
      slotElement.classList.add('locked');
      slotElement.classList.remove('unlocked');
      slotElement.style.opacity = '0.5';
      slotElement.style.cursor = 'not-allowed';
    }
  });
}

function resetSpellsToDefault() {
  if (!window.SPELLS) return;
  Object.keys(window.SPELLS).forEach((slotId) => {
    const spell = window.SPELLS[slotId];
    if (spell && typeof spell === 'object') spell.unlocked = (slotId === 'spell-slot-1');
  });
}

// Exports globaux
window.updateSpellUnlockStatus = updateSpellUnlockStatus;
window.saveUnlockedSpells = saveUnlockedSpells;
window.loadUnlockedSpells = loadUnlockedSpells;
window.updateSpellVisuals = updateSpellVisuals;
window.resetSpellsToDefault = resetSpellsToDefault;


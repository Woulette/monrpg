// Sort Triple Coup de Poing (slot 3) avec combo 3 étapes

const TRIPLE_SPELL = {
  id: 'spell-slot-3',
  name: 'Triple Coup de Poing',
  baseMin: 6,
  baseMax: 10,
  cooldown: 10.0,
  levelRequired: 7,
  unlocked: false
};

function initTripleSpell() {
  if (!window.registerSpell) { if (!window.SPELLS) window.SPELLS = {}; if (!window.SPELLS[TRIPLE_SPELL.id]) window.SPELLS[TRIPLE_SPELL.id] = TRIPLE_SPELL; }
  else { window.registerSpell(TRIPLE_SPELL); }
  if (!window.triplePunchCombo) {
    window.triplePunchCombo = { currentStep: 0, lastPressTime: 0, comboTimeout: 2000, isActive: false };
  }
}

function handleTriplePunchCombo() {
  const now = Date.now(); const combo = window.triplePunchCombo;
  if (combo.isActive && (now - combo.lastPressTime) > combo.comboTimeout) { combo.currentStep = 0; combo.isActive = false; }
  const slot3 = document.getElementById(TRIPLE_SPELL.id); if (!slot3 || slot3.classList.contains('cooldown')) return;
  const attackTarget = window.attackTarget;
  if (!attackTarget || attackTarget.hp <= 0 || Math.abs(window.player.x - attackTarget.x) + Math.abs(window.player.y - attackTarget.y) !== 1) { combo.currentStep = 0; combo.isActive = false; return; }
  if (!combo.isActive) { combo.isActive = true; combo.currentStep = 1; combo.lastPressTime = now; }
  else { combo.currentStep++; combo.lastPressTime = now; }
  executeTriplePunchStep(combo.currentStep);
  if (combo.currentStep >= 3) { if (typeof window.startSpellCooldown === 'function') window.startSpellCooldown(TRIPLE_SPELL.id, TRIPLE_SPELL.cooldown); combo.currentStep = 0; combo.isActive = false; }
}

function executeTriplePunchStep(step) {
  const attackTarget = window.attackTarget; if (!attackTarget || attackTarget.hp <= 0) return;
  let minDamage = (window.tripleDamageMin !== undefined) ? window.tripleDamageMin : TRIPLE_SPELL.baseMin;
  let maxDamage = (window.tripleDamageMax !== undefined) ? window.tripleDamageMax : TRIPLE_SPELL.baseMax;
  const { damage, isCrit } = (typeof window.computeSpellDamage === 'function') ? window.computeSpellDamage(minDamage, maxDamage) : { damage: minDamage, isCrit: false };
  const finalDamage = Math.max(1, damage - (attackTarget.defense || 0)); attackTarget.hp -= finalDamage;
  attackTarget.aggro = true; attackTarget.aggroTarget = window.player; attackTarget.lastCombat = Date.now(); window.player.inCombat = true;
  if (typeof window.displayDamage === 'function') window.displayDamage(attackTarget.px, attackTarget.py, finalDamage, isCrit ? 'critique' : 'damage', false);
  if (typeof window.alignMonsterToGrid === 'function') window.alignMonsterToGrid(attackTarget);
  if (attackTarget.hp <= 0) {
    if (typeof window.killMonster === 'function') window.killMonster(attackTarget);
    if (typeof window.release === 'function') window.release(attackTarget.x, attackTarget.y);
    if (typeof window.displayDamage === 'function') window.displayDamage(window.player.px, window.player.py, `+${attackTarget.xpValue || 0} XP`, 'xp', true);
    if (typeof window.gainXP === 'function') window.gainXP(attackTarget.xpValue || 0);
    if (typeof window.triggerLoot === 'function') window.triggerLoot(attackTarget);
    attackTarget.aggro = false; attackTarget.aggroTarget = null; window.attackTarget = null; window.player.inCombat = false;
    if (typeof window.startSpellCooldown === 'function') window.startSpellCooldown(TRIPLE_SPELL.id, TRIPLE_SPELL.cooldown);
    window.triplePunchCombo.currentStep = 0; window.triplePunchCombo.isActive = false;
  }
}

function addTripleSlot() {
  const spellSlot = document.getElementById(TRIPLE_SPELL.id); if (!spellSlot) return;
  spellSlot.addEventListener('click', () => { if (!spellSlot.classList.contains('locked') && !spellSlot.classList.contains('cooldown')) handleTriplePunchCombo(); });
}

function updateTripleUnlockStatus() {
  const spellSlot = document.getElementById(TRIPLE_SPELL.id); if (!spellSlot || !window.player) return;
  const isUnlocked = window.player.level >= TRIPLE_SPELL.levelRequired;
  if (isUnlocked) { spellSlot.classList.remove('locked'); spellSlot.classList.add('unlocked'); }
  else { spellSlot.classList.add('locked'); spellSlot.classList.remove('unlocked'); }
  if (window.SPELLS && window.SPELLS[TRIPLE_SPELL.id]) window.SPELLS[TRIPLE_SPELL.id].unlocked = isUnlocked;
}

function initTripleSystem() {
  initTripleSpell();
  addTripleSlot();
  updateTripleUnlockStatus();
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initTripleSystem); } else { initTripleSystem(); }

// Exports
window.handleTriplePunchCombo = handleTriplePunchCombo;
window.updateTripleUnlockStatus = updateTripleUnlockStatus;
window.initTripleSystem = initTripleSystem;


// Sort Coup de poing (slot 1)

const PUNCH_SPELL = {
  id: 'spell-slot-1',
  name: 'Coup de poing',
  baseMin: 3,
  baseMax: 6,
  cooldown: 1.0,
  levelRequired: 1,
  unlocked: true
};

function initPunchSpell() {
  if (typeof window.registerSpell === 'function') {
    window.registerSpell(PUNCH_SPELL);
  } else {
    if (!window.SPELLS) window.SPELLS = {};
    if (!window.SPELLS[PUNCH_SPELL.id]) window.SPELLS[PUNCH_SPELL.id] = PUNCH_SPELL;
  }
}

function castPunch() {
  if (!window.player || !window.player.inCombat) return;
  const slot = document.getElementById(PUNCH_SPELL.id);
  if (!slot || slot.classList.contains('cooldown')) return;
  const attackTarget = window.attackTarget;
  if (!attackTarget || attackTarget.hp <= 0) return;
  if (Math.abs(window.player.x - attackTarget.x) + Math.abs(window.player.y - attackTarget.y) !== 1) return;
  if (typeof window.startSpellCooldown === 'function') window.startSpellCooldown(PUNCH_SPELL.id, PUNCH_SPELL.cooldown);
  let minDamage = (window.punchDamageMin !== undefined) ? window.punchDamageMin : PUNCH_SPELL.baseMin;
  let maxDamage = (window.punchDamageMax !== undefined) ? window.punchDamageMax : PUNCH_SPELL.baseMax;
  const { damage, isCrit } = (typeof window.computeSpellDamage === 'function') ? window.computeSpellDamage(minDamage, maxDamage) : { damage: minDamage, isCrit: false };
  const finalDamage = Math.max(1, damage - (attackTarget.defense || 0));
  attackTarget.hp -= finalDamage;
  attackTarget.aggro = true; attackTarget.aggroTarget = window.player; attackTarget.lastCombat = Date.now(); window.player.inCombat = true;
  if (typeof window.displayDamage === 'function') window.displayDamage(attackTarget.px, attackTarget.py, finalDamage, isCrit ? 'critique' : 'damage', false);
  if (attackTarget.hp <= 0) {
    if (typeof window.release === 'function') window.release(attackTarget.x, attackTarget.y);
    if (typeof window.displayDamage === 'function') window.displayDamage(window.player.px, window.player.py, `+${attackTarget.xpValue || 0} XP`, 'xp', true);
    if (typeof window.gainXP === 'function') window.gainXP(attackTarget.xpValue || 0);
    if (typeof window.triggerLoot === 'function') window.triggerLoot(attackTarget);
    if (typeof window.killMonster === 'function') window.killMonster(attackTarget);
    attackTarget.aggro = false; attackTarget.aggroTarget = null; window.attackTarget = null; window.player.inCombat = false;
  }
}

function addPunchSlot() {
  const spellSlot = document.getElementById(PUNCH_SPELL.id);
  if (!spellSlot) return;
  spellSlot.addEventListener('click', () => {
    if (!spellSlot.classList.contains('locked') && !spellSlot.classList.contains('cooldown')) {
      castPunch();
    }
  });
}

function updatePunchUnlockStatus() {
  const spellSlot = document.getElementById(PUNCH_SPELL.id);
  if (!window.player || !spellSlot) return;
  const isUnlocked = window.player.level >= PUNCH_SPELL.levelRequired;
  if (isUnlocked) { spellSlot.classList.remove('locked'); spellSlot.classList.add('unlocked'); }
  else { spellSlot.classList.add('locked'); spellSlot.classList.remove('unlocked'); }
  if (window.SPELLS && window.SPELLS[PUNCH_SPELL.id]) window.SPELLS[PUNCH_SPELL.id].unlocked = isUnlocked;
}

function initPunchSystem() {
  initPunchSpell();
  addPunchSlot();
  updatePunchUnlockStatus();
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initPunchSystem); } else { initPunchSystem(); }

// Exports
window.castPunch = castPunch;
window.updatePunchUnlockStatus = updatePunchUnlockStatus;
window.initPunchSystem = initPunchSystem;


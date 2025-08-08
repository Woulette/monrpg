// Sort Coup de poing explosif (slot 2)

const EXPLOSIVE_SPELL = {
  id: 'spell-slot-2',
  name: 'Coup de poing explosif',
  baseMin: 12,
  baseMax: 20,
  cooldown: 15.0,
  levelRequired: 3,
  unlocked: false
};

function initExplosiveSpell() {
  if (typeof window.registerSpell === 'function') {
    window.registerSpell(EXPLOSIVE_SPELL);
  } else {
    if (!window.SPELLS) window.SPELLS = {};
    if (!window.SPELLS[EXPLOSIVE_SPELL.id]) window.SPELLS[EXPLOSIVE_SPELL.id] = EXPLOSIVE_SPELL;
  }
}

function castExplosivePunch() {
  if (!window.player || !window.player.inCombat) return;
  const slot = document.getElementById(EXPLOSIVE_SPELL.id);
  if (!slot || slot.classList.contains('cooldown')) return;
  const attackTarget = window.attackTarget;
  if (!attackTarget || attackTarget.hp <= 0) return;
  if (Math.abs(window.player.x - attackTarget.x) + Math.abs(window.player.y - attackTarget.y) !== 1) return;
  if (typeof window.startSpellCooldown === 'function') window.startSpellCooldown(EXPLOSIVE_SPELL.id, EXPLOSIVE_SPELL.cooldown);
  let minDamage = (window.explosiveDamageMin !== undefined) ? window.explosiveDamageMin : EXPLOSIVE_SPELL.baseMin;
  let maxDamage = (window.explosiveDamageMax !== undefined) ? window.explosiveDamageMax : EXPLOSIVE_SPELL.baseMax;
  const { damage, isCrit } = (typeof window.computeSpellDamage === 'function') ? window.computeSpellDamage(minDamage, maxDamage) : { damage: minDamage, isCrit: false };
  const finalDamage = Math.max(1, damage - (attackTarget.defense || 0));
  attackTarget.hp -= finalDamage;
  attackTarget.aggro = true; attackTarget.aggroTarget = window.player; attackTarget.lastCombat = Date.now(); window.player.inCombat = true;
  if (typeof window.displayDamage === 'function') window.displayDamage(attackTarget.px, attackTarget.py, finalDamage, isCrit ? 'critique' : 'damage', false);
  if (typeof window.createExplosionEffect === 'function') window.createExplosionEffect(attackTarget.px, attackTarget.py);
  if (typeof window.alignMonsterToGrid === 'function') window.alignMonsterToGrid(attackTarget);
  if (attackTarget.hp <= 0) {
    if (typeof window.release === 'function') window.release(attackTarget.x, attackTarget.y);
    if (typeof window.displayDamage === 'function') window.displayDamage(window.player.px, window.player.py, `+${attackTarget.xpValue || 0} XP`, 'xp', true);
    if (typeof window.gainXP === 'function') window.gainXP(attackTarget.xpValue || 0);
    if (typeof window.triggerLoot === 'function') window.triggerLoot(attackTarget);
    if (typeof window.killMonster === 'function') window.killMonster(attackTarget);
    attackTarget.aggro = false; attackTarget.aggroTarget = null; window.attackTarget = null; window.player.inCombat = false;
  }
}

function addExplosiveSlot() {
  const spellSlot = document.getElementById(EXPLOSIVE_SPELL.id);
  if (!spellSlot) return;
  spellSlot.addEventListener('click', () => {
    if (!spellSlot.classList.contains('locked') && !spellSlot.classList.contains('cooldown')) {
      castExplosivePunch();
    }
  });
}

function updateExplosiveUnlockStatus() {
  const spellSlot = document.getElementById(EXPLOSIVE_SPELL.id);
  if (!window.player || !spellSlot) return;
  const isUnlocked = window.player.level >= EXPLOSIVE_SPELL.levelRequired;
  if (isUnlocked) { spellSlot.classList.remove('locked'); spellSlot.classList.add('unlocked'); }
  else { spellSlot.classList.add('locked'); spellSlot.classList.remove('unlocked'); }
  if (window.SPELLS && window.SPELLS[EXPLOSIVE_SPELL.id]) window.SPELLS[EXPLOSIVE_SPELL.id].unlocked = isUnlocked;
}

function initExplosiveSystem() {
  initExplosiveSpell();
  addExplosiveSlot();
  updateExplosiveUnlockStatus();
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initExplosiveSystem); } else { initExplosiveSystem(); }

// Exports
window.castExplosivePunch = castExplosivePunch;
window.updateExplosiveUnlockStatus = updateExplosiveUnlockStatus;
window.initExplosiveSystem = initExplosiveSystem;


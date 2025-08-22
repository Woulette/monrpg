// =======================
// ATTAQUE DE BASE - Coup de poing (slot 1)
// =======================
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

function updatePunchUnlockStatus() {
  const spellSlot = document.getElementById(PUNCH_SPELL.id);
  if (!window.player || !spellSlot) return;
  const isUnlocked = window.player.level >= PUNCH_SPELL.levelRequired;
  if (isUnlocked) { spellSlot.classList.remove('locked'); spellSlot.classList.add('unlocked'); }
  else { spellSlot.classList.add('locked'); spellSlot.classList.remove('unlocked'); }
  if (window.SPELLS && window.SPELLS[PUNCH_SPELL.id]) window.SPELLS[PUNCH_SPELL.id].unlocked = isUnlocked;
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

// =======================
// FONCTION D'ATTAQUE DE BASE COMPLÈTE
// =======================
function castPunch() {
  if (!window.player || !window.attackTarget) return;
  
  const attackTarget = window.attackTarget;
  if (attackTarget.hp <= 0) return;
  
  // Vérifier la distance
  if (Math.abs(window.player.x - attackTarget.x) + Math.abs(window.player.y - attackTarget.y) !== 1) return;
  
  // Vérifier le cooldown
  const slot = document.getElementById(PUNCH_SPELL.id);
  if (slot && slot.classList.contains('cooldown')) return;
  
  // Démarrer le cooldown
  if (typeof window.startSpellCooldown === 'function') {
    window.startSpellCooldown(PUNCH_SPELL.id, PUNCH_SPELL.cooldown);
  }
  
  const currentTime = Date.now();
  
  // Calcul des dégâts
  let minDamage = window.punchDamageMin ?? PUNCH_SPELL.baseMin;
  let maxDamage = window.punchDamageMax ?? PUNCH_SPELL.baseMax;
  
  let damage, isCrit = false;
  
  if (typeof window.computeSpellDamage === 'function') {
    const res = window.computeSpellDamage(minDamage, maxDamage);
    damage = res.damage;
    isCrit = res.isCrit;
  } else {
    damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
  }
  
  // Gain d'XP de force
  if (typeof window.gainStatXP === "function") {
    window.gainStatXP('force', 1);
  }
  
  // Gestion des coups critiques
  if (isCrit && typeof window.gainStatXP === "function") {
    window.gainStatXP('agilite', 1);
    const critMultiplier = 1.5;
    const critBonus = typeof window.getPlayerCritDamage === 'function' ? window.getPlayerCritDamage() : 0;
    damage = Math.floor(damage * critMultiplier * (1 + critBonus));
  }
  
  // Calcul des dégâts finaux
  const finalDamage = Math.max(1, damage - (attackTarget.defense || 0));
  
  // Application des dégâts (multijoueur ou local)
  if (window.multiplayerManager?.connected && window.multiplayerManager.socket && attackTarget.id) {
    try {
      window.multiplayerManager.socket.send(JSON.stringify({
        type: 'monster_hit',
        data: { id: attackTarget.id, damage: finalDamage }
      }));
    } catch(_) {}
  } else {
    attackTarget.hp -= finalDamage;
  }
  
  // Gestion de l'aggro et du combat
  attackTarget.aggro = true;
  attackTarget.aggroTarget = window.player;
  attackTarget.state = 'aggro'; // FORCER L'ÉTAT EN AGGRO
  attackTarget.lastCombat = currentTime;
  window.player.inCombat = true;
  
  // Affichage des dégâts
  if (typeof window.displayDamage === "function") {
    window.displayDamage(attackTarget.px, attackTarget.py, finalDamage, isCrit ? 'critique' : 'damage', false);
  }
  
  // Alignement du monstre
  // Système de replacement supprimé pour la nouvelle IA des monstres
  
  // Plus de riposte automatique - les monstres attaquent via leur IA
  
  // Gestion de la mort du monstre
  if (attackTarget.hp <= 0 && !(window.multiplayerManager?.connected)) {
    if (typeof window.release === "function") window.release(attackTarget.x, attackTarget.y);
    
    if (typeof window.displayDamage === "function") {
      window.displayDamage(window.player.px, window.player.py, `+${attackTarget.xpValue || 0} XP`, 'xp', true);
    }
    
    if (typeof window.gainXP === "function") window.gainXP(attackTarget.xpValue || 0);
    
    if (typeof window.triggerLoot === 'function') window.triggerLoot(attackTarget);
    
    if (typeof window.killMonster === "function") window.killMonster(attackTarget);
    
    attackTarget.aggro = false;
    attackTarget.aggroTarget = null;
    window.attackTarget = null;
    attackTarget.state = 'aggro';
    window.player.inCombat = false;
  }
  
  // Mise à jour du timer d'attaque
  window.player.lastAttack = currentTime;
  
  console.log(`⚔️ Coup de poing: ${finalDamage} dégâts infligés`);
}

// =======================
// POINTEUR VERS L'ATTAQUE DE BASE
// =======================
// Cette ligne fait que punch.js devient l'attaque de base unique !
window.castBaseAttack = castPunch;

// =======================
// Initialisation
// =======================
function initPunchSystem() {
  initPunchSpell();
  addPunchSlot();
  updatePunchUnlockStatus();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPunchSystem);
} else {
  initPunchSystem();
}

// Exports globaux
window.castPunch = castPunch;
window.updatePunchUnlockStatus = updatePunchUnlockStatus;
window.initPunchSystem = initPunchSystem;


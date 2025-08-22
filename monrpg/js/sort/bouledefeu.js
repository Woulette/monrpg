// =======================
// SORT MAGE - Boule de feu (sort de base pour la classe Mage)
// =======================
const BOULE_DE_FEU_SPELL = {
  id: 'spell-slot-1',
  name: 'Boule de feu',
  baseMin: 8,
  baseMax: 15,
  cooldown: 2.0,
  levelRequired: 20,
  classRequired: 'mage', // Seulement accessible aux mages
  unlocked: true,
  type: 'magic',
  manaCost: 10
};

function initBouleDeFeuSpell() {
  if (typeof window.registerSpell === 'function') {
    window.registerSpell(BOULE_DE_FEU_SPELL);
  } else {
    if (!window.SPELLS) window.SPELLS = {};
    if (!window.SPELLS[BOULE_DE_FEU_SPELL.id]) window.SPELLS[BOULE_DE_FEU_SPELL.id] = BOULE_DE_FEU_SPELL;
  }
}

function updateBouleDeFeuUnlockStatus() {
  const spellSlot = document.getElementById(BOULE_DE_FEU_SPELL.id);
  if (!window.player || !spellSlot) return;
  
  // Vérifier la classe ET le niveau
  const isUnlocked = window.player.level >= BOULE_DE_FEU_SPELL.levelRequired && 
                     window.player.class === BOULE_DE_FEU_SPELL.classRequired;
  
  if (isUnlocked) { 
    spellSlot.classList.remove('locked'); 
    spellSlot.classList.add('unlocked'); 
  } else { 
    spellSlot.classList.add('locked'); 
    spellSlot.classList.remove('unlocked'); 
  }
  
  if (window.SPELLS && window.SPELLS[BOULE_DE_FEU_SPELL.id]) {
    window.SPELLS[BOULE_DE_FEU_SPELL.id].unlocked = isUnlocked;
  }
}

function addBouleDeFeuSlot() {
  const spellSlot = document.getElementById(BOULE_DE_FEU_SPELL.id);
  if (!spellSlot) return;
  
  spellSlot.addEventListener('click', () => {
    if (!spellSlot.classList.contains('locked') && !spellSlot.classList.contains('cooldown')) {
      castBouleDeFeu();
    }
  });
}

// =======================
// FONCTION D'ATTAQUE MAGE COMPLÈTE
// =======================
function castBouleDeFeu() {
  if (!window.player || !window.attackTarget) return;
  
  // Vérifier que le joueur est bien mage
  if (window.player.class !== 'mage') {
    console.error('❌ Seuls les mages peuvent utiliser Boule de feu !');
    return;
  }
  
  const attackTarget = window.attackTarget;
  if (attackTarget.hp <= 0) return;
  
  // DÉSACTIVER LE DÉPLACEMENT AUTOMATIQUE pour ce sort à distance
  if (window.player.autoFollow) {
    window.player.autoFollow = false;
    console.log('🎯 Déplacement automatique désactivé pour Boule de feu');
  }
  
  // Vérifier la distance (sort à distance)
  const distance = Math.abs(window.player.x - attackTarget.x) + Math.abs(window.player.y - attackTarget.y);
  if (distance > 7) { // Portée de 7 cases pour la boule de feu
    console.log('❌ Cible trop éloignée pour Boule de feu (distance: ' + distance + ', portée: 7)');
    return;
  }
  
  // Vérifier que le joueur n'est pas trop proche (éviter le corps à corps)
  if (distance < 0) {
    console.log('❌ Cible trop proche pour Boule de feu (distance: ' + distance + ', minimum: 0)');
    return;
  }
  
  console.log(`🔥 Boule de feu lancée depuis la distance: ${distance} cases`);
  
  // Vérifier le cooldown
  const slot = document.getElementById(BOULE_DE_FEU_SPELL.id);
  if (slot && slot.classList.contains('cooldown')) return;
  
  // Démarrer le cooldown
  if (typeof window.startSpellCooldown === 'function') {
    window.startSpellCooldown(BOULE_DE_FEU_SPELL.id, BOULE_DE_FEU_SPELL.cooldown);
  }
  
  const currentTime = Date.now();
  
  // Calcul des dégâts (dégâts de base + bonus d'intelligence)
  let minDamage = BOULE_DE_FEU_SPELL.baseMin;
  let maxDamage = BOULE_DE_FEU_SPELL.baseMax;
  
  let damage, isCrit = false;
  
  // CALCUL MANUEL pour éviter le double bonus (force + intelligence)
  // Dégâts de base aléatoires
  damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
  
  // APPLIQUER LE BONUS D'INTELLIGENCE (comme la force pour les sorts physiques)
  if (window.player.intelligence && window.player.intelligence > 1) {
    // Même logique que la force : +5% par point d'intelligence
    const intelligenceBonus = (window.player.intelligence - 1) * 0.05; // 5% par point d'intelligence
    damage = Math.floor(damage * (1 + intelligenceBonus));
    console.log(`🧠 Bonus d'intelligence appliqué: +${Math.round(intelligenceBonus * 100)}% (${window.player.intelligence} intel)`);
  }
  
  // Vérifier les coups critiques manuellement
  if (typeof window.isPlayerCrit === 'function' && window.isPlayerCrit()) {
    isCrit = true;
    const critMultiplier = 1.5;
    const critBonus = typeof window.getPlayerCritDamage === 'function' ? window.getPlayerCritDamage() : 0;
    damage = Math.floor(damage * critMultiplier * (1 + critBonus));
    console.log(`⚡ Coup critique appliqué: ×${critMultiplier} + bonus critique`);
  }
  
  // Gain d'XP d'intelligence (pour les sorts magiques)
  if (typeof window.gainStatXP === "function") {
    window.gainStatXP('intelligence', 1);
  }
  
  // Gain d'XP d'agilité si coup critique
  if (isCrit && typeof window.gainStatXP === "function") {
    window.gainStatXP('agilite', 1);
  }
  
  // Calcul des dégâts finaux (défense normale)
  const finalDamage = Math.max(1, damage - (attackTarget.defense || 0));
  
  // Log du calcul des dégâts
  console.log(`🔥 Calcul des dégâts Boule de feu:`);
  console.log(`  - Dégâts de base: ${BOULE_DE_FEU_SPELL.baseMin}-${BOULE_DE_FEU_SPELL.baseMax}`);
  console.log(`  - Dégâts avec bonus intel: ${damage}`);
  console.log(`  - Défense de la cible: ${attackTarget.defense || 0}`);
  console.log(`  - Dégâts finaux: ${finalDamage}`);
  
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
  attackTarget.lastCombat = currentTime;
  attackTarget.state = 'aggro'; // Forcer l'état en aggro pour déclencher l'IA
  window.player.inCombat = true;
  
  // Affichage des dégâts
  if (typeof window.displayDamage === "function") {
    window.displayDamage(attackTarget.px, attackTarget.py, finalDamage, isCrit ? 'critique' : 'damage', false);
  }
  
  // Alignement du monstre
  // Système de replacement supprimé pour la nouvelle IA des monstres
  

  
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
    window.player.inCombat = false;
  }
  
  // Mise à jour du timer d'attaque
  window.player.lastAttack = currentTime;
  
  console.log(`🔥 Boule de feu: ${finalDamage} dégâts infligés`);
}

// =======================
// POINTEUR VERS L'ATTAQUE MAGE
// =======================
// Cette ligne fait que bouledefeu.js devient l'attaque de base pour les mages !
window.castBaseAttack = castBouleDeFeu;

// =======================
// Initialisation
// =======================
function initBouleDeFeuSystem() {
  initBouleDeFeuSpell();
  addBouleDeFeuSlot();
  updateBouleDeFeuUnlockStatus();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBouleDeFeuSystem);
} else {
  initBouleDeFeuSystem();
}

// Exports globaux
window.castBouleDeFeu = castBouleDeFeu;
window.updateBouleDeFeuUnlockStatus = updateBouleDeFeuUnlockStatus;
window.initBouleDeFeuSystem = initBouleDeFeuSystem;

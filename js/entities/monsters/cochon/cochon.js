// js/entities/monsters/cochon/cochon.js

// Configuration de base du Cochon (valeurs de référence au niveau 7)
const COCHON_CONFIG = {
  type: 'cochon',
  baseHp: 100,        // Vie moyenne demandée
  baseXpMin: 35,      // XP entre 35 et 50
  baseXpMax: 50,
  baseForce: 15,      // Force moyenne demandée
  baseDefense: 10,    // Défense moyenne demandée
  moveSpeed: 0.45,    // Un peu plus rapide qu'un corbeau
  animDelay: 140,     // Vitesse d'animation standard
  aggroRange: 7,      // Distance d'aggro par défaut
  respawnMs: 30000    // 30s
};

// Crée un cochon avec un léger scaling de stats selon le niveau (7 à 10)
function createCochon(x, y, level = 7) {
  const clampedLevel = Math.max(7, Math.min(10, level));
  const levelDelta = clampedLevel - 7; // 0..3

  // Multiplicateurs très raisonnables pour rester proche des valeurs demandées
  const hpMultiplier = 1 + levelDelta * 0.07;       // +7% par niveau (≈121 au lvl10)
  const forceMultiplier = 1 + levelDelta * 0.06;    // +6% par niveau (≈17 au lvl10)
  const defenseMultiplier = 1 + levelDelta * 0.05;  // +5% par niveau (≈11.5 au lvl10)

  // XP aléatoire dans la fourchette 35..50, on peut majorer légèrement aux niveaux plus hauts
  const xpBase = Math.floor(Math.random() * (COCHON_CONFIG.baseXpMax - COCHON_CONFIG.baseXpMin + 1)) + COCHON_CONFIG.baseXpMin;
  const xpValue = xpBase + Math.floor(levelDelta * 2); // petit bonus par niveau

  return {
    id: 'CO' + Date.now() + '_' + Math.floor(Math.random() * 100000),
    name: 'Cochon',
    type: COCHON_CONFIG.type,
    level: clampedLevel,
    x, y,
    px: x * TILE_SIZE, py: y * TILE_SIZE,
    spawnX: x, spawnY: y,
    frame: 0,
    direction: 0,
    img: null,                // Assignée via assignMonsterImages
    animDelay: COCHON_CONFIG.animDelay,
    lastAnim: 0,
    state: 'idle',
    stateTime: 0,
    movePath: [],
    moving: false,
    moveTarget: { x, y },
    moveSpeed: COCHON_CONFIG.moveSpeed,
    moveCooldown: 0,
    patrolZone: { x: 0, y: 0, width: 48, height: 25 },
    aggroRange: COCHON_CONFIG.aggroRange,
    hp: Math.floor(COCHON_CONFIG.baseHp * hpMultiplier),
    maxHp: Math.floor(COCHON_CONFIG.baseHp * hpMultiplier),
    aggro: false,
    aggroTarget: null,
    lastAttack: 0,
    lastCombat: Date.now(),
    stuckSince: 0,
    returningHome: false,
    lastPatrol: null,
    xpValue: xpValue,
    isDead: false,
    deathTime: 0,
    respawnTime: COCHON_CONFIG.respawnMs,
    // Stats combat
    force: Math.floor(COCHON_CONFIG.baseForce * forceMultiplier),
    defense: Math.floor(COCHON_CONFIG.baseDefense * defenseMultiplier),
    damage: 7 // dégâts de base raisonnables
  };
}

// Mise à jour du cochon (IA chase + patrouille passive)
function updateCochon(monster, ts) {
  if (typeof chasePlayerAI === 'function') {
    chasePlayerAI(monster, ts);
  }
  if (!monster.aggro && typeof passiveAI === 'function') {
    passiveAI(monster, ts);
  }
}

// Export global
window.COCHON_CONFIG = COCHON_CONFIG;
window.createCochon = createCochon;
window.updateCochon = updateCochon;



// Corbeau - utilise l'IA partagée
// Nettoyé et validé le 30/07/2025 - par Cursor

// Configuration spécifique aux corbeaux
const CROW_CONFIG = {
    type: "crow",
    aggroRange: 8,
    moveSpeed: 0.3,
    animDelay: 120,
    baseHp: 15,
    baseXp: 10,
    baseForce: 4,
    baseDefense: 2,
    baseDamage: 3
};

// Fonction pour créer un corbeau
function createCrow(x, y, level = 1) {
    const hpMultiplier = 1 + (level - 1) * 0.2;
    const xpMultiplier = 1 + (level - 1) * 0.3;
    const forceMultiplier = 1 + (level - 1) * 0.15;
    const defenseMultiplier = 1 + (level - 1) * 0.1;
    
    return {
        id: 'crow_' + Date.now() + Math.random(),
        name: "Corbeau",
        type: CROW_CONFIG.type,
        level: level,
        x: x, y: y,
        px: x * TILE_SIZE, py: y * TILE_SIZE,
        spawnX: x, spawnY: y,
        frame: 0,
        direction: 0,
        img: null,
        animDelay: CROW_CONFIG.animDelay,
        lastAnim: 0,
        state: "idle",
        stateTime: 0,
        movePath: [],
        moving: false,
        moveTarget: { x: x, y: y },
        moveSpeed: CROW_CONFIG.moveSpeed,
        moveCooldown: 0,
        patrolZone: { x: 0, y: 0, width: 48, height: 25 },
        hp: Math.floor(CROW_CONFIG.baseHp * hpMultiplier),
        maxHp: Math.floor(CROW_CONFIG.baseHp * hpMultiplier),
        aggro: false,
        aggroTarget: null,
        lastAttack: 0,
        lastCombat: Date.now(),
        stuckSince: 0,
        returningHome: false,
        lastPatrol: null,
        xpValue: Math.floor(CROW_CONFIG.baseXp * xpMultiplier),
        isDead: false,
        deathTime: 0,
        respawnTime: 30000, // 30 secondes
        force: Math.floor(CROW_CONFIG.baseForce * forceMultiplier),
        defense: Math.floor(CROW_CONFIG.baseDefense * defenseMultiplier),
        damage: CROW_CONFIG.baseDamage
    };
}

// Fonction pour mettre à jour un corbeau
function updateCrow(monster, ts) {
    // Utiliser l'IA de chasse du joueur pour les corbeaux (aggro)
    if (typeof chasePlayerAI === 'function') {
        chasePlayerAI(monster, ts);
    }
    
    // Si le monstre n'est pas en aggro, utiliser l'IA passive pour la patrouille
    if (!monster.aggro && typeof passiveAI === 'function') {
        passiveAI(monster, ts);
    }
}

// Export global
window.createCrow = createCrow;
window.updateCrow = updateCrow;
window.CROW_CONFIG = CROW_CONFIG; 
// Aluineeks - utilise l'IA partagée
// Nettoyé et validé le 30/07/2025 - par Cursor

// Configuration spécifique aux Aluineeks
const ALUINEEKS_CONFIG = {
    type: "aluineeks",
    aggroRange: 9,
    moveSpeed: 0.7,
    animDelay: 150,
    baseHp: 200,
    baseXp: 80,
    baseForce: 40,
    baseDefense: 25,
    baseDamage: 12
};

// Fonction pour créer un Aluineeks
function createAluineeks(x, y, level = 10) {
    const hpMultiplier = 1 + (level - 10) * 0.1;
    const xpMultiplier = 1 + (level - 10) * 0.2;
    const forceMultiplier = 1 + (level - 10) * 0.05;
    const defenseMultiplier = 1 + (level - 10) * 0.03;
    
    return {
        id: 'aluineeks_' + Date.now() + Math.random(),
        name: "Aluineeks",
        type: ALUINEEKS_CONFIG.type,
        level: level,
        x: x, y: y,
        px: x * TILE_SIZE, py: y * TILE_SIZE,
        spawnX: x, spawnY: y,
        frame: 0,
        direction: 0,
        img: null,
        animDelay: ALUINEEKS_CONFIG.animDelay,
        lastAnim: 0,
        state: "idle",
        stateTime: 0,
        movePath: [],
        moving: false,
        moveTarget: { x: x, y: y },
        moveSpeed: ALUINEEKS_CONFIG.moveSpeed,
        moveCooldown: 0,
        patrolZone: { x: 0, y: 0, width: 48, height: 25 },
        hp: Math.floor(ALUINEEKS_CONFIG.baseHp * hpMultiplier),
        maxHp: Math.floor(ALUINEEKS_CONFIG.baseHp * hpMultiplier),
        aggro: false,
        aggroTarget: null,
        lastAttack: 0,
        lastCombat: Date.now(),
        stuckSince: 0,
        returningHome: false,
        lastPatrol: null,
        xpValue: Math.floor(ALUINEEKS_CONFIG.baseXp * xpMultiplier),
        isDead: false,
        deathTime: 0,
        respawnTime: 30000, // 30 secondes
        force: Math.floor(ALUINEEKS_CONFIG.baseForce * forceMultiplier),
        defense: Math.floor(ALUINEEKS_CONFIG.baseDefense * defenseMultiplier),
        damage: ALUINEEKS_CONFIG.baseDamage
    };
}

// Fonction pour mettre à jour un Aluineeks
function updateAluineeks(monster, ts) {
    // Utiliser l'IA de chasse du joueur pour les Aluineeks (aggro)
    if (typeof chasePlayerAI === 'function') {
        chasePlayerAI(monster, ts);
    }
    
    // Si le monstre n'est pas en aggro, utiliser l'IA passive pour la patrouille
    if (!monster.aggro && typeof passiveAI === 'function') {
        passiveAI(monster, ts);
    }
}

// Export global
window.createAluineeks = createAluineeks;
window.updateAluineeks = updateAluineeks;
window.ALUINEEKS_CONFIG = ALUINEEKS_CONFIG; 
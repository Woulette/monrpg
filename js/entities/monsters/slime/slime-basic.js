// Slime basique - utilise l'IA partagée
// Nettoyé et validé le 30/07/2025 - par Cursor

// Configuration spécifique aux slimes basiques
const SLIME_CONFIG = {
    type: "slime",
    aggroRange: 7,
    moveSpeed: 0.2,
    animDelay: 200,
    baseHp: 30,
    baseXp: 25,
    baseForce: 9,
    baseDefense: 6,
    baseDamage: 6
};

// Fonction pour créer un slime basique
function createBasicSlime(x, y, level = 7) {
    const hpMultiplier = 1 + (level - 7) * 0.25;
    const xpMultiplier = 1 + (level - 7) * 0.35;
    const forceMultiplier = 1 + (level - 7) * 0.25;
    const defenseMultiplier = 1 + (level - 7) * 0.2;
    
    return {
        id: 'slime_' + Date.now() + Math.random(),
        name: "Slime",
        type: SLIME_CONFIG.type,
        level: level,
        x: x, y: y,
        px: x * TILE_SIZE, py: y * TILE_SIZE,
        spawnX: x, spawnY: y,
        frame: 0,
        direction: 0,
        img: null,
        animDelay: SLIME_CONFIG.animDelay,
        lastAnim: 0,
        state: "idle",
        stateTime: 0,
        movePath: [],
        moving: false,
        moveTarget: { x: x, y: y },
        moveSpeed: SLIME_CONFIG.moveSpeed,
        moveCooldown: 0,
        patrolZone: { x: 0, y: 0, width: 25, height: 20 },
        hp: Math.floor(SLIME_CONFIG.baseHp * hpMultiplier),
        maxHp: Math.floor(SLIME_CONFIG.baseHp * hpMultiplier),
        aggro: false,
        aggroTarget: null,
        lastAttack: 0,
        lastCombat: Date.now(),
        stuckSince: 0,
        returningHome: false,
        lastPatrol: null,
        xpValue: Math.floor(SLIME_CONFIG.baseXp * xpMultiplier),
        isDead: false,
        deathTime: 0,
        respawnTime: 0,
        permanentDeath: true,
        force: Math.floor(SLIME_CONFIG.baseForce * forceMultiplier),
        defense: Math.floor(SLIME_CONFIG.baseDefense * defenseMultiplier),
        damage: SLIME_CONFIG.baseDamage
    };
}

// Fonction pour mettre à jour un slime basique
function updateBasicSlime(monster, ts) {
    // Utiliser l'IA de chasse du joueur pour les slimes (aggro)
    if (typeof chasePlayerAI === 'function') {
        chasePlayerAI(monster, ts);
    }
    
    // Si le monstre n'est pas en aggro, utiliser l'IA passive pour la patrouille
    if (!monster.aggro && typeof passiveAI === 'function') {
        passiveAI(monster, ts);
    }
    
    // Animation idle pour le slime (même quand il ne bouge pas)
    if (!monster.moving) {
        if (!monster.lastAnim || ts - monster.lastAnim > monster.animDelay) {
            monster.frame = (monster.frame + 1) % 4;
            monster.lastAnim = ts;
            
            // Protection supplémentaire : réinitialiser si l'animation tourne trop longtemps
            if (ts - monster.lastAnim > 10000) {
                monster.lastAnim = ts;
                monster.frame = 0;
            }
        }
    }
}

// Export global
window.createBasicSlime = createBasicSlime;
window.updateBasicSlime = updateBasicSlime;
window.SLIME_CONFIG = SLIME_CONFIG; 
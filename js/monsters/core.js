// js/monsters/core.js

// Zone de patrouille sur toute la map (48x25)
const PATROL_ZONE = { x: 0, y: 0, width: 48, height: 25 };
const RESPAWN_DELAY = 30000; // 30 secondes en millisecondes

const monsters = [];

// Compteur global de corbeaux tués
let crowKillCount = 0;

function initMonsters() {
    console.log("Initialisation des monstres...");
    
    // Vider le tableau des monstres
    monsters.length = 0;
    
    // Créer les monstres
    for (let i = 0; i < 10; i++) {
        // Générer une position aléatoire sur toute la map
        let sx, sy;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            sx = Math.floor(Math.random() * PATROL_ZONE.width);
            sy = Math.floor(Math.random() * PATROL_ZONE.height);
            attempts++;
        } while (
            attempts < maxAttempts && 
            (window.isBlocked && window.isBlocked(sx, sy)) // Éviter les collisions
        );
        
        // Si on n'a pas trouvé de position libre, prendre une position aléatoire
        if (attempts >= maxAttempts) {
            sx = Math.floor(Math.random() * PATROL_ZONE.width);
            sy = Math.floor(Math.random() * PATROL_ZONE.height);
        }
        
        // Générer un niveau aléatoire entre 1 et 4
        const level = Math.floor(Math.random() * 4) + 1;
        
        // Ajuster les stats selon le niveau
        const baseHp = 15;
        const baseXp = 10;
        const hpMultiplier = 1 + (level - 1) * 0.2; // +20% par niveau
        const xpMultiplier = 1 + (level - 1) * 0.3; // +30% par niveau
        
        monsters.push({
            id: i + 1,
            name: "Corbeau",
            type: "crow",
            level: level, // Ajout du niveau
            x: sx, y: sy,
            px: sx * TILE_SIZE, py: sy * TILE_SIZE,
            spawnX: sx, spawnY: sy,
            frame: 0,
            direction: 0,
            img: null,
            animDelay: 120,
            lastAnim: 0,
            state: "idle",
            stateTime: 0,
            movePath: [],
            moving: false,
            moveTarget: { x: sx, y: sy },
            moveSpeed: 0.3,
            moveCooldown: 0, // Initialisé à 0 pour commencer la patrouille immédiatement
            patrolZone: PATROL_ZONE,
            hp: Math.floor(baseHp * hpMultiplier),
            maxHp: Math.floor(baseHp * hpMultiplier),
            aggro: false,
            aggroTarget: null,
            lastAttack: 0,
            lastCombat: Date.now(),
            stuckSince: 0,
            returningHome: false,
            lastPatrol: null,
            xpValue: Math.floor(baseXp * xpMultiplier), // XP ajusté selon le niveau
            // Système de respawn
            isDead: false,
            deathTime: 0,
            respawnTime: RESPAWN_DELAY
        });
        console.log(`Monstre ${i + 1} créé à la position (${sx}, ${sy}) - Niveau ${level}`);
    }
    
    console.log(`${monsters.length} monstres initialisés avec succès`);
    console.log("Tableau des monstres:", monsters);
    
    // Assigner l'image aux monstres si elle est déjà chargée
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
}

// Fonction pour créer un Maitrecorbeau à une position aléatoire
function spawnMaitreCorbeau() {
    let sx, sy;
    let attempts = 0;
    const maxAttempts = 100;
    do {
        sx = Math.floor(Math.random() * PATROL_ZONE.width);
        sy = Math.floor(Math.random() * PATROL_ZONE.height);
        attempts++;
    } while (
        attempts < maxAttempts && 
        (window.isBlocked && window.isBlocked(sx, sy))
    );
    if (attempts >= maxAttempts) {
        sx = Math.floor(Math.random() * PATROL_ZONE.width);
        sy = Math.floor(Math.random() * PATROL_ZONE.height);
    }
    const level = 10; // Niveau élevé pour le boss
    const baseHp = 120;
    const baseXp = 500;
    monsters.push({
        id: 'MC' + Date.now(),
        name: "Maitrecorbeau",
        type: "maitrecorbeau",
        level: level,
        x: sx, y: sy,
        px: sx * TILE_SIZE, py: sy * TILE_SIZE,
        spawnX: sx, spawnY: sy,
        frame: 0,
        direction: 0,
        img: null, // Sera assignée dans draw.js
        animDelay: 100,
        lastAnim: 0,
        state: "idle",
        stateTime: 0,
        movePath: [],
        moving: false,
        moveTarget: { x: sx, y: sy },
        moveSpeed: 0.35,
        moveCooldown: 0,
        patrolZone: PATROL_ZONE,
        hp: baseHp,
        maxHp: baseHp,
        aggro: false,
        aggroTarget: null,
        lastAttack: 0,
        lastCombat: Date.now(),
        stuckSince: 0,
        returningHome: false,
        lastPatrol: null,
        xpValue: baseXp,
        isDead: false,
        deathTime: 0,
        respawnTime: RESPAWN_DELAY,
        damage: 5, // Dégâts du Maitrecorbeau
        force: 10,
        agilite: 10,
        intelligence: 10
    });
    console.log('Maitrecorbeau apparu à la position (' + sx + ', ' + sy + ') !');
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
}

// Fonction pour gérer le respawn des monstres
function updateMonsterRespawn() {
    const currentTime = Date.now();
    
    monsters.forEach(monster => {
        if (monster.isDead && currentTime - monster.deathTime >= monster.respawnTime) {
            // Générer une nouvelle position de spawn aléatoire sur toute la map
            let newSpawnX, newSpawnY;
            let attempts = 0;
            const maxAttempts = 100;
            
            do {
                newSpawnX = Math.floor(Math.random() * PATROL_ZONE.width);
                newSpawnY = Math.floor(Math.random() * PATROL_ZONE.height);
                attempts++;
            } while (
                attempts < maxAttempts && 
                (window.isBlocked && window.isBlocked(newSpawnX, newSpawnY)) // Éviter les collisions
            );
            
            // Si on n'a pas trouvé de position libre, prendre une position aléatoire
            if (attempts >= maxAttempts) {
                newSpawnX = Math.floor(Math.random() * PATROL_ZONE.width);
                newSpawnY = Math.floor(Math.random() * PATROL_ZONE.height);
            }
            
            // Générer un nouveau niveau aléatoire entre 1 et 4
            const newLevel = Math.floor(Math.random() * 4) + 1;
            
            // Ajuster les stats selon le nouveau niveau
            const baseHp = 15;
            const baseXp = 10;
            const hpMultiplier = 1 + (newLevel - 1) * 0.2; // +20% par niveau
            const xpMultiplier = 1 + (newLevel - 1) * 0.3; // +30% par niveau
            
            // Respawn du monstre
            monster.isDead = false;
            monster.level = newLevel; // Nouveau niveau
            monster.hp = Math.floor(baseHp * hpMultiplier);
            monster.maxHp = Math.floor(baseHp * hpMultiplier);
            monster.spawnX = newSpawnX;
            monster.spawnY = newSpawnY;
            monster.x = newSpawnX;
            monster.y = newSpawnY;
            monster.px = newSpawnX * TILE_SIZE;
            monster.py = newSpawnY * TILE_SIZE;
            monster.state = "idle";
            monster.aggro = false;
            monster.aggroTarget = null;
            monster.moveTarget = { x: newSpawnX, y: newSpawnY };
            monster.movePath = [];
            monster.moving = false;
            monster.xpValue = Math.floor(baseXp * xpMultiplier); // Nouvel XP selon le niveau
            
            console.log(`Corbeau ${monster.id} a respawné à la position (${monster.x}, ${monster.y}) - Niveau ${newLevel}`);
        }
    });
}

// Fonction pour tuer un monstre (appelée depuis player.js)
function killMonster(monster) {
    if (monster && !monster.isDead) {
        monster.isDead = true;
        monster.deathTime = Date.now();
        monster.hp = 0;
        if (monster.type === "crow") {
            crowKillCount++;
            console.log(`Corbeaux tués : ${crowKillCount}`);
            if (crowKillCount % 100 === 0) {
                spawnMaitreCorbeau();
            }
        }
        console.log(`Corbeau ${monster.id} tué, respawn dans 30 secondes`);
    }
}

// Fonction pour forcer l'alignement d'un monstre sur sa case
function alignMonsterToGrid(monster) {
    if (monster) {
        // Marquer le monstre pour un alignement fluide
        monster.needsAlignment = true;
        monster.alignmentSpeed = 0.15; // Vitesse de snap (ajustable)
        monster.moving = false;
        monster.movePath = [];
    }
}

// Fonction pour l'alignement fluide (à appeler dans la boucle de rendu)
function updateMonsterAlignment(monster) {
    if (monster && monster.needsAlignment) {
        const targetX = monster.x * TILE_SIZE;
        const targetY = monster.y * TILE_SIZE;
        
        // Animation fluide vers la position cible
        monster.px += (targetX - monster.px) * monster.alignmentSpeed;
        monster.py += (targetY - monster.py) * monster.alignmentSpeed;
        
        // Arrêter quand assez proche (éviter les micro-mouvements)
        if (Math.abs(monster.px - targetX) < 0.5 && Math.abs(monster.py - targetY) < 0.5) {
            monster.px = targetX;
            monster.py = targetY;
            monster.needsAlignment = false;
        }
    }
}

// Export global
window.monsters = monsters;
window.updateMonsterRespawn = updateMonsterRespawn;
window.killMonster = killMonster;
window.alignMonsterToGrid = alignMonsterToGrid;
window.updateMonsterAlignment = updateMonsterAlignment; 
window.crowKillCount = crowKillCount;
window.spawnMaitreCorbeau = spawnMaitreCorbeau; 
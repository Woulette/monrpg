// Système de création et spawn des monstres
// Nettoyé et validé le 30/07/2025 - par Cursor

// Zone de patrouille sur toute la map (48x25)
const PATROL_ZONE = { x: 0, y: 0, width: 48, height: 25 };
const RESPAWN_DELAY = 30000; // 30 secondes en millisecondes

// Zones interdites pour le spawn des monstres
const FORBIDDEN_SPAWN_ZONES = {
    // Zone interdite pour mapdonjonslime2
    mapdonjonslime2: [{
        x: 11,
        y: 0,
        width: 3, // 11, 12, 13
        height: 9  // 0 à 8
    }],
    // Zone interdite pour map3
    map3: [
        // Zone 1: de 0,0 à 12,3 (rectangle 13x4)
        {
            x: 0,
            y: 0,
            width: 13, // 0 à 12
            height: 4   // 0 à 3
        },
        // Zone 2: de 21,0 à 27,9 (rectangle 7x10)
        {
            x: 21,
            y: 0,
            width: 7,  // 21 à 27
            height: 10 // 0 à 9
        }
    ]
};

// Fonction pour vérifier si une position est dans une zone interdite
function isInForbiddenSpawnZone(x, y) {
    const currentMap = window.currentMap;
    const zones = FORBIDDEN_SPAWN_ZONES[currentMap];
    
    if (!zones) return false;
    
    // Vérifier toutes les zones interdites pour cette map
    for (const zone of zones) {
        if (x >= zone.x && 
            x < zone.x + zone.width &&
            y >= zone.y && 
            y < zone.y + zone.height) {
            return true;
        }
    }
    
    return false;
}

// Fonction pour créer des slimes (pour les maps dédiées)
function createSlimes(count = 5) {
    console.log(`Création de ${count} slimes...`);
    
    // Zone de patrouille adaptée à la map slime (25x20)
    const slimePatrolZone = { x: 0, y: 0, width: 25, height: 20 };
    
    // Déterminer le nombre de slimes et leurs niveaux selon la map
    const currentMap = window.currentMap;
    let slimeCount, slimeLevels;
    
    if (currentMap === "mapdonjonslime") {
        slimeCount = 5; // 5 slimes sur mapdonjonslime
        slimeLevels = [7, 7, 7, 7, 7]; // Tous niveau 7
    } else if (currentMap === "mapdonjonslime2") {
        slimeCount = 7; // 7 slimes sur mapdonjonslime2
        slimeLevels = [8, 8, 8, 9, 9, 9, 9]; // Niveaux 8 et 9
    } else {
        slimeCount = count; // Fallback
        slimeLevels = Array(slimeCount).fill(7);
    }
    
    for (let i = 0; i < slimeCount; i++) {
        // Générer une position aléatoire sur toute la map
        let sx, sy;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            sx = Math.floor(Math.random() * slimePatrolZone.width);
            sy = Math.floor(Math.random() * slimePatrolZone.height);
            attempts++;
        } while (
            attempts < maxAttempts && 
            (window.isBlocked && window.isBlocked(sx, sy)) || // Éviter les collisions
            (currentMap === "mapdonjonslime2" && isInForbiddenSpawnZone(sx, sy)) || // Éviter la zone interdite sur mapdonjonslime2
            (currentMap === "map3" && isInForbiddenSpawnZone(sx, sy)) // Éviter la zone interdite pour map3
        );
        
        // Si on n'a pas trouvé de position libre, prendre une position aléatoire
        if (attempts >= maxAttempts) {
            sx = Math.floor(Math.random() * slimePatrolZone.width);
            sy = Math.floor(Math.random() * slimePatrolZone.height);
        }
        
        // Niveau selon la map
        const level = slimeLevels[i] || 7;
        
        // Stats du slime (niveaux plus élevés)
        const baseHp = 30; // Plus de PV de base pour les niveaux 7-9
        const baseXp = 25; // Plus d'XP de base pour les niveaux 7-9
        const hpMultiplier = 1 + (level - 7) * 0.25; // +25% par niveau à partir du niveau 7
        const xpMultiplier = 1 + (level - 7) * 0.35; // +35% par niveau à partir du niveau 7
        
        // Statistiques de force et défense pour les slimes
        const baseForce = 9; // Plus de force que les corbeaux
        const baseDefense = 6; // Plus de défense que les corbeaux
        const forceMultiplier = 1 + (level - 7) * 0.25; // +25% par niveau à partir du niveau 7
        const defenseMultiplier = 1 + (level - 7) * 0.2; // +20% par niveau à partir du niveau 7
        
        const newSlime = {
            id: 200 + i + 1, // ID différent pour éviter les conflits
            name: "Slime",
            type: "slime",
            level: level,
            x: sx, y: sy,
            px: sx * TILE_SIZE, py: sy * TILE_SIZE,
            spawnX: sx, spawnY: sy,
            frame: 0,
            direction: 0,
            img: null,
            animDelay: 200, // Animation plus lente pour le slime
            lastAnim: 0,
            state: "idle",
            stateTime: 0,
            movePath: [],
            moving: false,
            moveTarget: { x: sx, y: sy },
            moveSpeed: 0.5, // Vitesse normale pour les slimes
            moveCooldown: 0,
            patrolZone: slimePatrolZone,
            aggroRange: 7, // Distance d'agression pour les slimes
            hp: Math.floor(baseHp * hpMultiplier),
            maxHp: Math.floor(baseHp * hpMultiplier),
            aggro: false,
            aggroTarget: null,
            lastAttack: 0,
            lastCombat: Date.now(),
            stuckSince: 0,
            returningHome: false,
            lastPatrol: null,
            xpValue: Math.floor(baseXp * xpMultiplier),
            isDead: false,
            deathTime: 0,
            respawnTime: 0, // Pas de respawn pour les slimes du donjon
            permanentDeath: true, // Marquer pour mort permanente
            // Nouvelles statistiques de force et défense
            force: Math.floor(baseForce * forceMultiplier),
            defense: Math.floor(baseDefense * defenseMultiplier),
            // Dégâts de base du slime
            damage: 6 // Dégâts de base pour les slimes
        };
        
        window.monsters.push(newSlime);
        
        // Marquer la position comme occupée
        if (typeof occupy === "function") {
            occupy(sx, sy);
        }
        
        // Notifier la création du slime pour la progression du donjon
        if (typeof window.onSlimeSpawned === "function") {
            window.onSlimeSpawned();
        }
    }
    
    // Assigner l'image aux slimes si elle est déjà chargée
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
}

// Fonction pour créer un Maitrecorbeau à une position aléatoire (spécifique à la map actuelle)
function spawnMaitreCorbeau() {
    const currentMap = window.currentMap;
    if (!currentMap) return;
    
    // Le Maitrecorbeau ne peut spawner que sur les maps 1, 2 et 3
    if (currentMap !== "map1" && currentMap !== "map2" && currentMap !== "map3") {
        return;
    }
    
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
    const baseForce = 20; // Force élevée pour le boss
    const baseDefense = 15; // Défense élevée pour le boss
    window.monsters.push({
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
        force: baseForce,
        agilite: 10,
        intelligence: 10,
        defense: baseDefense
    });
    console.log(`Maitrecorbeau apparu sur ${currentMap} à la position (${sx}, ${sy}) !`);
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
}

// Fonction pour faire apparaître un Corbeau d'élite
function spawnCorbeauElite() {
    const currentMap = window.currentMap;
    if (!currentMap) return;
    
    // Le Corbeau d'élite ne peut spawner que sur les maps 1, 2 et 3
    if (currentMap !== "map1" && currentMap !== "map2" && currentMap !== "map3") {
        return;
    }
    
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
    
    const level = 5; // Niveau intermédiaire
    const baseHp = 60; // 60 de vie comme demandé
    const baseXp = 100; // 100 XP comme demandé
    const baseForce = 15; // 15 de force comme demandé
    const baseDefense = 10; // 10 de défense comme demandé
    const TILE_SIZE = window.TILE_SIZE || 32; // Récupérer TILE_SIZE depuis window
    
    window.monsters.push({
        id: 'CE' + Date.now(),
        name: "Corbeau d'élite",
        type: "corbeauelite",
        level: level,
        x: sx, y: sy,
        px: sx * TILE_SIZE, py: sy * TILE_SIZE,
        spawnX: sx, spawnY: sy,
        frame: 0,
        direction: 0,
        img: null, // Sera assignée dans draw.js
        animDelay: 100, // Animation de base (pour compatibilité)
        idleAnimDelay: 200, // Animation idle 2x plus lente que walk
        walkAnimDelay: 100, // Animation walk normale
        lastAnim: 0,
        state: "idle",
        stateTime: 0,
        movePath: [],
        moving: false,
        moveTarget: { x: sx, y: sy },
        moveSpeed: 0.8,
        moveCooldown: 0,
        patrolZone: PATROL_ZONE,
        hp: baseHp,
        maxHp: baseHp,
        aggro: false,
        aggroTarget: null,
        lastAttack: 0,
        lastCombat: 0, // Initialisé à 0, sera mis à jour lors de la première attaque
        stuckSince: 0,
        returningHome: false,
        lastPatrol: null,
        xpValue: baseXp,
        isDead: false,
        deathTime: 0,
        respawnTime: RESPAWN_DELAY,
        damage: 8, // Dégâts du Corbeau d'élite
        force: baseForce,
        agilite: 8,
        intelligence: 8,
        defense: baseDefense
    });
    
    // Ajouter les propriétés d'animation séparées pour le Corbeau d'élite
    const newMonster = window.monsters[window.monsters.length - 1];
    newMonster.idleFrame = 0;
    newMonster.walkFrame = 0;
    newMonster.lastIdleAnim = 0;
    newMonster.lastWalkAnim = 0;
    
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
}

function spawnSlimeBoss() {
    const currentMap = window.currentMap;
    if (!currentMap) return;
    
    // Le SlimeBoss ne peut spawner que sur la map 4 (donjon slime)
    if (currentMap !== "map4") {
        return;
    }
    
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
    
    const level = 10; // Niveau élevé pour un boss
    const baseHp = 200; // 200 de vie pour un boss puissant
    const baseXp = 500; // 500 XP pour un boss
    const baseForce = 25; // 25 de force
    const baseDefense = 20; // 20 de défense
    const TILE_SIZE = window.TILE_SIZE || 32;
    
    window.monsters.push({
        id: 'SB' + Date.now(),
        name: "SlimeBoss",
        type: "slimeboss",
        level: level,
        x: sx, y: sy,
        px: sx * TILE_SIZE, py: sy * TILE_SIZE,
        spawnX: sx, spawnY: sy,
        frame: 0,
        direction: 0,
        img: null, // Sera assignée dans draw.js
        animDelay: 150, // Animation un peu plus lente que les autres
        idleAnimDelay: 300, // Animation idle lente
        walkAnimDelay: 150, // Animation walk normale
        lastAnim: 0,
        state: "idle",
        stateTime: 0,
        movePath: [],
        moving: false,
        moveTarget: { x: sx, y: sy },
        moveSpeed: 0.8, // Plus rapide que les slimes normaux
        moveCooldown: 0,
        patrolZone: PATROL_ZONE,
        hp: baseHp,
        maxHp: baseHp,
        aggro: false,
        aggroTarget: null,
        lastAttack: 0,
        lastCombat: 0,
        stuckSince: 0,
        returningHome: false,
        lastPatrol: null,
        xpValue: baseXp,
        isDead: false,
        deathTime: 0,
        respawnTime: 60000, // 1 minute de respawn pour un boss
        damage: 15, // Dégâts élevés du SlimeBoss
        force: baseForce,
        agilite: 12,
        intelligence: 15,
        defense: baseDefense
    });
    
    // Ajouter les propriétés d'animation séparées pour le SlimeBoss
    const newMonster = window.monsters[window.monsters.length - 1];
    newMonster.idleFrame = 0;
    newMonster.walkFrame = 0;
    newMonster.lastIdleAnim = 0;
    newMonster.lastWalkAnim = 0;
    
    console.log(`SlimeBoss apparu sur ${currentMap} à la position (${sx}, ${sy}) !`);
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
}

// Fonction pour créer des corbeaux (pour les maps 1, 2, 3)
function createCrows(count = 10) {
    console.log(`Création de ${count} corbeaux...`);
    
    // Zone de patrouille sur toute la map (48x25)
    const PATROL_ZONE = { x: 0, y: 0, width: 48, height: 25 };
    const RESPAWN_DELAY = 30000; // 30 secondes en millisecondes
    
    for (let i = 0; i < count; i++) {
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
            (window.isBlocked && window.isBlocked(sx, sy)) || // Éviter les collisions
            isInForbiddenSpawnZone(sx, sy) // Éviter les zones interdites
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
        
        // Statistiques de force et défense pour les corbeaux
        const baseForce = 4;
        const baseDefense = 2;
        const forceMultiplier = 1 + (level - 1) * 0.15; // +15% par niveau
        const defenseMultiplier = 1 + (level - 1) * 0.1; // +10% par niveau
        
        const newMonster = {
            id: i + 1,
            name: "Corbeau",
            type: "crow",
            level: level,
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
            moveSpeed: 0.5,
            moveCooldown: 0,
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
            xpValue: Math.floor(baseXp * xpMultiplier),
            isDead: false,
            deathTime: 0,
            respawnTime: RESPAWN_DELAY,
            // Nouvelles statistiques de force et défense
            force: Math.floor(baseForce * forceMultiplier),
            defense: Math.floor(baseDefense * defenseMultiplier)
        };
        
        window.monsters.push(newMonster);
        
        // Marquer la position comme occupée
        if (typeof occupy === "function") {
            occupy(sx, sy);
        }
        
        console.log(`Corbeau ${i + 1} créé à la position (${sx}, ${sy}) - Niveau ${level}`);
    }
    
    // Assigner l'image aux corbeaux si elle est déjà chargée
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
}

// Export global
window.createSlimes = createSlimes;
window.createCrows = createCrows;
window.spawnMaitreCorbeau = spawnMaitreCorbeau;
window.spawnCorbeauElite = spawnCorbeauElite;
window.spawnSlimeBoss = spawnSlimeBoss;

// Fonction de debug pour afficher la zone interdite
window.showForbiddenSpawnZone = function() {
    const currentMap = window.currentMap;
    const zones = FORBIDDEN_SPAWN_ZONES[currentMap];
    
    if (!zones) {
        console.log(`🚫 Aucune zone interdite définie pour la map ${currentMap}`);
        return;
    }

    for (let i = 0; i < zones.length; i++) {
        const zone = zones[i];
        console.log(`🚫 Zone interdite ${i + 1} pour ${currentMap}: x=${zone.x} à ${zone.x + zone.width - 1}, y=${zone.y} à ${zone.y + zone.height - 1}`);
    }
    console.log(`🗺️ Map actuelle: ${window.currentMap}`);
}; 
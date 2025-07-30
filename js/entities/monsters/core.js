// js/monsters/core.js

// Zone de patrouille sur toute la map (48x25)
const PATROL_ZONE = { x: 0, y: 0, width: 48, height: 25 };
const RESPAWN_DELAY = 30000; // 30 secondes en millisecondes

// Fonction pour obtenir le compteur de corbeaux tués pour le personnage actuel
function getCrowKillCounts() {
    if (!window.currentCharacterId) {
        console.warn('⚠️ Aucun personnage actif, compteur initialisé à zéro');
        return { map1: 0, map2: 0, map3: 0 };
    }
    
    // Charger depuis localStorage
    const saveKey = `monrpg_crowKillCounts_${window.currentCharacterId}`;
    const savedData = localStorage.getItem(saveKey);
    
    if (savedData) {
        try {
            return JSON.parse(savedData);
        } catch (error) {
            console.error('❌ Erreur lors du chargement du compteur de corbeaux:', error);
        }
    }
    
    // Retourner un compteur vide si pas de sauvegarde
    return { map1: 0, map2: 0, map3: 0 };
}

// Fonction pour sauvegarder le compteur de corbeaux tués
function saveCrowKillCounts(counts) {
    if (!window.currentCharacterId) {
        console.warn('⚠️ Aucun personnage actif, impossible de sauvegarder le compteur');
        return;
    }
    
    try {
        const saveKey = `monrpg_crowKillCounts_${window.currentCharacterId}`;
        localStorage.setItem(saveKey, JSON.stringify(counts));
        console.log(`💾 Compteur de corbeaux sauvegardé pour ${window.currentCharacterId}:`, counts);
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde du compteur de corbeaux:', error);
    }
}

// Fonction pour incrémenter le compteur de corbeaux tués
function incrementCrowKillCount(mapName) {
    if (!mapName || !window.currentCharacterId) {
        console.warn('⚠️ Impossible d\'incrémenter le compteur: mapName ou characterId manquant');
        return 0;
    }
    
    const counts = getCrowKillCounts();
    counts[mapName] = (counts[mapName] || 0) + 1;
    saveCrowKillCounts(counts);
    
    console.log(`📊 Corbeaux tués sur ${mapName}: ${counts[mapName]} (personnage ${window.currentCharacterId})`);
    return counts[mapName];
}

// Fonction pour réinitialiser le compteur de corbeaux tués
function resetCrowKillCounts() {
    if (!window.currentCharacterId) {
        console.warn('⚠️ Aucun personnage actif, impossible de réinitialiser le compteur');
        return;
    }
    
    const counts = { map1: 0, map2: 0, map3: 0 };
    saveCrowKillCounts(counts);
    console.log(`🔄 Compteur de corbeaux réinitialisé pour ${window.currentCharacterId}`);
}

// Fonction pour obtenir le compteur actuel (pour compatibilité)
function getCurrentCrowKillCounts() {
    return getCrowKillCounts();
}

// Le système de sauvegarde est maintenant dans savemonster.js
// Nettoyage automatique au démarrage

function initMonsters() {
    console.log("🔍 === DÉBUT INITMONSTERS ===");
    console.log("🗺️ Map actuelle:", window.currentMap);
    console.log("📊 Monstres avant init:", window.monsters ? window.monsters.length : 0);
    
    // S'assurer que window.monsters est initialisé
    if (!window.monsters) {
        window.monsters = [];
        console.log("📦 window.monsters initialisé");
    }
    
    // Attendre que la map soit complètement chargée
    setTimeout(() => {
        const currentMap = window.currentMap;
        console.log(`🗺️ Map actuelle dans setTimeout: ${currentMap}`);
        
        // Nettoyer les monstres existants
        if (window.monsters && window.monsters.length > 0) {
            console.log(`🧹 Nettoyage de ${window.monsters.length} monstres existants`);
            window.monsters.forEach(monster => {
                if (typeof release === "function") {
                    release(monster.x, monster.y);
                }
            });
            window.monsters.length = 0;
        }
        
        // ESSAYER DE CHARGER LES MONSTRES SAUVEGARDÉS D'ABORD
        if (currentMap && typeof window.loadMonstersForMap === "function") {
            console.log("📂 Tentative de chargement des monstres sauvegardés...");
            const loaded = window.loadMonstersForMap(currentMap);
            if (loaded) {
                console.log(`✅ Monstres chargés depuis la sauvegarde pour ${currentMap}`);
                // Sauvegarder immédiatement pour nettoyer les données
                if (typeof window.saveMonstersForMap === "function") {
                    window.saveMonstersForMap(currentMap);
                }
                console.log("🔍 === FIN INITMONSTERS (chargement) ===");
                return; // Sortir, les monstres sont chargés
            }
        }
        
        // Si pas de sauvegarde, créer de nouveaux monstres
        console.log("📦 Aucune sauvegarde trouvée, création de nouveaux monstres...");
        
        if (currentMap && currentMap === "mapdonjonslimeboss") {
            console.log("🏰 Map boss détectée - création du SlimeBoss...");
            
            // Nettoyage FORCÉ des slimes existants sur mapdonjonslimeboss
            if (typeof window.forceCleanSlimesOnBossMap === "function") {
                window.forceCleanSlimesOnBossMap();
            }
            
            // S'assurer que le SlimeBoss existe
            console.log("🐉 Vérification de l'existence du SlimeBoss...");
            ensureSlimeBossExists();
            
            // Les slimes pourront être invoqués par le boss plus tard avec spawnSlimeForBoss()
        } else if (currentMap && currentMap === "map4") {
            console.log("Map 4 (donjon slime) détectée, création du SlimeBoss...");
            spawnSlimeBoss(); // Créer le SlimeBoss sur la map 4
        } else if (currentMap && (currentMap === "mapdonjonslime" || currentMap === "mapdonjonslime2")) {
            // Créer les slimes pour les maps du donjon slime
            console.log(`Map donjon slime détectée (${currentMap}), création de slimes...`);
            if (currentMap === "mapdonjonslime") {
                console.log("🔵 Création de 5 slimes pour mapdonjonslime...");
                createSlimes(5); // 5 slimes sur mapdonjonslime
                console.log(`✅ ${window.monsters.length} monstres créés sur mapdonjonslime`);
            } else if (currentMap === "mapdonjonslime2") {
                console.log("🔵 Création de 7 slimes pour mapdonjonslime2...");
                createSlimes(7); // 7 slimes sur mapdonjonslime2
                console.log(`✅ ${window.monsters.length} monstres créés sur mapdonjonslime2`);
            }
        } else if (currentMap && (currentMap === "map1" || currentMap === "map2" || currentMap === "map3")) {
            // Créer les corbeaux UNIQUEMENT pour les maps 1, 2 et 3
            console.log("Map normale détectée (map1/2/3), création de corbeaux...");
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
            moveSpeed: 0.3,
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
        } // Fin de la boucle for
    } // Fin du else
        
        console.log(`📊 ${window.monsters.length} monstres initialisés avec succès`);
        
        // Assigner l'image aux monstres si elle est déjà chargée
        if (typeof assignMonsterImages === "function") {
            console.log("🖼️ Assignation des images des monstres...");
            assignMonsterImages();
        }
        
        console.log("🔍 === FIN INITMONSTERS ===");
    }, 100); // Délai réduit pour un diagnostic plus rapide
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
            (window.isBlocked && window.isBlocked(sx, sy)) // Éviter les collisions
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
            moveSpeed: 0.2, // Plus lent que les corbeaux
            moveCooldown: 0,
            patrolZone: slimePatrolZone,
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
        
        console.log(`Slime ${i + 1} créé à la position (${sx}, ${sy}) - Niveau ${level}`);
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
        console.log(`Maitrecorbeau ne peut pas spawner sur la map ${currentMap}`);
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
        console.log(`Corbeau d'élite ne peut pas spawner sur la map ${currentMap}`);
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
    
    console.log(`Corbeau d'élite apparu sur ${currentMap} à la position (${sx}, ${sy}) !`);
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
}

function spawnSlimeBoss() {
    const currentMap = window.currentMap;
    if (!currentMap) return;
    
    // Le SlimeBoss ne peut spawner que sur la map 4 (donjon slime)
    if (currentMap !== "map4") {
        console.log(`SlimeBoss ne peut pas spawner sur la map ${currentMap}`);
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
        moveSpeed: 0.6, // Plus lent que les autres monstres
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

// Fonction pour gérer le respawn des monstres
function updateMonsterRespawn() {
    const currentTime = Date.now();
    const currentMap = window.currentMap;
    
    // Protection contre les timestamps invalides
    if (!currentTime || currentTime < 0) {
        console.warn("Timestamp invalide dans updateMonsterRespawn");
        return;
    }
    
    // Protection contre les données de map invalides
    if (!currentMap) {
        console.warn("Map actuelle invalide dans updateMonsterRespawn");
        return;
    }
    
    // Créer une liste des monstres à supprimer pour éviter les conflits d'itération
    const monstersToRemove = [];
    
    // Première passe : identifier les monstres à supprimer et ceux à respawn
    let processedCount = 0;
    const maxProcessed = window.monsters.length; // Protection contre les boucles infinies
    
    window.monsters.forEach(monster => {
        if (!monster) return; // Protection contre les monstres invalides
        processedCount++;
        
        if (processedCount > maxProcessed) {
            console.warn("Trop de monstres traités, arrêt de la boucle pour éviter le freeze");
            return;
        }
        
        // Éviter de traiter les monstres en cours de mort
        if (monster.isBeingKilled) {
            return;
        }
        
        if (monster.isDead && currentTime - monster.deathTime >= monster.respawnTime) {
            
            // VÉRIFICATION CRUCIALE : Ne respawn que les monstres du bon type selon la map
            if (currentMap === "mapdonjonslime" || currentMap === "mapdonjonslime2" || (currentMap && currentMap.includes("slime"))) {
                // Sur les maps slime, seuls les slimes peuvent respawn, mais pas ceux marqués pour mort permanente
                if (monster.type !== "slime") {
                    console.log(`🚫 ${monster.type} ${monster.id} supprimé de la map slime - respawn interdit`);
                    monstersToRemove.push(monster);
                    return;
                }
                // Vérifier si le slime est marqué pour mort permanente
                if (monster.permanentDeath) {
                    console.log(`🚫 Slime ${monster.id} supprimé - mort permanente`);
                    monstersToRemove.push(monster);
                    return;
                }
            } else if (currentMap === "map1" || currentMap === "map2" || currentMap === "map3") {
                // Sur les maps 1, 2 et 3, seuls les corbeaux peuvent respawn
                if (monster.type !== "crow" && monster.type !== "maitrecorbeau") {
                    console.log(`🚫 ${monster.type} ${monster.id} supprimé de la map normale - respawn interdit`);
                    monstersToRemove.push(monster);
                    return;
                }
            } else {
                // Sur les autres maps (non reconnues), supprimer tous les monstres
                console.log(`🚫 ${monster.type} ${monster.id} supprimé de la map non reconnue ${currentMap} - respawn interdit`);
                monstersToRemove.push(monster);
                return;
            }
            
            // Générer une nouvelle position de spawn aléatoire sur toute la map
            let newSpawnX, newSpawnY;
            let attempts = 0;
            const maxAttempts = 100;
            
            // Zone de patrouille adaptée selon le type de monstre
            const patrolZone = monster.type === "slime" ? 
                { x: 0, y: 0, width: 25, height: 20 } : 
                (PATROL_ZONE || { x: 0, y: 0, width: 48, height: 25 });
            
            do {
                newSpawnX = Math.floor(Math.random() * patrolZone.width);
                newSpawnY = Math.floor(Math.random() * patrolZone.height);
                attempts++;
            } while (
                attempts < maxAttempts && 
                (window.isBlocked && window.isBlocked(newSpawnX, newSpawnY)) // Éviter les collisions
            );
            
            // Si on n'a pas trouvé de position libre, prendre une position aléatoire
            if (attempts >= maxAttempts) {
                newSpawnX = Math.floor(Math.random() * patrolZone.width);
                newSpawnY = Math.floor(Math.random() * patrolZone.height);
            }
            
            // Gestion spéciale pour les slimes
            let newLevel;
            if (monster.type === "slime") {
                // Niveau fixe à 7 pour le respawn des slimes
                newLevel = 7;
                
                // Stats du slime (niveaux plus élevés)
                const baseHp = 30;
                const baseXp = 25;
                const hpMultiplier = 1 + (newLevel - 7) * 0.25; // +25% par niveau à partir du niveau 7
                const xpMultiplier = 1 + (newLevel - 7) * 0.35; // +35% par niveau à partir du niveau 7
                
                // Statistiques de force et défense pour les slimes
                const baseForce = 9;
                const baseDefense = 6;
                const forceMultiplier = 1 + (newLevel - 7) * 0.25; // +25% par niveau à partir du niveau 7
                const defenseMultiplier = 1 + (newLevel - 7) * 0.2; // +20% par niveau à partir du niveau 7
                
                // Respawn du slime
                monster.isDead = false;
                monster.level = newLevel;
                monster.hp = Math.floor(baseHp * hpMultiplier);
                monster.maxHp = Math.floor(baseHp * hpMultiplier);
                monster.xpValue = Math.floor(baseXp * xpMultiplier);
                monster.force = Math.floor(baseForce * forceMultiplier);
                monster.defense = Math.floor(baseDefense * defenseMultiplier);
                monster.damage = 6; // Dégâts de base pour les slimes
            } else if (monster.type === "crow") {
                // Générer un nouveau niveau aléatoire entre 1 et 4 pour les corbeaux
                newLevel = Math.floor(Math.random() * 4) + 1;
                
                // Ajuster les stats selon le nouveau niveau
                const baseHp = 15;
                const baseXp = 10;
                const hpMultiplier = 1 + (newLevel - 1) * 0.2; // +20% par niveau
                const xpMultiplier = 1 + (newLevel - 1) * 0.3; // +30% par niveau
                
                // Statistiques de force et défense pour les corbeaux
                const baseForce = 4;
                const baseDefense = 2;
                const forceMultiplier = 1 + (newLevel - 1) * 0.15; // +15% par niveau
                const defenseMultiplier = 1 + (newLevel - 1) * 0.1; // +10% par niveau
                
                // Respawn du corbeau
                monster.isDead = false;
                monster.level = newLevel;
                monster.hp = Math.floor(baseHp * hpMultiplier);
                monster.maxHp = Math.floor(baseHp * hpMultiplier);
                monster.xpValue = Math.floor(baseXp * xpMultiplier);
                monster.force = Math.floor(baseForce * forceMultiplier);
                monster.defense = Math.floor(baseDefense * defenseMultiplier);
            } else {
                // Type de monstre non reconnu, utiliser un niveau par défaut
                newLevel = 1;
                console.warn(`Type de monstre non reconnu pour respawn: ${monster.type}, niveau par défaut utilisé`);
                
                monster.isDead = false;
                monster.level = newLevel;
                monster.hp = 15;
                monster.maxHp = 15;
                monster.xpValue = 10;
                monster.force = 2;
                monster.defense = 1;
            }
            
            // Mise à jour de la position pour tous les monstres
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
            
            // Marquer la nouvelle position comme occupée
            if (typeof occupy === "function") {
                occupy(newSpawnX, newSpawnY);
            }
            
            if (monster.type === "slime") {
                console.log(`Slime ${monster.id} a respawné à la position (${monster.x}, ${monster.y}) - Niveau ${newLevel}`);
            } else {
                console.log(`Corbeau ${monster.id} a respawné à la position (${monster.x}, ${monster.y}) - Niveau ${newLevel}`);
            }
        }
    });
    
    // Deuxième passe : supprimer les monstres invalides de manière sûre
    if (monstersToRemove.length > 0) {
        console.log(`🗑️ Suppression de ${monstersToRemove.length} monstres invalides`);
        monstersToRemove.forEach(monsterToRemove => {
            const index = window.monsters.indexOf(monsterToRemove);
            if (index > -1) {
                window.monsters.splice(index, 1);
                console.log(`✅ Monstre ${monsterToRemove.type} ${monsterToRemove.id} supprimé avec succès`);
            }
        });
        
        // Sauvegarder l'état après nettoyage
        if (window.saveMonstersForMap && currentMap) {
            window.saveMonstersForMap(currentMap);
        }
    }
}

// Fonction pour tuer un monstre (appelée depuis player.js)
function killMonster(monster) {
    // Protection contre les appels multiples sur le même monstre
    if (!monster || monster.isDead || monster.isBeingKilled) {
        return;
    }
    
    // Marquer le monstre comme en cours de mort pour éviter les appels multiples
    monster.isBeingKilled = true;
    
    try {
        monster.isDead = true;
        monster.deathTime = Date.now();
        monster.hp = 0;
        
        if (monster.type === "crow") {
            // Libérer la position occupée
            if (typeof release === "function") {
                release(monster.x, monster.y);
            }
            
            // Mettre à jour le progrès de la quête de chasse aux corbeaux
            if (typeof window.onCrowKilled === "function") {
                window.onCrowKilled();
            }
            
            // Vérifier si on doit spawn un Corbeau d'élite ou Maitrecorbeau sur cette map spécifique
            // UNIQUEMENT sur les maps 1, 2 et 3
            const currentMap = window.currentMap;
            if (currentMap && (currentMap === "map1" || currentMap === "map2" || currentMap === "map3")) {
                // Incrémenter le compteur pour le personnage actuel
                const newCount = incrementCrowKillCount(currentMap);
                console.log(`📊 Corbeaux tués sur ${currentMap}: ${newCount} (personnage ${window.currentCharacterId})`);
                
                // Spawn Corbeau d'élite tous les 10 corbeaux tués
                if (newCount % 10 === 0) {
                    console.log(`🎯 Spawn du Corbeau d'élite déclenché (${newCount} corbeaux tués)`);
                    spawnCorbeauElite();
                }
                
                // Spawn Maitrecorbeau tous les 100 corbeaux tués
                if (newCount % 100 === 0) {
                    console.log(`👑 Spawn du Maitrecorbeau déclenché (${newCount} corbeaux tués)`);
                    spawnMaitreCorbeau();
                }
            }
            console.log(`Corbeau ${monster.id} tué sur ${window.currentMap}, respawn dans 30 secondes`);
        } else if (monster.type === "corbeauelite") {
            // Libérer la position occupée
            if (typeof release === "function") {
                release(monster.x, monster.y);
            }
            console.log(`Corbeau d'élite ${monster.id} tué sur ${window.currentMap}, respawn dans 30 secondes`);
        } else if (monster.type === "slime") {
            // Libérer la position occupée
            if (typeof release === "function") {
                release(monster.x, monster.y);
            }
            
            // Marquer le slime pour mort permanente
            monster.permanentDeath = true;
            monster.respawnTime = 0;
            
            // Notifier la mort du slime pour la progression du donjon
            if (typeof window.onSlimeKilled === "function") {
                window.onSlimeKilled();
            }
            
            // Vérifier la progression du donjon
            if (typeof window.checkDungeonProgression === "function") {
                window.checkDungeonProgression();
            }
            
            console.log(`Slime ${monster.id} tué sur ${window.currentMap}, mort permanente`);
        } else if (monster.type === "slimeboss") {
            // Libérer la position occupée (zone 2x2 pour le boss 64x64)
            if (typeof release === "function") {
                release(monster.x, monster.y);
                release(monster.x + 1, monster.y);
                release(monster.x, monster.y + 1);
                release(monster.x + 1, monster.y + 1);
            }
            
            // Gérer la mort du SlimeBoss et les récompenses
            if (typeof window.handleSlimeBossDeath === "function") {
                window.handleSlimeBossDeath();
            }
            
            // Déclencher la progression de la quête slimeBossFinal
            if (typeof window.checkSlimeBossFinalQuestProgress === "function") {
                window.checkSlimeBossFinalQuestProgress();
            }
            
            console.log(`SlimeBoss ${monster.id} tué sur ${window.currentMap} - Système de récompense activé`);
        } else {
            // Type de monstre non reconnu
            console.warn(`Type de monstre non reconnu: ${monster.type}`);
        }
        
        // Sauvegarder l'état des monstres après la mort
        if (typeof window.saveMonstersForMap === "function" && window.currentMap) {
            window.saveMonstersForMap(window.currentMap);
        }
        
        // Forcer la sauvegarde du personnage après avoir tué un monstre
        if (typeof window.forceSaveOnEvent === "function") {
            window.forceSaveOnEvent();
        }
    } catch (error) {
        console.error("Erreur lors de la mort du monstre:", error);
    } finally {
        // Toujours nettoyer le flag de mort en cours
        if (monster) {
            monster.isBeingKilled = false;
        }
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
window.spawnSlimeBoss = spawnSlimeBoss;
window.crowKillCounts = crowKillCounts;
window.updateMonsterRespawn = updateMonsterRespawn;
window.killMonster = killMonster;
window.alignMonsterToGrid = alignMonsterToGrid;
window.updateMonsterAlignment = updateMonsterAlignment; 
window.spawnMaitreCorbeau = spawnMaitreCorbeau;
window.spawnCorbeauElite = spawnCorbeauElite;
window.createSlimes = createSlimes;
window.initMonsters = initMonsters; 

// Fonction pour permettre au boss d'invoquer des slimes sur mapdonjonslimeboss
window.spawnSlimeForBoss = function(x, y, level = 7) {
    if (window.currentMap !== "mapdonjonslimeboss") {
        console.log("❌ Erreur: spawnSlimeForBoss ne peut être utilisé que sur mapdonjonslimeboss");
        return null;
    }
    
    console.log(`🐸 Invocation d'un slime par le boss à la position (${x}, ${y}) - Niveau ${level}`);
    
    const newSlime = {
        id: Date.now() + Math.random(), // ID unique
        name: "Slime du Boss",
        type: "slime",
        level: level,
        x: x, y: y,
        px: x * TILE_SIZE, py: y * TILE_SIZE,
        spawnX: x, spawnY: y,
        frame: 0,
        direction: 0,
        img: null,
        animDelay: 120,
        lastAnim: 0,
        state: "idle",
        stateTime: 0,
        movePath: [],
        moving: false,
        moveTarget: { x: x, y: y },
        moveSpeed: 0.3,
        moveCooldown: 0,
        patrolZone: { x: 0, y: 0, width: 25, height: 20 }, // Zone de la map boss
        hp: 50 + (level - 7) * 10, // HP basé sur le niveau
        maxHp: 50 + (level - 7) * 10,
        aggro: false,
        aggroTarget: null,
        lastAttack: 0,
        lastCombat: Date.now(),
        stuckSince: 0,
        returningHome: false,
        lastPatrol: null,
        xpValue: 20 + (level - 7) * 5,
        isDead: false,
        deathTime: 0,
        respawnTime: 0, // Pas de respawn automatique
        permanentDeath: true, // Mort permanente
        force: 8 + (level - 7) * 2,
        defense: 3 + (level - 7) * 1,
        // Spécial pour les slimes du boss
        isBossSlime: true,
        bossOwner: "SlimeBoss"
    };
    
    window.monsters.push(newSlime);
    
    // Marquer la position comme occupée
    if (typeof window.occupy === "function") {
        window.occupy(x, y);
    }
    
    // Assigner l'image si disponible
    if (typeof window.assignMonsterImages === "function") {
        window.assignMonsterImages();
    }
    
    console.log(`✅ Slime du boss invoqué avec succès - ID: ${newSlime.id}`);
    return newSlime;
};

// Fonction pour nettoyer tous les slimes du boss
window.cleanBossSlimes = function() {
    if (window.currentMap !== "mapdonjonslimeboss") {
        console.log("❌ Erreur: cleanBossSlimes ne peut être utilisé que sur mapdonjonslimeboss");
        return;
    }
    
    if (window.monsters && window.monsters.length > 0) {
        // NE SUPPRIME QUE les slimes invoqués par le boss (isBossSlime: true)
        const bossSlimes = window.monsters.filter(monster => monster.isBossSlime);
        bossSlimes.forEach(slime => {
            if (typeof window.release === "function") {
                window.release(slime.x, slime.y);
            }
        });
        
        window.monsters = window.monsters.filter(monster => !monster.isBossSlime);
        console.log(`🧹 ${bossSlimes.length} slimes du boss nettoyés (les slimes normaux restent intacts)`);
    }
};

// Fonction pour forcer le nettoyage des slimes sur mapdonjonslimeboss
window.forceCleanSlimesOnBossMap = function() {
    console.log("🧹 FORÇAGE du nettoyage des slimes normaux sur mapdonjonslimeboss...");
    
    // Supprimer UNIQUEMENT les slimes normaux si on est sur mapdonjonslimeboss
    if (window.currentMap === "mapdonjonslimeboss") {
        // Nettoyer d'abord le localStorage
        if (typeof window.clearBossMapMonsterData === "function") {
            window.clearBossMapMonsterData();
        }
        
        if (window.monsters && window.monsters.length > 0) {
            // Identifier les slimes normaux à supprimer
            const normalSlimesToRemove = window.monsters.filter(monster => 
                monster.type === "slime" && !monster.isBossSlime
            );
            
            console.log(`🗑️ Suppression forcée de ${normalSlimesToRemove.length} slimes normaux sur mapdonjonslimeboss`);
            
            // Libérer les positions des slimes normaux
            normalSlimesToRemove.forEach(slime => {
                if (typeof window.release === "function") {
                    window.release(slime.x, slime.y);
                }
            });
            
            // Retirer UNIQUEMENT les slimes normaux du tableau
            window.monsters = window.monsters.filter(monster => 
                !(monster.type === "slime" && !monster.isBossSlime)
            );
            
            console.log(`✅ ${normalSlimesToRemove.length} slimes normaux supprimés, ${window.monsters.length} autres monstres conservés`);
        } else {
            console.log("✅ Aucun monstre à supprimer sur mapdonjonslimeboss");
        }
    } else {
        console.log("❌ Erreur: forceCleanSlimesOnBossMap ne peut être utilisé que sur mapdonjonslimeboss");
    }
};

// Fonction pour nettoyer TOUS les slimes normaux sur mapdonjonslimeboss
window.cleanAllSlimesOnBossMap = function() {
    if (window.currentMap !== "mapdonjonslimeboss") {
        console.log("❌ Erreur: cleanAllSlimesOnBossMap ne peut être utilisé que sur mapdonjonslimeboss");
        return;
    }
    
    if (window.monsters && window.monsters.length > 0) {
        // Supprimer UNIQUEMENT les slimes normaux (pas ceux du boss)
        const normalSlimes = window.monsters.filter(monster => 
            monster.type === "slime" && !monster.isBossSlime
        );
        normalSlimes.forEach(slime => {
            if (typeof window.release === "function") {
                window.release(slime.x, slime.y);
            }
        });
        
        // Retirer UNIQUEMENT les slimes normaux du tableau
        window.monsters = window.monsters.filter(monster => 
            !(monster.type === "slime" && !monster.isBossSlime)
        );
        console.log(`🧹 ${normalSlimes.length} slimes normaux supprimés de mapdonjonslimeboss (les slimes du boss restent intacts)`);
    }
}; 

// Fonction pour gérer la mort du SlimeBoss et les récompenses
window.handleSlimeBossDeath = function() {
    console.log("🏆 SlimeBoss vaincu ! Système de récompense activé...");
    
    // Afficher la popup de félicitations
    if (typeof window.showBossVictoryPopup === "function") {
        window.showBossVictoryPopup();
    }
    
    // Marquer que le boss est vaincu pour cette session
    window.slimeBossDefeated = true;
    
    // Sauvegarder l'état de victoire
    if (typeof window.saveGameState === "function") {
        window.saveGameState();
    }
    
    console.log("✅ État de victoire du SlimeBoss sauvegardé");
};

// Fonction pour ouvrir le coffre du boss
window.openBossChest = function() {
    if (window.currentMap !== "mapdonjonslimeboss") {
        console.log("❌ Erreur: Le coffre ne peut être ouvert que sur mapdonjonslimeboss");
        return;
    }
    
    if (!window.slimeBossDefeated) {
        console.log("❌ Erreur: Le SlimeBoss doit être vaincu pour ouvrir le coffre");
        return;
    }
    
    console.log("🎁 Ouverture du coffre du SlimeBoss...");
    
    // Afficher la fenêtre de sélection (la téléportation se fera après sélection d'un objet)
    if (typeof window.showBossChestWindow === "function") {
        window.showBossChestWindow();
    }
}; 

// Fonction de diagnostic des monstres
window.debugMonsters = function() {
    console.log('🔍 Diagnostic complet des monstres...');
    
    console.log('📊 État global:', {
        windowMonsters: !!window.monsters,
        windowMonstersLength: window.monsters ? window.monsters.length : 'undefined',
        currentMap: window.currentMap,
        currentCharacterId: window.currentCharacterId
    });
    
    if (window.monsters && window.monsters.length > 0) {
        console.log(`👹 ${window.monsters.length} monstres trouvés:`);
        window.monsters.forEach((monster, index) => {
            console.log(`👹 Monstre ${index}:`, {
                id: monster.id,
                type: monster.type,
                name: monster.name,
                hasImg: !!monster.img,
                imgComplete: monster.img ? monster.img.complete : false,
                hp: monster.hp,
                isDead: monster.isDead,
                position: { x: monster.x, y: monster.y }
            });
        });
    } else {
        console.log('❌ Aucun monstre trouvé dans window.monsters');
    }
    
    console.log('🔍 === FIN DU DIAGNOSTIC ===');
}; 

// Exporter les fonctions pour utilisation globale
window.getCrowKillCounts = getCrowKillCounts;
window.saveCrowKillCounts = saveCrowKillCounts;
window.incrementCrowKillCount = incrementCrowKillCount;
window.resetCrowKillCounts = resetCrowKillCounts;
window.getCurrentCrowKillCounts = getCurrentCrowKillCounts;
window.spawnSlimeBossOnBossMap = spawnSlimeBossOnBossMap;

// Fonction de diagnostic pour le compteur de corbeaux
function diagnoseCrowKillCounts() {
    console.log('🔍 === DIAGNOSTIC DU COMPTEUR DE CORBEAUX ===');
    
    if (!window.currentCharacterId) {
        console.log('❌ Aucun personnage actif');
        return;
    }
    
    const counts = getCrowKillCounts();
    console.log('📊 Compteur actuel:', {
        characterId: window.currentCharacterId,
        map1: counts.map1,
        map2: counts.map2,
        map3: counts.map3,
        total: counts.map1 + counts.map2 + counts.map3
    });
    
    // Vérifier les sauvegardes dans localStorage
    const saveKey = `monrpg_crowKillCounts_${window.currentCharacterId}`;
    const savedData = localStorage.getItem(saveKey);
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            console.log('💾 Sauvegarde trouvée:', data);
        } catch (error) {
            console.log('❌ Erreur lors de la lecture de la sauvegarde:', error);
        }
    } else {
        console.log('❌ Aucune sauvegarde trouvée');
    }
    
    console.log('🔍 === FIN DU DIAGNOSTIC ===');
}

// Exporter la fonction de diagnostic
window.diagnoseCrowKillCounts = diagnoseCrowKillCounts; 

// Fonction de diagnostic pour le SlimeBoss
function diagnoseSlimeBoss() {
    console.log('🔍 === DIAGNOSTIC DU SLIMEBOSS ===');
    
    console.log('📊 Map actuelle:', window.currentMap);
    console.log('📊 Nombre de monstres:', window.monsters ? window.monsters.length : 0);
    
    if (window.monsters && window.monsters.length > 0) {
        const slimeBosses = window.monsters.filter(m => m.type === 'slimeboss');
        console.log('🐉 SlimeBoss trouvés:', slimeBosses.length);
        
        slimeBosses.forEach((boss, index) => {
            console.log(`🐉 SlimeBoss ${index + 1}:`, {
                id: boss.id,
                name: boss.name,
                position: { x: boss.x, y: boss.y },
                hp: `${boss.hp}/${boss.maxHp}`,
                isDead: boss.isDead,
                img: boss.img ? 'chargée' : 'non chargée'
            });
        });
    } else {
        console.log('❌ Aucun monstre trouvé');
    }
    
    // Vérifier si la fonction de spawn existe
    console.log('🔧 Fonction spawnSlimeBossOnBossMap disponible:', typeof spawnSlimeBossOnBossMap === 'function');
    
    console.log('🔍 === FIN DU DIAGNOSTIC ===');
}

// Exporter la fonction de diagnostic
window.diagnoseSlimeBoss = diagnoseSlimeBoss; 

// Fonction pour créer le SlimeBoss sur mapdonjonslimeboss
function spawnSlimeBossOnBossMap() {
    console.log("🔍 === DÉBUT SPAWN SLIMEBOSS ===");
    console.log("🗺️ Map actuelle:", window.currentMap);
    console.log("📊 Monstres avant spawn:", window.monsters ? window.monsters.length : 0);
    
    if (window.currentMap !== "mapdonjonslimeboss") {
        console.log("❌ Erreur: spawnSlimeBossOnBossMap ne peut être utilisé que sur mapdonjonslimeboss");
        return null;
    }
    
                   console.log("🐉 Création du SlimeBoss sur mapdonjonslimeboss à la position (11, 1)...");
    
                   // Position du boss 64x64 (11,1) comme demandé
               const bossX = 12; // Position X du boss
               const bossY = 4;  // Position Y du boss
    const TILE_SIZE = window.TILE_SIZE || 32;
    
    const slimeBoss = {
        id: "slimeboss_001",
        name: "SlimeBoss",
        type: "slimeboss",
        level: 15,
        x: bossX, y: bossY,
        px: bossX * TILE_SIZE, py: bossY * TILE_SIZE,
        spawnX: bossX, spawnY: bossY,
        frame: 0,
        direction: 0,
        img: null,
        animDelay: 200, // Animation plus lente pour le boss
        lastAnim: 0,
        state: "idle",
        stateTime: 0,
        movePath: [],
        moving: false,
        moveTarget: { x: bossX, y: bossY },
        moveSpeed: 0.2, // Plus lent que les slimes normaux
        moveCooldown: 0,
        patrolZone: { x: 8, y: 1, width: 8, height: 4 }, // Zone de patrouille limitée
        hp: 500,
        maxHp: 500,
        aggro: false,
        aggroTarget: null,
        lastAttack: 0,
        lastCombat: Date.now(),
        stuckSince: 0,
        returningHome: false,
        lastPatrol: null,
        xpValue: 200,
        isDead: false,
        deathTime: 0,
        respawnTime: 0, // Pas de respawn automatique
        permanentDeath: true,
        force: 25,
        defense: 15,
        // Propriétés spéciales pour le boss
        isBoss: true,
        bossType: "slimeboss",
        // Taille du boss (64x64)
        width: 64,
        height: 64,
        // Animations du boss (4 frames)
        animationFrames: 4,
        currentAnimation: 0,
        // Compétences du boss
        canSummonSlimes: true,
        lastSummonTime: 0,
        summonCooldown: 10000, // 10 secondes entre les invocations
        maxSummonedSlimes: 3
    };
    
    console.log("📦 SlimeBoss créé:", slimeBoss);
    
    // S'assurer que window.monsters existe
    if (!window.monsters) {
        console.log("⚠️ window.monsters n'existe pas, création...");
        window.monsters = [];
    }
    
    // Ajouter le boss au tableau des monstres
    window.monsters.push(slimeBoss);
    console.log("📦 SlimeBoss ajouté à window.monsters");
    console.log("📊 Monstres après ajout:", window.monsters.length);
    
    // Vérifier que le boss est bien dans le tableau
    const bossInArray = window.monsters.find(m => m.id === "slimeboss_001");
    console.log("🔍 Boss trouvé dans le tableau:", !!bossInArray);
    
    // Marquer la position comme occupée (zone 2x2 pour le boss 64x64)
    if (typeof window.occupy === "function") {
        window.occupy(bossX, bossY);
        window.occupy(bossX + 1, bossY);
        window.occupy(bossX, bossY + 1);
        window.occupy(bossX + 1, bossY + 1);
        console.log("📍 Positions marquées comme occupées");
    } else {
        console.log("⚠️ Fonction window.occupy non disponible");
    }
    
    // Assigner l'image du boss
    if (typeof window.assignMonsterImages === "function") {
        console.log("🖼️ Utilisation de assignMonsterImages...");
        window.assignMonsterImages();
    } else {
        console.log("🖼️ Chargement manuel de l'image du boss...");
        // Charger l'image du boss manuellement
        const bossImg = new Image();
        bossImg.onload = function() {
            slimeBoss.img = bossImg;
            console.log("✅ Image du SlimeBoss chargée avec succès");
        };
        bossImg.onerror = function() {
            console.error("❌ Erreur lors du chargement de l'image du SlimeBoss");
        };
        bossImg.src = "assets/personnages/slimeboss.png";
    }
    
    console.log(`✅ SlimeBoss créé avec succès - ID: ${slimeBoss.id}, HP: ${slimeBoss.hp}/${slimeBoss.maxHp}`);
    console.log("🔍 === FIN SPAWN SLIMEBOSS ===");
    return slimeBoss;
} 

// Fonction pour forcer la recréation du SlimeBoss si nécessaire
function ensureSlimeBossExists() {
    if (window.currentMap !== "mapdonjonslimeboss") {
        console.log("❌ ensureSlimeBossExists ne peut être utilisé que sur mapdonjonslimeboss");
        return false;
    }
    
    // Vérifier si le SlimeBoss existe déjà
    if (window.monsters && window.monsters.length > 0) {
        const existingBoss = window.monsters.find(m => m.type === 'slimeboss');
        if (existingBoss) {
            console.log("✅ SlimeBoss existe déjà:", existingBoss.id);
            return true;
        }
    }
    
    // Le boss n'existe pas, le créer
    console.log("🐉 SlimeBoss manquant, création...");
    const boss = spawnSlimeBossOnBossMap();
    return !!boss;
}

// Exporter la fonction
window.ensureSlimeBossExists = ensureSlimeBossExists; 
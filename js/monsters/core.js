// js/monsters/core.js

// Zone de patrouille sur toute la map (48x25)
const PATROL_ZONE = { x: 0, y: 0, width: 48, height: 25 };
const RESPAWN_DELAY = 30000; // 30 secondes en millisecondes

const monsters = [];

// Le système de sauvegarde est maintenant dans savemonster.js
// Nettoyage automatique au démarrage

function initMonsters() {
    console.log("Initialisation des monstres...");
    
    // Attendre que la map soit complètement chargée
    setTimeout(() => {
        const currentMap = window.currentMap;
        console.log(`Map actuelle détectée: ${currentMap}`);
        
        // Nettoyer les monstres existants
        monsters.forEach(monster => {
            if (typeof release === "function") {
                release(monster.x, monster.y);
            }
        });
        monsters.length = 0;
        
        // ESSAYER DE CHARGER LES MONSTRES SAUVEGARDÉS D'ABORD
        if (currentMap && typeof window.loadMonstersForMap === "function") {
            const loaded = window.loadMonstersForMap(currentMap);
            if (loaded) {
                console.log(`✅ Monstres chargés depuis la sauvegarde pour ${currentMap}`);
                // Sauvegarder immédiatement pour nettoyer les données
                if (typeof window.saveMonstersForMap === "function") {
                    window.saveMonstersForMap(currentMap);
                }
                return; // Sortir, les monstres sont chargés
            }
        }
        
        // Si pas de sauvegarde, créer de nouveaux monstres
        console.log("Aucune sauvegarde trouvée, création de nouveaux monstres...");
        
        // Gestion spéciale pour la map slime - AUCUN corbeau ici
        if (currentMap && (currentMap === "mapdonjonslime" || currentMap.includes("slime"))) {
            console.log("Map slime détectée, création de slimes uniquement...");
            createSlimes(8); // 8 slimes sur la map slime
        }
    
    // Créer les corbeaux UNIQUEMENT pour les autres maps (pas mapdonjonslime)
    console.log("Création de nouveaux corbeaux...");
    for (let i = 0; i < 8; i++) {
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
            respawnTime: RESPAWN_DELAY
        };
        
        monsters.push(newMonster);
        
        // Marquer la position comme occupée
        if (typeof occupy === "function") {
            occupy(sx, sy);
        }
        
        console.log(`Corbeau ${i + 1} créé à la position (${sx}, ${sy}) - Niveau ${level}`);
    }
    
        console.log(`${monsters.length} monstres initialisés avec succès`);
        
        // Assigner l'image aux monstres si elle est déjà chargée
        if (typeof assignMonsterImages === "function") {
            assignMonsterImages();
        }
    }, 100); // Attendre 100ms pour que la map soit chargée
}

// Fonction pour créer des slimes (pour les maps dédiées)
function createSlimes(count = 5) {
    console.log(`Création de ${count} slimes...`);
    
    // Zone de patrouille adaptée à la map slime (25x20)
    const slimePatrolZone = { x: 0, y: 0, width: 25, height: 20 };
    
    for (let i = 0; i < count; i++) {
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
        
        // Générer un niveau aléatoire entre 5 et 7
        const level = Math.floor(Math.random() * 3) + 5; // 5, 6, ou 7
        
        // Stats du slime (niveaux plus élevés)
        const baseHp = 25; // Plus de PV de base
        const baseXp = 20; // Plus d'XP de base
        const hpMultiplier = 1 + (level - 5) * 0.2; // +20% par niveau à partir du niveau 5
        const xpMultiplier = 1 + (level - 5) * 0.3; // +30% par niveau à partir du niveau 5
        
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
            respawnTime: RESPAWN_DELAY
        };
        
        monsters.push(newSlime);
        
        // Marquer la position comme occupée
        if (typeof occupy === "function") {
            occupy(sx, sy);
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
    
    // Le Maitrecorbeau ne peut pas spawner sur la map slime
    if (currentMap === "mapdonjonslime" || (currentMap && currentMap.includes("slime"))) {
        console.log("Maitrecorbeau ne peut pas spawner sur la map slime");
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
    console.log(`Maitrecorbeau apparu sur ${currentMap} à la position (${sx}, ${sy}) !`);
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
    
    monsters.forEach(monster => {
        if (monster.isDead && currentTime - monster.deathTime >= monster.respawnTime) {
            
            // VÉRIFICATION CRUCIALE : Ne respawn que les monstres du bon type selon la map
            if (currentMap === "mapdonjonslime" || (currentMap && currentMap.includes("slime"))) {
                // Sur mapdonjonslime, seuls les slimes peuvent respawn
                if (monster.type !== "slime") {
                    console.log(`🚫 ${monster.type} ${monster.id} supprimé de la map slime - respawn interdit`);
                    // Supprimer complètement le monstre de la liste
                    const index = monsters.indexOf(monster);
                    if (index > -1) {
                        monsters.splice(index, 1);
                    }
                    return;
                }
            } else {
                // Sur les autres maps, seuls les corbeaux peuvent respawn
                if (monster.type !== "crow" && monster.type !== "maitrecorbeau") {
                    console.log(`🚫 ${monster.type} ${monster.id} supprimé de la map normale - respawn interdit`);
                    // Supprimer complètement le monstre de la liste
                    const index = monsters.indexOf(monster);
                    if (index > -1) {
                        monsters.splice(index, 1);
                    }
                    return;
                }
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
                // Générer un nouveau niveau aléatoire entre 5 et 7
                newLevel = Math.floor(Math.random() * 3) + 5;
                
                // Stats du slime (niveaux plus élevés)
                const baseHp = 25;
                const baseXp = 20;
                const hpMultiplier = 1 + (newLevel - 5) * 0.2; // +20% par niveau à partir du niveau 5
                const xpMultiplier = 1 + (newLevel - 5) * 0.3; // +30% par niveau à partir du niveau 5
                
                // Respawn du slime
                monster.isDead = false;
                monster.level = newLevel;
                monster.hp = Math.floor(baseHp * hpMultiplier);
                monster.maxHp = Math.floor(baseHp * hpMultiplier);
                monster.xpValue = Math.floor(baseXp * xpMultiplier);
            } else if (monster.type === "crow") {
                // Générer un nouveau niveau aléatoire entre 1 et 4 pour les corbeaux
                newLevel = Math.floor(Math.random() * 4) + 1;
                
                // Ajuster les stats selon le nouveau niveau
                const baseHp = 15;
                const baseXp = 10;
                const hpMultiplier = 1 + (newLevel - 1) * 0.2; // +20% par niveau
                const xpMultiplier = 1 + (newLevel - 1) * 0.3; // +30% par niveau
                
                // Respawn du corbeau
                monster.isDead = false;
                monster.level = newLevel;
                monster.hp = Math.floor(baseHp * hpMultiplier);
                monster.maxHp = Math.floor(baseHp * hpMultiplier);
                monster.xpValue = Math.floor(baseXp * xpMultiplier);
            } else {
                // Type de monstre non reconnu, utiliser un niveau par défaut
                newLevel = 1;
                console.warn(`Type de monstre non reconnu pour respawn: ${monster.type}, niveau par défaut utilisé`);
                
                monster.isDead = false;
                monster.level = newLevel;
                monster.hp = 15;
                monster.maxHp = 15;
                monster.xpValue = 10;
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
}

// Fonction pour tuer un monstre (appelée depuis player.js)
function killMonster(monster) {
    if (monster && !monster.isDead) {
        monster.isDead = true;
        monster.deathTime = Date.now();
        monster.hp = 0;
        
        if (monster.type === "crow") {
            // Libérer la position occupée
            if (typeof release === "function") {
                release(monster.x, monster.y);
            }
            
            // Vérifier si on doit spawn un Maitrecorbeau sur cette map spécifique
            // MAIS PAS sur la map slime
            const currentMap = window.currentMap;
            if (currentMap && currentMap !== "mapdonjonslime" && !currentMap.includes("slime")) {
                const currentMapKillCount = monsters.filter(m => m.isDead && m.type === "crow").length;
                console.log(`Corbeaux tués sur ${window.currentMap}: ${currentMapKillCount}`);
                
                if (currentMapKillCount % 100 === 0) {
                    spawnMaitreCorbeau();
                }
            }
            console.log(`Corbeau ${monster.id} tué sur ${window.currentMap}, respawn dans 30 secondes`);
        } else if (monster.type === "slime") {
            // Libérer la position occupée
            if (typeof release === "function") {
                release(monster.x, monster.y);
            }
            console.log(`Slime ${monster.id} tué sur ${window.currentMap}, respawn dans 30 secondes`);
        } else {
            // Type de monstre non reconnu
            console.warn(`Type de monstre non reconnu: ${monster.type}`);
        }
        
        // Sauvegarder l'état des monstres après la mort
        if (typeof window.saveMonstersForMap === "function" && window.currentMap) {
            window.saveMonstersForMap(window.currentMap);
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
window.updateMonsterRespawn = updateMonsterRespawn;
window.killMonster = killMonster;
window.alignMonsterToGrid = alignMonsterToGrid;
window.updateMonsterAlignment = updateMonsterAlignment; 
window.spawnMaitreCorbeau = spawnMaitreCorbeau;
window.createSlimes = createSlimes;
window.initMonsters = initMonsters; 
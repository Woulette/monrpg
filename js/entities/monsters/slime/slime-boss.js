// Système spécifique au SlimeBoss
// Nettoyé et validé le 30/07/2025 - par Cursor

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
    if (typeof window.saveGameStateData === "function" && window.currentCharacterId) {
        window.saveGameStateData(window.currentCharacterId);
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

// Fonction pour créer le SlimeBoss sur mapdonjonslimeboss
function spawnSlimeBossOnBossMap() {
    console.log("🔍 === DÉBUT SPAWN SLIMEBOSS ===");
    console.log("🗺️ Map actuelle:", window.currentMap);
    console.log("📊 Monstres avant spawn:", window.monsters ? window.monsters.length : 0);
    
    if (window.currentMap !== "mapdonjonslimeboss") {
        console.log("❌ Erreur: spawnSlimeBossOnBossMap ne peut être utilisé que sur mapdonjonslimeboss");
        return null;
    }
    
    console.log("🐉 Création du SlimeBoss sur mapdonjonslimeboss à la position (12, 4)...");
    
    // Position du boss 64x64 (12,4) comme demandé
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
        moveSpeed: 0.8, // Plus rapide que les slimes normaux
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
    
    // Vérifier si le boss a déjà été vaincu
    if (window.slimeBossDefeated) {
        console.log("🏆 SlimeBoss déjà vaincu, pas de recréation");
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
    
    // Le boss n'existe pas et n'a pas été vaincu, le créer
    console.log("🐉 SlimeBoss manquant, création...");
    const boss = spawnSlimeBossOnBossMap();
    return !!boss;
}

// IA intégrée du SlimeBoss - comportement unique et complexe
function updateSlimeBoss(monster, ts) {
    // Protection contre les timestamps invalides
    if (!ts || ts < 0) {
        ts = Date.now();
    }
    
    // Protection contre les monstres invalides
    if (!monster || typeof monster !== 'object' || monster.type !== 'slimeboss') {
        return;
    }
    
    if (!monster.img || monster.hp <= 0) return;
    
    // Mettre à jour l'alignement fluide si nécessaire
    if (typeof updateMonsterAlignment === 'function') {
        updateMonsterAlignment(monster);
    }
    
    // --- DÉTECTION AGGRO ---
    let distToPlayer = Math.abs(player.x - monster.x) + Math.abs(player.y - monster.y);
    const BOSS_AGGRO_RANGE = 10;
    const BOSS_DEAGGRO_RANGE = 25;
    const BOSS_ATTACK_RANGE = 2;
    const BOSS_ATTACK_COOLDOWN = 2000;
    const BOSS_SUMMON_COOLDOWN = 10000;
    
    // AGGRO pour le boss
    if (!monster.aggro && distToPlayer <= BOSS_AGGRO_RANGE) {
        monster.aggro = true;
        monster.aggroTarget = player;
        monster.lastCombat = ts;
        console.log("🐉 SlimeBoss entre en mode aggro !");
    }
    
    // Déclencher l'aggro si le boss a été attaqué
    if (monster.aggro && monster.aggroTarget === player && distToPlayer <= BOSS_AGGRO_RANGE && monster.state !== 'return') {
        if (monster.lastCombat && (ts - monster.lastCombat) < AGGRO_TIMEOUT) {
            if (monster.state !== 'aggro') {
                monster.state = 'aggro';
            }
        } else {
            monster.aggro = false;
            monster.aggroTarget = null;
        }
    }
    
    // --- AGGRO ---
    if (monster.state === 'aggro') {
        // Vérifier qu'il y a eu une vraie interaction de combat récente
        if (!monster.lastCombat || (ts - monster.lastCombat) >= AGGRO_TIMEOUT) {
            monster.state = 'idle';
            monster.aggro = false;
            monster.aggroTarget = null;
            monster.movePath = [];
            monster.moving = false;
            monster.nextPatrolTime = ts + getRandomPatrolDelay();
            return;
        }
        
        // Délock si joueur mort ou trop loin
        if (player.life <= 0 || distToPlayer > BOSS_DEAGGRO_RANGE) {
            monster.state = 'return';
            monster.aggro = false;
            monster.aggroTarget = null;
            monster.movePath = [];
            monster.moving = false;
            return;
        }
        
        // ATTAQUE DU BOSS
        if (distToPlayer <= BOSS_ATTACK_RANGE) {
            // Protection contre les attaques multiples
            if (!monster.isAttacking && (!monster.lastAttack || (ts - monster.lastAttack) >= BOSS_ATTACK_COOLDOWN)) {
                // Marquer le boss comme en train d'attaquer
                monster.isAttacking = true;
                
                // Calcul des dégâts du boss
                const bossBaseDamage = monster.damage !== undefined ? monster.damage : 15;
                const bossTotalDamage = bossBaseDamage + (monster.force || 0);
                const variation = 0.3; // 30% de variation
                const randomFactor = 1 + (Math.random() * 2 - 1) * variation;
                const bossDamage = Math.max(1, Math.floor(bossTotalDamage * randomFactor) - player.defense);
                
                // Appliquer les dégâts au joueur
                player.life -= bossDamage;
                if (player.life < 0) player.life = 0;
                
                // Afficher les dégâts reçus par le joueur
                if (typeof displayDamage === "function") {
                    displayDamage(player.px, player.py, bossDamage, 'damage', true);
                }
                
                // Mettre à jour le timer d'attaque et de combat
                monster.lastAttack = ts;
                monster.lastCombat = ts;
                
                // XP défense pour avoir reçu des dégâts
                if (typeof gainStatXP === "function") {
                    gainStatXP('defense', 2); // Plus d'XP pour un boss
                }
                
                console.log(`🐉 SlimeBoss attaque ! Dégâts: ${bossDamage}`);
                
                // Réinitialiser le flag d'attaque après un délai
                setTimeout(() => {
                    if (monster && typeof monster === 'object') {
                        monster.isAttacking = false;
                    }
                }, 100); // 100ms de protection
            }
            return;
        }
        
        // INVOCATION DE SLIMES
        if (monster.canSummonSlimes && (!monster.lastSummonTime || (ts - monster.lastSummonTime) >= BOSS_SUMMON_COOLDOWN)) {
            // Compter les slimes invoqués
            const summonedSlimes = window.monsters.filter(m => m.isBossSlime);
            
            if (summonedSlimes.length < monster.maxSummonedSlimes) {
                // Trouver une position libre pour invoquer
                let summonPositions = [
                    { x: monster.x + 2, y: monster.y },
                    { x: monster.x - 2, y: monster.y },
                    { x: monster.x, y: monster.y + 2 },
                    { x: monster.x, y: monster.y - 2 }
                ].filter(pos =>
                    pos.x >= 0 && pos.x < mapData.width &&
                    pos.y >= 0 && pos.y < mapData.height &&
                    !window.isBlocked(pos.x, pos.y) &&
                    !monsters.some(m => m.x === pos.x && m.y === pos.y)
                );
                
                if (summonPositions.length > 0) {
                    let summonPos = summonPositions[Math.floor(Math.random() * summonPositions.length)];
                    
                    if (typeof spawnSlimeForBoss === 'function') {
                        spawnSlimeForBoss(summonPos.x, summonPos.y, 8);
                        monster.lastSummonTime = ts;
                        console.log(`🐸 SlimeBoss invoque un slime à (${summonPos.x}, ${summonPos.y})`);
                    }
                }
            }
        }
        
        // Pathfinding vers le joueur
        let destinations = [
            { x: player.x + 1, y: player.y },
            { x: player.x - 1, y: player.y },
            { x: player.x, y: player.y + 1 },
            { x: player.x, y: player.y - 1 }
        ].filter(pos =>
            pos.x >= 0 && pos.x < mapData.width &&
            pos.y >= 0 && pos.y < mapData.height &&
            !window.isBlocked(pos.x, pos.y) &&
            !monsters.some(m => m !== monster && m.x === pos.x && m.y === pos.y)
        );
        
        if (destinations.length) {
            let newDest = destinations.reduce((best, pos) => {
                let d = Math.abs(pos.x - monster.x) + Math.abs(pos.y - monster.y);
                if (!best || d < best.d) return { ...pos, d };
                return best;
            }, null);
            
            if (newDest) {
                let path = findPath(
                    { x: monster.x, y: monster.y },
                    { x: newDest.x, y: newDest.y },
                    window.isBlocked,
                    mapData.width, mapData.height
                ) || [];
                
                if (!monster.movePath || path.length === 0 || path[0].x !== monster.movePath[0]?.x || path[0].y !== monster.movePath[0]?.y) {
                    monster.movePath = path;
                    if (monster.movePath.length > 0) {
                        if (typeof nextStepMonster === 'function') {
                            nextStepMonster(monster, ts);
                        }
                    }
                }
            }
        }
        return;
    }

    // --- RETOUR MAISON ---
    if (monster.state === 'return') {
        if (monster.x === monster.spawnX && monster.y === monster.spawnY) {
            monster.state = 'idle';
            monster.aggro = false;
            monster.aggroTarget = null;
            monster.nextPatrolTime = ts + getRandomPatrolDelay();
            monster.movePath = [];
            monster.moving = false;
            return;
        }
        if (!monster.moving || !monster.movePath || monster.movePath.length === 0) {
            let path = findPath(
                { x: monster.x, y: monster.y },
                { x: monster.spawnX, y: monster.spawnY },
                window.isBlocked,
                mapData.width, mapData.height
            );
            if (path && path.length > 0) {
                monster.movePath = path;
                if (typeof nextStepMonster === 'function') {
                    nextStepMonster(monster, ts);
                }
            }
        }
        return;
    }
    
    // --- PATROUILLE IDLE ---
    if (!monster.nextPatrolTime) monster.nextPatrolTime = ts + getRandomPatrolDelay();
    if (ts >= monster.nextPatrolTime) {
        // Patrouille limitée dans la zone du boss
        let tries = 0, maxTries = 20;
        let found = false;
        while (tries < maxTries && !found) {
            let distance = Math.floor(Math.random() * 4) + 1; // Distance plus courte
            let angle = Math.random() * 2 * Math.PI;
            let dx = Math.round(Math.cos(angle) * distance);
            let dy = Math.round(Math.sin(angle) * distance);
            let tx = monster.x + dx;
            let ty = monster.y + dy;
            
            // Vérifier que la destination est dans la zone du boss
            if (
                tx >= monster.patrolZone.x && tx < monster.patrolZone.x + monster.patrolZone.width &&
                ty >= monster.patrolZone.y && ty < monster.patrolZone.y + monster.patrolZone.height &&
                (tx !== monster.x || ty !== monster.y)
            ) { 
                let path = findPath(
                    { x: monster.x, y: monster.y },
                    { x: tx, y: ty },
                    window.isBlocked,
                    mapData.width, mapData.height
                );
                if (path && path.length > 0) {
                    monster.movePath = path;
                    monster.state = 'patrol';
                    if (typeof nextStepMonster === 'function') {
                        nextStepMonster(monster, ts);
                    }
                    found = true;
                } else {
                    tries++;
                }
            } else {
                tries++;
            }
        }
        if (!found) {
            monster.nextPatrolTime = ts + getRandomPatrolDelay();
        }
    }
}

// Export global
window.spawnSlimeBossOnBossMap = spawnSlimeBossOnBossMap;
window.ensureSlimeBossExists = ensureSlimeBossExists;
window.updateSlimeBoss = updateSlimeBoss; 
// Système de respawn des monstres
// Nettoyé et validé le 30/07/2025 - par Cursor

// Fonction pour gérer le respawn des monstres
function updateMonsterRespawn() {
    // En multijoueur, le serveur est autoritaire → ne pas respawn côté client
    if (window.multiplayerManager && window.multiplayerManager.connected) {
        return;
    }
    const currentTime = Date.now();
    const currentMap = window.currentMap;
    
    // Protection contre les timestamps invalides
    if (!currentTime || currentTime < 0) {
        return;
    }
    
    // Protection contre les données de map invalides
    if (!currentMap) {
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
                    monstersToRemove.push(monster);
                    return;
                }
                // Vérifier si le slime est marqué pour mort permanente
                if (monster.permanentDeath) {
                    monstersToRemove.push(monster);
                    return;
                }
            } else if (currentMap === "map1" || currentMap === "map2" || currentMap === "map3") {
                // Sur les maps 1, 2 et 3, seuls les corbeaux peuvent respawn
                if (monster.type !== "crow" && monster.type !== "maitrecorbeau" && monster.type !== "corbeauelite") {
                    monstersToRemove.push(monster);
                    return;
                }
            } else if (currentMap === "map4" || currentMap === "map5") {
                // Sur map4 et map5, seuls les cochons peuvent respawn
                if (monster.type !== "cochon") {
                    monstersToRemove.push(monster);
                    return;
                }
            } else {
                // Sur les autres maps (non reconnues), supprimer tous les monstres
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
            } else if (monster.type === "cochon") {
                // Niveau aléatoire 7-10 pour cochon
                newLevel = Math.floor(Math.random() * 4) + 7;
                const levelDelta = newLevel - 7;
                const baseHp = 100;
                const hpMultiplier = 1 + levelDelta * 0.07;
                const baseXpMin = 35;
                const baseXpMax = 50;
                const xpBase = Math.floor(Math.random() * (baseXpMax - baseXpMin + 1)) + baseXpMin;
                const xpValue = xpBase + Math.floor(levelDelta * 2);
                const baseForce = 15;
                const baseDefense = 10;
                const forceMultiplier = 1 + levelDelta * 0.06;
                const defenseMultiplier = 1 + levelDelta * 0.05;

                monster.isDead = false;
                monster.level = newLevel;
                monster.hp = Math.floor(baseHp * hpMultiplier);
                monster.maxHp = Math.floor(baseHp * hpMultiplier);
                monster.xpValue = xpValue;
                monster.force = Math.floor(baseForce * forceMultiplier);
                monster.defense = Math.floor(defenseMultiplier * baseDefense);
                monster.damage = 7;
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
            monster.frame = 0; // Reset de l'animation
            monster.lastAnim = 0; // Reset du timer d'animation
            monster.stuckSince = 0; // Reset du blocage
            monster.moveCooldown = 0; // Reset du cooldown de mouvement
            
            // Marquer la nouvelle position comme occupée
            if (typeof occupy === "function") {
                occupy(newSpawnX, newSpawnY);
            }
            
            // Monstre respawné
        }
    });
    
    // Deuxième passe : supprimer les monstres invalides de manière sûre
    if (monstersToRemove.length > 0) {
        monstersToRemove.forEach(monsterToRemove => {
            const index = window.monsters.indexOf(monsterToRemove);
            if (index > -1) {
                window.monsters.splice(index, 1);
            }
        });
        
        // Sauvegarder l'état après nettoyage
        if (window.saveMonstersForMap && currentMap) {
            window.saveMonstersForMap(currentMap);
        }
    }
}

// Fonction de diagnostic pour vérifier le système de respawn
function diagnoseRespawnSystem() {
    // Diagnostic du système de respawn
}

// Export global
window.updateMonsterRespawn = updateMonsterRespawn; 
window.diagnoseRespawnSystem = diagnoseRespawnSystem; 
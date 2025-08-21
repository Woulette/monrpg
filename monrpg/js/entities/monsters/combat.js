// Système de combat et mort des monstres
// Nettoyé et validé le 30/07/2025 - par Cursor

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
                
                // Spawn Corbeau d'élite tous les 10 corbeaux tués
                if (newCount % 10 === 0) {
                    spawnCorbeauElite();
                }
                
                // Spawn Maitrecorbeau tous les 100 corbeaux tués
                if (newCount % 100 === 0) {
                    spawnMaitreCorbeau();
                }
            }
        } else if (monster.type === "corbeauelite") {
            // Libérer la position occupée
            if (typeof release === "function") {
                release(monster.x, monster.y);
            }
        } else if (monster.type === "slime") {
            // Libérer la position occupée
            if (typeof release === "function") {
                release(monster.x, monster.y);
            }
            
            // Marquer le slime pour mort permanente
            monster.permanentDeath = true;
            monster.respawnTime = 0;
            
            console.log("🔧 Slime tué, type:", monster.type, "map:", window.currentMap);
            
            // Notifier la mort du slime pour la progression du donjon
            if (typeof window.onSlimeKilled === "function") {
                window.onSlimeKilled();
            }
            
            // Vérifier la progression du donjon
            if (typeof window.checkDungeonProgression === "function") {
                window.checkDungeonProgression();
            }
        } else if (monster.type === "slimeboss") {
            // Libérer la position occupée (zone 2x2 pour le boss 64x64)
            if (typeof release === "function") {
                release(monster.x, monster.y);
                release(monster.x + 1, monster.y);
                release(monster.x, monster.y + 1);
                release(monster.x + 1, monster.y + 1);
            }
            // Sécurité anti-collisions fantômes: réconcilier l'occupation
            if (typeof window.reconcileOccupiedPositions === 'function') {
                window.reconcileOccupiedPositions();
            }
            
            // Gérer la mort du SlimeBoss et les récompenses
            if (typeof window.handleSlimeBossDeath === "function") {
                window.handleSlimeBossDeath();
            }
            
            // Déclencher la progression de la quête slimeBossFinal
            if (typeof window.checkSlimeBossFinalQuestProgress === "function") {
                window.checkSlimeBossFinalQuestProgress();
            }
        } else {
            // Type de monstre non reconnu
            console.warn(`Type de monstre non reconnu: ${monster.type}`);
        }
        
        // Sauvegarder l'état des monstres après la mort
        if (typeof window.saveMonstersForMap === "function" && window.currentMap) {
            window.saveMonstersForMap(window.currentMap);
        }

        // Multijoueur: notifier le serveur de la mort (serveur gère le respawn)
        if (window.multiplayerManager && window.multiplayerManager.connected && window.multiplayerManager.socket) {
            try {
                window.multiplayerManager.socket.send(JSON.stringify({
                    type: 'monster_killed',
                    data: {
                        map: window.currentMap,
                        type: monster.type,
                        x: monster.x,
                        y: monster.y,
                        respawnMs: Math.max(0, Number(monster.respawnTime || 30000))
                    }
                }));
            } catch (e) {
                // silencieux
            }
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
window.killMonster = killMonster;
window.alignMonsterToGrid = alignMonsterToGrid;
window.updateMonsterAlignment = updateMonsterAlignment; 
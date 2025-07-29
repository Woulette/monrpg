// Système de sauvegarde des monstres avec filtrage intelligent
// Évite les erreurs du passé tout en gardant la cohérence des positions

const monsterSaves = {};

// Sauvegarder les monstres pour une map spécifique
function saveMonstersForMap(mapName) {
    if (!mapName || !window.monsters) return;
    
    console.log(`💾 Sauvegarde des monstres pour ${mapName}...`);
    
    // Filtrer les monstres selon le type de map
    let monstersToSave;
    
    if (mapName === "mapdonjonslime" || mapName === "mapdonjonslime2" || mapName.includes("slime")) {
        // Sur les maps slime, sauvegarder UNIQUEMENT les slimes
        monstersToSave = window.monsters.filter(m => m.type === "slime" && !m.isDead);
        console.log(`🔵 ${monstersToSave.length} slimes sauvegardés pour ${mapName}`);
    } else if (mapName === "mapdonjonslimeboss") {
        // Sur mapdonjonslimeboss, NE SAUVEGARDER AUCUN MONSTRE
        monstersToSave = [];
        console.log(`🚫 Aucun monstre sauvegardé pour mapdonjonslimeboss (map boss)`);
    } else if (mapName === "map1" || mapName === "map2" || mapName === "map3") {
        // Sur les maps 1, 2 et 3, sauvegarder UNIQUEMENT les corbeaux, corbeaux d'élite et maitrecorbeaux
        monstersToSave = window.monsters.filter(m => 
            (m.type === "crow" || m.type === "corbeauelite" || m.type === "maitrecorbeau") && !m.isDead
        );
        console.log(`⚫ ${monstersToSave.length} corbeaux/corbeaux d'élite/maitrecorbeaux sauvegardés pour ${mapName}`);
    } else {
        // Sur les autres maps (non reconnues), ne sauvegarder aucun monstre
        monstersToSave = [];
        console.log(`🚫 Aucun monstre sauvegardé pour la map non reconnue ${mapName}`);
    }
    
    // Préparer les données à sauvegarder (sans les références d'images)
    const saveData = monstersToSave.map(monster => ({
        id: monster.id,
        name: monster.name,
        type: monster.type,
        level: monster.level,
        x: monster.x,
        y: monster.y,
        px: monster.px,
        py: monster.py,
        spawnX: monster.spawnX,
        spawnY: monster.spawnY,
        frame: monster.frame,
        direction: monster.direction,
        animDelay: monster.animDelay,
        lastAnim: monster.lastAnim,
        state: monster.state,
        stateTime: monster.stateTime,
        movePath: monster.movePath,
        moving: monster.moving,
        moveTarget: monster.moveTarget,
        moveSpeed: monster.moveSpeed,
        moveCooldown: monster.moveCooldown,
        patrolZone: monster.patrolZone,
        hp: monster.hp,
        maxHp: monster.maxHp,
        aggro: monster.aggro,
        aggroTarget: monster.aggroTarget,
        lastAttack: monster.lastAttack,
        lastCombat: monster.lastCombat,
        stuckSince: monster.stuckSince,
        returningHome: monster.returningHome,
        lastPatrol: monster.lastPatrol,
        xpValue: monster.xpValue,
        isDead: monster.isDead,
        deathTime: monster.deathTime,
        respawnTime: monster.respawnTime,
        // Propriétés spéciales pour les maitrecorbeaux
        damage: monster.damage,
        force: monster.force,
        defense: monster.defense,
        agilite: monster.agilite,
        intelligence: monster.intelligence
    }));
    
    // Sauvegarder dans localStorage
    try {
        monsterSaves[mapName] = saveData;
        localStorage.setItem('monsterSaves', JSON.stringify(monsterSaves));
        
        // Sauvegarder aussi le compteur de corbeaux tués si c'est une map avec des corbeaux
        if (mapName === "map1" || mapName === "map2" || mapName === "map3") {
            if (window.crowKillCounts && window.crowKillCounts[mapName] !== undefined) {
                localStorage.setItem('crowKillCounts', JSON.stringify(window.crowKillCounts));
                console.log(`📊 Compteur de corbeaux tués sauvegardé pour ${mapName}: ${window.crowKillCounts[mapName]}`);
            }
        }
        
        console.log(`✅ Sauvegarde réussie pour ${mapName}`);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des monstres:', error);
    }
}

// Charger les monstres pour une map spécifique
function loadMonstersForMap(mapName) {
    if (!mapName) return false;
    
    console.log(`📂 Chargement des monstres pour ${mapName}...`);
    
    try {
        // Récupérer les données sauvegardées
        const savedData = localStorage.getItem('monsterSaves');
        if (!savedData) {
            console.log('Aucune sauvegarde de monstres trouvée');
            return false;
        }
        
        const allSaves = JSON.parse(savedData);
        const mapSaves = allSaves[mapName];
        
        if (!mapSaves || mapSaves.length === 0) {
            console.log(`Aucune sauvegarde trouvée pour ${mapName}`);
            return false;
        }
        
        // Filtrer les monstres selon le type de map
        let validMonsters;
        
        if (mapName === "mapdonjonslime" || mapName === "mapdonjonslime2" || mapName.includes("slime")) {
            // Sur les maps slime, charger UNIQUEMENT les slimes
            validMonsters = mapSaves.filter(m => m.type === "slime");
            console.log(`🔵 ${validMonsters.length} slimes chargés pour ${mapName}`);
        } else if (mapName === "mapdonjonslimeboss") {
            // Sur mapdonjonslimeboss, charger UNIQUEMENT les maitrecorbeaux
            validMonsters = mapSaves.filter(m => m.type === "maitrecorbeau");
            console.log(`⚫ ${validMonsters.length} maitrecorbeaux chargés pour ${mapName}`);
        } else if (mapName === "map1" || mapName === "map2" || mapName === "map3") {
            // Sur les maps 1, 2 et 3, charger UNIQUEMENT les corbeaux et maitrecorbeaux
            validMonsters = mapSaves.filter(m => m.type === "crow" || m.type === "maitrecorbeau");
            console.log(`⚫ ${validMonsters.length} corbeaux/maitrecorbeaux chargés pour ${mapName}`);
        } else {
            // Sur les autres maps (non reconnues), ne charger aucun monstre
            validMonsters = [];
            console.log(`🚫 Aucun monstre chargé pour la map non reconnue ${mapName}`);
        }
        
        // Vérifier si tous les monstres sont morts
        const aliveMonsters = validMonsters.filter(m => !m.isDead);
        if (aliveMonsters.length === 0 && validMonsters.length > 0) {
            console.log(`⚠️ Tous les monstres sont morts sur ${mapName}, pas de chargement`);
            return false; // Ne pas charger si tous sont morts
        }
        
        // Vérifier s'il y a assez de monstres vivants
        const expectedCount = (mapName === "mapdonjonslime" || mapName === "mapdonjonslime2" || mapName.includes("slime")) ? 8 : 10;
        if (aliveMonsters.length < expectedCount) {
            console.log(`⚠️ Pas assez de monstres vivants sur ${mapName} (${aliveMonsters.length}/${expectedCount}), pas de chargement`);
            return false; // Ne pas charger si pas assez de monstres vivants
        }
        
        if (validMonsters.length === 0) {
            console.log(`Aucun monstre valide trouvé pour ${mapName}`);
            return false;
        }
        
        // Nettoyer les monstres existants
        if (window.monsters) {
            window.monsters.forEach(monster => {
                if (typeof window.release === "function") {
                    window.release(monster.x, monster.y);
                }
            });
            window.monsters.length = 0;
        }
        
        // Restaurer les monstres avec leurs positions exactes
        validMonsters.forEach(monsterData => {
            const restoredMonster = {
                ...monsterData,
                img: null // L'image sera assignée plus tard
            };
            
            window.monsters.push(restoredMonster);
            
            // Marquer la position comme occupée
            if (typeof window.occupy === "function") {
                window.occupy(monsterData.x, monsterData.y);
            }
        });
        
        // Assigner les images aux monstres
        if (typeof window.assignMonsterImages === "function") {
            window.assignMonsterImages();
        }
        
        console.log(`✅ ${validMonsters.length} monstres restaurés pour ${mapName}`);
        return true;
        
    } catch (error) {
        console.error('Erreur lors du chargement des monstres:', error);
        return false;
    }
}

// Nettoyer les données corrompues
function cleanCorruptedSaveData() {
    console.log("🧹 Nettoyage des données de sauvegarde corrompues...");
    
    try {
        const savedData = localStorage.getItem('monsterSaves');
        if (!savedData) return;
        
        const allSaves = JSON.parse(savedData);
        let hasCorruption = false;
        
        // Vérifier chaque map
        Object.keys(allSaves).forEach(mapName => {
            const mapSaves = allSaves[mapName];
            
            if (mapName === "mapdonjonslime" || mapName === "mapdonjonslime2" || mapName.includes("slime")) {
                // Sur les maps slime, supprimer TOUS les corbeaux et ne garder que les slimes
                const invalidMonsters = mapSaves.filter(m => m.type !== "slime");
                if (invalidMonsters.length > 0) {
                    console.log(`🚫 Suppression de ${invalidMonsters.length} monstres invalides sur ${mapName}`);
                    allSaves[mapName] = mapSaves.filter(m => m.type === "slime");
                    hasCorruption = true;
                }
                
                // Si aucun slime, supprimer complètement la sauvegarde pour cette map
                if (allSaves[mapName].length === 0) {
                    console.log(`🗑️ Suppression complète des données pour ${mapName} (aucun slime valide)`);
                    delete allSaves[mapName];
                    hasCorruption = true;
                }
            } else if (mapName === "mapdonjonslimeboss") {
                // Sur mapdonjonslimeboss, supprimer tous les monstres
                console.log(`🗑️ Suppression de tous les monstres sur mapdonjonslimeboss`);
                delete allSaves[mapName];
                hasCorruption = true;
            } else if (mapName === "map1" || mapName === "map2" || mapName === "map3") {
                // Sur les maps 1, 2 et 3, supprimer les slimes et ne garder que les corbeaux, corbeaux d'élite et maitrecorbeaux
                const invalidMonsters = mapSaves.filter(m => m.type === "slime");
                if (invalidMonsters.length > 0) {
                    console.log(`🚫 Suppression de ${invalidMonsters.length} monstres invalides sur ${mapName}`);
                    allSaves[mapName] = mapSaves.filter(m => m.type !== "slime");
                    hasCorruption = true;
                }
            } else {
                // Sur les autres maps (non reconnues), supprimer tous les monstres
                console.log(`🗑️ Suppression de tous les monstres sur la map non reconnue ${mapName}`);
                delete allSaves[mapName];
                hasCorruption = true;
            }
        });
        
        if (hasCorruption) {
            localStorage.setItem('monsterSaves', JSON.stringify(allSaves));
            console.log("✅ Données corrompues nettoyées");
        } else {
            console.log("✅ Aucune corruption détectée");
        }
        
    } catch (error) {
        console.error('Erreur lors du nettoyage:', error);
        // En cas d'erreur, supprimer complètement les données
        localStorage.removeItem('monsterSaves');
        console.log("🗑️ Toutes les données de monstres supprimées suite à une erreur");
    }
}

// Supprimer les données d'une map spécifique
function clearMonsterDataForMap(mapName) {
    if (!mapName) return;
    
    try {
        const savedData = localStorage.getItem('monsterSaves');
        if (savedData) {
            const allSaves = JSON.parse(savedData);
            delete allSaves[mapName];
            localStorage.setItem('monsterSaves', JSON.stringify(allSaves));
            console.log(`🗑️ Données de monstres supprimées pour ${mapName}`);
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
    }
}

// Supprimer toutes les données de monstres
function clearAllMonsterData() {
    try {
        localStorage.removeItem('monsterSaves');
        console.log("🗑️ Toutes les données de monstres supprimées");
    } catch (error) {
        console.error('Erreur lors de la suppression complète:', error);
    }
}

// Charger le compteur de corbeaux tués depuis localStorage
function loadCrowKillCounts() {
    try {
        const savedCounts = localStorage.getItem('crowKillCounts');
        if (savedCounts) {
            const counts = JSON.parse(savedCounts);
            if (window.crowKillCounts) {
                Object.assign(window.crowKillCounts, counts);
                console.log("📊 Compteurs de corbeaux tués chargés:", window.crowKillCounts);
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des compteurs de corbeaux:', error);
    }
}

// Nettoyage automatique au démarrage
(function() {
    console.log("🧹 Nettoyage automatique des données de monstres au démarrage");
    cleanCorruptedSaveData();
    
    // Charger les compteurs de corbeaux tués
    loadCrowKillCounts();
    
    // Forcer le nettoyage des données des maps donjon slime au démarrage
    try {
        const savedData = localStorage.getItem('monsterSaves');
        if (savedData) {
            const allSaves = JSON.parse(savedData);
            if (allSaves.mapdonjonslime) {
                console.log("🗑️ Suppression forcée des données de mapdonjonslime au démarrage");
                delete allSaves.mapdonjonslime;
                localStorage.setItem('monsterSaves', JSON.stringify(allSaves));
            }
            if (allSaves.mapdonjonslime2) {
                console.log("🗑️ Suppression forcée des données de mapdonjonslime2 au démarrage");
                delete allSaves.mapdonjonslime2;
                localStorage.setItem('monsterSaves', JSON.stringify(allSaves));
            }
        }
    } catch (error) {
        console.error('Erreur lors du nettoyage forcé:', error);
    }
})();

// Export global
window.saveMonstersForMap = saveMonstersForMap;
window.loadMonstersForMap = loadMonstersForMap;
window.cleanCorruptedSaveData = cleanCorruptedSaveData;
window.clearMonsterDataForMap = clearMonsterDataForMap;
window.clearAllMonsterData = clearAllMonsterData;

// Fonction pour nettoyer les données de monstres de mapdonjonslimeboss
window.clearBossMapMonsterData = function() {
    console.log("🗑️ Nettoyage des données de monstres pour mapdonjonslimeboss...");
    
    try {
        // Charger les données existantes
        const existingData = localStorage.getItem('monsterSaves');
        if (existingData) {
            const monsterSaves = JSON.parse(existingData);
            
            // Supprimer les données de mapdonjonslimeboss
            if (monsterSaves.mapdonjonslimeboss) {
                delete monsterSaves.mapdonjonslimeboss;
                console.log("✅ Données de monstres supprimées pour mapdonjonslimeboss");
                
                // Sauvegarder les données mises à jour
                localStorage.setItem('monsterSaves', JSON.stringify(monsterSaves));
                console.log("💾 localStorage mis à jour");
            } else {
                console.log("ℹ️ Aucune donnée de monstres trouvée pour mapdonjonslimeboss");
            }
        } else {
            console.log("ℹ️ Aucune donnée de monstres trouvée dans localStorage");
        }
    } catch (error) {
        console.error("❌ Erreur lors du nettoyage des données de monstres:", error);
    }
};

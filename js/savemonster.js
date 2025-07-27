// Système de sauvegarde des monstres avec filtrage intelligent
// Évite les erreurs du passé tout en gardant la cohérence des positions

const monsterSaves = {};

// Sauvegarder les monstres pour une map spécifique
function saveMonstersForMap(mapName) {
    if (!mapName || !window.monsters) return;
    
    console.log(`💾 Sauvegarde des monstres pour ${mapName}...`);
    
    // Filtrer les monstres selon le type de map
    let monstersToSave;
    
    if (mapName === "mapdonjonslime" || mapName.includes("slime")) {
        // Sur les maps slime, sauvegarder UNIQUEMENT les slimes
        monstersToSave = window.monsters.filter(m => m.type === "slime" && !m.isDead);
        console.log(`🔵 ${monstersToSave.length} slimes sauvegardés pour ${mapName}`);
    } else {
        // Sur les autres maps, sauvegarder UNIQUEMENT les corbeaux et maitrecorbeaux
        monstersToSave = window.monsters.filter(m => 
            (m.type === "crow" || m.type === "maitrecorbeau") && !m.isDead
        );
        console.log(`⚫ ${monstersToSave.length} corbeaux/maitrecorbeaux sauvegardés pour ${mapName}`);
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
        agilite: monster.agilite,
        intelligence: monster.intelligence
    }));
    
    // Sauvegarder dans localStorage
    try {
        monsterSaves[mapName] = saveData;
        localStorage.setItem('monsterSaves', JSON.stringify(monsterSaves));
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
        
        if (mapName === "mapdonjonslime" || mapName.includes("slime")) {
            // Sur les maps slime, charger UNIQUEMENT les slimes
            validMonsters = mapSaves.filter(m => m.type === "slime");
            console.log(`🔵 ${validMonsters.length} slimes chargés pour ${mapName}`);
        } else {
            // Sur les autres maps, charger UNIQUEMENT les corbeaux et maitrecorbeaux
            validMonsters = mapSaves.filter(m => m.type === "crow" || m.type === "maitrecorbeau");
            console.log(`⚫ ${validMonsters.length} corbeaux/maitrecorbeaux chargés pour ${mapName}`);
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
            
            if (mapName === "mapdonjonslime" || mapName.includes("slime")) {
                // Sur les maps slime, supprimer les corbeaux
                const invalidMonsters = mapSaves.filter(m => m.type !== "slime");
                if (invalidMonsters.length > 0) {
                    console.log(`🚫 Suppression de ${invalidMonsters.length} monstres invalides sur ${mapName}`);
                    allSaves[mapName] = mapSaves.filter(m => m.type === "slime");
                    hasCorruption = true;
                }
            } else {
                // Sur les autres maps, supprimer les slimes
                const invalidMonsters = mapSaves.filter(m => m.type === "slime");
                if (invalidMonsters.length > 0) {
                    console.log(`🚫 Suppression de ${invalidMonsters.length} monstres invalides sur ${mapName}`);
                    allSaves[mapName] = mapSaves.filter(m => m.type !== "slime");
                    hasCorruption = true;
                }
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

// Nettoyage automatique au démarrage
(function() {
    console.log("🧹 Nettoyage automatique des données de monstres au démarrage");
    cleanCorruptedSaveData();
})();

// Export global
window.saveMonstersForMap = saveMonstersForMap;
window.loadMonstersForMap = loadMonstersForMap;
window.cleanCorruptedSaveData = cleanCorruptedSaveData;
window.clearMonsterDataForMap = clearMonsterDataForMap;
window.clearAllMonsterData = clearAllMonsterData;

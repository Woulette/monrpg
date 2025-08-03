// Système de sauvegarde des monstres avec filtrage intelligent pour multi-personnages
// Évite les erreurs du passé tout en gardant la cohérence des positions

const monsterSaves = {};

// Sauvegarder les monstres pour une map spécifique
function saveMonstersForMap(mapName) {
    if (!mapName || !window.monsters || !window.currentCharacterId) return;
    
    // Filtrer les monstres selon le type de map
    let monstersToSave;
    
    if (mapName === "mapdonjonslime" || mapName === "mapdonjonslime2" || mapName.includes("slime")) {
        // Sur les maps slime, sauvegarder UNIQUEMENT les slimes
        monstersToSave = window.monsters.filter(m => m.type === "slime" && !m.isDead);
    } else if (mapName === "mapdonjonslimeboss") {
        // Sur mapdonjonslimeboss, NE SAUVEGARDER AUCUN MONSTRE
        monstersToSave = [];
    } else if (mapName === "map1" || mapName === "map2" || mapName === "map3") {
        // Sur les maps 1, 2 et 3, sauvegarder UNIQUEMENT les corbeaux, corbeaux d'élite et maitrecorbeaux
        monstersToSave = window.monsters.filter(m => 
            (m.type === "crow" || m.type === "corbeauelite" || m.type === "maitrecorbeau") && !m.isDead
        );
    } else {
        // Sur les autres maps (non reconnues), ne sauvegarder aucun monstre
        monstersToSave = [];
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
    
    // Sauvegarder dans localStorage avec l'ID du personnage
    try {
        const saveKey = `monrpg_monsters_${window.currentCharacterId}`;
        const existingData = localStorage.getItem(saveKey);
        let allMonsterData = {};
        
        if (existingData) {
            try {
                allMonsterData = JSON.parse(existingData);
            } catch (e) {
                console.warn('Données de monstres corrompues, réinitialisation...');
                allMonsterData = {};
            }
        }
        
        allMonsterData[mapName] = saveData;
        localStorage.setItem(saveKey, JSON.stringify(allMonsterData));
        
        // Sauvegarder aussi le compteur de corbeaux tués si c'est une map avec des corbeaux
        if (mapName === "map1" || mapName === "map2" || mapName === "map3") {
            if (typeof window.saveCrowKillCounts === 'function') {
                const counts = window.getCrowKillCounts();
                window.saveCrowKillCounts(counts);
            }
        }
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des monstres:', error);
    }
}

// Charger les monstres pour une map spécifique
function loadMonstersForMap(mapName) {
    if (!mapName || !window.currentCharacterId) {
        return false;
    }
    
    // INVALIDATION DES SAUVEGARDES OBSOLÈTES POUR MAPDONJONSLIMEBOSS
    if (mapName === "mapdonjonslimeboss") {
        const wasInvalidated = invalidateBossMapSaves();
        if (wasInvalidated) {
            return false; // Forcer la création de nouveaux monstres
        }
    }
    
    try {
        const saveKey = `monrpg_monsters_${window.currentCharacterId}`;
        const savedData = localStorage.getItem(saveKey);
        
        if (!savedData) {
            return false;
        }
        
        const allMonsterData = JSON.parse(savedData);
        const mapMonsters = allMonsterData[mapName];
        
        if (!mapMonsters || !Array.isArray(mapMonsters)) {
            return false;
        }
        
        // Vérifier le nombre de monstres selon le type de map
        let expectedCount;
        if (mapName === "mapdonjonslime" || mapName === "mapdonjonslime2") {
            expectedCount = 3; // 3 slimes pour les maps slime
        } else if (mapName === "map1" || mapName === "map2" || mapName === "map3") {
            expectedCount = 5; // 5 corbeaux pour les maps normales
        } else {
            expectedCount = 0; // Aucun monstre pour les autres maps
        }
        
        if (mapMonsters.length < expectedCount) {
            return false;
        }
        
        // Créer les monstres à partir des données sauvegardées
        window.monsters = mapMonsters.map(monsterData => {
            const monster = {
                ...monsterData,
                // Réinitialiser les propriétés qui ne doivent pas être sauvegardées
                img: null, // Utiliser 'img' au lieu de 'image'
                lastMove: 0,
                lastAttack: monsterData.lastAttack || 0,
                lastCombat: monsterData.lastCombat || 0,
                stuckSince: monsterData.stuckSince || 0,
                lastPatrol: monsterData.lastPatrol || 0,
                deathTime: monsterData.deathTime || 0
            };
            
            return monster;
        });
        
        // VÉRIFICATION SPÉCIALE POUR MAPDONJONSLIMEBOSS
        if (mapName === "mapdonjonslimeboss") {
            const hasSlimeBoss = window.monsters.some(m => m.type === 'slimeboss');
            if (!hasSlimeBoss) {
                if (typeof window.spawnSlimeBossOnBossMap === 'function') {
                    window.spawnSlimeBossOnBossMap();
                } else {
                }
            }
        }
        
        // Assigner les images après avoir créé tous les monstres
        if (typeof window.assignMonsterImages === 'function') {
            window.assignMonsterImages();
        } else {
            console.warn('⚠️ Fonction assignMonsterImages non disponible');
        }
        
        // Charger les compteurs de corbeaux tués
        if (mapName === "map1" || mapName === "map2" || mapName === "map3") {
            if (typeof window.getCrowKillCounts === 'function') {
                const counts = window.getCrowKillCounts();
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des monstres:', error);
        
        // Nettoyer les données corrompues
        cleanCorruptedSaveData();
        return false;
    }
}

// Nettoyer les données corrompues
function cleanCorruptedSaveData() {
    if (!window.currentCharacterId) return;
    
    try {
        // Supprimer toutes les données de monstres pour ce personnage
        localStorage.removeItem(`monrpg_monsters_${window.currentCharacterId}`);
        localStorage.removeItem(`monrpg_crowKillCounts_${window.currentCharacterId}`);
        
        // Supprimer aussi les anciennes clés sans ID de personnage (migration)
        localStorage.removeItem('monsterSaves');
        localStorage.removeItem('crowKillCounts');
        
    } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error);
    }
}

// Supprimer les données de monstres pour une map spécifique
function clearMonsterDataForMap(mapName) {
    if (!mapName || !window.currentCharacterId) return;
    
    try {
        const saveKey = `monrpg_monsters_${window.currentCharacterId}`;
        const existingData = localStorage.getItem(saveKey);
        
        if (existingData) {
            const allMonsterData = JSON.parse(existingData);
            delete allMonsterData[mapName];
            localStorage.setItem(saveKey, JSON.stringify(allMonsterData));
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
    }
}

// Supprimer toutes les données de monstres
function clearAllMonsterData() {
    if (!window.currentCharacterId) return;
    
    try {
        localStorage.removeItem(`monrpg_monsters_${window.currentCharacterId}`);
        localStorage.removeItem(`monrpg_crowKillCounts_${window.currentCharacterId}`);
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
    }
}

// Charger les compteurs de corbeaux tués
function loadCrowKillCounts() {
    if (!window.currentCharacterId) return;
    
    try {
        const crowKey = `monrpg_crowKillCounts_${window.currentCharacterId}`;
        const crowData = localStorage.getItem(crowKey);
        
        if (crowData) {
            window.crowKillCounts = JSON.parse(crowData);
        } else {
            window.crowKillCounts = { map1: 0, map2: 0, map3: 0 };
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement des compteurs:', error);
        window.crowKillCounts = { map1: 0, map2: 0, map3: 0 };
    }
}

// Fonction pour forcer le nettoyage complet des données de monstres
window.forceCleanMonsterData = function() {
    
    // Supprimer toutes les clés liées aux monstres
    Object.keys(localStorage).forEach(key => {
        if (key.includes('monster') || key.includes('crowKillCounts')) {
            localStorage.removeItem(key);
        }
    });
    
};

// Fonction pour invalider les sauvegardes obsolètes de mapdonjonslimeboss
function invalidateBossMapSaves() {
    if (!window.currentCharacterId) {
        return;
    }
    
    try {
        const saveKey = `monrpg_monsters_${window.currentCharacterId}`;
        const savedData = localStorage.getItem(saveKey);
        
        if (savedData) {
            const allMonsterData = JSON.parse(savedData);
            
            // Vérifier si mapdonjonslimeboss existe et ne contient pas de SlimeBoss
            if (allMonsterData.mapdonjonslimeboss) {
                const hasSlimeBoss = allMonsterData.mapdonjonslimeboss.some(m => m.type === 'slimeboss');
                
                if (!hasSlimeBoss) {
                    delete allMonsterData.mapdonjonslimeboss;
                    localStorage.setItem(saveKey, JSON.stringify(allMonsterData));
                    return true; // Indique qu'une sauvegarde a été invalidée
                }
            }
        }
        
        return false; // Aucune sauvegarde invalidée
    } catch (error) {
        console.error('❌ Erreur lors de l\'invalidation des sauvegardes:', error);
        return false;
    }
}

// Exporter les fonctions
window.saveMonstersForMap = saveMonstersForMap;
window.loadMonstersForMap = loadMonstersForMap;
window.clearMonsterDataForMap = clearMonsterDataForMap;
window.clearAllMonsterData = clearAllMonsterData;
window.loadCrowKillCounts = loadCrowKillCounts;
window.invalidateBossMapSaves = invalidateBossMapSaves;

// js/dungeon-progression.js
// Système de progression du donjon slime

// État de la progression du donjon
window.dungeonProgression = {
    mapdonjonslime: {
        slimesKilled: 0,
        totalSlimes: 5,
        portalUnlocked: false,
        slimesSpawned: 0 // Nouveau: compter les slimes créés
    },
    mapdonjonslime2: {
        slimesKilled: 0,
        totalSlimes: 7,
        decorRemoved: false,
        slimesSpawned: 0
    }
};

// FONCTION RADICALE : Réinitialiser la progression à chaque entrée dans le donjon
window.resetDungeonProgressionOnEntry = function() {
    console.log("🔄 RÉINITIALISATION RADICALE de la progression du donjon !");
    console.log("⚠️ Chaque entrée dans le donjon force le joueur à refaire toutes les étapes");
    
    // Remettre à zéro tous les compteurs pour mapdonjonslime
    window.dungeonProgression.mapdonjonslime.slimesKilled = 0;
    window.dungeonProgression.mapdonjonslime.slimesSpawned = 0;
    window.dungeonProgression.mapdonjonslime.portalUnlocked = false;
    
    // Remettre à zéro tous les compteurs pour mapdonjonslime2
    window.dungeonProgression.mapdonjonslime2.slimesKilled = 0;
    window.dungeonProgression.mapdonjonslime2.slimesSpawned = 0;
    window.dungeonProgression.mapdonjonslime2.decorRemoved = false;
    
    // NETTOYER les données des monstres du donjon pour forcer le respawn
    if (typeof window.clearMonsterDataForMap === "function") {
        window.clearMonsterDataForMap("mapdonjonslime");
        window.clearMonsterDataForMap("mapdonjonslime2");
        console.log("🧹 Données des monstres du donjon nettoyées - respawn forcé");
    }
    
    // FORCER le nettoyage des données du donjon dans localStorage
    try {
        const savedData = localStorage.getItem('monsterSaves');
        if (savedData) {
            const allSaves = JSON.parse(savedData);
            if (allSaves.mapdonjonslime) {
                delete allSaves.mapdonjonslime;
                localStorage.setItem('monsterSaves', JSON.stringify(allSaves));
                console.log("🗑️ Données mapdonjonslime supprimées du localStorage");
            }
            if (allSaves.mapdonjonslime2) {
                delete allSaves.mapdonjonslime2;
                localStorage.setItem('monsterSaves', JSON.stringify(allSaves));
                console.log("🗑️ Données mapdonjonslime2 supprimées du localStorage");
            }
        }
    } catch (error) {
        console.error('Erreur lors du nettoyage localStorage:', error);
    }
    
    console.log("✅ Progression réinitialisée : 0/5 slimes tués sur mapdonjonslime, 0/7 slimes tués sur mapdonjonslime2");
    console.log("📊 Nouvel état:", window.dungeonProgression);
};

// Fonction appelée quand un slime est créé
window.onSlimeSpawned = function() {
    if (window.currentMap === "mapdonjonslime") {
        window.dungeonProgression.mapdonjonslime.slimesSpawned++;
        console.log(`🐸 Slime créé sur mapdonjonslime. Total créés: ${window.dungeonProgression.mapdonjonslime.slimesSpawned}`);
    } else if (window.currentMap === "mapdonjonslime2") {
        window.dungeonProgression.mapdonjonslime2.slimesSpawned++;
        console.log(`🐸 Slime créé sur mapdonjonslime2. Total créés: ${window.dungeonProgression.mapdonjonslime2.slimesSpawned}`);
    }
};

// Fonction appelée quand un slime est tué
window.onSlimeKilled = function() {
    if (window.currentMap === "mapdonjonslime") {
        window.dungeonProgression.mapdonjonslime.slimesKilled++;
        console.log(`🗡️ Slime tué sur mapdonjonslime. Total tués: ${window.dungeonProgression.mapdonjonslime.slimesKilled}`);
        
        // Vérifier si on peut débloquer le portail
        if (window.dungeonProgression.mapdonjonslime.slimesKilled >= 5 && !window.dungeonProgression.mapdonjonslime.portalUnlocked) {
            window.dungeonProgression.mapdonjonslime.portalUnlocked = true;
            console.log("🚪 Portail 12008 débloqué ! Vous pouvez maintenant accéder à mapdonjonslime2");
        }
    } else if (window.currentMap === "mapdonjonslime2") {
        window.dungeonProgression.mapdonjonslime2.slimesKilled++;
        console.log(`🗡️ Slime tué sur mapdonjonslime2. Total tués: ${window.dungeonProgression.mapdonjonslime2.slimesKilled}`);
        
        // Vérifier si on peut retirer le décor
        if (window.dungeonProgression.mapdonjonslime2.slimesKilled >= 7 && !window.dungeonProgression.mapdonjonslime2.decorRemoved) {
            window.dungeonProgression.mapdonjonslime2.decorRemoved = true;
            console.log("🏗️ Décor retiré ! Les portails 15408 et 15608 sont maintenant accessibles");
            // Appeler la fonction pour retirer le décor
            window.removeMapdonjonslime2Decor();
        }
    }
};

// Fonction appelée quand un slime est tué
window.checkDungeonProgression = function() {
    const currentMap = window.currentMap;
    
    if (currentMap === "mapdonjonslime") {
        checkMapdonjonslimeProgression();
    } else if (currentMap === "mapdonjonslime2") {
        checkMapdonjonslime2Progression();
    }
};

// Vérifier la progression sur mapdonjonslime
function checkMapdonjonslimeProgression() {
    // Utiliser les compteurs sauvegardés au lieu de compter dans le tableau monsters
    const slimesKilled = window.dungeonProgression.mapdonjonslime.slimesKilled;
    const slimesSpawned = window.dungeonProgression.mapdonjonslime.slimesSpawned;
    
    console.log(`🗡️ Progression mapdonjonslime: ${slimesKilled}/${slimesSpawned} slimes tués`);
    
    // Débloquer le portail si tous les slimes sont tués
    if (slimesKilled >= 5 && !window.dungeonProgression.mapdonjonslime.portalUnlocked) {
        window.dungeonProgression.mapdonjonslime.portalUnlocked = true;
        console.log("🚪 Portail 12008 débloqué ! Vous pouvez maintenant accéder à mapdonjonslime2");
    }
}

// Vérifier la progression sur mapdonjonslime2
function checkMapdonjonslime2Progression() {
    // Utiliser les compteurs sauvegardés au lieu de compter dans le tableau monsters
    const slimesKilled = window.dungeonProgression.mapdonjonslime2.slimesKilled;
    const slimesSpawned = window.dungeonProgression.mapdonjonslime2.slimesSpawned;
    
    console.log(`🗡️ Progression mapdonjonslime2: ${slimesKilled}/${slimesSpawned} slimes tués`);
    
    // Retirer le décor si tous les slimes sont tués
    if (slimesKilled >= 7 && !window.dungeonProgression.mapdonjonslime2.decorRemoved) {
        window.dungeonProgression.mapdonjonslime2.decorRemoved = true;
        console.log("🏗️ Décor retiré ! Les portails 15408 et 15608 sont maintenant accessibles");
        // Appeler la fonction pour retirer le décor
        window.removeMapdonjonslime2Decor();
    }
}

// Fonction pour retirer le décor de mapdonjonslime2 (tiles 17408 et 17608)
window.removeMapdonjonslime2Decor = function() {
    console.log("🏗️ Suppression du décor de mapdonjonslime2...");
    
    // Vérifier si on est sur la bonne map
    if (window.currentMap !== "mapdonjonslime2") {
        console.log("❌ Erreur: On n'est pas sur mapdonjonslime2");
        return;
    }
    
    // Fonction interne pour effectuer la suppression
    const performRemoval = () => {
        // Vérifier si la map est chargée (utiliser window.mapData au lieu de window.currentMapData)
        if (!window.mapData || !window.mapData.layers) {
            console.log("❌ Erreur: Données de map non disponibles");
            console.log("mapData:", window.mapData);
            return false;
        }
        
        console.log("🔍 Recherche de la couche 2 (décor)...");
        console.log("Layers disponibles:", window.mapData.layers.map(l => ({ id: l.id, name: l.name })));
        
        // Trouver la couche 2 (décor) - utiliser l'index 1 car les couches commencent à 0
        const decorLayer = window.mapData.layers[1]; // Couche 2 = index 1
        if (!decorLayer || !decorLayer.data) {
            console.log("❌ Erreur: Couche décor non trouvée");
            console.log("Couches disponibles:", window.mapData.layers);
            return false;
        }
        
        console.log("✅ Couche décor trouvée:", decorLayer.name, "ID:", decorLayer.id);
        console.log("📊 Taille des données:", decorLayer.data.length);
        
        // Supprimer les tiles 17408 et 17608
        let tilesRemoved = 0;
        for (let i = 0; i < decorLayer.data.length; i++) {
            if (decorLayer.data[i] === 17408 || decorLayer.data[i] === 17608) {
                console.log(`🗑️ Suppression du tile ${decorLayer.data[i]} à l'index ${i}`);
                decorLayer.data[i] = 0; // Remplacer par un tile vide
                tilesRemoved++;
            }
        }
        
        console.log(`✅ ${tilesRemoved} tiles de décor supprimés (17408 et 17608)`);
        console.log("🚪 Les portails 15408 et 15608 sont maintenant accessibles !");
        
        // Forcer le redessinage de la map
        if (typeof window.redrawMap === "function") {
            window.redrawMap();
            console.log("🔄 Redessinage de la map effectué");
        } else {
            console.log("⚠️ Fonction redrawMap non disponible");
        }
        
        return true;
    };
    
    // Essayer immédiatement
    if (performRemoval()) {
        return;
    }
    
    // Si ça ne marche pas, attendre un peu et réessayer
    console.log("⏳ Attente des données de map...");
    setTimeout(() => {
        if (performRemoval()) {
            return;
        }
        
        // Si ça ne marche toujours pas, attendre encore plus longtemps
        console.log("⏳ Attente plus longue des données de map...");
        setTimeout(() => {
            if (performRemoval()) {
                return;
            }
            
            console.log("❌ Impossible de supprimer le décor - données de map non disponibles");
        }, 2000);
    }, 500);
};

// Fonction pour forcer la vérification de la progression (accessible depuis la console)
window.forceCheckDungeonProgression = function() {
    console.log("🔍 Vérification forcée de la progression du donjon...");
    checkMapdonjonslimeProgression();
    
    // Afficher l'état actuel
    console.log("📊 État actuel:", window.dungeonProgression);
    console.log("🚪 Portail 12008 accessible:", window.isPortal12008Accessible());
};

// Fonction pour débloquer manuellement le portail (accessible depuis la console)
window.unlockPortal12008 = function() {
    window.dungeonProgression.mapdonjonslime.portalUnlocked = true;
    window.dungeonProgression.mapdonjonslime.slimesKilled = 5;
    console.log("🔓 Portail 12008 débloqué manuellement !");
    console.log("📊 État actuel:", window.dungeonProgression);
};

// Fonction pour forcer le déblocage si tous les slimes sont morts (solution automatique)
window.forceUnlockIfAllSlimesDead = function() {
    console.log("🔍 Vérification automatique des slimes morts...");
    
    let aliveSlimes = 0;
    
    if (typeof window.monsters !== 'undefined') {
        window.monsters.forEach(monster => {
            if (monster && monster.type === "slime" && !monster.isDead && monster.hp > 0) {
                aliveSlimes++;
            }
        });
    }
    
    const slimesKilled = window.dungeonProgression.mapdonjonslime.slimesKilled;
    const slimesSpawned = window.dungeonProgression.mapdonjonslime.slimesSpawned;
    
    console.log(`📊 Slimes créés: ${slimesSpawned}, Slimes tués: ${slimesKilled}, Slimes vivants: ${aliveSlimes}`);
    
    // Si il n'y a plus de slimes vivants et qu'on a tué au moins 5 slimes, débloquer le portail
    if (aliveSlimes === 0 && slimesKilled >= 5) {
        window.dungeonProgression.mapdonjonslime.portalUnlocked = true;
        console.log("🔓 Portail 12008 débloqué automatiquement ! Tous les slimes sont morts.");
        console.log("📊 État actuel:", window.dungeonProgression);
        return true;
    }
    
    return false;
};

// Fonction pour vérifier si le portail 12008 est accessible
window.isPortal12008Accessible = function() {
    return window.dungeonProgression.mapdonjonslime.portalUnlocked;
};

// Sauvegarder la progression
window.saveDungeonProgression = function() {
    return window.dungeonProgression;
};

// Charger la progression
window.loadDungeonProgression = function(data) {
    if (data) {
        window.dungeonProgression = data;
        console.log("📁 Progression du donjon chargée:", window.dungeonProgression);
    }
};

// Vérifier automatiquement la progression au chargement de la map
window.checkDungeonProgressionOnMapLoad = function() {
    if (window.currentMap === "mapdonjonslime") {
        // SOLUTION RADICALE : Réinitialiser la progression à chaque entrée dans le donjon
        window.resetDungeonProgressionOnEntry();
        
        // Attendre un peu que les monstres soient chargés
        setTimeout(() => {
            checkMapdonjonslimeProgression();
            
            // FORCER le respawn des monstres après le nettoyage
            if (typeof window.loadMonstersForMap === "function") {
                setTimeout(() => {
                    window.loadMonstersForMap("mapdonjonslime");
                    console.log("🔄 Respawning forcé des monstres du donjon");
                }, 500);
            }
        }, 1000);
    } else if (window.currentMap === "mapdonjonslime2") {
        // SOLUTION RADICALE : Réinitialiser la progression à chaque entrée dans le donjon
        window.resetDungeonProgressionOnEntry();
        
        // Attendre un peu que les monstres soient chargés
        setTimeout(() => {
            checkMapdonjonslime2Progression();
            
            // FORCER le respawn des monstres après le nettoyage
            if (typeof window.loadMonstersForMap === "function") {
                setTimeout(() => {
                    window.loadMonstersForMap("mapdonjonslime2");
                    console.log("🔄 Respawning forcé des monstres du donjon niveau 2");
                }, 500);
            }
        }, 1000);
    }
};

// Fonction pour corriger l'état actuel (solution pour les slimes déjà tués)
window.fixCurrentDungeonState = function() {
    console.log("🔧 Correction de l'état actuel du donjon...");
    
    // Si on est sur mapdonjonslime et qu'il n'y a plus de slimes vivants
    if (window.currentMap === "mapdonjonslime") {
        let aliveSlimes = 0;
        
        if (typeof window.monsters !== 'undefined') {
            window.monsters.forEach(monster => {
                if (monster && monster.type === "slime" && !monster.isDead && monster.hp > 0) {
                    aliveSlimes++;
                }
            });
        }
        
        // Si il n'y a plus de slimes vivants, on suppose que tous les 5 slimes ont été tués
        if (aliveSlimes === 0) {
            window.dungeonProgression.mapdonjonslime.slimesSpawned = 5;
            window.dungeonProgression.mapdonjonslime.slimesKilled = 5;
            window.dungeonProgression.mapdonjonslime.portalUnlocked = true;
            
            console.log("🔧 État corrigé: 5 slimes créés, 5 slimes tués, portail débloqué");
            console.log("📊 État actuel:", window.dungeonProgression);
            return true;
        }
    }
    
    return false;
};

// Fonction pour forcer le retrait du décor de mapdonjonslime2 (accessible depuis la console)
window.forceRemoveMapdonjonslime2Decor = function() {
    console.log("🔧 Forçage du retrait du décor de mapdonjonslime2...");
    
    // Marquer le décor comme retiré
    window.dungeonProgression.mapdonjonslime2.decorRemoved = true;
    
    // Appeler la fonction de retrait
    window.removeMapdonjonslime2Decor();
    
    console.log("✅ Décor forcément retiré de mapdonjonslime2");
};

// Fonction alternative pour supprimer le décor en rechargeant la map
window.forceRemoveMapdonjonslime2DecorAlternative = function() {
    console.log("🔧 Méthode alternative: Suppression du décor de mapdonjonslime2...");
    
    if (window.currentMap !== "mapdonjonslime2") {
        console.log("❌ Erreur: On n'est pas sur mapdonjonslime2");
        return;
    }
    
    // Marquer le décor comme retiré
    window.dungeonProgression.mapdonjonslime2.decorRemoved = true;
    
    // Forcer le rechargement de la map avec les modifications
    if (typeof window.loadMap === "function") {
        console.log("🔄 Rechargement de la map avec modifications...");
        
        // Sauvegarder la position actuelle du joueur
        const playerX = window.player ? window.player.x : 0;
        const playerY = window.player ? window.player.y : 0;
        
        // Recharger la map
        window.loadMap("mapdonjonslime2");
        
        // Restaurer la position du joueur
        setTimeout(() => {
            if (window.player) {
                window.player.x = playerX;
                window.player.y = playerY;
                window.player.px = playerX * (window.TILE_SIZE || 32);
                window.player.py = playerY * (window.TILE_SIZE || 32);
            }
            
            // Appliquer les modifications après le rechargement
            setTimeout(() => {
                window.removeMapdonjonslime2Decor();
            }, 1000);
        }, 500);
    } else {
        console.log("❌ Fonction loadMap non disponible");
    }
};

// Fonction de debug pour vérifier la présence des tiles 17408 et 17608
window.debugMapdonjonslime2Tiles = function() {
    console.log("🔍 DEBUG: Vérification des tiles 17408 et 17608 sur mapdonjonslime2...");
    
    if (window.currentMap !== "mapdonjonslime2") {
        console.log("❌ Erreur: On n'est pas sur mapdonjonslime2");
        return;
    }
    
    if (!window.mapData || !window.mapData.layers) {
        console.log("❌ Erreur: Données de map non disponibles");
        return;
    }
    
    const decorLayer = window.mapData.layers[1]; // Couche 2
    if (!decorLayer || !decorLayer.data) {
        console.log("❌ Erreur: Couche décor non trouvée");
        return;
    }
    
    let tile17408Count = 0;
    let tile17608Count = 0;
    let tile17408Positions = [];
    let tile17608Positions = [];
    
    for (let i = 0; i < decorLayer.data.length; i++) {
        if (decorLayer.data[i] === 17408) {
            tile17408Count++;
            const x = i % 25; // Largeur de la map
            const y = Math.floor(i / 25); // Hauteur de la map
            tile17408Positions.push({ x, y, index: i });
        }
        if (decorLayer.data[i] === 17608) {
            tile17608Count++;
            const x = i % 25; // Largeur de la map
            const y = Math.floor(i / 25); // Hauteur de la map
            tile17608Positions.push({ x, y, index: i });
        }
    }
    
    console.log(`📊 Résultats:`);
    console.log(`- Tile 17408: ${tile17408Count} occurrences`);
    console.log(`- Tile 17608: ${tile17608Count} occurrences`);
    
    if (tile17408Positions.length > 0) {
        console.log(`📍 Positions du tile 17408:`, tile17408Positions);
    }
    if (tile17608Positions.length > 0) {
        console.log(`📍 Positions du tile 17608:`, tile17608Positions);
    }
    
    if (tile17408Count === 0 && tile17608Count === 0) {
        console.log("✅ Les tiles 17408 et 17608 ont déjà été supprimés !");
    }
};

console.log("🗺️ Système de progression du donjon slime chargé");
console.log("🔄 SYSTÈME RADICAL ACTIVÉ : La progression se réinitialise à chaque entrée dans le donjon");
console.log("🔧 Commandes disponibles:");
console.log("resetDungeonProgressionOnEntry() - Réinitialiser manuellement la progression");
console.log("fixCurrentDungeonState() - Corriger l'état actuel (pour les slimes déjà tués)");
console.log("forceCheckDungeonProgression() - Vérifier la progression");
console.log("forceUnlockIfAllSlimesDead() - Débloquer automatiquement si tous les slimes sont morts");
console.log("unlockPortal12008() - Débloquer manuellement le portail");
console.log("removeMapdonjonslime2Decor() - Retirer manuellement le décor de mapdonjonslime2");
console.log("forceRemoveMapdonjonslime2Decor() - Forcer le retrait du décor de mapdonjonslime2");
console.log("forceRemoveMapdonjonslime2DecorAlternative() - Méthode alternative pour retirer le décor");
console.log("debugMapdonjonslime2Tiles() - Debug: vérifier la présence des tiles 17408 et 17608"); 
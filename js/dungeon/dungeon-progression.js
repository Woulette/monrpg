// Système de progression du donjon slime - Core
// Nettoyé et validé le 30/07/2025 - par Cursor

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

// Réinitialiser la progression à chaque entrée dans le donjon
window.resetDungeonProgressionOnEntry = function() {
    // Remettre à zéro tous les compteurs pour mapdonjonslime
    window.dungeonProgression.mapdonjonslime.slimesKilled = 0;
    window.dungeonProgression.mapdonjonslime.slimesSpawned = 0;
    window.dungeonProgression.mapdonjonslime.portalUnlocked = false;
    
    // Remettre à zéro tous les compteurs pour mapdonjonslime2
    window.dungeonProgression.mapdonjonslime2.slimesKilled = 0;
    window.dungeonProgression.mapdonjonslime2.slimesSpawned = 0;
    window.dungeonProgression.mapdonjonslime2.decorRemoved = false;
    
    // Réinitialiser l'état de victoire du boss slime
    window.slimeBossDefeated = false;
    
    // NETTOYER les données des monstres du donjon pour forcer le respawn
    if (typeof window.clearMonsterDataForMap === "function") {
        window.clearMonsterDataForMap("mapdonjonslime");
        window.clearMonsterDataForMap("mapdonjonslime2");
    }
    
    // FORCER le nettoyage des données du donjon dans localStorage
    try {
        const savedData = localStorage.getItem('monsterSaves');
        if (savedData) {
            const allSaves = JSON.parse(savedData);
            if (allSaves.mapdonjonslime) {
                delete allSaves.mapdonjonslime;
                localStorage.setItem('monsterSaves', JSON.stringify(allSaves));
            }
            if (allSaves.mapdonjonslime2) {
                delete allSaves.mapdonjonslime2;
                localStorage.setItem('monsterSaves', JSON.stringify(allSaves));
            }
        }
    } catch (error) {
        // Erreur silencieuse
    }
};

// Fonction appelée quand un slime est créé
window.onSlimeSpawned = function() {
    if (window.currentMap === "mapdonjonslime") {
        window.dungeonProgression.mapdonjonslime.slimesSpawned++;
    } else if (window.currentMap === "mapdonjonslime2") {
        window.dungeonProgression.mapdonjonslime2.slimesSpawned++;
    }
};

// Fonction appelée quand un slime est tué
window.onSlimeKilled = function() {
    if (window.currentMap === "mapdonjonslime") {
        window.dungeonProgression.mapdonjonslime.slimesKilled++;
        
        // Vérifier si on peut débloquer le portail
        if (window.dungeonProgression.mapdonjonslime.slimesKilled >= 5 && !window.dungeonProgression.mapdonjonslime.portalUnlocked) {
            window.dungeonProgression.mapdonjonslime.portalUnlocked = true;
        }
    } else if (window.currentMap === "mapdonjonslime2") {
        window.dungeonProgression.mapdonjonslime2.slimesKilled++;
        
        // Vérifier si on peut retirer le décor
        if (window.dungeonProgression.mapdonjonslime2.slimesKilled >= 7 && !window.dungeonProgression.mapdonjonslime2.decorRemoved) {
            window.dungeonProgression.mapdonjonslime2.decorRemoved = true;
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
    const slimesKilled = window.dungeonProgression.mapdonjonslime.slimesKilled;
    const slimesSpawned = window.dungeonProgression.mapdonjonslime.slimesSpawned;
    
    // Débloquer le portail si tous les slimes sont tués
    if (slimesKilled >= 5 && !window.dungeonProgression.mapdonjonslime.portalUnlocked) {
        window.dungeonProgression.mapdonjonslime.portalUnlocked = true;
    }
}

// Vérifier la progression sur mapdonjonslime2
function checkMapdonjonslime2Progression() {
    const slimesKilled = window.dungeonProgression.mapdonjonslime2.slimesKilled;
    const slimesSpawned = window.dungeonProgression.mapdonjonslime2.slimesSpawned;
    
    // Retirer le décor si tous les slimes sont tués
    if (slimesKilled >= 7 && !window.dungeonProgression.mapdonjonslime2.decorRemoved) {
        window.dungeonProgression.mapdonjonslime2.decorRemoved = true;
        // Appeler la fonction pour retirer le décor
        window.removeMapdonjonslime2Decor();
    }
}

// Fonction pour retirer le décor de mapdonjonslime2 (tiles 17408 et 17608)
window.removeMapdonjonslime2Decor = function() {
    // Vérifier si on est sur la bonne map
    if (window.currentMap !== "mapdonjonslime2") {
        return;
    }
    
    // Fonction interne pour effectuer la suppression
    const performRemoval = () => {
        // Vérifier si la map est chargée
        if (!window.mapData || !window.mapData.layers) {
            return false;
        }
        
        // Trouver la couche 2 (décor) - utiliser l'index 1 car les couches commencent à 0
        const decorLayer = window.mapData.layers[1]; // Couche 2 = index 1
        if (!decorLayer || !decorLayer.data) {
            return false;
        }
        
        // Supprimer les tiles 17408 et 17608
        let tilesRemoved = 0;
        for (let i = 0; i < decorLayer.data.length; i++) {
            if (decorLayer.data[i] === 17408 || decorLayer.data[i] === 17608) {
                decorLayer.data[i] = 0; // Remplacer par un tile vide
                tilesRemoved++;
            }
        }
        
        // Forcer le redessinage de la map
        if (typeof window.redrawMap === "function") {
            window.redrawMap();
        }
        
        return true;
    };
    
    // Essayer immédiatement
    if (performRemoval()) {
        return;
    }
    
    // Si ça ne marche pas, attendre un peu et réessayer
    setTimeout(() => {
        if (performRemoval()) {
            return;
        }
        
        // Si ça ne marche toujours pas, attendre encore plus longtemps
        setTimeout(() => {
            performRemoval();
        }, 2000);
    }, 500);
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
    }
};

// Vérifier automatiquement la progression au chargement de la map
window.checkDungeonProgressionOnMapLoad = function() {
    if (window.currentMap === "mapdonjonslime") {
        // Réinitialiser la progression à chaque entrée dans le donjon
        window.resetDungeonProgressionOnEntry();
        
        // Attendre un peu que les monstres soient chargés
        setTimeout(() => {
            checkMapdonjonslimeProgression();
            
            // Forcer le respawn des monstres après le nettoyage
            if (typeof window.loadMonstersForMap === "function") {
                setTimeout(() => {
                    window.loadMonstersForMap("mapdonjonslime");
                }, 500);
            }
        }, 1000);
    } else if (window.currentMap === "mapdonjonslime2") {
        // Réinitialiser la progression à chaque entrée dans le donjon
        window.resetDungeonProgressionOnEntry();
        
        // Attendre un peu que les monstres soient chargés
        setTimeout(() => {
            checkMapdonjonslime2Progression();
            
            // Forcer le respawn des monstres après le nettoyage
            if (typeof window.loadMonstersForMap === "function") {
                setTimeout(() => {
                    window.loadMonstersForMap("mapdonjonslime2");
                }, 500);
            }
        }, 1000);
    }
};



 
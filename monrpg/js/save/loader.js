// js/save/loader.js
// Chargeur des modules de sauvegarde modulaire
// Responsabilité : Charger tous les modules dans le bon ordre

// Fonction pour charger un script de manière synchrone
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Chargement séquentiel des modules de sauvegarde
async function loadSaveModules() {
    try {
        
        // Charger les modules dans l'ordre (dépendances)
        await loadScript('js/save/saveUtils.js');
        
        await loadScript('js/save/savePlayer.js');
        
        await loadScript('js/save/saveGameState.js');
        
        await loadScript('js/save/saveInventory.js');
        
        await loadScript('js/save/saveQuests.js');
        
        await loadScript('js/save/saveManager.js');
        
        
        // Initialiser le système de sauvegarde
        if (window.saveManager) {
            setTimeout(() => {
                window.saveManager.init();
            }, 500);
        }
        
    } catch (error) {
        console.error("❌ Erreur lors du chargement des modules de sauvegarde:", error);
    }
}

// Charger les modules quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSaveModules);
} else {
    loadSaveModules();
}

// Fonctions de test pour le système de sauvegarde
window.testSaveModules = function() {
    
    // Test du système de quêtes
    if (window.questsSaveManager) {
        
        // Test avec le personnage actuel
        if (window.currentCharacterId) {
            const info = window.questsSaveManager.getQuestsInfo(window.currentCharacterId);
        }
    } else {
    }
    
    // Test du système de sauvegarde principal
    if (window.saveManager) {
    } else {
    }
    
};

// Fonction de diagnostic complète
window.diagnoseSaveSystem = function() {
    
    // Diagnostic des quêtes
    if (typeof window.diagnoseQuestsSystem === 'function') {
        window.diagnoseQuestsSystem();
    }
    
    // Test des modules
    window.testSaveModules();
    
};

// Fonction pour migrer toutes les sauvegardes
window.migrateAllSaves = function() {
    
    // Migrer les sauvegardes existantes
    if (window.saveUtils && typeof window.saveUtils.migrateOldSaves === 'function') {
        window.saveUtils.migrateOldSaves();
    }
    
};

// Fonction de test complète pour l'isolation des quêtes
window.testCompleteQuestsIsolation = function() {
    
    // Test 1: Vérifier l'état initial
    
    if (typeof window.diagnoseQuestsSystem === 'function') {
        window.diagnoseQuestsSystem();
    }
    
    // Test 2: Accepter une quête
    
    if (typeof window.acceptQuest === 'function') {
        window.acceptQuest('crowHunt');
    }
    
    // Test 3: Vérifier l'état après acceptation
    
    if (typeof window.diagnoseQuestsSystem === 'function') {
        window.diagnoseQuestsSystem();
    }
    
    // Test 4: Simuler un changement de personnage
    
    if (typeof window.switchCharacterQuests === 'function') {
        const testCharacterId = 'test_' + Date.now();
        window.switchCharacterQuests(testCharacterId);
    }
    
    // Test 5: Vérifier que les quêtes sont réinitialisées
    
    if (typeof window.diagnoseQuestsSystem === 'function') {
        window.diagnoseQuestsSystem();
    }
    
    // Test 6: Vérifier que Papi1 propose bien la quête
    
    if (typeof window.isQuestAvailable === 'function') {
        const isAvailable = window.isQuestAvailable('crowHunt');
    }
    
};

// Fonction de test pour l'isolation du compteur de corbeaux
window.testCrowKillCountsIsolation = function() {
    
    // Test 1: Vérifier l'état initial
    
    if (typeof window.diagnoseCrowKillCounts === 'function') {
        window.diagnoseCrowKillCounts();
    }
    
    // Test 2: Simuler un kill de corbeau
    
    if (typeof window.incrementCrowKillCount === 'function') {
        const newCount = window.incrementCrowKillCount('map1');
    }
    
    // Test 3: Vérifier l'état après incrémentation
    
    if (typeof window.diagnoseCrowKillCounts === 'function') {
        window.diagnoseCrowKillCounts();
    }
    
    // Test 4: Simuler un changement de personnage
    const originalCharacterId = window.currentCharacterId;
    const testCharacterId = 'test_crow_' + Date.now();
    window.currentCharacterId = testCharacterId;
    
    // Test 5: Vérifier que le compteur est réinitialisé
    
    if (typeof window.diagnoseCrowKillCounts === 'function') {
        window.diagnoseCrowKillCounts();
    }
    
    // Test 6: Restaurer le personnage original
    
    window.currentCharacterId = originalCharacterId;
    if (typeof window.diagnoseCrowKillCounts === 'function') {
        window.diagnoseCrowKillCounts();
    }
    
};

// Fonction de test pour forcer le spawn du SlimeBoss
window.testSlimeBossSpawn = function() {
    
    // Test 1: Vérifier l'état initial
    
    if (typeof window.diagnoseSlimeBoss === 'function') {
        window.diagnoseSlimeBoss();
    }
    
    // Test 2: Vérifier la map actuelle
    
    if (window.currentMap !== 'mapdonjonslimeboss') {
        return;
    }
    
    // Test 3: Forcer le spawn du boss
    
    if (typeof window.spawnSlimeBossOnBossMap === 'function') {
        const boss = window.spawnSlimeBossOnBossMap();
        if (boss) {
        } else {
        }
    } else {
    }
    
    // Test 4: Vérifier l'état final
    
    if (typeof window.diagnoseSlimeBoss === 'function') {
        window.diagnoseSlimeBoss();
    }
    
};

// Fonction de test complète pour diagnostiquer le SlimeBoss
window.testSlimeBossComplete = function() {
    
    // Test 1: Vérifier l'état initial
    
    if (window.currentMap !== 'mapdonjonslimeboss') {
        return;
    }
    
    // Test 2: Vérifier les fonctions disponibles
    
    if (typeof window.spawnSlimeBossOnBossMap === 'function') {
        const boss = window.spawnSlimeBossOnBossMap();
        if (boss) {
        } else {
        }
    }
    
    // Test 4: Vérifier l'état après spawn
    
    if (window.monsters && window.monsters.length > 0) {
        const slimeBosses = window.monsters.filter(m => m.type === 'slimeboss');
    }
    
    // Test 5: Forcer l'assignation des images
    
    if (typeof window.assignMonsterImages === 'function') {
        window.assignMonsterImages();
    }
    
    // Test 6: Vérifier l'état final
    setTimeout(() => {
        if (window.monsters && window.monsters.length > 0) {
            const slimeBosses = window.monsters.filter(m => m.type === 'slimeboss');
        }
    }, 1000);
};

// Fonction de test pour vérifier la correction des sauvegardes obsolètes
window.testBossMapCorrection = function() {
    
    // Test 1: Vérifier l'état initial
    
    if (window.currentMap !== 'mapdonjonslimeboss') {
        return;
    }
    
    // Test 2: Invalider les sauvegardes obsolètes
    
    if (typeof window.invalidateBossMapSaves === 'function') {
        const wasInvalidated = window.invalidateBossMapSaves();
    }
    
    // Test 3: S'assurer que le boss existe
    
    if (typeof window.ensureSlimeBossExists === 'function') {
        const bossExists = window.ensureSlimeBossExists();
    }
    
    // Test 4: Diagnostic final
    
    if (typeof window.diagnoseSlimeBoss === 'function') {
        window.diagnoseSlimeBoss();
    }
    
};

// Fonction pour forcer la recréation complète de la map boss
window.forceRecreateBossMap = function() {
    
    if (window.currentMap !== 'mapdonjonslimeboss') {
        return;
    }
    
    // Étape 1: Supprimer tous les monstres existants
    
    if (window.monsters) {
        window.monsters.length = 0;
    }
    
    // Étape 2: Invalider les sauvegardes
    
    if (typeof window.invalidateBossMapSaves === 'function') {
        window.invalidateBossMapSaves();
    }
    
    // Étape 3: Forcer la création du boss
    
    if (typeof window.spawnSlimeBossOnBossMap === 'function') {
        const boss = window.spawnSlimeBossOnBossMap();
        if (boss) {
        } else {
        }
    }
    
    // Étape 4: Assigner les images
    
    if (typeof window.assignMonsterImages === 'function') {
        window.assignMonsterImages();
    }
    
    // Étape 5: Diagnostic final
    setTimeout(() => {
        if (typeof window.diagnoseSlimeBoss === 'function') {
            window.diagnoseSlimeBoss();
        }
    }, 500);
    
};

// Fonction de test pour vérifier le rendu du SlimeBoss
window.testSlimeBossRendering = function() {
    
    // Test 1: Vérifier l'état initial
    
    if (window.currentMap !== 'mapdonjonslimeboss') {
        return;
    }
    
    // Test 2: Vérifier que le boss existe
    
    if (window.monsters && window.monsters.length > 0) {
        const boss = window.monsters.find(m => m.type === 'slimeboss');
        if (boss) {
        } else {
        }
    } else {
    }
    
    // Test 3: Vérifier les images
    
    if (typeof window.forceRecreateBossMap === 'function') {
        window.forceRecreateBossMap();
    }
    
};
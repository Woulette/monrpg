// js/save/loader.js
// Chargeur des modules de sauvegarde modulaire
// Responsabilité : Charger tous les modules dans le bon ordre

console.log('🔄 Chargement du système de sauvegarde modulaire...');

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
        console.log("🔄 Chargement des modules de sauvegarde...");
        
        // Charger les modules dans l'ordre (dépendances)
        await loadScript('js/save/saveUtils.js');
        console.log("✅ saveUtils.js chargé");
        
        await loadScript('js/save/savePlayer.js');
        console.log("✅ savePlayer.js chargé");
        
        await loadScript('js/save/saveGameState.js');
        console.log("✅ saveGameState.js chargé");
        
        await loadScript('js/save/saveInventory.js');
        console.log("✅ saveInventory.js chargé");
        
        await loadScript('js/save/saveQuests.js');
        console.log("✅ saveQuests.js chargé");
        
        await loadScript('js/save/saveManager.js');
        console.log("✅ saveManager.js chargé");
        
        console.log("✅ Tous les modules de sauvegarde chargés avec succès");
        
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
    console.log('🧪 === TEST DES MODULES DE SAUVEGARDE ===');
    
    // Test du système de quêtes
    if (window.questsSaveManager) {
        console.log('✅ Module saveQuests.js chargé');
        
        // Test avec le personnage actuel
        if (window.currentCharacterId) {
            const info = window.questsSaveManager.getQuestsInfo(window.currentCharacterId);
            console.log('📊 Infos quêtes:', info);
        }
    } else {
        console.log('❌ Module saveQuests.js non chargé');
    }
    
    // Test du système de sauvegarde principal
    if (window.saveManager) {
        console.log('✅ Module saveManager.js chargé');
    } else {
        console.log('❌ Module saveManager.js non chargé');
    }
    
    console.log('🧪 === FIN DES TESTS ===');
};

// Fonction de diagnostic complète
window.diagnoseSaveSystem = function() {
    console.log('🔍 === DIAGNOSTIC COMPLET DU SYSTÈME DE SAUVEGARDE ===');
    
    // Diagnostic des quêtes
    if (typeof window.diagnoseQuestsSystem === 'function') {
        window.diagnoseQuestsSystem();
    }
    
    // Test des modules
    window.testSaveModules();
    
    console.log('🔍 === FIN DU DIAGNOSTIC COMPLET ===');
};

// Fonction pour migrer toutes les sauvegardes
window.migrateAllSaves = function() {
    console.log('🔄 === MIGRATION DE TOUTES LES SAUVEGARDES ===');
    
    // Migrer les sauvegardes existantes
    if (window.saveUtils && typeof window.saveUtils.migrateOldSaves === 'function') {
        window.saveUtils.migrateOldSaves();
    }
    
    console.log('🔄 === FIN DE LA MIGRATION ===');
};

// Fonction de test complète pour l'isolation des quêtes
window.testCompleteQuestsIsolation = function() {
    console.log('🧪 === TEST COMPLET D\'ISOLATION DES QUÊTES ===');
    
    // Test 1: Vérifier l'état initial
    console.log('📋 Test 1: État initial');
    if (typeof window.diagnoseQuestsSystem === 'function') {
        window.diagnoseQuestsSystem();
    }
    
    // Test 2: Accepter une quête
    console.log('📋 Test 2: Accepter une quête');
    if (typeof window.acceptQuest === 'function') {
        window.acceptQuest('crowHunt');
    }
    
    // Test 3: Vérifier l'état après acceptation
    console.log('📋 Test 3: État après acceptation');
    if (typeof window.diagnoseQuestsSystem === 'function') {
        window.diagnoseQuestsSystem();
    }
    
    // Test 4: Simuler un changement de personnage
    console.log('📋 Test 4: Simulation changement de personnage');
    if (typeof window.switchCharacterQuests === 'function') {
        const testCharacterId = 'test_' + Date.now();
        window.switchCharacterQuests(testCharacterId);
    }
    
    // Test 5: Vérifier que les quêtes sont réinitialisées
    console.log('📋 Test 5: Vérification réinitialisation');
    if (typeof window.diagnoseQuestsSystem === 'function') {
        window.diagnoseQuestsSystem();
    }
    
    // Test 6: Vérifier que Papi1 propose bien la quête
    console.log('📋 Test 6: Vérification disponibilité quête');
    if (typeof window.isQuestAvailable === 'function') {
        const isAvailable = window.isQuestAvailable('crowHunt');
        console.log('✅ Quête crowHunt disponible:', isAvailable);
    }
    
    console.log('🧪 === FIN DU TEST COMPLET ===');
};

// Fonction de test pour l'isolation du compteur de corbeaux
window.testCrowKillCountsIsolation = function() {
    console.log('🧪 === TEST D\'ISOLATION DU COMPTEUR DE CORBEAUX ===');
    
    // Test 1: Vérifier l'état initial
    console.log('📋 Test 1: État initial');
    if (typeof window.diagnoseCrowKillCounts === 'function') {
        window.diagnoseCrowKillCounts();
    }
    
    // Test 2: Simuler un kill de corbeau
    console.log('📋 Test 2: Simulation d\'un kill de corbeau');
    if (typeof window.incrementCrowKillCount === 'function') {
        const newCount = window.incrementCrowKillCount('map1');
        console.log(`✅ Compteur incrémenté: ${newCount}`);
    }
    
    // Test 3: Vérifier l'état après incrémentation
    console.log('📋 Test 3: État après incrémentation');
    if (typeof window.diagnoseCrowKillCounts === 'function') {
        window.diagnoseCrowKillCounts();
    }
    
    // Test 4: Simuler un changement de personnage
    console.log('📋 Test 4: Simulation changement de personnage');
    const originalCharacterId = window.currentCharacterId;
    const testCharacterId = 'test_crow_' + Date.now();
    window.currentCharacterId = testCharacterId;
    
    // Test 5: Vérifier que le compteur est réinitialisé
    console.log('📋 Test 5: Vérification réinitialisation');
    if (typeof window.diagnoseCrowKillCounts === 'function') {
        window.diagnoseCrowKillCounts();
    }
    
    // Test 6: Restaurer le personnage original
    console.log('📋 Test 6: Restauration du personnage original');
    window.currentCharacterId = originalCharacterId;
    if (typeof window.diagnoseCrowKillCounts === 'function') {
        window.diagnoseCrowKillCounts();
    }
    
    console.log('🧪 === FIN DU TEST ===');
};

// Fonction de test pour forcer le spawn du SlimeBoss
window.testSlimeBossSpawn = function() {
    console.log('🧪 === TEST DE SPAWN DU SLIMEBOSS ===');
    
    // Test 1: Vérifier l'état initial
    console.log('📋 Test 1: État initial');
    if (typeof window.diagnoseSlimeBoss === 'function') {
        window.diagnoseSlimeBoss();
    }
    
    // Test 2: Vérifier la map actuelle
    console.log('📋 Test 2: Vérification de la map');
    console.log('🗺️ Map actuelle:', window.currentMap);
    
    if (window.currentMap !== 'mapdonjonslimeboss') {
        console.log('⚠️ Vous devez être sur mapdonjonslimeboss pour tester le SlimeBoss');
        console.log('🧪 === FIN DU TEST ===');
        return;
    }
    
    // Test 3: Forcer le spawn du boss
    console.log('📋 Test 3: Spawn forcé du SlimeBoss');
    if (typeof window.spawnSlimeBossOnBossMap === 'function') {
        const boss = window.spawnSlimeBossOnBossMap();
        if (boss) {
            console.log('✅ SlimeBoss créé avec succès:', boss);
        } else {
            console.log('❌ Échec de la création du SlimeBoss');
        }
    } else {
        console.log('❌ Fonction spawnSlimeBossOnBossMap non disponible');
    }
    
    // Test 4: Vérifier l'état final
    console.log('📋 Test 4: État final');
    if (typeof window.diagnoseSlimeBoss === 'function') {
        window.diagnoseSlimeBoss();
    }
    
    console.log('🧪 === FIN DU TEST ===');
};

console.log('✅ Loader de sauvegarde prêt');
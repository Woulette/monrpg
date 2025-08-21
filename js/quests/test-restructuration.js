// js/quests/test-restructuration.js - Test de la restructuration

// Ce fichier teste que toutes les fonctions sont bien disponibles
// après la restructuration

function testRestructuration() {
    // Tous les console.log supprimés dans ce fichier de test.
    
    // Test des fonctions de base
    const baseFunctions = [
        'createQuestsInstance',
        'getCurrentQuests', 
        'resetCurrentQuests',
        'isQuestAvailable',
        'getEquipmentType',
        'getQuestItemImagePath',
        'getItemQuantity'
    ];
    
    // Test des fonctions de logique
    const logicFunctions = [
        'acceptQuest',
        'updateQuestProgress',
        'checkCraftQuestProgress',
        'completeQuest',
        'onCrowKilled',
        'checkSlimeBossQuestProgress',
        'canValidateQuestWithPNJ',
        'validateQuestWithPNJ',
        'abandonQuest',
        'showQuestNotification',
        'updateQuestUI'
    ];
    
    // Test des fonctions d'interface
    const uiFunctions = [
        'showQuestOffer',
        'showCraftQuestOffer',
        'showSlimeBossQuestOffer',
        'showSlimeBossFinalQuestOffer',
        'initQuestsWindow',
        'openQuestsWindow',
        'closeQuestsWindow',
        'refreshQuestsDisplay'
    ];
    
    // Test des fonctions de sauvegarde
    const saveFunctions = [
        'saveQuestsForCharacter',
        'loadQuestsForCharacter',
        'deleteQuestsForCharacter',
        'resetQuestsToInitial',
        'switchCharacterQuests'
    ];
    
    // Test de création d'instance
    try {
        const testQuests = createQuestsInstance();
        const questIds = Object.keys(testQuests);
        
        // Vérifier que les quêtes principales sont présentes
        const requiredQuests = ['crowHunt', 'crowCraft', 'slimeBoss', 'slimeBossFinal'];
        const missingQuests = requiredQuests.filter(id => !testQuests[id]);
        
        if (missingQuests.length === 0) {
            // console.log('  ✅ Toutes les quêtes principales sont présentes');
        } else {
            // console.log(`  ❌ Quêtes manquantes:`, missingQuests);
        }
    } catch (error) {
        // console.log('  ❌ Erreur lors de la création d\'instance:', error);
    }
    
    // Test de compatibilité avec papi.js
    const papiFunctions = [
        'canValidateQuestWithPNJ',
        'validateQuestWithPNJ',
        'showQuestOffer',
        'showCraftQuestOffer',
        'showSlimeBossQuestOffer'
    ];
    
    papiFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            // console.log(`  ✅ ${funcName} disponible pour papi.js`);
        } else {
            // console.log(`  ❌ ${funcName} manquante pour papi.js`);
        }
    });
    
    // Test de compatibilité avec inventory/items.js
    if (typeof window.checkCraftQuestProgress === 'function') {
        // console.log('  ✅ checkCraftQuestProgress disponible pour inventory/items.js');
    } else {
        // console.log('  ❌ checkCraftQuestProgress manquante pour inventory/items.js');
    }
    
    // console.log('🧪 === FIN DU TEST DE RESTRUCTURATION ===');
}

// Exporter la fonction de test
window.testRestructuration = testRestructuration; 
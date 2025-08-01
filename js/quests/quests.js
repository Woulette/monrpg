// js/quests/quests.js - Fichier principal du système de quêtes

// Ce fichier importe tous les modules du système de quêtes
// et gère les exports globaux pour la compatibilité

// ===== SYSTÈME DE SAUVEGARDE/CHARGEMENT MULTI-PERSONNAGES =====

// Sauvegarder les quêtes pour un personnage spécifique
function saveQuestsForCharacter(characterId) {
    if (!characterId) {
        console.warn('❌ Impossible de sauvegarder les quêtes: characterId manquant');
        return;
    }
    
    try {
        const questsData = {
            quests: getCurrentQuests(),
            timestamp: Date.now(),
            characterId: characterId,
            version: '1.0'
        };
        
        localStorage.setItem(`monrpg_quests_${characterId}`, JSON.stringify(questsData));
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde des quêtes:', error);
    }
}

// Charger les quêtes pour un personnage spécifique
function loadQuestsForCharacter(characterId) {
    if (!characterId) {
        console.warn('❌ Impossible de charger les quêtes: characterId manquant');
        return false;
    }
    
    try {
        const saveKey = `monrpg_quests_${characterId}`;
        const savedData = localStorage.getItem(saveKey);
        
        if (!savedData) {
            console.log(`📭 Aucune quête sauvegardée trouvée pour le personnage ${characterId}`);
            resetCurrentQuests();
            return false;
        }
        
        const questsData = JSON.parse(savedData);
        
        // Vérifier que les données correspondent au bon personnage
        if (questsData.characterId && questsData.characterId !== characterId) {
            console.warn(`⚠️ Données de quêtes corrompues pour ${characterId}, réinitialisation...`);
            resetCurrentQuests();
            return false;
        }
        
        // Restaurer les quêtes
        if (questsData.quests) {
            const baseQuests = createQuestsInstance();
            window.quests = mergeQuestsWithBase(questsData.quests, baseQuests);
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des quêtes:', error);
        resetCurrentQuests();
        return false;
    }
}

// Fusionner les quêtes sauvegardées avec les quêtes de base
function mergeQuestsWithBase(savedQuests, baseQuests) {
    const mergedQuests = {};
    
    // Pour chaque quête de base
    Object.keys(baseQuests).forEach(questId => {
        const baseQuest = baseQuests[questId];
        const savedQuest = savedQuests[questId];
        
        if (savedQuest) {
            // Fusionner les propriétés sauvegardées avec les propriétés de base
            mergedQuests[questId] = {
                ...baseQuest,
                ...savedQuest,
                id: questId,
                name: baseQuest.name,
                description: baseQuest.description,
                target: baseQuest.target,
                reward: baseQuest.reward,
                availableOn: baseQuest.availableOn,
                validationOn: baseQuest.validationOn
            };
        } else {
            // Quête non sauvegardée, utiliser la base
            mergedQuests[questId] = { ...baseQuest };
        }
    });
    
    return mergedQuests;
}

// Supprimer les quêtes d'un personnage spécifique
function deleteQuestsForCharacter(characterId) {
    if (!characterId) return;
    
    try {
        localStorage.removeItem(`monrpg_quests_${characterId}`);
    } catch (error) {
        console.error('❌ Erreur lors de la suppression des quêtes:', error);
    }
}

// Réinitialiser les quêtes à leur état initial
function resetQuestsToInitial() {
    window.quests = createQuestsInstance();
    
    // Réinitialiser les états des PNJ si nécessaire
    if (typeof window.resetPNJStates === 'function') {
        window.resetPNJStates();
    }
}

// Fonction pour changer de personnage
function switchCharacterQuests(characterId) {
    console.log(`🔄 Changement de personnage pour ${characterId} - Réinitialisation des quêtes...`);
    
    // Réinitialiser complètement les quêtes
    window.quests = createQuestsInstance();
    
    // Réinitialiser les états des PNJ
    if (typeof window.resetPNJStates === 'function') {
        window.resetPNJStates();
    }
    
    // Charger les quêtes sauvegardées pour ce personnage
    if (typeof window.loadQuestsForCharacter === 'function') {
        window.loadQuestsForCharacter(characterId);
    }
    
    console.log(`✅ Quêtes réinitialisées pour le personnage ${characterId}`);
}

// ===== FONCTIONS DE DIAGNOSTIC =====

// Fonction de diagnostic pour l'icône des quêtes
window.debugQuestsIcon = function() {
    const quetesIcon = document.getElementById('quetes-icon');
    const questsModal = document.getElementById('quests-main-modal');
    
    if (quetesIcon) {
        quetesIcon.click();
        
        setTimeout(() => {
        }, 100);
        
    } else {
    }
};

// Fonction pour forcer la réinitialisation complète de toutes les données de quêtes
window.forceResetAllQuests = function() {
    console.log('🧹 Réinitialisation forcée de toutes les données de quêtes...');
    
    // Supprimer toutes les données de quêtes de tous les personnages
    const keys = Object.keys(localStorage);
    const questKeys = keys.filter(key => key.startsWith('monrpg_quests_'));
    
    questKeys.forEach(key => {
        localStorage.removeItem(key);
    });
    
    // Réinitialiser window.quests
    resetQuestsToInitial();
    
    console.log('✅ Toutes les données de quêtes ont été réinitialisées');
};

// Fonction de test pour diagnostiquer les problèmes de quêtes
function diagnoseQuestsSystem() {
    console.log('🔍 === DIAGNOSTIC DU SYSTÈME DE QUÊTES ===');
    
    // Vérifier l'état actuel des quêtes
    console.log('📊 État actuel des quêtes:');
    if (window.quests) {
        Object.entries(window.quests).forEach(([questId, quest]) => {
            console.log(`  ${questId}:`, {
                accepted: quest.accepted,
                completed: quest.completed,
                readyToComplete: quest.readyToComplete,
                current: quest.current,
                target: quest.target
            });
        });
    } else {
        console.log('  ❌ window.quests non défini');
    }
    
    // Vérifier le personnage actuel
    console.log('👤 Personnage actuel:', {
        characterId: window.currentCharacterId,
        playerName: window.playerName
    });
    
    // Vérifier les sauvegardes dans localStorage
    console.log('💾 Sauvegardes dans localStorage:');
    const questsKey = `monrpg_quests_${window.currentCharacterId}`;
    const savedData = localStorage.getItem(questsKey);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            console.log('  ✅ Sauvegarde trouvée:', {
                characterId: data.characterId,
                timestamp: new Date(data.timestamp).toLocaleString(),
                questsCount: Object.keys(data.quests || {}).length
            });
        } catch (error) {
            console.log('  ❌ Erreur lors de la lecture de la sauvegarde:', error);
        }
    } else {
        console.log('  ❌ Aucune sauvegarde trouvée');
    }
    
    // Vérifier les états des PNJ
    console.log('🤖 États des PNJ:');
    if (typeof window.pnjs !== 'undefined') {
        window.pnjs.forEach(pnj => {
            if (pnj && pnj.id) {
                console.log(`  ${pnj.id}:`, {
                    currentDialogue: pnj.currentDialogue,
                    isTalking: pnj.isTalking,
                    slimeBossQuestOffered: pnj.slimeBossQuestOffered
                });
            }
        });
    } else {
        console.log('  ❌ window.pnjs non défini');
    }
    
    console.log('🔍 === FIN DU DIAGNOSTIC ===');
}

// Fonction pour forcer la réinitialisation complète des quêtes
function forceResetQuests() {
    console.log('🔄 Réinitialisation forcée des quêtes...');
    
    // Réinitialiser les quêtes
    resetQuestsToInitial();
    
    // Réinitialiser les états des PNJ
    if (typeof window.resetPNJStates === 'function') {
        window.resetPNJStates();
    }
    
    // Sauvegarder l'état réinitialisé
    if (window.currentCharacterId && typeof window.saveQuestsForCharacter === 'function') {
        window.saveQuestsForCharacter(window.currentCharacterId);
    }
    
    console.log('✅ Réinitialisation forcée terminée');
}

// Fonction de test pour vérifier l'isolation des quêtes
function testQuestsIsolation() {
    console.log('🧪 === TEST D\'ISOLATION DES QUÊTES ===');
    
    // Sauvegarder l'état actuel
    const currentCharacterId = window.currentCharacterId;
    const currentQuests = JSON.parse(JSON.stringify(window.quests || {}));
    
    console.log('📊 État actuel:', {
        characterId: currentCharacterId,
        quests: Object.keys(currentQuests).map(id => ({
            id,
            accepted: currentQuests[id]?.accepted,
            completed: currentQuests[id]?.completed
        }))
    });
    
    // Simuler un changement de personnage
    console.log('🔄 Simulation d\'un changement de personnage...');
    const testCharacterId = 'test_character_' + Date.now();
    window.currentCharacterId = testCharacterId;
    
    // Réinitialiser les quêtes
    window.quests = createQuestsInstance();
    
    console.log('📊 État après réinitialisation:', {
        characterId: window.currentCharacterId,
        quests: Object.keys(window.quests).map(id => ({
            id,
            accepted: window.quests[id]?.accepted,
            completed: window.quests[id]?.completed
        }))
    });
    
    // Restaurer l'état original
    window.currentCharacterId = currentCharacterId;
    window.quests = currentQuests;
    
    console.log('✅ Test d\'isolation terminé');
    console.log('🧪 === FIN DU TEST ===');
}

// ===== EXPORTS GLOBAUX FINAUX =====

// Exporter les fonctions de sauvegarde
window.saveQuestsForCharacter = saveQuestsForCharacter;
window.loadQuestsForCharacter = loadQuestsForCharacter;
window.deleteQuestsForCharacter = deleteQuestsForCharacter;
window.resetQuestsToInitial = resetQuestsToInitial;
window.switchCharacterQuests = switchCharacterQuests;

// Exporter les fonctions de diagnostic
window.diagnoseQuestsSystem = diagnoseQuestsSystem;
window.forceResetQuests = forceResetQuests;
window.testQuestsIsolation = testQuestsIsolation;

// Exporter les fonctions nécessaires pour les PNJ
window.getItemQuantity = getItemQuantity;
window.canValidateQuestWithPNJ = canValidateQuestWithPNJ;
window.validateQuestWithPNJ = validateQuestWithPNJ; 
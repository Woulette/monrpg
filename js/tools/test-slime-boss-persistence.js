// js/tools/test-slime-boss-persistence.js
// Script de test pour vérifier la persistance de l'état du SlimeBoss

console.log('🧪 Test de persistance du SlimeBoss...');

// Fonction de test pour vérifier l'état actuel
function testSlimeBossState() {
    console.log('📊 État actuel du SlimeBoss:');
    console.log('- window.slimeBossDefeated:', window.slimeBossDefeated);
    console.log('- window.currentCharacterId:', window.currentCharacterId);
    console.log('- window.currentMap:', window.currentMap);
    
    // Vérifier si le boss existe dans les monstres
    if (window.monsters) {
        const slimeBoss = window.monsters.find(m => m.type === 'slimeboss');
        console.log('- SlimeBoss dans les monstres:', slimeBoss ? 'Présent' : 'Absent');
        if (slimeBoss) {
            console.log('  - HP:', slimeBoss.hp, '/', slimeBoss.maxHp);
            console.log('  - isDead:', slimeBoss.isDead);
        }
    }
}

// Fonction pour simuler la défaite du boss
function simulateBossDefeat() {
    console.log('⚔️ Simulation de la défaite du SlimeBoss...');
    
    // Marquer le boss comme vaincu
    window.slimeBossDefeated = true;
    
    // Supprimer le boss des monstres s'il existe
    if (window.monsters) {
        const bossIndex = window.monsters.findIndex(m => m.type === 'slimeboss');
        if (bossIndex !== -1) {
            window.monsters.splice(bossIndex, 1);
            console.log('✅ SlimeBoss supprimé des monstres');
        }
    }
    
    // Sauvegarder l'état
    if (typeof window.saveGame === 'function') {
        window.saveGame();
        console.log('💾 État sauvegardé');
    }
    
    testSlimeBossState();
}

// Fonction pour forcer le respawn du boss
function forceBossRespawn() {
    console.log('🔄 Forçage du respawn du SlimeBoss...');
    
    // Réinitialiser l'état
    window.slimeBossDefeated = false;
    
    // Forcer la création du boss
    if (typeof window.ensureSlimeBossExists === 'function') {
        window.ensureSlimeBossExists();
    }
    
    // Sauvegarder l'état
    if (typeof window.saveGame === 'function') {
        window.saveGame();
        console.log('💾 État sauvegardé');
    }
    
    testSlimeBossState();
}

// Fonction pour vérifier la sauvegarde dans localStorage
function checkLocalStorage() {
    console.log('💾 Vérification du localStorage...');
    
    if (window.currentCharacterId) {
        const saveKey = `monrpg_save_${window.currentCharacterId}`;
        const saveData = localStorage.getItem(saveKey);
        
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                console.log('- Données de sauvegarde trouvées');
                console.log('- gameState:', data.gameState);
                console.log('- slimeBossDefeated dans save:', data.gameState?.slimeBossDefeated);
            } catch (error) {
                console.error('❌ Erreur lors du parsing des données:', error);
            }
        } else {
            console.log('- Aucune sauvegarde trouvée');
        }
    } else {
        console.log('- Aucun personnage actif');
    }
}

// Exporter les fonctions de test
window.testSlimeBossState = testSlimeBossState;
window.simulateBossDefeat = simulateBossDefeat;
window.forceBossRespawn = forceBossRespawn;
window.checkLocalStorage = checkLocalStorage;

console.log('✅ Script de test du SlimeBoss chargé');
console.log('📝 Commandes disponibles:');
console.log('- testSlimeBossState() : Vérifier l\'état actuel');
console.log('- simulateBossDefeat() : Simuler la défaite du boss');
console.log('- forceBossRespawn() : Forcer le respawn du boss');
console.log('- checkLocalStorage() : Vérifier les données sauvegardées'); 
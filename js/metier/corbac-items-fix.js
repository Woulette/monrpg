// js/metier/corbac-items-fix.js
// Correction des noms des items Corbac pour la cohérence avec l'onglet métier

// Fonction pour corriger les noms des items Corbac dans equipmentDatabase
function fixCorbacItemsNames() {
    console.log('🔧 Correction des noms des items Corbac...');
    
    if (!window.equipmentDatabase) {
        console.error('❌ equipmentDatabase non trouvé');
        return;
    }
    
    // Mapping des corrections de noms
    const nameCorrections = {
        'coiffe_corbeau': 'Corbacoiffe',
        'cape_corbeau': 'Corbacape',
        'bottes_corbeau': 'Corbobotte',
        'ceinture_corbeau': 'Corbature',
        'amulette_corbeau': 'Corbollier',
        'anneau_corbeau': 'Corbaneau'
    };
    
    // Appliquer les corrections
    let correctionCount = 0;
    for (const [itemId, newName] of Object.entries(nameCorrections)) {
        if (window.equipmentDatabase[itemId]) {
            const oldName = window.equipmentDatabase[itemId].name;
            window.equipmentDatabase[itemId].name = newName;
            console.log(`✅ ${itemId}: "${oldName}" → "${newName}"`);
            correctionCount++;
        } else {
            console.warn(`⚠️ Item ${itemId} non trouvé dans equipmentDatabase`);
        }
    }
    
    console.log(`🎯 ${correctionCount} items Corbac corrigés`);
    
    // Vérification que les noms matchent maintenant
    verifyItemMatching();
}

// Fonction pour vérifier que les noms matchent avec metierRecettes
function verifyItemMatching() {
    console.log('🔍 Vérification du matching des noms...');
    
    if (!window.equipmentDatabase) {
        console.error('❌ equipmentDatabase non disponible');
        return;
    }
    
    // Items à vérifier (depuis metierRecettes)
    const itemsToCheck = [
        'Corbacape', 'Corbacoiffe', 'Corbobotte', 'Corbature', 
        'Corbollier', 'Corbaneau', 'Cape de Slime', 'Coiffe de Slime'
    ];
    
    itemsToCheck.forEach(itemName => {
        // Chercher dans equipmentDatabase
        let found = false;
        for (const id in window.equipmentDatabase) {
            const item = window.equipmentDatabase[id];
            if (item && item.name && item.name.toLowerCase() === itemName.toLowerCase()) {
                console.log(`✅ Match trouvé: "${itemName}" → ID: ${id}`);
                console.log(`   Stats: ${JSON.stringify(item.stats || {})}`);
                found = true;
                break;
            }
        }
        if (!found) {
            console.warn(`❌ Aucun match pour: "${itemName}"`);
        }
    });
}

// Fonction pour tester getItemStatsAndDesc avec les items Corbac
function testCorbacItemsInMetier() {
    console.log('🧪 Test des items Corbac dans le système métier...');
    
    const corbacItems = ['Corbacape', 'Corbacoiffe', 'Corbobotte', 'Corbature', 'Corbollier', 'Corbaneau'];
    
    corbacItems.forEach(itemName => {
        if (typeof window.getItemStatsAndDesc === 'function') {
            const result = window.getItemStatsAndDesc(itemName);
            if (result) {
                console.log(`✅ ${itemName}:`, result);
            } else {
                console.warn(`❌ ${itemName}: Aucune donnée trouvée`);
            }
        } else {
            console.warn('❌ Fonction getItemStatsAndDesc non disponible');
        }
    });
}

// Fonction spécifique pour diagnostiquer le problème du Corbollier
function diagnoseCorbollierIssue() {
    console.log('🔍 Diagnostic spécifique pour Corbollier...');
    
    if (!window.equipmentDatabase) {
        console.error('❌ equipmentDatabase non disponible');
        return;
    }
    
    // Vérifier l'item amulette_corbeau
    const item = window.equipmentDatabase['amulette_corbeau'];
    if (item) {
        console.log('✅ Item amulette_corbeau trouvé:', item);
        console.log('📝 Nom actuel:', item.name);
        console.log('📊 Stats:', item.stats);
        console.log('📖 Description:', item.description);
    } else {
        console.error('❌ Item amulette_corbeau non trouvé dans equipmentDatabase');
    }
    
    // Chercher tous les items contenant "corbeau" ou "Corbolier"
    console.log('🔍 Recherche d\'items similaires...');
    for (const id in window.equipmentDatabase) {
        const dbItem = window.equipmentDatabase[id];
        if (dbItem && dbItem.name && (
            dbItem.name.toLowerCase().includes('corbeau') || 
            dbItem.name.toLowerCase().includes('corbollier') ||
            dbItem.name.toLowerCase().includes('amulette')
        )) {
            console.log(`🔍 Item trouvé: ${id} → "${dbItem.name}"`);
        }
    }
    
    // Test manuel de la fonction getItemStatsAndDesc
    if (typeof window.getItemStatsAndDesc === 'function') {
        console.log('🧪 Test getItemStatsAndDesc("Corbollier"):', window.getItemStatsAndDesc('Corbollier'));
        console.log('🧪 Test getItemStatsAndDesc("Amulette de Corbeau"):', window.getItemStatsAndDesc('Amulette de Corbeau'));
    }
}

// Fonction pour forcer la correction du Corbollier spécifiquement
function forceCorbollierFix() {
    console.log('🔧 Force la correction du Corbollier...');
    
    if (!window.equipmentDatabase) {
        console.error('❌ equipmentDatabase non disponible');
        return;
    }
    
    // Forcer la correction du nom
    if (window.equipmentDatabase['amulette_corbeau']) {
        const oldName = window.equipmentDatabase['amulette_corbeau'].name;
        window.equipmentDatabase['amulette_corbeau'].name = 'Corbollier';
        console.log(`🔧 Corbollier forcé: "${oldName}" → "Corbollier"`);
        
        // Test immédiat
        const testResult = window.getItemStatsAndDesc ? window.getItemStatsAndDesc('Corbollier') : null;
        console.log('🧪 Test immédiat après correction:', testResult);
        
        // Vérifier si l'onglet métier est ouvert et le forcer à se rafraîchir
        const metierModal = document.getElementById('metier-modal-overlay');
        if (metierModal) {
            console.log('🔄 Onglet métier détecté, tentative de rafraîchissement...');
            // Simuler un clic sur bijoutier pour rafraîchir l'affichage
            const bijoutierRow = document.querySelector('.metier-row');
            if (bijoutierRow) {
                console.log('🔄 Rafraîchissement de l\'affichage métier...');
                bijoutierRow.click();
            }
        }
        
        return true;
    } else {
        console.error('❌ amulette_corbeau non trouvé');
        return false;
    }
}

// Fonction de rollback pour restaurer les noms originaux
function rollbackCorbacItemsNames() {
    console.log('🔄 Rollback des noms des items Corbac...');
    
    if (!window.equipmentDatabase) {
        console.error('❌ equipmentDatabase non trouvé');
        return;
    }
    
    // Noms originaux
    const originalNames = {
        'coiffe_corbeau': 'Coiffe de Corbeau',
        'cape_corbeau': 'Cape de Corbeau',
        'bottes_corbeau': 'Bottes de Corbeau',
        'ceinture_corbeau': 'Ceinture de Corbeau',
        'amulette_corbeau': 'Amulette de Corbeau',
        'anneau_corbeau': 'Anneau de Corbeau'
    };
    
    // Restaurer les noms originaux
    let rollbackCount = 0;
    for (const [itemId, originalName] of Object.entries(originalNames)) {
        if (window.equipmentDatabase[itemId]) {
            const currentName = window.equipmentDatabase[itemId].name;
            window.equipmentDatabase[itemId].name = originalName;
            console.log(`🔄 ${itemId}: "${currentName}" → "${originalName}"`);
            rollbackCount++;
        }
    }
    
    console.log(`🎯 ${rollbackCount} items restaurés`);
}

// Exposer les fonctions au scope global pour utilisation en console
window.fixCorbacItemsNames = fixCorbacItemsNames;
window.verifyItemMatching = verifyItemMatching;
window.testCorbacItemsInMetier = testCorbacItemsInMetier;
window.diagnoseCorbollierIssue = diagnoseCorbollierIssue;
window.forceCorbollierFix = forceCorbollierFix;
window.rollbackCorbacItemsNames = rollbackCorbacItemsNames;

// Application automatique du fix au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que le système d'équipement soit chargé
    setTimeout(() => {
        if (window.equipmentDatabase) {
            fixCorbacItemsNames();
        } else {
            console.warn('⚠️ equipmentDatabase pas encore chargé, nouvelle tentative...');
            // Nouvelle tentative après 2 secondes
            setTimeout(() => {
                if (window.equipmentDatabase) {
                    fixCorbacItemsNames();
                } else {
                    console.error('❌ equipmentDatabase non disponible après 2 tentatives');
                }
            }, 2000);
        }
    }, 1000);
});

console.log('📦 Module corbac-items-fix.js chargé');
console.log('🔧 Fonctions disponibles: fixCorbacItemsNames(), verifyItemMatching(), testCorbacItemsInMetier(), diagnoseCorbollierIssue(), rollbackCorbacItemsNames()');

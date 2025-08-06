// INVENTAIRES SÉPARÉS PAR CATÉGORIE - CHACUN COMPLÈTEMENT INDÉPENDANT
let inventoryAll = Array.from({ length: 80 }, () => ({ item: null, category: null }));
let inventoryEquipement = Array.from({ length: 80 }, () => ({ item: null, category: 'equipement' }));
let inventoryPotions = Array.from({ length: 80 }, () => ({ item: null, category: 'potions' }));
let inventoryRessources = Array.from({ length: 80 }, () => ({ item: null, category: 'ressources' }));
let inventoryRessourcesAlchimiste = Array.from({ length: 80 }, () => ({ item: null, category: 'ressources_alchimiste' }));

// Inventaire principal (pour compatibilité avec le système d'équipement)
let inventory = inventoryAll;

// Rendre les inventaires accessibles globalement
window.inventory = inventory;
window.inventoryAll = inventoryAll;
window.inventoryEquipement = inventoryEquipement;
window.inventoryPotions = inventoryPotions;
window.inventoryRessources = inventoryRessources;
window.inventoryRessourcesAlchimiste = inventoryRessourcesAlchimiste;

// Initialiser l'équipement
window.equippedItems = {
    coiffe: null,
    cape: null,
    collier: null,
    anneau: null,
    ceinture: null,
    bottes: null
};

// Rendre les fonctions de réinitialisation disponibles globalement
window.resetInventory = resetInventory;
window.resetEquipment = resetEquipment;

function initInventory() {
    // Inventaire vide au démarrage
}

// Fonction pour réinitialiser complètement l'inventaire
function resetInventory() {
    // Vider tous les inventaires en conservant la structure
    window.inventoryAll = Array.from({ length: 80 }, () => ({ item: null, category: null }));
    window.inventoryEquipement = Array.from({ length: 80 }, () => ({ item: null, category: 'equipement' }));
    window.inventoryPotions = Array.from({ length: 80 }, () => ({ item: null, category: 'potions' }));
    window.inventoryRessources = Array.from({ length: 80 }, () => ({ item: null, category: 'ressources' }));
    window.inventoryRessourcesAlchimiste = Array.from({ length: 80 }, () => ({ item: null, category: 'ressources_alchimiste' }));
    
    // Mettre à jour l'affichage
    if (typeof updateAllGrids === 'function') {
        updateAllGrids();
    }
    
    // Réinitialiser l'équipement
    if (typeof resetEquipment === 'function') {
        resetEquipment();
    }
}

// Fonction pour réinitialiser l'équipement
function resetEquipment() {
    // Réinitialiser les slots d'équipement
    window.equippedItems = {
        coiffe: null,
        cape: null,
        amulette: null,
        anneau: null,
        ceinture: null,
        bottes: null
    };
    
    // Mettre à jour l'affichage de l'équipement
    if (typeof updateEquipmentDisplay === 'function') {
        updateEquipmentDisplay();
    }
}

// ===== SYSTÈME DE SAUVEGARDE/CHARGEMENT MULTI-PERSONNAGES =====

// Sauvegarder l'inventaire pour un personnage spécifique
function saveInventoryForCharacter(characterId) {
    if (!characterId) {
        console.warn('❌ Impossible de sauvegarder l\'inventaire: characterId manquant');
        return;
    }
    
    try {
        const inventoryData = {
            inventoryAll: window.inventoryAll || [],
            inventoryEquipement: window.inventoryEquipement || [],
            inventoryPotions: window.inventoryPotions || [],
            inventoryRessources: window.inventoryRessources || [],
            inventoryRessourcesAlchimiste: window.inventoryRessourcesAlchimiste || [],
            equippedItems: window.equippedItems || {
                coiffe: null,
                cape: null,
                amulette: null,
                anneau: null,
                ceinture: null,
                bottes: null
            }
        };
        
        localStorage.setItem(`monrpg_inventory_${characterId}`, JSON.stringify(inventoryData));
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde de l\'inventaire:', error);
    }
}

// Charger l'inventaire pour un personnage spécifique
function loadInventoryForCharacter(characterId) {
    if (!characterId) {
        console.warn('❌ Impossible de charger l\'inventaire: characterId manquant');
        return false;
    }
    
    try {
        const saveKey = `monrpg_inventory_${characterId}`;
        const savedData = localStorage.getItem(saveKey);
        
        if (!savedData) {
            return false;
        }
        
        const inventoryData = JSON.parse(savedData);
        
        // Restaurer les inventaires
        if (inventoryData.inventoryAll) {
            window.inventoryAll = inventoryData.inventoryAll;
        }
        if (inventoryData.inventoryEquipement) {
            window.inventoryEquipement = inventoryData.inventoryEquipement;
        }
        if (inventoryData.inventoryPotions) {
            window.inventoryPotions = inventoryData.inventoryPotions;
        }
        if (inventoryData.inventoryRessources) {
            window.inventoryRessources = inventoryData.inventoryRessources;
        }
        if (inventoryData.inventoryRessourcesAlchimiste) {
            window.inventoryRessourcesAlchimiste = inventoryData.inventoryRessourcesAlchimiste;
        }
        
        // Restaurer l'équipement
        if (inventoryData.equippedItems) {
            window.equippedItems = inventoryData.equippedItems;
        }
        
        // Mettre à jour la référence principale
        window.inventory = window.inventoryAll;
        
        // Mettre à jour l'affichage
        if (typeof updateAllGrids === 'function') {
            updateAllGrids();
        }
        if (typeof updateEquipmentDisplay === 'function') {
            updateEquipmentDisplay();
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement de l\'inventaire:', error);
        return false;
    }
}

// Supprimer l'inventaire d'un personnage spécifique
function deleteInventoryForCharacter(characterId) {
    if (!characterId) return;
    
    try {
        localStorage.removeItem(`monrpg_inventory_${characterId}`);
    } catch (error) {
        console.error('❌ Erreur lors de la suppression de l\'inventaire:', error);
    }
}

function initStats() {
    // Les statistiques sont déjà initialisées dans player.js
    // Cette fonction peut être utilisée pour des initialisations supplémentaires si nécessaire
}

// Fonction pour obtenir l'inventaire selon la catégorie
function getInventoryByCategory(category) {
    switch (category) {
        case 'equipement':
            return window.inventoryEquipement;
        case 'potions':
            return window.inventoryPotions;
        case 'ressources':
            return window.inventoryRessources;
        case 'ressources_alchimiste':
            return window.inventoryRessourcesAlchimiste;
        default:
            return window.inventoryAll;
    }
}

// Fonction pour réorganiser l'inventaire (supprimer les espaces vides)
function reorganizeInventory(inventory) {
    if (!inventory || !Array.isArray(inventory)) {
        console.warn('Inventaire invalide pour réorganisation');
        return;
    }
    
    // Filtrer les slots non vides
    const nonEmptySlots = inventory.filter(slot => slot.item !== null);
    
    // Créer un nouvel inventaire avec les slots non vides en premier
    const reorganized = Array.from({ length: 80 }, (_, index) => {
        if (index < nonEmptySlots.length) {
            return nonEmptySlots[index];
        } else {
            return { item: null, category: inventory[0]?.category || null };
        }
    });
    
    // Remplacer l'inventaire original
    Object.assign(inventory, reorganized);
}

// Exporter les nouvelles fonctions
window.saveInventoryForCharacter = saveInventoryForCharacter;
window.loadInventoryForCharacter = loadInventoryForCharacter;
window.deleteInventoryForCharacter = deleteInventoryForCharacter; 
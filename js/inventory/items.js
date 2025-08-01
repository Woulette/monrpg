// Fonction pour ajouter un item à l'inventaire
function addItemToInventory(itemId, category) {
    // Chercher d'abord dans equipmentDatabase, puis dans resourceDatabase
    let item = equipmentDatabase[itemId];
    if (!item && typeof window.resourceDatabase !== 'undefined') {
        item = window.resourceDatabase[itemId];
    }
    if (!item) {
        console.error(`Item ${itemId} non trouvé dans les bases de données`);
        return false;
    }
    
    // Choisir le bon inventaire selon la catégorie - UTILISER LES RÉFÉRENCES GLOBALES
    let targetInventory;
    switch (category) {
        case 'equipement':
            targetInventory = window.inventoryEquipement;
            break;
        case 'potions':
            targetInventory = window.inventoryPotions;
            break;
        case 'ressources':
            targetInventory = window.inventoryRessources;
            break;
        default:
            targetInventory = window.inventoryAll;
            break;
    }
    
    // Pour les ressources empilables, chercher d'abord un slot existant
    if (item.stackable && item.maxStack) {
        const existingSlot = targetInventory.findIndex(slot => 
            slot.item && slot.item.id === itemId && 
            (slot.item.quantity === undefined || slot.item.quantity < item.maxStack)
        );
        
        if (existingSlot !== -1) {
            // Ajouter à l'existant
            if (targetInventory[existingSlot].item.quantity === undefined) {
                targetInventory[existingSlot].item.quantity = 1;
            }
            targetInventory[existingSlot].item.quantity += 1;
            
            // Limiter à la quantité maximale
            if (targetInventory[existingSlot].item.quantity > item.maxStack) {
                targetInventory[existingSlot].item.quantity = item.maxStack;
            }
            
            // Mettre à jour aussi l'inventaire principal - IMPORTANT: Synchroniser les objets
            const mainExistingSlot = window.inventoryAll.findIndex(slot => 
                slot.item && slot.item.id === itemId && 
                (slot.item.quantity === undefined || slot.item.quantity < item.maxStack)
            );
            if (mainExistingSlot !== -1) {
                if (window.inventoryAll[mainExistingSlot].item.quantity === undefined) {
                    window.inventoryAll[mainExistingSlot].item.quantity = 1;
                }
                window.inventoryAll[mainExistingSlot].item.quantity += 1;
                if (window.inventoryAll[mainExistingSlot].item.quantity > item.maxStack) {
                    window.inventoryAll[mainExistingSlot].item.quantity = item.maxStack;
                }
            } else {
                // Si l'item n'existe pas dans inventoryAll, l'ajouter
                const mainEmptySlot = window.inventoryAll.findIndex(slot => slot.item === null);
                if (mainEmptySlot !== -1) {
                    const mainItemToAdd = { ...targetInventory[existingSlot].item };
                    window.inventoryAll[mainEmptySlot] = {
                        item: mainItemToAdd,
                        category: category
                    };
                }
            }
            
            // Mettre à jour toutes les grilles
            updateAllGrids();
            
            // Mettre à jour les établis si ils sont ouverts
            if (typeof window.updateEtabliesInventory === 'function') {
                window.updateEtabliesInventory();
            }
            
            // Sauvegarde automatique après modification de l'inventaire
            if (typeof window.autoSaveOnEvent === 'function') {
                window.autoSaveOnEvent();
            }
            
            // Vérifier le progrès de la quête de craft après avoir ajouté un item
            if (typeof window.checkCraftQuestProgress === 'function') {
                window.checkCraftQuestProgress();
            }
            
            // Vérifier le progrès de la quête slimeBoss si le certificat a été obtenu
            if (itemId === 'certificat_corbeau' && typeof window.checkSlimeBossQuestProgress === 'function') {
                window.checkSlimeBossQuestProgress();
            }
            
            return true;
        }
    }
    
    // Trouver un slot vide dans l'inventaire cible
    const emptySlot = targetInventory.findIndex(slot => slot.item === null);
    if (emptySlot === -1) {
        console.error(`Inventaire ${category} plein !`);
        return false;
    }
    
    // Ajouter l'item dans le bon inventaire
    const itemToAdd = { ...item };
    if (item.stackable) {
        itemToAdd.quantity = 1;
    }
    
    targetInventory[emptySlot] = {
        item: itemToAdd,
        category: category
    };
    
    // Ajouter aussi dans l'inventaire principal pour compatibilité
    const mainEmptySlot = window.inventoryAll.findIndex(slot => slot.item === null);
    if (mainEmptySlot !== -1) {
        const mainItemToAdd = { ...itemToAdd };
        window.inventoryAll[mainEmptySlot] = {
            item: mainItemToAdd,
            category: category
        };
    }
    
    console.log(`Item ${item.name} ajouté à l'inventaire ${category}`);
    
    // Mettre à jour toutes les grilles
    updateAllGrids();
    
    // Mettre à jour les établis si ils sont ouverts
    if (typeof window.updateEtabliesInventory === 'function') {
        window.updateEtabliesInventory();
    }
    
    // Sauvegarde automatique après modification de l'inventaire
    if (typeof window.autoSaveOnEvent === 'function') {
        window.autoSaveOnEvent();
    }
    
    // Vérifier le progrès de la quête de craft après avoir ajouté un item
    if (typeof window.checkCraftQuestProgress === 'function') {
        window.checkCraftQuestProgress();
    }
    
    // Vérifier le progrès de la quête slimeBoss si le certificat a été obtenu
    if (itemId === 'certificat_corbeau' && typeof window.checkSlimeBossQuestProgress === 'function') {
        console.log("📜 Certificat obtenu via inventaire, vérification du progrès de la quête slimeBoss...");
        window.checkSlimeBossQuestProgress();
    }
    
    return true;
}

// Fonction utilitaire pour retirer un item de tous les inventaires (par id)
function removeItemFromAllInventories(itemId) {
    console.log(`🔍 Tentative de suppression de l'item ${itemId} de tous les inventaires`);
    
    // Debug: Afficher le contenu de inventoryAll avant suppression
    console.log(`🔍 Contenu de inventoryAll avant suppression:`);
    window.inventoryAll.forEach((slot, index) => {
        if (slot.item) {
            console.log(`  Slot ${index}: ${slot.item.id} - ${slot.item.name}`);
        }
    });
    
    // Retire de l'inventaire principal
    const mainIndex = window.inventoryAll.findIndex(slot => slot.item && slot.item.id === itemId);
    if (mainIndex !== -1) {
        console.log(`✅ Item trouvé dans inventoryAll à l'index ${mainIndex}`);
        window.inventoryAll[mainIndex] = { item: null, category: null };
        reorganizeInventory(window.inventoryAll);
    } else {
        console.log(`❌ Item non trouvé dans inventoryAll`);
        // Essayer de trouver par nom si l'id ne correspond pas
        const item = equipmentDatabase[itemId];
        if (item) {
            const nameIndex = window.inventoryAll.findIndex(slot => slot.item && slot.item.name === item.name);
            if (nameIndex !== -1) {
                console.log(`✅ Item trouvé dans inventoryAll par nom à l'index ${nameIndex}`);
                window.inventoryAll[nameIndex] = { item: null, category: null };
                reorganizeInventory(window.inventoryAll);
            } else {
                console.log(`❌ Item non trouvé dans inventoryAll même par nom`);
            }
        }
    }
    
    // Retire de chaque catégorie
    [window.inventoryEquipement, window.inventoryPotions, window.inventoryRessources].forEach((inv, index) => {
        const invName = ['inventoryEquipement', 'inventoryPotions', 'inventoryRessources'][index];
        const idx = inv.findIndex(slot => slot.item && slot.item.id === itemId);
        if (idx !== -1) {
            console.log(`✅ Item trouvé dans ${invName} à l'index ${idx}`);
            inv[idx] = { item: null, category: inv[idx].category };
            reorganizeInventory(inv);
        } else {
            console.log(`❌ Item non trouvé dans ${invName}`);
        }
    });
    
    console.log(`📊 État des inventaires après suppression:`);
    console.log(`inventoryAll: ${window.inventoryAll.filter(slot => slot.item).length} items`);
    console.log(`inventoryEquipement: ${window.inventoryEquipement.filter(slot => slot.item).length} items`);
    
    // Forcer la synchro visuelle
    if (typeof updateAllGrids === 'function') updateAllGrids();
    
    // Mettre à jour les établis si ils sont ouverts
    if (typeof window.updateEtabliesInventory === 'function') {
        window.updateEtabliesInventory();
    }
    
    // Sauvegarde automatique après modification de l'inventaire
    if (typeof window.autoSaveOnEvent === 'function') {
        window.autoSaveOnEvent();
    }
    
    // Vérifier le progrès de la quête de craft après avoir retiré un item
    if (typeof window.checkCraftQuestProgress === 'function') {
        window.checkCraftQuestProgress();
    }
}

// Modifie handleItemClick pour synchroniser les retraits
function handleItemClick(item, slotIndex, category) {
    console.log(`Clic sur ${item.name} dans la catégorie ${category}`);
    console.log('Type:', item.type, 'Slot:', item.slot);
    
    // Vérifier si l'item est équipable (utiliser type ou slot)
    const isEquippable = (item.type === 'coiffe' || item.type === 'cape' || item.type === 'amulette' || item.type === 'anneau' || item.type === 'ceinture' || item.type === 'bottes') ||
                        (item.slot === 'coiffe' || item.slot === 'cape' || item.slot === 'amulette' || item.slot === 'anneau' || item.slot === 'ceinture' || item.slot === 'bottes');
    
    if (isEquippable) {
        console.log('Item équipable détecté, tentative d\'équipement...');
        // Équiper l'item
        if (equipItem(item.id)) {
            // Retirer l'item de tous les inventaires
            removeItemFromAllInventories(item.id);
            updateAllGrids();
            updateEquipmentDisplay();
            updateStatsDisplay();
            console.log(`${item.name} équipé !`);
            
            // Sauvegarde automatique après équipement
            if (typeof window.autoSaveOnEvent === 'function') {
                window.autoSaveOnEvent();
            }
            
            // Vérifier le progrès de la quête de craft après avoir équipé un item
            if (typeof window.checkCraftQuestProgress === 'function') {
                window.checkCraftQuestProgress();
            }
        } else {
            console.log('Échec de l\'équipement de', item.name);
        }
    } else {
        console.log('Item non équipable:', item.name);
    }
}

// Fonction pour gérer le clic sur un slot d'équipement
function handleEquipmentSlotClick(slotType) {
    console.log(`Clic sur slot d'équipement: ${slotType}`);
    
    const equippedItem = getItemInSlot(slotType);
    if (equippedItem) {
        // Déséquiper l'item
        if (unequipItem(slotType)) {
            // Remettre l'item dans l'inventaire d'équipement
            const emptySlot = window.inventoryEquipement.findIndex(slot => slot.item === null);
            if (emptySlot !== -1) {
                window.inventoryEquipement[emptySlot] = {
                    item: equippedItem,
                    category: 'equipement'
                };
            }
            
            // Remettre aussi dans l'inventaire principal
            const mainEmptySlot = window.inventoryAll.findIndex(slot => slot.item === null);
            if (mainEmptySlot !== -1) {
                window.inventoryAll[mainEmptySlot] = {
                    item: equippedItem,
                    category: 'equipement'
                };
            }
            
            updateAllGrids();
            updateEquipmentDisplay();
            updateStatsDisplay();
            console.log(`${equippedItem.name} déséquipé !`);
            
            // Sauvegarde automatique après déséquipement
            if (typeof window.autoSaveOnEvent === 'function') {
                window.autoSaveOnEvent();
            }
            
            // Vérifier le progrès de la quête de craft après avoir déséquipé un item
            if (typeof window.checkCraftQuestProgress === 'function') {
                window.checkCraftQuestProgress();
            }
        }
    }
}

// Exporter les fonctions
window.addItemToInventory = addItemToInventory;
window.removeItemFromAllInventories = removeItemFromAllInventories;
window.handleItemClick = handleItemClick;
window.handleEquipmentSlotClick = handleEquipmentSlotClick; 
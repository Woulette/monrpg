// Variable pour empêcher les notifications multiples
let levelErrorShown = false;

// Fonction pour afficher une erreur de niveau requis (non-bloquante)
function showLevelRequiredError(itemName, requiredLevel, currentLevel) {
    // PROTECTION : éviter les notifications multiples
    if (levelErrorShown) {
        console.log('⚠️ Notification déjà affichée, ignorée');
        return;
    }
    
    levelErrorShown = true;
    console.log(`⚠️ Niveau insuffisant pour équiper ${itemName}`);
    
    // Créer une notification temporaire non-bloquante
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        border: 2px solid #a93226;
        max-width: 400px;
        animation: errorNotificationShow 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="font-size: 18px; margin-bottom: 10px;">⚠️ Niveau insuffisant</div>
        <div style="font-size: 14px; margin-bottom: 8px;">Pour équiper <strong>${itemName}</strong></div>
        <div style="font-size: 14px;">Niveau requis: <strong>${requiredLevel}</strong> | Votre niveau: <strong>${currentLevel}</strong></div>
        <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">Cliquez pour fermer</div>
    `;
    
    // Ajouter l'animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes errorNotificationShow {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes errorNotificationHide {
            from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(style);
    
    // Fonction pour fermer la notification
    function closeNotification() {
        levelErrorShown = false; // IMPORTANT : Reset du flag pour permettre de futures notifications
        notification.style.animation = 'errorNotificationHide 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 300);
    }
    
    // Fermer au clic
    notification.addEventListener('click', closeNotification);
    
    // Fermer automatiquement après 5 secondes
    setTimeout(closeNotification, 5000);
    
    // Fermer avec Échap
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeNotification();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Ajouter à la page
    document.body.appendChild(notification);
    
    console.log('📢 Notification de niveau requis affichée');
}

// Fonction de test pour vérifier que l'équipement fonctionne correctement
function testEquipmentSystem() {
    console.log('🧪 === TEST DU SYSTÈME D\'ÉQUIPEMENT ===');
    
    // Vérifier que le joueur existe
    if (!window.player) {
        console.error('❌ Joueur non trouvé');
        return;
    }
    
    console.log(`🎮 Niveau joueur: ${window.player.level}`);
    
    // Compter les items dans l'inventaire
    const inventoryItems = window.inventoryAll.filter(slot => slot.item !== null);
    console.log(`📦 Items dans l'inventaire: ${inventoryItems.length}`);
    
    // Afficher les équipements actuels
    console.log('⚔️ Équipements actuels:');
    if (window.equippedItems) {
        Object.entries(window.equippedItems).forEach(([slot, item]) => {
            console.log(`  ${slot}: ${item ? item.name : 'Vide'}`);
        });
    } else {
        console.log('  Aucun équipement trouvé');
    }
    
    // Tester la notification d'erreur de niveau
    console.log('🧪 Test de la notification d\'erreur...');
    showLevelRequiredError('Test Item', 99, window.player.level);
    
    console.log('✅ Test terminé - Essayez d\'équiper un item par double-clic');
    console.log('📋 Instructions:');
    console.log('  1. Double-cliquez sur UN SEUL item d\'équipement');
    console.log('  2. Vérifiez qu\'il n\'y a PAS d\'équipement en masse');
    console.log('  3. Essayez d\'équiper un item de niveau trop élevé');
    console.log('  4. Vérifiez que la notification s\'affiche et se ferme');
}

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
        case 'ressources_alchimiste':
            // S'assurer que l'inventaire des ressources alchimiste existe
            if (!window.inventoryRessourcesAlchimiste) {
                console.log('🔧 Initialisation de l\'inventaire ressources alchimiste');
                window.inventoryRessourcesAlchimiste = Array.from({ length: 80 }, () => ({ item: null, category: 'ressources_alchimiste' }));
            }
            targetInventory = window.inventoryRessourcesAlchimiste;
            break;
        default:
            targetInventory = window.inventoryAll;
            break;
    }
    
    // Pour les ressources empilables, chercher d'abord un slot existant
    if (item.stackable && item.maxStack) {
        const existingSlot = targetInventory.findIndex(slot => 
            slot && slot.item && slot.item.id === itemId && 
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
                slot && slot.item && slot.item.id === itemId && 
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
    const emptySlot = targetInventory.findIndex(slot => slot && slot.item === null);
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

// Fonction pour retirer un item spécifique d'un slot particulier (pour éviter l'équipement en masse)
function removeSpecificItemFromInventory(item, slotIndex) {
    console.log(`🗑️ Suppression spécifique de ${item.name} du slot ${slotIndex}`);
    
    // Identifier l'inventaire source basé sur la catégorie de l'item
    let targetInventory = null;
    if (item.category === 'equipement' || item.type === 'coiffe' || item.type === 'cape' || 
        item.type === 'ceinture' || item.type === 'bottes' || item.type === 'anneau' || 
        item.type === 'amulette' || item.type === 'arme') {
        targetInventory = window.inventoryEquipement;
    } else if (item.category === 'potion' || item.type === 'consommable' || item.type === 'potion') {
        targetInventory = window.inventoryPotions;
    } else if (item.category === 'ressource' || item.type === 'ressource') {
        targetInventory = window.inventoryRessources;
    } else {
        // Par défaut, utiliser l'inventaire principal
        targetInventory = window.inventoryAll;
    }
    
    // Supprimer seulement l'item du slot spécifique
    if (targetInventory && slotIndex >= 0 && slotIndex < targetInventory.length) {
        if (targetInventory[slotIndex].item && targetInventory[slotIndex].item.id === item.id) {
            targetInventory[slotIndex] = { item: null, category: targetInventory[slotIndex].category };
            console.log(`✅ Item ${item.name} supprimé du slot ${slotIndex}`);
        }
    }
    
    // Supprimer aussi de l'inventaire principal si c'est différent
    if (targetInventory !== window.inventoryAll) {
        const mainIndex = window.inventoryAll.findIndex(slot => 
            slot.item && slot.item.id === item.id && slot.item.name === item.name
        );
        if (mainIndex !== -1) {
            window.inventoryAll[mainIndex] = { item: null, category: null };
        }
    }
    
    // Réorganiser les inventaires
    reorganizeInventory(targetInventory);
    if (targetInventory !== window.inventoryAll) {
        reorganizeInventory(window.inventoryAll);
    }
}

// Fonction utilitaire pour retirer un item de tous les inventaires (par id)
function removeItemFromAllInventories(itemId) {
    // Retire de l'inventaire principal
    const mainIndex = window.inventoryAll.findIndex(slot => slot.item && slot.item.id === itemId);
    if (mainIndex !== -1) {
        window.inventoryAll[mainIndex] = { item: null, category: null };
        reorganizeInventory(window.inventoryAll);
    } else {
        // Essayer de trouver par nom si l'id ne correspond pas
        const item = equipmentDatabase[itemId];
        if (item) {
            const nameIndex = window.inventoryAll.findIndex(slot => slot.item && slot.item.name === item.name);
            if (nameIndex !== -1) {
                window.inventoryAll[nameIndex] = { item: null, category: null };
                reorganizeInventory(window.inventoryAll);
            } else {
                console.error(`Item non trouvé dans inventoryAll même par nom`);
            }
        }
    }
    
    // Retire de chaque catégorie
    [window.inventoryEquipement, window.inventoryPotions, window.inventoryRessources].forEach((inv, index) => {
        const invName = ['inventoryEquipement', 'inventoryPotions', 'inventoryRessources'][index];
        const idx = inv.findIndex(slot => slot.item && slot.item.id === itemId);
        if (idx !== -1) {
            inv[idx] = { item: null, category: inv[idx].category };
            reorganizeInventory(inv);
        } else {
            console.error(`Item non trouvé dans ${invName}`);
        }
    });
    
    updateAllGrids();
    
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

// Fonction pour retirer une quantité spécifique d'un item
function removeItemFromInventory(itemId, quantity = 1) {
    let remainingQuantity = quantity;
    
    // Retirer de l'inventaire principal
    if (window.inventoryAll) {
        for (let i = 0; i < window.inventoryAll.length && remainingQuantity > 0; i++) {
            const slot = window.inventoryAll[i];
            if (slot.item && slot.item.id === itemId) {
                const slotQuantity = slot.item.quantity || 1;
                const toRemove = Math.min(remainingQuantity, slotQuantity);
                
                if (slotQuantity <= toRemove) {
                    // Retirer tout l'item du slot
                    window.inventoryAll[i] = { item: null, category: null };
                    remainingQuantity -= slotQuantity;
                } else {
                    // Réduire la quantité
                    slot.item.quantity = slotQuantity - toRemove;
                    remainingQuantity -= toRemove;
                }
            }
        }
        reorganizeInventory(window.inventoryAll);
    }
    
    // Retirer de chaque catégorie
    [window.inventoryEquipement, window.inventoryPotions, window.inventoryRessources].forEach((inv, index) => {
        const invName = ['inventoryEquipement', 'inventoryPotions', 'inventoryRessources'][index];
        for (let i = 0; i < inv.length && remainingQuantity > 0; i++) {
            const slot = inv[i];
            if (slot.item && slot.item.id === itemId) {
                const slotQuantity = slot.item.quantity || 1;
                const toRemove = Math.min(remainingQuantity, slotQuantity);
                
                if (slotQuantity <= toRemove) {
                    // Retirer tout l'item du slot
                    inv[i] = { item: null, category: slot.category };
                    remainingQuantity -= slotQuantity;
                } else {
                    // Réduire la quantité
                    slot.item.quantity = slotQuantity - toRemove;
                    remainingQuantity -= toRemove;
                }
            }
        }
        reorganizeInventory(inv);
    });
    
    updateAllGrids();
    
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
    
    return quantity - remainingQuantity; // Retourne le nombre d'items effectivement retirés
}

// Modifie handleItemClick pour synchroniser les retraits
function handleItemClick(item, slotIndex, category) {
    
    // Vérifier si l'item est équipable (utiliser type ou slot)
    const isEquippable = (item.type === 'coiffe' || item.type === 'cape' || item.type === 'amulette' || item.type === 'anneau' || item.type === 'ceinture' || item.type === 'bottes') ||
                        (item.slot === 'coiffe' || item.slot === 'cape' || item.slot === 'amulette' || item.slot === 'anneau' || item.slot === 'ceinture' || item.slot === 'bottes');
    
    // Vérifier si l'item est une potion consommable
    const isPotion = item.type === 'consommable' || 
                    item.type === 'potion' ||
                    item.category === 'potion' ||
                    (item.id && item.id.includes('potion'));
    
    console.log('🔍 handleItemClick - Type:', item.type, 'Category:', item.category, 'ID:', item.id);
    console.log('🔍 handleItemClick - Est une potion:', isPotion);
    
    if (isEquippable) {
        // Équiper l'item
        if (equipItem(item.id)) {
            // Retirer SEULEMENT cet item spécifique (évite l'équipement en masse)
            removeSpecificItemFromInventory(item, slotIndex);
            updateAllGrids();
            updateEquipmentDisplay();
            updateStatsDisplay();
            
            // Sauvegarde automatique après équipement
            if (typeof window.autoSaveOnEvent === 'function') {
                window.autoSaveOnEvent();
            }
            
            // Vérifier le progrès de la quête de craft après avoir équipé un item
            if (typeof window.checkCraftQuestProgress === 'function') {
                window.checkCraftQuestProgress();
            }
        } else {
            console.error('Échec de l\'équipement de', item.name);
            // Afficher un message d'erreur si le niveau n'est pas suffisant
            if (item.levelRequired && player.level < item.levelRequired) {
                // Utiliser une notification non-bloquante au lieu d'alert()
                showLevelRequiredError(item.name, item.levelRequired, player.level);
            }
        }
    } else if (isPotion) {
        // Utiliser la potion
        console.log('🧪 Tentative d\'utilisation de potion:', item.name, item.id);
        
        // Utiliser l'ancien système de potions
        if (typeof window.useHealingPotion === 'function') {
            if (window.useHealingPotion(item.id)) {
                // Retirer manuellement la potion de l'inventaire
                removeItemFromInventory(item.id, 1);
                updateAllGrids();
            }
        } else {
            console.error('❌ Système de potions non disponible');
        }
    } else {
        console.log('Item non utilisable:', item.name, 'Type:', item.type);
    }
}

// Fonction pour gérer le clic sur un slot d'équipement
function handleEquipmentSlotClick(slotType) {
    
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
window.removeSpecificItemFromInventory = removeSpecificItemFromInventory;
window.removeItemFromInventory = removeItemFromInventory;
window.handleItemClick = handleItemClick;
window.handleEquipmentSlotClick = handleEquipmentSlotClick;
window.showLevelRequiredError = showLevelRequiredError;
window.testEquipmentSystem = testEquipmentSystem;

// Fonction de diagnostic rapide
function diagEquipmentIssues() {
    console.log('🔧 === DIAGNOSTIC ÉQUIPEMENT ===');
    
    // 1. Vérifier les fonctions critiques
    const criticalFunctions = [
        'unequipItem', 'getItemInSlot', 'closeEquipmentDetailModal', 
        'showEquipmentDetailModal', 'handleEquipmentSlotClick'
    ];
    
    console.log('📊 Fonctions disponibles:');
    criticalFunctions.forEach(func => {
        const available = typeof window[func] === 'function';
        console.log(`  ${func}: ${available ? '✅' : '❌'}`);
        if (!available && func === 'unequipItem') {
            console.log('  ⚠️ unequipItem manquant - problème de déséquipement');
        }
        if (!available && func === 'closeEquipmentDetailModal') {
            console.log('  ⚠️ closeEquipmentDetailModal manquant - impossible de fermer les fiches');
        }
    });
    
    // 2. Vérifier les éléments DOM
    console.log('📊 Éléments DOM:');
    const equipSlots = document.querySelectorAll('.equip-slot');
    const closeBtn = document.getElementById('close-equipment-detail');
    const modal = document.getElementById('equipment-detail-modal');
    
    console.log(`  Slots équipement: ${equipSlots.length} trouvés`);
    console.log(`  Bouton fermeture: ${closeBtn ? '✅' : '❌'}`);
    console.log(`  Modal équipement: ${modal ? '✅' : '❌'}`);
    
    // 3. Test simple des fonctions
    console.log('🧪 Tests rapides:');
    if (typeof window.unequipItem === 'function') {
        console.log('  ✅ unequipItem disponible pour déséquipement');
    } else {
        console.log('  ❌ unequipItem indisponible - DÉSÉQUIPEMENT CASSÉ');
    }
    
    if (typeof window.closeEquipmentDetailModal === 'function') {
        console.log('  ✅ closeEquipmentDetailModal disponible');
    } else {
        console.log('  ❌ closeEquipmentDetailModal indisponible - FERMETURE CASSÉE');
    }
    
    return {
        unequipAvailable: typeof window.unequipItem === 'function',
        closeModalAvailable: typeof window.closeEquipmentDetailModal === 'function',
        slotsCount: equipSlots.length,
        hasCloseBtn: !!closeBtn
    };
}

window.diagEquipmentIssues = diagEquipmentIssues;

// Fonction de réparation automatique
function fixEquipmentIssues() {
    console.log('🔧 === RÉPARATION AUTOMATIQUE ===');
    
    const diagnostic = diagEquipmentIssues();
    let issuesFixed = 0;
    
    // 1. Corriger l'absence d'unequipItem (depuis equipment-system.js)
    if (!diagnostic.unequipAvailable) {
        console.log('🔧 Réparation: unequipItem manquant');
        window.unequipItem = function(slot) {
            if (!window.equippedItems) return false;
            
            const item = window.equippedItems[slot];
            if (!item) return false;
            
            // Retirer l'équipement
            window.equippedItems[slot] = null;
            
            // Recalculer les stats
            if (typeof window.applyEquipmentStats === 'function') {
                window.applyEquipmentStats();
            }
            
            console.log(`✅ Déséquipé: ${item.name}`);
            return true;
        };
        issuesFixed++;
    }
    
    // 2. Corriger l'absence de getItemInSlot
    if (typeof window.getItemInSlot !== 'function') {
        console.log('🔧 Réparation: getItemInSlot manquant');
        window.getItemInSlot = function(slot) {
            if (!window.equippedItems) return null;
            return window.equippedItems[slot];
        };
        issuesFixed++;
    }
    
    // 3. Corriger l'absence de closeEquipmentDetailModal
    if (!diagnostic.closeModalAvailable) {
        console.log('🔧 Réparation: closeEquipmentDetailModal manquant');
        window.closeEquipmentDetailModal = function() {
            const modal = document.getElementById('equipment-detail-modal');
            if (modal) {
                modal.style.display = 'none';
                console.log('✅ Modal fermée');
            }
        };
        issuesFixed++;
    }
    
    // 4. TOUJOURS réinitialiser les événements de fermeture (problème récurrent)
    console.log('🔧 Réparation: Forcer les événements de fermeture');
    setTimeout(() => {
        const closeBtn = document.getElementById('close-equipment-detail');
        const modal = document.getElementById('equipment-detail-modal');
        
        if (closeBtn) {
            // Supprimer TOUS les anciens événements de clic
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            // Ajouter le nouvel événement
            newCloseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔧 Fermeture forcée de la modal via X');
                if (window.closeEquipmentDetailModal) {
                    window.closeEquipmentDetailModal();
                }
            });
            issuesFixed++;
        }
        
        // Corriger aussi la fermeture par clic extérieur
        if (modal) {
            // Supprimer les anciens événements
            const newModal = modal.cloneNode(true);
            modal.parentNode.replaceChild(newModal, modal);
            
            // Nouveau gestionnaire de clic extérieur
            newModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    console.log('🔧 Fermeture forcée de la modal via clic extérieur');
                    if (window.closeEquipmentDetailModal) {
                        window.closeEquipmentDetailModal();
                    }
                }
            });
            issuesFixed++;
        }
    }, 100);
    
    // 5. Forcer la réinitialisation des événements d'équipement
    if (diagnostic.slotsCount > 0) {
        console.log('🔧 Réparation: Événements équipement');
        setTimeout(() => {
            document.querySelectorAll('.equip-slot').forEach(slot => {
                const slotType = slot.dataset.slot;
                
                // Ajouter l'événement de double-clic pour déséquiper
                slot.addEventListener('dblclick', function(e) {
                    e.preventDefault();
                    console.log(`🔧 Double-clic réparé sur ${slotType}`);
                    
                    const equippedItem = window.getItemInSlot(slotType);
                    if (equippedItem && window.unequipItem(slotType)) {
                        // Remettre dans l'inventaire d'équipement
                        const emptySlot = window.inventoryEquipement.findIndex(slot => slot.item === null);
                        if (emptySlot !== -1) {
                            window.inventoryEquipement[emptySlot] = {
                                item: equippedItem,
                                category: 'equipement'
                            };
                        }
                        
                        // CORRECTION CRITIQUE : Aussi remettre dans l'inventaire principal (onglet TOUT)
                        const emptyMainSlot = window.inventoryAll.findIndex(slot => slot.item === null);
                        if (emptyMainSlot !== -1) {
                            window.inventoryAll[emptyMainSlot] = {
                                item: equippedItem,
                                category: 'equipement'
                            };
                            console.log('✅ Item ajouté à l\'inventaire TOUT');
                        }
                        
                        // Mettre à jour l'affichage
                        if (typeof window.updateAllGrids === 'function') {
                            window.updateAllGrids();
                        }
                        if (typeof window.updateEquipmentDisplay === 'function') {
                            window.updateEquipmentDisplay();
                        }
                        
                        console.log(`✅ ${equippedItem.name} déséquipé et remis en inventaire`);
                    }
                });
            });
            issuesFixed++;
        }, 150);
    }
    
    console.log(`✅ Réparation terminée: ${issuesFixed} problèmes corrigés`);
    console.log('🧪 Teste maintenant:');
    console.log('  - Double-clic sur équipement équipé → déséquiper');
    console.log('  - Clic simple sur item → ouvrir fiche');
    console.log('  - Clic sur X dans fiche → fermer');
    
    return issuesFixed;
}

window.fixEquipmentIssues = fixEquipmentIssues;

// Fonction tout-en-un : diagnostic + réparation
function repairEquipment() {
    console.log('🚑 === RÉPARATION COMPLÈTE DES ÉQUIPEMENTS ===');
    console.log('');
    
    // 1. Diagnostic
    const issues = diagEquipmentIssues();
    console.log('');
    
    // 2. Réparation automatique
    const fixed = fixEquipmentIssues();
    console.log('');
    
    // 3. Résumé final
    console.log('📋 === RÉSUMÉ ===');
    if (fixed > 0) {
        console.log(`✅ ${fixed} problèmes corrigés automatiquement`);
        console.log('🎯 Teste maintenant les fonctionnalités :');
        console.log('  1. Double-clic sur équipement équipé → déséquiper');
        console.log('  2. Clic simple sur item → ouvrir fiche');
        console.log('  3. Clic sur X ou extérieur → fermer fiche');
    } else {
        console.log('ℹ️ Aucun problème détecté ou toutes les fonctions sont déjà disponibles');
        console.log('🤔 Si le problème persiste, il peut être plus complexe');
    }
    
    return { issuesFound: !issues.unequipAvailable || !issues.closeModalAvailable, issuesFixed: fixed };
}

window.repairEquipment = repairEquipment; 
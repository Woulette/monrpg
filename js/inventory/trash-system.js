// Système de suppression d'items - Poubelle d'inventaire

let isDraggingToTrash = false;
let draggedItemData = null;
let draggedSlotIndex = null;

// Initialisation du système de poubelle
function initTrashSystem() {
    const trashContainer = document.getElementById('trash-container');
    if (!trashContainer) {
        console.warn('⚠️ Trash container non trouvé');
        return;
    }

    // Événements de drag & drop pour la poubelle
    trashContainer.addEventListener('dragover', handleTrashDragOver);
    trashContainer.addEventListener('dragleave', handleTrashDragLeave);
    trashContainer.addEventListener('drop', handleTrashDrop);
    
    // Événement de clic direct sur la poubelle
    trashContainer.addEventListener('click', handleTrashClick);
    
    console.log('✅ Système de poubelle initialisé');
}

// Gestion du survol de la poubelle pendant le drag
function handleTrashDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const trashContainer = document.getElementById('trash-container');
    trashContainer.classList.add('drag-over');
    
    // Le texte est maintenant dans le tooltip, pas de changement nécessaire
}

// Gestion de la sortie de la zone de poubelle
function handleTrashDragLeave(e) {
    const trashContainer = document.getElementById('trash-container');
    trashContainer.classList.remove('drag-over');
    
    // Pas de texte à remettre
}

// Gestion du drop sur la poubelle
function handleTrashDrop(e) {
    e.preventDefault();
    
    const trashContainer = document.getElementById('trash-container');
    trashContainer.classList.remove('drag-over');
    
    // Récupérer les données de l'item
    const itemData = e.dataTransfer.getData('application/json');
    const slotIndex = e.dataTransfer.getData('text/slot-index');
    
    if (itemData && slotIndex !== undefined) {
        try {
            const item = JSON.parse(itemData);
            const slotIdx = parseInt(slotIndex);
            
            // Demander confirmation
            const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" ?`);
            
            if (confirmed) {
                deleteItemFromInventory(item, slotIdx);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
        }
    }
    
    // Pas de texte à remettre
}

// Gestion du clic sur la poubelle (pour sélection manuelle)
function handleTrashClick() {
    showItemSelectionModal();
}

// Supprimer un item de l'inventaire
function deleteItemFromInventory(item, slotIndex) {
    console.log('🗑️ Suppression de l\'item:', item.name, 'depuis le slot:', slotIndex);
    
    // Trouver l'inventaire correspondant selon la catégorie
    let targetInventory = null;
    
    if (item.category === 'equipement') {
        targetInventory = window.inventoryEquipement;
    } else if (item.category === 'potions' || item.category === 'potion') {
        targetInventory = window.inventoryPotions;
    } else if (item.category === 'ressources') {
        targetInventory = window.inventoryRessources;
    } else if (item.category === 'ressources_alchimiste') {
        targetInventory = window.inventoryRessourcesAlchimiste;
    } else {
        targetInventory = window.inventoryAll;
    }
    
    // Supprimer l'item
    if (targetInventory && targetInventory[slotIndex]) {
        targetInventory[slotIndex].item = null;
        
        // Synchroniser avec l'inventaire principal
        if (window.inventoryAll && window.inventoryAll[slotIndex]) {
            window.inventoryAll[slotIndex].item = null;
        }
        
        // Mettre à jour l'affichage
        if (typeof window.updateAllGrids === 'function') {
            window.updateAllGrids();
        }
        
        // Afficher un message de confirmation
        showDeleteConfirmation(item.name);
        
        console.log('✅ Item supprimé avec succès');
    } else {
        console.error('❌ Impossible de supprimer l\'item - slot non trouvé');
    }
}

// Afficher une modal de sélection d'items (clic direct sur poubelle)
function showItemSelectionModal() {
    // Créer une modal simple pour sélectionner un item à supprimer
    const modal = document.createElement('div');
    modal.id = 'item-selection-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: #2c3e50;
        border-radius: 10px;
        padding: 20px;
        max-width: 500px;
        max-height: 600px;
        overflow-y: auto;
        color: white;
    `;
    
    content.innerHTML = `
        <h3 style="margin-top: 0; color: #e74c3c;">🗑️ Sélectionner un objet à supprimer</h3>
        <div id="items-to-delete" style="max-height: 400px; overflow-y: auto;"></div>
        <button onclick="this.closest('#item-selection-modal').remove()" 
                style="margin-top: 15px; padding: 10px 20px; background: #34495e; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Annuler
        </button>
    `;
    
    modal.appendChild(content);
    
    // Remplir la liste des items
    const itemsList = content.querySelector('#items-to-delete');
    const allItems = getAllInventoryItems();
    
    if (allItems.length === 0) {
        itemsList.innerHTML = '<p style="text-align: center; color: #95a5a6;">Aucun objet dans l\'inventaire</p>';
    } else {
        allItems.forEach((itemData, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = `
                display: flex;
                align-items: center;
                padding: 10px;
                margin: 5px 0;
                background: #34495e;
                border-radius: 5px;
                cursor: pointer;
                transition: background 0.2s;
            `;
            
            itemDiv.onmouseover = () => itemDiv.style.background = '#4a5f7a';
            itemDiv.onmouseout = () => itemDiv.style.background = '#34495e';
            
            itemDiv.innerHTML = `
                <img src="${itemData.item.icon}" alt="${itemData.item.name}" style="width: 32px; height: 32px; margin-right: 10px;">
                <span style="flex: 1;">${itemData.item.name}</span>
                <span style="color: #e74c3c; font-weight: bold;">✖</span>
            `;
            
            itemDiv.onclick = () => {
                const confirmed = confirm(`Supprimer "${itemData.item.name}" ?`);
                if (confirmed) {
                    deleteItemFromInventory(itemData.item, itemData.slotIndex);
                    modal.remove();
                }
            };
            
            itemsList.appendChild(itemDiv);
        });
    }
    
    document.body.appendChild(modal);
    
    // Fermer en cliquant à l'extérieur
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// Récupérer tous les items de l'inventaire
function getAllInventoryItems() {
    const items = [];
    
    // Parcourir tous les inventaires
    const inventories = [
        { inventory: window.inventoryAll, category: 'all' },
        { inventory: window.inventoryEquipement, category: 'equipement' },
        { inventory: window.inventoryPotions, category: 'potions' },
        { inventory: window.inventoryRessources, category: 'ressources' },
        { inventory: window.inventoryRessourcesAlchimiste, category: 'ressources_alchimiste' }
    ];
    
    inventories.forEach(({ inventory, category }) => {
        if (inventory) {
            inventory.forEach((slot, index) => {
                if (slot && slot.item) {
                    items.push({
                        item: slot.item,
                        slotIndex: index,
                        category: category
                    });
                }
            });
        }
    });
    
    // Supprimer les doublons (un item peut être dans plusieurs inventaires)
    const uniqueItems = [];
    const seenItems = new Set();
    
    items.forEach(itemData => {
        const key = `${itemData.item.name}-${itemData.slotIndex}`;
        if (!seenItems.has(key)) {
            seenItems.add(key);
            uniqueItems.push(itemData);
        }
    });
    
    return uniqueItems;
}

// Afficher un message de confirmation de suppression
function showDeleteConfirmation(itemName) {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #e74c3c;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 2000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: fadeInOut 3s ease;
    `;
    
    message.textContent = `🗑️ "${itemName}" supprimé !`;
    
    // Ajouter l'animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(message);
    
    // Supprimer le message après l'animation
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 3000);
}

// Modifier la fonction de création des slots pour ajouter le drag & drop vers la poubelle
function enableTrashDragAndDrop() {
    const slots = document.querySelectorAll('.inventory-slot');
    
    slots.forEach((slot, index) => {
        if (slot.querySelector('img') || slot.querySelector('span[style*="font-size"]')) {
            slot.draggable = true;
            
            slot.addEventListener('dragstart', (e) => {
                // Récupérer les données de l'item depuis le slot
                const slotData = getSlotData(index);
                if (slotData && slotData.item) {
                    e.dataTransfer.setData('application/json', JSON.stringify(slotData.item));
                    e.dataTransfer.setData('text/slot-index', index.toString());
                    e.dataTransfer.effectAllowed = 'move';
                }
            });
        }
    });
}

// Fonction utilitaire pour récupérer les données d'un slot
function getSlotData(slotIndex) {
    // Déterminer quel inventaire est actuellement affiché
    const activeTab = document.querySelector('.inventory-tab.active');
    if (!activeTab) return null;
    
    const category = activeTab.getAttribute('data-category');
    let targetInventory = null;
    
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
    
    return targetInventory && targetInventory[slotIndex] ? targetInventory[slotIndex] : null;
}

// Exposer les fonctions globalement
window.initTrashSystem = initTrashSystem;
window.enableTrashDragAndDrop = enableTrashDragAndDrop;
window.deleteItemFromInventory = deleteItemFromInventory;

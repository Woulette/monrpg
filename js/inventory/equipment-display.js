console.log("Fichier js/inventory/equipment-display.js chargé");

// Fonction pour mettre à jour l'affichage de l'équipement
function updateEquipmentDisplay() {
    console.log('🔄 Mise à jour de l\'affichage de l\'équipement...');
    console.log('📦 Équipement actuel:', window.equippedItems);
    
    // Mettre à jour les slots d'équipement
    document.querySelectorAll('.equip-slot').forEach(slot => {
        const slotType = slot.dataset.slot;
        const equippedItem = getItemInSlot(slotType);
        
        console.log(`Slot ${slotType}:`, equippedItem ? equippedItem.name : 'vide');
        
        if (equippedItem) {
            slot.innerHTML = `<img src="${equippedItem.icon}" alt="${equippedItem.name}" style="width:32px;height:32px;">`;
            slot.title = equippedItem.name;
        } else {
            slot.innerHTML = '<div class="slot-icon"></div>';
            slot.title = slotType;
        }
    });
    
    console.log('✅ Affichage de l\'équipement mis à jour');
}

// Initialiser l'affichage de l'équipement au démarrage
window.updateEquipmentDisplay = updateEquipmentDisplay; 
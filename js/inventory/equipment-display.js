// Fonction pour mettre à jour l'affichage de l'équipement
function updateEquipmentDisplay() {
    // Mettre à jour les slots d'équipement
    document.querySelectorAll('.equip-slot').forEach(slot => {
        const slotType = slot.dataset.slot;
        const equippedItem = getItemInSlot(slotType);
        
        if (equippedItem) {
            slot.innerHTML = `<img src="${equippedItem.icon}" alt="${equippedItem.name}" style="width:32px;height:32px;">`;
            slot.title = equippedItem.name;
        } else {
            slot.innerHTML = '<div class="slot-icon"></div>';
            slot.title = slotType;
        }
    });
}

// Initialiser l'affichage de l'équipement au démarrage
window.updateEquipmentDisplay = updateEquipmentDisplay; 
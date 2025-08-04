// Variables globales pour la fenêtre détaillée
let currentEquipmentDetailItem = null;
let currentEquipmentDetailIndex = null;
let clickTimeout = null;

// Variables pour le déplacement de la fenêtre
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Fonction pour afficher la fenêtre détaillée de l'équipement
function showEquipmentDetailModal(item, slotIndex) {
    currentEquipmentDetailItem = item;
    currentEquipmentDetailIndex = slotIndex;
    
    try {
        // Déterminer la catégorie de l'item
        let category = 'ÉQUIPEMENT';
        if (item.type === 'ressource' || item.category === 'ressource' || item.id === 'patte_corbeau' || item.id === 'plume_corbeau') {
            category = 'RESSOURCES';
        }
        
        // Remplir les informations
        document.getElementById('equipment-name').textContent = category;
        
        // Déterminer le type d'affichage
        let displayType = item.type.toUpperCase();
        if (item.id === 'plume_corbeau') {
            displayType = 'PLUME';
        } else if (item.id === 'patte_corbeau') {
            displayType = 'PATTES';
        } else if (item.id === 'certificat_corbeau') {
            displayType = 'OBJET SPÉCIAL';
        }
        
        document.getElementById('equipment-type').textContent = displayType;
        document.getElementById('equipment-rarity').textContent = item.rarity.toUpperCase();
        
        // Afficher le niveau requis
        if (item.levelRequired) {
            document.getElementById('equipment-level').textContent = `Niveau ${item.levelRequired}`;
            document.getElementById('equipment-level').parentElement.style.display = 'flex';
        } else {
            document.getElementById('equipment-level').parentElement.style.display = 'none';
        }
        
        document.getElementById('equipment-description').textContent = item.description;
        
        // Mettre le nom de l'équipement dans le titre
        document.getElementById('equipment-detail-title').textContent = item.name;
        
        // Remplir les stats (afficher seulement celles qui existent)
        const stats = item.stats || {};
        
        // Masquer toutes les lignes de stats d'abord
        document.getElementById('equipment-force').parentElement.style.display = 'none';
        document.getElementById('equipment-intelligence').parentElement.style.display = 'none';
        document.getElementById('equipment-agilite').parentElement.style.display = 'none';
        document.getElementById('equipment-defense').parentElement.style.display = 'none';
        document.getElementById('equipment-vie').parentElement.style.display = 'none';
        document.getElementById('equipment-chance').parentElement.style.display = 'none';
        document.getElementById('equipment-vitesse').parentElement.style.display = 'none';
        
        // Afficher seulement les stats qui existent
        if (stats.force) {
            document.getElementById('equipment-force').parentElement.style.display = 'flex';
            document.getElementById('equipment-force').textContent = `+${stats.force}`;
        }
        if (stats.intelligence) {
            document.getElementById('equipment-intelligence').parentElement.style.display = 'flex';
            document.getElementById('equipment-intelligence').textContent = `+${stats.intelligence}`;
        }
        if (stats.agilite) {
            document.getElementById('equipment-agilite').parentElement.style.display = 'flex';
            document.getElementById('equipment-agilite').textContent = `+${stats.agilite}`;
        }
        if (stats.defense) {
            document.getElementById('equipment-defense').parentElement.style.display = 'flex';
            document.getElementById('equipment-defense').textContent = `+${stats.defense}`;
        }
        if (stats.vie) {
            document.getElementById('equipment-vie').parentElement.style.display = 'flex';
            document.getElementById('equipment-vie').textContent = `+${stats.vie}`;
        }
        if (stats.chance) {
            document.getElementById('equipment-chance').parentElement.style.display = 'flex';
            document.getElementById('equipment-chance').textContent = `+${stats.chance}`;
        }
        if (stats.vitesse) {
            document.getElementById('equipment-vitesse').parentElement.style.display = 'flex';
            document.getElementById('equipment-vitesse').textContent = `+${stats.vitesse}`;
        }
        
        // Gérer les boutons
        const equipButton = document.getElementById('equip-button');
        const unequipButton = document.getElementById('unequip-button');
        
        // Masquer les boutons pour les ressources
        if (category === 'RESSOURCES') {
            equipButton.style.display = 'none';
            unequipButton.style.display = 'none';
        } else {
            // Vérifier si l'item est déjà équipé
            const isEquipped = isItemEquipped(item);
            
            if (isEquipped) {
                equipButton.style.display = 'none';
                unequipButton.style.display = 'inline-block';
            } else {
                equipButton.style.display = 'inline-block';
                unequipButton.style.display = 'none';
            }
        }
        
        // Afficher la fenêtre
        const modal = document.getElementById('equipment-detail-modal');
        const modalContent = document.getElementById('equipment-detail-content');
        if (modal) {
            modal.style.display = 'block';
            // Réinitialiser la position au centre
            modalContent.style.left = '50%';
            modalContent.style.top = '50%';
            modalContent.style.transform = 'translate(-50%, -50%)';
        }
    } catch (error) {
        console.error('Erreur dans showEquipmentDetailModal:', error);
    }
}

// Fonction pour fermer l'inventaire
function closeInventory() {
    document.getElementById('inventory-modal').style.display = 'none';
}

// Fonction pour fermer la fenêtre détaillée
function closeEquipmentDetailModal() {
    document.getElementById('equipment-detail-modal').style.display = 'none';
    currentEquipmentDetailItem = null;
    currentEquipmentDetailIndex = null;
}

// Fonction pour vérifier si un item est équipé
function isItemEquipped(item) {
    if (!window.equippedItems) return false;
    return Object.values(window.equippedItems).some(equippedItem => 
        equippedItem && equippedItem.id === item.id
    );
}

// Exporter les fonctions
window.showEquipmentDetailModal = showEquipmentDetailModal;
window.closeEquipmentDetailModal = closeEquipmentDetailModal;
window.closeInventory = closeInventory; 
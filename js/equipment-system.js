// Système d'équipement - Mon RPG 2D

// Base de données des équipements
const equipmentDatabase = {
    // Coiffes
    coiffe_corbeau: {
        id: 'coiffe_corbeau',
        name: 'Coiffe de Corbeau',
        type: 'coiffe',
        slot: 'coiffe',
        icon: 'assets/equipements/coiffes/coiffecorbeau.png',
        description: 'Une coiffe mystérieuse qui vous donne l\'apparence d\'un corbeau.',
        rarity: 'rare',
        stats: {
            force: 5,
            defense: 3
        }
    },
    
    // Capes
    cape_corbeau: {
        id: 'cape_corbeau',
        name: 'Cape de Corbeau',
        type: 'cape',
        slot: 'cape',
        icon: 'assets/equipements/capes/capecorbeau.png',
        description: 'Une cape sombre qui vous permet de vous fondre dans l\'ombre.',
        rarity: 'rare',
        stats: {
            agilite: 8,
            defense: 5
        }
    },
    
    // Amulettes
    amulette_corbeau: {
        id: 'amulette_corbeau',
        name: 'Amulette de Corbeau',
        type: 'amulette',
        slot: 'amulette',
        icon: 'assets/equipements/colliers/colliercorbeau.png',
        description: 'Une amulette mystique qui renforce votre connexion avec les corbeaux.',
        rarity: 'rare',
        stats: {
            intelligence: 10,
            chance: 5
        }
    },
    
    // Anneaux
    anneau_corbeau: {
        id: 'anneau_corbeau',
        name: 'Anneau de Corbeau',
        type: 'anneau',
        slot: 'anneau',
        icon: 'assets/equipements/anneaux/anneaucorbeau.png',
        description: 'Un anneau enchanté qui vous donne la vision perçante d\'un corbeau.',
        rarity: 'rare',
        stats: {
            chance: 8,
            agilite: 3
        }
    },
    
    // Ceintures
    ceinture_corbeau: {
        id: 'ceinture_corbeau',
        name: 'Ceinture de Corbeau',
        type: 'ceinture',
        slot: 'ceinture',
        icon: 'assets/equipements/ceintures/ceinturecorbeau.png',
        description: 'Une ceinture robuste qui renforce votre endurance.',
        rarity: 'rare',
        stats: {
            defense: 8,
            vie: 20
        }
    },
    
    // Bottes
    bottes_corbeau: {
        id: 'bottes_corbeau',
        name: 'Bottes de Corbeau',
        type: 'bottes',
        slot: 'bottes',
        icon: 'assets/equipements/bottes/bottecorbeau.png',
        description: 'Des bottes légères qui vous permettent de marcher silencieusement.',
        rarity: 'rare',
        stats: {
            vitesse: 10,
            agilite: 5
        }
    },
    
    // Ressources (pour compatibilité avec le système de loot)
    patte_corbeau: {
        id: 'patte_corbeau',
        name: 'Patte de Corbeau',
        type: 'ressource',
        icon: 'assets/objets/pattedecorbeau.png',
        description: 'Une patte de corbeau mystérieuse.',
        rarity: 'common',
        stackable: true,
        maxStack: 99
    },
    
    plume_corbeau: {
        id: 'plume_corbeau',
        name: 'Plume de Corbeau',
        type: 'ressource',
        icon: 'assets/objets/plumedecorbeau.png',
        description: 'Une plume noire brillante.',
        rarity: 'common',
        stackable: true,
        maxStack: 99
    },
    
    certificat_donjon_corbeau: {
        id: 'certificat_donjon_corbeau',
        name: 'Certificat Donjon Corbeau',
        type: 'ressource',
        icon: 'assets/objets/certificadonjoncorbeau.png',
        description: 'Un certificat prouvant votre valeur auprès des corbeaux mais vous donnant aussi accès au donjon slime.',
        rarity: 'rare',
        stackable: true,
        maxStack: 99
    }
};

// Fonction pour équiper un item
function equipItem(itemId) {
    const item = equipmentDatabase[itemId];
    if (!item) {
        console.error(`Équipement ${itemId} non trouvé`);
        return false;
    }
    
    // S'assurer que window.equippedItems existe
    if (!window.equippedItems) {
        window.equippedItems = {
            coiffe: null,
            cape: null,
            collier: null,
            anneau: null,
            ceinture: null,
            bottes: null
        };
    }
    
    // Déséquiper l'item actuel dans ce slot
    if (window.equippedItems[item.slot]) {
        unequipItem(item.slot);
    }
    
    // Équiper le nouvel item
    window.equippedItems[item.slot] = item;
    
    // Appliquer les bonus de stats
    applyEquipmentStats();
    
    console.log(`Équipé: ${item.name}`);
    
    // Sauvegarde automatique lors de l'équipement
    if (typeof autoSaveOnEvent === 'function') {
        autoSaveOnEvent();
    }
    
    return true;
}

// Fonction pour déséquiper un item
function unequipItem(slot) {
    if (!window.equippedItems) return false;
    
    const item = window.equippedItems[slot];
    if (!item) return false;
    
    // Retirer les bonus de stats
    removeEquipmentStats(item);
    
    // Retirer l'équipement
    window.equippedItems[slot] = null;
    
    console.log(`Déséquipé: ${item.name}`);
    
    // Sauvegarde automatique lors du déséquipement
    if (typeof autoSaveOnEvent === 'function') {
        autoSaveOnEvent();
    }
    
    return true;
}

// Appliquer les stats de l'équipement
function applyEquipmentStats() {
    // Réinitialiser les stats de base
    player.maxLife = 50; // Stats de base originales
    
    // Réinitialiser les stats d'équipement
    player.equipForce = 0;
    player.equipIntelligence = 0;
    player.equipAgilite = 0;
    player.equipDefense = 0;
    player.equipChance = 0;
    player.equipVitesse = 0;
    
    // Appliquer les bonus d'équipement aux stats d'équipement
    if (window.equippedItems) {
        Object.values(window.equippedItems).forEach(item => {
            if (item && item.stats) {
                if (item.stats.vie) player.maxLife += item.stats.vie;
                if (item.stats.force) player.equipForce += item.stats.force;
                if (item.stats.agilite) player.equipAgilite += item.stats.agilite;
                if (item.stats.defense) player.equipDefense += item.stats.defense;
                if (item.stats.chance) player.equipChance += item.stats.chance;
                if (item.stats.intelligence) player.equipIntelligence += item.stats.intelligence;
                if (item.stats.vitesse) player.equipVitesse += item.stats.vitesse;
            }
        });
    }
    
    // Recalculer les stats totales
    if (typeof recalculateTotalStats === 'function') {
        recalculateTotalStats();
    }
    
    // S'assurer que la vie actuelle ne dépasse pas le maximum
    if (player.life > player.maxLife) {
        player.life = player.maxLife;
    }
    
    // Mettre à jour l'affichage des stats
    if (typeof updateStatsDisplay === 'function') {
        updateStatsDisplay();
    }
}

// Retirer les stats d'un équipement
function removeEquipmentStats(item) {
    if (!item || !item.stats) return;
    
    if (item.stats.vie) player.maxLife -= item.stats.vie;
    if (item.stats.force) player.equipForce -= item.stats.force;
    if (item.stats.agilite) player.equipAgilite -= item.stats.agilite;
    if (item.stats.defense) player.equipDefense -= item.stats.defense;
    if (item.stats.chance) player.equipChance -= item.stats.chance;
    if (item.stats.intelligence) player.equipIntelligence -= item.stats.intelligence;
    if (item.stats.vitesse) player.equipVitesse -= item.stats.vitesse;
    
    // Recalculer les stats totales
    if (typeof recalculateTotalStats === 'function') {
        recalculateTotalStats();
    }
    
    // S'assurer que les stats totales ne descendent pas en dessous des stats de base
    player.force = Math.max(player.baseForce, player.force);
    player.agilite = Math.max(player.baseAgilite, player.agilite);
    player.defense = Math.max(player.baseDefense, player.defense);
    player.chance = Math.max(player.baseChance, player.chance);
    player.intelligence = Math.max(player.baseIntelligence, player.intelligence);
    player.vitesse = Math.max(player.baseVitesse, player.vitesse);
    player.maxLife = Math.max(50, player.maxLife);
    
    // Ajuster la vie si nécessaire
    if (player.life > player.maxLife) {
        player.life = player.maxLife;
    }
}

// Obtenir l'équipement actuel
function getCurrentEquipment() {
    return window.equippedItems || {};
}

// Vérifier si un slot est occupé
function isSlotOccupied(slot) {
    if (!window.equippedItems) return false;
    return window.equippedItems[slot] !== null;
}

// Obtenir l'item dans un slot
function getItemInSlot(slot) {
    if (!window.equippedItems) return null;
    return window.equippedItems[slot];
}

// Fonction d'initialisation
function initEquipmentSystem() {
    console.log("Initialisation du système d'équipement...");
    
    // S'assurer que window.equippedItems existe
    if (!window.equippedItems) {
        window.equippedItems = {
            coiffe: null,
            cape: null,
            amulette: null,
            anneau: null,
            ceinture: null,
            bottes: null
        };
    }
    
    applyEquipmentStats();
}

// Fonctions d'export
window.equipmentDatabase = equipmentDatabase;
window.equipItem = equipItem;
window.unequipItem = unequipItem;
window.getCurrentEquipment = getCurrentEquipment;
window.isSlotOccupied = isSlotOccupied;
window.getItemInSlot = getItemInSlot;
window.initEquipmentSystem = initEquipmentSystem; 
// Système d'équipement - Mon RPG 2D

// Équipement du joueur
const playerEquipment = {
    coiffe: null, // Correspond au slot dans le HTML
    cape: null,
    weapon: null,
    armor: null
};

// Base de données des équipements
const equipmentDatabase = {
    'coiffe_simple': {
        id: 'coiffe_simple',
        name: 'Corbacoiffe',
        type: 'coiffe',
        slot: 'coiffe', // Correspond au slot dans le HTML
        icon: 'assets/coiffecorbeau.png', // Image de la coiffe corbeau
        stats: {
            force: 1,
            agilite: 1,
            vie: 2,
            chance: 2
        },
        description: 'Une coiffe simple qui augmente légèrement vos capacités.',
        rarity: 'common',
        stackable: false
    },
    'cape_corbeau': {
        id: 'cape_corbeau',
        name: 'Corbacape',
        type: 'cape',
        slot: 'cape', // Correspond au slot dans le HTML
        icon: 'assets/capecorbeau.png', // Image de la cape corbeau
        stats: {
            agilite: 1,
            vie: 2,
            chance: 2,
            defense: 1
        },
        description: 'Une cape mystérieuse qui augmente vos capacités.',
        rarity: 'common',
        stackable: false
    },
    'collier_corbeau': {
        id: 'collier_corbeau',
        name: 'Corbollier',
        type: 'amulette',
        slot: 'amulette', // Correspond au slot dans le HTML
        icon: 'assets/colliercorbeau.png', // Image du collier corbeau
        stats: {
            intelligence: 2,
            vie: 1
        },
        description: 'Un collier mystérieux qui augmente l\'intelligence et la vie.',
        rarity: 'common',
        stackable: false
    },
    'anneau_corbeau': {
        id: 'anneau_corbeau',
        name: 'Corbaneau',
        type: 'anneau',
        slot: 'anneau', // Correspond au slot dans le HTML
        icon: 'assets/anneaucorbeau.png', // Image de l'anneau corbeau
        stats: {
            force: 1,
            intelligence: 1,
            vie: 1
        },
        description: 'Un anneau mystérieux qui augmente la force, l\'intelligence et la vie.',
        rarity: 'common',
        stackable: false
    },
    'ceinture_corbeau': {
        id: 'ceinture_corbeau',
        name: 'Corbature',
        type: 'ceinture',
        slot: 'ceinture', // Correspond au slot dans le HTML
        icon: 'assets/ceinturecorbeau.png', // Image de la ceinture corbeau
        stats: {
            vie: 1,
            chance: 2,
            intelligence: 1
        },
        description: 'Une ceinture mystérieuse qui augmente la vie, la chance et l\'intelligence.',
        rarity: 'common',
        stackable: false
    },
    'bottes_corbeau': {
        id: 'bottes_corbeau',
        name: 'Corbobotte',
        type: 'bottes',
        slot: 'bottes', // Correspond au slot dans le HTML
        icon: 'assets/bottecorbeau.png', // Image des bottes corbeau
        stats: {
            vitesse: 1
        },
        description: 'Des bottes mystérieuses qui augmentent la vitesse de déplacement de 0.01.',
        rarity: 'common',
        stackable: false
    }
};

// Fonction pour équiper un item
function equipItem(itemId) {
    const item = equipmentDatabase[itemId];
    if (!item) {
        console.error(`Équipement ${itemId} non trouvé`);
        return false;
    }
    
    // Déséquiper l'item actuel dans ce slot
    if (playerEquipment[item.slot]) {
        unequipItem(item.slot);
    }
    
    // Équiper le nouvel item
    playerEquipment[item.slot] = item;
    
    // Appliquer les bonus de stats
    applyEquipmentStats();
    
    console.log(`Équipé: ${item.name}`);
    return true;
}

// Fonction pour déséquiper un item
function unequipItem(slot) {
    const item = playerEquipment[slot];
    if (!item) return false;
    
    // Retirer les bonus de stats
    removeEquipmentStats(item);
    
    // Retirer l'équipement
    playerEquipment[slot] = null;
    
    console.log(`Déséquipé: ${item.name}`);
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
    Object.values(playerEquipment).forEach(item => {
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
    return playerEquipment;
}

// Vérifier si un slot est occupé
function isSlotOccupied(slot) {
    return playerEquipment[slot] !== null;
}

// Obtenir l'item dans un slot
function getItemInSlot(slot) {
    return playerEquipment[slot];
}

// Fonction d'initialisation
function initEquipmentSystem() {
    console.log("Initialisation du système d'équipement...");
    applyEquipmentStats();
}

// Fonctions d'export
window.equipmentDatabase = equipmentDatabase;
window.playerEquipment = playerEquipment;
window.equipItem = equipItem;
window.unequipItem = unequipItem;
window.getCurrentEquipment = getCurrentEquipment;
window.isSlotOccupied = isSlotOccupied;
window.getItemInSlot = getItemInSlot;
window.initEquipmentSystem = initEquipmentSystem; 
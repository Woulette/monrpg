console.log("Fichier js/inventory/core.js chargé");

// INVENTAIRES SÉPARÉS PAR CATÉGORIE - CHACUN COMPLÈTEMENT INDÉPENDANT
let inventoryAll = Array.from({ length: 80 }, () => ({ item: null, category: null }));
let inventoryEquipement = Array.from({ length: 80 }, () => ({ item: null, category: 'equipement' }));
let inventoryPotions = Array.from({ length: 80 }, () => ({ item: null, category: 'potions' }));
let inventoryRessources = Array.from({ length: 80 }, () => ({ item: null, category: 'ressources' }));

// Inventaire principal (pour compatibilité avec le système d'équipement)
let inventory = inventoryAll;

// Rendre les inventaires accessibles globalement
window.inventory = inventory;
window.inventoryAll = inventoryAll;
window.inventoryEquipement = inventoryEquipement;
window.inventoryPotions = inventoryPotions;
window.inventoryRessources = inventoryRessources;

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
    console.log("Initialisation de l'inventaire...");
    
    // Inventaire vide au démarrage
    console.log("Inventaire initialisé avec succès");
}

// Fonction pour réinitialiser complètement l'inventaire
function resetInventory() {
    console.log("Réinitialisation complète de l'inventaire...");
    
    // Vider tous les inventaires en conservant la structure
    window.inventoryAll = Array.from({ length: 80 }, () => ({ item: null, category: null }));
    window.inventoryEquipement = Array.from({ length: 80 }, () => ({ item: null, category: 'equipement' }));
    window.inventoryPotions = Array.from({ length: 80 }, () => ({ item: null, category: 'potions' }));
    window.inventoryRessources = Array.from({ length: 80 }, () => ({ item: null, category: 'ressources' }));
    
    // Mettre à jour l'affichage
    if (typeof updateAllGrids === 'function') {
        updateAllGrids();
    }
    
    // Réinitialiser l'équipement
    if (typeof resetEquipment === 'function') {
        resetEquipment();
    }
    
    console.log("Inventaire réinitialisé avec succès");
}

// Fonction pour réinitialiser l'équipement
function resetEquipment() {
    console.log("Réinitialisation de l'équipement...");
    
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
    
    console.log("Équipement réinitialisé avec succès");
}

function initStats() {
    console.log("Initialisation des statistiques...");
    
    // Les statistiques sont déjà initialisées dans player.js
    // Cette fonction peut être utilisée pour des initialisations supplémentaires si nécessaire
    
    console.log("Statistiques initialisées avec succès");
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
        case 'all':
        default:
            return window.inventoryAll;
    }
}

// Fonction pour réorganiser l'inventaire en décalant vers la gauche
function reorganizeInventory(inventory) {
    // Créer un nouvel inventaire temporaire
    const newInventory = [];
    
    // Copier tous les items non-null vers le début
    for (let i = 0; i < inventory.length; i++) {
        if (inventory[i] && inventory[i].item !== null) {
            newInventory.push(inventory[i]);
        }
    }
    
    // Remplir le reste avec des slots vides
    while (newInventory.length < inventory.length) {
        newInventory.push({ item: null, category: inventory[0] ? inventory[0].category : 'all' });
    }
    
    // Remplacer l'inventaire original
    for (let i = 0; i < inventory.length; i++) {
        inventory[i] = newInventory[i];
    }
}

// Exporter les fonctions
window.getInventoryByCategory = getInventoryByCategory;
window.reorganizeInventory = reorganizeInventory; 
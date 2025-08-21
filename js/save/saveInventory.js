// js/save/saveInventory.js
// Module de sauvegarde de l'inventaire pour système multi-personnages
// Responsabilité : Sauvegarder et charger l'inventaire et l'équipement

class InventorySaveManager {
    constructor() {
        this.version = "1.0.0";
    }

    // Sauvegarder l'inventaire
    saveInventory(characterId) {
        if (!characterId) {
            return false;
        }

        try {
            // Utiliser les fonctions existantes si disponibles
            if (typeof window.saveInventoryForCharacter === 'function') {
                window.saveInventoryForCharacter(characterId);
                return true;
            }

            // Fallback : sauvegarde manuelle
            const inventoryData = {
                version: this.version,
                timestamp: Date.now(),
                characterId: characterId,
                
                // Inventaires séparés
                inventories: {
                    all: window.inventoryAll || [],
                    equipement: window.inventoryEquipement || [],
                    potions: window.inventoryPotions || [],
                    ressources: window.inventoryRessources || []
                },
                
                // Équipement équipé
                equippedItems: window.equippedItems || {
                    coiffe: null,
                    cape: null,
                    collier: null,
                    anneau: null,
                    ceinture: null,
                    bottes: null
                }
            };

            // Sauvegarder dans localStorage
            const saveKey = `monrpg_inventory_${characterId}`;
            localStorage.setItem(saveKey, JSON.stringify(inventoryData));
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde de l\'inventaire:', error);
            return false;
        }
    }

    // Charger l'inventaire
    loadInventory(characterId) {
        if (!characterId) {
            return false;
        }

        try {
            // Utiliser les fonctions existantes si disponibles
            if (typeof window.loadInventoryForCharacter === 'function') {
                window.loadInventoryForCharacter(characterId);
                return true;
            }

            // Fallback : chargement manuel
            const saveKey = `monrpg_inventory_${characterId}`;
            const savedData = localStorage.getItem(saveKey);
            
            if (!savedData) {
                return false;
            }

            const data = JSON.parse(savedData);
            
            // Vérifier la version pour compatibilité future
            if (data.version && data.version !== this.version) {
                console.warn(`⚠️ Version de sauvegarde différente: ${data.version} vs ${this.version}`);
            }

            // Restaurer les inventaires
            if (data.inventories) {
                window.inventoryAll = data.inventories.all || [];
                window.inventoryEquipement = data.inventories.equipement || [];
                window.inventoryPotions = data.inventories.potions || [];
                window.inventoryRessources = data.inventories.ressources || [];
                
                // Mettre à jour l'inventaire principal pour compatibilité
                window.inventory = window.inventoryAll;
            }
            
            // Restaurer l'équipement
            if (data.equippedItems) {
                window.equippedItems = data.equippedItems;
            }
            
            // Mettre à jour l'affichage si les fonctions sont disponibles
            if (typeof window.updateAllGrids === 'function') {
                window.updateAllGrids();
            }
            
            if (typeof window.updateEquipmentDisplay === 'function') {
                window.updateEquipmentDisplay();
            }
            
            if (typeof window.updateStatsDisplay === 'function') {
                window.updateStatsDisplay();
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement de l\'inventaire:', error);
            return false;
        }
    }

    // Vérifier si une sauvegarde d'inventaire existe
    hasInventorySave(characterId) {
        if (!characterId) return false;
        
        // Vérifier d'abord les fonctions existantes
        if (typeof window.hasInventoryForCharacter === 'function') {
            return window.hasInventoryForCharacter(characterId);
        }
        
        // Fallback : vérification manuelle
        const saveKey = `monrpg_inventory_${characterId}`;
        return localStorage.getItem(saveKey) !== null;
    }

    // Supprimer la sauvegarde d'inventaire
    deleteInventorySave(characterId) {
        if (!characterId) return;
        
        try {
            // Utiliser les fonctions existantes si disponibles
            if (typeof window.deleteInventoryForCharacter === 'function') {
                window.deleteInventoryForCharacter(characterId);
                return;
            }
            
            // Fallback : suppression manuelle
            const saveKey = `monrpg_inventory_${characterId}`;
            localStorage.removeItem(saveKey);
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de la sauvegarde d\'inventaire:', error);
        }
    }

    // Valider l'intégrité des données d'inventaire
    validateInventoryData(data) {
        if (!data || typeof data !== 'object') {
            return { valid: false, error: 'Données invalides' };
        }

        const requiredFields = ['version', 'timestamp', 'characterId'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return { valid: false, error: `Champ requis manquant: ${field}` };
            }
        }

        // Vérifier que les inventaires sont des tableaux
        if (data.inventories) {
            const requiredInventories = ['all', 'equipement', 'potions', 'ressources'];
            for (const inv of requiredInventories) {
                if (!Array.isArray(data.inventories[inv])) {
                    return { valid: false, error: `Inventaire ${inv} invalide` };
                }
            }
        }

        return { valid: true };
    }

    // Obtenir des informations sur l'inventaire
    getInventoryInfo(characterId) {
        if (!characterId) return null;
        
        try {
            const saveKey = `monrpg_inventory_${characterId}`;
            const savedData = localStorage.getItem(saveKey);
            
            if (!savedData) return null;
            
            const data = JSON.parse(savedData);
            
            // Compter les items dans chaque inventaire
            const counts = {};
            if (data.inventories) {
                Object.entries(data.inventories).forEach(([name, inventory]) => {
                    counts[name] = inventory.filter(slot => slot.item !== null).length;
                });
            }
            
            return {
                lastSaveTime: data.timestamp,
                itemCounts: counts,
                equippedItems: data.equippedItems ? Object.keys(data.equippedItems).filter(key => data.equippedItems[key] !== null).length : 0
            };
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des infos d\'inventaire:', error);
            return null;
        }
    }

    // Créer un inventaire vide pour un nouveau personnage
    createEmptyInventory(characterId) {
        if (!characterId) return false;
        
        try {
            const emptyInventory = {
                version: this.version,
                timestamp: Date.now(),
                characterId: characterId,
                
                inventories: {
                    all: Array.from({ length: 80 }, () => ({ item: null, category: null })),
                    equipement: Array.from({ length: 80 }, () => ({ item: null, category: 'equipement' })),
                    potions: Array.from({ length: 80 }, () => ({ item: null, category: 'potions' })),
                    ressources: Array.from({ length: 80 }, () => ({ item: null, category: 'ressources' }))
                },
                
                equippedItems: {
                    coiffe: null,
                    cape: null,
                    collier: null,
                    anneau: null,
                    ceinture: null,
                    bottes: null
                }
            };

            const saveKey = `monrpg_inventory_${characterId}`;
            localStorage.setItem(saveKey, JSON.stringify(emptyInventory));
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur lors de la création de l\'inventaire vide:', error);
            return false;
        }
    }

    // Migrer depuis l'ancien format d'inventaire
    migrateOldInventory(characterId) {
        // Vérifier s'il y a des anciennes sauvegardes d'inventaire
        const oldInventoryKey = `monrpg_inventory_${characterId}`;
        const oldData = localStorage.getItem(oldInventoryKey);
        
        if (oldData) {
            try {
                const data = JSON.parse(oldData);
                
                // Si c'est déjà au nouveau format, pas besoin de migration
                if (data.version && data.inventories) {
                    return true;
                }
                
                // Migration depuis l'ancien format
                
                const newData = {
                    version: this.version,
                    timestamp: Date.now(),
                    characterId: characterId,
                    
                    inventories: {
                        all: data.inventoryAll || Array.from({ length: 80 }, () => ({ item: null, category: null })),
                        equipement: data.inventoryEquipement || Array.from({ length: 80 }, () => ({ item: null, category: 'equipement' })),
                        potions: data.inventoryPotions || Array.from({ length: 80 }, () => ({ item: null, category: 'potions' })),
                        ressources: data.inventoryRessources || Array.from({ length: 80 }, () => ({ item: null, category: 'ressources' }))
                    },
                    
                    equippedItems: data.equippedItems || {
                        coiffe: null,
                        cape: null,
                        collier: null,
                        anneau: null,
                        ceinture: null,
                        bottes: null
                    }
                };
                
                localStorage.setItem(oldInventoryKey, JSON.stringify(newData));
                return true;
                
            } catch (error) {
                console.error('❌ Erreur lors de la migration de l\'inventaire:', error);
                return false;
            }
        }
        
        return false;
    }
}

// Créer une instance globale
const inventorySaveManager = new InventorySaveManager();

// Exporter les fonctions pour compatibilité
window.saveInventoryData = (characterId) => inventorySaveManager.saveInventory(characterId);
window.loadInventoryData = (characterId) => inventorySaveManager.loadInventory(characterId);
window.hasInventorySave = (characterId) => inventorySaveManager.hasInventorySave(characterId);
window.deleteInventorySave = (characterId) => inventorySaveManager.deleteInventorySave(characterId);
window.getInventoryInfo = (characterId) => inventorySaveManager.getInventoryInfo(characterId);
window.createEmptyInventory = (characterId) => inventorySaveManager.createEmptyInventory(characterId);
window.migrateOldInventory = (characterId) => inventorySaveManager.migrateOldInventory(characterId);

// Exporter la classe pour utilisation avancée
window.InventorySaveManager = InventorySaveManager;
window.inventorySaveManager = inventorySaveManager;
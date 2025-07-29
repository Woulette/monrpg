// js/save/saveManager.js
// Orchestrateur principal du système de sauvegarde modulaire
// Responsabilité : Coordonner tous les modules de sauvegarde

class SaveManager {
    constructor() {
        this.version = "1.0.0";
        this.modules = {
            player: null,
            gameState: null,
            inventory: null,
            quests: null,
            monsters: null
        };
        this.autoSaveInterval = 30000; // 30 secondes
        this.lastSaveTime = 0;
        this.isInitialized = false;
    }

    // Initialiser le système de sauvegarde
    async init() {
        if (this.isInitialized) {
            console.log('⚠️ SaveManager déjà initialisé');
            return;
        }

        console.log('🚀 Initialisation du système de sauvegarde modulaire...');

        try {
            // Attendre que tous les modules soient chargés
            await this.waitForModules();
            
            // Initialiser les références vers les modules
            this.modules.player = window.playerSaveManager;
            this.modules.gameState = window.gameStateSaveManager;
            this.modules.inventory = window.inventorySaveManager;
            this.modules.quests = window.questsSaveManager;
            this.modules.monsters = window.saveMonstersForMap; // Fonction existante

            // Démarrer la sauvegarde automatique
            this.startAutoSave();
            
            this.isInitialized = true;
            console.log('✅ Système de sauvegarde modulaire initialisé avec succès');
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation du SaveManager:', error);
        }
    }

    // Attendre que tous les modules soient chargés
    async waitForModules() {
        const maxWaitTime = 10000; // 10 secondes max
        const checkInterval = 100; // Vérifier toutes les 100ms
        let elapsed = 0;

        while (elapsed < maxWaitTime) {
            if (window.playerSaveManager && 
                window.gameStateSaveManager && 
                window.inventorySaveManager && 
                window.questsSaveManager) {
                return true;
            }
            
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }

        throw new Error('Timeout: Modules de sauvegarde non chargés');
    }

    // Sauvegarde complète de tous les modules
    async saveAll(characterId) {
        if (!characterId) {
            console.log('⚠️ Impossible de sauvegarder: characterId manquant');
            return false;
        }

        if (!this.isInitialized) {
            console.log('⚠️ SaveManager non initialisé, initialisation...');
            await this.init();
        }

        console.log('💾 Sauvegarde complète pour le personnage', characterId);

        const results = {
            player: false,
            gameState: false,
            inventory: false,
            quests: false,
            monsters: false
        };

        try {
            // Sauvegarder le joueur
            if (this.modules.player) {
                results.player = this.modules.player.savePlayer(characterId);
            }

            // Sauvegarder l'état du jeu
            if (this.modules.gameState) {
                results.gameState = this.modules.gameState.saveGameState(characterId);
            }

            // Sauvegarder l'inventaire
            if (this.modules.inventory) {
                results.inventory = this.modules.inventory.saveInventory(characterId);
            }

            // Sauvegarder les quêtes
            if (this.modules.quests) {
                results.quests = this.modules.quests.saveQuests(characterId);
            }

            // Sauvegarder les monstres de la map actuelle
            if (this.modules.monsters && window.currentMap) {
                this.modules.monsters(window.currentMap);
                results.monsters = true;
            }

            this.lastSaveTime = Date.now();
            
            // Vérifier les résultats
            const successCount = Object.values(results).filter(Boolean).length;
            const totalModules = Object.keys(results).length;
            
            console.log(`✅ Sauvegarde terminée: ${successCount}/${totalModules} modules sauvegardés`);
            console.log('📊 Résultats:', results);
            
            return successCount === totalModules;
            
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde complète:', error);
            return false;
        }
    }

    // Chargement complet de tous les modules
    async loadAll(characterId) {
        if (!characterId) {
            console.log('⚠️ Impossible de charger: characterId manquant');
            return false;
        }

        if (!this.isInitialized) {
            console.log('⚠️ SaveManager non initialisé, initialisation...');
            await this.init();
        }

        console.log('📂 Chargement complet pour le personnage', characterId);

        const results = {
            player: false,
            gameState: false,
            inventory: false,
            quests: false,
            monsters: false
        };

        try {
            // Charger le joueur
            if (this.modules.player) {
                results.player = this.modules.player.loadPlayer(characterId);
            }

            // Charger l'état du jeu
            if (this.modules.gameState) {
                results.gameState = this.modules.gameState.loadGameState(characterId);
            }

            // Charger l'inventaire
            if (this.modules.inventory) {
                results.inventory = this.modules.inventory.loadInventory(characterId);
            }

            // Charger les quêtes
            if (this.modules.quests) {
                results.quests = this.modules.quests.loadQuests(characterId);
            }

            // Charger les monstres de la map actuelle
            if (window.currentMap && typeof window.loadMonstersForMap === 'function') {
                results.monsters = window.loadMonstersForMap(window.currentMap);
            }

            // Vérifier les résultats
            const successCount = Object.values(results).filter(Boolean).length;
            const totalModules = Object.keys(results).length;
            
            console.log(`✅ Chargement terminé: ${successCount}/${totalModules} modules chargés`);
            console.log('📊 Résultats:', results);
            
            return successCount > 0; // Au moins un module chargé avec succès
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement complet:', error);
            return false;
        }
    }

    // Sauvegarde automatique
    startAutoSave() {
        console.log('⏰ Démarrage de la sauvegarde automatique...');
        
        setInterval(() => {
            if (window.gameState === "playing" && window.currentCharacterId) {
                this.autoSave();
            }
        }, this.autoSaveInterval);
    }

    // Exécuter la sauvegarde automatique
    async autoSave() {
        if (!window.currentCharacterId) {
            console.log('⚠️ Auto-save ignoré: aucun personnage actif');
            return;
        }

        const timeSinceLastSave = Date.now() - this.lastSaveTime;
        if (timeSinceLastSave < this.autoSaveInterval) {
            return; // Éviter les sauvegardes trop fréquentes
        }

        console.log('💾 Sauvegarde automatique...');
        await this.saveAll(window.currentCharacterId);
    }

    // Sauvegarde forcée lors d'événements importants
    async forceSave(characterId = null) {
        const targetCharacterId = characterId || window.currentCharacterId;
        
        if (!targetCharacterId) {
            console.log('⚠️ Impossible de forcer la sauvegarde: aucun personnage spécifié');
            return false;
        }

        console.log('💾 Sauvegarde forcée pour le personnage', targetCharacterId);
        return await this.saveAll(targetCharacterId);
    }

    // Vérifier si une sauvegarde complète existe
    hasCompleteSave(characterId) {
        if (!characterId) return false;

        const checks = {
            player: this.modules.player ? this.modules.player.hasPlayerSave(characterId) : false,
            gameState: this.modules.gameState ? this.modules.gameState.hasGameStateSave(characterId) : false,
            inventory: this.modules.inventory ? this.modules.inventory.hasInventorySave(characterId) : false,
            quests: this.modules.quests ? this.modules.quests.hasQuestsSave(characterId) : false
        };

        return Object.values(checks).some(Boolean); // Au moins un module a une sauvegarde
    }

    // Supprimer toutes les sauvegardes d'un personnage
    deleteAllSaves(characterId) {
        if (!characterId) return;

        console.log('🗑️ Suppression de toutes les sauvegardes pour le personnage', characterId);

        // Supprimer via les modules
        if (this.modules.player) this.modules.player.deletePlayerSave(characterId);
        if (this.modules.gameState) this.modules.gameState.deleteGameStateSave(characterId);
        if (this.modules.inventory) this.modules.inventory.deleteInventorySave(characterId);
        if (this.modules.quests) this.modules.quests.deleteQuestsSave(characterId);

        // Supprimer les monstres
        if (typeof window.clearAllMonsterData === 'function') {
            window.clearAllMonsterData();
        }

        console.log('✅ Toutes les sauvegardes supprimées');
    }

    // Migrer les anciennes sauvegardes
    async migrateOldSaves(characterId) {
        if (!characterId) return false;

        console.log('🔄 Migration des anciennes sauvegardes pour le personnage', characterId);

        const migrations = [];

        // Migrer les sauvegardes via les utilitaires
        if (window.saveUtils) {
            migrations.push(window.saveUtils.migrateOldSaves(characterId));
        }

        // Migrer l'inventaire
        if (this.modules.inventory) {
            migrations.push(this.modules.inventory.migrateOldInventory(characterId));
        }

        // Migrer les quêtes
        if (this.modules.quests) {
            migrations.push(this.modules.quests.migrateOldQuests(characterId));
        }

        const results = await Promise.all(migrations);
        const successCount = results.filter(Boolean).length;

        console.log(`✅ Migration terminée: ${successCount} migrations réussies`);
        return successCount > 0;
    }

    // Obtenir des informations sur toutes les sauvegardes
    getSaveInfo(characterId) {
        if (!characterId) return null;

        const info = {
            characterId: characterId,
            modules: {},
            totalSize: 0,
            lastSaveTime: 0
        };

        // Informations du joueur
        if (this.modules.player) {
            info.modules.player = this.modules.player.getPlayerInfo ? this.modules.player.getPlayerInfo(characterId) : null;
        }

        // Informations de l'état du jeu
        if (this.modules.gameState) {
            info.modules.gameState = this.modules.gameState.getGameStateInfo(characterId);
        }

        // Informations de l'inventaire
        if (this.modules.inventory) {
            info.modules.inventory = this.modules.inventory.getInventoryInfo(characterId);
        }

        // Informations des quêtes
        if (this.modules.quests) {
            info.modules.quests = this.modules.quests.getQuestsInfo(characterId);
        }

        // Statistiques globales
        if (window.saveUtils) {
            const stats = window.saveUtils.getSaveStats(characterId);
            info.totalSize = stats.totalSize;
        }

        return info;
    }

    // Afficher les statistiques de sauvegarde
    logSaveStats(characterId) {
        if (!characterId) return;

        console.log('📊 Statistiques de sauvegarde pour le personnage', characterId);
        
        if (window.saveUtils) {
            window.saveUtils.logSaveStats(characterId);
        }

        const info = this.getSaveInfo(characterId);
        if (info) {
            console.log('📋 Informations détaillées:', info);
        }
    }

    // Créer un nouveau personnage avec des données initiales
    async createNewCharacter(characterId) {
        if (!characterId) return false;

        console.log('🆕 Création d\'un nouveau personnage:', characterId);

        try {
            // Créer un inventaire vide
            if (this.modules.inventory) {
                this.modules.inventory.createEmptyInventory(characterId);
            }

            // Créer des quêtes initiales
            if (this.modules.quests) {
                this.modules.quests.createInitialQuests(characterId);
            }

            console.log('✅ Nouveau personnage créé avec succès');
            return true;

        } catch (error) {
            console.error('❌ Erreur lors de la création du nouveau personnage:', error);
            return false;
        }
    }
}

// Créer une instance globale
const saveManager = new SaveManager();

// Exporter les fonctions principales pour compatibilité
window.saveAll = (characterId) => saveManager.saveAll(characterId);
window.loadAll = (characterId) => saveManager.loadAll(characterId);
window.forceSave = (characterId) => saveManager.forceSave(characterId);
window.hasCompleteSave = (characterId) => saveManager.hasCompleteSave(characterId);
window.deleteAllSaves = (characterId) => saveManager.deleteAllSaves(characterId);
window.migrateOldSaves = (characterId) => saveManager.migrateOldSaves(characterId);
window.getSaveInfo = (characterId) => saveManager.getSaveInfo(characterId);
window.logSaveStats = (characterId) => saveManager.logSaveStats(characterId);
window.createNewCharacter = (characterId) => saveManager.createNewCharacter(characterId);

// Exporter la classe pour utilisation avancée
window.SaveManager = SaveManager;
window.saveManager = saveManager;

// Initialiser automatiquement quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        saveManager.init();
    }, 1000); // Attendre 1 seconde pour que tous les modules soient chargés
});

console.log('✅ Module saveManager.js chargé');
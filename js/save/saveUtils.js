// js/save/saveUtils.js
// Utilitaires communs pour le système de sauvegarde modulaire
// Responsabilité : Fonctions utilitaires partagées entre tous les modules

class SaveUtils {
    constructor() {
        this.savePrefix = 'monrpg_';
        this.backupPrefix = 'monrpg_backup_';
    }

    // Générer une clé de sauvegarde standardisée
    generateSaveKey(module, characterId) {
        return `${this.savePrefix}${module}_${characterId}`;
    }

    // Générer une clé de sauvegarde de backup
    generateBackupKey(module, characterId) {
        const timestamp = Date.now();
        return `${this.backupPrefix}${module}_${characterId}_${timestamp}`;
    }

    // Sauvegarder des données avec gestion d'erreurs
    saveData(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            return true;
        } catch (error) {
            console.error(`❌ Erreur lors de la sauvegarde de ${key}:`, error);
            return false;
        }
    }

    // Charger des données avec gestion d'erreurs
    loadData(key) {
        try {
            const savedData = localStorage.getItem(key);
            if (!savedData) {
                return null;
            }
            return JSON.parse(savedData);
        } catch (error) {
            console.error(`❌ Erreur lors du chargement de ${key}:`, error);
            return null;
        }
    }

    // Supprimer des données
    deleteData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`❌ Erreur lors de la suppression de ${key}:`, error);
            return false;
        }
    }

    // Créer un backup avant modification
    createBackup(module, characterId, data) {
        const backupKey = this.generateBackupKey(module, characterId);
        return this.saveData(backupKey, data);
    }

    // Restaurer depuis un backup
    restoreFromBackup(module, characterId) {
        const backupKeys = this.getBackupKeys(module, characterId);
        if (backupKeys.length === 0) {
            return null;
        }
        
        // Prendre le backup le plus récent
        const latestBackup = backupKeys[backupKeys.length - 1];
        return this.loadData(latestBackup);
    }

    // Obtenir toutes les clés de backup pour un module et personnage
    getBackupKeys(module, characterId) {
        const keys = [];
        const pattern = `${this.backupPrefix}${module}_${characterId}_`;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(pattern)) {
                keys.push(key);
            }
        }
        
        // Trier par timestamp (plus récent en dernier)
        return keys.sort();
    }

    // Nettoyer les anciens backups (garder seulement les 5 plus récents)
    cleanupOldBackups(module, characterId, keepCount = 5) {
        const backupKeys = this.getBackupKeys(module, characterId);
        
        if (backupKeys.length <= keepCount) {
            return;
        }
        
        // Supprimer les anciens backups
        const keysToDelete = backupKeys.slice(0, backupKeys.length - keepCount);
        keysToDelete.forEach(key => {
            this.deleteData(key);
            console.log(`🗑️ Backup supprimé: ${key}`);
        });
    }

    // Valider l'intégrité des données
    validateData(data, requiredFields = []) {
        if (!data || typeof data !== 'object') {
            return { valid: false, error: 'Données invalides' };
        }

        for (const field of requiredFields) {
            if (!data[field]) {
                return { valid: false, error: `Champ requis manquant: ${field}` };
            }
        }

        return { valid: true };
    }

    // Vérifier l'espace disponible dans localStorage
    checkStorageSpace() {
        try {
            const testKey = 'monrpg_storage_test';
            const testData = 'x'.repeat(1024); // 1KB de test
            
            localStorage.setItem(testKey, testData);
            localStorage.removeItem(testKey);
            
            return { available: true };
        } catch (error) {
            return { available: false, error: 'Espace de stockage insuffisant' };
        }
    }

    // Obtenir la taille des données sauvegardées
    getSaveSize(key) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return 0;
            
            // Taille approximative en bytes
            return new Blob([data]).size;
        } catch (error) {
            return 0;
        }
    }

    // Formater la taille en format lisible
    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Obtenir des statistiques sur les sauvegardes
    getSaveStats(characterId) {
        const stats = {
            totalKeys: 0,
            totalSize: 0,
            modules: {}
        };

        const pattern = `${this.savePrefix}`;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(pattern) && key.includes(characterId)) {
                const size = this.getSaveSize(key);
                stats.totalKeys++;
                stats.totalSize += size;
                
                // Extraire le nom du module
                const moduleMatch = key.match(new RegExp(`${this.savePrefix}(.+?)_${characterId}`));
                if (moduleMatch) {
                    const module = moduleMatch[1];
                    if (!stats.modules[module]) {
                        stats.modules[module] = { keys: 0, size: 0 };
                    }
                    stats.modules[module].keys++;
                    stats.modules[module].size += size;
                }
            }
        }

        return stats;
    }

    // Afficher les statistiques de sauvegarde
    logSaveStats(characterId) {
        const stats = this.getSaveStats(characterId);
        
        console.log('📊 Statistiques de sauvegarde pour le personnage', characterId);
        console.log(`📁 Total: ${stats.totalKeys} clés, ${this.formatSize(stats.totalSize)}`);
        
        Object.entries(stats.modules).forEach(([module, data]) => {
            console.log(`  📂 ${module}: ${data.keys} clés, ${this.formatSize(data.size)}`);
        });
    }

    // Migrer les anciennes sauvegardes vers le nouveau format
    migrateOldSaves(characterId) {
        console.log('🔄 Migration des anciennes sauvegardes...');
        
        // Vérifier s'il y a des anciennes sauvegardes
        const oldSaveKey = `monrpg_save_${characterId}`;
        const oldData = this.loadData(oldSaveKey);
        
        if (oldData) {
            console.log('📦 Ancienne sauvegarde trouvée, migration en cours...');
            
            // Extraire les données du joueur
            if (oldData.player) {
                const playerKey = this.generateSaveKey('player', characterId);
                this.saveData(playerKey, {
                    version: "1.0.0",
                    timestamp: oldData.timestamp,
                    characterId: characterId,
                    ...oldData.player
                });
                console.log('✅ Données du joueur migrées');
            }
            
            // Extraire l'état du jeu
            if (oldData.gameState) {
                const gameStateKey = this.generateSaveKey('gameState', characterId);
                this.saveData(gameStateKey, {
                    version: "1.0.0",
                    timestamp: oldData.timestamp,
                    characterId: characterId,
                    ...oldData.gameState
                });
                console.log('✅ État du jeu migré');
            }
            
            // Supprimer l'ancienne sauvegarde
            this.deleteData(oldSaveKey);
            console.log('🗑️ Ancienne sauvegarde supprimée');
            
            return true;
        }
        
        return false;
    }

    // Nettoyer toutes les données d'un personnage
    cleanupCharacterData(characterId) {
        console.log(`🧹 Nettoyage des données du personnage ${characterId}...`);
        
        const keysToDelete = [];
        const pattern = `${this.savePrefix}`;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(pattern) && key.includes(characterId)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => {
            this.deleteData(key);
            console.log(`🗑️ Supprimé: ${key}`);
        });
        
        console.log(`✅ ${keysToDelete.length} clés supprimées`);
    }
}

// Créer une instance globale
const saveUtils = new SaveUtils();

// Exporter les fonctions utilitaires
window.saveUtils = saveUtils;
window.SaveUtils = SaveUtils;

// Fonctions de raccourci pour utilisation courante
window.generateSaveKey = (module, characterId) => saveUtils.generateSaveKey(module, characterId);
window.saveData = (key, data) => saveUtils.saveData(key, data);
window.loadData = (key) => saveUtils.loadData(key);
window.deleteData = (key) => saveUtils.deleteData(key);
window.validateData = (data, requiredFields) => saveUtils.validateData(data, requiredFields);
window.getSaveStats = (characterId) => saveUtils.getSaveStats(characterId);
window.logSaveStats = (characterId) => saveUtils.logSaveStats(characterId);
window.migrateOldSaves = (characterId) => saveUtils.migrateOldSaves(characterId);
window.cleanupCharacterData = (characterId) => saveUtils.cleanupCharacterData(characterId);

console.log('✅ Module saveUtils.js chargé');
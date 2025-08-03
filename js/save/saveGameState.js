// js/save/saveGameState.js
// Module de sauvegarde de l'état du jeu pour système multi-personnages
// Responsabilité : Sauvegarder et charger l'état global du jeu

class GameStateSaveManager {
    constructor() {
        this.version = "1.0.0";
    }

    // Sauvegarder l'état du jeu
    saveGameState(characterId) {
        if (!characterId) {
            return false;
        }

        try {
            const gameStateData = {
                version: this.version,
                timestamp: Date.now(),
                characterId: characterId,
                
                // Map actuelle
                currentMap: window.currentMap || 'map1',
                
                // Progression du donjon (si disponible)
                dungeonProgression: window.dungeonProgression || {},
                
                // Compteurs de corbeaux tués (si disponible)
                crowKillCounts: window.crowKillCounts || { map1: 0, map2: 0, map3: 0 },
                
                // État de victoire du boss slime
                slimeBossDefeated: window.slimeBossDefeated || false,
                
                // État des portails et accès
                portalStates: this.getPortalStates(),
                
                // État des PNJ (si applicable)
                pnjStates: this.getPNJStates(),
                
                // Métadonnées du jeu
                metadata: {
                    lastSaveTime: Date.now(),
                    gameVersion: window.gameVersion || '1.0.0',
                    totalPlayTime: window.totalPlayTime || 0
                }
            };

            // Sauvegarder dans localStorage
            const saveKey = `monrpg_gameState_${characterId}`;
            localStorage.setItem(saveKey, JSON.stringify(gameStateData));
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde de l\'état du jeu:', error);
            return false;
        }
    }

    // Charger l'état du jeu
    loadGameState(characterId) {
        if (!characterId) {
            return false;
        }

        try {
            const saveKey = `monrpg_gameState_${characterId}`;
            const savedData = localStorage.getItem(saveKey);
            
            if (!savedData) {
                return false;
            }

            const data = JSON.parse(savedData);
            
            // Vérifier la version pour compatibilité future
            if (data.version && data.version !== this.version) {
                console.warn(`⚠️ Version de sauvegarde différente: ${data.version} vs ${this.version}`);
            }

            
            // Restaurer la map actuelle
            if (data.currentMap) {
                window.currentMap = data.currentMap;
            }
            
            // Restaurer la progression du donjon
            if (data.dungeonProgression) {
                window.dungeonProgression = data.dungeonProgression;
            }
            
            // Restaurer l'état de victoire du boss slime
            if (data.slimeBossDefeated !== undefined) {
                window.slimeBossDefeated = data.slimeBossDefeated;
            }
            
            // Restaurer les compteurs de corbeaux
            if (data.crowKillCounts) {
                window.crowKillCounts = data.crowKillCounts;
            }
            
            // Restaurer les états des portails
            if (data.portalStates) {
                this.restorePortalStates(data.portalStates);
            }
            
            // Restaurer les états des PNJ
            if (data.pnjStates) {
                this.restorePNJStates(data.pnjStates);
            }
            
            // Restaurer les métadonnées
            if (data.metadata) {
                window.totalPlayTime = data.metadata.totalPlayTime || 0;
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement de l\'état du jeu:', error);
            return false;
        }
    }

    // Obtenir l'état des portails
    getPortalStates() {
        const portalStates = {};
        
        // État des portails du donjon slime
        if (window.dungeonProgression) {
            portalStates.dungeonSlime = {
                mapdonjonslime: {
                    portalUnlocked: window.dungeonProgression.mapdonjonslime?.portalUnlocked || false,
                    slimesKilled: window.dungeonProgression.mapdonjonslime?.slimesKilled || 0,
                    slimesSpawned: window.dungeonProgression.mapdonjonslime?.slimesSpawned || 0
                },
                mapdonjonslime2: {
                    decorRemoved: window.dungeonProgression.mapdonjonslime2?.decorRemoved || false,
                    slimesKilled: window.dungeonProgression.mapdonjonslime2?.slimesKilled || 0,
                    slimesSpawned: window.dungeonProgression.mapdonjonslime2?.slimesSpawned || 0
                }
            };
        }
        
        return portalStates;
    }

    // Restaurer l'état des portails
    restorePortalStates(portalStates) {
        if (!portalStates) return;
        
        // Restaurer la progression du donjon slime
        if (portalStates.dungeonSlime && window.dungeonProgression) {
            if (portalStates.dungeonSlime.mapdonjonslime) {
                const map1 = portalStates.dungeonSlime.mapdonjonslime;
                if (window.dungeonProgression.mapdonjonslime) {
                    window.dungeonProgression.mapdonjonslime.portalUnlocked = map1.portalUnlocked;
                    window.dungeonProgression.mapdonjonslime.slimesKilled = map1.slimesKilled;
                    window.dungeonProgression.mapdonjonslime.slimesSpawned = map1.slimesSpawned;
                }
            }
            
            if (portalStates.dungeonSlime.mapdonjonslime2) {
                const map2 = portalStates.dungeonSlime.mapdonjonslime2;
                if (window.dungeonProgression.mapdonjonslime2) {
                    window.dungeonProgression.mapdonjonslime2.decorRemoved = map2.decorRemoved;
                    window.dungeonProgression.mapdonjonslime2.slimesKilled = map2.slimesKilled;
                    window.dungeonProgression.mapdonjonslime2.slimesSpawned = map2.slimesSpawned;
                }
            }
        }
        
    }

    // Obtenir l'état des PNJ
    getPNJStates() {
        const pnjStates = {};
        
        // État des PNJ (si applicable)
        if (window.pnjStates) {
            pnjStates.states = window.pnjStates;
        }
        
        // État des dialogues PNJ
        if (window.pnjDialogStates) {
            pnjStates.dialogs = window.pnjDialogStates;
        }
        
        return pnjStates;
    }

    // Restaurer l'état des PNJ
    restorePNJStates(pnjStates) {
        if (!pnjStates) return;
        
        // Restaurer les états des PNJ
        if (pnjStates.states && window.pnjStates) {
            window.pnjStates = { ...window.pnjStates, ...pnjStates.states };
        }
        
        // Restaurer les états des dialogues
        if (pnjStates.dialogs && window.pnjDialogStates) {
            window.pnjDialogStates = { ...window.pnjDialogStates, ...pnjStates.dialogs };
        }
        
    }

    // Vérifier si une sauvegarde de l'état du jeu existe
    hasGameStateSave(characterId) {
        if (!characterId) return false;
        const saveKey = `monrpg_gameState_${characterId}`;
        return localStorage.getItem(saveKey) !== null;
    }

    // Supprimer la sauvegarde de l'état du jeu
    deleteGameStateSave(characterId) {
        if (!characterId) return;
        
        try {
            const saveKey = `monrpg_gameState_${characterId}`;
            localStorage.removeItem(saveKey);
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de la sauvegarde de l\'état du jeu:', error);
        }
    }

    // Valider l'intégrité des données de l'état du jeu
    validateGameStateData(data) {
        if (!data || typeof data !== 'object') {
            return { valid: false, error: 'Données invalides' };
        }

        const requiredFields = ['version', 'timestamp', 'characterId', 'currentMap'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return { valid: false, error: `Champ requis manquant: ${field}` };
            }
        }

        return { valid: true };
    }

    // Obtenir des informations sur l'état du jeu
    getGameStateInfo(characterId) {
        if (!characterId) return null;
        
        try {
            const saveKey = `monrpg_gameState_${characterId}`;
            const savedData = localStorage.getItem(saveKey);
            
            if (!savedData) return null;
            
            const data = JSON.parse(savedData);
            return {
                currentMap: data.currentMap,
                lastSaveTime: data.timestamp,
                crowKillCounts: data.crowKillCounts,
                dungeonProgression: data.dungeonProgression
            };
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des infos de l\'état du jeu:', error);
            return null;
        }
    }
}

// Créer une instance globale
const gameStateSaveManager = new GameStateSaveManager();

// Exporter les fonctions pour compatibilité
window.saveGameStateData = (characterId) => gameStateSaveManager.saveGameState(characterId);
window.loadGameStateData = (characterId) => gameStateSaveManager.loadGameState(characterId);
window.hasGameStateSave = (characterId) => gameStateSaveManager.hasGameStateSave(characterId);
window.deleteGameStateSave = (characterId) => gameStateSaveManager.deleteGameStateSave(characterId);
window.getGameStateInfo = (characterId) => gameStateSaveManager.getGameStateInfo(characterId);

// Exporter la classe pour utilisation avancée
window.GameStateSaveManager = GameStateSaveManager;
window.gameStateSaveManager = gameStateSaveManager;
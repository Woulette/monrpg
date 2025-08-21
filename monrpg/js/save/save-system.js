// Système de sauvegarde automatique pour multi-personnages
class SaveSystem {
    constructor() {
        this.autoSaveInterval = 30000; // Sauvegarde automatique toutes les 30 secondes
        this.lastSaveTime = 0;
        this.init();
    }

    init() {
        // Démarrer la sauvegarde automatique seulement si on est en jeu
        setInterval(() => {
            if (gameState === "playing") {
                this.autoSave();
            }
        }, this.autoSaveInterval);
    }

    // Sauvegarde automatique
    autoSave() {
        // Vérifier si les sauvegardes automatiques sont désactivées
        if (window.autoSaveDisabled) {
            return; // Sortir silencieusement si désactivé
        }
        
        // Vérifier que nous sommes en mode jeu et qu'un personnage est actif
        if (typeof player !== 'undefined' && 
            typeof window.currentMap !== 'undefined' && 
            window.currentCharacterId && 
            window.gameState === "playing") {
            
            this.saveGame();
        } else {
        }
    }

    // Sauvegarde manuelle
    saveGame() {
        if (typeof player === 'undefined' || !window.currentCharacterId) {
            return;
        }

        const saveData = {
            timestamp: Date.now(),
            characterId: window.currentCharacterId,
            player: {
                // Position et mouvement
                x: player.x,
                y: player.y,
                px: player.px,
                py: player.py,
                direction: player.direction,
                frame: player.frame,
                moving: player.moving,
                moveTarget: player.moveTarget,
                path: player.path,
                
                // Niveau et XP
                level: player.level,
                xp: player.xp,
                xpToNextLevel: player.xpToNextLevel,
                
                // Vie
                life: player.life,
                maxLife: player.maxLife,
                
                // Statistiques de base
                baseForce: player.baseForce,
                baseIntelligence: player.baseIntelligence,
                baseAgilite: player.baseAgilite,
                baseDefense: player.baseDefense,
                baseChance: player.baseChance,
                baseVitesse: player.baseVitesse,
                baseVie: player.baseVie,
                
                // Stats gagnées par l'XP de combat (permanentes, non modulables)
                combatForce: player.combatForce,
                combatIntelligence: player.combatIntelligence,
                combatAgilite: player.combatAgilite,
                combatDefense: player.combatDefense,
                combatChance: player.combatChance,
                combatVitesse: player.combatVitesse,
                combatVie: player.combatVie,
                
                // Statistiques d'équipement
                equipForce: player.equipForce,
                equipIntelligence: player.equipIntelligence,
                equipAgilite: player.equipAgilite,
                equipDefense: player.equipDefense,
                equipChance: player.equipChance,
                equipVitesse: player.equipVitesse,
                equipVie: player.equipVie,
                
                // Statistiques totales
                force: player.force,
                intelligence: player.intelligence,
                agilite: player.agilite,
                defense: player.defense,
                chance: player.chance,
                vitesse: player.vitesse,
                vie: player.vie,
                
                // XP des statistiques
                forceXp: player.forceXp,
                intelligenceXp: player.intelligenceXp,
                agiliteXp: player.agiliteXp,
                defenseXp: player.defenseXp,
                chanceXp: player.chanceXp,
                vitesseXp: player.vitesseXp,
                
                // XP nécessaire pour le prochain niveau
                forceXpToNext: player.forceXpToNext,
                intelligenceXpToNext: player.intelligenceXpToNext,
                agiliteXpToNext: player.agiliteXpToNext,
                defenseXpToNext: player.defenseXpToNext,
                chanceXpToNext: player.chanceXpToNext,
                vitesseXpToNext: player.vitesseXpToNext,
                
                // Points de caractéristiques et monnaie
                statPoints: player.statPoints,
                pecka: player.pecka,
                
                // État de combat
                inCombat: player.inCombat,
                lastCombatTime: player.lastCombatTime,
                lastRegenTime: player.lastRegenTime,
                
                // Suivi automatique
                autoFollow: player.autoFollow,
                
                // Classe du personnage
                class: player.class || 'aventurier',
                
                // Système de mort et respawn
                isDead: player.isDead,
                deathTime: player.deathTime,
                respawnTime: player.respawnTime,
                spawnX: player.spawnX,
                spawnY: player.spawnY,
                
                // Anciennes propriétés pour compatibilité
                stats: player.stats
            },
            gameState: {
                currentMap: window.currentMap,
                lastSaveTime: Date.now(),
                slimeBossDefeated: window.slimeBossDefeated || false
            },
            metiers: window.metiers || {
                tailleur: { niveau: 1, xp: 0, xpToNext: 100 },
                cordonnier: { niveau: 1, xp: 0, xpToNext: 100 },
                bijoutier: { niveau: 1, xp: 0, xpToNext: 100 },
                alchimiste: { niveau: 1, xp: 0, xpToNext: 100 },
                paysan: { niveau: 1, xp: 0, xpToNext: 100 }
            }
        };

        try {
            // Sauvegarder les données du joueur
            localStorage.setItem(`monrpg_save_${window.currentCharacterId}`, JSON.stringify(saveData));
            
            // Sauvegarder l'inventaire séparément
            if (typeof window.saveInventoryForCharacter === 'function') {
                window.saveInventoryForCharacter(window.currentCharacterId);
            }
            
            // Sauvegarder les quêtes séparément
            if (typeof window.saveQuestsForCharacter === 'function') {
                window.saveQuestsForCharacter(window.currentCharacterId);
            }
            
            this.lastSaveTime = Date.now();
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
        }
    }

    // Charger la partie
    loadGame() {
        if (!window.currentCharacterId) {
            return false;
        }

        // Reset propre des métiers AVANT chargement pour éviter le bleed d'un perso précédent
        // (certaines références globales pouvaient persister si un nouveau perso était créé juste après un autre)
        window.metiers = {
            tailleur: { niveau: 1, xp: 0, xpToNext: 100 },
            cordonnier: { niveau: 1, xp: 0, xpToNext: 100 },
            bijoutier: { niveau: 1, xp: 0, xpToNext: 100 },
            alchimiste: { niveau: 1, xp: 0, xpToNext: 100 },
            paysan: { niveau: 1, xp: 0, xpToNext: 100 }
        };

        try {
            const saveKey = `monrpg_save_${window.currentCharacterId}`;
            const saveData = localStorage.getItem(saveKey);
            
            if (!saveData) {
                return false;
            }

            const data = JSON.parse(saveData);
            
            // Vérifier que les données correspondent au bon personnage
            if (data.characterId && data.characterId !== window.currentCharacterId) {
                console.error('ERREUR: Les données chargées ne correspondent pas au personnage actuel!');
                return false;
            }
            
            // Restaurer les données du joueur
            if (data.player && typeof player !== 'undefined') {
                // Restaurer la position sauvegardée
                player.x = data.player.x || player.x;
                player.y = data.player.y || player.y;
                player.px = data.player.px || (player.x * TILE_SIZE);
                player.py = data.player.py || (player.y * TILE_SIZE);
                player.spawnX = data.player.spawnX || player.spawnX;
                player.spawnY = data.player.spawnY || player.spawnY;
                
                player.direction = data.player.direction || 0;
                player.frame = data.player.frame || 0;
                player.moving = data.player.moving || false;
                player.moveTarget = data.player.moveTarget || { x: player.x, y: player.y };
                player.path = data.player.path || [];
                
                // Niveau et XP
                player.level = data.player.level || 1;
                player.xp = data.player.xp || 0;
                player.xpToNextLevel = data.player.xpToNextLevel || 100;
                
                // Vie
                player.life = data.player.life || player.maxLife;
                player.maxLife = data.player.maxLife || 50;
                
                // Statistiques de base
                player.baseForce = data.player.baseForce || 1;
                player.baseIntelligence = data.player.baseIntelligence || 1;
                player.baseAgilite = data.player.baseAgilite || 1;
                player.baseDefense = data.player.baseDefense || 1;
                player.baseChance = data.player.baseChance || 1;
                player.baseVitesse = data.player.baseVitesse || 1;
                player.baseVie = data.player.baseVie || 1;
                
                // Stats gagnées par l'XP de combat (permanentes, non modulables)
                player.combatForce = data.player.combatForce || 0;
                player.combatIntelligence = data.player.combatIntelligence || 0;
                player.combatAgilite = data.player.combatAgilite || 0;
                player.combatDefense = data.player.combatDefense || 0;
                player.combatChance = data.player.combatChance || 0;
                player.combatVitesse = data.player.combatVitesse || 0;
                player.combatVie = data.player.combatVie || 0;
                
                // Statistiques d'équipement
                player.equipForce = data.player.equipForce || 0;
                player.equipIntelligence = data.player.equipIntelligence || 0;
                player.equipAgilite = data.player.equipAgilite || 0;
                player.equipDefense = data.player.equipDefense || 0;
                player.equipChance = data.player.equipChance || 0;
                player.equipVitesse = data.player.equipVitesse || 0;
                player.equipVie = data.player.equipVie || 0;
                
                // Statistiques totales
                player.force = data.player.force || 1;
                player.intelligence = data.player.intelligence || 1;
                player.agilite = data.player.agilite || 1;
                player.defense = data.player.defense || 1;
                player.chance = data.player.chance || 1;
                player.vitesse = data.player.vitesse || 1;
                player.vie = data.player.vie || 1;
                
                // XP des statistiques
                player.forceXp = data.player.forceXp || 0;
                player.intelligenceXp = data.player.intelligenceXp || 0;
                player.agiliteXp = data.player.agiliteXp || 0;
                player.defenseXp = data.player.defenseXp || 0;
                player.chanceXp = data.player.chanceXp || 0;
                player.vitesseXp = data.player.vitesseXp || 0;
                
                // XP nécessaire pour le prochain niveau
                player.forceXpToNext = data.player.forceXpToNext || 100;
                player.intelligenceXpToNext = data.player.intelligenceXpToNext || 100;
                player.agiliteXpToNext = data.player.agiliteXpToNext || 100;
                player.defenseXpToNext = data.player.defenseXpToNext || 100;
                player.chanceXpToNext = data.player.chanceXpToNext || 100;
                player.vitesseXpToNext = data.player.vitesseXpToNext || 100;
                
                // Points de caractéristiques et monnaie
                player.statPoints = data.player.statPoints || 0;
                player.pecka = data.player.pecka || 0;
                
                // État de combat
                player.inCombat = data.player.inCombat || false;
                player.lastCombatTime = data.player.lastCombatTime || 0;
                player.lastRegenTime = data.player.lastRegenTime || 0;
                
                // Suivi automatique
                player.autoFollow = data.player.autoFollow || false;
                
                // Classe du personnage
                player.class = data.player.class || 'aventurier';
                
                // Système de mort et respawn
                player.isDead = data.player.isDead || false;
                player.deathTime = data.player.deathTime || 0;
                // Forcer le respawnTime à 3 secondes pour corriger les anciennes sauvegardes
        player.respawnTime = 3000; // 3 secondes
                
                // Anciennes propriétés pour compatibilité
                player.stats = data.player.stats || {};
                
            }

            // Restaurer l'inventaire
            if (typeof window.loadInventoryForCharacter === 'function') {
                window.loadInventoryForCharacter(window.currentCharacterId);
            } else {
                // Fallback pour l'ancien système
                if (data.inventory) {
                    window.inventoryAll = data.inventory.inventoryAll || [];
                    window.inventoryEquipement = data.inventory.inventoryEquipement || [];
                    window.inventoryPotions = data.inventory.inventoryPotions || [];
                    window.inventoryRessources = data.inventory.inventoryRessources || [];
                }
                
                if (data.equipment) {
                    window.equippedItems = data.equipment.equippedItems || {
                        coiffe: null,
                        cape: null,
                        amulette: null,
                        anneau: null,
                        arme: null,
                        bouclier: null,
                        armure: null,
                        bottes: null
                    };
                }
            }

            // Restaurer les quêtes
            if (typeof window.loadQuestsForCharacter === 'function') {
                window.loadQuestsForCharacter(window.currentCharacterId);
            } else {
                // Fallback pour l'ancien système
                if (data.quests) {
                    window.quests = data.quests;
                }
            }

            // Restaurer l'état du jeu
            if (data.gameState) {
                window.currentMap = data.gameState.currentMap || 'map1';
                
                // Restaurer l'état de victoire du boss slime
                if (data.gameState.slimeBossDefeated !== undefined) {
                    window.slimeBossDefeated = data.gameState.slimeBossDefeated;
                }
            }

            // Restaurer les données des métiers
            if (data.metiers) {
                // Toujours cloner pour casser les références persistantes entre personnages
                const safeClone = JSON.parse(JSON.stringify(data.metiers));
                window.metiers = safeClone;
                // Ajouter paysan si absent dans d'anciennes sauvegardes
                if (!window.metiers.paysan) {
                    window.metiers.paysan = { niveau: 1, xp: 0, xpToNext: 100 };
                }
            } else {
                // Valeurs par défaut si aucune donnée sauvegardée
                window.metiers = {
                    tailleur: { niveau: 1, xp: 0, xpToNext: 100 },
                    cordonnier: { niveau: 1, xp: 0, xpToNext: 100 },
                    bijoutier: { niveau: 1, xp: 0, xpToNext: 100 },
                    alchimiste: { niveau: 1, xp: 0, xpToNext: 100 },
                    paysan: { niveau: 1, xp: 0, xpToNext: 100 }
                };
            }

            return true;
        } catch (error) {
            console.error('❌ Erreur lors du chargement:', error);
            return false;
        }
    }

    showLoadSuccess() {
        
        // Afficher le dialogue de bienvenue si c'est la première fois
        if (!window.characterCreationDialogShown) {
            setTimeout(() => {
                if (typeof window.showCharacterCreationDialog === 'function') {
                    window.showCharacterCreationDialog();
                }
            }, 1000);
        }
    }

    hasSave() {
        if (!window.currentCharacterId) return false;
        return localStorage.getItem(`monrpg_save_${window.currentCharacterId}`) !== null;
    }

    // Supprimer la sauvegarde
    deleteSave() {
        if (!window.currentCharacterId) return;
        
        // Supprimer la sauvegarde du personnage actuel
        localStorage.removeItem(`monrpg_save_${window.currentCharacterId}`);
        
        // Supprimer toutes les données de monstres
        localStorage.removeItem(`monrpg_monsters_${window.currentCharacterId}`);
        
        // Supprimer les compteurs de corbeaux tués
        localStorage.removeItem(`monrpg_crowKillCounts_${window.currentCharacterId}`);
        
        // Supprimer l'inventaire
        if (typeof window.deleteInventoryForCharacter === 'function') {
            window.deleteInventoryForCharacter(window.currentCharacterId);
        }
        
        // Supprimer les quêtes
        if (typeof window.deleteQuestsForCharacter === 'function') {
            window.deleteQuestsForCharacter(window.currentCharacterId);
        }
        
        // Réinitialiser les métiers
        window.metiers = {
            tailleur: { niveau: 1, xp: 0, xpToNext: 100 },
            cordonnier: { niveau: 1, xp: 0, xpToNext: 100 },
            bijoutier: { niveau: 1, xp: 0, xpToNext: 100 },
            alchimiste: { niveau: 1, xp: 0, xpToNext: 100 }
        };
        
    }

    getContinueButtonText() {
        if (!window.currentCharacterId) return '🔄 Continuer (aucune sauvegarde)';
        
        const saveData = localStorage.getItem(`monrpg_save_${window.currentCharacterId}`);
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                const timeSinceSave = Date.now() - data.timestamp;
                const minutes = Math.floor(timeSinceSave / 60000);
                
                if (minutes < 1) {
                    return '🔄 Continuer (maintenant)';
                } else if (minutes < 60) {
                    return `🔄 Continuer (${minutes}min)`;
                } else {
                    const hours = Math.floor(minutes / 60);
                    return `🔄 Continuer (${hours}h)`;
                }
            } catch (error) {
                return '🔄 Continuer';
            }
        } else {
            return '🔄 Continuer (aucune sauvegarde)';
        }
    }

    // Sauvegarde forcée lors d'événements importants
    forceSaveOnEvent() {
        if (window.gameState === "playing" && window.currentCharacterId) {
            this.saveGame();
            
            // Sauvegarder aussi les monstres de la map actuelle
            if (typeof window.saveMonstersForMap === 'function' && window.currentMap) {
                window.saveMonstersForMap(window.currentMap);
            }
        }
    }
}

// Exporter la fonction pour qu'elle soit accessible globalement
window.forceSaveOnEvent = function() {
    if (window.saveSystem) {
        window.saveSystem.forceSaveOnEvent();
    }
};

// Initialiser le système de sauvegarde
let saveSystem;

// Fonctions globales pour la sauvegarde
window.saveGame = function() {
    if (saveSystem) {
        saveSystem.saveGame();
    }
};

window.loadGame = function() {
    if (saveSystem) {
        return saveSystem.loadGame();
    }
    return false;
};

window.deleteSave = function() {
    if (saveSystem) {
        saveSystem.deleteSave();
    }
};

window.getContinueButtonText = function() {
    if (saveSystem) {
        return saveSystem.getContinueButtonText();
    }
    return '🔄 Continuer';
};

window.hasSave = function() {
    if (saveSystem) {
        return saveSystem.hasSave();
    }
    return false;
};

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    saveSystem = new SaveSystem();
    saveSystem.init(); // Initialiser le système de sauvegarde
});

// Sauvegarde automatique lors d'événements importants
window.autoSaveOnEvent = function() {
    // Vérifier si les sauvegardes automatiques sont désactivées
    if (window.autoSaveDisabled) {
        return;
    }
    
    if (saveSystem && window.gameState === "playing") {
        saveSystem.saveGame();
    }
};

// Fonction de test pour vérifier la sauvegarde des inventaires
window.testInventorySave = function() {
    
    // Ajouter quelques items de test
    if (typeof window.addItemToInventory === 'function') {
        window.addItemToInventory('coiffecorbeau', 'equipement');
        window.addItemToInventory('capecorbeau', 'equipement');
    }
    
    if (typeof window.addResourceToInventory === 'function') {
        window.addResourceToInventory('patte_corbeau', 5);
        window.addResourceToInventory('plume_corbeau', 3);
    }
    
    // Forcer une sauvegarde
    if (typeof window.autoSaveOnEvent === 'function') {
        window.autoSaveOnEvent();
    }
    
};

// Fonction pour supprimer TOUTES les données du localStorage
window.clearAllGameData = function() {
    
    // Supprimer toutes les données du localStorage
    localStorage.clear();
    
    // Réinitialiser les variables globales du jeu
    if (typeof window.resetInventory === 'function') {
        window.resetInventory();
    }
    
    if (typeof window.resetEquipment === 'function') {
        window.resetEquipment();
    }
    
    if (typeof window.resetPlayer === 'function') {
        window.resetPlayer();
    }
    
    // Réinitialiser les données de monstres
    if (typeof window.clearAllMonsterData === 'function') {
        window.clearAllMonsterData();
    }
    
    // Réinitialiser les variables globales
    window.playerName = undefined;
    window.playerAvatar = undefined;
    window.crowKillCounts = { map1: 0, map2: 0, map3: 0 };
    window.monsters = [];
    window.occupiedPositions = new Set();
    
}; 

// Fonction de test pour vérifier la sauvegarde
window.testSaveSystem = function() {
    
    if (!window.currentCharacterId) {
        return;
    }
    
    if (!player) {
        return;
    }
    
    
    // Forcer une sauvegarde
    if (typeof window.forceSaveOnEvent === 'function') {
        window.forceSaveOnEvent();
    }
    
    // Vérifier que la sauvegarde existe
    const saveKey = `monrpg_save_${window.currentCharacterId}`;
    const savedData = localStorage.getItem(saveKey);
    
    if (savedData) {
        const data = JSON.parse(savedData);
        
    } else {
        
    }
    
}; 

// Fonction de débogage pour vérifier l'état complet
window.debugSaveState = function() {
    
    if (!window.currentCharacterId) {
        return;
    }
    
    const saveKey = `monrpg_save_${window.currentCharacterId}`;
    const savedData = localStorage.getItem(saveKey);
    
    if (savedData) {
        const data = JSON.parse(savedData);
        
    } else {
        
    }
    
    if (player) {
        
    } else {
        
    }
    
}; 

// Variable pour désactiver temporairement les sauvegardes automatiques
window.autoSaveDisabled = false;

// Fonction pour désactiver temporairement les sauvegardes automatiques
function disableAutoSave() {
    window.autoSaveDisabled = true;
}

// Fonction pour réactiver les sauvegardes automatiques
function enableAutoSave() {
    window.autoSaveDisabled = false;
}

// Fonction pour forcer une sauvegarde manuelle
function forceManualSave() {
    if (saveSystem && window.gameState === "playing") {
        saveSystem.saveGame();
    }
}

// Export global
window.disableAutoSave = disableAutoSave;
window.enableAutoSave = enableAutoSave; 
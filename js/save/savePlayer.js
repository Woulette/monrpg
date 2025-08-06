// js/save/savePlayer.js
// Module de sauvegarde du joueur pour système multi-personnages
// Responsabilité : Sauvegarder et charger uniquement les données du joueur

class PlayerSaveManager {
    constructor() {
        this.version = "1.0.0"; // Versioning pour compatibilité future
    }

    // Sauvegarder les données du joueur
    savePlayer(characterId) {
        if (typeof player === 'undefined' || !characterId) {
            return false;
        }

        try {
            const playerData = {
                version: this.version,
                timestamp: Date.now(),
                characterId: characterId,
                
                // Position et mouvement
                position: {
                    x: player.x,
                    y: player.y,
                    px: player.px,
                    py: player.py,
                    spawnX: player.spawnX,
                    spawnY: player.spawnY
                },
                
                // Animation et direction
                animation: {
                    direction: player.direction,
                    frame: player.frame,
                    moving: player.moving,
                    moveTarget: player.moveTarget,
                    path: player.path
                },
                
                // Niveau et XP
                progression: {
                    level: player.level,
                    xp: player.xp,
                    xpToNextLevel: player.xpToNextLevel
                },
                
                // Vie et combat
                combat: {
                    life: player.life,
                    maxLife: player.maxLife,
                    inCombat: player.inCombat,
                    lastCombatTime: player.lastCombatTime,
                    lastRegenTime: player.lastRegenTime
                },
                
                // Statistiques de base
                baseStats: {
                    baseForce: player.baseForce,
                    baseIntelligence: player.baseIntelligence,
                    baseAgilite: player.baseAgilite,
                    baseDefense: player.baseDefense,
                    baseChance: player.baseChance,
                    baseVitesse: player.baseVitesse,
                    baseVie: player.baseVie
                },
                
                // Stats gagnées par l'XP de combat (permanentes)
                combatStats: {
                    combatForce: player.combatForce,
                    combatIntelligence: player.combatIntelligence,
                    combatAgilite: player.combatAgilite,
                    combatDefense: player.combatDefense,
                    combatChance: player.combatChance,
                    combatVitesse: player.combatVitesse,
                    combatVie: player.combatVie
                },
                
                // Statistiques d'équipement
                equipmentStats: {
                    equipForce: player.equipForce,
                    equipIntelligence: player.equipIntelligence,
                    equipAgilite: player.equipAgilite,
                    equipDefense: player.equipDefense,
                    equipChance: player.equipChance,
                    equipVitesse: player.equipVitesse,
                    equipVie: player.equipVie
                },
                
                // Statistiques totales
                totalStats: {
                    force: player.force,
                    intelligence: player.intelligence,
                    agilite: player.agilite,
                    defense: player.defense,
                    chance: player.chance,
                    vitesse: player.vitesse,
                    vie: player.vie
                },
                
                // XP des statistiques
                statXp: {
                    forceXp: player.forceXp,
                    intelligenceXp: player.intelligenceXp,
                    agiliteXp: player.agiliteXp,
                    defenseXp: player.defenseXp,
                    chanceXp: player.chanceXp,
                    vitesseXp: player.vitesseXp
                },
                
                // XP nécessaire pour le prochain niveau
                statXpToNext: {
                    forceXpToNext: player.forceXpToNext,
                    intelligenceXpToNext: player.intelligenceXpToNext,
                    agiliteXpToNext: player.agiliteXpToNext,
                    defenseXpToNext: player.defenseXpToNext,
                    chanceXpToNext: player.chanceXpToNext,
                    vitesseXpToNext: player.vitesseXpToNext
                },
                
                // Points de caractéristiques et monnaie
                resources: {
                    statPoints: player.statPoints,
                    pecka: player.pecka
                },
                
                // Suivi automatique
                autoFollow: player.autoFollow,
                
                // Système de mort et respawn
                death: {
                    isDead: player.isDead,
                    deathTime: player.deathTime,
                    respawnTime: player.respawnTime
                },
                
                // Anciennes propriétés pour compatibilité
                legacy: {
                    stats: player.stats
                }
            };

            // Sauvegarder dans localStorage
            const saveKey = `monrpg_player_${characterId}`;
            localStorage.setItem(saveKey, JSON.stringify(playerData));
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde du joueur:', error);
            return false;
        }
    }

    // Charger les données du joueur
    loadPlayer(characterId) {
        if (!characterId || typeof player === 'undefined') {
            return false;
        }

        try {
            const saveKey = `monrpg_player_${characterId}`;
            const savedData = localStorage.getItem(saveKey);
            
            if (!savedData) {
                return false;
            }

            const data = JSON.parse(savedData);
            
            // Vérifier la version pour compatibilité future
            if (data.version && data.version !== this.version) {
                console.warn(`⚠️ Version de sauvegarde différente: ${data.version} vs ${this.version}`);
            }

            // Restaurer la position
            if (data.position) {
                player.x = data.position.x || player.x;
                player.y = data.position.y || player.y;
                player.px = data.position.px || (player.x * TILE_SIZE);
                player.py = data.position.py || (player.y * TILE_SIZE);
                player.spawnX = data.position.spawnX || player.spawnX;
                player.spawnY = data.position.spawnY || player.spawnY;
            }
            
            // Restaurer l'animation
            if (data.animation) {
                player.direction = data.animation.direction || 0;
                player.frame = data.animation.frame || 0;
                player.moving = data.animation.moving || false;
                player.moveTarget = data.animation.moveTarget || { x: player.x, y: player.y };
                player.path = data.animation.path || [];
            }
            
            // Restaurer la progression
            if (data.progression) {
                player.level = data.progression.level || 1;
                player.xp = data.progression.xp || 0;
                player.xpToNextLevel = data.progression.xpToNextLevel || 100;
            }
            
            // Restaurer le combat
            if (data.combat) {
                player.life = data.combat.life || player.maxLife;
                player.maxLife = data.combat.maxLife || 50;
                player.inCombat = data.combat.inCombat || false;
                player.lastCombatTime = data.combat.lastCombatTime || 0;
                player.lastRegenTime = data.combat.lastRegenTime || 0;
            }
            
            // Restaurer les stats de base
            if (data.baseStats) {
                player.baseForce = data.baseStats.baseForce || 1;
                player.baseIntelligence = data.baseStats.baseIntelligence || 1;
                player.baseAgilite = data.baseStats.baseAgilite || 1;
                player.baseDefense = data.baseStats.baseDefense || 1;
                player.baseChance = data.baseStats.baseChance || 1;
                player.baseVitesse = data.baseStats.baseVitesse || 1;
                player.baseVie = data.baseStats.baseVie || 1;
            }
            
            // Restaurer les stats de combat
            if (data.combatStats) {
                player.combatForce = data.combatStats.combatForce || 0;
                player.combatIntelligence = data.combatStats.combatIntelligence || 0;
                player.combatAgilite = data.combatStats.combatAgilite || 0;
                player.combatDefense = data.combatStats.combatDefense || 0;
                player.combatChance = data.combatStats.combatChance || 0;
                player.combatVitesse = data.combatStats.combatVitesse || 0;
                player.combatVie = data.combatStats.combatVie || 0;
            }
            
            // Restaurer les stats d'équipement
            if (data.equipmentStats) {
                player.equipForce = data.equipmentStats.equipForce || 0;
                player.equipIntelligence = data.equipmentStats.equipIntelligence || 0;
                player.equipAgilite = data.equipmentStats.equipAgilite || 0;
                player.equipDefense = data.equipmentStats.equipDefense || 0;
                player.equipChance = data.equipmentStats.equipChance || 0;
                player.equipVitesse = data.equipmentStats.equipVitesse || 0;
                player.equipVie = data.equipmentStats.equipVie || 0;
            }
            
            // Restaurer les stats totales
            if (data.totalStats) {
                player.force = data.totalStats.force || 1;
                player.intelligence = data.totalStats.intelligence || 1;
                player.agilite = data.totalStats.agilite || 1;
                player.defense = data.totalStats.defense || 1;
                player.chance = data.totalStats.chance || 1;
                player.vitesse = data.totalStats.vitesse || 1;
                player.vie = data.totalStats.vie || 1;
            }
            
            // Restaurer l'XP des stats
            if (data.statXp) {
                player.forceXp = data.statXp.forceXp || 0;
                player.intelligenceXp = data.statXp.intelligenceXp || 0;
                player.agiliteXp = data.statXp.agiliteXp || 0;
                player.defenseXp = data.statXp.defenseXp || 0;
                player.chanceXp = data.statXp.chanceXp || 0;
                player.vitesseXp = data.statXp.vitesseXp || 0;
            }
            
            // Restaurer l'XP nécessaire
            if (data.statXpToNext) {
                player.forceXpToNext = data.statXpToNext.forceXpToNext || 100;
                player.intelligenceXpToNext = data.statXpToNext.intelligenceXpToNext || 100;
                player.agiliteXpToNext = data.statXpToNext.agiliteXpToNext || 100;
                player.defenseXpToNext = data.statXpToNext.defenseXpToNext || 100;
                player.chanceXpToNext = data.statXpToNext.chanceXpToNext || 100;
                player.vitesseXpToNext = data.statXpToNext.vitesseXpToNext || 100;
            }
            
            // Restaurer les ressources
            if (data.resources) {
                player.statPoints = data.resources.statPoints || 0;
                player.pecka = data.resources.pecka || 0;
            }
            
            // Restaurer les autres propriétés
            player.autoFollow = data.autoFollow || false;
            
            if (data.death) {
                player.isDead = data.death.isDead || false;
                player.deathTime = data.death.deathTime || 0;
                // Forcer le respawnTime à 3 secondes pour corriger les anciennes sauvegardes
        player.respawnTime = 3000; // 3 secondes
            }
            
            // Restaurer les données legacy
            if (data.legacy) {
                player.stats = data.legacy.stats || {};
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement du joueur:', error);
            return false;
        }
    }

    // Vérifier si une sauvegarde du joueur existe
    hasPlayerSave(characterId) {
        if (!characterId) return false;
        const saveKey = `monrpg_player_${characterId}`;
        return localStorage.getItem(saveKey) !== null;
    }

    // Supprimer la sauvegarde du joueur
    deletePlayerSave(characterId) {
        if (!characterId) return;
        
        try {
            const saveKey = `monrpg_player_${characterId}`;
            localStorage.removeItem(saveKey);
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de la sauvegarde du joueur:', error);
        }
    }

    // Valider l'intégrité des données du joueur
    validatePlayerData(data) {
        if (!data || typeof data !== 'object') {
            return { valid: false, error: 'Données invalides' };
        }

        const requiredFields = ['version', 'timestamp', 'characterId'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return { valid: false, error: `Champ requis manquant: ${field}` };
            }
        }

        return { valid: true };
    }
}

// Créer une instance globale
const playerSaveManager = new PlayerSaveManager();

// Exporter les fonctions pour compatibilité
window.savePlayerData = (characterId) => playerSaveManager.savePlayer(characterId);
window.loadPlayerData = (characterId) => playerSaveManager.loadPlayer(characterId);
window.hasPlayerSave = (characterId) => playerSaveManager.hasPlayerSave(characterId);
window.deletePlayerSave = (characterId) => playerSaveManager.deletePlayerSave(characterId);

// Exporter la classe pour utilisation avancée
window.PlayerSaveManager = PlayerSaveManager;
window.playerSaveManager = playerSaveManager;
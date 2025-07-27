// Système de sauvegarde automatique
class SaveSystem {
    constructor() {
        this.saveKey = 'monrpg_save';
        this.autoSaveInterval = 30000; // Sauvegarde automatique toutes les 30 secondes
        this.lastSaveTime = 0;
        this.init();
    }

    init() {
        // Démarrer la sauvegarde automatique
        setInterval(() => {
            this.autoSave();
        }, this.autoSaveInterval);

        // Pas de bouton visible en jeu, on utilisera le menu de sélection
    }

    // Sauvegarde automatique
    autoSave() {
        if (typeof player !== 'undefined' && typeof window.currentMap !== 'undefined') {
            this.saveGame();
            console.log('💾 Sauvegarde automatique effectuée');
        }
    }

    // Sauvegarde manuelle
    saveGame() {
        if (typeof player === 'undefined') return;

        const saveData = {
            timestamp: Date.now(),
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
                lastSaveTime: Date.now()
            },
            character: {
                name: window.playerName || 'Mon Personnage',
                avatar: window.playerAvatar || 'assets/personnages/player.png'
            }
        };

        try {
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            this.lastSaveTime = Date.now();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }

    // Charger la partie
    loadGame() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (!saveData) {
                console.log('Aucune sauvegarde trouvée');
                return false;
            }

            const data = JSON.parse(saveData);
            
            // Restaurer les données du joueur
            if (data.player && typeof player !== 'undefined') {
                // Position et mouvement
                player.x = data.player.x;
                player.y = data.player.y;
                player.px = data.player.px;
                player.py = data.player.py;
                player.direction = data.player.direction || 0;
                player.frame = data.player.frame || 0;
                player.moving = data.player.moving || false;
                player.moveTarget = data.player.moveTarget || { x: player.x, y: player.y };
                player.path = data.player.path || [];
                
                // Niveau et XP
                player.level = data.player.level;
                player.xp = data.player.xp;
                player.xpToNextLevel = data.player.xpToNextLevel;
                
                // Vie
                player.life = data.player.life;
                player.maxLife = data.player.maxLife;
                
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
                player.forceXpToNext = data.player.forceXpToNext || 10;
                player.intelligenceXpToNext = data.player.intelligenceXpToNext || 10;
                player.agiliteXpToNext = data.player.agiliteXpToNext || 10;
                player.defenseXpToNext = data.player.defenseXpToNext || 10;
                player.chanceXpToNext = data.player.chanceXpToNext || 10;
                player.vitesseXpToNext = data.player.vitesseXpToNext || 50;
                
                // Points de caractéristiques et monnaie
                player.statPoints = data.player.statPoints;
                player.pecka = data.player.pecka || 0;
                
                // État de combat
                player.inCombat = data.player.inCombat || false;
                player.lastCombatTime = data.player.lastCombatTime || 0;
                player.lastRegenTime = data.player.lastRegenTime || 0;
                
                // Suivi automatique
                player.autoFollow = data.player.autoFollow || false;
                
                // Système de mort et respawn
                player.isDead = data.player.isDead || false;
                player.deathTime = data.player.deathTime || 0;
                player.respawnTime = data.player.respawnTime || 3000;
                player.spawnX = data.player.spawnX;
                player.spawnY = data.player.spawnY;
                
                // Anciennes propriétés pour compatibilité
                if (data.player.stats) {
                    player.stats = data.player.stats;
                }
                
                // Recalculer les stats totales pour s'assurer qu'elles sont cohérentes
                if (typeof window.recalculateTotalStats === 'function') {
                    window.recalculateTotalStats();
                }
            }

            // Restaurer les infos du personnage
            if (data.character) {
                window.playerName = data.character.name;
                window.playerAvatar = data.character.avatar;
            }

            // Charger la map si différente
            if (data.gameState && data.gameState.currentMap && 
                data.gameState.currentMap !== window.currentMap) {
                if (typeof loadMap === 'function') {
                    loadMap(data.gameState.currentMap);
                }
            }
            
            // Nettoyer les données de monstres si on charge une map slime
            if (data.gameState && data.gameState.currentMap === "mapdonjonslime") {
                if (typeof window.clearAllMonsterData === "function") {
                    window.clearAllMonsterData();
                }
            }

            console.log('🎮 Partie chargée avec succès');
            this.showLoadSuccess();
            return true;

        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            return false;
        }
    }



    // Afficher un message de succès
    showLoadSuccess() {
        const message = document.createElement('div');
        message.innerHTML = '✅ Partie chargée !';
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            font-size: 16px;
            z-index: 1001;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 2000);
    }

    // Vérifier s'il y a une sauvegarde
    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    // Supprimer la sauvegarde
    deleteSave() {
        localStorage.removeItem(this.saveKey);
        console.log('🗑️ Sauvegarde supprimée');
    }

    // Obtenir le texte pour le bouton "Continuer"
    getContinueButtonText() {
        const saveData = localStorage.getItem(this.saveKey);
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
}

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
});

// Sauvegarde automatique lors d'événements importants
window.autoSaveOnEvent = function() {
    if (saveSystem) {
        saveSystem.saveGame();
    }
}; 
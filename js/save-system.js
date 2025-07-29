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
            // Sauvegarde des inventaires
            inventory: {
                inventoryAll: window.inventoryAll || [],
                inventoryEquipement: window.inventoryEquipement || [],
                inventoryPotions: window.inventoryPotions || [],
                inventoryRessources: window.inventoryRessources || []
            },
            // Sauvegarde de l'équipement
            equipment: {
                equippedItems: window.equippedItems || {
                    coiffe: null,
                    cape: null,
                    amulette: null,
                    anneau: null,
                    ceinture: null,
                    bottes: null
                }
            },
            gameState: {
                currentMap: window.currentMap,
                lastSaveTime: Date.now()
            },
            // Sauvegarde des quêtes
            quests: window.quests || {},
            // Sauvegarde de l'état des PNJs
            pnjs: {
                papi3: {
                    hasMoved: window.pnjs ? (window.pnjs.find(p => p.id === 'papi3')?.hasMoved || false) : false
                }
            },
            // Sauvegarde de la progression du donjon (NE PAS SAUVEGARDER - se réinitialise à chaque entrée)
            // dungeonProgression: window.dungeonProgression || {},
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
                // Vérifier si c'est un nouveau personnage
                const isNewCharacter = !data.timestamp || data.timestamp < Date.now() - 60000;
                
                if (isNewCharacter) {
                    // Forcer la position de départ pour un nouveau personnage
                    console.log('🆕 Nouveau personnage - Position forcée à (25, 12)');
                    player.x = 25;
                    player.y = 12;
                    player.px = 25 * TILE_SIZE;
                    player.py = 12 * TILE_SIZE;
                    player.spawnX = 25;
                    player.spawnY = 12;
                    
                    // Réinitialiser complètement le joueur pour un nouveau personnage
                    if (typeof window.resetPlayer === 'function') {
                        console.log('🔄 Réinitialisation complète du nouveau personnage');
                        window.resetPlayer();
                    }
                } else {
                    // Restaurer la position sauvegardée pour un personnage existant
                    player.x = data.player.x;
                    player.y = data.player.y;
                    player.px = data.player.px;
                    player.py = data.player.py;
                    player.spawnX = data.player.spawnX;
                    player.spawnY = data.player.spawnY;
                }
                
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
                
                // Anciennes propriétés pour compatibilité
                if (data.player.stats) {
                    player.stats = data.player.stats;
                }
                
                // Recalculer les stats totales pour s'assurer qu'elles sont cohérentes
                if (typeof window.recalculateTotalStats === 'function') {
                    window.recalculateTotalStats();
                }
            }

            // Restaurer les inventaires
            if (data.inventory) {
                // Restaurer les inventaires en s'assurant qu'ils ont la bonne structure
                window.inventoryAll = data.inventory.inventoryAll || Array.from({ length: 80 }, () => ({ item: null, category: null }));
                window.inventoryEquipement = data.inventory.inventoryEquipement || Array.from({ length: 80 }, () => ({ item: null, category: 'equipement' }));
                window.inventoryPotions = data.inventory.inventoryPotions || Array.from({ length: 80 }, () => ({ item: null, category: 'potions' }));
                window.inventoryRessources = data.inventory.inventoryRessources || Array.from({ length: 80 }, () => ({ item: null, category: 'ressources' }));
                
                // S'assurer que tous les inventaires ont la bonne longueur
                while (window.inventoryAll.length < 80) {
                    window.inventoryAll.push({ item: null, category: null });
                }
                while (window.inventoryEquipement.length < 80) {
                    window.inventoryEquipement.push({ item: null, category: 'equipement' });
                }
                while (window.inventoryPotions.length < 80) {
                    window.inventoryPotions.push({ item: null, category: 'potions' });
                }
                while (window.inventoryRessources.length < 80) {
                    window.inventoryRessources.push({ item: null, category: 'ressources' });
                }
                
                // IMPORTANT: Mettre à jour la référence window.inventory pour pointer vers inventoryAll
                window.inventory = window.inventoryAll;
                
                // Debug: Afficher le contenu des inventaires restaurés
                console.log('🔍 DEBUG - Inventaires restaurés:');
                console.log('inventoryAll:', window.inventoryAll.filter(slot => slot.item !== null));
                console.log('inventoryRessources:', window.inventoryRessources.filter(slot => slot.item !== null));
                console.log('inventory (référence):', window.inventory.filter(slot => slot.item !== null));
                
                // Mettre à jour l'affichage des inventaires
                if (typeof window.updateAllGrids === 'function') {
                    window.updateAllGrids();
                }
                
                // Mettre à jour les établies si elles sont ouvertes
                if (typeof window.updateEtabliesInventory === 'function') {
                    window.updateEtabliesInventory();
                }
                
                console.log('📦 Inventaires restaurés avec succès');
            }

            // Restaurer l'équipement
            if (data.equipment) {
                window.equippedItems = data.equipment.equippedItems || {
                    coiffe: null,
                    cape: null,
                    amulette: null,
                    anneau: null,
                    ceinture: null,
                    bottes: null
                };
                
                // Mettre à jour l'affichage de l'équipement
                if (typeof window.updateEquipmentDisplay === 'function') {
                    window.updateEquipmentDisplay();
                }
                
                console.log('⚔️ Équipement restauré avec succès');
            }

            // Restaurer les infos du personnage
            if (data.character) {
                window.playerName = data.character.name;
                window.playerAvatar = data.character.avatar;
            }

            // Charger la map si différente
            if (data.gameState && data.gameState.currentMap && 
                data.gameState.currentMap !== window.currentMap) {
                
                // Vérifier si c'est un nouveau personnage (pas de timestamp ou sauvegarde ancienne)
                const isNewCharacter = !data.timestamp || data.timestamp < Date.now() - 60000;
                
                if (isNewCharacter) {
                    // Forcer map1 pour un nouveau personnage
                    console.log('🆕 Nouveau personnage détecté - Forçage vers map1');
                    if (typeof loadMap === 'function') {
                        loadMap('map1');
                    }
                } else {
                    // Charger la map sauvegardée pour un personnage existant
                    if (typeof loadMap === 'function') {
                        loadMap(data.gameState.currentMap);
                    }
                }
            }

            // Restaurer les quêtes
            if (data.quests && typeof window.quests !== 'undefined') {
                Object.keys(data.quests).forEach(questId => {
                    if (window.quests[questId]) {
                        // Restaurer les propriétés importantes des quêtes
                        window.quests[questId].completed = data.quests[questId].completed || false;
                        window.quests[questId].accepted = data.quests[questId].accepted || false;
                        window.quests[questId].current = data.quests[questId].current || 0;
                        window.quests[questId].readyToComplete = data.quests[questId].readyToComplete || false;
                    }
                });
                console.log('📋 Quêtes restaurées avec succès');
            }

            // Restaurer l'état des PNJs
            if (data.pnjs && window.pnjs) {
                if (data.pnjs.papi3 && data.pnjs.papi3.hasMoved) {
                    const papi3 = window.pnjs.find(p => p.id === 'papi3');
                    if (papi3) {
                        papi3.hasMoved = true;
                        papi3.x += 1; // Se déplace d'une case vers la droite
                        papi3.px = papi3.x * TILE_SIZE;
                        
                        // Libérer l'ancienne position et occuper la nouvelle
                        if (typeof release === "function") {
                            release(papi3.x - 1, papi3.y);
                        }
                        if (typeof occupy === "function") {
                            occupy(papi3.x, papi3.y);
                        }
                        
                        console.log('👴 Papi3 position restaurée (déplacé)');
                    }
                }
            }
            
            // Nettoyer les données de monstres si on charge une map slime
            if (data.gameState && (data.gameState.currentMap === "mapdonjonslime" || data.gameState.currentMap === "mapdonjonslime2")) {
                if (typeof window.clearAllMonsterData === "function") {
                    window.clearAllMonsterData();
                }
            }
            
            // Charger la progression du donjon (NE PAS CHARGER - se réinitialise à chaque entrée)
            // if (data.dungeonProgression && typeof window.loadDungeonProgression === "function") {
            //     window.loadDungeonProgression(data.dungeonProgression);
            // }

            console.log('🎮 Partie chargée avec succès');
            
            // Mettre à jour l'affichage des pecka
            if (typeof window.updatePeckaDisplay === 'function') {
                window.updatePeckaDisplay();
            }
            
            this.showLoadSuccess();
            
            // Afficher le dialogue de bienvenue de Papi si c'est une nouvelle partie
            if (!data.timestamp || data.timestamp < Date.now() - 60000) { // Si pas de timestamp ou sauvegarde ancienne
                setTimeout(() => {
                    if (typeof showCharacterCreationDialog === 'function') {
                        showCharacterCreationDialog();
                    }
                }, 1000); // Délai de 1 seconde après le chargement
            }
            
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
        // Supprimer la sauvegarde principale
        localStorage.removeItem(this.saveKey);
        
        // Supprimer toutes les données de monstres
        localStorage.removeItem('monsterSaves');
        
        // Supprimer les compteurs de corbeaux tués
        localStorage.removeItem('crowKillCounts');
        
        // Supprimer toutes les autres données potentielles du jeu
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('monrpg_')) {
                localStorage.removeItem(key);
            }
        });
        
        console.log('🗑️ TOUTES les données du jeu ont été supprimées');
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

// Fonction de test pour vérifier la sauvegarde des inventaires
window.testInventorySave = function() {
    console.log('🧪 Test de sauvegarde des inventaires...');
    
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
    
    console.log('✅ Test terminé. Vérifiez la console pour les détails.');
    console.log('📦 Inventaires actuels:', {
        all: window.inventoryAll,
        equipement: window.inventoryEquipement,
        potions: window.inventoryPotions,
        ressources: window.inventoryRessources
    });
};

// Fonction pour supprimer TOUTES les données du localStorage
window.clearAllGameData = function() {
    console.log('🗑️ Suppression de TOUTES les données du jeu...');
    
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
    
    console.log('✅ TOUTES les données du jeu ont été supprimées et réinitialisées');
    console.log('🔄 Le jeu est maintenant dans un état complètement neuf');
}; 
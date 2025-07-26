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
                x: player.x,
                y: player.y,
                px: player.px,
                py: player.py,
                level: player.level,
                xp: player.xp,
                xpToNextLevel: player.xpToNextLevel,
                life: player.life,
                maxLife: player.maxLife,
                statPoints: player.statPoints,
                stats: player.stats,
                spawnX: player.spawnX,
                spawnY: player.spawnY
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
                player.x = data.player.x;
                player.y = data.player.y;
                player.px = data.player.px;
                player.py = data.player.py;
                player.level = data.player.level;
                player.xp = data.player.xp;
                player.xpToNextLevel = data.player.xpToNextLevel;
                player.life = data.player.life;
                player.maxLife = data.player.maxLife;
                player.statPoints = data.player.statPoints;
                player.stats = data.player.stats;
                player.spawnX = data.player.spawnX;
                player.spawnY = data.player.spawnY;
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
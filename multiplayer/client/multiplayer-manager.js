// Système multijoueur pour MonRPG
// Version séparée et organisée

class MultiplayerManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.otherPlayers = new Map();
        this.playerId = null;
        this.currentMap = 'map1';
        
        // Configuration
        this.serverUrl = 'ws://localhost:3001'; // Utiliser le serveur local pour tester
        this.updateInterval = null;
        
        console.log('🎮 Système multijoueur initialisé');
    }
    
    // Se connecter au serveur
    connect() {
        try {
            this.socket = new WebSocket(this.serverUrl);
            
            this.socket.onopen = () => {
                console.log('✅ Connecté au serveur multijoueur');
                this.connected = true;
                
                // Envoyer le nom du personnage avec un petit délai pour s'assurer qu'il est disponible
                setTimeout(() => {
                    this.sendPlayerName();
                }, 100);
                
                // S'assurer que la carte actuelle est synchronisée
                if (window.currentMap && this.currentMap !== window.currentMap) {
                    this.currentMap = window.currentMap;
                    console.log(`🗺️ Synchronisation de la carte: ${this.currentMap}`);
                }
                
                this.startPositionUpdates();
            };
            
            this.socket.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };
            
            this.socket.onclose = () => {
                console.log('❌ Déconnecté du serveur multijoueur');
                this.connected = false;
                this.otherPlayers.clear();
                this.stopPositionUpdates();
            };
            
            this.socket.onerror = (error) => {
                console.error('❌ Erreur de connexion:', error);
            };
            
        } catch (error) {
            console.error('❌ Impossible de se connecter:', error);
        }
    }
    
    // Gérer les messages reçus du serveur
    handleMessage(message) {
        switch(message.type) {
            case 'player_connected':
                this.playerId = message.data.id;
                console.log('🎯 Mon ID:', this.playerId);
                break;
                
            case 'other_players':
                // Vider la liste actuelle et ajouter les nouveaux joueurs
                this.otherPlayers.clear();
                console.log(`📥 Réception de ${message.data.length} joueurs du serveur`);
                
                console.log(`📥 Données reçues du serveur:`);
                message.data.forEach(player => {
                    console.log(`  - Joueur reçu: ${player.name} (${player.id})`);
                });
                
                // Debug: vérifier si les noms sont corrects
                message.data.forEach(player => {
                    if (player.name && player.name.startsWith('Joueur_')) {
                        console.log(`⚠️ Nom par défaut détecté: ${player.name} (${player.id})`);
                    }
                });
                
                message.data.forEach(player => {
                    // Ne pas ajouter notre propre joueur à la liste des autres joueurs
                    if (player.id !== this.playerId) {
                        this.otherPlayers.set(player.id, player);
                        console.log(`  - Ajouté: ${player.name} (${player.id}) sur ${player.map} à (${player.x}, ${player.y})`);
                    } else {
                        console.log(`  - Ignoré: Notre propre joueur (${player.id})`);
                    }
                });
                
                console.log(`👥 ${this.otherPlayers.size} autres joueurs chargés sur cette carte`);
                break;
                
            case 'player_joined':
                // Nouveau joueur rejoint
                // Ne pas ajouter notre propre joueur
                if (message.data.id !== this.playerId) {
                    this.otherPlayers.set(message.data.id, message.data);
                    console.log('👋 Nouveau joueur:', message.data.name);
                } else {
                    console.log('👋 Notre propre joueur rejoint (ignoré)');
                }
                break;
                
            case 'player_moved':
                // Mise à jour de position d'un autre joueur
                const player = this.otherPlayers.get(message.data.id);
                if (player) {
                    player.x = message.data.x;
                    player.y = message.data.y;
                    player.direction = message.data.direction;
                }
                break;
                
            case 'player_left':
                // Joueur parti
                const leftPlayerId = message.data.id;
                if (this.otherPlayers.has(leftPlayerId)) {
                    const leftPlayer = this.otherPlayers.get(leftPlayerId);
                    console.log(`👋 Joueur parti de cette carte: ${leftPlayer ? leftPlayer.name : 'Inconnu'} (${leftPlayerId})`);
                    this.otherPlayers.delete(leftPlayerId);
                } else {
                    console.log(`👋 Joueur parti de cette carte: ID ${leftPlayerId} (non trouvé dans la liste locale)`);
                }
                
                // Vérifier s'il y a des doublons de notre propre joueur
                this.otherPlayers.forEach((player, id) => {
                    if (player.id === this.playerId) {
                        console.log(`🧹 Suppression du doublon de notre joueur (ID: ${id})`);
                        this.otherPlayers.delete(id);
                    }
                });
                break;
        }
    }
    
    // Envoyer le nom du personnage
    sendPlayerName() {
        if (this.connected && this.socket && window.playerNameManager) {
            const playerName = window.playerNameManager.getPlayerName();
            
            // Vérifier que le nom n'est pas vide ou par défaut
            if (playerName && !playerName.startsWith('Joueur_')) {
                this.socket.send(JSON.stringify({
                    type: 'player_name',
                    name: playerName
                }));
                console.log(`📝 Envoi du nom du personnage: ${playerName}`);
            } else {
                console.log(`⚠️ Nom du personnage non valide: ${playerName}`);
            }
        } else {
            console.log('❌ Impossible d\'envoyer le nom: connexion ou gestionnaire non disponible');
        }
    }
    
    // Envoyer la position du joueur
    sendPlayerUpdate() {
        if (this.connected && this.socket && typeof player !== 'undefined') {
            this.socket.send(JSON.stringify({
                type: 'player_update',
                data: {
                    x: player.x,
                    y: player.y,
                    direction: player.direction
                }
            }));
        }
    }
    
    // Changer de carte
    changeMap(mapName) {
        if (this.connected && this.currentMap !== mapName) {
            console.log(`🗺️ Changement de carte: ${this.currentMap} → ${mapName}`);
            
            // Nettoyer la liste des autres joueurs avant de changer
            const oldMap = this.currentMap;
            this.otherPlayers.clear();
            console.log(`🧹 Liste des joueurs nettoyée pour ${oldMap} → ${mapName}`);
            
            this.currentMap = mapName;
            this.socket.send(JSON.stringify({
                type: 'mapChange',
                mapName: mapName
            }));
            console.log('🗺️ Changement de carte envoyé au serveur:', mapName);
        } else if (!this.connected) {
            console.log('❌ Impossible de changer de carte: non connecté');
        } else if (this.currentMap === mapName) {
            console.log('✅ Déjà sur la bonne carte');
        }
    }
    
    // Forcer la synchronisation de la carte actuelle
    syncCurrentMap() {
        if (this.connected && window.currentMap && this.currentMap !== window.currentMap) {
            console.log(`🔄 Synchronisation forcée: ${this.currentMap} → ${window.currentMap}`);
            this.changeMap(window.currentMap);
        }
    }
    
    // Démarrer les mises à jour de position
    startPositionUpdates() {
        this.updateInterval = setInterval(() => {
            this.sendPlayerUpdate();
        }, 100); // Envoyer position toutes les 100ms
    }
    
    // Arrêter les mises à jour
    stopPositionUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    // Dessiner les autres joueurs
    drawOtherPlayers(ctx) {
        if (!this.connected) return;

        this.otherPlayers.forEach((otherPlayer, id) => {
            const x = otherPlayer.x * TILE_SIZE;
            const y = otherPlayer.y * TILE_SIZE;

            ctx.save();
            
            // Utiliser l'image du joueur si disponible
            if (window.playerImg && window.playerImg.complete) {
                // Dessiner le sprite du joueur
                ctx.drawImage(
                    window.playerImg,
                    0, 0, 32, 32, // Source rectangle
                    x, y, 32, 32   // Destination rectangle
                );
            } else {
                // Fallback : dessiner un personnage simple
                ctx.fillStyle = '#4a90e2';
                ctx.fillRect(x + 6, y + 8, 20, 20);
                
                ctx.fillStyle = '#ffdbac';
                ctx.fillRect(x + 8, y + 4, 16, 12);
                
                ctx.fillStyle = '#000';
                ctx.fillRect(x + 10, y + 6, 2, 2);
                ctx.fillRect(x + 16, y + 6, 2, 2);
            }
            
                         // Debug: afficher le nom dans la console
             if (otherPlayer.name && !otherPlayer.name.startsWith('Joueur_')) {
                 console.log(`🎯 Affichage du nom: ${otherPlayer.name} pour le joueur ${otherPlayer.id}`);
             }
            
            ctx.restore();
        });
    }
    
    // Se déconnecter
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.stopPositionUpdates();
        this.otherPlayers.clear();
        this.connected = false;
    }
}

// Créer l'instance globale
window.multiplayerManager = new MultiplayerManager();

// Fonction pour activer le multijoueur
function enableMultiplayer() {
    console.log('🎮 Activation du mode multijoueur...');
    window.multiplayerManager.connect();
}

// Fonction pour désactiver le multijoueur
function disableMultiplayer() {
    console.log('🎮 Désactivation du mode multijoueur...');
    window.multiplayerManager.disconnect();
}

// Fonction pour dessiner les autres joueurs (à appeler dans la boucle de jeu)
function drawMultiplayerPlayers(ctx) {
    if (window.multiplayerManager && window.multiplayerManager.connected) {
        window.multiplayerManager.drawOtherPlayers(ctx);
    }
}

// Fonction pour forcer la synchronisation de la carte
function syncMultiplayerMap() {
    if (window.multiplayerManager && window.multiplayerManager.connected) {
        console.log('🔄 Tentative de synchronisation de la carte...');
        console.log(`- Carte actuelle du jeu: ${window.currentMap}`);
        console.log(`- Carte actuelle du multijoueur: ${window.multiplayerManager.currentMap}`);
        
        if (window.currentMap && window.multiplayerManager.currentMap !== window.currentMap) {
            console.log('🔄 Synchronisation nécessaire, changement de carte...');
            window.multiplayerManager.changeMap(window.currentMap);
            return true;
        } else {
            console.log('✅ Cartes déjà synchronisées');
            return false;
        }
    } else {
        console.log('❌ Multijoueur non connecté');
        return false;
    }
}

// Fonction pour forcer le rafraîchissement de la liste des joueurs
function refreshPlayerList() {
    if (window.multiplayerManager && window.multiplayerManager.connected) {
        console.log('🔄 Forçage du rafraîchissement de la liste des joueurs...');
        
        // Nettoyer la liste actuelle
        window.multiplayerManager.otherPlayers.clear();
        
        // Redemander la liste des joueurs au serveur
        window.multiplayerManager.socket.send(JSON.stringify({
            type: 'request_players',
            mapName: window.multiplayerManager.currentMap
        }));
        
        console.log('📡 Demande de liste des joueurs envoyée au serveur');
        return true;
    } else {
        console.log('❌ Multijoueur non connecté');
        return false;
    }
}

// Fonction pour diagnostiquer l'état du multijoueur
function diagnoseMultiplayer() {
    console.log('🔍 Diagnostic du système multijoueur:');
    console.log(`- Multijoueur initialisé: ${!!window.multiplayerManager}`);
    console.log(`- Connecté: ${window.multiplayerManager ? window.multiplayerManager.connected : false}`);
    console.log(`- Carte du jeu: ${window.currentMap}`);
    console.log(`- Carte multijoueur: ${window.multiplayerManager ? window.multiplayerManager.currentMap : 'N/A'}`);
    console.log(`- Autres joueurs: ${window.multiplayerManager ? window.multiplayerManager.otherPlayers.size : 0}`);
    
    if (window.multiplayerManager && window.multiplayerManager.otherPlayers.size > 0) {
        console.log('👥 Joueurs connectés:');
        window.multiplayerManager.otherPlayers.forEach((player, id) => {
            console.log(`  - ${player.name} (${id}) sur ${player.map} à (${player.x}, ${player.y})`);
        });
    }
}

// Fonction pour forcer la reconnexion
function forceReconnect() {
    if (window.multiplayerManager) {
        console.log('🔄 Forçage de la reconnexion...');
        window.multiplayerManager.disconnect();
        
        // Attendre un peu puis reconnecter
        setTimeout(() => {
            window.multiplayerManager.connect();
        }, 1000);
        
        return true;
    } else {
        console.log('❌ Multijoueur non initialisé');
        return false;
    }
}

console.log('🎮 Module multijoueur séparé chargé'); 
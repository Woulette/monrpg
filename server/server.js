// Serveur WebSocket pour MonRPG Multijoueur
// Version simple pour tester

const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

// Créer le serveur Express
const app = express();
app.use(cors());

// Créer le serveur HTTP
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`🚀 Serveur MonRPG démarré sur le port ${PORT}`);
});

// Créer le serveur WebSocket
const wss = new WebSocket.Server({ server });

// Stocker les joueurs connectés
const players = new Map();
const rooms = {
    'map1': new Set(),
    'map2': new Set(),
    'map3': new Set(),
    'map4': new Set()
};

// Quand un joueur se connecte
wss.on('connection', (socket) => {
    console.log('🎮 Nouveau joueur connecté');
    
    // Données du joueur
    let playerData = {
        id: Date.now() + Math.random(),
        x: 25,
        y: 12,
        direction: 0,
        map: 'map1',
        name: 'Joueur_' + Math.floor(Math.random() * 1000)
    };
    
    // Ajouter le joueur à la liste
    players.set(socket, playerData);
    
    // Envoyer les données du joueur
    socket.send(JSON.stringify({
        type: 'player_connected',
        data: playerData
    }));
    
    // Envoyer la liste des autres joueurs sur la même carte
    const otherPlayers = Array.from(players.values())
        .filter(p => p.id !== playerData.id && p.map === playerData.map);
    
    socket.send(JSON.stringify({
        type: 'other_players',
        data: otherPlayers
    }));
    
    // Informer les autres joueurs
    broadcastToMap(playerData.map, {
        type: 'player_joined',
        data: playerData
    }, socket);
    
    // Quand on reçoit un message du joueur
    socket.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch(data.type) {
                case 'player_update':
                    // Mettre à jour la position du joueur
                    playerData.x = data.data.x;
                    playerData.y = data.data.y;
                    playerData.direction = data.data.direction;
                    
                    // Envoyer la mise à jour aux autres joueurs
                    broadcastToMap(playerData.map, {
                        type: 'player_moved',
                        data: {
                            id: playerData.id,
                            x: playerData.x,
                            y: playerData.y,
                            direction: playerData.direction
                        }
                    }, socket);
                    break;
                    
                case 'mapChange':
                    // Changer de carte
                    const oldMap = playerData.map;
                    playerData.map = data.mapName;
                    
                    console.log(`🗺️ Joueur ${playerData.name} (${playerData.id}) change de ${oldMap} vers ${playerData.map}`);
                    
                    // Retirer de l'ancienne carte - envoyer player_left à tous les joueurs de l'ancienne carte
                    broadcastToMap(oldMap, {
                        type: 'player_left',
                        data: { id: playerData.id }
                    }, socket);
                    
                    // Envoyer la liste mise à jour aux joueurs de l'ancienne carte
                    const oldMapPlayers = Array.from(players.values())
                        .filter(p => p.id !== playerData.id && p.map === oldMap);
                    
                    broadcastToMap(oldMap, {
                        type: 'other_players',
                        data: oldMapPlayers
                    }, socket);
                    
                    console.log(`📤 Joueurs restants sur ${oldMap}: ${oldMapPlayers.length}`);
                    
                    // Ajouter à la nouvelle carte - envoyer player_joined à tous les joueurs de la nouvelle carte
                    broadcastToMap(playerData.map, {
                        type: 'player_joined',
                        data: playerData
                    }, socket);
                    
                    // Envoyer les joueurs de la nouvelle carte au joueur qui a changé
                    const newMapPlayers = Array.from(players.values())
                        .filter(p => p.id !== playerData.id && p.map === playerData.map);
                    
                    socket.send(JSON.stringify({
                        type: 'other_players',
                        data: newMapPlayers
                    }));
                    
                    console.log(`📥 Joueurs sur ${playerData.map}: ${newMapPlayers.length}`);
                    break;
                    
                case 'request_players':
                    // Demande de la liste des joueurs pour une carte
                    const requestedMap = data.mapName || playerData.map;
                    const mapPlayers = Array.from(players.values())
                        .filter(p => p.id !== playerData.id && p.map === requestedMap);
                    
                    console.log(`📡 Demande de joueurs reçue:`);
                    console.log(`  - Joueur: ${playerData.name} (${playerData.id})`);
                    console.log(`  - Carte demandée: ${requestedMap}`);
                    console.log(`  - Joueurs trouvés: ${mapPlayers.length}`);
                    
                    socket.send(JSON.stringify({
                        type: 'other_players',
                        data: mapPlayers
                    }));
                    
                    console.log(`📡 Liste des joueurs envoyée pour ${requestedMap}: ${mapPlayers.length} joueurs`);
                    break;
            }
        } catch (error) {
            console.error('❌ Erreur parsing message:', error);
        }
    });
    
    // Quand un joueur se déconnecte
    socket.on('close', () => {
        console.log('👋 Joueur déconnecté:', playerData.name);
        
        // Retirer le joueur
        players.delete(socket);
        
        // Informer les autres joueurs
        broadcastToMap(playerData.map, {
            type: 'player_left',
            data: { id: playerData.id }
        }, socket);
    });
});

// Fonction pour envoyer un message à tous les joueurs d'une carte
function broadcastToMap(mapName, message, excludeSocket = null) {
    wss.clients.forEach((client) => {
        if (client !== excludeSocket && 
            client.readyState === WebSocket.OPEN &&
            players.has(client) &&
            players.get(client).map === mapName) {
            client.send(JSON.stringify(message));
        }
    });
}

// Route de test
app.get('/', (req, res) => {
    res.json({
        message: 'MonRPG Serveur Multijoueur',
        players: players.size,
        rooms: Object.keys(rooms).map(map => ({
            map,
            players: Array.from(players.values()).filter(p => p.map === map).length
        }))
    });
});

console.log('🎮 Serveur MonRPG Multijoueur prêt !');
console.log('📊 Connectez-vous sur ws://localhost:3001'); 
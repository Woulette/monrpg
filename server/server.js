// Serveur WebSocket pour MonRPG Multijoueur
// Version simple pour tester

const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const { authRouter, requireAuth } = require('./auth');
const { charactersRouter } = require('./characters');

// Créer le serveur Express
const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);
app.use('/characters', charactersRouter);

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
        name: 'Joueur_' + Math.floor(Math.random() * 1000),
        color: '#' + Math.floor(Math.random()*16777215).toString(16) // Couleur aléatoire
    };
    
    // Attendre la réception du nom du personnage
    let playerNameReceived = false;
    
    // Ajouter le joueur à la liste
    players.set(socket, playerData);
    
    // Envoyer les données du joueur
    socket.send(JSON.stringify({
        type: 'player_connected',
        data: playerData
    }));
    
    // Attendre un peu avant d'envoyer la liste des joueurs pour permettre l'envoi du nom
    setTimeout(() => {
        // Envoyer la liste des autres joueurs sur la même carte (seulement les joueurs avec des noms personnalisés)
        const otherPlayers = Array.from(players.values())
            .filter(p => p.id !== playerData.id && p.map === playerData.map && !p.name.startsWith('Joueur_'));
        
        console.log(`📤 Envoi de ${otherPlayers.length} autres joueurs au nouveau joueur (noms personnalisés uniquement):`);
        otherPlayers.forEach(p => {
            console.log(`  - ${p.name} (${p.id}) sur ${p.map}`);
        });
        
        socket.send(JSON.stringify({
            type: 'other_players',
            data: otherPlayers
        }));
    }, 200); // Attendre 200ms pour permettre l'envoi du nom
    
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
                case 'player_name':
                    // Réception du nom du personnage
                    const oldName = playerData.name;
                    playerData.name = data.name;
                    playerNameReceived = true;
                    console.log(`📝 Nom du personnage reçu: ${data.name} (ancien: ${oldName})`);
                    
                    // Mettre à jour le nom dans la Map des joueurs
                    players.set(socket, playerData);
                    console.log(`💾 Nom mis à jour dans la Map pour ${playerData.id}: ${oldName} → ${playerData.name}`);
                    
                    // Informer les autres joueurs du changement de nom
                    broadcastToMap(playerData.map, {
                        type: 'player_joined',
                        data: playerData
                    }, socket);
                    
                    // Envoyer la liste mise à jour à tous les joueurs de cette carte (seulement les joueurs avec des noms personnalisés)
                    const updatedMapPlayers = Array.from(players.values())
                        .filter(p => p.id !== playerData.id && p.map === playerData.map && !p.name.startsWith('Joueur_'));
                    
                    console.log(`📤 Envoi de la liste mise à jour avec ${updatedMapPlayers.length} joueurs (noms personnalisés uniquement):`);
                    updatedMapPlayers.forEach(p => {
                        console.log(`  - ${p.name} (${p.id})`);
                    });
                    
                    // Envoyer la liste mise à jour à tous les joueurs de cette carte
                    broadcastToMap(playerData.map, {
                        type: 'other_players',
                        data: updatedMapPlayers
                    }, socket);
                    
                    // Envoyer aussi au joueur qui vient de se connecter
                    socket.send(JSON.stringify({
                        type: 'other_players',
                        data: updatedMapPlayers
                    }));
                    
                    console.log(`🔄 Nom mis à jour pour ${playerData.id}: ${oldName} → ${playerData.name}`);
                    break;
                    
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
                        .filter(p => p.id !== playerData.id && p.map === requestedMap && !p.name.startsWith('Joueur_'));
                    
                    console.log(`📡 Demande de joueurs reçue:`);
                    console.log(`  - Joueur: ${playerData.name} (${playerData.id})`);
                    console.log(`  - Carte demandée: ${requestedMap}`);
                    console.log(`  - Joueurs trouvés: ${mapPlayers.length} (noms personnalisés uniquement)`);
                    
                    socket.send(JSON.stringify({
                        type: 'other_players',
                        data: mapPlayers
                    }));
                    
                    console.log(`📡 Liste des joueurs envoyée pour ${requestedMap}: ${mapPlayers.length} joueurs`);
                    break;
                    
                case 'monster_updates':
                    // Réception des mises à jour des monstres d'un joueur
                    console.log(`🐉 Réception de ${data.data.length} mises à jour de monstres de ${playerData.name} (${playerData.id})`);
                    
                    // Diffuser les mises à jour aux autres joueurs sur la même carte
                    broadcastToMap(playerData.map, {
                        type: 'monster_updates',
                        data: data.data
                    }, socket);
                    
                    console.log(`🐉 Mises à jour des monstres diffusées à ${playerData.map}`);
                    break;
                    
                case 'monster_attack':
                    // Réception d'une attaque sur un monstre
                    console.log(`⚔️ Attaque reçue: ${data.data.damage} dégâts sur ${data.data.monsterType} par ${playerData.name} (${playerData.id})`);
                    
                    // Diffuser l'attaque aux autres joueurs sur la même carte
                    broadcastToMap(playerData.map, {
                        type: 'monster_attack',
                        data: data.data
                    }, socket);
                    
                    console.log(`⚔️ Attaque diffusée à ${playerData.map}`);
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

// Exemple: route protégée (future API perso/inventaire)
app.get('/protected/ping', requireAuth, (req, res) => {
    res.json({ ok: true, user: req.user });
});

console.log('🎮 Serveur MonRPG Multijoueur prêt !');
console.log('📊 Connectez-vous sur ws://localhost:3001'); 
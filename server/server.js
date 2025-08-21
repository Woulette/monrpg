// Serveur WebSocket pour MonRPG Multijoueur
// Version simple pour tester

const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { randInt, makeId } = require('./utils/random');
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

});

// Créer le serveur WebSocket
const wss = new WebSocket.Server({ server });

// Stocker les joueurs connectés
const players = new Map();
const rooms = {
    'map1': new Set(),
    'map2': new Set(),
    'map3': new Set(),
    'map4': new Set(),
    'map5': new Set()
};

// Groupes (parties) – déportés dans ws/party.js
const { handlePartyMessage, onPlayerDisconnectCleanup, requestInitialPartyState, getPartyForPlayerId } = require('./ws/party');
const { getSocketByPlayerId, broadcastToParty, setWsContext } = require('./utils/socket');
const { generateLootForPlayer } = require('./loot');
const { collisionsByMap, loadMapCollision, isBlockedServer } = require('./utils/collisions');
const { deadMonstersByMap, monstersByMap, getDeadRegistryForMap, ensureMonstersForMapFactory, monsterKey } = require('./game/state/monsters');
const { mapSlimeKills, mapPortalUnlocked, mapDecorRemoved, addSlimeKill, isPortalUnlocked, unlockPortal, isDecorRemoved, removeDecor } = require('./game/state/dungeon');
setWsContext({ wss, players });

// Registre des monstres morts par carte (serveur autoritaire du respawn)
// Structure: Map<mapName, Map<key, { type, x, y, diedAt, respawnMs }>>
// État et collisions importés ci-dessus
const mapCrowKills = new Map(); // Map<string mapName, number crowKillCount>
// Suivi d'activité des joueurs (pour anti-AFK loot) et taggeurs par monstre
const playerLastAttackAt = new Map(); // Map<number playerId, number lastAttackTimestamp>
const monsterTaggersByMap = new Map(); // Map<string mapName, Map<string monsterId, Set<number playerId>>> 

// randInt/makeId désormais importés

// ensureMonstersForMap externalisée via factory
const ensureMonstersForMap = ensureMonstersForMapFactory(isBlockedServer);

// monsterKey importée

// Quand un joueur se connecte
wss.on('connection', (socket) => {

    
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
    // Envoyer la liste des monstres de la carte courante
    try {
        const list = ensureMonstersForMap(playerData.map).filter(m => {
            const reg = getDeadRegistryForMap(playerData.map);
            return !reg.has(monsterKey(m.type, m.x, m.y));
        });
        socket.send(JSON.stringify({ type: 'monster_list', data: list }));
    } catch(e) {}
    
    // Attendre un peu avant d'envoyer la liste des joueurs pour permettre l'envoi du nom
    setTimeout(() => {
        // Envoyer la liste des autres joueurs sur la même carte (seulement les joueurs avec des noms personnalisés)
        const otherPlayers = Array.from(players.values())
            .filter(p => p.id !== playerData.id && p.map === playerData.map && !p.name.startsWith('Joueur_'));
        

        
        // Envoyer la liste au joueur qui vient de se connecter
        socket.send(JSON.stringify({
            type: 'other_players',
            data: otherPlayers
        }));
    }, 200);
    
    // Informer les autres joueurs
    broadcastToMap(playerData.map, {
        type: 'player_joined',
        data: playerData
    }, socket);
    
    // Quand on reçoit un message du joueur
    socket.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            // Nouveau: router quelques domaines vers des handlers dédiés
            const { handleWsMessage } = require('./ws/handlers');
            const ctx = { wss, players, playerData, socket, getSocketByPlayerId, getPartyForPlayerId, broadcastToMap, isBlockedServer, playerLastAttackAt, monsterTaggersByMap, mapCrowKills, collisionsByMap, awardPartyXP };
            if (handleWsMessage(ctx, data) === true) return;

            // D'abord déléguer aux handlers de domaines
            if (handlePartyMessage(players, socket, playerData, data) === true) {
                return; // déjà traité par party
            }
            switch(data.type) {
                    
                case 'mapChange':
                    // Changer de carte
                    const oldMap = playerData.map;
                    playerData.map = data.mapName;
                    

                    
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
                    

                    
                    // Ajouter à la nouvelle carte - envoyer player_joined à tous les joueurs de la nouvelle carte
                    if (playerData.map.startsWith('mapdonjon') && playerData.dungeonInstance && playerData.dungeonInstance[playerData.map]) {
                        // Pour les donjons, diffuser seulement à l'instance
                        const myInstanceId = playerData.dungeonInstance[playerData.map];
                        const instancePlayers = Array.from(players.values()).filter(p => 
                            p.id !== playerData.id && 
                            p.map === playerData.map && 
                            p.dungeonInstance && 
                            p.dungeonInstance[playerData.map] === myInstanceId
                        );
                        instancePlayers.forEach(p => {
                            const sock = getSocketByPlayerId(p.id);
                            if (sock && sock.readyState === 1) {
                                try { sock.send(JSON.stringify({ type: 'player_joined', data: playerData })); } catch(_) {}
                            }
                        });

                    } else {
                        // Map normale: diffusion standard
                        broadcastToMap(playerData.map, {
                            type: 'player_joined',
                            data: playerData
                        }, socket);
                    }
                    
                    // Envoyer les joueurs de la nouvelle carte au joueur qui a changé
                    let newMapPlayers = Array.from(players.values())
                        .filter(p => p.id !== playerData.id && p.map === playerData.map);
                    
                    // Pour les donjons, filtrer par instance si le joueur en a une
                    if (playerData.map.startsWith('mapdonjon') && playerData.dungeonInstance && playerData.dungeonInstance[playerData.map]) {
                        const myInstanceId = playerData.dungeonInstance[playerData.map];
                        newMapPlayers = newMapPlayers.filter(p => {
                            // Seulement les joueurs de la même instance
                            return p.dungeonInstance && p.dungeonInstance[playerData.map] === myInstanceId;
                        });

                    }
                    
                    socket.send(JSON.stringify({
                        type: 'other_players',
                        data: newMapPlayers
                    }));
                    


                    // Envoyer la liste des monstres de la nouvelle carte
                    // Pour les donjons, on attend enter_dungeon pour créer l'instance
                    if (!playerData.map.startsWith('mapdonjon')) {
                        try {
                            const list2 = ensureMonstersForMap(playerData.map).filter(m => {
                                const reg = getDeadRegistryForMap(playerData.map);
                                return !reg.has(monsterKey(m.type, m.x, m.y));
                            });
                            socket.send(JSON.stringify({ type: 'monster_list', data: list2 }));
                        } catch(e) {}
                    }
                    break;
                    
                // request_players géré par ws/handlers/players.js
                    
                // request_monster_list géré par ws/handlers/monsters.js

                // monster_updates / monster_attack: laissés pour future extraction ou conservés si besoin

                // request_dungeon_state géré par ws/handlers/dungeon.js

                // Les handlers monstres (hit/killed/dead_monsters) sont gérés par ws/handlers/monsters.js

                // Système de groupe géré par ws/party.js déjà branché en amont
            }
        } catch (error) {
            console.error('❌ Erreur parsing message:', error);
        }
    });
    
    // Quand un joueur se déconnecte
    socket.on('close', () => {

        
        // Retirer le joueur
        players.delete(socket);
        // Nettoyer le groupe si membre (module)
        try { onPlayerDisconnectCleanup(players, playerData); } catch(_) {}
        
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

 

// Helper: attribuer l'XP au groupe (Phase 2)
function awardPartyXP(mapName, killerPlayerId, baseXp) {
    try {
        const party = getPartyForPlayerId(killerPlayerId);
        if (party) {
            const eligible = Array.from(party.members)
                .map(pid => ({ pid, sock: getSocketByPlayerId(pid) }))
                .filter(e => e.sock && players.get(e.sock)?.map === mapName);
            const k = Math.max(1, eligible.length);
            const groupBonus = 1 + 0.2 * (k - 1);
            const totalXP = Math.round((baseXp || 10) * groupBonus);
            const xpEach = Math.max(1, Math.floor(totalXP / k));

            eligible.forEach(e => {
                try { e.sock.send(JSON.stringify({ type: 'party_xp', data: { amount: xpEach, baseXp: baseXp || 10, groupBonus, members: k } })); } catch(_) {}
            });
        } else {
            const sock = getSocketByPlayerId(killerPlayerId);
            if (sock) sock.send(JSON.stringify({ type: 'party_xp', data: { amount: baseXp || 10, baseXp: baseXp || 10, groupBonus: 1, members: 1 } }));

        }
    } catch (e) {
        console.warn('awardPartyXP error:', e.message);
    }
}

// Tâche périodique: vérifier les respawns
setInterval(() => {
    const now = Date.now();
    deadMonstersByMap.forEach((reg, mapName) => {
        const toRespawn = [];
        reg.forEach((info, key) => {
            if (now >= info.diedAt + info.respawnMs) {
                toRespawn.push({ key, info });
            }
        });
        if (toRespawn.length > 0) {
            toRespawn.forEach(({ key, info }) => {
                reg.delete(key);
                // Réinsérer un monstre de ce type (positions simples aléatoires)
                const list = ensureMonstersForMap(mapName);
                // Trouver une position de respawn valide (non bloquée)
                const cinfo = collisionsByMap.get(mapName);
                const width = cinfo?.width || 48; const height = cinfo?.height || 25;
                let rx = randInt(0, width-1), ry = randInt(0, height-1);
                let tries = 0;
                while (isBlockedServer(mapName, rx, ry) && tries < 200) { rx = randInt(0, width-1); ry = randInt(0, height-1); tries++; }
                const newMonster = {
                    id: makeId(info.type), type: info.type,
                    x: rx, y: ry,
                    level: info.type === 'cochon' ? randInt(7,10) : (info.type === 'crow' ? randInt(1,4) : 1),
                    hp: 20, maxHp: 20,
                    xpValue: 10,
                    force: 4,
                    defense: 2,
                    respawnMs: 30000,
                    moveSpeed: info.type === 'cochon' ? 0.45 : info.type === 'crow' ? 0.3 : info.type === 'slime' ? 0.2 : info.type === 'slimeboss' ? 0.3 : info.type === 'aluineeks' ? 0.7 : 0.4
                };
                list.push(newMonster);
                // Informer les joueurs de la map
                broadcastToMap(mapName, { type: 'monster_respawn', data: newMonster });

            });
        }
    });
}, 1000);

// Tâche périodique: IA serveur et synchronisation des positions (autoritaire)
// Chargement minimal des collisions depuis les JSON de maps (calque id===2)
/* moved to utils/collisions.js
function loadMapCollision(mapName) {
    try {
        const file = path.join(__dirname, '..', 'assets', 'maps', `${mapName}.json`);
        if (!fs.existsSync(file)) return;
        const json = JSON.parse(fs.readFileSync(file, 'utf8'));
        const width = json.width || 48;
        const height = json.height || 25;
        const layer2 = Array.isArray(json.layers) ? json.layers.find(l => l.id === 2) : null;
        const data = Array.isArray(layer2?.data) ? layer2.data : [];
        const blocked = new Array(width*height).fill(false);
        for (let y=0;y<height;y++) {
            for (let x=0;x<width;x++) {
                const idx = y*width + x;
                const gid = data[idx] || 0;
                blocked[idx] = gid !== 0;
            }
        }
        collisionsByMap.set(mapName, { width, height, blocked });

    } catch (e) {
        console.warn('⚠️ Impossible de charger collisions pour', mapName, e.message);
    }
}

function isBlockedServer(mapName, x, y) {
    const info = collisionsByMap.get(mapName);
    if (!info) return false;
    if (x < 0 || y < 0 || x >= info.width || y >= info.height) return true;
    return !!info.blocked[y*info.width + x];
}
*/

['map1','map2','map3','map4','map5','mapdonjonslime','mapdonjonslime2','mapdonjonslimeboss','mapzonealuineeks1'].forEach(loadMapCollision);

function stepMonsterAIForMap(mapName) {
    const list = ensureMonstersForMap(mapName);
    if (!Array.isArray(list) || list.length === 0) return [];
    const cinfo = collisionsByMap.get(mapName);
    const width = cinfo?.width || 48, height = cinfo?.height || 25; // bornes simples
    const now = Date.now();

    const moves = [];

    for (const m of list) {
        // Ne pas bouger si mort (géré par registre)
        if (deadMonstersByMap.get(mapName)?.has(monsterKey(m.type, m.x, m.y))) continue;

        // États init
        if (typeof m.pauseUntil !== 'number') m.pauseUntil = 0;
        if (typeof m.pathEndAt !== 'number') m.pathEndAt = 0;
        if (!Array.isArray(m.plannedPath)) m.plannedPath = null;
        if (typeof m.moveSpeed !== 'number') {
            // Définir une vitesse par défaut par type si absente
            m.moveSpeed = m.type === 'cochon' ? 0.45 : m.type === 'crow' ? 0.3 : m.type === 'slime' ? 0.2 : m.type === 'slimeboss' ? 0.3 : m.type === 'aluineeks' ? 0.7 : 0.4;
        }
        if (typeof m.perTileMs !== 'number') {
            // Convertir moveSpeed (px/frame) en ms par case (32 px) à ~60 FPS
            const msPerTile = Math.round((32 / Math.max(0.05, m.moveSpeed)) * (1000 / 60));
            m.perTileMs = Math.max(120, Math.min(4000, msPerTile));
        }
        if (!Array.isArray(m.recentCells)) m.recentCells = []; // mémoire courte anti-boucle
        if (!Array.isArray(m.lastDir)) m.lastDir = null; // dernière direction [dx,dy]

        // Finir un mouvement en cours
        if (m.plannedPath && now >= m.pathEndAt) {
            const last = m.plannedPath[m.plannedPath.length - 1];
            if (last) { m.x = last.x; m.y = last.y; }
            m.plannedPath = null;
            m.pathEndAt = 0;
            // Pause longue 3–8s demandée
            m.pauseUntil = now + (3000 + Math.floor(Math.random() * 5000));
        }

        // Planifier un nouveau chemin si prêt et pas en cours
        if (!m.plannedPath && now >= m.pauseUntil) {
            const steps = 1 + Math.floor(Math.random() * 8); // 1..8
            const path = [];
            // Directions cardinales uniquement (pas de diagonale)
            const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
            let cx = m.x, cy = m.y;
            let lastDir = Array.isArray(m.lastDir) ? m.lastDir.slice() : null;
            const isRecent = (x,y) => m.recentCells.some(c => c.x === x && c.y === y);
            for (let i=0;i<steps;i++) {
                // Construire la liste de directions candidates en évitant le demi-tour immédiat
                let candidates = dirs;
                if (lastDir) {
                    const opp = [-lastDir[0], -lastDir[1]];
                    candidates = dirs.filter(d => !(d[0] === opp[0] && d[1] === opp[1]));
                    if (candidates.length === 0) candidates = dirs; // fallback
                }
                // Tenter de choisir une direction qui ne revisite pas une case récente
                let chosen = null;
                // Mélanger légèrement les candidats
                for (let t=0; t<candidates.length; t++) {
                    const idx = Math.floor(Math.random()*candidates.length);
                    const d = candidates[idx];
                    const nx = Math.max(0, Math.min(width-1, cx + d[0]));
                    const ny = Math.max(0, Math.min(height-1, cy + d[1]));
                    if (nx === cx && ny === cy) continue;
                    if (isBlockedServer(mapName, nx, ny)) continue; // éviter les collisions
                    if (!isRecent(nx, ny)) { chosen = d; break; }
                }
                // Si toutes revisitent, accepter la première valide dans les bornes
                if (!chosen) {
                    for (const d of candidates) {
                        const nx = Math.max(0, Math.min(width-1, cx + d[0]));
                        const ny = Math.max(0, Math.min(height-1, cy + d[1]));
                        if ((nx !== cx || ny !== cy) && !isBlockedServer(mapName, nx, ny)) { chosen = d; break; }
                    }
                }
                if (!chosen) break; // bloqué
                const nx = Math.max(0, Math.min(width-1, cx + chosen[0]));
                const ny = Math.max(0, Math.min(height-1, cy + chosen[1]));
                if (nx === cx && ny === cy) break;
                cx = nx; cy = ny;
                path.push({ x: cx, y: cy });
                lastDir = chosen;
            }
            if (path.length > 0) {
                m.plannedPath = path;
                // Durée totale = cases * perTileMs
                const duration = path.length * m.perTileMs;
                m.pathEndAt = now + duration;
                m.pathStartX = m.x; m.pathStartY = m.y;
                m.lastDir = lastDir;
                // Mémoriser ces cases pour éviter les boucles immédiates
                for (const cell of path) {
                    m.recentCells.push({ x: cell.x, y: cell.y });
                    if (m.recentCells.length > 12) m.recentCells.shift();
                }
                moves.push({
                    id: m.id,
                    fromX: m.x,
                    fromY: m.y,
                    path,
                    perTileMs: m.perTileMs,
                    startAt: now
                });
            } else {
                // Si pas de déplacement possible, reprogrammer plus tard
                m.pauseUntil = now + 500;
            }
        }
    }

    return moves; // liste d'événements de chemin à diffuser
}

setInterval(() => {
    // Diffuser les chemins à jouer pour chaque map active
    const maps = ['map1','map2','map3','map4','map5','mapdonjonslime','mapdonjonslime2','mapdonjonslimeboss','mapzonealuineeks1'];
    maps.forEach(mapName => {
        const moveEvents = stepMonsterAIForMap(mapName);
        if (moveEvents.length > 0) {
            broadcastToMap(mapName, { type: 'monster_paths', data: moveEvents });
        }
    });
}, 200);
// Serveur WebSocket pour MonRPG Multijoueur
// Version simple pour tester

const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
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
    'map4': new Set(),
    'map5': new Set()
};

// Groupes (parties) – déportés dans ws/party.js
const { handlePartyMessage, onPlayerDisconnectCleanup, requestInitialPartyState, getPartyForPlayerId } = require('./ws/party');
const { getSocketByPlayerId, broadcastToParty, setWsContext } = require('./utils/socket');
const { generateLootForPlayer } = require('./loot');
setWsContext({ wss, players });

// Registre des monstres morts par carte (serveur autoritaire du respawn)
// Structure: Map<mapName, Map<key, { type, x, y, diedAt, respawnMs }>>
const deadMonstersByMap = new Map();
const monstersByMap = new Map(); // Map<string, Array<Monster>>
const collisionsByMap = new Map(); // Map<string, { width, height, blocked:boolean[] }>
// Suivi d'activité des joueurs (pour anti-AFK loot) et taggeurs par monstre
const playerLastAttackAt = new Map(); // Map<number playerId, number lastAttackTimestamp>
const monsterTaggersByMap = new Map(); // Map<string mapName, Map<string monsterId, Set<number playerId>>> 

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function makeId(prefix='m') { return prefix + '_' + Date.now().toString(36) + '_' + Math.floor(Math.random()*1e6).toString(36); }

function ensureMonstersForMap(mapName) {
    if (!mapName) return [];
    if (monstersByMap.has(mapName)) return monstersByMap.get(mapName);
    let arr = [];
    const cinfo = collisionsByMap.get(mapName);
    const width = cinfo?.width || 48;
    const height = cinfo?.height || 25;
    if (mapName === 'map1' || mapName === 'map2' || mapName === 'map3') {
        // Générer 10 corbeaux
        for (let i=0;i<10;i++) {
            const level = randInt(1,4);
            const baseHp = 15; const hpMul = 1 + (level-1)*0.2;
            const baseXp = 10; const xpMul = 1 + (level-1)*0.3;
            arr.push({
                id: makeId('crow'), type: 'crow',
                x: randInt(0,width-1), y: randInt(0,height-1),
                level,
                hp: Math.floor(baseHp*hpMul), maxHp: Math.floor(baseHp*hpMul),
                xpValue: Math.floor(baseXp*xpMul),
                force: Math.floor(4 * (1 + (level-1)*0.15)),
                defense: Math.floor(2 * (1 + (level-1)*0.10)),
                respawnMs: 30000,
                moveSpeed: 0.3
            });
        }
    } else if (mapName === 'map4' || mapName === 'map5') {
        // Générer 8 cochons
        for (let i=0;i<8;i++) {
            const level = randInt(7,10);
            const delta = level-7;
            const baseHp = 100; const hpMul = 1 + delta*0.07;
            const xpBase = randInt(35,50) + Math.floor(delta*2);
            arr.push({
                id: makeId('cochon'), type: 'cochon',
                x: randInt(0,width-1), y: randInt(0,height-1),
                level,
                hp: Math.floor(baseHp*hpMul), maxHp: Math.floor(baseHp*hpMul),
                xpValue: xpBase,
                force: Math.floor(15 * (1 + delta*0.06)),
                defense: Math.floor(10 * (1 + delta*0.05)),
                respawnMs: 30000,
                moveSpeed: 0.45
            });
        }
    } else if (mapName === 'mapdonjonslime') {
        // 5 slimes niveau 7, pas de respawn
        for (let i=0;i<5;i++) {
            const level = 7;
            const baseHp = 30; const hpMul = 1 + (level-7)*0.25;
            arr.push({
                id: makeId('slime'), type: 'slime',
                x: randInt(0,Math.max(1,width-1)), y: randInt(0,Math.max(1,height-1)),
                level,
                hp: Math.floor(baseHp*hpMul), maxHp: Math.floor(baseHp*hpMul),
                xpValue: Math.floor(25 * (1 + (level-7)*0.35)),
                force: Math.floor(9 * (1 + (level-7)*0.25)),
                defense: Math.floor(6 * (1 + (level-7)*0.20)),
                respawnMs: 0,
                moveSpeed: 0.2
            });
        }
    } else if (mapName === 'mapdonjonslime2') {
        // 7 slimes niveaux 8-9, pas de respawn
        const levels = [8,8,8,9,9,9,9];
        for (let i=0;i<7;i++) {
            const level = levels[i] || 8;
            const baseHp = 30; const hpMul = 1 + (level-7)*0.25;
            arr.push({
                id: makeId('slime'), type: 'slime',
                x: randInt(0,Math.max(1,width-1)), y: randInt(0,Math.max(1,height-1)),
                level,
                hp: Math.floor(baseHp*hpMul), maxHp: Math.floor(baseHp*hpMul),
                xpValue: Math.floor(25 * (1 + (level-7)*0.35)),
                force: Math.floor(9 * (1 + (level-7)*0.25)),
                defense: Math.floor(6 * (1 + (level-7)*0.20)),
                respawnMs: 0,
                moveSpeed: 0.2
            });
        }
    } else if (mapName === 'mapdonjonslimeboss') {
        // SlimeBoss unique (64x64) → respawn 0 (boss)
        const level = 10;
        arr.push({
            id: makeId('slimeboss'), type: 'slimeboss',
            x: randInt(0,width-1), y: randInt(0,height-1),
            level,
            hp: 200, maxHp: 200,
            xpValue: 500,
            force: 25,
            defense: 20,
            respawnMs: 0,
            moveSpeed: 0.3
        });
    } else if (mapName === 'mapzonealuineeks1') {
        // 10 Aluineeks
        for (let i=0;i<10;i++) {
            const level = randInt(8,12);
            arr.push({
                id: makeId('aluineeks'), type: 'aluineeks',
                x: randInt(0,width-1), y: randInt(0,height-1),
                level,
                hp: 60, maxHp: 60,
                xpValue: 40,
                force: 12,
                defense: 8,
                respawnMs: 30000,
                moveSpeed: 0.7
            });
        }
    } else {
        arr = [];
    }
    monstersByMap.set(mapName, arr);
    return arr;
}

function getDeadRegistryForMap(mapName) {
    let reg = deadMonstersByMap.get(mapName);
    if (!reg) {
        reg = new Map();
        deadMonstersByMap.set(mapName, reg);
    }
    return reg;
}

function monsterKey(type, x, y) {
    return `${type}:${x}:${y}`;
}

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
            
            // D'abord déléguer aux handlers de domaines
            if (handlePartyMessage(players, socket, playerData, data) === true) {
                return; // déjà traité par party
            }
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
                 case 'chat_global': {
                     const text = (data.text || '').toString().slice(0, 200);
                     if (!text) break;
                     wss.clients.forEach((client) => {
                         if (client.readyState === WebSocket.OPEN) {
                             client.send(JSON.stringify({ type: 'chat_global', data: { from: playerData.name, text } }));
                         }
                     });
                     break;
                 }
                 case 'chat_party': {
                     const text = (data.text || '').toString().slice(0, 200);
                     if (!text) break;
                     const party = getPartyForPlayerId(playerData.id);
                     if (!party) break;
                     party.members.forEach(pid => {
                         const sock = getSocketByPlayerId(pid);
                         if (sock && sock.readyState === WebSocket.OPEN) {
                             sock.send(JSON.stringify({ type: 'chat_party', data: { from: playerData.name, text } }));
                         }
                     });
                     break;
                 }
                    
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

                    // Envoyer la liste des monstres de la nouvelle carte
                    try {
                        const list2 = ensureMonstersForMap(playerData.map).filter(m => {
                            const reg = getDeadRegistryForMap(playerData.map);
                            return !reg.has(monsterKey(m.type, m.x, m.y));
                        });
                        socket.send(JSON.stringify({ type: 'monster_list', data: list2 }));
                    } catch(e) {}
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
                    
                case 'request_monster_list': {
                    const mapName = data.mapName || playerData.map;
                    const list = ensureMonstersForMap(mapName).filter(m => {
                        const reg = getDeadRegistryForMap(mapName);
                        return !reg.has(monsterKey(m.type, m.x, m.y));
                    });
                    socket.send(JSON.stringify({ type: 'monster_list', data: list }));
                    break;
                }

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

                case 'hit':
                case 'monsterDamage':
                case 'damage': {
                    // Compat: normaliser vers monster_hit
                    const p = (data && data.data) ? data.data : (data || {});
                    const normId = p.id != null ? p.id : (p.monsterId != null ? p.monsterId : (p.idMonster != null ? p.idMonster : p.targetId));
                    const normDmg = p.damage != null ? p.damage : (p.dmg != null ? p.dmg : (p.finalDamage != null ? p.finalDamage : p.value));
                    data = { type: 'monster_hit', data: { id: normId, damage: normDmg } };
                    // fallthrough
                }
                case 'monster_hit': {
                    const { id, damage } = data.data || {};
                    const mapName = playerData.map;
                    if (!id) break;
                    // Activité et taggers
                    playerLastAttackAt.set(playerData.id, Date.now());
                    {
                        let mapReg = monsterTaggersByMap.get(mapName);
                        if (!mapReg) { mapReg = new Map(); monsterTaggersByMap.set(mapName, mapReg); }
                        let tagSet = mapReg.get(id);
                        if (!tagSet) { tagSet = new Set(); mapReg.set(id, tagSet); }
                        tagSet.add(playerData.id);
                    }
                    const list = ensureMonstersForMap(mapName);
                    const m = list.find(mm => mm.id === id);
                    if (!m) {
                        console.warn(`⚠️ monster_hit: monstre introuvable id=${id} sur ${mapName}`);
                        break;
                    }
                    const dmg = Math.max(1, Math.floor(Number(damage) || 0));
                    const before = m.hp || m.maxHp || 1;
                    m.hp = Math.max(0, (m.hp || m.maxHp || 1) - dmg);
                    const after = m.hp;
                    console.log(`🗡️ monster_hit id=${id} type=${m.type} dmg=${dmg} hp:${before}→${after}`);
                    // Broadcast HP update
                    broadcastToMap(mapName, { type: 'monster_hp', data: { id: m.id, hp: m.hp } });
                    if (m.hp <= 0) {
                        // Enregistrer mort + retirer de la liste
                        const baseXp = m.xpValue || 10;
                        const reg = getDeadRegistryForMap(mapName);
                        reg.set(monsterKey(m.type, m.x, m.y), { type: m.type, x: m.x, y: m.y, diedAt: Date.now(), respawnMs: m.respawnMs || 30000 });
                        const idx = list.findIndex(mm => mm.id === id);
                        if (idx >= 0) list.splice(idx,1);
                        broadcastToMap(mapName, { type: 'monster_killed', data: { id: id, type: m.type, x: m.x, y: m.y } });
                        console.log(`✅ KILL via monster_hit: id=${id} type=${m.type} xp=${baseXp}`);
                        // Attribuer XP (autoritaire serveur) au tueur et son groupe
                        awardPartyXP(mapName, playerData.id, baseXp);

                        // LOOT DE GROUPE (AFK=0 pecka aussi)
                        try {
                            const now = Date.now();
                            const killerId = playerData.id;
                            const mapPlayers = Array.from(players.entries()).filter(([sock, pdata]) => pdata.map === mapName);
                            const tagSet = (monsterTaggersByMap.get(mapName)?.get(id)) || new Set([killerId]);
                            const isActive = (pid) => {
                                const t = playerLastAttackAt.get(pid) || 0;
                                return (now - t) <= 20000; // 20s
                            };
                            // Taggeurs 100%
                            mapPlayers.forEach(([sock, pdata]) => {
                                if (tagSet.has(pdata.id) && isActive(pdata.id)) {
                                    const chance = pdata?.chance || 0;
                                    const loot = generateLootForPlayer(m.type, chance, 1.0);
                                    if ((loot.resources && loot.resources.length > 0) || loot.pecka > 0) {
                                        try { sock.send(JSON.stringify({ type: 'loot_award', data: { loot } })); } catch(_) {}
                                    }
                                }
                            });
                            // Actifs non-tagueurs 50%
                            mapPlayers.forEach(([sock, pdata]) => {
                                if (!tagSet.has(pdata.id) && isActive(pdata.id)) {
                                    const chance = pdata?.chance || 0;
                                    const loot = generateLootForPlayer(m.type, chance, 0.5);
                                    if ((loot.resources && loot.resources.length > 0) || loot.pecka > 0) {
                                        try { sock.send(JSON.stringify({ type: 'loot_award', data: { loot } })); } catch(_) {}
                                    }
                                }
                            });
                            // Nettoyage des taggers
                            const mapReg = monsterTaggersByMap.get(mapName);
                            if (mapReg) mapReg.delete(id);
                        } catch (e) { console.warn('Loot group error:', e.message); }
                    }
                    break;
                }

                case 'monster_killed': {
                    // Un client déclare la mort d'un monstre → enregistrer la mort et diffuser
                    const { map, type, x, y, respawnMs } = data.data || {};
                    if (!map || !type || typeof x !== 'number' || typeof y !== 'number') {
                        console.warn('⚠️ monster_killed invalide', data.data);
                        break;
                    }
                    const reg = getDeadRegistryForMap(map);
                    const key = monsterKey(type, x, y);
                    const list = ensureMonstersForMap(map);
                    const idx = list.findIndex(m => m.type === type && m.x === x && m.y === y);
                    const baseXp = (idx >= 0 && list[idx] && list[idx].xpValue) ? list[idx].xpValue : 10;
                    reg.set(key, { type, x, y, diedAt: Date.now(), respawnMs: Math.max(0, Number(respawnMs || 30000)) });
                    if (idx >= 0) list.splice(idx,1);
                    console.log(`💀 ${type} mort sur ${map} en (${x},${y}) → respawn dans ~${respawnMs||30000}ms, baseXp=${baseXp}`);
                    broadcastToMap(map, { type: 'monster_killed', data: { type, x, y } });
                    // Répartition d'XP autoritaire
                    awardPartyXP(map, playerData.id, baseXp);
                    break;
                }

                case 'request_dead_monsters': {
                    // Renvoyer la liste des monstres morts non expirés pour une carte
                    const mapName = data.mapName || playerData.map;
                    const now = Date.now();
                    const reg = getDeadRegistryForMap(mapName);
                    const list = [];
                    reg.forEach((info) => {
                        const remaining = Math.max(0, (info.diedAt + info.respawnMs) - now);
                        if (remaining > 0) {
                            list.push({ type: info.type, x: info.x, y: info.y, remainingMs: remaining });
                        }
                    });
                    socket.send(JSON.stringify({ type: 'dead_monsters', data: list }));
                    console.log(`📥 dead_monsters (${mapName}) → ${list.length} envoyés`);
                    break;
                }

                // === SYSTÈME DE GROUPE (PARTY) ===
                case 'party_invite': {
                    const targetId = data.targetId;
                    if (!targetId || targetId === playerData.id) break;
                    let party = getPartyOfPlayer(playerData.id);
                    if (!party) {
                        // Créer un groupe
                        party = { id: nextPartyId++, leaderId: playerData.id, members: new Set([playerData.id]), createdAt: Date.now() };
                        parties.set(party.id, party);
                    }
                    // Seulement le chef peut inviter et taille max 5
                    if (party.leaderId !== playerData.id || party.members.size >= 5) break;
                    // Ne pas inviter un membre déjà dedans
                    if (party.members.has(targetId)) break;
                    const targetSock = getSocketByPlayerId(targetId);
                    if (targetSock && targetSock.readyState === WebSocket.OPEN) {
                        targetSock.send(JSON.stringify({ type: 'party_invite', data: { fromId: playerData.id, fromName: playerData.name, partyId: party.id } }));
                    }
                    break;
                }
                case 'party_accept': {
                    const partyId = data.partyId;
                    const party = parties.get(partyId);
                    if (!party) break;
                    if (party.members.size >= 5) break;
                    // éviter duplicat
                    party.members.add(playerData.id);
                    broadcastToParty(party.id, { type: 'party_update', data: buildPartyPayload(party) });
                    // informer le nouveau membre
                    socket.send(JSON.stringify({ type: 'party_update', data: buildPartyPayload(party) }));
                    break;
                }
                case 'party_decline': {
                    // Optionnel: notifier l'invitant
                    const fromId = data.fromId;
                    const fromSock = getSocketByPlayerId(fromId);
                    if (fromSock && fromSock.readyState === WebSocket.OPEN) {
                        fromSock.send(JSON.stringify({ type: 'party_declined', data: { byId: playerData.id, byName: playerData.name } }));
                    }
                    break;
                }
                case 'party_leave': {
                    const party = getPartyOfPlayer(playerData.id);
                    if (!party) break;
                    party.members.delete(playerData.id);
                    if (party.members.size === 0) {
                        parties.delete(party.id);
                    } else {
                        if (party.leaderId === playerData.id) {
                            // Transférer au premier membre restant
                            party.leaderId = Array.from(party.members)[0];
                        }
                        broadcastToParty(party.id, { type: 'party_update', data: buildPartyPayload(party) });
                    }
                    socket.send(JSON.stringify({ type: 'party_left', data: { ok: true } }));
                    break;
                }
                case 'party_kick': {
                    const targetId = data.targetId;
                    const party = getPartyOfPlayer(playerData.id);
                    if (!party || party.leaderId !== playerData.id) break;
                    if (!party.members.has(targetId)) break;
                    party.members.delete(targetId);
                    const tsock = getSocketByPlayerId(targetId);
                    if (tsock && tsock.readyState === WebSocket.OPEN) {
                        tsock.send(JSON.stringify({ type: 'party_kicked', data: { partyId: party.id } }));
                    }
                    broadcastToParty(party.id, { type: 'party_update', data: buildPartyPayload(party) });
                    break;
                }
                case 'party_disband': {
                    const party = getPartyOfPlayer(playerData.id);
                    if (!party || party.leaderId !== playerData.id) break;
                    broadcastToParty(party.id, { type: 'party_disband', data: { id: party.id } });
                    parties.delete(party.id);
                    break;
                }
                case 'request_party': {
                    const party = getPartyOfPlayer(playerData.id);
                    if (party) {
                        socket.send(JSON.stringify({ type: 'party_update', data: buildPartyPayload(party) }));
                    } else {
                        socket.send(JSON.stringify({ type: 'party_update', data: null }));
                    }
                    break;
                }
                case 'party_member_hp': {
                    const { hp, maxHp } = data;
                    const party = getPartyOfPlayer(playerData.id);
                    if (!party) break;
                    broadcastToParty(party.id, { type: 'party_member_hp', data: { id: playerData.id, hp, maxHp } });
                    break;
                }
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

console.log('🎮 Serveur MonRPG Multijoueur prêt !');
console.log('📊 Connectez-vous sur ws://localhost:3001'); 

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
            console.log(`🎁 XP groupe: base=${baseXp||10}, k=${k}, bonus=${groupBonus.toFixed(2)}, each=${xpEach}`);
            eligible.forEach(e => {
                try { e.sock.send(JSON.stringify({ type: 'party_xp', data: { amount: xpEach, baseXp: baseXp || 10, groupBonus, members: k } })); } catch(_) {}
            });
        } else {
            const sock = getSocketByPlayerId(killerPlayerId);
            if (sock) sock.send(JSON.stringify({ type: 'party_xp', data: { amount: baseXp || 10, baseXp: baseXp || 10, groupBonus: 1, members: 1 } }));
            console.log(`🎁 XP solo: base=${baseXp||10}`);
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
                console.log(`🔄 Respawn disponible sur ${mapName} pour type=${info.type}`);
            });
        }
    });
}, 1000);

// Tâche périodique: IA serveur et synchronisation des positions (autoritaire)
// Chargement minimal des collisions depuis les JSON de maps (calque id===2)
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
        console.log(`🧱 Collisions chargées pour ${mapName}: ${blocked.filter(Boolean).length} tuiles bloquées`);
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
// Gestion des groupes (party) côté serveur

let parties = new Map(); // Map<partyId, { id, leaderId, members:Set<number>, createdAt:number }>
let nextPartyId = 1;

const { getSocketByPlayerId } = require('../utils/socket');

function getPartyOfPlayer(playerId) {
  console.log(`🔍 Recherche de groupe pour joueur ${playerId}`);
  console.log(`📊 Groupes existants:`, Array.from(parties.values()).map(p => ({ id: p.id, members: Array.from(p.members) })));
  for (const party of parties.values()) {
    if (party.members.has(playerId)) {
      console.log(`✅ Joueur ${playerId} trouvé dans groupe ${party.id}`);
      return party;
    }
  }
  console.log(`❌ Joueur ${playerId} n'est dans aucun groupe`);
  return null;
}

function buildPartyPayload(players, party) {
  const members = Array.from(party.members).map(pid => {
    const sock = getSocketByPlayerId(pid);
    const pdata = sock && players.get(sock);
    return { id: pid, name: pdata ? pdata.name : `P${pid}` };
  });
  return { id: party.id, leaderId: party.leaderId, members };
}

function broadcastToParty(party, message) {
  if (!party) return;
  party.members.forEach(pid => {
    const sock = getSocketByPlayerId(pid);
    if (sock && sock.readyState === 1) {
      sock.send(JSON.stringify(message));
    }
  });
}

function handlePartyMessage(players, socket, playerData, data) {
  switch (data.type) {
    case 'party_invite': {
      const targetId = data.targetId;
      if (!targetId || targetId === playerData.id) break;
      let party = getPartyOfPlayer(playerData.id);
      if (!party) {
        party = { id: nextPartyId++, leaderId: playerData.id, members: new Set([playerData.id]), createdAt: Date.now() };
        parties.set(party.id, party);
      }
      if (party.leaderId !== playerData.id || party.members.size >= 5) break;
      if (party.members.has(targetId)) break;
      const targetSock = getSocketByPlayerId(targetId);
      if (targetSock && targetSock.readyState === 1) {
        targetSock.send(JSON.stringify({ type: 'party_invite', data: { fromId: playerData.id, fromName: playerData.name, partyId: party.id } }));
      }
      break;
    }
    case 'party_accept': {
      const partyId = data.partyId;
      const party = parties.get(partyId);
      if (!party) break;
      if (party.members.size >= 5) break;
      party.members.add(playerData.id);
      const payload = buildPartyPayload(players, party);
      broadcastToParty(party, { type: 'party_update', data: payload });
      socket.send(JSON.stringify({ type: 'party_update', data: payload }));
      break;
    }
    case 'party_decline': {
      const fromId = data.fromId;
      const fromSock = getSocketByPlayerId(fromId);
      if (fromSock && fromSock.readyState === 1) {
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
          party.leaderId = Array.from(party.members)[0];
        }
        broadcastToParty(party, { type: 'party_update', data: buildPartyPayload(players, party) });
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
      if (tsock && tsock.readyState === 1) {
        tsock.send(JSON.stringify({ type: 'party_kicked', data: { partyId: party.id } }));
      }
      broadcastToParty(party, { type: 'party_update', data: buildPartyPayload(players, party) });
      break;
    }
    case 'party_transfer_leader': {
      const targetId = data.targetId;
      const party = getPartyOfPlayer(playerData.id);
      if (!party || party.leaderId !== playerData.id) break;
      if (!party.members.has(targetId)) break;
      party.leaderId = targetId;
      broadcastToParty(party, { type: 'party_update', data: buildPartyPayload(players, party) });
      break;
    }
    case 'party_disband': {
      const party = getPartyOfPlayer(playerData.id);
      if (!party || party.leaderId !== playerData.id) break;
      broadcastToParty(party, { type: 'party_disband', data: { id: party.id } });
      parties.delete(party.id);
      break;
    }
    case 'request_party': {
      const party = getPartyOfPlayer(playerData.id);
      if (party) {
        socket.send(JSON.stringify({ type: 'party_update', data: buildPartyPayload(players, party) }));
      } else {
        socket.send(JSON.stringify({ type: 'party_update', data: null }));
      }
      break;
    }
    case 'party_member_hp': {
      const { hp, maxHp } = data;
      const party = getPartyOfPlayer(playerData.id);
      if (!party) break;
      broadcastToParty(party, { type: 'party_member_hp', data: { id: playerData.id, hp, maxHp } });
      break;
    }
    default:
      return false; // non traité
  }
  return true; // traité
}

function onPlayerDisconnectCleanup(players, playerData) {
  const party = getPartyOfPlayer(playerData.id);
  if (party) {
    party.members.delete(playerData.id);
    if (party.members.size === 0) {
      parties.delete(party.id);
    } else {
      if (party.leaderId === playerData.id) {
        party.leaderId = Array.from(party.members)[0];
      }
      broadcastToParty(party, { type: 'party_update', data: buildPartyPayload(players, party) });
    }
  }
}

function requestInitialPartyState(players, socket, playerData) {
  const party = getPartyOfPlayer(playerData.id);
  if (party) {
    socket.send(JSON.stringify({ type: 'party_update', data: buildPartyPayload(players, party) }));
  } else {
    socket.send(JSON.stringify({ type: 'party_update', data: null }));
  }
}

function getPartyForPlayerId(playerId) { return getPartyOfPlayer(playerId); }

module.exports = { handlePartyMessage, onPlayerDisconnectCleanup, requestInitialPartyState, getPartyForPlayerId };



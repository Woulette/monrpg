const { isDungeonMap, getOrCreateInstanceForParty, getOrCreateInstanceForSolo, getInstanceMonsters, getInstanceDeadList, resetInstance } = require('../../game/state/instances');
const { getDeadRegistryForMap, monsterKey } = require('../../game/state/monsters');

// API: messages attendus
// - enter_dungeon { mapName }
// - reset_dungeon { mapName } (nécessite possession clé côté serveur plus tard)

function handleDungeonInstanceMessage(ctx, data) {
  console.log(`🏰 Dungeon Instance Handler appelé avec: ${data.type}`);
  if (!data || !data.type) return false;
  const { players, playerData, socket, broadcastToMap } = ctx;

  if (data.type === 'enter_dungeon') {
    const mapName = data.mapName || playerData.map;
    if (!isDungeonMap(mapName)) return true; // rien à faire
    // Trouver instance: party si en groupe, sinon solo
    let instanceId;
    const party = ctx.getPartyForPlayerId ? ctx.getPartyForPlayerId(playerData.id) : null;
    console.log(`🏰 enter_dungeon: joueur ${playerData.name} (${playerData.id}) sur ${mapName}`);
    console.log(`👥 Groupe trouvé:`, party ? `ID ${party.id} avec ${party.members.size} membres` : 'Aucun groupe (solo)');
    const ensureBaseMonsters = (name) => (require('../../game/state/monsters')).monstersByMap.get(name) || [];
    if (party) instanceId = getOrCreateInstanceForParty(mapName, party.id, ensureBaseMonsters);
    else instanceId = getOrCreateInstanceForSolo(mapName, playerData.id, ensureBaseMonsters);
    // Mémoriser sur le joueur l'instance courante pour cette map
    if (!playerData.dungeonInstance) playerData.dungeonInstance = {};
    playerData.dungeonInstance[mapName] = instanceId;
    // Ici, pour un vrai multi, on mapperait mapName logique → instanceId interne; pour MVP, on envoie la liste spécifique
    const list = getInstanceMonsters(instanceId, mapName) || [];
    // Diffuser à l'instance seulement
    if (typeof ctx.broadcastToMapInstance === 'function') {
      ctx.broadcastToMapInstance(mapName, instanceId, { type: 'monster_list', data: list });
      const dead = getInstanceDeadList(instanceId, mapName) || [];
      ctx.broadcastToMapInstance(mapName, instanceId, { type: 'dead_monsters', data: dead });
    } else {
      try { socket.send(JSON.stringify({ type: 'monster_list', data: list })); } catch(_) {}
      const dead = getInstanceDeadList(instanceId, mapName) || [];
      try { socket.send(JSON.stringify({ type: 'dead_monsters', data: dead })); } catch(_) {}
    }
    return true;
  }

  if (data.type === 'reset_dungeon') {
    const mapName = data.mapName || playerData.map;
    if (!isDungeonMap(mapName)) return true;
    // TODO: vérifier la possession de la clé côté serveur (inventaire persistant)
    const party = ctx.getPartyForPlayerId ? ctx.getPartyForPlayerId(playerData.id) : null;
    const ensureBaseMonsters = (name) => (require('../../game/state/monsters')).monstersByMap.get(name) || [];
    let instanceId;
    if (party) instanceId = getOrCreateInstanceForParty(mapName, party.id, ensureBaseMonsters);
    else instanceId = getOrCreateInstanceForSolo(mapName, playerData.id, ensureBaseMonsters);
    if (!playerData.dungeonInstance) playerData.dungeonInstance = {};
    playerData.dungeonInstance[mapName] = instanceId;
    resetInstance(mapName, instanceId, ensureBaseMonsters);
    const list = getInstanceMonsters(instanceId, mapName) || [];
    try { socket.send(JSON.stringify({ type: 'monster_list', data: list })); } catch(_) {}
    try { socket.send(JSON.stringify({ type: 'dead_monsters', data: [] })); } catch(_) {}
    return true;
  }

  return false;
}

module.exports = { handleDungeonInstanceMessage };



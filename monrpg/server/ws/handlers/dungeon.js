const { mapSlimeKills, mapPortalUnlocked, mapDecorRemoved } = require('../../game/state/dungeon');

function handleDungeonMessage(ctx, data) {
  if (!data || !data.type) return false;
  if (data.type === 'request_dungeon_state') {
    const map = data.mapName || ctx.playerData.map;
    const payload = {
      type: 'dungeon_progress',
      data: {
        map,
        slimesKilled: mapSlimeKills.get(map) || 0,
        portalUnlocked: !!mapPortalUnlocked.get(map),
        decorRemoved: !!mapDecorRemoved.get(map)
      }
    };
    try { ctx.socket.send(JSON.stringify(payload)); } catch(_) {}
    return true;
  }
  return false;
}

module.exports = { handleDungeonMessage };



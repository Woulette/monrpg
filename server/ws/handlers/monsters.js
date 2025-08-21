const { deadMonstersByMap, monstersByMap, getDeadRegistryForMap, monsterKey } = require('../../game/state/monsters');
const { generateLootForPlayer } = require('../../loot');
const { mapSlimeKills, mapPortalUnlocked, mapDecorRemoved } = require('../../game/state/dungeon');
const { randInt, makeId } = require('../../utils/random');

function handleMonstersMessage(ctx, data) {
  if (!data || !data.type) return false;
  const { wss, players, playerData, socket, broadcastToMap, isBlockedServer } = ctx;

  if (data.type === 'request_monster_list') {
    const mapName = data.mapName || playerData.map;
    const list = (require('../../game/state/monsters')).monstersByMap.get(mapName) || [];
    // filtrer morts
    const reg = getDeadRegistryForMap(mapName);
    const alive = list.filter(m => !reg.has(monsterKey(m.type, m.x, m.y)));
    try { socket.send(JSON.stringify({ type: 'monster_list', data: alive })); } catch(_) {}
    return true;
  }
  if (data.type === 'request_dead_monsters') {
    const mapName = data.mapName || playerData.map;
    const reg = deadMonstersByMap.get(mapName) || new Map();
    const payload = Array.from(reg.entries()).map(([key, info]) => ({ key, info }));
    try { socket.send(JSON.stringify({ type: 'dead_monsters', data: payload })); } catch(_) {}
    return true;
  }
  if (data.type === 'monster_hit' || data.type === 'hit' || data.type === 'monsterDamage' || data.type === 'damage') {
    // Normaliser
    const p = (data && data.data) ? data.data : (data || {});
    const id = p.id != null ? p.id : (p.monsterId != null ? p.monsterId : (p.idMonster != null ? p.idMonster : p.targetId));
    const damage = p.damage != null ? p.damage : (p.dmg != null ? p.dmg : (p.finalDamage != null ? p.finalDamage : p.value));
    const mapName = playerData.map;
    if (!id) return true;
    // Activité et taggers
    ctx.playerLastAttackAt.set(playerData.id, Date.now());
    {
      let mapReg = ctx.monsterTaggersByMap.get(mapName);
      if (!mapReg) { mapReg = new Map(); ctx.monsterTaggersByMap.set(mapName, mapReg); }
      let tagSet = mapReg.get(id);
      if (!tagSet) { tagSet = new Set(); mapReg.set(id, tagSet); }
      tagSet.add(playerData.id);
    }
    const list = (monstersByMap.get(mapName)) || [];
    const m = list.find(mm => mm.id === id);
    if (!m) return true;
    const dmg = Math.max(1, Math.floor(Number(damage) || 0));
    const before = m.hp || m.maxHp || 1;
    m.hp = Math.max(0, (m.hp || m.maxHp || 1) - dmg);
    const after = m.hp;
    ctx.broadcastToMap(mapName, { type: 'monster_hp', data: { id: m.id, hp: m.hp } });
    if (m.hp <= 0) {
      const baseXp = m.xpValue || 10;
      const reg = getDeadRegistryForMap(mapName);
      reg.set(monsterKey(m.type, m.x, m.y), { type: m.type, x: m.x, y: m.y, diedAt: Date.now(), respawnMs: m.respawnMs || 30000 });
      const idx = list.findIndex(mm => mm.id === id);
      if (idx >= 0) list.splice(idx,1);
      ctx.broadcastToMap(mapName, { type: 'monster_killed', data: { id: id, type: m.type, x: m.x, y: m.y } });
      // XP groupe/solo
      try { if (typeof ctx.awardPartyXP === 'function') ctx.awardPartyXP(mapName, playerData.id, baseXp); } catch(_) {}
      // Loot de groupe
      try {
        const now = Date.now();
        const killerId = playerData.id;
        const mapPlayers = Array.from(ctx.players.entries()).filter(([sock, pdata]) => pdata.map === mapName);
        const tagSet = (ctx.monsterTaggersByMap.get(mapName)?.get(id)) || new Set([killerId]);
        const isActive = (pid) => {
          const t = ctx.playerLastAttackAt.get(pid) || 0;
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
        const mapReg = ctx.monsterTaggersByMap.get(mapName);
        if (mapReg) mapReg.delete(id);
      } catch (_) {}

      // Élite corbeau tous les 10 kills de crow
      if (m.type === 'crow') {
        const current = (ctx.mapCrowKills.get(mapName) || 0) + 1;
        ctx.mapCrowKills.set(mapName, current);
        if (current % 10 === 0) {
          try {
            const info = ctx.collisionsByMap.get(mapName);
            const width = info?.width || 48, height = info?.height || 25;
            let rx = randInt(0, width-1), ry = randInt(0, height-1), tries = 0;
            const isOccupied = (x,y) => list.some(mm => mm.x === x && mm.y === y && !deadMonstersByMap.get(mapName)?.has(monsterKey(mm.type, mm.x, mm.y)));
            while ((ctx.isBlockedServer(mapName, rx, ry) || isOccupied(rx, ry)) && tries < 200) { rx = randInt(0, width-1); ry = randInt(0, height-1); tries++; }
            const elite = { id: makeId('corbeauelite'), type: 'corbeauelite', x: rx, y: ry, level: 5, hp: 60, maxHp: 60, xpValue: 100, force: 15, defense: 10, respawnMs: 30000, moveSpeed: 0.8 };
            list.push(elite);
            ctx.broadcastToMap(mapName, { type: 'monster_respawn', data: elite });
          } catch(_) {}
        }
      }
    }
    return true;
  }
  if (data.type === 'monster_killed') {
    const { map, type, x, y, respawnMs } = data.data || {};
    if (!map || !type || typeof x !== 'number' || typeof y !== 'number') return true;
    const reg = getDeadRegistryForMap(map);
    const key = monsterKey(type, x, y);
    const list = (monstersByMap.get(map)) || [];
    const idx = list.findIndex(m => m.type === type && m.x === x && m.y === y);
    const baseXp = (idx >= 0 && list[idx] && list[idx].xpValue) ? list[idx].xpValue : 10;
    reg.set(key, { type, x, y, diedAt: Date.now(), respawnMs: Math.max(0, Number(respawnMs || 30000)) });
    if (idx >= 0) list.splice(idx,1);
    ctx.broadcastToMap(map, { type: 'monster_killed', data: { type, x, y } });
    try { if (typeof ctx.awardPartyXP === 'function') ctx.awardPartyXP(map, playerData.id, baseXp); } catch(_) {}
    return true;
  }
  // L’ensemble des autres messages monstres reste géré dans server.js pour le moment (monster_hit etc.)
  return false;
}

module.exports = { handleMonstersMessage };



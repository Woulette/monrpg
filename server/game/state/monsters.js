const { randInt, makeId } = require('../../utils/random');

// Registres d'état
const deadMonstersByMap = new Map(); // Map<string, Map<key, { type, x, y, diedAt, respawnMs }>>
const monstersByMap = new Map(); // Map<string, Array<Monster>>

function monsterKey(type, x, y) { return `${type}:${x}:${y}`; }

function getDeadRegistryForMap(mapName) {
  let reg = deadMonstersByMap.get(mapName);
  if (!reg) { reg = new Map(); deadMonstersByMap.set(mapName, reg); }
  return reg;
}

function ensureMonstersForMapFactory(isBlockedServerRef) {
  return function ensureMonstersForMap(mapName) {
    if (!mapName) return [];
    if (monstersByMap.has(mapName)) return monstersByMap.get(mapName);
    let arr = [];
    // Création simple par map (mêmes règles que server.js existant)
    if (mapName === 'map1' || mapName === 'map2' || mapName === 'map3') {
      for (let i=0;i<10;i++) {
        const level = randInt(1,4);
        const baseHp = 15; const hpMul = 1 + (level-1)*0.2;
        const baseXp = 10; const xpMul = 1 + (level-1)*0.3;
        arr.push({ id: makeId('crow'), type: 'crow', x: randInt(0,47), y: randInt(0,24), level,
          hp: Math.floor(baseHp*hpMul), maxHp: Math.floor(baseHp*hpMul), xpValue: Math.floor(baseXp*xpMul),
          force: Math.floor(4 * (1 + (level-1)*0.15)), defense: Math.floor(2 * (1 + (level-1)*0.10)),
          respawnMs: 30000, moveSpeed: 0.3 });
      }
    } else if (mapName === 'map4' || mapName === 'map5') {
      for (let i=0;i<8;i++) {
        const level = randInt(7,10);
        const delta = level-7;
        const baseHp = 100; const hpMul = 1 + delta*0.07;
        const xpBase = randInt(35,50) + Math.floor(delta*2);
        arr.push({ id: makeId('cochon'), type: 'cochon', x: randInt(0,47), y: randInt(0,24), level,
          hp: Math.floor(baseHp*hpMul), maxHp: Math.floor(baseHp*hpMul), xpValue: xpBase,
          force: Math.floor(15 * (1 + delta*0.06)), defense: Math.floor(10 * (1 + delta*0.05)),
          respawnMs: 30000, moveSpeed: 0.45 });
      }
    } else if (mapName === 'mapdonjonslime') {
      for (let i=0;i<5;i++) {
        const level = 7; const baseHp = 30; const hpMul = 1;
        arr.push({ id: makeId('slime'), type: 'slime', x: randInt(0,47), y: randInt(0,24), level,
          hp: Math.floor(baseHp*hpMul), maxHp: Math.floor(baseHp*hpMul), xpValue: Math.floor(25),
          force: Math.floor(9), defense: Math.floor(6), respawnMs: 0, moveSpeed: 0.2 });
      }
    } else if (mapName === 'mapdonjonslime2') {
      const levels = [8,8,8,9,9,9,9];
      for (let i=0;i<7;i++) {
        const level = levels[i] || 8; const baseHp = 30; const hpMul = 1 + (level-7)*0.25;
        arr.push({ id: makeId('slime'), type: 'slime', x: randInt(0,47), y: randInt(0,24), level,
          hp: Math.floor(baseHp*hpMul), maxHp: Math.floor(baseHp*hpMul), xpValue: Math.floor(25 * (1 + (level-7)*0.35)),
          force: Math.floor(9 * (1 + (level-7)*0.25)), defense: Math.floor(6 * (1 + (level-7)*0.20)),
          respawnMs: 0, moveSpeed: 0.2 });
      }
    } else if (mapName === 'mapdonjonslimeboss') {
      arr.push({ id: makeId('slimeboss'), type: 'slimeboss', x: randInt(0,47), y: randInt(0,24), level: 10,
        hp: 200, maxHp: 200, xpValue: 500, force: 25, defense: 20, respawnMs: 0, moveSpeed: 0.3 });
    } else if (mapName === 'mapzonealuineeks1') {
      for (let i=0;i<10;i++) {
        const level = randInt(8,12);
        arr.push({ id: makeId('aluineeks'), type: 'aluineeks', x: randInt(0,47), y: randInt(0,24), level,
          hp: 60, maxHp: 60, xpValue: 40, force: 12, defense: 8, respawnMs: 30000, moveSpeed: 0.7 });
      }
    }
    monstersByMap.set(mapName, arr);
    return arr;
  }
}

module.exports = { deadMonstersByMap, monstersByMap, getDeadRegistryForMap, ensureMonstersForMapFactory, monsterKey };



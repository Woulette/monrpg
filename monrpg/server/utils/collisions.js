const fs = require('fs');
const path = require('path');

const collisionsByMap = new Map(); // Map<string, { width, height, blocked:boolean[] }>

function loadMapCollision(mapName) {
  try {
    const file = path.join(__dirname, '..', '..', 'assets', 'maps', `${mapName}.json`);
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

module.exports = { collisionsByMap, loadMapCollision, isBlockedServer };



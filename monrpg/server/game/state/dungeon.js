// États de progression du donjon (côté serveur)
const mapSlimeKills = new Map(); // Map<string mapName, number slimeKills>
const mapPortalUnlocked = new Map(); // Map<string mapName, boolean>
const mapDecorRemoved = new Map(); // Map<string mapName, boolean>

function getSlimeKills(map) { return mapSlimeKills.get(map) || 0; }
function addSlimeKill(map) { const v = (mapSlimeKills.get(map) || 0) + 1; mapSlimeKills.set(map, v); return v; }
function isPortalUnlocked(map) { return !!mapPortalUnlocked.get(map); }
function unlockPortal(map) { mapPortalUnlocked.set(map, true); }
function isDecorRemoved(map) { return !!mapDecorRemoved.get(map); }
function removeDecor(map) { mapDecorRemoved.set(map, true); }

module.exports = {
  mapSlimeKills, mapPortalUnlocked, mapDecorRemoved,
  getSlimeKills, addSlimeKill, isPortalUnlocked, unlockPortal, isDecorRemoved, removeDecor
};



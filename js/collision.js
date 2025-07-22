console.log("Fichier js/collision.js chargé");

// GIDs bloquants sur le calque 2 de map1.json
window.BLOCKED_GIDS = [741, 788, 789, 730, 790, 791, 50, 51, 52, 97, 101, 145, 149, 193, 194, 196, 197, 241, 294, 296, 245, 490, 491, 742, 743, 795, 156, 157, 204, 205, 109, 158, 159, 160, 161, 108];

window.isBlocked = function(x, y) {
  if (!window.mapData) return false;
  if (x < 0 || y < 0 || x >= mapData.width || y >= mapData.height) {
    return true;
  }

  const idx = y * mapData.width + x;
  
  // Trouver le calque 2 par son ID
  const layer2 = mapData.layers.find(layer => layer.id === 2);
  if (!layer2) return false;
  
  const gid = layer2.data[idx];

  // Vérifie collision statique
  if (window.BLOCKED_GIDS.includes(gid)) {
    return true;
  }

  // Vérifie collision dynamique (joueur + monstres)
  if (typeof isOccupied === "function" && isOccupied(x, y)) {
    return true;
  }

  return false;
};
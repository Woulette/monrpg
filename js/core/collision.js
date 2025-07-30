console.log("Fichier js/collision.js chargé");

// GIDs bloquants - sera mis à jour automatiquement selon la map
window.BLOCKED_GIDS = [];

// Fonction pour mettre à jour les GIDs bloquants selon la map actuelle
window.updateBlockedGids = function() {
    if (!window.mapData) return;
    
    // Trouver le calque 2 par son ID
    const layer2 = window.mapData.layers.find(layer => layer.id === 2);
    if (!layer2) {
        window.BLOCKED_GIDS = [];
        return;
    }
    
    // Récupérer tous les GID non-nuls du calque 2
    const blockedGids = new Set();
    for (let i = 0; i < layer2.data.length; i++) {
        const gid = layer2.data[i];
        if (gid !== 0) {
            blockedGids.add(gid);
        }
    }
    
    window.BLOCKED_GIDS = Array.from(blockedGids);
    console.log(`Collisions mises à jour: ${window.BLOCKED_GIDS.length} GIDs bloquants`);
};

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
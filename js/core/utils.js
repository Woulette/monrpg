console.log("Fichier js/utils.js chargé");

// Constante globale tile size
window.TILE_SIZE = 32;

// Structure globale des positions occupées (joueur + monstres)
window.occupiedPositions = new Set();

// Convertit coord en clé string
function posKey(x, y) {
  return `${x},${y}`;
}

// Marque une case comme occupée
function occupy(x, y) {
  window.occupiedPositions.add(posKey(x, y));
  // Compatibilité avec l'ancien système
  if (window.mapData) {
    if (!window.mapData.occupied) window.mapData.occupied = {};
    window.mapData.occupied[`${x},${y}`] = true;
  }
}

// Libère une case occupée
function release(x, y) {
  window.occupiedPositions.delete(posKey(x, y));
  // Compatibilité avec l'ancien système
  if (window.mapData && window.mapData.occupied) {
    delete window.mapData.occupied[`${x},${y}`];
  }
}

// Vérifie si une case est occupée dynamiquement
function isOccupied(x, y, ignoreMonster = null) {
  if (ignoreMonster) {
    if (player && player.x === x && player.y === y) return true;
    return monsters && monsters.some(m => m.x === x && m.y === y && m !== ignoreMonster);
  } else {
    return window.occupiedPositions.has(posKey(x, y));
  }
}

// Rendre les fonctions globales
window.occupy = occupy;
window.release = release;
window.isOccupied = isOccupied;
// Utilitaires globaux - Core
// Nettoyé et validé le 30/07/2025 - par Cursor

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

// Purge complète des positions occupées (utile au changement de map)
function clearOccupiedPositions() {
  window.occupiedPositions.clear();
  if (window.mapData && window.mapData.occupied) {
    window.mapData.occupied = {};
  }
}

// Réconcilier les positions occupées avec les entités réelles (joueur/monstres vivants)
function reconcileOccupiedPositions() {
  try {
    const actual = new Set();
    if (typeof player !== 'undefined' && player && typeof player.x === 'number' && typeof player.y === 'number') {
      actual.add(posKey(player.x, player.y));
    }
  if (Array.isArray(window.monsters)) {
      for (const m of window.monsters) {
        if (!m) continue;
        if (m.hp <= 0 || m.isDead) continue;
        // Taille 2x2 pour le boss
        if (m.type === 'slimeboss' || m.width === 64 || m.height === 64) {
          actual.add(posKey(m.x, m.y));
          actual.add(posKey(m.x + 1, m.y));
          actual.add(posKey(m.x, m.y + 1));
          actual.add(posKey(m.x + 1, m.y + 1));
        } else {
          actual.add(posKey(m.x, m.y));
        }
      }
    }
    // Inclure les PNJ comme entités bloquantes
    if (Array.isArray(window.pnjs)) {
      for (const p of window.pnjs) {
        if (!p) continue;
        actual.add(posKey(p.x, p.y));
      }
    }
    // Supprimer toute occupation « fantôme » qui n'a pas d'entité réelle
    const toRemove = [];
    window.occupiedPositions.forEach(key => { if (!actual.has(key)) toRemove.push(key); });
    for (const key of toRemove) {
      window.occupiedPositions.delete(key);
      if (window.mapData && window.mapData.occupied) delete window.mapData.occupied[key];
    }
    return toRemove.length;
  } catch (_) {
    return 0;
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
window.clearOccupiedPositions = clearOccupiedPositions;
window.reconcileOccupiedPositions = reconcileOccupiedPositions;
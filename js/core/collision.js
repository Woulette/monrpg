// Système de collision - Core
// Nettoyé et validé le 30/07/2025 - par Cursor

// GIDs bloquants - sera mis à jour automatiquement selon la map
window.BLOCKED_GIDS = [];

// Fonction de diagnostic pour les collisions
window.diagnosisCollisions = function() {
    console.log("=== DIAGNOSTIC COLLISIONS ===");
    console.log("Map actuelle:", window.currentMap);
    console.log("mapData existe:", !!window.mapData);
    if (window.mapData) {
        console.log("Nombre de calques:", window.mapData.layers ? window.mapData.layers.length : "Pas de calques");
        if (window.mapData.layers) {
            const layer2 = window.mapData.layers.find(layer => layer.id === 2);
            console.log("Calque 2 trouvé:", !!layer2);
            if (layer2) {
                console.log("Taille des données du calque 2:", layer2.data ? layer2.data.length : "Pas de données");
            }
        }
    }
    console.log("BLOCKED_GIDS:", window.BLOCKED_GIDS);
    console.log("Nombre de GIDs bloquants:", window.BLOCKED_GIDS.length);
    console.log("=============================");
};

// Fonction pour mettre à jour les GIDs bloquants selon la map actuelle
window.updateBlockedGids = function() {
    // FORCER le nettoyage complet des collisions d'abord
    window.BLOCKED_GIDS = [];
    
    if (!window.mapData) {
        console.warn("updateBlockedGids: window.mapData n'existe pas");
        return;
    }
    
    if (!window.mapData.layers || window.mapData.layers.length === 0) {
        console.warn("updateBlockedGids: Pas de calques dans mapData");
        return;
    }
    
    // Trouver le calque 2 par son ID
    const layer2 = window.mapData.layers.find(layer => layer.id === 2);
    if (!layer2) {
        console.warn("updateBlockedGids: Calque 2 non trouvé pour", window.currentMap);
        return;
    }
    
    if (!layer2.data || layer2.data.length === 0) {
        console.warn("updateBlockedGids: Pas de données dans le calque 2");
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
    console.log(`Collisions mises à jour pour ${window.currentMap}:`, window.BLOCKED_GIDS.length, "GIDs bloquants");
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

// Fonction de nettoyage forcé des collisions
window.forceCleanCollisions = function() {
    console.log("NETTOYAGE FORCÉ des collisions");
    window.BLOCKED_GIDS = [];
    
    // Forcer la mise à jour des collisions après nettoyage
    if (window.mapData && typeof window.updateBlockedGids === "function") {
        setTimeout(() => {
            window.updateBlockedGids();
        }, 50); // Petit délai pour s'assurer que mapData est bien défini
    }
};

// Fonction pour vérifier et corriger les collisions incohérentes
window.checkCollisionIntegrity = function() {
    if (!window.mapData || !window.currentMap) {
        console.log("Pas de map chargée, nettoyage des collisions");
        window.BLOCKED_GIDS = [];
        return;
    }
    
    const layer2 = window.mapData.layers ? window.mapData.layers.find(layer => layer.id === 2) : null;
    if (!layer2) {
        console.log("Pas de calque de collision trouvé, nettoyage des collisions");
        window.BLOCKED_GIDS = [];
        return;
    }
    
    console.log("Intégrité des collisions vérifiée pour", window.currentMap);
};

// FONCTION D'URGENCE : À utiliser quand les collisions fantômes apparaissent
window.fixCollisionGhosts = function() {
    console.log("🚨 CORRECTION D'URGENCE DES COLLISIONS FANTÔMES 🚨");
    
    // Étape 1 : Diagnostic complet
    console.log("Avant correction:");
    if (typeof window.diagnosisCollisions === "function") {
        window.diagnosisCollisions();
    }
    
    // Étape 2 : Nettoyage brutal de toutes les collisions
    window.BLOCKED_GIDS = [];
    
    // Étape 3 : Forcer la mise à jour immédiate
    if (window.mapData && window.currentMap) {
        console.log("Rechargement des collisions pour", window.currentMap);
        
        // Vérifier que la map a bien un calque de collision
        const layer2 = window.mapData.layers ? window.mapData.layers.find(layer => layer.id === 2) : null;
        if (layer2 && layer2.data) {
            // Reconstruire manuellement les collisions
            const blockedGids = new Set();
            for (let i = 0; i < layer2.data.length; i++) {
                const gid = layer2.data[i];
                if (gid !== 0) {
                    blockedGids.add(gid);
                }
            }
            window.BLOCKED_GIDS = Array.from(blockedGids);
            console.log("✅ Collisions reconstruites:", window.BLOCKED_GIDS.length, "GIDs bloquants");
        } else {
            console.log("❌ Pas de calque de collision trouvé - collisions vides");
        }
    } else {
        console.log("❌ Pas de map chargée - collisions vides");
    }
    
    // Étape 4 : Diagnostic après correction
    console.log("Après correction:");
    if (typeof window.diagnosisCollisions === "function") {
        window.diagnosisCollisions();
    }
    
    // Étape 5 : Forcer le redessin de la map pour voir l'effet immédiatement
    if (typeof drawMap === "function") {
        drawMap();
    }
    
    console.log("🎉 CORRECTION TERMINÉE ! Les collisions fantômes devraient être supprimées.");
    console.log("💡 Si le problème persiste, tape 'window.diagnosisCollisions()' pour plus d'infos.");
};
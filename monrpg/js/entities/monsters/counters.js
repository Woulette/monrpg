// Système de compteurs de corbeaux tués
// Nettoyé et validé le 30/07/2025 - par Cursor

// Fonction pour obtenir le compteur de corbeaux tués pour le personnage actuel
function getCrowKillCounts() {
    if (!window.currentCharacterId) {
        return { map1: 0, map2: 0, map3: 0 };
    }
    
    // Charger depuis localStorage
    const saveKey = `monrpg_crowKillCounts_${window.currentCharacterId}`;
    const savedData = localStorage.getItem(saveKey);
    
    if (savedData) {
        try {
            return JSON.parse(savedData);
        } catch (error) {
            console.error('Erreur lors du chargement du compteur de corbeaux:', error);
        }
    }
    
    // Retourner un compteur vide si pas de sauvegarde
    return { map1: 0, map2: 0, map3: 0 };
}

// Fonction pour sauvegarder le compteur de corbeaux tués
function saveCrowKillCounts(counts) {
    if (!window.currentCharacterId) {
        return;
    }
    
    try {
        const saveKey = `monrpg_crowKillCounts_${window.currentCharacterId}`;
        localStorage.setItem(saveKey, JSON.stringify(counts));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du compteur de corbeaux:', error);
    }
}

// Fonction pour incrémenter le compteur de corbeaux tués
function incrementCrowKillCount(mapName) {
    if (!mapName || !window.currentCharacterId) {
        return 0;
    }
    
    const counts = getCrowKillCounts();
    counts[mapName] = (counts[mapName] || 0) + 1;
    saveCrowKillCounts(counts);
    
    return counts[mapName];
}

// Fonction pour réinitialiser le compteur de corbeaux tués
function resetCrowKillCounts() {
    if (!window.currentCharacterId) {
        return;
    }
    
    const counts = { map1: 0, map2: 0, map3: 0 };
    saveCrowKillCounts(counts);
}

// Fonction pour obtenir le compteur actuel (pour compatibilité)
function getCurrentCrowKillCounts() {
    return getCrowKillCounts();
}

// Export global
window.getCrowKillCounts = getCrowKillCounts;
window.saveCrowKillCounts = saveCrowKillCounts;
window.incrementCrowKillCount = incrementCrowKillCount;
window.resetCrowKillCounts = resetCrowKillCounts;
window.getCurrentCrowKillCounts = getCurrentCrowKillCounts; 
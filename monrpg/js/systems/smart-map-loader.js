// SYSTÈME DE CHARGEMENT INTELLIGENT DES MAPS POUR MMO
// Ne charge que les maps nécessaires pour économiser les ressources
// Créé le 30/07/2025 - par Cursor

class SmartMapLoader {
    constructor() {
        this.loadedMaps = new Map(); // Map ID → Map Data
        this.activeMaps = new Set(); // Maps actuellement actives
        this.playerLocations = new Map(); // Joueur ID → Map ID
        this.mapPriorities = new Map(); // Map ID → Priorité (1-5)
        
        // Configuration
        this.config = {
            maxLoadedMaps: 3,        // Nombre max de maps chargées
            updateInterval: 5000,     // Vérifier les positions toutes les 5s
            unloadDelay: 10000,      // Délai avant déchargement (10s)
            loadDistance: 2,          // Charger les maps adjacentes
            priorityLevels: {
                PLAYER_CURRENT: 5,    // Map actuelle du joueur
                PLAYER_NEARBY: 4,     // Maps avec joueurs proches
                ADJACENT: 3,          // Maps adjacentes
                FAR_AWAY: 2,          // Maps éloignées
                EMPTY: 1              // Maps vides
            }
        };
        
        this.init();
    }
    
    init() {
        console.log('🗺️ Système de chargement intelligent des maps initialisé');
        
        // Démarrer le monitoring
        this.startMonitoring();
        
        // Charger la map initiale
        this.loadInitialMap();
    }
    
    // Charger la map initiale
    loadInitialMap() {
        if (window.currentMap) {
            this.loadMap(window.currentMap, this.config.priorityLevels.PLAYER_CURRENT);
        }
    }
    
    // Charger une map avec priorité
    loadMap(mapId, priority = 1) {
        if (this.loadedMaps.has(mapId)) {
            // Map déjà chargée, mettre à jour la priorité
            this.mapPriorities.set(mapId, Math.max(this.mapPriorities.get(mapId) || 0, priority));
            return Promise.resolve(this.loadedMaps.get(mapId));
        }
        
        console.log(`🗺️ Chargement de la map: ${mapId} (priorité: ${priority})`);
        
        // Vérifier la limite de maps chargées
        if (this.loadedMaps.size >= this.config.maxLoadedMaps) {
            this.unloadLowestPriorityMap();
        }
        
        // Charger la map
        return this.loadMapData(mapId).then(mapData => {
            this.loadedMaps.set(mapId, mapData);
            this.mapPriorities.set(mapId, priority);
            this.activeMaps.add(mapId);
            
            console.log(`✅ Map ${mapId} chargée avec succès`);
            return mapData;
        }).catch(error => {
            console.error(`❌ Erreur de chargement de la map ${mapId}:`, error);
            throw error;
        });
    }
    
    // Charger les données de la map
    loadMapData(mapId) {
        // Utiliser le système de chargement existant
        if (typeof window.loadMap === 'function') {
            return window.loadMap(mapId);
        }
        
        // Fallback: chargement manuel
        return fetch(`assets/maps/${mapId}.json`)
            .then(response => response.json())
            .then(data => {
                // Charger l'image de la map
                return this.loadMapImage(mapId).then(image => {
                    data.image = image;
                    return data;
                });
            });
    }
    
    // Charger l'image de la map
    loadMapImage(mapId) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Impossible de charger l'image: ${mapId}.png`));
            img.src = `assets/maps/${mapId}.png`;
        });
    }
    
    // Décharger la map de plus faible priorité
    unloadLowestPriorityMap() {
        let lowestPriority = Infinity;
        let mapToUnload = null;
        
        for (const [mapId, priority] of this.mapPriorities) {
            if (priority < lowestPriority && mapId !== window.currentMap) {
                lowestPriority = priority;
                mapToUnload = mapId;
            }
        }
        
        if (mapToUnload) {
            this.unloadMap(mapToUnload);
        }
    }
    
    // Décharger une map
    unloadMap(mapId) {
        if (!this.loadedMaps.has(mapId)) return;
        
        console.log(`🗑️ Déchargement de la map: ${mapId}`);
        
        // Libérer les ressources
        const mapData = this.loadedMaps.get(mapId);
        if (mapData && mapData.image) {
            mapData.image = null;
        }
        
        // Nettoyer les références
        this.loadedMaps.delete(mapId);
        this.mapPriorities.delete(mapId);
        this.activeMaps.delete(mapId);
        
        console.log(`✅ Map ${mapId} déchargée`);
    }
    
    // Mettre à jour la position d'un joueur
    updatePlayerLocation(playerId, mapId, x, y) {
        this.playerLocations.set(playerId, { mapId, x, y, timestamp: Date.now() });
        
        // Charger la map si nécessaire
        if (!this.loadedMaps.has(mapId)) {
            this.loadMap(mapId, this.config.priorityLevels.PLAYER_CURRENT);
        }
        
        // Charger les maps adjacentes
        this.loadAdjacentMaps(mapId);
    }
    
    // Charger les maps adjacentes
    loadAdjacentMaps(mapId) {
        const adjacentMaps = this.getAdjacentMaps(mapId);
        
        adjacentMaps.forEach(adjMapId => {
            if (!this.loadedMaps.has(adjMapId)) {
                this.loadMap(adjMapId, this.config.priorityLevels.ADJACENT);
            }
        });
    }
    
    // Obtenir les maps adjacentes
    getAdjacentMaps(mapId) {
        // Logique pour déterminer les maps adjacentes
        // À adapter selon votre système de maps
        const adjacencyMap = {
            'map1': ['map2', 'map3'],
            'map2': ['map1', 'map4'],
            'map3': ['map1', 'map5'],
            'map4': ['map2', 'map6'],
            'map5': ['map3', 'map7'],
            'map6': ['map4', 'map8'],
            'map7': ['map5', 'map9'],
            'map8': ['map6', 'map10'],
            'map9': ['map7', 'map11'],
            'map10': ['map8', 'map12']
        };
        
        return adjacencyMap[mapId] || [];
    }
    
    // Mettre à jour les priorités des maps
    updateMapPriorities() {
        const now = Date.now();
        
        for (const [mapId, priority] of this.mapPriorities) {
            let newPriority = priority;
            
            // Map actuelle du joueur = priorité maximale
            if (mapId === window.currentMap) {
                newPriority = this.config.priorityLevels.PLAYER_CURRENT;
            }
            // Maps avec joueurs = priorité élevée
            else if (this.hasPlayers(mapId)) {
                newPriority = this.config.priorityLevels.PLAYER_NEARBY;
            }
            // Maps adjacentes = priorité moyenne
            else if (this.isAdjacent(mapId)) {
                newPriority = this.config.priorityLevels.ADJACENT;
            }
            // Maps vides = priorité faible
            else {
                newPriority = this.config.priorityLevels.EMPTY;
            }
            
            this.mapPriorities.set(mapId, newPriority);
        }
    }
    
    // Vérifier si une map a des joueurs
    hasPlayers(mapId) {
        for (const [playerId, location] of this.playerLocations) {
            if (location.mapId === mapId) {
                return true;
            }
        }
        return false;
    }
    
    // Vérifier si une map est adjacente à la map actuelle
    isAdjacent(mapId) {
        if (!window.currentMap) return false;
        return this.getAdjacentMaps(window.currentMap).includes(mapId);
    }
    
    // Nettoyer les joueurs inactifs
    cleanupInactivePlayers() {
        const now = Date.now();
        const inactiveTimeout = 30000; // 30 secondes
        
        for (const [playerId, location] of this.playerLocations) {
            if (now - location.timestamp > inactiveTimeout) {
                this.playerLocations.delete(playerId);
            }
        }
    }
    
    // Démarrer le monitoring
    startMonitoring() {
        setInterval(() => {
            this.updateMapPriorities();
            this.cleanupInactivePlayers();
            this.manageMapLoading();
        }, this.config.updateInterval);
    }
    
    // Gérer le chargement/déchargement des maps
    manageMapLoading() {
        // Décharger les maps de faible priorité si nécessaire
        if (this.loadedMaps.size > this.config.maxLoadedMaps) {
            this.unloadLowestPriorityMap();
        }
        
        // Charger les maps prioritaires manquantes
        this.loadPriorityMaps();
    }
    
    // Charger les maps prioritaires
    loadPriorityMaps() {
        const priorityOrder = [
            this.config.priorityLevels.PLAYER_CURRENT,
            this.config.priorityLevels.PLAYER_NEARBY,
            this.config.priorityLevels.ADJACENT
        ];
        
        for (const priority of priorityOrder) {
            const mapsToLoad = this.getMapsByPriority(priority);
            
            for (const mapId of mapsToLoad) {
                if (!this.loadedMaps.has(mapId) && this.loadedMaps.size < this.config.maxLoadedMaps) {
                    this.loadMap(mapId, priority);
                }
            }
        }
    }
    
    // Obtenir les maps par priorité
    getMapsByPriority(priority) {
        const maps = [];
        for (const [mapId, mapPriority] of this.mapPriorities) {
            if (mapPriority === priority) {
                maps.push(mapId);
            }
        }
        return maps;
    }
    
    // Obtenir un rapport des maps
    getReport() {
        return {
            loadedMaps: Array.from(this.loadedMaps.keys()),
            activeMaps: Array.from(this.activeMaps),
            playerLocations: Array.from(this.playerLocations.entries()),
            mapPriorities: Array.from(this.mapPriorities.entries()),
            stats: {
                totalLoaded: this.loadedMaps.size,
                maxAllowed: this.config.maxLoadedMaps,
                memoryUsage: this.estimateMemoryUsage()
            }
        };
    }
    
    // Estimer l'utilisation mémoire
    estimateMemoryUsage() {
        let totalSize = 0;
        for (const [mapId, mapData] of this.loadedMaps) {
            if (mapData && mapData.image) {
                // Estimation basée sur la taille de l'image
                const width = mapData.image.width || 1024;
                const height = mapData.image.height || 768;
                totalSize += (width * height * 4) / (1024 * 1024); // MB
            }
        }
        return Math.round(totalSize * 100) / 100;
    }
    
    // Nettoyer et arrêter le système
    cleanup() {
        // Décharger toutes les maps
        for (const mapId of this.loadedMaps.keys()) {
            this.unloadMap(mapId);
        }
        
        console.log('🧹 Système de chargement intelligent des maps arrêté');
    }
}

// Créer et exporter l'instance globale
window.smartMapLoader = new SmartMapLoader();

// Fonction utilitaire pour afficher le rapport
window.showMapLoaderReport = function() {
    if (window.smartMapLoader) {
        const report = window.smartMapLoader.getReport();
        console.table(report);
        return report;
    }
    return null;
};

// Fonction pour forcer le chargement d'une map
window.forceLoadMap = function(mapId, priority = 1) {
    if (window.smartMapLoader) {
        return window.smartMapLoader.loadMap(mapId, priority);
    }
    return Promise.reject('Système de chargement non initialisé');
};

console.log('💡 Système de chargement intelligent des maps activé !');
console.log('   - window.showMapLoaderReport() : Voir l\'état des maps');
console.log('   - window.forceLoadMap(mapId, priority) : Forcer le chargement');

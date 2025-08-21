// SYSTÈME DE CORRECTION DES BUGS DE CARTE
// Corrige les problèmes de rendu, de chargement et de stabilité
// Créé le 30/07/2025 - par Cursor

class MapBugFixes {
    constructor() {
        this.fixes = new Map();
        this.isActive = false;
        this.errorCount = 0;
        this.lastErrorTime = 0;
        
        // Configuration des corrections
        this.config = {
            maxErrorsPerMinute: 10,
            autoRetryDelay: 2000,
            tileCacheSize: 1000,
            enableTileCulling: false, // DÉSACTIVÉ TEMPORAIREMENT
            enableErrorRecovery: true,
            enablePerformanceMonitoring: true
        };
        
        this.init();
    }
    
    init() {
        if (this.isActive) return;
        

        
        // Appliquer les corrections
        this.applyMapFixes();
        
        // Démarrer le monitoring
        this.startMonitoring();
        
        this.isActive = true;

    }
    
    // Appliquer les corrections de carte
    applyMapFixes() {
        // 1. CORRECTION DU RENDU DES TUILES (VERSION SÉCURISÉE)
        this.fixTileRendering();
        
        // 2. CORRECTION DU CHARGEMENT DES IMAGES
        this.fixImageLoading();
        
        // 3. CORRECTION DES COLLISIONS
        this.fixCollisions();
        
        // 4. CORRECTION DE LA MINIMAP
        this.fixMinimap();
        
        // 5. CORRECTION DES TRANSITIONS DE MAP
        this.fixMapTransitions();
        
        // 6. OPTIMISATION DES PERFORMANCES (DÉSACTIVÉE)
        // this.optimizeMapPerformance();
    }
    
    // 1. CORRECTION DU RENDU DES TUILES (VERSION SÉCURISÉE)
    fixTileRendering() {
        // VÉRIFIER SI drawMap EXISTE AVANT D'INTERCEPTER
        if (typeof window.drawMap === 'function') {
            const originalDrawMap = window.drawMap;
            
            window.drawMap = function() {
                try {
                    // Vérifier que les données de carte sont valides
                    if (!window.mapData || !window.mapData.layers) {
                        // NE PAS RETOURNER FALSE - laisser le rendu continuer
                        return originalDrawMap();
                    }
                    
                    // Vérifier que le contexte canvas est valide
                    if (!window.ctx || !window.canvas) {
                        // NE PAS RETOURNER FALSE - laisser le rendu continuer
                        return originalDrawMap();
                    }
                    
                    // Appeler la fonction originale avec gestion d'erreur
                    return originalDrawMap();
                    
                } catch (error) {
                    MapBugFixes.getInstance().handleMapError('drawMap', error);
                    // EN CAS D'ERREUR, ESSAYER QUAND MÊME DE RENDRE
                    try {
                        return originalDrawMap();
                    } catch (e) {
                        return false;
                    }
                }
            };
            
            this.fixes.set('tileRendering', {
                type: 'rendering',
                description: 'Correction du rendu des tuiles avec gestion d\'erreur',
                status: 'active'
            });
        } else {
        }
        
        // Corriger le rendu des calques (VERSION SÉCURISÉE)
        this.fixLayerRendering();
    }
    
    // Corriger le rendu des calques (VERSION SÉCURISÉE)
    fixLayerRendering() {
        // VÉRIFIER SI drawMapLayer EXISTE AVANT D'INTERCEPTER
        if (typeof window.drawMapLayer === 'function') {
            const originalDrawMapLayer = window.drawMapLayer;
            
            window.drawMapLayer = function(layer, layerIndex) {
                try {
                    // Vérifier la validité du calque
                    if (!layer || !layer.data || !Array.isArray(layer.data)) {
                        return false;
                    }
                    
                    // Vérifier la taille du calque
                    if (layer.width <= 0 || layer.height <= 0) {
                        return false;
                    }
                    
                    // Appeler la fonction originale
                    return originalDrawMapLayer(layer, layerIndex);
                    
                } catch (error) {
                    console.error(`❌ Erreur dans le calque ${layerIndex}:`, error);
                    MapBugFixes.getInstance().handleMapError('layerRendering', error);
                    // EN CAS D'ERREUR, ESSAYER QUAND MÊME DE RENDRE
                    try {
                        return originalDrawMapLayer(layer, layerIndex);
                    } catch (e) {
                        console.error(`❌ Échec de la récupération du calque ${layerIndex}:`, e);
                        return false;
                    }
                }
            };
        } else {

        }
    }
    
    // 2. CORRECTION DU CHARGEMENT DES IMAGES
    fixImageLoading() {
        // VÉRIFIER SI loadTileset EXISTE AVANT D'INTERCEPTER
        if (typeof window.loadTileset === 'function') {
            const originalLoadTileset = window.loadTileset;
            
            window.loadTileset = function(tilesetPath) {
                try {
                    // Vérifier que le chemin est valide
                    if (!tilesetPath || typeof tilesetPath !== 'string') {
                        console.warn('⚠️ Chemin de tileset invalide:', tilesetPath);
                        return Promise.reject(new Error('Chemin de tileset invalide'));
                    }
                    
                    // Ajouter un timeout pour éviter les blocages
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Timeout de chargement du tileset')), 10000);
                    });
                    
                    // Charger avec timeout
                    return Promise.race([
                        originalLoadTileset(tilesetPath),
                        timeoutPromise
                    ]);
                    
                } catch (error) {
                    console.error('❌ Erreur de chargement du tileset:', error);
                    MapBugFixes.getInstance().handleMapError('tilesetLoading', error);
                    return Promise.reject(error);
                }
            };
        } else {

        }
        
        // Corriger le chargement des images de map
        this.fixMapImageLoading();
    }
    
    // Corriger le chargement des images de map
    fixMapImageLoading() {
        // VÉRIFIER SI loadMapImage EXISTE AVANT D'INTERCEPTER
        if (typeof window.loadMapImage === 'function') {
            const originalLoadMapImage = window.loadMapImage;
            
            window.loadMapImage = function(mapName) {
                try {
                    // Vérifier que le nom de map est valide
                    if (!mapName || typeof mapName !== 'string') {
                        console.warn('⚠️ Nom de map invalide:', mapName);
                        return Promise.reject(new Error('Nom de map invalide'));
                    }
                    
                    // Vérifier que l'image existe
                    const imagePath = `assets/maps/${mapName}.png`;
                    
                    return new Promise((resolve, reject) => {
                        const img = new Image();
                        
                        img.onload = () => {

                            resolve(img);
                        };
                        
                        img.onerror = () => {
                            console.error(`❌ Impossible de charger l'image: ${imagePath}`);
                            reject(new Error(`Image non trouvée: ${imagePath}`));
                        };
                        
                        // Timeout de sécurité
                        setTimeout(() => {
                            reject(new Error('Timeout de chargement de l\'image de map'));
                        }, 8000);
                        
                        img.src = imagePath;
                    });
                    
                } catch (error) {
                    console.error('❌ Erreur de chargement de l\'image de map:', error);
                    MapBugFixes.getInstance().handleMapError('mapImageLoading', error);
                    return Promise.reject(error);
                }
            };
        } else {

        }
    }
    
    // 3. CORRECTION DES COLLISIONS
    fixCollisions() {
        // VÉRIFIER SI checkCollision EXISTE AVANT D'INTERCEPTER
        if (typeof window.checkCollision === 'function') {
            const originalCheckCollision = window.checkCollision;
            
            window.checkCollision = function(x, y) {
                try {
                    // Vérifier que les coordonnées sont valides
                    if (typeof x !== 'number' || typeof y !== 'number' || 
                        isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
                        console.warn('⚠️ Coordonnées de collision invalides:', x, y);
                        return false;
                    }
                    
                    // Vérifier que la map est chargée
                    if (!window.mapData || !window.mapData.layers) {
                        console.warn('⚠️ Map non chargée pour la vérification de collision');
                        return false;
                    }
                    
                    // Appeler la fonction originale
                    return originalCheckCollision(x, y);
                    
                } catch (error) {
                    console.error('❌ Erreur dans la vérification de collision:', error);
                    MapBugFixes.getInstance().handleMapError('collision', error);
                    return false;
                }
            };
        } else {

        }
    }
    
    // 4. CORRECTION DE LA MINIMAP
    fixMinimap() {
        // VÉRIFIER SI updateMinimap EXISTE AVANT D'INTERCEPTER
        if (typeof window.updateMinimap === 'function') {
            const originalUpdateMinimap = window.updateMinimap;
            
            window.updateMinimap = function() {
                try {
                    // Vérifier que la minimap existe
                    if (!window.minimapCanvas || !window.minimapCtx) {
                        console.warn('⚠️ Éléments de minimap manquants');
                        return false;
                    }
                    
                    // Vérifier que la map est chargée
                    if (!window.mapData || !window.currentMap) {
                        console.warn('⚠️ Map non chargée pour la minimap');
                        return false;
                    }
                    
                    // Appeler la fonction originale
                    return originalUpdateMinimap();
                    
                } catch (error) {
                    console.error('❌ Erreur dans la mise à jour de la minimap:', error);
                    MapBugFixes.getInstance().handleMapError('minimap', error);
                    return false;
                }
            };
        } else {

        }
    }
    
    // 5. CORRECTION DES TRANSITIONS DE MAP
    fixMapTransitions() {
        // VÉRIFIER SI loadMap EXISTE AVANT D'INTERCEPTER
        if (typeof window.loadMap === 'function') {
            const originalLoadMap = window.loadMap;
            
            window.loadMap = function(mapName) {
                try {
                    // Vérifier que le nom de map est valide
                    if (!mapName || typeof mapName !== 'string') {
                        console.warn('⚠️ Nom de map invalide pour le chargement:', mapName);
                        return Promise.reject(new Error('Nom de map invalide'));
                    }
                    
                    // Nettoyer l'état précédent
                    MapBugFixes.getInstance().cleanupPreviousMap();
                    
                    // Appeler la fonction originale
                    return originalLoadMap(mapName).then(result => {

                        return result;
                    }).catch(error => {
                        console.error(`❌ Erreur de chargement de la map ${mapName}:`, error);
                        MapBugFixes.getInstance().handleMapError('mapLoading', error);
                        throw error;
                    });
                    
                } catch (error) {
                    console.error('❌ Erreur dans le chargement de map:', error);
                    MapBugFixes.getInstance().handleMapError('mapLoading', error);
                    return Promise.reject(error);
                }
            };
        } else {

        }
    }
    
    // 6. OPTIMISATION DES PERFORMANCES (DÉSACTIVÉE TEMPORAIREMENT)
    optimizeMapPerformance() {
        // DÉSACTIVÉ POUR ÉVITER LES PROBLÈMES

        return;
        
        // Implémenter le culling des tuiles
        if (this.config.enableTileCulling) {
            this.implementTileCulling();
        }
        
        // Optimiser le rendu des calques
        this.optimizeLayerRendering();
        
        // Mettre en cache les tuiles fréquemment utilisées
        this.implementTileCaching();
    }
    
    // Implémenter le culling des tuiles (DÉSACTIVÉ)
    implementTileCulling() {
        // DÉSACTIVÉ POUR ÉVITER LES PROBLÈMES
        return;
        
        // Créer un système de culling pour ne dessiner que les tuiles visibles
        window.tileCulling = {
            viewport: { x: 0, y: 0, width: 0, height: 0 },
            visibleTiles: new Set(),
            
            updateViewport: function(x, y, width, height) {
                this.viewport = { x, y, width, height };
                this.updateVisibleTiles();
            },
            
            updateVisibleTiles: function() {
                this.visibleTiles.clear();
                
                if (!window.mapData || !window.mapData.layers) return;
                
                const tileSize = 32; // Taille des tuiles
                const startX = Math.floor(this.viewport.x / tileSize);
                const startY = Math.floor(this.viewport.y / tileSize);
                const endX = Math.ceil((this.viewport.x + this.viewport.width) / tileSize);
                const endY = Math.ceil((this.viewport.y + this.viewport.height) / tileSize);
                
                for (let y = startY; y <= endY; y++) {
                    for (let x = startX; x <= endX; x++) {
                        this.visibleTiles.add(`${x},${y}`);
                    }
                }
            },
            
            isTileVisible: function(x, y) {
                return this.visibleTiles.has(`${x},${y}`);
            }
        };
        

    }
    
    // Optimiser le rendu des calques (DÉSACTIVÉ)
    optimizeLayerRendering() {
        // DÉSACTIVÉ POUR ÉVITER LES PROBLÈMES
        return;
        
        // Réduire la fréquence de mise à jour des calques statiques
        if (window.mapData && window.mapData.layers) {
            window.mapData.layers.forEach((layer, index) => {
                if (layer.type === 'tilelayer' && layer.properties && layer.properties.static) {
                    // Les calques statiques ne sont mis à jour qu'une fois
                    layer.needsUpdate = false;
                }
            });
        }
    }
    
    // Implémenter la mise en cache des tuiles (DÉSACTIVÉ)
    implementTileCaching() {
        // DÉSACTIVÉ POUR ÉVITER LES PROBLÈMES
        return;
        
        // Système de cache simple pour les tuiles
        window.tileCache = {
            cache: new Map(),
            maxSize: this.config.tileCacheSize,
            
            get: function(key) {
                return this.cache.get(key);
            },
            
            set: function(key, value) {
                if (this.cache.size >= this.maxSize) {
                    // Supprimer la première entrée (FIFO)
                    const firstKey = this.cache.keys().next().value;
                    this.cache.delete(firstKey);
                }
                this.cache.set(key, value);
            },
            
            clear: function() {
                this.cache.clear();
            }
        };
        

    }
    
    // Nettoyer l'état de la map précédente
    cleanupPreviousMap() {
        try {
            // Nettoyer le cache des tuiles
            if (window.tileCache) {
                window.tileCache.clear();
            }
            
            // Réinitialiser le culling
            if (window.tileCulling) {
                window.tileCulling.visibleTiles.clear();
            }
            
            // Nettoyer les ressources de la map précédente
            if (window.currentMapData) {
                // Libérer les images non utilisées
                if (window.currentMapData.image) {
                    window.currentMapData.image = null;
                }
            }
            

            
        } catch (error) {
            console.warn('⚠️ Erreur lors du nettoyage de la map précédente:', error);
        }
    }
    
    // Gérer les erreurs de map
    handleMapError(errorType, error) {
        this.errorCount++;
        const now = Date.now();
        
        // Réinitialiser le compteur d'erreurs si plus d'une minute s'est écoulée
        if (now - this.lastErrorTime > 60000) {
            this.errorCount = 1;
            this.lastErrorTime = now;
        }
        
        // Si trop d'erreurs, activer le mode de récupération
        if (this.errorCount > this.config.maxErrorsPerMinute) {
            console.warn('🚨 Trop d\'erreurs de map, activation du mode de récupération...');
            this.activateRecoveryMode();
        }
        
        // Enregistrer l'erreur
        console.error(`❌ Erreur de map (${errorType}):`, error);
    }
    
    // Activer le mode de récupération
    activateRecoveryMode() {
        if (!this.config.enableErrorRecovery) return;
        
        try {
    
            
            // Réinitialiser les systèmes de map
            this.resetMapSystems();
            
            // Recharger la map actuelle
            if (window.currentMap) {
                setTimeout(() => {
                    if (window.loadMap) {
                        window.loadMap(window.currentMap);
                    }
                }, this.config.autoRetryDelay);
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'activation du mode de récupération:', error);
        }
    }
    
    // Réinitialiser les systèmes de map
    resetMapSystems() {
        try {
            // Réinitialiser le culling
            if (window.tileCulling) {
                window.tileCulling.visibleTiles.clear();
            }
            
            // Réinitialiser le cache
            if (window.tileCache) {
                window.tileCache.clear();
            }
            
            // Réinitialiser les données de map
            if (window.mapData) {
                window.mapData.layers.forEach(layer => {
                    if (layer.needsUpdate !== undefined) {
                        layer.needsUpdate = true;
                    }
                });
            }
            

            
        } catch (error) {
        }
    }
    
    // Démarrer le monitoring
    startMonitoring() {
        if (!this.config.enablePerformanceMonitoring) return;
        
        setInterval(() => {
            this.monitorMapPerformance();
        }, 5000); // Vérifier toutes les 5 secondes
    }
    
    // Monitorer les performances de la map
    monitorMapPerformance() {
        try {
            // Vérifier la mémoire utilisée
            if (performance.memory) {
                const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
                
                if (memoryUsage > 100) { // Plus de 100 MB
                    
                    // Nettoyer le cache si nécessaire
                    if (window.tileCache && window.tileCache.cache.size > this.config.tileCacheSize * 0.8) {
                        window.tileCache.clear();
                    }
                }
            }
            
            // Vérifier les performances de rendu
            if (window.performanceConfig && window.performanceConfig.currentFPS < 20) {
                this.autoOptimize();
            }
            
        } catch (error) {
        }
    }
    
    // Optimisation automatique
    autoOptimize() {
        try {
            // Réduire la distance de rendu
            if (window.performanceConfig) {
                window.performanceConfig.monsterUpdateDistance = Math.max(8, window.performanceConfig.monsterUpdateDistance - 2);
            }
            
            // Réduire la qualité des effets
            if (window.qualitySettings) {
                window.qualitySettings.setSetting('particleEffects', 'low');
                window.qualitySettings.setSetting('shadowQuality', 'low');
            }
            
            
        } catch (error) {

        }
    }
    
    // Obtenir l'instance unique
    static getInstance() {
        if (!MapBugFixes.instance) {
            MapBugFixes.instance = new MapBugFixes();
        }
        return MapBugFixes.instance;
    }
    
    // Obtenir un rapport des corrections
    getReport() {
        return {
            isActive: this.isActive,
            fixes: Array.from(this.fixes.entries()),
            errorCount: this.errorCount,
            config: this.config,
            status: this.errorCount > this.config.maxErrorsPerMinute ? 'recovery' : 'normal'
        };
    }
}

// Créer et exporter l'instance globale
window.mapBugFixes = MapBugFixes.getInstance();

// Fonction utilitaire pour forcer la récupération
window.forceMapRecovery = function() {
    if (window.mapBugFixes) {
        window.mapBugFixes.activateRecoveryMode();
    }
};

// Fonction utilitaire pour afficher le rapport
window.showMapBugReport = function() {
    if (window.mapBugFixes) {
        const report = window.mapBugFixes.getReport();
        console.table(report);
        return report;
    }
    return null;
};

// FONCTION D'URGENCE POUR RÉCUPÉRER L'ÉCRAN
window.emergencyMapRecovery = function() {
    
    // Désactiver temporairement le système de correction
    if (window.mapBugFixes) {
        window.mapBugFixes.isActive = false;
    }
    
    // Forcer un redessinage
    if (typeof drawGame === 'function') {
        drawGame();
    }
    
    // Réactiver après 2 secondes
    setTimeout(() => {
        if (window.mapBugFixes) {
            window.mapBugFixes.isActive = true;
        }
    }, 2000);
    

};



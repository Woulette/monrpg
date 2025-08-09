// Système de carte du monde - Map System
// Responsive, zoom/pan, éléments dynamiques, interactions

class WorldMapSystem {
    constructor() {
        this.isOpen = false;
        this.canvas = null;
        this.ctx = null;
        this.maps = [];
        this.currentZoom = 1;
        this.minZoom = 0.5;
        this.maxZoom = 3;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.playerPosition = { x: 0, y: 0, direction: 0 };
        this.monsters = [];
        this.npcs = [];
        this.quests = [];
        this.availableQuests = []; // Quêtes disponibles sur la carte
        this.dungeons = [];
        this.mapImages = new Map(); // Cache des images
        this.tileSize = 16; // Réduire la taille des tiles pour mieux s'adapter
        this.mapSpacing = 30; // Réduire l'espacement entre les maps
        
        // Mini-carte
        this.minimap = null;
        
        this.init();
    }

    async init() {
        // Créer le canvas pour la carte
        this.createMapCanvas();
        
        // Charger toutes les maps
        await this.loadAllMaps();
        
        // Charger les données dynamiques
        this.loadDynamicData();
        
        // Initialiser les événements
        this.initEvents();
        
        // Créer la mini-carte
        this.minimap = new MinimapSystem(this);
        
        // Sauvegarder l'état initial
        this.saveMapState();
    }

    createMapCanvas() {
        // Créer le modal de la carte
        const modal = document.createElement('div');
        modal.id = 'world-map-modal';
        modal.className = 'map-modal';
        modal.innerHTML = `
            <div class="map-container">
                <div class="map-header">
                    <h2>🗺️ Carte du Monde</h2>
                    <div class="map-controls">
                        <button id="map-zoom-in" title="Zoom +">➕</button>
                        <button id="map-zoom-out" title="Zoom -">➖</button>
                        <button id="map-reset" title="Réinitialiser">🔄</button>
                        <button id="map-close" title="Fermer">❌</button>
                    </div>
                </div>
                <div class="map-content">
                    <canvas id="world-map-canvas" width="1200" height="800"></canvas>
                    <div class="map-legend">
                        <div class="legend-item">
                            <span class="legend-icon player-icon">🟢</span>
                            <span>Joueur</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-icon quest-icon">❗</span>
                            <span>Quête</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-icon npc-icon">🔵</span>
                            <span>PNJ</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        this.canvas = document.getElementById('world-map-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Rendre le canvas responsive
        this.makeCanvasResponsive();
    }

    makeCanvasResponsive() {
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            const containerRect = container.getBoundingClientRect();
            
            // Garder un ratio 4:3
            const maxWidth = containerRect.width - 40;
            const maxHeight = containerRect.height - 100;
            
            let newWidth = maxWidth;
            let newHeight = (maxWidth * 3) / 4;
            
            if (newHeight > maxHeight) {
                newHeight = maxHeight;
                newWidth = (maxHeight * 4) / 3;
            }
            
            this.canvas.style.width = newWidth + 'px';
            this.canvas.style.height = newHeight + 'px';
            
            // Ajuster le zoom et pan pour la nouvelle taille
            this.adjustViewForNewSize();
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    adjustViewForNewSize() {
        // Centrer la vue sur les maps
        const totalWidth = this.getTotalMapWidth();
        const totalHeight = this.getTotalMapHeight();
        
        if (totalWidth > 0 && totalHeight > 0) {
            // Centrer la vue sur les maps avec une marge
            const mapWidth = totalWidth * this.currentZoom;
            const mapHeight = totalHeight * this.currentZoom;
            
            this.panX = (this.canvas.width - mapWidth) / 2;
            this.panY = (this.canvas.height - mapHeight) / 2;
        }
    }

    async loadAllMaps() {
        try {
            // Charger toutes les maps depuis le dossier assets/maps/
            const mapFiles = await this.getMapFiles();
            
            for (const mapFile of mapFiles) {
                const mapData = await this.loadMapData(mapFile);
                if (mapData) {
                    // Filtrer les donjons et maisons selon la demande de l'utilisateur
                    if (!mapData.isDungeon && !mapData.isHouse) {
                        this.maps.push(mapData);
                        // Charger l'image de la map en arrière-plan
                        this.loadMapImage(mapFile);
                    }
                }
            }
            

        } catch (error) {
            console.error('Erreur lors du chargement des maps:', error);
        }
    }

    async getMapFiles() {
        // Liste des maps connues (à étendre automatiquement)
        const knownMaps = [
            'map1', 'map2', 'map3', 'map4', 'map5', 'map6', 'map7', 'map8', 'map9', 'map10',
            'map11', 'map12', 'map13', 'map14', 'map15', 'map16', 'map17', 'map18', 'map19', 'map20',
            'map21', 'map22', 'map23', 'map24', 'map25', 'map26', 'map27', 'map28', 'map29', 'map30',
            'map31', 'map32', 'map33', 'map34', 'map35', 'map36', 'map37', 'map38', 'map39', 'map40',
            'map41', 'map42', 'map43', 'map44', 'map45', 'map46', 'map47', 'map48', 'map49', 'map50',
            'maison', 'mapdonjonslime', 'mapdonjonslime2', 'mapdonjonslimeboss', 'mapzonealuineeks1', 'mazonehaut1aluineeks1'
        ];
        
        const validMaps = [];
        
        for (const mapName of knownMaps) {
            try {
                const response = await fetch(`assets/maps/${mapName}.json`);
                if (response.ok) {
                    validMaps.push(mapName);
                }
            } catch (error) {
                // Map n'existe pas, on continue
            }
        }
        
        return validMaps;
    }

    async loadMapData(mapName) {
        try {
            const response = await fetch(`assets/maps/${mapName}.json`);
            if (!response.ok) return null;
            
            const mapData = await response.json();
            
            // Calculer la position manuelle
            const position = this.calculateMapPosition(mapName);
            
            // Si pas de position définie, ne pas charger la map
            if (position === null) {
                return null;
            }
            
            return {
                name: mapName,
                width: mapData.width,
                height: mapData.height,
                layers: mapData.layers,
                tilesets: mapData.tilesets,
                position: position,
                isDungeon: mapName.includes('donjon'),
                isHouse: mapName === 'maison'
            };
        } catch (error) {
            console.error(`Erreur lors du chargement de ${mapName}:`, error);
            return null;
        }
    }

    calculateMapPosition(mapName) {
        // Configuration manuelle des positions des maps - AUCUN calcul automatique
        // Système inversé : Y augmente vers le bas (map1 en bas, map3 en haut)
        // Espacement augmenté pour éviter le chevauchement (400px de hauteur par map)
        const mapPositions = {
            'map1': { x: 0, y: 800 },                    // map1 en bas (Y = 800)
            'map2': { x: 0, y: 400 },                  // map2 au milieu (Y = 400)
            'map3': { x: 0, y: 0 },                  // map3 en haut (Y = 0)
            'map4': { x: 770, y: 0 },                 // map4 à droite de map3 (Y = 0)
            'map5': { x: 1540, y: 0 },                // map5 à droite de map4 y = 0
            'mapzonealuineeks1': { x: 770, y: -400 },     // mapzonealuineeks1 à droite de map4
            'mazonehaut1aluineeks1': { x: 770, y: -800 }, // mazonehaut1aluineeks1 à droite de mapzonealuineeks1
            
        };
        
        // Si la map a une position définie, l'utiliser
        if (mapPositions[mapName]) {
            return mapPositions[mapName];
        }
        
        // Si la map n'a pas de position définie, ne pas l'afficher
        console.warn(`Position non définie pour ${mapName} - map non affichée`);
        return null;
    }

    loadDynamicData() {
        // Charger la position du joueur
        if (window.player) {
            this.playerPosition = {
                x: window.player.x,
                y: window.player.y,
                direction: window.player.direction || 0
            };
        }
        
        // Charger les monstres (lazy loading)
        this.loadMonstersData();
        
        // Charger les PNJ et quêtes
        this.loadNPCsAndQuests();
        
        // Charger les donjons
        this.loadDungeonsData();
        
        // Charger les quêtes disponibles (rechargement dynamique)
        this.loadAvailableQuests();
    }

    loadMonstersData() {
        if (window.monsters) {
            this.monsters = window.monsters.map(monster => ({
                x: monster.x,
                y: monster.y,
                name: monster.name,
                hp: monster.hp,
                isDead: monster.isDead
            }));
        }
    }

    loadNPCsAndQuests() {
        // Charger les PNJ depuis le système existant
        if (window.npcs) {
            this.npcs = window.npcs.map(npc => ({
                x: npc.x,
                y: npc.y,
                name: npc.name,
                hasQuest: npc.hasQuest || false
            }));
        }
        
        // Charger les quêtes (window.quests est un objet, pas un tableau)
        if (window.quests) {
            this.quests = Object.values(window.quests).map(quest => ({
                x: quest.x || 0,
                y: quest.y || 0,
                name: quest.name,
                status: quest.status
            }));
        }
    }

    loadDungeonsData() {
        // Identifier les points d'accès aux donjons
        this.dungeons = [
            { x: 2, y: 2, name: "Donjon Slime", icon: "⚔️", mapName: "map3" }
        ];
    }

    loadAvailableQuests() {
        // Identifier les quêtes disponibles dynamiquement depuis le système de quêtes
        this.availableQuests = [];
        
        
        // Attendre que window.quests soit disponible
        if (!window.quests) {

            setTimeout(() => this.loadAvailableQuests(), 100);
            return;
        }
        
        
        Object.values(window.quests).forEach(quest => {

            
            // Vérifier si la quête est disponible (non acceptée, non complétée, et accessible)
            if (quest && !quest.completed && !quest.accepted && quest.availableOn) {
                // Vérifier les prérequis manuellement
                let isAvailable = true;
                
                // Vérifier les prérequis spécifiques
                if (quest.id === 'crowCraft' && window.quests.crowHunt && !window.quests.crowHunt.completed) {
                    isAvailable = false;
                }
                
                if (quest.id === 'slimeBoss' && window.quests.crowCraft && !window.quests.crowCraft.completed) {
                    isAvailable = false;
                }
                
                if (quest.id === 'slimeBossFinal' && window.quests.slimeBoss && !window.quests.slimeBoss.completed) {
                    isAvailable = false;
                }
                
                if (isAvailable) {
                    const mapName = `map${quest.availableOn.map}`;
                    const position = quest.availableOn.pnjPosition;
                    
                    
                    this.availableQuests.push({
                        x: position.x,
                        y: position.y,
                        name: quest.name,
                        icon: "❗",
                        mapName: mapName,
                        questId: quest.id,
                        type: 'available'
                    });
                }
            }
            
            
            if (quest && quest.readyToComplete && !quest.completed && quest.validationOn) {
                const mapName = `map${quest.validationOn.map}`;
                const position = quest.validationOn.pnjPosition;
                

                
                this.availableQuests.push({
                    x: position.x,
                    y: position.y,
                    name: quest.name + ' (à valider)',
                    icon: "❗",
                    mapName: mapName,
                    questId: quest.id,
                    type: 'validation'
                });
         
            }
            

        });
    
        
        // Debug: afficher les détails de chaque quête trouvée

        
        // Redessiner la carte pour afficher les nouvelles quêtes
        if (this.isOpen) {
            this.draw();
        }
    }

    async loadMapImage(mapName) {
        try {
            const image = new Image();
            let currentPathIndex = 0;
            
            // Liste des chemins possibles pour les images
            const imagePaths = [
                `assets/maps/${mapName}.png`,
                `assets/maps/${mapName}.jpg`,
                `assets/maps/${mapName}.jpeg`,
                `assets/maps/${mapName}.gif`,
                `assets/maps/${mapName}.webp`
            ];
            
            image.onload = () => {
                this.mapImages.set(mapName, image);
                // Redessiner la carte quand l'image est chargée
                if (this.isOpen) {
                    this.draw();
                }
            };
            
            image.onerror = () => {
                currentPathIndex++;
                if (currentPathIndex < imagePaths.length) {
                    // Essayer le prochain format
                    image.src = imagePaths[currentPathIndex];
                } else {
                    // Tous les formats ont échoué

                }
            };
            
            // Commencer par le premier format
            image.src = imagePaths[0];
        } catch (error) {
            // Erreur lors du chargement de l'image
        }
    }

    initEvents() {
        // Événements de zoom
        document.getElementById('map-zoom-in').addEventListener('click', () => {
            this.zoomIn();
        });
        
        document.getElementById('map-zoom-out').addEventListener('click', () => {
            this.zoomOut();
        });
        
        document.getElementById('map-reset').addEventListener('click', () => {
            this.resetView();
        });
        
        document.getElementById('map-close').addEventListener('click', () => {
            this.close();
        });
        
        // Événements de souris sur le canvas
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleWheel(e);
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.handleMouseDown(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            this.handleMouseUp(e);
        });
        
        this.canvas.addEventListener('click', (e) => {
            this.handleClick(e);
        });
        
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });
        
        // Événements de touche
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
    }

    handleWheel(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoomAt(mouseX, mouseY, zoomFactor);
    }

    zoomAt(x, y, factor) {
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.currentZoom * factor));
        
        if (newZoom !== this.currentZoom) {
            const zoomRatio = newZoom / this.currentZoom;
            
            this.panX = x - (x - this.panX) * zoomRatio;
            this.panY = y - (y - this.panY) * zoomRatio;
            
            this.currentZoom = newZoom;
            this.draw();
            this.saveMapState();
        }
    }

    zoomIn() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.zoomAt(centerX, centerY, 1.2);
    }

    zoomOut() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.zoomAt(centerX, centerY, 0.8);
    }

    resetView() {
        this.currentZoom = 1;
        this.adjustViewForNewSize();
        this.draw();
        this.saveMapState();
    }

    handleMouseDown(e) {
        if (e.button === 0) { // Clic gauche
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        }
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;
            
            this.panX += deltaX;
            this.panY += deltaY;
            
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            
            // Permettre un déplacement plus libre avec des limites plus souples
            const totalWidth = this.getTotalMapWidth();
            const totalHeight = this.getTotalMapHeight();
            const mapWidth = totalWidth * this.currentZoom;
            const mapHeight = totalHeight * this.currentZoom;
            
            // Limites plus souples : permettre de voir un peu au-delà des bords
            const margin = 100; // Marge de 100px au-delà des bords
            const maxPanX = this.canvas.width + margin;
            const minPanX = -mapWidth - margin;
            const maxPanY = this.canvas.height + margin;
            const minPanY = -mapHeight - margin;
            
            this.panX = Math.max(minPanX, Math.min(maxPanX, this.panX));
            this.panY = Math.max(minPanY, Math.min(maxPanY, this.panY));
            
            this.draw();
        } else {
            // Détecter le survol des donjons
            this.handleDungeonHover(e);
            
            // Détecter le survol des quêtes disponibles
            this.handleQuestHover(e);
        }
    }

    handleMouseUp(e) {
        this.isDragging = false;
        this.saveMapState();
    }

    handleDungeonHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Convertir les coordonnées du canvas en coordonnées du monde
        const worldX = (canvasX - this.panX) / this.currentZoom;
        const worldY = (canvasY - this.panY) / this.currentZoom;
        
        // Vérifier si on survole un donjon
        for (const dungeon of this.dungeons) {
            const map = this.maps.find(m => m.name === dungeon.mapName);
            if (!map) continue;
            
                         const dungeonX = map.position.x + dungeon.x * this.tileSize;
             const dungeonY = map.position.y + dungeon.y * this.tileSize;
             const dungeonSize = 30; // Taille du cercle du donjon (mise à jour)
            
            // Vérifier si la souris est dans le cercle du donjon
            const distance = Math.sqrt(
                Math.pow(worldX - (dungeonX + this.tileSize / 2), 2) +
                Math.pow(worldY - (dungeonY + this.tileSize / 2), 2)
            );
            
            if (distance <= dungeonSize) {
                // Afficher le tooltip du donjon
                this.showDungeonTooltip(dungeon, e.clientX, e.clientY);
                return;
            }
        }
        
        // Si on ne survole aucun donjon, supprimer le tooltip
        this.hideDungeonTooltip();
    }

    handleQuestHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Convertir les coordonnées du canvas en coordonnées du monde
        const worldX = (canvasX - this.panX) / this.currentZoom;
        const worldY = (canvasY - this.panY) / this.currentZoom;
        
        // Vérifier si on survole une quête disponible
        for (const quest of this.availableQuests) {
            const map = this.maps.find(m => m.name === quest.mapName);
            if (!map) continue;
            
            const questX = map.position.x + quest.x * this.tileSize;
            const questY = map.position.y + quest.y * this.tileSize;
            const questSize = 30; // Taille du cercle de la quête
            
            // Vérifier si la souris est dans le cercle de la quête
            const distance = Math.sqrt(
                Math.pow(worldX - (questX + this.tileSize / 2), 2) +
                Math.pow(worldY - (questY + this.tileSize / 2), 2)
            );
            
            if (distance <= questSize) {
                // Afficher le tooltip de la quête
                this.showQuestTooltip(quest, e.clientX, e.clientY);
                return;
            }
        }
        
        // Si on ne survole aucune quête, supprimer le tooltip
        this.hideQuestTooltip();
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Convertir les coordonnées du canvas en coordonnées du monde
        const worldX = (canvasX - this.panX) / this.currentZoom;
        const worldY = (canvasY - this.panY) / this.currentZoom;
        
        this.showZoneInfo(worldX, worldY);
    }

    handleRightClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Convertir les coordonnées du canvas en coordonnées du monde
        const worldX = (canvasX - this.panX) / this.currentZoom;
        const worldY = (canvasY - this.panY) / this.currentZoom;
        
        this.showContextMenu(e.clientX, e.clientY, worldX, worldY);
    }

    handleKeyDown(e) {
        switch(e.key) {
            case 'Escape':
                this.close();
                break;
            case '+':
            case '=':
                this.zoomIn();
                break;
            case '-':
                this.zoomOut();
                break;
            case '0':
                this.resetView();
                break;
        }
    }

    showZoneInfo(worldX, worldY) {
        // Trouver la map à cette position
        const map = this.findMapAtPosition(worldX, worldY);
        
        if (map) {
            const localX = worldX - map.position.x;
            const localY = worldY - map.position.y;
            
            // Trouver les éléments à cette position
            const elements = this.findElementsAtPosition(map, localX, localY);
            
            // Afficher les informations
            this.showInfoTooltip(map, localX, localY, elements);
        }
    }

    findMapAtPosition(worldX, worldY) {
        return this.maps.find(map => {
            return worldX >= map.position.x && 
                   worldX < map.position.x + map.width * this.tileSize &&
                   worldY >= map.position.y && 
                   worldY < map.position.y + map.height * this.tileSize;
        });
    }

    findElementsAtPosition(map, localX, localY) {
        const elements = {
            monsters: [],
            npcs: [],
            quests: [],
            dungeons: []
        };
        
        // Vérifier les monstres
        elements.monsters = this.monsters.filter(monster => 
            monster.x === Math.floor(localX / this.tileSize) &&
            monster.y === Math.floor(localY / this.tileSize) &&
            !monster.isDead
        );
        
        // Vérifier les PNJ
        elements.npcs = this.npcs.filter(npc => 
            npc.x === Math.floor(localX / this.tileSize) &&
            npc.y === Math.floor(localY / this.tileSize)
        );
        
        // Vérifier les quêtes
        elements.quests = this.quests.filter(quest => 
            quest.x === Math.floor(localX / this.tileSize) &&
            quest.y === Math.floor(localY / this.tileSize)
        );
        
        // Vérifier les donjons
        elements.dungeons = this.dungeons.filter(dungeon => 
            dungeon.x === Math.floor(localX / this.tileSize) &&
            dungeon.y === Math.floor(localY / this.tileSize)
        );
        
        return elements;
    }

    showInfoTooltip(map, localX, localY, elements) {
        const tileX = Math.floor(localX / this.tileSize);
        const tileY = Math.floor(localY / this.tileSize);
        
        // S'assurer que les coordonnées sont dans les limites de la map
        const clampedTileX = Math.max(0, Math.min(map.width - 1, tileX));
        const clampedTileY = Math.max(0, Math.min(map.height - 1, tileY));
        
        let info = `🗺️ ${map.name}\n`;
        info += `📍 Coordonnées: (${clampedTileX}, ${clampedTileY})\n`;
        
        if (elements.monsters.length > 0) {
            info += `👹 Monstres: ${elements.monsters.length}\n`;
        }
        
        if (elements.npcs.length > 0) {
            info += `👤 PNJ: ${elements.npcs.map(npc => npc.name).join(', ')}\n`;
        }
        
        if (elements.quests.length > 0) {
            info += `❗ Quêtes: ${elements.quests.map(quest => quest.name).join(', ')}\n`;
        }
        
        if (elements.dungeons.length > 0) {
            info += `⚔️ Donjon: ${elements.dungeons.map(dungeon => dungeon.name).join(', ')}\n`;
        }
        
        // Afficher le tooltip
        this.showTooltip(info);
    }

    showContextMenu(mouseX, mouseY, worldX, worldY) {
        const map = this.findMapAtPosition(worldX, worldY);
        
        if (map) {
            const menu = document.createElement('div');
            menu.className = 'map-context-menu';
            menu.style.left = mouseX + 'px';
            menu.style.top = mouseY + 'px';
            
            menu.innerHTML = `
                <div class="menu-item" data-action="teleport">🚀 Téléporter ici</div>
                <div class="menu-item" data-action="details">📋 Détails</div>
                <div class="menu-item" data-action="monsters">👹 Voir monstres</div>
            `;
            
            document.body.appendChild(menu);
            
            // Gérer les clics sur le menu
            menu.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleContextMenuAction(action, map, worldX, worldY);
                document.body.removeChild(menu);
            });
            
            // Fermer le menu si on clique ailleurs
            setTimeout(() => {
                if (document.body.contains(menu)) {
                    document.body.removeChild(menu);
                }
            }, 3000);
        }
    }

    handleContextMenuAction(action, map, worldX, worldY) {
        switch(action) {
            case 'teleport':
                this.teleportToPosition(map, worldX, worldY);
                break;
            case 'details':
                this.showMapDetails(map);
                break;
            case 'monsters':
                this.showMonstersInMap(map);
                break;
        }
    }

    teleportToPosition(map, worldX, worldY) {
        const localX = worldX - map.position.x;
        const localY = worldY - map.position.y;
        const tileX = Math.floor(localX / this.tileSize);
        const tileY = Math.floor(localY / this.tileSize);
        
        // S'assurer que les coordonnées sont dans les limites de la map
        const clampedTileX = Math.max(0, Math.min(map.width - 1, tileX));
        const clampedTileY = Math.max(0, Math.min(map.height - 1, tileY));
        
        // Téléporter le joueur à la position exacte cliquée
        if (window.teleportPlayer) {
            window.teleportPlayer(map.name, clampedTileX, clampedTileY);
        }
        
        this.close();
    }

    showMapDetails(map) {
        const details = `
            📋 Détails de la map: ${map.name}
            📏 Taille: ${map.width}x${map.height}
            🏠 Type: ${map.isDungeon ? 'Donjon' : map.isHouse ? 'Maison' : 'Zone'}
            🎯 Position: (${map.position.x}, ${map.position.y})
        `;
        
        alert(details);
    }

    showMonstersInMap(map) {
        const mapMonsters = this.monsters.filter(monster => {
            // Filtrer les monstres de cette map
            return monster.mapName === map.name;
        });
        
        if (mapMonsters.length > 0) {
            const monsterList = mapMonsters.map(monster => 
                `${monster.name} (${monster.hp} HP)`
            ).join('\n');
            
            alert(`👹 Monstres dans ${map.name}:\n${monsterList}`);
        } else {
            alert(`Aucun monstre dans ${map.name}`);
        }
    }

    showTooltip(text) {
        // Supprimer l'ancien tooltip
        const oldTooltip = document.querySelector('.map-tooltip');
        if (oldTooltip) {
            document.body.removeChild(oldTooltip);
        }
        
        // Créer le nouveau tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'map-tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        // Positionner le tooltip
        const rect = this.canvas.getBoundingClientRect();
        tooltip.style.left = (rect.left + 10) + 'px';
        tooltip.style.top = (rect.top + 10) + 'px';
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            if (document.body.contains(tooltip)) {
                document.body.removeChild(tooltip);
            }
        }, 3000);
    }

    showDungeonTooltip(dungeon, mouseX, mouseY) {
        // Supprimer l'ancien tooltip de donjon
        this.hideDungeonTooltip();
        
        // Créer le nouveau tooltip de donjon
        const tooltip = document.createElement('div');
        tooltip.className = 'dungeon-tooltip';
        tooltip.innerHTML = `
            <div class="dungeon-tooltip-content">
                <span class="dungeon-icon">${dungeon.icon}</span>
                <span class="dungeon-name">${dungeon.name}</span>
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Positionner le tooltip près de la souris
        tooltip.style.left = (mouseX + 10) + 'px';
        tooltip.style.top = (mouseY - 30) + 'px';
    }

    hideDungeonTooltip() {
        const oldTooltip = document.querySelector('.dungeon-tooltip');
        if (oldTooltip) {
            document.body.removeChild(oldTooltip);
        }
    }

    showQuestTooltip(quest, mouseX, mouseY) {
        // Supprimer l'ancien tooltip de quête
        this.hideQuestTooltip();
        
        // Créer le nouveau tooltip de quête
        const tooltip = document.createElement('div');
        tooltip.className = 'quest-tooltip';
        tooltip.innerHTML = `
            <div class="quest-tooltip-content">
                <span class="quest-icon">${quest.icon}</span>
                <span class="quest-name">${quest.name}</span>
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Positionner le tooltip près de la souris
        tooltip.style.left = (mouseX + 10) + 'px';
        tooltip.style.top = (mouseY - 30) + 'px';
    }

    hideQuestTooltip() {
        const oldTooltip = document.querySelector('.quest-tooltip');
        if (oldTooltip) {
            document.body.removeChild(oldTooltip);
        }
    }

    draw() {
        if (!this.ctx) return;
        
        // Nettoyer le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Appliquer les transformations
        this.ctx.save();
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.currentZoom, this.currentZoom);
        
        // Dessiner les maps
        this.drawMaps();
        
        // Dessiner les éléments dynamiques
        this.drawDynamicElements();
        
        this.ctx.restore();
        
        // Redessiner en continu si la carte est ouverte pour l'effet de clignotement
        if (this.isOpen) {
            requestAnimationFrame(() => this.draw());
        }
    }

    drawMaps() {
        for (const map of this.maps) {
            this.drawMap(map);
        }
    }

    drawMap(map) {
        const x = map.position.x;
        const y = map.position.y;
        const width = map.width * this.tileSize;
        const height = map.height * this.tileSize;
        
        // Essayer de charger et dessiner l'image de la map
        const mapImage = this.mapImages.get(map.name);
        if (mapImage) {
            // Dessiner l'image de la map
            this.ctx.drawImage(mapImage, x, y, width, height);
        } else {
            // Fallback : dessiner le fond de la map avec un dégradé plus attrayant
            const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
            gradient.addColorStop(0, '#2d5016');
            gradient.addColorStop(1, '#4a7c59');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, width, height);
            
            // Ajouter un texte "Pas d'image" en petit
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Pas d\'image', x + width / 2, y + height / 2);
        }
        
        // Dessiner la bordure
        this.ctx.strokeStyle = '#16a34a';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, width, height);
        
        // Dessiner le nom de la map
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(map.name, x + width / 2, y + height + 20);
        
        // Dessiner une grille plus visible pour représenter la map
        this.drawMapGrid(map, x, y);
    }

    drawMapGrid(map, x, y) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        
        // Grille verticale (tous les 5 tiles pour plus de clarté)
        for (let i = 0; i <= map.width; i += 5) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + i * this.tileSize, y);
            this.ctx.lineTo(x + i * this.tileSize, y + map.height * this.tileSize);
            this.ctx.stroke();
        }
        
        // Grille horizontale (tous les 5 tiles pour plus de clarté)
        for (let i = 0; i <= map.height; i += 5) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + i * this.tileSize);
            this.ctx.lineTo(x + map.width * this.tileSize, y + i * this.tileSize);
            this.ctx.stroke();
        }
        
        // Dessiner les coordonnées aux coins
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('0,0', x + 5, y + 15);
        this.ctx.fillText(`${map.width-1},${map.height-1}`, x + map.width * this.tileSize - 40, y + map.height * this.tileSize - 5);
    }

    drawDynamicElements() {
        // Dessiner le joueur
        this.drawPlayer();
        
        // Dessiner les PNJ et quêtes
        this.drawNPCsAndQuests();
        
        // Dessiner les donjons
        this.drawDungeons();
        
        // Dessiner les quêtes disponibles
        this.drawAvailableQuests();
        
        // Dessiner les monstres (seulement si demandé)
        if (this.showMonsters) {
            this.drawMonsters();
        }
    }

    drawPlayer() {
        const playerMap = this.findPlayerMap();
        if (playerMap) {
            const x = playerMap.position.x + this.playerPosition.x * this.tileSize;
            const y = playerMap.position.y + this.playerPosition.y * this.tileSize;
            
            // Dessiner le point du joueur
            this.ctx.fillStyle = '#22c55e';
            this.ctx.beginPath();
            this.ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, 6, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Dessiner la flèche de direction
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x + this.tileSize / 2, y + this.tileSize / 2);
            
            const angle = this.playerPosition.direction * Math.PI / 2;
            const endX = x + this.tileSize / 2 + Math.cos(angle) * 8;
            const endY = y + this.tileSize / 2 + Math.sin(angle) * 8;
            
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
    }

    findPlayerMap() {
        // Trouver la map où se trouve le joueur
        return this.maps.find(map => map.name === window.currentMap);
    }

    drawDungeons() {
        for (const dungeon of this.dungeons) {
            // Trouver la map du donjon
            const map = this.maps.find(m => m.name === dungeon.mapName);
            if (!map) continue;
            
            const x = map.position.x + dungeon.x * this.tileSize;
            const y = map.position.y + dungeon.y * this.tileSize;
            
            // Dessiner un cercle bleu encore plus grand pour le donjon
            this.ctx.fillStyle = '#3b82f6';
            this.ctx.beginPath();
            this.ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, 30, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Ajouter une bordure blanche plus épaisse
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 5;
            this.ctx.stroke();
            
            // Ajouter l'icône du donjon au centre (encore plus grande)
            this.ctx.font = '32px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(dungeon.icon, x + this.tileSize / 2, y + this.tileSize / 2 + 10);
        }
    }

    drawAvailableQuests() {
        
        for (const quest of this.availableQuests) {
            // Trouver la map de la quête
            const map = this.maps.find(m => m.name === quest.mapName);
            if (!map) {
                continue;
            }
            // Calculer le centre de la map
            const mapCenterX = map.position.x + (map.width * this.tileSize) / 2;
            const mapCenterY = map.position.y + (map.height * this.tileSize) / 2;
            // Effet de clignotement pour les quêtes à valider
            let shouldBlink = false;
            if (quest.type === 'validation') {
                shouldBlink = Math.floor(Date.now() / 500) % 2 === 0; // Clignote toutes les 500ms
            }
            // Choisir la couleur selon le type de quête
            if (quest.type === 'validation') {
                // Cercle orange pour les quêtes à valider (avec clignotement)
                this.ctx.fillStyle = shouldBlink ? '#f97316' : 'rgba(249, 115, 22, 0.3)';
            } else {
                // Cercle vert pour les quêtes disponibles
                this.ctx.fillStyle = '#22c55e';
            }
            this.ctx.beginPath();
            this.ctx.arc(mapCenterX, mapCenterY, 30, 0, 2 * Math.PI);
            this.ctx.fill();
            // Ajouter une bordure blanche plus épaisse
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 5;
            this.ctx.stroke();
            // Ajouter l'icône de quête parfaitement centrée
            this.ctx.font = '32px Arial';
            this.ctx.fillStyle = shouldBlink ? '#ffffff' : 'rgba(255, 255, 255, 0.3)';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(quest.icon, mapCenterX, mapCenterY);
        }
    }

    drawNPCsAndQuests() {
        for (const npc of this.npcs) {
            const x = npc.x * this.tileSize;
            const y = npc.y * this.tileSize;
            
            if (npc.hasQuest) {
                // Dessiner l'icône de quête
                this.ctx.font = '16px Arial';
                this.ctx.fillStyle = '#fbbf24';
                this.ctx.fillText('❗', x + this.tileSize / 2 - 8, y + this.tileSize / 2 + 6);
            } else {
                // Dessiner le point PNJ
                this.ctx.fillStyle = '#3b82f6';
                this.ctx.beginPath();
                this.ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, 4, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
    }

    drawMonsters() {
        for (const monster of this.monsters) {
            if (!monster.isDead) {
                const x = monster.x * this.tileSize;
                const y = monster.y * this.tileSize;
                
                // Dessiner le point monstre
                this.ctx.fillStyle = '#ef4444';
                this.ctx.beginPath();
                this.ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, 3, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
    }

    getTotalMapWidth() {
        if (this.maps.length === 0) return 0;
        
        const maxX = Math.max(...this.maps.map(map => 
            map.position.x + map.width * this.tileSize
        ));
        
        return maxX + this.mapSpacing;
    }

    getTotalMapHeight() {
        if (this.maps.length === 0) return 0;
        
        const maxY = Math.max(...this.maps.map(map => 
            map.position.y + map.height * this.tileSize
        ));
        
        return maxY + this.mapSpacing;
    }

    saveMapState() {
        const state = {
            zoom: this.currentZoom,
            panX: this.panX,
            panY: this.panY
        };
        
        localStorage.setItem('worldMapState', JSON.stringify(state));
    }

    loadMapState() {
        const saved = localStorage.getItem('worldMapState');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.currentZoom = state.zoom || 1;
                this.panX = state.panX || 0;
                this.panY = state.panY || 0;
            } catch (error) {
                console.error('Erreur lors du chargement de l\'état de la carte:', error);
            }
        }
    }

    open() {
        this.isOpen = true;
        document.getElementById('world-map-modal').style.display = 'flex';
        
        // Charger l'état sauvegardé
        this.loadMapState();
        
        // Mettre à jour les données dynamiques et recharger les quêtes
        this.loadDynamicData();
        this.loadAvailableQuests(); // Recharger spécifiquement les quêtes
        
        // Focus sur le canvas
        this.canvas.focus();
    }

    close() {
        this.isOpen = false;
        document.getElementById('world-map-modal').style.display = 'none';
        
        // Sauvegarder l'état
        this.saveMapState();
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
}

// Initialiser le système de carte
window.worldMapSystem = new WorldMapSystem();

// Fonction globale pour ouvrir la carte
window.openWorldMap = function() {
    window.worldMapSystem.open();
};

// Fonction globale pour fermer la carte
window.closeWorldMap = function() {
    window.worldMapSystem.close();
};

// Fonction globale pour basculer la carte
window.toggleWorldMap = function() {
    window.worldMapSystem.toggle();
}; 
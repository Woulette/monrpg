// Système de Mini-carte - Minimap System
// Système indépendant et simplifié pour afficher une vue d'ensemble du monde

// Variables configurables pour la taille de la mini-carte
window.MINIMAP_WIDTH = 200;  // Largeur de la mini-carte (modifiable)
window.MINIMAP_HEIGHT = 150; // Hauteur de la mini-carte (modifiable)

// TAILLE MANUELLE - Modifie ces valeurs pour changer la taille par défaut :
// window.MINIMAP_WIDTH = 300;  // Plus large
// window.MINIMAP_HEIGHT = 200; // Plus haute
// window.MINIMAP_WIDTH = 150;  // Plus petite
// window.MINIMAP_HEIGHT = 100; // Plus basse

class MinimapSystem {
    constructor(worldMapSystem) {
        this.worldMapSystem = worldMapSystem;
        this.width = 300; // Largeur par défaut
        this.height = 130; // Hauteur par défaut
        this.scale = 0.08; // Échelle de la mini-carte
        this.minScale = 0.05;
        this.maxScale = 0.3;
        this.position = { x: 0, y: 0 };
        this.centerOffsetX = 0;
        this.centerOffsetY = 0;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.isResizing = false;
        this.resizeStart = { x: 0, y: 0 };
        this.originalSize = { width: 0, height: 0 };
        this.canvas = null;
        this.ctx = null;
        this.resizeHandles = [];
        this.controlsPanel = null;
        
        this.init();
        this.createControls(); // Ajouter les contrôles
    }
    
    init() {
        this.createCanvas();
        this.initEvents();
        this.startRender();
    }
    
    createCanvas() {
        // Créer le canvas de la mini-carte
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.position = 'absolute';
        this.canvas.style.border = '2px solid #333';
        this.canvas.style.backgroundColor = '#1a1a1a';
        this.canvas.style.zIndex = '1000';
        this.canvas.style.cursor = 'pointer';
        this.canvas.style.display = 'none'; // Masquée par défaut
        
        this.ctx = this.canvas.getContext('2d');
        
        // Ajouter au DOM
        document.body.appendChild(this.canvas);
        
        // Créer les poignées de redimensionnement
        this.createResizeHandles();
        
        // Positionner dynamiquement via le HUD
        this.updatePosition();
    }
    
    createResizeHandles() {
        // Supprimer les anciennes poignées s'il y en a
        const existingHandles = document.querySelectorAll('.minimap-resize-handle');
        existingHandles.forEach(handle => handle.remove());
        
        // Créer les 4 poignées de redimensionnement
        const positions = [
            { corner: 'nw', cursor: 'nw-resize', left: '0px', top: '0px' },
            { corner: 'ne', cursor: 'ne-resize', left: '100%', top: '0px', transform: 'translateX(-100%)' },
            { corner: 'sw', cursor: 'sw-resize', left: '0px', top: '100%', transform: 'translateY(-100%)' },
            { corner: 'se', cursor: 'se-resize', left: '100%', top: '100%', transform: 'translate(-100%, -100%)' }
        ];
        
        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = 'minimap-resize-handle';
            handle.dataset.corner = pos.corner;
            handle.style.cssText = `
                position: absolute;
                width: 15px;
                height: 15px;
                background: rgba(255, 255, 255, 0.9);
                border: 2px solid #333;
                border-radius: 3px;
                cursor: ${pos.cursor};
                z-index: 1001;
                left: ${pos.left};
                top: ${pos.top};
                ${pos.transform ? `transform: ${pos.transform};` : ''}
                display: none;
                pointer-events: auto;
            `;
            
            // Ajouter l'événement de redimensionnement
            this.addResizeEvent(handle, pos.corner);
            
            // Ajouter la poignée au canvas
            this.canvas.appendChild(handle);
            
            console.log(`🔧 Poignée créée: ${pos.corner}`);
        });
    }
    
    addResizeEvent(handle, corner) {
        let isResizing = false;
        let startX, startY, startWidth, startHeight;
        
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log(`🎯 Début redimensionnement: ${corner}`);
            
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = this.width;
            startHeight = this.height;
            
            document.body.style.cursor = handle.style.cursor;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newWidth = startWidth;
            let newHeight = startHeight;
            
            // Calculer la nouvelle taille selon le coin
            switch (corner) {
                case 'nw': // Coin supérieur gauche
                    newWidth = Math.max(100, Math.min(400, startWidth - deltaX));
                    newHeight = Math.max(80, Math.min(300, startHeight - deltaY));
                    break;
                case 'ne': // Coin supérieur droit
                    newWidth = Math.max(100, Math.min(400, startWidth + deltaX));
                    newHeight = Math.max(80, Math.min(300, startHeight - deltaY));
                    break;
                case 'sw': // Coin inférieur gauche
                    newWidth = Math.max(100, Math.min(400, startWidth - deltaX));
                    newHeight = Math.max(80, Math.min(300, startHeight + deltaY));
                    break;
                case 'se': // Coin inférieur droit
                    newWidth = Math.max(100, Math.min(400, startWidth + deltaX));
                    newHeight = Math.max(80, Math.min(300, startHeight + deltaY));
                    break;
            }
            
            console.log(`📏 Redimensionnement: ${newWidth}x${newHeight}`);
            
            // Redimensionner la mini-carte
            this.resize(newWidth, newHeight);
            
            // Afficher la taille en temps réel
            this.showResizeMessage(`${Math.round(newWidth)}x${Math.round(newHeight)}`);
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                console.log(`✅ Fin redimensionnement: ${corner}`);
                isResizing = false;
                document.body.style.cursor = '';
                
                // Masquer le message après un délai
                setTimeout(() => {
                    const message = document.getElementById('minimap-resize-message');
                    if (message) {
                        message.style.display = 'none';
                    }
                }, 1000);
            }
        });
    }
    
    showResizeHandles(show) {
        const handles = document.querySelectorAll('.minimap-resize-handle');
        console.log(`🔧 showResizeHandles(${show}) - ${handles.length} poignées trouvées`);
        
        handles.forEach((handle, index) => {
            handle.style.display = show ? 'block' : 'none';
            console.log(`🔧 Poignée ${index + 1}: display = ${handle.style.display}`);
        });
    }
    
    // Méthode de test pour forcer l'affichage des poignées
    forceShowHandles() {
        console.log('🔧 Forcer l\'affichage des poignées');
        this.showResizeHandles(true);
    }
    
    // Méthode de test pour redimensionner manuellement
    testResize() {
        console.log('🧪 Test de redimensionnement');
        this.resize(300, 200);
    }
    
    createControls() {
        // Créer le panneau de contrôles
        const controlsPanel = document.createElement('div');
        controlsPanel.id = 'minimap-controls';
        controlsPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #333;
            border-radius: 8px;
            padding: 15px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 2000;
            display: none;
        `;
        
        controlsPanel.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #4CAF50;">🎛️ Contrôles Mini-carte</h3>
            
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">Largeur: <span id="width-value">${this.width}</span>px</label>
                <input type="range" id="minimap-width" min="100" max="400" value="${this.width}" style="width: 150px;">
            </div>
            
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">Hauteur: <span id="height-value">${this.height}</span>px</label>
                <input type="range" id="minimap-height" min="80" max="300" value="${this.height}" style="width: 150px;">
            </div>
            
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">Position X: <span id="posx-value">${this.position.x}</span>px</label>
                <input type="range" id="minimap-posx" min="0" max="800" value="${this.position.x}" style="width: 150px;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">Position Y: <span id="posy-value">${this.position.y}</span>px</label>
                <input type="range" id="minimap-posy" min="0" max="600" value="${this.position.y}" style="width: 150px;">
            </div>
            
            <button id="reset-minimap" style="background: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Reset</button>
            <button id="close-controls" style="background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Fermer</button>
        `;
        
        document.body.appendChild(controlsPanel);
        
        // Ajouter les événements pour les contrôles
        this.initControlEvents();
    }
    
    initControlEvents() {
        const widthSlider = document.getElementById('minimap-width');
        const heightSlider = document.getElementById('minimap-height');
        const posXSlider = document.getElementById('minimap-posx');
        const posYSlider = document.getElementById('minimap-posy');
        const resetBtn = document.getElementById('reset-minimap');
        const closeBtn = document.getElementById('close-controls');
        
        // Largeur
        widthSlider.addEventListener('input', (e) => {
            const newWidth = parseInt(e.target.value);
            document.getElementById('width-value').textContent = newWidth;
            this.resize(newWidth, this.height);
        });
        
        // Hauteur
        heightSlider.addEventListener('input', (e) => {
            const newHeight = parseInt(e.target.value);
            document.getElementById('height-value').textContent = newHeight;
            this.resize(this.width, newHeight);
        });
        
        // Position X
        posXSlider.addEventListener('input', (e) => {
            const newX = parseInt(e.target.value);
            document.getElementById('posx-value').textContent = newX;
            this.position.x = newX;
            this.canvas.style.left = newX + 'px';
        });
        
        // Position Y
        posYSlider.addEventListener('input', (e) => {
            const newY = parseInt(e.target.value);
            document.getElementById('posy-value').textContent = newY;
            this.position.y = newY;
            this.canvas.style.top = newY + 'px';
        });
        
        // Reset
        resetBtn.addEventListener('click', () => {
            this.resetToDefault();
        });
        
        // Fermer
        closeBtn.addEventListener('click', () => {
            document.getElementById('minimap-controls').style.display = 'none';
        });
    }
    
    resetToDefault() {
        // Reset à la position par défaut
        this.resize(200, 150);
        this.updatePosition();
        
        // Mettre à jour les sliders
        document.getElementById('minimap-width').value = this.width;
        document.getElementById('minimap-height').value = this.height;
        document.getElementById('minimap-posx').value = this.position.x;
        document.getElementById('minimap-posy').value = this.position.y;
        
        document.getElementById('width-value').textContent = this.width;
        document.getElementById('height-value').textContent = this.height;
        document.getElementById('posx-value').textContent = this.position.x;
        document.getElementById('posy-value').textContent = this.position.y;
    }
    
    toggleControls() {
        const controls = document.getElementById('minimap-controls');
        if (controls) {
            controls.style.display = controls.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    updatePosition() {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            
            // POSITION MANUELLE - Modifie ces valeurs pour changer la position
            // Position en bas à droite, au-dessus de l'inventaire (par défaut)
            this.position.x = rect.width * 1.117 - this.width; // Même position horizontale que l'inventaire
            this.position.y = rect.height * 0.897 - this.height; // Juste au-dessus de l'inventaire
            
            // ALTERNATIVES - Décommente une de ces lignes pour changer la position :
            
            // Option 1: Coin supérieur droit
            // this.position.x = rect.width - this.width - 10;
            // this.position.y = 10;
            
            // Option 2: Coin inférieur gauche
            // this.position.x = 10;
            // this.position.y = rect.height - this.height - 10;
            
            // Option 3: Centre de l'écran
            // this.position.x = (rect.width - this.width) / 2;
            // this.position.y = (rect.height - this.height) / 2;
            
            // Option 4: Position fixe (en pixels)
            // this.position.x = 100; // 100px depuis la gauche
            // this.position.y = 100; // 100px depuis le haut
            
            this.canvas.style.left = this.position.x + 'px';
            this.canvas.style.top = this.position.y + 'px';
        }
    }
    
    // Méthode pour redimensionner la mini-carte
    resize(newWidth, newHeight) {
        this.width = newWidth;
        this.height = newHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Recréer les poignées de redimensionnement avec la nouvelle taille
        this.createResizeHandles();
        
        this.updatePosition();
    }
    
    initEvents() {
        // Clic pour centrer la vue
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Convertir vers les coordonnées du monde
            const worldX = x / this.scale;
            const worldY = y / this.scale;
            
            // Centrer la vue principale
            this.worldMapSystem.panX = worldX - this.worldMapSystem.canvas.width / 2;
            this.worldMapSystem.panY = worldY - this.worldMapSystem.canvas.height / 2;
            this.worldMapSystem.saveMapState();
        });
        
        // Zoom avec la molette de souris
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleWheel(e);
        });
        
        // Navigation dans la carte principale (au lieu de déplacer la mini-carte)
        this.canvas.addEventListener('mousedown', (e) => {
            // Vérifier si on clique sur une poignée
            const target = e.target;
            if (target.classList.contains('minimap-resize-handle')) {
                return; // Ne pas démarrer la navigation si on clique sur une poignée
            }
            
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;
                
                // Convertir le déplacement de la souris en déplacement dans la carte principale
                const worldDeltaX = deltaX / this.scale;
                const worldDeltaY = deltaY / this.scale;
                
                // Déplacer la vue principale dans la direction opposée
                this.worldMapSystem.panX -= worldDeltaX;
                this.worldMapSystem.panY -= worldDeltaY;
                this.worldMapSystem.saveMapState();
                
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        // Afficher les poignées de redimensionnement au survol
        this.canvas.addEventListener('mouseenter', () => {
            console.log('🖱️ Mouseenter - Afficher les poignées');
            this.showResizeHandles(true);
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            console.log('🖱️ Mouseleave - Masquer les poignées');
            // Vérifier si on est en train de redimensionner
            const isResizing = document.querySelector('.minimap-resize-handle:hover');
            if (!isResizing) {
                this.showResizeHandles(false);
            }
        });
        
        // Ajouter un événement pour forcer l'affichage des poignées
        this.canvas.addEventListener('dblclick', () => {
            console.log('🖱️ Double-clic - Forcer affichage des poignées');
            this.showResizeHandles(true);
        });
    }
    
    startRender() {
        const renderLoop = () => {
            this.render();
            requestAnimationFrame(renderLoop);
        };
        renderLoop();
    }
    
    render() {
        if (!this.ctx) return;
        
        // Recharger les quêtes pour avoir les données à jour
        if (this.worldMapSystem.loadAvailableQuests) {
            this.worldMapSystem.loadAvailableQuests();
        }
        
        // Effacer le canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Dessiner le fond
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Centrer la vue sur la map du joueur
        this.centerOnPlayerMap();
        
        // Dessiner les maps
        this.drawMaps();
        
        // Dessiner le joueur
        this.drawPlayer();
        
        // Dessiner les donjons
        this.drawDungeons();
        
        // Dessiner les quêtes
        this.drawQuests();
        
        // Dessiner le rectangle de vue
        this.drawViewport();
    }
    
    centerOnPlayerMap() {
        // Trouver la map où se trouve le joueur
        const playerMap = this.worldMapSystem.findPlayerMap();
        
        if (playerMap) {
            // Calculer le centre de la map du joueur
            const mapCenterX = playerMap.position.x + (playerMap.width * this.worldMapSystem.tileSize / 2);
            const mapCenterY = playerMap.position.y + (playerMap.height * this.worldMapSystem.tileSize / 2);
            
            // Calculer l'offset pour centrer la mini-carte sur cette map
            this.centerOffsetX = (this.width / 2) - (mapCenterX * this.scale);
            this.centerOffsetY = (this.height / 2) - (mapCenterY * this.scale);
        }
    }
    
    handleWheel(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoomAt(mouseX, mouseY, zoomFactor);
    }
    
    handleResizeWheel(e) {
        const resizeFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newWidth = Math.max(100, Math.min(400, this.width * resizeFactor));
        const newHeight = Math.max(80, Math.min(300, this.height * resizeFactor));
        
        this.resize(newWidth, newHeight);
        
        // Afficher un message temporaire
        this.showResizeMessage(`${Math.round(newWidth)}x${Math.round(newHeight)}`);
    }
    
    showResizeMessage(size) {
        // Créer ou mettre à jour le message de redimensionnement
        let message = document.getElementById('minimap-resize-message');
        if (!message) {
            message = document.createElement('div');
            message.id = 'minimap-resize-message';
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                font-family: Arial, sans-serif;
                font-size: 16px;
                z-index: 3000;
                pointer-events: none;
            `;
            document.body.appendChild(message);
        }
        
        message.textContent = `Mini-carte: ${size}px`;
        message.style.display = 'block';
        
        // Masquer le message après 2 secondes
        setTimeout(() => {
            message.style.display = 'none';
        }, 2000);
    }
    
    showInstructions() {
        const instructions = `
🎮 Contrôles Mini-carte:
• Clic: Centrer la vue sur le point cliqué
• Clic-déplacement: Naviguer dans la carte principale
• Molette: Zoomer/dézoomer la vue
• Glisser les coins: Redimensionner la mini-carte
• Clic droit sur l'icône ➕: Ouvrir les contrôles avancés
        `;
        
        console.log(instructions);
        
        // Afficher aussi un message visuel
        let message = document.getElementById('minimap-instructions');
        if (!message) {
            message = document.createElement('div');
            message.id = 'minimap-instructions';
            message.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 15px;
                border-radius: 8px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                z-index: 3000;
                max-width: 300px;
                line-height: 1.4;
            `;
            document.body.appendChild(message);
        }
        
        message.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #4CAF50;">🎮 Contrôles Mini-carte</h3>
            <div style="margin-bottom: 5px;">• <strong>Clic:</strong> Centrer la vue</div>
            <div style="margin-bottom: 5px;">• <strong>Clic-déplacement:</strong> Naviguer</div>
            <div style="margin-bottom: 5px;">• <strong>Molette:</strong> Zoomer/dézoomer</div>
            <div style="margin-bottom: 5px;">• <strong>Glisser les coins:</strong> Redimensionner</div>
            <div style="margin-bottom: 10px;">• <strong>Clic droit ➕:</strong> Contrôles avancés</div>
            <button onclick="this.parentElement.style.display='none'" style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">OK</button>
        `;
        message.style.display = 'block';
    }
    
    zoomAt(x, y, factor) {
        const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * factor));
        
        if (newScale !== this.scale) {
            const zoomRatio = newScale / this.scale;
            
            // Ajuster l'offset pour zoomer vers le point de la souris
            this.centerOffsetX = x - (x - this.centerOffsetX) * zoomRatio;
            this.centerOffsetY = y - (y - this.centerOffsetY) * zoomRatio;
            
            this.scale = newScale;
        }
    }
    
    drawMaps() {
        this.worldMapSystem.maps.forEach(map => {
            // Récupérer l'image depuis le cache du système principal
            const mapImage = this.worldMapSystem.mapImages.get(map.name);
            
            if (mapImage && mapImage.complete) {
                // Position de la map dans la mini-carte avec offset de centrage
                const mapX = (map.position.x * this.scale) + this.centerOffsetX;
                const mapY = (map.position.y * this.scale) + this.centerOffsetY;
                const mapWidth = map.width * this.worldMapSystem.tileSize * this.scale;
                const mapHeight = map.height * this.worldMapSystem.tileSize * this.scale;
                
                // Dessiner la map
                this.ctx.drawImage(mapImage, mapX, mapY, mapWidth, mapHeight);
                
                // Bordure de la map
                this.ctx.strokeStyle = '#666';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);
            } else {
                // Fallback : dessiner un rectangle coloré si l'image n'est pas chargée
                const mapX = (map.position.x * this.scale) + this.centerOffsetX;
                const mapY = (map.position.y * this.scale) + this.centerOffsetY;
                const mapWidth = map.width * this.worldMapSystem.tileSize * this.scale;
                const mapHeight = map.height * this.worldMapSystem.tileSize * this.scale;
                
                // Rectangle coloré comme fallback
                this.ctx.fillStyle = '#444';
                this.ctx.fillRect(mapX, mapY, mapWidth, mapHeight);
                
                // Bordure de la map
                this.ctx.strokeStyle = '#666';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);
            }
        });
    }
    
    drawPlayer() {
        // Trouver la map du joueur
        const playerMap = this.worldMapSystem.findPlayerMap();
        
        if (playerMap) {
            // Calculer la position absolue du joueur (même logique que dans map-system.js)
            const absoluteX = playerMap.position.x + this.worldMapSystem.playerPosition.x * this.worldMapSystem.tileSize;
            const absoluteY = playerMap.position.y + this.worldMapSystem.playerPosition.y * this.worldMapSystem.tileSize;
            
            const playerX = (absoluteX * this.scale) + this.centerOffsetX;
            const playerY = (absoluteY * this.scale) + this.centerOffsetY;
            
            // Gros point rouge pour le joueur (adapté au zoom)
            const playerRadius = Math.max(6, 10 * this.scale);
            
            this.ctx.fillStyle = '#ff0000';
            this.ctx.beginPath();
            this.ctx.arc(playerX, playerY, playerRadius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Bordure blanche pour le rendre plus visible
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
    
    drawDungeons() {
        this.worldMapSystem.dungeons.forEach(dungeon => {
            const dungeonX = (dungeon.x * this.scale) + this.centerOffsetX;
            const dungeonY = (dungeon.y * this.scale) + this.centerOffsetY;
            
            // Point bleu pour les donjons (adapté au zoom)
            const dungeonRadius = Math.max(3, 5 * this.scale);
            
            this.ctx.fillStyle = '#0066ff';
            this.ctx.beginPath();
            this.ctx.arc(dungeonX, dungeonY, dungeonRadius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Bordure pour les rendre plus visibles
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }
    
    drawQuests() {
        this.worldMapSystem.availableQuests.forEach(quest => {
            // Trouver la map correspondante à cette quête
            const questMap = this.worldMapSystem.maps.find(map => map.name === quest.mapName);
            
            if (questMap) {
                // Calculer le centre de la map (même logique que dans map-system.js)
                const mapCenterX = questMap.position.x + (questMap.width * this.worldMapSystem.tileSize) / 2;
                const mapCenterY = questMap.position.y + (questMap.height * this.worldMapSystem.tileSize) / 2;
                
                const questX = (mapCenterX * this.scale) + this.centerOffsetX;
                const questY = (mapCenterY * this.scale) + this.centerOffsetY;
                
                // Point plus grand pour les quêtes (adapté au zoom)
                const questRadius = Math.max(6, 10 * this.scale);
                
                // Effet de clignotement pour les quêtes à valider
                let shouldBlink = false;
                if (quest.type === 'validation') {
                    shouldBlink = Math.floor(Date.now() / 500) % 2 === 0;
                }
                
                // Choisir la couleur selon le type de quête
                if (quest.type === 'validation') {
                    // Cercle orange pour les quêtes à valider
                    this.ctx.fillStyle = shouldBlink ? '#f97316' : 'rgba(249, 115, 22, 0.7)';
                } else {
                    // Cercle vert pour les quêtes disponibles
                    this.ctx.fillStyle = '#22c55e';
                }
                
                this.ctx.beginPath();
                this.ctx.arc(questX, questY, questRadius, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Bordure blanche plus épaisse
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = Math.max(2, 3 * this.scale);
                this.ctx.stroke();
                
                // Ajouter l'icône de quête centrée
                this.ctx.font = `${Math.max(12, 16 * this.scale)}px Arial`;
                this.ctx.fillStyle = shouldBlink ? '#ffffff' : 'rgba(255, 255, 255, 0.9)';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('❗', questX, questY);
            }
        });
    }
    
    drawViewport() {
        // Trouver la map où se trouve le joueur
        const playerMap = this.worldMapSystem.findPlayerMap();
        
        if (playerMap) {
            // Calculer la position de la map du joueur dans la mini-carte
            const mapX = (playerMap.position.x * this.scale) + this.centerOffsetX;
            const mapY = (playerMap.position.y * this.scale) + this.centerOffsetY;
            const mapWidth = playerMap.width * this.worldMapSystem.tileSize * this.scale;
            const mapHeight = playerMap.height * this.worldMapSystem.tileSize * this.scale;
            
            // Rectangle blanc pour encadrer la map où se trouve le joueur
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);
            
            // Optionnel : ajouter un fond semi-transparent pour mieux voir la map active
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(mapX, mapY, mapWidth, mapHeight);
        }
    }
} 

// Fonctions globales pour modifier la taille de la mini-carte
window.setMinimapSize = function(width, height) {
    window.MINIMAP_WIDTH = width;
    window.MINIMAP_HEIGHT = height;
    
    if (window.worldMapSystem && window.worldMapSystem.minimap) {
        window.worldMapSystem.minimap.resize(width, height);
    }
};

window.getMinimapSize = function() {
    return {
        width: window.MINIMAP_WIDTH,
        height: window.MINIMAP_HEIGHT
    };
};

// Fonctions de test pour déboguer le redimensionnement
window.testMinimapResize = function() {
    if (window.worldMapSystem && window.worldMapSystem.minimap) {
        window.worldMapSystem.minimap.testResize();
    }
};

window.showMinimapHandles = function() {
    if (window.worldMapSystem && window.worldMapSystem.minimap) {
        window.worldMapSystem.minimap.forceShowHandles();
    }
};

window.debugMinimap = function() {
    console.log('🔍 Debug Mini-carte:');
    console.log('- Système:', window.worldMapSystem);
    console.log('- Mini-carte:', window.worldMapSystem?.minimap);
    console.log('- Canvas:', window.worldMapSystem?.minimap?.canvas);
    console.log('- Poignées:', document.querySelectorAll('.minimap-resize-handle').length);
    console.log('- Taille actuelle:', window.getMinimapSize());
};

// Exemple d'utilisation :
// window.setMinimapSize(300, 200); // Pour une mini-carte plus grande
// window.setMinimapSize(150, 100); // Pour une mini-carte plus petite
// window.testMinimapResize(); // Test de redimensionnement
// window.showMinimapHandles(); // Forcer l'affichage des poignées
// window.debugMinimap(); // Debug complet 
console.log("Fichier js/map.js chargé");

// Constante globale pour la taille des tuiles
window.TILE_SIZE = 32;

// Variables pour activer/désactiver les grilles de debug
window.debugGridEnabled = false; // Désactivé par défaut
window.debugGridLayer1Enabled = false;
window.debugGridLayer3Enabled = false;

// Fonction pour charger une map
async function loadMap(mapName) {
    try {
        console.log(`Chargement de la map: ${mapName}`);
        const response = await fetch(`assets/maps/${mapName}.json`);
        if (!response.ok) {
            throw new Error(`Fichier ${mapName}.json introuvable !`);
        }
        
        const json = await response.json();
        if (!json || typeof json !== "object" || !json.layers) {
            throw new Error(`Le JSON de ${mapName} est mal formé !`);
        }
        
        window.mapData = json;
        window.currentMap = mapName;
        
        // Charger les tilesets de la nouvelle map
        await loadTilesets(json.tilesets);
        
        // Mettre à jour les collisions basées sur le calque 2
        if (typeof window.updateBlockedGids === "function") {
            window.updateBlockedGids();
        }
        
        console.log(`Map ${mapName} chargée avec succès !`);
        return true;
    } catch (error) {
        console.error(`Erreur lors du chargement de ${mapName}:`, error);
        return false;
    }
}

// Fonction pour téléporter le joueur vers une nouvelle map
function teleportPlayer(mapName, spawnX, spawnY) {
    console.log(`Téléportation vers ${mapName} à la position (${spawnX}, ${spawnY})`);
    
    // Libérer l'ancienne position
    if (typeof release === "function") {
        release(player.x, player.y);
    }
    
    // Charger la nouvelle map
    loadMap(mapName).then(success => {
        if (success) {
            // Téléporter le joueur
            player.x = spawnX;
            player.y = spawnY;
            player.px = spawnX * TILE_SIZE;
            player.py = spawnY * TILE_SIZE;
            player.spawnX = spawnX;
            player.spawnY = spawnY;
            
            // Réinitialiser l'état
            player.moving = false;
            player.path = [];
            player.moveTarget = { x: spawnX, y: spawnY };
            
            // Nettoyer les cibles de combat
            if (attackTarget) {
                attackTarget.aggro = false;
                attackTarget.aggroTarget = null;
            }
            attackTarget = null;
            window.attackTarget = null;
            player.inCombat = false;
            
            // Marquer la nouvelle position comme occupée
            if (typeof occupy === "function") {
                occupy(player.x, player.y);
            }
            
            // Réinitialiser les monstres pour la nouvelle map
            if (typeof initMonsters === "function") {
                initMonsters();
            }
            
            console.log(`Joueur téléporté vers ${mapName} !`);
            
            // Sauvegarde automatique lors du changement de map
            if (typeof autoSaveOnEvent === 'function') {
                autoSaveOnEvent();
            }
        }
    });
}

// Rendre les fonctions accessibles globalement
window.loadMap = loadMap;
window.teleportPlayer = teleportPlayer;

function initMap() {
    console.log("Initialisation de la carte...");
    if (!window.mapData) {
        console.error("mapData n'est pas disponible pour initMap");
        return;
    }
    
    // Initialiser les fonctions de collision si elles existent
    if (typeof initCollision === "function") {
        initCollision();
    }
    
    console.log("Carte initialisée avec succès");
    console.log("Nombre de calques détectés:", window.mapData.layers.length);
}

function drawGameGrid() {
    if (!window.mapData) return;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; // Blanc plus visible (30% d'opacité)
    ctx.lineWidth = 1;
    
    // Dessiner les lignes verticales
    for (let x = 0; x <= window.mapData.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE, 0);
        ctx.lineTo(x * TILE_SIZE, window.mapData.height * TILE_SIZE);
        ctx.stroke();
    }
    
    // Dessiner les lignes horizontales
    for (let y = 0; y <= window.mapData.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * TILE_SIZE);
        ctx.lineTo(window.mapData.width * TILE_SIZE, y * TILE_SIZE);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawDebugGrid() {
    if (!window.debugGridEnabled || !window.mapData) return;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.font = '10px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    
    // Trouver le calque 2 par son ID
    const layer2 = window.mapData.layers.find(layer => layer.id === 2);
    if (!layer2) return;
    
    // Dessiner la grille et les IDs du calque 2
    for (let y = 0; y < window.mapData.height; y++) {
        for (let x = 0; x < window.mapData.width; x++) {
            const idx = y * window.mapData.width + x;
            const gid = layer2.data[idx];
            
            // Dessiner la grille
            ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            
            // Afficher l'ID de la tuile
            if (gid !== 0) {
                ctx.fillText(gid.toString(), x * TILE_SIZE + 2, y * TILE_SIZE + 12);
            }
        }
    }
    
    ctx.restore();
}

function drawDebugGridLayer1() {
    if (!window.debugGridLayer1Enabled || !window.mapData) return;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)'; // Vert pour calque 1
    ctx.lineWidth = 1;
    ctx.font = '10px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    
    // Trouver le calque 1 par son ID
    const layer1 = window.mapData.layers.find(layer => layer.id === 1);
    if (!layer1) return;
    
    // Dessiner la grille et les IDs du calque 1
    for (let y = 0; y < window.mapData.height; y++) {
        for (let x = 0; x < window.mapData.width; x++) {
            const idx = y * window.mapData.width + x;
            const gid = layer1.data[idx];
            
            // Dessiner la grille
            ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            
            // Afficher l'ID de la tuile
            if (gid !== 0) {
                ctx.fillText(gid.toString(), x * TILE_SIZE + 2, y * TILE_SIZE + 12);
            }
        }
    }
    
    ctx.restore();
}

function drawDebugGridLayer3() {
    if (!window.debugGridLayer3Enabled || !window.mapData) return;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)'; // Bleu pour calque 3
    ctx.lineWidth = 1;
    ctx.font = '10px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    
    // Trouver le calque 3 par son ID
    const layer3 = window.mapData.layers.find(layer => layer.id === 3);
    if (!layer3) return;
    
    // Dessiner la grille et les IDs du calque 3
    for (let y = 0; y < window.mapData.height; y++) {
        for (let x = 0; x < window.mapData.width; x++) {
            const idx = y * window.mapData.width + x;
            const gid = layer3.data[idx];
            
            // Dessiner la grille
            ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            
            // Afficher l'ID de la tuile
            if (gid !== 0) {
                ctx.fillText(gid.toString(), x * TILE_SIZE + 2, y * TILE_SIZE + 12);
            }
        }
    }
    
    ctx.restore();
}

function toggleDebugGrid() {
    window.debugGridEnabled = !window.debugGridEnabled;
    console.log("Grille de debug calque 2 " + (window.debugGridEnabled ? "activée" : "désactivée"));
}

function toggleDebugGridLayer1() {
    window.debugGridLayer1Enabled = !window.debugGridLayer1Enabled;
    console.log("Grille de debug calque 1 " + (window.debugGridLayer1Enabled ? "activée" : "désactivée"));
}

function toggleDebugGridLayer3() {
    window.debugGridLayer3Enabled = !window.debugGridLayer3Enabled;
    console.log("Grille de debug calque 3 " + (window.debugGridLayer3Enabled ? "activée" : "désactivée"));
}

function drawMap() {
    if (!window.mapData) {
        console.log("drawMap appelé sans mapData !");
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner les calques 1, 2 et 4 en premier (sol, collisions et décors)
    for (let layerIndex = 0; layerIndex < window.mapData.layers.length; layerIndex++) {
        let layer = window.mapData.layers[layerIndex];
        
        // Ignorer les calques invisibles
        if (!layer.visible) continue;
        
        // Ignorer le calque 3 (ID=3) - on le dessinera après le joueur et les monstres
        if (layer.id === 3) continue;
        
        for (let y = 0; y < window.mapData.height; y++) {
            for (let x = 0; x < window.mapData.width; x++) {
                let i = y * window.mapData.width + x;
                let gid = layer.data[i];
                if (gid === 0) continue;
                let ts = getTilesetForGid(gid);
                if (!ts) {
                    console.warn(`GID ${gid} non trouvé dans les tilesets disponibles`);
                    continue;
                }

                let localId = gid - ts.firstgid;
                let sx = (localId % ts.columns) * ts.tilewidth;
                let sy = Math.floor(localId / ts.columns) * ts.tileheight;

                // Vérifier que l'image est bien chargée avant de l'utiliser
                if (ts.image && ts.image.complete && ts.image.naturalWidth !== 0) {
                    ctx.drawImage(
                        ts.image,
                        sx, sy, ts.tilewidth, ts.tileheight,
                        x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE
                    );
                } else {
                    console.warn(`Image non chargée pour le tileset: ${ts.image ? ts.image.src : 'undefined'}`);
                }
            }
        }
    }

    // Dessiner la grille de jeu discrète
    drawGameGrid();

    // Dessiner le joueur
    drawPlayer(ctx);
    
    // Afficher les bulles de dialogue du joueur
    if (typeof drawPlayerBubbles === "function") {
        drawPlayerBubbles(ctx);
    }

    // Affiche les monstres animés AVANT le calque 3 (pour qu'ils passent derrière)
    if (typeof drawMonsters === "function") {
        drawMonsters(ctx);
    }
    
    // Dessiner les effets de dégâts et flashs de sprite
    if (typeof drawDamageEffects === "function") {
        drawDamageEffects(ctx);
    }
    
    // Maintenant dessiner le calque 3 (arbres) au-dessus du joueur ET des monstres
    const layer3 = window.mapData.layers.find(layer => layer.id === 3);
    if (layer3 && layer3.visible) {
        for (let y = 0; y < window.mapData.height; y++) {
            for (let x = 0; x < window.mapData.width; x++) {
                let i = y * window.mapData.width + x;
                let gid = layer3.data[i];
                if (gid === 0) continue;
                let ts = getTilesetForGid(gid);
                if (!ts) continue;

                let localId = gid - ts.firstgid;
                let sx = (localId % ts.columns) * ts.tilewidth;
                let sy = Math.floor(localId / ts.columns) * ts.tileheight;

                // Vérifier si le joueur ou un monstre est à cette position
                let isPlayerHere = (player.x === x && player.y === y);
                let isMonsterHere = false;
                
                // Vérifier si un monstre est à cette position
                if (window.monsters && window.monsters.length > 0) {
                    isMonsterHere = window.monsters.some(monster => 
                        monster.x === x && monster.y === y && monster.hp > 0 && !monster.isDead
                    );
                }
                
                // Appliquer la transparence si le joueur ou un monstre est ici
                if (isPlayerHere || isMonsterHere) {
                    ctx.save();
                    ctx.globalAlpha = 0.4; // 40% d'opacité pour voir le joueur/monstre à travers
                }

                // Vérifier que l'image est bien chargée avant de l'utiliser
                if (ts.image && ts.image.complete && ts.image.naturalWidth !== 0) {
                    ctx.drawImage(
                        ts.image,
                        sx, sy, ts.tilewidth, ts.tileheight,
                        x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE
                    );
                } else {
                    console.warn(`Image non chargée pour le tileset (calque 3): ${ts.image ? ts.image.src : 'undefined'}`);
                }
                
                // Restaurer l'opacité si elle a été modifiée
                if (isPlayerHere || isMonsterHere) {
                    ctx.restore();
                }
            }
        }
    }
    
    // Dessiner les grilles de debug si activées
    drawDebugGrid();
    drawDebugGridLayer1();
    drawDebugGridLayer3();
    
    // Dessiner les indicateurs de téléportation
    drawTeleportationIndicators();
    
    // Fondu noir si le joueur est mort
    if (player.isDead) {
        const currentTime = Date.now();
        const elapsed = currentTime - player.deathTime;
        const progress = Math.min(1, elapsed / player.respawnTime);
        
        ctx.save();
        ctx.globalAlpha = progress;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
}

// Fonction pour dessiner les indicateurs de téléportation
function drawTeleportationIndicators() {
    if (!window.mapData || !window.mapData.layers || window.mapData.layers.length === 0) return;
    
    const layer1 = window.mapData.layers[0];
    const tileSize = window.TILE_SIZE || 32;
    
    ctx.save();
    ctx.globalAlpha = 0.7;
    
    for (let y = 0; y < layer1.height; y++) {
        for (let x = 0; x < layer1.width; x++) {
            const tileIndex = y * layer1.width + x;
            const tileId = layer1.data[tileIndex];
            
            if (tileId === 0) { // Tile "next"
                // Aucun rectangle ni texte, juste la tuile de la map
            } else if (tileId === 1) { // Portail de téléportation (nouvelle image)
                // Aucun rectangle ni texte, juste la tuile de la map
            }
        }
    }
    
    ctx.restore();
}


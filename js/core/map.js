// Système de gestion des maps - Core
// Nettoyé et validé le 30/07/2025 - par Cursor

// Constante globale pour la taille des tuiles
window.TILE_SIZE = 32;

// Variables pour activer/désactiver les grilles de debug
window.debugGridEnabled = false; // Désactivé par défaut
window.debugGridLayer1Enabled = false;
window.debugGridLayer2Enabled = false; // Debug des collisions
window.debugGridLayer3Enabled = false;

// Variable pour l'écran noir de transition
window.blackScreenStartTime = null;
window.blackScreenDuration = 250; // 250ms
window.blackScreenTimeout = null; // Timeout de sécurité pour Vercel

// Variables pour le centrage de la map
window.mapOffsetX = 0;
window.mapOffsetY = 0;

// Fonction pour calculer les offsets de centrage de la map
function calculateMapCentering() {
    if (!window.mapData || !window.mapData.width || !window.mapData.height) {
        window.mapOffsetX = 0;
        window.mapOffsetY = 0;
        return;
    }
    
    const mapWidth = window.mapData.width * TILE_SIZE;
    const mapHeight = window.mapData.height * TILE_SIZE;
    
    // Centrer les maps donjon slime spécifiquement
    if (window.currentMap === "mapdonjonslime" || window.currentMap === "mapdonjonslime2" || window.currentMap === "mapdonjonslimeboss") {
        window.mapOffsetX = Math.max(0, (canvas.width - mapWidth) / 2);
        window.mapOffsetY = Math.max(0, (canvas.height - mapHeight) / 2);
    } else if (window.currentMap === "maison") {
        // Centrage spécial pour la maison - plus bas
        window.mapOffsetX = Math.max(0, (canvas.width - mapWidth) / 2);
        window.mapOffsetY = Math.max(0, (canvas.height - mapHeight) / 2) + 25; // 25px plus bas
    } else {
        // Pour les autres maps, pas de centrage
        window.mapOffsetX = 0;
        window.mapOffsetY = 0;
    }
}

// Fonction pour charger une map
async function loadMap(mapName) {
    try {
        // ÉTAPE 1: Nettoyage complet des collisions de l'ancienne map
        console.log("Nettoyage des collisions avant changement de map");
        if (typeof window.forceCleanCollisions === "function") {
            window.forceCleanCollisions();
        } else {
            window.BLOCKED_GIDS = []; // Fallback si la fonction n'existe pas encore
        }
        
        const response = await fetch(`assets/maps/${mapName}.json`);
        if (!response.ok) {
            throw new Error(`Fichier ${mapName}.json introuvable !`);
        }
        
        const json = await response.json();
        if (!json || typeof json !== "object" || !json.layers) {
            throw new Error(`Le JSON de ${mapName} est mal formé !`);
        }
        
        // ÉTAPE 2: Mettre à jour les données de map
        window.mapData = json;
        window.currentMap = mapName;
        console.log(`Chargement de la map: ${mapName}`);
        
        // ÉTAPE 4: Gérer les respawns de ressources en attente pour cette map
        if (typeof window.gererRespawnLorsRetourMap === "function") {
            window.gererRespawnLorsRetourMap();
        }
        
        // Déclencher le fondu au noir pour la transition de map
        startBlackScreenTransition();
        
        // Calculer le centrage de la map
        calculateMapCentering();
        
        // Plus de nettoyage des données de monstres - système supprimé
        
        // Charger les tilesets de la nouvelle map
        await loadTilesets(json.tilesets);
        
        // ÉTAPE 3: Mettre à jour les collisions basées sur le calque 2
        console.log("Mise à jour des collisions pour la nouvelle map");
        if (typeof window.updateBlockedGids === "function") {
            window.updateBlockedGids();
            
            // Vérification d'intégrité après mise à jour
            setTimeout(() => {
                if (typeof window.checkCollisionIntegrity === "function") {
                    window.checkCollisionIntegrity();
                }
            }, 100);
        } else {
            console.warn("Fonction updateBlockedGids non disponible");
        }
        
        // Réinitialiser les monstres après le chargement de la map
        if (typeof window.initMonsters === "function") {
            window.initMonsters();
        }
        
        // Charger les monstres pour cette map
        if (typeof loadMonstersForMap === "function") {
            const monstersLoaded = loadMonstersForMap(mapName);
            if (!monstersLoaded) {
                if (typeof initMonsters === "function") {
                    initMonsters();
                }
            }
            
            // Forcer la réassignation des images des monstres
            if (typeof window.assignMonsterImages === "function") {
                window.assignMonsterImages();
            }
            
            // Forcer une deuxième réassignation après un délai pour s'assurer que les images sont chargées
            setTimeout(() => {
                if (typeof window.assignMonsterImages === "function") {
                    window.assignMonsterImages();
                }
            }, 500);
        }
        
        // Nettoyage spécial pour mapdonjonslimeboss - supprimer tous les slimes existants
        if (mapName === "mapdonjonslimeboss" && typeof window.forceCleanSlimesOnBossMap === "function") {
            // Nettoyage immédiat
            window.forceCleanSlimesOnBossMap();
            // Nettoyage après un délai pour s'assurer que tout est chargé
            setTimeout(() => {
                window.forceCleanSlimesOnBossMap();
            }, 500);
            // Nettoyage après l'initialisation des monstres
            setTimeout(() => {
                window.forceCleanSlimesOnBossMap();
            }, 1000);
        }
        
        // Initialiser les PNJ pour cette map
        if (typeof window.initPNJs === "function") {
            window.initPNJs();
        }
        
        // Vérifier la progression du donjon après le chargement de la map
        if (typeof window.checkDungeonProgressionOnMapLoad === "function") {
            window.checkDungeonProgressionOnMapLoad();
        }
        
        // Charger les ressources récoltables pour cette map
        if (typeof window.loadMapResources === "function") {
            window.loadMapResources(mapName);
        }
        
        // Nettoyage spécial pour mapdonjonslimeboss - supprimer tous les slimes existants
        if (mapName === "mapdonjonslimeboss" && typeof window.forceCleanSlimesOnBossMap === "function") {
            // Nettoyage immédiat
            window.forceCleanSlimesOnBossMap();
            // Nettoyage après un délai pour s'assurer que tout est chargé
            setTimeout(() => {
                window.forceCleanSlimesOnBossMap();
            }, 500);
        }
        
        // Sauvegarder les monstres après un délai pour s'assurer qu'ils sont créés
        
        // Sauvegarder les monstres après un délai pour s'assurer qu'ils sont créés
        setTimeout(() => {
            if (typeof window.saveMonstersForMap === "function") {
                window.saveMonstersForMap(mapName);
            }
        }, 250);
        
        return true;
    } catch (error) {
        return false;
    }
}

// Fonction pour téléporter le joueur vers une nouvelle map
function teleportPlayer(mapName, spawnX, spawnY) {
    // ÉTAPE 1: Nettoyage préventif des collisions
    console.log(`Téléportation de ${window.currentMap} vers ${mapName}`);
    if (typeof window.forceCleanCollisions === "function") {
        window.forceCleanCollisions();
    }
    
    // Sauvegarder les monstres de la map actuelle avant de partir
    if (typeof window.saveMonstersForMap === "function" && window.currentMap) {
        window.saveMonstersForMap(window.currentMap);
    }
    
    // Libérer l'ancienne position
    if (typeof release === "function") {
        release(player.x, player.y);
    }
    
    // Notifier le système multijoueur du changement de carte
    if (window.multiplayerManager && window.multiplayerManager.connected) {
        window.multiplayerManager.changeMap(mapName);
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
            
            // Les monstres sont maintenant initialisés automatiquement dans loadMap()
            
            // Sauvegarde automatique lors du changement de map
            if (typeof autoSaveOnEvent === 'function') {
                autoSaveOnEvent();
            }
            
            // Rafraîchir l'affichage des quêtes si la fenêtre est ouverte
            if (typeof refreshQuestsOnPlayerMove === 'function') {
                refreshQuestsOnPlayerMove();
            }
        }
    });
}

// Rendre les fonctions accessibles globalement
window.loadMap = loadMap;
window.teleportPlayer = teleportPlayer;
window.clearBlackScreen = clearBlackScreen;
window.startBlackScreenTransition = startBlackScreenTransition;

// Fonction d'urgence pour nettoyer l'écran noir (à appeler manuellement si nécessaire)
window.emergencyClearBlackScreen = function() {
    clearBlackScreen();
    // Forcer un redessinage
    if (typeof drawMap === "function") {
        drawMap();
    }
};


function initMap() {
    if (!window.mapData) {
        return;
    }
    
    // Initialiser les fonctions de collision si elles existent
    if (typeof initCollision === "function") {
        initCollision();
    }
}

function drawGameGrid() {
    if (!window.debugGridEnabled || !window.mapData) return;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Dessiner la grille avec les offsets de centrage
    for (let x = 0; x <= window.mapData.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE + window.mapOffsetX, window.mapOffsetY);
        ctx.lineTo(x * TILE_SIZE + window.mapOffsetX, window.mapData.height * TILE_SIZE + window.mapOffsetY);
        ctx.stroke();
    }
    
    for (let y = 0; y <= window.mapData.height; y++) {
        ctx.beginPath();
        ctx.moveTo(window.mapOffsetX, y * TILE_SIZE + window.mapOffsetY);
        ctx.lineTo(window.mapData.width * TILE_SIZE + window.mapOffsetX, y * TILE_SIZE + window.mapOffsetY);
        ctx.stroke();
    }
}

function drawDebugGrid() {
    if (!window.debugGridEnabled || !window.mapData) return;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Rouge pour la grille de debug
    ctx.lineWidth = 1;
    
    // Dessiner la grille de debug avec les offsets de centrage
    for (let x = 0; x <= window.mapData.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE + window.mapOffsetX, window.mapOffsetY);
        ctx.lineTo(x * TILE_SIZE + window.mapOffsetX, window.mapData.height * TILE_SIZE + window.mapOffsetY);
        ctx.stroke();
    }
    
    for (let y = 0; y <= window.mapData.height; y++) {
        ctx.beginPath();
        ctx.moveTo(window.mapOffsetX, y * TILE_SIZE + window.mapOffsetY);
        ctx.lineTo(window.mapData.width * TILE_SIZE + window.mapOffsetX, y * TILE_SIZE + window.mapOffsetY);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawDebugGridLayer1() {
    if (!window.debugGridLayer1Enabled || !window.mapData) return;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)'; // Vert pour le calque 1
    ctx.lineWidth = 1;
    ctx.font = '10px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    
    // Trouver le calque 1 par son ID
    const layer1 = window.mapData.layers.find(layer => layer.id === 1);
    if (!layer1) return;
    
    // Dessiner la grille et les IDs du calque 1 avec les offsets de centrage
    for (let y = 0; y < window.mapData.height; y++) {
        for (let x = 0; x < window.mapData.width; x++) {
            const idx = y * window.mapData.width + x;
            const gid = layer1.data[idx];
            
            // Dessiner la grille avec les offsets
            ctx.strokeRect(x * TILE_SIZE + window.mapOffsetX, y * TILE_SIZE + window.mapOffsetY, TILE_SIZE, TILE_SIZE);
            
            // Afficher l'ID de la tuile
            if (gid !== 0) {
                ctx.fillText(gid.toString(), x * TILE_SIZE + window.mapOffsetX + 2, y * TILE_SIZE + window.mapOffsetY + 12);
            }
        }
    }
    
    ctx.restore();
}

function drawDebugGridLayer2() {
    if (!window.debugGridLayer2Enabled || !window.mapData) return;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)'; // Rouge pour les collisions
    ctx.lineWidth = 2;
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    
    // Trouver le calque 2 par son ID
    const layer2 = window.mapData.layers.find(layer => layer.id === 2);
    if (!layer2) return;
    
    // Dessiner la grille et les IDs du calque 2 avec les offsets de centrage
    for (let y = 0; y < window.mapData.height; y++) {
        for (let x = 0; x < window.mapData.width; x++) {
            const idx = y * window.mapData.width + x;
            const gid = layer2.data[idx];
            
            // Dessiner la grille avec les offsets
            ctx.strokeRect(x * TILE_SIZE + window.mapOffsetX, y * TILE_SIZE + window.mapOffsetY, TILE_SIZE, TILE_SIZE);
            
            // Afficher l'ID de la tuile (seulement si collision)
            if (gid !== 0) {
                ctx.fillText(gid.toString(), x * TILE_SIZE + window.mapOffsetX + 2, y * TILE_SIZE + window.mapOffsetY + 12);
                // Remplir la case en rouge pour bien voir les collisions
                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.fillRect(x * TILE_SIZE + window.mapOffsetX, y * TILE_SIZE + window.mapOffsetY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = 'red';
            }
        }
    }
    
    ctx.restore();
}

function drawDebugGridLayer3() {
    if (!window.debugGridLayer3Enabled || !window.mapData) return;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)'; // Bleu pour le calque 3
    ctx.lineWidth = 1;
    ctx.font = '10px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    
    // Trouver le calque 3 par son ID
    const layer3 = window.mapData.layers.find(layer => layer.id === 3);
    if (!layer3) return;
    
    // Dessiner la grille et les IDs du calque 3 avec les offsets de centrage
    for (let y = 0; y < window.mapData.height; y++) {
        for (let x = 0; x < window.mapData.width; x++) {
            const idx = y * window.mapData.width + x;
            const gid = layer3.data[idx];
            
            // Dessiner la grille avec les offsets
            ctx.strokeRect(x * TILE_SIZE + window.mapOffsetX, y * TILE_SIZE + window.mapOffsetY, TILE_SIZE, TILE_SIZE);
            
            // Afficher l'ID de la tuile
            if (gid !== 0) {
                ctx.fillText(gid.toString(), x * TILE_SIZE + window.mapOffsetX + 2, y * TILE_SIZE + window.mapOffsetY + 12);
            }
        }
    }
    
    ctx.restore();
}

// Nouvelle fonction pour afficher les coordonnées de chaque tile
function drawTileCoordinates() {
    if (!window.debugTileCoordinatesEnabled || !window.mapData) return;
    
    ctx.save();
    ctx.font = '8px Arial';
    ctx.fillStyle = 'yellow';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    
    // Dessiner les coordonnées de chaque tile
    for (let y = 0; y < window.mapData.height; y++) {
        for (let x = 0; x < window.mapData.width; x++) {
            const screenX = x * TILE_SIZE + window.mapOffsetX;
            const screenY = y * TILE_SIZE + window.mapOffsetY;
            
            // Dessiner un petit rectangle de fond pour la lisibilité
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(screenX + 2, screenY + 2, 30, 12);
            
            // Afficher les coordonnées
            ctx.fillStyle = 'yellow';
            ctx.fillText(`${x},${y}`, screenX + 4, screenY + 11);
        }
    }
    
    ctx.restore();
}

function toggleDebugGrid() {
    window.debugGridEnabled = !window.debugGridEnabled;
}

function toggleDebugGridLayer1() {
    window.debugGridLayer1Enabled = !window.debugGridLayer1Enabled;
}

function toggleDebugGridLayer2() {
    window.debugGridLayer2Enabled = !window.debugGridLayer2Enabled;
}

function toggleDebugGridLayer3() {
    window.debugGridLayer3Enabled = !window.debugGridLayer3Enabled;
}

function toggleTileCoordinates() {
    window.debugTileCoordinatesEnabled = !window.debugTileCoordinatesEnabled;
}

function drawMap() {
    if (!window.mapData) {
        return;
    }
    
    // Vérifier si on doit afficher l'écran noir de transition
    if (window.blackScreenStartTime) {
        const currentTime = Date.now();
        const elapsed = currentTime - window.blackScreenStartTime;
        
        if (elapsed < window.blackScreenDuration) {
            // Afficher l'écran noir de transition
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            return; // Ne pas dessiner la map pendant l'écran noir
        } else {
            // Fin de l'écran noir, nettoyer
            clearBlackScreen();
        }
    }
    
    // Nettoyage robuste du canvas avec reset des transformations
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset complet des transformations
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
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
                    continue;
                }

                let localId = gid - ts.firstgid;
                let sx = (localId % ts.columns) * ts.tilewidth;
                let sy = Math.floor(localId / ts.columns) * ts.tileheight;

                // Vérifier que l'image est bien chargée avant de l'utiliser
                if (ts.image && ts.image.complete && ts.image.naturalWidth !== 0) {
                    // Appliquer les effets visuels pour les ressources d'alchimiste
                    if (window.appliquerEffetsVisuelsRessources) {
                        window.appliquerEffetsVisuelsRessources(ctx, x, y, gid);
                    }
                    
                    ctx.drawImage(
                        ts.image,
                        sx, sy, ts.tilewidth, ts.tileheight,
                        x * TILE_SIZE + window.mapOffsetX, y * TILE_SIZE + window.mapOffsetY, TILE_SIZE, TILE_SIZE
                    );
                    
                    // Réinitialiser les effets visuels
                    ctx.globalAlpha = 1.0;
                    ctx.filter = 'none';
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
    
    if (typeof drawPNJs === "function") {
        drawPNJs(ctx);
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
                    // Appliquer les effets visuels pour les ressources d'alchimiste
                    if (window.appliquerEffetsVisuelsRessources) {
                        window.appliquerEffetsVisuelsRessources(ctx, x, y, gid);
                    }
                    
                    ctx.drawImage(
                        ts.image,
                        sx, sy, ts.tilewidth, ts.tileheight,
                        x * TILE_SIZE + window.mapOffsetX, y * TILE_SIZE + window.mapOffsetY, TILE_SIZE, TILE_SIZE
                    );
                    
                    // Réinitialiser les effets visuels
                    ctx.globalAlpha = 1.0;
                    ctx.filter = 'none';
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
    drawDebugGridLayer2(); // Debug des collisions
    drawDebugGridLayer3();
    drawTileCoordinates(); // Afficher les coordonnées des tiles
    drawForbiddenSpawnZone(); // Afficher la zone interdite de spawn
    
    // Dessiner les informations de debug des collisions
    drawCollisionDebugInfo();
    
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

// Fonction pour afficher les informations de debug des collisions
function drawCollisionDebugInfo() {
    if (!window.debugGridLayer2Enabled) return;
    
    ctx.save();
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    // Position du joueur
    const playerX = Math.floor(player.x);
    const playerY = Math.floor(player.y);
    const playerScreenX = player.px + window.mapOffsetX;
    const playerScreenY = player.py + window.mapOffsetY;
    
    // Informations du joueur
    ctx.fillText(`Joueur: (${playerX}, ${playerY})`, 10, 30);
    
    // Vérifier les collisions autour du joueur
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const checkX = playerX + dx;
            const checkY = playerY + dy;
            const isBlocked = window.isBlocked ? window.isBlocked(checkX, checkY) : false;
            
            if (isBlocked) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.fillRect(
                    checkX * TILE_SIZE + window.mapOffsetX, 
                    checkY * TILE_SIZE + window.mapOffsetY, 
                    TILE_SIZE, TILE_SIZE
                );
                ctx.fillStyle = 'red';
                ctx.fillText(`X`, checkX * TILE_SIZE + window.mapOffsetX + 12, checkY * TILE_SIZE + window.mapOffsetY + 20);
            }
        }
    }
    
    // Afficher les GIDs bloquants
    ctx.fillText(`GIDs bloquants: ${window.BLOCKED_GIDS ? window.BLOCKED_GIDS.join(', ') : 'Aucun'}`, 10, 50);
    
    ctx.restore();
}

// Fonctions globales pour le debug
window.toggleCollisionDebug = function() {
    window.debugGridLayer2Enabled = !window.debugGridLayer2Enabled;
};

window.showPlayerPosition = function() {
    if (player) {
        // Debug des collisions activé
    }
};

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

// Fonction pour nettoyer l'écran noir de transition
function clearBlackScreen() {
    window.blackScreenStartTime = null;
    window.blackScreenDuration = 250;
    if (window.blackScreenTimeout) {
        clearTimeout(window.blackScreenTimeout);
        window.blackScreenTimeout = null;
    }
}

// Fonction pour démarrer l'écran noir de transition avec timeout de sécurité
function startBlackScreenTransition() {
    window.blackScreenStartTime = Date.now();
    
    // Timeout de sécurité pour Vercel - nettoyer après 2 secondes max
    window.blackScreenTimeout = setTimeout(() => {
        clearBlackScreen();
    }, 2000);
}

// Fonction globale pour activer/désactiver l'affichage des coordonnées
window.toggleTileCoordinates = toggleTileCoordinates;

// Fonction pour afficher la zone interdite de spawn sur mapdonjonslime2
function drawForbiddenSpawnZone() {
    if (!window.debugForbiddenSpawnZoneEnabled || !window.mapData || window.currentMap !== "mapdonjonslime2") return;
    
    ctx.save();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Rouge semi-transparent
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    
    // Zone interdite: x=11-13, y=0-8
    const zoneX = 11 * TILE_SIZE + window.mapOffsetX;
    const zoneY = 0 * TILE_SIZE + window.mapOffsetY;
    const zoneWidth = 3 * TILE_SIZE;
    const zoneHeight = 9 * TILE_SIZE;
    
    // Dessiner le rectangle de la zone interdite
    ctx.fillRect(zoneX, zoneY, zoneWidth, zoneHeight);
    ctx.strokeRect(zoneX, zoneY, zoneWidth, zoneHeight);
    
    // Ajouter du texte
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.font = 'bold 12px Arial';
    ctx.fillText('ZONE INTERDITE', zoneX + 5, zoneY + 20);
    
    ctx.restore();
}

// Fonction pour activer/désactiver l'affichage de la zone interdite
function toggleForbiddenSpawnZone() {
    window.debugForbiddenSpawnZoneEnabled = !window.debugForbiddenSpawnZoneEnabled;
}

// Export global
window.toggleForbiddenSpawnZone = toggleForbiddenSpawnZone;

// Fonction de diagnostic pour détecter les problèmes de calques
function diagnoseCanvasLayers() {
    // Diagnostic des calques de map
}

// Fonction de nettoyage forcé du canvas
function forceClearCanvas() {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        // Canvas nettoyé
    }
}

// Export global
window.diagnoseCanvasLayers = diagnoseCanvasLayers;
window.forceClearCanvas = forceClearCanvas;

// Fonction de nettoyage d'urgence pour le voile sombre
function emergencyClearMapLayers() {
    // Nettoyage d'urgence des calques de map
    
    // Forcer un nettoyage complet du canvas
    forceClearCanvas();
    
    // Nettoyer les variables de map
    if (window.blackScreenStartTime) {
        clearBlackScreen();
    }
    
    // Forcer un redessinage complet
    if (typeof drawMap === "function") {
        drawMap();
    }
    
    // Nettoyer aussi les effets de dégâts si nécessaire
    if (typeof window.emergencyClearDamageEffects === "function") {
        window.emergencyClearDamageEffects();
    }
}

// Export global
window.emergencyClearMapLayers = emergencyClearMapLayers;


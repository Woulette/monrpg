// Gestionnaire d'événements pour les interactions du joueur
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    
    // Gestionnaire de clic simple (sélection)
    canvas.addEventListener('click', function(e) {
        e.preventDefault(); // Empêcher le comportement par défaut
        
        const rect = canvas.getBoundingClientRect();
        // Correction : prendre en compte le ratio de redimensionnement du canvas et les offsets de centrage
        const mx = (e.clientX - rect.left) * (canvas.width / rect.width) - (window.mapOffsetX || 0);
        const my = (e.clientY - rect.top) * (canvas.height / rect.height) - (window.mapOffsetY || 0);
        
        // Vérifier si le clic est sur la croix de fermeture de la fiche du monstre
        if (window.monsterInfoCloseBox && window.attackTarget) {
            const {x, y, w, h} = window.monsterInfoCloseBox;
            if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
                window.attackTarget = null;
                attackTarget = null;
                return; // Arrêter ici, ne pas traiter le clic comme un déplacement
            }
        }

        const nx = Math.floor(mx / TILE_SIZE);
        const ny = Math.floor(my / TILE_SIZE);

        // Recherche d'un monstre vivant avec zone de clic élargie
        // Priorité au monstre survolé si il existe
        let clickedMonster = null;
        if (window.hoveredMonster && window.hoveredMonster.hp > 0 && !window.hoveredMonster.isDead) {
            clickedMonster = window.hoveredMonster;
        } else {
            clickedMonster = findMonsterInRadius(mx, my, 35);
        }

        if (clickedMonster) {
            // SÉLECTION PASSIVE - Ne rien faire au monstre
            // Le monstre continue exactement ce qu'il était en train de faire
            
            // Sélectionner le monstre (clic simple) - PAS de déplacement automatique
            attackTarget = clickedMonster;
            window.attackTarget = attackTarget;
            player.autoFollow = false; // Désactiver le suivi automatique pour le clic simple
            
            return;
        }

        // Sinon, déplacement classique vers la case cliquée
        // Vérifier d'abord si c'est une tile de téléportation (calque 4)
        if (window.mapData && window.mapData.layers && window.mapData.layers.length > 3) {
            const layer4 = window.mapData.layers[3]; // Calque 4
            const tileIndex = ny * layer4.width + nx;
            const tileId = layer4.data[tileIndex];
            
            // Permettre de cliquer sur les tiles de téléportation (IDs 1, 2, 3, 4, 5, 6)
            if ([1, 2, 3, 4, 5, 6].includes(tileId)) {
                // Retirer seulement l'encadrement rouge, pas la fiche
                if (attackTarget) {
                    attackTarget.aggro = false;
                    attackTarget.aggroTarget = null;
                    player.inCombat = false;
                }
                
                // Désactiver le suivi automatique
                player.autoFollow = false;
                
                // Créer un chemin vers la tile de téléportation (clic direct autorisé)
                if (typeof findPath === "function" && window.mapData) {
                    player.path = findPath(
                        { x: player.x, y: player.y },
                        { x: nx, y: ny },
                        window.isBlocked,
                        mapData.width, mapData.height
                    ) || [];
                    nextStepToTarget();
                }
                return;
            }
        }
        
        // Vérifier si c'est une table de craft (calques 2 et 4)
        if (window.mapData && window.mapData.layers && window.mapData.layers.length > 3) {
            const layer2 = window.mapData.layers[1]; // Calque 2
            const layer4 = window.mapData.layers[3]; // Calque 4
            
            const tileIndex2 = ny * layer2.width + nx;
            const tileIndex4 = ny * layer4.width + nx;
            const tileId2 = layer2.data[tileIndex2];
            const tileId4 = layer4.data[tileIndex4];
            // Mannequins d'entraînement (calque 2 IDs 29806, 29606)
            if ([29806, 29606].includes(tileId2)) {
                // Aller se placer adjacent, puis ouvrir la modale d'entraînement
                handleCraftTableClick(nx, ny, 'mannequin_force');
                return;
            }
            
            // Établie du tailleur (IDs 412, 413, 612, 613)
            if ([412, 413, 612, 613].includes(tileId2) || [412, 413, 612, 613].includes(tileId4)) {
                handleCraftTableClick(nx, ny, 'tailleur');
                return;
            }
            
            // Établie du cordonnier (IDs 614, 615, 814, 815)
            if ([614, 615, 814, 815].includes(tileId2) || [614, 615, 814, 815].includes(tileId4)) {
                handleCraftTableClick(nx, ny, 'cordonnier');
                return;
            }
            
            // Coffre du SlimeBoss (ID 25206 sur calque 2)
            if (tileId2 === 25206 && window.currentMap === "mapdonjonslimeboss") {
                handleBossChestClick(nx, ny);
                return;
            }
            
            // Coffre de la maison (ID 25206 sur calque 2)
            if (tileId2 === 25206 && window.currentMap === "maison") {
                handleHouseChestClick(nx, ny);
                return;
            }
            
            // Debug: Log tous les clics sur calque 2 dans la maison
            if (window.currentMap === "maison" && tileId2 !== 0) {
                // console.log("🔍 Debug - Clic sur calque 2 maison:", {x: nx, y: ny, tileId: tileId2});
            }
            
            // Établie du bijoutier (IDs 616, 617, 816, 817)
            if ([616, 617, 816, 817].includes(tileId2) || [616, 617, 816, 817].includes(tileId4)) {
                handleCraftTableClick(nx, ny, 'bijoutier');
                return;
            }
            
            // Table du tailleur (ancienne logique + nouveaux IDs)
            if ([156, 157].includes(tileId2) || [156, 157].includes(tileId4)) {
                handleCraftTableClick(nx, ny, 'tailleur');
                return;
            }
            
            // Table du cordonnier (nouveaux IDs)
            if ([204, 205, 206, 207].includes(tileId2) || [204, 205, 206, 207].includes(tileId4)) {
                handleCraftTableClick(nx, ny, 'cordonnier');
                return;
            }
            
            // Table du bijoutier (nouveaux IDs)
            if ([160, 161, 208, 209].includes(tileId2) || [160, 161, 208, 209].includes(tileId4)) {
                handleCraftTableClick(nx, ny, 'bijoutier');
                return;
            }
            
            // Atelier tailleur sur 108, 109 (déplacement + ouverture à l'arrivée)
            if ([108, 109].includes(tileId2) || [108, 109].includes(tileId4)) {
                handleCraftTableClick(nx, ny, 'tailleur');
                return;
            }
            
            // Atelier cordonnier sur 158, 159 (déplacement + ouverture à l'arrivée)
            if ([158, 159].includes(tileId2) || [158, 159].includes(tileId4)) {
                handleCraftTableClick(nx, ny, 'cordonnier');
                return;
            }
            
            // Chaudron d'alchimiste sur 22805 (déplacement + ouverture à l'arrivée)
            if (tileId2 === 22805 && window.currentMap === "map4") {
                handleCraftTableClick(nx, ny, 'alchimiste');
                return;
            }

            // Four du paysan (IDs 24402 ou 24202 sur calques 2 ou 4) → ouverture atelier paysan
            if ([24402, 24202].includes(tileId2) || [24402, 24202].includes(tileId4)) {
                handleCraftTableClick(nx, ny, 'paysan');
                return;
            }
            
            // Ressources d'alchimiste (ID 25 calque 4)
            if (tileId4 === 25 && (window.currentMap === "map1" || window.currentMap === "map6")) {
                if (window.gererClicRessourceAlchimiste) {
                    const resultat = window.gererClicRessourceAlchimiste(nx, ny);
                    if (resultat) {
                        return; // Arrêter le traitement si la récolte a été démarrée
                    }
                }
            }

            // Blé du paysan sur map5: file d'attente de coupe gérée par ressource-paysan.js
            if (window.currentMap === 'map5') {
                // On déclenche la coupe si le blé est en état poussé (layer 6 visible à cette case)
                if (typeof window.cutWheat === 'function') {
                    const layerGrown = window.mapData.layers.find(l => l.id === 6);
                    if (layerGrown) {
                        const idx = ny * layerGrown.width + nx;
                        // Vérifier GID exact 425 pour ne couper qu'une seule tuile ciblée
                        const isWheatHere = layerGrown.visible && layerGrown.data[idx] === 425;
                        if (isWheatHere) {
                            // Marquer la tuile comme "interagie" pour activer l'effet visuel seulement après clic
                            if (typeof window.markWheatInteracted === 'function') {
                                window.markWheatInteracted(nx, ny);
                            }
                            // Ajouter en file d'attente. Le système gère le déplacement et la coupe séquentielle.
                            if (typeof window.enqueueWheatHarvest === 'function') {
                                window.enqueueWheatHarvest(nx, ny);
                                return;
                            } else {
                                window.cutWheat(nx, ny);
                                return;
                            }
                        }
                    }
                }
            }
        }
        
        // Sinon, déplacement classique vers la case cliquée
        // Si une file de blé est en cours, l'annuler sur clic ailleurs
        if (typeof window.cancelWheatQueueAndHarvest === 'function') {
            // Cliquer ailleurs qu'un blé annule la file
            const layerGrown = window.mapData.layers.find(l => l.id === 6);
            const isWheat = layerGrown && layerGrown.visible && layerGrown.data[ny * layerGrown.width + nx] === 425;
            if (!isWheat) window.cancelWheatQueueAndHarvest();
        }
        handleMovementClick(nx, ny);
    });
    
    // Gestionnaire de double-clic (attaque directe)
    canvas.addEventListener('dblclick', function(e) {
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (canvas.width / rect.width) - (window.mapOffsetX || 0);
        const my = (e.clientY - rect.top) * (canvas.height / rect.height) - (window.mapOffsetY || 0);

        const nx = Math.floor(mx / TILE_SIZE);
        const ny = Math.floor(my / TILE_SIZE);

        // Recherche d'un monstre vivant avec zone de clic élargie
        // Priorité au monstre survolé si il existe
        let clickedMonster = null;
        if (window.hoveredMonster && window.hoveredMonster.hp > 0 && !window.hoveredMonster.isDead) {
            clickedMonster = window.hoveredMonster;
        } else {
            clickedMonster = findMonsterInRadius(mx, my, 35);
        }

        if (clickedMonster) {
            // SÉLECTION PASSIVE - Ne rien faire au monstre
            // Le monstre continue exactement ce qu'il était en train de faire
            
            // Sélectionner le monstre et activer le suivi automatique pour l'attaque
            attackTarget = clickedMonster;
            window.attackTarget = attackTarget;
            
            // Adapter le comportement selon la classe du joueur
            if (window.classSpellManager && typeof window.classSpellManager.getCurrentAttackRange === 'function') {
                const currentAttackRange = window.classSpellManager.getCurrentAttackRange();
                
                // Pour les classes à distance (comme Mage), ne pas activer autoFollow
                if (currentAttackRange > 1) {
                    player.autoFollow = false;
                    console.log(`🎯 Double-clic: Attaque à distance (portée: ${currentAttackRange}) - autoFollow désactivé`);
                } else {
                    // Pour les classes au corps à corps (comme Aventurier)
                    player.autoFollow = true;
                    console.log(`⚔️ Double-clic: Attaque au corps à corps - autoFollow activé`);
                }
            } else {
                // Fallback si le gestionnaire de classe n'est pas disponible
                player.autoFollow = true;
            }
            
            // Créer un chemin vers le monstre et attaquer dès qu'on est à portée
            if (typeof findPath === "function" && window.mapData) {
                // Obtenir la portée d'attaque actuelle
                let targetDistance = 1; // Distance par défaut (corps à corps)
                if (window.classSpellManager && typeof window.classSpellManager.getCurrentAttackRange === 'function') {
                    targetDistance = window.classSpellManager.getCurrentAttackRange();
                }
                
                // Calculer la position cible selon la portée
                let destinations = [];
                if (targetDistance === 1) {
                    // Corps à corps : positions adjacentes
                    destinations = [
                        {x: clickedMonster.x+1, y: clickedMonster.y},
                        {x: clickedMonster.x-1, y: clickedMonster.y},
                        {x: clickedMonster.x, y: clickedMonster.y+1},
                        {x: clickedMonster.x, y: clickedMonster.y-1},
                    ];
                } else {
                    // Distance : position à la portée exacte
                    const dx = clickedMonster.x - player.x;
                    const dy = clickedMonster.y - player.y;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance > targetDistance) {
                        // Calculer la position à la portée exacte
                        const angle = Math.atan2(dy, dx);
                        const targetX = Math.round(clickedMonster.x - Math.cos(angle) * targetDistance);
                        const targetY = Math.round(clickedMonster.y - Math.sin(angle) * targetDistance);
                        
                        destinations = [{x: targetX, y: targetY}];
                    } else {
                        // Déjà à portée, pas besoin de se déplacer
                        destinations = [];
                    }
                }
                
                destinations = destinations.filter(pos =>
                    pos.x >= 0 && pos.x < mapData.width &&
                    pos.y >= 0 && pos.y < mapData.height &&
                    !window.isBlocked(pos.x, pos.y) &&
                    !monsters.some(m => m.x === pos.x && m.y === pos.y && m.hp > 0)
                );
                
                if (destinations.length) {
                    let closestDestination = destinations[0];
                    let closestDistance = Math.abs(destinations[0].x - player.x) + Math.abs(destinations[0].y - player.y);
                    
                    for (let i = 1; i < destinations.length; i++) {
                        const distance = Math.abs(destinations[i].x - player.x) + Math.abs(destinations[i].y - player.y);
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestDestination = destinations[i];
                        }
                    }
                    
                    const isBlockedWithPortals = (x, y) => {
                        if (window.isBlocked(x, y)) return true;
                        // Vérifier s'il y a un monstre vivant à cette position
                        if (monsters.some(monster => monster.x === x && monster.y === y && monster.hp > 0 && !monster.isDead)) {
                            return true;
                        }
                        if (window.mapData && window.mapData.layers && window.mapData.layers.length > 3) {
                            const layer4 = window.mapData.layers[3];
                            const tileIndex = y * layer4.width + x;
                            const tileId = layer4.data[tileIndex];
                            if ([1, 2, 3, 4, 5, 6].includes(tileId)) return true;
                        }
                        return false;
                    };
                    
                    player.path = findPath(
                        { x: player.x, y: player.y },
                        closestDestination,
                        isBlockedWithPortals,
                        mapData.width, mapData.height
                    ) || [];
                    nextStepToTarget();
                }
            }
        }
    });
    
    // Gestionnaires d'événements de souris pour le hover et la zone de clic élargie
    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (canvas.width / rect.width) - (window.mapOffsetX || 0);
        const my = (e.clientY - rect.top) * (canvas.height / rect.height) - (window.mapOffsetY || 0);
        
        // Détecter quel monstre est survolé avec une zone élargie
        // Zone de hover plus grande pour une meilleure détection
        window.hoveredMonster = findMonsterInRadius(mx, my, 30);
    });
    
    canvas.addEventListener('mouseleave', function(e) {
        // Effacer le hover quand la souris quitte le canvas
        window.hoveredMonster = null;
    });
    
    // Gestionnaire de touches pour les interactions
    document.addEventListener('keydown', function(e) {
        // Touche E pour interagir avec les PNJ
        if (e.key === 'e' || e.key === 'E') {
            if (typeof handlePNJInteraction === "function") {
                handlePNJInteraction(e.key);
            }
            
            // Touche E pour interagir avec les mentors
            if (typeof window.handleMentorInteraction === "function") {
                window.handleMentorInteraction(e.key);
            }
        }
        
        // Touche espace pour attaquer le monstre sélectionné
        if (e.code === 'Space') {
            // Si le chat est ouvert ou si on est dans un champ de saisie, ne pas intercepter l'espace
            try {
                const chatCont = document.getElementById('chat-container');
                const chatOpen = chatCont && !chatCont.classList.contains('chat-hidden') && chatCont.style.display !== 'none';
                const isChatInput = e.target && e.target.classList && e.target.classList.contains('chat-input');
                const isTyping = isChatInput || (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable));
                if (chatOpen || isTyping) {
                    return; // laisser le chat gérer l'espace
                }
            } catch(_) {}
            e.preventDefault(); // Empêcher le défilement de la page
            handleSpaceAttack();
        }
    });
});

// Fonction pour gérer le clic sur le coffre du boss
function handleBossChestClick(nx, ny) {
    // Vérifier si le SlimeBoss a été vaincu
    if (!window.slimeBossDefeated) {
        // Afficher un message d'erreur
        if (typeof window.showMessage === "function") {
            window.showMessage("Vous devez d'abord vaincre le SlimeBoss pour ouvrir ce coffre !", "error");
        }
        return;
    }
    
    // Vérifier si le joueur est assez proche du coffre
    const distance = Math.sqrt((player.x - nx) ** 2 + (player.y - ny) ** 2);
    if (distance > 2) {
        // Créer un chemin vers le coffre (éviter les portails)
        if (typeof findPath === "function" && window.mapData) {
            const isBlockedWithPortals = (x, y) => {
                if (window.isBlocked(x, y)) return true;
                // Vérifier s'il y a un monstre vivant à cette position
                if (monsters.some(monster => monster.x === x && monster.y === y && monster.hp > 0 && !monster.isDead)) {
                    return true;
                }
                if (window.mapData && window.mapData.layers && window.mapData.layers.length > 3) {
                    const layer4 = window.mapData.layers[3];
                    const tileIndex = y * layer4.width + x;
                    const tileId = layer4.data[tileIndex];
                    if ([1, 2, 3, 4, 5, 6].includes(tileId)) return true;
                }
                return false;
            };
            
            player.path = findPath(
                { x: player.x, y: player.y },
                { x: nx, y: ny },
                isBlockedWithPortals,
                mapData.width, mapData.height
            ) || [];
            nextStepToTarget();
        }
        return;
    }
    
    // Ouvrir le coffre
    if (typeof window.openBossChest === "function") {
        window.openBossChest();
    }
}

// Fonction pour gérer le clic sur le coffre de la maison
function handleHouseChestClick(nx, ny) {
    // Vérifier si la quête slimeBossFinal est terminée
    if (typeof window.quests !== 'undefined' && window.quests.slimeBossFinal) {
        
        if (!window.quests.slimeBossFinal.completed) {
            // Afficher un message d'erreur
            if (typeof window.showMessage === "function") {
                window.showMessage("Vous devez d'abord valider la quête finale auprès de Papi4 pour ouvrir ce coffre !", "error");
            }
            return;
        }
    } else {
        // Si les quêtes ne sont pas chargées, empêcher l'ouverture
        if (typeof window.showMessage === "function") {
            window.showMessage("Vous devez d'abord valider la quête finale auprès de Papi4 pour ouvrir ce coffre !", "error");
        }
        return;
    }
    
    // Vérifier si le joueur est assez proche du coffre
    const distance = Math.sqrt((player.x - nx) ** 2 + (player.y - ny) ** 2);
    
    if (distance > 2) {
        
        // Chercher une case adjacente libre au coffre
        const adjacents = [
            {x: nx+1, y: ny},
            {x: nx-1, y: ny},
            {x: nx, y: ny+1},
            {x: nx, y: ny-1}
        ].filter(pos =>
            pos.x >= 0 && pos.x < window.mapData.width &&
            pos.y >= 0 && pos.y < window.mapData.height &&
            !window.isBlocked(pos.x, pos.y)
        );
        
        if (adjacents.length) {
            // Aller à la case adjacente la plus proche du joueur
            let closest = adjacents[0];
            let minDist = Math.abs(player.x - closest.x) + Math.abs(player.y - closest.y);
            for (let i = 1; i < adjacents.length; i++) {
                const d = Math.abs(player.x - adjacents[i].x) + Math.abs(player.y - adjacents[i].y);
                if (d < minDist) {
                    minDist = d;
                    closest = adjacents[i];
                }
            }
            
            // Créer un chemin vers la case adjacente
            if (typeof findPath === "function" && window.mapData) {
                const isBlockedWithPortals = (x, y) => {
                    if (window.isBlocked(x, y)) return true;
                    // Vérifier s'il y a un monstre vivant à cette position
                    if (monsters.some(monster => monster.x === x && monster.y === y && monster.hp > 0 && !monster.isDead)) {
                        return true;
                    }
                    if (window.mapData && window.mapData.layers && window.mapData.layers.length > 3) {
                        const layer4 = window.mapData.layers[3];
                        const tileIndex = y * layer4.width + x;
                        const tileId = layer4.data[tileIndex];
                        if ([1, 2, 3, 4, 5, 6].includes(tileId)) return true;
                    }
                    return false;
                };
                
                player.path = findPath(
                    { x: player.x, y: player.y },
                    { x: closest.x, y: closest.y },
                    isBlockedWithPortals,
                    mapData.width, mapData.height
                ) || [];
                nextStepToTarget();
            }
        }
        return;
    }
    
    // Ouvrir le coffre
    if (typeof window.openHouseChest === "function") {
        window.openHouseChest();
    } else {
        // console.log("❌ window.openHouseChest n'est pas une fonction !");
    }
}

// Fonction pour gérer les clics sur les tables de craft
function handleCraftTableClick(nx, ny, type) {
    // Cas spécifique mannequin: viser la case "devant" (une case sous le mannequin)
    if (type === 'mannequin_force') {
        const target = { x: nx, y: ny + 1 };
        if (
            target.x >= 0 && target.y >= 0 &&
            window.mapData && target.x < window.mapData.width && target.y < window.mapData.height &&
            !window.isBlocked(target.x, target.y)
        ) {
            window.pendingOpenCraftTable = { x: nx, y: ny, type };
            if (typeof findPath === "function" && window.mapData) {
                const isBlockedWithPortals = (x, y) => {
                    if (window.isBlocked(x, y)) return true;
                    if (monsters.some(monster => monster.x === x && monster.y === y && monster.hp > 0 && !monster.isDead)) return true;
                    if (window.mapData && window.mapData.layers && window.mapData.layers.length > 3) {
                        const layer4 = window.mapData.layers[3];
                        const tileIndex = y * layer4.width + x;
                        const tileId = layer4.data[tileIndex];
                        if ([1, 2, 3, 4, 5, 6].includes(tileId)) return true;
                    }
                    return false;
                };
                player.path = findPath(
                    { x: player.x, y: player.y },
                    target,
                    isBlockedWithPortals,
                    mapData.width, mapData.height
                ) || [];
                nextStepToTarget();
                return;
            }
        }
        // Si la case devant est invalide, on retombera sur le comportement générique ci-dessous
    }
    // Chercher une case adjacente libre à la table
    const adjacents = [
        {x: nx+1, y: ny},
        {x: nx-1, y: ny},
        {x: nx, y: ny+1},
        {x: nx, y: ny-1}
    ].filter(pos =>
        pos.x >= 0 && pos.x < window.mapData.width &&
        pos.y >= 0 && pos.y < window.mapData.height &&
        !window.isBlocked(pos.x, pos.y)
    );
    
    if (adjacents.length) {
        // Aller à la case adjacente la plus proche du joueur
        let closest = adjacents[0];
        let minDist = Math.abs(player.x - closest.x) + Math.abs(player.y - closest.y);
        for (let i = 1; i < adjacents.length; i++) {
            const d = Math.abs(player.x - adjacents[i].x) + Math.abs(player.y - adjacents[i].y);
            if (d < minDist) {
                minDist = d;
                closest = adjacents[i];
            }
        }
        window.pendingOpenCraftTable = {x: nx, y: ny, type: type};
        if (typeof findPath === "function" && window.mapData) {
            const isBlockedWithPortals = (x, y) => {
                if (window.isBlocked(x, y)) return true;
                // Vérifier s'il y a un monstre vivant à cette position
                if (monsters.some(monster => monster.x === x && monster.y === y && monster.hp > 0 && !monster.isDead)) {
                    return true;
                }
                if (window.mapData && window.mapData.layers && window.mapData.layers.length > 3) {
                    const layer4 = window.mapData.layers[3];
                    const tileIndex = y * layer4.width + x;
                    const tileId = layer4.data[tileIndex];
                    if ([1, 2, 3, 4, 5, 6].includes(tileId)) return true;
                }
                return false;
            };
            
            player.path = findPath(
                { x: player.x, y: player.y },
                { x: closest.x, y: closest.y },
                isBlockedWithPortals,
                mapData.width, mapData.height
            ) || [];
            nextStepToTarget();
        }
    }
}

// Fonction pour gérer les clics de mouvement
function handleMovementClick(nx, ny) {
    // Retirer seulement l'encadrement rouge, pas la fiche
    if (attackTarget) {
        attackTarget.aggro = false;
        attackTarget.aggroTarget = null;
        // Ne pas supprimer attackTarget pour garder la fiche ouverte
        player.inCombat = false;
    }
    
    // Désactiver le suivi automatique quand on clique sur une case vide
    player.autoFollow = false;
    
    // Si la case cliquée est bloquée, trouver la case accessible la plus proche
    let targetX = nx;
    let targetY = ny;
    
    if (window.isBlocked(nx, ny)) {
        // Chercher la case accessible la plus proche dans un rayon croissant
        let found = false;
        let radius = 1;
        const maxRadius = 10; // Limite pour éviter une recherche infinie
        
        while (!found && radius <= maxRadius) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    // Vérifier seulement les cases sur le bord du carré actuel
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const testX = nx + dx;
                        const testY = ny + dy;
                        
                        // Vérifier les limites de la map
                        if (testX >= 0 && testX < window.mapData.width && 
                            testY >= 0 && testY < window.mapData.height) {
                            
                            // Vérifier si la case est accessible (pas de collision ET pas de monstre vivant)
                            if (!window.isBlocked(testX, testY) && !monsters.some(monster => monster.x === testX && monster.y === testY && monster.hp > 0 && !monster.isDead)) {
                                targetX = testX;
                                targetY = testY;
                                found = true;
                                break;
                            }
                        }
                    }
                }
                if (found) break;
            }
            radius++;
        }
        
        // Si aucune case accessible n'est trouvée, ne rien faire
        if (!found) {
            return;
        }
    }
    
    if (typeof findPath === "function" && window.mapData) {
        // Créer une fonction de collision qui inclut les monstres et évite les portails
        const isBlockedWithMonsters = (x, y) => {
            // Vérifier les collisions du calque 2
            if (window.isBlocked(x, y)) {
                return true;
            }
            // Vérifier s'il y a un monstre vivant à cette position
            const monsterAtPosition = monsters.find(monster => monster.x === x && monster.y === y && monster.hp > 0 && !monster.isDead);
            if (monsterAtPosition) {
                return true;
            }
            // Vérifier si c'est un portail du calque 4 (éviter les portails)
            if (window.mapData && window.mapData.layers && window.mapData.layers.length > 3) {
                const layer4 = window.mapData.layers[3];
                const tileIndex = y * layer4.width + x;
                const tileId = layer4.data[tileIndex];
                if ([1, 2, 3, 4, 5, 6].includes(tileId)) {
                    return true;
                }
            }
            return false;
        };
        
        player.path = findPath(
            { x: player.x, y: player.y },
            { x: targetX, y: targetY },
            isBlockedWithMonsters,
            mapData.width, mapData.height
        ) || [];
        nextStepToTarget();
    }
}

// Fonction pour gérer l'attaque avec la touche espace
function handleSpaceAttack() {
    // Vérifier si un monstre est sélectionné et vivant
    if (attackTarget && attackTarget.hp > 0) {
        // Activer le suivi automatique quand on appuie sur espace
        player.autoFollow = true;
        // Vérifier si le joueur est à portée d'attaque
        const dist = Math.abs(player.x - attackTarget.x) + Math.abs(player.y - attackTarget.y);
        if (dist === PLAYER_ATTACK_RANGE) {
            // Attaquer le monstre
            const currentTime = Date.now();
            if (!player.lastAttack || currentTime - player.lastAttack > 1000) {
                player.lastAttack = currentTime;
                
                // Utiliser l'attaque de base unique (punch.js)
                if (typeof window.castBaseAttack === 'function') {
                    window.castBaseAttack();
                } else {
                    // Fallback si l'attaque de base n'est pas disponible
                    console.warn('⚠️ Attaque de base non disponible');
                    return;
                }
            }
        } else {
            // Si pas à portée, se déplacer vers le monstre en respectant la portée d'attaque
            if (typeof findPath === "function" && window.mapData) {
                // Obtenir la portée d'attaque actuelle (dynamique selon la classe)
                const currentAttackRange = window.classSpellManager ? 
                    window.classSpellManager.getCurrentAttackRange() : 
                    window.PLAYER_ATTACK_RANGE || 1;
                
                console.log(`🎯 Portée d'attaque actuelle: ${currentAttackRange} cases`);
                
                // VÉRIFIER SI LE JOUEUR EST DÉJÀ À PORTÉE
                if (dist <= currentAttackRange) {
                    console.log(`✅ Joueur déjà à portée (distance: ${dist}, portée: ${currentAttackRange}), pas de déplacement`);
                    return; // Ne pas se déplacer si déjà à portée
                }
                
                // Calculer les destinations possibles selon la portée
                let destinations = [];
                
                if (currentAttackRange === 1) {
                    // Corps à corps : cases adjacentes
                    destinations = [
                        {x: attackTarget.x+1, y: attackTarget.y},
                        {x: attackTarget.x-1, y: attackTarget.y},
                        {x: attackTarget.x, y: attackTarget.y+1},
                        {x: attackTarget.x, y: attackTarget.y-1},
                    ];
                } else {
                    // Attaque à distance : calculer les positions à la portée exacte
                    for (let dx = -currentAttackRange; dx <= currentAttackRange; dx++) {
                        for (let dy = -currentAttackRange; dy <= currentAttackRange; dy++) {
                            // Vérifier que la distance est exactement égale à la portée
                            if (Math.abs(dx) + Math.abs(dy) === currentAttackRange) {
                                const pos = {x: attackTarget.x + dx, y: attackTarget.y + dy};
                                destinations.push(pos);
                            }
                        }
                    }
                }
                
                destinations = destinations.filter(pos =>
                    pos.x >= 0 && pos.x < mapData.width &&
                    pos.y >= 0 && pos.y < mapData.height &&
                    !window.isBlocked(pos.x, pos.y) &&
                    !monsters.some(m => m !== attackTarget && m.x === pos.x && m.y === pos.y && m.hp > 0)
                );
                
                if (destinations.length) {
                    let closestDestination = destinations[0];
                    let closestDistance = Math.abs(destinations[0].x - player.x) + Math.abs(destinations[0].y - player.y);
                    
                    for (let i = 1; i < destinations.length; i++) {
                        const distance = Math.abs(destinations[i].x - player.x) + Math.abs(destinations[i].y - player.y);
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestDestination = destinations[i];
                        }
                                         }
                     
                     const isBlockedWithPortals = (x, y) => {
                         if (window.isBlocked(x, y)) return true;
                         // Vérifier s'il y a un monstre vivant à cette position
                         if (monsters.some(monster => monster.x === x && monster.y === y && monster.hp > 0 && !monster.isDead)) {
                             return true;
                         }
                         if (window.mapData && window.mapData.layers && window.mapData.layers.length > 3) {
                             const layer4 = window.mapData.layers[3];
                             const tileIndex = y * layer4.width + x;
                             const tileId = layer4.data[tileIndex];
                             if ([1, 2, 3, 4, 5, 6].includes(tileId)) return true;
                         }
                         return false;
                     };
                     
                     player.path = findPath(
                         { x: player.x, y: player.y },
                         closestDestination,
                         isBlockedWithPortals,
                         mapData.width, mapData.height
                     ) || [];
                     nextStepToTarget();
                }
            }
        }
    }
}

// Export des fonctions d'interaction
window.handleCraftTableClick = handleCraftTableClick;
window.handleMovementClick = handleMovementClick;
window.handleSpaceAttack = handleSpaceAttack; 
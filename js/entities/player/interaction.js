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
        // Vérifier d'abord si c'est une tile de téléportation
        if (window.mapData && window.mapData.layers && window.mapData.layers.length > 0) {
            const layer1 = window.mapData.layers[0];
            const tileIndex = ny * layer1.width + nx;
            const tileId = layer1.data[tileIndex];
            
            // Permettre de cliquer sur les tiles de téléportation (ID 0 et 1)
            if (tileId === 0 || tileId === 1) {
                // Retirer seulement l'encadrement rouge, pas la fiche
                if (attackTarget) {
                    attackTarget.aggro = false;
                    attackTarget.aggroTarget = null;
                    player.inCombat = false;
                }
                
                // Désactiver le suivi automatique
                player.autoFollow = false;
                
                // Créer un chemin vers la tile de téléportation
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
        }
        
        // Sinon, déplacement classique vers la case cliquée
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
            player.autoFollow = true; // Activer le suivi automatique pour le double-clic
            
            // Créer un chemin vers le monstre et attaquer dès qu'on est à portée
            if (typeof findPath === "function" && window.mapData) {
                let destinations = [
                    {x: clickedMonster.x+1, y: clickedMonster.y},
                    {x: clickedMonster.x-1, y: clickedMonster.y},
                    {x: clickedMonster.x, y: clickedMonster.y+1},
                    {x: clickedMonster.x, y: clickedMonster.y-1},
                ].filter(pos =>
                    pos.x >= 0 && pos.x < mapData.width &&
                    pos.y >= 0 && pos.y < mapData.height &&
                    !window.isBlocked(pos.x, pos.y) &&
                    !monsters.some(m => m.x === pos.x && m.y === pos.y)
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
                    
                    player.path = findPath(
                        { x: player.x, y: player.y },
                        closestDestination,
                        window.isBlocked,
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
        }
        
        // Touche espace pour attaquer le monstre sélectionné
        if (e.code === 'Space') {
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
        // Créer un chemin vers le coffre
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
    
    // Ouvrir le coffre
    if (typeof window.openBossChest === "function") {
        window.openBossChest();
    }
}

// Fonction pour gérer les clics sur les tables de craft
function handleCraftTableClick(nx, ny, type) {
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
            player.path = findPath(
                { x: player.x, y: player.y },
                { x: closest.x, y: closest.y },
                window.isBlocked,
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
                            
                            // Vérifier si la case est accessible (pas de collision ET pas de monstre)
                            if (!window.isBlocked(testX, testY) && !monsters.some(monster => monster.x === testX && monster.y === testY && monster.hp > 0)) {
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
        // Créer une fonction de collision qui inclut les monstres
        const isBlockedWithMonsters = (x, y) => {
            // Vérifier les collisions du calque 2
            if (window.isBlocked(x, y)) {
                return true;
            }
            // Vérifier s'il y a un monstre à cette position
            return monsters.some(monster => monster.x === x && monster.y === y && monster.hp > 0);
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
                
                // Calculer les dégâts
                let damage = getPlayerAttackDamage();
                const isCrit = isPlayerCrit();
                if (isCrit) {
                    damage = Math.floor(damage * getPlayerCritDamage());
                }
                
                // Appliquer les dégâts au monstre
                const baseDamage = getPlayerAttackDamage();
                const finalDamage = Math.max(1, baseDamage - (attackTarget.defense || 0));
                attackTarget.hp -= finalDamage;
                
                // Afficher les dégâts
                if (typeof displayDamage === 'function') {
                    displayDamage(attackTarget.px, attackTarget.py, finalDamage, isCrit ? 'critique' : 'damage', false);
                }
                
                // Aligner le monstre sur sa case
                if (typeof alignMonsterToGrid === 'function') {
                    alignMonsterToGrid(attackTarget);
                }
                
                // Riposte du monstre s'il est encore vivant (sauf pour les slimes qui ont leur propre système d'attaque)
                if (attackTarget.hp > 0 && attackTarget.type !== "slime") {
                    const monsterBaseDamage = attackTarget.damage !== undefined ? attackTarget.damage : 3;
                    const monsterTotalDamage = monsterBaseDamage + (attackTarget.force || 0);
                    const randomFactor = 0.75 + Math.random() * 0.5; // Variation de +/- 25%
                    const monsterDamage = Math.max(1, Math.floor(monsterTotalDamage * randomFactor) - player.defense);
                    player.life -= monsterDamage;
                    
                    if (typeof displayDamage === 'function') {
                        displayDamage(player.px, player.py, monsterDamage, 'damage', true);
                    }
                }
                
                // Vérifier si le monstre est mort
                if (attackTarget.hp <= 0) {
                    if (typeof release === "function") release(attackTarget.x, attackTarget.y);
                    
                    // Gain d'XP
                    if (typeof displayDamage === 'function') {
                        displayDamage(player.px, player.py, `+${attackTarget.xpValue || 0} XP`, 'xp', true);
                    }
                    if (typeof gainXP === "function") gainXP(attackTarget.xpValue || 0);
                    
                    // Loot
                    if (typeof triggerLoot === "function") triggerLoot(attackTarget);
                    
                    // Tuer le monstre
                    if (typeof killMonster === "function") killMonster(attackTarget);
                    
                    attackTarget.aggro = false;
                    attackTarget.aggroTarget = null;
                    attackTarget = null;
                    window.attackTarget = null;
                }
                
                player.lastAttack = currentTime;
            }
        } else {
            // Si pas à portée, se déplacer vers le monstre
            if (typeof findPath === "function" && window.mapData) {
                let destinations = [
                    {x: attackTarget.x+1, y: attackTarget.y},
                    {x: attackTarget.x-1, y: attackTarget.y},
                    {x: attackTarget.x, y: attackTarget.y+1},
                    {x: attackTarget.x, y: attackTarget.y-1},
                ].filter(pos =>
                    pos.x >= 0 && pos.x < mapData.width &&
                    pos.y >= 0 && pos.y < mapData.height &&
                    !window.isBlocked(pos.x, pos.y) &&
                    !monsters.some(m => m !== attackTarget && m.x === pos.x && m.y === pos.y)
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
                    
                    player.path = findPath(
                        { x: player.x, y: player.y },
                        closestDestination,
                        window.isBlocked,
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
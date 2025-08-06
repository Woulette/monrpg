function updatePlayer(ts) {
    // Vérification globale de la mort du joueur
    if (player.life <= 0 && !player.isDead) {
        player.isDead = true;
        player.deathTime = Date.now();
        
        // Nettoyer les cibles de combat
        if (attackTarget) {
            attackTarget.aggro = false;
            attackTarget.aggroTarget = null;
        }
        attackTarget = null;
        window.attackTarget = null;
        player.inCombat = false;
    }
    
    // Animation du joueur (mouvement seulement)
    if (!player.isDead) {
        // Animation de mouvement (seulement quand le joueur bouge)
        if (player.moving) {
            if (!player.lastAnim || ts - player.lastAnim > 80) { // 80ms pour l'animation de mouvement
                player.frame = (player.frame + 1) % 4;
                player.lastAnim = ts;
            }
        } else {
            // Pas d'animation idle, garder la frame 0
            player.frame = 0;
        }
    }
    
    // Déplacement fluide (seulement si le joueur n'est pas mort)
    if (!player.isDead && player.moving) {
        let tx = player.moveTarget.x * TILE_SIZE;
        let ty = player.moveTarget.y * TILE_SIZE;
        let dx = tx - player.px;
        let dy = ty - player.py;

        if (Math.abs(dx) <= MOVE_SPEED && Math.abs(dy) <= MOVE_SPEED) {
            if (typeof release === "function") release(player.x, player.y);

            player.px = tx;
            player.py = ty;
            player.x = player.moveTarget.x;
            player.y = player.moveTarget.y;

            if (typeof occupy === "function") occupy(player.x, player.y);

            player.moving = false;
            // Ne pas réinitialiser player.frame ici, l'animation idle prendra le relais

            // Rafraîchir l'affichage des quêtes si la fenêtre est ouverte
            if (typeof refreshQuestsOnPlayerMove === 'function') {
                refreshQuestsOnPlayerMove();
            }

            nextStepToTarget();
        } else {
            // Appliquer la vitesse du joueur (1 vitesse = +0.01 de vitesse de déplacement)
            let currentMoveSpeed = MOVE_SPEED * (1 + (player.vitesse - 1) * 0.01);
            
            // Bonus de vitesse par niveau (+0.01 par niveau au-dessus de 1)
            const levelSpeedBonus = (player.level - 1) * 0.01;
            currentMoveSpeed += levelSpeedBonus;
            
            // Ralentir le joueur sur les cartes du donjon slime pour compenser la petite taille
            if (window.currentMap && (window.currentMap.includes('mapdonjonslime'))) {
                currentMoveSpeed *= 0.8; // Ralentir de 20% (80% de vitesse restante)
            }
            
            // Ralentir le joueur dans la maison de 20%
            if (window.currentMap === "maison") {
                currentMoveSpeed *= 0.8; // Ralentir de 20% (80% de vitesse restante)
            }
            if (dx !== 0) player.px += currentMoveSpeed * Math.sign(dx);
            if (dy !== 0) player.py += currentMoveSpeed * Math.sign(dy);
        }
    }

    // Gestion du combat (seulement si le joueur n'est pas mort)
    if (
        !player.isDead &&
        attackTarget &&
        attackTarget.hp > 0 &&
        player.life > 0
    ) {
        let dist = Math.abs(player.x - attackTarget.x) + Math.abs(player.y - attackTarget.y);

        // Orienter le joueur vers le monstre en combat (sans bloquer le mouvement)
        if (dist === PLAYER_ATTACK_RANGE) {
            if (attackTarget.x < player.x) player.direction = 3; // Gauche
            else if (attackTarget.x > player.x) player.direction = 1; // Droite
            else if (attackTarget.y < player.y) player.direction = 2; // Haut
            else if (attackTarget.y > player.y) player.direction = 0; // Bas
        }

        if (dist === PLAYER_ATTACK_RANGE) {
            const currentTime = Date.now();
            
            // Empêcher la superposition avec le SlimeBoss
            if (attackTarget.type === "slimeboss" && dist === 0) {
                // Si le joueur est sur la même case que le SlimeBoss, le repousser
                return;
            }
            
            // Vérifie le cooldown visuel du sort de base
            const slot = document.getElementById('spell-slot-1');
            if (slot && slot.classList.contains('cooldown')) {
                return;
            }
            if (!player.lastAttack || currentTime - player.lastAttack > 1000) {
                // Vérifier si le joueur esquive
                if (isPlayerDodge()) {
                    gainStatXP('agilite', 2); // XP pour l'esquive
                    
                    // Afficher "ESQUIVE" au-dessus du joueur
                    if (typeof displayDamage === "function") {
                        displayDamage(player.px, player.py, "ESQUIVE", 'heal', true);
                    }
                    
                    player.lastAttack = currentTime;
                    return;
                }
                
                // Calcul des dégâts avec la force et critique
                let damage, isCrit;
                if (typeof computeSpellDamage === 'function') {
                  // Utiliser les dégâts améliorés s'ils existent, sinon les dégâts de base
                  let minDamage = 3;
                  let maxDamage = 6;
                  if (window.punchDamageMin !== 3 || window.punchDamageMax !== 6) {
                    minDamage = window.punchDamageMin;
                    maxDamage = window.punchDamageMax;
                    console.log(`⚔️ update.js - Coup de Poing amélioré: ${minDamage}-${maxDamage}`);
                  } else {
                    console.log(`⚔️ update.js - Coup de Poing de base: ${minDamage}-${maxDamage}`);
                  }
                  const res = computeSpellDamage(minDamage, maxDamage);
                  damage = res.damage;
                  isCrit = res.isCrit;
                } else {
                  damage = getPlayerAttackDamage();
                  isCrit = false;
                }
                // Gain d'XP de force à chaque attaque
                if (typeof gainStatXP === "function") {
                    gainStatXP('force', 1);
                }
                if (isCrit) {
                    // Gain d'XP d'agilité lors d'un coup critique
                    if (typeof gainStatXP === "function") {
                        gainStatXP('agilite', 1);
                    }
                    // Nouveau calcul des dégâts critiques : base × 1.5 × (1 + bonus_critique)
                    const baseDamage = getPlayerAttackDamage();
                    const critMultiplier = 1.5;
                    const critBonus = getPlayerCritDamage();
                    damage = Math.floor(baseDamage * critMultiplier * (1 + critBonus));
                }
                // Attaque du joueur
                const baseDamage = damage;
                // Prendre en compte la défense du monstre, minimum 1 dégât
                const finalDamage = Math.max(1, baseDamage - (attackTarget.defense || 0));
                attackTarget.hp -= finalDamage;
                
                // DÉCLENCHER L'AGGRO SEULEMENT LORS D'UNE VRAIE ATTAQUE
                attackTarget.aggro = true;
                attackTarget.aggroTarget = player;
                attackTarget.lastCombat = currentTime; // Mettre à jour le timer de combat pour maintenir l'aggro
                player.inCombat = true;
                // Déclenche le cooldown visuel du sort de base
                if (typeof startSpellCooldown === 'function') {
                  startSpellCooldown('spell-slot-1', 1.0);
                }
                // Afficher les dégâts infligés au monstre (critique ou non)
                if (typeof displayDamage === "function") {
                    displayDamage(attackTarget.px, attackTarget.py, finalDamage, isCrit ? 'critique' : 'damage', false);
                }
                
                // Aligner le monstre sur sa case pendant le combat
                if (typeof alignMonsterToGrid === 'function') {
                    alignMonsterToGrid(attackTarget);
                }

                // Riposte du monstre si vivant (sauf pour les slimes et boss slime qui ont leur propre système d'attaque)
                if (attackTarget.hp > 0 && attackTarget.type !== "slime" && attackTarget.type !== "slimeboss") {
                    // Cooldown de riposte pour éviter les attaques doubles
                    const riposteCooldown = 1000; // 1 seconde de cooldown
                    if (!attackTarget.lastRiposte || (currentTime - attackTarget.lastRiposte) >= riposteCooldown) {
                        // Calcul des dégâts du monstre : dégâts de base + force du monstre avec variation de 25%
                        const monsterBaseDamage = attackTarget.damage !== undefined ? attackTarget.damage : 3;
                        const monsterTotalDamage = monsterBaseDamage + (attackTarget.force || 0);
                        const variation = 0.25; // 25% de variation
                        const randomFactor = 1 + (Math.random() * 2 - 1) * variation; // Entre 0.75 et 1.25
                        const monsterDamage = Math.max(1, Math.floor(monsterTotalDamage * randomFactor) - player.defense);
                        player.life -= monsterDamage;
                        if (player.life < 0) player.life = 0;
                        
                        // Afficher les dégâts reçus par le joueur
                        if (typeof displayDamage === "function") {
                            displayDamage(player.px, player.py, monsterDamage, 'damage', true);
                        }
                        
                        // XP défense pour avoir reçu des dégâts
                        gainStatXP('defense', 1);
                        
                        // Marquer le temps de la dernière riposte
                        attackTarget.lastRiposte = currentTime;
                    }
                }

                // Monstre mort
                if (attackTarget.hp <= 0) {
                    if (typeof release === "function") release(attackTarget.x, attackTarget.y);
                    
                    // Afficher l'XP gagné au-dessus du joueur
                    if (typeof displayDamage === "function") {
                        displayDamage(player.px, player.py, `+${attackTarget.xpValue || 0} XP`, 'xp', true);
                    }
                    
                    if (typeof gainXP === "function") gainXP(attackTarget.xpValue || 0);
                    
                    // Déclencher le système de loot
                    if (typeof triggerLoot === 'function') {
                        triggerLoot(attackTarget);
                    }
                    
                    if (typeof killMonster === "function") {
                        killMonster(attackTarget);
                    }
                    attackTarget.aggro = false;
                    attackTarget.aggroTarget = null;
                    attackTarget = null;
                    window.attackTarget = null;
                    player.inCombat = false;
                }

                player.lastAttack = currentTime;
            }
        } else if (dist > PLAYER_ATTACK_RANGE && !player.moving && player.autoFollow) {
            // Le monstre s'est éloigné, le joueur le suit automatiquement (seulement si autoFollow activé)
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
                    // Trouver la destination la plus proche du joueur
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
    } else {
        // Nettoyage si cible morte
        if (attackTarget && attackTarget.hp <= 0) {
            attackTarget.aggro = false;
            attackTarget.aggroTarget = null;
            attackTarget = null;
            window.attackTarget = null;
            player.inCombat = false;
        }
    }

    // Système de régénération de vie (seulement si le joueur n'est pas mort)
    if (!player.isDead && !player.inCombat && player.life < player.maxLife) {
        const currentTime = Date.now();
        if (currentTime - player.lastRegenTime > 1000) { // Régénération toutes les secondes
            player.life = Math.min(player.maxLife, player.life + 1);
            player.lastRegenTime = currentTime;
        }
    }

    // Système de respawn automatique
    if (player.isDead) {
        const currentTime = Date.now();
        const elapsed = currentTime - player.deathTime;
        
        if (elapsed >= player.respawnTime) {
            respawnPlayer();
        }
    }
    
    // Vérification de téléportation automatique
    if (window.mapData && window.mapData.layers && window.mapData.layers.length > 0) {
        // Chercher tous les portails dans tous les calques avec PRIORITÉ au calque 4 (calque des portails)
        let portalFound = false;
        let portalGid = null;
        let portalLayerId = null;
        
        // PRIORITÉ 1 : Chercher d'abord dans le calque 4 (calque des portails)
        if (window.mapData.layers.length > 3) {
            const layer4 = window.mapData.layers[3]; // Calque 4 (index 3)
            const tileIndex = player.y * layer4.width + player.x;
            const tileId = layer4.data[tileIndex];
            
            if (tileId === 1 || tileId === 2 || tileId === 3 || tileId === 4 || tileId === 12008 || tileId === 12208 || tileId === 15408 || tileId === 15608 || tileId === 6 || tileId === 7 || tileId === 7203 || tileId === 7403) {
                portalFound = true;
                portalGid = tileId;
                portalLayerId = 4;
                console.log(`🌀 Portail détecté sur calque 4: ID ${portalGid} à (${player.x}, ${player.y}) sur ${window.currentMap}`);
            }
        }
        
        // PRIORITÉ 2 : Si pas trouvé sur calque 4, chercher dans les autres calques
        if (!portalFound) {
            for (let layerIndex = 0; layerIndex < window.mapData.layers.length; layerIndex++) {
                const layer = window.mapData.layers[layerIndex];
                const tileIndex = player.y * layer.width + player.x;
                const tileId = layer.data[tileIndex];
                
                if (tileId === 1 || tileId === 2 || tileId === 3 || tileId === 4 || tileId === 12008 || tileId === 12208 || tileId === 15408 || tileId === 15608 || tileId === 6 || tileId === 7 || tileId === 7203 || tileId === 7403) {
                    portalFound = true;
                    portalGid = tileId;
                    portalLayerId = layer.id || layerIndex;
                    console.log(`🌀 Portail détecté sur calque ${portalLayerId}: ID ${portalGid} à (${player.x}, ${player.y}) sur ${window.currentMap}`);
                    break;
                }
            }
        }

        // Portail détecté
        if (portalFound) {
            // Logique générale pour toutes les maps
            let destinationMap = null;
            let targetPortalId = null;
            
            // Extraire le numéro de la map actuelle
            const currentMapNumber = parseInt(window.currentMap.replace('map', ''));
            
            // Gestion spéciale pour la map 3 - LOGIQUE RENFORCÉE
            if (window.currentMap === "map3") {
                console.log(`🗺️ MAP3 - Traitement du portail ID ${portalGid} sur calque ${portalLayerId}`);
                
                if (portalGid === 1) {
                    // Portail ID 1 → Map Slime
                    destinationMap = "mapdonjonslime";
                    targetPortalId = 2;
                    console.log(`✅ MAP3 - Portail ID 1: Direction mapdonjonslime`);
                } else if (portalGid === 2) {
                    // Portail ID 2 → Map 2 (FORCER la destination)
                    destinationMap = "map2";
                    targetPortalId = 1;
                    console.log(`✅ MAP3 - Portail ID 2: Direction MAP2 (FORCÉE)`);
                    
                    // VÉRIFICATION SUPPLÉMENTAIRE : S'assurer qu'on ne va pas ailleurs
                    if (destinationMap !== "map2") {
                        console.error(`🚨 ERREUR MAP3 - Portail ID 2 devrait aller en map2 mais va en ${destinationMap}!`);
                        destinationMap = "map2"; // FORCER la correction
                    }
                } else if (portalGid === 3) {
                    // Portail ID 3 → Map 4 (si elle existe)
                    destinationMap = `map${currentMapNumber + 1}`;
                    targetPortalId = 4;
                    console.log(`✅ MAP3 - Portail ID 3: Direction map${currentMapNumber + 1}`);
                } else if (portalGid === 4) {
                    // Portail ID 4 → Map 2
                    destinationMap = `map${currentMapNumber - 1}`;
                    targetPortalId = 3;
                    console.log(`✅ MAP3 - Portail ID 4: Direction map${currentMapNumber - 1}`);
                } else if (portalGid === 6) {
                    // Portail ID 6 → Maison
                    destinationMap = "maison";
                    targetPortalId = 7;
                    console.log(`✅ MAP3 - Portail ID 6: Direction maison`);
                } else {
                    console.warn(`⚠️ MAP3 - Portail ID ${portalGid} non reconnu!`);
                }
            } else if (window.currentMap === "mapdonjonslime") {
                // Gestion spéciale pour la map slime
                if (portalGid === 2) {
                    // Portail ID 2 → Map 3
                    destinationMap = "map3";
                    targetPortalId = 1;
                } else if (portalGid === 12008) {
                    // Portail ID 12008 → Mapdonjonslime2 (sens unique)
                    // Vérifier si le portail est débloqué
                    if (typeof window.isPortal12008Accessible === "function" && window.isPortal12008Accessible()) {
                        destinationMap = "mapdonjonslime2";
                        targetPortalId = 12208;
                    } else {
                        portalFound = false; // Empêcher le téléportement
                    }
                }
            } else if (window.currentMap === "mapdonjonslime2") {
                // Gestion spéciale pour mapdonjonslime2
                if (portalGid === 15408 || portalGid === 15608) {
                    // Portails 15408 et 15608 → Mapdonjonslimeboss (sens unique)
                    // Vérifier si le décor a été retiré (les slimes tués)
                    if (typeof window.dungeonProgression !== 'undefined' && 
                        window.dungeonProgression.mapdonjonslime2 && 
                        window.dungeonProgression.mapdonjonslime2.decorRemoved) {
                        destinationMap = "mapdonjonslimeboss";
                        targetPortalId = null; // Pas de portail à chercher, position fixe
                    } else {
                        portalFound = false; // Empêcher le téléportement
                    }
                }
                // Pas de portail de retour - le joueur doit tuer le boss pour sortir
                // Le portail 12208 n'est plus fonctionnel
            } else if (window.currentMap === "mapdonjonslimeboss") {
                // Gestion spéciale pour mapdonjonslimeboss
                // Pas de portail de sortie - le joueur doit tuer le SlimeBoss pour sortir
                // Le boss sera implémenté plus tard
            } else if (window.currentMap === "map4") {
                // Gestion spéciale pour la map4
                if (portalGid === 7203 || portalGid === 7403) {
                    // Portails 7203 et 7403 → Map zonealuineeks1
                    destinationMap = "mapzonealuineeks1";
                    targetPortalId = null; // Position fixe
                } else if (portalGid === 4) {
                    // Portail ID 4 → Map 3
                    destinationMap = "map3";
                    targetPortalId = 3;
                } else if (portalGid === 3) {
                    // Portail ID 3 → Map 3
                    destinationMap = "map3";
                    targetPortalId = 4;
                }
            } else if (window.currentMap === "mapzonealuineeks1") {
                // Gestion spéciale pour mapzonealuineeks1
                if (portalGid === 2) {
                    // Portail ID 2 → Map 4
                    destinationMap = "map4";
                    targetPortalId = null; // Position fixe
                } else if (portalGid === 1) {
                    // Portail ID 1 → Map mazonehaut1aluineeks1
                    destinationMap = "mazonehaut1aluineeks1";
                    targetPortalId = null; // Position fixe
                }
            } else if (window.currentMap === "mazonehaut1aluineeks1") {
                // Gestion spéciale pour mazonehaut1aluineeks1
                if (portalGid === 2) {
                    // Portail ID 2 → Map zonealuineeks1
                    destinationMap = "mapzonealuineeks1";
                    targetPortalId = null; // Position fixe
                }
            } else if (window.currentMap === "maison") {
                // Gestion spéciale pour la maison
                if (portalGid === 7) {
                    // Portail ID 7 → Map 3
                    destinationMap = "map3";
                    targetPortalId = 6;
                }
            } else {
                // Logique générale pour les autres maps
                if (portalGid === 1) {
                    // Portail ID 1 → Map suivante, portail ID 2
                    destinationMap = `map${currentMapNumber + 1}`;
                    targetPortalId = 2;
                } else if (portalGid === 2) {
                    // Portail ID 2 → Map précédente, portail ID 1
                    destinationMap = `map${currentMapNumber - 1}`;
                    targetPortalId = 1;
                } else if (portalGid === 3) {
                    // Portail ID 3 → Map suivante, portail ID 4
                    destinationMap = `map${currentMapNumber + 1}`;
                    targetPortalId = 4;
                } else if (portalGid === 4) {
                    // Portail ID 4 → Map précédente, portail ID 3
                    destinationMap = `map${currentMapNumber - 1}`;
                    targetPortalId = 3;
                }
            }
            if (destinationMap) {
                // VÉRIFICATION FINALE : S'assurer que la destination est cohérente
                console.log(`🎯 TÉLÉPORTATION FINALE: ${window.currentMap} (portail ${portalGid}) → ${destinationMap}`);
                
                // PROTECTION SPÉCIALE pour MAP3 portail 2
                if (window.currentMap === "map3" && portalGid === 2 && destinationMap !== "map2") {
                    console.error(`🚨 PROTECTION ACTIVÉE - MAP3 portail 2 redirigé vers ${destinationMap} au lieu de map2!`);
                    destinationMap = "map2"; // FORCER la correction
                    targetPortalId = 1;
                }
                
                // Détecter la direction d'entrée dans le portail
                let dx = 0, dy = 0;
                if (player.path && player.path.length > 0) {
                    // Dernière étape du chemin avant le portail
                    const prev = player.path.length > 0 ? player.path[player.path.length - 1] : null;
                    if (prev) {
                        dx = player.x - prev.x;
                        dy = player.y - prev.y;
                    }
                }
                // Si pas de chemin, on regarde la direction du joueur
                if (dx === 0 && dy === 0) {
                    if (player.direction === 0) dy = 1; // Bas
                    else if (player.direction === 1) dx = -1; // Droite
                    else if (player.direction === 2) dy = -1; // Haut
                    else if (player.direction === 3) dx = 1; // Gauche
                }
                const originX = player.x;
                const originY = player.y;
                fetch(`assets/maps/${destinationMap}.json`)
                    .then(response => {
                        return response.json();
                    })
                    .then(mapData => {
                        
                        // Gestion spéciale pour mapdonjonslimeboss - position fixe
                        if (destinationMap === "mapdonjonslimeboss") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 12, 17);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour mapzonealuineeks1 depuis mazonehaut1aluineeks1 - position fixe
                        if (destinationMap === "mapzonealuineeks1" && window.currentMap === "mazonehaut1aluineeks1") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 23, 1);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour mapzonealuineeks1 depuis map4 - position fixe
                        if (destinationMap === "mapzonealuineeks1" && window.currentMap === "map4") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 23, 23);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour map4 depuis mapzonealuineeks1 - position fixe
                        if (destinationMap === "map4" && window.currentMap === "mapzonealuineeks1") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 22, 5);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour mazonehaut1aluineeks1 depuis mapzonealuineeks1 - position fixe
                        if (destinationMap === "mazonehaut1aluineeks1" && window.currentMap === "mapzonealuineeks1") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 23, 23);
                            }
                            return;
                        }
                        
                        // Chercher le portail de destination dans tous les calques
                        let targetPortal = null;
                        
                        for (let layerIndex = 0; layerIndex < mapData.layers.length; layerIndex++) {
                            const layer = mapData.layers[layerIndex];
                            for (let y = 0; y < layer.height; y++) {
                                for (let x = 0; x < layer.width; x++) {
                                    const idx = y * layer.width + x;
                                    if (layer.data[idx] === targetPortalId) {
                                        targetPortal = {x, y};
                                        break;
                                    }
                                }
                                if (targetPortal) break;
                            }
                            if (targetPortal) break;
                        }
                        
                        // Fallback : chercher tous les portails du même ID si pas trouvé
                        let portals = [];
                        if (!targetPortal) {
                            for (let layerIndex = 0; layerIndex < mapData.layers.length; layerIndex++) {
                                const layer = mapData.layers[layerIndex];
                                for (let y = 0; y < layer.height; y++) {
                                    for (let x = 0; x < layer.width; x++) {
                                        const idx = y * layer.width + x;
                                        if (layer.data[idx] === targetPortalId) {
                                            portals.push({x, y});
                                        }
                                    }
                                }
                            }
                        }
                        if (targetPortal || portals.length > 0) {
                            // Utiliser le portail cible trouvé ou le plus proche en fallback
                            let closest = targetPortal || portals[0];
                            
                            if (!targetPortal && portals.length > 1) {
                                // Trouver le portail le plus proche de la position d'origine
                                let minDist = Math.abs(portals[0].x - originX) + Math.abs(portals[0].y - originY);
                                for (let i = 1; i < portals.length; i++) {
                                    let dist = Math.abs(portals[i].x - originX) + Math.abs(portals[i].y - originY);
                                    if (dist < minDist) {
                                        minDist = dist;
                                        closest = portals[i];
                                    }
                                }
                            }
                            // Position fixe selon la destination
                            let destX, destY;
                            
                            if (destinationMap === "mapzonealuineeks1" && window.currentMap === "map4") {
                                // Map 4 → Map zonealuineeks1 : position fixe
                                destX = 23;
                                destY = 23;
                                                    } else if (destinationMap === "map4" && window.currentMap === "mapzonealuineeks1") {
                            // Map zonealuineeks1 → Map 4 : position fixe
                            destX = 22;
                            destY = 5;
                        } else if (destinationMap === "mazonehaut1aluineeks1" && window.currentMap === "mapzonealuineeks1") {
                            // Map zonealuineeks1 → Map mazonehaut1aluineeks1 : position fixe
                            destX = 23;
                            destY = 23;
                        } else if (destinationMap === "mapzonealuineeks1" && window.currentMap === "mazonehaut1aluineeks1") {
                            // Map mazonehaut1aluineeks1 → Map zonealuineeks1 : position fixe
                            destX = 23;
                            destY = 1;
                        } else if (destinationMap === "map4") {
                                // Map 3 → Map 4 : position fixe (croix rouge)
                                destX = 1;
                                destY = 11;
                            } else if (destinationMap === "map3" && window.currentMap === "map4") {
                                // Map 4 → Map 3 : position fixe (portail ID 3)
                                destX = 46;
                                destY = 13;
                            } else if (destinationMap === "map3" && window.currentMap === "map2") {
                                // Map 2 → Map 3 : position fixe (portail ID 2)
                                destX = 24;
                                destY = 23;
                            } else if (destinationMap === "map2" && window.currentMap === "map3") {
                                // Map 3 → Map 2 : position fixe (portail ID 1)
                                destX = 24;
                                destY = 1;
                            } else if (destinationMap === "map2" && window.currentMap === "map1") {
                                // Map 1 → Map 2 : position fixe (portail ID 2)
                                destX = 24;
                                destY = 23;
                            } else if (destinationMap === "map1" && window.currentMap === "map2") {
                                // Map 2 → Map 1 : position fixe (portail ID 1)
                                destX = 28;
                                destY = 1;
                            } else {
                                // Fallback pour les autres cas
                                destX = closest.x;
                                destY = closest.y;
                            }
                            
                            // Vérifier que la case d'arrivée est dans la map
                            if (destX < 0) destX = 0;
                            if (destY < 0) destY = 0;
                            if (destX >= mapData.width) destX = mapData.width - 1;
                            if (destY >= mapData.height) destY = mapData.height - 1;
                            
                            // Vérifier si la case d'arrivée est un portail ou une collision
                            let isInvalidDestination = false;
                            for (let layerIndex = 0; layerIndex < mapData.layers.length; layerIndex++) {
                                const layer = mapData.layers[layerIndex];
                                const tileGid = layer.data[destY * layer.width + destX];
                                
                                // Vérifier si c'est un portail
                                if (tileGid === targetPortalId) {
                                    isInvalidDestination = true;
                                    break;
                                }
                                
                                // Vérifier si c'est une collision (calque 2)
                                if (layer.id === 2 && tileGid !== 0) {
                                    isInvalidDestination = true;
                                    break;
                                }
                            }
                            
                            if (isInvalidDestination) {
                                // Essayer les 4 directions autour du portail
                                const directions = [
                                    {dx: 0, dy: -1}, // Haut
                                    {dx: 1, dy: 0},  // Droite
                                    {dx: 0, dy: 1},  // Bas
                                    {dx: -1, dy: 0}  // Gauche
                                ];
                                
                                let validPositionFound = false;
                                for (let dir of directions) {
                                    let testX = closest.x + dir.dx;
                                    let testY = closest.y + dir.dy;
                                    
                                    // Vérifier les limites de la map
                                    if (testX < 0 || testY < 0 || testX >= mapData.width || testY >= mapData.height) {
                                        continue;
                                    }
                                    
                                    // Vérifier si la position est valide
                                    let isValid = true;
                                    for (let layerIndex = 0; layerIndex < mapData.layers.length; layerIndex++) {
                                        const layer = mapData.layers[layerIndex];
                                        const tileGid = layer.data[testY * layer.width + testX];
                                        
                                        // Vérifier si c'est un portail
                                        if (tileGid === targetPortalId) {
                                            isValid = false;
                                            break;
                                        }
                                        
                                        // Vérifier si c'est une collision (calque 2)
                                        if (layer.id === 2 && tileGid !== 0) {
                                            isValid = false;
                                            break;
                                        }
                                    }
                                    
                                    if (isValid) {
                                        destX = testX;
                                        destY = testY;
                                        validPositionFound = true;
                                        break;
                                    }
                                }
                                
                                // Si aucune position valide trouvée, fallback au centre
                                if (!validPositionFound) {
                                    destX = 24;
                                    destY = 14;
                                }
                            }
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, destX, destY);
                            }
                        } else {
                            // Si pas de portail trouvé, fallback au centre
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 24, 14);
                            }
                        }
                    });
                return;
            }
        }
        // --- ANCIENNE LOGIQUE SUPPRIMÉE ---
        // Cette logique causait des conflits avec le système principal de portails
        // Le système principal (lignes 325-704) gère maintenant TOUS les portails de manière cohérente
    }
}

// Fonction de mise à jour du respawn du joueur
function updatePlayerRespawn(ts) {
    // Cette fonction est appelée par la boucle de jeu principale
    // La logique de respawn est déjà dans updatePlayer()
    // Cette fonction sert juste de pont pour la boucle de jeu
}

// FONCTION D'URGENCE : Diagnostiquer les problèmes de portails
window.debugPortals = function() {
    console.log("🔍 === DIAGNOSTIC PORTAILS ===");
    console.log("Map actuelle:", window.currentMap);
    console.log("Position joueur:", `(${player.x}, ${player.y})`);
    
    if (!window.mapData || !window.mapData.layers) {
        console.log("❌ Pas de mapData ou calques");
        return;
    }
    
    console.log("Nombre de calques:", window.mapData.layers.length);
    
    // Vérifier chaque calque à la position du joueur
    for (let layerIndex = 0; layerIndex < window.mapData.layers.length; layerIndex++) {
        const layer = window.mapData.layers[layerIndex];
        const tileIndex = player.y * layer.width + player.x;
        const tileId = layer.data[tileIndex];
        
        if (tileId !== 0) {
            console.log(`Calque ${layerIndex + 1} (ID: ${layer.id || 'non défini'}): TileID ${tileId}`);
            
            // Vérifier si c'est un portail
            if (tileId === 1 || tileId === 2 || tileId === 3 || tileId === 4 || tileId === 12008 || tileId === 12208 || tileId === 15408 || tileId === 15608 || tileId === 6 || tileId === 7 || tileId === 7203 || tileId === 7403) {
                console.log(`🌀 PORTAIL DÉTECTÉ: ID ${tileId} sur calque ${layerIndex + 1}`);
            }
        }
    }
    
    console.log("=============================");
};

// FONCTION D'URGENCE : Forcer la téléportation correcte depuis MAP3
window.fixMap3Portal2 = function() {
    console.log("🚨 CORRECTION D'URGENCE - MAP3 PORTAIL 2 → MAP2");
    
    if (window.currentMap !== "map3") {
        console.log("❌ Vous n'êtes pas sur map3");
        return;
    }
    
    console.log("🎯 Téléportation forcée: map3 → map2");
    if (typeof teleportPlayer === "function") {
        teleportPlayer("map2", 24, 1); // Position fixe pour map2
        console.log("✅ Téléportation effectuée");
    } else {
        console.log("❌ Fonction teleportPlayer non disponible");
    }
};

// FONCTION D'URGENCE : Tester la logique de portail
window.testPortalLogic = function(portalId) {
    console.log(`🧪 TEST LOGIQUE PORTAIL ID ${portalId} sur ${window.currentMap}`);
    
    let destinationMap = null;
    const currentMapNumber = parseInt(window.currentMap.replace('map', ''));
    
    if (window.currentMap === "map3") {
        if (portalId === 1) {
            destinationMap = "mapdonjonslime";
        } else if (portalId === 2) {
            destinationMap = "map2";
        } else if (portalId === 3) {
            destinationMap = `map${currentMapNumber + 1}`;
        } else if (portalId === 4) {
            destinationMap = `map${currentMapNumber - 1}`;
        } else if (portalId === 6) {
            destinationMap = "maison";
        }
    }
    
    console.log(`🎯 Résultat: Portail ${portalId} → ${destinationMap}`);
    return destinationMap;
};

// Export de la fonction update
window.updatePlayer = updatePlayer;
window.updatePlayerRespawn = updatePlayerRespawn; 
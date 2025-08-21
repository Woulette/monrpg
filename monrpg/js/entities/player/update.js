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
                
                // Utiliser l'attaque de base unique (punch.js)
                if (typeof window.castBaseAttack === 'function') {
                    window.castBaseAttack();
                } else {
                    // Fallback si l'attaque de base n'est pas disponible
                    console.warn('⚠️ Attaque de base non disponible');
                    return;
                }
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
    
    // (retour comportement précédent) pas de pushback auto ici
    
    // Vérification de téléportation automatique
    if (window.mapData && window.mapData.layers && window.mapData.layers.length > 0) {
        // Garde-fou: ignorer la détection de portail pendant un court cooldown après téléportation
        if (window.portalCooldownUntil && Date.now() < window.portalCooldownUntil) {
            return;
        }
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
                
                if (portalGid === 1) {
                    // Portail ID 1 → Map Slime
                    destinationMap = "mapdonjonslime";
                    targetPortalId = 2;
                } else if (portalGid === 2) {
                    // Portail ID 2 → Map 2 (FORCER la destination)
                    destinationMap = "map2";
                    targetPortalId = 1;
                    
                    // VÉRIFICATION SUPPLÉMENTAIRE : S'assurer qu'on ne va pas ailleurs
                    if (destinationMap !== "map2") {
                        console.error(`🚨 ERREUR MAP3 - Portail ID 2 devrait aller en map2 mais va en ${destinationMap}!`);
                        destinationMap = "map2"; // FORCER la correction
                    }
                } else if (portalGid === 3) {
                    // Portail ID 3 → Map 4 (si elle existe)
                    destinationMap = `map${currentMapNumber + 1}`;
                    targetPortalId = 4;
                } else if (portalGid === 4) {
                    // Portail ID 4 → Map 2
                    destinationMap = `map${currentMapNumber - 1}`;
                    targetPortalId = 3;
                } else if (portalGid === 6) {
                    // Portail ID 6 → Maison
                    destinationMap = "maison";
                    targetPortalId = 7;
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
                    // Portail ID 3 → Map 5 (nouvelle zone)
                    destinationMap = "map5";
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
            } else if (window.currentMap === "map5") {
                // Map5: logique spécifique pour les portails
                if (portalGid === 1) {
                    destinationMap = "map4";
                    targetPortalId = 2;
                } else if (portalGid === 2) {
                    destinationMap = "map4";
                    targetPortalId = 1;
                } else if (portalGid === 3) {
                    // Portail ID 3 → Map 6 (portail ID 4)
                    destinationMap = "map6";
                    targetPortalId = 4;
                } else if (portalGid === 4) {
                    destinationMap = "map4";
                    targetPortalId = 3;
                }
            } else if (window.currentMap === "map6") {
                // Map6: logique spécifique pour les portails
                if (portalGid === 1) {
                    destinationMap = "map7";
                    targetPortalId = 2;
                } else if (portalGid === 2) {
                    destinationMap = "map5";
                    targetPortalId = 1;
                } else if (portalGid === 3) {
                    // Portail ID 3 → Map 7 (portail ID 4)
                    destinationMap = "map7";
                    targetPortalId = 4;
                } else if (portalGid === 4) {
                    // Portail ID 4 → Map 5 (portail ID 3)
                    destinationMap = "map5";
                    targetPortalId = 3;
                }
            } else if (window.currentMap === "map7") {
                // Map7: logique spécifique pour les portails
                if (portalGid === 1) {
                    destinationMap = "villagesortisud";
                    targetPortalId = 2;
                } else if (portalGid === 2) {
                    destinationMap = "map6";
                    targetPortalId = 1;
                } else if (portalGid === 3) {
                    // Portail ID 3 → Map 6 (portail ID 4)
                    destinationMap = "map6";
                    targetPortalId = 4;
                } else if (portalGid === 4) {
                    // Portail ID 4 → Map 6 (portail ID 4)
                    destinationMap = "map6";
                    targetPortalId = 4;
                }
            } else if (window.currentMap === "villagesortisud") {
                // Villagesortisud: logique spécifique pour les portails
                if (portalGid === 1) {
                    destinationMap = "villagecentre";
                    targetPortalId = 2;
                } else if (portalGid === 2) {
                    destinationMap = "map7";
                    targetPortalId = 1;
                } else if (portalGid === 3) {
                    destinationMap = "villagebasdroite";
                    targetPortalId = 4;
                } else if (portalGid === 4) {
                    destinationMap = "villagesbasgauche";
                    targetPortalId = 3;
                }
            } else if (window.currentMap === "villagecentre") {
                // Villagecentre: logique spécifique pour les portails

                if (portalGid === 1) {
                    destinationMap = "villagesortinord";
                    targetPortalId = 2;
                } else if (portalGid === 2) {
                    destinationMap = "villagesortisud";
                    targetPortalId = 1;
                } else if (portalGid === 3) {
                    destinationMap = "villagecentredroite";
                    targetPortalId = 4;
                                } else if (portalGid === 4) {
                    destinationMap = "villagecentregauche";
                    targetPortalId = 3;
                } else if (portalGid === 6) {
                    destinationMap = "banque";
                    targetPortalId = 7;
                }
            } else if (window.currentMap === "villagesbasgauche") {
                // Villagesbasgauche: logique spécifique pour les portails
                if (portalGid === 1) {
                    destinationMap = "villagecentregauche";
                    targetPortalId = 2;
                } else if (portalGid === 3) {
                    destinationMap = "villagesortisud";
                    targetPortalId = 4;
                }
            } else if (window.currentMap === "villagesortinord") {
                // Villagesortinord: logique spécifique pour les portails
                if (portalGid === 2) {
                    destinationMap = "villagecentre";
                    targetPortalId = 1;
                } else if (portalGid === 3) {
                    destinationMap = "villagehautdroite";
                    targetPortalId = 4;
                } else if (portalGid === 4) {
                    destinationMap = "villagehautgauche";
                    targetPortalId = 3;
                }
            } else if (window.currentMap === "villagehautdroite") {
                // Villagehautdroite: logique spécifique pour les portails
                if (portalGid === 2) {
                    destinationMap = "villagecentredroite";
                    targetPortalId = 1;
                } else if (portalGid === 4) {
                    destinationMap = "villagesortinord";
                    targetPortalId = 3;
                }

            } else if (window.currentMap === "banque") {
                // Banque: logique spécifique pour les portails
                if (portalGid === 7) {
                    destinationMap = "villagecentre";
                    targetPortalId = 6;
                }
            } else if (window.currentMap === "villagebasdroite") {
                // Villagebasdroite: logique spécifique pour les portails
                if (portalGid === 4) {
                    destinationMap = "villagesortisud";
                    targetPortalId = 3;
                } else if (portalGid === 1) {
                    destinationMap = "villagecentredroite";
                    targetPortalId = 2;
                }
            } else if (window.currentMap === "villagecentredroite") {
                // Villagecentredroite: logique spécifique pour les portails
                if (portalGid === 1) {
                    destinationMap = "villagehautdroite";
                    targetPortalId = 2;
                } else if (portalGid === 2) {
                    destinationMap = "villagebasdroite";
                    targetPortalId = 1;
                } else if (portalGid === 4) {
                    destinationMap = "villagecentre";
                    targetPortalId = 3;
                }
            } else if (window.currentMap === "villagecentregauche") {
                // Villagecentregauche: logique spécifique pour les portails
                if (portalGid === 1) {
                    destinationMap = "villagehautgauche";
                    targetPortalId = 2;
                } else if (portalGid === 2) {
                    destinationMap = "villagesbasgauche";
                    targetPortalId = 1;
                } else if (portalGid === 3) {
                    destinationMap = "villagecentre";
                    targetPortalId = 4;
                }
            } else if (window.currentMap === "villagehautgauche") {
                // Villagehautgauche: logique spécifique pour les portails
                if (portalGid === 2) {
                    destinationMap = "villagecentregauche";
                    targetPortalId = 1;
                } else if (portalGid === 3) {
                    destinationMap = "villagesortinord";
                    targetPortalId = 4;
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

                
                // PROTECTION SPÉCIALE pour MAP3 portail 2
                if (window.currentMap === "map3" && portalGid === 2 && destinationMap !== "map2") {
                    console.error(`🚨 PROTECTION ACTIVÉE - MAP3 portail 2 redirigé vers ${destinationMap} au lieu de map2!`);
                    destinationMap = "map2"; // FORCER la correction
                    targetPortalId = 1;
                }
                
                // PROTECTION SPÉCIALE pour MAP7 portail 3
                if (window.currentMap === "map7" && portalGid === 3 && destinationMap !== "map6") {
                    console.error(`🚨 PROTECTION ACTIVÉE - MAP7 portail 3 redirigé vers ${destinationMap} au lieu de map6!`);
                    destinationMap = "map6"; // FORCER la correction
                    targetPortalId = 4;
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
                // Armer un cooldown pour éviter la double détection pendant le chargement
                window.portalCooldownUntil = Date.now() + 800;
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
                        
                        // Gestion spéciale pour villagesortisud depuis map7 - position fixe
                        if (destinationMap === "villagesortisud" && window.currentMap === "map7") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 23, 23);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour map7 depuis villagesortisud - position fixe
                        if (destinationMap === "map7" && window.currentMap === "villagesortisud") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 23, 1);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagesbasgauche depuis villagesortisud - position fixe
                        if (destinationMap === "villagesbasgauche" && window.currentMap === "villagesortisud") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 46, 11);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagesortisud depuis villagesbasgauche - position fixe
                        if (destinationMap === "villagesortisud" && window.currentMap === "villagesbasgauche") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 1, 11);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagecentre depuis villagesortisud - position fixe
                        if (destinationMap === "villagecentre" && window.currentMap === "villagesortisud") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 23, 23);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagesortisud depuis villagecentre - position fixe
                        if (destinationMap === "villagesortisud" && window.currentMap === "villagecentre") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 23, 1);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagesortisud depuis villagebasdroite - position fixe
                        if (destinationMap === "villagesortisud" && window.currentMap === "villagebasdroite") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 46, 11);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagebasdroite depuis villagesortisud - position fixe
                        if (destinationMap === "villagebasdroite" && window.currentMap === "villagesortisud") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 1, 11);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagecentredroite depuis villagebasdroite - position fixe
                        if (destinationMap === "villagecentredroite" && window.currentMap === "villagebasdroite") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 23, 23);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagebasdroite depuis villagecentredroite - position fixe
                        if (destinationMap === "villagebasdroite" && window.currentMap === "villagecentredroite") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 23, 1);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagecentredroite depuis villagecentre - position fixe
                        if (destinationMap === "villagecentredroite" && window.currentMap === "villagecentre") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 1, 12);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagecentre depuis villagecentredroite - position fixe
                        if (destinationMap === "villagecentre" && window.currentMap === "villagecentredroite") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 46, 12);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagecentregauche depuis villagecentre - position fixe
                        if (destinationMap === "villagecentregauche" && window.currentMap === "villagecentre") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 46, 12);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagecentre depuis villagecentregauche - position fixe
                        if (destinationMap === "villagecentre" && window.currentMap === "villagecentregauche") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 1, 12);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagesbasgauche depuis villagecentregauche - position fixe
                        if (destinationMap === "villagesbasgauche" && window.currentMap === "villagecentregauche") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 28, 1);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagecentregauche depuis villagesbasgauche - position fixe
                        if (destinationMap === "villagecentregauche" && window.currentMap === "villagesbasgauche") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 28, 23);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagehautgauche depuis villagecentregauche - position fixe
                        if (destinationMap === "villagehautgauche" && window.currentMap === "villagecentregauche") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 28, 23);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagecentregauche depuis villagehautgauche - position fixe
                        if (destinationMap === "villagecentregauche" && window.currentMap === "villagehautgauche") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 28, 1);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagesortinord depuis villagehautgauche - position fixe
                        if (destinationMap === "villagesortinord" && window.currentMap === "villagehautgauche") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 1, 12);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagehautgauche depuis villagesortinord - position fixe
                        if (destinationMap === "villagehautgauche" && window.currentMap === "villagesortinord") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 46, 12);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagehautdroite depuis villagesortinord - position fixe
                        if (destinationMap === "villagehautdroite" && window.currentMap === "villagesortinord") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 1, 12);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagesortinord depuis villagehautdroite - position fixe
                        if (destinationMap === "villagesortinord" && window.currentMap === "villagehautdroite") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 46, 12);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagecentre depuis villagesortinord - position fixe
                        if (destinationMap === "villagecentre" && window.currentMap === "villagesortinord") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 23, 1);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagesortinord depuis villagecentre - position fixe
                        if (destinationMap === "villagesortinord" && window.currentMap === "villagecentre") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 23, 23);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagecentredroite depuis villagehautdroite - position fixe
                        if (destinationMap === "villagecentredroite" && window.currentMap === "villagehautdroite") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 23, 1);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagehautdroite depuis villagecentredroite - position fixe
                        if (destinationMap === "villagehautdroite" && window.currentMap === "villagecentredroite") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 23, 23);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour banque depuis villagecentre - position fixe
                        if (destinationMap === "banque" && window.currentMap === "villagecentre") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 13, 18);
                            }
                            return;
                        }
                        
                        // Gestion spéciale pour villagecentre depuis banque - position fixe
                        if (destinationMap === "villagecentre" && window.currentMap === "banque") {
                            if (typeof teleportPlayer === "function") {
                                teleportPlayer(destinationMap, 38, 9);
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
                        } else if (destinationMap === "map4" && window.currentMap === "map3") {
                                // Map 3 → Map 4 : position fixe (croix rouge)
                                destX = 1;
                                destY = 11;
                            } else if (destinationMap === "map4" && window.currentMap === "map5") {
                                // Map 5 (portail 4) → Map 4 (portail 3) : position demandée
                                destX = 46;
                                destY = 11;
                            } else if (destinationMap === "map6" && window.currentMap === "map5") {
                                // Map 5 (portail 3) → Map 6 (portail 4) : position (1, 12)
                                destX = 1;
                                destY = 12;
                            } else if (destinationMap === "map5" && window.currentMap === "map6") {
                                // Map 6 (portail 4) → Map 5 (portail 3) : position (46, 12)
                                destX = 46;
                                destY = 12;
                            } else if (destinationMap === "map7" && window.currentMap === "map6") {
                                // Map 6 (portail 4) → Map 7 (portail 3) : position (1, 13)
                                destX = 1;
                                destY = 13;
                            } else if (destinationMap === "map6" && window.currentMap === "map7") {
                                // Map 7 (portail 3) → Map 6 (portail 4) : position (46, 13)
                                destX = 46;
                                destY = 13;
                            } else if (destinationMap === "map6" && window.currentMap === "map7" && portalGid === 4) {
                                // Map 7 (portail 4) → Map 6 (portail 4) : position (46, 13)
                                destX = 46;
                                destY = 13;
                            } else if (destinationMap === "map7" && window.currentMap === "map6") {
                                // Map 6 (portail 3) → Map 7 (portail 4) : position (1, 13)
                                destX = 1;
                                destY = 13;
                            } else if (destinationMap === "map3" && window.currentMap === "map4") {
                                // Map 4 → Map 3 : position fixe (portail ID 3)
                                destX = 46;
                                destY = 13;
                            } else if (destinationMap === "map5" && window.currentMap === "map4") {
                                // Map 4 (portail 3) → Map 5 (portail 4) : position demandée
                                destX = 1;
                                destY = 10;
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
    if (!window.mapData || !window.mapData.layers) {
        return;
    }
    
    // Vérifier chaque calque à la position du joueur
    for (let layerIndex = 0; layerIndex < window.mapData.layers.length; layerIndex++) {
        const layer = window.mapData.layers[layerIndex];
        const tileIndex = player.y * layer.width + player.x;
        const tileId = layer.data[tileIndex];
        
        if (tileId !== 0) {
            // Vérifier si c'est un portail
            if (tileId === 1 || tileId === 2 || tileId === 3 || tileId === 4 || tileId === 12008 || tileId === 12208 || tileId === 15408 || tileId === 15608 || tileId === 6 || tileId === 7 || tileId === 7203 || tileId === 7403) {
                // Portail détecté
            }
        }
    }
};

// FONCTION D'URGENCE : Forcer la téléportation correcte depuis MAP3
window.fixMap3Portal2 = function() {
    if (window.currentMap !== "map3") {
        return;
    }
    
    if (typeof teleportPlayer === "function") {
        teleportPlayer("map2", 24, 1); // Position fixe pour map2
    }
};

// FONCTION D'URGENCE : Tester la logique de portail
window.testPortalLogic = function(portalId) {
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
    } else if (window.currentMap === "map5") {
        if (portalId === 3) {
            destinationMap = "map6";
        }
    } else if (window.currentMap === "map6") {
        if (portalId === 3) {
            destinationMap = "map7";
        } else if (portalId === 4) {
            destinationMap = "map5";
        }
    } else if (window.currentMap === "map7") {
        if (portalId === 3) {
            destinationMap = "map6";
        } else if (portalId === 4) {
            destinationMap = "map6";
        }
    }
    
    return destinationMap;
};

// FONCTION SPÉCIFIQUE : Tester les portails map7
window.testMap7Portals = function() {
    if (window.currentMap !== "map7") {
        return;
    }
    
    if (window.mapData && window.mapData.layers) {
        // Chercher les portails sur tous les calques
        for (let layerIndex = 0; layerIndex < window.mapData.layers.length; layerIndex++) {
            const layer = window.mapData.layers[layerIndex];
            let portails = [];
            
            for (let i = 0; i < layer.data.length; i++) {
                const tileId = layer.data[i];
                if (tileId === 1 || tileId === 2 || tileId === 3 || tileId === 4) {
                    const x = i % layer.width;
                    const y = Math.floor(i / layer.width);
                    portails.push({id: tileId, x: x, y: y});
                }
            }
        }
        
        // Test de téléportation forcée
        if (typeof teleportPlayer === "function") {
            teleportPlayer("map6", 46, 12);
        }
    }
};

// FONCTION SPÉCIFIQUE : Tester les portails map6
window.testMap6Portals = function() {
    if (window.currentMap !== "map6") {
        return;
    }
    
    if (window.mapData && window.mapData.layers) {
        // Chercher les portails sur tous les calques
        for (let layerIndex = 0; layerIndex < window.mapData.layers.length; layerIndex++) {
            const layer = window.mapData.layers[layerIndex];
            let portails = [];
            
            for (let i = 0; i < layer.data.length; i++) {
                const tileId = layer.data[i];
                if (tileId === 1 || tileId === 2 || tileId === 3 || tileId === 4) {
                    const x = i % layer.width;
                    const y = Math.floor(i / layer.width);
                    portails.push({id: tileId, x: x, y: y});
                }
            }
        }
        
        // Test de téléportation forcée
        if (typeof teleportPlayer === "function") {
            teleportPlayer("map7", 1, 13);
        }
    }
};

// FONCTION D'URGENCE : Forcer la téléportation map7 → map6
window.fixMap7Portal3 = function() {
    if (window.currentMap !== "map7") {
        return;
    }
    
    if (typeof teleportPlayer === "function") {
        teleportPlayer("map6", 46, 13); // Position fixe pour map6
    }
};

// Export de la fonction update
window.updatePlayer = updatePlayer;
window.updatePlayerRespawn = updatePlayerRespawn; 
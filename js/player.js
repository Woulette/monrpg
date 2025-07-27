// Constantes liées au joueur
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 32;
const TILE_SIZE = window.TILE_SIZE || 32;  // Utiliser la constante globale si possible
const MOVE_SPEED = 1.5;

// Initialisation du joueur
const player = {
    x: 24,
    y: 14,
    direction: 0,
    frame: 0,
    px: 24 * TILE_SIZE,
    py: 14 * TILE_SIZE,
    moving: false,
    moveTarget: { x: 24, y: 14 },
    path: [],
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    maxLife: 50,
    life: 50,
    // Statistiques de base (modifiables avec points de caractéristiques)
    baseForce: 1,
    baseIntelligence: 1,
    baseAgilite: 1,
    baseDefense: 1,
    baseChance: 1,
    baseVitesse: 1,
    baseVie: 1, // Stat de vie de base
    
    // Statistiques d'équipement (calculées automatiquement)
    equipForce: 0,
    equipIntelligence: 0,
    equipAgilite: 0,
    equipDefense: 0,
    equipChance: 0,
    equipVitesse: 0,
    equipVie: 0, // Bonus de vie via équipement
    
    // Statistiques totales (affichées) = base + combat + équipement
    force: 1,
    intelligence: 1,
    agilite: 1,
    defense: 1,
    chance: 1,
    vitesse: 1,
    vie: 1, // Stat totale de vie
    
    // Stats gagnées par l'XP de combat (permanentes, non modulables)
    combatForce: 0,
    combatIntelligence: 0,
    combatAgilite: 0,
    combatDefense: 0,
    combatChance: 0,
    combatVitesse: 0,
    combatVie: 0,
    
    // XP des statistiques de base
    forceXp: 0,
    intelligenceXp: 0,
    agiliteXp: 0,
    defenseXp: 0,
    chanceXp: 0,
    vitesseXp: 0,
    // XP nécessaire pour le prochain niveau de chaque stat de base
    forceXpToNext: 10,
    intelligenceXpToNext: 10,
    agiliteXpToNext: 10,
    defenseXpToNext: 10,
    chanceXpToNext: 10,
    vitesseXpToNext: 50, // 5 points de caractéristique = +1 vitesse
    // Points de caractéristiques à distribuer (modulables)
    statPoints: 0, // Démarrage avec 0 point
    // Monnaie
    pecka: 0,
    // État de combat
    inCombat: false,
    lastCombatTime: 0,
    lastRegenTime: 0,
    // Suivi automatique
    autoFollow: false,
    // Système de mort et respawn
    isDead: false,
    deathTime: 0,
    respawnTime: 3000, // 3 secondes pour le respawn
    spawnX: 24, // Point de spawn
    spawnY: 14
};

// Initialiser les stats totales au démarrage
recalculateTotalStats();

// Rendre la fonction de réinitialisation disponible globalement
window.resetPlayer = resetPlayer;

function initPlayer() {
    
    // Initialiser la position du joueur
    player.px = player.x * TILE_SIZE;
    player.py = player.y * TILE_SIZE;
    
    // Marquer la position initiale comme occupée
    if (typeof occupy === "function") {
        occupy(player.x, player.y);
    }
    
}

// Fonction pour réinitialiser complètement le joueur
function resetPlayer() {
    console.log("Réinitialisation complète du joueur...");
    
    // Réinitialiser les propriétés de base
    player.x = 24;
    player.y = 14;
    player.direction = 0;
    player.frame = 0;
    player.px = 24 * TILE_SIZE;
    player.py = 14 * TILE_SIZE;
    player.moving = false;
    player.moveTarget = { x: 24, y: 14 };
    player.path = [];
    
    // Réinitialiser le niveau et l'XP
    player.level = 1;
    player.xp = 0;
    player.xpToNextLevel = 100;
    
    // Réinitialiser la vie
    player.maxLife = 50;
    player.life = 50;
    
    // Réinitialiser les statistiques de base
    player.baseForce = 1;
    player.baseIntelligence = 1;
    player.baseAgilite = 1;
    player.baseDefense = 1;
    player.baseChance = 1;
    player.baseVitesse = 1;
    player.baseVie = 1;
    
    // Réinitialiser les stats de combat (permanentes)
    player.combatForce = 0;
    player.combatIntelligence = 0;
    player.combatAgilite = 0;
    player.combatDefense = 0;
    player.combatChance = 0;
    player.combatVitesse = 0;
    player.combatVie = 0;
    
    // Réinitialiser les statistiques d'équipement
    player.equipForce = 0;
    player.equipIntelligence = 0;
    player.equipAgilite = 0;
    player.equipDefense = 0;
    player.equipChance = 0;
    player.equipVitesse = 0;
    player.equipVie = 0;
    
    // Réinitialiser l'XP des statistiques
    player.forceXp = 0;
    player.intelligenceXp = 0;
    player.agiliteXp = 0;
    player.defenseXp = 0;
    player.chanceXp = 0;
    player.vitesseXp = 0;
    
    // Réinitialiser l'XP nécessaire pour le prochain niveau
    player.forceXpToNext = 10;
    player.intelligenceXpToNext = 10;
    player.agiliteXpToNext = 10;
    player.defenseXpToNext = 10;
    player.chanceXpToNext = 10;
    player.vitesseXpToNext = 50;
    
    // Réinitialiser les points de caractéristiques
    player.statPoints = 0; // Démarrage avec 0 point
    
    // Réinitialiser la monnaie
    player.pecka = 0;
    
    // Réinitialiser l'état de combat
    player.inCombat = false;
    player.lastCombatTime = 0;
    player.lastRegenTime = 0;
    
    // Réinitialiser le suivi automatique
    player.autoFollow = false;
    
    // Réinitialiser le système de mort et respawn
    player.isDead = false;
    player.deathTime = 0;
    player.respawnTime = 3000;
    player.spawnX = 24;
    player.spawnY = 14;
    
    // Recalculer les stats totales
    recalculateTotalStats();
    
    console.log("Joueur réinitialisé avec succès");
}

// Chargement de l'image du joueur
window.playerImg = new Image();
window.playerImg.onload = () => {
    console.log('✓ Image du joueur chargée avec succès');
};
window.playerImg.onerror = () => {
    console.error('✗ Erreur de chargement de l\'image du joueur: assets/personnages/player.png');
};
window.playerImg.src = 'assets/personnages/player.png';

// Constantes pour combat
const PLAYER_ATTACK_DAMAGE = 5;
const PLAYER_ATTACK_RANGE = 1;
let attackTarget = null; // Monstre ciblé pour le combat
window.attackTarget = attackTarget;

// Fonction utilitaire pour détecter les monstres dans une zone
function findMonsterInRadius(mx, my, radius) {
    if (!monsters || monsters.length === 0) return null;
    
    let closestMonster = null;
    let closestDistance = radius;
    
    monsters.forEach(monster => {
        if (monster.hp > 0 && !monster.isDead) {
            // Calculer la position réelle du sprite du monstre (comme dans drawMonsters)
            let monsterSize = 32;
            let monsterHeight = 32;
            let offsetX, offsetY;
            
            if (monster.type === "maitrecorbeau") {
                monsterSize = 48;
                monsterHeight = 64;
                offsetX = (TILE_SIZE / 2) - (monsterSize / 2);
                offsetY = TILE_SIZE - monsterHeight;
            } else {
                offsetX = (TILE_SIZE / 2) - (monsterSize / 2);
                offsetY = (TILE_SIZE / 2) - (monsterHeight / 2);
            }
            
            // Position réelle du centre du sprite (pas du centre de la case)
            const monsterCenterX = monster.px + offsetX + monsterSize / 2;
            const monsterCenterY = monster.py + offsetY + monsterHeight / 2;
            
            const distance = Math.sqrt(
                Math.pow(mx - monsterCenterX, 2) + Math.pow(my - monsterCenterY, 2)
            );
            
            if (distance <= radius && distance < closestDistance) {
                closestDistance = distance;
                closestMonster = monster;
            }
        }
    });
    
    return closestMonster;
}

// Fonction pour recalculer les stats totales
function recalculateTotalStats() {
    // Stats totales = Base (modulables) + Combat (permanentes) + Équipement
    player.force = player.baseForce + player.combatForce + player.equipForce;
    player.intelligence = player.baseIntelligence + player.combatIntelligence + player.equipIntelligence;
    player.agilite = player.baseAgilite + player.combatAgilite + player.equipAgilite;
    player.defense = player.baseDefense + player.combatDefense + player.equipDefense;
    player.chance = player.baseChance + player.combatChance + player.equipChance;
    player.vitesse = player.baseVitesse + player.combatVitesse + player.equipVitesse;
    player.vie = player.baseVie + player.combatVie + player.equipVie;
}

// Rendre la fonction accessible globalement
window.recalculateTotalStats = recalculateTotalStats;

// Fonctions pour l'augmentation des stats
function gainStatXP(statName, amount) {
    
    const xpProp = statName + 'Xp';
    const xpToNextProp = statName + 'XpToNext';
    
    if (player[xpProp] !== undefined) {
        player[xpProp] += amount;
        
        // Vérifier si la stat monte
        while (player[xpProp] >= player[xpToNextProp]) {
            player[xpProp] -= player[xpToNextProp];
            // Modifier la stat de combat (permanente, non modulable)
            const combatStatName = 'combat' + statName.charAt(0).toUpperCase() + statName.slice(1);
            player[combatStatName]++;
            
            // Recalculer les stats totales
            recalculateTotalStats();
            
            // Augmenter l'XP nécessaire pour le prochain niveau (courbe exponentielle)
            player[xpToNextProp] = Math.floor(player[xpToNextProp] * 1.2);
            
            
            // Mettre à jour l'affichage et animer
            if (typeof updateStatsDisplay === "function") {
                updateStatsDisplay();
            }
            if (typeof updateStatsModalDisplay === "function") {
                updateStatsModalDisplay();
            }
            if (typeof animateStatLevelUp === "function") {
                animateStatLevelUp(statName);
            }
        }
        
        // Mettre à jour l'affichage même si pas de level up
        if (typeof updateStatsDisplay === "function") {
            updateStatsDisplay();
        }
        if (typeof updateStatsModalDisplay === "function") {
            updateStatsModalDisplay();
        }
    }
}

// Calcul des dégâts d'attaque avec la force
function getPlayerAttackDamage() {
    // Coup de poing : dégâts aléatoires entre 3 et 6
    return Math.floor(Math.random() * 4) + 3; // 3, 4, 5 ou 6
}

// Calcul des dégâts reçus avec la défense
function getPlayerDamageReceived(baseDamage) {
    return Math.max(1, baseDamage - player.defense);
}

// Calcul de la chance de critique avec l'agilité
function getPlayerCritChance() {
    return Math.floor(player.agilite / 10) * 0.5; // 10 agilité = 0.5% critique
}

// Calcul des dégâts critiques avec l'agilité
function getPlayerCritDamage() {
    return Math.floor(player.agilite / 10) / 100; // 10 agilité = +1% de dégâts critiques
}

// Vérification si le joueur fait un critique
function isPlayerCrit() {
    return Math.random() * 100 < 1; // 1% de chance pour tester
    // return Math.random() * 100 < getPlayerCritChance();
}

// Vérification si le joueur esquive
function isPlayerDodge() {
    return Math.random() * 100 < Math.floor(player.agilite / 10); // 10 agilité = 1% esquive
}

// Variables animation
let lastAnim = 0;
const animDelay = 120;
function drawPlayer(ctx) {
    if (!window.playerImg || player.isDead) return;
    ctx.drawImage(
        window.playerImg,
        player.frame * PLAYER_WIDTH,
        player.direction * PLAYER_HEIGHT,
        PLAYER_WIDTH, PLAYER_HEIGHT,
        player.px + (window.mapOffsetX || 0), player.py + (window.mapOffsetY || 0),
        TILE_SIZE, TILE_SIZE
    );
}



function isMonsterAt(x, y) {
    return monsters.some(m => m.x === x && m.y === y && m.hp > 0);
}

// Avance vers la prochaine étape du chemin
function nextStepToTarget() {
    if (!player.path || player.path.length === 0) {
        player.moving = false;
        // Vérifier si on doit ouvrir la fenêtre de craft
        if (window.pendingOpenCraftTable) {
            // Vérifier si le joueur est adjacent à la table
            const table = window.pendingOpenCraftTable;
            const dx = Math.abs(player.x - table.x);
            const dy = Math.abs(player.y - table.y);
            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                if (table.type === 'cordonnier' && typeof openCordonnierWorkshopModal === 'function') {
                    openCordonnierWorkshopModal();
                } else if (table.type === 'bijoutier' && typeof openBijoutierWorkshopModal === 'function') {
                    openBijoutierWorkshopModal();
                } else if (typeof openTailorWorkshopModal === 'function') {
                    openTailorWorkshopModal();
                } else {
                    console.log('ERREUR: aucune fonction d\'atelier trouvée !');
                }
                window.pendingOpenCraftTable = null;
            }
        }
        return;
    }
    const next = player.path.shift();
    if (!next) {
        player.moving = false;
        return;
    }
    
    // Vérifier si la case suivante est une tile de téléportation
    if (window.mapData && window.mapData.layers && window.mapData.layers.length > 0) {
        const layer1 = window.mapData.layers[0];
        const tileIndex = next.y * layer1.width + next.x;
        const tileId = layer1.data[tileIndex];
        
        // Permettre de marcher sur les tiles de téléportation (ID 0 et 1)
        if (tileId === 0 || tileId === 1) {
            // Autoriser le mouvement vers cette tile
        } else {
            // Si la case suivante est occupée par un monstre ET que ce n'est PAS la destination finale, on bloque
            const isLastStep = player.path.length === 0;
            if (isMonsterAt(next.x, next.y) && !isLastStep) {
                player.moving = false;
                player.path = [];
                return;
            }
        }
    }
    
    if (next.x < player.x) player.direction = 3;
    else if (next.x > player.x) player.direction = 1;
    else if (next.y < player.y) player.direction = 2;
    else if (next.y > player.y) player.direction = 0;

    player.moveTarget.x = next.x;
    player.moveTarget.y = next.y;
    player.moving = true;
}
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
        return; // Arrêter l'update si le joueur est mort
    }
    
    // Si le joueur est mort, ne pas continuer l'update
    if (player.isDead) {
        return;
    }
    
    // Déplacement fluide
    if (player.moving) {
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
            player.frame = 0;

            nextStepToTarget();
        } else {
            // Appliquer la vitesse du joueur (1 vitesse = +0.01 de vitesse de déplacement)
            let currentMoveSpeed = MOVE_SPEED * (1 + (player.vitesse - 1) * 0.01);
            
            // Bonus de vitesse par niveau (+0.01 par niveau au-dessus de 1)
            const levelSpeedBonus = (player.level - 1) * 0.01;
            currentMoveSpeed += levelSpeedBonus;
            
            // Ralentir le joueur sur la carte du donjon slime pour compenser la petite taille
            if (window.currentMap && window.currentMap.includes('mapdonjonslime')) {
                currentMoveSpeed *= 0.5; // Ralentir de 50%
            }
            if (dx !== 0) player.px += currentMoveSpeed * Math.sign(dx);
            if (dy !== 0) player.py += currentMoveSpeed * Math.sign(dy);
            

        }
    }

    // Gestion du combat
    if (
        attackTarget &&
        attackTarget.hp > 0 &&
        player.life > 0
    ) {
        // L'aggro ne sera déclenché que lors d'une vraie attaque, pas juste une sélection
        // attackTarget.aggro = true; // DÉPLACÉ vers la vraie attaque
        // attackTarget.aggroTarget = player; // DÉPLACÉ vers la vraie attaque
        // player.inCombat = true; // DÉPLACÉ vers la vraie attaque

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
                  const res = computeSpellDamage(3, 6);
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

                // Riposte du monstre si vivant
                if (attackTarget.hp > 0) {
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

    // Système de régénération de vie
    if (!player.inCombat && player.life < player.maxLife) {
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
        if (currentTime - player.deathTime >= player.respawnTime) {
            respawnPlayer();
        }
    }
    
    // Vérification de téléportation automatique
    if (window.mapData && window.mapData.layers && window.mapData.layers.length > 0) {
        // Chercher tous les portails (ID 1, 2, 3, 4) dans tous les calques
        let portalFound = false;
        let portalGid = null;
        
        for (let layerIndex = 0; layerIndex < window.mapData.layers.length; layerIndex++) {
            const layer = window.mapData.layers[layerIndex];
            const tileIndex = player.y * layer.width + player.x;
            const tileId = layer.data[tileIndex];
            
            if (tileId === 1 || tileId === 2 || tileId === 3 || tileId === 4) {
                portalFound = true;
                portalGid = tileId;
                break;
            }
        }

        // Portail détecté
        if (portalFound) {
            console.log(`Portail ID ${portalGid} détecté sur ${window.currentMap}`);
            
            // Logique générale pour toutes les maps
            let destinationMap = null;
            let targetPortalId = null;
            
            // Extraire le numéro de la map actuelle
            const currentMapNumber = parseInt(window.currentMap.replace('map', ''));
            
            // Gestion spéciale pour la map 3
            if (window.currentMap === "map3") {
                if (portalGid === 1) {
                    // Portail ID 1 → Map Slime
                    destinationMap = "mapdonjonslime";
                    targetPortalId = 2;
                } else if (portalGid === 2) {
                    // Portail ID 2 → Map 2
                    destinationMap = "map2";
                    targetPortalId = 1;
                } else if (portalGid === 3) {
                    // Portail ID 3 → Map 4 (si elle existe)
                    destinationMap = `map${currentMapNumber + 1}`;
                    targetPortalId = 4;
                } else if (portalGid === 4) {
                    // Portail ID 4 → Map 2
                    destinationMap = `map${currentMapNumber - 1}`;
                    targetPortalId = 3;
                }
            } else if (window.currentMap === "mapdonjonslime") {
                // Gestion spéciale pour la map slime
                if (portalGid === 2) {
                    // Portail ID 2 → Map 3
                    destinationMap = "map3";
                    targetPortalId = 1;
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
                    .then(response => response.json())
                    .then(mapData => {
                        // Chercher le portail de destination dans tous les calques
                        let targetPortal = null;
                        console.log(`Recherche du portail ID ${targetPortalId} sur ${destinationMap}...`);
                        
                        for (let layerIndex = 0; layerIndex < mapData.layers.length; layerIndex++) {
                            const layer = mapData.layers[layerIndex];
                            for (let y = 0; y < layer.height; y++) {
                                for (let x = 0; x < layer.width; x++) {
                                    const idx = y * layer.width + x;
                                    if (layer.data[idx] === targetPortalId) {
                                        targetPortal = {x, y};
                                        console.log(`Portail ID ${targetPortalId} trouvé sur ${destinationMap} à la position (${x}, ${y})`);
                                        break;
                                    }
                                }
                                if (targetPortal) break;
                            }
                            if (targetPortal) break;
                        }
                        
                        if (!targetPortal) {
                            console.log(`Portail ID ${targetPortalId} non trouvé sur ${destinationMap}`);
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
                            // Calculer la case d'arrivée en fonction de la direction
                            let destX = closest.x + dx;
                            let destY = closest.y + dy;
                            // Vérifier que la case d'arrivée est dans la map et pas un portail
                            if (destX < 0) destX = 0;
                            if (destY < 0) destY = 0;
                            if (destX >= mapData.width) destX = mapData.width - 1;
                            if (destY >= mapData.height) destY = mapData.height - 1;
                            
                            // Vérifier si la case d'arrivée est un portail dans n'importe quel calque
                            let isPortalAtDestination = false;
                            for (let layerIndex = 0; layerIndex < mapData.layers.length; layerIndex++) {
                                const layer = mapData.layers[layerIndex];
                                if (layer.data[destY * layer.width + destX] === targetPortalId) {
                                    isPortalAtDestination = true;
                                    break;
                                }
                            }
                            
                            if (isPortalAtDestination) {
                                // Si la case d'arrivée est un portail, on place à côté (autre direction)
                                if (dx !== 0) destX += dx; // Avancer encore d'une case
                                if (dy !== 0) destY += dy;
                                // Si toujours pas possible, fallback au centre
                                let stillPortal = false;
                                for (let layerIndex = 0; layerIndex < mapData.layers.length; layerIndex++) {
                                    const layer = mapData.layers[layerIndex];
                                    if (layer.data[destY * layer.width + destX] === targetPortalId) {
                                        stillPortal = true;
                                        break;
                                    }
                                }
                                if (destX < 0 || destY < 0 || destX >= mapData.width || destY >= mapData.height || stillPortal) {
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
        // --- PORTAIL MAP2 → MAP3 ---
        if (window.currentMap === "map2" && window.mapData) {
            const layer4 = window.mapData.layers.find(layer => layer.id === 4);
            if (layer4) {
                const idx = player.y * window.mapData.width + player.x;
                const gid = layer4.data[idx];
                console.log('[DEBUG portail map2]', 'x:', player.x, 'y:', player.y, 'gid:', gid);
                if (gid === 1) {
                    teleportPlayer('map3', Math.floor(window.mapData.width/2), Math.floor(window.mapData.height/2));
                    return;
                }
            }
        }

    }
}
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

        // Recherche d’un monstre vivant sur la case cliquée
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
                    window.pendingOpenCraftTable = {x: nx, y: ny, type: 'tailleur'};
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
                return;
            }
            
            // Établie du cordonnier (IDs 614, 615, 814, 815)
            if ([614, 615, 814, 815].includes(tileId2) || [614, 615, 814, 815].includes(tileId4)) {
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
                    window.pendingOpenCraftTable = {x: nx, y: ny, type: 'cordonnier'};
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
                return;
            }
            
            // Établie du bijoutier (IDs 616, 617, 816, 817)
            if ([616, 617, 816, 817].includes(tileId2) || [616, 617, 816, 817].includes(tileId4)) {
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
                    window.pendingOpenCraftTable = {x: nx, y: ny, type: 'bijoutier'};
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
                return;
            }
            
            // Table du tailleur (ancienne logique + nouveaux IDs)
            if ([156, 157].includes(tileId2) || [156, 157].includes(tileId4)) {
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
                    window.pendingOpenCraftTable = {x: nx, y: ny, type: 'tailleur'};
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
                return;
            }
            // Table du cordonnier (nouveaux IDs)
            if ([204, 205, 206, 207].includes(tileId2) || [204, 205, 206, 207].includes(tileId4)) {
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
                    let closest = adjacents[0];
                    let minDist = Math.abs(player.x - closest.x) + Math.abs(player.y - closest.y);
                    for (let i = 1; i < adjacents.length; i++) {
                        const d = Math.abs(player.x - adjacents[i].x) + Math.abs(player.y - adjacents[i].y);
                        if (d < minDist) {
                            minDist = d;
                            closest = adjacents[i];
                        }
                    }
                    window.pendingOpenCraftTable = {x: nx, y: ny, type: 'cordonnier'};
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
                return;
            }
            // Table du bijoutier (nouveaux IDs)
            if ([160, 161, 208, 209].includes(tileId2) || [160, 161, 208, 209].includes(tileId4)) {
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
                    let closest = adjacents[0];
                    let minDist = Math.abs(player.x - closest.x) + Math.abs(player.y - closest.y);
                    for (let i = 1; i < adjacents.length; i++) {
                        const d = Math.abs(player.x - adjacents[i].x) + Math.abs(player.y - adjacents[i].y);
                        if (d < minDist) {
                            minDist = d;
                            closest = adjacents[i];
                        }
                    }
                    window.pendingOpenCraftTable = {x: nx, y: ny, type: 'bijoutier'};
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
                return;
            }
            // Atelier tailleur sur 108, 109 (déplacement + ouverture à l'arrivée)
            if ([108, 109].includes(tileId2) || [108, 109].includes(tileId4)) {
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
                    let closest = adjacents[0];
                    let minDist = Math.abs(player.x - closest.x) + Math.abs(player.y - closest.y);
                    for (let i = 1; i < adjacents.length; i++) {
                        const d = Math.abs(player.x - adjacents[i].x) + Math.abs(player.y - adjacents[i].y);
                        if (d < minDist) {
                            minDist = d;
                            closest = adjacents[i];
                        }
                    }
                    window.pendingOpenCraftTable = {x: nx, y: ny, type: 'tailleur'};
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
                return;
            }
            // Atelier cordonnier sur 158, 159 (déplacement + ouverture à l'arrivée)
            if ([158, 159].includes(tileId2) || [158, 159].includes(tileId4)) {
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
                    let closest = adjacents[0];
                    let minDist = Math.abs(player.x - closest.x) + Math.abs(player.y - closest.y);
                    for (let i = 1; i < adjacents.length; i++) {
                        const d = Math.abs(player.x - adjacents[i].x) + Math.abs(player.y - adjacents[i].y);
                        if (d < minDist) {
                            minDist = d;
                            closest = adjacents[i];
                        }
                    }
                    window.pendingOpenCraftTable = {x: nx, y: ny, type: 'cordonnier'};
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
                return;
            }
        }
        
        // Sinon, déplacement classique vers la case cliquée
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
                console.log("Aucune case accessible trouvée près de la destination");
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
    
    // Gestionnaire de touche espace pour attaquer le monstre sélectionné
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
            e.preventDefault(); // Empêcher le défilement de la page
            
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
                        
                        // Riposte du monstre s'il est encore vivant
                        if (attackTarget.hp > 0) {
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
    });
});

function gainXP(amount) {
    player.xp += amount;
    while (player.xp >= player.xpToNextLevel) {
        player.xp -= player.xpToNextLevel;
        player.level++;
        player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.2); // courbe exponentielle
        
        // Augmenter les points de vie max de 5 à chaque niveau
        player.maxLife += 5;
        // Restaurer complètement la vie lors du level up
        player.life = player.maxLife;
        
        // Ajouter 3 points de caractéristiques à distribuer
        player.statPoints += 3;
        
        
        // Afficher le message flottant de niveau
        if (typeof showLevelUp === 'function') {
            showLevelUp(player.level, 3);
        }
        
        // Mettre à jour l'affichage des stats si la fenêtre est ouverte
        if (typeof updateStatsModalDisplay === 'function') {
            updateStatsModalDisplay();
        }
        
        // Sauvegarde automatique lors du level up
        if (typeof autoSaveOnEvent === 'function') {
            autoSaveOnEvent();
        }
    }
    
    // Sauvegarde automatique lors du gain d'XP
    if (typeof autoSaveOnEvent === 'function') {
        autoSaveOnEvent();
    }
}

// Système de bulles de dialogue du joueur
let playerBubbles = [];

// Créer une bulle de dialogue au-dessus du joueur
function createPlayerBubble(message) {
    // Supprimer les anciennes bulles
    removePlayerBubbles();
    
    // Créer la nouvelle bulle
    const bubble = {
        message: message,
        opacity: 1,
        startTime: Date.now(),
        duration: 4000 // 4 secondes
    };
    
    playerBubbles.push(bubble);
}

// Supprimer toutes les bulles
function removePlayerBubbles() {
    playerBubbles = [];
}

// Dessiner les bulles de dialogue
function drawPlayerBubbles(ctx) {
    const currentTime = Date.now();
    
    playerBubbles = playerBubbles.filter(bubble => {
        const elapsed = currentTime - bubble.startTime;
        const progress = elapsed / bubble.duration;
        
        if (progress >= 1) {
            return false; // Supprimer la bulle
        }
        
        // Calculer l'opacité (fade out dans les 500ms avant la fin)
        if (progress > 0.875) { // 500ms avant la fin
            bubble.opacity = 1 - ((progress - 0.875) / 0.125);
        }
        
        // Dessiner la bulle
        drawBubble(ctx, bubble);
        return true;
    });
}

// Dessiner une bulle individuelle
function drawBubble(ctx, bubble) {
    const text = bubble.message;
    const fontSize = 14;
    const padding = 6;
    
    // Mesurer le texte
    ctx.font = `bold ${fontSize}px Arial`;
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;
    
    // Dimensions du fond
    const bgWidth = textWidth + padding * 2;
    const bgHeight = textHeight + padding * 2;
    
    // Position (centré au-dessus du joueur, suit le mouvement)
    const bgX = player.px + (TILE_SIZE - bgWidth) / 2 + (window.mapOffsetX || 0);
    const bgY = player.py - bgHeight - 15 + (window.mapOffsetY || 0);
    
    // Sauvegarder le contexte
    ctx.save();
    
    // Appliquer l'opacité
    ctx.globalAlpha = bubble.opacity;
    
    // Dessiner le fond blanc
    ctx.fillStyle = 'white';
    ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
    
    // Dessiner le texte en noir
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bgX + bgWidth / 2, bgY + bgHeight / 2);
    
    // Restaurer le contexte
    ctx.restore();
}

// Fonction pour faire respawn le joueur
function respawnPlayer() {
    
    // Pénalité d'XP de 5%
    const xpPenalty = Math.floor(player.xp * 0.05);
    player.xp = Math.max(0, player.xp - xpPenalty);
    
    // Afficher la pénalité d'XP au-dessus du joueur
    if (typeof displayDamage === "function" && xpPenalty > 0) {
        displayDamage(player.px, player.py, `-${xpPenalty} XP`, 'damage', true);
    }
    
    // Libérer l'ancienne position
    if (typeof release === "function") {
        release(player.x, player.y);
    }
    
    // Remettre le joueur au point de spawn
    player.x = player.spawnX;
    player.y = player.spawnY;
    player.px = player.spawnX * TILE_SIZE;
    player.py = player.spawnY * TILE_SIZE;
    
    // Restaurer la vie
    player.life = player.maxLife;
    
    // Réinitialiser l'état
    player.isDead = false;
    player.inCombat = false;
    player.moving = false;
    player.path = [];
    player.moveTarget = { x: player.spawnX, y: player.spawnY };
    
    // Nettoyer les cibles de combat
    if (attackTarget) {
        attackTarget.aggro = false;
        attackTarget.aggroTarget = null;
    }
    attackTarget = null;
    window.attackTarget = null;
    
    // Marquer la nouvelle position comme occupée
    if (typeof occupy === "function") {
        occupy(player.x, player.y);
    }
    
}

// Rendre la fonction accessible globalement
window.respawnPlayer = respawnPlayer;


// Export global des fonctions
window.gainXP = gainXP;
window.gainStatXP = gainStatXP;
window.createPlayerBubble = createPlayerBubble;
window.drawPlayerBubbles = drawPlayerBubbles;


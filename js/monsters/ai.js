// js/monsters/ai.js

function nextStepMonster(monster, now) {
    if (!monster.movePath || monster.movePath.length === 0) {
        monster.state = "idle";
        monster.frame = 0;
        monster.moving = false;
        return;
    }

    // Supprime les étapes du chemin déjà atteintes
    while (
        monster.movePath.length > 0 &&
        monster.movePath[0] &&
        monster.movePath[0].x === monster.x &&
        monster.movePath[0].y === monster.y
    ) {
        monster.movePath.shift();
    }

    if (monster.movePath.length === 0) {
        monster.state = "idle";
        monster.frame = 0;
        monster.moving = false;
        return;
    }

    const next = monster.movePath.shift();
    if (!next) {
        monster.state = "idle";
        monster.frame = 0;
        monster.moving = false;
        return;
    }

    if (next.x < monster.x) monster.direction = 3;
    else if (next.x > monster.x) monster.direction = 1;
    else if (next.y < monster.y) monster.direction = 2;
    else if (next.y > monster.y) monster.direction = 0;

    monster.moveTarget.x = next.x;
    monster.moveTarget.y = next.y;
    monster.moving = true;
    monster.stuckSince = 0;
}

function moveMonsters(ts) {
    monsters.forEach(monster => {
        if (!monster.moving) return;

        let tx = monster.moveTarget.x * TILE_SIZE;
        let ty = monster.moveTarget.y * TILE_SIZE;
        let dx = tx - monster.px;
        let dy = ty - monster.py;
        
        // Gestion du blocage
        if (monster.stuckSince && ts - monster.stuckSince > 2000) {
            monster.px = tx;
            monster.py = ty;
            monster.moving = false;
            monster.stuckSince = 0;
            // Appeler nextStepMonster seulement s'il y a encore un chemin
            if (monster.movePath && monster.movePath.length > 0) {
                nextStepMonster(monster, ts);
            } else {
                monster.moveCooldown = ts + 3000; // Cooldown de 3 secondes
            }
            return;
        }

        if (Math.abs(dx) <= monster.moveSpeed && Math.abs(dy) <= monster.moveSpeed) {
            release(monster.x, monster.y);
            monster.px = tx;
            monster.py = ty;
            monster.x = monster.moveTarget.x;
            monster.y = monster.moveTarget.y;
            occupy(monster.x, monster.y);
            monster.moving = false;
            monster.frame = 0;
            monster.stuckSince = 0;
            // Appeler nextStepMonster seulement s'il y a encore un chemin
            if (monster.movePath && monster.movePath.length > 0) {
                nextStepMonster(monster, ts);
            } else {
                // Arrivé à destination finale, mettre un cooldown et laisser updateMonsters gérer
                monster.moveCooldown = ts + 3000; // Cooldown de 3 secondes
            }
        } else {
            if (!monster.stuckSince) monster.stuckSince = ts;
            if (dx !== 0) monster.px += monster.moveSpeed * Math.sign(dx);
            if (dy !== 0) monster.py += monster.moveSpeed * Math.sign(dy);
        }

        // Animation marche
        if (!monster.lastAnim || ts - monster.lastAnim > monster.animDelay) {
            monster.frame = (monster.frame + 1) % 4;
            monster.lastAnim = ts;
        }
    });
}

// Nouvelle IA monstre : claire, robuste, fluide
// Etats : idle, patrol, aggro, return
// Pathfinding dynamique en aggro
// Timer de patrouille unique

const PATROL_DELAY_MIN = 3000; // ms minimum entre chaque patrouille
const PATROL_DELAY_MAX = 10000; // ms maximum entre chaque patrouille
const AGGRO_RANGE = 8;     // distance d'aggro
const DEAGGRO_RANGE = 20;  // distance de délock (augmenté)
const AGGRO_TIMEOUT = 8000; // ms sans combat pour délock

// Fonction pour générer un délai de patrouille aléatoire
function getRandomPatrolDelay() {
    return PATROL_DELAY_MIN + Math.random() * (PATROL_DELAY_MAX - PATROL_DELAY_MIN);
}

function updateMonsters(ts) {
    // Protection contre les timestamps invalides
    if (!ts || ts < 0) {
        console.warn("Timestamp invalide détecté, utilisation de Date.now()");
        ts = Date.now();
    }
    
    // Protection contre les boucles infinies
    if (!window.mapData) return;
    
    // Protection contre les monstres invalides
    if (!monsters || !Array.isArray(monsters)) {
        console.warn("Liste de monstres invalide");
        return;
    }
    
    for (let monster of monsters) {
        // Protection contre les monstres invalides
        if (!monster || typeof monster !== 'object') {
            console.warn("Monstre invalide détecté, ignoré");
            continue;
        }
        
        if (!monster.img || monster.hp <= 0) continue;
        
        // Mettre à jour l'alignement fluide si nécessaire
        if (typeof updateMonsterAlignment === 'function') {
            updateMonsterAlignment(monster);
        }
        
        // Animation idle pour le slime (même quand il ne bouge pas)
        if (monster.type === "slime" && !monster.moving) {
            // Protection contre les boucles infinies
            if (!monster.lastAnim || ts - monster.lastAnim > monster.animDelay) {
                monster.frame = (monster.frame + 1) % 4;
                monster.lastAnim = ts;
                
                // Protection supplémentaire : réinitialiser si l'animation tourne trop longtemps
                if (ts - monster.lastAnim > 10000) { // 10 secondes max
                    monster.lastAnim = ts;
                    monster.frame = 0;
                }
            }
        }
        
        // Mouvement en cours : on ne touche pas au path sauf en aggro
        if (monster.moving && monster.state !== 'aggro') continue;
        
        // --- DÉTECTION AGGRO ---
        let distToPlayer = Math.abs(player.x - monster.x) + Math.abs(player.y - monster.y);
        
        // Déclencher l'aggro si le monstre a été attaqué ET n'est pas en train de retourner
        // ET seulement s'il y a eu une interaction de combat récente (pas juste une sélection)
        if (monster.aggro && monster.aggroTarget === player && distToPlayer <= AGGRO_RANGE && monster.state !== 'return') {
            // Vérifier qu'il y a eu une vraie interaction de combat récente
            if (monster.lastCombat && (ts - monster.lastCombat) < AGGRO_TIMEOUT) {
                if (monster.state !== 'aggro') {
                    monster.state = 'aggro';
                    console.log(`Monstre ${monster.id} entre en aggro`);
                }
            } else {
                // Si pas d'interaction récente, réinitialiser l'aggro
                monster.aggro = false;
                monster.aggroTarget = null;
            }
        }
        
        // --- AGGRO ---
        if (monster.state === 'aggro') {
            // Vérifier qu'il y a eu une vraie interaction de combat récente
            if (!monster.lastCombat || (ts - monster.lastCombat) >= AGGRO_TIMEOUT) {
                // Pas d'interaction récente, sortir de l'aggro et retourner à la patrouille normale
                monster.state = 'idle';
                monster.aggro = false;
                monster.aggroTarget = null;
                monster.movePath = [];
                monster.moving = false;
                monster.nextPatrolTime = ts + getRandomPatrolDelay();
                continue;
            }
            
            // Délock si joueur mort ou trop loin (fail-safe)
            if (player.life <= 0 || distToPlayer > DEAGGRO_RANGE) {
                monster.state = 'return';
                monster.aggro = false;
                monster.aggroTarget = null;
                monster.movePath = [];
                monster.moving = false;
                continue;
            }
            // Attaque si adjacent - DÉSACTIVÉ pour éviter les attaques doubles
            // L'attaque se fait maintenant uniquement en riposte dans player.js
            if (distToPlayer === 1) {
                // Mettre à jour le timer de combat pour maintenir l'aggro
                monster.lastCombat = ts;
                // Ne pas arrêter le monstre s'il est juste sélectionné, seulement s'il attaque
                // Le monstre peut continuer à bouger même adjacent au joueur
                continue;
            }
            // Délock par timeout (8 secondes sans combat) peu importe la distance, sauf si le joueur vient d'être attaqué
            if ((ts - monster.lastCombat) > AGGRO_TIMEOUT) {
                console.log('Délock timeout pour le monstre', monster.id);
                monster.state = 'return';
                monster.aggro = false;
                monster.aggroTarget = null;
                monster.movePath = [];
                monster.moving = false;
                continue;
            }
            // Pathfinding dynamique vers le joueur (case adjacente libre) à CHAQUE TICK
            let destinations = [
                { x: player.x + 1, y: player.y },
                { x: player.x - 1, y: player.y },
                { x: player.x, y: player.y + 1 },
                { x: player.x, y: player.y - 1 }
            ].filter(pos =>
                pos.x >= 0 && pos.x < mapData.width &&
                pos.y >= 0 && pos.y < mapData.height &&
                !window.isBlocked(pos.x, pos.y) &&
                !monsters.some(m => m !== monster && m.x === pos.x && m.y === pos.y)
            );
            if (destinations.length) {
                // Choisir la destination la plus proche du monstre
                let newDest = destinations.reduce((best, pos) => {
                    let d = Math.abs(pos.x - monster.x) + Math.abs(pos.y - monster.y);
                    if (!best || d < best.d) return { ...pos, d };
                    return best;
                }, null);
                if (newDest) {
                    let path = findPath(
                        { x: monster.x, y: monster.y },
                        { x: newDest.x, y: newDest.y },
                        window.isBlocked,
                        mapData.width, mapData.height
                    ) || [];
                    // Si le chemin est différent de l'actuel, ou vide, on le met à jour
                    if (!monster.movePath || path.length === 0 || path[0].x !== monster.movePath[0]?.x || path[0].y !== monster.movePath[0]?.y) {
                        monster.movePath = path;
                        if (monster.movePath.length > 0) {
                            nextStepMonster(monster, ts);
                        }
                    }
                }
            }
            continue;
        }

        // --- RETOUR MAISON ---
        if (monster.state === 'return') {
            if (monster.x === monster.spawnX && monster.y === monster.spawnY) {
                monster.state = 'idle';
                monster.aggro = false;
                monster.aggroTarget = null;
                monster.nextPatrolTime = ts + getRandomPatrolDelay();
                monster.movePath = [];
                monster.moving = false;
                continue;
            }
            if (!monster.moving || !monster.movePath || monster.movePath.length === 0) {
                let path = findPath(
                    { x: monster.x, y: monster.y },
                    { x: monster.spawnX, y: monster.spawnY },
                    window.isBlocked,
                    mapData.width, mapData.height
                );
                if (path && path.length > 0) {
                    monster.movePath = path;
                    nextStepMonster(monster, ts);
                }
            }
            continue;
        }

        // --- PATROUILLE ---
        if (monster.state === 'patrol') {
            if (!monster.moving || !monster.movePath || monster.movePath.length === 0) {
                // Arrivé à destination, attendre avant prochaine patrouille
                monster.state = 'idle';
                monster.nextPatrolTime = ts + getRandomPatrolDelay();
                monster.movePath = [];
                monster.moving = false;
                continue;
            }
            continue;
        }

        // --- IDLE ---
        if (!monster.nextPatrolTime) monster.nextPatrolTime = ts + getRandomPatrolDelay();
        if (ts >= monster.nextPatrolTime) {
            // Générer une destination de patrouille sur toute la map
            let tries = 0, maxTries = 50;
            let found = false;
            while (tries < maxTries && !found) {
                // Distance aléatoire de 1 à 10 cases (plus grande pour couvrir toute la map)
                let distance = Math.floor(Math.random() * 10) + 1;
                let angle = Math.random() * 2 * Math.PI;
                let dx = Math.round(Math.cos(angle) * distance);
                let dy = Math.round(Math.sin(angle) * distance);
                let tx = monster.x + dx;
                let ty = monster.y + dy;
                
                // Vérifier que la destination est dans les limites de la map
                if (
                    tx < 0 || tx >= mapData.width ||
                    ty < 0 || ty >= mapData.height ||
                    (tx === monster.x && ty === monster.y)
                ) { 
                    tries++; 
                    continue; 
                }
                
                // Vérifier que le chemin est possible
                let path = findPath(
                    { x: monster.x, y: monster.y },
                    { x: tx, y: ty },
                    window.isBlocked,
                    mapData.width, mapData.height
                );
                if (path && path.length > 0) {
                    monster.movePath = path;
                    monster.state = 'patrol';
                    nextStepMonster(monster, ts);
                    found = true;
                } else {
                    tries++;
                }
            }
            if (!found) {
                monster.nextPatrolTime = ts + getRandomPatrolDelay();
            }
        }
    }
}

// Export global
window.nextStepMonster = nextStepMonster;
window.moveMonsters = moveMonsters;
window.updateMonsters = updateMonsters; 
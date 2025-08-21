// IA de chasse du joueur pour les monstres agressifs
// Nettoyé et validé le 30/07/2025 - par Cursor

const AGGRO_RANGE = 8;     // distance d'aggro pour les corbeaux
const AGGRO_RANGE_SLIME = 7; // distance d'aggro pour les slimes
const DEAGGRO_RANGE = 20;  // distance de délock
const AGGRO_TIMEOUT = 8000; // ms sans combat pour délock

// IA de chasse du joueur - aggro et retour
function chasePlayerAI(monster, ts) {
    // Protection contre les timestamps invalides
    if (!ts || ts < 0) {
        ts = Date.now();
    }
    
    // Protection contre les monstres invalides
    if (!monster || typeof monster !== 'object') {
        return;
    }
    
    if (!monster.img || monster.hp <= 0) return;
    
    // Mettre à jour l'alignement fluide si nécessaire
    if (typeof updateMonsterAlignment === 'function') {
        updateMonsterAlignment(monster);
    }
    
    // Mouvement en cours : on ne touche pas au path sauf en aggro
    if (monster.moving && monster.state !== 'aggro') return;
    
    // --- DÉTECTION AGGRO ---
    let distToPlayer = Math.abs(player.x - monster.x) + Math.abs(player.y - monster.y);
    
    // Déterminer la distance d'aggro selon le type de monstre
    let aggroRange = monster.type === "slime" ? AGGRO_RANGE_SLIME : AGGRO_RANGE;
    
    // AGGRO AUTOMATIQUE POUR LES SLIMES
    if (monster.type === "slime" && !monster.aggro && distToPlayer <= AGGRO_RANGE_SLIME) {
        // Les slimes entrent automatiquement en aggro quand le joueur s'approche
        monster.aggro = true;
        monster.aggroTarget = player;
        monster.lastCombat = ts; // Initialiser le timer de combat
        monster.state = 'aggro'; // Forcer l'état en aggro
    }
    
    // Déclencher l'aggro si le monstre a été attaqué ET n'est pas en train de retourner
    if (monster.aggro && monster.aggroTarget === player && distToPlayer <= aggroRange && monster.state !== 'return') {
        // Vérifier qu'il y a eu une vraie interaction de combat récente
        if (monster.lastCombat && (ts - monster.lastCombat) < AGGRO_TIMEOUT) {
            if (monster.state !== 'aggro') {
                monster.state = 'aggro';
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
            return;
        }
        
        // Délock si joueur mort ou trop loin (fail-safe)
        if (player.life <= 0 || distToPlayer > DEAGGRO_RANGE) {
            monster.state = 'return';
            monster.aggro = false;
            monster.aggroTarget = null;
            monster.movePath = [];
            monster.moving = false;
            return;
        }
        
        // ATTAQUE AUTOMATIQUE POUR LES SLIMES
        if (monster.type === "slime" && distToPlayer === 1) {
            // Les slimes attaquent automatiquement quand ils sont adjacents au joueur
            if (!monster.lastAttack || (ts - monster.lastAttack) >= 1000) { // Cooldown de 1 seconde entre attaques
                // Calcul des dégâts du slime
                const monsterBaseDamage = monster.damage !== undefined ? monster.damage : 3;
                const monsterTotalDamage = monsterBaseDamage + (monster.force || 0);
                const variation = 0.25; // 25% de variation
                const randomFactor = 1 + (Math.random() * 2 - 1) * variation; // Entre 0.75 et 1.25
                const monsterDamage = Math.max(1, Math.floor(monsterTotalDamage * randomFactor) - player.defense);
                
                // Appliquer les dégâts au joueur
                player.life -= monsterDamage;
                if (player.life < 0) player.life = 0;
                
                // Afficher les dégâts reçus par le joueur
                if (typeof displayDamage === "function") {
                    displayDamage(player.px, player.py, monsterDamage, 'damage', true);
                }
                
                // Mettre à jour le timer d'attaque et de combat
                monster.lastAttack = ts;
                monster.lastCombat = ts;
                
                // XP défense pour avoir reçu des dégâts
                if (typeof gainStatXP === "function") {
                    gainStatXP('defense', 1);
                }
            }
            // Ne pas continuer pour éviter les attaques doubles - le slime reste en place
            return;
        }
        
        // Attaque si adjacent - DÉSACTIVÉ pour éviter les attaques doubles
        if (distToPlayer === 1) {
            // Mettre à jour le timer de combat pour maintenir l'aggro
            monster.lastCombat = ts;
            // Ne pas arrêter le monstre s'il est juste sélectionné, seulement s'il attaque
            return;
        }
        
        // Délock par timeout (8 secondes sans combat) peu importe la distance
        if ((ts - monster.lastCombat) > AGGRO_TIMEOUT) {
            monster.state = 'return';
            monster.aggro = false;
            monster.aggroTarget = null;
            monster.movePath = [];
            monster.moving = false;
            return;
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
                        if (typeof nextStepMonster === 'function') {
                            nextStepMonster(monster, ts);
                        }
                    }
                }
            }
        }
        return;
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
            return;
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
                if (typeof nextStepMonster === 'function') {
                    nextStepMonster(monster, ts);
                }
            }
        }
        return;
    }
}

// Export global
window.chasePlayerAI = chasePlayerAI; 
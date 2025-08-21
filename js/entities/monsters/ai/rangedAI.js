// IA à distance pour les monstres qui attaquent de loin
// Nettoyé et validé le 30/07/2025 - par Cursor

const RANGED_ATTACK_RANGE = 5; // Distance d'attaque à distance
const RANGED_AGGRO_RANGE = 10; // Distance d'aggro pour les monstres à distance
const RANGED_DEAGGRO_RANGE = 25; // Distance de délock
const RANGED_ATTACK_COOLDOWN = 2000; // Cooldown entre attaques à distance

// IA à distance - attaque de loin et maintien de distance
function rangedAI(monster, ts) {
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
    
    // AGGRO pour les monstres à distance
    if (!monster.aggro && distToPlayer <= RANGED_AGGRO_RANGE) {
        monster.aggro = true;
        monster.aggroTarget = player;
        monster.lastCombat = ts;
    }
    
    // Déclencher l'aggro si le monstre a été attaqué
    if (monster.aggro && monster.aggroTarget === player && distToPlayer <= RANGED_AGGRO_RANGE && monster.state !== 'return') {
        if (monster.lastCombat && (ts - monster.lastCombat) < AGGRO_TIMEOUT) {
            if (monster.state !== 'aggro') {
                monster.state = 'aggro';
            }
        } else {
            monster.aggro = false;
            monster.aggroTarget = null;
        }
    }
    
    // --- AGGRO ---
    if (monster.state === 'aggro') {
        // Vérifier qu'il y a eu une vraie interaction de combat récente
        if (!monster.lastCombat || (ts - monster.lastCombat) >= AGGRO_TIMEOUT) {
            monster.state = 'idle';
            monster.aggro = false;
            monster.aggroTarget = null;
            monster.movePath = [];
            monster.moving = false;
            monster.nextPatrolTime = ts + getRandomPatrolDelay();
            return;
        }
        
        // Délock si joueur mort ou trop loin
        if (player.life <= 0 || distToPlayer > RANGED_DEAGGRO_RANGE) {
            monster.state = 'return';
            monster.aggro = false;
            monster.aggroTarget = null;
            monster.movePath = [];
            monster.moving = false;
            return;
        }
        
        // ATTAQUE À DISTANCE
        if (distToPlayer <= RANGED_ATTACK_RANGE && distToPlayer > 1) {
            if (!monster.lastAttack || (ts - monster.lastAttack) >= RANGED_ATTACK_COOLDOWN) {
                // Calcul des dégâts à distance
                const monsterBaseDamage = monster.damage !== undefined ? monster.damage : 4;
                const monsterTotalDamage = monsterBaseDamage + (monster.force || 0);
                const variation = 0.3; // 30% de variation
                const randomFactor = 1 + (Math.random() * 2 - 1) * variation;
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
            return;
        }
        
        // MAINTIEN DE DISTANCE - s'éloigner si trop proche
        if (distToPlayer <= 2) {
            // Trouver une position pour s'éloigner
            let escapePositions = [
                { x: monster.x + 2, y: monster.y },
                { x: monster.x - 2, y: monster.y },
                { x: monster.x, y: monster.y + 2 },
                { x: monster.x, y: monster.y - 2 }
            ].filter(pos =>
                pos.x >= 0 && pos.x < mapData.width &&
                pos.y >= 0 && pos.y < mapData.height &&
                !window.isBlocked(pos.x, pos.y) &&
                !monsters.some(m => m !== monster && m.x === pos.x && m.y === pos.y)
            );
            
            if (escapePositions.length > 0) {
                let escapePos = escapePositions[Math.floor(Math.random() * escapePositions.length)];
                let path = findPath(
                    { x: monster.x, y: monster.y },
                    { x: escapePos.x, y: escapePos.y },
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
        
        // Pathfinding pour maintenir la distance optimale
        let optimalDistance = 3; // Distance optimale pour les attaques à distance
        if (distToPlayer < optimalDistance) {
            // S'éloigner du joueur
            let escapePositions = [
                { x: monster.x + 1, y: monster.y },
                { x: monster.x - 1, y: monster.y },
                { x: monster.x, y: monster.y + 1 },
                { x: monster.x, y: monster.y - 1 }
            ].filter(pos =>
                pos.x >= 0 && pos.x < mapData.width &&
                pos.y >= 0 && pos.y < mapData.height &&
                !window.isBlocked(pos.x, pos.y) &&
                !monsters.some(m => m !== monster && m.x === pos.x && m.y === pos.y)
            );
            
            if (escapePositions.length > 0) {
                let escapePos = escapePositions[Math.floor(Math.random() * escapePositions.length)];
                let path = findPath(
                    { x: monster.x, y: monster.y },
                    { x: escapePos.x, y: escapePos.y },
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
        } else if (distToPlayer > optimalDistance + 2) {
            // Se rapprocher du joueur
            let approachPositions = [
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
            
            if (approachPositions.length > 0) {
                let approachPos = approachPositions[Math.floor(Math.random() * approachPositions.length)];
                let path = findPath(
                    { x: monster.x, y: monster.y },
                    { x: approachPos.x, y: approachPos.y },
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
window.rangedAI = rangedAI; 
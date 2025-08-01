// IA volante pour les monstres qui peuvent voler par-dessus les obstacles
// Nettoyé et validé le 30/07/2025 - par Cursor

const FLYING_AGGRO_RANGE = 12; // Distance d'aggro pour les monstres volants
const FLYING_DEAGGRO_RANGE = 30; // Distance de délock
const FLYING_ATTACK_RANGE = 3; // Distance d'attaque pour les monstres volants
const FLYING_ATTACK_COOLDOWN = 1500; // Cooldown entre attaques volantes

// IA volante - peut voler par-dessus les obstacles
function flyingAI(monster, ts) {
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
    
    // AGGRO pour les monstres volants
    if (!monster.aggro && distToPlayer <= FLYING_AGGRO_RANGE) {
        monster.aggro = true;
        monster.aggroTarget = player;
        monster.lastCombat = ts;
    }
    
    // Déclencher l'aggro si le monstre a été attaqué
    if (monster.aggro && monster.aggroTarget === player && distToPlayer <= FLYING_AGGRO_RANGE && monster.state !== 'return') {
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
        if (player.life <= 0 || distToPlayer > FLYING_DEAGGRO_RANGE) {
            monster.state = 'return';
            monster.aggro = false;
            monster.aggroTarget = null;
            monster.movePath = [];
            monster.moving = false;
            return;
        }
        
        // ATTAQUE VOLANTE
        if (distToPlayer <= FLYING_ATTACK_RANGE) {
            if (!monster.lastAttack || (ts - monster.lastAttack) >= FLYING_ATTACK_COOLDOWN) {
                // Calcul des dégâts volants
                const monsterBaseDamage = monster.damage !== undefined ? monster.damage : 5;
                const monsterTotalDamage = monsterBaseDamage + (monster.force || 0);
                const variation = 0.2; // 20% de variation
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
        
        // PATHFINDING VOLANT - peut voler par-dessus les obstacles
        let destinations = [
            { x: player.x + 1, y: player.y },
            { x: player.x - 1, y: player.y },
            { x: player.x, y: player.y + 1 },
            { x: player.x, y: player.y - 1 }
        ].filter(pos =>
            pos.x >= 0 && pos.x < mapData.width &&
            pos.y >= 0 && pos.y < mapData.height &&
            !monsters.some(m => m !== monster && m.x === pos.x && m.y === pos.y)
            // Note: Pas de vérification isBlocked pour les monstres volants
        );
        
        if (destinations.length) {
            // Choisir la destination la plus proche du monstre
            let newDest = destinations.reduce((best, pos) => {
                let d = Math.abs(pos.x - monster.x) + Math.abs(pos.y - monster.y);
                if (!best || d < best.d) return { ...pos, d };
                return best;
            }, null);
            
            if (newDest) {
                // Pour les monstres volants, on peut utiliser un pathfinding direct
                // ou créer un chemin en ligne droite
                let directPath = [];
                let currentX = monster.x;
                let currentY = monster.y;
                
                while (currentX !== newDest.x || currentY !== newDest.y) {
                    if (currentX < newDest.x) currentX++;
                    else if (currentX > newDest.x) currentX--;
                    
                    if (currentY < newDest.y) currentY++;
                    else if (currentY > newDest.y) currentY--;
                    
                    directPath.push({ x: currentX, y: currentY });
                }
                
                // Si le chemin est différent de l'actuel, on le met à jour
                if (!monster.movePath || directPath.length === 0 || 
                    directPath[0].x !== monster.movePath[0]?.x || 
                    directPath[0].y !== monster.movePath[0]?.y) {
                    monster.movePath = directPath;
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
            // Pathfinding direct pour le retour (volant)
            let directPath = [];
            let currentX = monster.x;
            let currentY = monster.y;
            
            while (currentX !== monster.spawnX || currentY !== monster.spawnY) {
                if (currentX < monster.spawnX) currentX++;
                else if (currentX > monster.spawnX) currentX--;
                
                if (currentY < monster.spawnY) currentY++;
                else if (currentY > monster.spawnY) currentY--;
                
                directPath.push({ x: currentX, y: currentY });
            }
            
            if (directPath.length > 0) {
                monster.movePath = directPath;
                if (typeof nextStepMonster === 'function') {
                    nextStepMonster(monster, ts);
                }
            }
        }
        return;
    }
}

// Export global
window.flyingAI = flyingAI; 
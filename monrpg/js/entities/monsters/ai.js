// Système d'IA des monstres - Version modulaire
// Nettoyé et validé le 30/07/2025 - par Cursor

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
        // Revenir au comportement initial: occupation 1x1
        occupy(monster.x, monster.y);
            monster.moving = false;
            monster.frame = 0;
            monster.stuckSince = 0;
            
            // Synchroniser le monstre en multijoueur
            if (typeof syncMonster === 'function') {
                syncMonster(monster);
            }
            
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

// Nouvelle fonction updateMonsters modulaire
function updateMonsters(ts) {
    // Protection contre les timestamps invalides
    if (!ts || ts < 0) {
        ts = Date.now();
    }
    
    // Protection contre les boucles infinies
    if (!window.mapData) return;
    
    // Protection contre les monstres invalides
    if (!monsters || !Array.isArray(monsters)) {
        return;
    }
    
    for (let monster of monsters) {
        // Protection contre les monstres invalides
        if (!monster || typeof monster !== 'object') {
            continue;
        }
        
        if (!monster.img || monster.hp <= 0) continue;
        
        // Système d'alignement supprimé - Les monstres utilisent leur IA naturelle
        
        // --- DÉLÉGATION VERS LES IA SPÉCIALISÉES ---
        
        // SlimeBoss - IA intégrée
        if (monster.type === 'slimeboss') {
            if (typeof updateSlimeBoss === 'function') {
                updateSlimeBoss(monster, ts);
            }
            continue;
        }
        
        // Slimes basiques - IA partagée
        if (monster.type === 'slime') {
            if (typeof updateBasicSlime === 'function') {
                updateBasicSlime(monster, ts);
            }
            continue;
        }
        
        // Corbeaux - IA partagée
        if (monster.type === 'crow') {
            if (typeof updateCrow === 'function') {
                updateCrow(monster, ts);
            }
            continue;
        }
        
        // Corbeaux d'élite - IA volante
        if (monster.type === 'corbeauelite') {
            if (typeof flyingAI === 'function') {
                flyingAI(monster, ts);
            }
            continue;
        }
        
        // Maitrecorbeau - IA à distance
        if (monster.type === 'maitrecorbeau') {
            if (typeof rangedAI === 'function') {
                rangedAI(monster, ts);
            }
            continue;
        }
        
        // Cochon - IA de chasse
        if (monster.type === 'cochon') {
            if (typeof updateCochon === 'function') {
                updateCochon(monster, ts);
            }
            continue;
        }
        
        // Aluineeks - IA de chasse
        if (monster.type === 'aluineeks') {
            if (typeof updateAluineeks === 'function') {
                updateAluineeks(monster, ts);
            }
            continue;
        }
        
        // Monstres par défaut - IA passive
        if (typeof passiveAI === 'function') {
            passiveAI(monster, ts);
        }
    }
}

// Export global
window.nextStepMonster = nextStepMonster;
window.moveMonsters = moveMonsters;
window.updateMonsters = updateMonsters; 
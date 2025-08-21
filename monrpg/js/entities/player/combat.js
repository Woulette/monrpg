https://monrpg-si8o.vercel.app/// Calcul des dégâts reçus avec la défense
function getPlayerDamageReceived(baseDamage) {
    return Math.max(1, baseDamage - player.defense);
}

// Calcul de la chance de critique avec l'agilité
function getPlayerCritChance() {
    return Math.min(player.agilite * 0.5, 25); // 100 agilité = 50% critique (max 25%)
}

// Calcul des dégâts critiques avec l'agilité
function getPlayerCritDamage() {
    return Math.floor(player.agilite / 10) / 100; // 10 agilité = +1% de dégâts critiques
}

// Vérification si le joueur fait un critique
function isPlayerCrit() {
    return Math.random() * 100 < getPlayerCritChance();
}

// Vérification si le joueur esquive
function isPlayerDodge() {
    return Math.random() * 100 < Math.floor(player.agilite / 10); // 10 agilité = 1% esquive
}

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

function isMonsterAt(x, y) {
    return monsters.some(m => m.x === x && m.y === y && m.hp > 0);
}

// Export des fonctions de combat
window.getPlayerDamageReceived = getPlayerDamageReceived;
window.getPlayerCritChance = getPlayerCritChance;
window.getPlayerCritDamage = getPlayerCritDamage;
window.isPlayerCrit = isPlayerCrit;
window.isPlayerDodge = isPlayerDodge;
window.findMonsterInRadius = findMonsterInRadius;
window.isMonsterAt = isMonsterAt; 
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
    
    // Téléporter vers map1 si on n'y est pas déjà
    if (window.currentMap !== "map1") {
        console.log("🔄 Respawn : Téléportation vers map1");
        if (typeof window.teleportPlayer === "function") {
            window.teleportPlayer("map1", player.spawnX, player.spawnY);
        } else if (typeof window.loadMap === "function") {
            window.loadMap("map1");
            // Positionner le joueur après le chargement de la map
            setTimeout(() => {
                player.x = player.spawnX;
                player.y = player.spawnY;
                player.px = player.spawnX * TILE_SIZE;
                player.py = player.spawnY * TILE_SIZE;
            }, 100);
        }
    } else {
        // Remettre le joueur au point de spawn sur map1
        player.x = player.spawnX;
        player.y = player.spawnY;
        player.px = player.spawnX * TILE_SIZE;
        player.py = player.spawnY * TILE_SIZE;
    }
    
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
    
    console.log(`✅ Joueur respawné sur map1 à la position (${player.spawnX}, ${player.spawnY})`);
}

// Rendre la fonction accessible globalement
window.respawnPlayer = respawnPlayer; 
// Fonction pour faire respawn le joueur
function respawnPlayer() {
    // S'assurer qu'on utilise le bon objet player
    const currentPlayer = window.player || player;
    
    // Pénalité d'XP de 5%
    const xpPenalty = Math.floor(currentPlayer.xp * 0.05);
    currentPlayer.xp = Math.max(0, currentPlayer.xp - xpPenalty);
    
    // Afficher la pénalité d'XP au-dessus du joueur
    if (typeof displayDamage === "function" && xpPenalty > 0) {
        displayDamage(currentPlayer.px, currentPlayer.py, `-${xpPenalty} XP`, 'damage', true);
    }
    
    // Libérer l'ancienne position
    if (typeof release === "function") {
        release(currentPlayer.x, currentPlayer.y);
    }
    
    // Téléporter vers map1 si on n'y est pas déjà
    if (window.currentMap !== "map1") {
        if (typeof window.teleportPlayer === "function") {
            window.teleportPlayer("map1", currentPlayer.spawnX, currentPlayer.spawnY);
        } else if (typeof window.loadMap === "function") {
            window.loadMap("map1");
            
            // Positionner le joueur après le chargement de la map
            setTimeout(() => {
                currentPlayer.x = currentPlayer.spawnX;
                currentPlayer.y = currentPlayer.spawnY;
                currentPlayer.px = currentPlayer.spawnX * TILE_SIZE;
                currentPlayer.py = currentPlayer.spawnY * TILE_SIZE;
            }, 100);
        }
    } else {
        // Remettre le joueur au point de spawn sur map1
        currentPlayer.x = currentPlayer.spawnX;
        currentPlayer.y = currentPlayer.spawnY;
        currentPlayer.px = currentPlayer.spawnX * TILE_SIZE;
        currentPlayer.py = currentPlayer.spawnY * TILE_SIZE;
    }
    
    // Restaurer la vie
    currentPlayer.life = currentPlayer.maxLife;
    
    // Réinitialiser l'état
    currentPlayer.isDead = false;
    currentPlayer.inCombat = false;
    currentPlayer.moving = false;
    currentPlayer.path = [];
    currentPlayer.moveTarget = { x: currentPlayer.spawnX, y: currentPlayer.spawnY };
    
    // Nettoyer les cibles de combat
    if (attackTarget) {
        attackTarget.aggro = false;
        attackTarget.aggroTarget = null;
    }
    attackTarget = null;
    window.attackTarget = null;
    
    // Marquer la nouvelle position comme occupée
    if (typeof occupy === "function") {
        occupy(currentPlayer.x, currentPlayer.y);
    }
    
    // S'assurer que window.player pointe vers le bon objet
    window.player = currentPlayer;
    
    // Nettoyer l'écran noir
    if (typeof clearBlackScreen === "function") {
        clearBlackScreen();
    } else if (window.blackScreenStartTime) {
        window.blackScreenStartTime = null;
        window.blackScreenDuration = 250; // Restaurer la durée par défaut
    }
}

// Rendre la fonction accessible globalement
window.respawnPlayer = respawnPlayer; 
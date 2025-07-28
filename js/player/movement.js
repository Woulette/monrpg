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

// Export des fonctions de mouvement
window.nextStepToTarget = nextStepToTarget; 
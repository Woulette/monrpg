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

// Export global des fonctions
window.createPlayerBubble = createPlayerBubble;
window.drawPlayerBubbles = drawPlayerBubbles; 
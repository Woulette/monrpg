// Système de bulles de dialogue du joueur
let playerBubbles = [];
let otherPlayerBubbles = new Map(); // Map<playerId, Array<bubble>>

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
    // Dessiner bulles des autres joueurs
    otherPlayerBubbles.forEach((bubbles, pid) => {
        const other = window.multiplayerManager?.otherPlayers?.get(pid);
        if (!other) return;
        const px = (other.x * TILE_SIZE) + (window.mapOffsetX || 0);
        const py = (other.y * TILE_SIZE) + (window.mapOffsetY || 0);
        const currentTime2 = Date.now();
        const remain = [];
        for (const b of bubbles) {
            const elapsed = currentTime2 - b.startTime;
            const progress = elapsed / b.duration;
            if (progress < 1) {
                const opacity = progress > 0.875 ? 1 - ((progress - 0.875) / 0.125) : 1;
                drawBubbleAt(ctx, b.message, px, py, opacity);
                remain.push(b);
            }
        }
        if (remain.length > 0) {
            otherPlayerBubbles.set(pid, remain);
        } else {
            otherPlayerBubbles.delete(pid);
        }
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

function drawBubbleAt(ctx, text, basePx, basePy, opacity) {
    const fontSize = 14;
    const padding = 6;
    ctx.font = `bold ${fontSize}px Arial`;
    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = textHeight + padding * 2;
    const bgX = basePx + (TILE_SIZE - bgWidth) / 2;
    const bgY = basePy - bgHeight - 15;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = 'white';
    ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bgX + bgWidth / 2, bgY + bgHeight / 2);
    ctx.restore();
}

// API pour afficher une bulle chez un autre joueur
window.createFloatingBubbleForOther = function(playerId, message) {
    const arr = otherPlayerBubbles.get(playerId) || [];
    arr.length = 0; // une seule bulle à la fois par joueur
    arr.push({ message, startTime: Date.now(), duration: 4000 });
    otherPlayerBubbles.set(playerId, arr);
};

// Export global des fonctions
window.createPlayerBubble = createPlayerBubble;
window.drawPlayerBubbles = drawPlayerBubbles; 
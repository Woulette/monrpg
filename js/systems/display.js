// js/systems/display.js
// Gestion de la taille du canvas et positionnement du HUD

(function(){
  function resizeGameCanvas(){
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ratio = 1536 / 910;
    let w = window.innerWidth;
    let h = window.innerHeight;
    if (w / h > ratio) {
      w = h * ratio;
    } else {
      h = w / ratio;
    }
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
  }

  function applyLayout(){
    resizeGameCanvas();
    if (typeof window.positionHudIcons === 'function') {
      window.positionHudIcons();
    }
  }

  window.addEventListener('resize', applyLayout);
  document.addEventListener('DOMContentLoaded', applyLayout);

  // Expose
  window.resizeGameCanvas = resizeGameCanvas;
})();


// Pont unifié pour les messages flottants (utilisé par plusieurs modules)
// Signature: showFloatingMessage(text, xTiles?, yTiles?, color?, fontSize?)
// Affiche au-dessus d'une position de tuile (convertie en pixels) via le système d'effets de dégâts
if (typeof window.showFloatingMessage !== 'function') {
  window.showFloatingMessage = function(text, x, y) {
    try {
      const tileSize = (typeof window.TILE_SIZE === 'number' && window.TILE_SIZE > 0) ? window.TILE_SIZE : 32;
      const px = ((typeof x === 'number') ? x : (window.player?.x || 0)) * tileSize;
      const py = ((typeof y === 'number') ? y : (window.player?.y || 0)) * tileSize;
      if (typeof window.displayDamage === 'function') {
        // Type 'xp' → couleur jaune lisible; le contenu peut être un texte
        window.displayDamage(px, py, String(text), 'xp', false);
        return true;
      }
    } catch (e) {
      // fallback silencieux
    }
    // Fallback vers le chat flottant si disponible
    if (typeof window.addFloatingMessage === 'function') {
      window.addFloatingMessage(String(text), 'event', 3000);
      return true;
    }
    return false;
  };
}


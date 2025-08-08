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



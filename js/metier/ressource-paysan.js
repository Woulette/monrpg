// Métier: paysan — gestion blé via calques 5 (coupé) et 6 (poussé)
(function(){
  const RESPAWN_MS = 2 * 60 * 1000; // 2 minutes
  const WHEAT_GID = 425; // tuile blé poussé
  const CUT_GID = 625;   // tuile blé coupé
  // Découpe par map et par case: { [mapName]: { 'x,y': nextRespawnAt } }
  if (!window.__paysanCuts) window.__paysanCuts = {};
  // Tuiles interactives (effet visuel après clic) par map
  if (!window.__wheatInteractive) window.__wheatInteractive = {};

  function findLayerById(id){
    if (!window.mapData || !Array.isArray(window.mapData.layers)) return null;
    return window.mapData.layers.find(l => (l.id === id));
  }

  function isWheatGrownAt(x, y){
    if (!window.mapData) return false;
    const layerGrown = findLayerById(6);
    if (!layerGrown) return false;
    const i = y * layerGrown.width + x;
    return layerGrown.data[i] === WHEAT_GID;
  }

  function scheduleRespawnCheck(){
    if (window.__paysanRespawnTimer) return;
    window.__paysanRespawnTimer = setInterval(() => {
      const mapName = window.currentMap;
      if (!mapName || !window.mapData) return;
      const layerGrown = findLayerById(6);
      const layerCut = findLayerById(5);
      if (!layerGrown || !layerCut) return;
      const cuts = window.__paysanCuts[mapName];
      if (!cuts) return;
      const now = Date.now();
      let changed = false;
      Object.keys(cuts).forEach(key => {
        const [sx, sy] = key.split(',').map(Number);
        if (now >= cuts[key]){
          const i = sy * layerGrown.width + sx;
          // Respawn: remettre blé poussé
          layerGrown.data[i] = WHEAT_GID;
          // Cacher blé coupé (si présent)
          const i2 = sy * layerCut.width + sx;
          if (layerCut.data[i2] !== 0) layerCut.data[i2] = 0;
          delete cuts[key];
          // Nettoyer l'état interactif éventuel
          if (window.__wheatInteractive[mapName]) delete window.__wheatInteractive[mapName][`${sx},${sy}`];
          changed = true;
        }
      });
      if (changed && typeof window.drawMap === 'function') window.drawMap();
    }, 1000);
  }

  // API publique: couper le blé (donne XP paysan si dispo)
  function cutWheat(x, y){
    if (!window.currentMap || !window.mapData) return false;
    const mapName = window.currentMap;
    const layerGrown = findLayerById(6);
    const layerCut = findLayerById(5);
    if (!layerGrown || !layerCut) return false;
    const i = y * layerGrown.width + x;
    if (layerGrown.data[i] !== WHEAT_GID) return false;
    if (window.showFloatingMessage) window.showFloatingMessage('Coupe du blé...', player.x, player.y-40, '#c0ca33', '16px');
    setTimeout(() => {
      // Cacher LA tuile de blé poussée et afficher la tuile coupée
      layerGrown.data[i] = 0;
      const layerCutIdx = i; // même index (mêmes dimensions)
      const layerCutRef = findLayerById(5);
      if (layerCutRef) layerCutRef.data[layerCutIdx] = CUT_GID;
      // Enregistrer respawn
      if (!window.__paysanCuts[mapName]) window.__paysanCuts[mapName] = {};
      window.__paysanCuts[mapName][`${x},${y}`] = Date.now() + RESPAWN_MS;
      // Loot blé
      if (typeof window.addItemToInventory === 'function'){
        if (window.resourceDatabase && !window.resourceDatabase['ble']){
          window.resourceDatabase['ble'] = { id:'ble', name:'Blé', type:'ressource', category:'plante', icon:'assets/objets/ressources_paysan/ble.png', stackable:true, maxStack:99 };
        }
        window.addItemToInventory('ble', 'ressources');
      }
      if (typeof window.gainMetierXP === 'function') {
        window.gainMetierXP('paysan', 5);
        // Affichage façon dégâts/XP combat
        if (typeof window.displayDamage === 'function' && typeof player.px !== 'undefined') {
          window.displayDamage(player.px, player.py, '+5 XP', 'xp', true);
        } else if (typeof window.showFloatingMessage === 'function') {
          window.showFloatingMessage('+5 XP Paysan', player.x, player.y - 70, '#bfa14a', '16px');
        }
      }
      if (typeof window.drawMap === 'function') window.drawMap();
      if (window.showFloatingMessage) window.showFloatingMessage('Blé coupé !', player.x, player.y-50, '#bfa14a', '16px');
      // Enlever l'effet interactif après coupe
      if (!window.__wheatInteractive[mapName]) window.__wheatInteractive[mapName] = {};
      delete window.__wheatInteractive[mapName][`${x},${y}`];
    }, 2000);
    scheduleRespawnCheck();
    return true;
  }

  // Hooks utilisés par js/core/map.js
  window.loadMapResources = function(mapName){
    try{
      if (window.mapData){
        const layerCut = findLayerById(5);
        if (layerCut){
          for (let y=0; y<layerCut.height; y++){
            for (let x=0; x<layerCut.width; x++){
              const idx = y * layerCut.width + x;
              if (layerCut.data[idx] === CUT_GID) layerCut.data[idx] = 0;
            }
          }
        }
      }
      scheduleRespawnCheck();
    }catch(e){ console.error('ressource-paysan.loadMapResources error', e); }
  };

  window.gererRespawnLorsRetourMap = function(){ scheduleRespawnCheck(); };

  // Debug
  window.cutWheat = cutWheat;
  window.markWheatInteracted = function(x, y){
    const mapName = window.currentMap;
    if (!mapName) return;
    if (!window.__wheatInteractive[mapName]) window.__wheatInteractive[mapName] = {};
    window.__wheatInteractive[mapName][`${x},${y}`] = true;
  };
  
  // Effets visuels comme l'alchimiste pendant le rendu des tuiles
  window.appliquerEffetsVisuelsRessourcesPaysan = function(ctx, x, y, gid){
    // Surligner uniquement la tuile de blé poussé (GID exact) ET cliquée
    const mapName = window.currentMap;
    const isInteracted = mapName && window.__wheatInteractive[mapName] && window.__wheatInteractive[mapName][`${x},${y}`];
    if (gid === WHEAT_GID && isInteracted){
      const pulse = Math.sin(Date.now() / 240) * 0.15 + 1.05;
      ctx.globalAlpha = pulse;
      ctx.filter = `brightness(${pulse}) drop-shadow(0 0 14px rgba(191,161,74,0.9))`;
    }
  };
})();



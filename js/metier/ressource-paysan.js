// Métier: paysan — gestion blé via calques 5 (coupé) et 6 (poussé)
(function(){
  const RESPAWN_MS = 2 * 60 * 1000; // 2 minutes
  const WHEAT_GID = 425; // tuile blé poussé
  const CUT_GID = 625;   // tuile blé coupé
  // Découpe par map et par case: { [mapName]: { 'x,y': nextRespawnAt } }
  if (!window.__paysanCuts) window.__paysanCuts = {};
  // Garde: coupe en cours par tuile pour éviter les multi-clics
  if (!window.__paysanCutInProgress) window.__paysanCutInProgress = {};
  // Tuiles interactives (effet visuel après clic) par map
  if (!window.__wheatInteractive) window.__wheatInteractive = {};
  // File d'attente de coupes et état global
  if (!window.__wheatQueue) window.__wheatQueue = {};
  if (typeof window.__isHarvestingWheat === 'undefined') window.__isHarvestingWheat = false;
  if (typeof window.__wheatCancelRequested === 'undefined') window.__wheatCancelRequested = false;
  if (typeof window.__currentWheatTimer === 'undefined') window.__currentWheatTimer = null;
  if (typeof window.__currentHarvestKey === 'undefined') window.__currentHarvestKey = null;

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

  function computeWheatYieldByLevel(level){
    // Barème demandé: 1-2 (niv<10), 1-3 (>=10), 1-4 (>=20), ... et au niv 100: 10-20
    if (level >= 100) return { min: 10, max: 20 };
    if (level >= 90) return { min: 8, max: 18 };
    if (level >= 80) return { min: 7, max: 16 };
    if (level >= 70) return { min: 6, max: 14 };
    if (level >= 60) return { min: 5, max: 12 };
    if (level >= 50) return { min: 4, max: 10 };
    if (level >= 40) return { min: 3, max: 8 };
    if (level >= 30) return { min: 2, max: 6 };
    if (level >= 20) return { min: 1, max: 4 };
    if (level >= 10) return { min: 1, max: 3 };
    return { min: 1, max: 2 };
  }

  function randInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // API interne: couper le blé (donne XP paysan si dispo)
  function cutWheat(x, y, onDone){
    if (!window.currentMap || !window.mapData) return false;
    const mapName = window.currentMap;
    const layerGrown = findLayerById(6);
    const layerCut = findLayerById(5);
    if (!layerGrown || !layerCut) return false;
    const i = y * layerGrown.width + x;
    if (layerGrown.data[i] !== WHEAT_GID) return false;
    // Anti multi-clic: si une coupe est déjà en cours sur cette tuile, ignorer
    if (!window.__paysanCutInProgress[mapName]) window.__paysanCutInProgress[mapName] = {};
    const key = `${x},${y}`;
    if (window.__paysanCutInProgress[mapName][key]) return false;
    window.__paysanCutInProgress[mapName][key] = true;
    if (window.showFloatingMessage) window.showFloatingMessage('Coupe du blé...', player.x, player.y-40, '#c0ca33', '16px');
    // Bloquer les déplacements manuels durant la coupe
    window.__isHarvestingWheat = true;
    player.isBusyHarvesting = true;
    window.__wheatCancelRequested = false;
    window.__currentHarvestKey = { map: mapName, key };
    window.__currentWheatTimer = setTimeout(() => {
      window.__currentWheatTimer = null;
      if (window.__wheatCancelRequested) {
        // Annulé: libérer et sortir sans effet
        if (window.__paysanCutInProgress[mapName]) delete window.__paysanCutInProgress[mapName][key];
        window.__isHarvestingWheat = false;
        player.isBusyHarvesting = false;
        if (typeof onDone === 'function') onDone();
        return;
      }
      // Cacher LA tuile de blé poussée et afficher la tuile coupée
      layerGrown.data[i] = 0;
      const layerCutIdx = i; // même index (mêmes dimensions)
      const layerCutRef = findLayerById(5);
      if (layerCutRef) layerCutRef.data[layerCutIdx] = CUT_GID;
      // Enregistrer respawn
      if (!window.__paysanCuts[mapName]) window.__paysanCuts[mapName] = {};
      window.__paysanCuts[mapName][`${x},${y}`] = Date.now() + RESPAWN_MS;
      // Loot blé (quantité selon niveau de métier)
      if (typeof window.addItemToInventory === 'function'){
        if (window.resourceDatabase && !window.resourceDatabase['ble']){
          window.resourceDatabase['ble'] = { id:'ble', name:'Blé', type:'ressource', category:'plante', icon:'assets/objets/ressources_paysan/ble.png', stackable:true, maxStack:9999 };
        }
        const level = (window.metiers && window.metiers.paysan && window.metiers.paysan.niveau) ? window.metiers.paysan.niveau : 1;
        const range = computeWheatYieldByLevel(level);
        const qty = randInt(range.min, range.max);
        for (let k = 0; k < qty; k++) {
          window.addItemToInventory('ble', 'ressources');
        }
        if (typeof window.displayDamage === 'function' && typeof TILE_SIZE !== 'undefined') {
          const hitPx = x * TILE_SIZE;
          const hitPy = y * TILE_SIZE;
          // Utiliser type 'damage' pour couleur rouge (différenciation visuelle)
          window.displayDamage(hitPx, hitPy, `+${qty} Blé`, 'damage', false);
        }
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
      // Libérer le verrou de coupe en cours
      if (window.__paysanCutInProgress[mapName]) delete window.__paysanCutInProgress[mapName][key];
      // Fin de coupe: libérer le verrou global et enchaîner
      window.__isHarvestingWheat = false;
      player.isBusyHarvesting = false;
      if (typeof onDone === 'function') onDone();
    }, 2000);
    scheduleRespawnCheck();
    return true;
  }

  function moveAdjacentThenCut(tx, ty, done){
    // Si déjà adjacent au blé, couper immédiatement sans reposition ni orientation
    if (Math.abs(player.x - tx) + Math.abs(player.y - ty) === 1) {
      if (window.__wheatCancelRequested) { if (done) done(); return; }
      cutWheat(tx, ty, done);
      return;
    }
    // Préférer la case la plus proche du joueur parmi les 4 adjacentes
    const candidates = [
      {x: tx-1, y: ty}, // gauche
      {x: tx+1, y: ty}, // droite
      {x: tx,   y: ty-1}, // haut
      {x: tx,   y: ty+1}  // bas
    ];
    const isValid = (p) => (
      p.x>=0 && p.y>=0 && p.x<window.mapData.width && p.y<window.mapData.height && !window.isBlocked(p.x, p.y)
    );
    const valid = candidates.filter(isValid);
    if (!valid.length){ if (done) done(); return; }
    let targetAdj = valid[0];
    let best = Math.abs(player.x - targetAdj.x) + Math.abs(player.y - targetAdj.y);
    for (let i=1;i<valid.length;i++){
      const d = Math.abs(player.x - valid[i].x) + Math.abs(player.y - valid[i].y);
      if (d < best){ best = d; targetAdj = valid[i]; }
    }
    if (typeof findPath === 'function' && window.mapData){
      const isBlockedWithPortals = (x, y) => {
        if (window.isBlocked(x, y)) return true;
        if (typeof isMonsterAt === 'function' && isMonsterAt(x,y)) return true;
        if (window.mapData && window.mapData.layers && window.mapData.layers.length > 3) {
          const layer4 = window.mapData.layers[3];
          const idx = y * layer4.width + x;
          const tid = layer4.data[idx];
          if ([1,2,3,4,5,6].includes(tid)) return true;
        }
        return false;
      };
      player.path = findPath({x: player.x, y: player.y}, targetAdj, isBlockedWithPortals, mapData.width, mapData.height) || [];
      nextStepToTarget();
      // Attendre l'arrivée
      setTimeout(function waitArrive(){
        if (window.__wheatCancelRequested) { if (done) done(); return; }
        if (Math.abs(player.x - targetAdj.x)+Math.abs(player.y - targetAdj.y) === 0){
          // Orienter le joueur FACE au blé selon la position adjacente choisie
          const dx = tx - player.x;
          const dy = ty - player.y;
          if (dx === 1 && dy === 0) player.direction = 1;      // blé à droite → regarder droite
          else if (dx === -1 && dy === 0) player.direction = 3; // blé à gauche → regarder gauche
          else if (dx === 0 && dy === 1) player.direction = 0;  // blé en bas → regarder bas
          else if (dx === 0 && dy === -1) player.direction = 2; // blé en haut → regarder haut
          cutWheat(tx, ty, done);
        } else {
          setTimeout(waitArrive, 120);
        }
      }, 150);
    } else {
      // Pas de pathfinding: coupe directe si déjà adjacent
      if (Math.abs(player.x - targetAdj.x)+Math.abs(player.y - targetAdj.y) === 0){
        const dx = tx - player.x;
        const dy = ty - player.y;
        if (dx === 1 && dy === 0) player.direction = 1;
        else if (dx === -1 && dy === 0) player.direction = 3;
        else if (dx === 0 && dy === 1) player.direction = 0;
        else if (dx === 0 && dy === -1) player.direction = 2;
        cutWheat(tx, ty, done);
      } else if (done) done();
    }
  }

  function processNextWheat(){
    const mapName = window.currentMap;
    if (!mapName) return;
    const queue = window.__wheatQueue[mapName] || [];
    if (!queue.length) return;
    // Si une coupe est déjà en cours, attendre la fin avant de lancer la suivante
    if (window.__isHarvestingWheat) return;
    const {x, y} = queue.shift();
    window.__wheatQueue[mapName] = queue;
    moveAdjacentThenCut(x, y, () => {
      // Lancer le suivant seulement quand __isHarvestingWheat sera remis à false
      setTimeout(processNextWheat, 50);
    });
  }

  function enqueueWheatHarvest(x, y){
    const mapName = window.currentMap;
    if (!mapName) return;
    // Si une annulation avait été demandée, on la réinitialise à la première nouvelle commande
    window.__wheatCancelRequested = false;
    if (!window.__wheatQueue[mapName]) window.__wheatQueue[mapName] = [];
    // éviter doublons consécutifs
    const already = window.__wheatQueue[mapName].some(p => p.x===x && p.y===y);
    if (!already) window.__wheatQueue[mapName].push({x, y});
    // Démarrer si inactif
    if (!window.__isHarvestingWheat && window.__wheatQueue[mapName].length === 1){
      processNextWheat();
    }
  }

  // Annulation immédiate de la file et de la coupe en cours
  window.cancelWheatQueueAndHarvest = function(){
    const mapName = window.currentMap;
    window.__wheatCancelRequested = true;
    if (mapName && window.__wheatQueue[mapName]) window.__wheatQueue[mapName] = [];
    // Stopper déplacement
    if (player) { player.path = []; player.moving = false; }
    // Annuler timer en cours et libérer verrous
    if (window.__currentWheatTimer) {
      clearTimeout(window.__currentWheatTimer);
      window.__currentWheatTimer = null;
    }
    if (window.__currentHarvestKey && window.__currentHarvestKey.map && window.__currentHarvestKey.key) {
      const { map, key } = window.__currentHarvestKey;
      if (window.__paysanCutInProgress[map]) delete window.__paysanCutInProgress[map][key];
      window.__currentHarvestKey = null;
    }
    window.__isHarvestingWheat = false;
    player.isBusyHarvesting = false;
  };

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
  window.cutWheat = (x,y) => enqueueWheatHarvest(x,y);
  window.enqueueWheatHarvest = enqueueWheatHarvest;
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



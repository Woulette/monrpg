(function(){
  const DAILY_LIMIT_SECONDS = 15 * 60; // 15 minutes / jour
  const ATTACK_INTERVAL_MS = 1000; // 1 attaque par seconde
  const STORAGE_KEY = 'mannequin_force_time_'; // par personnage

  function getCurrentKey(){
    const id = window.currentCharacterId || 'default';
    const day = new Date().toISOString().slice(0,10);
    return STORAGE_KEY + id + '_' + day;
  }

  function getTodayUsedSeconds(){
    const v = localStorage.getItem(getCurrentKey());
    return v ? Number(v) : 0;
  }

  function setTodayUsedSeconds(sec){
    localStorage.setItem(getCurrentKey(), String(Math.max(0, Math.floor(sec))));
  }

  function openMannequinTraining(mx, my){
    const existing = document.getElementById('mannequin-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'mannequin-overlay';
    overlay.className = 'mannequin-overlay';

    const content = document.createElement('div');
    content.className = 'mannequin-content';

    const title = document.createElement('h3');
    title.className = 'mannequin-title';
    title.textContent = 'Mannequin d’entraînement — Force';

    const close = document.createElement('button');
    close.className = 'mannequin-close';
    close.innerHTML = '&times;';
    close.onclick = () => overlay.remove();

    const body = document.createElement('div');
    body.className = 'mannequin-body';

    const left = document.createElement('div');
    left.className = 'mannequin-left';
    left.innerHTML = '<div style="font-size:80px;line-height:1">🗿</div>';

    const right = document.createElement('div');
    right.className = 'mannequin-right';

    const session = document.createElement('div');
    session.className = 'mannequin-session';
    const lbl = document.createElement('div');
    lbl.className = 'label';
    lbl.textContent = 'Temps restant aujourd\'hui:';
    const val = document.createElement('div');
    val.className = 'value';
    right.appendChild(session);
    session.appendChild(lbl);
    session.appendChild(val);

    const startBtn = document.createElement('button');
    startBtn.className = 'mannequin-btn';
    startBtn.textContent = 'Démarrer l’entraînement';
    right.appendChild(startBtn);

    // Bouton rond +1 (autoclick)
    const boostWrap = document.createElement('div');
    boostWrap.className = 'mannequin-boost-wrap';
    const boostLabel = document.createElement('div');
    boostLabel.className = 'mannequin-boost-label';
    boostLabel.textContent = 'Clique manuel (+1 seconde / +1 XP)';
    const boostBtn = document.createElement('button');
    boostBtn.className = 'mannequin-boost';
    boostBtn.textContent = '+1';
    right.appendChild(boostWrap);
    boostWrap.appendChild(boostLabel);
    boostWrap.appendChild(boostBtn);

    content.appendChild(title);
    content.appendChild(close);
    content.appendChild(body);
    body.appendChild(left);
    body.appendChild(right);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    let timer = null;
    let mannequinPos = (typeof mx === 'number' && typeof my === 'number') ? {x: mx, y: my} : (window.currentMannequinTarget || null);

    function isAdjacentAndFacing(){
      if (!mannequinPos) return false;
      const dx = mannequinPos.x - player.x;
      const dy = mannequinPos.y - player.y;
      const adjacent = (Math.abs(dx) + Math.abs(dy)) === 1;
      if (!adjacent) return false;
      // player.direction: 0=Bas,1=Droite,2=Haut,3=Gauche
      if (dx === 1 && dy === 0) return player.direction === 1; // mannequin à droite → joueur doit regarder droite
      if (dx === -1 && dy === 0) return player.direction === 3; // mannequin à gauche → gauche
      if (dx === 0 && dy === 1) return player.direction === 0; // mannequin en bas → bas
      if (dx === 0 && dy === -1) return player.direction === 2; // mannequin en haut → haut
      return false;
    }
    function updateRemaining(){
      const used = getTodayUsedSeconds();
      const remain = Math.max(0, DAILY_LIMIT_SECONDS - used);
      const mm = String(Math.floor(remain/60)).padStart(2,'0');
      const ss = String(remain%60).padStart(2,'0');
      val.textContent = `${mm}:${ss}`;
      startBtn.disabled = remain <= 0;
      boostBtn.disabled = remain <= 0;
      // Mise à jour de la position du mannequin si fournie globalement
      if (!mannequinPos && window.currentMannequinTarget) mannequinPos = window.currentMannequinTarget;
    }
    updateRemaining();

    function stop(){
      if (timer){ clearInterval(timer); timer = null; }
      updateRemaining();
    }

    startBtn.onclick = () => {
      if (timer) return;
      // Vérifier condition de proximité et orientation avant de démarrer
      if (!isAdjacentAndFacing()){
        // Essayer d'orienter automatiquement le joueur si déjà adjacent mais pas face
        if (mannequinPos) {
          const dx = mannequinPos.x - player.x;
          const dy = mannequinPos.y - player.y;
          if (Math.abs(dx) + Math.abs(dy) === 1) {
            // Définit orientation pour frapper "de face":
            // si mannequin est au-dessus du joueur → regarder haut (2)
            // si mannequin est au-dessous → regarder bas (0)
            // si mannequin est à gauche → regarder gauche (3)
            // si mannequin est à droite → regarder droite (1)
            if (dx === 0 && dy === -1) player.direction = 2; // mannequin au-dessus
            else if (dx === 0 && dy === 1) player.direction = 0; // mannequin en-dessous
            else if (dx === -1 && dy === 0) player.direction = 3; // mannequin à gauche
            else if (dx === 1 && dy === 0) player.direction = 1; // mannequin à droite
          }
        }
        // Re-vérifier après orientation
        if (!isAdjacentAndFacing()){
        if (typeof window.showFloatingMessage === 'function') {
          window.showFloatingMessage('Placez-vous face au mannequin', player.px, player.py, '#fbbf24');
        }
        return;
        }
      }
      const start = Date.now();
      // Attaque périodique 1/s, gain XP force
      timer = setInterval(() => {
        // Stop si le joueur bouge/plus adjacent/plus face
        if (!isAdjacentAndFacing()){
          stop();
          return;
        }
        const used = getTodayUsedSeconds();
        if (used >= DAILY_LIMIT_SECONDS){
          stop();
          return;
        }
        // Gagner XP de stat force
        if (typeof window.gainStatXP === 'function') window.gainStatXP('force', 1);
        // Effet visuel: afficher sur le mannequin (de face), pas sur le joueur
        if (typeof window.displayDamage === 'function' && mannequinPos) {
          const hitPx = mannequinPos.x * TILE_SIZE;
          const hitPy = mannequinPos.y * TILE_SIZE;
          window.displayDamage(hitPx, hitPy, '+1 Force XP', 'xp', true);
        }
        // Incrémenter le temps d\'entraînement utilisé
        setTodayUsedSeconds(used + 1);
        updateRemaining();
      }, ATTACK_INTERVAL_MS);
    };

    // Clique manuel +1
    boostBtn.onclick = () => {
      // Conditions: quota restant, adjacent+face
      const used = getTodayUsedSeconds();
      const remain = Math.max(0, DAILY_LIMIT_SECONDS - used);
      if (remain <= 0) return;
      if (!isAdjacentAndFacing()) {
        if (typeof window.showFloatingMessage === 'function') {
          window.showFloatingMessage('Placez-vous face au mannequin', player.px, player.py, '#fbbf24');
        }
        return;
      }
      // Gain XP force + effet visuel sur le mannequin
      if (typeof window.gainStatXP === 'function') window.gainStatXP('force', 1);
      if (typeof window.displayDamage === 'function' && mannequinPos) {
        const hitPx = mannequinPos.x * TILE_SIZE;
        const hitPy = mannequinPos.y * TILE_SIZE;
        window.displayDamage(hitPx, hitPy, '+1 Force XP', 'xp', true);
      }
      // Consommer 1 seconde du quota
      setTodayUsedSeconds(used + 1);
      updateRemaining();
    };

    overlay.addEventListener('click', (e) => { if (e.target === overlay) stop(); });
    // Sécurité: stopper à chaque mouvement du joueur
    const originalNextStep = window.nextStepToTarget;
    window.nextStepToTarget = function(){
      if (timer) {
        // re-vérifier à chaque tick mouvement
        setTimeout(() => { if (!isAdjacentAndFacing()) stop(); }, 0);
      }
      if (typeof originalNextStep === 'function') return originalNextStep();
    };
  }

  window.openMannequinTraining = openMannequinTraining;
})();



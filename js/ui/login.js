// Login simple: connecte l'utilisateur avant d'afficher les menus personnages
(function(){
  const API_BASE = (typeof window.API_BASE_URL !== 'undefined') ? window.API_BASE_URL : (location.hostname === 'localhost' ? 'http://localhost:3001' : '/');

  function showLogin(force){
    if (!force && window.__blockLoginOverlay) { try { console.warn('[LOGIN] Overlay bloqué (flux critique en cours)'); console.trace(); } catch(_){} return; }
    const t = getToken();
    if (!force && t) { try { console.warn('[LOGIN] Ignoré (token présent)'); } catch(_){} return; }
    const el = document.getElementById('login-screen');
    if (el) el.style.display = 'block';
    document.body.classList.add('login-open');
    try { console.warn('[LOGIN] showLogin appelé' + (force ? ' (force)' : '')); console.trace(); } catch(_){ }
  }
  function hideLogin(){ const el = document.getElementById('login-screen'); if (el) el.style.display = 'none'; document.body.classList.remove('login-open'); }

  async function postJson(path, body){
    const res = await fetch(API_BASE + path, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) });
    const json = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(json.error || 'Erreur');
    return json;
  }

  function saveToken(token){ try { localStorage.setItem('monrpg_token', token); } catch(_){} }
  function getToken(){ try { return localStorage.getItem('monrpg_token'); } catch(_) { return null; } }

  async function checkToken(){
    const t = getToken();
    if (!t) return false;
    try {
      const res = await fetch(API_BASE + '/auth/me', { headers:{ 'Authorization': 'Bearer ' + t } });
      if (!res.ok) return false;
      return true;
    } catch(_) { return false; }
  }

  async function ensureLoggedIn(){
    const ok = await checkToken();
    const menu = document.getElementById('character-selection-menu');
    if (ok) {
      hideLogin();
      if (typeof window.onLoginSuccess === 'function') window.onLoginSuccess();
      return;
    }
    showLogin(false);
    if (menu) menu.style.display = 'none';
  }

  function bindLoginUi(){
    const btnLogin = document.getElementById('btn-login');
    const btnSignup = document.getElementById('btn-signup');
    const inputUser = document.getElementById('login-username');
    const inputPass = document.getElementById('login-password');
    const errorEl = document.getElementById('login-error');
    if (!btnLogin || !btnSignup) return;

    btnSignup.onclick = async () => {
      errorEl.textContent = '';
      const u = (inputUser.value||'').trim();
      const p = (inputPass.value||'').trim();
      if (!u || !p) { errorEl.textContent = 'Entre un pseudo et un mot de passe.'; return; }
      try { await postJson('/auth/signup', { username:u, password:p }); errorEl.textContent = 'Compte créé. Connecte-toi.'; }
      catch(e){ errorEl.textContent = e.message || 'Erreur'; }
    };

    btnLogin.onclick = async () => {
      errorEl.textContent = '';
      const u = (inputUser.value||'').trim();
      const p = (inputPass.value||'').trim();
      if (!u || !p) { errorEl.textContent = 'Entre un pseudo et un mot de passe.'; return; }
      try {
        const json = await postJson('/auth/login', { username:u, password:p });
        saveToken(json.accessToken);
        hideLogin();
        if (typeof window.onLoginSuccess === 'function') window.onLoginSuccess();
      } catch(e){ errorEl.textContent = e.message || 'Erreur'; }
    };
  }

  // Afficher login si pas connecté au lancement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { bindLoginUi(); ensureLoggedIn(); bindLogout(); });
  } else { bindLoginUi(); ensureLoggedIn(); bindLogout(); }

  function bindLogout(){
    const btn = document.getElementById('logout-btn');
    if (!btn) return;
    btn.onclick = () => {
      try { localStorage.removeItem('monrpg_token'); } catch(_){ }
      showLogin(true);
      const menu = document.getElementById('character-selection-menu');
      if (menu) menu.style.display = 'none';
      // Forcer retour à l'état menu et masquer systèmes de jeu
      if (typeof window.returnToMenu === 'function') window.returnToMenu();
      // Protéger l’état global
      if (typeof window.gameState !== 'undefined') window.gameState = 'menu';
      // Vider les slots visuels
      if (Array.isArray(window.characterSlots)) {
        window.characterSlots = [null, null, null, null, null];
      }
      const slots = document.querySelectorAll('.character-slot .slot-content');
      slots.forEach(sc => { sc.innerHTML = '<div class="slot-icon">+</div><div class="slot-text">Créer un personnage</div>'; });
      // Nettoyage de l'init menu (sera reconstruit après login)
      if (typeof window.resetCharacterMenuInit === 'function') window.resetCharacterMenuInit();
      // Body en mode login
      document.body.classList.add('login-open');
    };
  }

  // Déconnexion forcée depuis d'autres modules (ex: si l'API renvoie 401)
  window.forceLogout = function(message){
    try { localStorage.removeItem('monrpg_token'); } catch(_){ }
    showLogin(true);
    const menu = document.getElementById('character-selection-menu');
    if (menu) menu.style.display = 'none';
    if (typeof window.returnToMenu === 'function') window.returnToMenu();
    if (typeof window.gameState !== 'undefined') window.gameState = 'menu';
    if (message) {
      const errorEl = document.getElementById('login-error');
      if (errorEl) errorEl.textContent = message;
    }
    if (typeof window.resetCharacterMenuInit === 'function') window.resetCharacterMenuInit();
    document.body.classList.add('login-open');
  };
})();



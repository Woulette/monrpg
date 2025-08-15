// UI d'invitations de groupe (non bloquante) + actions basiques

(function(){
  const PANE_ID = 'party-invite-pane';
  const LIST_ID = 'party-invite-list';

  function ensurePane() {
    let pane = document.getElementById(PANE_ID);
    if (!pane) {
      pane = document.createElement('div');
      pane.id = PANE_ID;
      pane.style.position = 'fixed';
      pane.style.left = '12px';
      pane.style.top = '120px';
      pane.style.zIndex = '1200';
      pane.style.width = '220px';
      pane.style.maxHeight = '40vh';
      pane.style.overflowY = 'auto';
      pane.style.background = 'rgba(28,32,40,0.92)';
      pane.style.border = '2px solid #3fa9f5';
      pane.style.borderRadius = '8px';
      pane.style.padding = '8px';
      pane.style.display = 'none';
      const title = document.createElement('div');
      title.textContent = 'Invitations de groupe';
      title.style.color = '#fff';
      title.style.fontWeight = 'bold';
      title.style.marginBottom = '6px';
      const list = document.createElement('div');
      list.id = LIST_ID;
      list.style.display = 'flex';
      list.style.flexDirection = 'column';
      list.style.gap = '6px';
      pane.appendChild(title);
      pane.appendChild(list);
      document.body.appendChild(pane);
    }
    return pane;
  }

  function showInvite(fromId, fromName, partyId) {
    const pane = ensurePane();
    const list = pane.querySelector('#' + LIST_ID);
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '6px';
    row.style.alignItems = 'center';
    const label = document.createElement('div');
    label.style.color = '#fff';
    label.style.flex = '1';
    label.textContent = `${fromName} vous invite`;
    const btnYes = document.createElement('button');
    btnYes.textContent = 'Accepter';
    btnYes.style.cursor = 'pointer';
    btnYes.onclick = () => {
      try { window.multiplayerManager?.socket?.send(JSON.stringify({ type: 'party_accept', partyId })); } catch(_) {}
      row.remove(); maybeHide();
    };
    const btnNo = document.createElement('button');
    btnNo.textContent = 'Refuser';
    btnNo.style.cursor = 'pointer';
    btnNo.onclick = () => {
      try { window.multiplayerManager?.socket?.send(JSON.stringify({ type: 'party_decline', fromId })); } catch(_) {}
      row.remove(); maybeHide();
    };
    row.appendChild(label); row.appendChild(btnYes); row.appendChild(btnNo);
    list.appendChild(row);
    pane.style.display = 'block';
  }

  function maybeHide() {
    const pane = ensurePane();
    const list = pane.querySelector('#' + LIST_ID);
    if (list && list.children.length === 0) {
      pane.style.display = 'none';
    }
  }

  // API globale appelée par multiplayer-manager
  window.partyUi = {
    addInvite: showInvite
  };
})();



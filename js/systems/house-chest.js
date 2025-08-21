// js/systems/house-chest.js
// Fenêtre de coffre de la maison (extrait de main.js)

window.showHouseChestWindow = function() {
  const chestWindow = document.createElement('div');
  chestWindow.id = 'house-chest-window';
  chestWindow.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #2c3e50, #34495e);
    border: 3px solid #f39c12; border-radius: 15px; padding: 30px; color: white;
    font-family: 'Arial', sans-serif; text-align: center; z-index: 10000; box-shadow: 0 10px 30px rgba(0,0,0,0.8); min-width: 500px;`;

  const chestItems = [
    { id: 'nouveau_sort', name: 'Nouveau Sort', type: 'sort', category: 'magie', description: 'Un sort puissant découvert dans les profondeurs', image: 'assets/objets/nouveau_sort.png', effect: 'nouveau_sort_power' },
    { id: 'orbe_speciale', name: 'Orbe Spéciale', type: 'orbe', category: 'artefact', description: 'Une orbe mystérieuse aux pouvoirs inconnus', image: 'assets/objets/orbe_speciale.png', effect: 'orbe_speciale_power' }
  ];

  chestWindow.innerHTML = `
    <h2 style="color:#f39c12;margin-bottom:20px;font-size:24px;">🎁 Coffre de la Maison</h2>
    <p style="font-size:16px;margin-bottom:25px;color:#ecf0f1;">Contenu du coffre :</p>
    <div style="display:flex;justify-content:space-around;gap:20px;margin-bottom:25px;">
      ${chestItems.map((item, index) => `
        <div class="chest-item" data-item-index="${index}" style="background:rgba(255,255,255,0.1);border:2px solid #f39c12;border-radius:10px;padding:15px;min-width:120px;">
          <div style="width:64px;height:64px;background:#555;margin:0 auto 10px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:24px;">📦</div>
          <div style="font-weight:bold;margin-bottom:5px;">${item.name}</div>
          <div style="font-size:12px;color:#bdc3c7;">${item.description}</div>
        </div>`).join('')}
    </div>
    <button id="recover-house-chest-items" style="background:linear-gradient(45deg,#27ae60,#2ecc71);color:white;border:none;padding:12px 25px;border-radius:8px;font-size:16px;cursor:pointer;transition:all .3s ease;margin-right:10px;">Récupérer</button>
    <button id="close-house-chest-window" style="background:linear-gradient(45deg,#e74c3c,#c0392b);color:white;border:none;padding:12px 25px;border-radius:8px;font-size:16px;cursor:pointer;transition:all .3s ease;">Fermer</button>`;

  document.body.appendChild(chestWindow);

  const recoverButton = chestWindow.querySelector('#recover-house-chest-items');
  recoverButton.addEventListener('click', function() {
    if (typeof window.addItemToInventory === 'function') {
      chestItems.forEach(item => { window.addItemToInventory(item.id, 1); });
    }
    document.body.removeChild(chestWindow);
  });

  const closeButton = chestWindow.querySelector('#close-house-chest-window');
  closeButton.addEventListener('click', function() { document.body.removeChild(chestWindow); });
};

// Coffre de la maison (extraction depuis main)

function showHouseChestWindow() {
  if (window.currentMap !== 'maison') return;
  const chestItems = [
    { id: 'nouveau_sort', name: 'Nouveau Sort', type: 'sort', category: 'magie', description: 'Un sort puissant découvert dans les profondeurs', image: 'assets/objets/nouveau_sort.png', effect: 'nouveau_sort_power' },
    { id: 'orbe_speciale', name: 'Orbe Spéciale', type: 'orbe', category: 'artefact', description: 'Une orbe mystérieuse aux pouvoirs inconnus', image: 'assets/objets/orbe_speciale.png', effect: 'orbe_speciale_power' }
  ];
  const chestWindow = document.createElement('div');
  chestWindow.id = 'house-chest-window';
  chestWindow.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(135deg, #2c3e50, #34495e); border: 3px solid #f39c12; border-radius: 15px; padding: 30px; color: white; font-family: 'Arial', sans-serif; text-align: center; z-index: 10000; box-shadow: 0 10px 30px rgba(0,0,0,0.8); min-width: 500px;`;
  chestWindow.innerHTML = `
    <h2 style="color: #f39c12; margin-bottom: 20px; font-size: 24px;">🎁 Coffre de la Maison</h2>
    <p style="font-size: 16px; margin-bottom: 25px; color: #ecf0f1;">Contenu du coffre :</p>
    <div style="display: flex; justify-content: space-around; gap: 20px; margin-bottom: 25px;">
      ${chestItems.map((item, index) => `
        <div class="chest-item" data-item-index="${index}" style="background: rgba(255,255,255,0.1); border: 2px solid #f39c12; border-radius: 10px; padding: 15px; min-width: 120px;">
          <div style="width: 64px; height: 64px; background: #555; margin: 0 auto 10px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 24px;">📦</div>
          <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
          <div style="font-size: 12px; color: #bdc3c7;">${item.description}</div>
        </div>`).join('')}
    </div>
    <button id="recover-house-chest-items" style="background: linear-gradient(45deg, #27ae60, #2ecc71); color: white; border: none; padding: 12px 25px; border-radius: 8px; font-size: 16px; cursor: pointer; transition: all 0.3s ease; margin-right: 10px;">Récupérer</button>
    <button id="close-house-chest-window" style="background: linear-gradient(45deg, #e74c3c, #c0392b); color: white; border: none; padding: 12px 25px; border-radius: 8px; font-size: 16px; cursor: pointer; transition: all 0.3s ease;">Fermer</button>
  `;
  document.body.appendChild(chestWindow);
  const recoverButton = chestWindow.querySelector('#recover-house-chest-items');
  recoverButton.addEventListener('click', () => {
    if (typeof window.addItemToInventory === 'function') chestItems.forEach(item => window.addItemToInventory(item.id, 1));
    if (typeof window.showMessage === 'function') window.showMessage('Vous avez récupéré tous les objets du coffre !', 'success');
    document.body.removeChild(chestWindow);
  });
  document.getElementById('close-house-chest-window').addEventListener('click', () => { document.body.removeChild(chestWindow); });
}

function openHouseChest() { if (window.currentMap === 'maison') showHouseChestWindow(); }

// Exports globaux compat
window.showHouseChestWindow = showHouseChestWindow;
window.openHouseChest = openHouseChest;


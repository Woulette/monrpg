// Fenêtre de récompense Boss (extraction depuis main)

function showBossVictoryPopup() {
  const popup = document.createElement('div');
  popup.id = 'boss-victory-popup';
  popup.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(135deg, #2c3e50, #34495e); border: 3px solid #f39c12; border-radius: 15px; padding: 30px; color: white; font-family: 'Arial', sans-serif; text-align: center; z-index: 10000; box-shadow: 0 10px 30px rgba(0,0,0,0.8); min-width: 400px;`;
  popup.innerHTML = `
    <h2 style="color: #f39c12; margin-bottom: 20px; font-size: 24px;">🏆 FÉLICITATIONS ! 🏆</h2>
    <p style="font-size: 18px; margin-bottom: 15px;">Vous avez éliminé le SlimeBoss !</p>
    <p style="font-size: 16px; margin-bottom: 25px; color: #ecf0f1;">Récupérez votre récompense dans le coffre du donjon.</p>
    <button id="close-boss-popup" style="background: linear-gradient(45deg, #e74c3c, #c0392b); color: white; border: none; padding: 12px 25px; border-radius: 8px; font-size: 16px; cursor: pointer; transition: all 0.3s ease;">Fermer</button>
  `;
  document.body.appendChild(popup);
  document.getElementById('close-boss-popup').addEventListener('click', () => { document.body.removeChild(popup); });
}

function showBossChestWindow() {
  const chestItems = [
    { id: 'orbe_atypique_niveau10', name: 'Orbe Atypique Niveau 10', type: 'objet_special', category: 'objet_special', description: "Un orbe mystérieux qui dégage une énergie particulière. Permet d'améliorer les équipements de niveau 10 ou inférieur.", image: 'assets/objets/orbesatypiqueniveau10.png' },
    { id: 'dague_slime', name: 'Dague de Slime', type: 'arme', category: 'équipement', description: 'Une dague visqueuse qui colle à vos ennemis', image: 'assets/equipements/armes/dagueslime.png', stats: { force: 3, agilite: 1 }, levelRequired: 10 },
    { id: 'orbe_atypique_sort_niveau10', name: 'Orbe Atypique Sort Niveau 10', type: 'objet_special', category: 'objet_special', description: "Un orbe mystérieux qui dégage une énergie magique particulière. Permet d'améliorer les sorts de niveau 10 ou inférieur.", image: 'assets/objets/orbesatypiquesortniveau10.png' }
  ];
  const chestWindow = document.createElement('div');
  chestWindow.id = 'boss-chest-window';
  chestWindow.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(135deg, #2c3e50, #34495e); border: 3px solid #f39c12; border-radius: 15px; padding: 30px; color: white; font-family: 'Arial', sans-serif; text-align: center; z-index: 10000; box-shadow: 0 10px 30px rgba(0,0,0,0.8); min-width: 500px;`;
  chestWindow.innerHTML = `
    <h2 style="color: #f39c12; margin-bottom: 20px; font-size: 24px;">🎁 Coffre du SlimeBoss</h2>
    <p style="font-size: 16px; margin-bottom: 25px; color: #ecf0f1;">Choisissez votre récompense :</p>
    <div style="display: flex; justify-content: space-around; gap: 20px; margin-bottom: 25px;">
      ${chestItems.map((item, index) => `
        <div class="chest-item" data-item-index="${index}" style="background: rgba(255,255,255,0.1); border: 2px solid #f39c12; border-radius: 10px; padding: 15px; cursor: pointer; transition: all 0.3s ease; min-width: 120px;">
          <div style="width: 64px; height: 64px; background: #555; margin: 0 auto 10px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
            <img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: contain;">
          </div>
          <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
          <div style="font-size: 12px; color: #bdc3c7;">${item.description}</div>
        </div>`).join('')}
    </div>
    <button id="close-chest-window" style="background: linear-gradient(45deg, #e74c3c, #c0392b); color: white; border: none; padding: 12px 25px; border-radius: 8px; font-size: 16px; cursor: pointer; transition: all 0.3s ease;">Fermer</button>
  `;
  document.body.appendChild(chestWindow);
  const itemElements = chestWindow.querySelectorAll('.chest-item');
  itemElements.forEach((el, index) => {
    el.addEventListener('click', () => {
      const selectedItem = chestItems[index];
      if (typeof window.addItemToInventory === 'function') {
        let category = 'equipement'; if (selectedItem.type === 'potion') category = 'potions'; else if (selectedItem.type === 'objet_special') category = 'equipement';
        window.addItemToInventory(selectedItem.id, category);
      }
      document.body.removeChild(chestWindow);
      setTimeout(() => {
        if (typeof window.teleportPlayer === 'function') window.teleportPlayer('map3', 10, 10);
        setTimeout(() => { if (typeof window.saveGameStateData === 'function' && window.currentCharacterId) window.saveGameStateData(window.currentCharacterId); }, 500);
      }, 1000);
    });
  });
  document.getElementById('close-chest-window').addEventListener('click', () => { document.body.removeChild(chestWindow); });
}

function giveBossReward() { if (typeof showBossChestWindow === 'function') showBossChestWindow(); }

// Exports globaux pour compat
window.showBossVictoryPopup = showBossVictoryPopup;
window.showBossChestWindow = showBossChestWindow;
window.giveBossReward = giveBossReward;


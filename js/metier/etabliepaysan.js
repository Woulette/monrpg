// Établie du Paysan — UI similaire à l'alchimiste (Four du paysan)
(function(){
  function openEtabliePaysan(){
    const existing = document.getElementById('paysan-workshop-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'paysan-workshop-modal';
    modal.className = 'alchimiste-modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'alchimiste-modal-content';

    const title = document.createElement('h2');
    title.textContent = "Four du paysan";
    title.className = 'alchimiste-title';

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'alchimiste-close-btn';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    const inventoryContainer = document.createElement('div');
    inventoryContainer.className = 'alchimiste-inventory-container';

    const craftContainer = document.createElement('div');
    craftContainer.className = 'alchimiste-craft-container';

    const craftHeader = document.createElement('div');
    craftHeader.className = 'alchimiste-craft-header';

    const craftTab = document.createElement('button');
    craftTab.textContent = 'Four';
    craftTab.className = 'alchimiste-craft-tab';

    const fusionTab = document.createElement('button');
    fusionTab.textContent = 'Moudre';
    fusionTab.className = 'alchimiste-fusion-tab';

    const craftTitle = document.createElement('h3');
    craftTitle.textContent = `Atelier Paysan — Niveau ${window.metiers?.paysan?.niveau || 1}`;
    craftTitle.className = 'alchimiste-craft-title';

    const craftViews = document.createElement('div');
    craftViews.className = 'alchimiste-craft-views';

    // Colonne des recettes (gauche), comme l'alchimiste
    const recipesBox = document.createElement('div');
    recipesBox.className = 'alchimiste-recipes-box';
    const recipesTitle = document.createElement('div');
    recipesTitle.className = 'alchimiste-recipes-title';
    recipesTitle.textContent = 'Recettes du paysan';
    recipesBox.appendChild(recipesTitle);

    // Recettes séparées: Moudre (farines) et Four (pains)
    const recettesMoudre = [
      {
        id: 'farine_ble',
        nom: 'Farine de blé',
        icon: 'assets/objets/ressources_paysan/farine.png',
        niveauRequise: 1,
        description: 'Moudre le blé pour obtenir de la farine.',
        xpGained: 8,
        ingredients: [
          { nom: 'Blé', icon: 'assets/objets/ressources_paysan/ble.png', quantite: 3 }
        ],
        resultat: { id: 'farine_ble', nom: 'Farine de blé', icon: 'assets/objets/ressources_paysan/farine.png', type: 'ressource', quantite: 1, stackable: true }
      },
      {
        id: 'farine_complete',
        nom: 'Farine complète',
        icon: 'assets/objets/ressources_paysan/farine_complete.png',
        niveauRequise: 5,
        description: 'Farine plus nourrissante, moulue plus finement.',
        xpGained: 12,
        ingredients: [
          { nom: 'Blé', icon: 'assets/objets/ressources_paysan/ble.png', quantite: 5 }
        ],
        resultat: { id: 'farine_complete', nom: 'Farine complète', icon: 'assets/objets/ressources_paysan/farine_complete.png', type: 'ressource', quantite: 1, stackable: true }
      }
    ];
    const recettesFour = [
      {
        id: 'pain',
        nom: 'Pain',
        icon: 'assets/objets/ressources_paysan/pain.png',
        niveauRequise: 3,
        description: 'Cuire la farine pour obtenir du pain.',
        xpGained: 12,
        ingredients: [
          { nom: 'Farine de blé', icon: 'assets/objets/ressources_paysan/farine.png', quantite: 2 }
        ],
        resultat: { id: 'pain', nom: 'Pain', icon: 'assets/objets/ressources_paysan/pain.png', type: 'consommable', quantite: 1, stackable: true }
      },
      {
        id: 'pain_complet',
        nom: 'Pain complet',
        icon: 'assets/objets/ressources_paysan/pain_complet.png',
        niveauRequise: 7,
        description: 'Pain plus nourrissant à base de farine complète.',
        xpGained: 18,
        ingredients: [
          { nom: 'Farine complète', icon: 'assets/objets/ressources_paysan/farine_complete.png', quantite: 2 }
        ],
        resultat: { id: 'pain_complet', nom: 'Pain complet', icon: 'assets/objets/ressources_paysan/pain_complet.png', type: 'consommable', quantite: 1, stackable: true }
      }
    ];

    // Rendu de la liste à gauche
    function renderPaysanRecipesList(mode){
      recipesBox.innerHTML = '';
      recipesBox.appendChild(recipesTitle);
      const liste = mode === 'moudre' ? recettesMoudre : recettesFour;
      recipesTitle.textContent = mode === 'moudre' ? 'Recettes — Moudre' : 'Recettes — Four';
      recipesBox.appendChild(recipesTitle);
      liste.forEach(recette => {
        const box = document.createElement('div');
        box.className = 'alchimiste-recipe-box';
        const row = document.createElement('div');
        row.className = 'alchimiste-recipe-row';
        const icon = document.createElement('img');
        icon.className = 'alchimiste-recipe-icon';
        icon.src = recette.icon;
        const name = document.createElement('div');
        name.className = 'alchimiste-recipe-name';
        name.textContent = recette.nom;
        row.appendChild(icon);
        row.appendChild(name);
        box.appendChild(row);
        // ingrédients
        const ingredientsRow = document.createElement('div');
        ingredientsRow.className = 'alchimiste-ingredients-row';
        recette.ingredients.forEach(ing => {
          const ingDiv = document.createElement('div');
          ingDiv.className = 'alchimiste-ingredient';
          const ingIcon = document.createElement('img');
          ingIcon.className = 'alchimiste-ingredient-icon';
          ingIcon.src = ing.icon;
          const ingQty = document.createElement('span');
          ingQty.className = 'alchimiste-ingredient-qty';
          ingQty.textContent = 'x' + ing.quantite;
          ingDiv.appendChild(ingIcon);
          ingDiv.appendChild(ingQty);
          ingredientsRow.appendChild(ingDiv);
        });
        box.appendChild(ingredientsRow);
        // niveau req + xp
        const xpRow = document.createElement('div');
        xpRow.className = 'alchimiste-xp-row';
        const xpText = document.createElement('div');
        xpText.className = 'alchimiste-xp-text';
        xpText.textContent = `Niveau requis: ${recette.niveauRequise} • XP: +${recette.xpGained}`;
        xpRow.appendChild(xpText);
        box.appendChild(xpRow);
        recipesBox.appendChild(box);

        // Sélection + preview craft slots
        box.onclick = () => {
          craftGrid.querySelectorAll('.alchimiste-craft-slot').forEach((slot, i) => {
            if (i < recette.ingredients.length){
              slot.innerHTML = `<img src='${recette.ingredients[i].icon}' class='alchimiste-item-icon'><div class='alchimiste-item-quantity'>${recette.ingredients[i].quantite}</div>`;
            } else {
              slot.innerHTML = `<div class='alchimiste-empty-indicator'>+</div>`;
            }
          });
          // Brancher le bouton action
          craftButton.textContent = (mode === 'moudre') ? 'Moudre' : 'Cuire';
          craftButton.onclick = () => {
            // Vérifier ressources via items.js (inventaires) par nom
            const hasAll = recette.ingredients.every(ing => {
              const count = (function getQtyByName(name){
                let total = 0;
                const invs = [window.inventoryRessources, window.inventoryAll];
                invs.forEach(inv => {
                  if (!Array.isArray(inv)) return;
                  inv.forEach(s => { if (s && s.item && s.item.name === name) total += (s.item.quantity||1); });
                });
                return total;
              })(ing.nom);
              return count >= ing.quantite;
            });
            if (!hasAll){
              if (window.showFloatingMessage) window.showFloatingMessage('Ressources insuffisantes', player.x, player.y-40, '#e53935', '16px');
              return;
            }
            // Consommer ingrédients
            recette.ingredients.forEach(ing => {
              if (typeof window.removeItemFromInventory === 'function') {
                // Trouver l'id dans resourceDatabase par nom
                let id = null;
                if (window.resourceDatabase){
                  for (const k in window.resourceDatabase){
                    if (window.resourceDatabase[k].name === ing.nom){ id = k; break; }
                  }
                }
                if (id) window.removeItemFromInventory(id, ing.quantite);
              }
            });
            // Ajouter résultat
            if (typeof window.addItemToInventory === 'function') {
              const cat = recette.resultat.type === 'consommable' ? 'potions' : 'ressources';
              // Enregistrer résultat dans resourceDatabase si nécessaire
              if (window.resourceDatabase && !window.resourceDatabase[recette.resultat.id]){
                window.resourceDatabase[recette.resultat.id] = {
                  id: recette.resultat.id,
                  name: recette.resultat.nom,
                  type: recette.resultat.type,
                  category: cat === 'potions' ? 'potion' : 'ressource',
                  icon: recette.resultat.icon,
                  stackable: true,
                  maxStack: 9999
                };
              }
              window.addItemToInventory(recette.resultat.id, cat);
            }
            // XP paysan
            if (window.gainMetierXP) window.gainMetierXP('paysan', recette.xpGained);
            if (window.showFloatingMessage) window.showFloatingMessage(`+${recette.xpGained} XP Paysan`, player.x, player.y-30, '#bfa14a', '16px');
          };
        };
      });
    }

    const craftView = document.createElement('div');
    craftView.id = 'paysan-craft-view';
    const craftGrid = document.createElement('div');
    craftGrid.className = 'alchimiste-craft-grid';

    let craftSlotsCount = 7;
    if (window.getMetierSlots && window.metiers && window.metiers.paysan) {
      craftSlotsCount = window.getMetierSlots('paysan');
    } else if (window.metiers && window.metiers.paysan) {
      const niveau = window.metiers.paysan.niveau || 1;
      craftSlotsCount = Math.min(7, 2 + Math.floor(niveau / 5));
    }
    for (let i = 0; i < craftSlotsCount; i++) {
      const craftSlot = document.createElement('div');
      craftSlot.className = 'alchimiste-craft-slot';
      craftSlot.innerHTML = `<div class='alchimiste-empty-indicator'>+</div>`;
      craftGrid.appendChild(craftSlot);
    }
    craftView.appendChild(craftGrid);

    const fusionView = document.createElement('div');
    fusionView.id = 'paysan-fusion-view';
    fusionView.className = 'alchimiste-fusion-view';
    const fusionSlotLeft = document.createElement('div');
    fusionSlotLeft.className = 'alchimiste-fusion-slot';
    const arrow = document.createElement('div');
    arrow.className = 'alchimiste-arrow';
    arrow.textContent = '➔';
    const fusionSlotRight = document.createElement('div');
    fusionSlotRight.className = 'alchimiste-fusion-slot';
    fusionView.appendChild(fusionSlotLeft);
    fusionView.appendChild(arrow);
    fusionView.appendChild(fusionSlotRight);

    craftViews.appendChild(craftView);
    craftViews.appendChild(fusionView);

    const craftButton = document.createElement('button');
    craftButton.className = 'alchimiste-craft-btn';
    craftButton.id = 'paysan-craft-btn-debug';
    craftButton.textContent = 'Cuire';

    const categoriesBar = document.createElement('div');
    categoriesBar.className = 'alchimiste-categories-bar';
    // Aligner exactement sur le chaudron alchimiste: Tout, Équipements, Potions, Ressources
    const categories = [
      { name: 'all', displayName: 'Tout', icon: 'assets/ui/tout.png' },
      { name: 'equipement', displayName: 'Équipements', icon: '🗡️' },
      { name: 'potions', displayName: 'Potions', icon: '🧪' },
      { name: 'ressources', displayName: 'Ressources', icon: '🌿' }
    ];
    let currentCategory = 'all';
    categories.forEach((category, index) => {
      const tab = document.createElement('button');
      tab.className = 'alchimiste-inventory-tab' + (index === 0 ? ' active' : '');
      tab.title = category.displayName;
      tab.dataset.category = category.name;
      if (typeof category.icon === 'string' && category.icon.endsWith('.png')) {
        const img = document.createElement('img');
        img.src = category.icon;
        img.alt = category.displayName;
        img.className = 'alchimiste-item-icon';
        tab.appendChild(img);
      } else {
        tab.textContent = category.icon;
        tab.style.fontSize = '20px';
      }
      tab.onclick = () => {
        categoriesBar.querySelectorAll('.alchimiste-inventory-tab').forEach(btn => btn.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = category.name;
        renderPaysanInventoryGrid(currentCategory);
      };
      categoriesBar.appendChild(tab);
    });

    const inventoryGrid = document.createElement('div');
    inventoryGrid.id = 'paysan-inventory-grid';
    inventoryGrid.className = 'alchimiste-inventory-grid';

    function renderPaysanInventoryGrid(categoryKey){
      // Reutiliser le rendu de l’alchimiste: afficher slots de `inventoryAll` (ou cat ciblée), avec quantité
      const grid = inventoryGrid;
      grid.innerHTML = '';
      let source = [];
      if (categoryKey === 'all' && Array.isArray(window.inventoryAll)) source = window.inventoryAll;
      else if (categoryKey === 'ressources' && Array.isArray(window.inventoryRessources)) source = window.inventoryRessources;
      else if (categoryKey === 'equipement' && Array.isArray(window.inventoryEquipement)) source = window.inventoryEquipement;
      else if (categoryKey === 'potions' && Array.isArray(window.inventoryPotions)) source = window.inventoryPotions;
      else source = [];
      const slots = 80;
      for (let i = 0; i < slots; i++) {
        const slot = document.createElement('div');
        slot.className = 'alchimiste-inventory-slot';
        const slotData = source[i] || { item: null };
        if (slotData.item) {
          let itemContent = `<img src="${slotData.item.icon}" alt="${slotData.item.name}" class="alchimiste-item-icon" title="${slotData.item.name}">`;
          if (slotData.item.quantity && slotData.item.quantity > 1) {
            itemContent += `<div class="alchimiste-item-quantity">${slotData.item.quantity}</div>`;
          }
          slot.innerHTML = itemContent;
          slot.addEventListener('click', () => {
            if (window.showEquipmentDetailModal) {
              window.showEquipmentDetailModal(slotData.item, i, categoryKey);
            }
          });
        } else {
          slot.innerHTML = `<div class='alchimiste-empty-indicator'>+</div>`;
        }
        grid.appendChild(slot);
      }
    }

    craftHeader.appendChild(craftTab);
    craftHeader.appendChild(fusionTab);
    craftHeader.appendChild(craftTitle);
    craftContainer.appendChild(craftHeader);
    // Ajouter la colonne recettes à gauche du craft
    modalContent.appendChild(recipesBox);
    craftContainer.appendChild(craftViews);
    craftContainer.appendChild(craftButton);

    inventoryContainer.appendChild(categoriesBar);
    inventoryContainer.appendChild(inventoryGrid);

    modalContent.appendChild(title);
    modalContent.appendChild(closeButton);
    modalContent.appendChild(inventoryContainer);
    modalContent.appendChild(craftContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Onglets Four/Silo (toggle vue)
    craftTab.addEventListener('click', () => {
      fusionTab.className = 'alchimiste-fusion-tab';
      craftTab.className = 'alchimiste-craft-tab';
      craftButton.textContent = 'Cuire';
      craftViews.innerHTML = '';
      craftViews.appendChild(craftView);
      renderPaysanRecipesList('four');
    });
    fusionTab.addEventListener('click', () => {
      craftTab.className = 'alchimiste-fusion-tab';
      fusionTab.className = 'alchimiste-craft-tab';
      craftButton.textContent = 'Moudre';
      craftViews.innerHTML = '';
      craftViews.appendChild(craftView);
      renderPaysanRecipesList('moudre');
    });

    // Rendu initial
    renderPaysanInventoryGrid('all');
    renderPaysanRecipesList('four');
  }
  window.openEtabliePaysan = openEtabliePaysan;
})();



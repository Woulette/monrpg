// js/metier/etablie.js

// Utilitaire pour icônes de stats
window.getStatIcon = function(stat) {
  switch(stat) {
    case 'force': return '💪';
    case 'agilite': return '⚡'; // Correction : éclair pour agilité
    case 'vie': return '❤️';
    case 'chance': return '🍀';
    case 'intelligence': return '🧠';
    case 'defense': return '🛡️';
    case 'vitesse': return '🏃';
    default: return '🔸';
  }
};

// Drag & drop équipement vers le slot de gauche (Amélioration)
window.enableInventoryDragAndDrop = function() {
  setTimeout(() => {
    document.querySelectorAll('#tailor-inventory-grid .tailor-inventory-slot, #cordonnier-inventory-grid .cordonnier-inventory-slot, #bijoutier-inventory-grid .bijoutier-inventory-slot').forEach(slot => {
      const img = slot.querySelector('img');
      if (img) {
        // Permettre le drag & drop pour les équipements ET les orbes
        if (img.src.includes('assets/equipements/') || img.src.includes('orbesatypiqueniveau10.png')) {
          slot.setAttribute('draggable', 'true');
          slot.ondragstart = (e) => {
            const itemName = img.getAttribute('alt');
            e.dataTransfer.setData('text/plain', itemName);
            e.dataTransfer.setData('dragged-icon', img.src);
          };
          slot.onclick = () => {
            // Déterminer si c'est un équipement ou un orbe
            if (img.src.includes('assets/equipements/')) {
              // C'est un équipement, aller dans le slot gauche
              const slotLeft = document.querySelector('.tailor-improve-slot, .cordonnier-improve-slot, .bijoutier-improve-slot');
              if (slotLeft) {
                slotLeft.innerHTML = '';
                const imgClone = img.cloneNode(true);
                imgClone.style.width = '48px';
                imgClone.style.height = '48px';
                slotLeft.appendChild(imgClone);
                // Affiche la fiche de l'équipement en bas (si trouvé dans equipmentDatabase)
                let found = null;
                for (const id in window.equipmentDatabase) {
                  if (window.equipmentDatabase[id].icon && (img.src.endsWith(window.equipmentDatabase[id].icon) || window.equipmentDatabase[id].icon.endsWith(img.src))) {
                    found = window.equipmentDatabase[id];
                    break;
                  }
                }
                // Affichage fiche équipement (à adapter si besoin)
              }
            } else if (img.src.includes('orbesatypiqueniveau10.png')) {
              // C'est un orbe, aller dans le slot droit
              const slotRight = document.querySelector('.tailor-improve-slot, .cordonnier-improve-slot, .bijoutier-improve-slot');
              if (slotRight) {
                // Trouver le slot droit (le deuxième slot d'amélioration)
                const improveSlots = document.querySelectorAll('.tailor-improve-slot, .cordonnier-improve-slot, .bijoutier-improve-slot');
                if (improveSlots.length >= 2) {
                  const rightSlot = improveSlots[1]; // Le deuxième slot est le slot droit
                  rightSlot.innerHTML = '';
                  const imgClone = img.cloneNode(true);
                  imgClone.style.width = '48px';
                  imgClone.style.height = '48px';
                  rightSlot.appendChild(imgClone);
                }
              }
            }
          };
        } else {
          slot.removeAttribute('draggable');
          slot.onclick = null;
          slot.ondragstart = null;
        }
      } else {
        slot.removeAttribute('draggable');
        slot.onclick = null;
        slot.ondragstart = null;
      }
    });
  }, 100);
};

// Fonction générique pour ouvrir une modale d'établie
function openWorkshopModal({
  idPrefix,
  titleText,
  recipes,
  cssPrefix
}) {
  // Supprimer la fenêtre existante si elle existe
  const existingModal = document.getElementById(`${idPrefix}-workshop-modal`);
  if (existingModal) existingModal.remove();
  // Créer la fenêtre modale
  const modal = document.createElement('div');
  modal.id = `${idPrefix}-workshop-modal`;
  modal.className = `${cssPrefix}modal-overlay`;
  // Contenu
  const modalContent = document.createElement('div');
  modalContent.className = `${cssPrefix}modal-content`;
  // Titre
  const title = document.createElement('h2');
  title.textContent = titleText;
  title.className = `${cssPrefix}title`;
  // Bouton fermeture
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.className = `${cssPrefix}close-btn`;
  closeButton.onclick = () => modal.remove();
  modalContent.appendChild(closeButton);
  // Conteneur inventaire
  const inventoryContainer = document.createElement('div');
  inventoryContainer.className = `${cssPrefix}inventory-container`;
  // Conteneur craft
  const craftContainer = document.createElement('div');
  craftContainer.className = `${cssPrefix}craft-container`;
  // Header onglets
  const craftHeader = document.createElement('div');
  craftHeader.className = `${cssPrefix}craft-header`;
  const craftTab = document.createElement('button');
  craftTab.textContent = 'Craft';
  craftTab.className = `${cssPrefix}craft-tab`;
  const improveTab = document.createElement('button');
  improveTab.textContent = 'Amélioration';
  improveTab.className = `${cssPrefix}improve-tab`;
  const craftTitle = document.createElement('h3');
  craftTitle.textContent = 'Craft - Niveau 100';
  craftTitle.className = `${cssPrefix}craft-title`;
  craftHeader.appendChild(craftTab);
  craftHeader.appendChild(craftTitle);
  craftHeader.appendChild(improveTab);
  craftContainer.appendChild(craftHeader);
  // Vues craft/amélioration
  const craftViews = document.createElement('div');
  craftViews.className = `${cssPrefix}craft-views`;
  craftContainer.appendChild(craftViews);
  // Vue Craft (7 slots)
  const craftGrid = document.createElement('div');
  craftGrid.className = `${cssPrefix}craft-grid`;
  const craftSlotsCount = 7;
  for (let i = 0; i < craftSlotsCount; i++) {
    const craftSlot = document.createElement('div');
    craftSlot.className = `${cssPrefix}craft-slot`;
    craftSlot.dataset.slot = i;
    const emptyIndicator = document.createElement('div');
    emptyIndicator.textContent = '+';
    emptyIndicator.className = `${cssPrefix}empty-indicator`;
    craftSlot.appendChild(emptyIndicator);
    craftGrid.appendChild(craftSlot);
  }
  // Vue Amélioration
  const improveView = document.createElement('div');
  improveView.className = `${cssPrefix}improve-view`;
  const improveSlotLeft = document.createElement('div');
  improveSlotLeft.className = `${cssPrefix}improve-slot`;
  const arrow = document.createElement('div');
  arrow.className = `${cssPrefix}arrow`;
  arrow.innerHTML = '➡️';
  const improveSlotRight = document.createElement('div');
  improveSlotRight.className = `${cssPrefix}improve-slot`;
  improveView.appendChild(improveSlotLeft);
  improveView.appendChild(arrow);
  improveView.appendChild(improveSlotRight);

  // Bouton d'amélioration
  const improveButton = document.createElement('button');
  improveButton.textContent = 'AMÉLIORER';
  improveButton.className = `${cssPrefix}improve-btn`;
  improveButton.id = `${cssPrefix}improve-btn-debug`;
  improveView.appendChild(improveButton);

  // Fiche d'aperçu pour l'amélioration
  let improvePreviewDiv = document.createElement('div');
  improvePreviewDiv.id = `${cssPrefix}improve-preview`;
  improvePreviewDiv.className = `${cssPrefix}improve-preview`;
  improveView.appendChild(improvePreviewDiv);
  // Affichage par défaut : vue craft
  craftViews.appendChild(craftGrid);
  // Switch d'onglet
  craftTab.onclick = () => {
    craftTab.className = `${cssPrefix}craft-tab`;
    improveTab.className = `${cssPrefix}improve-tab`;
    craftViews.innerHTML = '';
    craftViews.appendChild(craftGrid);
    // Afficher le bouton CRAFTER dans l'onglet Craft
    if (craftButton) craftButton.style.display = 'block';
  };
  improveTab.onclick = () => {
    improveTab.className = `${cssPrefix}craft-tab`;
    craftTab.className = `${cssPrefix}improve-tab`;
    craftViews.innerHTML = '';
    craftViews.appendChild(improveView);
    if (craftPreviewDiv) craftPreviewDiv.innerHTML = '';
    if (improvePreviewDiv) improvePreviewDiv.innerHTML = '';
    // Masquer le bouton CRAFTER dans l'onglet Amélioration
    if (craftButton) craftButton.style.display = 'none';
    
    // Initialiser le bouton AMÉLIORER quand l'onglet est activé
    setTimeout(() => {
      const improveBtn = document.getElementById(`${cssPrefix}improve-btn-debug`);
      console.log('Recherche du bouton améliorer:', `${cssPrefix}improve-btn-debug`);
      console.log('Bouton trouvé:', improveBtn);
      if (improveBtn) {
        improveBtn.onclick = () => {
          console.log('Clic sur le bouton AMÉLIORER détecté');
          // Récupérer l'équipement dans le slot gauche
          const leftSlot = improveSlotLeft.querySelector('img');
          const rightSlot = improveSlotRight.querySelector('img');
          
          if (!leftSlot || !rightSlot) {
            alert('Placez un équipement et un orbe atypique pour améliorer !');
            return;
          }

          // Vérifier que le slot droit contient un orbe atypique niveau 10
          const orbeIcon = rightSlot.src;
          if (!orbeIcon.includes('orbesatypiqueniveau10.png')) {
            alert('L\'orbe dans le slot de droite doit être un orbe atypique niveau 10 !');
            return;
          }

          // Trouver l'équipement dans la base de données
          let equipItem = null;
          let equipId = '';
          for (const id in window.equipmentDatabase) {
            const item = window.equipmentDatabase[id];
            if (item && item.icon && (leftSlot.src.endsWith(item.icon) || item.icon.endsWith(leftSlot.src))) {
              equipItem = item;
              equipId = id;
              break;
            }
          }

          if (!equipItem) {
            alert('Équipement non reconnu !');
            return;
          }

          // Vérifier que l'équipement n'est pas déjà atypique
          if (equipItem.name && equipItem.name.includes('Atypique')) {
            alert('Cet équipement est déjà atypique !');
            return;
          }

          // Vérifier que l'équipement a un niveau requis inférieur ou égal à 10
          if (equipItem.levelRequired && equipItem.levelRequired > 10) {
            alert('Cet équipement nécessite un niveau supérieur à 10 et ne peut pas être amélioré avec cet orbe.');
            return;
          }

          // Vérifier que le joueur a bien l'orbe dans son inventaire
          let hasOrbe = false;
          for (let slot of window.inventoryAll) {
            if (slot.item && slot.item.id === 'orbe_atypique_niveau10') {
              hasOrbe = true;
              break;
            }
          }

          if (!hasOrbe) {
            alert('Vous n\'avez pas d\'orbe atypique dans votre inventaire !');
            return;
          }

          // Créer le nouvel item atypique
          const newItemId = equipId + '_atypique';
          
          // Utiliser la fonction createAtypicalEquipment si elle existe
          let newItem;
          if (typeof window.createAtypicalEquipment === 'function') {
            newItem = window.createAtypicalEquipment(equipId);
          } else {
            // Fallback si la fonction n'existe pas
            const newStats = {};
            if (equipItem.stats) {
              Object.entries(equipItem.stats).forEach(([stat, value]) => {
                // Augmentation de 50% arrondie
                newStats[stat] = Math.round(value * 1.5);
              });
            }

            newItem = {
              id: newItemId,
              name: equipItem.name + ' Atypique',
              type: equipItem.type,
              slot: equipItem.slot, // Ajouter le slot pour l'équipement
              icon: equipItem.icon,
              description: equipItem.description + ' (Version atypique)',
              stats: newStats,
              levelRequired: equipItem.levelRequired,
              rarity: 'atypique'
            };
          }

          // Ajouter à la base de données si pas déjà présent
          if (!window.equipmentDatabase[newItemId]) {
            window.equipmentDatabase[newItemId] = newItem;
          } else {
            // Mettre à jour l'item existant avec les nouvelles stats
            window.equipmentDatabase[newItemId] = newItem;
          }

          // Retirer l'orbe de l'inventaire
          let orbeRemoved = false;
          for (let slot of window.inventoryAll) {
            if (slot.item && slot.item.id === 'orbe_atypique_niveau10' && !orbeRemoved) {
              if (slot.item.quantity && slot.item.quantity > 1) {
                slot.item.quantity--;
              } else {
                slot.item = null;
              }
              orbeRemoved = true;
            }
          }
          
          // S'assurer que l'orbe est aussi supprimé des autres grilles d'inventaire
          if (window.inventoryEquipement) {
            for (let slot of window.inventoryEquipement) {
              if (slot.item && slot.item.id === 'orbe_atypique_niveau10') {
                slot.item = null;
              }
            }
          }

          // Retirer l'ancien équipement de l'inventaire
          let equipRemoved = false;
          for (let slot of window.inventoryAll) {
            if (slot.item && slot.item.id === equipId && !equipRemoved) {
              console.log(`Suppression de l'équipement original: ${slot.item.id}`);
              slot.item = null;
              equipRemoved = true;
            }
          }
          
          // S'assurer que l'équipement original est aussi supprimé des autres grilles d'inventaire
          if (window.inventoryEquipement) {
            for (let slot of window.inventoryEquipement) {
              if (slot.item && slot.item.id === equipId) {
                console.log(`Suppression de l'équipement original de inventoryEquipement: ${slot.item.id}`);
                slot.item = null;
              }
            }
          }
          
          // Supprimer aussi des autres grilles d'inventaire si elles existent
          if (window.inventoryPotions) {
            for (let slot of window.inventoryPotions) {
              if (slot.item && slot.item.id === equipId) {
                console.log(`Suppression de l'équipement original de inventoryPotions: ${slot.item.id}`);
                slot.item = null;
              }
            }
          }
          
          if (window.inventoryRessources) {
            for (let slot of window.inventoryRessources) {
              if (slot.item && slot.item.id === equipId) {
                console.log(`Suppression de l'équipement original de inventoryRessources: ${slot.item.id}`);
                slot.item = null;
              }
            }
          }
          
          if (!equipRemoved) {
            console.warn('Aucun équipement original trouvé à supprimer');
          }

          // Ajouter le nouvel équipement atypique à l'inventaire
          if (typeof addItemToInventory === 'function') {
            const result = addItemToInventory(newItemId, 'equipement');
            if (result === false) {
              alert("Inventaire plein, impossible d'ajouter l'équipement amélioré !");
              return;
            }
            console.log(`Équipement amélioré ajouté: ${newItemId}`);
          }

          // Vider les slots d'amélioration
          improveSlotLeft.innerHTML = '';
          improveSlotRight.innerHTML = '';

          // Mettre à jour l'inventaire
          if (typeof updateAllGrids === 'function') updateAllGrids();
          if (typeof updateCraftInventoryGrid === 'function') updateCraftInventoryGrid();
          if (typeof window.enableInventoryDragAndDrop === 'function') window.enableInventoryDragAndDrop();
          
          // Forcer la mise à jour de toutes les grilles d'inventaire
          setTimeout(() => {
            if (typeof updateAllGrids === 'function') updateAllGrids();
            if (typeof updateCraftInventoryGrid === 'function') updateCraftInventoryGrid();
          }, 100);

          // Afficher la fiche de l'item amélioré
          improvePreviewDiv.innerHTML = `
            <div class='item-preview'>
              <div class='item-preview-card'>
                <img src='${newItem.icon}' alt='${newItem.name}' class='item-preview-icon'>
                <div class='item-preview-infos'>
                  <div class='item-preview-title'>${newItem.name}</div>
                  <div class='item-preview-stats'>
                    ${Object.entries(newItem.stats||{}).map(([k,v])=>`<span class='item-preview-stat'><span class='item-preview-stat-icon'>${window.getStatIcon(k)}</span> <span class='item-preview-stat-name'>${k}</span> : <b class='item-preview-stat-value'>${v}</b></span>`).join('')}
                  </div>
                  <div class='item-preview-rarity' style='color: #4CAF50; font-weight: bold;'>Atypique</div>
                </div>
              </div>
            </div>
                     `;
         };
      }
    }, 100);
  };
  // Bouton de craft
  const craftButton = document.createElement('button');
  craftButton.textContent = 'CRAFTER';
  craftButton.className = `${cssPrefix}craft-btn`;
  craftButton.id = `${cssPrefix}craft-btn-debug`;
  craftContainer.appendChild(craftButton);
  // Barre des catégories
  const categoriesBar = document.createElement('div');
  categoriesBar.className = `${cssPrefix}categories-bar`;
  const categories = [
    { name: 'all', displayName: 'Tout', icon: 'assets/ui/tout.png' },
    { name: 'equipement', displayName: 'Équipements', icon: '🗡️' },
    { name: 'potions', displayName: 'Potions', icon: '🧪' },
    { name: 'ressources', displayName: 'Ressources', icon: '🌿' }
  ];
  let currentCategory = 'all';
  categories.forEach((category, index) => {
    const tab = document.createElement('button');
    tab.className = `${cssPrefix}inventory-tab` + (index === 0 ? ' active' : '');
    tab.title = category.displayName;
    tab.dataset.category = category.name;
    if (category.icon.endsWith('.png')) {
      const img = document.createElement('img');
      img.src = category.icon;
      img.alt = category.displayName;
      img.className = `${cssPrefix}item-icon`;
      tab.appendChild(img);
    } else {
      tab.textContent = category.icon;
      tab.style.fontSize = '20px';
    }
    tab.onclick = () => {
      categoriesBar.querySelectorAll(`.${cssPrefix}inventory-tab`).forEach(btn => btn.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = category.name;
      updateCraftInventoryGrid();
    };
    categoriesBar.appendChild(tab);
  });
  // Grille d'inventaire
  const inventoryGrid = document.createElement('div');
  inventoryGrid.id = `${idPrefix}-inventory-grid`;
  inventoryGrid.className = `${cssPrefix}inventory-grid`;
  function getInventoryByCategory(category) {
    switch(category) {
      case 'equipement': return window.inventoryEquipement || [];
      case 'potions': return window.inventoryPotions || [];
      case 'ressources': return window.inventoryRessources || [];
      case 'all':
      default: return window.inventoryAll || [];
    }
  }
  function updateCraftInventoryGrid() {
    const targetInventory = getInventoryByCategory(currentCategory);
    inventoryGrid.innerHTML = '';
    for (let i = 0; i < 80; i++) {
      const slot = document.createElement('div');
      slot.className = `${cssPrefix}inventory-slot`;
      // Ajout de la classe spécifique pour le tailleur
      if (cssPrefix === 'tailor-') {
        slot.classList.add('tailor-inventory-slot');
      }
      if (cssPrefix === 'cordonnier-') {
        slot.classList.add('cordonnier-inventory-slot');
      }
      if (cssPrefix === 'bijoutier-') {
        slot.classList.add('bijoutier-inventory-slot');
      }
      const slotData = targetInventory[i];
      if (slotData && slotData.item) {
        if (slotData.item.icon && slotData.item.icon.startsWith('assets/')) {
          let itemContent = `<img src="${slotData.item.icon}" alt="${slotData.item.name}" class="${cssPrefix}item-icon" title="${slotData.item.name}">`;
          if (slotData.item.stackable && slotData.item.quantity > 1) {
            itemContent += `<div class="${cssPrefix}item-quantity">${slotData.item.quantity}</div>`;
          }
          slot.innerHTML = itemContent;
        } else {
          let itemContent = `<span style="font-size:1.6em" title="${slotData.item.name}">${slotData.item.icon}</span>`;
          if (slotData.item.stackable && slotData.item.quantity > 1) {
            itemContent += `<div class="${cssPrefix}item-quantity">${slotData.item.quantity}</div>`;
          }
          slot.innerHTML = itemContent;
        }
      }
      slot.onmouseenter = () => slot.classList.add('hover');
      slot.onmouseleave = () => slot.classList.remove('hover');
      inventoryGrid.appendChild(slot);
    }
  }
  // Liste des recettes à gauche
  const recipesBox = document.createElement('div');
  recipesBox.className = `${cssPrefix}recipes-box`;
  const recipesTitle = document.createElement('div');
  recipesTitle.className = `${cssPrefix}recipes-title`;
  recipesTitle.textContent = 'Recettes disponibles';
  recipesBox.appendChild(recipesTitle);
  recipes.forEach(recipe => {
    const recipeBox = document.createElement('div');
    recipeBox.className = `${cssPrefix}recipe-box`;
    const row = document.createElement('div');
    row.className = `${cssPrefix}recipe-row`;
    const icon = document.createElement('img');
    icon.src = recipe.icon;
    icon.alt = recipe.name;
    icon.className = `${cssPrefix}recipe-icon`;
    const name = document.createElement('span');
    name.textContent = recipe.name;
    name.className = `${cssPrefix}recipe-name`;
    row.appendChild(icon);
    row.appendChild(name);
    recipeBox.appendChild(row);
    // Ingrédients
    const ingredientsRow = document.createElement('div');
    ingredientsRow.className = `${cssPrefix}ingredients-row`;
    recipe.ingredients.forEach(ing => {
      const ingDiv = document.createElement('div');
      ingDiv.className = `${cssPrefix}ingredient`;
      const ingIcon = document.createElement('img');
      ingIcon.src = ing.icon;
      ingIcon.alt = ing.name;
      ingIcon.className = `${cssPrefix}ingredient-icon`;
      const ingQty = document.createElement('span');
      ingQty.textContent = `x${ing.quantity}`;
      ingQty.className = `${cssPrefix}ingredient-qty`;
      ingDiv.appendChild(ingIcon);
      ingDiv.appendChild(ingQty);
      ingredientsRow.appendChild(ingDiv);
    });
    recipeBox.appendChild(ingredientsRow);
    recipesBox.appendChild(recipeBox);
    // Clic sur recette : remplir slots de craft
    recipeBox.onclick = () => {
      let hasAll = recipe.ingredients.every(ing => {
        let total = 0;
        for (let slot of window.inventoryAll) {
          if (slot.item && slot.item.icon === ing.icon) {
            total += slot.item.quantity || 1;
          }
        }
        return total >= ing.quantity;
      });
      if (!hasAll) {
        alert("Tu n'as pas assez de ressources pour ce craft !");
        return;
      }
      for (let i = 0; i < craftGrid.children.length; i++) {
        let slot = craftGrid.children[i];
        slot.innerHTML = `<div class='${cssPrefix}empty-indicator'>+</div>`;
      }
      let slotIndex = 0;
      recipe.ingredients.forEach(ing => {
        if (slotIndex < craftGrid.children.length) {
          let slot = craftGrid.children[slotIndex];
          slot.innerHTML = '';
          let ingIcon = document.createElement('img');
          ingIcon.src = ing.icon;
          ingIcon.alt = ing.name;
          ingIcon.className = `${cssPrefix}ingredient-icon`;
          slot.appendChild(ingIcon);
          let qtySpan = document.createElement('span');
          qtySpan.textContent = 'x' + ing.quantity;
          qtySpan.className = `${cssPrefix}ingredient-qty`;
          slot.appendChild(qtySpan);
          slotIndex++;
        }
      });
    };
  });
  // Fiche d'aperçu
  let craftPreviewDiv = document.createElement('div');
  craftPreviewDiv.id = `${cssPrefix}craft-preview`;
  craftPreviewDiv.className = `${cssPrefix}craft-preview`;
  craftContainer.appendChild(craftButton);
  craftContainer.appendChild(craftPreviewDiv);
  // Assembler la fenêtre
  inventoryContainer.appendChild(categoriesBar);
  inventoryContainer.appendChild(inventoryGrid);
  modalContent.appendChild(title);
  modalContent.appendChild(inventoryContainer);
  modalContent.appendChild(craftContainer);
  modalContent.appendChild(recipesBox);
  modal.appendChild(modalContent);
  // Init grille
  updateCraftInventoryGrid();
  if (typeof window.enableInventoryDragAndDrop === 'function') window.enableInventoryDragAndDrop();
  
  // Fonction pour mettre à jour l'inventaire des établis
  window.updateEtabliesInventory = function() {
    if (typeof updateCraftInventoryGrid === 'function') {
      updateCraftInventoryGrid();
    }
  };
  
  // Rendre la fonction accessible globalement
  if (typeof window.updateEtabliesInventory === 'function') {
    // Fermer en cliquant à l'extérieur
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
    // Fermer avec Échap
    function handleEscapeModal(e) {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscapeModal);
      }
    }
    document.addEventListener('keydown', handleEscapeModal);

    // Bouton CRAFTER
    setTimeout(() => {
      const btn = document.getElementById(`${cssPrefix}craft-btn-debug`);
      if (btn) {
        btn.onclick = () => {
          // Récupérer les ingrédients dans les slots de craft
          let usedIngredients = [];
          for (let i = 0; i < craftGrid.children.length; i++) {
            let slot = craftGrid.children[i];
            let img = slot.querySelector('img');
            let qtySpan = slot.querySelector('span');
            if (img && qtySpan) {
              let iconPath = img.src.split('assets/').pop();
              iconPath = 'assets/' + iconPath;
              usedIngredients.push({
                icon: iconPath,
                quantity: parseInt(qtySpan.textContent.replace('x',''))
              });
            }
          }
          // Trouver la recette correspondante
          let recipe = recipes.find(r => {
            if (r.ingredients.length !== usedIngredients.length) return false;
            return r.ingredients.every((ing, idx) => {
              return usedIngredients[idx] && (usedIngredients[idx].icon.endsWith(ing.icon) || ing.icon.endsWith(usedIngredients[idx].icon)) && ing.quantity === usedIngredients[idx].quantity;
            });
          });
          if (!recipe) {
            alert('Aucune recette ne correspond à la combinaison dans les slots de craft.');
            return;
          }
          // Vérifier que le joueur a bien les ressources
          let hasAll = recipe.ingredients.every(ing => {
            let total = 0;
            for (let slot of window.inventoryAll) {
              if (slot.item && (slot.item.icon.endsWith(ing.icon) || ing.icon.endsWith(slot.item.icon))) {
                total += slot.item.quantity || 1;
              }
            }
            return total >= ing.quantity;
          });
          if (!hasAll) {
            alert("Tu n'as pas assez de ressources pour ce craft !");
            return;
          }
          

          // Retirer les ressources de l'inventaire
          recipe.ingredients.forEach(ing => {
            let qtyToRemove = ing.quantity;
            for (let slot of window.inventoryAll) {
              if (slot.item && (slot.item.icon.endsWith(ing.icon) || ing.icon.endsWith(slot.item.icon)) && qtyToRemove > 0) {
                let removeQty = Math.min(qtyToRemove, slot.item.quantity || 1);
                if (slot.item.type === 'ressource' || slot.item.id === 'patte_corbeau' || slot.item.id === 'plume_corbeau') {
                  for (let slotRes of window.inventoryRessources) {
                    if (slotRes.item && slotRes.item.id === slot.item.id) {
                      if (slotRes.item.quantity) {
                        slotRes.item.quantity -= removeQty;
                        if (slotRes.item.quantity <= 0) slotRes.item = null;
                      } else {
                        slotRes.item = null;
                      }
                    }
                  }
                }
                if (slot.item.quantity) {
                  slot.item.quantity -= removeQty;
                  if (slot.item.quantity <= 0) slot.item = null;
                } else {
                  slot.item = null;
                }
                qtyToRemove -= removeQty;
              }
            }
          });
          // Ajouter l'équipement à l'inventaire
          let equipId = '';
          switch (recipe.name) {
            case 'Corbacape': equipId = 'cape_corbeau'; break;
            case 'Corbacoiffe': equipId = 'coiffe_corbeau'; break;
            case 'Corbobotte': equipId = 'bottes_corbeau'; break;
            case 'Corbature': equipId = 'ceinture_corbeau'; break;
            case 'Corbolier': equipId = 'amulette_corbeau'; break;
            case 'Corbaneau': equipId = 'anneau_corbeau'; break;
            case 'Cape de Slime': equipId = 'cape_slime'; break;
            case 'Coiffe de Slime': equipId = 'coiffe_slime'; break;
            case 'Bottes de Slime': equipId = 'bottes_slime'; break;
            case 'Ceinture de Slime': equipId = 'ceinture_slime'; break;
            case 'Collier de Slime': equipId = 'collier_slime'; break;
            case 'Anneau de Slime': equipId = 'anneau_slime'; break;
            default: equipId = ''; break;
          }
          if (equipId) {
            if (typeof addItemToInventory === 'function') {
              const result = addItemToInventory(equipId, 'equipement');
              if (result === false) {
                alert("Inventaire plein, impossible d'ajouter l'équipement !");
                return;
              }
            }
          }
          // Vider les slots de craft
          for (let i = 0; i < craftGrid.children.length; i++) {
            let slot = craftGrid.children[i];
            slot.innerHTML = `<div class='${cssPrefix}empty-indicator'>+</div>`;
          }
          // Mettre à jour l'inventaire
          if (typeof updateAllGrids === 'function') updateAllGrids();
          if (typeof updateCraftInventoryGrid === 'function') updateCraftInventoryGrid();
          if (typeof window.enableInventoryDragAndDrop === 'function') window.enableInventoryDragAndDrop();
          // Afficher la fiche de l'item créé
          if (equipId && window.equipmentDatabase && window.equipmentDatabase[equipId]) {
            const item = window.equipmentDatabase[equipId];
            craftPreviewDiv.innerHTML = `
              <div class='item-preview'>
                <div class='item-preview-card'>
                  <img src='${item.icon}' alt='${item.name}' class='item-preview-icon'>
                  <div class='item-preview-infos'>
                    <div class='item-preview-title'>${item.name}</div>
                    <div class='item-preview-stats'>
                      ${Object.entries(item.stats||{}).map(([k,v])=>`<span class='item-preview-stat'><span class='item-preview-stat-icon'>${window.getStatIcon(k)}</span> <span class='item-preview-stat-name'>${k}</span> : <b class='item-preview-stat-value'>${v}</b></span>`).join('')}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }
        };
      }
    }, 0);


  }
}

// Table du tailleur
window.openTailorWorkshopModal = function() {
  openWorkshopModal({
    idPrefix: 'tailor',
    titleText: 'Etablie du tailleur',
    recipes: [
      {
        name: 'Corbacape',
        icon: 'assets/equipements/capes/capecorbeau.png',
        type: 'cape',
        levelRequired: 3,
        ingredients: [
          { name: 'Plume de Corbeau', icon: 'assets/objets/plumedecorbeau.png', quantity: 5 },
          { name: 'Patte de Corbeau', icon: 'assets/objets/pattedecorbeau.png', quantity: 2 }
        ]
      },
      {
        name: 'Corbacoiffe',
        icon: 'assets/equipements/coiffes/coiffecorbeau.png',
        type: 'coiffe',
        levelRequired: 3,
        ingredients: [
          { name: 'Plume de Corbeau', icon: 'assets/objets/plumedecorbeau.png', quantity: 3 }
        ]
      },
      {
        name: 'Cape de Slime',
        icon: 'assets/equipements/capes/capeslime.png',
        type: 'cape',
        levelRequired: 10,
        ingredients: [
          { name: 'Gelée de Slime', icon: 'assets/objets/geleeslime.png', quantity: 3 },
          { name: 'Mucus de Slime', icon: 'assets/objets/mucusslime.png', quantity: 2 }
        ]
      },
      {
        name: 'Coiffe de Slime',
        icon: 'assets/equipements/coiffes/coiffeslime.png',
        type: 'coiffe',
        levelRequired: 10,
        ingredients: [
          { name: 'Gelée de Slime', icon: 'assets/objets/geleeslime.png', quantity: 2 },
          { name: 'Noyau de Slime', icon: 'assets/objets/noyauslime.png', quantity: 1 }
        ]
      }
    ],
    cssPrefix: 'tailor-'
  });
};

// Table du cordonnier
window.openCordonnierWorkshopModal = function() {
  openWorkshopModal({
    idPrefix: 'cordonnier',
    titleText: 'Établie du cordonnier',
    recipes: [
      {
        name: 'Corbobotte',
        icon: 'assets/equipements/bottes/bottecorbeau.png',
        type: 'bottes',
        levelRequired: 3,
        ingredients: [
          { name: 'Plume de Corbeau', icon: 'assets/objets/plumedecorbeau.png', quantity: 2 },
          { name: 'Patte de Corbeau', icon: 'assets/objets/pattedecorbeau.png', quantity: 2 }
        ]
      },
      {
        name: 'Corbature',
        icon: 'assets/equipements/ceintures/ceinturecorbeau.png',
        type: 'ceinture',
        levelRequired: 3,
        ingredients: [
          { name: 'Plume de Corbeau', icon: 'assets/objets/plumedecorbeau.png', quantity: 1 },
          { name: 'Patte de Corbeau', icon: 'assets/objets/pattedecorbeau.png', quantity: 3 }
        ]
      },
      {
        name: 'Bottes de Slime',
        icon: 'assets/equipements/bottes/botteslime.png',
        type: 'bottes',
        levelRequired: 10,
        ingredients: [
          { name: 'Gelée de Slime', icon: 'assets/objets/geleeslime.png', quantity: 4 },
          { name: 'Mucus de Slime', icon: 'assets/objets/mucusslime.png', quantity: 2 }
        ]
      },
      {
        name: 'Ceinture de Slime',
        icon: 'assets/equipements/ceintures/ceintureslime.png',
        type: 'ceinture',
        levelRequired: 10,
        ingredients: [
          { name: 'Gelée de Slime', icon: 'assets/objets/geleeslime.png', quantity: 2 },
          { name: 'Noyau de Slime', icon: 'assets/objets/noyauslime.png', quantity: 1 }
        ]
      }
    ],
    cssPrefix: 'cordonnier-'
  });
};

// Table du bijoutier
window.openBijoutierWorkshopModal = function() {
  openWorkshopModal({
    idPrefix: 'bijoutier',
    titleText: "Établie du bijoutier",
    recipes: [
      {
        name: 'Corbolier',
        icon: 'assets/equipements/colliers/colliercorbeau.png',
        type: 'amulette',
        levelRequired: 3,
        ingredients: [
          { name: 'Plume de Corbeau', icon: 'assets/objets/plumedecorbeau.png', quantity: 2 },
          { name: 'Patte de Corbeau', icon: 'assets/objets/pattedecorbeau.png', quantity: 1 }
        ]
      },
      {
        name: 'Corbaneau',
        icon: 'assets/equipements/anneaux/anneaucorbeau.png',
        type: 'anneau',
        levelRequired: 3,
        ingredients: [
          { name: 'Plume de Corbeau', icon: 'assets/objets/plumedecorbeau.png', quantity: 1 },
          { name: 'Patte de Corbeau', icon: 'assets/objets/pattedecorbeau.png', quantity: 2 }
        ]
      },
      {
        name: 'Collier de Slime',
        icon: 'assets/equipements/colliers/collierslime.png',
        type: 'amulette',
        levelRequired: 10,
        ingredients: [
          { name: 'Gelée de Slime', icon: 'assets/objets/geleeslime.png', quantity: 3 },
          { name: 'Mucus de Slime', icon: 'assets/objets/mucusslime.png', quantity: 1 }
        ]
      },
      {
        name: 'Anneau de Slime',
        icon: 'assets/equipements/anneaux/anneauslime.png',
        type: 'anneau',
        levelRequired: 10,
        ingredients: [
          { name: 'Gelée de Slime', icon: 'assets/objets/geleeslime.png', quantity: 2 },
          { name: 'Noyau de Slime', icon: 'assets/objets/noyauslime.png', quantity: 1 }
        ]
      }
    ],
    cssPrefix: 'bijoutier-'
  });
}; 
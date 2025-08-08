// js/metier/etabliealchimiste.js

// Utilitaire pour icônes de stats
window.getStatIcon = function(stat) {
  switch(stat) {
    case 'force': return '💪';
    case 'agilite': return '⚡';
    case 'vie': return '❤️';
    case 'chance': return '🍀';
    case 'intelligence': return '🧠';
    case 'defense': return '🛡️';
    case 'vitesse': return '🏃';
    default: return '🔸';
  }
};

// Drag & drop pour l'alchimiste
window.enableAlchimisteDragAndDrop = function() {
  setTimeout(() => {
    document.querySelectorAll('#alchimiste-inventory-grid .alchimiste-inventory-slot').forEach(slot => {
      const img = slot.querySelector('img');
      if (img) {
        // Permettre le drag & drop pour les potions et ressources
        if (img.src.includes('assets/objets/') || img.src.includes('potion_')) {
          slot.setAttribute('draggable', 'true');
          slot.ondragstart = (e) => {
            const itemName = img.getAttribute('alt');
            e.dataTransfer.setData('text/plain', itemName);
            e.dataTransfer.setData('dragged-icon', img.src);
          };
          slot.onclick = () => {
            // Pour l'instant, on ne fait rien au clic (système de fusion à implémenter plus tard)
            console.log('Clic sur item alchimiste:', img.src);
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

// Fonction pour ouvrir la modale du chaudron d'alchimiste
function openAlchimisteWorkshopModal() {
  // Supprimer la fenêtre existante si elle existe
  const existingModal = document.getElementById('alchimiste-workshop-modal');
  if (existingModal) existingModal.remove();
  
  // Créer la fenêtre modale
  const modal = document.createElement('div');
  modal.id = 'alchimiste-workshop-modal';
  modal.className = 'alchimiste-modal-overlay';
  
  // Contenu
  const modalContent = document.createElement('div');
  modalContent.className = 'alchimiste-modal-content';
  
  // Titre
  const title = document.createElement('h2');
  title.textContent = "Chaudron d'alchimiste";
  title.className = 'alchimiste-title';
  
  // Bouton fermeture
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.className = 'alchimiste-close-btn';
  closeButton.onclick = () => modal.remove();
  modalContent.appendChild(closeButton);
  
  // Conteneur inventaire
  const inventoryContainer = document.createElement('div');
  inventoryContainer.className = 'alchimiste-inventory-container';
  
  // Conteneur craft
  const craftContainer = document.createElement('div');
  craftContainer.className = 'alchimiste-craft-container';
  
  // Header onglets
  const craftHeader = document.createElement('div');
  craftHeader.className = 'alchimiste-craft-header';
  const craftTab = document.createElement('button');
  craftTab.textContent = 'Craft';
  craftTab.className = 'alchimiste-craft-tab';
  const fusionTab = document.createElement('button');
  fusionTab.textContent = 'Fusion';
  fusionTab.className = 'alchimiste-fusion-tab';
  const craftTitle = document.createElement('h3');
  // Titre dynamique pour l'alchimiste
  const niveau = window.metiers?.alchimiste?.niveau || 1;
  craftTitle.textContent = `Craft - Niveau ${niveau}`;
  craftTitle.className = 'alchimiste-craft-title';
  craftHeader.appendChild(craftTab);
  craftHeader.appendChild(craftTitle);
  craftHeader.appendChild(fusionTab);
  craftContainer.appendChild(craftHeader);
  
  // Vues craft/fusion
  const craftViews = document.createElement('div');
  craftViews.className = 'alchimiste-craft-views';
  craftContainer.appendChild(craftViews);
  
  // Vue Craft (slots selon niveau de métier)
  const craftGrid = document.createElement('div');
  craftGrid.className = 'alchimiste-craft-grid';
  let craftSlotsCount = 2; // Par défaut 2 slots
  if (window.getMetierSlots && window.metiers && window.metiers.alchimiste) {
    craftSlotsCount = window.getMetierSlots('alchimiste');
  } else if (window.metiers && window.metiers.alchimiste) {
    // Fallback : calculer directement
    const niveau = window.metiers.alchimiste.niveau || 1;
    if (niveau >= 100) craftSlotsCount = 7;
    else if (niveau >= 80) craftSlotsCount = 6;
    else if (niveau >= 60) craftSlotsCount = 5;
    else if (niveau >= 40) craftSlotsCount = 4;
    else if (niveau >= 20) craftSlotsCount = 3;
    else craftSlotsCount = 2;
  }
  for (let i = 0; i < craftSlotsCount; i++) {
    const craftSlot = document.createElement('div');
    craftSlot.className = 'alchimiste-craft-slot';
    craftSlot.dataset.slot = i;
    const emptyIndicator = document.createElement('div');
    emptyIndicator.textContent = '+';
    emptyIndicator.className = 'alchimiste-empty-indicator';
    craftSlot.appendChild(emptyIndicator);
    craftGrid.appendChild(craftSlot);
  }
  
  // Vue Fusion (à implémenter plus tard)
  const fusionView = document.createElement('div');
  fusionView.className = 'alchimiste-fusion-view';
  const fusionSlotLeft = document.createElement('div');
  fusionSlotLeft.className = 'alchimiste-fusion-slot';
  const arrow = document.createElement('div');
  arrow.className = 'alchimiste-arrow';
  arrow.innerHTML = '➡️';
  const fusionSlotRight = document.createElement('div');
  fusionSlotRight.className = 'alchimiste-fusion-slot';
  fusionView.appendChild(fusionSlotLeft);
  fusionView.appendChild(arrow);
  fusionView.appendChild(fusionSlotRight);
  
  // Bouton de fusion (à implémenter plus tard)
  const fusionButton = document.createElement('button');
  fusionButton.textContent = 'FUSIONNER';
  fusionButton.className = 'alchimiste-fusion-btn';
  fusionButton.id = 'alchimiste-fusion-btn-debug';
  fusionView.appendChild(fusionButton);
  
  // Fiche d'aperçu pour la fusion
  let fusionPreviewDiv = document.createElement('div');
  fusionPreviewDiv.id = 'alchimiste-fusion-preview';
  fusionPreviewDiv.className = 'alchimiste-fusion-preview';
  fusionView.appendChild(fusionPreviewDiv);
  
  // Affichage par défaut : vue craft
  craftViews.appendChild(craftGrid);
  
  // Switch d'onglet
  craftTab.onclick = () => {
    craftTab.className = 'alchimiste-craft-tab';
    fusionTab.className = 'alchimiste-fusion-tab';
    craftViews.innerHTML = '';
    craftViews.appendChild(craftGrid);
    // Afficher le bouton CRAFTER dans l'onglet Craft
    if (craftButton) craftButton.style.display = 'block';
    
    // Afficher les recettes de craft (potions uniquement)
    afficherRecettesCraft();
  };
  
  fusionTab.onclick = () => {
    fusionTab.className = 'alchimiste-craft-tab';
    craftTab.className = 'alchimiste-fusion-tab';
    craftViews.innerHTML = '';
    craftViews.appendChild(fusionView);
    if (craftPreviewDiv) craftPreviewDiv.innerHTML = '';
    if (fusionPreviewDiv) fusionPreviewDiv.innerHTML = '';
    // Masquer le bouton CRAFTER dans l'onglet Fusion
    if (craftButton) craftButton.style.display = 'none';
    
    // Afficher les recettes de fusion
    afficherRecettesFusion();
    
    // Initialiser le bouton FUSIONNER
    setTimeout(() => {
      const fusionBtn = document.getElementById('alchimiste-fusion-btn-debug');
      if (fusionBtn) {
        fusionBtn.onclick = () => {
          if (selectedFusionRecipe && window.fusionAlchimiste) {
            if (window.fusionAlchimiste.executerFusion(selectedFusionRecipe)) {
              // Fusion réussie, mettre à jour l'affichage
              updateCraftInventoryGrid();
              afficherRecettesFusion();
            } else {
              alert("Impossible de fusionner cette recette !");
            }
          } else {
            alert("Sélectionnez d'abord une recette de fusion !");
          }
        };
      }
    }, 100);
  };
  
  // Bouton de craft
  const craftButton = document.createElement('button');
  craftButton.textContent = 'CRAFTER';
  craftButton.className = 'alchimiste-craft-btn';
  craftButton.id = 'alchimiste-craft-btn-debug';
  craftContainer.appendChild(craftButton);
  
  // Barre des catégories
  const categoriesBar = document.createElement('div');
  categoriesBar.className = 'alchimiste-categories-bar';
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
    if (category.icon.endsWith('.png')) {
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
      updateCraftInventoryGrid();
    };
    categoriesBar.appendChild(tab);
  });
  
  // Grille d'inventaire
  const inventoryGrid = document.createElement('div');
  inventoryGrid.id = 'alchimiste-inventory-grid';
  inventoryGrid.className = 'alchimiste-inventory-grid';
  
  function getInventoryByCategory(category) {
    switch(category) {
      case 'equipement': return window.inventoryEquipement || [];
      case 'potions': return window.inventoryPotions || [];
      case 'ressources': 
        // Combiner ressources normales et ressources alchimiste
        const ressourcesCombinees = Array.from({ length: 80 }, () => ({ item: null, category: 'ressources' }));
        let index = 0;
        
        // Ajouter les ressources normales
        if (window.inventoryRessources) {
          window.inventoryRessources.forEach(slot => {
            if (slot && slot.item && index < 80) {
              ressourcesCombinees[index] = slot;
              index++;
            }
          });
        }
        
        // Ajouter les ressources alchimiste
        if (window.inventoryRessourcesAlchimiste) {
          window.inventoryRessourcesAlchimiste.forEach(slot => {
            if (slot && slot.item && index < 80) {
              ressourcesCombinees[index] = slot;
              index++;
            }
          });
        }
        
        return ressourcesCombinees;
      case 'all':
      default: 
        // Pour l'onglet "Tout", créer un tableau de 80 slots
        const allItems = Array.from({ length: 80 }, () => ({ item: null, category: null }));
        let itemIndex = 0;
        const inventories = [
          window.inventoryEquipement || [],
          window.inventoryPotions || [],
          window.inventoryRessources || [],
          window.inventoryRessourcesAlchimiste || []
        ];
        
        inventories.forEach(inventory => {
          inventory.forEach(slot => {
            if (slot && slot.item && itemIndex < 80) {
              allItems[itemIndex] = slot;
              itemIndex++;
            }
          });
        });
        
        return allItems;
    }
  }
  
  function handleDoubleClickOnItem(slotData, slotIndex) {
    if (!slotData || !slotData.item) return;
    
    const item = slotData.item;
    console.log('🖱️ Double-clic sur item dans atelier:', item.name, 'Type:', item.type, 'Category:', item.category);
    
    // Vérifier si c'est une potion
    const isPotion = (
      item.type === 'potion' || 
      item.type === 'consommable' || 
      item.category === 'potion' ||
      (item.id && item.id.includes('potion'))
    );
    
    if (isPotion) {
      console.log('🧪 Utilisation de potion depuis atelier');
      
      // Déterminer l'ID de la potion
      let potionId = item.id || 'potion_soin_basique';
      
      // Utiliser la potion
      if (window.potionSystem && window.potionSystem.usePotion) {
        window.potionSystem.usePotion(potionId);
      } else if (window.useHealingPotion) {
        window.useHealingPotion();
      }
      
      // Retirer la potion de l'inventaire
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        // Supprimer l'item de l'inventaire correspondant
        const targetInventory = getInventoryByCategory(currentCategory);
        if (targetInventory[slotIndex]) {
          targetInventory[slotIndex].item = null;
        }
      }
      
      // Mettre à jour l'affichage
      updateCraftInventoryGrid();
      if (window.updateAllGrids) {
        window.updateAllGrids();
      }
      
    } else {
      // Pour les autres items, essayer de les équiper
      console.log('⚔️ Tentative d\'équipement depuis atelier');
      if (window.handleItemClick) {
        window.handleItemClick(item, slotIndex);
      }
    }
  }

  function updateCraftInventoryGrid() {
    const targetInventory = getInventoryByCategory(currentCategory);
    inventoryGrid.innerHTML = '';
    
    // Afficher toujours 80 slots pour tous les onglets
    for (let i = 0; i < 80; i++) {
      const slot = document.createElement('div');
      slot.className = 'alchimiste-inventory-slot';
      slot.classList.add('alchimiste-inventory-slot');
      
      const slotData = targetInventory[i];
      if (slotData && slotData.item) {
        if (slotData.item.icon && slotData.item.icon.startsWith('assets/')) {
          let itemContent = `<img src="${slotData.item.icon}" alt="${slotData.item.name}" class="alchimiste-item-icon" title="${slotData.item.name}">`;
          if (slotData.item.stackable && slotData.item.quantity > 1) {
            itemContent += `<div class="alchimiste-item-quantity">${slotData.item.quantity}</div>`;
          }
          slot.innerHTML = itemContent;
        } else {
          let itemContent = `<span style="font-size:1.6em" title="${slotData.item.name}">${slotData.item.icon}</span>`;
          if (slotData.item.stackable && slotData.item.quantity > 1) {
            itemContent += `<div class="alchimiste-item-quantity">${slotData.item.quantity}</div>`;
          }
          slot.innerHTML = itemContent;
        }
        
        // Ajouter les interactions comme dans l'inventaire normal
        slot.addEventListener('mouseenter', function() {
          slot.classList.add('hover');
          // Afficher tooltip
          if (window.showEquipmentTooltip) {
            window.showEquipmentTooltip(slotData.item, slot);
          }
        });
        
        slot.addEventListener('mouseleave', function() {
          slot.classList.remove('hover');
          // Masquer tooltip
          if (window.hideEquipmentTooltip) {
            window.hideEquipmentTooltip();
          }
        });
        
        // Gestion des clics comme dans l'inventaire normal
        let clickTimeout = null;
        slot.addEventListener('click', function(e) {
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
            // Double-clic : utiliser/équiper l'item
            handleDoubleClickOnItem(slotData, i);
          } else {
            // Clic simple : afficher les détails (avec délai pour détecter double-clic)
            clickTimeout = setTimeout(() => {
              if (window.showEquipmentDetailModal) {
                window.showEquipmentDetailModal(slotData.item, i, 'ressources_alchimiste');
              }
              clickTimeout = null;
            }, 200);
          }
        });
        
      } else {
        slot.onmouseenter = () => slot.classList.add('hover');
        slot.onmouseleave = () => slot.classList.remove('hover');
      }
      inventoryGrid.appendChild(slot);
    }
  }
  
  // Liste des recettes à gauche
  const recipesBox = document.createElement('div');
  recipesBox.className = 'alchimiste-recipes-box';
  const recipesTitle = document.createElement('div');
  recipesTitle.className = 'alchimiste-recipes-title';
  recipesTitle.textContent = 'Recettes disponibles';
  recipesBox.appendChild(recipesTitle);
  
  // Recettes d'alchimiste
  const recipes = [
    {
      id: 'potion_soin_basique',
      name: 'Potion de Soin Basique',
      icon: 'assets/objets/potiondesoinbasique.png',
      type: 'potion',
      levelRequired: 1,
      xpGained: 10,
      ingredients: [
        { name: 'Pissenlit', icon: 'assets/objets/ressources_alchimiste/pissenlit.png', quantity: 3 }
      ]
    },
    {
      name: 'Potion de Force',
      icon: 'assets/objets/potion_force.png',
      type: 'potion',
      levelRequired: 3,
      xpGained: 15,
      ingredients: [
        { name: 'Pissenlit', icon: 'assets/objets/ressources_alchimiste/pissenlit.png', quantity: 5 },
        { name: 'Gelée de Slime', icon: 'assets/objets/geleeslime.png', quantity: 2 }
      ]
    },
    {
      name: 'Potion de Vitesse',
      icon: 'assets/objets/potion_vitesse.png',
      type: 'potion',
      levelRequired: 5,
      xpGained: 20,
      ingredients: [
        { name: 'Pissenlit', icon: 'assets/objets/ressources_alchimiste/pissenlit.png', quantity: 4 },
        { name: 'Mucus de Slime', icon: 'assets/objets/mucusslime.png', quantity: 1 }
      ]
    },
    {
      name: 'Potion de Régénération',
      icon: 'assets/objets/potion_regeneration.png',
      type: 'potion',
      levelRequired: 8,
      xpGained: 25,
      ingredients: [
        { name: 'Pissenlit', icon: 'assets/objets/ressources_alchimiste/pissenlit.png', quantity: 6 },
        { name: 'Noyau de Slime', icon: 'assets/objets/noyauslime.png', quantity: 1 }
      ]
    }
  ];
  
  // Fonction pour afficher les recettes de craft (potions uniquement)
  function afficherRecettesCraft() {
    recipesBox.innerHTML = '';
    const recipesTitle = document.createElement('div');
    recipesTitle.className = 'alchimiste-recipes-title';
    recipesTitle.textContent = 'Recettes disponibles';
    recipesBox.appendChild(recipesTitle);

    // Afficher uniquement les recettes de potions (pas de fusion)
    recipes.forEach(recipe => {
      const recipeBox = document.createElement('div');
      recipeBox.className = 'alchimiste-recipe-box';
      const row = document.createElement('div');
      row.className = 'alchimiste-recipe-row';
      const icon = document.createElement('img');
      icon.src = recipe.icon;
      icon.alt = recipe.name;
      icon.className = 'alchimiste-recipe-icon';
      const name = document.createElement('span');
      name.textContent = recipe.name;
      name.className = 'alchimiste-recipe-name';
      row.appendChild(icon);
      row.appendChild(name);
      recipeBox.appendChild(row);
      
      // Ingrédients
      const ingredientsRow = document.createElement('div');
      ingredientsRow.className = 'alchimiste-ingredients-row';
      recipe.ingredients.forEach(ing => {
        const ingDiv = document.createElement('div');
        ingDiv.className = 'alchimiste-ingredient';
        const ingIcon = document.createElement('img');
        ingIcon.src = ing.icon;
        ingIcon.alt = ing.name;
        ingIcon.className = 'alchimiste-ingredient-icon';
        const ingQty = document.createElement('span');
        ingQty.textContent = `x${ing.quantity}`;
        ingQty.className = 'alchimiste-ingredient-qty';
        ingDiv.appendChild(ingIcon);
        ingDiv.appendChild(ingQty);
        ingredientsRow.appendChild(ingDiv);
      });
      recipeBox.appendChild(ingredientsRow);
      
      // XP gagné
      if (recipe.xpGained) {
        const xpRow = document.createElement('div');
        xpRow.className = 'alchimiste-xp-row';
        const xpText = document.createElement('span');
        xpText.textContent = `+${recipe.xpGained} XP`;
        xpText.className = 'alchimiste-xp-text';
        xpRow.appendChild(xpText);
        recipeBox.appendChild(xpRow);
      }
      
      recipesBox.appendChild(recipeBox);
      
      // Clic sur recette : remplir slots de craft
      recipeBox.onclick = () => {
        // Vérifier si on peut craft cette recette
        if (recipe.id && window.craftAlchimiste) {
          if (!window.craftAlchimiste.peutCraft(recipe.id)) {
            alert("Tu n'as pas assez de ressources pour ce craft !");
            return;
          }
          
          // Remplir les slots de craft avec les ingrédients
          for (let i = 0; i < craftGrid.children.length; i++) {
            let slot = craftGrid.children[i];
            slot.innerHTML = `<div class='alchimiste-empty-indicator'>+</div>`;
          }
          let slotIndex = 0;
          recipe.ingredients.forEach(ing => {
            if (slotIndex < craftGrid.children.length) {
              let slot = craftGrid.children[slotIndex];
              slot.innerHTML = '';
              let ingIcon = document.createElement('img');
              ingIcon.src = ing.icon;
              ingIcon.alt = ing.name;
              ingIcon.className = 'alchimiste-ingredient-icon';
              slot.appendChild(ingIcon);
              let qtySpan = document.createElement('span');
              qtySpan.textContent = 'x' + ing.quantity;
              qtySpan.className = 'alchimiste-ingredient-qty';
              slot.appendChild(qtySpan);
              slotIndex++;
            }
          });
          
          // Stocker l'ID de la recette sélectionnée
          recipeBox.dataset.recipeId = recipe.id;
        }
      };
    });
  }

  // Afficher les recettes de craft par défaut
  afficherRecettesCraft();
  
  // Code commenté - remplacé par la fonction afficherRecettesCraft()
  /*recipes.forEach(recipe => {
    const recipeBox = document.createElement('div');
    recipeBox.className = 'alchimiste-recipe-box';
    const row = document.createElement('div');
    row.className = 'alchimiste-recipe-row';
    const icon = document.createElement('img');
    icon.src = recipe.icon;
    icon.alt = recipe.name;
    icon.className = 'alchimiste-recipe-icon';
    const name = document.createElement('span');
    name.textContent = recipe.name;
    name.className = 'alchimiste-recipe-name';
    row.appendChild(icon);
    row.appendChild(name);
    recipeBox.appendChild(row);
    
    // Ingrédients
    const ingredientsRow = document.createElement('div');
    ingredientsRow.className = 'alchimiste-ingredients-row';
    recipe.ingredients.forEach(ing => {
      const ingDiv = document.createElement('div');
      ingDiv.className = 'alchimiste-ingredient';
      const ingIcon = document.createElement('img');
      ingIcon.src = ing.icon;
      ingIcon.alt = ing.name;
      ingIcon.className = 'alchimiste-ingredient-icon';
      const ingQty = document.createElement('span');
      ingQty.textContent = `x${ing.quantity}`;
      ingQty.className = 'alchimiste-ingredient-qty';
      ingDiv.appendChild(ingIcon);
      ingDiv.appendChild(ingQty);
      ingredientsRow.appendChild(ingDiv);
    });
    recipeBox.appendChild(ingredientsRow);
    
    // XP gagné
    if (recipe.xpGained) {
      const xpRow = document.createElement('div');
      xpRow.className = 'alchimiste-xp-row';
      const xpText = document.createElement('span');
      xpText.textContent = `+${recipe.xpGained} XP`;
      xpText.className = 'alchimiste-xp-text';
      xpRow.appendChild(xpText);
      recipeBox.appendChild(xpRow);
    }
    
    recipesBox.appendChild(recipeBox);
    
    // Clic sur recette : remplir slots de craft
    recipeBox.onclick = () => {
      // Vérifier si on peut craft cette recette
      if (recipe.id && window.craftAlchimiste) {
        if (!window.craftAlchimiste.peutCraft(recipe.id)) {
          alert("Tu n'as pas assez de ressources pour ce craft !");
          return;
        }
        
        // Remplir les slots de craft avec les ingrédients
        for (let i = 0; i < craftGrid.children.length; i++) {
          let slot = craftGrid.children[i];
          slot.innerHTML = `<div class='alchimiste-empty-indicator'>+</div>`;
        }
        let slotIndex = 0;
        recipe.ingredients.forEach(ing => {
          if (slotIndex < craftGrid.children.length) {
            let slot = craftGrid.children[slotIndex];
            slot.innerHTML = '';
            let ingIcon = document.createElement('img');
            ingIcon.src = ing.icon;
            ingIcon.alt = ing.name;
            ingIcon.className = 'alchimiste-ingredient-icon';
            slot.appendChild(ingIcon);
            let qtySpan = document.createElement('span');
            qtySpan.textContent = 'x' + ing.quantity;
            qtySpan.className = 'alchimiste-ingredient-qty';
            slot.appendChild(qtySpan);
            slotIndex++;
          }
        });
        
        // Stocker l'ID de la recette sélectionnée
        recipeBox.dataset.recipeId = recipe.id;
      } else {
        // Ancienne logique pour les recettes sans ID
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
          slot.innerHTML = `<div class='alchimiste-empty-indicator'>+</div>`;
        }
        let slotIndex = 0;
        recipe.ingredients.forEach(ing => {
          if (slotIndex < craftGrid.children.length) {
            let slot = craftGrid.children[slotIndex];
            slot.innerHTML = '';
            let ingIcon = document.createElement('img');
            ingIcon.src = ing.icon;
            ingIcon.alt = ing.name;
            ingIcon.className = 'alchimiste-ingredient-icon';
            slot.appendChild(ingIcon);
            let qtySpan = document.createElement('span');
            qtySpan.textContent = 'x' + ing.quantity;
            qtySpan.className = 'alchimiste-ingredient-qty';
            slot.appendChild(qtySpan);
            slotIndex++;
          }
        });
      }
    };
  });*/
  
  // Fiche d'aperçu
  let craftPreviewDiv = document.createElement('div');
  craftPreviewDiv.id = 'alchimiste-craft-preview';
  craftPreviewDiv.className = 'alchimiste-craft-preview';
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
  if (typeof window.enableAlchimisteDragAndDrop === 'function') window.enableAlchimisteDragAndDrop();
  
  // Fonction pour mettre à jour l'inventaire du chaudron
  window.updateAlchimisteInventory = function() {
    if (typeof updateCraftInventoryGrid === 'function') {
      updateCraftInventoryGrid();
    }
  };
  
  // Rendre la fonction accessible globalement
  if (typeof window.updateAlchimisteInventory === 'function') {
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
      const btn = document.getElementById('alchimiste-craft-btn-debug');
      if (btn) {
        btn.onclick = () => {
          // Normaliser un identifiant de potion craftée pour l'aperçu
          let potionId = '';
          // Trouver la recette sélectionnée
          let selectedRecipe = null;
          for (let recipeBox of recipesBox.querySelectorAll('.alchimiste-recipe-box')) {
            if (recipeBox.dataset.recipeId) {
              selectedRecipe = recipeBox.dataset.recipeId;
              break;
            }
          }
          
          if (selectedRecipe && window.craftAlchimiste) {
            // Utiliser le système de craft alchimiste
            if (window.craftAlchimiste.executerCraft(selectedRecipe)) {
              // Si la recette a un ID (ex: potion_soin_basique), l'utiliser pour la prévisualisation
              potionId = selectedRecipe;
              // Mettre à jour l'affichage de l'inventaire
              if (window.updateAlchimisteInventory) {
                window.updateAlchimisteInventory();
              }
              // Vider les slots de craft
              for (let i = 0; i < craftGrid.children.length; i++) {
                let slot = craftGrid.children[i];
                slot.innerHTML = `<div class='alchimiste-empty-indicator'>+</div>`;
              }
              // Retirer la sélection de recette
              for (let recipeBox of recipesBox.querySelectorAll('.alchimiste-recipe-box')) {
                delete recipeBox.dataset.recipeId;
              }
            }
          } else {
            // Ancienne logique pour les recettes sans ID
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
              return false;
            }
            
            // Retirer les ressources de l'inventaire
            recipe.ingredients.forEach(ing => {
              let qtyToRemove = ing.quantity;
              for (let slot of window.inventoryAll) {
                if (slot.item && (slot.item.icon.endsWith(ing.icon) || ing.icon.endsWith(slot.item.icon)) && qtyToRemove > 0) {
                  let removeQty = Math.min(qtyToRemove, slot.item.quantity || 1);
                  if (slot.item.type === 'ressource' || slot.item.id === 'pissenlit') {
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
            
            // Ajouter la potion à l'inventaire
            switch (recipe.name) {
              case 'Potion de Soin Basique': potionId = 'potion_soin_basique'; break;
              case 'Potion de Force': potionId = 'potion_force'; break;
              case 'Potion de Vitesse': potionId = 'potion_vitesse'; break;
              case 'Potion de Régénération': potionId = 'potion_regeneration'; break;
              default: potionId = ''; break;
            }
            
            if (potionId) {
              if (typeof addItemToInventory === 'function') {
                const result = addItemToInventory(potionId, 'potions');
                if (result === false) {
                  alert("Inventaire plein, impossible d'ajouter la potion !");
                  return;
                }
              }
            }
          }
          
          // Vider les slots de craft
          for (let i = 0; i < craftGrid.children.length; i++) {
            let slot = craftGrid.children[i];
            slot.innerHTML = `<div class='alchimiste-empty-indicator'>+</div>`;
          }
          
          // Mettre à jour l'inventaire
          if (typeof updateAllGrids === 'function') updateAllGrids();
          if (typeof updateCraftInventoryGrid === 'function') updateCraftInventoryGrid();
          if (typeof window.enableAlchimisteDragAndDrop === 'function') window.enableAlchimisteDragAndDrop();
          
          // Afficher la fiche de la potion créée (si identifiable)
          if (potionId && ((window.equipmentDatabase && window.equipmentDatabase[potionId]) || (window.resourceDatabase && window.resourceDatabase[potionId]))) {
            const item = (window.equipmentDatabase && window.equipmentDatabase[potionId]) ? window.equipmentDatabase[potionId] : window.resourceDatabase[potionId];
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

  // Variable pour stocker la recette de fusion sélectionnée
  let selectedFusionRecipe = null;
  // Fonction pour afficher les recettes de fusion
  function afficherRecettesFusion() {
    if (!window.fusionAlchimiste) return;
    
    recipesBox.innerHTML = '';
    const recipesTitle = document.createElement('div');
    recipesTitle.className = 'alchimiste-recipes-title';
    recipesTitle.textContent = 'Recettes de Fusion';
    recipesBox.appendChild(recipesTitle);

    const recettesFusion = window.fusionAlchimiste.getRecettesFusion();
    
    Object.keys(recettesFusion).forEach(recetteId => {
      const recette = recettesFusion[recetteId];
      
      const recipeBox = document.createElement('div');
      recipeBox.className = 'alchimiste-recipe-box';
      const row = document.createElement('div');
      row.className = 'alchimiste-recipe-row';
      const icon = document.createElement('img');
      icon.src = recette.icon;
      icon.alt = recette.nom;
      icon.className = 'alchimiste-recipe-icon';
      const name = document.createElement('span');
      name.textContent = recette.nom;
      name.className = 'alchimiste-recipe-name';
      row.appendChild(icon);
      row.appendChild(name);
      recipeBox.appendChild(row);
      
      // Ingrédients
      const ingredientsRow = document.createElement('div');
      ingredientsRow.className = 'alchimiste-ingredients-row';
      recette.ingredients.forEach(ing => {
        const ingDiv = document.createElement('div');
        ingDiv.className = 'alchimiste-ingredient';
        const ingIcon = document.createElement('img');
        ingIcon.src = ing.icon;
        ingIcon.alt = ing.nom;
        ingIcon.className = 'alchimiste-ingredient-icon';
        const ingQty = document.createElement('span');
        ingQty.textContent = `x${ing.quantite}`;
        ingQty.className = 'alchimiste-ingredient-qty';
        ingDiv.appendChild(ingIcon);
        ingDiv.appendChild(ingQty);
        ingredientsRow.appendChild(ingDiv);
      });
      recipeBox.appendChild(ingredientsRow);
      
      // XP gagné
      if (recette.xpGagne) {
        const xpRow = document.createElement('div');
        xpRow.className = 'alchimiste-xp-row';
        const xpText = document.createElement('span');
        xpText.textContent = `+${recette.xpGagne} XP`;
        xpText.className = 'alchimiste-xp-text';
        xpRow.appendChild(xpText);
        recipeBox.appendChild(xpRow);
      }
      
      recipesBox.appendChild(recipeBox);
      
      // Clic sur recette de fusion
      recipeBox.onclick = () => {
        // Vérifier si on peut fusionner cette recette
        if (window.fusionAlchimiste.peutFusionner(recetteId)) {
          selectedFusionRecipe = recetteId;
          
          // Mettre en surbrillance la recette sélectionnée
          recipesBox.querySelectorAll('.alchimiste-recipe-box').forEach(box => {
            box.classList.remove('selected');
          });
          recipeBox.classList.add('selected');
          
          // Afficher la prévisualisation
          afficherPreviewFusion(recette);
        } else {
          alert("Tu n'as pas assez de ressources pour cette fusion !");
        }
      };
    });
  }

  // Fonction pour afficher la prévisualisation de fusion
  function afficherPreviewFusion(recette) {
    if (fusionPreviewDiv) {
      fusionPreviewDiv.innerHTML = `
        <div class="item-preview">
          <div class="item-preview-card">
            <img src="${recette.icon}" alt="${recette.nom}" class="item-preview-icon">
            <div class="item-preview-infos">
              <div class="item-preview-title">${recette.nom}</div>
              <div class="item-preview-stats">
                <div class="item-preview-stat">
                  <span class="item-preview-stat-name">XP gagné :</span>
                  <span class="item-preview-stat-value">+${recette.xpGagne}</span>
                </div>
              </div>
              <div class="item-preview-rarity" style="color: #FFD700; font-weight: bold;">Fusion Rare</div>
            </div>
          </div>
        </div>
      `;
    }
  }
}

// Fonction globale pour ouvrir le chaudron d'alchimiste
window.openAlchimisteWorkshopModal = openAlchimisteWorkshopModal; 
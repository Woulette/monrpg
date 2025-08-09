// Fonction pour créer les grilles séparées
function createSeparateGrids() {
    const container = document.getElementById("inventory-grid-container");
    const oldGrid = document.getElementById("inventory-grid");
    
    // Supprimer l'ancienne grille
    if (oldGrid) {
        oldGrid.remove();
    }
    
    // Créer les grilles séparées
    const categories = ['all', 'equipement', 'potions', 'ressources'];
    
    categories.forEach(category => {
        const grid = document.createElement('div');
        grid.id = `inventory-grid-${category}`;
        grid.className = 'inventory-grid-category';
        grid.style.display = category === 'all' ? 'grid' : 'none';
        
        // Créer 80 slots pour chaque grille
        for (let i = 0; i < 80; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.index = i;
            slot.dataset.category = category;
            grid.appendChild(slot);
        }
        
        container.appendChild(grid);
    });
}

// Fonction pour basculer entre les grilles
function switchInventoryGrid(category) {
    // Masquer toutes les grilles
    document.querySelectorAll('.inventory-grid-category').forEach(grid => {
        grid.style.display = 'none';
    });
    
    // Afficher la grille correspondante
    const targetGrid = document.getElementById(`inventory-grid-${category}`);
    if (targetGrid) {
        targetGrid.style.display = 'grid';
        updateGridContent(category);
    }
}

// Fonction pour mettre à jour le contenu d'une grille
function updateGridContent(category) {
    const grid = document.getElementById(`inventory-grid-${category}`);
    if (!grid) return;
    
    // Choisir le bon inventaire en utilisant getInventoryByCategory
    const targetInventory = getInventoryByCategory(category);
    
    // Mettre à jour chaque slot
    const slots = grid.querySelectorAll('.inventory-slot');
    slots.forEach((slot, index) => {
        const slotData = targetInventory[index];
        slot.innerHTML = ""; // Vider le slot
        
        if (slotData && slotData.item) {
            if (slotData.item.icon && slotData.item.icon.startsWith('assets/')) {
                // Correction des anciens chemins pour les nouveaux sous-dossiers
                slotData.item.icon = slotData.item.icon
                    .replace('assets/capecorbeau.png', 'assets/equipements/capes/capecorbeau.png')
                    .replace('assets/bottecorbeau.png', 'assets/equipements/bottes/bottecorbeau.png')
                    .replace('assets/anneaucorbeau.png', 'assets/equipements/anneaux/anneaucorbeau.png')
                    .replace('assets/coiffecorbeau.png', 'assets/equipements/coiffes/coiffecorbeau.png')
                    .replace('assets/ceinturecorbeau.png', 'assets/equipements/ceintures/ceinturecorbeau.png')
                    .replace('assets/colliercorbeau.png', 'assets/equipements/colliers/colliercorbeau.png');
            }
            if (slotData.item.icon && slotData.item.icon.startsWith('assets/')) {
                let itemContent = `<img src="${slotData.item.icon}" alt="${slotData.item.name}" style="width:32px;height:32px;" title="${slotData.item.name}">`;
                if (slotData.item.stackable && slotData.item.quantity > 1) {
                    itemContent += `<div class="item-quantity">${slotData.item.quantity}</div>`;
                }
                slot.innerHTML = itemContent;
            } else {
                let itemContent = `<span style="font-size:1.6em" title="${slotData.item.name}">${slotData.item.icon}</span>`;
                if (slotData.item.stackable && slotData.item.quantity > 1) {
                    itemContent += `<div class="item-quantity">${slotData.item.quantity}</div>`;
                }
                slot.innerHTML = itemContent;
            }
        }
    });
    
    // Dédupliquer les événements au cas où ils auraient été attachés plusieurs fois
    dedupeGridSlots(grid);
    // Attacher les événements aux slots de cette grille (une seule fois)
    attachGridEvents(grid, category);
}
// Supprimer proprement les anciens écouteurs en clonant les slots
function dedupeGridSlots(grid) {
    const slots = grid.querySelectorAll('.inventory-slot');
    slots.forEach(slot => {
        if (slot) {
            const clone = slot.cloneNode(true);
            // Retirer le flag pour permettre un ré-attachement propre
            delete clone.dataset.listenersAttached;
            slot.parentNode.replaceChild(clone, slot);
        }
    });
}

// Fonction pour attacher les événements à une grille
function attachGridEvents(grid, category) {
    const slots = grid.querySelectorAll('.inventory-slot');
    
    slots.forEach(slot => {
        // Empêcher l'attachement multiple des mêmes événements (cause d'équipement en masse)
        if (slot.dataset.listenersAttached === 'true') {
            return;
        }
        slot.dataset.listenersAttached = 'true';

        // Drag & drop vers la poubelle
        slot.setAttribute('draggable', 'true');
        slot.addEventListener('dragstart', function(ev){
            const index = parseInt(this.dataset.index);
            const targetInventory = getInventoryByCategory(category);
            const slotData = targetInventory[index];
            ev.dataTransfer.setData('text/plain', JSON.stringify({ category, index }));
        });

        let clickTimeout = null;
        let isDoubleClick = false;
        
        // Clic simple pour ouvrir la fenêtre détaillée
        slot.addEventListener('click', function(e) {
            if (isDoubleClick) return;
            
            console.log('🖱️ Clic simple sur slot:', this.dataset.index);
            const index = parseInt(this.dataset.index);
            const targetInventory = getInventoryByCategory(category);
            const slotData = targetInventory[index];
            
            if (slotData && slotData.item) {
                console.log('🖱️ Objet trouvé:', slotData.item.name);
                
                // Nettoyer les timeouts existants avant d'en créer un nouveau
                if (clickTimeout) {
                    clearTimeout(clickTimeout);
                }
                
                clickTimeout = setTimeout(() => {
                    if (!isDoubleClick) {
                        console.log('🖱️ Détails inline pour:', slotData.item.name);
                        showEquipmentDetailModal(slotData.item, index, category);
                    }
                }, 200);
            } else {
                console.log('🖱️ Aucun objet dans ce slot');
            }
        });
        
        // Double-clic pour utiliser/équiper
        slot.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            isDoubleClick = true;
            
            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
            }
            
            console.log('🖱️ Double-clic sur slot:', this.dataset.index);
            const index = parseInt(this.dataset.index);
            const targetInventory = getInventoryByCategory(category);
            const slotData = targetInventory[index];
            
            if (slotData && slotData.item) {
                console.log('🖱️ Double-clic sur:', slotData.item.name);
                
                // Vérifier si c'est une potion
                console.log('🔍 Type:', slotData.item.type);
                console.log('🔍 Category:', slotData.item.category);
                console.log('🔍 ID:', slotData.item.id);
                
                const isPotion = slotData.item.type === 'consommable' || 
                               slotData.item.type === 'potion' ||
                               slotData.item.category === 'potion' || 
                               (slotData.item.id && slotData.item.id.includes('potion'));
                
                console.log('🔍 Est une potion:', isPotion);
                
                if (isPotion) {
                    // Utiliser la potion directement
                    console.log('🧪 Double-clic sur potion, utilisation directe');
                    
                    // Déterminer l'ID de la potion (priorité à l'ID, puis au nom)
                    let potionId = slotData.item.id;
                    if (!potionId) {
                        // Si pas d'ID, essayer de déduire depuis le nom
                        if (slotData.item.name === 'Potion de Soin Basique') {
                            potionId = 'potion_soin_basique';
                        }
                    }
                    
                    console.log('🔍 ID de potion déterminé:', potionId);
                    
                    if (potionId && typeof window.useHealingPotion === 'function') {
                        if (window.useHealingPotion(potionId)) {
                            console.log('✅ Potion utilisée avec succès');
                            
                            // Retirer la potion de l'inventaire en utilisant l'index du slot
                            const targetInventory = getInventoryByCategory(category);
                            if (targetInventory && targetInventory[index]) {
                                // Réduire la quantité ou supprimer l'item
                                if (targetInventory[index].item.quantity && targetInventory[index].item.quantity > 1) {
                                    targetInventory[index].item.quantity -= 1;
                                    console.log('✅ Quantité de potion réduite');
                                } else {
                                    // Supprimer complètement l'item du slot
                                    targetInventory[index] = { item: null, category: category };
                                    console.log('✅ Potion supprimée du slot');
                                }
                                
                                // Mettre à jour l'affichage
                                if (typeof window.updateAllGrids === 'function') {
                                    window.updateAllGrids();
                                }
                                
                                // Synchroniser avec l'inventaire principal
                                if (typeof window.removeItemFromInventory === 'function') {
                                    window.removeItemFromInventory(potionId, 1);
                                }
                            }
                        } else {
                            console.log('❌ Échec de l\'utilisation de la potion');
                        }
                    } else {
                        console.error('❌ ID de potion invalide ou système non disponible:', potionId);
                    }
                } else {
                    // Pour les autres objets, utiliser le système existant
                    if (typeof window.handleItemClick === 'function') {
                        window.handleItemClick(slotData.item, index, category);
                    }
                }
            }
            
            setTimeout(() => {
                isDoubleClick = false;
            }, 300);
        });
        
        // Gestion des tooltips
        slot.addEventListener('mouseenter', function() {
            const index = parseInt(this.dataset.index);
            const targetInventory = getInventoryByCategory(category);
            const slotData = targetInventory[index];
            
            if (slotData && slotData.item) {
                showEquipmentTooltip(slotData.item, this);
            }
        });
        
        slot.addEventListener('mouseleave', function() {
            hideEquipmentTooltip();
        });
    });
}

// Zone de drop: poubelle
(function initTrashDropZone(){
  const trashTab = document.getElementById('inventory-trash-tab');
  if (!trashTab) return;
  trashTab.addEventListener('dragover', function(e){ e.preventDefault(); this.classList.add('drag-over'); e.dataTransfer.dropEffect = 'move'; });
  trashTab.addEventListener('dragleave', function(){ this.classList.remove('drag-over'); });
  trashTab.addEventListener('drop', function(e){
    e.preventDefault(); this.classList.remove('drag-over');
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain') || '{}');
      const { category, index } = data;
      if (typeof getInventoryByCategory !== 'function') return;
      const inv = getInventoryByCategory(category);
      const entry = inv && inv[index];
      if (entry && entry.item) {
        // Ouvrir confirmation suppression
        openTrashConfirm(entry, category, index);
      }
    } catch(_){}
  });
})();

// Global dragstart to ensure data is set whether user grabs the image or the slot
document.addEventListener('dragstart', function(e){
  const slot = e.target && e.target.closest ? e.target.closest('.inventory-slot') : null;
  if (!slot) return;
  const category = slot.dataset.category;
  const index = parseInt(slot.dataset.index);
  try {
    if (typeof getInventoryByCategory === 'function') {
      const inv = getInventoryByCategory(category);
      const entry = inv && inv[index];
      if (!entry || !entry.item) { e.preventDefault(); return; }
    }
  } catch(_){}
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ category, index }));
    e.dataTransfer.effectAllowed = 'move';
  }
});

// Confirmation de suppression
function openTrashConfirm(entry, category, index) {
  const modal = document.getElementById('trash-confirm-modal');
  const nameEl = document.getElementById('trash-item-name');
  const qtyInput = document.getElementById('trash-qty-input');
  const cancelBtn = document.getElementById('trash-cancel-btn');
  const okBtn = document.getElementById('trash-confirm-btn');
  if (!modal || !nameEl || !qtyInput || !cancelBtn || !okBtn) return;
  nameEl.textContent = entry.item.name || entry.item.id;
  const maxQty = entry.item.stackable ? (entry.item.quantity || 1) : 1;
  qtyInput.value = String(Math.min(1, maxQty));
  qtyInput.max = String(maxQty);
  qtyInput.min = '1';
  // Bloquer la saisie au range [1, maxQty]
  const clampQty = () => {
    let v = parseInt(qtyInput.value || '');
    if (isNaN(v) || v < 1) v = 1;
    if (v > maxQty) v = maxQty;
    qtyInput.value = String(v);
  };
  qtyInput.addEventListener('input', clampQty);
  qtyInput.addEventListener('change', clampQty);
  qtyInput.focus();
  qtyInput.select();
  // Empêcher les raccourcis de jeu pendant la saisie
  const stopper = function(ev){ ev.stopPropagation(); };
  qtyInput.addEventListener('keydown', stopper);
  qtyInput.addEventListener('keyup', stopper);
  qtyInput.addEventListener('keypress', stopper);
  if (typeof window.disableGameInputs === 'function') window.disableGameInputs();
  modal.style.display = 'block';
  const close = () => { modal.style.display = 'none'; };
  cancelBtn.onclick = () => { close(); if (typeof window.enableGameInputs === 'function') window.enableGameInputs(); };
  okBtn.onclick = function() {
    const n = Math.max(1, Math.min(parseInt(qtyInput.value||'1'), maxQty));
    // Supprimer n unités en respectant le stack
    const isStackable = !!entry.item.stackable;
    if (typeof window.removeItemFromInventory === 'function' && isStackable) {
      // Utiliser l'API centrale pour décrémenter la quantité
      window.removeItemFromInventory(entry.item.id, n);
    } else if (typeof window.removeSpecificItemFromInventory === 'function' && !isStackable) {
      // Non stackable: retirer l'item de ce slot
      window.removeSpecificItemFromInventory(entry.item, index, category);
    } else {
      // Fallback manuel
      if (isStackable) {
        entry.item.quantity = (entry.item.quantity || 1) - n;
        if (entry.item.quantity <= 0) entry.item = null;
      } else {
        entry.item = null;
      }
    }
    if (typeof window.updateAllGrids === 'function') window.updateAllGrids();
    close(); if (typeof window.enableGameInputs === 'function') window.enableGameInputs();
  };
}

// Fonction pour mettre à jour toutes les grilles
function updateAllGrids() {
    const categories = ['all', 'equipement', 'potions', 'ressources'];
    categories.forEach(category => {
        updateGridContent(category);
    });
    
    // Activer le drag & drop vers la poubelle après mise à jour
    setTimeout(() => {
        if (typeof window.enableTrashDragAndDrop === 'function') {
            window.enableTrashDragAndDrop();
        }
    }, 100);
    
    // Mettre à jour les établis si ils sont ouverts
    if (typeof window.updateEtabliesInventory === 'function') {
        window.updateEtabliesInventory();
    }
}

// Exporter les fonctions
window.createSeparateGrids = createSeparateGrids;
window.switchInventoryGrid = switchInventoryGrid;
window.updateGridContent = updateGridContent;
window.attachGridEvents = attachGridEvents;
window.updateAllGrids = updateAllGrids; 
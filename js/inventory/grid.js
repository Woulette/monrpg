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
    
    // Attacher les événements aux slots de cette grille
    attachGridEvents(grid, category);
}

// Fonction pour attacher les événements à une grille
function attachGridEvents(grid, category) {
    const slots = grid.querySelectorAll('.inventory-slot');
    
    slots.forEach(slot => {
        let clickTimeout = null;
        let isDoubleClick = false;
        
        // Supprimer les anciens événements
        slot.replaceWith(slot.cloneNode(true));
        const newSlot = grid.querySelector(`[data-index="${slot.dataset.index}"]`);
        
        // Clic simple pour ouvrir la fenêtre détaillée
        newSlot.addEventListener('click', function(e) {
            if (isDoubleClick) return;
            
            const index = parseInt(this.dataset.index);
            const targetInventory = getInventoryByCategory(category);
            const slotData = targetInventory[index];
            
            if (slotData && slotData.item) {
                clickTimeout = setTimeout(() => {
                    if (!isDoubleClick) {
                        showEquipmentDetailModal(slotData.item, index);
                    }
                }, 200);
            }
        });
        
        // Double-clic pour équiper
        newSlot.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            isDoubleClick = true;
            
            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
            }
            
            const index = parseInt(this.dataset.index);
            const targetInventory = getInventoryByCategory(category);
            const slotData = targetInventory[index];
            
            if (slotData && slotData.item) {
                handleItemClick(slotData.item, index, category);
            }
            
            setTimeout(() => {
                isDoubleClick = false;
            }, 300);
        });
        
        // Gestion des tooltips
        newSlot.addEventListener('mouseenter', function() {
            const index = parseInt(this.dataset.index);
            const targetInventory = getInventoryByCategory(category);
            const slotData = targetInventory[index];
            
            if (slotData && slotData.item) {
                showEquipmentTooltip(slotData.item, this);
            }
        });
        
        newSlot.addEventListener('mouseleave', function() {
            hideEquipmentTooltip();
        });
    });
}

// Fonction pour mettre à jour toutes les grilles
function updateAllGrids() {
    const categories = ['all', 'equipement', 'potions', 'ressources'];
    categories.forEach(category => {
        updateGridContent(category);
    });
    
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
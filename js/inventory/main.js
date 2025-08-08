// ... La fonction initInventoryEvents a été déplacée dans events.js ...

// Attacher les événements aux slots d'équipement
function initEquipmentEvents() {
    // Attacher les événements de clic aux slots d'équipement
    document.querySelectorAll('.equip-slot').forEach(slot => {
        const slotType = slot.dataset.slot;
        let clickTimeout = null;
        let isDoubleClick = false;
        
        // Événement de clic simple pour ouvrir la fenêtre détaillée
        slot.addEventListener('click', function(e) {
            if (isDoubleClick) return;
            
            const equippedItem = getItemInSlot(slotType);
            if (equippedItem) {
                clickTimeout = setTimeout(() => {
                    if (!isDoubleClick) {
                        showEquipmentDetailModal(equippedItem, null);
                    }
                }, 200);
            }
        });
        
        // Événement de double-clic pour déséquiper
        slot.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            isDoubleClick = true;
            
            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
            }
            
            handleEquipmentSlotClick(slotType);
            
            setTimeout(() => {
                isDoubleClick = false;
            }, 300);
        });
        
        // Événements pour les tooltips
        slot.addEventListener('mouseenter', function() {
            const equippedItem = getItemInSlot(slotType);
            if (equippedItem) {
                showEquipmentTooltip(equippedItem, this);
            }
        });
        
        slot.addEventListener('mouseleave', function() {
            hideEquipmentTooltip();
        });
    });
}

// Initialiser les événements de la fenêtre détaillée
function initModalEvents() {
    // Fermeture de la fenêtre
    const closeBtn = document.getElementById('close-equipment-detail');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEquipmentDetailModal);
    }
    
    // Fermeture en cliquant à l'extérieur
    const detailModal = document.getElementById('equipment-detail-modal');
    if (detailModal) {
        detailModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeEquipmentDetailModal();
            }
        });
    }
    
    // Déplacement de la fenêtre
    const modalContent = document.getElementById('equipment-detail-content');
    const modalHeader = document.getElementById('equipment-detail-header');
    
    if (modalHeader && modalContent) {
        modalHeader.addEventListener('mousedown', function(e) {
            if (e.target.id === 'close-equipment-detail') return; // Ne pas déplacer si on clique sur le X
            
            isDragging = true;
            const rect = modalContent.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            modalContent.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            const newX = e.clientX - dragOffsetX;
            const newY = e.clientY - dragOffsetY;
            
            // Limiter la fenêtre dans l'écran
            const maxX = window.innerWidth - modalContent.offsetWidth;
            const maxY = window.innerHeight - modalContent.offsetHeight;
            
            modalContent.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
            modalContent.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
            modalContent.style.transform = 'none'; // Désactiver le centrage
        });
        
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                modalContent.style.cursor = 'move';
            }
        });
    }
    
    // Gestion de la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Vérifier d'abord si la fenêtre détaillée est ouverte
            const detailModal = document.getElementById('equipment-detail-modal');
            if (detailModal && detailModal.style.display === 'block') {
                closeEquipmentDetailModal();
            } else {
                // Sinon fermer l'inventaire
                const inventoryModal = document.getElementById('inventory-modal');
                if (inventoryModal && inventoryModal.style.display === 'block') {
                    closeInventory();
                }
            }
        }
    });
    
    // Bouton équiper
    const equipBtn = document.getElementById('equip-button');
    if (equipBtn) {
        equipBtn.addEventListener('click', function() {
            if (currentEquipmentDetailItem) {
                if (equipItem(currentEquipmentDetailItem.id)) {
                    // Retirer l'item seulement s'il vient d'une grille, en synchronisant all/équipement
                    if (currentEquipmentDetailIndex !== null && typeof window.removeSpecificItemFromInventory === 'function') {
                        const cat = (typeof currentEquipmentDetailCategory !== 'undefined') ? currentEquipmentDetailCategory : 'all';
                        window.removeSpecificItemFromInventory(
                            currentEquipmentDetailItem,
                            currentEquipmentDetailIndex,
                            cat
                        );
                        updateAllGrids();
                    }
                    updateEquipmentDisplay();
                    updateStatsDisplay();
                    closeEquipmentDetailModal();
                }
            }
        });
    }
    
    // Bouton déséquiper
    const unequipBtn = document.getElementById('unequip-button');
    if (unequipBtn) {
        unequipBtn.addEventListener('click', function() {
            if (currentEquipmentDetailItem) {
                const slotType = currentEquipmentDetailItem.slot;
                if (unequipItem(slotType)) {
                    // Remettre l'item dans l'inventaire d'équipement
                    const emptySlot = inventoryEquipement.findIndex(slot => slot.item === null);
                    if (emptySlot !== -1) {
                        inventoryEquipement[emptySlot] = {
                            item: currentEquipmentDetailItem,
                            category: 'equipement'
                        };
                    }
                    
                    // Remettre aussi dans l'inventaire principal
                    const mainEmptySlot = inventoryAll.findIndex(slot => slot.item === null);
                    if (mainEmptySlot !== -1) {
                        inventoryAll[mainEmptySlot] = {
                            item: currentEquipmentDetailItem,
                            category: 'equipement'
                        };
                    }
                    
                    updateAllGrids();
                    updateEquipmentDisplay();
                    updateStatsDisplay();
                    closeEquipmentDetailModal();
                }
            }
        });
    }
}

// Fonction principale d'initialisation qui sera appelée par inventory.js
function initInventoryMain() {
    
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                initInventoryEvents();
                initEquipmentEvents();
                initModalEvents();
                
                // CORRECTION AUTOMATIQUE : Appliquer les réparations d'équipement à chaque chargement
                setTimeout(() => {
                    if (typeof window.fixEquipmentIssues === 'function') {
                        console.log('🔧 Application automatique des corrections d\'équipement...');
                        window.fixEquipmentIssues();
                    }
                }, 500);
            }, 100);
        });
    } else {
        // DOM déjà prêt
        setTimeout(() => {
            initInventoryEvents();
            initEquipmentEvents();
            initModalEvents();
            
            // CORRECTION AUTOMATIQUE : Appliquer les réparations d'équipement
            setTimeout(() => {
                if (typeof window.fixEquipmentIssues === 'function') {
                    console.log('🔧 Application automatique des corrections d\'équipement...');
                    window.fixEquipmentIssues();
                }
            }, 500);
        }, 100);
    }
}

// Exposer la fonction d'initialisation globalement
window.initInventoryMain = initInventoryMain; 
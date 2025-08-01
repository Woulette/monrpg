// Fonction d'initialisation qui sera appelée après le chargement de tous les modules
function initInventoryEvents() {
    const icon = document.getElementById("inventory-icon");
    const statsIcon = document.getElementById("stats-icon");
    const modal = document.getElementById("inventory-modal");
    const statsModal = document.getElementById("stats-modal");
    const closeBtn = document.getElementById("close-inventory");
    const closeStatsBtn = document.getElementById("close-stats");

    if (icon && modal && closeBtn) {
        icon.onclick = () => { 
            modal.style.display = "block"; 
        };
        closeBtn.onclick = () => { modal.style.display = "none"; };
        modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
    } else {
        console.error("❌ Éléments d'inventaire non trouvés:", { icon, modal, closeBtn });
    }

    if (statsIcon && statsModal && closeStatsBtn) {
        // Gestion de l'icône des statistiques
        statsIcon.onclick = () => {
            statsModal.style.display = "block";
            if (typeof updateStatsModalDisplay === 'function') {
                updateStatsModalDisplay();
            }
        };

        // Fermeture de la fenêtre des statistiques
        closeStatsBtn.onclick = () => { statsModal.style.display = "none"; };
        statsModal.onclick = (e) => { if (e.target === statsModal) statsModal.style.display = "none"; };
    } else {
        console.error("❌ Éléments de statistiques non trouvés:", { statsIcon, statsModal, closeStatsBtn });
    }

    // Gestion des boutons de statistiques
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('stat-btn')) {
            const statName = e.target.dataset.stat;
            const isPlus = e.target.classList.contains('stat-plus');
            
            if (isPlus) {
                // Augmenter la statistique de base
                if (player.statPoints > 0) {
                    // Gestion spéciale pour la vitesse : 5 points = +1 vitesse
                    if (statName === 'vitesse') {
                        if (player.statPoints >= 5) {
                            player.baseVitesse++;
                            player.statPoints -= 5;
                        } else {
                            return;
                        }
                    } else {
                        // Modifier la stat de base
                        const baseStatName = 'base' + statName.charAt(0).toUpperCase() + statName.slice(1);
                        player[baseStatName]++;
                        player.statPoints--;
                    }
                    
                    // Recalculer les stats totales
                    if (typeof recalculateTotalStats === 'function') {
                        recalculateTotalStats();
                    }
                    
                    // Note: L'XP nécessaire pour les stats de combat n'est plus recalculé ici
                    // pour éviter que les stats modulables influencent la progression des stats permanentes
                    
                    updateStatsModalDisplay();
                    updateStatsDisplay(); // Mettre à jour aussi l'inventaire
                }
            } else {
                // Diminuer la statistique de base
                const baseStatName = statName === 'vitesse' ? 'baseVitesse' : 'base' + statName.charAt(0).toUpperCase() + statName.slice(1);
                const equipStatName = statName === 'vitesse' ? 'equipVitesse' : 'equip' + statName.charAt(0).toUpperCase() + statName.slice(1);
                
                // Vérifier qu'on ne descend pas en dessous des bonus d'équipement
                const minValue = 1 + player[equipStatName];
                const currentTotal = player[statName];
                
                if (currentTotal > minValue) {
                    // Gestion spéciale pour la vitesse : rembourser 5 points
                    if (statName === 'vitesse') {
                        player.baseVitesse--;
                        player.statPoints += 5;
                    } else {
                        player[baseStatName]--;
                        player.statPoints++;
                    }
                    
                    // Recalculer les stats totales
                    if (typeof recalculateTotalStats === 'function') {
                        recalculateTotalStats();
                    }
                    
                    // Note: L'XP nécessaire pour les stats de combat n'est plus recalculé ici
                    // pour éviter que les stats modulables influencent la progression des stats permanentes
                    
                    updateStatsModalDisplay();
                    updateStatsDisplay(); // Mettre à jour aussi l'inventaire
                }
            }
        }
    });

    // Touche "I"
    document.addEventListener("keydown", (e) => {
        // Vérifier si on est dans un input du chat
        const isInChatInput = e.target.classList.contains('chat-input');
        
        if (e.key === "i" || e.key === "I") {
            if (!isInChatInput) {
                modal.style.display = (modal.style.display === "block") ? "none" : "block";
                if (modal.style.display === "block") {
                    updateStatsDisplay();
                }
            }
        }
        // Touche "S" pour les statistiques
        if (e.key === "s" || e.key === "S") {
            if (!isInChatInput) {
                const isVisible = statsModal.style.display === "block";
                statsModal.style.display = isVisible ? "none" : "block";
                if (!isVisible) {
                    updateStatsModalDisplay();
                }
            }
        }
    });

    // Initialisation des stats
    if (typeof updateStatsDisplay === 'function') {
        updateStatsDisplay();
    }
    if (typeof updatePeckaDisplay === 'function') {
        updatePeckaDisplay();
    }
    
    // Initialiser l'affichage de l'équipement
    if (typeof updateEquipmentDisplay === 'function') {
        updateEquipmentDisplay();
    }
    
    // Créer les grilles séparées pour chaque catégorie
    if (typeof createSeparateGrids === 'function') {
        createSeparateGrids();
    }
    
    // Gestion des onglets de catégorie
    document.querySelectorAll(".inventory-tab").forEach(btn => {
        btn.addEventListener("click", function() {
            document.querySelectorAll(".inventory-tab").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            const cat = this.dataset.category;
            if (typeof switchInventoryGrid === 'function') {
                switchInventoryGrid(cat);
            }
        });
    });

    // Premier affichage : grille "Tous"
    if (typeof switchInventoryGrid === 'function') {
        switchInventoryGrid("all");
    }
    
    // Inventaire vide au démarrage - pas d'items de test

    // Gestion de la touche Échap pour fermer la fenêtre des statistiques
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && statsModal && statsModal.style.display === 'block') {
            statsModal.style.display = 'none';
        }
    });
}

// Attacher les événements aux slots d'équipement
function initEquipmentEvents() {
    console.log("🔧 Initialisation des événements d'équipement...");
    
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
    console.log("🔧 Initialisation des événements de modal...");
    
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
                    // Retirer l'item de l'inventaire seulement s'il vient de l'inventaire
                    if (currentEquipmentDetailIndex !== null) {
                        // Trouver dans quel inventaire l'item se trouve
                        const categories = ['equipement', 'potions', 'ressources', 'all'];
                        for (let cat of categories) {
                            const targetInventory = getInventoryByCategory(cat);
                            if (targetInventory[currentEquipmentDetailIndex] && 
                                targetInventory[currentEquipmentDetailIndex].item && 
                                targetInventory[currentEquipmentDetailIndex].item.id === currentEquipmentDetailItem.id) {
                                // Retirer l'item
                                targetInventory[currentEquipmentDetailIndex] = { item: null, category: cat };
                                
                                // Réorganiser l'inventaire en décalant vers la gauche
                                reorganizeInventory(targetInventory);
                                break;
                            }
                        }
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
    console.log("🚀 Initialisation du module main.js d'inventaire");
    
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                initInventoryEvents();
                initEquipmentEvents();
                initModalEvents();
            }, 100); // Petit délai pour s'assurer que tout est chargé
        });
    } else {
        // DOM déjà prêt
        setTimeout(() => {
            initInventoryEvents();
            initEquipmentEvents();
            initModalEvents();
        }, 100);
    }
}

// Exposer la fonction d'initialisation globalement
window.initInventoryMain = initInventoryMain; 
// Gestion des événements d'inventaire et de stats

function initInventoryEvents() {
	// Éviter les doubles/triples liaisons d'événements
	if (window.__inventoryEventsInit) return;
	window.__inventoryEventsInit = true;
    const icon = document.getElementById("inventory-icon");
    const statsIcon = document.getElementById("stats-icon");
    const modal = document.getElementById("inventory-modal");
    const statsModal = document.getElementById("stats-modal");
    const closeBtn = document.getElementById("close-inventory");
    const closeStatsBtn = document.getElementById("close-stats");

    if (icon && modal && closeBtn) {
        icon.onclick = () => { 
            if (window.gameState === 'playing') {
                modal.style.display = "block"; 
            }
        };
        // Fermer par X
        closeBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); modal.style.display = "none"; };
        // Fermer par clic hors contenu
        modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
    } else {
        console.error("❌ Éléments d'inventaire non trouvés:", { icon, modal, closeBtn });
    }

    if (statsIcon && statsModal && closeStatsBtn) {
        // Gestion de l'icône des statistiques
        statsIcon.onclick = () => {
            if (window.gameState !== 'playing') return;
            statsModal.style.display = "block";
            if (typeof updateStatsModalDisplay === 'function') {
                updateStatsModalDisplay();
            }
        };

        // Fermeture de la fenêtre des statistiques
        closeStatsBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); statsModal.style.display = "none"; };
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
        if (window.gameState !== 'playing') return;
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

window.initInventoryEvents = initInventoryEvents;

// Exposer des helpers globaux attendus ailleurs
    window.openInventoryModal = function() {
        if (window.gameState !== 'playing') return;
    const modal = document.getElementById('inventory-modal');
    if (modal) {
        modal.style.display = 'block';
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay();
    }
};
    window.openStatsModal = function() {
        if (window.gameState !== 'playing') return;
    const statsModal = document.getElementById('stats-modal');
    if (statsModal) {
        statsModal.style.display = 'block';
        if (typeof updateStatsModalDisplay === 'function') updateStatsModalDisplay();
    }
};
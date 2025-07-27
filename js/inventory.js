console.log("Fichier js/inventory.js chargé");

// INVENTAIRES SÉPARÉS PAR CATÉGORIE - CHACUN COMPLÈTEMENT INDÉPENDANT
let inventoryAll = Array.from({ length: 80 }, () => ({ item: null, category: null }));
let inventoryEquipement = Array.from({ length: 80 }, () => ({ item: null, category: 'equipement' }));
let inventoryPotions = Array.from({ length: 80 }, () => ({ item: null, category: 'potions' }));
let inventoryRessources = Array.from({ length: 80 }, () => ({ item: null, category: 'ressources' }));

// Inventaire principal (pour compatibilité avec le système d'équipement)
let inventory = inventoryAll;

// Rendre les inventaires accessibles globalement
window.inventory = inventory;
window.inventoryAll = inventoryAll;
window.inventoryEquipement = inventoryEquipement;
window.inventoryPotions = inventoryPotions;
window.inventoryRessources = inventoryRessources;

// Rendre les fonctions de réinitialisation disponibles globalement
window.resetInventory = resetInventory;
window.resetEquipment = resetEquipment;

function initInventory() {
    console.log("Initialisation de l'inventaire...");
    
    // Inventaire vide au démarrage
    console.log("Inventaire initialisé avec succès");
}

// Fonction pour réinitialiser complètement l'inventaire
function resetInventory() {
    console.log("Réinitialisation complète de l'inventaire...");
    
    // Vider tous les inventaires
    window.inventoryAll = [];
    window.inventoryEquipement = [];
    window.inventoryPotions = [];
    window.inventoryRessources = [];
    
    // Mettre à jour l'affichage
    if (typeof updateAllGrids === 'function') {
        updateAllGrids();
    }
    
    // Réinitialiser l'équipement
    if (typeof resetEquipment === 'function') {
        resetEquipment();
    }
    
    console.log("Inventaire réinitialisé avec succès");
}

// Fonction pour réinitialiser l'équipement
function resetEquipment() {
    console.log("Réinitialisation de l'équipement...");
    
    // Réinitialiser les slots d'équipement
    window.equippedItems = {
        coiffe: null,
        cape: null,
        collier: null,
        anneau: null,
        ceinture: null,
        bottes: null
    };
    
    // Mettre à jour l'affichage de l'équipement
    if (typeof updateEquipmentDisplay === 'function') {
        updateEquipmentDisplay();
    }
    
    console.log("Équipement réinitialisé avec succès");
}

function initStats() {
    console.log("Initialisation des statistiques...");
    
    // Les statistiques sont déjà initialisées dans player.js
    // Cette fonction peut être utilisée pour des initialisations supplémentaires si nécessaire
    
    console.log("Statistiques initialisées avec succès");
}

document.addEventListener("DOMContentLoaded", function() {
    const icon = document.getElementById("inventory-icon");
    const statsIcon = document.getElementById("stats-icon");
    const modal = document.getElementById("inventory-modal");
    const statsModal = document.getElementById("stats-modal");
    const closeBtn = document.getElementById("close-inventory");
    const closeStatsBtn = document.getElementById("close-stats");

    icon.onclick = () => { modal.style.display = "block"; };
    closeBtn.onclick = () => { modal.style.display = "none"; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

    // Gestion de l'icône des statistiques
    statsIcon.onclick = () => {
        statsModal.style.display = "block";
        updateStatsModalDisplay();
    };

    // Fermeture de la fenêtre des statistiques
    closeStatsBtn.onclick = () => { statsModal.style.display = "none"; };
    statsModal.onclick = (e) => { if (e.target === statsModal) statsModal.style.display = "none"; };

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
                            console.log(`Vitesse de base augmentée à ${player.baseVitesse} (coût: 5 points)`);
                        } else {
                            console.log(`Pas assez de points pour augmenter la vitesse (nécessite 5 points)`);
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
                        console.log(`Vitesse de base diminuée à ${player.baseVitesse} (remboursement: 5 points)`);
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
                } else {
                    console.log(`Impossible de diminuer ${statName} : minimum atteint (${minValue} total)`);
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
    updateStatsDisplay();
    updatePeckaDisplay();
    
    // Initialiser l'affichage de l'équipement
    if (typeof updateEquipmentDisplay === 'function') {
        updateEquipmentDisplay();
    }
    
    // Créer les grilles séparées pour chaque catégorie
    createSeparateGrids();
    
    // Gestion des onglets de catégorie
    document.querySelectorAll(".inventory-tab").forEach(btn => {
        btn.addEventListener("click", function() {
            document.querySelectorAll(".inventory-tab").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            const cat = this.dataset.category;
            switchInventoryGrid(cat);
        });
    });

    // Premier affichage : grille "Tous"
    switchInventoryGrid("all");
    
    // Inventaire vide au démarrage - pas d'items de test

    // Gestion de la touche Échap pour fermer la fenêtre des statistiques
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && statsModal && statsModal.style.display === 'block') {
            statsModal.style.display = 'none';
        }
    });
});

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
    
    // Choisir le bon inventaire
    let targetInventory;
    switch (category) {
        case 'equipement':
            targetInventory = inventoryEquipement;
            break;
        case 'potions':
            targetInventory = inventoryPotions;
            break;
        case 'ressources':
            targetInventory = inventoryRessources;
            break;
        case 'all':
        default:
            targetInventory = inventoryAll;
            break;
    }
    
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

// Fonction pour obtenir l'inventaire selon la catégorie
function getInventoryByCategory(category) {
    switch (category) {
        case 'equipement':
            return inventoryEquipement;
        case 'potions':
            return inventoryPotions;
        case 'ressources':
            return inventoryRessources;
        case 'all':
        default:
            return inventoryAll;
    }
}

// Fonction pour mettre à jour l'affichage des stats
function updateStatsDisplay() {
    if (typeof player === 'undefined') return;
    
    const stats = ['force', 'intelligence', 'agilite', 'defense', 'chance'];
    stats.forEach(stat => {
        // Mettre à jour la valeur totale
        const valueElement = document.getElementById(`stat-${stat}`);
        if (valueElement && player[stat] !== undefined) {
            valueElement.textContent = player[stat];
        }
        
        // Mettre à jour la barre d'XP et afficher la décomposition (sauf pour chance)
        if (stat !== 'chance') {
            const xpElement = document.getElementById(`stat-${stat}-xp`);
            const xpTextElement = document.getElementById(`stat-${stat}-xp-text`);
            
            if (xpElement && xpTextElement) {
                const currentXP = player[stat + 'Xp'] || 0;
                const xpToNext = player[stat + 'XpToNext'] || 10;
                const ratio = currentXP / xpToNext;
                
                xpElement.style.width = (ratio * 100) + '%';
                
                // Afficher la décomposition des stats
                const baseStatName = 'base' + stat.charAt(0).toUpperCase() + stat.slice(1);
                const combatStatName = 'combat' + stat.charAt(0).toUpperCase() + stat.slice(1);
                const baseValue = player[baseStatName] || 0;
                const combatValue = player[combatStatName] || 0;
                const equipValue = player[stat] - baseValue - combatValue;
                
                let statBreakdown = `Base: ${baseValue}`;
                if (combatValue > 0) statBreakdown += ` | Combat: ${combatValue}`;
                if (equipValue > 0) statBreakdown += ` | Équip: ${equipValue}`;
                
                xpTextElement.textContent = statBreakdown;
            }
        }
    });
}

// Fonction pour animer une stat qui monte
function animateStatLevelUp(statName) {
    const statElement = document.querySelector(`[data-stat="${statName}"]`);
    if (statElement) {
        statElement.classList.add('level-up');
        setTimeout(() => {
            statElement.classList.remove('level-up');
        }, 600);
    }
}

// Fonctions globales pour être appelées depuis player.js
window.updateStatsDisplay = updateStatsDisplay;
window.animateStatLevelUp = animateStatLevelUp;
window.updateStatsModalDisplay = updateStatsModalDisplay;

// Fonction pour mettre à jour l'affichage des statistiques dans la fenêtre modale
function updateStatsModalDisplay() {
    if (!player) return;

    // Mise à jour du niveau du joueur
    const playerLevelElement = document.getElementById("player-level");
    const playerXpFillElement = document.getElementById("player-xp-fill");
    const playerXpTextElement = document.getElementById("player-xp-text");
    const statPointsElement = document.getElementById("stat-points-value");

    if (playerLevelElement) playerLevelElement.textContent = player.level;
    if (statPointsElement) statPointsElement.textContent = player.statPoints;
    
    const xpForNextLevel = player.xpToNextLevel;
    const xpProgress = (player.xp / xpForNextLevel) * 100;
    
    if (playerXpFillElement) playerXpFillElement.style.width = xpProgress + "%";
    if (playerXpTextElement) playerXpTextElement.textContent = `${player.xp}/${xpForNextLevel}`;

    // Mise à jour des statistiques individuelles
    const stats = ['force', 'intelligence', 'agilite', 'defense', 'chance', 'vitesse', 'vie'];
    
    stats.forEach(stat => {
        const valueElement = document.getElementById(`stat-${stat}-modal`);
        const xpFillElement = document.getElementById(`stat-${stat}-xp-modal`);
        const xpTextElement = document.getElementById(`stat-${stat}-xp-text-modal`);
        const minusBtn = document.querySelector(`[data-stat="${stat}"].stat-minus`);
        const plusBtn = document.querySelector(`[data-stat="${stat}"].stat-plus`);
        
        // Afficher la stat totale
        if (valueElement) valueElement.textContent = player[stat];
        
        // Gestion des boutons - seulement pour les stats modulables (base)
        if (stat !== 'chance' && stat !== 'vitesse' && stat !== 'vie') {
            const baseStatName = 'base' + stat.charAt(0).toUpperCase() + stat.slice(1);
            const combatStatName = 'combat' + stat.charAt(0).toUpperCase() + stat.slice(1);
            
            // Les boutons ne peuvent modifier que les stats de base
            if (minusBtn) minusBtn.disabled = player[baseStatName] <= 1;
            if (plusBtn) plusBtn.disabled = player.statPoints <= 0;
            
            // Afficher la décomposition des stats
            if (xpTextElement) {
                const baseValue = player[baseStatName] || 0;
                const combatValue = player[combatStatName] || 0;
                const equipValue = player[stat] - baseValue - combatValue;
                
                let statBreakdown = `Base: ${baseValue}`;
                if (combatValue > 0) statBreakdown += ` | Combat: ${combatValue}`;
                if (equipValue > 0) statBreakdown += ` | Équip: ${equipValue}`;
                
                xpTextElement.textContent = statBreakdown;
            }
        } else {
            // Pour chance, vitesse, vie - pas de modification
            if (minusBtn) minusBtn.disabled = true;
            if (plusBtn) plusBtn.disabled = true;
            
            if (xpTextElement) {
                if (stat === 'chance') xpTextElement.textContent = "Équipement";
                else if (stat === 'vitesse') xpTextElement.textContent = "Caractéristiques";
                else if (stat === 'vie') xpTextElement.textContent = "Vie";
            }
        }
        
        if (stat === 'chance' || stat === 'vitesse' || stat === 'vie') {
            if (xpTextElement) xpTextElement.textContent = stat === 'chance' ? "Équipement" : stat === 'vitesse' ? "Caractéristiques" : "Vie";
            if (xpFillElement) xpFillElement.style.width = "0%";
        } else {
            const statXp = player[`${stat}Xp`] || 0;
            const xpToNext = player[`${stat}XpToNext`] || 10;
            const statXpProgress = (statXp / xpToNext) * 100;
            
            if (xpFillElement) xpFillElement.style.width = statXpProgress + "%";
            if (xpTextElement) xpTextElement.textContent = `${statXp}/${xpToNext}`;
        }
    });
}

// Fonction pour mettre à jour l'affichage des Pecka
function updatePeckaDisplay() {
    if (typeof player === 'undefined') return;
    
    const peckaElement = document.getElementById('pecka-amount');
    if (peckaElement && player.pecka !== undefined) {
        peckaElement.textContent = player.pecka;
    }
}

// Fonction globale pour être appelée depuis player.js
window.updatePeckaDisplay = updatePeckaDisplay;

// Fonction pour ajouter un item à l'inventaire
function addItemToInventory(itemId, category) {
    const item = equipmentDatabase[itemId];
    if (!item) {
        console.error(`Item ${itemId} non trouvé dans la base de données`);
        return false;
    }
    
    // Choisir le bon inventaire selon la catégorie
    let targetInventory;
    switch (category) {
        case 'equipement':
            targetInventory = inventoryEquipement;
            break;
        case 'potions':
            targetInventory = inventoryPotions;
            break;
        case 'ressources':
            targetInventory = inventoryRessources;
            break;
        default:
            targetInventory = inventoryAll;
            break;
    }
    
    // Trouver un slot vide dans l'inventaire cible
    const emptySlot = targetInventory.findIndex(slot => slot.item === null);
    if (emptySlot === -1) {
        console.error(`Inventaire ${category} plein !`);
        return false;
    }
    
    // Ajouter l'item dans le bon inventaire
    targetInventory[emptySlot] = {
        item: item,
        category: category
    };
    
    // Ajouter aussi dans l'inventaire principal pour compatibilité
    const mainEmptySlot = inventoryAll.findIndex(slot => slot.item === null);
    if (mainEmptySlot !== -1) {
        inventoryAll[mainEmptySlot] = {
            item: item,
            category: category
        };
    }
    
    console.log(`Item ${item.name} ajouté à l'inventaire ${category}`);
    
    // Mettre à jour toutes les grilles
    updateAllGrids();
    return true;
}

// Fonction pour mettre à jour toutes les grilles
function updateAllGrids() {
    const categories = ['all', 'equipement', 'potions', 'ressources'];
    categories.forEach(category => {
        updateGridContent(category);
    });
}

// Fonction utilitaire pour retirer un item de tous les inventaires (par id)
function removeItemFromAllInventories(itemId) {
    // Retire de l'inventaire principal
    const mainIndex = inventoryAll.findIndex(slot => slot.item && slot.item.id === itemId);
    if (mainIndex !== -1) {
        inventoryAll[mainIndex] = { item: null, category: null };
        reorganizeInventory(inventoryAll);
    }
    // Retire de chaque catégorie
    [inventoryEquipement, inventoryPotions, inventoryRessources].forEach(inv => {
        const idx = inv.findIndex(slot => slot.item && slot.item.id === itemId);
        if (idx !== -1) {
            inv[idx] = { item: null, category: inv[idx].category };
            reorganizeInventory(inv);
        }
    });
    // Forcer la synchro visuelle
    if (typeof updateAllGrids === 'function') updateAllGrids();
}

// Modifie handleItemClick pour synchroniser les retraits
function handleItemClick(item, slotIndex, category) {
    console.log(`Clic sur ${item.name} dans la catégorie ${category}`);
    
    if (item.type === 'coiffe' || item.type === 'cape' || item.type === 'amulette' || item.type === 'anneau' || item.type === 'ceinture' || item.type === 'bottes') {
        // Équiper l'item
        if (equipItem(item.id)) {
            // Retirer l'item de tous les inventaires
            removeItemFromAllInventories(item.id);
            updateAllGrids();
            updateEquipmentDisplay();
            updateStatsDisplay();
            console.log(`${item.name} équipé !`);
        }
    }
}

// Fonction pour gérer le clic sur un slot d'équipement
function handleEquipmentSlotClick(slotType) {
    console.log(`Clic sur slot d'équipement: ${slotType}`);
    
    const equippedItem = getItemInSlot(slotType);
    if (equippedItem) {
        // Déséquiper l'item
        if (unequipItem(slotType)) {
            // Remettre l'item dans l'inventaire d'équipement
            const emptySlot = inventoryEquipement.findIndex(slot => slot.item === null);
            if (emptySlot !== -1) {
                inventoryEquipement[emptySlot] = {
                    item: equippedItem,
                    category: 'equipement'
                };
            }
            
            // Remettre aussi dans l'inventaire principal
            const mainEmptySlot = inventoryAll.findIndex(slot => slot.item === null);
            if (mainEmptySlot !== -1) {
                inventoryAll[mainEmptySlot] = {
                    item: equippedItem,
                    category: 'equipement'
                };
            }
            
            updateAllGrids();
            updateEquipmentDisplay();
            updateStatsDisplay();
            console.log(`${equippedItem.name} déséquipé !`);
        }
    }
}

// Fonction pour mettre à jour l'affichage de l'équipement
function updateEquipmentDisplay() {
    // Mettre à jour les slots d'équipement
    document.querySelectorAll('.equip-slot').forEach(slot => {
        const slotType = slot.dataset.slot;
        const equippedItem = getItemInSlot(slotType);
        
        if (equippedItem) {
            slot.innerHTML = `<img src="${equippedItem.icon}" alt="${equippedItem.name}" style="width:32px;height:32px;">`;
            slot.title = equippedItem.name;
        } else {
            slot.innerHTML = '<div class="slot-icon"></div>';
            slot.title = slotType;
        }
    });
}

// Initialiser l'affichage de l'équipement au démarrage
window.updateEquipmentDisplay = updateEquipmentDisplay;
window.addItemToInventory = addItemToInventory;
window.handleItemClick = handleItemClick;
window.handleEquipmentSlotClick = handleEquipmentSlotClick;

// Attacher les événements aux slots d'équipement
document.addEventListener('DOMContentLoaded', function() {
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
});

// Fonctions pour les tooltips d'équipement
function showEquipmentTooltip(item, element) {
    // Supprimer l'ancien tooltip s'il existe
    hideEquipmentTooltip();
    
    // Créer le tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'equipment-tooltip';
    tooltip.id = 'equipment-tooltip';
    
    // Contenu du tooltip
    let tooltipContent = `
        <div class="item-name">${item.name}</div>
        <div class="item-description">${item.description}</div>
    `;
    
    // Ajouter les stats si elles existent
    if (item.stats) {
        tooltipContent += '<div class="item-stats">';
        if (item.stats.force) tooltipContent += `<div class="stat-line"><span class="stat-name">Force:</span><span class="stat-value">+${item.stats.force}</span></div>`;
        if (item.stats.intelligence) tooltipContent += `<div class="stat-line"><span class="stat-name">Intelligence:</span><span class="stat-value">+${item.stats.intelligence}</span></div>`;
        if (item.stats.agilite) tooltipContent += `<div class="stat-line"><span class="stat-name">Agilité:</span><span class="stat-value">+${item.stats.agilite}</span></div>`;
        if (item.stats.defense) tooltipContent += `<div class="stat-line"><span class="stat-name">Défense:</span><span class="stat-value">+${item.stats.defense}</span></div>`;
        if (item.stats.vie) tooltipContent += `<div class="stat-line"><span class="stat-name">Vie:</span><span class="stat-value">+${item.stats.vie}</span></div>`;
        if (item.stats.chance) tooltipContent += `<div class="stat-line"><span class="stat-name">Chance:</span><span class="stat-value">+${item.stats.chance}</span></div>`;
        if (item.stats.vitesse) tooltipContent += `<div class="stat-line"><span class="stat-name">Vitesse:</span><span class="stat-value">+${item.stats.vitesse}</span></div>`;
        tooltipContent += '</div>';
    }
    
    tooltipContent += `<div class="item-type">${item.type.toUpperCase()}</div>`;
    
    tooltip.innerHTML = tooltipContent;
    
    // Ajouter au body
    document.body.appendChild(tooltip);
    
    // Positionner le tooltip
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left = rect.right + 10;
    let top = rect.top;
    
    // Ajuster si le tooltip dépasse à droite
    if (left + tooltipRect.width > window.innerWidth) {
        left = rect.left - tooltipRect.width - 10;
    }
    
    // Ajuster si le tooltip dépasse en bas
    if (top + tooltipRect.height > window.innerHeight) {
        top = window.innerHeight - tooltipRect.height - 10;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

function hideEquipmentTooltip() {
    const tooltip = document.getElementById('equipment-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Exporter les fonctions
window.showEquipmentTooltip = showEquipmentTooltip;
window.hideEquipmentTooltip = hideEquipmentTooltip;

// Variables globales pour la fenêtre détaillée
let currentEquipmentDetailItem = null;
let currentEquipmentDetailIndex = null;
let clickTimeout = null;

// Fonction pour afficher la fenêtre détaillée de l'équipement
function showEquipmentDetailModal(item, slotIndex) {
    currentEquipmentDetailItem = item;
    currentEquipmentDetailIndex = slotIndex;
    
    try {
        // Déterminer la catégorie de l'item
        let category = 'ÉQUIPEMENT';
        if (item.type === 'ressource' || item.id === 'patte_corbeau' || item.id === 'plume_corbeau') {
            category = 'RESSOURCES';
        }
        
        // Remplir les informations
        document.getElementById('equipment-name').textContent = category;
        
        // Déterminer le type d'affichage
        let displayType = item.type.toUpperCase();
        if (item.id === 'plume_corbeau') {
            displayType = 'PLUME';
        } else if (item.id === 'patte_corbeau') {
            displayType = 'PATTES';
        }
        
        document.getElementById('equipment-type').textContent = displayType;
        document.getElementById('equipment-rarity').textContent = item.rarity.toUpperCase();
        document.getElementById('equipment-description').textContent = item.description;
        
        // Mettre le nom de l'équipement dans le titre
        document.getElementById('equipment-detail-title').textContent = item.name;
        
        // Remplir les stats (afficher seulement celles qui existent)
        const stats = item.stats || {};
        
        // Masquer toutes les lignes de stats d'abord
        document.getElementById('equipment-force').parentElement.style.display = 'none';
        document.getElementById('equipment-intelligence').parentElement.style.display = 'none';
        document.getElementById('equipment-agilite').parentElement.style.display = 'none';
        document.getElementById('equipment-defense').parentElement.style.display = 'none';
        document.getElementById('equipment-vie').parentElement.style.display = 'none';
        document.getElementById('equipment-chance').parentElement.style.display = 'none';
        document.getElementById('equipment-vitesse').parentElement.style.display = 'none';
        
        // Afficher seulement les stats qui existent
        if (stats.force) {
            document.getElementById('equipment-force').parentElement.style.display = 'flex';
            document.getElementById('equipment-force').textContent = `+${stats.force}`;
        }
        if (stats.intelligence) {
            document.getElementById('equipment-intelligence').parentElement.style.display = 'flex';
            document.getElementById('equipment-intelligence').textContent = `+${stats.intelligence}`;
        }
        if (stats.agilite) {
            document.getElementById('equipment-agilite').parentElement.style.display = 'flex';
            document.getElementById('equipment-agilite').textContent = `+${stats.agilite}`;
        }
        if (stats.defense) {
            document.getElementById('equipment-defense').parentElement.style.display = 'flex';
            document.getElementById('equipment-defense').textContent = `+${stats.defense}`;
        }
        if (stats.vie) {
            document.getElementById('equipment-vie').parentElement.style.display = 'flex';
            document.getElementById('equipment-vie').textContent = `+${stats.vie}`;
        }
        if (stats.chance) {
            document.getElementById('equipment-chance').parentElement.style.display = 'flex';
            document.getElementById('equipment-chance').textContent = `+${stats.chance}`;
        }
        if (stats.vitesse) {
            document.getElementById('equipment-vitesse').parentElement.style.display = 'flex';
            document.getElementById('equipment-vitesse').textContent = `+${stats.vitesse}`;
        }
        
        // Gérer les boutons
        const equipButton = document.getElementById('equip-button');
        const unequipButton = document.getElementById('unequip-button');
        
        // Masquer les boutons pour les ressources
        if (category === 'RESSOURCES') {
            equipButton.style.display = 'none';
            unequipButton.style.display = 'none';
        } else {
            // Vérifier si l'item est déjà équipé
            const isEquipped = isItemEquipped(item);
            
            if (isEquipped) {
                equipButton.style.display = 'none';
                unequipButton.style.display = 'inline-block';
            } else {
                equipButton.style.display = 'inline-block';
                unequipButton.style.display = 'none';
            }
        }
        
        // Afficher la fenêtre
        const modal = document.getElementById('equipment-detail-modal');
        const modalContent = document.getElementById('equipment-detail-content');
        if (modal) {
            modal.style.display = 'block';
            // Réinitialiser la position au centre
            modalContent.style.left = '50%';
            modalContent.style.top = '50%';
            modalContent.style.transform = 'translate(-50%, -50%)';
        }
    } catch (error) {
        console.error('Erreur dans showEquipmentDetailModal:', error);
    }
}

// Fonction pour fermer l'inventaire
function closeInventory() {
    document.getElementById('inventory-modal').style.display = 'none';
}

// Fonction pour fermer la fenêtre détaillée
function closeEquipmentDetailModal() {
    document.getElementById('equipment-detail-modal').style.display = 'none';
    currentEquipmentDetailItem = null;
    currentEquipmentDetailIndex = null;
}

// Fonction pour vérifier si un item est équipé
function isItemEquipped(item) {
    return Object.values(playerEquipment).some(equippedItem => 
        equippedItem && equippedItem.id === item.id
    );
}

// Fonction pour réorganiser l'inventaire en décalant vers la gauche
function reorganizeInventory(inventory) {
    // Créer un nouvel inventaire temporaire
    const newInventory = [];
    
    // Copier tous les items non-null vers le début
    for (let i = 0; i < inventory.length; i++) {
        if (inventory[i] && inventory[i].item !== null) {
            newInventory.push(inventory[i]);
        }
    }
    
    // Remplir le reste avec des slots vides
    while (newInventory.length < inventory.length) {
        newInventory.push({ item: null, category: inventory[0] ? inventory[0].category : 'all' });
    }
    
    // Remplacer l'inventaire original
    for (let i = 0; i < inventory.length; i++) {
        inventory[i] = newInventory[i];
    }
}

// Variables pour le déplacement de la fenêtre
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Initialiser les événements de la fenêtre détaillée
document.addEventListener('DOMContentLoaded', function() {
    // Fermeture de la fenêtre
    document.getElementById('close-equipment-detail').addEventListener('click', closeEquipmentDetailModal);
    
    // Fermeture en cliquant à l'extérieur
    document.getElementById('equipment-detail-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEquipmentDetailModal();
        }
    });
    
    // Déplacement de la fenêtre
    const modalContent = document.getElementById('equipment-detail-content');
    const modalHeader = document.getElementById('equipment-detail-header');
    
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
    document.getElementById('equip-button').addEventListener('click', function() {
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
    
    // Bouton déséquiper
    document.getElementById('unequip-button').addEventListener('click', function() {
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
});

// Exporter les fonctions
window.showEquipmentDetailModal = showEquipmentDetailModal;
window.closeEquipmentDetailModal = closeEquipmentDetailModal;
window.closeInventory = closeInventory;
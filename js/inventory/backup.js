console.log("Fichier js/inventory/backup.js chargé - Version de sauvegarde");

// INVENTAIRE : 80 slots vides dès le départ !
let inventory = Array.from({ length: 80 }, () => ({ item: null, category: null }));

// Rendre l'inventaire accessible globalement
window.inventory = inventory;

function initInventory() {
    console.log("Initialisation de l'inventaire...");
    
    // Ajouter la coiffe simple dans l'inventaire pour le test
    addItemToInventory('coiffe_simple', 'equipement');
    
    console.log("Inventaire initialisé avec succès");
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
                    
                    // Recalculer l'XP nécessaire pour le prochain niveau de cette stat
                    const xpToNextProp = statName + 'XpToNext';
                    if (player[xpToNextProp] !== undefined) {
                        // Réinitialiser l'XP nécessaire selon la nouvelle valeur de la stat de base
                        const baseStatName = statName === 'vitesse' ? 'baseVitesse' : 'base' + statName.charAt(0).toUpperCase() + statName.slice(1);
                        let baseXP = statName === 'vitesse' ? 50 : 10;
                        for (let i = 1; i < player[baseStatName]; i++) {
                            baseXP = Math.floor(baseXP * 1.2);
                        }
                        player[xpToNextProp] = baseXP;
                        console.log(`${statName} de base niveau ${player[baseStatName]}, XP nécessaire: ${player[xpToNextProp]}`);
                    }
                    
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
                    
                    // Recalculer l'XP nécessaire pour le prochain niveau de cette stat
                    const xpToNextProp = statName + 'XpToNext';
                    if (player[xpToNextProp] !== undefined) {
                        // Réinitialiser l'XP nécessaire selon la nouvelle valeur de la stat de base
                        let baseXP = statName === 'vitesse' ? 50 : 10;
                        for (let i = 1; i < player[baseStatName]; i++) {
                            baseXP = Math.floor(baseXP * 1.2);
                        }
                        player[xpToNextProp] = baseXP;
                        console.log(`${statName} de base niveau ${player[baseStatName]}, XP nécessaire: ${player[xpToNextProp]}`);
                    }
                    
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

    // Génération de la grille (4 x 20 = 80 slots)
    const grid = document.getElementById("inventory-grid");
    if (grid) {
        for (let i = 0; i < 4 * 20; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.index = i; // Pour relier au tableau inventory[]
            grid.appendChild(slot);
        }
    }
    
    // Initialisation des stats
    updateStatsDisplay();
    updatePeckaDisplay();
    
    // Initialiser l'affichage de l'équipement
    if (typeof updateEquipmentDisplay === 'function') {
        updateEquipmentDisplay();
    }
    
    // Fonction d'affichage de la grille selon la catégorie (TOUS les slots restent visibles)
    window.updateInventoryGrid = function(category = "all") {
        document.querySelectorAll("#inventory-grid .inventory-slot").forEach((slot, i) => {
            const slotData = inventory[i];
            slot.innerHTML = ""; // Vide le slot visuel
            // Affiche l'item S'IL EXISTE dans ce slot ET correspond à la catégorie
            if (slotData && slotData.item && (category === "all" || slotData.category === category)) {
                if (slotData.item.icon && slotData.item.icon.startsWith('assets/')) {
                    // Image d'équipement ou ressource avec tooltip
                    let itemContent = `<img src="${slotData.item.icon}" alt="${slotData.item.name}" style="width:32px;height:32px;" title="${slotData.item.name}">`;
                    
                    // Ajouter la quantité si c'est une ressource stackable
                    if (slotData.item.stackable && slotData.item.quantity > 1) {
                        itemContent += `<div class="item-quantity">${slotData.item.quantity}</div>`;
                    }
                    
                    slot.innerHTML = itemContent;
                } else {
                    // Emoji ou icône texte avec tooltip
                    let itemContent = `<span style="font-size:1.6em" title="${slotData.item.name}">${slotData.item.icon}</span>`;
                    
                    // Ajouter la quantité si c'est une ressource stackable
                    if (slotData.item.stackable && slotData.item.quantity > 1) {
                        itemContent += `<div class="item-quantity">${slotData.item.quantity}</div>`;
                    }
                    
                    slot.innerHTML = itemContent;
                }
            }
            // Sinon le slot reste vide
        });
    };

    // Gestion des onglets de catégorie (aucune case grisée/masquée)
    document.querySelectorAll(".inventory-tab").forEach(btn => {
        btn.addEventListener("click", function() {
            document.querySelectorAll(".inventory-tab").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            const cat = this.dataset.category;
            updateInventoryGrid(cat);
        });
    });

    // Premier affichage : tout l'inventaire, slots VIERGES
    updateInventoryGrid("all");
    
    // Ajouter la Corbacape à l'inventaire pour test
    addItemToInventory('cape_corbeau', 'equipement');
    
    // Ajouter le Corbollier à l'inventaire pour test
    addItemToInventory('collier_corbeau', 'equipement');
    
    // Ajouter le Corbaneau à l'inventaire pour test
    addItemToInventory('anneau_corbeau', 'equipement');
    
    // Ajouter la Corbature à l'inventaire pour test
    addItemToInventory('ceinture_corbeau', 'equipement');
    
    // Ajouter les Corbobotte à l'inventaire pour test
    addItemToInventory('bottes_corbeau', 'equipement');
    
    // Gestion des clics sur les slots d'inventaire
    document.querySelectorAll('.inventory-slot').forEach(slot => {
        let clickTimeout = null;
        let isDoubleClick = false;
        
        // Clic simple pour ouvrir la fenêtre détaillée
        slot.addEventListener('click', function(e) {
            if (isDoubleClick) return; // Bloquer complètement si double-clic
            
            const index = parseInt(this.dataset.index);
            const slotData = inventory[index];
            
            if (slotData && slotData.item) {
                // Délai pour distinguer clic simple et double-clic
                clickTimeout = setTimeout(() => {
                    if (!isDoubleClick) {
                        showEquipmentDetailModal(slotData.item, index);
                    }
                }, 200); // 200ms de délai
            }
        });
        
        // Double-clic pour équiper
        slot.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            isDoubleClick = true; // Marquer comme double-clic
            
            // Annuler le clic simple si c'est un double-clic
            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
            }
            
            const index = parseInt(this.dataset.index);
            const slotData = inventory[index];
            
            if (slotData && slotData.item) {
                handleItemClick(slotData.item, index);
            }
            
            // Reset après un délai
            setTimeout(() => {
                isDoubleClick = false;
            }, 300);
        });
        
        // Gestion des tooltips
        slot.addEventListener('mouseenter', function() {
            const index = parseInt(this.dataset.index);
            const slotData = inventory[index];
            
            if (slotData && slotData.item) {
                showEquipmentTooltip(slotData.item, this);
            }
        });
        
        slot.addEventListener('mouseleave', function() {
            hideEquipmentTooltip();
        });
    });
    
    // Gestion des clics sur les slots d'équipement
    document.querySelectorAll('.equip-slot').forEach(slot => {
        let clickTimeout = null;
        let isDoubleClick = false;
        
        // Clic simple pour ouvrir la fenêtre détaillée
        slot.addEventListener('click', function() {
            if (isDoubleClick) return; // Bloquer complètement si double-clic
            
            const slotType = this.dataset.slot;
            const equippedItem = getItemInSlot(slotType);
            
            if (equippedItem) {
                // Délai pour distinguer clic simple et double-clic
                clickTimeout = setTimeout(() => {
                    if (!isDoubleClick) {
                        showEquipmentDetailModal(equippedItem, null); // null car pas d'index d'inventaire
                    }
                }, 200); // 200ms de délai
            }
        });
        
        // Double-clic pour déséquiper
        slot.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            isDoubleClick = true; // Marquer comme double-clic
            
            // Annuler le clic simple si c'est un double-clic
            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
            }
            
            const slotType = this.dataset.slot;
            handleEquipmentSlotClick(slotType);
            
            // Reset après un délai
            setTimeout(() => {
                isDoubleClick = false;
            }, 300);
        });
        
        // Gestion des tooltips pour les slots d'équipement
        slot.addEventListener('mouseenter', function() {
            const slotType = this.dataset.slot;
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

// Fonction pour mettre à jour l'affichage des stats
function updateStatsDisplay() {
    if (typeof player === 'undefined') return;
    
    const stats = ['force', 'intelligence', 'agilite', 'defense', 'chance'];
    stats.forEach(stat => {
        // Mettre à jour la valeur
        const valueElement = document.getElementById(`stat-${stat}`);
        if (valueElement && player[stat] !== undefined) {
            valueElement.textContent = player[stat];
        }
        
        // Mettre à jour la barre d'XP (sauf pour chance)
        if (stat !== 'chance') {
            const xpElement = document.getElementById(`stat-${stat}-xp`);
            const xpTextElement = document.getElementById(`stat-${stat}-xp-text`);
            const xpToNextElement = document.getElementById(`stat-${stat}-xp-to-next`);
            
            if (xpElement && xpTextElement) {
                const currentXP = player[stat + 'Xp'] || 0;
                const xpToNext = player[stat + 'XpToNext'] || 10;
                const ratio = currentXP / xpToNext;
                
                xpElement.style.width = (ratio * 100) + '%';
                xpTextElement.textContent = `${currentXP}/${xpToNext}`;
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
    const stats = ['force', 'intelligence', 'agilite', 'defense', 'chance', 'vitesse'];
    
    stats.forEach(stat => {
        const valueElement = document.getElementById(`stat-${stat}-modal`);
        const xpFillElement = document.getElementById(`stat-${stat}-xp-modal`);
        const xpTextElement = document.getElementById(`stat-${stat}-xp-text-modal`);
        const minusBtn = document.querySelector(`[data-stat="${stat}"].stat-minus`);
        const plusBtn = document.querySelector(`[data-stat="${stat}"].stat-plus`);
        
        if (valueElement) valueElement.textContent = player[stat];
        
        // Gestion des boutons
        if (minusBtn) minusBtn.disabled = player[stat] <= 1;
        if (plusBtn) plusBtn.disabled = player.statPoints <= 0;
        
        if (stat === 'chance' || stat === 'vitesse') {
            if (xpTextElement) xpTextElement.textContent = stat === 'chance' ? "Équipement" : "Caractéristiques";
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
    
    // Trouver un slot vide
    const emptySlot = inventory.findIndex(slot => slot.item === null);
    if (emptySlot === -1) {
        console.error("Inventaire plein !");
        return false;
    }
    
    // Ajouter l'item
    inventory[emptySlot] = {
        item: item,
        category: category
    };
    
    console.log(`Item ${item.name} ajouté à l'inventaire`);
    updateInventoryGrid("all");
    return true;
}

// Fonction pour gérer le clic sur un item
function handleItemClick(item, slotIndex) {
    console.log(`Clic sur ${item.name}`);
    
    if (item.type === 'coiffe' || item.type === 'cape' || item.type === 'amulette' || item.type === 'anneau' || item.type === 'ceinture' || item.type === 'bottes') {
        // Équiper la coiffe, la cape, l'amulette, l'anneau, la ceinture ou les bottes
        if (equipItem(item.id)) {
            // Retirer l'item de l'inventaire et décaler les autres
            inventory.splice(slotIndex, 1);
            inventory.push({ item: null, category: null }); // Ajouter un slot vide à la fin
            updateInventoryGrid("all");
            updateEquipmentDisplay();
            updateStatsDisplay();
            console.log(`${item.name} équipées !`);
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
            // Remettre l'item dans l'inventaire
            addItemToInventory(equippedItem.id, 'equipement');
            updateEquipmentDisplay();
            updateStatsDisplay();
            console.log(`${equippedItem.name} déséquipée !`);
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
        // Remplir les informations
        document.getElementById('equipment-name').textContent = 'ÉQUIPEMENT';
        document.getElementById('equipment-type').textContent = item.type.toUpperCase();
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
        
        // Vérifier si l'item est déjà équipé
        const isEquipped = isItemEquipped(item);
        
        if (isEquipped) {
            equipButton.style.display = 'none';
            unequipButton.style.display = 'inline-block';
        } else {
            equipButton.style.display = 'inline-block';
            unequipButton.style.display = 'none';
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
                    inventory[currentEquipmentDetailIndex] = { item: null, category: null };
                    updateInventoryGrid("all");
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
                // Remettre l'item dans l'inventaire
                addItemToInventory(currentEquipmentDetailItem.id, 'equipement');
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
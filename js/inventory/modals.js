// Variables globales pour la fenêtre détaillée
let currentEquipmentDetailItem = null;
let currentEquipmentDetailIndex = null;
let currentEquipmentDetailCategory = 'all';
window.currentEquipmentDetailCategory = currentEquipmentDetailCategory;
let clickTimeout = null;

// Variables pour le déplacement de la fenêtre
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Fonction pour afficher la fenêtre détaillée de l'équipement
function showEquipmentDetailModal(item, slotIndex, category = 'all') {
    currentEquipmentDetailItem = item;
    currentEquipmentDetailIndex = slotIndex;
    currentEquipmentDetailCategory = category;
    window.currentEquipmentDetailCategory = category;
    
    try {
        // Déterminer la catégorie de l'item
        let category = 'ÉQUIPEMENT';
        if (item.type === 'ressource' || item.category === 'ressource' || item.id === 'patte_corbeau' || item.id === 'plume_corbeau') {
            category = 'RESSOURCES';
        } else if (item.type === 'consommable' || item.category === 'potion' || (item.id && item.id.includes('potion'))) {
            category = 'POTIONS';
        }
        
        // Remplir les informations
        document.getElementById('equipment-name').textContent = category;
        
        // Déterminer le type d'affichage
        let displayType = item.type.toUpperCase();
        if (item.id === 'plume_corbeau') {
            displayType = 'PLUME';
        } else if (item.id === 'patte_corbeau') {
            displayType = 'PATTES';
        } else if (item.id === 'certificat_corbeau') {
            displayType = 'OBJET SPÉCIAL';
        } else if (item.type === 'consommable' || item.category === 'potion') {
            displayType = 'POTION';
        }
        
        document.getElementById('equipment-type').textContent = displayType;
        document.getElementById('equipment-rarity').textContent = item.rarity ? item.rarity.toUpperCase() : 'COMMUNE';
        
        // Afficher le niveau requis
        if (item.levelRequired) {
            document.getElementById('equipment-level').textContent = `Niveau ${item.levelRequired}`;
            document.getElementById('equipment-level').parentElement.style.display = 'flex';
        } else {
            document.getElementById('equipment-level').parentElement.style.display = 'none';
        }
        
        // Description simple pour les potions
        let description = item.description || '';
        
        // Pour les potions, garder la description simple dans le descriptif
        if (item.type === 'consommable' || item.category === 'potion' || item.type === 'potion') {
            // Utiliser seulement la description de base
            if (!description) {
                description = item.shortDescription || 'Une potion magique aux propriétés curatives.';
            }
            
            // Ajouter seulement les instructions d'utilisation
            description += '\n\n🖱️ Double-clic pour utiliser la potion';
            
            // Ajouter des conseils d'utilisation
            if (item.rarity === 'common') {
                description += '\n💡 Conseil: Idéal pour les combats de faible intensité';
            }
        }
        
        document.getElementById('equipment-description').textContent = description;
        
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
        
        // Pour les potions, afficher les statistiques spécifiques
        if (item.type === 'consommable' || item.category === 'potion' || item.type === 'potion') {
            // Afficher les points de vie restaurés dans la stat "Vie"
            if (item.healAmount || (item.stats && item.stats.soin)) {
                const healAmount = item.healAmount || item.stats.soin;
                document.getElementById('equipment-vie').parentElement.style.display = 'flex';
                document.getElementById('equipment-vie').textContent = `💚 +${healAmount} PV`;
            }
            
            // Afficher le cooldown dans la stat "Vitesse" (temps de recharge)
            if (item.cooldown) {
                document.getElementById('equipment-vitesse').parentElement.style.display = 'flex';
                document.getElementById('equipment-vitesse').textContent = `${item.cooldown / 1000}s CD`;
            }
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
        
        // Afficher dans le panneau inline AU LIEU de la modal séparée
        renderInlineDetailPanel(item, category);
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
    if (!window.equippedItems) return false;
    return Object.values(window.equippedItems).some(equippedItem => 
        equippedItem && equippedItem.id === item.id
    );
}

// Exporter les fonctions
window.showEquipmentDetailModal = showEquipmentDetailModal;
window.closeEquipmentDetailModal = closeEquipmentDetailModal;
window.closeInventory = closeInventory; 

// ----- Nouveau: panneau de détails inline dans l'inventaire -----
function renderInlineDetailPanel(item, categoryLabel) {
    const panel = document.getElementById('inline-detail-panel');
    if (!panel) return;
    try {
        // Titre et catégorie
        document.getElementById('inline-detail-title').textContent = item.name || 'Détails';
        let cat = 'ÉQUIPEMENT';
        if (item.type === 'ressource' || item.category === 'ressource') cat = 'RESSOURCES';
        else if (item.type === 'consommable' || item.category === 'potion' || (item.id && item.id.includes('potion'))) cat = 'POTIONS';
        document.getElementById('inline-equipment-name').textContent = cat;

        // Type et rareté
        let displayType = (item.type || '').toUpperCase();
        if (item.id === 'plume_corbeau') displayType = 'PLUME';
        else if (item.id === 'patte_corbeau') displayType = 'PATTES';
        else if (item.id === 'certificat_corbeau') displayType = 'OBJET SPÉCIAL';
        else if (item.type === 'consommable' || item.category === 'potion') displayType = 'POTION';
        document.getElementById('inline-equipment-type').textContent = displayType || '-';
        document.getElementById('inline-equipment-rarity').textContent = item.rarity ? item.rarity.toUpperCase() : 'COMMUNE';

        // Image (si disponible)
        const imgEl = document.getElementById('inline-detail-image');
        if (imgEl) {
            let iconSrc = '';
            if (item.icon && typeof item.icon === 'string') {
                iconSrc = item.icon
                  .replace('assets/capecorbeau.png', 'assets/equipements/capes/capecorbeau.png')
                  .replace('assets/bottecorbeau.png', 'assets/equipements/bottes/bottecorbeau.png')
                  .replace('assets/anneaucorbeau.png', 'assets/equipements/anneaux/anneaucorbeau.png')
                  .replace('assets/colliercorbeau.png', 'assets/equipements/colliers/colliercorbeau.png');
            }
            if (iconSrc) {
                imgEl.src = iconSrc;
                imgEl.style.display = 'block';
                imgEl.alt = item.name || 'aperçu';
            } else {
                imgEl.style.display = 'none';
            }
        }

        // Niveau requis
        const levelRow = document.getElementById('inline-level-row');
        if (item.levelRequired) {
            document.getElementById('inline-equipment-level').textContent = `Niveau ${item.levelRequired}`;
            levelRow.style.display = 'flex';
        } else {
            levelRow.style.display = 'none';
        }

        // Stats visibles uniquement si présentes
        const stats = item.stats || {};
        const map = [
          ['force','inline-force-row','inline-equipment-force'],
          ['intelligence','inline-intelligence-row','inline-equipment-intelligence'],
          ['agilite','inline-agilite-row','inline-equipment-agilite'],
          ['defense','inline-defense-row','inline-equipment-defense'],
          ['vie','inline-vie-row','inline-equipment-vie'],
          ['chance','inline-chance-row','inline-equipment-chance'],
          ['vitesse','inline-vitesse-row','inline-equipment-vitesse']
        ];
        map.forEach(([key,rowId,valId]) => {
            const row = document.getElementById(rowId);
            if (stats[key]) {
                row.style.display = 'flex';
                document.getElementById(valId).textContent = `+${stats[key]}`;
            } else {
                row.style.display = 'none';
            }
        });

        // Description
        let description = item.description || '';
        if ((item.type === 'consommable' || item.category === 'potion') && !description) {
            description = item.shortDescription || 'Une potion magique aux propriétés curatives.';
        }
        document.getElementById('inline-equipment-description').textContent = description || '';

        // ----- Section Panoplie -----
        const setSection = document.getElementById('inline-set-section');
        const setTitle = document.getElementById('inline-set-title');
        const setProgress = document.getElementById('inline-set-progress');
        const setTabs = document.getElementById('inline-set-tabs');
        const setBonuses = document.getElementById('inline-set-bonuses');
        const setItems = document.getElementById('inline-set-items');
        // Déterminer le setId soit depuis l'item, soit par appartenance
        let effectiveSetId = (item && item.setId) ? item.setId : null;
        if (!effectiveSetId && window.equipmentSets) {
            for (const sid in window.equipmentSets) {
                const def = window.equipmentSets[sid];
                if (def && Array.isArray(def.itemIds) && def.itemIds.includes(item.id)) {
                    effectiveSetId = sid; break;
                }
            }
        }
        if (effectiveSetId && window.equipmentSets && window.equipmentSets[effectiveSetId]) {
            const def = window.equipmentSets[effectiveSetId];
            setSection.style.display = 'block';
            setTitle.textContent = def.name || 'Panoplie';
            const total = def.itemIds ? def.itemIds.length : 0;
            // compter items équipés de ce set
            let equippedCount = 0;
            if (window.equippedItems) {
                Object.values(window.equippedItems).forEach(eq => {
                    if (!eq) return;
                    const eqSetId = eq.setId || (def.itemIds && def.itemIds.includes(eq.id) ? effectiveSetId : null);
                    if (eqSetId === effectiveSetId) equippedCount++;
                });
            }
            setProgress.textContent = `${equippedCount}/${total}`;

            // Tabs par palier
            setTabs.innerHTML = '';
            const thresholds = Object.keys(def.thresholds || {}).map(n => parseInt(n,10)).sort((a,b)=>a-b);
            // Choisir le palier par défaut = plus grand palier atteint, sinon le premier
            let defaultTh = thresholds[0] || 0;
            for (let i = thresholds.length - 1; i >= 0; i--) {
                if (equippedCount >= thresholds[i]) { defaultTh = thresholds[i]; break; }
            }
            thresholds.forEach(th => {
                const tab = document.createElement('div');
                tab.className = 'inline-set-tab' + (th === defaultTh ? ' active' : '');
                tab.textContent = `${th} item${th>1?'s':''}`;
                tab.dataset.th = String(th);
                tab.addEventListener('click', () => {
                    // activer visuellement ce tab uniquement
                    Array.from(setTabs.children).forEach(ch => ch.classList.remove('active'));
                    tab.classList.add('active');
                    renderSetBonusList(def, th, equippedCount);
                });
                setTabs.appendChild(tab);
            });
            // Bonus par défaut: palier atteint le plus élevé (ou premier si aucun atteint)
            setBonuses.innerHTML = '';
            if (thresholds.length > 0) {
                renderSetBonusList(def, defaultTh, equippedCount);
            }

            // Liste des items de la panoplie + tick si équipé
            setItems.innerHTML = '';
            (def.itemIds || []).forEach(id => {
                const it = window.equipmentDatabase ? window.equipmentDatabase[id] : null;
                const div = document.createElement('div');
                const isEquipped = (it && it.slot && window.equippedItems && window.equippedItems[it.slot] && window.equippedItems[it.slot].id === id);
                div.className = 'inline-set-item' + (isEquipped ? ' equipped' : '');
                div.textContent = (it && it.name) ? `✓ ${it.name}` : `• ${id}`;
                setItems.appendChild(div);
            });
        } else {
            // Si l'item n'a pas setId, masquer
            setSection.style.display = 'none';
        }

        // Boutons d’action (masqués pour ressources)
        const inlineEquip = document.getElementById('inline-equip-button');
        const inlineUnequip = document.getElementById('inline-unequip-button');
        if (cat === 'RESSOURCES') {
            inlineEquip.style.display = 'none';
            inlineUnequip.style.display = 'none';
        } else {
            const isEquipped = isItemEquipped(item);
            inlineEquip.style.display = isEquipped ? 'none' : 'inline-block';
            inlineUnequip.style.display = isEquipped ? 'inline-block' : 'none';
        }

        // Afficher le panneau
        panel.style.display = 'block';
    } catch (err) {
        console.error('Erreur renderInlineDetailPanel:', err);
    }
}

// Fermer le panneau inline
function closeInlineDetailPanel() {
    const panel = document.getElementById('inline-detail-panel');
    if (panel) panel.style.display = 'none';
}

// Actions inline (robuste si DOM déjà prêt)
function attachInlineDetailHandlers() {
  const closeBtn = document.getElementById('inline-detail-close');
  if (closeBtn && !closeBtn.dataset.bound) {
    closeBtn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); closeInlineDetailPanel(); });
    closeBtn.dataset.bound = 'true';
  }
  const equipBtn = document.getElementById('inline-equip-button');
  if (equipBtn && !equipBtn.dataset.bound) {
    equipBtn.addEventListener('click', function(){
      if (currentEquipmentDetailItem && typeof equipItem === 'function') {
        const ok = equipItem(currentEquipmentDetailItem.id);
        if (ok) {
          // Retirer l'item de la grille source si on venait d'une grille
          if (currentEquipmentDetailIndex !== null && typeof window.removeSpecificItemFromInventory === 'function') {
            const cat = (typeof window.currentEquipmentDetailCategory !== 'undefined') ? window.currentEquipmentDetailCategory : 'all';
            window.removeSpecificItemFromInventory(
              currentEquipmentDetailItem,
              currentEquipmentDetailIndex,
              cat
            );
          }
          if (typeof window.updateAllGrids === 'function') window.updateAllGrids();
          if (typeof window.updateEquipmentDisplay === 'function') window.updateEquipmentDisplay();
          if (typeof window.updateStatsDisplay === 'function') window.updateStatsDisplay();
          // Réactualiser la fiche pour refléter l'état équipé
          renderInlineDetailPanel(currentEquipmentDetailItem);
        }
      }
    });
    equipBtn.dataset.bound = 'true';
  }
  const unequipBtn = document.getElementById('inline-unequip-button');
  if (unequipBtn && !unequipBtn.dataset.bound) {
    unequipBtn.addEventListener('click', function(){
      if (currentEquipmentDetailItem && currentEquipmentDetailItem.slot && typeof unequipItem === 'function') {
        const ok = unequipItem(currentEquipmentDetailItem.slot);
        if (ok) {
          // Remettre l'item dans l'inventaire (comme l'ancienne modal)
          if (Array.isArray(window.inventoryEquipement)) {
            const emptyEquip = window.inventoryEquipement.findIndex(s => s.item === null);
            if (emptyEquip !== -1) {
              window.inventoryEquipement[emptyEquip] = { item: currentEquipmentDetailItem, category: 'equipement' };
            }
          }
          if (Array.isArray(window.inventoryAll)) {
            const emptyAll = window.inventoryAll.findIndex(s => s.item === null);
            if (emptyAll !== -1) {
              window.inventoryAll[emptyAll] = { item: currentEquipmentDetailItem, category: 'equipement' };
            }
          }
          if (typeof window.reorganizeInventory === 'function') {
            if (Array.isArray(window.inventoryEquipement)) window.reorganizeInventory(window.inventoryEquipement);
            if (Array.isArray(window.inventoryAll)) window.reorganizeInventory(window.inventoryAll);
          }
          if (typeof window.updateAllGrids === 'function') window.updateAllGrids();
          if (typeof window.updateEquipmentDisplay === 'function') window.updateEquipmentDisplay();
          if (typeof window.updateStatsDisplay === 'function') window.updateStatsDisplay();
          renderInlineDetailPanel(currentEquipmentDetailItem);
        }
      }
    });
    unequipBtn.dataset.bound = 'true';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachInlineDetailHandlers);
} else {
  attachInlineDetailHandlers();
}

// Délégation de secours: si jamais le bouton est recréé
document.addEventListener('click', function(e){
  if (e.target && e.target.id === 'inline-detail-close') {
    e.preventDefault(); e.stopPropagation(); closeInlineDetailPanel();
  }
});

// Délégation: ouvrir la fiche en cliquant sur un slot équipé, même après re-render
document.addEventListener('click', function(e){
  const slotEl = e.target.closest && e.target.closest('.equip-slot');
  if (!slotEl) return;
  const slotType = slotEl.dataset.slot;
  if (!slotType || typeof window.getItemInSlot !== 'function') return;
  const eqItem = window.getItemInSlot(slotType);
  if (eqItem && typeof window.showEquipmentDetailModal === 'function') {
    try { window.showEquipmentDetailModal(eqItem, null, 'equipement'); } catch(_){}
  }
});

// Rendu d'une liste de bonus pour un palier donné
function renderSetBonusList(def, threshold, equippedCount) {
  const setBonuses = document.getElementById('inline-set-bonuses');
  if (!setBonuses) return;
  setBonuses.innerHTML = '';
  const b = (def.thresholds || {})[threshold];
  if (!b) return;
  const row = document.createElement('div');
  row.className = 'inline-bonus-row' + (equippedCount >= threshold ? '' : ' inactive');
  // Badges d'icônes alignés à gauche (sans label)
  const badges = document.createElement('div');
  badges.className = 'inline-bonus-badges';
  const iconMap = {
    force: '💪', intelligence: '🧠', agilite: '⚡', defense: '🛡️', chance: '🍀', vitesse: '🏃', vie: '❤️'
  };
  for (const k in b) {
    const pill = document.createElement('div');
    pill.className = 'bonus-pill';
    const ic = document.createElement('span'); ic.className = 'bonus-icon'; ic.textContent = iconMap[k] || '⭐';
    const tx = document.createElement('span'); tx.textContent = `+${b[k]}`;
    pill.appendChild(ic); pill.appendChild(tx);
    badges.appendChild(pill);
  }
  row.appendChild(badges);
  setBonuses.appendChild(row);
}
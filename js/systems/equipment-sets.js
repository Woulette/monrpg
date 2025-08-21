// Définition des panoplies et calcul des bonus actifs

// Exemples de structures de panoplie; à étendre selon le contenu du jeu
// thresholds: palier -> stats à ajouter quand le palier est atteint (cumulatif)
window.equipmentSets = {
  panoplie_slime: {
    name: 'Panoplie Slime',
    itemIds: ['coiffe_slime', 'cape_slime', 'bottes_slime', 'anneau_slime', 'collier_slime', 'ceinture_slime'],
    thresholds: {
      2: { vie: 20 },
      3: { vie: 20, force: 5 },
      4: { vie: 30, force: 5, chance:10 },
      5: { vie: 30, force: 5, chance:10, agilite: 5 },
      6: { vie: 50, force: 10, chance:20, agilite: 10  }
    }
  }
  ,
  panoplie_corbeau: {
    name: 'Panoplie Corbeau',
    itemIds: ['coiffe_corbeau', 'cape_corbeau', 'anneau_corbeau', 'amulette_corbeau', 'ceinture_corbeau', 'bottes_corbeau'],
    thresholds: {
      2: { agilite: 2 },
      3: { defense: 2, agilite: 2, vie: 10},
      4: { intelligence: 2, agilite: 2,defense: 2, vie: 10},
      5: { force: 2, intelligence: 2, agilite: 2, defense: 2, vie: 10 },
      6: { vie: 20, chance: 2, force: 2, intelligence: 2, agilite: 2, defense: 2, }
    }
  }
};

// Calcule, pour l'équipement courant, les bonus cumulés par panoplie
function recalculateSetBonuses(equippedItems) {
  const bonuses = { force: 0, intelligence: 0, agilite: 0, defense: 0, chance: 0, vitesse: 0, vie: 0 };
  const countsBySet = {};

  if (!equippedItems) return bonuses;

  // Compter combien d'items par panoplie
  Object.values(equippedItems).forEach(item => {
    if (!item) return;
    const setId = item.setId;
    // fallback: si l'item n'a pas setId mais appartient à un set par son id
    if (!setId && window.equipmentSets) {
      for (const sid in window.equipmentSets) {
        const def = window.equipmentSets[sid];
        if (def && Array.isArray(def.itemIds) && def.itemIds.includes(item.id)) {
          countsBySet[sid] = (countsBySet[sid] || 0) + 1;
          return;
        }
      }
    } else if (setId) {
      countsBySet[setId] = (countsBySet[setId] || 0) + 1;
    }
  });

  // Appliquer UNIQUEMENT le plus haut palier atteint par panoplie (non cumulatif)
  for (const setId in countsBySet) {
    const count = countsBySet[setId];
    const setDef = window.equipmentSets[setId];
    if (!setDef || !setDef.thresholds) continue;
    const thresholds = Object.keys(setDef.thresholds).map(n => parseInt(n, 10)).sort((a,b) => a-b);
    let bestTh = 0;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (count >= thresholds[i]) { bestTh = thresholds[i]; break; }
    }
    if (bestTh > 0) {
      const thBonus = setDef.thresholds[bestTh];
      for (const k in thBonus) {
        bonuses[k] = (bonuses[k] || 0) + (thBonus[k] || 0);
      }
    }
  }

  return bonuses;
}

// Appliquer ces bonus au joueur (mêmes règles que applyEquipmentStats)
function applySetBonusesToPlayer(bonuses) {
  if (!bonuses) return;
  if (bonuses.vie) player.maxLife += bonuses.vie;
  if (bonuses.force) player.equipForce += bonuses.force;
  if (bonuses.agilite) player.equipAgilite += bonuses.agilite;
  if (bonuses.defense) player.equipDefense += bonuses.defense;
  if (bonuses.chance) player.equipChance += bonuses.chance;
  if (bonuses.intelligence) player.equipIntelligence += bonuses.intelligence;
  if (bonuses.vitesse) player.equipVitesse += bonuses.vitesse;
}

// Exposer
window.recalculateSetBonuses = recalculateSetBonuses;
window.applySetBonusesToPlayer = applySetBonusesToPlayer;



// Définition minimale des tables de loot côté serveur (alignées avec le client)

const lootTables = {
  crow: {
    resources: [
      { id: 'patte_corbeau', chance: 40, minQuantity: 1, maxQuantity: 1 },
      { id: 'plume_corbeau', chance: 60, minQuantity: 1, maxQuantity: 2 },
    ],
    pecka: { chance: 80, minAmount: 3, maxAmount: 8 },
  },
  corbeauelite: {
    resources: [
      { id: 'certificat_corbeau', chance: 100, minQuantity: 1, maxQuantity: 1 },
    ],
    pecka: { chance: 100, minAmount: 10, maxAmount: 20 },
  },
  slime: {
    resources: [
      { id: 'geleeslime', chance: 30, minQuantity: 1, maxQuantity: 1 },
      { id: 'noyauslime', chance: 30, minQuantity: 1, maxQuantity: 1 },
      { id: 'mucusslime', chance: 30, minQuantity: 1, maxQuantity: 1 },
    ],
    pecka: { chance: 50, minAmount: 10, maxAmount: 18 },
  },
  aluineeks: {
    resources: [
      { id: 'osdeneeks', chance: 20, minQuantity: 1, maxQuantity: 1 },
      { id: 'cranedeneeks', chance: 20, minQuantity: 1, maxQuantity: 1 },
      { id: 'particule', chance: 5, minQuantity: 1, maxQuantity: 1 },
    ],
    pecka: { chance: 80, minAmount: 5, maxAmount: 12 },
  },
};

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Conversion de Chance → multiplicateur de chance. Ajustable sans casser la logique
function applyLuck(baseChance, playerChance) {
  const scale = 0.001; // 0.1% par point de Chance (ex: 1000 → x2)
  const effective = baseChance * (1 + Math.max(0, Number(playerChance || 0)) * scale);
  return Math.min(100, effective);
}

// Générer le loot pour UN joueur (indépendamment) selon un facteur (1.0 pour tagueur, 0.5 pour actif non-tagueur)
function generateLootForPlayer(monsterType, playerChance, factor) {
  const table = lootTables[monsterType];
  const result = { resources: [], pecka: 0 };
  if (!table) return result;

  // Ressources
  for (const res of table.resources) {
    const effChance = applyLuck(res.chance * factor, playerChance);
    if (Math.random() * 100 < effChance) {
      const qtyBase = randInt(res.minQuantity, res.maxQuantity);
      const qty = Math.max(1, Math.floor(qtyBase * factor));
      if (qty > 0) result.resources.push({ id: res.id, quantity: qty });
    }
  }

  // Pecka
  if (table.pecka) {
    const effChance = Math.min(100, table.pecka.chance * factor); // la Chance perso n'influence pas la pecka (optionnel)
    if (Math.random() * 100 < effChance) {
      const amountBase = randInt(table.pecka.minAmount, table.pecka.maxAmount);
      const amount = Math.max(1, Math.floor(amountBase * factor));
      result.pecka = amount;
    }
  }

  return result;
}

module.exports = { generateLootForPlayer };



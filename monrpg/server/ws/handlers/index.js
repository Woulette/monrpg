const { handleChatMessage } = require('./chat');
const { handleDungeonMessage } = require('./dungeon');
const { handlePlayerMessage } = require('./players');
const { handleMonstersMessage } = require('./monsters');

function handleWsMessage(ctx, data) {
  if (!data || !data.type) return false;
  // Chat
  if (handleChatMessage(ctx, data) === true) return true;
  // Donjon
  if (handleDungeonMessage(ctx, data) === true) return true;
  // Joueurs
  if (handlePlayerMessage(ctx, data) === true) return true;
  // Monstres (partiel)
  if (handleMonstersMessage(ctx, data) === true) return true;
  return false;
}

module.exports = { handleWsMessage };



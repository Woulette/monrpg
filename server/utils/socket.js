// Contexte partagé pour utilitaires WS
let context = { wss: null, players: null };

function setWsContext({ wss, players }) {
  context.wss = wss;
  context.players = players;
}

function getSocketByPlayerId(playerId) {
  if (!context.wss || !context.players) return null;
  for (const client of context.wss.clients) {
    if (client.readyState === 1 && context.players.has(client)) {
      const pdata = context.players.get(client);
      if (pdata && pdata.id === playerId) return client;
    }
  }
  return null;
}

function broadcastToParty(partyId, message) {
  // Cette fonction nécessite que le module party fournisse l'itération; ici on expose juste utilitaires
  // On laisse party.js appeler getSocketByPlayerId pour chaque membre
  // Ce wrapper est ici pour compat si besoin futur
  return { partyId, message };
}

module.exports = { setWsContext, getSocketByPlayerId, broadcastToParty };



function handleChatMessage(ctx, data) {
  const { wss, players, playerData, socket, getSocketByPlayerId, getPartyForPlayerId } = ctx;
  if (!data || !data.type) return false;
  if (data.type === 'chat_global') {
    const text = (data.text || '').toString().slice(0, 200);
    if (!text) return true;
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'chat_global', data: { from: playerData.name, text } }));
      }
    });
    return true;
  }
  if (data.type === 'chat_party') {
    const text = (data.text || '').toString().slice(0, 200);
    if (!text) return true;
    const party = ctx.getPartyForPlayerId(playerData.id);
    if (!party) return true;
    party.members.forEach(pid => {
      const sock = ctx.getSocketByPlayerId(pid);
      if (sock && sock.readyState === 1) {
        sock.send(JSON.stringify({ type: 'chat_party', data: { from: playerData.name, text } }));
      }
    });
    return true;
  }
  return false;
}

module.exports = { handleChatMessage };



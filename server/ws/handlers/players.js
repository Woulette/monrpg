function handlePlayerMessage(ctx, data) {
  if (!data || !data.type) return false;
  const { players, playerData, socket, broadcastToMap } = ctx;

  if (data.type === 'player_update') {
    playerData.x = data.data.x;
    playerData.y = data.data.y;
    playerData.direction = data.data.direction;
    
    // Diffuser dans l'instance si applicable
    if (playerData.map.startsWith('mapdonjon') && playerData.dungeonInstance && playerData.dungeonInstance[playerData.map]) {
      const instId = playerData.dungeonInstance[playerData.map];
      if (typeof ctx.broadcastToMapInstance === 'function') {
        ctx.broadcastToMapInstance(playerData.map, instId, {
          type: 'player_moved',
          data: { id: playerData.id, x: playerData.x, y: playerData.y, direction: playerData.direction }
        }, socket);
      } else {
        broadcastToMap(playerData.map, {
          type: 'player_moved',
          data: { id: playerData.id, x: playerData.x, y: playerData.y, direction: playerData.direction }
        }, socket);
      }
    } else {
      broadcastToMap(playerData.map, {
        type: 'player_moved',
        data: { id: playerData.id, x: playerData.x, y: playerData.y, direction: playerData.direction }
      }, socket);
    }
    return true;
  }

  if (data.type === 'player_name') {
    const oldName = playerData.name;
    playerData.name = data.name;
    players.set(socket, playerData);
    // notifier la carte
    broadcastToMap(playerData.map, { type: 'player_joined', data: playerData }, socket);
    // envoyer liste mise à jour (noms personnalisés) à tous de la carte et au joueur
    const updatedMapPlayers = Array.from(players.values())
      .filter(p => p.id !== playerData.id && p.map === playerData.map && !p.name.startsWith('Joueur_'));
    broadcastToMap(playerData.map, { type: 'other_players', data: updatedMapPlayers }, socket);
    try { socket.send(JSON.stringify({ type: 'other_players', data: updatedMapPlayers })); } catch(_) {}
    return true;
  }

  if (data.type === 'request_players') {
    const requestedMap = data.mapName || playerData.map;
    const mapPlayers = [];
    players.forEach((p) => {
      if (p.id === playerData.id || p.map !== requestedMap || p.name.startsWith('Joueur_')) return;
      
      // Vérifier si on est dans la même instance de donjon
      if (requestedMap.startsWith('mapdonjon')) {
        const myInst = playerData.dungeonInstance && playerData.dungeonInstance[requestedMap];
        const theirInst = p.dungeonInstance && p.dungeonInstance[requestedMap];
        if (myInst !== theirInst) return; // Instance différente
      }
      
      mapPlayers.push(p);
    });
    try { socket.send(JSON.stringify({ type: 'other_players', data: mapPlayers })); } catch(_) {}
    return true;
  }

  return false;
}

module.exports = { handlePlayerMessage };



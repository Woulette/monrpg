// Système multijoueur pour MonRPG
// Version séparée et organisée

class MultiplayerManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.otherPlayers = new Map();
        this.playerId = null;
        this.currentMap = 'map1';
        
        // Configuration
        this.serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'ws://localhost:3001' 
            : 'wss://monrpg.onrender.com'; // URL de votre serveur Render
        this.updateInterval = null;
        
        console.log('🎮 Système multijoueur initialisé');
    }
    
    // Se connecter au serveur
    connect() {
        try {
            this.socket = new WebSocket(this.serverUrl);
            
            this.socket.onopen = () => {
                console.log('✅ Connecté au serveur multijoueur');
                this.connected = true;
                
                // Envoyer le nom du personnage avec un petit délai pour s'assurer qu'il est disponible
                setTimeout(() => {
                    this.sendPlayerName();
                }, 100);
                
                // Activer la synchronisation des monstres
                if (typeof enableMonsterSync === "function") {
                    enableMonsterSync();
                }
                
                // S'assurer que la carte actuelle est synchronisée
                if (window.currentMap && this.currentMap !== window.currentMap) {
                    this.currentMap = window.currentMap;
                    console.log(`🗺️ Synchronisation de la carte: ${this.currentMap}`);
                }
                
                this.startPositionUpdates();

                // Demander l'état des monstres morts pour la carte courante
                try {
                    this.socket.send(JSON.stringify({ type: 'request_dead_monsters', mapName: this.currentMap }));
                } catch(_) {}
            };
            
            this.socket.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };
            
            this.socket.onclose = () => {
                console.log('❌ Déconnecté du serveur multijoueur');
                this.connected = false;
                this.otherPlayers.clear();
                this.stopPositionUpdates();
                
                // Désactiver la synchronisation des monstres
                if (typeof disableMonsterSync === "function") {
                    disableMonsterSync();
                }
            };
            
            this.socket.onerror = (error) => {
                console.error('❌ Erreur de connexion:', error);
            };
            
        } catch (error) {
            console.error('❌ Impossible de se connecter:', error);
        }
    }
    
    // Gérer les messages reçus du serveur
    handleMessage(message) {
        switch(message.type) {
            case 'dungeon_progress': {
                const d = message.data || {};
                try {
                    if (d.map === 'mapdonjonslime' && typeof window.dungeonProgression !== 'undefined') {
                        if (typeof window.dungeonProgression.mapdonjonslime !== 'object') window.dungeonProgression.mapdonjonslime = {};
                        if (typeof d.slimesKilled === 'number') window.dungeonProgression.mapdonjonslime.slimesKilled = d.slimesKilled;
                        if (typeof d.portalUnlocked === 'boolean') window.dungeonProgression.mapdonjonslime.portalUnlocked = d.portalUnlocked;
                    }
                    if (d.map === 'mapdonjonslime2' && typeof window.dungeonProgression !== 'undefined') {
                        if (typeof window.dungeonProgression.mapdonjonslime2 !== 'object') window.dungeonProgression.mapdonjonslime2 = {};
                        if (typeof d.slimesKilled === 'number') window.dungeonProgression.mapdonjonslime2.slimesKilled = d.slimesKilled;
                        if (typeof d.decorRemoved === 'boolean') {
                            window.dungeonProgression.mapdonjonslime2.decorRemoved = d.decorRemoved;
                            if (d.decorRemoved && typeof window.removeMapdonjonslime2Decor === 'function') {
                                window.removeMapdonjonslime2Decor();
                            }
                        }
                    }
                } catch(_) {}
                break;
            }
            case 'party_invite': {
                // Affichage via UI non bloquante (pane HUD)
                const fromName = message.data?.fromName || 'Joueur';
                const partyId = message.data?.partyId;
                const fromId = message.data?.fromId;
                if (window.partyUi && typeof window.partyUi.addInvite === 'function') {
                    window.partyUi.addInvite(fromId, fromName, partyId);
                }
                break;
            }
            case 'party_update': {
                window.partyState = message.data || null;
                if (typeof window.partyRenderUpdate === 'function') window.partyRenderUpdate();
                break;
            }
            case 'party_disband': {
                window.partyState = null;
                if (typeof window.partyRenderUpdate === 'function') window.partyRenderUpdate();
                break;
            }
            case 'party_kicked': {
                window.partyState = null;
                if (typeof window.partyRenderUpdate === 'function') window.partyRenderUpdate();
                alert('Vous avez été exclu du groupe.');
                break;
            }
            case 'party_declined': {
                // Optionnel: feedback à l’invitant
                console.log('Invitation refusée par', message.data?.byName || message.data?.byId);
                break;
            }
            case 'party_member_hp': {
                if (!window.partyState) break;
                const { id, hp, maxHp } = message.data || {};
                if (!id) break;
                if (!window.partyHp) window.partyHp = new Map();
                window.partyHp.set(id, { hp, maxHp });
                if (typeof window.partyRenderUpdate === 'function') window.partyRenderUpdate();
                break;
            }
            case 'party_xp': {
                const amt = (message.data && message.data.amount) || 0;
                if (amt > 0 && typeof window.gainXP === 'function') {
                    window.gainXP(amt);
                    // Message flottant XP au-dessus du joueur
                    if (typeof window.showFloatingMessage === 'function' && typeof window.player !== 'undefined') {
                        window.showFloatingMessage(`+${amt} XP`, window.player.x, window.player.y - 1);
                    }
                }
                break;
            }
            case 'chat_global':
            case 'chat_party': {
                if (typeof window.__applyNetworkChatMessage === 'function') {
                    window.__applyNetworkChatMessage(message);
                }
                // Affichage bulle au-dessus du joueur émetteur si connu
                try {
                    const fromName = message.data?.from;
                    if (fromName && window.multiplayerManager) {
                        // Si c'est nous: éviter le doublon de bulle (on l'affiche déjà côté local)
                        if (fromName === (window.playerName || '')) break;
                        // Trouver le joueur dans otherPlayers
                        const other = Array.from(window.multiplayerManager.otherPlayers.values()).find(p => p.name === fromName);
                        if (other && typeof window.createFloatingBubbleForOther === 'function') {
                            window.createFloatingBubbleForOther(other.id, message.data?.text || '');
                        }
                    }
                } catch(_) {}
                break;
            }
            case 'loot_award': {
                const loot = message.data && message.data.loot;
                if (!loot) break;
                // Ajouter ressources
                if (loot.resources && Array.isArray(loot.resources)) {
                    loot.resources.forEach(entry => {
                        if (entry && entry.id && entry.quantity) {
                            if (typeof window.addResourceToInventory === 'function') {
                                window.addResourceToInventory(entry.id, entry.quantity);
                            }
                        }
                    });
                }
                // Ajouter pecka
                if (loot.pecka && window.player) {
                    window.player.pecka = (window.player.pecka || 0) + loot.pecka;
                    if (typeof window.updatePeckaDisplay === 'function') window.updatePeckaDisplay();
                }
                // Ouvrir/mettre à jour la fenêtre de loot agrégé
                if (typeof window.showLootWindow === 'function') window.showLootWindow(loot);
                break;
            }
            case 'player_connected':
                this.playerId = message.data.id;
                console.log('🎯 Mon ID:', this.playerId);
                break;
                
            case 'other_players':
                // Vider la liste actuelle et ajouter les nouveaux joueurs
                this.otherPlayers.clear();
                console.log(`📥 Réception de ${message.data.length} joueurs du serveur`);
                
                console.log(`📥 Données reçues du serveur:`);
                message.data.forEach(player => {
                    console.log(`  - Joueur reçu: ${player.name} (${player.id})`);
                });
                
                // Debug: vérifier si les noms sont corrects
                message.data.forEach(player => {
                    if (player.name && player.name.startsWith('Joueur_')) {
                        console.log(`⚠️ Nom par défaut détecté: ${player.name} (${player.id})`);
                    }
                });
                
                message.data.forEach(player => {
                    // Ne pas ajouter notre propre joueur à la liste des autres joueurs
                    if (player.id !== this.playerId) {
                        this.otherPlayers.set(player.id, player);
                        console.log(`  - Ajouté: ${player.name} (${player.id}) sur ${player.map} à (${player.x}, ${player.y})`);
                    } else {
                        console.log(`  - Ignoré: Notre propre joueur (${player.id})`);
                    }
                });
                
                console.log(`👥 ${this.otherPlayers.size} autres joueurs chargés sur cette carte`);
                break;

            case 'monster_list':
                if (Array.isArray(message.data)) {
                    const TILE = typeof TILE_SIZE === 'number' ? TILE_SIZE : 32;
                    window.monsters = message.data.map(m => {
                        const t = m.type;
                        const name = t === 'crow' ? 'Corbeau' : (t === 'cochon' ? 'Cochon' : (t === 'slime' ? 'Slime' : (t === 'slimeboss' ? 'SlimeBoss' : (t === 'aluineeks' ? 'Aluineeks' : t))));
                        const defaultMoveSpeed = (t === 'corbeauelite') ? 0.8 : (t === 'slimeboss') ? 0.8 : (t === 'slime') ? 0.5 : 0.5;
                        const defaultAnimDelay = (t === 'slime') ? 200 : (t === 'slimeboss') ? 150 : 120;
                        return {
                            id: m.id,
                            type: t,
                            name,
                            level: m.level || 1,
                            x: m.x, y: m.y,
                            px: m.x * TILE,
                            py: m.y * TILE,
                            hp: m.hp,
                            maxHp: m.maxHp,
                            xpValue: m.xpValue || 0,
                            force: m.force || 0,
                            defense: m.defense || 0,
                            respawnMs: m.respawnMs || 30000,
                            isDead: false,
                            deathTime: 0,
                            moving: false,
                            frame: 0,
                            state: 'idle',
                            moveTarget: { x: m.x, y: m.y },
                            movePath: [],
                            moveSpeed: defaultMoveSpeed,
                            animDelay: defaultAnimDelay,
                            lastAnim: 0,
                            moveCooldown: 0,
                            stuckSince: 0
                        };
                    });
                    if (typeof assignMonsterImages === 'function') assignMonsterImages();
                    console.log(`🐉 Liste des monstres chargée: ${window.monsters.length}`);
                }
                break;
                
            case 'player_joined':
                // Nouveau joueur rejoint
                // Ne pas ajouter notre propre joueur
                if (message.data.id !== this.playerId) {
                    this.otherPlayers.set(message.data.id, message.data);
                    console.log('👋 Nouveau joueur:', message.data.name);
                } else {
                    console.log('👋 Notre propre joueur rejoint (ignoré)');
                }
                break;
                
            case 'player_moved':
                // Mise à jour de position d'un autre joueur
                const player = this.otherPlayers.get(message.data.id);
                if (player) {
                    player.x = message.data.x;
                    player.y = message.data.y;
                    player.direction = message.data.direction;
                }
                break;
                
            case 'player_left':
                // Joueur parti
                const leftPlayerId = message.data.id;
                if (this.otherPlayers.has(leftPlayerId)) {
                    const leftPlayer = this.otherPlayers.get(leftPlayerId);
                    console.log(`👋 Joueur parti de cette carte: ${leftPlayer ? leftPlayer.name : 'Inconnu'} (${leftPlayerId})`);
                    this.otherPlayers.delete(leftPlayerId);
                } else {
                    console.log(`👋 Joueur parti de cette carte: ID ${leftPlayerId} (non trouvé dans la liste locale)`);
                }
                
                // Vérifier s'il y a des doublons de notre propre joueur
                this.otherPlayers.forEach((player, id) => {
                    if (player.id === this.playerId) {
                        console.log(`🧹 Suppression du doublon de notre joueur (ID: ${id})`);
                        this.otherPlayers.delete(id);
                    }
                });
                break;
                
                            case 'monster_updates':
                    // Recevoir les mises à jour des monstres d'autres joueurs
                    if (typeof window.monsterSyncManager !== 'undefined') {
                        window.monsterSyncManager.handleMonsterUpdates(message.data);
                    }
                    break;
                    
                case 'monster_attack':
                    // Recevoir une attaque d'un autre joueur
                    if (typeof window.monsterSyncManager !== 'undefined') {
                        window.monsterSyncManager.handleMonsterAttack(message.data);
                    }
                    break;

                case 'monster_hp':
                    if (Array.isArray(window.monsters)) {
                        const m = window.monsters.find(mm => mm.id === message.data.id);
                        if (m) {
                            m.hp = Math.max(0, message.data.hp);
                        }
                    }
                    break;

                case 'monster_positions':
                    if (Array.isArray(window.monsters) && Array.isArray(message.data)) {
                        const TILE = typeof TILE_SIZE === 'number' ? TILE_SIZE : 32;
                        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
                        const INTERP_MS = 180; // petit buffer pour lisser le mouvement
                        message.data.forEach(pos => {
                            const m = window.monsters.find(mm => mm.id === pos.id);
                            if (m) {
                                // Préparer une interpolation fluide vers la nouvelle case
                                m.prevPx = (typeof m.px === 'number') ? m.px : pos.x * TILE;
                                m.prevPy = (typeof m.py === 'number') ? m.py : pos.y * TILE;
                                m.nextPx = pos.x * TILE;
                                m.nextPy = pos.y * TILE;
                                m.lerpStart = now;
                                m.lerpEnd = now + INTERP_MS;
                                // Maintenir la position logique cible
                                m.x = pos.x;
                                m.y = pos.y;
                                m.moveTarget = { x: pos.x, y: pos.y };
                                // Marquer en mouvement pendant l'interpolation pour éviter les snaps
                                m.moving = true;
                            }
                        });
                    }
                    break;

                case 'monster_paths':
                    if (Array.isArray(window.monsters) && Array.isArray(message.data)) {
                        const TILE = typeof TILE_SIZE === 'number' ? TILE_SIZE : 32;
                        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
                        message.data.forEach(evt => {
                            const m = window.monsters.find(mm => mm.id === evt.id);
                            if (!m || !Array.isArray(evt.path) || evt.path.length === 0) return;
                            const per = Math.max(80, Math.min(600, Number(evt.perTileMs) || 240));
                            // Construire des segments continus à partir de la position pixel actuelle vers chaque waypoint
                            let sx = (typeof m.px === 'number') ? m.px : (m.x * TILE);
                            let sy = (typeof m.py === 'number') ? m.py : (m.y * TILE);
                            let start = now; // on ignore startAt serveur ici pour éviter désynchro horloge
                            const segments = [];
                            for (let i = 0; i < evt.path.length; i++) {
                                const wp = evt.path[i];
                                const ex = wp.x * TILE;
                                const ey = wp.y * TILE;
                                const end = start + per;
                                segments.push({ sx, sy, ex, ey, start, end, tx: wp.x, ty: wp.y });
                                sx = ex; sy = ey; start = end;
                            }
                            m.lerpSegments = segments;
                            m.lerpIndex = 0;
                            m.moving = true;
                            // Cible logique finale pour l'affichage/IA locale (même si IA locale est off)
                            const last = evt.path[evt.path.length - 1];
                            m.moveTarget = { x: last.x, y: last.y };
                            // Important: mettre à jour x/y au fil du temps dans la boucle (pas ici) pour que les événements serveur (kill par x,y) matchent
                        });
                    }
                    break;

                case 'dead_monsters':
                    if (typeof window.monsterSyncManager !== 'undefined') {
                        window.monsterSyncManager.applyDeadMonsters(message.data);
                    }
                    break;

                case 'monster_killed':
                    if (Array.isArray(window.monsters)) {
                        const local = window.monsters.find(m => m.type === message.data.type && m.x === message.data.x && m.y === message.data.y && !m.isDead);
                        if (local) {
                            // Mettre à jour l'état local SANS renvoyer d'événement au serveur
                            if (typeof release === 'function') release(local.x, local.y);
                            local.isDead = true;
                            local.hp = 0;
                            local.deathTime = Date.now();
                        }
                    }
                    break;

            case 'monster_respawn':
                    if (message.data && typeof message.data.x === 'number') {
                        if (!Array.isArray(window.monsters)) window.monsters = [];
                        const TILE = typeof TILE_SIZE === 'number' ? TILE_SIZE : 32;
                        const t = message.data.type;
                        const name = t === 'crow' ? 'Corbeau' : (t === 'cochon' ? 'Cochon' : (t === 'slime' ? 'Slime' : (t === 'slimeboss' ? 'SlimeBoss' : (t === 'aluineeks' ? 'Aluineeks' : t))));
                        const defaultMoveSpeed = (t === 'corbeauelite') ? 0.8 : (t === 'slimeboss') ? 0.8 : (t === 'slime') ? 0.5 : 0.5;
                        const defaultAnimDelay = (t === 'slime') ? 200 : (t === 'slimeboss') ? 150 : 120;
                        window.monsters.push({
                            id: message.data.id,
                            type: t,
                            name,
                            level: message.data.level || 1,
                            x: message.data.x, y: message.data.y,
                            px: message.data.x * TILE,
                            py: message.data.y * TILE,
                            hp: message.data.hp || 10,
                            maxHp: message.data.maxHp || 10,
                            xpValue: message.data.xpValue || 0,
                            force: message.data.force || 0,
                            defense: message.data.defense || 0,
                            respawnMs: message.data.respawnMs || 30000,
                            isDead: false,
                            deathTime: 0,
                            moving: false,
                            frame: 0,
                            state: 'idle',
                            moveTarget: { x: message.data.x, y: message.data.y },
                            movePath: [],
                            moveSpeed: defaultMoveSpeed,
                            animDelay: defaultAnimDelay,
                            lastAnim: 0,
                            moveCooldown: 0,
                            stuckSince: 0
                        });
                        if (typeof assignMonsterImages === 'function') assignMonsterImages();
                    }
                    break;
        }
    }
    
    // Envoyer le nom du personnage
    sendPlayerName() {
        if (this.connected && this.socket && window.playerNameManager) {
            const playerName = window.playerNameManager.getPlayerName();
            
            // Vérifier que le nom n'est pas vide ou par défaut
            if (playerName && !playerName.startsWith('Joueur_')) {
                this.socket.send(JSON.stringify({
                    type: 'player_name',
                    name: playerName
                }));
                console.log(`📝 Envoi du nom du personnage: ${playerName}`);
            } else {
                console.log(`⚠️ Nom du personnage non valide: ${playerName}`);
            }
        } else {
            console.log('❌ Impossible d\'envoyer le nom: connexion ou gestionnaire non disponible');
        }
    }
    
    // Envoyer la position du joueur
    sendPlayerUpdate() {
        if (this.connected && this.socket && typeof player !== 'undefined') {
            this.socket.send(JSON.stringify({
                type: 'player_update',
                data: {
                    x: player.x,
                    y: player.y,
                    direction: player.direction
                }
            }));
        }
    }
    
    // Changer de carte
    changeMap(mapName) {
        if (this.connected && this.currentMap !== mapName) {
            console.log(`🗺️ Changement de carte: ${this.currentMap} → ${mapName}`);
            
            // Nettoyer la liste des autres joueurs avant de changer
            const oldMap = this.currentMap;
            this.otherPlayers.clear();
            console.log(`🧹 Liste des joueurs nettoyée pour ${oldMap} → ${mapName}`);
            
            // Nettoyer les monstres synchronisés lors du changement de map
            if (typeof clearSyncedMonsters === 'function') {
                clearSyncedMonsters();
            }
            
            this.currentMap = mapName;
            this.socket.send(JSON.stringify({
                type: 'mapChange',
                mapName: mapName
            }));
            console.log('🗺️ Changement de carte envoyé au serveur:', mapName);

            // Si c'est un donjon, envoyer enter_dungeon
            if (mapName && mapName.startsWith('mapdonjon')) {
                console.log(`🏰 Entrée dans le donjon ${mapName}, envoi de enter_dungeon`);
                try {
                    this.socket.send(JSON.stringify({
                        type: 'enter_dungeon',
                        mapName: mapName
                    }));
                    console.log(`📤 enter_dungeon envoyé pour ${mapName}`);
                } catch (error) {
                    console.error('❌ Erreur envoi enter_dungeon:', error);
                }
            }

            // Demander l'état du donjon pour la nouvelle carte
            try { this.socket.send(JSON.stringify({ type: 'request_dungeon_state', mapName })); } catch(_) {}

            // Redemander l'état des monstres morts pour la nouvelle carte
            try {
                this.socket.send(JSON.stringify({ type: 'request_dead_monsters', mapName }));
            } catch(_) {}
        } else if (!this.connected) {
            console.log('❌ Impossible de changer de carte: non connecté');
        } else if (this.currentMap === mapName) {
            console.log('✅ Déjà sur la bonne carte');
        }
    }
    
    // Forcer la synchronisation de la carte actuelle
    syncCurrentMap() {
        if (this.connected && window.currentMap && this.currentMap !== window.currentMap) {
            console.log(`🔄 Synchronisation forcée: ${this.currentMap} → ${window.currentMap}`);
            this.changeMap(window.currentMap);
        }
    }
    
    // Démarrer les mises à jour de position
    startPositionUpdates() {
        this.updateInterval = setInterval(() => {
            this.sendPlayerUpdate();
        }, 100); // Envoyer position toutes les 100ms
    }
    
    // Arrêter les mises à jour
    stopPositionUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    // Dessiner les autres joueurs
    drawOtherPlayers(ctx) {
        if (!this.connected) return;

        this.otherPlayers.forEach((otherPlayer, id) => {
            // Correction du positionnement pour les donjons (20x15 au lieu de 48x25)
            let x, y;
            const currentMap = this.currentMap || window.currentMap;
            if (currentMap && currentMap.startsWith('mapdonjon')) {
                // Donjon: centrer dans une zone 20x15
                const dungeonOffsetX = (48 - 20) / 2; // (48-20)/2 = 14
                const dungeonOffsetY = (25 - 15) / 2; // (25-15)/2 = 5
                x = (otherPlayer.x + dungeonOffsetX) * TILE_SIZE;
                y = (otherPlayer.y + dungeonOffsetY) * TILE_SIZE;
                console.log(`🎯 Position corrigée donjon: joueur à (${otherPlayer.x},${otherPlayer.y}) → affiché à (${x/TILE_SIZE},${y/TILE_SIZE})`);
            } else {
                // Map normale: position standard
                x = otherPlayer.x * TILE_SIZE;
                y = otherPlayer.y * TILE_SIZE;
            }

            ctx.save();
            
            // Utiliser l'image du joueur si disponible
            if (window.playerImg && window.playerImg.complete) {
                // Dessiner le sprite du joueur
                ctx.drawImage(
                    window.playerImg,
                    0, 0, 32, 32, // Source rectangle
                    x, y, 32, 32   // Destination rectangle
                );
            } else {
                // Fallback : dessiner un personnage simple
                ctx.fillStyle = '#4a90e2';
                ctx.fillRect(x + 6, y + 8, 20, 20);
                
                ctx.fillStyle = '#ffdbac';
                ctx.fillRect(x + 8, y + 4, 16, 12);
                
                ctx.fillStyle = '#000';
                ctx.fillRect(x + 10, y + 6, 2, 2);
                ctx.fillRect(x + 16, y + 6, 2, 2);
            }
            
                         // Debug: afficher le nom dans la console
             if (otherPlayer.name && !otherPlayer.name.startsWith('Joueur_')) {
                 console.log(`🎯 Affichage du nom: ${otherPlayer.name} pour le joueur ${otherPlayer.id}`);
             }
            
            ctx.restore();

            // Clic pour inviter dans le groupe (MVP)
            if (!ctx.canvas._partyClickBound) {
                ctx.canvas.addEventListener('click', (e) => {
                    const rect = ctx.canvas.getBoundingClientRect();
                    const mx = e.clientX - rect.left;
                    const my = e.clientY - rect.top;
                    // Détecter clic sur un autre joueur (tuile 32x32)
                    for (const p of this.otherPlayers.values()) {
                        const px = p.x * TILE_SIZE, py = p.y * TILE_SIZE;
                        if (mx >= px && mx < px + 32 && my >= py && my < py + 32) {
                            const confirmInvite = confirm(`Inviter ${p.name} dans le groupe ?`);
                            if (confirmInvite) {
                                try { this.socket.send(JSON.stringify({ type: 'party_invite', targetId: p.id })); } catch(_) {}
                            }
                            break;
                        }
                    }
                });
                ctx.canvas._partyClickBound = true;
            }

            // Halo uniquement pour le CHEF du groupe
            try {
                const isLeader = window.partyState && window.partyState.leaderId === otherPlayer.id;
                if (isLeader) {
                    ctx.save();
                    ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x + 16, y + 16, 18, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
            } catch(_) {}
        });
    }
    
    // Se déconnecter
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.stopPositionUpdates();
        this.otherPlayers.clear();
        this.connected = false;
    }
}

// Créer l'instance globale
window.multiplayerManager = new MultiplayerManager();

// Fonction pour activer le multijoueur
function enableMultiplayer() {
    console.log('🎮 Activation du mode multijoueur...');
    window.multiplayerManager.connect();
}

// Fonction pour désactiver le multijoueur
function disableMultiplayer() {
    console.log('🎮 Désactivation du mode multijoueur...');
    window.multiplayerManager.disconnect();
}

// Fonction pour dessiner les autres joueurs (à appeler dans la boucle de jeu)
function drawMultiplayerPlayers(ctx) {
    if (window.multiplayerManager && window.multiplayerManager.connected) {
        window.multiplayerManager.drawOtherPlayers(ctx);
    }
}

// Fonction pour forcer la synchronisation de la carte
function syncMultiplayerMap() {
    if (window.multiplayerManager && window.multiplayerManager.connected) {
        console.log('🔄 Tentative de synchronisation de la carte...');
        console.log(`- Carte actuelle du jeu: ${window.currentMap}`);
        console.log(`- Carte actuelle du multijoueur: ${window.multiplayerManager.currentMap}`);
        
        if (window.currentMap && window.multiplayerManager.currentMap !== window.currentMap) {
            console.log('🔄 Synchronisation nécessaire, changement de carte...');
            window.multiplayerManager.changeMap(window.currentMap);
            return true;
        } else {
            console.log('✅ Cartes déjà synchronisées');
            return false;
        }
    } else {
        console.log('❌ Multijoueur non connecté');
        return false;
    }
}

// Fonction pour forcer le rafraîchissement de la liste des joueurs
function refreshPlayerList() {
    if (window.multiplayerManager && window.multiplayerManager.connected) {
        console.log('🔄 Forçage du rafraîchissement de la liste des joueurs...');
        
        // Nettoyer la liste actuelle
        window.multiplayerManager.otherPlayers.clear();
        
        // Redemander la liste des joueurs au serveur
        window.multiplayerManager.socket.send(JSON.stringify({
            type: 'request_players',
            mapName: window.multiplayerManager.currentMap
        }));
        
        console.log('📡 Demande de liste des joueurs envoyée au serveur');
        return true;
    } else {
        console.log('❌ Multijoueur non connecté');
        return false;
    }
}

// Fonction pour diagnostiquer l'état du multijoueur
function diagnoseMultiplayer() {
    console.log('🔍 Diagnostic du système multijoueur:');
    console.log(`- Multijoueur initialisé: ${!!window.multiplayerManager}`);
    console.log(`- Connecté: ${window.multiplayerManager ? window.multiplayerManager.connected : false}`);
    console.log(`- Carte du jeu: ${window.currentMap}`);
    console.log(`- Carte multijoueur: ${window.multiplayerManager ? window.multiplayerManager.currentMap : 'N/A'}`);
    console.log(`- Autres joueurs: ${window.multiplayerManager ? window.multiplayerManager.otherPlayers.size : 0}`);
    
    if (window.multiplayerManager && window.multiplayerManager.otherPlayers.size > 0) {
        console.log('👥 Joueurs connectés:');
        window.multiplayerManager.otherPlayers.forEach((player, id) => {
            console.log(`  - ${player.name} (${id}) sur ${player.map} à (${player.x}, ${player.y})`);
        });
    }
}

// Fonction pour forcer la reconnexion
function forceReconnect() {
    if (window.multiplayerManager) {
        console.log('🔄 Forçage de la reconnexion...');
        window.multiplayerManager.disconnect();
        
        // Attendre un peu puis reconnecter
        setTimeout(() => {
            window.multiplayerManager.connect();
        }, 1000);
        
        return true;
    } else {
        console.log('❌ Multijoueur non initialisé');
        return false;
    }
}

console.log('🎮 Module multijoueur séparé chargé'); 
function initHUD() {
    
    // Le HUD est déjà configuré avec les fonctions drawLifeBar et drawXPBar
    // Cette fonction peut être utilisée pour des initialisations supplémentaires si nécessaire
    
}

// Charge l'image de la barre de vie (cœur)
const lifeBarImg = new Image();
lifeBarImg.src = 'assets/ui/barredevie.png';
    lifeBarImg.onload = () => {};

// Position et taille du cœur (zone grise du canvas)
const lifeBarX = 740;
const lifeBarY = 805;
const lifeBarWidth = 100;
const lifeBarHeight = 100;

function drawLifeBar(ctx) {
    // Position et taille de la barre
    const barX = 650;
    const barY = 805;
    const barWidth = 300;
    const barHeight = 18;

    let pv = (typeof player !== "undefined" && typeof player.life !== "undefined") ? player.life : 0;
    let pvmax = (typeof player !== "undefined" && typeof player.maxLife !== "undefined") ? player.maxLife : 50;
    let ratio = Math.max(0, Math.min(1, pv / pvmax));

    // Couleur dynamique (vert, orange, rouge)
    let color = "#44ff44";
    if (ratio < 0.5) color = "#ffd952";
    if (ratio < 0.25) color = "#e53935";

    // Fond de la barre (gris)
    ctx.save();
    ctx.fillStyle = "#222";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Remplissage de la barre (couleur dynamique)
    ctx.fillStyle = color;
    ctx.fillRect(barX, barY, barWidth * ratio, barHeight);

    // Contour de la barre
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Texte de vie au centre
    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 4;
    ctx.fillText(`${pv} / ${pvmax}`, barX + barWidth / 2, barY + barHeight / 2);
    ctx.restore();
}

function drawXPBar(ctx) {
    // Position et taille de la barre d'XP (juste sous la barre de vie)
    const barX = 70;
    const barY = 805; // 40 (barre de vie) + 32 (hauteur) + 8 (marge)
    const barWidth = 500;
    const barHeight = 18;

    let xp = (typeof player !== "undefined" && typeof player.xp !== "undefined") ? player.xp : 0;
    let xpMax = (typeof player !== "undefined" && typeof player.xpToNextLevel !== "undefined") ? player.xpToNextLevel : 100;
    let ratio = Math.max(0, Math.min(1, xp / xpMax));

    // Couleur XP (bleu)
    let color = "#3fa9f5";

    // Fond de la barre (gris)
    ctx.save();
    ctx.fillStyle = "#222";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Remplissage de la barre (bleu)
    ctx.fillStyle = color;
    ctx.fillRect(barX, barY, barWidth * ratio, barHeight);

    // Contour de la barre
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Texte d'XP au centre
    ctx.font = "bold 15px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 3;
    ctx.fillText(`${xp} / ${xpMax} XP`, barX + barWidth / 2, barY + barHeight / 2);
    ctx.restore();
}

// Fonction d'affichage HUD, à appeler dans la gameLoop
function drawHUD(ctx) {
    drawLifeBar(ctx);
    if (typeof drawXPBar === "function") drawXPBar(ctx);
    if (typeof drawMonsterInfo === "function") drawMonsterInfo(ctx); // Ajoute cette ligne
    // Le panneau de groupe est désormais en DOM (déplaçable), pas en canvas
}

// Fonction pour afficher le nom du joueur au survol
function drawPlayerNameTooltip(ctx, mouseX, mouseY) {
    if (typeof player === 'undefined') return;
    
    // Position du joueur en pixels
    const playerX = player.x * TILE_SIZE;
    const playerY = player.y * TILE_SIZE;
    
    // Zone de détection du survol (32x32 pixels centrée sur le joueur)
    const hoverZone = 32;
    const playerCenterX = playerX + TILE_SIZE/2; // Centre du tile du joueur
    const playerCenterY = playerY + TILE_SIZE/2; // Centre du tile du joueur
    const isHovering = mouseX >= playerCenterX - hoverZone/2 && 
                       mouseX <= playerCenterX + hoverZone/2 &&
                       mouseY >= playerCenterY - hoverZone/2 && 
                       mouseY <= playerCenterY + hoverZone/2;
    
    if (isHovering && window.playerName) {
        // Calculer la largeur du texte pour centrer le tooltip
        ctx.save();
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        const textWidth = ctx.measureText(window.playerName).width;
        const tooltipWidth = Math.max(80, textWidth + 20); // Largeur minimale de 80px
        
        // Position centrée du tooltip au-dessus de la tête du joueur
        const tooltipX = playerX + TILE_SIZE/2; // Centre du tile du joueur
        const tooltipY = playerY - 10; // Juste au-dessus de la tête
        
        // Fond du tooltip
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(tooltipX - tooltipWidth/2, tooltipY - 25, tooltipWidth, 25);
        
        // Bordure
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.strokeRect(tooltipX - tooltipWidth/2, tooltipY - 25, tooltipWidth, 25);
        
        // Texte du nom
        ctx.fillStyle = 'white';
        ctx.fillText(window.playerName, tooltipX, tooltipY - 10);
        
        ctx.restore();
    }
}

// Fonction pour afficher le nom des autres joueurs au survol
function drawOtherPlayersNameTooltip(ctx, mouseX, mouseY) {
    if (!window.multiplayerManager || !window.multiplayerManager.connected) return;
    
    window.multiplayerManager.otherPlayers.forEach((otherPlayer, id) => {
        const playerX = otherPlayer.x * TILE_SIZE;
        const playerY = otherPlayer.y * TILE_SIZE;
        
        // Zone de détection du survol (32x32 pixels centrée sur le joueur)
        const hoverZone = 32;
        const playerCenterX = playerX + TILE_SIZE/2; // Centre du tile du joueur
        const playerCenterY = playerY + TILE_SIZE/2; // Centre du tile du joueur
        const isHovering = mouseX >= playerCenterX - hoverZone/2 && 
                           mouseX <= playerCenterX + hoverZone/2 &&
                           mouseY >= playerCenterY - hoverZone/2 && 
                           mouseY <= playerCenterY + hoverZone/2;
        
        if (isHovering && otherPlayer.name) {
            // Calculer la largeur du texte pour centrer le tooltip
            ctx.save();
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            const textWidth = ctx.measureText(otherPlayer.name).width;
            const tooltipWidth = Math.max(80, textWidth + 20); // Largeur minimale de 80px
            
            // Position centrée du tooltip au-dessus de la tête du joueur
            const tooltipX = playerX + TILE_SIZE/2; // Centre du tile du joueur
            const tooltipY = playerY - 10; // Juste au-dessus de la tête
            
            // Fond du tooltip
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(tooltipX - tooltipWidth/2, tooltipY - 25, tooltipWidth, 25);
            
            // Bordure
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.strokeRect(tooltipX - tooltipWidth/2, tooltipY - 25, tooltipWidth, 25);
            
            // Texte du nom
            ctx.fillStyle = 'white';
            ctx.fillText(otherPlayer.name, tooltipX, tooltipY - 10);
            
            ctx.restore();
        }
    });
}

// === Panneau de groupe (affichage minimal à gauche du canvas) ===
// Panneau de groupe en DOM déplaçable
function ensurePartyDomPanel() {
    let panel = document.getElementById('party-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'party-panel';
        panel.style.position = 'fixed';
        panel.style.zIndex = '1200';
        panel.style.width = '180px';
        panel.style.maxWidth = '35vw';
        panel.style.background = 'rgba(28,32,40,0.92)';
        panel.style.border = '2px solid #3fa9f5';
        panel.style.borderRadius = '8px';
        panel.style.color = '#fff';
        panel.style.boxShadow = '0 6px 18px rgba(0,0,0,0.35)';
        panel.style.userSelect = 'none';
        panel.style.display = 'none';
        // Position par défaut ou sauvegardée
        const savedLeft = localStorage.getItem('party_panel_left');
        const savedTop = localStorage.getItem('party_panel_top');
        panel.style.left = savedLeft ? `${parseInt(savedLeft,10)}px` : '12px';
        panel.style.top = savedTop ? `${parseInt(savedTop,10)}px` : '80px';

        const header = document.createElement('div');
        header.id = 'party-panel-header';
        header.textContent = 'Groupe';
        header.style.fontWeight = 'bold';
        header.style.fontSize = '14px';
        header.style.padding = '6px 8px';
        header.style.cursor = 'move';
        header.style.borderBottom = '1px solid #334455';

        const body = document.createElement('div');
        body.id = 'party-panel-body';
        body.style.padding = '6px 8px 8px 8px';
        body.style.display = 'flex';
        body.style.flexDirection = 'column';
        body.style.gap = '6px';

        panel.appendChild(header);
        panel.appendChild(body);
        document.body.appendChild(panel);

        // Drag & drop
        (function() {
            let dragging = false;
            let offX = 0, offY = 0;
            header.addEventListener('mousedown', (e) => {
                dragging = true;
                const rect = panel.getBoundingClientRect();
                offX = e.clientX - rect.left;
                offY = e.clientY - rect.top;
                document.body.style.cursor = 'grabbing';
                e.preventDefault();
            });
            window.addEventListener('mouseup', () => {
                if (dragging) {
                    dragging = false;
                    document.body.style.cursor = '';
                    // Sauvegarder position
                    const rect = panel.getBoundingClientRect();
                    localStorage.setItem('party_panel_left', Math.max(0, Math.floor(rect.left)));
                    localStorage.setItem('party_panel_top', Math.max(0, Math.floor(rect.top)));
                }
            });
            window.addEventListener('mousemove', (e) => {
                if (!dragging) return;
                const maxL = Math.max(0, window.innerWidth - panel.offsetWidth);
                const maxT = Math.max(0, window.innerHeight - panel.offsetHeight);
                const newL = Math.max(0, Math.min(maxL, e.clientX - offX));
                const newT = Math.max(0, Math.min(maxT, e.clientY - offY));
                panel.style.left = `${newL}px`;
                panel.style.top = `${newT}px`;
            });
        })();
    }
    return panel;
}

function updatePartyDomPanel() {
    const panel = ensurePartyDomPanel();
    const body = panel.querySelector('#party-panel-body');
    if (!window.partyState || !Array.isArray(window.partyState.members) || window.partyState.members.length === 0) {
        panel.style.display = 'none';
        if (body) body.innerHTML = '';
        return;
    }
    panel.style.display = 'block';
    if (!body) return;
    body.innerHTML = '';
    // Ligne d’actions si chef
    if (window.partyState && window.partyState.leaderId === (window.multiplayerManager?.playerId)) {
        const actions = document.createElement('div');
        actions.style.display = 'flex'; actions.style.gap = '6px'; actions.style.marginBottom = '6px';
        const btnLeave = document.createElement('button'); btnLeave.textContent = 'Quitter'; btnLeave.style.cursor = 'pointer';
        btnLeave.onclick = () => { try { window.multiplayerManager?.socket?.send(JSON.stringify({ type: 'party_leave' })); } catch(_) {} };
        actions.appendChild(btnLeave);
        body.appendChild(actions);
    } else {
        const btnLeave = document.createElement('button'); btnLeave.textContent = 'Quitter'; btnLeave.style.cursor = 'pointer'; btnLeave.style.marginBottom = '6px';
        btnLeave.onclick = () => { try { window.multiplayerManager?.socket?.send(JSON.stringify({ type: 'party_leave' })); } catch(_) {} };
        body.appendChild(btnLeave);
    }
    const members = window.partyState.members;
    members.forEach(m => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.flexDirection = 'column';
        row.style.gap = '4px';

        const name = document.createElement('div');
        name.textContent = m.name || `Joueur ${m.id}`;
        name.style.fontSize = '12px';
        name.style.fontWeight = (m.id === window.partyState.leaderId) ? 'bold' : 'normal';
        name.style.color = (m.id === window.partyState.leaderId) ? '#ffd952' : '#fff';
        // Actions chef par membre (kick/transfer)
        if (window.partyState.leaderId === (window.multiplayerManager?.playerId) && m.id !== window.multiplayerManager?.playerId) {
            const actions = document.createElement('div'); actions.style.display = 'flex'; actions.style.gap = '4px';
            const btnKick = document.createElement('button'); btnKick.textContent = 'Kick'; btnKick.style.cursor = 'pointer';
            btnKick.onclick = () => { try { window.multiplayerManager?.socket?.send(JSON.stringify({ type: 'party_kick', targetId: m.id })); } catch(_) {} };
            const btnLead = document.createElement('button'); btnLead.textContent = 'Chef'; btnLead.style.cursor = 'pointer';
            btnLead.onclick = () => { try { window.multiplayerManager?.socket?.send(JSON.stringify({ type: 'party_transfer_leader', targetId: m.id })); } catch(_) {} };
            name.appendChild(actions); actions.appendChild(btnKick); actions.appendChild(btnLead);
        }

        const barWrap = document.createElement('div');
        barWrap.style.width = '100%';
        barWrap.style.height = '10px';
        barWrap.style.background = '#222';
        barWrap.style.border = '1px solid #fff';
        const barFill = document.createElement('div');
        barFill.style.height = '100%';
        const info = (window.partyHp && window.partyHp.get(m.id)) || { hp: 0, maxHp: 1 };
        const ratio = Math.max(0, Math.min(1, info.hp / Math.max(1, info.maxHp)));
        barFill.style.width = `${Math.floor(ratio * 100)}%`;
        barFill.style.background = ratio > 0.5 ? '#44ff44' : (ratio > 0.25 ? '#ffd952' : '#e53935');
        barWrap.appendChild(barFill);

        row.appendChild(name);
        row.appendChild(barWrap);
        body.appendChild(row);
    });
}

// OPTIMISATION : Demander l'état de groupe et pousser nos HP moins fréquemment
window.partyRenderUpdate = function() { try { updatePartyDomPanel(); } catch(_) {} };

// Timer optimisé : moins fréquent et seulement si nécessaire
if (!window.partyUpdateTimer) {
    window.partyUpdateTimer = setInterval(() => {
        // Seulement si on est en multijoueur ET en jeu
        if (window.multiplayerManager && window.multiplayerManager.connected && 
            window.multiplayerManager.socket && window.gameState === 'playing') {
            
            // Pousser nos HP aux membres du groupe (moins fréquent)
            if (typeof player !== 'undefined') {
                const hp = player.life || 0; 
                const maxHp = player.maxLife || 1;
                try { 
                    window.multiplayerManager.socket.send(JSON.stringify({ 
                        type: 'party_member_hp', 
                        hp, 
                        maxHp 
                    })); 
                } catch(_) {}
            }
            
            // Rafraîchir l'état seulement si nécessaire
            if (typeof window.partyState === 'undefined') {
                try { 
                    window.multiplayerManager.socket.send(JSON.stringify({ 
                        type: 'request_party' 
                    })); 
                } catch(_) {}
            }
        }
    }, 3000); // 3 secondes au lieu de 1.5 (moins de charge)
}

// Fonction de positionnement des icônes du HUD avec pourcentages
function positionHudIcons() {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();

    // Mini-carte (juste au-dessus de l'inventaire)
    const minimapIcon = document.getElementById('minimap-icon');
    if (minimapIcon) {
        minimapIcon.style.left = (rect.width * 1) + 'px';
        minimapIcon.style.top = (rect.height * 0.82) + 'px'; // Juste au-dessus de l'inventaire
    }

    // Positionner la mini-carte elle-même
    if (window.worldMapSystem && window.worldMapSystem.minimap) {
        window.worldMapSystem.minimap.updatePosition();
    }

    // Inventaire (en bas à droite)
    const inventoryIcon = document.getElementById('inventory-icon');
    if (inventoryIcon) {
        inventoryIcon.style.left = (rect.width * 0.96) + 'px';
        inventoryIcon.style.top = (rect.height * 0.91) + 'px';
    }

    // Stats (à gauche de l'inventaire)
    const statsIcon = document.getElementById('stats-icon');
    if (statsIcon) {
        statsIcon.style.left = (rect.width * 0.92) + 'px';
        statsIcon.style.top = (rect.height * 0.91) + 'px';
    }

    // Métier (encore à gauche)
    const metierIcon = document.getElementById('metier-icon');
    if (metierIcon) {
        metierIcon.style.left = (rect.width * 0.88) + 'px';
        metierIcon.style.top = (rect.height * 0.91) + 'px';
    }

    // Sort (encore à gauche)
    const sortIcon = document.getElementById('sort-icon');
    if (sortIcon) {
        sortIcon.style.left = (rect.width * 0.84) + 'px';
        sortIcon.style.top = (rect.height * 0.91) + 'px';
    }

    // Quêtes (à gauche du sort)
    const quetesIcon = document.getElementById('quetes-icon');
    if (quetesIcon) {
        quetesIcon.style.left = (rect.width * 0.80) + 'px';
        quetesIcon.style.top = (rect.height * 0.91) + 'px';
    }

            // Carte (à gauche des quêtes)
        const mapIcon = document.getElementById('map-icon');
        if (mapIcon) {
            mapIcon.style.left = (rect.width * 0.76) + 'px';
            mapIcon.style.top = (rect.height * 0.91) + 'px';
        }
        
        // Classe (à gauche de la carte)
        const classeIcon = document.getElementById('classe-icon');
        if (classeIcon) {
            classeIcon.style.left = (rect.width * 0.72) + 'px';
            classeIcon.style.top = (rect.height * 0.91) + 'px';
        }
        
        // Initialiser l'événement de clic pour l'icône de carte
        if (mapIcon && !mapIcon.hasEventListener) {
            mapIcon.addEventListener('click', function() {
                if (window.worldMapSystem) {
                    window.worldMapSystem.toggle();
                }
            });
            mapIcon.hasEventListener = true;
        }

        // Initialiser l'événement de clic pour l'icône de classe
        if (classeIcon && !classeIcon.hasEventListener) {
            classeIcon.addEventListener('click', function() {
                showClassPanel();
            });
            classeIcon.hasEventListener = true;
        }
        
        // Initialiser l'événement de clic pour l'icône de mini-carte
        if (minimapIcon && !minimapIcon.hasEventListener) {
            minimapIcon.addEventListener('click', function() {
                toggleMinimap();
            });
            minimapIcon.hasEventListener = true;
        }
        
        // Initialiser les contrôles de la mini-carte
        initMinimapControls();

    // Barre de sorts
    const spellBar = document.getElementById('spell-shortcut-bar');
    if (spellBar && canvas) {
        spellBar.style.position = 'fixed';
        spellBar.style.left = (rect.left + rect.width * 0.01) + 'px';
        spellBar.style.top = (rect.top + rect.height * 0.915) + 'px';
        spellBar.style.zIndex = 1200;
        spellBar.style.display = 'flex';
        // Largeur proportionnelle au canvas, mais jamais trop petite
        const slotCount = spellBar.querySelectorAll('.spell-slot').length;
        const minWidth = slotCount * 36 + (slotCount - 1) * 8 + 10;
        spellBar.style.width = Math.max(rect.width * 0.38, minWidth) + 'px';
    }

    // Barre utilitaire latérale
    const utilityBar = document.getElementById('utility-bar');
    if (utilityBar && canvas) {
        utilityBar.style.position = 'fixed';
        utilityBar.style.left = (rect.left + rect.width + 10) + 'px'; // 10px après le bord droit du canvas
        utilityBar.style.top = (rect.top + rect.height * 0.5) + 'px';
        utilityBar.style.transform = 'translateY(-50%)';
        utilityBar.style.zIndex = 1200;
        utilityBar.style.display = 'flex';
        
        // Hauteur proportionnelle au canvas avec limites
        const slotCount = utilityBar.querySelectorAll('.utility-slot').length;
        const minHeight = slotCount * 54 + (slotCount - 1) * 8 + 20; // slots + gaps + padding
        const maxHeight = rect.height * 0.8; // Maximum 80% de la hauteur du canvas
        const finalHeight = Math.min(Math.max(rect.height * 0.6, minHeight), maxHeight);
        
        // Si la hauteur calculée est trop petite, réduire le nombre de slots visibles
        if (finalHeight < minHeight) {
            const availableSlots = Math.floor((finalHeight - 20) / (54 + 8));
            utilityBar.querySelectorAll('.utility-slot').forEach((slot, index) => {
                slot.style.display = index < availableSlots ? 'flex' : 'none';
            });
        } else {
            // Afficher tous les slots
            utilityBar.querySelectorAll('.utility-slot').forEach(slot => {
                slot.style.display = 'flex';
            });
        }
    }
}

// Variable globale pour l'état de la mini-carte
let minimapVisible = false;
let minimapFirstOpen = true; // Pour afficher les instructions une seule fois

// Fonction pour basculer l'affichage de la mini-carte
function toggleMinimap() {
    minimapVisible = !minimapVisible;
    
    const minimapIcon = document.getElementById('minimap-icon');
    
    if (minimapIcon) {
        // Changer l'icône selon l'état
        const span = minimapIcon.querySelector('span');
        if (span) {
            span.textContent = minimapVisible ? '➖' : '➕';
        }
    }
    
    // Utiliser la référence directe à la mini-carte si disponible
    if (window.worldMapSystem && window.worldMapSystem.minimap) {
        window.worldMapSystem.minimap.canvas.style.display = minimapVisible ? 'block' : 'none';
        
        // Forcer le recentrage et le rechargement des quêtes quand la minimap s'ouvre
        if (minimapVisible) {
            window.worldMapSystem.minimap.centerOnPlayerMap();
            // Recharger les quêtes pour actualiser la minimap
            if (window.worldMapSystem.loadAvailableQuests) {
                window.worldMapSystem.loadAvailableQuests();
            }
        }
        
        // Afficher les instructions lors de la première ouverture
        if (minimapVisible && minimapFirstOpen) {
            setTimeout(() => {
                window.worldMapSystem.minimap.showInstructions();
                minimapFirstOpen = false;
            }, 500);
        }
    } else {
        // Fallback : chercher le canvas par sélecteur
        const minimapCanvas = document.querySelector('canvas[style*="z-index: 1000"]');
        if (minimapCanvas) {
            minimapCanvas.style.display = minimapVisible ? 'block' : 'none';
        }
    }
    
}

// Fonction pour ouvrir les contrôles de la mini-carte
function openMinimapControls() {
    if (window.worldMapSystem && window.worldMapSystem.minimap) {
        window.worldMapSystem.minimap.toggleControls();
    }
}

// Ajouter un événement de clic droit sur l'icône de mini-carte pour ouvrir les contrôles
function initMinimapControls() {
    const minimapIcon = document.getElementById('minimap-icon');
    if (minimapIcon) {
        // Clic droit pour ouvrir les contrôles
        minimapIcon.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            openMinimapControls();
        });
        
        // Double-clic pour ouvrir les contrôles aussi
        minimapIcon.addEventListener('dblclick', (e) => {
            e.preventDefault();
            openMinimapControls();
        });
    }
}

// Exporter les fonctions pour qu'elles soient accessibles depuis main.js
window.positionHudIcons = positionHudIcons;
window.toggleMinimap = toggleMinimap;
window.openMinimapControls = openMinimapControls;

// Fonction pour mettre à jour le panneau MMO du joueur
function updatePlayerMMOPanel() {
    const panel = document.getElementById('player-mmo-panel');
    const nameElement = document.getElementById('player-mmo-name');
    const levelElement = document.getElementById('player-mmo-level');
    const avatarElement = document.getElementById('player-mmo-avatar');
    const statusElement = document.getElementById('player-mmo-status');
    
    if (!panel || !nameElement || !levelElement || !avatarElement || !statusElement) return;
    
    // Afficher le panneau
    panel.style.display = 'block';
    
    // Mettre à jour les informations
    if (window.playerName) {
        nameElement.textContent = window.playerName;
    }
    
    if (typeof player !== 'undefined' && player.level) {
        levelElement.textContent = `Niveau ${player.level}`;
    }
    
    if (window.playerAvatar) {
        avatarElement.src = window.playerAvatar;
    }
    
    // Mettre à jour le statut multijoueur
    if (window.multiplayerManager && window.multiplayerManager.connected) {
        statusElement.textContent = 'ON';
        statusElement.style.color = '#27ae60';
    } else {
        statusElement.textContent = 'OFF';
        statusElement.style.color = '#e74c3c';
    }
}

// Fonction pour initialiser les événements du panneau MMO
function initMMOPanelEvents() {
    const panel = document.getElementById('player-mmo-panel');
    if (panel) {
        panel.addEventListener('click', function() {
            if (window.multiplayerManager) {
                if (window.multiplayerManager.connected) {
                    // Désactiver le multijoueur
                    disableMultiplayer();
                } else {
                    // Activer le multijoueur
                    enableMultiplayer();
                }
            }
        });
        
        // Ajouter un style de curseur pour indiquer que c'est cliquable
        panel.style.cursor = 'pointer';
    }
}

// Fonction pour gérer les tooltips au survol de la souris
function handleMouseMove(event) {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Stocker la position de la souris pour les tooltips
    window.mouseX = mouseX;
    window.mouseY = mouseY;
}

// Fonction pour dessiner tous les tooltips
function drawAllTooltips(ctx) {
    if (window.mouseX !== undefined && window.mouseY !== undefined) {
        drawPlayerNameTooltip(ctx, window.mouseX, window.mouseY);
        drawOtherPlayersNameTooltip(ctx, window.mouseX, window.mouseY);
    }
}

// Le système de changement de classe a été déplacé vers js/systems/changementclasse.js

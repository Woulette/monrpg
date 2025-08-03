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
        
        // Initialiser l'événement de clic pour l'icône de carte
        if (mapIcon && !mapIcon.hasEventListener) {
            mapIcon.addEventListener('click', function() {
                if (window.worldMapSystem) {
                    window.worldMapSystem.toggle();
                }
            });
            mapIcon.hasEventListener = true;
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

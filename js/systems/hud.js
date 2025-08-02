console.log("Fichier js/hud.js chargé");

function initHUD() {
    console.log("Initialisation du HUD...");
    
    // Le HUD est déjà configuré avec les fonctions drawLifeBar et drawXPBar
    // Cette fonction peut être utilisée pour des initialisations supplémentaires si nécessaire
    
    console.log("HUD initialisé avec succès");
}

// Charge l'image de la barre de vie (cœur)
const lifeBarImg = new Image();
lifeBarImg.src = 'assets/ui/barredevie.png';
lifeBarImg.onload = () => console.log("Barre de vie chargée !");

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
    
    console.log('🗺️ Mini-carte:', minimapVisible ? 'affichée' : 'masquée');
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

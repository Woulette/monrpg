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

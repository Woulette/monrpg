// js/monsters/draw.js

// Chargement de l'image des corbeaux
const corbeauImg = new Image();
corbeauImg.src = "assets/personnages/corbeau.png";
corbeauImg.onload = () => { 
    console.log("Image corbeau chargée avec succès");
    // Assigner l'image aux monstres existants
    if (window.monsters && window.monsters.length > 0) {
        window.monsters.forEach(m => m.img = corbeauImg);
        console.log(`${window.monsters.length} monstres ont reçu l'image`);
    } else {
        console.log("Aucun monstre disponible pour recevoir l'image");
    }
};
corbeauImg.onerror = () => {
    console.error("Erreur lors du chargement de l'image corbeau.png");
};

// Chargement de l'image du Maitrecorbeau
const maitreCorbeauImg = new Image();
maitreCorbeauImg.src = "assets/personnages/corbeauelite.png";
maitreCorbeauImg.onload = () => {
    console.log("Image Maitrecorbeau chargée avec succès");
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
};
maitreCorbeauImg.onerror = () => {
    console.error("Erreur lors du chargement de l'image corbeauelite.png");
};

// Fonction pour assigner l'image aux monstres (appelée après création des monstres)
function assignMonsterImages() {
    if (window.monsters) {
        window.monsters.forEach(m => {
            if (m.type === "maitrecorbeau") {
                m.img = maitreCorbeauImg;
            } else {
                m.img = corbeauImg;
            }
        });
        console.log(`${window.monsters.length} monstres ont reçu leur image (assignMonsterImages)`);
    }
}

function drawMonsters(ctx) {
    if (!monsters || monsters.length === 0) {
        console.log("Aucun monstre à dessiner");
        return;
    }
    
    monsters.forEach((monster, index) => {
        if (!monster.img) {
            console.log(`Monstre ${index} n'a pas d'image`);
            return;
        }
        if (monster.hp <= 0 || monster.isDead) {
            // console.log(`Monstre ${index} est mort (HP: ${monster.hp}, isDead: ${monster.isDead})`);
            return;
        }

        // Centrer le monstre dans sa case
        let monsterSize = 32;
        let monsterHeight = 32;
        let offsetX, offsetY;
        if (monster.type === "maitrecorbeau") {
            monsterSize = 48;
            monsterHeight = 64;
            offsetX = (TILE_SIZE / 2) - (monsterSize / 2);
            offsetY = TILE_SIZE - monsterHeight;
        } else {
            offsetX = (TILE_SIZE / 2) - (monsterSize / 2);
            offsetY = (TILE_SIZE / 2) - (monsterHeight / 2);
        }

        // Affichage du nom et niveau du monstre au-dessus de la tête UNIQUEMENT si sélectionné
        if (window.attackTarget === monster) {
            ctx.save();
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            const textX = monster.px + offsetX + monsterSize / 2;
            const textY = monster.py + offsetY - 8;
            // Calculer la différence de niveau
            const levelDiff = Math.abs((monster.level || 1) - (player.level || 1));
            // Choisir la couleur selon la différence de niveau
            if (levelDiff < 5) ctx.fillStyle = "#ffffff";
            else if (levelDiff <= 15) ctx.fillStyle = "#ffa500";
            else ctx.fillStyle = "#ff0000";
            let nomAffiche = monster.name || (monster.type === "maitrecorbeau" ? "Maitrecorbeau" : "Corbeau");
            ctx.fillText(`${nomAffiche} Lv ${monster.level || 1}`, textX, textY);
            ctx.restore();
        }
        
        if (monster.type === "maitrecorbeau") {
            // Afficher l'image entière, pas d'animation
            ctx.drawImage(
                monster.img,
                0, 0, 48, 64,
                monster.px + offsetX, monster.py + offsetY, monsterSize, monsterHeight
            );
        } else {
            // Animation normale pour les corbeaux
            ctx.drawImage(
                monster.img,
                monster.frame * 32, 0, 32, 32,
                monster.px + offsetX, monster.py + offsetY, monsterSize, monsterHeight
            );
        }

        // Afficher la barre de vie SEULEMENT si le monstre est sélectionné/attaqué ou en aggro
        if (window.attackTarget === monster || monster.state === "aggro") {
            let barWidth = 32, barHeight = 5;
            let barX = monster.px + offsetX, barY = monster.py + offsetY - 10;
            ctx.fillStyle = "black";
            ctx.fillRect(barX, barY, barWidth, barHeight);
            let hpRatio = monster.hp / monster.maxHp;
            ctx.fillStyle = "#44ff44";
            ctx.fillRect(barX + 1, barY + 1, (barWidth - 2) * hpRatio, barHeight - 2);
            // Pas de texte !
        }
    });
}

function drawMonsterInfo(ctx) {
    if (!window.attackTarget || attackTarget.hp <= 0) return;

    // Position et taille de la fiche
    const infoX = 650;
    const infoY = 827;
    const infoWidth = 300;
    const infoHeight = 80;

    // Fond de la fiche
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "#181826";
    ctx.fillRect(infoX, infoY, infoWidth, infoHeight);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#fff"; // Encadrement blanc
    ctx.lineWidth = 3;
    ctx.strokeRect(infoX, infoY, infoWidth, infoHeight);

    // Nom du monstre (centré)
    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`${attackTarget.name || "Monstre"} Niveau ${attackTarget.level || 1}`, infoX + infoWidth / 2, infoY + 10);

    // Barre de vie
    const barX = infoX + 16;
    const barY = infoY + 42;
    const barWidth = infoWidth - 32;
    const barHeight = 18;
    let ratio = Math.max(0, Math.min(1, attackTarget.hp / attackTarget.maxHp));
    ctx.fillStyle = "#222";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = "#44ff44";
    if (ratio < 0.5) ctx.fillStyle = "#ffd952";
    if (ratio < 0.25) ctx.fillStyle = "#e53935";
    ctx.fillRect(barX, barY, barWidth * ratio, barHeight);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Points de vie (texte)
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${attackTarget.hp} / ${attackTarget.maxHp} PV`, barX + barWidth / 2, barY + barHeight / 2);

    // Bouton de fermeture (croix)
    const closeSize = 22;
    const closeX = infoX + infoWidth - closeSize - 8;
    const closeY = infoY + 8;
    ctx.save();
    ctx.beginPath();
    ctx.arc(closeX + closeSize/2, closeY + closeSize/2, closeSize/2, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.strokeStyle = '#ffd952';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#ffd952';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', closeX + closeSize/2, closeY + closeSize/2 + 1);
    ctx.restore();

    // Enregistre la zone du bouton pour le clic (sur window)
    window.monsterInfoCloseBox = {x: closeX, y: closeY, w: closeSize, h: closeSize};

    ctx.restore();
}

// Gestion du clic sur la croix de fermeture
if (!window._monsterInfoCloseHandler) {
    window._monsterInfoCloseHandler = true;
    document.addEventListener('click', function(e) {
        if (!window.monsterInfoCloseBox || !window.attackTarget) return;
        const rect = gameCanvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const {x, y, w, h} = window.monsterInfoCloseBox;
        if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
            window.attackTarget = null;
            attackTarget = null;
        }
    });
}

// Export global
window.drawMonsters = drawMonsters;
window.drawMonsterInfo = drawMonsterInfo; 
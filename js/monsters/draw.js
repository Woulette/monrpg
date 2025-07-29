// js/monsters/draw.js

// Chargement de l'image des corbeaux
const corbeauImg = new Image();
corbeauImg.src = "assets/personnages/corbeau.png";
corbeauImg.onload = () => { 
    console.log("Image corbeau chargée avec succès");
    // Assigner l'image aux monstres existants
    if (window.monsters && window.monsters.length > 0) {
        window.monsters.forEach(m => {
            if (m.type === "crow") {
                m.img = corbeauImg;
            }
        });
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

// Chargement de l'image du Corbeau d'élite
const corbeauEliteImg = new Image();
corbeauEliteImg.src = "assets/personnages/Corbeauchef.png";
corbeauEliteImg.onload = () => {
    console.log("Image Corbeau d'élite chargée avec succès");
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
};
corbeauEliteImg.onerror = () => {
    console.error("Erreur lors du chargement de l'image Corbeauchef.png");
};

// Chargement de l'image du Slime
const slimeImg = new Image();
slimeImg.src = "assets/personnages/slime.png";
slimeImg.onload = () => {
    console.log("Image Slime chargée avec succès");
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
};
slimeImg.onerror = () => {
    console.error("Erreur lors du chargement de l'image slime.png");
};

// Chargement de l'image du SlimeBoss
const slimeBossImg = new Image();
slimeBossImg.src = "assets/personnages/slimeboss.png";
slimeBossImg.onload = () => {
    console.log("Image SlimeBoss chargée avec succès");
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
};
slimeBossImg.onerror = () => {
    console.error("Erreur lors du chargement de l'image slimeboss.png");
};

// Fonction pour assigner l'image aux monstres (appelée après création des monstres)
function assignMonsterImages() {
    if (window.monsters) {
        window.monsters.forEach(m => {
            if (m.type === "maitrecorbeau") {
                m.img = maitreCorbeauImg;
            } else if (m.type === "corbeauelite") {
                m.img = corbeauEliteImg;
            } else if (m.type === "slime") {
                m.img = slimeImg;
            } else if (m.type === "slimeboss") {
                m.img = slimeBossImg;
            } else if (m.type === "crow") {
                m.img = corbeauImg;
            } else {
                m.img = corbeauImg; // Fallback pour les autres types
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
        } else if (monster.type === "corbeauelite") {
            monsterSize = 40;
            monsterHeight = 48;
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
            const textX = monster.px + offsetX + monsterSize / 2 + (window.mapOffsetX || 0);
            const textY = monster.py + offsetY - 8 + (window.mapOffsetY || 0);
            // Calculer la différence de niveau
            const levelDiff = Math.abs((monster.level || 1) - (player.level || 1));
            // Choisir la couleur selon la différence de niveau
            if (levelDiff < 5) ctx.fillStyle = "#ffffff";
            else if (levelDiff <= 15) ctx.fillStyle = "#ffa500";
            else ctx.fillStyle = "#ff0000";
            let nomAffiche = monster.name || (monster.type === "maitrecorbeau" ? "Maitrecorbeau" : monster.type === "corbeauelite" ? "Corbeau d'élite" : monster.type === "slimeboss" ? "SlimeBoss" : "Corbeau");
            ctx.fillText(`${nomAffiche} Lv ${monster.level || 1}`, textX, textY);
            ctx.restore();
        }
        
        if (monster.type === "maitrecorbeau") {
            // Afficher l'image entière, pas d'animation
            ctx.drawImage(
                monster.img,
                0, 0, 48, 64,
                monster.px + offsetX + (window.mapOffsetX || 0), monster.py + offsetY + (window.mapOffsetY || 0), monsterSize, monsterHeight
            );
        } else if (monster.type === "corbeauelite") {
            // Animation du Corbeau d'élite avec 8 frames (40x48 chaque frame)
            // 1ère ligne (y=0) : 4 frames de marche (walk)
            // 2ème ligne (y=48) : 4 frames d'idle
            
            const now = Date.now();
            
            // Initialiser les frames séparées si elles n'existent pas
            if (monster.idleFrame === undefined) monster.idleFrame = 0;
            if (monster.walkFrame === undefined) monster.walkFrame = 0;
            
            if (monster.moving) {
                // Animation de marche - mettre à jour la frame de marche
                if (!monster.lastWalkAnim || now - monster.lastWalkAnim > monster.walkAnimDelay) {
                    monster.walkFrame = (monster.walkFrame + 1) % 4;
                    monster.lastWalkAnim = now;
                }
                // Utiliser la frame de marche
                let frameX = monster.walkFrame * 40;
                let frameY = 0;
                ctx.drawImage(
                    monster.img,
                    frameX, frameY, 40, 48,
                    monster.px + offsetX + (window.mapOffsetX || 0), monster.py + offsetY + (window.mapOffsetY || 0), monsterSize, monsterHeight
                );
            } else {
                // Animation d'idle - mettre à jour la frame d'idle
                if (!monster.lastIdleAnim || now - monster.lastIdleAnim > monster.idleAnimDelay) {
                    monster.idleFrame = (monster.idleFrame + 1) % 4;
                    monster.lastIdleAnim = now;
                }
                // Utiliser la frame d'idle
                let frameX = monster.idleFrame * 40;
                let frameY = 48;
                ctx.drawImage(
                    monster.img,
                    frameX, frameY, 40, 48,
                    monster.px + offsetX + (window.mapOffsetX || 0), monster.py + offsetY + (window.mapOffsetY || 0), monsterSize, monsterHeight
                );
            }
        } else if (monster.type === "slime") {
            // Animation du slime avec 4 frames (32x32 chaque frame)
            ctx.drawImage(
                monster.img,
                monster.frame * 32, 0, 32, 32,
                monster.px + offsetX + (window.mapOffsetX || 0), monster.py + offsetY + (window.mapOffsetY || 0), monsterSize, monsterHeight
            );
        } else if (monster.type === "slimeboss") {
            // Gestion spéciale pour le SlimeBoss (64x64 avec 4 animations)
            // Calculer les offsets pour centrer le boss 64x64 sur sa case
            const bossSize = 64;
            const bossHeight = 64;
            const bossOffsetX = (TILE_SIZE / 2) - (bossSize / 2);
            const bossOffsetY = (TILE_SIZE / 2) - (bossHeight / 2);
            
            // Animation du boss (4 frames, plus lente)
            const now = Date.now();
            if (now - monster.lastAnim > monster.animDelay) {
                monster.currentAnimation = (monster.currentAnimation || 0) + 1;
                monster.currentAnimation = monster.currentAnimation % 4; // 4 frames
                monster.lastAnim = now;
            }
            
            // Dessiner le boss (64x64)
            ctx.drawImage(
                monster.img,
                (monster.currentAnimation || 0) * 64, 0, // Source X, Y (4 frames de 64px)
                64, 64, // Source width, height
                monster.px + bossOffsetX + (window.mapOffsetX || 0), monster.py + bossOffsetY + (window.mapOffsetY || 0), // Destination X, Y
                64, 64 // Destination width, height
            );
            
            // Dessiner la barre de vie du boss
            if (monster.hp < monster.maxHp) {
                const barWidth = 64;
                const barHeight = 6;
                const barX = monster.px + bossOffsetX + (window.mapOffsetX || 0);
                const barY = monster.py + bossOffsetY - 10 + (window.mapOffsetY || 0);
                
                // Fond de la barre
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                ctx.fillRect(barX, barY, barWidth, barHeight);
                
                // Barre de vie
                const healthPercent = monster.hp / monster.maxHp;
                ctx.fillStyle = healthPercent > 0.5 ? "#00ff00" : healthPercent > 0.25 ? "#ffff00" : "#ff0000";
                ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
                
                // Bordure
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1;
                ctx.strokeRect(barX, barY, barWidth, barHeight);
            }
        } else {
            // Animation normale pour les corbeaux
            ctx.drawImage(
                monster.img,
                monster.frame * 32, 0, 32, 32,
                monster.px + offsetX + (window.mapOffsetX || 0), monster.py + offsetY + (window.mapOffsetY || 0), monsterSize, monsterHeight
            );
        }

        // Afficher la barre de vie SEULEMENT si le monstre est sélectionné/attaqué ou en aggro
        if (window.attackTarget === monster || monster.state === "aggro") {
            let barWidth = 32, barHeight = 5;
            let barX = monster.px + offsetX + (window.mapOffsetX || 0), barY = monster.py + offsetY - 10 + (window.mapOffsetY || 0);
            ctx.fillStyle = "black";
            ctx.fillRect(barX, barY, barWidth, barHeight);
            let hpRatio = monster.hp / monster.maxHp;
            ctx.fillStyle = "#44ff44";
            ctx.fillRect(barX + 1, barY + 1, (barWidth - 2) * hpRatio, barHeight - 2);
            // Pas de texte !
        }
        
        // Effet de hover - bordure colorée quand la souris survole le monstre
        if (window.hoveredMonster === monster) {
            ctx.save();
            ctx.strokeStyle = '#00ffff'; // Cyan pour l'effet de hover
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]); // Ligne pointillée
            
            // Gestion spéciale pour le SlimeBoss (64x64)
            if (monster.type === "slimeboss") {
                const bossSize = 64;
                const bossOffsetX = (TILE_SIZE / 2) - (bossSize / 2);
                const bossOffsetY = (TILE_SIZE / 2) - (bossSize / 2);
                ctx.strokeRect(
                    monster.px + bossOffsetX + (window.mapOffsetX || 0) - 2, 
                    monster.py + bossOffsetY + (window.mapOffsetY || 0) - 2, 
                    bossSize + 4, 
                    bossSize + 4
                );
            } else {
                ctx.strokeRect(
                    monster.px + offsetX + (window.mapOffsetX || 0) - 2, 
                    monster.py + offsetY + (window.mapOffsetY || 0) - 2, 
                    monsterSize + 4, 
                    monsterHeight + 4
                );
            }
            ctx.restore();
        }
    });
}

function drawMonsterInfo(ctx) {
    if (!window.attackTarget || attackTarget.hp <= 0) return;

    // Position et taille de la fiche
    const infoX = 650;
    const infoY = 827;
    const infoWidth = 300;
    const infoHeight = 81; // Réduit pour que l'encadrement soit visible

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
    ctx.font = "bold 18px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`${attackTarget.name || "Monstre"} Niveau ${attackTarget.level || 1}`, infoX + infoWidth / 2, infoY + 10);

    // Barre de vie
    const barX = infoX + 16;
    const barY = infoY + 38;
    const barWidth = infoWidth - 32;
    const barHeight = 16;
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

    // Statistiques de force et défense
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    
    // Force et Défense sur la même ligne
    ctx.fillStyle = "#ff6b6b";
    ctx.fillText(`Force: ${attackTarget.force || 0}`, infoX + 16, infoY + 62);
    
    ctx.fillStyle = "#4ecdc4";
    ctx.fillText(`Défense: ${attackTarget.defense || 0}`, infoX + 75, infoY + 62);

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

// Le gestionnaire de clic pour la croix est maintenant dans player.js

// Export global
window.drawMonsters = drawMonsters;
window.drawMonsterInfo = drawMonsterInfo; 
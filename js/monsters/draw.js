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

// Exporter toutes les images globalement
window.corbeauImg = corbeauImg;
window.maitreCorbeauImg = maitreCorbeauImg;
window.corbeauEliteImg = corbeauEliteImg;
window.slimeImg = slimeImg;
window.slimeBossImg = slimeBossImg;

// Fonction pour assigner l'image aux monstres (appelée après création des monstres)
function assignMonsterImages() {
    if (window.monsters) {
        window.monsters.forEach(m => {
            if (m.type === "maitrecorbeau") {
                m.img = window.maitreCorbeauImg;
            } else if (m.type === "corbeauelite") {
                m.img = window.corbeauEliteImg;
            } else if (m.type === "slime") {
                m.img = window.slimeImg;
            } else if (m.type === "slimeboss") {
                m.img = window.slimeBossImg;
            } else if (m.type === "crow") {
                m.img = window.corbeauImg;
            } else {
                m.img = window.corbeauImg; // Fallback pour les autres types
            }
        });
        console.log(`${window.monsters.length} monstres ont reçu leur image (assignMonsterImages)`);
    }
}

// Exporter la fonction globalement
window.assignMonsterImages = assignMonsterImages;

// Fonction pour diagnostiquer les images des monstres
window.debugMonsterImages = function() {
    console.log('🔍 Diagnostic des images des monstres...');
    
    // Vérifier les images globales
    console.log('📸 Images globales:', {
        corbeauImg: !!window.corbeauImg,
        maitreCorbeauImg: !!window.maitreCorbeauImg,
        corbeauEliteImg: !!window.corbeauEliteImg,
        slimeImg: !!window.slimeImg,
        slimeBossImg: !!window.slimeBossImg
    });
    
    // Vérifier l'état de chargement des images
    if (window.corbeauImg) {
        console.log('🖼️ corbeauImg:', {
            complete: window.corbeauImg.complete,
            naturalWidth: window.corbeauImg.naturalWidth,
            src: window.corbeauImg.src
        });
    }
    
    if (window.maitreCorbeauImg) {
        console.log('🖼️ maitreCorbeauImg:', {
            complete: window.maitreCorbeauImg.complete,
            naturalWidth: window.maitreCorbeauImg.naturalWidth,
            src: window.maitreCorbeauImg.src
        });
    }
    
    if (window.corbeauEliteImg) {
        console.log('🖼️ corbeauEliteImg:', {
            complete: window.corbeauEliteImg.complete,
            naturalWidth: window.corbeauEliteImg.naturalWidth,
            src: window.corbeauEliteImg.src
        });
    }
    
    // Vérifier les monstres
    if (window.monsters && window.monsters.length > 0) {
        console.log(`👹 ${window.monsters.length} monstres trouvés:`);
        window.monsters.forEach((monster, index) => {
            console.log(`👹 Monstre ${index}:`, {
                type: monster.type,
                hasImg: !!monster.img,
                imgComplete: monster.img ? monster.img.complete : false,
                hp: monster.hp,
                isDead: monster.isDead
            });
        });
    } else {
        console.log('❌ Aucun monstre trouvé');
    }
    
    console.log('🔍 Diagnostic terminé');
};

function drawMonsters(ctx) {
    if (!monsters || monsters.length === 0) {
        console.log("Aucun monstre à dessiner");
        return;
    }
    
    // Vérifier que le contexte est disponible
    if (!ctx) {
        console.error("❌ Contexte canvas non disponible pour drawMonsters");
        return;
    }
    
    // Variables pour le centrage des monstres (définies au niveau de la fonction)
    let monsterSize, monsterHeight, offsetX, offsetY;
    
    monsters.forEach((monster, index) => {
        if (!monster.img || !monster.img.complete) {
            console.log(`Monstre ${index} n'a pas d'image ou image non chargée`);
            return;
        }
        if (monster.hp <= 0 || monster.isDead) {
            // console.log(`Monstre ${index} est mort (HP: ${monster.hp}, isDead: ${monster.isDead})`);
            return;
        }

        try {
            // Centrer le monstre dans sa case
            monsterSize = 32;
            monsterHeight = 32;
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
                if (monster.img && monster.img.complete) {
                    ctx.drawImage(
                        monster.img,
                        0, 0, 48, 64,
                        monster.px + offsetX + (window.mapOffsetX || 0), monster.py + offsetY + (window.mapOffsetY || 0), monsterSize, monsterHeight
                    );
                } else {
                    console.log(`⚠️ Image non disponible pour maitrecorbeau ${index}`);
                }
            } else if (monster.type === "corbeauelite") {
                // Animation du Corbeau d'élite avec 8 frames (40x48 chaque frame)
                // 1ère ligne (y=0) : 4 frames de marche (walk)
                // 2ème ligne (y=48) : 4 frames d'idle
                
                if (!monster.img || !monster.img.complete) {
                    console.log(`⚠️ Image non disponible pour corbeauelite ${index}`);
                    return;
                }
                
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
            } else {
                // Animation standard pour les autres monstres
                const now = Date.now();
                if (!monster.lastAnim || now - monster.lastAnim > monster.animDelay) {
                    monster.frame = (monster.frame + 1) % 4;
                    monster.lastAnim = now;
                }
                
                // Vérifier l'image juste avant de l'utiliser
                if (!monster.img || !monster.img.complete) {
                    console.log(`⚠️ Image non disponible pour monstre ${index} (type: ${monster.type}) - skip dessin`);
                    return;
                }
                
                ctx.drawImage(
                    monster.img,
                    monster.frame * 32, 0, 32, 32,
                    monster.px + offsetX + (window.mapOffsetX || 0), monster.py + offsetY + (window.mapOffsetY || 0), monsterSize, monsterHeight
                );
            }
        } catch (error) {
            console.error(`❌ Erreur lors du dessin du monstre ${index}:`, error);
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

// Fonction pour forcer la réassignation des images des monstres
window.forceReassignMonsterImages = function() {
    console.log('🔄 Réassignation forcée des images des monstres...');
    
    if (!window.monsters || window.monsters.length === 0) {
        console.log('❌ Aucun monstre à traiter');
        return;
    }
    
    let reassignedCount = 0;
    window.monsters.forEach((monster, index) => {
        if (!monster.img || !monster.img.complete) {
            console.log(`🔄 Réassignation de l'image pour le monstre ${index} (type: ${monster.type})`);
            
            // Réassigner l'image selon le type
            if (monster.type === "crow") {
                monster.img = window.corbeauImg;
            } else if (monster.type === "slime") {
                monster.img = window.slimeImg;
            } else if (monster.type === "slimeboss") {
                monster.img = window.slimeBossImg;
            } else if (monster.type === "corbeauelite") {
                monster.img = window.corbeauEliteImg;
            } else if (monster.type === "maitrecorbeau") {
                monster.img = window.maitreCorbeauImg;
            }
            
            reassignedCount++;
        }
    });
    
    console.log(`✅ ${reassignedCount} images de monstres réassignées`);
}; 
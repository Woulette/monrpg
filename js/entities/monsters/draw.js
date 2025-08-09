// js/entities/monsters/draw.js

// Chargement des images des monstres
const corbeauImg = new Image();
corbeauImg.src = "assets/personnages/corbeau.png";
corbeauImg.onload = () => { 
    if (window.monsters && window.monsters.length > 0) {
        window.monsters.forEach(m => {
            if (m.type === "crow") {
                m.img = corbeauImg;
            }
        });
    }
};

const maitreCorbeauImg = new Image();
maitreCorbeauImg.src = "assets/personnages/corbeauelite.png";
maitreCorbeauImg.onload = () => {
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
};

const corbeauEliteImg = new Image();
corbeauEliteImg.src = "assets/personnages/Corbeauchef.png";
corbeauEliteImg.onload = () => {
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
};

const slimeImg = new Image();
slimeImg.src = "assets/personnages/slime.png";
slimeImg.onload = () => {
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
};

const slimeBossImg = new Image();
slimeBossImg.src = "assets/personnages/slimeboss.png";
slimeBossImg.onload = () => {
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
};

const aluineeksImg = new Image();
aluineeksImg.src = "assets/personnages/aluineeks.png";
aluineeksImg.onload = () => {
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
};

// Image du cochon
const cochonImg = new Image();
cochonImg.src = "assets/personnages/cochon.png";
cochonImg.onload = () => {
    if (typeof assignMonsterImages === "function") {
        assignMonsterImages();
    }
};

// Export global des images
window.corbeauImg = corbeauImg;
window.maitreCorbeauImg = maitreCorbeauImg;
window.corbeauEliteImg = corbeauEliteImg;
window.slimeImg = slimeImg;
window.slimeBossImg = slimeBossImg;
window.aluineeksImg = aluineeksImg;
window.cochonImg = cochonImg;

// Fonction de synchronisation forcée des coordonnées des monstres
function syncMonsterCoordinates() {
    if (!window.monsters) return;
    
    window.monsters.forEach(monster => {
        if (monster && !monster.isDead && !monster.moving) {
            // Synchroniser seulement les monstres qui ne bougent pas
            // Les monstres en mouvement gardent leurs coordonnées pixel fluides
            monster.px = monster.x * TILE_SIZE;
            monster.py = monster.y * TILE_SIZE;
        }
    });
}

// Fonction pour assigner l'image aux monstres
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
            } else if (m.type === "aluineeks") {
                m.img = window.aluineeksImg;
            } else if (m.type === "cochon") {
                m.img = window.cochonImg;
            } else {
                m.img = window.corbeauImg; // Fallback pour les autres types
            }
        });
    }
}

// Fonction de diagnostic des coordonnées des monstres
function diagnoseMonsterCoordinates() {
    if (!window.monsters) {
        return;
    }
    
    window.monsters.forEach((monster, index) => {
        if (monster && !monster.isDead) {
            const expectedPx = monster.x * TILE_SIZE;
            const expectedPy = monster.y * TILE_SIZE;
            const pxDiff = Math.abs(monster.px - expectedPx);
            const pyDiff = Math.abs(monster.py - expectedPy);
            
            if (pxDiff > 1 || pyDiff > 1) {
                if (monster.moving) {
                    return;
                } else {
                    return;
                }
            }
        }
    });
}

// Export global
window.assignMonsterImages = assignMonsterImages;
window.syncMonsterCoordinates = syncMonsterCoordinates;
window.diagnoseMonsterCoordinates = diagnoseMonsterCoordinates;

function drawMonsters(ctx) {
    if (!monsters || monsters.length === 0 || !ctx) {
        return;
    }
    
    // Forcer la synchronisation des coordonnées avant le dessin
    syncMonsterCoordinates();
    
    let monsterSize, monsterHeight, offsetX, offsetY;
    
    monsters.forEach((monster, index) => {
        if (!monster.img || !monster.img.complete || monster.hp <= 0 || monster.isDead) {
            return;
        }

        try {
            // Configuration des tailles et offsets selon le type
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
            } else if (monster.type === "slimeboss") {
                monsterSize = 64;
                monsterHeight = 64;
                offsetX = (TILE_SIZE / 2) - (monsterSize / 2);
                offsetY = (TILE_SIZE / 2) - (monsterHeight / 2);
            } else if (monster.type === "aluineeks") {
                monsterSize = 32;
                monsterHeight = 32;
                offsetX = (TILE_SIZE / 2) - (monsterSize / 2);
                offsetY = (TILE_SIZE / 2) - (monsterHeight / 2);
            } else {
                offsetX = (TILE_SIZE / 2) - (monsterSize / 2);
                offsetY = (TILE_SIZE / 2) - (monsterHeight / 2);
            }

            // Affichage du nom et niveau SEULEMENT si le monstre est sélectionné
            if (window.attackTarget === monster) {
                ctx.save();
                ctx.font = "bold 12px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                const textX = monster.px + offsetX + monsterSize / 2 + (window.mapOffsetX || 0);
                const textY = monster.py + offsetY - 8 + (window.mapOffsetY || 0);
                
                // Calcul de la différence de niveau (monstre - joueur)
                const monsterLevel = monster.level || 1;
                const playerLevel = player.level || 1;
                const levelDiff = monsterLevel - playerLevel;
                
                // Couleur selon la différence de niveau
                if (levelDiff <= 0) {
                    // Monstre de niveau inférieur ou égal au joueur → Blanc
                    ctx.fillStyle = "#ffffff";
                } else if (levelDiff <= 14) {
                    // Monstre de niveau supérieur de 1-14 niveaux → Orange
                    ctx.fillStyle = "#ffa500";
                } else {
                    // Monstre de niveau supérieur de 15+ niveaux → Rouge
                    ctx.fillStyle = "#ff0000";
                }
                
                let nomAffiche = monster.name || (monster.type === "maitrecorbeau" ? "Maitrecorbeau" : monster.type === "corbeauelite" ? "Corbeau d'élite" : monster.type === "slimeboss" ? "SlimeBoss" : monster.type === "aluineeks" ? "Aluineeks" : "Corbeau");
                ctx.fillText(`${nomAffiche} Lv ${monster.level || 1}`, textX, textY);
                ctx.restore();
            }
            
            // Dessin selon le type de monstre
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
                
                // Initialiser les propriétés d'animation si elles n'existent pas
                if (monster.idleFrame === undefined) monster.idleFrame = 0;
                if (monster.walkFrame === undefined) monster.walkFrame = 0;
                if (monster.lastIdleAnim === undefined) monster.lastIdleAnim = 0;
                if (monster.lastWalkAnim === undefined) monster.lastWalkAnim = 0;
                if (monster.idleAnimDelay === undefined) monster.idleAnimDelay = 200; // 200ms pour l'idle
                if (monster.walkAnimDelay === undefined) monster.walkAnimDelay = 150; // 150ms pour la marche
                
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
                    let frameY = 48; // 2ème ligne pour l'idle
                    ctx.drawImage(
                        monster.img,
                        frameX, frameY, 40, 48,
                        monster.px + offsetX + (window.mapOffsetX || 0), monster.py + offsetY + (window.mapOffsetY || 0), monsterSize, monsterHeight
                    );
                }
            } else if (monster.type === "slimeboss") {
                // Gestion spéciale pour le SlimeBoss 64x64
                const now = Date.now();
                if (!monster.lastAnim || now - monster.lastAnim > monster.animDelay) {
                    monster.frame = (monster.frame + 1) % 4;
                    monster.lastAnim = now;
                }
                
                // Dessiner le SlimeBoss avec sa taille complète 64x64
                ctx.drawImage(
                    monster.img,
                    monster.frame * 64, 0, 64, 64,
                    monster.px + offsetX + (window.mapOffsetX || 0), monster.py + offsetY + (window.mapOffsetY || 0), monsterSize, monsterHeight
                );
            } else if (monster.type === "aluineeks") {
                // Affichage statique pour les Aluineeks (pas d'animation)
                ctx.drawImage(
                    monster.img,
                    0, 0, 32, 32,
                    monster.px + offsetX + (window.mapOffsetX || 0), monster.py + offsetY + (window.mapOffsetY || 0), monsterSize, monsterHeight
                );
            } else if (monster.type === "cochon") {
                // Affichage statique (comme Aluineeks) pour l'instant
                ctx.drawImage(
                    monster.img,
                    0, 0, 32, 32,
                    monster.px + offsetX + (window.mapOffsetX || 0), monster.py + offsetY + (window.mapOffsetY || 0), monsterSize, monsterHeight
                );
            } else {
                // Animation standard pour les autres monstres
                const now = Date.now();
                if (!monster.lastAnim || now - monster.lastAnim > monster.animDelay) {
                    monster.frame = (monster.frame + 1) % 4;
                    monster.lastAnim = now;
                }
                
                ctx.drawImage(
                    monster.img,
                    monster.frame * 32, 0, 32, 32,
                    monster.px + offsetX + (window.mapOffsetX || 0), monster.py + offsetY + (window.mapOffsetY || 0), monsterSize, monsterHeight
                );
            }
        } catch (error) {
            console.error(`Erreur lors du dessin du monstre ${index}:`, error);
        }

        // Afficher la barre de vie SEULEMENT si le monstre est sélectionné/attaqué ou en aggro
        if (window.attackTarget === monster || monster.state === "aggro") {
            let barWidth = monsterSize || 32, barHeight = 5;
            let barX = monster.px + offsetX + (window.mapOffsetX || 0), barY = monster.py + offsetY - 10 + (window.mapOffsetY || 0);
            ctx.fillStyle = "black";
            ctx.fillRect(barX, barY, barWidth, barHeight);
            let hpRatio = monster.hp / monster.maxHp;
            ctx.fillStyle = "#44ff44";
            ctx.fillRect(barX + 1, barY + 1, (barWidth - 2) * hpRatio, barHeight - 2);
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
    const infoHeight = 81;

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

window.drawMonsters = drawMonsters;
window.drawMonsterInfo = drawMonsterInfo; 

// Fonction pour forcer la réassignation des images des monstres
window.forceReassignMonsterImages = function() {
    if (!window.monsters || window.monsters.length === 0) {
        return;
    }
    
    let reassignedCount = 0;
    window.monsters.forEach((monster, index) => {
        if (!monster.img || !monster.img.complete) {
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
            } else if (monster.type === "aluineeks") {
                monster.img = window.aluineeksImg;
            }
            reassignedCount++;
        }
    });
}; 
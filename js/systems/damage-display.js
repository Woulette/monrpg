// Système d'affichage des dégâts - Mon RPG 2D

// Liste des dégâts en cours d'animation
const damageNumbers = [];
const damageEffects = [];

// Limites pour éviter l'accumulation excessive
const MAX_DAMAGE_EFFECTS = 50; // Limite maximale d'effets simultanés
const CLEANUP_INTERVAL = 5000; // Nettoyage forcé toutes les 5 secondes

// Configuration des dégâts
const DAMAGE_CONFIG = {
    playerDamage: {
        color: '#ff4444',
        size: 20,
        duration: 1500,
        offsetY: -20
    },
    monsterDamage: {
        color: '#ff8800',
        size: 18,
        duration: 1200,
        offsetY: -15
    },
    heal: {
        color: '#44ff44',
        size: 18,
        duration: 1000,
        offsetY: -15
    },
    xp: {
        color: '#ffff00', // Jaune pour l'XP
        size: 16,
        duration: 2000,
        offsetY: -25
    }
};

// Fonction de nettoyage forcé
function forceCleanupDamageEffects() {
    const currentTime = Date.now();
    let removedCount = 0;
    
    // Supprimer les effets expirés
    for (let i = damageEffects.length - 1; i >= 0; i--) {
        const effect = damageEffects[i];
        const elapsed = currentTime - effect.startTime;
        
        if (elapsed > effect.duration + 1000) { // +1 seconde de marge
            damageEffects.splice(i, 1);
            removedCount++;
        }
    }
    
    // Si on a encore trop d'effets, supprimer les plus anciens
    if (damageEffects.length > MAX_DAMAGE_EFFECTS) {
        const toRemove = damageEffects.length - MAX_DAMAGE_EFFECTS;
        damageEffects.splice(0, toRemove);
        removedCount += toRemove;
    }
    
    if (removedCount > 0) {
        // Nettoyage forcé effectué
    }
}

// Créer un effet de dégâts
function createDamageEffect(x, y, damage, type = 'damage', isPlayer = false, isCrit = false) {
    // Nettoyage préventif si on a trop d'effets
    if (damageEffects.length >= MAX_DAMAGE_EFFECTS) {
        forceCleanupDamageEffects();
    }
    
    let config;
    
    if (type === 'xp') {
        config = DAMAGE_CONFIG.xp;
    } else if (type === 'heal') {
        config = DAMAGE_CONFIG.heal;
    } else {
        config = isPlayer ? DAMAGE_CONFIG.playerDamage : DAMAGE_CONFIG.monsterDamage;
    }
    
    // Doubler la taille pour les coups critiques
    const fontSize = isCrit ? config.size * 2 : config.size;
    
    const effect = {
        x: x + TILE_SIZE / 2,
        y: y + config.offsetY,
        damage: damage,
        type: type,
        color: config.color,
        size: fontSize,
        duration: config.duration,
        startTime: Date.now(),
        alpha: 1,
        offsetX: (Math.random() - 0.5) * 20, // Légère variation horizontale
        velocityY: -0.3, // Vitesse vers le haut (ralentie)
        velocityX: (Math.random() - 0.5) * 0.5 // Très légère variation horizontale
    };
    
    damageEffects.push(effect);
    
    // Ajouter un effet visuel d'attaque (nouveau style)
    if (type === 'damage') {
        createAttackEffect(x, y, isPlayer);
    }
    
    // Ajouter un effet spécial pour les coups critiques
    if (isCrit) {
        createCritEffect(x, y, isPlayer);
    }
}

// Créer un effet visuel d'attaque - changement de couleur du sprite
function createAttackEffect(x, y, isPlayer) {
    const effect = {
        x: x,
        y: y,
        startTime: Date.now(),
        duration: 300,
        color: isPlayer ? '#ff4444' : '#ff8800',
        type: 'sprite_flash',
        isPlayer: isPlayer
    };
    
    damageEffects.push(effect);
}

// Créer un effet spécial pour les coups critiques
function createCritEffect(x, y, isPlayer) {
    // Nettoyer les anciens effets de coup critique avant d'en créer un nouveau
    for (let i = damageEffects.length - 1; i >= 0; i--) {
        if (damageEffects[i].type === 'crit_flash') {
            damageEffects.splice(i, 1);
        }
    }
    
    const effect = {
        x: x + TILE_SIZE / 2,
        y: y + TILE_SIZE / 2,
        startTime: Date.now(),
        duration: 400, // Réduit de 600 à 400ms
        type: 'crit_flash',
        isPlayer: isPlayer,
        size: 0,
        maxSize: 60,
        alpha: 1
    };
    
    damageEffects.push(effect);
}

// Créer un effet spécial d'explosion pour les sorts puissants
function createExplosionEffect(x, y) {
    const effect = {
        x: x + TILE_SIZE / 2,
        y: y + TILE_SIZE / 2,
        startTime: Date.now(),
        duration: 700,
        type: 'explosion_flash',
        size: 0,
        maxSize: 70,
        alpha: 1
    };
    damageEffects.push(effect);
}

// Afficher les dégâts
function displayDamage(x, y, damage, type = 'damage', isPlayer = false) {
    // Détecter si c'est un coup critique
    const isCrit = type === 'critique';
    createDamageEffect(x, y, damage, type, isPlayer, isCrit);
}

// Mettre à jour les effets de dégâts
function updateDamageEffects() {
    const currentTime = Date.now();
    let removedCount = 0;
    
    // Nettoyage périodique forcé
    if (currentTime % CLEANUP_INTERVAL < 16) { // Toutes les ~5 secondes
        forceCleanupDamageEffects();
    }
    
    for (let i = damageEffects.length - 1; i >= 0; i--) {
        const effect = damageEffects[i];
        const elapsed = currentTime - effect.startTime;
        const progress = elapsed / effect.duration;
        
        if (progress >= 1) {
            // Supprimer l'effet terminé
            damageEffects.splice(i, 1);
            removedCount++;
            continue;
        }
        
        // Mettre à jour la position
        if (effect.velocityY !== undefined) {
            effect.y += effect.velocityY;
            effect.x += effect.velocityX;
            // Pas de gravité - les dégâts montent vers le haut
        }
        
        // Mettre à jour la transparence
        if (effect.alpha !== undefined) {
            effect.alpha = 1 - progress;
        }
    }
    
    // Log de débogage si on a beaucoup d'effets
    if (damageEffects.length > 20) {
        // Nombre d'effets de dégâts actifs élevé
    }
    
    // Nettoyage d'urgence si on dépasse la limite
    if (damageEffects.length > MAX_DAMAGE_EFFECTS * 1.5) {
        // console.warn(`🚨 Trop d'effets de dégâts (${damageEffects.length}), nettoyage d'urgence`);
        damageEffects.length = 0; // Vider complètement
    }
}

// Dessiner les effets de dégâts
function drawDamageEffects(ctx) {
    ctx.save();
    
    // Nettoyage intelligent des effets expirés seulement
    const currentTime = Date.now();
    for (let i = damageEffects.length - 1; i >= 0; i--) {
        const effect = damageEffects[i];
        const elapsed = currentTime - effect.startTime;
        if (elapsed > effect.duration + 1000) { // +1 seconde de marge
            damageEffects.splice(i, 1);
        }
    }
    
    for (const effect of damageEffects) {
        if (effect.damage !== undefined) {
            // Dessiner le nombre ou texte (convertir en string)
            ctx.globalAlpha = effect.alpha;
            ctx.fillStyle = effect.color;
            ctx.font = `bold ${effect.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Ombre pour la lisibilité
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillText(String(effect.damage), effect.x + 1 + (window.mapOffsetX || 0), effect.y + 1 + (window.mapOffsetY || 0));
            
            // Texte principal
            ctx.fillStyle = effect.color;
            ctx.fillText(String(effect.damage), effect.x + (window.mapOffsetX || 0), effect.y + (window.mapOffsetY || 0));
            
        } else if (effect.type === 'sprite_flash') {
            // Effet de changement de couleur du sprite - seulement sur les pixels non-transparents
            const progress = (Date.now() - effect.startTime) / effect.duration;
            const alpha = 0.4 * (1 - progress);
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = effect.color;
            ctx.fillRect(effect.x + (window.mapOffsetX || 0), effect.y + (window.mapOffsetY || 0), TILE_SIZE, TILE_SIZE);
            ctx.restore();
        } else if (effect.type === 'crit_flash') {
            // Effet spécial pour les coups critiques - version localisée sans voile global
            const progress = (Date.now() - effect.startTime) / effect.duration;
            const alpha = effect.alpha * (1 - progress);
            
            ctx.save();
            ctx.globalAlpha = alpha * 0.4; // Opacité très réduite
            
            // Effet de pulsation très localisé autour du monstre
            const pulseRadius = 20 * progress;
            const pulseWidth = 2 * (1 - progress);
            
            // Cercle de pulsation rouge (plus petit)
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = pulseWidth;
            ctx.beginPath();
            ctx.arc(effect.x + (window.mapOffsetX || 0), effect.y + (window.mapOffsetY || 0), pulseRadius, 0, 2 * Math.PI);
            ctx.stroke();
            
            // Cercle de pulsation jaune (encore plus petit)
            const innerRadius = pulseRadius * 0.6;
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = pulseWidth * 0.6;
            ctx.beginPath();
            ctx.arc(effect.x + (window.mapOffsetX || 0), effect.y + (window.mapOffsetY || 0), innerRadius, 0, 2 * Math.PI);
            ctx.stroke();
            
            // Quelques points lumineux très petits autour du monstre
            const numPoints = 4; // Réduit de 6 à 4
            const pointRadius = 10; // Réduit de 15 à 10
            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * 2 * Math.PI;
                const pointX = effect.x + Math.cos(angle) * pointRadius + (window.mapOffsetX || 0);
                const pointY = effect.y + Math.sin(angle) * pointRadius + (window.mapOffsetY || 0);
                const pointSize = 1 * (1 - progress); // Très petit
                
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(pointX, pointY, pointSize, 0, 2 * Math.PI);
                ctx.fill();
            }
            
            ctx.restore();
        } else if (effect.type === 'explosion_flash') {
            // Effet spécial pour explosion de sort
            const progress = (Date.now() - effect.startTime) / effect.duration;
            const alpha = effect.alpha * (1 - progress);
            const numParticles = 18;
            const baseSize = 8;
            const explosionRadius = 60;
            const colors = ['#ffae00', '#fff200', '#ff6600', '#ff3c00', '#ffffff'];
            ctx.save();
            ctx.globalAlpha = alpha;
            for (let i = 0; i < numParticles; i++) {
                const angle = (i / numParticles) * 2 * Math.PI;
                const distance = explosionRadius * progress;
                const particleX = effect.x + Math.cos(angle) * distance + (window.mapOffsetX || 0);
                const particleY = effect.y + Math.sin(angle) * distance + (window.mapOffsetY || 0);
                const particleSize = baseSize * (1 - progress * 0.4);
                ctx.fillStyle = colors[i % colors.length];
                ctx.beginPath();
                ctx.arc(particleX, particleY, particleSize, 0, 2 * Math.PI);
                ctx.fill();
            }
            ctx.restore();
        }
    }
    
    ctx.restore();
}

// Fonction pour nettoyer complètement tous les effets (appelée lors du retour au menu)
function clearAllDamageEffects() {
    damageEffects.length = 0;
    damageNumbers.length = 0;
}

// Fonction de nettoyage d'urgence pour les effets de dégâts
function emergencyClearDamageEffects() {
    damageEffects.length = 0;
    damageNumbers.length = 0;
}

// Fonction d'urgence pour nettoyer les effets et forcer un redessinage
window.emergencyClearCombatEffects = function() {
    clearAllDamageEffects();
    
    // Forcer un redessinage complet
    if (typeof drawMap === "function") {
        drawMap();
    }
    
    // Nettoyer aussi l'écran noir si nécessaire
    if (typeof clearBlackScreen === "function") {
        clearBlackScreen();
    }
};

// Fonctions d'export
window.displayDamage = displayDamage;
window.updateDamageEffects = updateDamageEffects;
window.drawDamageEffects = drawDamageEffects;
window.clearAllDamageEffects = clearAllDamageEffects; 
window.emergencyClearDamageEffects = emergencyClearDamageEffects; 
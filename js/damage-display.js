// Système d'affichage des dégâts - Mon RPG 2D

// Liste des dégâts en cours d'animation
const damageNumbers = [];
const damageEffects = [];

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

// Créer un effet de dégâts
function createDamageEffect(x, y, damage, type = 'damage', isPlayer = false, isCrit = false) {
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
    const effect = {
        x: x + TILE_SIZE / 2,
        y: y + TILE_SIZE / 2,
        startTime: Date.now(),
        duration: 800,
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
    
    for (let i = damageEffects.length - 1; i >= 0; i--) {
        const effect = damageEffects[i];
        const elapsed = currentTime - effect.startTime;
        const progress = elapsed / effect.duration;
        
        if (progress >= 1) {
            // Supprimer l'effet terminé
            damageEffects.splice(i, 1);
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
}

// Dessiner les effets de dégâts
function drawDamageEffects(ctx) {
    ctx.save();
    
    for (const effect of damageEffects) {
        if (effect.damage !== undefined) {
            // Dessiner le nombre de dégâts
            ctx.globalAlpha = effect.alpha;
            ctx.fillStyle = effect.color;
            ctx.font = `bold ${effect.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Ombre pour la lisibilité
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillText(effect.damage, effect.x + 1, effect.y + 1);
            
            // Texte principal
            ctx.fillStyle = effect.color;
            ctx.fillText(effect.damage, effect.x, effect.y);
            
        } else if (effect.type === 'sprite_flash') {
            // Effet de changement de couleur du sprite - seulement sur les pixels non-transparents
            const progress = (Date.now() - effect.startTime) / effect.duration;
            const alpha = 0.4 * (1 - progress);
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = effect.color;
            ctx.fillRect(effect.x, effect.y, TILE_SIZE, TILE_SIZE);
            ctx.restore();
        } else if (effect.type === 'crit_flash') {
            // Effet spécial pour les coups critiques - explosion impressionnante
            const progress = (Date.now() - effect.startTime) / effect.duration;
            const alpha = effect.alpha * (1 - progress);
            
            // Créer une explosion plus impressionnante
            const numParticles = 16;
            const baseSize = 6;
            const explosionRadius = 45;
            const colors = ['#ff0000', '#ffff00', '#ff6600', '#ff0066', '#ffffff'];
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // Premier cercle d'explosion
            for (let i = 0; i < numParticles; i++) {
                const angle = (i / numParticles) * 2 * Math.PI;
                const distance = explosionRadius * progress;
                const particleX = effect.x + Math.cos(angle) * distance;
                const particleY = effect.y + Math.sin(angle) * distance;
                const particleSize = baseSize * (1 - progress * 0.3);
                
                // Couleurs variées
                ctx.fillStyle = colors[i % colors.length];
                ctx.beginPath();
                ctx.arc(particleX, particleY, particleSize, 0, 2 * Math.PI);
                ctx.fill();
            }
            
            // Deuxième cercle d'explosion (plus petit, plus rapide)
            const innerRadius = 20;
            const innerParticles = 8;
            for (let i = 0; i < innerParticles; i++) {
                const angle = (i / innerParticles) * 2 * Math.PI;
                const distance = innerRadius * progress * 1.5;
                const particleX = effect.x + Math.cos(angle) * distance;
                const particleY = effect.y + Math.sin(angle) * distance;
                const particleSize = baseSize * 1.5 * (1 - progress * 0.7);
                
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(particleX, particleY, particleSize, 0, 2 * Math.PI);
                ctx.fill();
            }
            
            // Flash central
            const flashSize = 12 * (1 - progress);
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = alpha * 0.8;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, flashSize, 0, 2 * Math.PI);
            ctx.fill();
            
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
                const particleX = effect.x + Math.cos(angle) * distance;
                const particleY = effect.y + Math.sin(angle) * distance;
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

// Fonctions d'export
window.displayDamage = displayDamage;
window.updateDamageEffects = updateDamageEffects;
window.drawDamageEffects = drawDamageEffects; 
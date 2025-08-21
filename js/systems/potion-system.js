// js/systems/potion-system.js

// Système de gestion des potions
class PotionSystem {
    constructor() {
        this.potions = {};
        this.cooldowns = new Map(); // Gestion des cooldowns par type de potion
        this.activeEffects = new Map(); // Effets actifs (régénération, etc.)
        this.globalCooldown = 1000; // 1 seconde entre les potions
        this.lastPotionUse = 0;
        
        // Initialiser les définitions de potions
        this.initPotionDefinitions();
        
        console.log('🧪 Système de potions initialisé');
    }

    // Définir les types de potions disponibles
    initPotionDefinitions() {
        this.potions = {
            'potion_soin_basique': {
                id: 'potion_soin_basique',
                name: 'Potion de Soin Basique',
                type: 'heal_instant',
                healAmount: 50,
                cooldown: 3000,
                description: 'Restaure instantanément 50 points de vie.',
                rarity: 'common',
                useSound: null,
                effects: {
                    particles: true,
                    floatingText: true,
                    animation: 'heal'
                }
            }
        };
    }

    // Utiliser une potion
    usePotion(potionId, itemFromInventory = null) {
        console.log('🧪 Tentative d\'utilisation de potion:', potionId);
        
        // Vérifier si la potion existe dans nos définitions
        const potionDef = this.potions[potionId];
        if (!potionDef) {
            console.error('❌ Potion non définie:', potionId);
            return false;
        }

        // Vérifier le joueur
        if (!window.player) {
            console.error('❌ Joueur non trouvé');
            return false;
        }

        // Vérifier le cooldown global
        const now = Date.now();
        if (now - this.lastPotionUse < this.globalCooldown) {
            console.log('⏰ Cooldown global actif');
            this.showCooldownMessage();
            return false;
        }

        // Vérifier le cooldown spécifique de la potion
        const lastUse = this.cooldowns.get(potionId) || 0;
        if (now - lastUse < potionDef.cooldown) {
            const remaining = Math.ceil((potionDef.cooldown - (now - lastUse)) / 1000);
            console.log(`⏰ Cooldown actif pour ${potionDef.name}: ${remaining}s restantes`);
            this.showCooldownMessage(remaining);
            return false;
        }

        // Appliquer l'effet selon le type de potion
        let success = false;
        switch (potionDef.type) {
            case 'heal_instant':
                success = this.applyInstantHeal(potionDef);
                break;
            case 'heal_over_time':
                success = this.applyHealOverTime(potionDef);
                break;
            case 'cure_poison':
                success = this.applyCurePoison(potionDef);
                break;
            case 'buff':
                success = this.applyBuff(potionDef);
                break;
            default:
                console.error('❌ Type de potion inconnu:', potionDef.type);
                return false;
        }

        if (success) {
            // Enregistrer l'utilisation
            this.cooldowns.set(potionId, now);
            this.lastPotionUse = now;

            // Effets visuels et sonores
            this.playUseEffects(potionDef);

            console.log(`✅ Potion ${potionDef.name} utilisée avec succès`);
            return true;
        }

        return false;
    }

    // Appliquer un soin instantané
    applyInstantHeal(potionDef) {
        const player = window.player;
        
        if (!player) {
            console.error('❌ Joueur non trouvé');
            return false;
        }
        
        // Utiliser life/maxLife (système du jeu)
        const currentLife = player.life || 0;
        const maxLife = player.maxLife || 100;
        
        console.log(`🩺 État avant soin: ${currentLife}/${maxLife} HP`);
        
        if (currentLife >= maxLife) {
            console.log('💚 Joueur déjà au maximum de vie');
            this.showMessage('Vous êtes déjà en pleine santé !', 'info');
            return false;
        }

        // Calculer le soin
        const healAmount = potionDef.healAmount;
        const oldLife = currentLife;
        const newLife = Math.min(maxLife, currentLife + healAmount);
        const actualHeal = newLife - oldLife;

        // Appliquer le soin au système life du jeu
        player.life = newLife;
        
        console.log(`💚 Soin appliqué: +${actualHeal} HP (${newLife}/${maxLife})`);

        // Mettre à jour l'affichage des PV
        if (typeof window.updateHealthDisplay === 'function') {
            window.updateHealthDisplay();
        }
        if (typeof window.updateHUD === 'function') {
            window.updateHUD();
        }
        if (typeof window.updateStatsDisplay === 'function') {
            window.updateStatsDisplay();
        }

        // Afficher le soin
        this.showHealEffect(actualHeal);

        return true;
    }

    // Appliquer un soin sur la durée (régénération)
    applyHealOverTime(potionDef) {
        const effectId = `heal_over_time_${potionDef.id}`;
        
        // Supprimer l'effet existant s'il y en a un
        if (this.activeEffects.has(effectId)) {
            clearInterval(this.activeEffects.get(effectId).interval);
        }

        const duration = potionDef.duration || 30000; // 30 secondes par défaut
        const tickInterval = potionDef.tickInterval || 2000; // 2 secondes par défaut
        const healPerTick = potionDef.healPerTick || 10;
        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= duration) {
                clearInterval(interval);
                this.activeEffects.delete(effectId);
                this.showMessage('Effet de régénération terminé', 'info');
                return;
            }

            // Appliquer le soin du tick
            this.applyInstantHeal({
                healAmount: healPerTick,
                effects: { floatingText: true, particles: false }
            });
        }, tickInterval);

        this.activeEffects.set(effectId, {
            interval: interval,
            startTime: startTime,
            duration: duration,
            type: 'heal_over_time'
        });

        this.showMessage(`Régénération active (${duration/1000}s)`, 'positive');
        return true;
    }

    // Soigner les poisons (futur)
    applyCurePoison(potionDef) {
        // TODO: Implémenter quand le système de poison sera ajouté
        this.showMessage('Poisons neutralisés !', 'positive');
        return true;
    }

    // Appliquer un buff temporaire (futur)
    applyBuff(potionDef) {
        // TODO: Implémenter les buffs temporaires
        this.showMessage(`Buff ${potionDef.name} appliqué !`, 'positive');
        return true;
    }

    // Afficher l'effet de soin
    showHealEffect(healAmount) {
        if (!window.player) return;

        // Affichage de texte flottant
        if (typeof window.displayDamage === 'function') {
            const x = window.player.px || window.player.x * 32 || 0;
            const y = window.player.py || window.player.y * 32 || 0;
            window.displayDamage(x, y, healAmount, 'heal', true);
        } else if (typeof window.showFloatingMessage === 'function') {
            const x = window.player.x || 0;
            const y = window.player.y || 0;
            window.showFloatingMessage(`+${healAmount} HP`, x, y - 30, '#4CAF50', '18px');
        }

        // TODO: Ajouter des particules d'effet
        this.showHealParticles();
    }

    // Particules de soin (basique pour l'instant)
    showHealParticles() {
        // TODO: Implémenter un système de particules plus avancé
        console.log('✨ Effet de particules de soin');
    }

    // Afficher un message de cooldown
    showCooldownMessage(remaining = null) {
        const message = remaining 
            ? `Potion en cooldown (${remaining}s)` 
            : 'Patientez avant d\'utiliser une autre potion';
        this.showMessage(message, 'warning');
    }

    // Afficher un message générique
    showMessage(text, type = 'info') {
        if (typeof window.showFloatingMessage === 'function' && window.player) {
            const colors = {
                'info': '#2196F3',
                'warning': '#FF9800',
                'positive': '#4CAF50',
                'error': '#F44336'
            };
            const color = colors[type] || colors.info;
            window.showFloatingMessage(text, window.player.x, window.player.y - 60, color, '14px');
        } else {
            console.log(`📢 ${text}`);
        }
    }

    // Jouer les effets d'utilisation
    playUseEffects(potionDef) {
        // TODO: Ajouter des sons
        if (potionDef.useSound) {
            // this.playSound(potionDef.useSound);
        }

        // Effets visuels spéciaux selon le type
        if (potionDef.effects) {
            if (potionDef.effects.animation) {
                this.playAnimation(potionDef.effects.animation);
            }
        }
    }

    // Animation d'utilisation (basique)
    playAnimation(animationType) {
        // TODO: Implémenter des animations plus sophistiquées
        console.log(`🎬 Animation: ${animationType}`);
    }

    // Vérifier si une potion peut être utilisée
    canUsePotion(potionId) {
        const potionDef = this.potions[potionId];
        if (!potionDef) return false;

        const now = Date.now();
        
        // Vérifier cooldown global
        if (now - this.lastPotionUse < this.globalCooldown) {
            return false;
        }

        // Vérifier cooldown spécifique
        const lastUse = this.cooldowns.get(potionId) || 0;
        if (now - lastUse < potionDef.cooldown) {
            return false;
        }

        return true;
    }

    // Obtenir le temps restant du cooldown
    getCooldownRemaining(potionId) {
        const potionDef = this.potions[potionId];
        if (!potionDef) return 0;

        const now = Date.now();
        const lastUse = this.cooldowns.get(potionId) || 0;
        const remaining = potionDef.cooldown - (now - lastUse);
        
        return Math.max(0, remaining);
    }

    // Obtenir les informations d'une potion pour l'affichage
    getPotionInfo(potionId) {
        const potionDef = this.potions[potionId];
        if (!potionDef) return null;

        return {
            ...potionDef,
            canUse: this.canUsePotion(potionId),
            cooldownRemaining: this.getCooldownRemaining(potionId)
        };
    }

    // Ajouter une nouvelle définition de potion
    addPotionDefinition(potionId, definition) {
        this.potions[potionId] = definition;
        console.log(`🧪 Nouvelle potion ajoutée: ${definition.name}`);
    }

    // Nettoyer les effets actifs (appelé lors de la déconnexion/reset)
    cleanup() {
        for (const [effectId, effect] of this.activeEffects.entries()) {
            if (effect.interval) {
                clearInterval(effect.interval);
            }
        }
        this.activeEffects.clear();
        this.cooldowns.clear();
        console.log('🧹 Système de potions nettoyé');
    }
}

// Initialiser le système de potions
window.potionSystem = new PotionSystem();

// Fonction principale pour utiliser une potion (compatible avec l'ancien système)
function useHealingPotion(itemId) {
    return window.potionSystem.usePotion(itemId);
}

// Fonction pour obtenir les infos d'une potion
function getPotionInfo(potionId) {
    return window.potionSystem.getPotionInfo(potionId);
}

// Fonction pour vérifier si une potion peut être utilisée
function canUsePotion(potionId) {
    return window.potionSystem.canUsePotion(potionId);
}

// Exporter les fonctions pour compatibilité
window.useHealingPotion = useHealingPotion;
window.getPotionInfo = getPotionInfo;
window.canUsePotion = canUsePotion;

// Nettoyer lors du rechargement de la page
window.addEventListener('beforeunload', () => {
    if (window.potionSystem) {
        window.potionSystem.cleanup();
    }
});

console.log('✅ Système de potions chargé et prêt');
// Sort Poingheal - Fichier indépendant
// Créé pour éviter de casser le code existant

// Configuration du sort Poingheal
const POINGHEAL_SPELL = {
    id: 'spell-slot-4',
    name: 'Poingheal',
    icon: 'assets/sorts/poingheal.png',
    levelRequired: 15,
    baseMin: 10,
    baseMax: 15,
    cooldown: 12.0,
    specialEffect: 'poinghealEffect',
    unlocked: false,
    healPercentage: 0.20 // 20% des dégâts infligés
};

// Fonction pour initialiser le sort Poingheal
function initPoinghealSpell() {
    // Ajouter le sort à la liste des sorts si il n'existe pas déjà
    if (!window.SPELLS) {
        window.SPELLS = {};
    }
    
    // Vérifier si le sort existe déjà pour éviter les doublons
    if (!window.SPELLS[POINGHEAL_SPELL.id]) {
        window.SPELLS[POINGHEAL_SPELL.id] = POINGHEAL_SPELL;
        console.log('✨ Sort Poingheal ajouté au système de sorts');
    }
    
    // Ajouter la fonction d'effet spécial
    window.poinghealEffect = function(targetX, targetY) {
        // L'effet de soin sera géré dans la fonction castPoingheal
        console.log('💚 Effet Poingheal déclenché');
    };
}

// Fonction pour lancer le sort Poingheal
function castPoingheal() {
    if (!window.player || !window.player.inCombat) {
        console.log('❌ Poingheal: Le joueur n\'est pas en combat');
        return;
    }
    
    const slot = document.getElementById(POINGHEAL_SPELL.id);
    if (!slot || slot.classList.contains('cooldown')) {
        console.log('❌ Poingheal: Sort en cooldown ou slot non trouvé');
        return;
    }
    
    // Trouver la cible en combat
    const attackTarget = window.attackTarget;
    if (!attackTarget || attackTarget.hp <= 0) {
        console.log('❌ Poingheal: Aucune cible valide');
        return;
    }
    
    // Vérifier la distance
    if (Math.abs(window.player.x - attackTarget.x) + Math.abs(window.player.y - attackTarget.y) !== 1) {
        console.log('❌ Poingheal: Cible trop éloignée');
        return;
    }
    
    // Démarrer le cooldown immédiatement pour éviter les abus
    if (typeof window.startSpellCooldown === 'function') {
        window.startSpellCooldown(POINGHEAL_SPELL.id, POINGHEAL_SPELL.cooldown);
    }
    
    // Calculer les dégâts
    const { damage, isCrit } = computePoinghealDamage();
    
    // Gain d'XP de force à chaque attaque
    if (typeof window.gainStatXP === "function") {
        window.gainStatXP('force', 1);
    }
    if (isCrit) {
        // Gain d'XP d'agilité lors d'un coup critique
        if (typeof window.gainStatXP === "function") {
            window.gainStatXP('agilite', 1);
        }
    }
    
    // Attaque du joueur
    const baseDamage = damage;
    // Prendre en compte la défense du monstre, minimum 1 dégât
    const finalDamage = Math.max(1, baseDamage - (attackTarget.defense || 0));
    attackTarget.hp -= finalDamage;
    
    // DÉCLENCHER L'AGGRO SEULEMENT LORS D'UNE VRAIE ATTAQUE
    attackTarget.aggro = true;
    attackTarget.aggroTarget = window.player;
    attackTarget.lastCombat = Date.now();
    window.player.inCombat = true;
    
    // Afficher les dégâts sur la cible
    if (typeof window.displayDamage === 'function') {
        window.displayDamage(attackTarget.px, attackTarget.py, finalDamage, isCrit ? 'critique' : 'damage', false);
    }
    
    // Aligner le monstre sur sa case pendant le combat
    if (typeof window.alignMonsterToGrid === 'function') {
        window.alignMonsterToGrid(attackTarget);
    }
    
    // Calculer le soin (20% des dégâts infligés)
    const healAmount = Math.floor(finalDamage * POINGHEAL_SPELL.healPercentage);
    
    // Soigner le joueur
    if (window.player && window.player.life < window.player.maxLife) {
        const oldLife = window.player.life;
        window.player.life = Math.min(window.player.maxLife, window.player.life + healAmount);
        const actualHeal = window.player.life - oldLife;
        
        // Afficher le soin sur le joueur
        if (typeof window.displayDamage === 'function' && actualHeal > 0) {
            window.displayDamage(window.player.px, window.player.py, actualHeal, 'heal', true);
        }
        
        console.log(`💚 Poingheal: Soin de ${actualHeal} HP (${healAmount} calculé)`);
    }
    
    // Riposte du monstre si vivant (sauf pour les slimes et boss slime qui ont leur propre système d'attaque)
    if (attackTarget.hp > 0 && attackTarget.type !== "slime" && attackTarget.type !== "slimeboss") {
        // Cooldown de riposte pour éviter les attaques doubles
        const riposteCooldown = 1000; // 1 seconde de cooldown
        if (!attackTarget.lastRiposte || (Date.now() - attackTarget.lastRiposte) >= riposteCooldown) {
            // Calcul des dégâts du monstre : dégâts de base + force du monstre avec variation de 25%
            const monsterBaseDamage = attackTarget.damage !== undefined ? attackTarget.damage : 3;
            const monsterTotalDamage = monsterBaseDamage + (attackTarget.force || 0);
            const variation = 0.25; // 25% de variation
            const randomFactor = 1 + (Math.random() * 2 - 1) * variation; // Entre 0.75 et 1.25
            const monsterDamage = Math.max(1, Math.floor(monsterTotalDamage * randomFactor) - window.player.defense);
            window.player.life -= monsterDamage;
            if (window.player.life < 0) window.player.life = 0;
            
            // Afficher les dégâts reçus par le joueur
            if (typeof window.displayDamage === "function") {
                window.displayDamage(window.player.px, window.player.py, monsterDamage, 'damage', true);
            }
            
            // XP défense pour avoir reçu des dégâts
            if (typeof window.gainStatXP === "function") {
                window.gainStatXP('defense', 1);
            }
            
            // Marquer le temps de la dernière riposte
            attackTarget.lastRiposte = Date.now();
        }
    }
    
    // Monstre mort
    if (attackTarget.hp <= 0) {
        if (typeof window.release === "function") window.release(attackTarget.x, attackTarget.y);
        
        // Afficher l'XP gagné au-dessus du joueur
        if (typeof window.displayDamage === "function") {
            window.displayDamage(window.player.px, window.player.py, `+${attackTarget.xpValue || 0} XP`, 'xp', true);
        }
        
        if (typeof window.gainXP === "function") window.gainXP(attackTarget.xpValue || 0);
        
        // Déclencher le système de loot
        if (typeof window.triggerLoot === 'function') {
            window.triggerLoot(attackTarget);
        }
        
        if (typeof window.killMonster === "function") {
            window.killMonster(attackTarget);
        }
        attackTarget.aggro = false;
        attackTarget.aggroTarget = null;
        window.attackTarget = null;
        window.player.inCombat = false;
    }
    
    console.log(`⚔️ Poingheal: ${finalDamage} dégâts infligés, ${healAmount} soin calculé`);
}

// Fonction pour calculer les dégâts du Poingheal
function computePoinghealDamage() {
    // Utiliser les dégâts améliorés s'ils existent, sinon les dégâts de base
    let minDamage = POINGHEAL_SPELL.baseMin;
    let maxDamage = POINGHEAL_SPELL.baseMax;
    
    if (window.poinghealDamageMin !== undefined && window.poinghealDamageMax !== undefined) {
        minDamage = window.poinghealDamageMin;
        maxDamage = window.poinghealDamageMax;
        console.log(`⚔️ Poingheal - Dégâts améliorés utilisés: ${minDamage}-${maxDamage} (base: ${POINGHEAL_SPELL.baseMin}-${POINGHEAL_SPELL.baseMax})`);
    } else {
        console.log(`⚔️ Poingheal - Dégâts de base utilisés: ${minDamage}-${maxDamage}`);
    }
    
    const base = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
    
    // Bonus de force du joueur
    const bonus = window.player ? (1 + (window.player.force * 0.05)) : 1;
    let damage = Math.floor(base * bonus);
    
    // Vérifier les coups critiques
    let isCrit = false;
    if (typeof window.isPlayerCrit === 'function' && window.isPlayerCrit()) {
        const critMultiplier = 1.5;
        const critBonus = (typeof window.getPlayerCritDamage === 'function') ? window.getPlayerCritDamage() : 0;
        damage = Math.floor(damage * critMultiplier * (1 + critBonus));
        isCrit = true;
    }
    
    return { damage, isCrit };
}

// Fonction pour configurer l'interface du sort dans la fenêtre des sorts
function addPoinghealToUI() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addPoinghealToUI);
        return;
    }
    
    const sortRow = document.getElementById('sort-poingheal-row');
    if (!sortRow) {
        console.log('❌ Poingheal: Ligne du sort non trouvée dans le HTML');
        return;
    }
    
    // L'événement de sélection est maintenant géré dans main.js
    // Pas besoin d'ajouter un gestionnaire ici
    
    console.log('✨ Interface Poingheal configurée');
}

// Fonction pour afficher les détails du sort Poingheal (maintenant gérée dans main.js)
function showPoinghealDetails() {
    // Cette fonction n'est plus nécessaire car la gestion est faite dans main.js
    console.log('✨ showPoinghealDetails: Gestion maintenant dans main.js');
}

// Fonction pour configurer le slot du sort dans la barre de raccourcis
function addPoinghealSlot() {
    const spellSlot = document.getElementById(POINGHEAL_SPELL.id);
    if (!spellSlot) {
        console.log('❌ Poingheal: Slot non trouvé dans le HTML');
        return;
    }
    
    // Ajouter l'événement de clic
    spellSlot.addEventListener('click', () => {
        if (!spellSlot.classList.contains('locked') && !spellSlot.classList.contains('cooldown')) {
            castPoingheal();
        }
    });
    
    console.log('✨ Slot Poingheal configuré');
}

// Fonction pour mettre à jour le statut de déverrouillage du sort
function updatePoinghealUnlockStatus() {
    const spellSlot = document.getElementById(POINGHEAL_SPELL.id);
    const sortRow = document.getElementById('sort-poingheal-row');
    
    if (!window.player) return;
    
    const isUnlocked = window.player.level >= POINGHEAL_SPELL.levelRequired;
    
    // Mettre à jour le sort dans la liste
    if (window.SPELLS[POINGHEAL_SPELL.id]) {
        window.SPELLS[POINGHEAL_SPELL.id].unlocked = isUnlocked;
    }
    
    // Mettre à jour l'interface
    if (spellSlot) {
        if (isUnlocked) {
            spellSlot.classList.remove('locked');
            spellSlot.classList.add('unlocked');
        } else {
            spellSlot.classList.add('locked');
            spellSlot.classList.remove('unlocked');
        }
    }
    
    if (sortRow) {
        if (isUnlocked) {
            sortRow.classList.remove('locked');
        } else {
            sortRow.classList.add('locked');
        }
    }
    
    // Animation de déverrouillage si le sort vient d'être débloqué
    if (isUnlocked && spellSlot && spellSlot.classList.contains('unlocking')) {
        spellSlot.classList.remove('unlocking');
        spellSlot.classList.add('unlocked');
        
        // Message de notification
        if (typeof window.addChatMessage === 'function') {
            window.addChatMessage(`🎉 Nouveau sort débloqué : ${POINGHEAL_SPELL.name} !`, 'system');
        }
    }
}

// Fonction pour surveiller les changements de niveau du joueur
function startPoinghealLevelMonitoring() {
    let lastLevel = window.player ? window.player.level : 0;
    
    // Vérifier périodiquement si le niveau a changé
    setInterval(() => {
        if (window.player && window.player.level !== lastLevel) {
            lastLevel = window.player.level;
            updatePoinghealUnlockStatus();
        }
    }, 1000); // Vérifier toutes les secondes
}

// Fonction d'initialisation complète
function initPoinghealSystem() {
    console.log('🚀 Initialisation du système Poingheal...');
    
    // Initialiser le sort
    initPoinghealSpell();
    
    // Ajouter l'interface
    addPoinghealToUI();
    
    // Ajouter le slot
    addPoinghealSlot();
    
    // Ajouter le raccourci clavier
    addPoinghealKeyboardShortcut();
    
    // Mettre à jour le statut de déverrouillage
    updatePoinghealUnlockStatus();
    
    // Démarrer la surveillance du niveau
    startPoinghealLevelMonitoring();
    
    console.log('✅ Système Poingheal initialisé avec succès');
}

// Initialiser le système quand le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPoinghealSystem);
} else {
    initPoinghealSystem();
}

// Fonction pour ajouter le raccourci clavier
function addPoinghealKeyboardShortcut() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addPoinghealKeyboardShortcut);
        return;
    }
    
    // Ajouter le raccourci clavier pour le sort 4 (touches '4' ou '$')
    window.addEventListener('keydown', (e) => {
        if (e.key === '4' || e.key === '$' || e.code === 'Digit4' || e.code === 'Key4') {
            const spell = window.SPELLS && window.SPELLS['spell-slot-4'];
            if (spell && spell.unlocked) {
                castPoingheal();
            } else if (spell) {
                if (typeof window.addChatMessage === 'function') {
                    window.addChatMessage(`Niveau ${spell.levelRequired} requis pour ${spell.name}`, 'system');
                }
            }
        }
    });
    
    console.log('⌨️ Raccourci clavier Poingheal ajouté (touche 4)');
}

// Exporter les fonctions pour utilisation externe
window.castPoingheal = castPoingheal;
window.updatePoinghealUnlockStatus = updatePoinghealUnlockStatus;
window.initPoinghealSystem = initPoinghealSystem; 
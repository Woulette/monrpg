// =======================
// GESTIONNAIRE DES SORTS PAR CLASSE
// =======================
// Ce système masque/affiche les sorts selon la classe du joueur

class ClassSpellManager {
    constructor() {
        this.initialized = false;
        this.currentClass = null;
    }
    
    init() {
        if (this.initialized) return;
        
        // Écouter les changements de classe
        this.setupClassChangeListener();
        
        // Initialiser l'affichage des sorts
        this.updateSpellDisplay();
        
        // Initialiser la portée d'attaque selon la classe actuelle
        this.updateGlobalAttackRange();
        
        this.initialized = true;
        console.log('🎭 ClassSpellManager initialisé');
    }
    
    setupClassChangeListener() {
        // Vérifier la classe toutes les secondes
        setInterval(() => {
            if (window.player && window.player.class !== this.currentClass) {
                console.log(`🎭 Changement de classe détecté: ${this.currentClass} → ${window.player.class}`);
                this.currentClass = window.player.class;
                this.updateSpellDisplay();
            }
        }, 1000);
    }
    
    updateSpellDisplay() {
        if (!window.player) return;
        
        const playerClass = window.player.class;
        console.log(`🎭 Mise à jour de l'affichage des sorts pour la classe: ${playerClass}`);
        
        switch (playerClass) {
            case 'mage':
                this.showMageSpells();
                break;
            case 'aventurier':
            default:
                this.showAdventurerSpells();
                break;
        }
        
        // Mettre à jour la portée d'attaque après le changement de classe
        this.updateGlobalAttackRange();
    }
    
    showMageSpells() {
        console.log('🔥 Affichage des sorts Mage');
        
        // Masquer TOUS les sorts d'aventurier
        this.hideAllAdventurerSpells();
        
        // Afficher SEULEMENT Boule de feu
        this.showBouleDeFeu();
        
        // Remplacer l'attaque de base
        this.setMageBaseAttack();
    }
    
    showAdventurerSpells() {
        console.log('🏃 Affichage des sorts Aventurier');
        
        // Masquer Boule de feu
        this.hideBouleDeFeu();
        
        // Afficher tous les sorts d'aventurier
        this.showAllAdventurerSpells();
        
        // Restaurer l'attaque de base aventurier
        this.setAdventurerBaseAttack();
    }
    
    hideAllAdventurerSpells() {
        // Masquer tous les sorts d'aventurier
        const adventurerSpells = [
            'spell-slot-1', // Coup de poing
            'spell-slot-2', // Coup de poing explosif
            'spell-slot-3', // Triple Coup de Poing
            'spell-slot-4', // Poingheal
            'spell-slot-5'  // Rassemblement
        ];
        
        adventurerSpells.forEach(slotId => {
            const slot = document.getElementById(slotId);
            if (slot) {
                slot.style.display = 'none';
                slot.classList.add('class-hidden');
                console.log(`🚫 Sort masqué: ${slotId}`);
            }
        });
    }
    
    showAllAdventurerSpells() {
        // Afficher tous les sorts d'aventurier
        const adventurerSpells = [
            'spell-slot-1', // Coup de poing
            'spell-slot-2', // Coup de poing explosif
            'spell-slot-3', // Triple Coup de Poing
            'spell-slot-4', // Poingheal
            'spell-slot-5'  // Rassemblement
        ];
        
        adventurerSpells.forEach(slotId => {
            const slot = document.getElementById(slotId);
            if (slot) {
                slot.style.display = 'flex';
                slot.classList.remove('class-hidden');
                console.log(`✅ Sort affiché: ${slotId}`);
            }
        });
    }
    
    showBouleDeFeu() {
        // Modifier le slot 1 pour afficher Boule de feu
        const slot1 = document.getElementById('spell-slot-1');
        if (slot1) {
            // Changer l'icône et le nom
            slot1.innerHTML = `
                <span class="spell-icon">🔥</span>
                <span class="spell-cooldown" id="cooldown-1"></span>
            `;
            
            // Ajouter le titre
            slot1.title = 'Boule de feu (Mage)';
            
            // Rendre visible
            slot1.style.display = 'flex';
            slot1.classList.remove('class-hidden');
            
            // Ajouter l'événement de clic pour Boule de feu
            this.setupBouleDeFeuClick(slot1);
            
            console.log('🔥 Boule de feu affichée dans le slot 1');
        }
    }
    
    hideBouleDeFeu() {
        // Restaurer le slot 1 pour Coup de poing
        const slot1 = document.getElementById('spell-slot-1');
        if (slot1) {
            // Restaurer l'icône et le nom d'origine
            slot1.innerHTML = `
                <span class="spell-icon">👊</span>
                <span class="spell-cooldown" id="cooldown-1"></span>
            `;
            
            // Restaurer le titre
            slot1.title = 'Coup de poing';
            
            // Restaurer l'événement de clic pour Coup de poing
            this.setupPunchClick(slot1);
            
            console.log('👊 Coup de poing restauré dans le slot 1');
        }
    }
    
    setupBouleDeFeuClick(slot) {
        // Supprimer tous les événements existants
        const newSlot = slot.cloneNode(true);
        slot.parentNode.replaceChild(newSlot, slot);
        
        // Ajouter l'événement pour Boule de feu
        newSlot.addEventListener('click', () => {
            if (typeof window.castBouleDeFeu === 'function') {
                window.castBouleDeFeu();
            } else {
                console.error('❌ Fonction castBouleDeFeu non trouvée');
            }
        });
        
        // Restaurer l'ID
        newSlot.id = 'spell-slot-1';
    }
    
    setupPunchClick(slot) {
        // Supprimer tous les événements existants
        const newSlot = slot.cloneNode(true);
        slot.parentNode.replaceChild(newSlot, slot);
        
        // Ajouter l'événement pour Coup de poing
        newSlot.addEventListener('click', () => {
            if (typeof window.castPunch === 'function') {
                window.castPunch();
            } else {
                console.error('❌ Fonction castPunch non trouvée');
            }
        });
        
        // Restaurer l'ID
        newSlot.id = 'spell-slot-1';
    }
    
    setMageBaseAttack() {
        // Remplacer l'attaque de base par Boule de feu
        if (typeof window.castBouleDeFeu === 'function') {
            window.castBaseAttack = window.castBouleDeFeu;
            console.log('🔥 Attaque de base changée vers Boule de feu');
        }
        // Mettre à jour la portée d'attaque
        this.updateGlobalAttackRange();
    }
    
    setAdventurerBaseAttack() {
        // Restaurer l'attaque de base vers Coup de poing
        if (typeof window.castPunch === 'function') {
            window.castBaseAttack = window.castPunch;
            console.log('👊 Attaque de base restaurée vers Coup de poing');
        }
        // Mettre à jour la portée d'attaque
        this.updateGlobalAttackRange();
    }
    
    // Méthode pour forcer la mise à jour
    forceUpdate() {
        this.updateSpellDisplay();
    }
    
    // Méthode pour obtenir la portée d'attaque actuelle selon la classe
    getCurrentAttackRange() {
        if (!window.player) return 1; // Portée par défaut
        
        switch (window.player.class) {
            case 'mage':
                return 7; // Portée de 7 cases pour Boule de feu
            case 'aventurier':
            default:
                return 1; // Portée de 1 case (corps à corps)
        }
    }
    
    // Méthode pour mettre à jour la portée d'attaque globale
    updateGlobalAttackRange() {
        const currentRange = this.getCurrentAttackRange();
        if (window.PLAYER_ATTACK_RANGE !== undefined) {
            window.PLAYER_ATTACK_RANGE = currentRange;
            console.log(`🎯 Portée d'attaque mise à jour: ${currentRange} cases (${window.player.class})`);
        }
    }
}

// Créer une instance globale
window.classSpellManager = new ClassSpellManager();

// Initialisation automatique
function initClassSpellManager() {
    if (window.classSpellManager) {
        window.classSpellManager.init();
    }
}

// Initialisation quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClassSpellManager);
} else {
    initClassSpellManager();
}

// Exports globaux
window.ClassSpellManager = ClassSpellManager;
window.initClassSpellManager = initClassSpellManager;

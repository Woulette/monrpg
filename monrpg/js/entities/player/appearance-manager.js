// =======================
// GESTIONNAIRE D'APPARENCE PAR CLASSE
// =======================
// Ce système change automatiquement l'apparence du joueur selon sa classe

class PlayerAppearanceManager {
    constructor() {
        this.initialized = false;
        this.currentClass = null;
        this.playerImages = new Map();
        this.currentPlayerImage = null;
    }
    
    init() {
        if (this.initialized) return;
        
        // Charger toutes les images de personnage
        this.loadPlayerImages();
        
        // Écouter les changements de classe
        this.setupClassChangeListener();
        
        // Initialiser l'apparence
        this.updatePlayerAppearance();
        
        this.initialized = true;
        console.log('🎨 PlayerAppearanceManager initialisé');
    }
    
    loadPlayerImages() {
        // Image par défaut (aventurier) - Spritesheet avec animation
        const adventurerImg = new Image();
        adventurerImg.onload = () => console.log('✅ Image aventurier chargée');
        adventurerImg.onerror = () => console.error('❌ Erreur chargement image aventurier');
        adventurerImg.src = 'assets/personnages/player.png';
        adventurerImg.isSpritesheet = true; // Marquer comme spritesheet
        
        // Image mage - Image simple sans animation
        const mageImg = new Image();
        mageImg.onload = () => console.log('✅ Image mage chargée');
        mageImg.onerror = () => console.error('❌ Erreur chargement image mage');
        mageImg.src = 'assets/personnages/mage.png';
        mageImg.isSpritesheet = false; // Marquer comme image simple
        
        // Stocker les images
        this.playerImages.set('aventurier', adventurerImg);
        this.playerImages.set('mage', mageImg);
        
        // Image par défaut
        this.currentPlayerImage = adventurerImg;
    }
    
    setupClassChangeListener() {
        // Vérifier la classe toutes les secondes
        setInterval(() => {
            if (window.player && window.player.class !== this.currentClass) {
                console.log(`🎨 Changement de classe détecté: ${this.currentClass} → ${window.player.class}`);
                this.currentClass = window.player.class;
                this.updatePlayerAppearance();
            }
        }, 1000);
    }
    
    updatePlayerAppearance() {
        if (!window.player) return;
        
        const playerClass = window.player.class;
        console.log(`🎨 Mise à jour de l'apparence pour la classe: ${playerClass}`);
        
        // Changer l'image du joueur
        this.changePlayerImage(playerClass);
        
        // Mettre à jour l'image globale
        this.updateGlobalPlayerImage();
    }
    
    changePlayerImage(playerClass) {
        const newImage = this.playerImages.get(playerClass);
        
        if (newImage && newImage.complete) {
            this.currentPlayerImage = newImage;
            console.log(`🎨 Apparence changée vers: ${playerClass}`);
        } else {
            console.warn(`⚠️ Image pour la classe ${playerClass} pas encore chargée`);
        }
    }
    
    updateGlobalPlayerImage() {
        // Mettre à jour l'image globale utilisée par le système de rendu
        if (window.playerImg && this.currentPlayerImage) {
            // Sauvegarder l'ancienne image pour éviter les erreurs
            const oldImage = window.playerImg;
            
            // Remplacer l'image globale
            window.playerImg = this.currentPlayerImage;
            
            console.log('🎨 Image globale du joueur mise à jour');
            
            // Forcer le redessinage
            if (typeof window.redrawGame === 'function') {
                window.redrawGame();
            }
        }
    }
    
    // Méthode pour obtenir l'image actuelle
    getCurrentPlayerImage() {
        return this.currentPlayerImage;
    }
    
    // Méthode pour forcer la mise à jour
    forceUpdate() {
        this.updatePlayerAppearance();
    }
    
    // Méthode pour précharger toutes les images
    preloadAllImages() {
        this.playerImages.forEach((image, className) => {
            if (!image.complete) {
                console.log(`🔄 Préchargement de l'image: ${className}`);
            }
        });
    }
}

// Créer une instance globale
window.playerAppearanceManager = new PlayerAppearanceManager();

// Initialisation automatique
function initPlayerAppearanceManager() {
    if (window.playerAppearanceManager) {
        window.playerAppearanceManager.init();
    }
}

// Initialisation quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayerAppearanceManager);
} else {
    initPlayerAppearanceManager();
}

// Exports globaux
window.PlayerAppearanceManager = PlayerAppearanceManager;
window.initPlayerAppearanceManager = initPlayerAppearanceManager;

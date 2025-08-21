// Gestionnaire des PNJ Mentors - Système de changement de classe
// Inspiré du système de papi.js et de la structure d'index.js

// Liste des mentors
const mentors = [];

// Gestionnaire central des mentors
class MentorManager {
    constructor() {
        this.mentors = new Map();
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        
        // Charger les mentors
        this.loadMentors();
        
        this.initialized = true;
        console.log('🧙‍♂️ MentorManager initialisé');
    }
    
    loadMentors() {
        try {
            // Charger mentorsmage.js (PNJ mentor mage)
            if (typeof MentorMage !== 'undefined') {
                this.mentors.set('mentormage', MentorMage);
                console.log('✅ MentorMage chargé');
            } else {
                console.warn('⚠️ MentorMage non trouvé');
            }
        } catch (error) {
            console.warn("⚠️ Erreur lors du chargement des mentors:", error);
        }
    }
    
    createMentor(mentorType, x, y, options = {}) {
        const MentorClass = this.mentors.get(mentorType);
        
        if (!MentorClass) {
            console.error(`❌ Type de mentor non trouvé: ${mentorType}`);
            return null;
        }
        
        try {
            const mentor = new MentorClass(x, y, options);
            const mentorId = `mentor_${mentorType}_${Date.now()}`;
            
            // Ajouter à la liste globale des mentors
            mentors.push(mentor);
            
            console.log(`✅ Mentor ${mentorType} créé aux coordonnées (${x}, ${y})`);
            return mentor;
        } catch (error) {
            console.error(`❌ Erreur lors de la création du mentor:`, error);
            return null;
        }
    }
    
    createMentorMage(x, y, options = {}) {
        return this.createMentor('mentormage', x, y, options);
    }
    
    // Méthodes pour gérer les mentors
    update() {
        mentors.forEach(mentor => {
            if (mentor && typeof mentor.update === 'function') {
                mentor.update();
            }
        });
    }
    
    draw(ctx) {
        mentors.forEach(mentor => {
            if (mentor && typeof mentor.draw === 'function') {
                mentor.draw(ctx);
            }
        });
    }
    
    // Nettoyer tous les mentors
    clearAll() {
        mentors.forEach(mentor => {
            if (mentor && typeof mentor.destroy === 'function') {
                mentor.destroy();
            }
        });
        mentors.length = 0;
        console.log('🧹 Tous les mentors ont été nettoyés');
    }
    
    // Obtenir les mentors par map
    getMentorsByMap(mapName) {
        return mentors.filter(mentor => 
            mentor && (mentor.currentMap === mapName || mentor.mapName === mapName)
        );
    }
}

// Instance globale du gestionnaire de mentors
window.MentorManager = new MentorManager();

// Fonction d'initialisation automatique
function initMentors() {
    if (window.MentorManager) {
        window.MentorManager.init();
    }
}

// Initialisation automatique quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMentors);
} else {
    initMentors();
}

// Fonction pour initialiser les mentors selon la map
function initMentorsByMap() {
    // Protection contre l'initialisation multiple
    if (window.mentorsInitialized && window.mentorsInitialized === window.currentMap) {
        console.log('🧙‍♂️ Les mentors sont déjà initialisés pour cette map:', window.currentMap);
        return;
    }
    
    console.log('🧙‍♂️ Initialisation des mentors pour la map:', window.currentMap);
    
    // Nettoyer les mentors existants
    mentors.forEach(mentor => {
        if (mentor && typeof mentor.destroy === 'function') {
            mentor.destroy();
        }
    });
    mentors.length = 0;
    
    const currentMap = window.currentMap;
    
    if (currentMap === "villagecentredroite") {
        // Créer le MentorMage sur la map villagecentredroite aux coordonnées (29, 5)
        if (window.MentorManager) {
            console.log('🧙‍♂️ Création du MentorMage aux coordonnées (29, 5)');
            const mentor = window.MentorManager.createMentorMage(29, 5);
            console.log('🧙‍♂️ MentorMage créé sur villagecentredroite aux coordonnées (29, 5)');
            
            // Debug: vérifier que le mentor a été créé
            if (mentor) {
                console.log('🧙‍♂️ MentorMage créé avec succès:');
                console.log('  - Position (x, y):', mentor.x, mentor.y);
                console.log('  - Position (px, py):', mentor.px, mentor.py);
                console.log('  - TILE_SIZE:', typeof TILE_SIZE !== 'undefined' ? TILE_SIZE : 'undefined');
            }
        }
    }
    
    // Marquer comme initialisé pour cette map
    window.mentorsInitialized = currentMap;
    
    // Ajouter d'autres maps ici si nécessaire
    // else if (currentMap === "autre_map") {
    //     // Créer d'autres mentors
    // }
}

// Fonction pour gérer les interactions avec les mentors
function checkMentorInteraction() {
    if (!window.player) return;
    
    mentors.forEach(mentor => {
        if (!mentor || !mentor.isInteracting) return;
        
        // Calculer la distance en tiles (comme Papi)
        const distance = Math.abs(window.player.x - mentor.x) + Math.abs(window.player.y - mentor.y);
        
        if (distance <= mentor.interactionRange) {
            // Le joueur est à portée d'interaction
            if (!mentor.dialogueOpen) {
                mentor.startInteraction();
            }
        }
    });
}

// Gestion des touches pour interagir avec les mentors
function handleMentorInteraction(key) {
    if (key === 'e' || key === 'E') {
        checkMentorInteraction();
    }
}

// Exports globaux
window.mentors = mentors;
window.initMentorsByMap = initMentorsByMap;
window.checkMentorInteraction = checkMentorInteraction;
window.handleMentorInteraction = handleMentorInteraction;

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MentorManager;
}

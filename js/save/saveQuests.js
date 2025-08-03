/**
 * Gestionnaire de sauvegarde des quêtes
 * Utilise le système existant dans quetes.js pour éviter les conflits
 */
class QuestsSaveManager {
    constructor() {
        this.version = '1.0';
        this.characterId = null;
    }

    /**
     * Sauvegarder les données de quêtes
     */
    saveQuestsData(characterId) {
        this.characterId = characterId;
        
        try {
            // Utiliser le système existant dans quetes.js
            if (typeof window.saveQuestsForCharacter === 'function') {
                window.saveQuestsForCharacter(characterId);
                return true;
            } else {
                console.warn('⚠️ Système de sauvegarde des quêtes non disponible');
                return false;
            }
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde des quêtes:', error);
            return false;
        }
    }

    /**
     * Charger les données de quêtes
     */
    loadQuestsData(characterId) {
        this.characterId = characterId;
        
        try {
            // Utiliser le système existant dans quetes.js
            if (typeof window.loadQuestsForCharacter === 'function') {
                const success = window.loadQuestsForCharacter(characterId);
                return success;
            } else {
                console.warn('⚠️ Système de chargement des quêtes non disponible');
                return false;
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des quêtes:', error);
            return false;
        }
    }

    /**
     * Supprimer les données de quêtes
     */
    deleteQuestsData(characterId) {
        this.characterId = characterId;
        
        try {
            // Utiliser le système existant dans quetes.js
            if (typeof window.deleteQuestsForCharacter === 'function') {
                window.deleteQuestsForCharacter(characterId);
                return true;
            } else {
                console.warn('⚠️ Système de suppression des quêtes non disponible');
                return false;
            }
        } catch (error) {
            console.error('❌ Erreur lors de la suppression des quêtes:', error);
            return false;
        }
    }

    /**
     * Créer des quêtes initiales pour un nouveau personnage
     */
    createInitialQuests(characterId) {
        this.characterId = characterId;
        
        try {
            // Utiliser la fonction de réinitialisation existante
            if (typeof window.resetQuestsToInitial === 'function') {
                window.resetQuestsToInitial();
                return true;
            } else {
                console.warn('⚠️ Fonction de réinitialisation des quêtes non disponible');
                return false;
            }
        } catch (error) {
            console.error('❌ Erreur lors de la création des quêtes initiales:', error);
            return false;
        }
    }

    /**
     * Valider les données de quêtes
     */
    validateData(data) {
        if (!data) return false;
        
        // Vérifications de base
        if (!data.quests || typeof data.quests !== 'object') {
            console.warn('⚠️ Données de quêtes invalides: propriété quests manquante');
            return false;
        }
        
        // Vérifier que les quêtes principales sont présentes
        const requiredQuests = ['crowHunt', 'crowCraft', 'slimeBoss', 'slimeBossFinal'];
        for (const questId of requiredQuests) {
            if (!data.quests[questId]) {
                console.warn(`⚠️ Quête requise manquante: ${questId}`);
                return false;
            }
        }
        
        return true;
    }

    /**
     * Obtenir des informations sur les quêtes
     */
    getQuestsInfo(characterId) {
        try {
            const saveKey = `monrpg_quests_${characterId}`;
            const savedData = localStorage.getItem(saveKey);
            
            if (!savedData) {
                return { exists: false, message: 'Aucune sauvegarde de quêtes trouvée' };
            }
            
            const data = JSON.parse(savedData);
            const quests = data.quests || {};
            
            const activeQuests = Object.values(quests).filter(q => q.accepted && !q.completed).length;
            const completedQuests = Object.values(quests).filter(q => q.completed).length;
            const totalQuests = Object.keys(quests).length;
            
            return {
                exists: true,
                activeQuests,
                completedQuests,
                totalQuests,
                lastSave: data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Inconnu'
            };
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des infos de quêtes:', error);
            return { exists: false, message: 'Erreur lors de la lecture des données' };
        }
    }
}

// Instance globale
const questsSaveManager = new QuestsSaveManager();

// Exports globaux pour compatibilité avec le système existant
window.saveQuestsData = (characterId) => questsSaveManager.saveQuestsData(characterId);
window.loadQuestsData = (characterId) => questsSaveManager.loadQuestsData(characterId);
window.deleteQuestsData = (characterId) => questsSaveManager.deleteQuestsData(characterId);
window.createInitialQuests = (characterId) => questsSaveManager.createInitialQuests(characterId);
window.getQuestsInfo = (characterId) => questsSaveManager.getQuestsInfo(characterId);

// Export pour le SaveManager
window.questsSaveManager = questsSaveManager;
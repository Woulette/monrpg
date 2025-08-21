// Gestionnaire des noms de personnages pour le multijoueur
// Récupère le nom du personnage depuis le système de sauvegarde

class PlayerNameManager {
    constructor() {
        this.currentPlayerName = null;
        this.currentCharacterId = null;
    }
    
    // Récupérer le nom du personnage actuel
    getCurrentPlayerName() {
        try {
            // Récupérer l'ID du personnage actuel
            const currentCharacterId = this.getCurrentCharacterId();
            if (!currentCharacterId) {
                console.log('❌ Aucun personnage sélectionné');
                return null;
            }
            
            // Récupérer les données du personnage depuis le localStorage
            const characterData = this.getCharacterData(currentCharacterId);
            if (characterData && characterData.name && characterData.name.trim() !== '') {
                console.log(`✅ Nom du personnage récupéré: ${characterData.name}`);
                return characterData.name.trim();
            } else {
                console.log('❌ Nom du personnage non trouvé ou vide');
                return null;
            }
        } catch (error) {
            console.error('❌ Erreur lors de la récupération du nom:', error);
            return null;
        }
    }
    
    // Récupérer l'ID du personnage actuel
    getCurrentCharacterId() {
        try {
            // Vérifier si un personnage est sélectionné
            if (window.currentCharacterId) {
                // Sauvegarder l'ID dans localStorage pour la prochaine fois
                localStorage.setItem('currentCharacterId', window.currentCharacterId);
                console.log(`💾 ID du personnage sauvegardé: ${window.currentCharacterId}`);
                return window.currentCharacterId;
            }
            
            // Essayer de récupérer depuis le localStorage
            const savedCharacterId = localStorage.getItem('currentCharacterId');
            if (savedCharacterId) {
                return savedCharacterId;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Erreur lors de la récupération de l\'ID du personnage:', error);
            return null;
        }
    }
    
    // Récupérer les données d'un personnage
    getCharacterData(characterId) {
        try {
            // Utiliser le système de sauvegarde existant du jeu
            const characterSlotsData = localStorage.getItem('monrpg_character_slots');
            
            if (characterSlotsData) {
                const characterSlots = JSON.parse(characterSlotsData);
                
                // Chercher le personnage par son ID dans les slots
                for (let i = 0; i < characterSlots.length; i++) {
                    const character = characterSlots[i];
                    if (character && character.id == characterId) {
                        console.log(`📂 Données du personnage ${characterId}:`, character);
                        return character;
                    }
                }
                
                console.log(`❌ Personnage ${characterId} non trouvé dans les slots`);
                return null;
            }
            
            console.log(`❌ Aucun slot de personnage trouvé dans localStorage`);
            return null;
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des données du personnage:', error);
            return null;
        }
    }
    
    // Mettre à jour le nom du personnage
    updatePlayerName() {
        this.currentPlayerName = this.getCurrentPlayerName();
        this.currentCharacterId = this.getCurrentCharacterId();
        
        console.log(`🔄 Nom du personnage mis à jour: ${this.currentPlayerName} (ID: ${this.currentCharacterId})`);
        
        return this.currentPlayerName;
    }
    
    // Obtenir le nom actuel
    getPlayerName() {
        if (!this.currentPlayerName) {
            this.updatePlayerName();
        }
        
        // Si on n'a pas de nom valide, retourner null
        if (!this.currentPlayerName || this.currentPlayerName.startsWith('Joueur_')) {
            return null;
        }
        
        return this.currentPlayerName;
    }
    
    // Fonction de diagnostic pour voir ce qui est dans localStorage
    diagnoseStorage() {
        console.log('🔍 Diagnostic du localStorage:');
        
        // Afficher toutes les clés du localStorage
        console.log('📋 Toutes les clés du localStorage:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            console.log(`  - ${key}: ${localStorage.getItem(key)}`);
        }
        
        console.log('\n👤 Personnages trouvés:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('character_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    console.log(`  - ${key}:`, data);
                } catch (e) {
                    console.log(`  - ${key}: [Erreur parsing]`);
                }
            }
        }
        
        // Afficher l'ID du personnage actuel
        console.log(`\n🎯 ID du personnage actuel:`);
        console.log(`  - currentCharacterId: ${localStorage.getItem('currentCharacterId')}`);
        console.log(`  - window.currentCharacterId: ${window.currentCharacterId}`);
    }
}

// Créer l'instance globale
window.playerNameManager = new PlayerNameManager();

console.log('📝 Gestionnaire de noms de personnages chargé'); 
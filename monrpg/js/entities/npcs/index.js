// Gestionnaire central des PNJ
class NPCManager {
    constructor() {
        this.npcs = new Map();
        this.questNPCs = new Map();
        this.commercialNPCs = new Map();
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        

        
        // Charger les PNJ de quêtes
        this.loadQuestNPCs();
        
        // Charger les PNJ commerciaux
        this.loadCommercialNPCs();
        
        this.initialized = true;

    }
    
    loadQuestNPCs() {
        try {
            // Charger papi.js (PNJ de quêtes)
            if (typeof Papi !== 'undefined') {
                this.questNPCs.set('papi', Papi);

            }
        } catch (error) {
            console.warn("⚠️ Erreur lors du chargement des PNJ de quêtes:", error);
        }
    }
    
    loadCommercialNPCs() {
        try {
            // Charger banquier.js (PNJ commercial)
            if (typeof Banquier !== 'undefined') {
                this.commercialNPCs.set('banquier', Banquier);

            }
        } catch (error) {
            console.warn("⚠️ Erreur lors du chargement des PNJ commerciaux:", error);
        }
    }
    
    createNPC(type, npcType, x, y, options = {}) {
        let NPCClass = null;
        
        if (type === 'quest') {
            NPCClass = this.questNPCs.get(npcType);
        } else if (type === 'commercial') {
            NPCClass = this.commercialNPCs.get(npcType);
        }
        
        if (!NPCClass) {
            console.error(`❌ Type de PNJ non trouvé: ${type}/${npcType}`);
            return null;
        }
        
        try {
            const npc = new NPCClass(x, y, options);
            const npcId = `${type}_${npcType}_${Date.now()}`;
            this.npcs.set(npcId, npc);
            

            return npc;
        } catch (error) {
            console.error(`❌ Erreur lors de la création du PNJ:`, error);
            return null;
        }
    }
    
    createBanquier(x, y) {
        return this.createNPC('commercial', 'banquier', x, y);
    }
    
    createPapi(x, y) {
        return this.createNPC('quest', 'papi', x, y);
    }
    
    update() {
        this.npcs.forEach((npc, id) => {
            if (npc && typeof npc.update === 'function') {
                npc.update();
            }
        });
    }
    
    draw(ctx) {
        this.npcs.forEach((npc, id) => {
            if (npc && typeof npc.draw === 'function') {
                npc.draw(ctx);
            }
        });
    }
    
    removeNPC(npcId) {
        if (this.npcs.has(npcId)) {
            const npc = this.npcs.get(npcId);
            if (npc && typeof npc.closeDialogue === 'function') {
                npc.closeDialogue();
            }
            this.npcs.delete(npcId);

        }
    }
    
    clearAll() {
        this.npcs.forEach((npc, id) => {
            if (npc && typeof npc.closeDialogue === 'function') {
                npc.closeDialogue();
            }
        });
        this.npcs.clear();

    }
    
    getNPCsByMap(mapName) {
        const mapNPCs = [];
        this.npcs.forEach((npc, id) => {
            if (npc.currentMap === mapName || npc.mapName === mapName) {
                mapNPCs.push({ id, npc });
            }
        });
        return mapNPCs;
    }
}

// Instance globale
window.NPCManager = new NPCManager();

// Fonction d'initialisation automatique
function initNPCs() {
    if (window.NPCManager) {
        window.NPCManager.init();
    }
}

// Initialisation automatique quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNPCs);
} else {
    initNPCs();
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCManager;
}

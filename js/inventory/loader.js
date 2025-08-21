// Fonction pour charger un script de manière synchrone
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Chargement séquentiel des modules
async function loadInventoryModules() {
    try {
        
        // Charger les modules dans l'ordre (chemins relatifs depuis le dossier inventory)
        await loadScript('js/inventory/core.js');
        await loadScript('js/inventory/grid.js');
        await loadScript('js/inventory/items.js');
        await loadScript('js/inventory/equipment-display.js');
        await loadScript('js/inventory/stats-display.js');
        await loadScript('js/inventory/tooltips.js');
        await loadScript('js/inventory/modals.js');
        // (supprimé) ancien trash-system remplacé par la poubelle intégrée aux onglets
        await loadScript('js/inventory/main.js');
        
        
        // PROTECTION : S'assurer qu'on n'est PAS dans le menu de personnages avant d'initialiser
        const isInCharacterMenu = document.body.classList.contains('character-menu-active') || 
                                 document.body.classList.contains('menu-active') ||
                                 window.gameState === 'menu' ||
                                 window.gameState === 'creation';
        
        if (isInCharacterMenu) {
            console.warn('⚠️ Inventaire NON initialisé - Menu de personnages actif');
            return;
        }
        
        // Initialiser l'inventaire après le chargement de tous les modules
        if (typeof initInventory === 'function') {
            initInventory();
        }
        
        // (supprimé) initialisation de l'ancien trash-system
        
        // Initialiser les événements du module main
        if (typeof initInventoryMain === 'function') {
            initInventoryMain();
        }
        
    } catch (error) {
        console.error("❌ Erreur lors du chargement des modules d'inventaire:", error);
    }
}

// Charger les modules quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadInventoryModules);
} else {
    loadInventoryModules();
} 
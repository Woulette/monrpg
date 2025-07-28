console.log("Fichier js/inventory/loader.js chargé - Système modulaire");

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
        console.log("🔄 Chargement des modules d'inventaire...");
        
        // Charger les modules dans l'ordre (chemins relatifs depuis le dossier inventory)
        await loadScript('js/inventory/core.js');
        await loadScript('js/inventory/grid.js');
        await loadScript('js/inventory/items.js');
        await loadScript('js/inventory/equipment-display.js');
        await loadScript('js/inventory/stats-display.js');
        await loadScript('js/inventory/tooltips.js');
        await loadScript('js/inventory/modals.js');
        await loadScript('js/inventory/main.js');
        
        console.log("✅ Tous les modules d'inventaire chargés avec succès");
        
        // Initialiser l'inventaire après le chargement de tous les modules
        if (typeof initInventory === 'function') {
            initInventory();
        }
        
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
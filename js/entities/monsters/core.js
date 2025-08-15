// Système de gestion des monstres - Core (Réorganisé)
// Nettoyé et validé le 30/07/2025 - par Cursor
// Fonctions déplacées vers les fichiers spécialisés :
// - counters.js : Compteurs de corbeaux
// - spawn.js : Création et spawn des monstres
// - respawn.js : Logique de respawn
// - combat.js : Mort et combat
// - slimeboss.js : Logique spécifique au SlimeBoss

function initMonsters() {
    // S'assurer que window.monsters est initialisé
    if (!window.monsters) {
        window.monsters = [];
    }
    
    // Attendre que la map soit complètement chargée
    setTimeout(() => {
        const currentMap = window.currentMap;
        
        // Nettoyer les monstres existants
        if (window.monsters && window.monsters.length > 0) {
            window.monsters.forEach(monster => {
                if (typeof release === "function") {
                    release(monster.x, monster.y);
                }
            });
            window.monsters.length = 0;
        }
        
        // Si le multijoueur/serveur est autoritaire pour les monstres, ne pas générer localement
        if ((window.multiplayerManager && window.multiplayerManager.connected) || window.authoritativeMonsters === true) {
            // Le serveur enverra 'monster_list' → on n'instancie rien ici
            if (typeof assignMonsterImages === "function") assignMonsterImages();
            return;
        }

        // ESSAYER DE CHARGER LES MONSTRES SAUVEGARDÉS D'ABORD
        if (currentMap && typeof window.loadMonstersForMap === "function") {
            const loaded = window.loadMonstersForMap(currentMap);
            if (loaded) {
                // Sauvegarder immédiatement pour nettoyer les données
                if (typeof window.saveMonstersForMap === "function") {
                    window.saveMonstersForMap(currentMap);
                }
                return; // Sortir, les monstres sont chargés
            }
        }
        
        // Si pas de sauvegarde, créer de nouveaux monstres selon la map
        if (currentMap && currentMap === "mapdonjonslimeboss") {
            // Nettoyage FORCÉ des slimes existants sur mapdonjonslimeboss
            if (typeof window.forceCleanSlimesOnBossMap === "function") {
                window.forceCleanSlimesOnBossMap();
            }
            
            // S'assurer que le SlimeBoss existe
            if (typeof window.ensureSlimeBossExists === "function") {
                window.ensureSlimeBossExists();
            }
        } else if (currentMap && (currentMap === "map4" || currentMap === "map5")) {
            // Maps 4 et 5 - cochons
            if (typeof window.spawnCochons === "function") {
                window.spawnCochons(8);
            }
        } else if (currentMap && currentMap === "mapzonealuineeks1") {
            // Map zonealuineeks1 - 10 Aluineeks
            if (typeof window.spawnAluineeks === "function") {
                window.spawnAluineeks(10); // 10 Aluineeks sur mapzonealuineeks1
            }
        } else if (currentMap && (currentMap === "mapdonjonslime" || currentMap === "mapdonjonslime2")) {
            // Créer les slimes pour les maps du donjon slime
            if (typeof window.createSlimes === "function") {
                if (currentMap === "mapdonjonslime") {
                    window.createSlimes(5); // 5 slimes sur mapdonjonslime
                } else if (currentMap === "mapdonjonslime2") {
                    window.createSlimes(7); // 7 slimes sur mapdonjonslime2
                }
            }
        } else if (currentMap && (currentMap === "map1" || currentMap === "map2" || currentMap === "map3")) {
            // Créer les corbeaux pour les maps 1, 2, 3 (map4 a ses propres monstres)
            if (typeof window.createCrows === "function") {
                window.createCrows(10); // 10 corbeaux sur les maps 1, 2, 3
            }
        }
        
        // Tous les console.log supprimés dans ce fichier.
        
        // Assigner l'image aux monstres si elle est déjà chargée
        if (typeof assignMonsterImages === "function") {
            // console.log("🖼️ Assignation des images des monstres...");
            assignMonsterImages();
        }
        
        // console.log("🔍 === FIN INITMONSTERS ===");
    }, 100);
}

// Export global
window.initMonsters = initMonsters; 
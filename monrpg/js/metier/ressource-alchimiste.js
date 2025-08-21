// js/metier/ressource-alchimiste.js

// Système de récolte des ressources d'alchimiste
function computePissenlitYieldByLevel(level) {
    if (level >= 100) return { min: 10, max: 20 };
    if (level >= 90) return { min: 8, max: 18 };
    if (level >= 80) return { min: 7, max: 16 };
    if (level >= 70) return { min: 6, max: 14 };
    if (level >= 60) return { min: 5, max: 12 };
    if (level >= 50) return { min: 4, max: 10 };
    if (level >= 40) return { min: 3, max: 8 };
    if (level >= 30) return { min: 2, max: 6 };
    if (level >= 20) return { min: 1, max: 4 };
    if (level >= 10) return { min: 1, max: 3 };
    return { min: 1, max: 2 };
}

class RessourceAlchimiste {
    constructor() {
        this.ressourcesEnCours = new Map(); // Ressources en cours de récolte
        this.ressourcesRecoltees = new Map(); // Ressources récoltées avec timestamp
        this.ressourcesInteractives = new Set(); // Ressources avec lesquelles on a interagi
        this.delaiRecolte = 2000; // 2 secondes
        this.delaiRespawn = 120000; // 120 secondes
        
        // Système initialisé
        this.init();
    }

    init() {
        // Vérifier périodiquement les ressources à faire réapparaître
        setInterval(() => {
            this.verifierRespawn();
        }, 1000); // Vérifier toutes les secondes
        // Timer de respawn démarré
    }

    // Vérifier si le joueur peut interagir avec une ressource
    peutInteragir(x, y) {
        if (!window.player || !window.mapData) {
            return false;
        }
        
        // Calculer la distance en cases (pas en pixels)
        const distanceX = Math.abs(x - window.player.x);
        const distanceY = Math.abs(y - window.player.y);
        
        // Le joueur doit être adjacent (distance de 1 case maximum)
        return distanceX <= 1 && distanceY <= 1;
    }

    // Démarrer la récolte d'une ressource
    demarrerRecolte(x, y) {
        const key = `${x},${y}`;
        
        // Vérifier si la ressource est déjà en cours de récolte
        if (this.ressourcesEnCours.has(key)) {
            return false;
        }
        
        // Vérifier si la ressource est récoltable (ID 25 calque 4)
        if (!this.estRessourceRecoltable(x, y)) {
            return false;
        }
        
        // Vérifier si le joueur est assez proche
        if (!this.peutInteragir(x, y)) {
            return false;
        }
        
        // Marquer la ressource comme en cours de récolte
        this.ressourcesEnCours.set(key, {
            x: x,
            y: y,
            timestamp: Date.now()
        });
        
        // Afficher un message de récolte
        if (window.showFloatingMessage) {
            window.showFloatingMessage("Récolte en cours...", x, y - 50);
        }
        
        // Démarrer le timer de récolte
        setTimeout(() => {
            this.finirRecolte(x, y);
        }, this.delaiRecolte);
        
        return true;
    }

    // Terminer la récolte
    finirRecolte(x, y) {
        const key = `${x},${y}`;
        
        if (!this.ressourcesEnCours.has(key)) {
            return;
        }
        
        // Retirer de la liste des récoltes en cours
        this.ressourcesEnCours.delete(key);
        
        // Vérifier que la ressource existe toujours
        if (!this.estRessourceRecoltable(x, y)) {
            return;
        }
        
        // Remplacer la ressource par l'ID 225 du calque 3
        this.remplacerRessource(x, y);

        // Calculer le rendement selon le niveau d'alchimiste
        const level = window.metiers?.alchimiste?.niveau || 1;
        const yieldCfg = computePissenlitYieldByLevel(level);
        const harvestedQty = Math.floor(Math.random() * (yieldCfg.max - yieldCfg.min + 1)) + yieldCfg.min;

        // Ajouter la ressource à l'inventaire (quantité variable)
        this.ajouterRessourceInventaire(harvestedQty);
        
        // Marquer comme récoltée avec timestamp ET map d'origine
        this.ressourcesRecoltees.set(key, {
            x: x,
            y: y,
            timestamp: Date.now(),
            mapOrigine: window.currentMap // AJOUT : stocker la map d'origine
        });
        
        // Retirer de la liste des ressources interactives
        this.ressourcesInteractives.delete(key);
        
        // Afficher un message façon blé: quantité en rouge près de la tuile et XP en jaune près du joueur
        const xpGained = 10;
        if (typeof window.displayDamage === 'function') {
            const ts = window.TILE_SIZE || 32;
            // Rouge (type damage) pour la quantité de pissenlits
            window.displayDamage(x * ts, y * ts, `+${harvestedQty} Pissenlit`, 'damage', false);
            // Jaune (type xp) pour l'XP, proche du joueur
            const px = (window.player?.px) ?? (window.player?.x || 0) * ts;
            const py = (window.player?.py) ?? (window.player?.y || 0) * ts;
            window.displayDamage(px, py, `+${xpGained} XP`, 'xp', true);
        } else if (window.showFloatingMessage) {
            window.showFloatingMessage(`+${harvestedQty} Pissenlit | +${xpGained} XP`);
        }
    }

    // Vérifier si une ressource est récoltable (ID 25 calque 4)
    estRessourceRecoltable(x, y) {
        if (!window.mapData || !window.mapData.layers || window.mapData.layers.length < 4) {
            return false;
        }
        
        const layer4 = window.mapData.layers[3]; // Calque 4
        const tileIndex = y * layer4.width + x;
        const tileId = layer4.data[tileIndex];
        
        return tileId === 25;
    }

    // Remplacer la ressource par l'ID 225 du calque 3
    remplacerRessource(x, y) {
        if (!window.mapData || !window.mapData.layers || window.mapData.layers.length < 3) {
            console.warn('⚠️ Impossible de remplacer ressource - mapData invalide');
            return;
        }
        
        // PROTECTION : Vérifier qu'on est sur map1 ou map6
        if (window.currentMap !== "map1" && window.currentMap !== "map6") {
            console.warn(`🚫 Tentative de remplacement de ressource sur ${window.currentMap} - BLOQUÉE`);
            return;
        }
        
        const layer3 = window.mapData.layers[2]; // Calque 3
        const layer4 = window.mapData.layers[3]; // Calque 4
        const tileIndex = y * layer3.width + x;
        
        // Vérifier que les indices sont valides
        if (tileIndex < 0 || tileIndex >= layer3.data.length) {
            console.warn(`⚠️ Index de tuile invalide : ${tileIndex} pour position (${x}, ${y})`);
            return;
        }
        
        // Remplacer par l'ID 225 sur le calque 3
        layer3.data[tileIndex] = 225;
        
        // Supprimer l'ID 25 du calque 4 (rendre invisible)
        layer4.data[tileIndex] = 0;
        
        console.log(`✅ Ressource remplacée sur ${window.currentMap} à position (${x}, ${y})`);
    }

    // Restaurer la ressource (ID 25 calque 4)
    restaurerRessource(x, y) {
        if (!window.mapData || !window.mapData.layers || window.mapData.layers.length < 4) {
            console.warn('⚠️ Impossible de restaurer ressource - mapData invalide');
            return;
        }
        
        // PROTECTION SUPPLÉMENTAIRE : Vérifier qu'on est sur map1 ou map6 (maps avec des pissenlits)
        if (window.currentMap !== "map1" && window.currentMap !== "map6") {
            console.warn(`🚫 Tentative de restauration de ressource sur ${window.currentMap} - BLOQUÉE`);
            return;
        }
        
        const layer3 = window.mapData.layers[2]; // Calque 3
        const layer4 = window.mapData.layers[3]; // Calque 4
        const tileIndex = y * layer4.width + x;
        
        // Vérifier que les indices sont valides
        if (tileIndex < 0 || tileIndex >= layer4.data.length) {
            console.warn(`⚠️ Index de tuile invalide : ${tileIndex} pour position (${x}, ${y})`);
            return;
        }
        
        // Restaurer l'ID 25 sur le calque 4
        layer4.data[tileIndex] = 25;
        
        // Supprimer l'ID 225 du calque 3
        layer3.data[tileIndex] = 0;
        
        console.log(`✅ Ressource restaurée sur ${window.currentMap} à position (${x}, ${y})`);
    }

    // Ajouter la ressource à l'inventaire (quantité variable)
    ajouterRessourceInventaire(quantity = 1) {
        console.log('🌿 Tentative d\'ajout de pissenlit à l\'inventaire (qty=', quantity, ')');
        console.log('🔍 window.addItemToInventory existe?', typeof window.addItemToInventory);
        console.log('🔍 window.resourceDatabase existe?', typeof window.resourceDatabase);
        
        // Vérifier si pissenlit existe dans la base de données
        if (window.resourceDatabase && window.resourceDatabase.pissenlit) {
            console.log('✅ Pissenlit trouvé dans resourceDatabase:', window.resourceDatabase.pissenlit);
        } else {
            console.error('❌ Pissenlit non trouvé dans resourceDatabase');
        }
        
        // Utiliser le système d'inventaire existant pour les ressources d'alchimiste
        if (window.addItemToInventory) {
            let ok = true;
            for (let i = 0; i < quantity; i++) {
                const result = window.addItemToInventory('pissenlit', 'ressources');
                console.log('📦 Résultat ajout pissenlit (it=', i, '):', result);
                if (result === false) { ok = false; break; }
            }
            if (ok) {
                console.log('✅ Pissenlit ajouté avec succès (x', quantity, ')');
                if (typeof window.normalizeInventoryAllStacks === 'function') window.normalizeInventoryAllStacks();
                if (typeof window.reconcileResourcesFromAll === 'function') window.reconcileResourcesFromAll();
                if (window.updateAllGrids) window.updateAllGrids();
                if (typeof window.autoSaveOnEvent === 'function') window.autoSaveOnEvent();
            } else {
                console.error('❌ Échec de l\'ajout du pissenlit (batch)');
            }
        } else {
            console.error('❌ window.addItemToInventory non disponible');
        }
        
        // Gagner de l'XP en alchimie
        console.log('🔍 Debug XP - window.gainMetierXP disponible:', !!window.gainMetierXP);
        console.log('🔍 Debug XP - window.metiers:', window.metiers);
        
        if (window.gainMetierXP) {
            console.log('🔍 Debug XP - XP avant:', window.metiers?.alchimiste?.xp);
            window.gainMetierXP('alchimiste', 10);
            console.log('🔍 Debug XP - XP après:', window.metiers?.alchimiste?.xp);
            // Le message XP est inclus dans le message combiné ci-dessus
        } else {
            console.error('❌ window.gainMetierXP non disponible');
        }
    }

    // Vérifier les ressources à faire réapparaître
    verifierRespawn() {
        const maintenant = Date.now();
        
        for (const [key, data] of this.ressourcesRecoltees.entries()) {
            if (maintenant - data.timestamp >= this.delaiRespawn) {
                // CORRECTION CRITIQUE : Vérifier qu'on est sur la bonne map avant le respawn
                if (window.currentMap === data.mapOrigine) {
                    console.log(`🌿 Respawn pissenlit sur ${data.mapOrigine} à position (${data.x}, ${data.y})`);
                    
                    // Restaurer la ressource SEULEMENT si on est sur la bonne map
                    this.restaurerRessource(data.x, data.y);
                    
                    // Retirer de la liste des ressources récoltées
                    this.ressourcesRecoltees.delete(key);
                    
                    // Retirer aussi de la liste des ressources interactives pour reset
                    this.ressourcesInteractives.delete(key);
                } else {
                    // On n'est pas sur la bonne map, garder la ressource en attente
                    console.log(`⏳ Ressource prête à respawn sur ${data.mapOrigine}, mais on est sur ${window.currentMap}`);
                }
            }
        }
    }

    // Fonction à appeler lors du changement de map pour gérer les respawns en attente
    gererRespawnLorsRetourMap() {
        console.log(`🔍 Vérification des respawns en attente pour ${window.currentMap}`);
        const maintenant = Date.now();
        let respawnEffectues = 0;
        
        for (const [key, data] of this.ressourcesRecoltees.entries()) {
            // Si la ressource est prête à respawn et qu'on est sur la bonne map
            if (maintenant - data.timestamp >= this.delaiRespawn && window.currentMap === data.mapOrigine) {
                console.log(`🌿 Respawn immédiat lors du retour sur ${data.mapOrigine} - position (${data.x}, ${data.y})`);
                
                // Restaurer la ressource
                this.restaurerRessource(data.x, data.y);
                
                // Retirer de la liste des ressources récoltées
                this.ressourcesRecoltees.delete(key);
                
                // Retirer aussi de la liste des ressources interactives pour reset
                this.ressourcesInteractives.delete(key);
                
                respawnEffectues++;
            }
        }
        
        if (respawnEffectues > 0) {
            console.log(`✅ ${respawnEffectues} ressource(s) respawnée(s) lors du retour sur ${window.currentMap}`);
        }
    }

    // Gérer le clic sur une ressource
    gererClicRessource(x, y) {
        // Vérifier si c'est une ressource récoltable
        if (!this.estRessourceRecoltable(x, y)) {
            return false;
        }
        
        // Marquer la ressource comme interactive
        const key = `${x},${y}`;
        this.ressourcesInteractives.add(key);
        
        // Vérifier si le joueur est assez proche
        if (!this.peutInteragir(x, y)) {
            // Déplacer le joueur vers la ressource
            this.deplacerJoueurVersRessource(x, y);
            return true; // Retourner true pour indiquer que l'action a été traitée
        }
        
        // Démarrer la récolte
        return this.demarrerRecolte(x, y);
    }

    // Déplacer le joueur vers la ressource
    deplacerJoueurVersRessource(x, y) {
        if (!window.player || !window.mapData) {
            return;
        }

        // Trouver une position adjacente libre
        const positionsAdjacentes = [
            {x: x + 1, y: y},
            {x: x - 1, y: y},
            {x: x, y: y + 1},
            {x: x, y: y - 1}
        ];

        let positionChoisie = null;

        // Vérifier chaque position adjacente
        for (const pos of positionsAdjacentes) {
            if (pos.x >= 0 && pos.x < window.mapData.width && 
                pos.y >= 0 && pos.y < window.mapData.height) {
                
                // Vérifier si la position est libre (pas de collision)
                if (typeof window.isBlocked === "function" && !window.isBlocked(pos.x, pos.y)) {
                    // Vérifier qu'il n'y a pas de monstre à cette position
                    let monstrePresent = false;
                    if (window.monsters && window.monsters.length > 0) {
                        monstrePresent = window.monsters.some(monster => 
                            monster.x === pos.x && monster.y === pos.y && monster.hp > 0 && !monster.isDead
                        );
                    }
                    
                    if (!monstrePresent) {
                        positionChoisie = pos;
                        break;
                    }
                }
            }
        }

        if (positionChoisie) {
            // Déplacer le joueur vers la position choisie
            if (typeof window.handleMovementClick === "function") {
                window.handleMovementClick(positionChoisie.x, positionChoisie.y);
            }
            
            // Attendre que le joueur arrive à destination avant de démarrer la récolte
            this.attendreArriveeEtRecolter(x, y, positionChoisie);
        } else {
            if (window.showFloatingMessage) {
                window.showFloatingMessage("Pas d'espace libre à côté !", x, y - 50);
            }
        }
    }

    // Attendre que le joueur arrive à destination et démarrer la récolte
    attendreArriveeEtRecolter(x, y, destination) {
        const verifierArrivee = () => {
            if (!window.player) return;
            
            // Vérifier si le joueur est arrivé à destination
            const distance = Math.sqrt(
                Math.pow(destination.x - window.player.x, 2) + 
                Math.pow(destination.y - window.player.y, 2)
            );
            
            if (distance < 0.5) { // Le joueur est arrivé
                // Démarrer la récolte après un petit délai
                setTimeout(() => {
                    this.demarrerRecolte(x, y);
                }, 500);
            } else {
                // Continuer à vérifier
                setTimeout(verifierArrivee, 100);
            }
        };
        
        verifierArrivee();
    }

    // Obtenir les informations d'une ressource
    getRessourceInfo(x, y) {
        const key = `${x},${y}`;
        
        if (this.ressourcesEnCours.has(key)) {
            const data = this.ressourcesEnCours.get(key);
            const tempsRestant = Math.max(0, this.delaiRecolte - (Date.now() - data.timestamp));
            return {
                type: 'recolte_en_cours',
                tempsRestant: tempsRestant
            };
        }
        
        if (this.ressourcesRecoltees.has(key)) {
            const data = this.ressourcesRecoltees.get(key);
            const tempsRestant = Math.max(0, this.delaiRespawn - (Date.now() - data.timestamp));
            return {
                type: 'recoltee',
                tempsRestant: tempsRestant
            };
        }
        
        if (this.estRessourceRecoltable(x, y)) {
            return {
                type: 'disponible'
            };
        }
        
        return null;
    }

    // Appliquer les effets visuels aux ressources
    appliquerEffetsVisuels(ctx, x, y, gid) {
        // Style discret aligné au blé: léger highlight uniquement si interactif
        if (gid === 25 && (window.currentMap === "map1" || window.currentMap === "map6")) {
            const key = `${x},${y}`;
            if (this.ressourcesInteractives.has(key)) {
                const pulse = Math.sin(Date.now() / 240) * 0.15 + 1.05;
                ctx.globalAlpha = pulse;
                ctx.filter = `brightness(${pulse}) drop-shadow(0 0 14px rgba(191,161,74,0.9))`;
            }
        }
    }
}

// Initialiser le système de ressources d'alchimiste
let ressourceAlchimiste = null;

// Fonction d'initialisation
function initRessourceAlchimiste() {
    if (!ressourceAlchimiste) {
        ressourceAlchimiste = new RessourceAlchimiste();
        window.ressourceAlchimiste = ressourceAlchimiste;
    }
}

// Fonction pour gérer les clics sur les ressources
function gererClicRessourceAlchimiste(x, y) {
    if (!ressourceAlchimiste) {
        initRessourceAlchimiste();
    }
    
    return ressourceAlchimiste.gererClicRessource(x, y);
}

// Fonction pour obtenir les informations d'une ressource
function getRessourceAlchimisteInfo(x, y) {
    if (!ressourceAlchimiste) {
        initRessourceAlchimiste();
    }
    
    return ressourceAlchimiste.getRessourceInfo(x, y);
}

// Fonction pour appliquer les effets visuels aux ressources
function appliquerEffetsVisuelsRessources(ctx, x, y, gid) {
    if (!ressourceAlchimiste) {
        initRessourceAlchimiste();
    }
    
    ressourceAlchimiste.appliquerEffetsVisuels(ctx, x, y, gid);
}

// Initialiser le système au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initRessourceAlchimiste();
});

// Fonction pour gérer les respawns lors du retour sur une map
function gererRespawnLorsRetourMap() {
    if (!ressourceAlchimiste) {
        initRessourceAlchimiste();
    }
    
    ressourceAlchimiste.gererRespawnLorsRetourMap();
}

// Fonction de diagnostic pour vérifier l'état des ressources
function diagnosticRessources() {
    if (!ressourceAlchimiste) {
        console.log("❌ Système de ressources non initialisé");
        return;
    }
    
    console.log("🔍 === DIAGNOSTIC RESSOURCES D'ALCHIMISTE ===");
    console.log("Map actuelle:", window.currentMap);
    console.log("Ressources en cours de récolte:", ressourceAlchimiste.ressourcesEnCours.size);
    console.log("Ressources récoltées (en attente de respawn):", ressourceAlchimiste.ressourcesRecoltees.size);
    
    console.log("\n📋 Détail des ressources récoltées:");
    for (const [key, data] of ressourceAlchimiste.ressourcesRecoltees.entries()) {
        const tempsEcoule = (Date.now() - data.timestamp) / 1000;
        const tempsRestant = Math.max(0, (ressourceAlchimiste.delaiRespawn - (Date.now() - data.timestamp)) / 1000);
        console.log(`- Position (${data.x}, ${data.y}) sur ${data.mapOrigine}:`);
        console.log(`  • Temps écoulé: ${tempsEcoule.toFixed(1)}s`);
        console.log(`  • Temps restant: ${tempsRestant.toFixed(1)}s`);
        console.log(`  • Prêt à respawn: ${tempsRestant <= 0 ? '✅ OUI' : '⏳ NON'}`);
        console.log(`  • Sur la bonne map: ${window.currentMap === data.mapOrigine ? '✅ OUI' : '❌ NON'}`);
    }
    
    console.log("=====================================");
}

// Exporter les fonctions pour utilisation globale
window.gererClicRessourceAlchimiste = gererClicRessourceAlchimiste;
window.getRessourceAlchimisteInfo = getRessourceAlchimisteInfo;
window.appliquerEffetsVisuelsRessources = appliquerEffetsVisuelsRessources;
window.gererRespawnLorsRetourMap = gererRespawnLorsRetourMap;
window.diagnosticRessources = diagnosticRessources; 
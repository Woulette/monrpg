// Sort Rassemblement - Fichier indépendant
// Créé pour éviter de casser le code existant

// Configuration du sort Rassemblement
const RASSEMBLEMENT_SPELL = {
    id: 'spell-slot-5',
    name: 'Rassemblement',
    icon: 'assets/sorts/rassemblement.png',
    levelRequired: 25,
    baseMin: 10,
    baseMax: 15,
    cooldown: 20.0,
    specialEffect: 'rassemblementEffect',
    unlocked: false,
    // Effet spécial : rassemble les ennemis proches vers le joueur
    gatherRadius: 5, // Changé de 3 à 5 pour un rayon de 5x5
    gatherDuration: 3000, // 3 secondes
    // Nouvelle propriété pour la prévisualisation
    showPreview: true
};

// Fonction pour initialiser le sort Rassemblement
function initRassemblementSpell() {
    // Ajouter le sort à la liste des sorts si il n'existe pas déjà
    if (!window.SPELLS) {
        window.SPELLS = {};
    }
    
    // Vérifier si le sort existe déjà pour éviter les doublons
    if (!window.SPELLS[RASSEMBLEMENT_SPELL.id]) {
        window.SPELLS[RASSEMBLEMENT_SPELL.id] = RASSEMBLEMENT_SPELL;
        console.log('✨ Sort Rassemblement ajouté au système de sorts');
    }
    
    // Ajouter la fonction d'effet spécial
    window.rassemblementEffect = function(targetX, targetY) {
        console.log('🌀 Effet Rassemblement déclenché');
        gatherNearbyEnemies(targetX, targetY);
    };
}

// Fonction pour rassembler les ennemis proches
function gatherNearbyEnemies(centerX, centerY) {
    if (!window.monsters || !Array.isArray(window.monsters)) {
        console.log('❌ Rassemblement: Aucun monstre trouvé');
        return;
    }
    
    const affectedMonsters = [];
    const targetPosition = { x: centerX, y: centerY }; // Position cible unique
    
    // Calculer les dégâts du sort
    const { damage, isCrit } = computeRassemblementDamage();
    const finalDamage = Math.max(1, damage);
    
    // Compter les slimes tués pour la progression du donjon
    let slimesKilled = 0;
    
    window.monsters.forEach(monster => {
        if (monster && monster.hp > 0) {
            // Vérifier si le monstre est dans la zone de 0 à 5 cases à partir du centre
            const distanceX = Math.abs(monster.x - centerX);
            const distanceY = Math.abs(monster.y - centerY);
            
            // Le monstre doit être dans un carré de 5x5 cases à partir du centre
            if (distanceX <= 4 && distanceY <= 4) {
                // Infliger des dégâts au monstre
                monster.hp -= finalDamage;
                
                // Afficher les dégâts infligés
                if (typeof window.displayDamage === 'function') {
                    const damageText = isCrit ? `${finalDamage} (Crit!)` : `${finalDamage}`;
                    window.displayDamage(monster.px, monster.py, damageText, 'damage', isCrit);
                }
                
                // Vérifier si le monstre est mort
                if (monster.hp <= 0) {
                    monster.hp = 0;
                    monster.isDead = true;
                    
                    // Compter les slimes tués
                    if (monster.type === "slime") {
                        slimesKilled++;
                        console.log(`🔧 Slime tué par Rassemblement (${slimesKilled})`);
                    }
                    
                    if (typeof window.addChatMessage === 'function') {
                        window.addChatMessage(`💀 ${monster.name || 'Monstre'} vaincu par Rassemblement!`, 'combat');
                    }
                    
                    // Gain d'XP pour avoir tué le monstre
                    if (typeof window.gainXP === 'function') {
                        window.gainXP(monster.xpValue || 10);
                    }
                }
                
                // Déplacer TOUS les monstres vers la même position cible
                monster.x = targetPosition.x;
                monster.y = targetPosition.y;
                
                // Mettre à jour la position visuelle
                monster.px = monster.x * 32;
                monster.py = monster.y * 32;
                
                affectedMonsters.push(monster);
                
                // Effet visuel de rassemblement
                if (typeof window.displayDamage === 'function') {
                    window.displayDamage(monster.px, monster.py, 'Rassemblé!', 'effect', false);
                }
            }
        }
    });
    
    console.log(`🌀 Rassemblement: ${affectedMonsters.length} monstres rassemblés et ${finalDamage} dégâts infligés sur la case (${targetPosition.x}, ${targetPosition.y})`);
    
    // Effet visuel au centre
    if (typeof window.displayDamage === 'function') {
        window.displayDamage(centerX * 32, centerY * 32, 'Rassemblement!', 'effect', false);
    }
    
    // Déclencher la progression du donjon si des slimes ont été tués
    if (slimesKilled > 0) {
        console.log(`🎯 Rassemblement: ${slimesKilled} slimes tués, déclenchement de la progression du donjon`);
        
        // Appeler la fonction de progression pour chaque slime tué
        for (let i = 0; i < slimesKilled; i++) {
            if (typeof window.onSlimeKilled === 'function') {
                window.onSlimeKilled();
            }
        }
        
        // Vérifier la progression du donjon
        if (typeof window.checkDungeonProgression === 'function') {
            window.checkDungeonProgression();
        }
        
        // Message de progression
        if (typeof window.addChatMessage === 'function') {
            const currentMap = window.currentMap;
            if (currentMap === "mapdonjonslime") {
                const progress = window.dungeonProgression?.mapdonjonslime?.slimesKilled || 0;
                window.addChatMessage(`🎯 Progression donjon: ${progress}/5 slimes tués`, 'system');
            } else if (currentMap === "mapdonjonslime2") {
                const progress = window.dungeonProgression?.mapdonjonslime2?.slimesKilled || 0;
                window.addChatMessage(`🎯 Progression donjon: ${progress}/7 slimes tués`, 'system');
            }
        }
    }
}

// Variables globales pour le mode ciblage
let rassemblementTargetingMode = false;
let rassemblementPendingTarget = null; // Cible en attente
let rassemblementPendingInterval = null; // Intervalle de vérification

// Fonction pour lancer le sort Rassemblement
function castRassemblement() {
    if (!window.player) {
        console.log('❌ Rassemblement: Joueur non trouvé');
        return;
    }
    
    const slot = document.getElementById(RASSEMBLEMENT_SPELL.id);
    if (!slot || slot.classList.contains('cooldown')) {
        console.log('❌ Rassemblement: Sort en cooldown ou slot non trouvé');
        return;
    }
    
    // Activer le mode ciblage
    rassemblementTargetingMode = true;
    console.log('🎯 Mode ciblage Rassemblement activé - La zone suit votre souris');
    
    // Changer le curseur pour indiquer le mode ciblage
    document.body.style.cursor = 'crosshair';
    
    // Afficher immédiatement la prévisualisation à la position actuelle de la souris
    if (window.lastMouseX && window.lastMouseY) {
        showRassemblementPreview(window.lastMouseX, window.lastMouseY);
    }
    
    // Ajouter un message d'aide
    if (typeof window.addChatMessage === 'function') {
        window.addChatMessage('🎯 Mode ciblage activé - La zone suit votre souris', 'system');
    }
}

// Fonction pour calculer les dégâts du sort Rassemblement
function computeRassemblementDamage() {
    if (!window.player) {
        return { damage: 0, isCrit: false };
    }
    
    // Utiliser les dégâts améliorés s'ils existent, sinon les dégâts de base
    let minDamage = RASSEMBLEMENT_SPELL.baseMin;
    let maxDamage = RASSEMBLEMENT_SPELL.baseMax;
    
    if (window.rassemblementDamageMin !== undefined && window.rassemblementDamageMax !== undefined) {
        minDamage = window.rassemblementDamageMin;
        maxDamage = window.rassemblementDamageMax;
        console.log(`⚔️ Rassemblement - Dégâts améliorés utilisés: ${minDamage}-${maxDamage} (base: ${RASSEMBLEMENT_SPELL.baseMin}-${RASSEMBLEMENT_SPELL.baseMax})`);
    } else {
        console.log(`⚔️ Rassemblement - Dégâts de base utilisés: ${minDamage}-${maxDamage}`);
    }
    
    // Bonus de force
    const forceBonus = Math.floor((window.player.force || 0) * 0.5);
    
    // Calcul des dégâts de base
    let damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
    damage += forceBonus;
    
    // Vérifier le coup critique (basé sur l'agilité)
    const critChance = Math.min((window.player.agilite || 0) * 0.5, 25); // Max 25% de chance
    const isCrit = Math.random() * 100 < critChance;
    
    if (isCrit) {
        damage = Math.floor(damage * 1.5); // 50% de bonus pour les coups critiques
    }
    
    return { damage, isCrit };
}

// Fonction pour configurer l'interface du sort dans la fenêtre des sorts
function addRassemblementToUI() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addRassemblementToUI);
        return;
    }
    
    const sortRow = document.getElementById('sort-rassemblement-row');
    if (!sortRow) {
        console.log('❌ Rassemblement: Ligne du sort non trouvée dans le HTML');
        return;
    }
    
    // L'événement de sélection est maintenant géré dans main.js
    // Pas besoin d'ajouter un gestionnaire ici
    
    console.log('✨ Interface Rassemblement configurée');
}

// Fonction pour afficher les détails du sort Rassemblement (maintenant gérée dans main.js)
function showRassemblementDetails() {
    // Cette fonction n'est plus nécessaire car la gestion est faite dans main.js
    console.log('✨ showRassemblementDetails: Gestion maintenant dans main.js');
}

// Fonction pour afficher la prévisualisation de la zone d'attaque
function showRassemblementPreview(mouseX, mouseY) {
    // Supprimer l'ancienne prévisualisation
    hideRassemblementPreview();
    
    // Créer la prévisualisation
    const preview = document.createElement('div');
    preview.id = 'rassemblement-preview';
    preview.className = 'rassemblement-preview';
    
    // Centrer la zone de prévisualisation sur la souris
    // La zone fait 160px (5x5 cases), donc on doit centrer sur la souris
    const previewX = mouseX - 80; // 80 = 160 / 2 pour centrer
    const previewY = mouseY - 80; // 80 = 160 / 2 pour centrer
    
    preview.style.left = previewX + 'px';
    preview.style.top = previewY + 'px';
    
    // Ajouter au canvas ou au conteneur de jeu
    const gameContainer = document.querySelector('.game-container') || document.body;
    gameContainer.appendChild(preview);
}

// Fonction pour exécuter le sort rassemblement sur une cible
function executeRassemblement(targetX, targetY) {
    if (!window.player) {
        console.log('❌ Rassemblement: Joueur non trouvé');
        return;
    }
    
    // Vérifier la distance (portée de 7 cases)
    const distance = Math.abs(window.player.x - targetX) + Math.abs(window.player.y - targetY);
    
    // Arrêter le déplacement du joueur s'il est en train de se déplacer (peu importe la distance)
    if (window.player && window.player.moving) {
        window.player.moving = false;
        if (window.player.path) {
            window.player.path = [];
        }
        if (window.player.moveTarget) {
            window.player.moveTarget = { x: window.player.x, y: window.player.y };
        }
        console.log('🛑 Déplacement du joueur arrêté pour le sort Rassemblement');
    }
    
    if (distance > 7) {
        // Calculer la position la plus proche dans la portée (case 7)
        const directionX = targetX > window.player.x ? 1 : -1;
        const directionY = targetY > window.player.y ? 1 : -1;
        
        // Position à 7 cases de la cible (portée maximale)
        const targetPositionX = targetX - (directionX * 7);
        const targetPositionY = targetY - (directionY * 7);
        
        console.log(`🎯 Joueur à ${distance} cases, déplacement vers la portée maximale (${targetPositionX}, ${targetPositionY})`);
        
        if (typeof window.addChatMessage === 'function') {
            window.addChatMessage(`🎯 Déplacement vers la portée maximale pour lancer le sort`, 'system');
        }
        
        // Faire déplacer le joueur vers la position de portée maximale
        if (window.player && typeof window.movePlayerTo === 'function') {
            window.movePlayerTo(targetPositionX, targetPositionY);
        }
        
        // Mettre le sort en attente avec la cible originale
        rassemblementPendingTarget = { x: targetX, y: targetY };
        
        // Démarrer la vérification périodique
        startPendingRassemblementCheck();
        
        // Masquer la prévisualisation et désactiver le mode ciblage
        hideRassemblementPreview();
        rassemblementTargetingMode = false;
        document.body.style.cursor = 'default';
        
        return;
    }
    
    // Le joueur est dans la portée, lancer le sort immédiatement
    launchRassemblementSpell(targetX, targetY);
}

// Fonction pour lancer le sort une fois dans la portée
function launchRassemblementSpell(targetX, targetY) {
    // Nettoyer immédiatement tous les états en attente
    stopPendingRassemblementCheck();
    
    // Masquer immédiatement la prévisualisation
    hideRassemblementPreview();
    
    // Désactiver le mode ciblage immédiatement
    rassemblementTargetingMode = false;
    document.body.style.cursor = 'default';
    
    // Arrêter le déplacement automatique du joueur de manière sécurisée
    if (window.player) {
        // Arrêter le mouvement en cours
        if (window.player.moving) {
            window.player.moving = false;
        }
        // Vider le chemin
        if (window.player.path) {
            window.player.path = [];
        }
        // Réinitialiser la cible de mouvement de manière sécurisée
        if (window.player.moveTarget) {
            window.player.moveTarget = { x: window.player.x, y: window.player.y };
        }
    }
    
    // Calculer les dégâts
    const { damage, isCrit } = computeRassemblementDamage();
    
    // Gain d'XP de force à chaque attaque
    if (typeof window.gainStatXP === "function") {
        window.gainStatXP('force', 1);
    }
    if (isCrit) {
        // Gain d'XP d'agilité lors d'un coup critique
        if (typeof window.gainStatXP === "function") {
            window.gainStatXP('agilite', 1);
        }
    }
    
    // Attaque du joueur
    const baseDamage = damage;
    // Prendre en compte la défense du monstre, minimum 1 dégât
    const finalDamage = Math.max(1, baseDamage);
    
    // Déclencher l'effet de rassemblement
    if (typeof window.rassemblementEffect === 'function') {
        window.rassemblementEffect(targetX, targetY);
    }
    
    // Appliquer le cooldown
    const slot = document.getElementById(RASSEMBLEMENT_SPELL.id);
    if (slot && typeof window.startSpellCooldown === 'function') {
        window.startSpellCooldown('spell-slot-5', RASSEMBLEMENT_SPELL.cooldown);
    }
    
    console.log(`🌀 Rassemblement lancé sur (${targetX}, ${targetY}): ${finalDamage} dégâts infligés`);
}

// Fonction pour vérifier périodiquement si le joueur est entré dans la portée
function startPendingRassemblementCheck() {
    // Arrêter l'ancien intervalle s'il existe
    if (rassemblementPendingInterval) {
        clearInterval(rassemblementPendingInterval);
    }
    
    rassemblementPendingInterval = setInterval(() => {
        // Vérifications de sécurité
        if (!rassemblementPendingTarget || !window.player || window.player.isDead) {
            stopPendingRassemblementCheck();
            return;
        }
        
        // Vérifier que les coordonnées du joueur sont valides
        if (typeof window.player.x !== 'number' || typeof window.player.y !== 'number' ||
            typeof rassemblementPendingTarget.x !== 'number' || typeof rassemblementPendingTarget.y !== 'number') {
            console.log('❌ Rassemblement: Coordonnées invalides détectées');
            stopPendingRassemblementCheck();
            return;
        }
        
        const distance = Math.abs(window.player.x - rassemblementPendingTarget.x) + 
                        Math.abs(window.player.y - rassemblementPendingTarget.y);
        
        if (distance <= 7) {
            // Le joueur est entré dans la portée, lancer le sort immédiatement
            console.log(`🎯 Joueur entré dans la portée (${distance} cases), lancement du sort`);
            
            if (typeof window.addChatMessage === 'function') {
                window.addChatMessage(`🎯 Portée atteinte ! Sort Rassemblement lancé`, 'system');
            }
            
            const target = rassemblementPendingTarget;
            rassemblementPendingTarget = null;
            stopPendingRassemblementCheck();
            
            // Arrêter le déplacement du joueur avant de lancer le sort
            if (window.player && window.player.moving) {
                window.player.moving = false;
                if (window.player.path) {
                    window.player.path = [];
                }
                if (window.player.moveTarget) {
                    window.player.moveTarget = { x: window.player.x, y: window.player.y };
                }
                console.log('🛑 Déplacement du joueur arrêté avant lancement du sort');
            }
            
            // Lancer le sort immédiatement sans délai
            launchRassemblementSpell(target.x, target.y);
        }
    }, 50); // Vérifier plus fréquemment (50ms au lieu de 100ms)
}

// Fonction pour arrêter la vérification en attente
function stopPendingRassemblementCheck() {
    if (rassemblementPendingInterval) {
        clearInterval(rassemblementPendingInterval);
        rassemblementPendingInterval = null;
    }
    rassemblementPendingTarget = null;
    
    // Nettoyer les variables de mode ciblage
    rassemblementTargetingMode = false;
    hideRassemblementPreview();
    document.body.style.cursor = 'default';
}

// Fonction pour masquer la prévisualisation
function hideRassemblementPreview() {
    const existingPreview = document.getElementById('rassemblement-preview');
    if (existingPreview) {
        existingPreview.remove();
    }
}

// Fonction pour configurer le slot du sort dans la barre de raccourcis
function addRassemblementSlot() {
    const spellSlot = document.getElementById(RASSEMBLEMENT_SPELL.id);
    if (!spellSlot) {
        console.log('❌ Rassemblement: Slot non trouvé dans le HTML');
        return;
    }
    
    // Ajouter l'événement de clic
    spellSlot.addEventListener('click', () => {
        if (!spellSlot.classList.contains('locked') && !spellSlot.classList.contains('cooldown')) {
            castRassemblement();
        }
    });
    
    console.log('✨ Slot Rassemblement configuré');
}

// Fonction pour mettre à jour le statut de déverrouillage du sort
function updateRassemblementUnlockStatus() {
    const spellSlot = document.getElementById(RASSEMBLEMENT_SPELL.id);
    const sortRow = document.getElementById('sort-rassemblement-row');
    
    if (!window.player) return;
    
    const isUnlocked = window.player.level >= RASSEMBLEMENT_SPELL.levelRequired;
    
    // Mettre à jour le sort dans la liste
    if (window.SPELLS[RASSEMBLEMENT_SPELL.id]) {
        window.SPELLS[RASSEMBLEMENT_SPELL.id].unlocked = isUnlocked;
    }
    
    // Mettre à jour l'interface
    if (spellSlot) {
        if (isUnlocked) {
            spellSlot.classList.remove('locked');
            spellSlot.classList.add('unlocked');
        } else {
            spellSlot.classList.add('locked');
            spellSlot.classList.remove('unlocked');
        }
    }
    
    if (sortRow) {
        if (isUnlocked) {
            sortRow.classList.remove('locked');
        } else {
            sortRow.classList.add('locked');
        }
    }
    
    // Animation de déverrouillage si le sort vient d'être débloqué
    if (isUnlocked && spellSlot && spellSlot.classList.contains('unlocking')) {
        spellSlot.classList.remove('unlocking');
        spellSlot.classList.add('unlocked');
        
        // Message de notification
        if (typeof window.addChatMessage === 'function') {
            window.addChatMessage(`🎉 Nouveau sort débloqué : ${RASSEMBLEMENT_SPELL.name} !`, 'system');
        }
    }
}

// Fonction pour surveiller les changements de niveau du joueur
function startRassemblementLevelMonitoring() {
    let lastLevel = window.player ? window.player.level : 0;
    
    // Vérifier périodiquement si le niveau a changé
    setInterval(() => {
        if (window.player && window.player.level !== lastLevel) {
            lastLevel = window.player.level;
            updateRassemblementUnlockStatus();
        }
    }, 1000); // Vérifier toutes les secondes
}

// Fonction pour obtenir les dimensions de la map actuelle
function getCurrentMapDimensions() {
    // Dimensions par défaut (map principale)
    let mapWidth = 48;
    let mapHeight = 25;
    
    // Vérifier si on est dans une map du donjon slime
    if (window.currentMap && (window.currentMap === 'mapdonjonslime' || window.currentMap === 'mapdonjonslime2' || window.currentMap === 'mapdonjonslimeboss')) {
        mapWidth = 25;
        mapHeight = 20;
        console.log(`🗺️ Map donjon slime détectée: ${window.currentMap} - 25x20`);
    }
    
    return { width: mapWidth, height: mapHeight };
}

// Fonction pour convertir les coordonnées de la souris en coordonnées de jeu
function convertMouseToGameCoordinates(clientX, clientY) {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    // Utiliser la même logique que dans interaction.js pour la conversion des coordonnées
    // Prendre en compte le ratio de redimensionnement du canvas et les offsets de centrage
    const mx = (clientX - rect.left) * (canvas.width / rect.width) - (window.mapOffsetX || 0);
    const my = (clientY - rect.top) * (canvas.height / rect.height) - (window.mapOffsetY || 0);
    
    // Convertir en coordonnées de grille
    const targetX = Math.floor(mx / 32);
    const targetY = Math.floor(my / 32);
    
    // Obtenir les dimensions de la map actuelle
    const mapDimensions = getCurrentMapDimensions();
    
    // Vérifier que les coordonnées sont dans les limites de la map
    const clampedX = Math.max(0, Math.min(targetX, mapDimensions.width - 1));
    const clampedY = Math.max(0, Math.min(targetY, mapDimensions.height - 1));
    
    console.log(`🎯 Conversion coordonnées: (${clientX}, ${clientY}) -> (${mx}, ${my}) -> (${clampedX}, ${clampedY})`);
    
    return { x: clampedX, y: clampedY };
}

// Fonction pour ajouter les événements de ciblage
function addRassemblementTargetingEvents() {
    // Événement de mouvement de souris pour suivre la souris
    document.addEventListener('mousemove', (e) => {
        // Sauvegarder la position de la souris pour l'utiliser lors de l'activation
        window.lastMouseX = e.clientX;
        window.lastMouseY = e.clientY;
        
        if (!rassemblementTargetingMode) return;
        
        // Afficher la prévisualisation centrée sur la souris
        showRassemblementPreview(e.clientX, e.clientY);
    });
    
    // Événement de clic pour exécuter le sort
    document.addEventListener('click', (e) => {
        if (!rassemblementTargetingMode) return;
        
        // Convertir la position de la souris en coordonnées de jeu avec ajustement map
        const gameCoords = convertMouseToGameCoordinates(e.clientX, e.clientY);
        
        // Exécuter le sort à la position cliquée
        executeRassemblement(gameCoords.x, gameCoords.y);
    });
    
    // Événement pour annuler avec Échap
    document.addEventListener('keydown', (e) => {
        if (rassemblementTargetingMode && e.key === 'Escape') {
            rassemblementTargetingMode = false;
            document.body.style.cursor = 'default';
            hideRassemblementPreview();
            stopPendingRassemblementCheck(); // Arrêter la vérification en attente
            if (typeof window.addChatMessage === 'function') {
                window.addChatMessage('❌ Mode ciblage annulé', 'system');
            }
        }
    });
}

// Fonction pour trouver un monstre à une position donnée
function findMonsterAtPosition(clientX, clientY) {
    if (!window.monsters || !Array.isArray(window.monsters)) return null;
    
    // Convertir les coordonnées client en coordonnées de jeu avec ajustement map
    const gameCoords = convertMouseToGameCoordinates(clientX, clientY);
    
    // Chercher un monstre à cette position avec une tolérance
    return window.monsters.find(monster => {
        if (!monster || monster.hp <= 0) return false;
        
        // Vérifier si la souris est sur le monstre
        const monsterScreenX = monster.x * 32;
        const monsterScreenY = monster.y * 32;
        
        // Convertir les coordonnées client en coordonnées de jeu pour la comparaison
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return false;
        
        const rect = canvas.getBoundingClientRect();
        // Utiliser la même logique que dans interaction.js
        const mx = (clientX - rect.left) * (canvas.width / rect.width) - (window.mapOffsetX || 0);
        const my = (clientY - rect.top) * (canvas.height / rect.height) - (window.mapOffsetY || 0);
        
        // Zone de détection du monstre (32x32 pixels)
        return (mx >= monsterScreenX && mx < monsterScreenX + 32 &&
                my >= monsterScreenY && my < monsterScreenY + 32);
    });
}

// Fonction d'initialisation complète
function initRassemblementSystem() {
    console.log('🚀 Initialisation du système Rassemblement...');
    
    // Initialiser le sort
    initRassemblementSpell();
    
    // Ajouter l'interface
    addRassemblementToUI();
    
    // Ajouter le slot
    addRassemblementSlot();
    
    // Ajouter le raccourci clavier
    addRassemblementKeyboardShortcut();
    
    // Ajouter les événements de survol et clic
    addRassemblementTargetingEvents();
    
    // Mettre à jour le statut de déverrouillage
    updateRassemblementUnlockStatus();
    
    // Démarrer la surveillance du niveau
    startRassemblementLevelMonitoring();
    
    console.log('✅ Système Rassemblement initialisé avec succès');
}

// Fonction pour ajouter le raccourci clavier
function addRassemblementKeyboardShortcut() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addRassemblementKeyboardShortcut);
        return;
    }
    
    // Ajouter le raccourci clavier pour le sort 5 (touches '5' ou '%')
    window.addEventListener('keydown', (e) => {
        if (e.key === '5' || e.key === '%' || e.code === 'Digit5' || e.code === 'Key5') {
            const spell = window.SPELLS && window.SPELLS['spell-slot-5'];
            if (spell && spell.unlocked) {
                castRassemblement();
            } else if (spell) {
                if (typeof window.addChatMessage === 'function') {
                    window.addChatMessage(`Niveau ${spell.levelRequired} requis pour ${spell.name}`, 'system');
                }
            }
        }
    });
    
    console.log('⌨️ Raccourci clavier Rassemblement ajouté (touche 5)');
}

// Fonction pour nettoyer les variables en attente (appelée lors de la mort du joueur, etc.)
function cleanupRassemblementPending() {
    stopPendingRassemblementCheck();
    rassemblementTargetingMode = false;
    hideRassemblementPreview();
    document.body.style.cursor = 'default';
}

// Initialiser le système quand le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRassemblementSystem);
} else {
    initRassemblementSystem();
}

// Exporter les fonctions pour utilisation externe
window.castRassemblement = castRassemblement;
window.updateRassemblementUnlockStatus = updateRassemblementUnlockStatus;
window.initRassemblementSystem = initRassemblementSystem;
window.cleanupRassemblementPending = cleanupRassemblementPending; 
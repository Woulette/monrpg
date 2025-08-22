// IA de chasse du joueur pour les monstres agressifs
// Nettoyé et validé le 30/07/2025 - par Cursor

const AGGRO_RANGE = 8;     // distance d'aggro pour les corbeaux
const AGGRO_RANGE_SLIME = 7; // distance d'aggro pour les slimes
const DEAGGRO_RANGE = 20;  // distance de délock
const AGGRO_TIMEOUT = 8000; // ms sans combat pour délock

// IA de chasse du joueur - aggro et retour
function chasePlayerAI(monster, ts) {
    // Protection contre les timestamps invalides
    if (!ts || ts < 0) {
        ts = Date.now();
    }
    
    // Protection contre les monstres invalides
    if (!monster || typeof monster !== 'object') {
        return;
    }
    
    // Debug: Vérifier si l'IA est appelée pour le cochon
    if (monster.type === "cochon") {
        console.log(`🐷 IA Cochon appelée - État: ${monster.state}, HP: ${monster.hp}, Distance au joueur: ${Math.abs(window.player.x - monster.x) + Math.abs(window.player.y - monster.y)}`);
    }
    
    if (!monster.img || monster.hp <= 0) return;
    
    // Système d'alignement supprimé - Les monstres utilisent leur IA naturelle
    
    // Mouvement en cours : on ne touche pas au path sauf en aggro
    if (monster.moving && monster.state !== 'aggro') return;
    
    // --- DÉTECTION AGGRO ---
    let distToPlayer = Math.abs(player.x - monster.x) + Math.abs(player.y - monster.y);
    
    // Déterminer la distance d'aggro selon le type de monstre
    let aggroRange = monster.type === "slime" ? AGGRO_RANGE_SLIME : AGGRO_RANGE;
    
    // AGGRO AUTOMATIQUE POUR LES SLIMES
    if (monster.type === "slime" && !monster.aggro && distToPlayer <= AGGRO_RANGE_SLIME) {
        // Les slimes entrent automatiquement en aggro quand le joueur s'approche
        monster.aggro = true;
        monster.aggroTarget = player;
        monster.lastCombat = ts; // Initialiser le timer de combat
        monster.state = 'aggro'; // Forcer l'état en aggro
    }
    
    // Déclencher l'aggro si le monstre a été attaqué ET n'est pas en train de retourner
    if (monster.aggro && monster.aggroTarget === player && distToPlayer <= aggroRange && monster.state !== 'return') {
        // Vérifier qu'il y a eu une vraie interaction de combat récente
        if (monster.lastCombat && (ts - monster.lastCombat) < AGGRO_TIMEOUT) {
            if (monster.state !== 'aggro') {
                monster.state = 'aggro';
            }
        } else {
            // Si pas d'interaction récente, réinitialiser l'aggro
            monster.aggro = false;
            monster.aggroTarget = null;
        }
    }
    
    // --- AGGRO ---
    if (monster.state === 'aggro') {
        // Vérifier qu'il y a eu une vraie interaction de combat récente
        if (!monster.lastCombat || (ts - monster.lastCombat) >= AGGRO_TIMEOUT) {
            // Pas d'interaction récente, sortir de l'aggro et retourner à la patrouille normale
            monster.state = 'idle';
            monster.aggro = false;
            monster.aggroTarget = null;
            monster.movePath = [];
            monster.moving = false;
            monster.nextPatrolTime = ts + getRandomPatrolDelay();
            return;
        }
        
        // Délock si joueur mort ou trop loin (fail-safe)
        if (player.life <= 0 || distToPlayer > DEAGGRO_RANGE) {
            monster.state = 'return';
            monster.aggro = false;
            monster.aggroTarget = null;
            monster.movePath = [];
            monster.moving = false;
            return;
        }
        
        // ATTAQUE AUTOMATIQUE POUR LES SLIMES
        if (monster.type === "slime" && distToPlayer === 1) {
            // Les slimes attaquent automatiquement quand ils sont adjacents au joueur
            if (!monster.lastAttack || (ts - monster.lastAttack) >= 1000) { // Cooldown de 1 seconde entre attaques
                // Calcul des dégâts du slime
                const monsterBaseDamage = monster.damage !== undefined ? monster.damage : 3;
                const monsterTotalDamage = monsterBaseDamage + (monster.force || 0);
                const variation = 0.25; // 25% de variation
                const randomFactor = 1 + (Math.random() * 2 - 1) * variation; // Entre 0.75 et 1.25
                const monsterDamage = Math.max(1, Math.floor(monsterTotalDamage * randomFactor) - player.defense);
                
                // Appliquer les dégâts au joueur
                player.life -= monsterDamage;
                if (player.life < 0) player.life = 0;
                
                // Afficher les dégâts reçus par le joueur
                if (typeof displayDamage === "function") {
                    displayDamage(player.px, player.py, monsterDamage, 'damage', true);
                }
                
                // Mettre à jour le timer d'attaque et de combat
                monster.lastAttack = ts;
                monster.lastCombat = ts;
                
                // XP défense pour avoir reçu des dégâts
                if (typeof gainStatXP === "function") {
                    gainStatXP('defense', 1);
                }
            }
            // Ne pas continuer pour éviter les attaques doubles - le slime reste en place
            return;
        }
        
        // ATTAQUE AUTOMATIQUE POUR LE COCHON
        if (monster.type === "cochon" && distToPlayer === 1) {
            console.log(`🐷 Cochon adjacent au joueur! Distance: ${distToPlayer}, Type: ${monster.type}`);
            // Le cochon attaque automatiquement quand il est adjacent au joueur
            if (!monster.lastAttack || (ts - monster.lastAttack) >= 1000) { // Cooldown de 1 seconde entre attaques
                // Calcul des dégâts du cochon
                const monsterBaseDamage = monster.damage !== undefined ? monster.damage : 7;
                const monsterTotalDamage = monsterBaseDamage + (monster.force || 0);
                const variation = 0.25; // 25% de variation
                const randomFactor = 1 + (Math.random() * 2 - 1) * variation; // Entre 0.75 et 1.25
                const monsterDamage = Math.max(1, Math.floor(monsterTotalDamage * randomFactor) - player.defense);
                
                // Appliquer les dégâts au joueur
                player.life -= monsterDamage;
                if (player.life < 0) player.life = 0;
                
                // Afficher les dégâts reçus par le joueur
                if (typeof displayDamage === "function") {
                    displayDamage(player.px, player.py, monsterDamage, 'damage', true);
                }
                
                // Mettre à jour le timer d'attaque et de combat
                monster.lastAttack = ts;
                monster.lastCombat = ts;
                
                // XP défense pour avoir reçu des dégâts
                if (typeof gainStatXP === "function") {
                    gainStatXP('defense', 1);
                }
                
                console.log(`🐷 Cochon attaque le joueur: ${monsterDamage} dégâts`);
                
                // Le cochon reste en aggro et continue d'attaquer sur place
                // Pas de recul - il reste adjacent au joueur
            }
            // Si pas encore le temps d'attaquer, on reste en place
            return;
        }

// ATTAQUE AUTOMATIQUE POUR LE CORBEAU
if (monster.type === "crow" && distToPlayer === 1) {
    // Le corbeau attaque automatiquement quand il est adjacent au joueur
    if (!monster.lastAttack || (ts - monster.lastAttack) >= 1000) { // Cooldown de 1 seconde entre attaques
        // Calcul des dégâts du corbeau
        const monsterBaseDamage = monster.damage !== undefined ? monster.damage : 5;
        const monsterTotalDamage = monsterBaseDamage + (monster.force || 0);
        const variation = 0.25; // 25% de variation
        const randomFactor = 1 + (Math.random() * 2 - 1) * variation; // Entre 0.75 et 1.25
        const monsterDamage = Math.max(1, Math.floor(monsterTotalDamage * randomFactor) - player.defense);
        
        // Appliquer les dégâts au joueur
        player.life -= monsterDamage;
        if (player.life < 0) player.life = 0;
        
        // Afficher les dégâts reçus par le joueur
        if (typeof displayDamage === "function") {
            displayDamage(player.px, player.py, monsterDamage, 'damage', true);
        }
        
        // Mettre à jour le timer d'attaque et de combat
        monster.lastAttack = ts;
        monster.lastCombat = ts;
        
        // XP défense pour avoir reçu des dégâts
        if (typeof gainStatXP === "function") {
            gainStatXP('defense', 1);
        }
        
        console.log(`🐦 Corbeau attaque le joueur: ${monsterDamage} dégâts`);
        
        // Le corbeau reste en aggro et continue d'attaquer sur place
        // Pas de recul - il reste adjacent au joueur
    }
    // Si pas encore le temps d'attaquer, on reste en place
    return;
}

// ATTAQUE AUTOMATIQUE POUR LES ALUINEEKS
if (monster.type === "aluineeks" && distToPlayer === 1) {
    // L'aluineeks attaque automatiquement quand il est adjacent au joueur
    if (!monster.lastAttack || (ts - monster.lastAttack) >= 1000) { // Cooldown de 1 seconde entre attaques
        // Calcul des dégâts de l'aluineeks
        const monsterBaseDamage = monster.damage !== undefined ? monster.damage : 12;
        const monsterTotalDamage = monsterBaseDamage + (monster.force || 0);
        const variation = 0.3; // 30% de variation
        const randomFactor = 1 + (Math.random() * 2 - 1) * variation; // Entre 0.7 et 1.3
        const monsterDamage = Math.max(1, Math.floor(monsterTotalDamage * randomFactor) - player.defense);
        
        // Appliquer les dégâts au joueur
        player.life -= monsterDamage;
        if (player.life < 0) player.life = 0;
        
        // Afficher les dégâts reçus par le joueur
        if (typeof displayDamage === "function") {
            displayDamage(player.px, player.py, monsterDamage, 'damage', true);
        }
        
        // Mettre à jour le timer d'attaque et de combat
        monster.lastAttack = ts;
        monster.lastCombat = ts;
        
        // XP défense pour avoir reçu des dégâts
        if (typeof gainStatXP === "function") {
            gainStatXP('defense', 1);
        }
        
        console.log(`👹 Aluineeks attaque le joueur: ${monsterDamage} dégâts`);
        
        // L'aluineeks reste en aggro et continue d'attaquer sur place
        // Pas de recul - il reste adjacent au joueur
    }
    // Si pas encore le temps d'attaquer, on reste en place
    return;
}
        
        // Attaque si adjacent - DÉSACTIVÉ pour éviter les attaques doubles
        if (distToPlayer === 1) {
            // Mettre à jour le timer de combat pour maintenir l'aggro
            monster.lastCombat = ts;
            // Ne pas arrêter le monstre s'il est juste sélectionné, seulement s'il attaque
            return;
        }
        
        // Délock par timeout (8 secondes sans combat) peu importe la distance
        if ((ts - monster.lastCombat) > AGGRO_TIMEOUT) {
            monster.state = 'return';
            monster.aggro = false;
            monster.aggroTarget = null;
            monster.movePath = [];
            monster.moving = false;
            return;
        }
        
        // PATHFINDING INTELLIGENT VERS LE JOUEUR - Plus de "danse" !
        // Le monstre vise une case adjacente au joueur, mais recalcule intelligemment
        
        // Créer une fonction de collision qui inclut les monstres et le joueur
        const isBlockedWithCollisions = (x, y) => {
            // Vérifier les collisions du calque 2
            if (window.isBlocked(x, y)) return true;
            // Vérifier s'il y a un monstre vivant à cette position
            const monsterAtPosition = monsters.find(m => m.x === x && m.y === y && m.hp > 0 && !m.isDead);
            if (monsterAtPosition) return true;
            // Vérifier si le joueur occupe cette position
            if (player && player.x === x && player.y === y) return true;
            return false;
        };
        
        // TROUVER LA CASE ADJACENTE LA PLUS PROCHE ET ACCESSIBLE
        let destinations = [
            { x: player.x + 1, y: player.y },
            { x: player.x - 1, y: player.y },
            { x: player.x, y: player.y + 1 },
            { x: player.x, y: player.y - 1 }
        ].filter(pos =>
            pos.x >= 0 && pos.x < mapData.width &&
            pos.y >= 0 && pos.y < mapData.height &&
            !window.isBlocked(pos.x, pos.y) &&
            !monsters.some(m => m !== monster && m.x === pos.x && m.y === pos.y) &&
            !window.isOccupied(pos.x, pos.y, monster) // VÉRIFICATION DE COLLISION AVEC LE JOUEUR
        );

        // === POURSUITE STABLE SANS "DANSE" ===
        // Le joueur reste une collision. Le slime choisit un côté d'approche et s'y tient.
        // Il ne replanifie pas à chaque tick, seulement si nécessaire.
        {
            const REPATH_COOLDOWN_MS = 150; // anti-spam de pathfinding
            const MAX_TOLERANCE_KEEP_PATH = 1; // tolérance: si notre 1er pas rapproche, on garde

            // Champs internes (créés au besoin)
            if (monster.preferredApproach == null) monster.preferredApproach = null; // 'x' ou 'y'
            if (monster.currentDest == null) monster.currentDest = null; // {x,y} visé actuellement (adjacent au joueur)
            if (monster.repathAfter == null) monster.repathAfter = 0;   // timestamp pour limiter les recalculs

            // Fonction utilitaires
            const sgn = (n) => (n === 0 ? 0 : (n > 0 ? 1 : -1));
            const inBounds = (x, y) =>
                x >= 0 && x < mapData.width && y >= 0 && y < mapData.height;

            // Collision "forte" (mur + entités + joueur)
            const isBlockedWithCollisions = (x, y) => {
                if (window.isBlocked(x, y)) return true;
                // autre monstre vivant ?
                if (monsters.find(m => m !== monster && m.x === x && m.y === y && m.hp > 0 && !m.isDead)) return true;
                // joueur ?
                if (player && player.x === x && player.y === y) return true;
                // hook éventuel (si dispo)
                if (typeof window.isOccupied === 'function' && window.isOccupied(x, y, monster)) return true;
                return false;
            };

            // Calcule l'ordre de priorité des 4 cases adjacentes au joueur
            // en privilégiant un axe (inertie) puis les meilleures alternatives.
            const orderedAdjacentTargets = () => {
                const dx = player.x - monster.x;
                const dy = player.y - monster.y;

                // Choisir l'axe d'approche au premier lock ou si non défini.
                if (!monster.preferredApproach) {
                    monster.preferredApproach = (Math.abs(dx) >= Math.abs(dy)) ? 'x' : 'y';
                }

                // Cible principale = côté du joueur "en face" du slime le long de l'axe choisi
                const primary =
                    monster.preferredApproach === 'x'
                        ? { x: player.x - sgn(dx), y: player.y }           // venir depuis la gauche/droite
                        : { x: player.x,           y: player.y - sgn(dy) } // venir depuis le haut/bas

                // Les 3 autres côtés autour du joueur
                const around = [
                    { x: player.x + 1, y: player.y },
                    { x: player.x - 1, y: player.y },
                    { x: player.x,     y: player.y + 1 },
                    { x: player.x,     y: player.y - 1 }
                ];

                // Mettre "primary" devant, puis les autres classés par proximité du monstre
                const others = around
                    .filter(p => !(p.x === primary.x && p.y === primary.y));

                // Tri avec légère "inertie directionnelle" : on pénalise les virages brusques
                const lastDir = monster.lastDir || null; // 'E','W','N','S' (optionnel si tu la mets ailleurs)
                const turnPenalty = (from, to) => {
                    if (!from) return 0;
                    const dirFor = (a, b) => {
                        if (a.x < b.x) return 'E';
                        if (a.x > b.x) return 'W';
                        if (a.y < b.y) return 'S';
                        if (a.y > b.y) return 'N';
                        return from; // inchangé
                    };
                    const nd = dirFor({x: monster.x, y: monster.y}, to);
                    return (nd === from) ? 0 : 0.25; // petite pénalité si on tourne
                };

                others.sort((a, b) => {
                    const da = Math.abs(a.x - monster.x) + Math.abs(a.y - monster.y) + turnPenalty(lastDir, a);
                    const db = Math.abs(b.x - monster.x) + Math.abs(b.y - monster.y) + turnPenalty(lastDir, b);
                    return da - db;
                });

                // Liste finale ordonnée
                return [primary, ...others];
            };

            // Choix de la destination (adjacente au joueur), robuste aux micro-changements du joueur
            const chooseDestination = () => {
                const candidates = orderedAdjacentTargets().filter(p =>
                    inBounds(p.x, p.y) && !isBlockedWithCollisions(p.x, p.y)
                );

                if (candidates.length === 0) return null;

                // Si on avait déjà une destination, préférer la garder si elle est encore valide
                if (monster.currentDest) {
                    const stillHere = candidates.some(c => c.x === monster.currentDest.x && c.y === monster.currentDest.y);
                    if (stillHere) return monster.currentDest;
                }

                // Sinon, prendre la meilleure restante (déjà ordonnée par priorité)
                return candidates[0];
            };

            // Vérifie si le premier pas actuel nous rapproche suffisamment de la nouvelle cible
            const firstStepStillGood = (target) => {
                if (!monster.movePath || monster.movePath.length === 0) return false;
                const next = monster.movePath[0];
                const distNow  = Math.abs(monster.x - target.x) + Math.abs(monster.y - target.y);
                const distNext = Math.abs(next.x    - target.x) + Math.abs(next.y    - target.y);
                return (distNext <= distNow - MAX_TOLERANCE_KEEP_PATH);
            };

            // Si notre 1er pas est bloqué par qqun/qqch, il faut replanifier tout de suite
            const firstStepObstructed = () => {
                if (!monster.movePath || monster.movePath.length === 0) return true;
                const next = monster.movePath[0];
                return isBlockedWithCollisions(next.x, next.y);
            };

            // 1) déterminer la destination souhaitée (adjacente au joueur) avec inertie d'axe
            let dest = chooseDestination();

            // 2) Si aucune destination dispo, on ne bouge pas (on garde l'aggro via lastCombat)
            if (!dest) {
                return; // pas de case adjacente accessible pour le moment
            }

            // 3) Anti-danse : si notre 1er pas actuel reste bon pour la nouvelle dest -> on garde le chemin
            if (monster.movePath && monster.movePath.length > 0 && firstStepStillGood(dest) && !firstStepObstructed()) {
                // On continue sur le chemin en cours sans recalcul
                return;
            }

            // 4) Throttle de replanification (sauf si le chemin actuel est vide/obstrué)
            const allowRepath = ts >= monster.repathAfter || firstStepObstructed() || !monster.movePath || monster.movePath.length === 0;
            if (!allowRepath) {
                // On attend la fenêtre de repath, mais on laisse le mouvement en cours se dérouler
                return;
            }

            // 5) Calculer un chemin vers la destination préférée,
            //    sinon essayer les alternatives dans l'ordre
            const candidates = orderedAdjacentTargets().filter(p =>
                inBounds(p.x, p.y) && !isBlockedWithCollisions(p.x, p.y)
            );

            let chosen = null;
            let path = null;

            for (const c of candidates) {
                const p = findPath(
                    { x: monster.x, y: monster.y },
                    { x: c.x, y: c.y },
                    isBlockedWithCollisions,
                    mapData.width, mapData.height
                );
                if (p && p.length > 0) {
                    chosen = c;
                    path = p;
                    break;
                }
            }

            // 6) Si rien n'est atteignable (rare), on ne bouge pas ce tick
            if (!chosen || !path) {
                return;
            }

            // 7) Appliquer la nouvelle route
            monster.currentDest = { x: chosen.x, y: chosen.y };

            // Déterminer une direction symbolique pour une petite inertie de virage (facultatif)
            if (path[0]) {
                if (path[0].x > monster.x) monster.lastDir = 'E';
                else if (path[0].x < monster.x) monster.lastDir = 'W';
                else if (path[0].y > monster.y) monster.lastDir = 'S';
                else if (path[0].y < monster.y) monster.lastDir = 'N';
            }

            monster.movePath = path;
            monster.repathAfter = ts + REPATH_COOLDOWN_MS;

            if (typeof nextStepMonster === 'function') {
                nextStepMonster(monster, ts);
            }
        }
        return;
    }

    // --- RETOUR MAISON ---
    if (monster.state === 'return') {
        if (monster.x === monster.spawnX && monster.y === monster.spawnY) {
            monster.state = 'idle';
            monster.aggro = false;
            monster.aggroTarget = null;
            monster.nextPatrolTime = ts + getRandomPatrolDelay();
            monster.movePath = [];
            monster.moving = false;
            return;
        }
        if (!monster.moving || !monster.movePath || monster.movePath.length === 0) {
            let path = findPath(
                { x: monster.x, y: monster.y },
                { x: monster.spawnX, y: monster.spawnY },
                window.isBlocked,
                mapData.width, mapData.height
            );
            if (path && path.length > 0) {
                monster.movePath = path;
                if (typeof nextStepMonster === 'function') {
                    nextStepMonster(monster, ts);
                }
            }
        }
        return;
    }
}

// Export global
window.chasePlayerAI = chasePlayerAI; 
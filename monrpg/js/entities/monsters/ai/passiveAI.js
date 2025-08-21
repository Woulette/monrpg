// IA passive pour les monstres qui patrouillent sans aggro
// Nettoyé et validé le 30/07/2025 - par Cursor

const PATROL_DELAY_MIN = 3000; // ms minimum entre chaque patrouille
const PATROL_DELAY_MAX = 10000; // ms maximum entre chaque patrouille

// Fonction pour générer un délai de patrouille aléatoire
function getRandomPatrolDelay() {
    return PATROL_DELAY_MIN + Math.random() * (PATROL_DELAY_MAX - PATROL_DELAY_MIN);
}

// IA passive - patrouille simple sans aggro
function passiveAI(monster, ts) {
    // Protection contre les timestamps invalides
    if (!ts || ts < 0) {
        ts = Date.now();
    }
    
    // Protection contre les monstres invalides
    if (!monster || typeof monster !== 'object') {
        return;
    }
    
    if (!monster.img || monster.hp <= 0) return;
    
    // Mettre à jour l'alignement fluide si nécessaire
    if (typeof updateMonsterAlignment === 'function') {
        updateMonsterAlignment(monster);
    }
    
    // Mouvement en cours : on ne touche pas au path
    if (monster.moving) return;
    
    // --- PATROUILLE ---
    if (monster.state === 'patrol') {
        if (!monster.moving || !monster.movePath || monster.movePath.length === 0) {
            // Arrivé à destination, attendre avant prochaine patrouille
            monster.state = 'idle';
            monster.nextPatrolTime = ts + getRandomPatrolDelay();
            monster.movePath = [];
            monster.moving = false;
            return;
        }
        return;
    }

    // --- IDLE ---
    if (!monster.nextPatrolTime) monster.nextPatrolTime = ts + getRandomPatrolDelay();
    if (ts >= monster.nextPatrolTime) {
        // Générer une destination de patrouille sur toute la map
        let tries = 0, maxTries = 50;
        let found = false;
        while (tries < maxTries && !found) {
            // Distance aléatoire de 1 à 10 cases
            let distance = Math.floor(Math.random() * 10) + 1;
            let angle = Math.random() * 2 * Math.PI;
            let dx = Math.round(Math.cos(angle) * distance);
            let dy = Math.round(Math.sin(angle) * distance);
            let tx = monster.x + dx;
            let ty = monster.y + dy;
            
            // Vérifier que la destination est dans les limites de la map
            if (
                tx < 0 || tx >= mapData.width ||
                ty < 0 || ty >= mapData.height ||
                (tx === monster.x && ty === monster.y)
            ) { 
                tries++; 
                continue; 
            }
            
            // Vérifier que le chemin est possible
            let path = findPath(
                { x: monster.x, y: monster.y },
                { x: tx, y: ty },
                window.isBlocked,
                mapData.width, mapData.height
            );
            if (path && path.length > 0) {
                monster.movePath = path;
                monster.state = 'patrol';
                if (typeof nextStepMonster === 'function') {
                    nextStepMonster(monster, ts);
                }
                found = true;
            } else {
                tries++;
            }
        }
        if (!found) {
            monster.nextPatrolTime = ts + getRandomPatrolDelay();
        }
    }
}

// Export global
window.passiveAI = passiveAI;
window.getRandomPatrolDelay = getRandomPatrolDelay; 
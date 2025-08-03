// Système de synchronisation des monstres en multijoueur
// Version séparée et sécurisée - Ne touche pas au système existant
// Créé le 30/07/2025

class MonsterSyncManager {
    constructor() {
        this.syncedMonsters = new Map(); // Monstres synchronisés des autres joueurs
        this.localMonsterUpdates = new Map(); // Mises à jour de nos monstres à envoyer
        this.isEnabled = false;
        this.updateInterval = null;
        
        console.log('🐉 Système de synchronisation des monstres initialisé');
    }
    
    // Activer la synchronisation des monstres
    enable() {
        if (this.isEnabled) return;
        
        this.isEnabled = true;
        console.log('🐉 Synchronisation des monstres activée');
        
        // Démarrer les mises à jour
        this.startUpdates();
        
        // Synchroniser les monstres existants
        this.syncCurrentMonsters();
    }
    
    // Désactiver la synchronisation des monstres
    disable() {
        if (!this.isEnabled) return;
        
        this.isEnabled = false;
        console.log('🐉 Synchronisation des monstres désactivée');
        
        // Arrêter les mises à jour
        this.stopUpdates();
        
        // Nettoyer les monstres synchronisés
        this.syncedMonsters.clear();
    }
    
    // Démarrer les mises à jour périodiques
    startUpdates() {
        if (this.updateInterval) return;
        
        this.updateInterval = setInterval(() => {
            this.sendMonsterUpdates();
        }, 500); // Envoyer les mises à jour toutes les 500ms
    }
    
    // Arrêter les mises à jour
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    // Synchroniser les monstres actuels
    syncCurrentMonsters() {
        if (!window.monsters || !window.monsters.length) return;
        
        console.log(`🐉 Synchronisation de ${window.monsters.length} monstres locaux`);
        
        window.monsters.forEach(monster => {
            this.addLocalMonster(monster);
        });
    }
    
    // Ajouter un monstre local à la synchronisation
    addLocalMonster(monster) {
        if (!this.isEnabled) return;
        
        const monsterData = {
            id: monster.id || `local_${Date.now()}_${Math.random()}`,
            type: monster.type,
            x: monster.x,
            y: monster.y,
            direction: monster.direction,
            state: monster.state || 'idle',
            frame: monster.frame || 0,
            moving: monster.moving || false,
            level: monster.level || 1,
            isDead: monster.isDead || false
        };
        
        this.localMonsterUpdates.set(monsterData.id, monsterData);
        console.log(`🐉 Monstre local ajouté à la synchronisation: ${monsterData.type} (${monsterData.id})`);
    }
    
    // Envoyer les mises à jour des monstres au serveur
    sendMonsterUpdates() {
        if (!this.isEnabled || !window.multiplayerManager || !window.multiplayerManager.connected) return;
        
        const updates = Array.from(this.localMonsterUpdates.values());
        if (updates.length === 0) return;
        
        window.multiplayerManager.socket.send(JSON.stringify({
            type: 'monster_updates',
            data: updates
        }));
        
        // Nettoyer les mises à jour envoyées
        this.localMonsterUpdates.clear();
    }
    
    // Recevoir les mises à jour des monstres d'autres joueurs
    handleMonsterUpdates(updates) {
        if (!this.isEnabled) return;
        
        console.log(`🐉 Réception de ${updates.length} mises à jour de monstres`);
        
        updates.forEach(monsterData => {
            this.syncedMonsters.set(monsterData.id, monsterData);
        });
    }
    
    // Dessiner les monstres synchronisés
    drawSyncedMonsters(ctx) {
        if (!this.isEnabled || this.syncedMonsters.size === 0) return;
        
        this.syncedMonsters.forEach((monsterData, id) => {
            this.drawSyncedMonster(ctx, monsterData);
        });
    }
    
    // Dessiner un monstre synchronisé
    drawSyncedMonster(ctx, monsterData) {
        const x = monsterData.x * TILE_SIZE;
        const y = monsterData.y * TILE_SIZE;
        
        ctx.save();
        
        // Dessiner le monstre selon son type
        switch (monsterData.type) {
            case 'slime':
                this.drawSyncedSlime(ctx, x, y, monsterData);
                break;
            case 'corbeau':
                this.drawSyncedCorbeau(ctx, x, y, monsterData);
                break;
            case 'slimeboss':
                this.drawSyncedSlimeBoss(ctx, x, y, monsterData);
                break;
            default:
                // Fallback : dessiner un carré coloré
                ctx.fillStyle = '#ff6b6b';
                ctx.fillRect(x + 4, y + 4, 24, 24);
                break;
        }
        
        // Indicateur de synchronisation
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fillRect(x, y, 32, 32);
        
        ctx.restore();
    }
    
    // Dessiner un slime synchronisé
    drawSyncedSlime(ctx, x, y, monsterData) {
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(x + 4, y + 4, 24, 24);
        
        // Yeux
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 8, y + 8, 2, 2);
        ctx.fillRect(x + 18, y + 8, 2, 2);
    }
    
    // Dessiner un corbeau synchronisé
    drawSyncedCorbeau(ctx, x, y, monsterData) {
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + 4, y + 4, 24, 24);
        
        // Bec
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 12, y + 6, 8, 4);
    }
    
    // Dessiner un slime boss synchronisé
    drawSyncedSlimeBoss(ctx, x, y, monsterData) {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 2, y + 2, 28, 28);
        
        // Yeux
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 6, y + 6, 3, 3);
        ctx.fillRect(x + 19, y + 6, 3, 3);
    }
}

// Créer l'instance globale
window.monsterSyncManager = new MonsterSyncManager();

// Fonction pour activer la synchronisation des monstres
function enableMonsterSync() {
    if (window.monsterSyncManager) {
        window.monsterSyncManager.enable();
    }
}

// Fonction pour désactiver la synchronisation des monstres
function disableMonsterSync() {
    if (window.monsterSyncManager) {
        window.monsterSyncManager.disable();
    }
}

// Fonction pour dessiner les monstres synchronisés
function drawSyncedMonsters(ctx) {
    if (window.monsterSyncManager) {
        window.monsterSyncManager.drawSyncedMonsters(ctx);
    }
}

console.log('🐉 Module de synchronisation des monstres chargé'); 
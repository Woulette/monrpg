// Système de synchronisation des monstres en multijoueur
// Version séparée et sécurisée - Ne touche pas au système existant
// Créé le 30/07/2025

class MonsterSyncManager {
    constructor() {
        this.syncedMonsters = new Map(); // Monstres synchronisés des autres joueurs
        this.localMonsterUpdates = new Map(); // Mises à jour de nos monstres à envoyer
        this.localMonsters = new Map(); // Références aux monstres locaux par syncId
        this.isEnabled = false;
        this.updateInterval = null;
        this.nextSyncId = 1; // Compteur pour les syncId uniques
        
        console.log('🐉 Système de synchronisation des monstres initialisé');
    }
    
    // Générer un syncId unique pour un monstre
    generateSyncId() {
        return `local_${Date.now()}_${this.nextSyncId++}`;
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
        this.localMonsters.clear();
    }
    
    // Nettoyer les monstres synchronisés lors du changement de map
    clearSyncedMonsters() {
        this.syncedMonsters.clear();
        console.log('🗺️ Monstres synchronisés nettoyés lors du changement de map');
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
    
    // Synchroniser un monstre spécifique (appelé quand il bouge)
    syncMonster(monster) {
        if (!this.isEnabled || !monster) return;
        
        this.addLocalMonster(monster);
    }
    
    // Synchroniser une attaque sur un monstre
    syncMonsterAttack(monster, damage) {
        if (!this.isEnabled || !monster) {
            console.log(`⚠️ Impossible de synchroniser l'attaque: isEnabled=${this.isEnabled}, monster=${!!monster}`);
            return;
        }
        
        // Trouver le syncId du monstre
        let syncId = monster.syncId;
        if (!syncId) {
            // Si le monstre n'a pas de syncId, l'ajouter à la synchronisation
            console.log(`🔄 Monstre sans syncId, ajout à la synchronisation: ${monster.type}`);
            this.addLocalMonster(monster);
            syncId = monster.syncId;
        }
        
        if (!syncId) {
            console.error('⚠️ Impossible de synchroniser l\'attaque : monstre sans syncId');
            return;
        }
        
        const attackData = {
            monsterId: syncId,
            type: 'attack',
            damage: damage,
            monsterType: monster.type,
            monsterX: monster.x,
            monsterY: monster.y,
            timestamp: Date.now()
        };
        
        // Envoyer immédiatement l'attaque
        if (window.multiplayerManager && window.multiplayerManager.connected) {
            window.multiplayerManager.socket.send(JSON.stringify({
                type: 'monster_attack',
                data: attackData
            }));
            
            console.log(`⚔️ Attaque synchronisée: ${damage} dégâts sur ${monster.type} (${syncId}) - Position: (${monster.x}, ${monster.y})`);
        } else {
            console.log(`⚠️ Impossible d'envoyer l'attaque: multiplayerManager=${!!window.multiplayerManager}, connected=${window.multiplayerManager?.connected}`);
        }
    }

    // Ajouter un monstre local à la synchronisation
    addLocalMonster(monster) {
        if (!this.isEnabled) return;
        
        // Assigner un syncId si le monstre n'en a pas
        if (!monster.syncId) {
            monster.syncId = this.generateSyncId();
            console.log(`🐉 SyncId assigné au monstre ${monster.type}: ${monster.syncId}`);
        }
        
        const monsterData = {
            id: monster.syncId,
            type: monster.type,
            x: monster.x,
            y: monster.y,
            direction: monster.direction,
            state: monster.state || 'idle',
            frame: monster.frame || 0,
            moving: monster.moving || false,
            level: monster.level || 1,
            isDead: monster.isDead || false,
            hp: monster.hp || 100
        };
        
        // Stocker la référence au monstre local
        this.localMonsters.set(monster.syncId, monster);
        this.localMonsterUpdates.set(monster.syncId, monsterData);
        
        console.log(`🐉 Monstre local ajouté à la synchronisation: ${monsterData.type} (${monsterData.id}) - Position: (${monster.x}, ${monster.y})`);
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
    
    // Recevoir une attaque d'un autre joueur
    handleMonsterAttack(attackData) {
        if (!this.isEnabled) return;
        
        console.log(`⚔️ Attaque reçue: ${attackData.damage} dégâts sur ${attackData.monsterType} (${attackData.monsterId})`);
        
        // Chercher le monstre local par syncId d'abord
        let localMonster = this.localMonsters.get(attackData.monsterId);
        
        // Si pas trouvé par syncId, chercher par position et type
        if (!localMonster) {
            localMonster = window.monsters.find(m => 
                m.type === attackData.monsterType && 
                m.x === attackData.monsterX && 
                m.y === attackData.monsterY &&
                m.hp > 0
            );
        }
        
        if (localMonster) {
            // Appliquer les dégâts au monstre local
            localMonster.hp -= attackData.damage;
            
            // Afficher les dégâts
            if (typeof displayDamage === 'function') {
                displayDamage(localMonster.px, localMonster.py, attackData.damage, 'damage', false);
            }
            
            console.log(`⚔️ Dégâts appliqués au monstre local: ${localMonster.hp} HP restants`);
            
            // Vérifier si le monstre est mort
            if (localMonster.hp <= 0) {
                if (typeof release === "function") release(localMonster.x, localMonster.y);
                if (typeof killMonster === "function") killMonster(localMonster);
                
                // Retirer le monstre de la synchronisation
                if (localMonster.syncId) {
                    this.localMonsters.delete(localMonster.syncId);
                }
                
                console.log(`💀 Monstre local tué par un autre joueur`);
            }
        } else {
            console.log(`⚠️ Monstre local non trouvé pour l'attaque reçue`);
        }
    }

    // Dessiner les monstres synchronisés
    drawSyncedMonsters(ctx) {
        if (!this.isEnabled || this.syncedMonsters.size === 0) return;
        
        this.syncedMonsters.forEach((monsterData, id) => {
            // Ne pas dessiner les monstres morts
            if (monsterData.isDead) {
                this.syncedMonsters.delete(id);
                return;
            }
            
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

// Fonction pour synchroniser un monstre spécifique
function syncMonster(monster) {
    if (window.monsterSyncManager) {
        window.monsterSyncManager.syncMonster(monster);
    }
}

// Fonction pour synchroniser une attaque sur un monstre
function syncMonsterAttack(monster, damage) {
    if (window.monsterSyncManager) {
        window.monsterSyncManager.syncMonsterAttack(monster, damage);
    }
}

// Fonction pour nettoyer les monstres synchronisés lors du changement de map
function clearSyncedMonsters() {
    if (window.monsterSyncManager) {
        window.monsterSyncManager.clearSyncedMonsters();
    }
}

console.log('🐉 Module de synchronisation des monstres chargé'); 
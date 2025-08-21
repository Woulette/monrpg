// Initialisation du joueur
const player = {
    x: 25,
    y: 12,
    direction: 0,
    frame: 0,
    lastAnim: 0, // Ajout pour gérer l'animation
    px: 25 * TILE_SIZE,
    py: 12 * TILE_SIZE,
    moving: false,
    moveTarget: { x: 25, y: 12 },
    path: [],
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    maxLife: 50,
    life: 50,
    // Statistiques de base (modifiables avec points de caractéristiques)
    baseForce: 1,
    baseIntelligence: 1,
    baseAgilite: 1,
    baseDefense: 1,
    baseChance: 1,
    baseVitesse: 1,
    baseVie: 1, // Stat de vie de base
    
    // Statistiques d'équipement (calculées automatiquement)
    equipForce: 0,
    equipIntelligence: 0,
    equipAgilite: 0,
    equipDefense: 0,
    equipChance: 0,
    equipVitesse: 0,
    equipVie: 0, // Bonus de vie via équipement
    
    // Statistiques totales (affichées) = base + combat + équipement
    force: 1,
    intelligence: 1,
    agilite: 1,
    defense: 1,
    chance: 1,
    vitesse: 1,
    vie: 1, // Stat totale de vie
    
    // Stats gagnées par l'XP de combat (permanentes, non modulables)
    combatForce: 0,
    combatIntelligence: 0,
    combatAgilite: 0,
    combatDefense: 0,
    combatChance: 0,
    combatVitesse: 0,
    combatVie: 0,
    
    // XP des statistiques de base
    forceXp: 0,
    intelligenceXp: 0,
    agiliteXp: 0,
    defenseXp: 0,
    chanceXp: 0,
    vitesseXp: 0,
    // XP nécessaire pour le prochain niveau de chaque stat de base
    forceXpToNext: 10,
    intelligenceXpToNext: 10,
    agiliteXpToNext: 10,
    defenseXpToNext: 10,
    chanceXpToNext: 10,
    vitesseXpToNext: 50, // 5 points de caractéristique = +1 vitesse
    // Points de caractéristiques à distribuer (modulables)
    statPoints: 0, // Démarrage avec 0 point
    // Monnaie
    pecka: 0,
    // État de combat
    inCombat: false,
    lastCombatTime: 0,
    lastRegenTime: 0,
    // Suivi automatique
    autoFollow: false,
    // Système de mort et respawn
    isDead: false,
    deathTime: 0,
    respawnTime: 3000, // 3 secondes pour le respawn
    spawnX: 25, // Point de spawn modifié
    spawnY: 12
};

// Initialiser les stats totales au démarrage
recalculateTotalStats();

// Rendre la fonction de réinitialisation disponible globalement
window.resetPlayer = resetPlayer;

function initPlayer() {
    // Initialiser la position du joueur
    player.px = player.x * TILE_SIZE;
    player.py = player.y * TILE_SIZE;
    
    // Marquer la position initiale comme occupée
    if (typeof occupy === "function") {
        occupy(player.x, player.y);
    }
}

// Fonction pour réinitialiser complètement le joueur
function resetPlayer() {
    // Réinitialiser les propriétés de base
    player.x = 25;
    player.y = 12;
    player.direction = 0;
    player.frame = 0;
    player.lastAnim = 0; // Réinitialiser l'animation
    player.px = 25 * TILE_SIZE;
    player.py = 12 * TILE_SIZE;
    player.moving = false;
    player.moveTarget = { x: 25, y: 12 };
    player.path = [];
    
    // Réinitialiser le niveau et l'XP
    player.level = 1;
    player.xp = 0;
    player.xpToNextLevel = 100;
    
    // Réinitialiser la vie
    player.maxLife = 50;
    player.life = 50;
    
    // Réinitialiser les statistiques de base
    player.baseForce = 1;
    player.baseIntelligence = 1;
    player.baseAgilite = 1;
    player.baseDefense = 1;
    player.baseChance = 1;
    player.baseVitesse = 1;
    player.baseVie = 1;
    
    // Réinitialiser les stats de combat (permanentes)
    player.combatForce = 0;
    player.combatIntelligence = 0;
    player.combatAgilite = 0;
    player.combatDefense = 0;
    player.combatChance = 0;
    player.combatVitesse = 0;
    player.combatVie = 0;
    
    // Réinitialiser les statistiques d'équipement
    player.equipForce = 0;
    player.equipIntelligence = 0;
    player.equipAgilite = 0;
    player.equipDefense = 0;
    player.equipChance = 0;
    player.equipVitesse = 0;
    player.equipVie = 0;
    
    // Réinitialiser l'XP des statistiques
    player.forceXp = 0;
    player.intelligenceXp = 0;
    player.agiliteXp = 0;
    player.defenseXp = 0;
    player.chanceXp = 0;
    player.vitesseXp = 0;
    
    // Réinitialiser l'XP nécessaire pour le prochain niveau
    player.forceXpToNext = 10;
    player.intelligenceXpToNext = 10;
    player.agiliteXpToNext = 10;
    player.defenseXpToNext = 10;
    player.chanceXpToNext = 10;
    player.vitesseXpToNext = 50;
    
    // Réinitialiser les points de caractéristiques
    player.statPoints = 0; // Démarrage avec 0 point
    
    // Réinitialiser la monnaie
    player.pecka = 0;
    
    // Réinitialiser l'état de combat
    player.inCombat = false;
    player.lastCombatTime = 0;
    player.lastRegenTime = 0;
    
    // Réinitialiser le suivi automatique
    player.autoFollow = false;
    
    // Réinitialiser le système de mort et respawn
    player.isDead = false;
    player.deathTime = 0;
    player.respawnTime = 3000;
    player.spawnX = 25;
    player.spawnY = 12;
    
    // Recalculer les stats totales
    recalculateTotalStats();
}

// Chargement de l'image du joueur
const playerImg = new Image();
playerImg.onload = () => {
    // Image chargée avec succès
};
playerImg.onerror = () => {
    console.error('Erreur de chargement de l\'image du joueur: assets/personnages/player.png');
};
playerImg.src = 'assets/personnages/player.png';

// Rendre l'image accessible globalement
window.playerImg = playerImg;

let attackTarget = null; // Monstre ciblé pour le combat
window.attackTarget = attackTarget;

// Fonction de dessin du joueur
function drawPlayer(ctx) {
    // Vérifier que nous utilisons le bon objet player
    const currentPlayer = window.player || player;
    
    if (!window.playerImg || !window.playerImg.complete || currentPlayer.isDead) {
        return;
    }
    
    try {
        ctx.drawImage(
            window.playerImg,
            currentPlayer.frame * PLAYER_WIDTH,
            currentPlayer.direction * PLAYER_HEIGHT,
            PLAYER_WIDTH, PLAYER_HEIGHT,
            currentPlayer.px + (window.mapOffsetX || 0), currentPlayer.py + (window.mapOffsetY || 0),
            TILE_SIZE, TILE_SIZE
        );
    } catch (error) {
        console.error('Erreur lors du dessin du joueur:', error);
    }
}

// Fonction de diagnostic du joueur
function diagnosePlayer() {
    // Tous les console.log supprimés dans ce fichier.
}

// Export des fonctions principales
window.player = player;
window.initPlayer = initPlayer;
window.drawPlayer = drawPlayer;
window.diagnosePlayer = diagnosePlayer; 
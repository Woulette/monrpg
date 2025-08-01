// Constantes liées au joueur
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 32;
const TILE_SIZE = window.TILE_SIZE || 32;
const MOVE_SPEED = 6;

// Constantes pour combat
const PLAYER_ATTACK_DAMAGE = 5;
const PLAYER_ATTACK_RANGE = 1;

// Variables animation
let lastAnim = 0;
const animDelay = 120;

// Export des constantes
window.PLAYER_WIDTH = PLAYER_WIDTH;
window.PLAYER_HEIGHT = PLAYER_HEIGHT;
window.PLAYER_ATTACK_DAMAGE = PLAYER_ATTACK_DAMAGE;
window.PLAYER_ATTACK_RANGE = PLAYER_ATTACK_RANGE;
window.lastAnim = lastAnim;
window.animDelay = animDelay; 
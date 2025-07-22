// Chat flottant - Mon RPG 2D
// Système de messages flottants pour les drops et événements

// Variables globales
let floatingChatContainer = null;
let messageQueue = [];
let isProcessingQueue = false;

// Fonction d'initialisation
function initFloatingChat() {
    
    // Créer le container du chat flottant
    createFloatingChatContainer();
    
    // Charger le CSS
    loadFloatingChatCSS();
}

// Créer le container du chat flottant
function createFloatingChatContainer() {
    floatingChatContainer = document.createElement('div');
    floatingChatContainer.id = 'floating-chat';
    document.body.appendChild(floatingChatContainer);
}

// Charger le CSS du chat flottant
function loadFloatingChatCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'chat/floating-chat.css';
    document.head.appendChild(link);
}

// Fonction principale pour ajouter un message flottant
function addFloatingMessage(message, type = 'default', duration = 4000) {
    if (!floatingChatContainer) {
        console.error("Container du chat flottant non trouvé");
        return;
    }
    
    // Créer le message
    const messageElement = document.createElement('div');
    messageElement.className = `floating-message ${type}`;
    messageElement.textContent = message;
    
    // Ajouter au container
    floatingChatContainer.appendChild(messageElement);
    
    // Animation d'apparition
    setTimeout(() => {
        messageElement.classList.add('show');
    }, 100);
    
    // Animation de disparition
    setTimeout(() => {
        messageElement.classList.add('hide');
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 300);
    }, duration);
}

// Fonctions spécifiques pour les différents types de messages

// Message de pecka trouvé
function showGoldDrop(amount) {
    addFloatingMessage(`💰 +${amount} pecka`, 'gold', 2500);
}

// Message de ressource récoltée
function showResourceDrop(resource, amount) {
    addFloatingMessage(`🌿 +${amount} ${resource} récoltées !`, 'resource', 4000);
}

// Message d'objet trouvé
function showItemDrop(itemName) {
    addFloatingMessage(`⚔️ ${itemName} trouvé !`, 'item', 5000);
}

// Message d'événement spécial
function showEventMessage(message) {
    addFloatingMessage(`🎁 ${message}`, 'event', 5000);
}

// Message de niveau
function showLevelUp(level, statPoints) {
    addFloatingMessage(`📈 Niveau ${level} ! +${statPoints} points de caractéristiques`, 'level', 6000);
}

// Message de coffre au trésor
function showTreasureChest(message) {
    addFloatingMessage(`🎁 ${message}`, 'event', 5000);
}

// Export des fonctions globales
window.initFloatingChat = initFloatingChat;
window.addFloatingMessage = addFloatingMessage;
window.showGoldDrop = showGoldDrop;
window.showResourceDrop = showResourceDrop;
window.showItemDrop = showItemDrop;
window.showEventMessage = showEventMessage;
window.showLevelUp = showLevelUp;
window.showTreasureChest = showTreasureChest; 
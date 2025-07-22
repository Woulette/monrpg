// Chat multi-onglets pour Mon RPG 2D

// Variables globales
let chatContainer = null;
let chatToggle = null;
let currentTab = 'game';
let chatElements = {};

// Fonction d'initialisation
function initChat() {
    console.log("Initialisation du chat...");
    
    // Créer le HTML du chat directement
    createChatHTML();
    
    // Initialiser les éléments
    initializeChatElements();
    
    // Ajouter les event listeners
    setupEventListeners();
    
    console.log("Chat initialisé");
}

// Créer le HTML du chat
function createChatHTML() {
    const chatHTML = `
        <div id="chat-container" class="chat-hidden">
            <div class="chat-header">
                <div class="chat-tabs">
                    <button class="chat-tab active" data-tab="game">🎮 Jeu</button>
                    <button class="chat-tab" data-tab="drops">💰 Drops</button>
                    <button class="chat-tab" data-tab="trade">🛒 Commerce</button>
                    <button class="chat-tab" data-tab="recruit">👥 Recrutement</button>
                </div>
                <button class="chat-close" id="chat-close">&times;</button>
            </div>
            
            <div class="chat-content active" id="chat-game">
                <div class="chat-messages" id="chat-messages-game">
                    <div class="chat-message system">🎮 Bienvenue dans Mon RPG 2D !</div>
                    <div class="chat-message system">💡 Appuyez sur T pour ouvrir/fermer le chat</div>
                </div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" id="chat-input-game" placeholder="Message de jeu..." maxlength="100">
                </div>
            </div>
            
            <div class="chat-content" id="chat-drops">
                <div class="chat-messages" id="chat-messages-drops">
                    <div class="chat-message system">💰 Ici vous verrez tous vos drops et récompenses</div>
                </div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" id="chat-input-drops" placeholder="Message de drops..." maxlength="100">
                </div>
            </div>
            
            <div class="chat-content" id="chat-trade">
                <div class="chat-messages" id="chat-messages-trade">
                    <div class="chat-message system">🛒 Zone de commerce et de vente</div>
                </div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" id="chat-input-trade" placeholder="Message de commerce..." maxlength="100">
                </div>
            </div>
            
            <div class="chat-content" id="chat-recruit">
                <div class="chat-messages" id="chat-messages-recruit">
                    <div class="chat-message system">👥 Zone de recrutement et de groupe</div>
                </div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" id="chat-input-recruit" placeholder="Message de recrutement..." maxlength="100">
                </div>
            </div>
        </div>

        <button class="chat-toggle" id="chat-toggle">💬</button>
    `;
    
    // Ajouter au body
    document.body.insertAdjacentHTML('beforeend', chatHTML);
    
    // Charger le CSS
    loadChatCSS();
}

// Charger le CSS du chat
function loadChatCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'chat/chat.css';
    document.head.appendChild(link);
}

// Initialiser les éléments du chat
function initializeChatElements() {
    chatContainer = document.getElementById('chat-container');
    chatToggle = document.getElementById('chat-toggle');
    
    chatElements = {
        game: {
            content: document.getElementById('chat-game'),
            messages: document.getElementById('chat-messages-game'),
            input: document.getElementById('chat-input-game')
        },
        drops: {
            content: document.getElementById('chat-drops'),
            messages: document.getElementById('chat-messages-drops'),
            input: document.getElementById('chat-input-drops')
        },
        trade: {
            content: document.getElementById('chat-trade'),
            messages: document.getElementById('chat-messages-trade'),
            input: document.getElementById('chat-input-trade')
        },
        recruit: {
            content: document.getElementById('chat-recruit'),
            messages: document.getElementById('chat-messages-recruit'),
            input: document.getElementById('chat-input-recruit')
        }
    };
}

// Configurer les event listeners
function setupEventListeners() {
    if (!chatContainer || !chatToggle) return;
    
    // Bouton toggle
    chatToggle.addEventListener('click', toggleChat);
    
    // Bouton fermer
    const closeBtn = document.getElementById('chat-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeChat);
    }
    
    // Onglets
    const tabs = document.querySelectorAll('.chat-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Inputs
    Object.keys(chatElements).forEach(tabName => {
        const input = chatElements[tabName].input;
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleMessage(tabName, input.value);
                    input.value = '';
                }
            });
        }
    });
    
    // Touche Entrée pour ouvrir le chat
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            // Seulement si le chat est fermé et qu'on n'est pas dans un input
            const isInInput = e.target.classList.contains('chat-input');
            if (!isInInput && chatContainer.classList.contains('chat-hidden')) {
                e.preventDefault();
                openChat();
            }
        }
        
        // Touche Échap pour fermer le chat
        if (e.key === 'Escape') {
            if (!chatContainer.classList.contains('chat-hidden')) {
                e.preventDefault();
                closeChat();
            }
        }
    });
}

// Basculer l'affichage du chat
function toggleChat() {
    if (!chatContainer) return;
    
    if (chatContainer.classList.contains('chat-hidden')) {
        openChat();
    } else {
        closeChat();
    }
}

// Ouvrir le chat
function openChat() {
    if (!chatContainer) return;
    chatContainer.classList.remove('chat-hidden');
    chatContainer.style.display = 'flex';
}

// Fermer le chat
function closeChat() {
    if (!chatContainer) return;
    chatContainer.classList.add('chat-hidden');
    chatContainer.style.display = 'none';
}

// Changer d'onglet
function switchTab(tabName) {
    if (!chatElements[tabName]) return;
    
    // Désactiver l'onglet actuel
    const currentContent = chatElements[currentTab].content;
    const currentTabBtn = document.querySelector(`[data-tab="${currentTab}"]`);
    
    if (currentContent) currentContent.classList.remove('active');
    if (currentTabBtn) currentTabBtn.classList.remove('active');
    
    // Activer le nouvel onglet
    const newContent = chatElements[tabName].content;
    const newTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    
    if (newContent) newContent.classList.add('active');
    if (newTabBtn) newTabBtn.classList.add('active');
    
    currentTab = tabName;
}

// Gérer l'envoi d'un message
function handleMessage(tabName, message) {
    if (!message.trim()) return;
    const messageType = getMessageType(tabName);
    addMessage(tabName, message, messageType);
    
    // Si c'est un message de jeu, l'afficher au-dessus du personnage
    if (tabName === 'game') {
        showPlayerMessage(message);
    }
}

// Déterminer le type de message
function getMessageType(tabName) {
    switch (tabName) {
        case 'drops': return 'drop';
        case 'trade': return 'trade';
        case 'recruit': return 'recruit';
        default: return 'player';
    }
}

// Ajouter un message
function addMessage(tabName, text, type = 'player') {
    const messagesContainer = chatElements[tabName]?.messages;
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${type}`;
    messageElement.textContent = text;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Limiter à 50 messages
    const messages = messagesContainer.children;
    if (messages.length > 50) {
        messagesContainer.removeChild(messages[0]);
    }
}

// Fonctions publiques
function addDropMessage(text) {
    addMessage('drops', text, 'drop');
}

function addTradeMessage(text) {
    addMessage('trade', text, 'trade');
}

function addRecruitMessage(text) {
    addMessage('recruit', text, 'recruit');
}

function addGameMessage(text) {
    addMessage('game', text, 'player');
}

function addSystemMessage(text, tabName = 'game') {
    addMessage(tabName, text, 'system');
}

// Afficher un message au-dessus du personnage
function showPlayerMessage(message) {
    if (typeof createPlayerBubble === 'function') {
        createPlayerBubble(message);
    }
}

// Export des fonctions
window.initChat = initChat;
window.addDropMessage = addDropMessage;
window.addTradeMessage = addTradeMessage;
window.addRecruitMessage = addRecruitMessage;
window.addGameMessage = addGameMessage;
window.addSystemMessage = addSystemMessage;
window.showPlayerMessage = showPlayerMessage; 
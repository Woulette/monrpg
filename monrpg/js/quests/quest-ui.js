// js/quests/quest-ui.js - Interface utilisateur des quêtes

// Afficher l'offre de quête
function showQuestOffer() {
    const quest = getCurrentQuests().crowHunt;
    
    // Créer la fenêtre de quête
    let questModal = document.getElementById('quest-offer-modal');
    if (!questModal) {
        questModal = document.createElement('div');
        questModal.id = 'quest-offer-modal';
        questModal.className = 'quest-modal';
        
        const questContent = document.createElement('div');
        questContent.className = 'quest-content';
        
        const questTitle = document.createElement('h2');
        questTitle.textContent = '🎯 Quête Disponible';
        questTitle.className = 'quest-title';
        
        const questName = document.createElement('h3');
        questName.textContent = quest.name;
        questName.className = 'quest-name';
        
        const questDesc = document.createElement('p');
        questDesc.textContent = quest.description;
        questDesc.className = 'quest-description';
        
        const questReward = document.createElement('div');
        questReward.className = 'quest-reward';
        
        // Créer l'affichage avec les images
        questReward.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>Récompenses:</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    ⭐ ${quest.reward.xp} XP
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    💰 ${quest.reward.pecka} Pecka
                </div>
                ${quest.reward.items ? quest.reward.items.map(item => `
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <img src="assets/objets/${item.id.replace('_', 'de')}.png" alt="${item.name}" style="width: 20px; height: 20px;">
                        <span>${item.quantity}x ${item.name}</span>
                    </div>
                `).join('') : ''}
            </div>
        `;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'quest-button-container';
        
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accepter';
        acceptButton.className = 'quest-accept-btn';
        acceptButton.onclick = function() {
            acceptQuest(quest.id);
            questModal.remove();
        };
        
        const declineButton = document.createElement('button');
        declineButton.textContent = 'Refuser';
        declineButton.className = 'quest-decline-btn';
        declineButton.onclick = function() {
            questModal.remove();
            if (typeof window.hidePNJDialogModal === 'function') {
                window.hidePNJDialogModal();
            }
        };
        
        buttonContainer.appendChild(acceptButton);
        buttonContainer.appendChild(declineButton);
        
        questContent.appendChild(questTitle);
        questContent.appendChild(questName);
        questContent.appendChild(questDesc);
        questContent.appendChild(questReward);
        questContent.appendChild(buttonContainer);
        
        questModal.appendChild(questContent);
        document.body.appendChild(questModal);
    }
}

// Afficher l'offre de quête de craft
function showCraftQuestOffer() {
    const quest = getCurrentQuests().crowCraft;
    
    // Créer la fenêtre de quête
    let questModal = document.getElementById('craft-quest-offer-modal');
    if (!questModal) {
        questModal = document.createElement('div');
        questModal.id = 'craft-quest-offer-modal';
        questModal.className = 'quest-modal';
        
        const questContent = document.createElement('div');
        questContent.className = 'quest-content';
        
        const questTitle = document.createElement('h2');
        questTitle.textContent = '🎯 Nouvelle Quête Disponible';
        questTitle.className = 'quest-title';
        
        const questName = document.createElement('h3');
        questName.textContent = quest.name;
        questName.className = 'quest-name';
        
        const questDesc = document.createElement('p');
        questDesc.textContent = quest.description;
        questDesc.className = 'quest-description';
        
        // Afficher les objets requis
        const requiredItemsDiv = document.createElement('div');
        requiredItemsDiv.className = 'quest-required-items';
        requiredItemsDiv.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>Objets requis:</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                ${quest.requiredItems.map(item => `
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <img src="${getQuestItemImagePath(item.id)}" 
                             style="width: 20px; height: 20px; vertical-align: middle;" 
                             onerror="this.style.display='none'">
                        ${item.quantity}x ${item.name}
                    </div>
                `).join('')}
            </div>
        `;
        
        const questReward = document.createElement('div');
        questReward.className = 'quest-reward';
        
        // Créer l'affichage avec les images
        questReward.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>Récompenses:</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    ⭐ ${quest.reward.xp} XP
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    💰 ${quest.reward.pecka} Pecka
                </div>
                ${quest.reward.items ? quest.reward.items.map(item => `
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <img src="assets/objets/${item.id}.png" 
                             style="width: 20px; height: 20px; vertical-align: middle;" 
                             onerror="this.style.display='none'">
                        ${item.quantity}x ${item.name}
                    </div>
                `).join('') : ''}
            </div>
        `;
        
        // Boutons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'quest-buttons';
        
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accepter';
        acceptButton.className = 'quest-accept-btn';
        acceptButton.onclick = function() {
            acceptQuest('crowCraft');
            document.body.removeChild(questModal);
        };
        
        const declineButton = document.createElement('button');
        declineButton.textContent = 'Refuser';
        declineButton.className = 'quest-decline-btn';
        declineButton.onclick = function() {
            document.body.removeChild(questModal);
        };
        
        buttonContainer.appendChild(acceptButton);
        buttonContainer.appendChild(declineButton);
        
        questContent.appendChild(questTitle);
        questContent.appendChild(questName);
        questContent.appendChild(questDesc);
        questContent.appendChild(requiredItemsDiv);
        questContent.appendChild(questReward);
        questContent.appendChild(buttonContainer);
        
        questModal.appendChild(questContent);
        document.body.appendChild(questModal);
    }
}

// Afficher l'offre de quête du boss slime
function showSlimeBossQuestOffer() {
    const quest = getCurrentQuests().slimeBoss;
    
    if (!quest) {
        return;
    }
    
    // Créer la fenêtre de quête
    let questModal = document.getElementById('slime-boss-quest-offer-modal');
    if (!questModal) {
        questModal = document.createElement('div');
        questModal.id = 'slime-boss-quest-offer-modal';
        questModal.className = 'quest-modal';
        
        const questContent = document.createElement('div');
        questContent.className = 'quest-content';
        
        const questTitle = document.createElement('h2');
        questTitle.textContent = '🎯 Nouvelle Quête Disponible';
        questTitle.className = 'quest-title';
        
        const questName = document.createElement('h3');
        questName.textContent = quest.name;
        questName.className = 'quest-name';
        
        const questDesc = document.createElement('p');
        questDesc.textContent = quest.description;
        questDesc.className = 'quest-description';
        
        // Afficher les objets requis
        const requiredItemsDiv = document.createElement('div');
        requiredItemsDiv.className = 'quest-required-items';
        requiredItemsDiv.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>Objets requis:</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                ${quest.requiredItems.map(item => `
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <img src="${getQuestItemImagePath(item.id)}" 
                             style="width: 20px; height: 20px; vertical-align: middle;" 
                             onerror="this.style.display='none'">
                        ${item.quantity}x ${item.name}
                    </div>
                `).join('')}
            </div>
        `;
        
        const questReward = document.createElement('div');
        questReward.className = 'quest-reward';
        
        // Créer l'affichage avec les images
        questReward.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>Récompenses:</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    ⭐ ${quest.reward.xp} XP
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    💰 ${quest.reward.pecka} Pecka
                </div>
            </div>
        `;
        
        // Boutons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'quest-buttons';
        
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accepter';
        acceptButton.className = 'quest-accept-btn';
        acceptButton.onclick = function() {
            acceptQuest('slimeBoss');
            document.body.removeChild(questModal);
        };
        
        const declineButton = document.createElement('button');
        declineButton.textContent = 'Refuser';
        declineButton.className = 'quest-decline-btn';
        declineButton.onclick = function() {
            document.body.removeChild(questModal);
        };
        
        buttonContainer.appendChild(acceptButton);
        buttonContainer.appendChild(declineButton);
        
        questContent.appendChild(questTitle);
        questContent.appendChild(questName);
        questContent.appendChild(questDesc);
        questContent.appendChild(requiredItemsDiv);
        questContent.appendChild(questReward);
        questContent.appendChild(buttonContainer);
        
        questModal.appendChild(questContent);
        document.body.appendChild(questModal);
    }
}

// Afficher l'offre de quête finale du SlimeBoss
function showSlimeBossFinalQuestOffer() {
    const quest = getCurrentQuests().slimeBossFinal;
    
    // Créer la fenêtre de quête
    let questModal = document.getElementById('slime-boss-final-quest-offer-modal');
    if (!questModal) {
        questModal = document.createElement('div');
        questModal.id = 'slime-boss-final-quest-offer-modal';
        questModal.className = 'quest-modal';
        
        const questContent = document.createElement('div');
        questContent.className = 'quest-content';
        
        const questTitle = document.createElement('h2');
        questTitle.textContent = '🎯 Quête Finale Disponible';
        questTitle.className = 'quest-title';
        
        const questName = document.createElement('h3');
        questName.textContent = quest.name;
        questName.className = 'quest-name';
        
        const questDesc = document.createElement('p');
        questDesc.textContent = quest.description;
        questDesc.className = 'quest-description';
        
        const questReward = document.createElement('div');
        questReward.className = 'quest-reward';
        
        // Créer l'affichage avec les images
        questReward.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>Récompenses:</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    ⭐ ${quest.reward.xp} XP
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    💰 ${quest.reward.pecka} Pecka
                </div>
                ${quest.reward.items ? quest.reward.items.map(item => `
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <img src="${getQuestItemImagePath(item.id)}" 
                             style="width: 20px; height: 20px; vertical-align: middle;" 
                             onerror="this.style.display='none'">
                        ${item.quantity}x ${item.name}
                    </div>
                `).join('') : ''}
            </div>
        `;
        
        // Boutons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'quest-buttons';
        
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accepter';
        acceptButton.className = 'quest-accept-btn';
        acceptButton.onclick = function() {
            acceptQuest('slimeBossFinal');
            document.body.removeChild(questModal);
        };
        
        const declineButton = document.createElement('button');
        declineButton.textContent = 'Refuser';
        declineButton.className = 'quest-decline-btn';
        declineButton.onclick = function() {
            document.body.removeChild(questModal);
        };
        
        buttonContainer.appendChild(acceptButton);
        buttonContainer.appendChild(declineButton);
        
        questContent.appendChild(questTitle);
        questContent.appendChild(questName);
        questContent.appendChild(questDesc);
        questContent.appendChild(questReward);
        questContent.appendChild(buttonContainer);
        
        questModal.appendChild(questContent);
        document.body.appendChild(questModal);
    }
}

// ===== NOUVELLES FONCTIONS POUR LA FENÊTRE PRINCIPALE =====

// Variable pour l'onglet actif
let currentQuestTab = 'all';

// Initialiser la fenêtre des quêtes
function initQuestsWindow() {
    // Ajouter l'événement de clic sur l'icône des quêtes
    const quetesIcon = document.getElementById('quetes-icon');
    if (quetesIcon) {
        quetesIcon.addEventListener('click', openQuestsWindow);
    }
    
    // Ajouter l'événement de fermeture
    const closeButton = document.getElementById('close-quests-modal');
    if (closeButton) {
        closeButton.addEventListener('click', closeQuestsWindow);
    }
    
    // Ajouter les événements des onglets
    const tabs = document.querySelectorAll('.quest-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchQuestTab(tab.dataset.tab);
        });
    });
    
    // Fermer en cliquant en dehors
    const modal = document.getElementById('quests-main-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeQuestsWindow();
            }
        });
    }
}

// Ouvrir la fenêtre des quêtes
function openQuestsWindow() {
    const modal = document.getElementById('quests-main-modal');
    if (modal) {
        modal.style.display = 'flex';
        refreshQuestsDisplay();
    }
}

// Fermer la fenêtre des quêtes
function closeQuestsWindow() {
    const modal = document.getElementById('quests-main-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Changer d'onglet
function switchQuestTab(tabName) {
    currentQuestTab = tabName;
    
    // Mettre à jour les onglets actifs
    const tabs = document.querySelectorAll('.quest-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Rafraîchir l'affichage
    refreshQuestsDisplay();
}

// Rafraîchir l'affichage des quêtes
function refreshQuestsDisplay() {
    updateQuestCounts();
    renderQuestsList();
}

// Rafraîchir l'affichage quand le joueur se déplace ou change de carte
function refreshQuestsOnPlayerMove() {
    // Vérifier si la fenêtre des quêtes est ouverte
    const questsModal = document.getElementById('quests-main-modal');
    if (questsModal && questsModal.style.display === 'flex') {
        refreshQuestsDisplay();
    }
}

// Mettre à jour les compteurs d'onglets
function updateQuestCounts() {
    const questsArray = Object.values(getCurrentQuests());
    
    const counts = {
        all: questsArray.filter(q => q.accepted).length,
        available: questsArray.filter(q => isQuestAvailable(q.id)).length,
        active: questsArray.filter(q => q.accepted && !q.completed).length,
        completed: questsArray.filter(q => q.completed).length
    };
    
    // Mettre à jour les compteurs
    Object.keys(counts).forEach(key => {
        const countElement = document.getElementById(`count-${key}`);
        if (countElement) {
            countElement.textContent = counts[key];
        }
    });
}

// Rendre la liste des quêtes
function renderQuestsList() {
    const questsList = document.getElementById('quests-list');
    if (!questsList) return;
    
    questsList.innerHTML = '';
    
    const questsArray = Object.values(getCurrentQuests());
    let filteredQuests = questsArray;
    
    // Filtrer selon l'onglet actif
    switch (currentQuestTab) {
        case 'available':
            filteredQuests = questsArray.filter(q => isQuestAvailable(q.id));
            break;
        case 'active':
            filteredQuests = questsArray.filter(q => q.accepted && !q.completed);
            break;
        case 'completed':
            filteredQuests = questsArray.filter(q => q.completed);
            break;
        case 'all':
            filteredQuests = questsArray.filter(q => q.accepted);
            break;
    }
    
    if (filteredQuests.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'quests-empty';
        emptyMessage.textContent = getEmptyMessage();
        questsList.appendChild(emptyMessage);
        return;
    }
    
    filteredQuests.forEach(quest => {
        const questCard = createQuestCard(quest);
        questsList.appendChild(questCard);
    });
}

// Obtenir le message quand aucune quête
function getEmptyMessage() {
    switch (currentQuestTab) {
        case 'available':
            return 'Aucune quête disponible ici. Rapprochez-vous des PNJ sur la carte pour découvrir de nouvelles quêtes !';
        case 'active':
            return 'Aucune quête en cours. Acceptez une quête pour commencer votre aventure !';
        case 'completed':
            return 'Aucune quête terminée. Complétez vos premières quêtes pour voir votre progression !';
        case 'all':
            return 'Aucune quête acceptée. Acceptez des quêtes depuis l\'onglet "Disponibles" pour les voir ici !';
        default:
            return 'Aucune quête trouvée. Explorez le monde pour découvrir des aventures !';
    }
}

// Créer une carte de quête
function createQuestCard(quest) {
    const card = document.createElement('div');
    card.className = `quest-card ${getQuestCardClass(quest)}`;
    
    const status = getQuestStatus(quest);
    const progressPercent = quest.target > 0 ? (quest.current / quest.target) * 100 : 0;
    
    card.innerHTML = `
        <div class="quest-card-header">
            <div>
                <div class="quest-card-title">${quest.name}</div>
            </div>
            <div class="quest-card-status">
                <span class="quest-status-badge ${status.class}">${status.text}</span>
            </div>
        </div>
        
        <div class="quest-card-description">${quest.description}</div>
        
        ${quest.accepted ? `
        <div class="quest-progress">
            <div class="quest-progress-bar">
                <div class="quest-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="quest-progress-text">${quest.current} / ${quest.target}</div>
        </div>
        ` : ''}
        
        ${quest.requiredItems ? `
        <div class="quest-required-items">
            <div class="quest-required-title">Objets requis:</div>
            <div class="quest-required-list">
                ${quest.requiredItems.map(item => `
                    <div class="quest-required-item">
                        <img src="${getQuestItemImagePath(item.id)}" 
                             alt="${item.name}" 
                             style="width: 24px; height: 24px; margin-right: 8px; vertical-align: middle;"
                             onerror="this.style.display='none'">
                        <span>${item.quantity}x ${item.name}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <div class="quest-rewards">
            <div class="quest-rewards-title">Récompenses</div>
            <div class="quest-rewards-list">
                ${Object.entries(quest.reward).map(([type, amount]) => {
                    if (type === 'items') {
                        return amount.map(item => `
                            <div class="quest-reward-item">
                                <img src="assets/objets/${item.id.replace('_', 'de')}.png" alt="${item.name}" style="width: 24px; height: 24px; margin-right: 8px; vertical-align: middle;">
                                <span>${item.quantity}x ${item.name}</span>
                            </div>
                        `).join('');
                    } else {
                        return `
                            <div class="quest-reward-item">
                                ${getRewardIcon(type)} ${amount} ${getRewardLabel(type)}
                            </div>
                        `;
                    }
                }).join('')}
            </div>
        </div>
        
        <div class="quest-actions">
            ${getQuestActions(quest)}
        </div>
    `;
    
    return card;
}

// Obtenir la classe CSS de la carte selon l'état de la quête
function getQuestCardClass(quest) {
    if (quest.completed) return 'completed';
    if (quest.accepted) return 'active';
    return '';
}

// Obtenir le statut de la quête
function getQuestStatus(quest) {
    if (quest.completed) {
        return { text: 'Terminée', class: 'completed' };
    }
    if (quest.accepted && quest.readyToComplete) {
        return { text: 'À valider', class: 'ready' };
    }
    if (quest.accepted) {
        return { text: 'En cours', class: 'active' };
    }
    return { text: 'Disponible', class: 'available' };
}

// Obtenir les actions disponibles pour une quête
function getQuestActions(quest) {
    if (quest.completed) {
        return `<button class="quest-action-btn complete" disabled>Terminée</button>`;
    }
    
    if (quest.accepted) {
        if (quest.readyToComplete) {
            const validationMap = quest.validationOn ? quest.validationOn.map : 2;
            return `
                <button class="quest-action-btn abandon" onclick="abandonQuest('${quest.id}')">Abandonner</button>
                <button class="quest-action-btn validate" disabled>Va voir Papi sur la map ${validationMap}</button>
            `;
        } else {
            return `
                <button class="quest-action-btn abandon" onclick="abandonQuest('${quest.id}')">Abandonner</button>
                <button class="quest-action-btn complete" disabled>
                    En cours... (${quest.current}/${quest.target})
                </button>
            `;
        }
    }
    
    // Si on est dans l'onglet "Toutes", ne pas afficher le bouton d'acceptation
    if (currentQuestTab === 'all') {
        return `<button class="quest-action-btn accept" disabled>Non disponible</button>`;
    }
    
    return `<button class="quest-action-btn accept" onclick="acceptQuest('${quest.id}')">Accepter</button>`;
}

// Obtenir l'icône d'une récompense
function getRewardIcon(type) {
    const icons = {
        xp: '⭐',
        pecka: '💰',
        item: '🎁',
        equipment: '⚔️'
    };
    return icons[type] || '🎁';
}

// Obtenir le label d'une récompense
function getRewardLabel(type) {
    const labels = {
        xp: 'XP',
        pecka: 'Pecka',
        item: 'Objet',
        equipment: 'Équipement'
    };
    return labels[type] || 'Récompense';
}

// Exports globaux
window.showQuestOffer = showQuestOffer;
window.showCraftQuestOffer = showCraftQuestOffer;
window.showSlimeBossQuestOffer = showSlimeBossQuestOffer;
window.showSlimeBossFinalQuestOffer = showSlimeBossFinalQuestOffer;
window.initQuestsWindow = initQuestsWindow;
window.openQuestsWindow = openQuestsWindow;
window.closeQuestsWindow = closeQuestsWindow;
window.switchQuestTab = switchQuestTab;
window.refreshQuestsDisplay = refreshQuestsDisplay;
window.refreshQuestsOnPlayerMove = refreshQuestsOnPlayerMove;
window.updateQuestCounts = updateQuestCounts;
window.renderQuestsList = renderQuestsList;
window.getEmptyMessage = getEmptyMessage;
window.createQuestCard = createQuestCard;
window.getQuestCardClass = getQuestCardClass;
window.getQuestStatus = getQuestStatus;
window.getQuestActions = getQuestActions;
window.getRewardIcon = getRewardIcon;
window.getRewardLabel = getRewardLabel; 
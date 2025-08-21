// js/quests/quest-logic.js - Logique métier des quêtes

// Accepter une quête
function acceptQuest(questId) {
    const quest = getCurrentQuests()[questId];
    if (quest && !quest.accepted) {
        quest.accepted = true;
        quest.current = 0;
        
        // Afficher un message de confirmation
        showQuestNotification(`Quête "${quest.name}" acceptée !`);
        
        // Fermer le dialogue PNJ
        if (typeof window.hidePNJDialogModal === 'function') {
            window.hidePNJDialogModal();
        }
        
        // Mettre à jour l'interface de quête si elle existe
        updateQuestUI();
        
        // Sauvegarder le jeu après acceptation de quête
        if (typeof window.autoSaveOnEvent === 'function') {
            window.autoSaveOnEvent();
        }
    }
}

// Mettre à jour le progrès d'une quête
function updateQuestProgress(questId, amount = 1) {
    const quest = getCurrentQuests()[questId];
    if (quest && quest.accepted && !quest.completed) {
        quest.current += amount;
        
        if (quest.current >= quest.target) {
            // Marquer la quête comme prête à être validée
            quest.readyToComplete = true;
            const validationMap = quest.validationOn ? quest.validationOn.map : 2;
            showQuestNotification(`Quête "${quest.name}" prête ! Va voir Papi sur la map ${validationMap} pour la valider !`);
        }
        updateQuestUI();
    }
}

// Vérifier si le joueur a tous les objets requis pour la quête de craft
function checkCraftQuestProgress() {
    const quest = getCurrentQuests().crowCraft;
    if (!quest || !quest.accepted || quest.completed) return;
    
    let completedItems = 0;
    
    // Vérifier chaque objet requis
    quest.requiredItems.forEach(requiredItem => {
        const playerQuantity = getItemQuantity(requiredItem.id);
        if (playerQuantity >= requiredItem.quantity) {
            completedItems++;
        }
    });
    
    // Mettre à jour le progrès de la quête
    quest.current = completedItems;
    
    if (completedItems >= quest.target) {
        quest.readyToComplete = true;
        const validationMap = quest.validationOn ? quest.validationOn.map : 2;
        showQuestNotification(`Quête "${quest.name}" prête ! Va voir Papi sur la map ${validationMap} pour la valider !`);
    }
    
    updateQuestUI();
}

// Terminer une quête
function completeQuest(questId) {
    const quest = getCurrentQuests()[questId];
    if (quest && quest.accepted && !quest.completed) {
        quest.completed = true;
        quest.current = quest.target;
        
        // Donner les récompenses
        if (typeof player !== 'undefined') {
            player.xp += quest.reward.xp;
            player.pecka += quest.reward.pecka;
            
            // Donner les objets si il y en a
            if (quest.reward.items && quest.reward.items.length > 0) {
                quest.reward.items.forEach(item => {
                    // Ajouter l'objet à l'inventaire du joueur
                    // Vérifier d'abord si c'est une ressource (dans resourceDatabase)
                    if (typeof window.resourceDatabase !== 'undefined' && window.resourceDatabase[item.id]) {
                        // C'est une ressource, utiliser addResourceToInventory
                        if (typeof addResourceToInventory === 'function') {
                            addResourceToInventory(item.id, item.quantity);
                        } else {
                            console.warn("Fonction addResourceToInventory non disponible");
                        }
                    } else {
                        // C'est un équipement, utiliser addItemToInventory
                        if (typeof addItemToInventory === 'function') {
                            addItemToInventory(item.id, 'equipement');
                        } else {
                            console.warn("Fonction addItemToInventory non disponible");
                        }
                    }
                });
            }
            
            // Vérifier si le joueur monte de niveau
            if (typeof checkLevelUp === 'function') {
                checkLevelUp();
            }
            
            // Mettre à jour l'interface HUD pour afficher les nouvelles valeurs
            if (typeof updateHUD === 'function') {
                updateHUD();
            }
        }
        
        // Créer le message de notification avec les objets
        let notificationMessage = `🎉 Quête "${quest.name}" terminée ! +${quest.reward.xp} XP +${quest.reward.pecka} Pecka`;
        if (quest.reward.items && quest.reward.items.length > 0) {
            const itemsList = quest.reward.items.map(item => `${item.quantity}x ${item.name}`).join(', ');
            notificationMessage += ` + ${itemsList}`;
        }
        
        showQuestNotification(notificationMessage);
        updateQuestUI();
        
        // Sauvegarder le jeu après complétion de quête
        if (typeof window.autoSaveOnEvent === 'function') {
            window.autoSaveOnEvent();
        }
    }
}

// Fonction pour détecter quand un corbeau est tué
function onCrowKilled() {
    updateQuestProgress('crowHunt', 1);
}

// Fonction pour détecter quand le boss slime est tué (obsolète)
function onSlimeBossKilled() {
    // Cette fonction est maintenant obsolète car la quête est basée sur l'obtention du certificat
    // La validation se fait maintenant via checkSlimeBossQuestProgress()
}

// Fonction pour vérifier le progrès de la quête du boss slime (basée sur l'obtention du certificat)
function checkSlimeBossQuestProgress() {
    const quest = getCurrentQuests().slimeBoss;
    if (!quest || !quest.accepted || quest.completed) {
        return;
    }

    // Vérifier si le joueur a le certificat requis
    const hasCertificate = getItemQuantity('certificat_corbeau') >= 1;

    if (hasCertificate && !quest.readyToComplete) {
        quest.readyToComplete = true;
        quest.current = 1;
        
        // Notification au joueur
        showQuestNotification(`Quête "${quest.name}" prête à être validée ! Va voir Papi sur la map ${quest.validationOn.map} pour valider ta quête.`);
        
        // Mettre à jour l'interface
        updateQuestUI();
    } else if (!hasCertificate && quest.readyToComplete) {
        quest.readyToComplete = false;
        quest.current = 0;
        updateQuestUI();
    }
}

// Fonction pour vérifier le progrès de la quête finale du SlimeBoss (basée sur la mort du boss)
function checkSlimeBossFinalQuestProgress() {
    const quest = getCurrentQuests().slimeBossFinal;
    if (!quest || !quest.accepted || quest.completed) {
        return;
    }

    // Cette fonction sera appelée quand le SlimeBoss sera tué
    // Pour l'instant, on simule la progression
    if (!quest.readyToComplete) {
        quest.readyToComplete = true;
        quest.current = 1;
        
        // Notification au joueur
        showQuestNotification(`Quête "${quest.name}" prête à être validée ! Va voir Papi 4 sur la map ${quest.validationOn.map} pour valider ta quête.`);
        
        // Mettre à jour l'interface
        updateQuestUI();
    }
}

// Vérifier si une quête peut être validée par le PNJ actuel
function canValidateQuestWithPNJ(pnjId) {
    const questsArray = Object.values(getCurrentQuests());
    
    const validQuest = questsArray.find(q => {
        // Vérification de base
        if (!q.accepted || q.completed || !q.readyToComplete || !q.validationOn || q.validationOn.pnjId !== pnjId) {
            return false;
        }
        
        // Vérification spéciale pour les quêtes basées sur des objets
        if (q.requiredItems && q.requiredItems.length > 0) {
            const hasAllItems = q.requiredItems.every(item => {
                const quantity = getItemQuantity(item.id);
                return quantity >= item.quantity;
            });
            
            if (!hasAllItems) {
                return false;
            }
        }
        
        return true;
    });
    
    return validQuest;
}

// Valider une quête en parlant au PNJ
function validateQuestWithPNJ(pnjId) {
    const quest = canValidateQuestWithPNJ(pnjId);
    if (quest) {
        completeQuest(quest.id);
        return true;
    }
    return false;
}

// Abandonner une quête
function abandonQuest(questId) {
    const quest = getCurrentQuests()[questId];
    if (quest && quest.accepted && !quest.completed) {
        if (confirm(`Êtes-vous sûr de vouloir abandonner la quête "${quest.name}" ?`)) {
            quest.accepted = false;
            quest.current = 0;
            showQuestNotification(`Quête "${quest.name}" abandonnée`);
            refreshQuestsDisplay();
        }
    }
}

// Afficher une notification de quête
function showQuestNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = 'quest-notification';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Mettre à jour l'interface des quêtes
function updateQuestUI() {
    // Mettre à jour la fenêtre si elle est ouverte
    const modal = document.getElementById('quests-main-modal');
    if (modal && modal.style.display === 'flex') {
        refreshQuestsDisplay();
    }
}

// Fonction de test pour vérifier manuellement le progrès de la quête
function testCraftQuestProgress() {
    checkCraftQuestProgress();
}

// Exports globaux
window.acceptQuest = acceptQuest;
window.updateQuestProgress = updateQuestProgress;
window.checkCraftQuestProgress = checkCraftQuestProgress;
window.completeQuest = completeQuest;
window.onCrowKilled = onCrowKilled;
window.onSlimeBossKilled = onSlimeBossKilled;
window.checkSlimeBossQuestProgress = checkSlimeBossQuestProgress;
window.checkSlimeBossFinalQuestProgress = checkSlimeBossFinalQuestProgress;
window.canValidateQuestWithPNJ = canValidateQuestWithPNJ;
window.validateQuestWithPNJ = validateQuestWithPNJ;
window.abandonQuest = abandonQuest;
window.showQuestNotification = showQuestNotification;
window.updateQuestUI = updateQuestUI;
window.testCraftQuestProgress = testCraftQuestProgress; 
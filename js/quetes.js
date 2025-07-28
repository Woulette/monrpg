// js/quetes.js - Système de quêtes

// Système de quêtes
const quests = {
    crowHunt: {
        id: 'crowHunt',
        name: 'Chasse aux Corbeaux',
        description: 'Chasse 5 corbeaux pour prouver ta valeur, puis va voir Papi sur la map 2 pour valider ta quête',
        target: 5,
        current: 0,
        completed: false,
        accepted: false,
        readyToComplete: false, // Nouveau statut : prêt à être validé
        // Informations sur la disponibilité de la quête
        availableOn: {
            map: 1, // Carte où le PNJ propose la quête
            pnjId: 'papi', // ID du PNJ qui propose la quête
            pnjPosition: { x: 30, y: 1 } // Position du PNJ sur la carte
        },
        // Informations pour la validation
        validationOn: {
            map: 2, // Carte où valider la quête
            pnjId: 'papi2', // ID du PNJ qui valide la quête
            pnjPosition: { x: 15, y: 10 } // Position du PNJ sur la map 2
        },
        reward: {
            xp: 50,
            pecka: 100,
            items: [
                { id: 'patte_corbeau', name: 'Patte de Corbeau', quantity: 10 },
                { id: 'plume_corbeau', name: 'Plume de Corbeau', quantity: 10 }
            ]
        }
    },
    
    // Nouvelle quête de craft après la validation de la quête corbeau
    crowCraft: {
        id: 'crowCraft',
        name: 'Équipement du Corbeau',
        description: 'Craft 1 coiffe, 1 cape, 1 anneau, 1 amulette, 1 botte et 1 ceinture corbeau pour compléter ton équipement',
        target: 6, // 6 objets à crafter
        current: 0,
        completed: false,
        accepted: false,
        readyToComplete: false,
        // Cette quête est disponible après avoir validé la quête corbeau
        availableOn: {
            map: 2, // Carte où le PNJ propose la quête
            pnjId: 'papi2', // ID du PNJ qui propose la quête
            pnjPosition: { x: 22, y: 16 } // Position du PNJ sur la carte
        },
        // Informations pour la validation
        validationOn: {
            map: 3, // Carte où valider la quête
            pnjId: 'papi3', // ID du PNJ qui valide la quête
            pnjPosition: { x: 23, y: 24 } // Position du PNJ sur la map 3
        },
        // Objets requis pour la quête
        requiredItems: [
            { id: 'coiffe_corbeau', name: 'Coiffe de Corbeau', quantity: 1 },
            { id: 'cape_corbeau', name: 'Cape de Corbeau', quantity: 1 },
            { id: 'anneau_corbeau', name: 'Anneau de Corbeau', quantity: 1 },
            { id: 'amulette_corbeau', name: 'Amulette de Corbeau', quantity: 1 },
            { id: 'bottes_corbeau', name: 'Bottes de Corbeau', quantity: 1 },
            { id: 'ceinture_corbeau', name: 'Ceinture de Corbeau', quantity: 1 }
        ],
        reward: {
            xp: 100,
            pecka: 200
        }
    },
    
    // Nouvelle quête pour obtenir le certificat du donjon slime
    slimeBoss: {
        id: 'slimeBoss',
        name: 'Maître des Lieux',
        description: 'Tu souhaites accéder au donjon slime ? Mais tu es trop faible ! Prouve-moi ta valeur en tuant le maître des lieux. Une fois fait, reviens me voir avec le certificat.',
        target: 1, // 1 certificat à obtenir
        current: 0,
        completed: false,
        accepted: false,
        readyToComplete: false,
        // Cette quête est disponible après avoir validé la quête de craft
        availableOn: {
            map: 3, // Carte où le PNJ propose la quête
            pnjId: 'papi3', // ID du PNJ qui propose la quête
            pnjPosition: { x: 23, y: 24 } // Position du PNJ sur la carte
        },
        // Informations pour la validation
        validationOn: {
            map: 3, // Carte où valider la quête
            pnjId: 'papi3', // ID du PNJ qui valide la quête
            pnjPosition: { x: 23, y: 24 } // Position du PNJ sur la map 3
        },
        // Objet requis pour la quête
        requiredItems: [
            { id: 'certificat_corbeau', name: 'Certificat de Rang Corbeau', quantity: 1 }
        ],
        reward: {
            xp: 150,
            pecka: 300
        }
    },
    
    // Quête finale pour vaincre le SlimeBoss du donjon
    slimeBossFinal: {
        id: 'slimeBossFinal',
        name: 'Le Boss du Donjon',
        description: 'Un boss terrifiant d\'un autre univers est scellé dans ce donjon. Les forces du donjon s\'affaiblissent, il faut l\'éliminer pour rétablir la sécurité des lieux.',
        target: 1, // 1 boss à tuer
        current: 0,
        completed: false,
        accepted: false,
        readyToComplete: false,
        // Cette quête est disponible après avoir validé la quête slimeBoss
        availableOn: {
            map: 3, // Carte où le PNJ propose la quête
            pnjId: 'papi3', // ID du PNJ qui propose la quête
            pnjPosition: { x: 23, y: 24 } // Position du PNJ sur la carte
        },
        // Informations pour la validation
        validationOn: {
            map: 4, // Carte où valider la quête (donjon slime)
            pnjId: 'papi4', // ID du PNJ qui valide la quête
            pnjPosition: { x: 15, y: 15 } // Position du PNJ sur la map 4 (à définir)
        },
        reward: {
            xp: 300,
            pecka: 500,
            items: [
                { id: 'nouveau_sort', name: 'Nouveau Sort', quantity: 1 },
                { id: 'orbe_speciale', name: 'Orbe Spéciale', quantity: 1 }
            ]
        }
    }
};

// Vérifier si une quête est disponible selon la position du joueur
function isQuestAvailable(questId) {
    const quest = quests[questId];
    if (!quest || quest.accepted || quest.completed) return false;
    
    // Vérifier si le joueur est sur la bonne carte
    if (typeof window.currentMap !== 'undefined' && window.currentMap !== `map${quest.availableOn.map}`) {
        return false;
    }
    
    // Vérifications spéciales pour certaines quêtes
    if (questId === 'crowCraft') {
        // La quête de craft n'est disponible que si la quête corbeau est terminée
        if (!quests.crowHunt.completed) {
            return false;
        }
    }
    
    if (questId === 'slimeBoss') {
        // La quête du boss slime n'est disponible que si la quête de craft est terminée
        if (!quests.crowCraft.completed) {
            return false;
        }
    }
    
    if (questId === 'slimeBossFinal') {
        // La quête finale du slime boss n'est disponible que si la quête slimeBoss est terminée
        if (!quests.slimeBoss.completed) {
            return false;
        }
    }
    
    // Si on est sur la bonne carte, la quête est disponible partout
    return true;
}

// Afficher l'offre de quête du boss slime
function showSlimeBossQuestOffer() {
    const quest = quests.slimeBoss;
    
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

// Afficher l'offre de quête de craft
function showCraftQuestOffer() {
    const quest = quests.crowCraft;
    
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

// Afficher l'offre de quête finale du SlimeBoss
function showSlimeBossFinalQuestOffer() {
    const quest = quests.slimeBossFinal;
    
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

// Fonction pour déterminer le type d'équipement
function getEquipmentType(itemId) {
    if (itemId.includes('coiffe')) return 'coiffes';
    if (itemId.includes('cape')) return 'capes';
    if (itemId.includes('anneau')) return 'anneaux';
    if (itemId.includes('amulette')) return 'colliers'; // amulette uses colliers folder
    if (itemId.includes('collier')) return 'colliers';
    if (itemId.includes('botte')) return 'bottes';
    if (itemId.includes('ceinture')) return 'ceintures';
    return 'objets';
}

// Fonction pour obtenir le chemin d'image d'un objet requis dans une quête
function getQuestItemImagePath(itemId) {
    let imagePath = '';
    
    // Vérifier d'abord si c'est un équipement
    if (itemId.includes('coiffe') || itemId.includes('cape') || itemId.includes('anneau') || 
        itemId.includes('amulette') || itemId.includes('collier') || itemId.includes('botte') || itemId.includes('ceinture')) {
        
        // Cas spécial pour amulette_corbeau qui utilise l'image colliercorbeau.png
        if (itemId === 'amulette_corbeau') {
            imagePath = `assets/equipements/colliers/colliercorbeau.png`;
        } else {
            // Convertir les IDs avec underscore vers le format de nom de fichier (sans underscore)
            const fileName = itemId.replace('_', '');
            imagePath = `assets/equipements/${getEquipmentType(itemId)}/${fileName}.png`;
        }
    } else if (itemId === 'certificat_corbeau') {
        // Cas spéciaux pour les ressources
        imagePath = `assets/objets/certificadonjoncorbeau.png`;
    } else if (itemId === 'nouveau_sort') {
        // Cas spéciaux pour les nouveaux objets
        imagePath = `assets/objets/nouveau_sort.png`;
    } else if (itemId === 'orbe_speciale') {
        // Cas spéciaux pour les nouveaux objets
        imagePath = `assets/objets/orbe_speciale.png`;
    } else {
        // Sinon, c'est une ressource ou un objet spécial
        imagePath = `assets/objets/${itemId}.png`;
    }
    
    console.log(`🔍 getQuestItemImagePath(${itemId}) -> ${imagePath}`);
    return imagePath;
}

// Afficher l'offre de quête
function showQuestOffer() {
    const quest = quests.crowHunt;
    
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
        
        // Créer le texte de récompense avec les objets
        let rewardText = `Récompense: ${quest.reward.xp} XP + ${quest.reward.pecka} Pecka`;
        if (quest.reward.items && quest.reward.items.length > 0) {
            const itemsList = quest.reward.items.map(item => `${item.quantity}x ${item.name}`).join(', ');
            rewardText += ` + ${itemsList}`;
        }
        
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
        acceptButton.className = 'quest-accept-button';
        acceptButton.onclick = function() {
            acceptQuest(quest.id);
            questModal.remove();
        };
        
        const declineButton = document.createElement('button');
        declineButton.textContent = 'Refuser';
        declineButton.className = 'quest-decline-button';
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

// Accepter une quête
function acceptQuest(questId) {
    const quest = quests[questId];
    if (quest && !quest.accepted) {
        quest.accepted = true;
        quest.current = 0;
        console.log(`🎯 Quête "${quest.name}" acceptée !`);
        
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

// Fonction pour obtenir la quantité d'un item dans l'inventaire
function getItemQuantity(itemId) {
    let totalQuantity = 0;
    
    // Vérifier dans l'inventaire d'équipement
    if (window.inventoryEquipement) {
        window.inventoryEquipement.forEach(slot => {
            if (slot.item && slot.item.id === itemId) {
                totalQuantity += slot.item.quantity || 1;
            }
        });
    }
    
    // Vérifier dans l'inventaire principal
    if (window.inventoryAll) {
        window.inventoryAll.forEach(slot => {
            if (slot.item && slot.item.id === itemId) {
                totalQuantity += slot.item.quantity || 1;
            }
        });
    }
    
    // Vérifier dans l'équipement équipé
    if (window.equippedItems) {
        Object.values(window.equippedItems).forEach(item => {
            if (item && item.id === itemId) {
                totalQuantity += item.quantity || 1;
            }
        });
    }
    
    console.log(`🔍 Quantité de ${itemId}: ${totalQuantity}`);
    return totalQuantity;
}

// Vérifier si le joueur a tous les objets requis pour la quête de craft
function checkCraftQuestProgress() {
    const quest = quests.crowCraft;
    if (!quest || !quest.accepted || quest.completed) return;
    
    let completedItems = 0;
    
    // Vérifier chaque objet requis
    quest.requiredItems.forEach(requiredItem => {
        const playerQuantity = getItemQuantity(requiredItem.id);
        console.log(`🔍 Vérification ${requiredItem.name}: ${playerQuantity}/${requiredItem.quantity}`);
        if (playerQuantity >= requiredItem.quantity) {
            completedItems++;
            console.log(`✅ ${requiredItem.name} OK`);
        } else {
            console.log(`❌ ${requiredItem.name} MANQUANT`);
        }
    });
    
    // Mettre à jour le progrès de la quête
    quest.current = completedItems;
    
    if (completedItems >= quest.target) {
        quest.readyToComplete = true;
        const validationMap = quest.validationOn ? quest.validationOn.map : 2;
        console.log(`🎯 Quête "${quest.name}" prête à être validée ! Va voir Papi sur la map ${validationMap} !`);
        showQuestNotification(`Quête "${quest.name}" prête ! Va voir Papi sur la map ${validationMap} pour la valider !`);
    } else {
        console.log(`🎯 Progrès quête "${quest.name}": ${completedItems}/${quest.target}`);
    }
    
    updateQuestUI();
}

// Mettre à jour le progrès d'une quête
function updateQuestProgress(questId, amount = 1) {
    const quest = quests[questId];
    if (quest && quest.accepted && !quest.completed) {
        quest.current += amount;
        
        if (quest.current >= quest.target) {
            // Marquer la quête comme prête à être validée
            quest.readyToComplete = true;
            const validationMap = quest.validationOn ? quest.validationOn.map : 2;
            console.log(`🎯 Quête "${quest.name}" prête à être validée ! Va voir Papi sur la map ${validationMap} !`);
            showQuestNotification(`Quête "${quest.name}" prête ! Va voir Papi sur la map ${validationMap} pour la valider !`);
        } else {
            console.log(`🎯 Progrès quête "${quest.name}": ${quest.current}/${quest.target}`);
        }
        updateQuestUI();
    }
}

// Terminer une quête
function completeQuest(questId) {
    const quest = quests[questId];
    if (quest && quest.accepted && !quest.completed) {
        quest.completed = true;
        quest.current = quest.target;
        
        console.log(`🎉 Quête "${quest.name}" terminée !`);
        
        // Donner les récompenses
        if (typeof player !== 'undefined') {
            console.log(`💰 Avant récompense - XP: ${player.xp}, Pecka: ${player.pecka}`);
            player.xp += quest.reward.xp;
            player.pecka += quest.reward.pecka;
            console.log(`💰 Après récompense - XP: ${player.xp}, Pecka: ${player.pecka}`);
            console.log(`💰 Récompense donnée: +${quest.reward.xp} XP, +${quest.reward.pecka} Pecka`);
            
            // Donner les objets si il y en a
            if (quest.reward.items && quest.reward.items.length > 0) {
                quest.reward.items.forEach(item => {
                    // Ajouter l'objet à l'inventaire du joueur
                    // Vérifier d'abord si c'est une ressource (dans resourceDatabase)
                    if (typeof window.resourceDatabase !== 'undefined' && window.resourceDatabase[item.id]) {
                        // C'est une ressource, utiliser addResourceToInventory
                        if (typeof addResourceToInventory === 'function') {
                            addResourceToInventory(item.id, item.quantity);
                            console.log(`🎁 Ressource reçue: ${item.quantity}x ${item.name}`);
                        } else {
                            console.warn("Fonction addResourceToInventory non disponible");
                        }
                    } else {
                        // C'est un équipement, utiliser addItemToInventory
                        if (typeof addItemToInventory === 'function') {
                            addItemToInventory(item.id, 'equipement');
                            console.log(`🎁 Équipement reçu: ${item.name}`);
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
        
        // La proposition de la nouvelle quête sera gérée par Papi2 à la fin de son dialogue
    }
}

// Mettre à jour l'interface des quêtes
function updateQuestUI() {
    // Cette fonction sera appelée pour mettre à jour l'affichage des quêtes
    // On peut l'implémenter plus tard avec un HUD de quêtes
    console.log("Interface quêtes mise à jour");
}

// Fonction pour détecter quand un corbeau est tué
function onCrowKilled() {
    updateQuestProgress('crowHunt', 1);
}

// Fonction pour détecter quand le boss slime est tué (obsolète)
function onSlimeBossKilled() {
    // Cette fonction est maintenant obsolète car la quête est basée sur l'obtention du certificat
    // La validation se fait maintenant via checkSlimeBossQuestProgress()
    console.log("onSlimeBossKilled appelée - maintenant obsolète, utilisez checkSlimeBossQuestProgress");
}

// Fonction pour vérifier le progrès de la quête du boss slime (basée sur l'obtention du certificat)
function checkSlimeBossQuestProgress() {
    const quest = quests.slimeBoss;
    if (!quest || !quest.accepted || quest.completed) {
        return;
    }

    console.log("🔍 Vérification du progrès de la quête slimeBoss...");

    // Vérifier si le joueur a le certificat requis
    const hasCertificate = getItemQuantity('certificat_corbeau') >= 1;
    
    console.log(`📜 Certificat obtenu: ${hasCertificate}`);

    if (hasCertificate && !quest.readyToComplete) {
        quest.readyToComplete = true;
        quest.current = 1;
        console.log("✅ Quête slimeBoss prête à être validée !");
        
        // Notification au joueur
        showQuestNotification(`Quête "${quest.name}" prête à être validée ! Va voir Papi sur la map ${quest.validationOn.map} pour valider ta quête.`);
        
        // Mettre à jour l'interface
        updateQuestUI();
    } else if (!hasCertificate && quest.readyToComplete) {
        quest.readyToComplete = false;
        quest.current = 0;
        console.log("❌ Quête slimeBoss plus prête (certificat perdu)");
        updateQuestUI();
    }
}

// Fonction pour vérifier le progrès de la quête finale du SlimeBoss (basée sur la mort du boss)
function checkSlimeBossFinalQuestProgress() {
    const quest = quests.slimeBossFinal;
    if (!quest || !quest.accepted || quest.completed) {
        return;
    }

    console.log("🔍 Vérification du progrès de la quête slimeBossFinal...");

    // Cette fonction sera appelée quand le SlimeBoss sera tué
    // Pour l'instant, on simule la progression
    if (!quest.readyToComplete) {
        quest.readyToComplete = true;
        quest.current = 1;
        console.log("✅ Quête slimeBossFinal prête à être validée !");
        
        // Notification au joueur
        showQuestNotification(`Quête "${quest.name}" prête à être validée ! Va voir Papi 4 sur la map ${quest.validationOn.map} pour valider ta quête.`);
        
        // Mettre à jour l'interface
        updateQuestUI();
    }
}

// Vérifier si une quête peut être validée par le PNJ actuel
function canValidateQuestWithPNJ(pnjId) {
    console.log("canValidateQuestWithPNJ appelé avec pnjId:", pnjId);
    const questsArray = Object.values(quests);
    console.log("Toutes les quêtes:", questsArray);
    
    const validQuest = questsArray.find(q => {
        console.log("Vérification quête:", q.id);
        console.log("- accepted:", q.accepted);
        console.log("- completed:", q.completed);
        console.log("- readyToComplete:", q.readyToComplete);
        console.log("- validationOn:", q.validationOn);
        console.log("- validationOn.pnjId:", q.validationOn?.pnjId);
        console.log("- pnjId recherché:", pnjId);
        
        // Vérification de base
        if (!q.accepted || q.completed || !q.readyToComplete || !q.validationOn || q.validationOn.pnjId !== pnjId) {
            return false;
        }
        
        // Vérification spéciale pour les quêtes basées sur des objets
        if (q.requiredItems && q.requiredItems.length > 0) {
            console.log("Vérification des objets requis pour la quête:", q.id);
            const hasAllItems = q.requiredItems.every(item => {
                const quantity = getItemQuantity(item.id);
                const hasItem = quantity >= item.quantity;
                console.log(`- ${item.name}: ${quantity}/${item.quantity} = ${hasItem}`);
                return hasItem;
            });
            
            if (!hasAllItems) {
                console.log("❌ Quête non validée: objets requis manquants");
                return false;
            }
        }
        
        console.log("✅ Quête validée pour ce PNJ");
        return true;
    });
    
    console.log("Quête trouvée:", validQuest);
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
    const questsArray = Object.values(quests);
    
    const counts = {
        all: questsArray.filter(q => q.accepted).length, // Seulement les quêtes acceptées
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
    
    const questsArray = Object.values(quests);
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
            // Dans "Toutes", on affiche seulement les quêtes acceptées (en cours + terminées)
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
                         // Afficher les objets avec leurs images
                         return amount.map(item => `
                             <div class="quest-reward-item">
                                 <img src="assets/objets/${item.id.replace('_', 'de')}.png" alt="${item.name}" style="width: 24px; height: 24px; margin-right: 8px; vertical-align: middle;">
                                 <span>${item.quantity}x ${item.name}</span>
                             </div>
                         `).join('');
                     } else {
                         // Afficher XP et Pecka
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

// Abandonner une quête
function abandonQuest(questId) {
    const quest = quests[questId];
    if (quest && quest.accepted && !quest.completed) {
        if (confirm(`Êtes-vous sûr de vouloir abandonner la quête "${quest.name}" ?`)) {
            quest.accepted = false;
            quest.current = 0;
            console.log(`❌ Quête "${quest.name}" abandonnée`);
            showQuestNotification(`Quête "${quest.name}" abandonnée`);
            refreshQuestsDisplay();
        }
    }
}

// Mettre à jour l'interface des quêtes (version améliorée)
function updateQuestUI() {
    // Mettre à jour la fenêtre si elle est ouverte
    const modal = document.getElementById('quests-main-modal');
    if (modal && modal.style.display === 'flex') {
        refreshQuestsDisplay();
    }
}

// Fonction de test pour vérifier manuellement le progrès de la quête
function testCraftQuestProgress() {
    console.log("🧪 Test manuel du progrès de la quête de craft...");
    checkCraftQuestProgress();
}

// Export global
window.quests = quests;
window.showQuestOffer = showQuestOffer;
window.showCraftQuestOffer = showCraftQuestOffer;
window.showSlimeBossQuestOffer = showSlimeBossQuestOffer;
window.showSlimeBossFinalQuestOffer = showSlimeBossFinalQuestOffer;
window.updateQuestProgress = updateQuestProgress;
window.checkCraftQuestProgress = checkCraftQuestProgress;
window.onCrowKilled = onCrowKilled;
window.onSlimeBossKilled = onSlimeBossKilled;
window.checkSlimeBossQuestProgress = checkSlimeBossQuestProgress;
window.checkSlimeBossFinalQuestProgress = checkSlimeBossFinalQuestProgress;
window.acceptQuest = acceptQuest;
window.completeQuest = completeQuest;
window.abandonQuest = abandonQuest;
window.openQuestsWindow = openQuestsWindow;
window.closeQuestsWindow = closeQuestsWindow;
window.initQuestsWindow = initQuestsWindow;
window.refreshQuestsOnPlayerMove = refreshQuestsOnPlayerMove;
window.isQuestAvailable = isQuestAvailable;
window.canValidateQuestWithPNJ = canValidateQuestWithPNJ;
window.validateQuestWithPNJ = validateQuestWithPNJ;
window.getItemQuantity = getItemQuantity;
window.testCraftQuestProgress = testCraftQuestProgress;

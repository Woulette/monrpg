// Système de loot - Mon RPG 2D

// Préchargement des images pour éviter les problèmes de chargement
function preloadLootImages() {
    const imagesToPreload = [
        'assets/objets/pattedecorbeau.png',
        'assets/objets/plumedecorbeau.png',
        'assets/objets/certificadonjoncorbeau.png',
        'assets/objets/nouveau_sort.png',
        'assets/objets/orbe_speciale.png',
        'assets/objets/geleeslime.png',
        'assets/objets/noyauslime.png',
        'assets/objets/mucusslime.png',
        'assets/objets/osdeneeks.png',
        'assets/objets/cranedeneeks.png'
    ];
    
    imagesToPreload.forEach(src => {
        const img = new Image();
        img.onload = () => {};
        img.onerror = () => console.error(`Erreur de chargement: ${src}`);
        img.src = src;
    });
}

// Appeler le préchargement
preloadLootImages();

// Base de données des ressources
const resourceDatabase = {
    'patte_corbeau': {
        id: 'patte_corbeau',
        name: 'Patte de Corbeau',
        type: 'ressource',
        category: 'organe',
        icon: 'assets/objets/pattedecorbeau.png',
        description: 'Une patte de corbeau, utile pour la fabrication.',
        rarity: 'common',
        stackable: true,
        maxStack: 99
    },
    'plume_corbeau': {
        id: 'plume_corbeau',
        name: 'Plume de Corbeau',
        type: 'ressource',
        category: 'organe',
        icon: 'assets/objets/plumedecorbeau.png',
        description: 'Une plume de corbeau, utile pour la fabrication.',
        rarity: 'common',
        stackable: true,
        maxStack: 99
    },
    'certificat_corbeau': {
        id: 'certificat_corbeau',
        name: 'Certificat de Rang Corbeau',
        type: 'objet spécial',
        category: 'ressource',
        icon: 'assets/objets/certificadonjoncorbeau.png',
        description: 'Un certificat prouvant votre valeur auprès des corbeaux mais vous donnant aussi accès au donjon slime.',
        rarity: 'rare',
        stackable: true,
        maxStack: 99
    },
    'nouveau_sort': {
        id: 'nouveau_sort',
        name: 'Nouveau Sort',
        type: 'sort',
        category: 'ressource',
        icon: 'assets/objets/nouveau_sort.png',
        description: 'Un sort puissant obtenu après avoir vaincu le boss terrifiant du donjon.',
        rarity: 'legendary',
        stackable: false,
        maxStack: 1
    },
    'orbe_speciale': {
        id: 'orbe_speciale',
        name: 'Orbe Spéciale',
        type: 'objet spécial',
        category: 'ressource',
        icon: 'assets/objets/orbe_speciale.png',
        description: 'Une orbe mystérieuse contenant un pouvoir immense.',
        rarity: 'legendary',
        stackable: false,
        maxStack: 1
    },
    'geleeslime': {
        id: 'geleeslime',
        name: 'Gelée de Slime',
        type: 'ressource',
        category: 'organe',
        icon: 'assets/objets/geleeslime.png',
        description: 'Une gelée visqueuse de slime, utile pour la fabrication.',
        rarity: 'common',
        stackable: true,
        maxStack: 99
    },
    'noyauslime': {
        id: 'noyauslime',
        name: 'Noyau de Slime',
        type: 'ressource',
        category: 'organe',
        icon: 'assets/objets/noyauslime.png',
        description: 'Le noyau mystérieux d\'un slime, très précieux.',
        rarity: 'common',
        stackable: true,
        maxStack: 99
    },
    'mucusslime': {
        id: 'mucusslime',
        name: 'Mucus de Slime',
        type: 'ressource',
        category: 'organe',
        icon: 'assets/objets/mucusslime.png',
        description: 'Un mucus visqueux de slime, utile pour la fabrication.',
        rarity: 'common',
        stackable: true,
        maxStack: 99
    },
    'osdeneeks': {
        id: 'osdeneeks',
        name: 'Os de Neeks',
        type: 'ressource',
        category: 'organe',
        icon: 'assets/objets/osdeneeks.png',
        description: 'Un os mystérieux d\'Aluineeks, utile pour la fabrication.',
        rarity: 'common',
        stackable: true,
        maxStack: 99
    },
    'cranedeneeks': {
        id: 'cranedeneeks',
        name: 'Crâne de Neeks',
        type: 'ressource',
        category: 'organe',
        icon: 'assets/objets/cranedeneeks.png',
        description: 'Un crâne mystérieux d\'Aluineeks, utile pour la fabrication.',
        rarity: 'common',
        stackable: true,
        maxStack: 99
    },
    'pissenlit': {
        id: 'pissenlit',
        name: 'Pissenlit',
        type: 'ressource',
        category: 'plante',
        icon: 'assets/objets/ressources_alchimiste/pissenlit.png',
        description: 'Une plante commune utilisée par les alchimistes pour leurs potions.',
        rarity: 'common',
        stackable: true,
        maxStack: 99
    },
    'particule': {
        id: 'particule',
        name: 'Particule',
        type: 'ressource',
        category: 'rare',
        icon: 'assets/objets/particulerare.png',
        description: 'Une particule rare et mystérieuse, très recherchée par les alchimistes.',
        rarity: 'rare',
        stackable: true,
        maxStack: 99
    },
    'particule_epique': {
        id: 'particule_epique',
        name: 'Particule Épique',
        type: 'ressource',
        category: 'epique',
        icon: 'assets/objets/particuleepique.png',
        description: 'Une particule épique d\'une rareté exceptionnelle, convoitée par les plus grands alchimistes.',
        rarity: 'epic',
        stackable: true,
        maxStack: 99
    },
    'potion_soin': {
        id: 'potion_soin',
        name: 'Potion de Soin Basique',
        type: 'consommable',
        category: 'potion',
        icon: 'assets/objets/potiondesoinbasique.png',
        description: 'Restaure 50 points de vie.',
        shortDescription: 'Restaure 50 points de vie',
        rarity: 'common',
        stackable: true,
        maxStack: 99,
        healAmount: 50,
        cooldown: 3000,
        useFunction: 'useHealingPotion'
    },
    'potion_soin_basique': {
        id: 'potion_soin_basique',
        name: 'Potion de Soin Basique',
        type: 'consommable',
        category: 'potion',
        icon: 'assets/objets/potiondesoinbasique.png',
        description: 'Restaure 50 points de vie.',
        shortDescription: 'Restaure 50 points de vie',
        rarity: 'common',
        stackable: true,
        maxStack: 99,
        healAmount: 50,
        cooldown: 3000,
        useFunction: 'useHealingPotion'
    }
};

// Tables de loot par monstre
const lootTables = {
    'crow': { // Type de monstre corbeau
        resources: [
            {
                id: 'patte_corbeau',
                chance: 40, // 40% de chance
                minQuantity: 1,
                maxQuantity: 1
            },
            {
                id: 'plume_corbeau',
                chance: 60, // 60% de chance
                minQuantity: 1,
                maxQuantity: 2
            }
        ],
        pecka: {
            chance: 80, // 80% de chance
            minAmount: 3,
            maxAmount: 8
        }
    },
    'corbeauelite': { // Type de monstre Corbeau d'élite
        resources: [
            {
                id: 'certificat_corbeau',
                chance: 100, // 100% de chance (drop garanti)
                minQuantity: 1,
                maxQuantity: 1
            }
        ],
        pecka: {
            chance: 100, // 100% de chance
            minAmount: 10,
            maxAmount: 20
        }
    },
    'slime': { // Type de monstre slime
        resources: [
            {
                id: 'geleeslime',
                chance: 30, // 30% de chance
                minQuantity: 1,
                maxQuantity: 1
            },
            {
                id: 'noyauslime',
                chance: 30, // 30% de chance
                minQuantity: 1,
                maxQuantity: 1
            },
            {
                id: 'mucusslime',
                chance: 30, // 30% de chance
                minQuantity: 1,
                maxQuantity: 1
            }
        ],
        pecka: {
            chance: 50, // 50% de chance
            minAmount: 10,
            maxAmount: 18
        }
    },
    'aluineeks': { // Type de monstre Aluineeks
        resources: [
            {
                id: 'osdeneeks',
                chance: 20, // 20% de chance
                minQuantity: 1,
                maxQuantity: 1
            },
            {
                id: 'cranedeneeks',
                chance: 20, // 20% de chance
                minQuantity: 1,
                maxQuantity: 1
            },
            {
                id: 'particule',
                chance: 5, // 5% de chance
                minQuantity: 1,
                maxQuantity: 1
            }
        ],
        pecka: {
            chance: 80, // 80% de chance
            minAmount: 5,
            maxAmount: 12
        }
    }
};

// Fonction pour générer le loot d'un monstre
function generateLoot(monsterType) {
    const loot = {
        resources: [],
        pecka: 0
    };
    
    const lootTable = lootTables[monsterType];
    if (!lootTable) {
        return loot;
    }
    
    // Vérifier que le certificat est bien dans la base de données
    if (monsterType === 'corbeauelite') {
    }
    
    // Générer les ressources (1 par type maximum)
    const foundTypes = new Set();
    
    lootTable.resources.forEach(resource => {
        const chance = Math.random() * 100;
        
        // Log spécial pour le certificat
        if (resource.id === 'certificat_corbeau') {
        }
        
        if (chance < resource.chance && !foundTypes.has(resource.id)) {
            const quantity = Math.floor(Math.random() * (resource.maxQuantity - resource.minQuantity + 1)) + resource.minQuantity;
            loot.resources.push({
                id: resource.id,
                quantity: quantity,
                item: resourceDatabase[resource.id]
            });
            foundTypes.add(resource.id);
        }
    });
    
    // Générer les pecka
    if (Math.random() * 100 < lootTable.pecka.chance) {
        loot.pecka = Math.floor(Math.random() * (lootTable.pecka.maxAmount - lootTable.pecka.minAmount + 1)) + lootTable.pecka.minAmount;
    }
    
    return loot;
}

// Variable globale pour stocker le loot accumulé
let accumulatedLoot = {
    resources: [],
    pecka: 0
};

// Variables pour sauvegarder la position et taille de la fenêtre
let savedWindowPosition = {
    left: null,
    top: null,
    width: null,
    height: null
};

// Fonction pour sauvegarder la position et taille
function saveWindowState(modal, content) {
    savedWindowPosition.left = modal.style.left || 'auto';
    savedWindowPosition.top = modal.style.top || 'auto';
    savedWindowPosition.width = content.style.width || 'auto';
    savedWindowPosition.height = content.style.height || 'auto';
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('lootWindowPosition', JSON.stringify(savedWindowPosition));
}

// Fonction pour restaurer la position et taille
function restoreWindowState(modal, content) {
    const saved = localStorage.getItem('lootWindowPosition');
    if (saved) {
        const position = JSON.parse(saved);
        
        if (position.left !== 'auto') {
            modal.style.left = position.left;
            modal.style.top = position.top;
            modal.style.right = 'auto';
        }
        
        if (position.width !== 'auto') {
            content.style.width = position.width;
            content.style.height = position.height;
        }
    }
}

// Fonction pour afficher la fenêtre de loot
function showLootWindow(loot) {
    // Ajouter le nouveau loot à l'accumulé
    loot.resources.forEach(newResource => {
        const existingResource = accumulatedLoot.resources.find(r => r.id === newResource.id);
        if (existingResource) {
            existingResource.quantity += newResource.quantity;
        } else {
            accumulatedLoot.resources.push({...newResource});
        }
    });
    
    accumulatedLoot.pecka += loot.pecka;
    
    // Vérifier si la fenêtre existe déjà
    const existingModal = document.getElementById('loot-modal');
    if (existingModal) {
        // Si la fenêtre existe, juste mettre à jour le contenu
        updateLootContent(existingModal);
    } else {
        // Si la fenêtre n'existe pas, la créer
        updateLootWindow();
    }
}

// Fonction pour mettre à jour juste le contenu de la fenêtre existante
function updateLootContent(existingModal) {
    // Mettre à jour seulement la section des items, pas toute la fenêtre
    const lootItems = existingModal.querySelector('.loot-items');
    if (lootItems) {
        let itemsContent = '';
        
        // Ajouter les ressources accumulées
        accumulatedLoot.resources.forEach(resource => {
            const resourceData = resourceDatabase[resource.id];
            if (resourceData) {
                itemsContent += `
                    <div class="loot-item">
                        <img src="${resourceData.icon}" alt="${resourceData.name}" class="loot-icon">
                        <div class="loot-quantity">x${resource.quantity}</div>
                    </div>
                `;
            }
        });
        
        // Ajouter les pecka accumulés
        if (accumulatedLoot.pecka > 0) {
            itemsContent += `
                <div class="loot-item">
                    <div class="loot-icon pecka-icon">P</div>
                    <div class="loot-quantity">x${accumulatedLoot.pecka}</div>
                </div>
            `;
        }
        
        lootItems.innerHTML = itemsContent;
    }
}

// Fonction pour mettre à jour la fenêtre de loot
function updateLootWindow() {
    let existingModal = document.getElementById('loot-modal');
    
    if (!existingModal) {
        // Créer la fenêtre de loot
        existingModal = document.createElement('div');
        existingModal.id = 'loot-modal';
        existingModal.className = 'loot-modal';
        document.body.appendChild(existingModal);
    }
    
    let lootContent = `
        <div class="loot-content">
            <div class="loot-header">
                <h2>Loot Accumulé</h2>
                <span class="close-loot">&times;</span>
            </div>
            <div class="loot-items">
    `;
    
    // Ajouter les ressources accumulées
    accumulatedLoot.resources.forEach(resource => {
        const resourceData = resourceDatabase[resource.id];
        if (resourceData) {
            lootContent += `
                <div class="loot-item">
                    <img src="${resourceData.icon}" alt="${resourceData.name}" class="loot-icon">
                    <div class="loot-quantity">x${resource.quantity}</div>
                </div>
            `;
        }
    });
    
    // Ajouter les pecka accumulés
    if (accumulatedLoot.pecka > 0) {
        lootContent += `
            <div class="loot-item">
                <div class="loot-icon pecka-icon">P</div>
                <div class="loot-quantity">x${accumulatedLoot.pecka}</div>
            </div>
        `;
    }
    
    lootContent += `
            </div>
            <div class="loot-actions">
                <button class="loot-btn loot-validate">Valider</button>
            </div>
            <button class="loot-btn loot-refuse" title="Refuser le loot">🗑️</button>
            <div class="resize-handle"></div>
        </div>
    `;
    
    existingModal.innerHTML = lootContent;
    
    // Restaurer la position et taille sauvegardée (seulement si c'est une nouvelle fenêtre)
    const contentElement = existingModal.querySelector('.loot-content');
    if (!existingModal.hasAttribute('data-initialized')) {
        restoreWindowState(existingModal, contentElement);
        existingModal.setAttribute('data-initialized', 'true');
    }
    
    // Attacher les événements
    attachLootEvents(existingModal);
}

// Fonction pour attacher tous les événements de la fenêtre de loot
function attachLootEvents(existingModal) {
    const closeBtn = existingModal.querySelector('.close-loot');
    const validateBtn = existingModal.querySelector('.loot-validate');
    const refuseBtn = existingModal.querySelector('.loot-refuse');
    const contentElement = existingModal.querySelector('.loot-content');
    
    closeBtn.onclick = () => {
        saveWindowState(existingModal, contentElement);
        existingModal.remove();
    };
    
    validateBtn.onclick = () => {
        // Ajouter toutes les ressources accumulées à l'inventaire
        accumulatedLoot.resources.forEach(resource => {
            addResourceToInventory(resource.id, resource.quantity);
        });
        
        // Ajouter tous les pecka accumulés
        if (accumulatedLoot.pecka > 0) {
            player.pecka += accumulatedLoot.pecka;
            if (typeof updatePeckaDisplay === 'function') {
                updatePeckaDisplay();
            }
        }
        
        // Sauvegarder la position et taille avant de fermer
        saveWindowState(existingModal, contentElement);
        
        // Réinitialiser l'accumulation
        accumulatedLoot = { resources: [], pecka: 0 };
        existingModal.remove();
    };
    
    refuseBtn.onclick = () => {
        // Réinitialiser l'accumulation sans fermer la fenêtre
        accumulatedLoot = { resources: [], pecka: 0 };
        
        // Mettre à jour le contenu de la fenêtre
        updateLootContent(existingModal);
    };
    
    // Gestion du redimensionnement
    const resizeHandle = existingModal.querySelector('.resize-handle');
    
    if (resizeHandle && contentElement) {
        let isResizing = false;
        let startX, startY, startWidth, startHeight;
        
        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = contentElement.offsetWidth;
            startHeight = contentElement.offsetHeight;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            // Pour une poignée à gauche, on inverse le deltaX pour que ça s'agrandisse vers la gauche
            const newWidth = Math.max(150, Math.min(600, startWidth - deltaX));
            const newHeight = Math.max(80, Math.min(500, startHeight + deltaY));
            
            contentElement.style.width = newWidth + 'px';
            contentElement.style.height = newHeight + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    }
    
    // Gestion du déplacement
    const header = existingModal.querySelector('.loot-header');
    
    if (header) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        header.addEventListener('mousedown', (e) => {
            // Ne pas déclencher le drag si on clique sur le bouton de fermeture
            if (e.target.classList.contains('close-loot')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = existingModal.offsetLeft;
            startTop = existingModal.offsetTop;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newLeft = startLeft + deltaX;
            const newTop = startTop + deltaY;
            
            // Limiter la fenêtre à l'écran
            const maxLeft = window.innerWidth - existingModal.offsetWidth;
            const maxTop = window.innerHeight - existingModal.offsetHeight;
            
            existingModal.style.left = Math.max(0, Math.min(maxLeft, newLeft)) + 'px';
            existingModal.style.top = Math.max(0, Math.min(maxTop, newTop)) + 'px';
            existingModal.style.right = 'auto';
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
    
    // Pas de fermeture en cliquant à l'extérieur car la fenêtre est en haut à droite
}

// Fonction pour ajouter une ressource à l'inventaire
function addResourceToInventory(resourceId, quantity) {
    const resource = resourceDatabase[resourceId];
    if (!resource) return false;
    
    // Utiliser la fonction addItemToInventory pour chaque unité de ressource
    // Cela garantit que la sauvegarde automatique est déclenchée
    let success = true;
    for (let i = 0; i < quantity; i++) {
        if (typeof window.addItemToInventory === 'function') {
            const added = window.addItemToInventory(resourceId, 'ressources');
                    if (!added) {
            success = false;
            break;
        }
        } else {
            console.error("Fonction addItemToInventory non disponible");
            success = false;
            break;
        }
    }
    
    // Vérifier le progrès de la quête slimeBoss si le certificat a été obtenu
    if (success && resourceId === 'certificat_corbeau' && typeof window.checkSlimeBossQuestProgress === 'function') {
        window.checkSlimeBossQuestProgress();
    }
    
    return success;
}

// Fonction pour déclencher le loot quand un monstre meurt
function triggerLoot(monster) {
    // Protection contre les appels multiples pour le même monstre
    if (monster.lootTriggered) {
        console.log('⚠️ Loot déjà déclenché pour ce monstre:', monster.type);
        return;
    }
    
    // Marquer le monstre comme ayant déjà déclenché son loot
    monster.lootTriggered = true;
    
    const loot = generateLoot(monster.type);
    
    // Afficher la fenêtre de loot seulement s'il y a quelque chose
    if (loot.resources.length > 0 || loot.pecka > 0) {
        showLootWindow(loot);
    }
}

// Fonction de test pour le certificat
function testCertificatLoot() {
    const testLoot = generateLoot('corbeauelite');
    
    return testLoot;
}

// Fonction pour utiliser une potion de soin
function useHealingPotion(itemId) {
    console.log('🧪 useHealingPotion appelée avec:', itemId);
    
    // Utiliser le nouveau système de potions si disponible
    if (window.potionSystem && typeof window.potionSystem.usePotion === 'function') {
        console.log('🔄 Utilisation du nouveau système de potions');
        return window.potionSystem.usePotion(itemId);
    }
    
    // Fallback vers l'ancien système
    console.log('⚠️ Utilisation de l\'ancien système de potions');
    const item = resourceDatabase[itemId];
    if (!item || item.type !== 'consommable') {
        console.error('❌ Item non consommable:', itemId);
        return false;
    }
    
    if (!window.player) {
        console.error('❌ Joueur non trouvé');
        return false;
    }
    
    // Utiliser life/maxLife (système du jeu)
    const currentLife = window.player.life || 0;
    const maxLife = window.player.maxLife || 100;
    
    console.log(`🩺 État avant soin (ancien système): ${currentLife}/${maxLife} HP`);
    
    // Vérifier si le joueur a besoin de soins
    if (currentLife >= maxLife) {
        console.log('💚 Joueur déjà au maximum de vie');
        return false;
    }
    
    // Calculer les points de vie à restaurer
    const healAmount = item.healAmount || 50;
    const oldLife = currentLife;
    const newLife = Math.min(maxLife, currentLife + healAmount);
    const actualHeal = newLife - oldLife;
    
    // Appliquer le soin
    window.player.life = newLife;
    
    // Afficher l'effet de soin
    if (actualHeal > 0) {
        console.log(`💚 Potion utilisée: +${actualHeal} PV (${newLife}/${maxLife})`);
        
        // Mettre à jour l'affichage des PV si la fonction existe
        if (typeof window.updateHealthDisplay === 'function') {
            window.updateHealthDisplay();
        }
        if (typeof window.updateHUD === 'function') {
            window.updateHUD();
        }
        if (typeof window.updateStatsDisplay === 'function') {
            window.updateStatsDisplay();
        }
        
        return true;
    }
    
    return false;
}

// Rendre les fonctions accessibles globalement
window.generateLoot = generateLoot;
window.showLootWindow = showLootWindow;
window.addResourceToInventory = addResourceToInventory;
window.triggerLoot = triggerLoot;
window.resourceDatabase = resourceDatabase;
window.lootTables = lootTables;
window.testCertificatLoot = testCertificatLoot;
window.useHealingPotion = useHealingPotion; 
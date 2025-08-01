// js/quests/quest-definitions.js - Définitions des quêtes

// Fonction pour créer une nouvelle instance de quêtes (isolée par personnage)
function createQuestsInstance() {
    return {
        crowHunt: {
            id: 'crowHunt',
            name: 'Chasse aux Corbeaux',
            description: 'Chasse 5 corbeaux pour prouver ta valeur, puis va voir Papi sur la map 2 pour valider ta quête',
            target: 5,
            current: 0,
            completed: false,
            accepted: false,
            readyToComplete: false,
            availableOn: {
                map: 1,
                pnjId: 'papi',
                pnjPosition: { x: 30, y: 1 }
            },
            validationOn: {
                map: 2,
                pnjId: 'papi2',
                pnjPosition: { x: 15, y: 10 }
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
        
        crowCraft: {
            id: 'crowCraft',
            name: 'Équipement du Corbeau',
            description: 'Craft 1 coiffe, 1 cape, 1 anneau, 1 amulette, 1 botte et 1 ceinture corbeau pour compléter ton équipement',
            target: 6,
            current: 0,
            completed: false,
            accepted: false,
            readyToComplete: false,
            availableOn: {
                map: 2,
                pnjId: 'papi2',
                pnjPosition: { x: 22, y: 16 }
            },
            validationOn: {
                map: 3,
                pnjId: 'papi3',
                pnjPosition: { x: 23, y: 24 }
            },
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
        
        slimeBoss: {
            id: 'slimeBoss',
            name: 'Maître des Lieux',
            description: 'Tu souhaites accéder au donjon slime ? Mais tu es trop faible ! Prouve-moi ta valeur en tuant le maître des lieux. Une fois fait, reviens me voir avec le certificat.',
            target: 1,
            current: 0,
            completed: false,
            accepted: false,
            readyToComplete: false,
            availableOn: {
                map: 3,
                pnjId: 'papi3',
                pnjPosition: { x: 23, y: 24 }
            },
            validationOn: {
                map: 3,
                pnjId: 'papi3',
                pnjPosition: { x: 23, y: 24 }
            },
            requiredItems: [
                { id: 'certificat_corbeau', name: 'Certificat de Rang Corbeau', quantity: 1 }
            ],
            reward: {
                xp: 150,
                pecka: 300
            }
        },
        
        slimeBossFinal: {
            id: 'slimeBossFinal',
            name: 'Le Boss du Donjon',
            description: 'Un boss terrifiant d\'un autre univers est scellé dans ce donjon. Les forces du donjon s\'affaiblissent, il faut l\'éliminer pour rétablir la sécurité des lieux.',
            target: 1,
            current: 0,
            completed: false,
            accepted: false,
            readyToComplete: false,
            availableOn: {
                map: 3,
                pnjId: 'papi3',
                pnjPosition: { x: 23, y: 24 }
            },
            validationOn: {
                map: 4,
                pnjId: 'papi4',
                pnjPosition: { x: 15, y: 15 }
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
}

// Instance globale par défaut (pour compatibilité)
let quests = createQuestsInstance();

// Fonction pour obtenir les quêtes du personnage actuel
function getCurrentQuests() {
    if (!window.quests) {
        window.quests = createQuestsInstance();
    }
    return window.quests;
}

// Fonction pour réinitialiser les quêtes du personnage actuel
function resetCurrentQuests() {
    window.quests = createQuestsInstance();
    return window.quests;
}

// Vérifier si une quête est disponible selon la position du joueur
function isQuestAvailable(questId) {
    const quest = getCurrentQuests()[questId];
    if (!quest || quest.accepted || quest.completed) return false;
    
    // Vérifier si le joueur est sur la bonne carte
    if (typeof window.currentMap !== 'undefined' && window.currentMap !== `map${quest.availableOn.map}`) {
        return false;
    }
    
    // Vérifications spéciales pour certaines quêtes
    if (questId === 'crowCraft') {
        if (!getCurrentQuests().crowHunt.completed) {
            return false;
        }
    }
    
    if (questId === 'slimeBoss') {
        if (!getCurrentQuests().crowCraft.completed) {
            return false;
        }
    }
    
    if (questId === 'slimeBossFinal') {
        if (!getCurrentQuests().slimeBoss.completed) {
            return false;
        }
    }
    
    return true;
}

// Fonction pour déterminer le type d'équipement
function getEquipmentType(itemId) {
    if (itemId.includes('coiffe')) return 'coiffes';
    if (itemId.includes('cape')) return 'capes';
    if (itemId.includes('anneau')) return 'anneaux';
    if (itemId.includes('amulette')) return 'colliers';
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
        imagePath = `assets/objets/certificadonjoncorbeau.png`;
    } else if (itemId === 'nouveau_sort') {
        imagePath = `assets/objets/nouveau_sort.png`;
    } else if (itemId === 'orbe_speciale') {
        imagePath = `assets/objets/orbe_speciale.png`;
    } else {
        // Sinon, c'est une ressource ou un objet spécial
        imagePath = `assets/objets/${itemId}.png`;
    }
    
    return imagePath;
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
    
    return totalQuantity;
}

// Exports globaux
window.createQuestsInstance = createQuestsInstance;
window.getCurrentQuests = getCurrentQuests;
window.resetCurrentQuests = resetCurrentQuests;
window.isQuestAvailable = isQuestAvailable;
window.getEquipmentType = getEquipmentType;
window.getQuestItemImagePath = getQuestItemImagePath;
window.getItemQuantity = getItemQuantity; 
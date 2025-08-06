/**
 * Système de barre utilitaire latérale avec drag & drop
 * Permet d'utiliser potions, ressources et objets consommables
 */

class UtilityBar {
    constructor() {
        this.slots = Array.from({ length: 8 }, () => ({ item: null, quantity: 0 })); // 8 slots par défaut
        this.isDragging = false;
        this.draggedItem = null;
        this.draggedSlot = null;
        this.init();
    }

    init() {
        // Initialiser les événements une fois le DOM chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEvents());
        } else {
            this.setupEvents();
        }
    }

    setupEvents() {
        this.setupDragAndDrop();
        this.setupSlotClicks();
        this.loadFromStorage();
        this.updateDisplay();
    }

    // Configuration du drag & drop
    setupDragAndDrop() {
        const utilityBar = document.getElementById('utility-bar');
        if (!utilityBar) return;

        // Drag depuis l'inventaire vers la barre utilitaire
        this.setupInventoryDrag();
        
        // Drag entre les slots de la barre utilitaire
        this.setupBarDrag();
    }

    setupInventoryDrag() {
        console.log('🔧 Configuration des événements de drag depuis l\'inventaire...');
        
        // Rendre les slots d'inventaire draggables
        document.addEventListener('DOMContentLoaded', () => {
            this.makeInventorySlotsDrawable();
        });
        
        // Si déjà chargé, le faire tout de suite
        if (document.readyState === 'complete') {
            this.makeInventorySlotsDrawable();
        }
        
        // Écouter les drags depuis tous les inventaires
        document.addEventListener('dragstart', (e) => {
            console.log('🎯 Drag start détecté:', e.target);
            
            const inventorySlot = e.target.closest('.inventory-slot, .alchimiste-inventory-slot');
            if (!inventorySlot) {
                console.log('❌ Pas un slot d\'inventaire');
                return;
            }

            const itemData = this.getItemDataFromSlot(inventorySlot);
            console.log('📦 Données d\'objet extraites:', itemData);
            
            if (itemData && this.isUtilityItem(itemData)) {
                console.log('✅ Objet utilitaire valide, préparation du drag...');
                this.isDragging = true;
                this.draggedItem = itemData;
                this.sourceSlot = inventorySlot;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    ...itemData,
                    sourceType: 'inventory'
                }));
                
                // Créer une image de drag personnalisée
                const dragImage = this.createDragImage(itemData);
                e.dataTransfer.setDragImage(dragImage, 25, 25);
                
                console.log('🚀 Drag configuré avec succès');
            } else {
                console.log('❌ Objet non utilitaire ou invalide');
                e.preventDefault(); // Empêcher le drag d'objets non utilitaires
            }
        });

        document.addEventListener('dragend', (e) => {
            console.log('🏁 Drag terminé');
            this.isDragging = false;
            this.draggedItem = null;
            this.sourceSlot = null;
        });
    }
    
    makeInventorySlotsDrawable() {
        console.log('🔧 Rendre les slots d\'inventaire draggables...');
        
        // Sélectionner tous les slots d'inventaire
        const inventorySlots = document.querySelectorAll('.inventory-slot, .alchimiste-inventory-slot');
        console.log(`📋 ${inventorySlots.length} slots d'inventaire trouvés`);
        
        inventorySlots.forEach((slot, index) => {
            // Vérifier si le slot contient un objet
            const hasItem = slot.querySelector('img, span');
            if (hasItem) {
                slot.setAttribute('draggable', 'true');
                console.log(`✅ Slot ${index} rendu draggable`);
            } else {
                slot.removeAttribute('draggable');
            }
        });
        
        // Observer les changements dans les grilles d'inventaire
        this.observeInventoryChanges();
        
        // Refaire cette vérification régulièrement car les inventaires changent
        setTimeout(() => this.makeInventorySlotsDrawable(), 2000);
    }
    
    // Observer les changements dans les inventaires
    observeInventoryChanges() {
        // Observer les changements dans les grilles d'inventaire
        const inventoryGrids = document.querySelectorAll('.inventory-grid, .alchimiste-inventory-grid');
        
        inventoryGrids.forEach(grid => {
            if (grid && !grid.utilityBarObserver) {
                const observer = new MutationObserver(() => {
                    console.log('🔄 Changement détecté dans une grille d\'inventaire');
                    setTimeout(() => this.makeInventorySlotsDrawable(), 100);
                });
                
                observer.observe(grid, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class']
                });
                
                grid.utilityBarObserver = observer;
                console.log('👁️ Observer configuré pour grille d\'inventaire');
            }
        });
    }

    setupBarDrag() {
        const slots = document.querySelectorAll('.utility-slot');
        
        slots.forEach((slot, index) => {
            // Permettre le drop
            slot.addEventListener('dragover', (e) => {
                console.log(`🎯 Dragover sur slot ${index}`);
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                slot.classList.add('drag-over');
            });

            slot.addEventListener('dragleave', (e) => {
                console.log(`👋 Dragleave du slot ${index}`);
                slot.classList.remove('drag-over');
            });

            slot.addEventListener('drop', (e) => {
                console.log(`📥 Drop sur slot ${index}`);
                e.preventDefault();
                slot.classList.remove('drag-over');
                
                // Marquer qu'un drop valide a eu lieu
                this.dragDropped = true;
                
                try {
                    const itemData = JSON.parse(e.dataTransfer.getData('text/plain'));
                    console.log('📦 Données reçues pour le drop:', itemData);
                    
                    // Si c'est un drag depuis la barre vers un autre slot
                    if (itemData.fromUtilityBar && itemData.slotIndex !== index) {
                        console.log(`🔄 Déplacement interne: slot ${itemData.slotIndex} → slot ${index}`);
                        // Vider le slot source
                        this.slots[itemData.slotIndex] = { item: null, quantity: 0 };
                    }
                    
                    const success = this.addItemToSlot(index, itemData);
                    console.log(success ? '✅ Drop réussi' : '❌ Drop échoué');
                } catch (error) {
                    console.error('❌ Erreur lors du drop:', error);
                }
            });

            // Drag depuis la barre utilitaire
            slot.addEventListener('dragstart', (e) => {
                if (this.slots[index].item) {
                    console.log(`🎯 Début drag depuis slot ${index}`);
                    this.draggedSlot = index;
                    this.draggedFromUtilityBar = true;
                    this.dragDropped = false; // Flag pour savoir si le drop a été traité
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', JSON.stringify({
                        ...this.slots[index].item,
                        fromUtilityBar: true,
                        slotIndex: index
                    }));
                }
            });

            // Drag end depuis la barre utilitaire
            slot.addEventListener('dragend', (e) => {
                if (this.draggedFromUtilityBar && !this.dragDropped) {
                    console.log(`🗑️ Drop dans le vide détecté pour slot ${this.draggedSlot}`);
                    // Le drag s'est terminé sans drop valide, retirer l'objet
                    this.removeItemFromSlotToVoid(this.draggedSlot);
                }
                
                // Reset des flags
                this.draggedFromUtilityBar = false;
                this.draggedSlot = null;
                this.dragDropped = false;
            });
        });
    }

    setupSlotClicks() {
        const slots = document.querySelectorAll('.utility-slot');
        
        slots.forEach((slot, index) => {
            // Clic droit pour retirer l'objet
            slot.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.removeItemFromSlot(index);
            });

            // Clic gauche pour utiliser l'objet
            slot.addEventListener('click', (e) => {
                if (e.button === 0) { // Clic gauche uniquement
                    this.useItem(index);
                }
            });
        });
    }

    // Vérifier si un objet peut aller dans la barre utilitaire
    isUtilityItem(item) {
        if (!item) return false;
        
        const utilityTypes = ['potion', 'ressource', 'objet_special', 'consommable'];
        return utilityTypes.includes(item.type) || item.category === 'potions' || item.category === 'ressources';
    }

    // Extraire les données d'objet depuis un slot d'inventaire
    getItemDataFromSlot(slot) {
        const img = slot.querySelector('img');
        const span = slot.querySelector('span');
        const quantityDiv = slot.querySelector('.item-quantity, .alchimiste-item-quantity');
        
        if (img && img.alt) {
            return {
                name: img.alt,
                icon: img.src,
                type: this.guessItemType(img.alt),
                quantity: quantityDiv ? parseInt(quantityDiv.textContent) || 1 : 1,
                stackable: true
            };
        } else if (span && span.textContent) {
            return {
                name: span.title || span.textContent,
                icon: span.textContent,
                type: 'objet_special',
                quantity: quantityDiv ? parseInt(quantityDiv.textContent) || 1 : 1,
                stackable: true
            };
        }
        
        return null;
    }

    // Deviner le type d'objet basé sur le nom
    guessItemType(name) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('potion')) return 'potion';
        if (lowerName.includes('pissenlit') || lowerName.includes('ressource')) return 'ressource';
        return 'objet_special';
    }

    // Créer une image de drag personnalisée
    createDragImage(item) {
        const dragElement = document.createElement('div');
        dragElement.style.cssText = `
            width: 50px; height: 50px; 
            background: rgba(74, 144, 226, 0.8); 
            border: 2px solid #4a90e2; 
            border-radius: 8px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            position: absolute; 
            top: -1000px; 
            left: -1000px;
            z-index: 10000;
        `;
        
        if (item.icon && item.icon.startsWith('assets/')) {
            const img = document.createElement('img');
            img.src = item.icon;
            img.style.cssText = 'width: 32px; height: 32px; pointer-events: none;';
            dragElement.appendChild(img);
        } else {
            dragElement.textContent = item.icon || '?';
            dragElement.style.fontSize = '24px';
        }
        
        document.body.appendChild(dragElement);
        setTimeout(() => document.body.removeChild(dragElement), 100);
        return dragElement;
    }

    // Ajouter un objet à un slot
    addItemToSlot(slotIndex, itemData) {
        console.log(`📥 addItemToSlot appelé - slot ${slotIndex}:`, itemData);
        
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            console.log('❌ Index de slot invalide');
            return false;
        }

        const slot = this.slots[slotIndex];
        const quantityToAdd = itemData.quantity || 1;
        
        console.log(`📦 Slot actuel:`, slot);
        console.log(`🔢 Quantité à ajouter: ${quantityToAdd}`);
        
        // ANTI-DUPLICATION : Vérifier si l'objet est déjà dans la barre
        if (itemData.sourceType === 'inventory') {
            console.log('🔍 Vérification anti-duplication...');
            
            // Chercher si cet objet existe déjà dans la barre utilitaire
            const existingSlotIndex = this.findItemInBar(itemData.name);
            if (existingSlotIndex !== -1 && existingSlotIndex !== slotIndex) {
                console.log(`❌ DUPLICATION DÉTECTÉE ! Objet "${itemData.name}" déjà présent au slot ${existingSlotIndex}`);
                if (window.showFloatingMessage) {
                    window.showFloatingMessage(`${itemData.name} déjà dans la barre !`, 'warning');
                }
                return false;
            }
            
            console.log('✅ Pas de duplication, copie autorisée');
        }
        
        // Si le slot est vide, ajouter l'objet
        if (!slot.item) {
            this.slots[slotIndex] = {
                item: { ...itemData },
                quantity: quantityToAdd
            };
            console.log('✅ Objet ajouté dans slot vide');
        }
        // Si c'est le même objet et qu'il est stackable, augmenter la quantité
        else if (slot.item.name === itemData.name && itemData.stackable) {
            // ANTI-DUPLICATION : Si c'est depuis l'inventaire et le même objet, ne pas stacker
            if (itemData.sourceType === 'inventory') {
                console.log('⚠️ Tentative de stack du même objet depuis l\'inventaire bloquée');
                if (window.showFloatingMessage) {
                    window.showFloatingMessage(`${itemData.name} déjà présent !`, 'warning');
                }
                return false;
            }
            
            this.slots[slotIndex].quantity += quantityToAdd;
            console.log('✅ Quantité augmentée par stackage');
        }
        // Sinon, remplacer l'objet (remettre l'ancien dans l'inventaire)
        else {
            this.returnItemToInventory(slot.item, slot.quantity);
            this.slots[slotIndex] = {
                item: { ...itemData },
                quantity: quantityToAdd
            };
            console.log('✅ Objet remplacé');
        }

        this.updateDisplay();
        this.saveToStorage();
        
        // Mettre à jour l'affichage de l'inventaire
        if (window.updateAllGrids) {
            window.updateAllGrids();
        }
        
        // Message de confirmation
        if (window.showFloatingMessage) {
            window.showFloatingMessage(`${itemData.name} ajouté à la barre utilitaire !`, 'success');
        }
        
        return true;
    }

    // Retirer un objet d'un slot
    removeItemFromSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.slots.length) return false;
        
        const slot = this.slots[slotIndex];
        if (!slot.item) return false;

        // Remettre l'objet dans l'inventaire principal si possible
        this.returnItemToInventory(slot.item, slot.quantity);
        
        // Vider le slot
        this.slots[slotIndex] = { item: null, quantity: 0 };
        
        this.updateDisplay();
        this.saveToStorage();
        return true;
    }

    // Trouver un objet dans la barre utilitaire par nom
    findItemInBar(itemName) {
        console.log(`🔍 Recherche de "${itemName}" dans la barre...`);
        
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            if (slot && slot.item && slot.item.name === itemName) {
                console.log(`🎯 Objet trouvé au slot ${i}`);
                return i;
            }
        }
        
        console.log('❌ Objet non trouvé dans la barre');
        return -1;
    }

    // Retirer un objet de la barre vers le vide (le remettre dans l'inventaire)
    removeItemFromSlotToVoid(slotIndex) {
        console.log(`🗑️ removeItemFromSlotToVoid appelé pour slot ${slotIndex}`);
        
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            console.log('❌ Index de slot invalide');
            return false;
        }
        
        const slot = this.slots[slotIndex];
        if (!slot.item) {
            console.log('❌ Slot déjà vide');
            return false;
        }

        const itemName = slot.item.name;
        const itemQuantity = slot.quantity;
        
        console.log(`📦 Objet à retirer: ${itemName} (quantité: ${itemQuantity})`);
        
        // Remettre l'objet dans l'inventaire principal
        this.returnItemToInventory(slot.item, slot.quantity);
        
        // Vider le slot
        this.slots[slotIndex] = { item: null, quantity: 0 };
        
        this.updateDisplay();
        this.saveToStorage();
        
        // Message de confirmation
        if (window.showFloatingMessage) {
            window.showFloatingMessage(`${itemName} retiré de la barre`, 'info');
        }
        
        console.log('✅ Objet retiré avec succès');
        return true;
    }

    // Retirer un objet de l'inventaire source
    removeFromSourceInventory(itemData) {
        // Essayer de retirer depuis les différents inventaires
        const inventories = [
            { inv: window.inventoryPotions, name: 'potions' },
            { inv: window.inventoryRessources, name: 'ressources' },
            { inv: window.inventoryRessourcesAlchimiste, name: 'ressourcesAlchimiste' },
            { inv: window.inventoryEquipement, name: 'equipement' },
            { inv: window.inventoryAll, name: 'all' }
        ];

        for (const { inv } of inventories) {
            if (!inv) continue;
            
            for (let i = 0; i < inv.length; i++) {
                const slot = inv[i];
                if (slot && slot.item && slot.item.name === itemData.name) {
                    const quantityToRemove = Math.min(itemData.quantity, slot.item.quantity || 1);
                    
                    if (slot.item.quantity) {
                        slot.item.quantity -= quantityToRemove;
                        if (slot.item.quantity <= 0) {
                            inv[i] = { item: null, category: slot.category };
                        }
                    } else {
                        inv[i] = { item: null, category: slot.category };
                    }
                    
                    return true;
                }
            }
        }
        
        return false;
    }

    // Remettre un objet dans l'inventaire
    returnItemToInventory(item, quantity) {
        if (window.addItemToInventory) {
            const itemToAdd = { ...item, quantity: quantity };
            window.addItemToInventory(itemToAdd);
            if (window.showFloatingMessage) {
                window.showFloatingMessage(`${item.name} remis dans l'inventaire`, 'info');
            }
        }
    }

    // Utiliser un objet du slot
    useItem(slotIndex) {
        console.log(`🎮 useItem appelé - slot ${slotIndex}`);
        
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            console.log('❌ Index de slot invalide');
            return false;
        }
        
        const slot = this.slots[slotIndex];
        if (!slot.item) {
            console.log('❌ Slot vide');
            return false;
        }

        const item = slot.item;
        console.log(`📦 Objet à utiliser:`, item);
        console.log(`🏷️ Type d'objet: ${item.type}`);
        
        // Logique d'utilisation selon le type d'objet
        switch (item.type) {
            case 'potion':
                console.log('💉 Tentative d\'utilisation de potion...');
                return this.usePotion(item, slotIndex);
            case 'ressource':
                console.log('🌿 Tentative d\'utilisation de ressource...');
                return this.useResource(item, slotIndex);
            default:
                console.log(`🔧 Utilisation d'objet par défaut: ${item.name}`);
                if (window.showFloatingMessage) {
                    window.showFloatingMessage(`${item.name} utilisé !`, 'info');
                }
                this.consumeItem(slotIndex, 1);
                return true;
        }
    }

    // Utiliser une potion
    usePotion(potion, slotIndex) {
        console.log('💉 usePotion appelé avec:', potion);
        
        if (!window.player) {
            console.log('❌ Pas de joueur disponible');
            return false;
        }
        
        console.log('👤 Joueur trouvé:', window.player);
        console.log('🩺 Propriétés HP du joueur:');
        console.log('  - hp:', window.player.hp, typeof window.player.hp);
        console.log('  - maxHp:', window.player.maxHp, typeof window.player.maxHp);
        console.log('  - health:', window.player.health, typeof window.player.health);
        console.log('  - maxHealth:', window.player.maxHealth, typeof window.player.maxHealth);
        console.log('  - vie:', window.player.vie, typeof window.player.vie);
        console.log('  - vieMax:', window.player.vieMax, typeof window.player.vieMax);
        console.log('  - pv:', window.player.pv, typeof window.player.pv);
        console.log('  - pvMax:', window.player.pvMax, typeof window.player.pvMax);
        console.log('  - currentHp:', window.player.currentHp, typeof window.player.currentHp);
        console.log('  - maxHP:', window.player.maxHP, typeof window.player.maxHP);
        console.log('🔍 Toutes les propriétés du joueur:', Object.keys(window.player));
        
        // Afficher aussi les valeurs numériques détectées
        console.log('🔢 Valeurs numériques détectées:');
        Object.keys(window.player).forEach(key => {
            const value = window.player[key];
            if (typeof value === 'number' && !isNaN(value)) {
                console.log(`  ${key}: ${value}`);
            }
        });

        // Vérifier le cooldown global des potions
        const now = Date.now();
        if (this.lastPotionUse && now - this.lastPotionUse < 3000) {
            const remaining = Math.ceil((3000 - (now - this.lastPotionUse)) / 1000);
            console.log(`⏰ Cooldown actif: ${remaining}s`);
            if (window.showFloatingMessage) {
                window.showFloatingMessage(`Cooldown potion: ${remaining}s`, 'warning');
            }
            return false;
        }
        
        console.log('✅ Pas de cooldown, traitement de la potion...');

        // Essayer d'utiliser le système de potions existant si disponible
        if (window.equipmentDatabase && potion.name) {
            console.log('🗃️ Recherche dans equipmentDatabase...');
            console.log('📂 equipmentDatabase disponible:', !!window.equipmentDatabase);
            console.log('🏷️ Nom de la potion à chercher:', potion.name);
            
            // Chercher la potion dans la base de données d'équipements
            for (const [key, item] of Object.entries(window.equipmentDatabase)) {
                if (item.name === potion.name && item.type === 'potion') {
                    console.log('🎯 Potion trouvée dans la base de données:', item);
                    
                    // Utiliser les effets de la potion de la base de données
                    if (item.stats && item.stats.soin) {
                        const healAmount = item.stats.soin;
                        const oldHp = window.player.hp;
                        console.log(`🩺 HP avant: ${oldHp}, soin: ${healAmount}, maxHP: ${window.player.maxHp}`);
                        
                        window.player.hp = Math.min(window.player.maxHp, window.player.hp + healAmount);
                        const actualHeal = window.player.hp - oldHp;
                        
                        console.log(`💚 HP après: ${window.player.hp}, soin effectif: ${actualHeal}`);
                        
                        if (window.showFloatingMessage) {
                            window.showFloatingMessage(`+${actualHeal} HP`, 'heal');
                        }
                        
                        // Enregistrer le temps d'utilisation
                        this.lastPotionUse = now;
                        console.log('⏰ Cooldown enregistré');
                        
                        // Consommer la potion
                        console.log('🍽️ Consommation de la potion...');
                        this.consumeItem(slotIndex, 1);
                        
                        // Mettre à jour l'affichage des stats si disponible
                        if (window.updateStatsDisplay) {
                            window.updateStatsDisplay();
                            console.log('📊 Affichage des stats mis à jour');
                        }
                        
                        console.log('✅ Potion utilisée avec succès !');
                        return true;
                    } else {
                        console.log('❌ Pas de stats de soin dans la potion de la DB');
                    }
                } else if (item.name === potion.name) {
                    console.log('🔍 Objet trouvé mais pas de type potion:', item);
                }
            }
            console.log('❌ Potion non trouvée dans equipmentDatabase');
            console.log('🗂️ Voici toutes les potions disponibles dans equipmentDatabase:');
            for (const [key, item] of Object.entries(window.equipmentDatabase)) {
                if (item.type === 'potion') {
                    console.log(`  - ${key}: "${item.name}"`);
                }
            }
        } else {
            console.log('❌ equipmentDatabase non disponible ou nom de potion manquant');
        }

        // Fallback : utiliser les stats directes de la potion
        console.log('🔄 Fallback activé - tentative de soin direct...');
        
        if (potion.stats && potion.stats.soin) {
            console.log('💊 Stats de soin trouvées dans la potion:', potion.stats);
            const healAmount = potion.stats.soin;
            const oldHp = window.player.hp;
            window.player.hp = Math.min(window.player.maxHp, window.player.hp + healAmount);
            const actualHeal = window.player.hp - oldHp;
            
            console.log(`💚 Soin appliqué: ${actualHeal} HP`);
            
            if (window.showFloatingMessage) {
                window.showFloatingMessage(`+${actualHeal} HP`, 'heal');
            }
        } else {
            console.log('🔧 Pas de stats de soin, utilisation du soin par défaut...');
            // Si pas de stats, essayer un soin par défaut basé sur le nom
            let healAmount = 50; // Valeur par défaut
            if (potion.name && potion.name.toLowerCase().includes('basique')) {
                healAmount = 50;
                console.log('🎯 Potion basique détectée, soin: 50 HP');
            }
            
            // Détecter les bonnes propriétés HP
            const hpProps = this.getPlayerHpProperties();
            console.log('🔍 Propriétés HP détectées:', hpProps);
            
            if (!hpProps.currentHp || !hpProps.maxHp) {
                console.log('❌ Impossible de trouver les propriétés HP du joueur');
                if (window.showFloatingMessage) {
                    window.showFloatingMessage('Erreur: propriétés HP non trouvées', 'error');
                }
                return false;
            }
            
            const oldHp = hpProps.currentHp.value;
            console.log(`🩺 HP avant fallback: ${oldHp}, soin: ${healAmount}, maxHP: ${hpProps.maxHp.value}`);
            
            const newHp = Math.min(hpProps.maxHp.value, oldHp + healAmount);
            hpProps.currentHp.setValue(newHp);
            const actualHeal = newHp - oldHp;
            
            console.log(`💚 HP après fallback: ${newHp}, soin effectif: ${actualHeal}`);
            
            if (window.showFloatingMessage) {
                window.showFloatingMessage(`+${actualHeal} HP`, 'heal');
            }
        }

        // Enregistrer le temps d'utilisation
        this.lastPotionUse = now;
        
        // Consommer la potion
        console.log('🍽️ Consommation de la potion...');
        
        // Consommer dans la barre utilitaire
        this.consumeItem(slotIndex, 1);
        
        // Synchroniser avec l'inventaire (réduire la quantité)
        this.syncronizeInventoryConsumption(potion.name, 1);
        
        // Mettre à jour l'affichage des stats si disponible
        if (window.updateStatsDisplay) {
            window.updateStatsDisplay();
        }
        
        return true;
    }

    // Détecter les bonnes propriétés HP du joueur
    getPlayerHpProperties() {
        const player = window.player;
        if (!player) return { currentHp: null, maxHp: null };
        
        // Liste des propriétés possibles pour HP actuel et max
        const hpVariants = [
            { current: 'life', max: 'maxLife' },        // Priorité 1 : détecté dans les logs !
            { current: 'hp', max: 'maxHp' },
            { current: 'health', max: 'maxHealth' },
            { current: 'vie', max: 'vieMax' },
            { current: 'pv', max: 'pvMax' },
            { current: 'hitpoints', max: 'maxHitpoints' }
        ];
        
        for (const variant of hpVariants) {
            const currentProp = variant.current;
            const maxProp = variant.max;
            
            if (player.hasOwnProperty(currentProp) && player.hasOwnProperty(maxProp)) {
                const currentVal = player[currentProp];
                const maxVal = player[maxProp];
                
                // Vérifier que les valeurs sont des nombres valides
                if (typeof currentVal === 'number' && !isNaN(currentVal) && 
                    typeof maxVal === 'number' && !isNaN(maxVal) && maxVal > 0) {
                    
                    console.log(`✅ Propriétés HP trouvées: ${currentProp}=${currentVal}, ${maxProp}=${maxVal}`);
                    
                    return {
                        currentHp: {
                            value: currentVal,
                            setValue: (newVal) => { player[currentProp] = newVal; }
                        },
                        maxHp: {
                            value: maxVal,
                            setValue: (newVal) => { player[maxProp] = newVal; }
                        }
                    };
                }
            }
        }
        
        console.log('❌ Aucune propriété HP valide trouvée');
        return { currentHp: null, maxHp: null };
    }

    // Synchroniser la consommation avec l'inventaire
    syncronizeInventoryConsumption(itemName, quantity) {
        console.log(`🔄 Synchronisation: réduction de ${quantity} ${itemName} dans l'inventaire...`);
        
        const inventories = [
            { inv: window.inventoryPotions, name: 'potions' },
            { inv: window.inventoryRessources, name: 'ressources' },
            { inv: window.inventoryRessourcesAlchimiste, name: 'ressourcesAlchimiste' },
            { inv: window.inventoryEquipement, name: 'equipement' },
            { inv: window.inventoryAll, name: 'all' }
        ];

        for (const { inv, name } of inventories) {
            if (!inv) continue;
            
            for (let i = 0; i < inv.length; i++) {
                const slot = inv[i];
                if (slot && slot.item && slot.item.name === itemName) {
                    console.log(`🎯 Objet trouvé dans ${name}, réduction...`);
                    
                    if (slot.item.quantity && slot.item.quantity > quantity) {
                        slot.item.quantity -= quantity;
                        console.log(`✅ Quantité réduite à ${slot.item.quantity}`);
                    } else {
                        // Si la quantité est 1 ou moins, on vide le slot
                        inv[i] = { item: null, category: slot.category };
                        console.log('✅ Slot vidé dans l\'inventaire');
                    }
                    
                    // Mettre à jour l'affichage de l'inventaire
                    if (window.updateAllGrids) {
                        window.updateAllGrids();
                    }
                    
                    return true;
                }
            }
        }
        
        console.log('❌ Objet non trouvé dans l\'inventaire pour synchronisation');
        return false;
    }

    // Utiliser une ressource (pour l'instant juste un message)
    useResource(resource, slotIndex) {
        if (window.showFloatingMessage) {
            window.showFloatingMessage(`${resource.name} ne peut pas être utilisé directement`, 'warning');
        }
        return false;
    }

    // Consommer un certain nombre d'objets d'un slot
    consumeItem(slotIndex, amount = 1) {
        console.log(`🍽️ consumeItem appelé - slot ${slotIndex}, quantité: ${amount}`);
        
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            console.log('❌ Index de slot invalide pour consommation');
            return false;
        }
        
        const slot = this.slots[slotIndex];
        console.log('📦 Slot avant consommation:', slot);
        
        if (!slot.item || slot.quantity < amount) {
            console.log('❌ Pas d\'objet ou quantité insuffisante');
            return false;
        }

        slot.quantity -= amount;
        console.log(`🔢 Nouvelle quantité: ${slot.quantity}`);
        
        // Si plus d'objets, vider le slot
        if (slot.quantity <= 0) {
            console.log('🗑️ Slot vidé (quantité = 0)');
            this.slots[slotIndex] = { item: null, quantity: 0 };
        }

        console.log('🔄 Mise à jour de l\'affichage...');
        this.updateDisplay();
        this.saveToStorage();
        
        console.log('✅ Objet consommé avec succès');
        return true;
    }

    // Mettre à jour l'affichage de la barre
    updateDisplay() {
        console.log('🔄 Mise à jour de l\'affichage de la barre utilitaire...');
        const utilityBar = document.getElementById('utility-bar');
        if (!utilityBar) {
            console.log('❌ Barre utilitaire non trouvée');
            return;
        }

        const slots = utilityBar.querySelectorAll('.utility-slot');
        console.log(`📋 ${slots.length} slots trouvés`);
        
        slots.forEach((slotElement, index) => {
            const slot = this.slots[index];
            console.log(`🔍 Slot ${index}:`, slot);
            
            // Vider le contenu du slot
            slotElement.innerHTML = '';
            
            if (slot && slot.item) {
                console.log(`📦 Affichage objet dans slot ${index}:`, slot.item);
                console.log(`🖼️ Icône de l'objet: "${slot.item.icon}"`);
                
                // Ajouter l'icône
                if (slot.item.icon && (slot.item.icon.startsWith('assets/') || slot.item.icon.startsWith('http'))) {
                    console.log(`✅ Affichage image pour slot ${index}`);
                    const img = document.createElement('img');
                    img.src = slot.item.icon;
                    img.alt = slot.item.name || 'Objet';
                    img.className = 'utility-item-icon';
                    img.title = slot.item.name || 'Objet';
                    img.style.width = '32px';
                    img.style.height = '32px';
                    img.onerror = () => console.log(`❌ Erreur de chargement d'image: ${img.src}`);
                    img.onload = () => console.log(`✅ Image chargée: ${img.src}`);
                    slotElement.appendChild(img);
                } else {
                    console.log(`✅ Affichage texte pour slot ${index}: "${slot.item.icon}"`);
                    const span = document.createElement('span');
                    span.textContent = slot.item.icon || '?';
                    span.className = 'utility-item-icon';
                    span.title = slot.item.name || 'Objet';
                    span.style.fontSize = '1.8rem';
                    slotElement.appendChild(span);
                }
                
                // Ajouter la quantité si > 1
                if (slot.quantity > 1) {
                    const quantityDiv = document.createElement('div');
                    quantityDiv.className = 'utility-item-quantity';
                    quantityDiv.textContent = slot.quantity;
                    slotElement.appendChild(quantityDiv);
                }
                
                // Marquer le slot comme occupé
                slotElement.classList.remove('empty');
                slotElement.setAttribute('draggable', 'true');
            } else {
                // Slot vide
                slotElement.classList.add('empty');
                slotElement.removeAttribute('draggable');
            }
        });
    }

    // Sauvegarder dans le localStorage
    saveToStorage() {
        try {
            localStorage.setItem('utilityBarSlots', JSON.stringify(this.slots));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la barre utilitaire:', error);
        }
    }

    // Charger depuis le localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('utilityBarSlots');
            if (saved) {
                const loadedSlots = JSON.parse(saved);
                if (Array.isArray(loadedSlots) && loadedSlots.length === this.slots.length) {
                    this.slots = loadedSlots;
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la barre utilitaire:', error);
        }
    }

    // Vider tous les slots
    clearAll() {
        this.slots.forEach((slot, index) => {
            if (slot.item) {
                this.returnItemToInventory(slot.item, slot.quantity);
            }
        });
        
        this.slots = Array.from({ length: 8 }, () => ({ item: null, quantity: 0 }));
        this.updateDisplay();
        this.saveToStorage();
    }

    // Obtenir un slot spécifique
    getSlot(index) {
        return this.slots[index] || { item: null, quantity: 0 };
    }

    // Vérifier si un slot est vide
    isSlotEmpty(index) {
        return !this.slots[index] || !this.slots[index].item;
    }
}

// Initialiser la barre utilitaire globalement
window.utilityBar = null;

// Fonction d'initialisation
function initUtilityBar() {
    if (!window.utilityBar) {
        window.utilityBar = new UtilityBar();
    }
}

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUtilityBar);
} else {
    initUtilityBar();
}

// Export pour utilisation dans d'autres modules
window.initUtilityBar = initUtilityBar;

// Fonction globale pour forcer la mise à jour des draggables
window.updateUtilityBarDraggables = function() {
    if (window.utilityBar && window.utilityBar.makeInventorySlotsDrawable) {
        console.log('🔄 Mise à jour manuelle des draggables demandée');
        window.utilityBar.makeInventorySlotsDrawable();
    }
};
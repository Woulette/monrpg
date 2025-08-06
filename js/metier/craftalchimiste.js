// js/metier/craftalchimiste.js

// Système de craft pour l'alchimiste
class CraftAlchimiste {
    constructor() {
        this.recettes = {
                    'potion_soin_basique': {
            nom: 'Potion de Soin Basique',
            icon: 'assets/objets/potiondesoinbasique.png',
            type: 'potion',
            niveauRequise: 1,
            xpGained: 10,
            ingredients: [
                { nom: 'Pissenlit', quantite: 3, icon: 'assets/objets/ressources_alchimiste/pissenlit.png' }
            ],
            resultat: {
                nom: 'Potion de Soin Basique',
                icon: 'assets/objets/potiondesoinbasique.png',
                type: 'potion',
                quantite: 1,
                description: 'Restaure 50 points de vie.',
                shortDescription: 'Restaure 50 points de vie',
                rarity: 'common',
                cooldown: 3000,
                stats: {
                    soin: 50
                }
            }
        }
        };
    }

    // Vérifier si le joueur peut craft une recette
    peutCraft(recetteId) {
        const recette = this.recettes[recetteId];
        if (!recette) return false;

        // Vérifier le niveau du métier
        if (window.metiers && window.metiers.alchimiste) {
            if (window.metiers.alchimiste.niveau < recette.niveauRequise) {
                return false;
            }
        }

        // Vérifier les ingrédients
        for (const ingredient of recette.ingredients) {
            const quantiteDisponible = this.getQuantiteIngredient(ingredient.nom);
            if (quantiteDisponible < ingredient.quantite) {
                return false;
            }
        }

        return true;
    }

    // Obtenir la quantité d'un ingrédient dans l'inventaire
    getQuantiteIngredient(nomIngredient) {
        let quantiteTotale = 0;
        
        // Chercher dans l'inventaire des ressources alchimiste
        if (window.inventoryRessourcesAlchimiste) {
            for (const slot of window.inventoryRessourcesAlchimiste) {
                if (slot && slot.item && slot.item.name === nomIngredient) {
                    quantiteTotale += slot.item.quantity || 1;
                }
            }
        }
        
        // Chercher dans l'inventaire général des ressources
        if (window.inventoryRessources) {
            for (const slot of window.inventoryRessources) {
                if (slot && slot.item && slot.item.name === nomIngredient) {
                    quantiteTotale += slot.item.quantity || 1;
                }
            }
        }
        
        // Chercher dans l'inventaire général
        if (window.inventoryAll) {
            for (const slot of window.inventoryAll) {
                if (slot && slot.item && slot.item.name === nomIngredient) {
                    quantiteTotale += slot.item.quantity || 1;
                }
            }
        }

        return quantiteTotale;
    }

    // Consommer les ingrédients
    consommerIngredients(recetteId) {
        const recette = this.recettes[recetteId];
        if (!recette) return false;

        for (const ingredient of recette.ingredients) {
            if (!this.retirerIngredient(ingredient.nom, ingredient.quantite)) {
                return false;
            }
        }

        return true;
    }

    // Retirer un ingrédient de l'inventaire
    retirerIngredient(nomIngredient, quantite) {
        let quantiteRestante = quantite;
        
        // Chercher d'abord dans l'inventaire des ressources alchimiste
        if (window.inventoryRessourcesAlchimiste) {
            for (let i = 0; i < window.inventoryRessourcesAlchimiste.length && quantiteRestante > 0; i++) {
                const slot = window.inventoryRessourcesAlchimiste[i];
                if (slot && slot.item && slot.item.name === nomIngredient) {
                    const qtePrise = Math.min(slot.item.quantity || 1, quantiteRestante);
                    if (slot.item.quantity) {
                        slot.item.quantity -= qtePrise;
                        if (slot.item.quantity <= 0) {
                            window.inventoryRessourcesAlchimiste[i] = null;
                        }
                    } else {
                        window.inventoryRessourcesAlchimiste[i] = null;
                    }
                    quantiteRestante -= qtePrise;
                }
            }
        }
        
        // Chercher ensuite dans l'inventaire général des ressources
        if (quantiteRestante > 0 && window.inventoryRessources) {
            for (let i = 0; i < window.inventoryRessources.length && quantiteRestante > 0; i++) {
                const slot = window.inventoryRessources[i];
                if (slot && slot.item && slot.item.name === nomIngredient) {
                    const qtePrise = Math.min(slot.item.quantity || 1, quantiteRestante);
                    if (slot.item.quantity) {
                        slot.item.quantity -= qtePrise;
                        if (slot.item.quantity <= 0) {
                            window.inventoryRessources[i] = null;
                        }
                    } else {
                        window.inventoryRessources[i] = null;
                    }
                    quantiteRestante -= qtePrise;
                }
            }
        }
        
        // Chercher enfin dans l'inventaire général (inventoryAll)
        if (quantiteRestante > 0 && window.inventoryAll) {
            for (let i = 0; i < window.inventoryAll.length && quantiteRestante > 0; i++) {
                const slot = window.inventoryAll[i];
                if (slot && slot.item && slot.item.name === nomIngredient) {
                    const qtePrise = Math.min(slot.item.quantity || 1, quantiteRestante);
                    if (slot.item.quantity) {
                        slot.item.quantity -= qtePrise;
                        if (slot.item.quantity <= 0) {
                            window.inventoryAll[i] = { item: null };
                        }
                    } else {
                        window.inventoryAll[i] = { item: null };
                    }
                    quantiteRestante -= qtePrise;
                }
            }
        }
        
        // Mettre à jour l'affichage de l'inventaire
        if (window.updateInventoryDisplay) {
            window.updateInventoryDisplay();
        }
        
        // Retourner true si on a pu retirer toute la quantité demandée
        return quantiteRestante === 0;
    }

    // Ajouter l'objet crafté à l'inventaire
    ajouterObjetCraft(recetteId) {
        const recette = this.recettes[recetteId];
        if (!recette) return false;

        const objetCraft = {
            id: recetteId, // Ajouter l'ID !
            name: recette.resultat.nom,
            icon: recette.resultat.icon,
            type: recette.resultat.type,
            category: 'potion', // Ajouter la catégorie
            quantity: recette.resultat.quantite,
            stackable: true, // Permettre le stackage des potions
            description: recette.resultat.description || 'Une potion magique.',
            shortDescription: recette.resultat.shortDescription || 'Effet de soin',
            rarity: recette.resultat.rarity || 'common',
            cooldown: recette.resultat.cooldown || 3000,
            stats: recette.resultat.stats,
            healAmount: recette.resultat.stats ? recette.resultat.stats.soin : 50 // Ajouter healAmount
        };

        // Ajouter à l'inventaire des potions
        if (!window.inventoryPotions) {
            window.inventoryPotions = Array.from({ length: 80 }, () => ({ item: null, category: 'potions' }));
        }

        // Chercher d'abord un slot avec le même objet pour stacker
        let slotTrouve = false;
        for (let i = 0; i < window.inventoryPotions.length; i++) {
            if (window.inventoryPotions[i] && window.inventoryPotions[i].item && 
                window.inventoryPotions[i].item.name === objetCraft.name &&
                window.inventoryPotions[i].item.stackable) {
                window.inventoryPotions[i].item.quantity += objetCraft.quantity;
                slotTrouve = true;
                break;
            }
        }
        
        // Si pas trouvé de slot à stacker, chercher un slot vide
        if (!slotTrouve) {
            for (let i = 0; i < window.inventoryPotions.length; i++) {
                if (!window.inventoryPotions[i] || !window.inventoryPotions[i].item) {
                    window.inventoryPotions[i] = { item: objetCraft, category: 'potions' };
                    slotTrouve = true;
                    break;
                }
            }
        }

        // Si pas de slot trouvé, ajouter à la fin
        if (!slotTrouve) {
            window.inventoryPotions.push({ item: objetCraft, category: 'potions' });
        }

        // Mettre à jour l'affichage
        if (window.updateAllGrids) {
            window.updateAllGrids();
        }
        
        // Synchroniser avec l'inventaire principal pour l'onglet "Tout"
        if (window.inventoryAll) {
            // Chercher un slot vide dans l'inventaire principal
            for (let i = 0; i < window.inventoryAll.length; i++) {
                if (!window.inventoryAll[i] || !window.inventoryAll[i].item) {
                    window.inventoryAll[i] = { item: objetCraft, category: 'potions' };
                    break;
                }
            }
        }

        return true;
    }

    // Exécuter le craft
    executerCraft(recetteId) {
        if (!this.peutCraft(recetteId)) {
            console.log('Impossible de craft cette recette');
            return false;
        }

        // Consommer les ingrédients
        if (!this.consommerIngredients(recetteId)) {
            console.log('Erreur lors de la consommation des ingrédients');
            return false;
        }

        // Ajouter l'objet crafté
        if (!this.ajouterObjetCraft(recetteId)) {
            console.log('Erreur lors de l\'ajout de l\'objet crafté');
            return false;
        }

        // Ajouter l'XP du métier alchimiste
        const recette = this.recettes[recetteId];
        if (recette && recette.xpGained && window.gainMetierXP) {
            window.gainMetierXP('alchimiste', recette.xpGained);
            if (window.showFloatingMessage) {
                window.showFloatingMessage(
                    `+${recette.xpGained} XP Alchimie !`, 
                    window.player.x, 
                    window.player.y - 30, 
                    '#4CAF50', 
                    '16px'
                );
            }
        }

        // Afficher un message de succès
        if (window.showFloatingMessage) {
            window.showFloatingMessage(
                `${recette.nom} craftée !`, 
                window.player.x, 
                window.player.y - 50, 
                'green', 
                '20px'
            );
        }

        console.log(`Craft réussi : ${this.recettes[recetteId].nom}`);
        return true;
    }

    // Obtenir toutes les recettes
    getRecettes() {
        return this.recettes;
    }

    // Obtenir une recette spécifique
    getRecette(recetteId) {
        return this.recettes[recetteId];
    }
}

// Initialiser le système de craft alchimiste
window.craftAlchimiste = new CraftAlchimiste();

// Fonction pour craft depuis l'interface du chaudron
window.craftPotionAlchimiste = function(recetteId) {
    return window.craftAlchimiste.executerCraft(recetteId);
}; 
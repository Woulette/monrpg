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
        // Source unique de vérité: inventoryAll (vue agrégée)
        let quantiteTotale = 0;
        if (Array.isArray(window.inventoryAll)) {
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
        // Utiliser l’API centrale pour retirer par id, en s’appuyant sur inventoryAll
        let quantiteRestante = quantite;
        // Trouver l’id via resourceDatabase/equipmentDatabase à partir du nom
        const findIdByName = (name) => {
            if (window.resourceDatabase) {
                for (const [id, it] of Object.entries(window.resourceDatabase)) {
                    if (it && it.name === name) return id;
                }
            }
            if (window.equipmentDatabase) {
                for (const [id, it] of Object.entries(window.equipmentDatabase)) {
                    if (it && it.name === name) return id;
                }
            }
            return null;
        };
        const id = findIdByName(nomIngredient);
        if (!id) return false;

        if (typeof window.removeItemFromInventory === 'function') {
            const removed = window.removeItemFromInventory(id, quantite);
            quantiteRestante = Math.max(0, quantite - removed);
        } else {
            // Fallback: retirer directement depuis inventoryAll
            if (Array.isArray(window.inventoryAll)) {
                for (let i = 0; i < window.inventoryAll.length && quantiteRestante > 0; i++) {
                    const slot = window.inventoryAll[i];
                    if (slot && slot.item && slot.item.id === id) {
                        const qtePrise = Math.min(slot.item.quantity || 1, quantiteRestante);
                        if (slot.item.quantity) {
                            slot.item.quantity -= qtePrise;
                            if (slot.item.quantity <= 0) window.inventoryAll[i] = { item: null, category: null };
                        } else {
                            window.inventoryAll[i] = { item: null, category: null };
                        }
                        quantiteRestante -= qtePrise;
                    }
                }
            }
        }

        // Après retrait, reconstruire les vues et rafraîchir
        if (typeof window.reconcileResourcesFromAll === 'function') window.reconcileResourcesFromAll();
        if (typeof window.updateAllGrids === 'function') window.updateAllGrids();
        if (typeof window.updateAlchimisteInventory === 'function') window.updateAlchimisteInventory();

        return quantiteRestante === 0;
    }

    // Ajouter l'objet crafté à l'inventaire
    ajouterObjetCraft(recetteId) {
        const recette = this.recettes[recetteId];
        if (!recette) return false;

        // Ajouter via l’API centrale (gère ALL + potions + normalisation + vues)
        if (typeof window.addItemToInventory === 'function') {
            window.addItemToInventory(recetteId, 'potions');
        }
        if (typeof window.reconcileResourcesFromAll === 'function') window.reconcileResourcesFromAll();
        if (typeof window.updateAllGrids === 'function') window.updateAllGrids();
        if (typeof window.updateAlchimisteInventory === 'function') window.updateAlchimisteInventory();

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
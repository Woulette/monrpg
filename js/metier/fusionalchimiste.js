// js/metier/fusionalchimiste.js

// Système de fusion pour l'alchimiste
class FusionAlchimiste {
    constructor() {
        this.recettesFusion = {
            'orbe_rare_equipement_niveau10': {
                nom: 'Orbe Rare Équipement Niveau 10',
                icon: 'assets/objets/orbesrareniveau10.png',
                type: 'objet_special',
                niveauRequis: 15,
                xpGagne: 50,
                ingredients: [
                    { nom: 'Particule', quantite: 10, icon: 'assets/objets/particulerare.png' }
                ],
                resultat: {
                    nom: 'Orbe Rare Équipement Niveau 10',
                    icon: 'assets/objets/orbesrareniveau10.png',
                    type: 'objet_special',
                    quantite: 1,
                    id: 'orbe_rare_equipement_niveau10'
                }
            },
            'orbe_rare_sort_niveau10': {
                nom: 'Orbe Rare Sort Niveau 10',
                icon: 'assets/objets/orbesraredesortniveau10.png',
                type: 'objet_special',
                niveauRequis: 20,
                xpGagne: 75,
                ingredients: [
                    { nom: 'Particule', quantite: 10, icon: 'assets/objets/particulerare.png' }
                ],
                resultat: {
                    nom: 'Orbe Rare Sort Niveau 10',
                    icon: 'assets/objets/orbesraredesortniveau10.png',
                    type: 'objet_special',
                    quantite: 1,
                    id: 'orbe_rare_sort_niveau10'
                }
            }
        };
    }

    // Vérifier si le joueur peut fusionner une recette
    peutFusionner(recetteId) {
        const recette = this.recettesFusion[recetteId];
        if (!recette) return false;

        // Vérifier le niveau du métier
        if (window.metiers && window.metiers.alchimiste) {
            if (window.metiers.alchimiste.niveau < recette.niveauRequis) {
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
        // Chercher dans l'inventaire des ressources
        if (window.inventoryRessources) {
            for (const slot of window.inventoryRessources) {
                if (slot && slot.item && slot.item.name === nomIngredient) {
                    return slot.item.quantity || 1;
                }
            }
        }

        // Chercher dans l'inventaire principal aussi
        if (window.inventoryAll) {
            for (const slot of window.inventoryAll) {
                if (slot && slot.item && slot.item.name === nomIngredient) {
                    return slot.item.quantity || 1;
                }
            }
        }

        return 0;
    }

    // Consommer les ingrédients
    consommerIngredients(recetteId) {
        const recette = this.recettesFusion[recetteId];
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
        // Chercher d'abord dans l'inventaire des ressources
        if (window.inventoryRessources) {
            for (let i = 0; i < window.inventoryRessources.length; i++) {
                const slot = window.inventoryRessources[i];
                if (slot && slot.item && slot.item.name === nomIngredient) {
                    if (slot.item.quantity > quantite) {
                        slot.item.quantity -= quantite;
                        return true;
                    } else if (slot.item.quantity === quantite) {
                        window.inventoryRessources[i] = { item: null, category: 'ressources' };
                        return true;
                    }
                }
            }
        }

        // Chercher ensuite dans l'inventaire principal
        if (window.inventoryAll) {
            for (let i = 0; i < window.inventoryAll.length; i++) {
                const slot = window.inventoryAll[i];
                if (slot && slot.item && slot.item.name === nomIngredient) {
                    if (slot.item.quantity > quantite) {
                        slot.item.quantity -= quantite;
                        return true;
                    } else if (slot.item.quantity === quantite) {
                        window.inventoryAll[i] = { item: null, category: null };
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // Ajouter l'objet fusionné à l'inventaire
    ajouterObjetFusion(recetteId) {
        const recette = this.recettesFusion[recetteId];
        if (!recette) return false;

        const objetFusion = {
            name: recette.resultat.nom,
            icon: recette.resultat.icon,
            type: recette.resultat.type,
            quantity: recette.resultat.quantite,
            id: recette.resultat.id
        };

        // Ajouter à l'inventaire principal
        if (window.inventoryAll) {
            for (let i = 0; i < window.inventoryAll.length; i++) {
                if (!window.inventoryAll[i] || !window.inventoryAll[i].item) {
                    window.inventoryAll[i] = { item: objetFusion, category: 'equipement' };
                    break;
                }
            }
        }

        // Mettre à jour l'affichage
        if (window.updateAllGrids) {
            window.updateAllGrids();
        }

        return true;
    }

    // Exécuter la fusion
    executerFusion(recetteId) {
        if (!this.peutFusionner(recetteId)) {
            console.log('Impossible de fusionner cette recette');
            return false;
        }

        // Consommer les ingrédients
        if (!this.consommerIngredients(recetteId)) {
            console.log('Erreur lors de la consommation des ingrédients');
            return false;
        }

        // Ajouter l'objet fusionné
        if (!this.ajouterObjetFusion(recetteId)) {
            console.log('Erreur lors de l\'ajout de l\'objet fusionné');
            return false;
        }

        // Ajouter l'XP du métier alchimiste
        const recette = this.recettesFusion[recetteId];
        if (recette && recette.xpGagne && window.gainMetierXP) {
            window.gainMetierXP('alchimiste', recette.xpGagne);
            if (window.showFloatingMessage) {
                window.showFloatingMessage(
                    `+${recette.xpGagne} XP Alchimie !`, 
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
                `${recette.nom} fusionnée !`, 
                window.player.x, 
                window.player.y - 50, 
                'gold', 
                '20px'
            );
        }

        console.log(`Fusion réussie : ${this.recettesFusion[recetteId].nom}`);
        return true;
    }

    // Obtenir toutes les recettes de fusion
    getRecettesFusion() {
        return this.recettesFusion;
    }

    // Obtenir une recette spécifique
    getRecetteFusion(recetteId) {
        return this.recettesFusion[recetteId];
    }
}

// Initialiser le système de fusion alchimiste
window.fusionAlchimiste = new FusionAlchimiste();

// Fonction pour fusionner depuis l'interface du chaudron
window.fusionnerAlchimiste = function(recetteId) {
    return window.fusionAlchimiste.executerFusion(recetteId);
};
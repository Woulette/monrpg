// ========================================
// TEST DE CORRECTION - ORBES ATYPIQUES FANTÔMES
// ========================================
// Fichier de test pour corriger le bug des orbes atypiques de sort
// qui apparaissent dans l'inventaire équipement sans être possédées
//
// UTILISATION:
// 1. Chargez ce fichier dans index.html : <script src="test-correction-orbes.js"></script>
// 2. Ouvrez la console (F12) et utilisez les fonctions ci-dessous

console.log('🔧 TEST CORRECTION ORBES - Fichier chargé');

// ========================================
// 1. FONCTION DE DIAGNOSTIC
// ========================================
function diagnostiquerOrbes() {
    console.log('🔍 DIAGNOSTIC: Analyse des orbes atypiques de sort...');
    
    let orbesToutInventaire = 0;
    let orbesEquipement = 0;
    
    // Compter dans inventoryAll
    if (window.inventoryAll) {
        window.inventoryAll.forEach((slot, index) => {
            if (slot.item && slot.item.id === 'orbe_atypique_sort_niveau10') {
                orbesToutInventaire++;
                console.log(`📦 Orbe trouvé dans inventoryAll[${index}], catégorie: ${slot.category}`);
            }
        });
    }
    
    // Compter dans inventoryEquipement  
    if (window.inventoryEquipement) {
        window.inventoryEquipement.forEach((slot, index) => {
            if (slot.item && slot.item.id === 'orbe_atypique_sort_niveau10') {
                orbesEquipement++;
                console.log(`⚔️ Orbe trouvé dans inventoryEquipement[${index}]`);
            }
        });
    }
    
    // Afficher le résumé
    let message = `📊 DIAGNOSTIC DES ORBES:\n\n`;
    message += `• Inventaire principal (Tout): ${orbesToutInventaire} orbe(s)\n`;
    message += `• Inventaire équipement: ${orbesEquipement} orbe(s)\n\n`;
    
    if (orbesEquipement > orbesToutInventaire) {
        message += `🚨 PROBLÈME DÉTECTÉ!\n`;
        message += `Il y a ${orbesEquipement - orbesToutInventaire} orbe(s) fantôme(s) dans l'équipement.\n\n`;
        message += `💡 Solution: Exécutez supprimerOrbesFantomes()`;
    } else if (orbesEquipement === 0 && orbesToutInventaire === 0) {
        message += `✅ Aucun orbe détecté - état normal`;
    } else {
        message += `✅ État normal détecté`;
    }
    
    alert(message);
    return { total: orbesToutInventaire, equipement: orbesEquipement };
}

// ========================================
// 2. FONCTION DE RÉPARATION
// ========================================
function supprimerOrbesFantomes() {
    console.log('🔧 RÉPARATION: Suppression des orbes fantômes...');
    
    if (!window.inventoryEquipement) {
        console.error('❌ inventoryEquipement non disponible');
        alert('❌ Erreur: Inventaire équipement non trouvé');
        return false;
    }
    
    let orbesSupprimes = 0;
    
    // Supprimer tous les orbes atypiques de sort de inventoryEquipement
    window.inventoryEquipement.forEach((slot, index) => {
        if (slot.item && slot.item.id === 'orbe_atypique_sort_niveau10') {
            console.log(`🗑️ Suppression orbe fantôme en inventoryEquipement[${index}]`);
            window.inventoryEquipement[index] = { item: null, category: 'equipement' };
            orbesSupprimes++;
        }
    });
    
    if (orbesSupprimes > 0) {
        console.log(`✅ ${orbesSupprimes} orbe(s) fantôme(s) supprimé(s)`);
        
        // Mettre à jour l'affichage
        if (typeof window.updateAllGrids === 'function') {
            window.updateAllGrids();
            console.log('🔄 Affichage mis à jour');
        }
        
        // Sauvegarder si possible
        if (typeof window.autoSaveOnEvent === 'function') {
            window.autoSaveOnEvent();
            console.log('💾 Sauvegarde effectuée');
        }
        
        alert(`✅ Réparation terminée!\n${orbesSupprimes} orbe(s) fantôme(s) supprimé(s) de l'inventaire équipement.`);
        return true;
    } else {
        console.log('ℹ️ Aucun orbe fantôme trouvé');
        alert('ℹ️ Aucun orbe fantôme trouvé dans l\'inventaire équipement.');
        return false;
    }
}

// ========================================
// 3. FONCTION DE COFFRE CORRIGÉ (TEST)
// ========================================
function ouvrirCoffreCorrige() {
    console.log('🎁 COFFRE CORRIGÉ: Ouverture du coffre SlimeBoss avec correction...');
    
    // Créer la fenêtre du coffre
    const coffreWindow = document.createElement('div');
    coffreWindow.id = 'coffre-test-corrige';
    
    coffreWindow.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #2c3e50, #34495e);
        border: 3px solid #27ae60;
        border-radius: 15px;
        padding: 30px;
        color: white;
        font-family: Arial, sans-serif;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        min-width: 500px;
    `;
    
    // ✅ DÉFINITION CORRIGÉE - Catégorie cohérente
    const objetsCorriges = [
        {
            id: "orbe_atypique_niveau10",
            name: "Orbe Atypique Niveau 10",
            type: "objet_special",
            category: "equipement", // ✅ CORRIGÉ
            description: "Un orbe mystérieux qui dégage une énergie particulière.",
            image: "assets/objets/orbesatypiqueniveau10.png"
        },
        {
            id: "dague_slime", 
            name: "Dague de Slime",
            type: "arme",
            category: "equipement", // ✅ Correct
            description: "Une dague visqueuse qui colle à vos ennemis",
            image: "assets/equipements/armes/dagueslime.png"
        },
        {
            id: "orbe_atypique_sort_niveau10",
            name: "Orbe Atypique Sort Niveau 10",
            type: "objet_special", 
            category: "equipement", // ✅ CORRECTION PRINCIPALE
            description: "Un orbe mystérieux qui dégage une énergie magique particulière.",
            image: "assets/objets/orbesatypiquesortniveau10.png"
        }
    ];
    
    coffreWindow.innerHTML = `
        <h2 style="color: #27ae60; margin-bottom: 20px;">🎁 Coffre SlimeBoss (VERSION CORRIGÉE)</h2>
        <p style="margin-bottom: 25px; color: #ecf0f1;">Choisissez votre récompense (test avec catégories corrigées) :</p>
        <div style="display: flex; justify-content: space-around; gap: 20px; margin-bottom: 25px;">
            ${objetsCorriges.map((item, index) => `
                <div class="coffre-item" data-item-index="${index}" style="
                    background: rgba(255,255,255,0.1);
                    border: 2px solid #27ae60;
                    border-radius: 10px;
                    padding: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 120px;
                " onmouseover="this.style.background='rgba(255,255,255,0.2)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                    <div style="width: 64px; height: 64px; background: #555; margin: 0 auto 10px; border-radius: 5px; display: flex; align-items: center; justify-content: center;">
                        <img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: contain;">
                    </div>
                    <div style="font-weight: bold; margin-bottom: 5px; font-size: 12px;">${item.name}</div>
                    <div style="font-size: 10px; color: #bdc3c7;">${item.description}</div>
                    <div style="font-size: 9px; color: #27ae60; margin-top: 5px;">✅ Catégorie: ${item.category}</div>
                </div>
            `).join('')}
        </div>
        <button id="fermer-coffre-test" style="
            background: linear-gradient(45deg, #e74c3c, #c0392b);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            cursor: pointer;
        ">Fermer (Test)</button>
    `;
    
    document.body.appendChild(coffreWindow);
    
    // Événements pour les objets
    const elements = coffreWindow.querySelectorAll('.coffre-item');
    elements.forEach((element, index) => {
        element.addEventListener('click', function() {
            const objetSelectionne = objetsCorriges[index];
            
            console.log('🔧 TEST: Ajout avec catégorie corrigée:', objetSelectionne.category);
            
            if (typeof window.addItemToInventory === "function") {
                // ✅ UTILISER DIRECTEMENT LA CATÉGORIE CORRIGÉE
                const resultat = window.addItemToInventory(objetSelectionne.id, objetSelectionne.category);
                if (resultat) {
                    alert(`✅ Objet "${objetSelectionne.name}" ajouté avec la catégorie corrigée: ${objetSelectionne.category}`);
                } else {
                    alert(`❌ Erreur lors de l'ajout de l'objet`);
                }
            }
            
            document.body.removeChild(coffreWindow);
        });
    });
    
    // Bouton fermer
    document.getElementById('fermer-coffre-test').addEventListener('click', function() {
        document.body.removeChild(coffreWindow);
    });
}

// ========================================
// 4. EXPORTATION DES FONCTIONS
// ========================================
if (typeof window !== 'undefined') {
    window.diagnostiquerOrbes = diagnostiquerOrbes;
    window.supprimerOrbesFantomes = supprimerOrbesFantomes;
    window.ouvrirCoffreCorrige = ouvrirCoffreCorrige;
    
    console.log('✅ Fonctions de test exportées:');
    console.log('  - diagnostiquerOrbes()');
    console.log('  - supprimerOrbesFantomes()');
    console.log('  - ouvrirCoffreCorrige()');
}

// ========================================
// 5. INSTRUCTIONS D'UTILISATION
// ========================================
console.log(`
🔧 === CORRECTION ORBES ATYPIQUES ACTIVÉE ===

🎯 SURVEILLANCE AUTOMATIQUE ACTIVÉE !
La surveillance des orbes fantômes se lance automatiquement dans 3 secondes.
Les orbes fantômes seront supprimés automatiquement toutes les 2 secondes.

COMMANDES DISPONIBLES:

1. 🔍 DIAGNOSTIC
   Tapez: diagnostiquerOrbes()
   → Analyse l'état actuel de vos orbes

2. 🔧 RÉPARATION MANUELLE (si nécessaire)
   Tapez: supprimerOrbesFantomes()
   → Supprime immédiatement les orbes fantômes

3. 🎁 TEST DU COFFRE CORRIGÉ
   Tapez: ouvrirCoffreCorrige()
   → Teste le coffre avec les catégories corrigées

CONTRÔLE DE LA SURVEILLANCE:
   ⏹️ desactiverSurveillanceAutomatique() - Arrêter la surveillance
   ▶️ activerSurveillanceAutomatique() - Redémarrer la surveillance

AUTRES OPTIONS:
   patcherSystemeDesEquipement() - Patch alternatif
   restaurerSystemeOriginal() - Retour à l'original

=== PROTECTION AUTOMATIQUE ACTIVE ===
`);

// ========================================
// 6. CORRECTION DU SYSTÈME DE DÉSÉQUIPEMENT
// ========================================
function patcherSystemeDesEquipement() {
    console.log('🔧 PATCH: Application de la correction avancée pour le déséquipement...');
    
    // Sauvegarder la fonction originale si pas déjà fait
    if (!window.addItemToInventory_ORIGINAL) {
        window.addItemToInventory_ORIGINAL = window.addItemToInventory;
        console.log('💾 Fonction originale sauvegardée');
    }
    
    // Remplacer par une version corrigée qui évite le double ajout problématique
    window.addItemToInventory = function(itemId, category) {
        console.log(`🔧 PATCH: addItemToInventory appelé pour ${itemId}, catégorie: ${category}`);
        
        // Correction spéciale pour les orbes atypiques de sort
        if (itemId === 'orbe_atypique_sort_niveau10') {
            console.log('🎯 PATCH: Détection orbe atypique de sort - traitement spécial');
            
            // Vérifier si l'orbe existe déjà dans inventoryAll
            const existeDansAll = window.inventoryAll.find(slot => 
                slot.item && slot.item.id === 'orbe_atypique_sort_niveau10'
            );
            
            if (existeDansAll) {
                console.log('✅ PATCH: Orbe déjà présent dans inventoryAll, pas de double ajout');
                // S'assurer qu'il n'y a pas de doublon dans inventoryEquipement
                window.inventoryEquipement.forEach((slot, index) => {
                    if (slot.item && slot.item.id === 'orbe_atypique_sort_niveau10') {
                        console.log(`🗑️ PATCH: Suppression doublon en inventoryEquipement[${index}]`);
                        window.inventoryEquipement[index] = { item: null, category: 'equipement' };
                    }
                });
                
                // Mettre à jour l'affichage
                if (typeof window.updateAllGrids === 'function') {
                    window.updateAllGrids();
                }
                
                return true; // Éviter le double ajout
            }
        }
        
        // Pour tous les autres cas, appeler la fonction originale
        return window.addItemToInventory_ORIGINAL(itemId, category);
    };
    
    console.log('✅ Système de déséquipement patché avec protection anti-double');
    alert('✅ Patch avancé appliqué ! Le déséquipement ne devrait plus créer d\'orbes fantômes.');
}

function restaurerSystemeOriginal() {
    console.log('🔄 RESTAURATION: Retour au système original...');
    
    if (window.addItemToInventory_ORIGINAL) {
        window.addItemToInventory = window.addItemToInventory_ORIGINAL;
        delete window.addItemToInventory_ORIGINAL;
        console.log('✅ Système original restauré');
        alert('✅ Système original restauré');
    } else {
        console.log('ℹ️ Aucun patch à supprimer');
        alert('ℹ️ Aucun patch à supprimer');
    }
}

// Exporter les nouvelles fonctions
if (typeof window !== 'undefined') {
    window.patcherSystemeDesEquipement = patcherSystemeDesEquipement;
    window.restaurerSystemeOriginal = restaurerSystemeOriginal;
}

// ========================================
// 7. SURVEILLANCE AUTOMATIQUE DES ORBES FANTÔMES
// ========================================
let surveillanceActive = false;
let intervalSurveillance = null;

function activerSurveillanceAutomatique() {
    console.log('🛡️ SURVEILLANCE: Activation de la surveillance automatique...');
    
    if (surveillanceActive) {
        console.log('ℹ️ SURVEILLANCE: Déjà active');
        alert('ℹ️ Surveillance déjà active');
        return;
    }
    
    surveillanceActive = true;
    
    // Vérifier toutes les 2 secondes s'il y a des orbes fantômes
    intervalSurveillance = setInterval(() => {
        if (!window.inventoryEquipement || !window.inventoryAll) return;
        
        let orbesFantomes = 0;
        let positionsFantomes = [];
        
        // Compter les orbes dans chaque inventaire
        const orbesEquipement = window.inventoryEquipement.filter(slot => 
            slot.item && slot.item.id === 'orbe_atypique_sort_niveau10'
        ).length;
        
        const orbesAll = window.inventoryAll.filter(slot => 
            slot.item && slot.item.id === 'orbe_atypique_sort_niveau10'
        ).length;
        
        // Si plus d'orbes dans équipement que dans All, il y a des fantômes
        if (orbesEquipement > orbesAll) {
            orbesFantomes = orbesEquipement - orbesAll;
            
            // Supprimer les orbes fantômes
            let supprimesCount = 0;
            window.inventoryEquipement.forEach((slot, index) => {
                if (slot.item && slot.item.id === 'orbe_atypique_sort_niveau10' && supprimesCount < orbesFantomes) {
                    console.log(`🗑️ SURVEILLANCE: Suppression automatique orbe fantôme en inventoryEquipement[${index}]`);
                    window.inventoryEquipement[index] = { item: null, category: 'equipement' };
                    positionsFantomes.push(index);
                    supprimesCount++;
                }
            });
            
            if (supprimesCount > 0) {
                console.log(`🛡️ SURVEILLANCE: ${supprimesCount} orbe(s) fantôme(s) supprimé(s) automatiquement`);
                
                // Mettre à jour l'affichage
                if (typeof window.updateAllGrids === 'function') {
                    window.updateAllGrids();
                }
                
                // Notification discrète (optionnelle)
                // console.log('✅ SURVEILLANCE: Orbes fantômes nettoyés automatiquement');
            }
        }
        
    }, 2000); // Vérification toutes les 2 secondes
    
    console.log('✅ SURVEILLANCE: Surveillance automatique activée (vérification toutes les 2s)');
    // Message d'activation supprimé pour discrétion
}

function desactiverSurveillanceAutomatique() {
    console.log('🔄 SURVEILLANCE: Désactivation de la surveillance automatique...');
    
    if (!surveillanceActive) {
        console.log('ℹ️ SURVEILLANCE: Déjà inactive');
        alert('ℹ️ Surveillance déjà inactive');
        return;
    }
    
    surveillanceActive = false;
    
    if (intervalSurveillance) {
        clearInterval(intervalSurveillance);
        intervalSurveillance = null;
    }
    
    console.log('✅ SURVEILLANCE: Surveillance automatique désactivée');
    alert('✅ Surveillance automatique désactivée');
}

// Exporter les nouvelles fonctions
if (typeof window !== 'undefined') {
    window.activerSurveillanceAutomatique = activerSurveillanceAutomatique;
    window.desactiverSurveillanceAutomatique = desactiverSurveillanceAutomatique;
}

// ========================================
// 8. ACTIVATION AUTOMATIQUE AU CHARGEMENT
// ========================================

// Activer automatiquement la surveillance dès le chargement (silencieux)

// Attendre que tout soit chargé puis activer la surveillance
setTimeout(() => {
    if (typeof activerSurveillanceAutomatique === 'function') {
        activerSurveillanceAutomatique();
        // Activation silencieuse pour discrétion
    }
}, 3000); // Attendre 3 secondes que tout soit bien chargé

// Auto-diagnostic au chargement (optionnel)
// Décommentez la ligne suivante pour un diagnostic automatique au démarrage
// setTimeout(() => diagnostiquerOrbes(), 5000);

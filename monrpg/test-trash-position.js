// Test du positionnement de la poubelle en bas à droite
// À exécuter dans la console du navigateur

console.log('📍 === TEST POUBELLE GRISE SOUS INVENTAIRE ===');

console.log('');
console.log('🎯 NOUVELLE CONFIGURATION :');
console.log('• Position: En bas à droite SOUS l\'inventaire');
console.log('• Couleur: Gris (au lieu de rouge)');
console.log('• Position: bottom: -80px (sous la grille)');
console.log('');
console.log('🔍 VÉRIFICATION DU POSITIONNEMENT :');

function checkTrashPosition() {
    const inventoryModal = document.getElementById('inventory-modal');
    const trashZone = document.getElementById('inventory-trash-zone');
    const trashContainer = document.getElementById('trash-container');
    const gridContainer = document.getElementById('inventory-grid-container');
    
    if (inventoryModal && inventoryModal.style.display !== 'none') {
        console.log('✅ Inventaire ouvert');
        
        if (trashZone && trashContainer) {
            console.log('✅ Éléments de poubelle trouvés');
            
            // Vérifier le positionnement CSS
            const trashZoneStyle = window.getComputedStyle(trashZone);
            const gridContainerStyle = window.getComputedStyle(gridContainer);
            
            console.log('📊 STYLES CALCULÉS :');
            console.log('   • trash-zone position:', trashZoneStyle.position);
            console.log('   • trash-zone bottom:', trashZoneStyle.bottom);
            console.log('   • trash-zone right:', trashZoneStyle.right);
            console.log('   • grid-container position:', gridContainerStyle.position);
            
            // Vérifier la position absolue par rapport à la viewport
            const rect = trashContainer.getBoundingClientRect();
            const gridRect = gridContainer.getBoundingClientRect();
            
            console.log('📍 POSITIONS RÉELLES :');
            console.log('   • Poubelle - Top:', Math.round(rect.top), 'Left:', Math.round(rect.left));
            console.log('   • Poubelle - Bottom:', Math.round(rect.bottom), 'Right:', Math.round(rect.right));
            console.log('   • Grid - Top:', Math.round(gridRect.top), 'Left:', Math.round(gridRect.left));
            console.log('   • Grid - Bottom:', Math.round(gridRect.bottom), 'Right:', Math.round(gridRect.right));
            
            // Vérifier si la poubelle est SOUS la grille à droite
            const isUnderGrid = (
                rect.top > gridRect.bottom && 
                rect.right <= gridRect.right + 50 &&
                rect.right > gridRect.right - 50
            );
            
            if (isUnderGrid) {
                console.log('✅ POUBELLE BIEN POSITIONNÉE SOUS L\'INVENTAIRE !');
                console.log('🎨 Nouveau style gris appliqué');
                console.log('🎨 Testez les effets visuels :');
                console.log('   • Survolez la poubelle (effets gris)');
                console.log('   • Glissez un objet dessus');
            } else {
                console.log('❌ Poubelle mal positionnée');
                console.log('🔍 Position actuelle:');
                console.log('   • Poubelle top:', Math.round(rect.top));
                console.log('   • Grid bottom:', Math.round(gridRect.bottom));
                console.log('   • Écart:', Math.round(rect.top - gridRect.bottom), 'px');
                console.log('💡 SOLUTIONS :');
                console.log('   • Rechargez la page');
                console.log('   • Fermez/rouvrez l\'inventaire');
            }
            
            return isUnderGrid;
        } else {
            console.log('❌ Éléments de poubelle non trouvés');
        }
    } else {
        console.log('❌ Inventaire fermé - Appuyez sur "I" pour ouvrir');
    }
    
    return false;
}

// Vérification initiale
if (!checkTrashPosition()) {
    console.log('');
    console.log('📋 POUR TESTER :');
    console.log('   1. Ouvrez l\'inventaire (touche I)');
    console.log('   2. Réexécutez ce script');
    console.log('   3. Vérifiez la position en bas à droite');
}

// Vérification périodique
let attempts = 0;
const checkInterval = setInterval(() => {
    attempts++;
    if (checkTrashPosition() || attempts > 10) {
        clearInterval(checkInterval);
    }
}, 2000);
console.log('📍 === TEST ACTIF ===');
// TEST DES OPTIMISATIONS DE PERFORMANCE
// Ce fichier permet de tester et vérifier les améliorations
// Créé le 30/07/2025 - par Cursor

console.log('🧪 Test des optimisations de performance...');

// Fonction pour tester les performances
function testPerformance() {
    console.log('📊 === TEST DES PERFORMANCES ===');
    
    // Vérifier la configuration des performances
    if (window.performanceConfig) {
        console.log('✅ Configuration des performances active');
        console.log('   - FPS actuel:', window.performanceConfig.currentFPS);
        console.log('   - FPS cible:', window.performanceConfig.targetFPS);
        console.log('   - Redessinage nécessaire:', window.performanceConfig.needsRedraw);
    } else {
        console.log('❌ Configuration des performances non trouvée');
    }
    
    // Vérifier l'optimiseur
    if (window.performanceOptimizer) {
        console.log('✅ Optimiseur de performances actif');
        const report = window.performanceOptimizer.getReport();
        console.log('   - Rapport:', report);
    } else {
        console.log('❌ Optimiseur de performances non trouvé');
    }
    
    // Vérifier le moniteur de performances
    if (window.updatePerformanceDisplay) {
        console.log('✅ Moniteur de performances actif');
    } else {
        console.log('❌ Moniteur de performances non trouvé');
    }
    
    // Test des FPS
    console.log('🎮 === TEST DES FPS ===');
    let frameCount = 0;
    let lastTime = performance.now();
    
    function countFrames() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            console.log(`   - FPS mesuré: ${fps}`);
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(countFrames);
    }
    
    // Démarrer le compteur de FPS
    requestAnimationFrame(countFrames);
    
    // Arrêter après 5 secondes
    setTimeout(() => {
        console.log('⏱️ Test des FPS terminé');
    }, 5000);
}

// Fonction pour forcer les optimisations
function forceOptimizations() {
    console.log('🚀 Forçage des optimisations...');
    
    if (window.forceEmergencyOptimizations) {
        window.forceEmergencyOptimizations();
    }
    
    if (window.performanceOptimizer) {
        window.performanceOptimizer.applyEmergencyOptimizations();
    }
    
    console.log('✅ Optimisations forcées appliquées');
}

// Fonction pour afficher le rapport complet
function showFullReport() {
    console.log('📋 === RAPPORT COMPLET ===');
    
    if (window.showPerformanceReport) {
        const report = window.showPerformanceReport();
        console.log('Rapport détaillé:', report);
    }
    
    // Informations système
    console.log('💻 Informations système:');
    console.log('   - User Agent:', navigator.userAgent);
    console.log('   - Platform:', navigator.platform);
    console.log('   - Hardware Concurrency:', navigator.hardwareConcurrency || 'Non disponible');
    console.log('   - Memory:', performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
    } : 'Non disponible');
}

// Attendre que le jeu soit chargé
function waitForGame() {
    if (window.gameState === 'playing') {
        console.log('🎮 Jeu détecté, lancement des tests...');
        
        // Attendre un peu que tout soit initialisé
        setTimeout(() => {
            testPerformance();
            
            // Tests automatiques après 10 secondes
            setTimeout(() => {
                showFullReport();
            }, 10000);
        }, 2000);
        
    } else {
        console.log('⏳ En attente du jeu...');
        setTimeout(waitForGame, 1000);
    }
}

// Commandes disponibles dans la console
window.testPerformance = testPerformance;
window.forceOptimizations = forceOptimizations;
window.showFullReport = showFullReport;

// Démarrer automatiquement
waitForGame();

console.log('💡 Commandes disponibles:');
console.log('   - testPerformance() : Tester les performances');
console.log('   - forceOptimizations() : Forcer les optimisations');
console.log('   - showFullReport() : Afficher le rapport complet');
console.log('   - Appuyez sur F3 pour afficher/masquer le moniteur de FPS');
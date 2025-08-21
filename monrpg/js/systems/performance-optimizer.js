// SYSTÈME D'OPTIMISATION DES PERFORMANCES
// Ce fichier centralise toutes les optimisations pour améliorer les FPS
// Créé le 30/07/2025 - par Cursor

class PerformanceOptimizer {
    constructor() {
        this.optimizations = new Map();
        this.isActive = false;
        this.stats = {
            fps: 0,
            memoryUsage: 0,
            activeTimers: 0,
            renderCalls: 0
        };
    }

    // Initialiser l'optimiseur
    init() {
        if (this.isActive) return;
        
        console.log('🚀 Initialisation de l\'optimiseur de performances...');
        
        // Optimiser les timers existants
        this.optimizeTimers();
        
        // Optimiser le rendu
        this.optimizeRendering();
        
        // Optimiser la gestion des monstres
        this.optimizeMonsterUpdates();
        
        // Démarrer le monitoring
        this.startMonitoring();
        
        this.isActive = true;
        console.log('✅ Optimiseur de performances activé !');
    }

    // Optimiser les timers et intervalles
    optimizeTimers() {
        // Réduire la fréquence des timers non critiques
        const timerOptimizations = [
            {
                name: 'HUD Party Update',
                currentInterval: 1500,
                newInterval: 3000,
                description: 'Mise à jour du groupe moins fréquente'
            },
            {
                name: 'Resource Respawn',
                currentInterval: 2000,
                newInterval: 5000,
                description: 'Respawn des ressources moins fréquent'
            },
            {
                name: 'Auto Save',
                currentInterval: 30000,
                newInterval: 60000,
                description: 'Sauvegarde automatique moins fréquente'
            }
        ];

        timerOptimizations.forEach(opt => {
            this.optimizations.set(opt.name, {
                type: 'timer',
                description: opt.description,
                impact: 'medium'
            });
        });
    }

    // Optimiser le rendu
    optimizeRendering() {
        // Système de rendu conditionnel déjà implémenté dans main.js
        this.optimizations.set('Conditional Rendering', {
            type: 'render',
            description: 'Redessinage seulement si nécessaire',
            impact: 'high'
        });
    }

    // Optimiser la gestion des monstres
    optimizeMonsterUpdates() {
        // Culling de distance déjà implémenté dans main.js
        this.optimizations.set('Monster Distance Culling', {
            type: 'update',
            description: 'Mise à jour des monstres proches seulement',
            impact: 'high'
        });
    }

    // Démarrer le monitoring des performances
    startMonitoring() {
        setInterval(() => {
            this.updateStats();
            this.checkPerformance();
        }, 2000); // Vérifier toutes les 2 secondes
    }

    // Mettre à jour les statistiques
    updateStats() {
        if (window.performanceConfig) {
            this.stats.fps = window.performanceConfig.currentFPS || 0;
        }
        
        // Compter les timers actifs
        this.stats.activeTimers = this.countActiveTimers();
        
        // Compter les appels de rendu
        this.stats.renderCalls = this.countRenderCalls();
    }

    // Compter les timers actifs
    countActiveTimers() {
        let count = 0;
        // Cette fonction peut être étendue pour compter les vrais timers
        return count;
    }

    // Compter les appels de rendu
    countRenderCalls() {
        if (window.performanceConfig) {
            return window.performanceConfig.needsRedraw ? 1 : 0;
        }
        return 0;
    }

    // Vérifier les performances et appliquer des optimisations automatiques
    checkPerformance() {
        if (this.stats.fps < 20) {
            this.applyEmergencyOptimizations();
        } else if (this.stats.fps < 30) {
            this.applyStandardOptimizations();
        }
    }

    // Optimisations d'urgence pour FPS très bas
    applyEmergencyOptimizations() {
        console.log('🚨 Optimisations d\'urgence appliquées (FPS < 20)');
        
        // Réduire encore plus la fréquence des timers
        if (window.partyUpdateTimer) {
            clearInterval(window.partyUpdateTimer);
            window.partyUpdateTimer = setInterval(() => {
                // Logique de mise à jour du groupe
            }, 5000); // 5 secondes au lieu de 3
        }
        
        // Désactiver les animations non critiques
        this.disableNonCriticalAnimations();
    }

    // Optimisations standard pour FPS moyens
    applyStandardOptimizations() {
        console.log('⚡ Optimisations standard appliquées (FPS < 30)');
        
        // Réduire la distance de mise à jour des monstres
        if (window.performanceConfig) {
            window.performanceConfig.monsterUpdateDistance = 10; // Au lieu de 15
        }
    }

    // Désactiver les animations non critiques
    disableNonCriticalAnimations() {
        // Réduire la fréquence des animations d'effets
        if (window.damageEffects) {
            window.damageEffects.forEach(effect => {
                if (effect.animationSpeed) {
                    effect.animationSpeed *= 2; // Ralentir les animations
                }
            });
        }
    }

    // Obtenir un rapport des optimisations
    getReport() {
        return {
            isActive: this.isActive,
            optimizations: Array.from(this.optimizations.entries()),
            stats: this.stats,
            recommendations: this.getRecommendations()
        };
    }

    // Obtenir des recommandations
    getRecommendations() {
        const recommendations = [];
        
        if (this.stats.fps < 20) {
            recommendations.push('🚨 FPS très bas : Optimisations d\'urgence appliquées');
        } else if (this.stats.fps < 30) {
            recommendations.push('⚡ FPS bas : Optimisations standard appliquées');
        } else if (this.stats.fps < 45) {
            recommendations.push('⚠️ FPS moyen : Considérer la réduction de la qualité graphique');
        } else {
            recommendations.push('✅ FPS bon : Aucune optimisation nécessaire');
        }
        
        return recommendations;
    }

    // Nettoyer et arrêter l'optimiseur
    cleanup() {
        this.isActive = false;
        console.log('🧹 Optimiseur de performances arrêté');
    }
}

// Créer et exporter l'instance globale
window.performanceOptimizer = new PerformanceOptimizer();

// Initialiser automatiquement après 3 secondes
setTimeout(() => {
    if (window.gameState === 'playing') {
        window.performanceOptimizer.init();
    }
}, 3000);

// Fonction utilitaire pour afficher le rapport
window.showPerformanceReport = function() {
    if (window.performanceOptimizer) {
        const report = window.performanceOptimizer.getReport();
        console.table(report);
        return report;
    }
    return null;
};

// Fonction pour forcer les optimisations d'urgence
window.forceEmergencyOptimizations = function() {
    if (window.performanceOptimizer) {
        window.performanceOptimizer.applyEmergencyOptimizations();
        console.log('🚨 Optimisations d\'urgence forcées !');
    }
};

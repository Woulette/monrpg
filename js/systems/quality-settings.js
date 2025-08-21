// SYSTÈME DE PARAMÈTRES DE QUALITÉ GRAPHIQUE
// Menu contextuel accessible par clic droit pour ajuster la qualité
// Créé le 30/07/2025 - par Cursor

class QualitySettings {
    constructor() {
        this.settings = {
            // QUALITÉ GÉNÉRALE
            overallQuality: 'auto', // auto, low, medium, high, ultra
            
            // RENDU
            renderDistance: 15,      // Distance de rendu des monstres (5-25)
            shadowQuality: 'medium', // none, low, medium, high
            particleEffects: 'medium', // none, low, medium, high
            animationSmoothing: 'medium', // low, medium, high
            
            // PERFORMANCE
            targetFPS: 60,           // FPS cible (20, 30, 45, 60)
            vsync: true,             // Synchronisation verticale
            frameSkip: false,        // Sauter des frames si nécessaire
            
            // CARTE
            mapDetailLevel: 'medium', // low, medium, high
            minimapUpdateRate: 1000,  // Fréquence de mise à jour (ms)
            tileCulling: true,        // Masquer les tuiles hors écran
            
            // EFFETS VISUELS
            damageNumbers: true,      // Afficher les dégâts
            screenShake: true,        // Tremblement d'écran
            weatherEffects: 'medium', // none, low, medium, high
        };
        
        this.qualityPresets = {
            'ultra-low': {
                name: 'Ultra Faible',
                description: 'Performance maximale, qualité minimale',
                settings: {
                    renderDistance: 8,
                    shadowQuality: 'none',
                    particleEffects: 'none',
                    animationSmoothing: 'low',
                    targetFPS: 20,
                    mapDetailLevel: 'low',
                    minimapUpdateRate: 2000,
                    weatherEffects: 'none'
                }
            },
            'low': {
                name: 'Faible',
                description: 'Bonnes performances, qualité basique',
                settings: {
                    renderDistance: 12,
                    shadowQuality: 'low',
                    particleEffects: 'low',
                    animationSmoothing: 'low',
                    targetFPS: 30,
                    mapDetailLevel: 'low',
                    minimapUpdateRate: 1500,
                    weatherEffects: 'low'
                }
            },
            'medium': {
                name: 'Moyenne',
                description: 'Équilibre performance/qualité',
                settings: {
                    renderDistance: 15,
                    shadowQuality: 'medium',
                    particleEffects: 'medium',
                    animationSmoothing: 'medium',
                    targetFPS: 45,
                    mapDetailLevel: 'medium',
                    minimapUpdateRate: 1000,
                    weatherEffects: 'medium'
                }
            },
            'high': {
                name: 'Élevée',
                description: 'Bonne qualité, performances correctes',
                settings: {
                    renderDistance: 20,
                    shadowQuality: 'high',
                    particleEffects: 'high',
                    animationSmoothing: 'high',
                    targetFPS: 60,
                    mapDetailLevel: 'high',
                    minimapUpdateRate: 500,
                    weatherEffects: 'high'
                }
            },
            'ultra': {
                name: 'Ultra',
                description: 'Qualité maximale, performances élevées',
                settings: {
                    renderDistance: 25,
                    shadowQuality: 'high',
                    particleEffects: 'high',
                    animationSmoothing: 'high',
                    targetFPS: 60,
                    mapDetailLevel: 'high',
                    minimapUpdateRate: 250,
                    weatherEffects: 'high'
                }
            }
        };
        
        this.init();
    }
    
    init() {
        // Charger les paramètres sauvegardés
        this.loadSettings();
        
        // Créer le menu contextuel
        this.createContextMenu();
        
        // Appliquer les paramètres
        this.applySettings();
        
        console.log('🎨 Système de qualité graphique initialisé');
    }
    
    // Créer le menu contextuel
    createContextMenu() {
        // Supprimer l'ancien menu s'il existe
        const oldMenu = document.getElementById('quality-context-menu');
        if (oldMenu) oldMenu.remove();
        
        // Créer le nouveau menu
        const menu = document.createElement('div');
        menu.id = 'quality-context-menu';
        menu.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #4a4a6a;
            border-radius: 10px;
            padding: 15px;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            display: none;
            min-width: 300px;
            backdrop-filter: blur(10px);
        `;
        
        menu.innerHTML = this.generateMenuHTML();
        document.body.appendChild(menu);
        
        // Gérer l'affichage/masquage
        this.setupContextMenuEvents(menu);
    }
    
    // Générer le HTML du menu
    generateMenuHTML() {
        return `
            <div style="margin-bottom: 15px; border-bottom: 1px solid #4a4a6a; padding-bottom: 10px;">
                <h3 style="margin: 0; color: #ffd952;">⚙️ Paramètres de Qualité</h3>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #ccc;">Ajustez la qualité selon vos performances</p>
            </div>
            
            <!-- PRÉRÉGLAGES RAPIDES -->
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #4CAF50;">🚀 Préréglages Rapides</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <button class="quality-preset-btn" data-preset="ultra-low" style="background: #d32f2f; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-size: 12px;">Ultra Faible</button>
                    <button class="quality-preset-btn" data-preset="low" style="background: #f57c00; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-size: 12px;">Faible</button>
                    <button class="quality-preset-btn" data-preset="medium" style="background: #388e3c; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-size: 12px;">Moyenne</button>
                    <button class="quality-preset-btn" data-preset="high" style="background: #1976d2; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-size: 12px;">Élevée</button>
                    <button class="quality-preset-btn" data-preset="ultra" style="background: #7b1fa2; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-size: 12px;">Ultra</button>
                </div>
            </div>
            
            <!-- PARAMÈTRES DÉTAILLÉS -->
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #4CAF50;">🔧 Paramètres Détaillés</h4>
                
                <!-- Distance de rendu -->
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px; color: #ccc;">Distance de rendu: <span id="render-distance-value">${this.settings.renderDistance}</span></label>
                    <input type="range" id="render-distance-slider" min="5" max="25" value="${this.settings.renderDistance}" style="width: 100%;">
                </div>
                
                <!-- FPS cible -->
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px; color: #ccc;">FPS cible: <span id="target-fps-value">${this.settings.targetFPS}</span></label>
                    <select id="target-fps-select" style="width: 100%; padding: 5px; background: #333; color: white; border: 1px solid #555; border-radius: 3px;">
                        <option value="20" ${this.settings.targetFPS === 20 ? 'selected' : ''}>20 FPS (Performance)</option>
                        <option value="30" ${this.settings.targetFPS === 30 ? 'selected' : ''}>30 FPS (Équilibré)</option>
                        <option value="45" ${this.settings.targetFPS === 45 ? 'selected' : ''}>45 FPS (Fluide)</option>
                        <option value="60" ${this.settings.targetFPS === 60 ? 'selected' : ''}>60 FPS (Ultra fluide)</option>
                    </select>
                </div>
                
                <!-- Qualité des ombres -->
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px; color: #ccc;">Qualité des ombres:</label>
                    <select id="shadow-quality-select" style="width: 100%; padding: 5px; background: #333; color: white; border: 1px solid #555; border-radius: 3px;">
                        <option value="none" ${this.settings.shadowQuality === 'none' ? 'selected' : ''}>Aucune</option>
                        <option value="low" ${this.settings.shadowQuality === 'low' ? 'selected' : ''}>Faible</option>
                        <option value="medium" ${this.settings.shadowQuality === 'medium' ? 'selected' : ''}>Moyenne</option>
                        <option value="high" ${this.settings.shadowQuality === 'high' ? 'selected' : ''}>Élevée</option>
                    </select>
                </div>
                
                <!-- Effets de particules -->
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px; color: #ccc;">Effets de particules:</label>
                    <select id="particle-effects-select" style="width: 100%; padding: 5px; background: #333; color: white; border: 1px solid #555; border-radius: 3px;">
                        <option value="none" ${this.settings.particleEffects === 'none' ? 'selected' : ''}>Aucun</option>
                        <option value="low" ${this.settings.particleEffects === 'low' ? 'selected' : ''}>Faible</option>
                        <option value="medium" ${this.settings.particleEffects === 'medium' ? 'selected' : ''}>Moyen</option>
                        <option value="high" ${this.settings.particleEffects === 'high' ? 'selected' : ''}>Élevé</option>
                    </select>
                </div>
            </div>
            
            <!-- BOUTONS D'ACTION -->
            <div style="display: flex; gap: 10px; justify-content: space-between;">
                <button id="apply-quality-settings" style="background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; flex: 1;">Appliquer</button>
                <button id="reset-quality-settings" style="background: #f44336; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; flex: 1;">Réinitialiser</button>
                <button id="close-quality-menu" style="background: #666; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; flex: 1;">Fermer</button>
            </div>
            
            <!-- STATUT ACTUEL -->
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #4a4a6a; font-size: 12px; color: #ccc;">
                <div>FPS actuel: <span id="current-fps-display">--</span></div>
                <div>Qualité: <span id="current-quality-display">${this.settings.overallQuality}</span></div>
            </div>
        `;
    }
    
    // Configurer les événements du menu
    setupContextMenuEvents(menu) {
        // Clic droit pour afficher le menu UNIQUEMENT sur le canvas du jeu
        document.addEventListener('contextmenu', (e) => {
            // Vérifier si le clic est sur le canvas du jeu
            const gameCanvas = document.getElementById('gameCanvas');
            if (!gameCanvas || !gameCanvas.contains(e.target)) {
                return; // Pas sur le canvas → pas de menu
            }
            
            // Vérifier que le clic n'est PAS sur une interface ouverte
            const clickedElement = e.target;
            const isOnInterface = clickedElement.closest('#inventory-modal') ||
                                 clickedElement.closest('#stats-modal') ||
                                 clickedElement.closest('#sort-modal') ||
                                 clickedElement.closest('#quests-main-modal') ||
                                 clickedElement.closest('#map-modal');
            
            if (isOnInterface) {
                return; // Clic sur une interface → pas de menu
            }
            
            // Tout est bon → afficher le menu
            e.preventDefault();
            this.showMenu(e.clientX, e.clientY);
        });
        
        // Clic gauche pour masquer le menu
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target)) {
                this.hideMenu();
            }
        });
        
        // Échap pour masquer le menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideMenu();
            }
        });
        
        // Gérer les interactions du menu
        this.setupMenuInteractions(menu);
    }
    
    // Configurer les interactions du menu
    setupMenuInteractions(menu) {
        // Préréglages
        menu.querySelectorAll('.quality-preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.applyPreset(preset);
            });
        });
        
        // Slider distance de rendu
        const renderSlider = menu.querySelector('#render-distance-slider');
        const renderValue = menu.querySelector('#render-distance-value');
        if (renderSlider && renderValue) {
            renderSlider.addEventListener('input', (e) => {
                renderValue.textContent = e.target.value;
            });
        }
        
        // Sélecteur FPS
        const fpsSelect = menu.querySelector('#target-fps-select');
        if (fpsSelect) {
            fpsSelect.addEventListener('change', (e) => {
                this.settings.targetFPS = parseInt(e.target.value);
            });
        }
        
        // Sélecteur ombres
        const shadowSelect = menu.querySelector('#shadow-quality-select');
        if (shadowSelect) {
            shadowSelect.addEventListener('change', (e) => {
                this.settings.shadowQuality = e.target.value;
            });
        }
        
        // Sélecteur particules
        const particleSelect = menu.querySelector('#particle-effects-select');
        if (particleSelect) {
            particleSelect.addEventListener('change', (e) => {
                this.settings.particleEffects = e.target.value;
            });
        }
        
        // Bouton appliquer
        const applyBtn = menu.querySelector('#apply-quality-settings');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applySettings();
                this.saveSettings();
                this.hideMenu();
            });
        }
        
        // Bouton réinitialiser
        const resetBtn = menu.querySelector('#reset-quality-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetToDefault();
            });
        }
        
        // Bouton fermer
        const closeBtn = menu.querySelector('#close-quality-menu');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideMenu();
            });
        }
    }
    
    // Afficher le menu
    showMenu(x, y) {
        const menu = document.getElementById('quality-context-menu');
        if (!menu) return;
        
        // Positionner le menu
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        menu.style.display = 'block';
        
        // Mettre à jour les valeurs affichées
        this.updateMenuDisplay();
    }
    
    // Masquer le menu
    hideMenu() {
        const menu = document.getElementById('quality-context-menu');
        if (menu) {
            menu.style.display = 'none';
        }
    }
    
    // Mettre à jour l'affichage du menu
    updateMenuDisplay() {
        // Mettre à jour les valeurs des contrôles
        const renderSlider = document.getElementById('render-distance-slider');
        const renderValue = document.getElementById('render-distance-value');
        if (renderSlider && renderValue) {
            renderSlider.value = this.settings.renderDistance;
            renderValue.textContent = this.settings.renderDistance;
        }
        
        // Mettre à jour le FPS actuel
        const currentFpsDisplay = document.getElementById('current-fps-display');
        if (currentFpsDisplay && window.performanceConfig) {
            currentFpsDisplay.textContent = window.performanceConfig.currentFPS || '--';
        }
        
        // Mettre à jour la qualité actuelle
        const currentQualityDisplay = document.getElementById('current-quality-display');
        if (currentQualityDisplay) {
            currentQualityDisplay.textContent = this.settings.overallQuality;
        }
    }
    
    // Appliquer un préréglage
    applyPreset(presetName) {
        const preset = this.qualityPresets[presetName];
        if (!preset) return;
        
        // Appliquer les paramètres du préréglage
        Object.assign(this.settings, preset.settings);
        this.settings.overallQuality = presetName;
        
        // Appliquer immédiatement
        this.applySettings();
        this.saveSettings();
        
        // Mettre à jour l'affichage
        this.updateMenuDisplay();
        
        console.log(`🎨 Préréglage "${preset.name}" appliqué`);
    }
    
    // Appliquer les paramètres
    applySettings() {
        // Appliquer la distance de rendu
        if (window.performanceConfig) {
            window.performanceConfig.monsterUpdateDistance = this.settings.renderDistance;
        }
        
        // Appliquer le FPS cible
        if (window.performanceConfig) {
            window.performanceConfig.targetFPS = this.settings.targetFPS;
            window.performanceConfig.redrawInterval = Math.max(16, 1000 / this.settings.targetFPS);
        }
        
        // Appliquer les paramètres de rendu
        this.applyRenderSettings();
        
        // Appliquer les paramètres de carte
        this.applyMapSettings();
        
        console.log('🎨 Paramètres de qualité appliqués');
    }
    
    // Appliquer les paramètres de rendu
    applyRenderSettings() {
        // Gérer les ombres
        if (this.settings.shadowQuality === 'none') {
            document.body.style.setProperty('--shadow-opacity', '0');
        } else if (this.settings.shadowQuality === 'low') {
            document.body.style.setProperty('--shadow-opacity', '0.3');
        } else if (this.settings.shadowQuality === 'medium') {
            document.body.style.setProperty('--shadow-opacity', '0.6');
        } else if (this.settings.shadowQuality === 'high') {
            document.body.style.setProperty('--shadow-opacity', '1');
        }
        
        // Gérer les effets de particules
        if (window.damageEffects) {
            window.damageEffects.forEach(effect => {
                if (this.settings.particleEffects === 'none') {
                    effect.visible = false;
                } else if (this.settings.particleEffects === 'low') {
                    effect.visible = true;
                    effect.particleCount = Math.floor(effect.particleCount * 0.3);
                } else if (this.settings.particleEffects === 'medium') {
                    effect.visible = true;
                    effect.particleCount = Math.floor(effect.particleCount * 0.7);
                } else if (this.settings.particleEffects === 'high') {
                    effect.visible = true;
                    effect.particleCount = effect.particleCount;
                }
            });
        }
    }
    
    // Appliquer les paramètres de carte
    applyMapSettings() {
        // Ajuster la fréquence de mise à jour de la minimap
        if (window.worldMapSystem && window.worldMapSystem.minimap) {
            window.worldMapSystem.minimap.updateInterval = this.settings.minimapUpdateRate;
        }
        
        // Ajuster le niveau de détail de la carte
        if (window.mapData) {
            // Implémenter la logique de réduction de détail selon mapDetailLevel
            console.log('🗺️ Niveau de détail de la carte ajusté:', this.settings.mapDetailLevel);
        }
    }
    
    // Réinitialiser aux valeurs par défaut
    resetToDefault() {
        this.settings = {
            overallQuality: 'auto',
            renderDistance: 15,
            shadowQuality: 'medium',
            particleEffects: 'medium',
            animationSmoothing: 'medium',
            targetFPS: 60,
            vsync: true,
            frameSkip: false,
            mapDetailLevel: 'medium',
            minimapUpdateRate: 1000,
            tileCulling: true,
            damageNumbers: true,
            screenShake: true,
            weatherEffects: 'medium'
        };
        
        this.applySettings();
        this.saveSettings();
        this.updateMenuDisplay();
        
        console.log('🔄 Paramètres réinitialisés aux valeurs par défaut');
    }
    
    // Sauvegarder les paramètres
    saveSettings() {
        try {
            localStorage.setItem('monrpg_quality_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('⚠️ Impossible de sauvegarder les paramètres de qualité');
        }
    }
    
    // Charger les paramètres
    loadSettings() {
        try {
            const saved = localStorage.getItem('monrpg_quality_settings');
            if (saved) {
                const loaded = JSON.parse(saved);
                Object.assign(this.settings, loaded);
            }
        } catch (e) {
            console.warn('⚠️ Impossible de charger les paramètres de qualité');
        }
    }
    
    // Obtenir un paramètre
    getSetting(key) {
        return this.settings[key];
    }
    
    // Définir un paramètre
    setSetting(key, value) {
        this.settings[key] = value;
        this.applySettings();
        this.saveSettings();
    }
}

// Créer et exporter l'instance globale
window.qualitySettings = new QualitySettings();

// Fonction utilitaire pour ouvrir le menu manuellement
window.openQualityMenu = function() {
    if (window.qualitySettings) {
        window.qualitySettings.showMenu(100, 100);
    }
};

// Raccourci clavier Alt+Q pour ouvrir le menu
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'q') {
        e.preventDefault();
        window.openQualityMenu();
    }
});

console.log('💡 Menu de qualité accessible par:');
console.log('   - Clic droit sur l\'écran');
console.log('   - Alt+Q');
console.log('   - window.openQualityMenu()');

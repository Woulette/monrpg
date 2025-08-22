// =======================
// SYSTÈME DE CHANGEMENT DE CLASSE
// =======================
// Gère l'affichage et le changement de classe du joueur

// =======================
// PANNEAU DES INFORMATIONS DE CLASSE
// =======================
function showClassPanel() {
    if (!window.player) {
        console.error('❌ Joueur non trouvé pour afficher le panneau de classe');
        return;
    }

    // Créer le panneau s'il n'existe pas
    let classPanel = document.getElementById('class-panel');
    if (!classPanel) {
        classPanel = document.createElement('div');
        classPanel.id = 'class-panel';
        classPanel.className = 'class-panel';
        document.body.appendChild(classPanel);
    }

    // Déterminer la classe actuelle
    const currentClass = window.player.class || 'aventurier';

    // Classes disponibles (toujours débloquées)
    const availableClasses = [
        { id: 'aventurier', name: 'Aventurier', icon: '🏃', description: 'Classe de base polyvalente' },
        { id: 'mage', name: 'Mage', icon: '🧙‍♂️', description: 'Classe magique à distance' }
    ];

    // Contenu du panneau avec interface en 2 colonnes
    const panelContent = `
        <div class="class-panel-header">
            <h3>🎭 Sélection de Classe</h3>
            <button class="class-panel-close" onclick="closeClassPanel()">✕</button>
        </div>
        <div class="class-panel-content">
            <div class="class-panel-layout">
                <!-- Colonne gauche : Liste des classes -->
                <div class="class-list-column">
                    <h4>Classes disponibles :</h4>
                    <div class="class-list">
                        ${availableClasses.map(cls => `
                            <div class="class-list-item ${cls.id === currentClass ? 'selected' : ''}" 
                                 onclick="selectClassForDetails('${cls.id}')">
                                <div class="class-list-icon">${cls.icon}</div>
                                <div class="class-list-info">
                                    <h5>${cls.name}</h5>
                                    <p>${cls.description}</p>
                                </div>
                                ${cls.id === currentClass ? '<span class="current-indicator">✓</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Colonne droite : Détails de la classe sélectionnée -->
                <div class="class-details-column">
                    <div id="class-details-content">
                        <div class="class-details-placeholder">
                            <h4>👆 Sélectionne une classe à gauche</h4>
                            <p>Clique sur une classe pour voir ses détails</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    classPanel.innerHTML = panelContent;
    classPanel.style.display = 'block';

    // Sélectionner automatiquement la classe actuelle
    selectClassForDetails(currentClass);

    console.log(`🎭 Panneau de sélection de classe affiché. Classe actuelle: ${currentClass}`);
}

// Fonction pour sélectionner une classe et afficher ses détails
function selectClassForDetails(classId) {
    if (!window.player) return;

    // Mettre à jour la sélection visuelle
    document.querySelectorAll('.class-list-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    const selectedItem = document.querySelector(`[onclick="selectClassForDetails('${classId}')"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }

    // Afficher les détails de la classe
    const detailsContent = document.getElementById('class-details-content');
    if (!detailsContent) return;

    const currentClass = window.player.class || 'aventurier';
    const isCurrentClass = classId === currentClass;

    const detailsHTML = `
        <div class="class-details-header">
            <h4>${getClassName(classId)}</h4>
            ${isCurrentClass ? '<span class="current-class-badge">Classe actuelle</span>' : ''}
        </div>
        
        <div class="class-details-body">
            ${getClassDetails(classId)}
        </div>
        
        ${!isCurrentClass ? `
            <div class="class-details-actions">
                <button class="select-class-btn" onclick="changeToClass('${classId}')">
                    Choisir ${getClassName(classId)}
                </button>
            </div>
        ` : `
            <div class="class-details-actions">
                <div class="current-class-indicator">✓ Classe active</div>
            </div>
        `}
    `;

    detailsContent.innerHTML = detailsHTML;
}

// Fonction pour obtenir le nom affiché d'une classe
function getClassName(classId) {
    switch (classId) {
        case 'aventurier': return 'Aventurier';
        case 'mage': return 'Mage';
        default: return classId;
    }
}

// Fonction pour obtenir les détails d'une classe spécifique
function getClassDetails(classId) {
    switch (classId) {
        case 'aventurier':
            return `
                <div class="class-info">
                    <p><strong>Classe de base</strong></p>
                    <p>Aucun bonus spécial</p>
                    <p>Aucun malus</p>
                </div>
                <div class="class-spells">
                    <h6>Sorts disponibles :</h6>
                    <ul>
                        <li>👊 Coup de poing</li>
                        <li>💥 Coup de poing explosif</li>
                        <li>⚡ Triple Coup de Poing</li>
                        <li>💚 Poingheal</li>
                        <li>👥 Rassemblement</li>
                    </ul>
                </div>
            `;
        case 'mage':
            return `
                <div class="class-info">
                    <p><strong>Classe spécialisée</strong></p>
                    <p>Sorts à distance</p>
                    <p>Dégâts magiques</p>
                </div>
                <div class="class-spells">
                    <h6>Sorts disponibles :</h6>
                    <ul>
                        <li>🔥 Boule de feu (portée: 7 cases)</li>
                    </ul>
                </div>
                <div class="class-stats">
                    <h6>Bonus de classe :</h6>
                    <p>Dégâts magiques basés sur l'Intelligence</p>
                </div>
            `;
        default:
            return '<p>Classe inconnue</p>';
    }
}

// Fonction pour changer de classe
function changeToClass(newClass) {
    if (!window.player) {
        console.error('❌ Joueur non trouvé pour changer de classe');
        return;
    }

    if (window.player.class === newClass) {
        console.log(`🎭 Le joueur est déjà ${newClass}`);
        return;
    }

    console.log(`🎭 Changement de classe: ${window.player.class} → ${newClass}`);

    // Fermer le panneau d'abord
    closeClassPanel();

    // Démarrer la transition avec barre de progression
    startClassChangeTransition(newClass);
}

// Fonction pour démarrer la transition de changement de classe
function startClassChangeTransition(newClass) {
    // Créer la barre de progression si elle n'existe pas
    let progressContainer = document.getElementById('class-change-progress');
    if (!progressContainer) {
        progressContainer = document.createElement('div');
        progressContainer.id = 'class-change-progress';
        progressContainer.className = 'class-change-progress';
        progressContainer.innerHTML = '<div class="class-change-progress-bar"></div>';
        document.body.appendChild(progressContainer);
    }
    
    // La barre est maintenant positionnée en CSS (haut à gauche)
    // Plus besoin de calculer la position en JavaScript

    // Afficher la barre de progression
    progressContainer.style.display = 'block';
    
    // Récupérer la barre de progression
    const progressBar = progressContainer.querySelector('.class-change-progress-bar');
    
    // Mémoriser la position initiale du joueur
    const initialPlayerX = window.player.x;
    const initialPlayerY = window.player.y;
    
    // Démarrer l'animation de progression
    let progress = 0;
    const duration = 5000; // 5 secondes
    const interval = 50; // Mise à jour toutes les 50ms pour fluidité
    const increment = (interval / duration) * 100;

    const progressInterval = setInterval(() => {
        // Vérifier si le joueur a bougé
        if (window.player.x !== initialPlayerX || window.player.y !== initialPlayerY) {
            clearInterval(progressInterval);
            cancelClassChange(progressContainer, progressBar);
            return;
        }
        
        progress += increment;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Animation terminée, changer la classe
            completeClassChange(newClass);
        }
        
        progressBar.style.width = progress + '%';
    }, interval);

    console.log(`🎭 Transition de changement de classe démarrée (5 secondes)`);
}

// Fonction pour annuler le changement de classe
function cancelClassChange(progressContainer, progressBar) {
    console.log(`❌ Changement de classe annulé - Le joueur a bougé`);
    
    // Vider la barre de progression
    progressBar.style.width = '0%';
    
    // Afficher un message d'annulation
    if (typeof window.displayNotification === 'function') {
        window.displayNotification(`❌ Changement de classe annulé - Vous avez bougé !`, 'error');
    }
    
    // Fermer la barre de progression avec animation
    progressContainer.classList.add('fade-out');
    
    // Supprimer la barre après l'animation de disparition
    setTimeout(() => {
        progressContainer.style.display = 'none';
        progressContainer.classList.remove('fade-out');
    }, 500);
}

// Fonction pour finaliser le changement de classe
function completeClassChange(newClass) {
    console.log(`🎭 Finalisation du changement de classe vers ${newClass}`);

    // Changer la classe
    window.player.class = newClass;

    // Mettre à jour l'apparence du joueur
    if (window.playerAppearanceManager) {
        window.playerAppearanceManager.forceUpdate();
    }

    // Mettre à jour l'affichage des sorts
    if (window.classSpellManager) {
        window.classSpellManager.forceUpdate();
    }

    // Sauvegarder le changement
    if (typeof window.autoSaveOnEvent === 'function') {
        window.autoSaveOnEvent();
    } else if (typeof window.savePlayerData === 'function') {
        window.savePlayerData();
    }

    // Fermer la barre de progression avec animation
    const progressContainer = document.getElementById('class-change-progress');
    if (progressContainer) {
        progressContainer.classList.add('fade-out');
        
        // Supprimer la barre après l'animation de disparition
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressContainer.classList.remove('fade-out');
        }, 500);
    }

    // Afficher un message de confirmation
    const className = newClass === 'aventurier' ? 'Aventurier' : 
                     newClass === 'mage' ? 'Mage' : newClass;
    
    console.log(`✅ Changement de classe réussi vers ${className}`);
    
    // Optionnel : Afficher une notification à l'écran
    if (typeof window.displayNotification === 'function') {
        window.displayNotification(`🎭 Classe changée vers ${className} !`, 'success');
    }
}

// Fonction pour fermer le panneau de classe
function closeClassPanel() {
    const classPanel = document.getElementById('class-panel');
    if (classPanel) {
        classPanel.style.display = 'none';
        console.log('🎭 Panneau de classe fermé');
    }
}

// =======================
// INITIALISATION
// =======================
function initClassChangeSystem() {
    console.log('🎭 Système de changement de classe initialisé');
}

// Initialisation automatique
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClassChangeSystem);
} else {
    initClassChangeSystem();
}

// =======================
// EXPORTS GLOBAUX
// =======================
window.showClassPanel = showClassPanel;
window.closeClassPanel = closeClassPanel;
window.changeToClass = changeToClass;
window.selectClassForDetails = selectClassForDetails;
window.startClassChangeTransition = startClassChangeTransition;
window.completeClassChange = completeClassChange;
window.cancelClassChange = cancelClassChange;
window.initClassChangeSystem = initClassChangeSystem;

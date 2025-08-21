// Fonction pour mettre à jour l'affichage des stats
function updateStatsDisplay() {
    if (typeof player === 'undefined') return;
    
    const stats = ['force', 'intelligence', 'agilite', 'defense', 'chance'];
    stats.forEach(stat => {
        // Mettre à jour la valeur totale
        const valueElement = document.getElementById(`stat-${stat}`);
        if (valueElement && player[stat] !== undefined) {
            valueElement.textContent = player[stat];
        }
        
        // Mettre à jour la barre d'XP et afficher la décomposition (sauf pour chance)
        if (stat !== 'chance') {
            const xpElement = document.getElementById(`stat-${stat}-xp`);
            const xpTextElement = document.getElementById(`stat-${stat}-xp-text`);
            
            if (xpElement && xpTextElement) {
                const currentXP = player[stat + 'Xp'] || 0;
                const xpToNext = player[stat + 'XpToNext'] || 10;
                const ratio = currentXP / xpToNext;
                
                xpElement.style.width = (ratio * 100) + '%';
                
                // Afficher la décomposition des stats
                const baseStatName = 'base' + stat.charAt(0).toUpperCase() + stat.slice(1);
                const combatStatName = 'combat' + stat.charAt(0).toUpperCase() + stat.slice(1);
                const baseValue = player[baseStatName] || 0;
                const combatValue = player[combatStatName] || 0;
                const equipValue = player[stat] - baseValue - combatValue;
                
                let statBreakdown = `Base: ${baseValue}`;
                if (combatValue > 0) statBreakdown += ` | Combat: ${combatValue}`;
                if (equipValue > 0) statBreakdown += ` | Équip: ${equipValue}`;
                
                xpTextElement.textContent = statBreakdown;
            }
        }
    });
}

// Fonction pour animer une stat qui monte
function animateStatLevelUp(statName) {
    const statElement = document.querySelector(`[data-stat="${statName}"]`);
    if (statElement) {
        statElement.classList.add('level-up');
        setTimeout(() => {
            statElement.classList.remove('level-up');
        }, 600);
    }
}

// Fonction pour mettre à jour l'affichage des statistiques dans la fenêtre modale
function updateStatsModalDisplay() {
    if (!player) return;

    // Mise à jour du niveau du joueur
    const playerLevelElement = document.getElementById("player-level");
    const playerXpFillElement = document.getElementById("player-xp-fill");
    const playerXpTextElement = document.getElementById("player-xp-text");
    const statPointsElement = document.getElementById("stat-points-value");

    if (playerLevelElement) playerLevelElement.textContent = player.level;
    if (statPointsElement) statPointsElement.textContent = player.statPoints;
    
    const xpForNextLevel = player.xpToNextLevel;
    const xpProgress = (player.xp / xpForNextLevel) * 100;
    
    if (playerXpFillElement) playerXpFillElement.style.width = xpProgress + "%";
    if (playerXpTextElement) playerXpTextElement.textContent = `${player.xp}/${xpForNextLevel}`;

    // Mise à jour des statistiques individuelles
    const stats = ['force', 'intelligence', 'agilite', 'defense', 'chance', 'vitesse', 'vie'];
    
    stats.forEach(stat => {
        const valueElement = document.getElementById(`stat-${stat}-modal`);
        const xpFillElement = document.getElementById(`stat-${stat}-xp-modal`);
        const xpTextElement = document.getElementById(`stat-${stat}-xp-text-modal`);
        const minusBtn = document.querySelector(`[data-stat="${stat}"].stat-minus`);
        const plusBtn = document.querySelector(`[data-stat="${stat}"].stat-plus`);
        
        // Afficher la stat totale
        if (valueElement) valueElement.textContent = player[stat];
        
        // Gestion des boutons - seulement pour les stats modulables (base)
        if (stat !== 'chance' && stat !== 'vitesse' && stat !== 'vie') {
            const baseStatName = 'base' + stat.charAt(0).toUpperCase() + stat.slice(1);
            const combatStatName = 'combat' + stat.charAt(0).toUpperCase() + stat.slice(1);
            
            // Les boutons ne peuvent modifier que les stats de base
            if (minusBtn) minusBtn.disabled = player[baseStatName] <= 1;
            if (plusBtn) plusBtn.disabled = player.statPoints <= 0;
            
            // Afficher la décomposition des stats
            if (xpTextElement) {
                const baseValue = player[baseStatName] || 0;
                const combatValue = player[combatStatName] || 0;
                const equipValue = player[stat] - baseValue - combatValue;
                
                let statBreakdown = `Base: ${baseValue}`;
                if (combatValue > 0) statBreakdown += ` | Combat: ${combatValue}`;
                if (equipValue > 0) statBreakdown += ` | Équip: ${equipValue}`;
                
                xpTextElement.textContent = statBreakdown;
            }
        } else {
            // Pour chance, vitesse, vie - pas de modification
            if (minusBtn) minusBtn.disabled = true;
            if (plusBtn) plusBtn.disabled = true;
            
            if (xpTextElement) {
                if (stat === 'chance') xpTextElement.textContent = "Équipement";
                else if (stat === 'vitesse') xpTextElement.textContent = "Caractéristiques";
                else if (stat === 'vie') xpTextElement.textContent = "Vie";
            }
        }
        
        if (stat === 'chance' || stat === 'vitesse' || stat === 'vie') {
            if (xpTextElement) xpTextElement.textContent = stat === 'chance' ? "Équipement" : stat === 'vitesse' ? "Caractéristiques" : "Vie";
            if (xpFillElement) xpFillElement.style.width = "0%";
        } else {
            const statXp = player[`${stat}Xp`] || 0;
            const xpToNext = player[`${stat}XpToNext`] || 10;
            const statXpProgress = (statXp / xpToNext) * 100;
            
            if (xpFillElement) xpFillElement.style.width = statXpProgress + "%";
            if (xpTextElement) xpTextElement.textContent = `${statXp}/${xpToNext}`;
        }
    });
}

// Fonction pour mettre à jour l'affichage des Pecka
function updatePeckaDisplay() {
    if (typeof player === 'undefined') return;
    
    const peckaElement = document.getElementById('pecka-amount');
    if (peckaElement && player.pecka !== undefined) {
        peckaElement.textContent = player.pecka;
    }
}

// Fonctions globales pour être appelées depuis player.js
window.updateStatsDisplay = updateStatsDisplay;
window.animateStatLevelUp = animateStatLevelUp;
window.updateStatsModalDisplay = updateStatsModalDisplay;
window.updatePeckaDisplay = updatePeckaDisplay; 
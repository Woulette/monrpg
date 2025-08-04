// Fonction pour recalculer les stats totales
function recalculateTotalStats() {
    // Stats totales = Base (modulables) + Combat (permanentes) + Équipement
    player.force = player.baseForce + player.combatForce + player.equipForce;
    player.intelligence = player.baseIntelligence + player.combatIntelligence + player.equipIntelligence;
    player.agilite = player.baseAgilite + player.combatAgilite + player.equipAgilite;
    player.defense = player.baseDefense + player.combatDefense + player.equipDefense;
    player.chance = player.baseChance + player.combatChance + player.equipChance;
    player.vitesse = player.baseVitesse + player.combatVitesse + player.equipVitesse;
    player.vie = player.baseVie + player.combatVie + player.equipVie;
}

// Rendre la fonction accessible globalement
window.recalculateTotalStats = recalculateTotalStats;

// Fonctions pour l'augmentation des stats
function gainStatXP(statName, amount) {
    const xpProp = statName + 'Xp';
    const xpToNextProp = statName + 'XpToNext';
    
    if (player[xpProp] !== undefined) {
        player[xpProp] += amount;
        
        // Vérifier si la stat monte
        while (player[xpProp] >= player[xpToNextProp]) {
            player[xpProp] -= player[xpToNextProp];
            // Modifier la stat de combat (permanente, non modulable)
            const combatStatName = 'combat' + statName.charAt(0).toUpperCase() + statName.slice(1);
            player[combatStatName]++;
            
            // Recalculer les stats totales
            recalculateTotalStats();
            
            // Augmenter l'XP nécessaire pour le prochain niveau (courbe exponentielle)
            player[xpToNextProp] = Math.floor(player[xpToNextProp] * 1.2);
            
            // Mettre à jour l'affichage et animer
            if (typeof updateStatsDisplay === "function") {
                updateStatsDisplay();
            }
            if (typeof updateStatsModalDisplay === "function") {
                updateStatsModalDisplay();
            }
            if (typeof animateStatLevelUp === "function") {
                animateStatLevelUp(statName);
            }
        }
        
        // Mettre à jour l'affichage même si pas de level up
        if (typeof updateStatsDisplay === "function") {
            updateStatsDisplay();
        }
        if (typeof updateStatsModalDisplay === "function") {
            updateStatsModalDisplay();
        }
    }
}

function gainXP(amount) {
    player.xp += amount;
    while (player.xp >= player.xpToNextLevel) {
        player.xp -= player.xpToNextLevel;
        player.level++;
        player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.2); // courbe exponentielle
        
        // Augmenter les points de vie max de 5 à chaque niveau
        player.maxLife += 5;
        // Restaurer complètement la vie lors du level up
        player.life = player.maxLife;
        
        // Ajouter 3 points de caractéristiques à distribuer
        player.statPoints += 3;
        
        // Afficher le message flottant de niveau
        if (typeof showLevelUp === 'function') {
            showLevelUp(player.level, 3);
        }
        
        // Mettre à jour l'affichage des stats si la fenêtre est ouverte
        if (typeof updateStatsModalDisplay === 'function') {
            updateStatsModalDisplay();
        }
        
        // Sauvegarde automatique lors du level up
        if (typeof autoSaveOnEvent === 'function') {
            autoSaveOnEvent();
        }
        
        // Mettre à jour le déverrouillage des sorts
        if (typeof updateSpellUnlockStatus === 'function') {
            updateSpellUnlockStatus();
        }
    }
    
    // Sauvegarde automatique lors du gain d'XP
    if (typeof autoSaveOnEvent === 'function') {
        autoSaveOnEvent();
    }
}

// Export global des fonctions
window.gainXP = gainXP;
window.gainStatXP = gainStatXP; 
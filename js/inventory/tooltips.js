// Fonctions pour les tooltips d'équipement
function showEquipmentTooltip(item, element) {
    // Supprimer l'ancien tooltip s'il existe
    hideEquipmentTooltip();
    
    // Créer le tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'equipment-tooltip';
    tooltip.id = 'equipment-tooltip';
    
    // Contenu du tooltip
    let tooltipContent = `
        <div class="item-name">${item.name}</div>
        <div class="item-description">${item.description}</div>
    `;
    
    // Ajouter les stats si elles existent
    if (item.stats) {
        tooltipContent += '<div class="item-stats">';
        if (item.stats.force) tooltipContent += `<div class="stat-line"><span class="stat-name">Force:</span><span class="stat-value">+${item.stats.force}</span></div>`;
        if (item.stats.intelligence) tooltipContent += `<div class="stat-line"><span class="stat-name">Intelligence:</span><span class="stat-value">+${item.stats.intelligence}</span></div>`;
        if (item.stats.agilite) tooltipContent += `<div class="stat-line"><span class="stat-name">Agilité:</span><span class="stat-value">+${item.stats.agilite}</span></div>`;
        if (item.stats.defense) tooltipContent += `<div class="stat-line"><span class="stat-name">Défense:</span><span class="stat-value">+${item.stats.defense}</span></div>`;
        if (item.stats.vie) tooltipContent += `<div class="stat-line"><span class="stat-name">Vie:</span><span class="stat-value">+${item.stats.vie}</span></div>`;
        if (item.stats.chance) tooltipContent += `<div class="stat-line"><span class="stat-name">Chance:</span><span class="stat-value">+${item.stats.chance}</span></div>`;
        if (item.stats.vitesse) tooltipContent += `<div class="stat-line"><span class="stat-name">Vitesse:</span><span class="stat-value">+${item.stats.vitesse}</span></div>`;
        tooltipContent += '</div>';
    }
    
    tooltipContent += `<div class="item-type">${item.type.toUpperCase()}</div>`;
    
    tooltip.innerHTML = tooltipContent;
    
    // Ajouter au body
    document.body.appendChild(tooltip);
    
    // Positionner le tooltip
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left = rect.right + 10;
    let top = rect.top;
    
    // Ajuster si le tooltip dépasse à droite
    if (left + tooltipRect.width > window.innerWidth) {
        left = rect.left - tooltipRect.width - 10;
    }
    
    // Ajuster si le tooltip dépasse en bas
    if (top + tooltipRect.height > window.innerHeight) {
        top = window.innerHeight - tooltipRect.height - 10;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

function hideEquipmentTooltip() {
    const tooltip = document.getElementById('equipment-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Exporter les fonctions
window.showEquipmentTooltip = showEquipmentTooltip;
window.hideEquipmentTooltip = hideEquipmentTooltip; 
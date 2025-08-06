// Système de niveau de métier pour les ateliers (tailleur, cordonnier, bijoutier)

// Structure de progression par métier
const metiers = {
  tailleur: {
    niveau: 1,
    xp: 0,
    xpToNext: 100,
  },
  cordonnier: {
    niveau: 1,
    xp: 0,
    xpToNext: 100,
  },
  bijoutier: {
    niveau: 1,
    xp: 0,
    xpToNext: 100,
  },
  alchimiste: {
    niveau: 1,
    xp: 0,
    xpToNext: 100,
  }
};

// Fonction pour calculer le nombre de slots débloqués selon le niveau
function getSlotsDebloques(niveau) {
  if (niveau >= 100) return 7;
  if (niveau >= 80) return 6;
  if (niveau >= 60) return 5;
  if (niveau >= 40) return 4;
  if (niveau >= 20) return 3;
  return 2;
}

// Fonction pour obtenir le nombre de slots pour un métier
function getMetierSlots(metier) {
  if (!metiers[metier]) return 2;
  return getSlotsDebloques(metiers[metier].niveau);
}

// Fonction pour gagner de l'XP dans un métier
function gainMetierXP(metier, amount) {
  console.log(`🔍 gainMetierXP appelé - métier: ${metier}, amount: ${amount}`);
  console.log(`🔍 métiers[${metier}] existe?`, !!metiers[metier]);
  console.log(`🔍 window.metiers[${metier}] existe?`, !!window.metiers[metier]);
  
  if (!window.metiers) {
    console.error("❌ window.metiers n'existe pas!");
    return;
  }
  
  if (!window.metiers[metier]) {
    console.error(`❌ window.metiers[${metier}] n'existe pas!`);
    return;
  }
  
  console.log(`🔍 XP actuel: ${window.metiers[metier].xp}`);
  window.metiers[metier].xp += amount;
  console.log(`🔍 XP après ajout: ${window.metiers[metier].xp}`);
  
  // Passage de niveau si assez d'XP
  while (window.metiers[metier].xp >= window.metiers[metier].xpToNext) {
    window.metiers[metier].xp -= window.metiers[metier].xpToNext;
    window.metiers[metier].niveau++;
    console.log(`🎉 NIVEAU UP! ${metier} niveau ${window.metiers[metier].niveau}`);
    // Courbe exponentielle avec 12% d'augmentation
    window.metiers[metier].xpToNext = Math.floor(window.metiers[metier].xpToNext * 1.12);
  }
}

// Pour accès global
window.metiers = metiers;
window.getMetierSlots = getMetierSlots;
window.gainMetierXP = gainMetierXP;

// Fonction pour réinitialiser tous les métiers au niveau 1
window.resetMetiersToLevel1 = function() {
  window.metiers = {
    tailleur: {
      niveau: 1,
      xp: 0,
      xpToNext: 100,
    },
    cordonnier: {
      niveau: 1,
      xp: 0,
      xpToNext: 100,
    },
    bijoutier: {
      niveau: 1,
      xp: 0,
      xpToNext: 100,
    },
    alchimiste: {
      niveau: 1,
      xp: 0,
      xpToNext: 100,
    }
  };
  console.log("✅ Tous les métiers ont été remis au niveau 1");
  console.log("🔍 État des métiers après reset:", window.metiers);
  
  // Forcer une sauvegarde pour que ça persiste
  if (window.forceSaveOnEvent) {
    window.forceSaveOnEvent();
    console.log("💾 Sauvegarde forcée après reset des métiers");
  }
};

// Fonction de test pour l'XP d'alchimie
window.testAlchemyXP = function() {
  console.log("🧪 Test XP Alchimie");
  console.log("🔍 État initial:", window.metiers?.alchimiste);
  
  if (window.gainMetierXP) {
    window.gainMetierXP('alchimiste', 10);
    console.log("🔍 État après +10 XP:", window.metiers?.alchimiste);
  } else {
    console.error("❌ gainMetierXP non disponible");
  }
};

// Fonction pour forcer la réinitialisation complète des métiers
window.forceResetMetiers = function() {
  console.log("🔧 FORCE RESET des métiers");
  
  // Réinitialiser complètement
  window.metiers = {
    tailleur: { niveau: 1, xp: 0, xpToNext: 100 },
    cordonnier: { niveau: 1, xp: 0, xpToNext: 100 },
    bijoutier: { niveau: 1, xp: 0, xpToNext: 100 },
    alchimiste: { niveau: 1, xp: 0, xpToNext: 100 }
  };
  
  console.log("✅ Métiers réinitialisés:", window.metiers);
  
  // Test immédiat
  console.log("🧪 Test immédiat +10 XP alchimie...");
  window.gainMetierXP('alchimiste', 10);
  console.log("🔍 Résultat:", window.metiers.alchimiste);
};

// Utilisation de la vraie base de données equipmentDatabase pour les stats
function getItemStatsAndDesc(nom) {
  if (!window.equipmentDatabase) return null;
  // Correspondance nom → id
  for (const id in window.equipmentDatabase) {
    const item = window.equipmentDatabase[id];
    if (item && item.name && item.name.toLowerCase() === nom.toLowerCase()) {
      return { stats: item.stats || {}, description: item.description || '' };
    }
  }
  return null;
}

// Recettes par métier (exemple, à étendre)
const metierRecettes = {
  tailleur: [
    {
      nom: 'Corbacape',
      icon: 'assets/equipements/capes/capecorbeau.png',
      niveauRequis: 3,
      description: 'Une cape de corbeau stylée.',
      ingredients: [
        { nom: 'Plume de Corbeau', icon: 'assets/objets/plumedecorbeau.png', quantite: 5 },
        { nom: 'Patte de Corbeau', icon: 'assets/objets/pattedecorbeau.png', quantite: 2 }
      ]
    },
    {
      nom: 'Corbacoiffe',
      icon: 'assets/equipements/coiffes/coiffecorbeau.png',
      niveauRequis: 3,
      description: 'Une coiffe de corbeau mystérieuse.',
      ingredients: [
        { nom: 'Plume de Corbeau', icon: 'assets/objets/plumedecorbeau.png', quantite: 3 }
      ]
    },
    {
      nom: 'Cape de Slime',
      icon: 'assets/equipements/capes/capeslime.png',
      niveauRequis: 10,
      description: 'Une cape visqueuse qui vous permet de glisser facilement.',
      ingredients: [
        { nom: 'Gelée de Slime', icon: 'assets/objets/geleeslime.png', quantite: 3 },
        { nom: 'Mucus de Slime', icon: 'assets/objets/mucusslime.png', quantite: 2 }
      ]
    },
    {
      nom: 'Coiffe de Slime',
      icon: 'assets/equipements/coiffes/coiffeslime.png',
      niveauRequis: 10,
      description: 'Une coiffe visqueuse qui vous donne l\'apparence d\'un slime.',
      ingredients: [
        { nom: 'Gelée de Slime', icon: 'assets/objets/geleeslime.png', quantite: 2 },
        { nom: 'Noyau de Slime', icon: 'assets/objets/noyauslime.png', quantite: 1 }
      ]
    }
  ],
  cordonnier: [
    {
      nom: 'Corbobotte',
      icon: 'assets/equipements/bottes/bottecorbeau.png',
      niveauRequis: 3,
      description: 'Des bottes robustes en plumes et pattes de corbeau.',
      ingredients: [
        { nom: 'Plume de Corbeau', icon: 'assets/objets/plumedecorbeau.png', quantite: 2 },
        { nom: 'Patte de Corbeau', icon: 'assets/objets/pattedecorbeau.png', quantite: 2 }
      ]
    },
    {
      nom: 'Corbature',
      icon: 'assets/equipements/ceintures/ceinturecorbeau.png',
      niveauRequis: 3,
      description: 'Une ceinture tressée de plumes et pattes de corbeau.',
      ingredients: [
        { nom: 'Plume de Corbeau', icon: 'assets/objets/plumedecorbeau.png', quantite: 1 },
        { nom: 'Patte de Corbeau', icon: 'assets/objets/pattedecorbeau.png', quantite: 3 }
      ]
    },
    {
      nom: 'Bottes de Slime',
      icon: 'assets/equipements/bottes/botteslime.png',
      niveauRequis: 10,
      description: 'Des bottes visqueuses qui vous permettent de glisser rapidement.',
      ingredients: [
        { nom: 'Gelée de Slime', icon: 'assets/objets/geleeslime.png', quantite: 4 },
        { nom: 'Mucus de Slime', icon: 'assets/objets/mucusslime.png', quantite: 2 }
      ]
    },
    {
      nom: 'Ceinture de Slime',
      icon: 'assets/equipements/ceintures/ceintureslime.png',
      niveauRequis: 10,
      description: 'Une ceinture visqueuse qui vous donne la souplesse d\'un slime.',
      ingredients: [
        { nom: 'Gelée de Slime', icon: 'assets/objets/geleeslime.png', quantite: 2 },
        { nom: 'Noyau de Slime', icon: 'assets/objets/noyauslime.png', quantite: 1 }
      ]
    }
  ],
  bijoutier: [
    {
      nom: 'Corbollier',
      icon: 'assets/equipements/colliers/colliercorbeau.png',
      niveauRequis: 3,
      description: 'Un collier élégant orné de plumes de corbeau.',
      ingredients: [
        { nom: 'Plume de Corbeau', icon: 'assets/objets/plumedecorbeau.png', quantite: 2 },
        { nom: 'Patte de Corbeau', icon: 'assets/objets/pattedecorbeau.png', quantite: 1 }
      ]
    },
    {
      nom: 'Corbaneau',
      icon: 'assets/equipements/anneaux/anneaucorbeau.png',
      niveauRequis: 3,
      description: 'Un anneau mystérieux inspiré du corbeau.',
      ingredients: [
        { nom: 'Plume de Corbeau', icon: 'assets/objets/plumedecorbeau.png', quantite: 1 },
        { nom: 'Patte de Corbeau', icon: 'assets/objets/pattedecorbeau.png', quantite: 2 }
      ]
    },
    {
      nom: 'Collier de Slime',
      icon: 'assets/equipements/colliers/collierslime.png',
      niveauRequis: 10,
      description: 'Un collier visqueux qui vous donne la résistance d\'un slime.',
      ingredients: [
        { nom: 'Gelée de Slime', icon: 'assets/objets/geleeslime.png', quantite: 3 },
        { nom: 'Mucus de Slime', icon: 'assets/objets/mucusslime.png', quantite: 1 }
      ]
    },
    {
      nom: 'Anneau de Slime',
      icon: 'assets/equipements/anneaux/anneauslime.png',
      niveauRequis: 10,
      description: 'Un anneau visqueux qui vous donne la flexibilité d\'un slime.',
      ingredients: [
        { nom: 'Gelée de Slime', icon: 'assets/objets/geleeslime.png', quantite: 2 },
        { nom: 'Noyau de Slime', icon: 'assets/objets/noyauslime.png', quantite: 1 }
      ]
    }
  ],
  alchimiste: [
    {
      nom: 'Potion de Soin Basique',
      icon: 'assets/objets/potion_soin_basique.png',
      niveauRequis: 1,
      description: 'Une potion qui restaure 50 points de vie.',
      ingredients: [
        { nom: 'Pissenlit', icon: 'assets/objets/pissenlit.png', quantite: 3 }
      ]
    },
    {
      nom: 'Potion de Force',
      icon: 'assets/objets/potion_force.png',
      niveauRequis: 3,
      description: 'Une potion qui augmente temporairement la force.',
      ingredients: [
        { nom: 'Pissenlit', icon: 'assets/objets/pissenlit.png', quantite: 5 },
        { nom: 'Gelée de Slime', icon: 'assets/objets/geleeslime.png', quantite: 2 }
      ]
    },
    {
      nom: 'Potion de Vitesse',
      icon: 'assets/objets/potion_vitesse.png',
      niveauRequis: 5,
      description: 'Une potion qui augmente temporairement la vitesse.',
      ingredients: [
        { nom: 'Pissenlit', icon: 'assets/objets/pissenlit.png', quantite: 4 },
        { nom: 'Mucus de Slime', icon: 'assets/objets/mucusslime.png', quantite: 1 }
      ]
    },
    {
      nom: 'Potion de Régénération',
      icon: 'assets/objets/potion_regeneration.png',
      niveauRequis: 8,
      description: 'Une potion qui restaure progressivement la vie.',
      ingredients: [
        { nom: 'Pissenlit', icon: 'assets/objets/pissenlit.png', quantite: 6 },
        { nom: 'Noyau de Slime', icon: 'assets/objets/noyauslime.png', quantite: 1 }
      ]
    },
    {
      nom: 'Orbe Rare Équipement Niveau 10',
      icon: 'assets/objets/orbesrareniveau10.png',
      niveauRequis: 15,
      description: 'Un orbe rare permettant d\'améliorer considérablement les équipements.',
      ingredients: [
        { nom: 'Particule', icon: 'assets/objets/particulerare.png', quantite: 10 }
      ],
      type: 'fusion'
    },
    {
      nom: 'Orbe Rare Sort Niveau 10',
      icon: 'assets/objets/orbesraredesortniveau10.png',
      niveauRequis: 20,
      description: 'Un orbe rare permettant d\'améliorer considérablement les sorts.',
      ingredients: [
        { nom: 'Particule', icon: 'assets/objets/particulerare.png', quantite: 10 }
      ],
      type: 'fusion'
    }
  ]
};

// Base de données des ressources récoltables par métier
const metierResources = {
  alchimiste: [
         {
       nom: 'Pissenlit',
       icon: 'assets/objets/ressources_alchimiste/pissenlit.png',
       niveauRequis: 1,
       description: 'Une fleur commune utilisée en alchimie.',
       localisation: 'Map 1 - Zones herbeuses',
       respawn: '120 secondes'
     },
    {
      nom: 'Lavande',
      icon: 'assets/objets/lavande.png',
      niveauRequis: 5,
      description: 'Une herbe aromatique aux propriétés calmantes.',
      localisation: 'Map 2 - Collines',
      respawn: '180 secondes'
    },
    {
      nom: 'Sauge',
      icon: 'assets/objets/sauge.png',
      niveauRequis: 10,
      description: 'Une herbe médicinale puissante.',
      localisation: 'Map 3 - Forêt',
      respawn: '240 secondes'
    },
    {
      nom: 'Mandragore',
      icon: 'assets/objets/mandragore.png',
      niveauRequis: 20,
      description: 'Une plante rare aux propriétés magiques.',
      localisation: 'Map 4 - Donjons',
      respawn: '300 secondes'
    },
    {
      nom: 'Orchidée Noire',
      icon: 'assets/objets/orchidee_noire.png',
      niveauRequis: 50,
      description: 'Une fleur mystérieuse aux pouvoirs exceptionnels.',
      localisation: 'Map 5 - Zones sombres',
      respawn: '600 secondes'
    }
  ]
};

// Exemple de stats pour chaque item (à remplacer par la vraie base de données si besoin)
const metierItemStats = {
  Corbacape: {
    stats: { 'agilite': 3, 'chance': 2 },
    description: 'Une cape légère qui augmente l’agilité.'
  },
  Corbacoiffe: {
    stats: { 'intelligence': 2, 'defense': 1 },
    description: 'Une coiffe qui protège et stimule l’esprit.'
  },
  Corbobotte: {
    stats: { 'vitesse': 1, 'agilite': 2 },
    description: 'Des bottes pour courir comme un corbeau.'
  },
  Corbature: {
    stats: { 'force': 2, 'defense': 2 },
    description: 'Une ceinture qui renforce le porteur.'
  },
  Corbolier: {
    stats: { 'chance': 3 },
    description: 'Un collier qui attire la chance.'
  },
  Corbaneau: {
    stats: { 'chance': 1, 'agilite': 1 },
    description: 'Un anneau mystérieux.'
  },
  'Potion de Soin Basique': {
    stats: { 'vie': 50 },
    description: 'Une potion qui restaure 50 points de vie.'
  },
  'Potion de Force': {
    stats: { 'force': 5 },
    description: 'Une potion qui augmente temporairement la force de 5 points.'
  },
  'Potion de Vitesse': {
    stats: { 'vitesse': 3 },
    description: 'Une potion qui augmente temporairement la vitesse de 3 points.'
  },
  'Potion de Régénération': {
    stats: { 'vie': 100, 'regeneration': 10 },
    description: 'Une potion qui restaure 100 points de vie et régénère 10 points par seconde pendant 10 secondes.'
  }
};

// Affichage dynamique de la fenêtre métier avec recettes à droite
function openMetierModal() {
  const existing = document.getElementById('metier-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'metier-modal-overlay';

  const content = document.createElement('div');
  content.id = 'metier-modal-content';

  const title = document.createElement('div');
  title.id = 'metier-modal-title';
  title.textContent = 'Métiers';
  content.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.id = 'metier-close-btn';
  closeBtn.innerHTML = '×';
  closeBtn.onclick = () => overlay.remove();
  content.appendChild(closeBtn);

  // Main flex (liste métiers à gauche, recettes à droite)
  const main = document.createElement('div');
  main.className = 'metier-main';

  // Liste des métiers
  const metierList = document.createElement('div');
  metierList.className = 'metier-list';

  // Données d'affichage pour chaque métier (dynamique possible)
  const metierData = [
    {
      key: 'tailleur',
      nom: 'Tailleur',
      svg: `<svg class='metier-icon-svg' width='32' height='32' viewBox='0 0 32 32'><rect x='14' y='4' width='4' height='16' rx='2' fill='#bfa14a' stroke='#684726' stroke-width='2'/><rect x='10' y='2' width='12' height='6' rx='2' fill='#8d8d8d' stroke='#684726' stroke-width='2'/><rect x='15' y='20' width='2' height='8' rx='1' fill='#684726'/></svg>`
    },
    {
      key: 'cordonnier',
      nom: 'Cordonnier',
      svg: `<svg class='metier-icon-svg' width='32' height='32' viewBox='0 0 32 32'><ellipse cx='16' cy='20' rx='10' ry='6' fill='#bfa14a' stroke='#684726' stroke-width='2'/><rect x='12' y='8' width='8' height='10' rx='3' fill='#8d8d8d' stroke='#684726' stroke-width='2'/></svg>`
    },
    {
      key: 'bijoutier',
      nom: 'Bijoutier',
      svg: `<svg class='metier-icon-svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='10' fill='#ffe17d' stroke='#bfa14a' stroke-width='2'/><circle cx='16' cy='16' r='5' fill='#8d8d8d' stroke='#684726' stroke-width='2'/></svg>`
    },
    {
      key: 'alchimiste',
      nom: 'Alchimiste',
      svg: `<svg class='metier-icon-svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='12' r='6' fill='#4CAF50' stroke='#2E7D32' stroke-width='2'/><rect x='12' y='18' width='8' height='10' rx='2' fill='#8BC34A' stroke='#2E7D32' stroke-width='2'/><circle cx='14' cy='20' r='1.5' fill='#2E7D32'/><circle cx='18' cy='20' r='1.5' fill='#2E7D32'/></svg>`
    }
  ];

  // Panneau principal à droite avec onglets
  const rightPanel = document.createElement('div');
  rightPanel.className = 'metier-right-panel';
  
  // Onglets
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'metier-tabs';
  
  const craftTab = document.createElement('div');
  craftTab.className = 'metier-tab active';
  craftTab.textContent = 'Craft';
  craftTab.onclick = () => switchTab('craft');
  
  const resourcesTab = document.createElement('div');
  resourcesTab.className = 'metier-tab';
  resourcesTab.textContent = 'Ressources';
  resourcesTab.onclick = () => switchTab('resources');
  
  tabsContainer.appendChild(craftTab);
  tabsContainer.appendChild(resourcesTab);
  rightPanel.appendChild(tabsContainer);
  
  // Panneau recettes
  const recettePanel = document.createElement('div');
  recettePanel.className = 'metier-recette-panel empty';
  recettePanel.textContent = 'Sélectionne un métier à gauche pour voir les recettes.';
  
  // Panneau ressources
  const resourcesPanel = document.createElement('div');
  resourcesPanel.className = 'metier-resources-panel empty';
  resourcesPanel.style.display = 'none';
  resourcesPanel.textContent = 'Sélectionne un métier à gauche pour voir les ressources.';
  
  rightPanel.appendChild(recettePanel);
  rightPanel.appendChild(resourcesPanel);

  // Sélection dynamique
  let selectedMetier = null;
  let currentTab = 'craft';
  
  // Fonction pour changer d'onglet
  function switchTab(tabName) {
    currentTab = tabName;
    
    // Mettre à jour les onglets visuellement
    tabsContainer.querySelectorAll('.metier-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    if (tabName === 'craft') {
      craftTab.classList.add('active');
    } else {
      resourcesTab.classList.add('active');
    }
    
    // Afficher/masquer les panneaux
    recettePanel.style.display = tabName === 'craft' ? 'block' : 'none';
    resourcesPanel.style.display = tabName === 'resources' ? 'block' : 'none';
    
    // Recharger le contenu si un métier est sélectionné
    if (selectedMetier) {
      if (tabName === 'craft') {
        renderRecettes(selectedMetier);
      } else {
        renderResources(selectedMetier);
      }
    }
  }

  function renderRecettes(metierKey) {
    recettePanel.innerHTML = '';
    recettePanel.classList.remove('empty');
    const recettes = metierRecettes[metierKey] || [];
    if (!recettes.length) {
      recettePanel.classList.add('empty');
      recettePanel.textContent = 'Aucune recette disponible pour ce métier.';
      return;
    }
    const niveauMetier = window.metiers[metierKey]?.niveau || 1;
    let ficheIngredients = null;
    recettes.forEach((recette, idx) => {
      const canCraft = niveauMetier >= recette.niveauRequis;
      const box = document.createElement('div');
      box.style.display = 'flex';
      box.style.alignItems = 'center';
      box.style.gap = '18px';
      box.style.background = canCraft ? '#fff' : '#e7e7e7';
      box.style.borderRadius = '12px';
      box.style.border = '2px solid #bfa14a';
      box.style.boxShadow = '0 2px 8px #bfa14a22';
      box.style.padding = '14px 18px';
      box.style.marginBottom = '14px';
      box.style.opacity = canCraft ? '1' : '0.6';
      box.style.cursor = 'pointer';
      // Icône
      const img = document.createElement('img');
      img.src = recette.icon;
      img.alt = recette.nom;
      img.style.width = '48px';
      img.style.height = '48px';
      img.style.objectFit = 'contain';
      img.style.borderRadius = '8px';
      img.style.background = '#f5e7b4';
      img.style.border = '1.5px solid #bfa14a';
      box.appendChild(img);
      // Infos
      const info = document.createElement('div');
      info.style.display = 'flex';
      info.style.flexDirection = 'column';
      info.style.gap = '4px';
      // Nom
      const nom = document.createElement('div');
      nom.textContent = recette.nom;
      nom.style.fontWeight = 'bold';
      nom.style.fontSize = '1.15em';
      nom.style.color = '#684726';
      info.appendChild(nom);
      // Description
      if (recette.description) {
        const desc = document.createElement('div');
        desc.textContent = recette.description;
        desc.style.fontSize = '0.98em';
        desc.style.color = '#444';
        info.appendChild(desc);
      }
      // Niveau requis
      const niveau = document.createElement('div');
      niveau.textContent = 'Niveau requis : ' + recette.niveauRequis;
      niveau.style.fontSize = '0.95em';
      niveau.style.color = canCraft ? '#bfa14a' : '#e53935';
      info.appendChild(niveau);
      // Message si pas le niveau
      if (!canCraft) {
        const msg = document.createElement('div');
        msg.textContent = 'Niveau insuffisant pour crafter.';
        msg.style.color = '#e53935';
        msg.style.fontWeight = 'bold';
        msg.style.fontSize = '0.98em';
        info.appendChild(msg);
      }
      box.appendChild(info);
      // Affichage des ingrédients + caractéristiques au clic
      box.onclick = () => {
        if (ficheIngredients && ficheIngredients.parentNode) ficheIngredients.parentNode.removeChild(ficheIngredients);
        ficheIngredients = document.createElement('div');
        ficheIngredients.style.background = '#fffbe7';
        ficheIngredients.style.border = '2px solid #bfa14a';
        ficheIngredients.style.borderRadius = '14px';
        ficheIngredients.style.boxShadow = '0 2px 8px #bfa14a22';
        ficheIngredients.style.margin = '0 0 18px 0';
        ficheIngredients.style.padding = '18px 22px';
        ficheIngredients.style.display = 'flex';
        ficheIngredients.style.flexDirection = 'row';
        ficheIngredients.style.gap = '32px';
        ficheIngredients.style.alignItems = 'flex-start';
        // Partie gauche : Aperçu item
        const itemPreview = document.createElement('div');
        itemPreview.style.display = 'flex';
        itemPreview.style.flexDirection = 'column';
        itemPreview.style.alignItems = 'center';
        itemPreview.style.gap = '10px';
        // Icône
        const itemImg = document.createElement('img');
        itemImg.src = recette.icon;
        itemImg.alt = recette.nom;
        itemImg.style.width = '64px';
        itemImg.style.height = '64px';
        itemImg.style.objectFit = 'contain';
        itemImg.style.borderRadius = '10px';
        itemImg.style.background = '#e4e4e4';
        itemImg.style.border = '2px solid #bfa14a';
        itemPreview.appendChild(itemImg);
        // Nom
        const itemNom = document.createElement('div');
        itemNom.textContent = recette.nom;
        itemNom.style.fontWeight = 'bold';
        itemNom.style.fontSize = '1.18em';
        itemNom.style.color = '#bfa14a';
        itemPreview.appendChild(itemNom);
        // Stats & description réelles
        const real = getItemStatsAndDesc(recette.nom);
        const stats = real ? real.stats : {};
        if (Object.keys(stats).length > 0) {
          const statsDiv = document.createElement('div');
          statsDiv.style.display = 'flex';
          statsDiv.style.flexDirection = 'column';
          statsDiv.style.gap = '4px';
          statsDiv.style.marginTop = '6px';
          for (const [stat, val] of Object.entries(stats)) {
            const statRow = document.createElement('div');
            statRow.style.display = 'flex';
            statRow.style.alignItems = 'center';
            statRow.style.gap = '8px';
            // Icône stat (optionnel)
            const iconSpan = document.createElement('span');
            iconSpan.textContent = window.getStatIcon ? window.getStatIcon(stat) : '🔸';
            iconSpan.style.fontSize = '1.1em';
            statRow.appendChild(iconSpan);
            // Nom stat
            const statName = document.createElement('span');
            statName.textContent = stat.charAt(0).toUpperCase() + stat.slice(1);
            statName.style.color = '#684726';
            statRow.appendChild(statName);
            // Valeur
            const statVal = document.createElement('span');
            statVal.textContent = '+' + val;
            statVal.style.color = '#bfa14a';
            statVal.style.fontWeight = 'bold';
            statRow.appendChild(statVal);
            statsDiv.appendChild(statRow);
          }
          itemPreview.appendChild(statsDiv);
        }
        // Description réelle
        const desc = real ? real.description : '';
        if (desc) {
          const descDiv = document.createElement('div');
          descDiv.textContent = desc;
          descDiv.style.fontSize = '0.98em';
          descDiv.style.color = '#444';
          descDiv.style.marginTop = '8px';
          itemPreview.appendChild(descDiv);
        }
        ficheIngredients.appendChild(itemPreview);
        // Partie droite : Ingrédients
        const ingCol = document.createElement('div');
        ingCol.style.display = 'flex';
        ingCol.style.flexDirection = 'column';
        ingCol.style.gap = '10px';
        // Titre
        const titre = document.createElement('div');
        titre.textContent = 'Ingrédients nécessaires :';
        titre.style.fontWeight = 'bold';
        titre.style.fontSize = '1.08em';
        titre.style.color = '#bfa14a';
        ingCol.appendChild(titre);
        // Liste ingrédients
        recette.ingredients.forEach(ing => {
          const ingRow = document.createElement('div');
          ingRow.style.display = 'flex';
          ingRow.style.alignItems = 'center';
          ingRow.style.gap = '10px';
          // Icône
          const ingIcon = document.createElement('img');
          ingIcon.src = ing.icon;
          ingIcon.alt = ing.nom;
          ingIcon.style.width = '28px';
          ingIcon.style.height = '28px';
          ingIcon.style.objectFit = 'contain';
          ingIcon.style.borderRadius = '6px';
          ingIcon.style.background = '#e7e7e7';
          ingIcon.style.border = '1.2px solid #bfa14a';
          ingRow.appendChild(ingIcon);
          // Nom + quantité
          const ingNom = document.createElement('span');
          ingNom.textContent = ing.nom + ' ';
          ingNom.style.fontWeight = 'bold';
          ingNom.style.color = '#684726';
          ingRow.appendChild(ingNom);
          const ingQty = document.createElement('span');
          ingQty.textContent = 'x' + ing.quantite;
          ingQty.style.color = '#bfa14a';
          ingQty.style.fontWeight = 'bold';
          ingRow.appendChild(ingQty);
          ingCol.appendChild(ingRow);
        });
        ficheIngredients.appendChild(ingCol);
        // Insérer la fiche juste après la recette sélectionnée
        box.parentNode.insertBefore(ficheIngredients, box.nextSibling);
      };
      recettePanel.appendChild(box);
    });
  }

  function renderResources(metierKey) {
    resourcesPanel.innerHTML = '';
    resourcesPanel.classList.remove('empty');
    const resources = metierResources[metierKey] || [];
    if (!resources.length) {
      resourcesPanel.classList.add('empty');
      resourcesPanel.textContent = 'Aucune ressource disponible pour ce métier.';
      return;
    }
    const niveauMetier = window.metiers[metierKey]?.niveau || 1;
    resources.forEach((resource, idx) => {
      const canHarvest = niveauMetier >= resource.niveauRequis;
      const box = document.createElement('div');
      box.style.display = 'flex';
      box.style.alignItems = 'center';
      box.style.gap = '18px';
      box.style.background = canHarvest ? '#fff' : '#e7e7e7';
      box.style.borderRadius = '12px';
      box.style.border = '2px solid #4CAF50';
      box.style.boxShadow = '0 2px 8px #4CAF5022';
      box.style.padding = '14px 18px';
      box.style.marginBottom = '14px';
      box.style.opacity = canHarvest ? '1' : '0.6';
      box.style.cursor = 'pointer';
      
      // Icône
      const img = document.createElement('img');
      img.src = resource.icon;
      img.alt = resource.nom;
      img.style.width = '48px';
      img.style.height = '48px';
      img.style.objectFit = 'contain';
      img.style.borderRadius = '8px';
      img.style.background = '#e8f5e8';
      img.style.border = '1.5px solid #4CAF50';
      box.appendChild(img);
      
      // Infos
      const info = document.createElement('div');
      info.style.display = 'flex';
      info.style.flexDirection = 'column';
      info.style.gap = '4px';
      
      // Nom
      const nom = document.createElement('div');
      nom.textContent = resource.nom;
      nom.style.fontWeight = 'bold';
      nom.style.fontSize = '1.15em';
      nom.style.color = '#2E7D32';
      info.appendChild(nom);
      
      // Description
      if (resource.description) {
        const desc = document.createElement('div');
        desc.textContent = resource.description;
        desc.style.fontSize = '0.98em';
        desc.style.color = '#444';
        info.appendChild(desc);
      }
      
      // Localisation
      if (resource.localisation) {
        const loc = document.createElement('div');
        loc.textContent = '📍 ' + resource.localisation;
        loc.style.fontSize = '0.95em';
        loc.style.color = '#666';
        info.appendChild(loc);
      }
      
      // Niveau requis
      const niveau = document.createElement('div');
      niveau.textContent = 'Niveau requis : ' + resource.niveauRequis;
      niveau.style.fontSize = '0.95em';
      niveau.style.color = canHarvest ? '#4CAF50' : '#e53935';
      info.appendChild(niveau);
      
      // Respawn
      if (resource.respawn) {
        const respawn = document.createElement('div');
        respawn.textContent = '⏱️ Respawn : ' + resource.respawn;
        respawn.style.fontSize = '0.95em';
        respawn.style.color = '#666';
        info.appendChild(respawn);
      }
      
      // Message si pas le niveau
      if (!canHarvest) {
        const msg = document.createElement('div');
        msg.textContent = 'Niveau insuffisant pour récolter.';
        msg.style.color = '#e53935';
        msg.style.fontWeight = 'bold';
        msg.style.fontSize = '0.98em';
        info.appendChild(msg);
      }
      
      box.appendChild(info);
      resourcesPanel.appendChild(box);
    });
  }

  metierData.forEach(metier => {
    const row = document.createElement('div');
    row.className = 'metier-row';
    // Icône
    const iconDiv = document.createElement('div');
    iconDiv.innerHTML = metier.svg;
    row.appendChild(iconDiv);
    // Infos
    const infoDiv = document.createElement('div');
    infoDiv.className = 'metier-info';
    // Nom + niveau
    const nomNiveauDiv = document.createElement('div');
    nomNiveauDiv.className = 'metier-nom-niveau';
    const nomDiv = document.createElement('div');
    nomDiv.className = 'metier-nom';
    nomDiv.textContent = metier.nom;
    nomNiveauDiv.appendChild(nomDiv);
    const niveauDiv = document.createElement('div');
    niveauDiv.className = 'metier-niveau';
    niveauDiv.textContent = 'Niveau ' + (window.metiers[metier.key]?.niveau || 1);
    nomNiveauDiv.appendChild(niveauDiv);
    infoDiv.appendChild(nomNiveauDiv);
    // Barre d'XP
    const xpBarContainer = document.createElement('div');
    xpBarContainer.className = 'metier-xp-bar-container';
    const xpBar = document.createElement('div');
    xpBar.className = 'metier-xp-bar';
    const xp = window.metiers[metier.key]?.xp || 0;
    const xpToNext = window.metiers[metier.key]?.xpToNext || 100;
    const ratio = Math.max(0, Math.min(1, xp / xpToNext));
    xpBar.style.width = (ratio * 100) + '%';
    xpBarContainer.appendChild(xpBar);
    // Texte XP
    const xpText = document.createElement('div');
    xpText.className = 'metier-xp-text';
    xpText.textContent = `${xp} / ${xpToNext} XP`;
    xpBarContainer.appendChild(xpText);
    infoDiv.appendChild(xpBarContainer);
    row.appendChild(infoDiv);
    // Sélection
    row.onclick = () => {
      // Visuel sélection
      metierList.querySelectorAll('.metier-row').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
      selectedMetier = metier.key;
      
      // Afficher le contenu selon l'onglet actuel
      if (currentTab === 'craft') {
        renderRecettes(metier.key);
      } else {
        renderResources(metier.key);
      }
    };
    metierList.appendChild(row);
  });

  main.appendChild(metierList);
  main.appendChild(rightPanel);
  content.appendChild(main);
  overlay.appendChild(content);
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

setTimeout(() => {
  const metierIcon = document.getElementById('metier-icon');
  if (metierIcon) {
    metierIcon.onclick = openMetierModal;
  }
}, 200);

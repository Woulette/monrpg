# Système de Sauvegarde Modulaire - MonRPG

## 🎯 **Objectif**
Refactorisation du système de sauvegarde pour améliorer la modularité, la robustesse et la maintenabilité du jeu RPG.

## 📁 **Structure des Fichiers**

```
js/save/
├── saveUtils.js          # Utilitaires communs (clés, validation, backup)
├── savePlayer.js         # Données du joueur (position, stats, progression)
├── saveGameState.js      # État global du jeu (map, donjon, portails)
├── saveInventory.js      # Inventaire et équipement
├── saveQuests.js         # Quêtes et progression
├── saveManager.js        # Orchestrateur principal
├── loader.js             # Chargement séquentiel des modules
└── README.md            # Documentation
```

## 🔄 **Ordre de Chargement**

1. `saveUtils.js` - Utilitaires de base
2. `savePlayer.js` - Données du joueur
3. `saveGameState.js` - État du jeu
4. `saveInventory.js` - Inventaire
5. `saveQuests.js` - Quêtes
6. `saveManager.js` - Orchestrateur

## 🎮 **Responsabilités par Module**

### `saveUtils.js`
- Génération de clés de sauvegarde standardisées
- Opérations génériques localStorage (save/load/delete)
- Système de backup et nettoyage
- Validation d'intégrité des données
- Vérification de l'espace de stockage
- Migration depuis l'ancien format

### `savePlayer.js`
- Position et animation du joueur
- Progression (niveau, XP, stats)
- État de combat et ressources
- Suivi automatique et respawn
- Stats de base et équipement

### `saveGameState.js`
- Carte actuelle et progression des donjons
- Compteurs de monstres tués
- États des portails et PNJ
- Informations générales du jeu

### `saveInventory.js`
- Inventaire complet (tous, équipement, potions, ressources)
- Objets équipés
- Compatibilité avec le système existant

### `saveQuests.js`
- **Utilise le système existant dans `quetes.js`**
- Évite les conflits avec l'ancien système
- Gestion des quêtes par personnage
- Réinitialisation propre lors du changement de personnage

### `saveManager.js`
- Orchestration de tous les modules
- Sauvegarde automatique
- Fonctions de haut niveau (saveAll, loadAll, deleteAll)
- Gestion des erreurs et fallbacks

## 🚀 **Utilisation**

### Sauvegarde Manuelle
```javascript
// Sauvegarder tout
window.saveAll();

// Sauvegarder un module spécifique
window.savePlayerData(window.currentCharacterId);
window.saveGameStateData(window.currentCharacterId);
window.saveInventoryData(window.currentCharacterId);
window.saveQuestsData(window.currentCharacterId);
```

### Chargement
```javascript
// Charger tout
window.loadAll();

// Charger un module spécifique
window.loadPlayerData(window.currentCharacterId);
window.loadGameStateData(window.currentCharacterId);
window.loadInventoryData(window.currentCharacterId);
window.loadQuestsData(window.currentCharacterId);
```

### Suppression
```javascript
// Supprimer tout
window.deleteAllSaves();

// Supprimer un module spécifique
window.deletePlayerData(window.currentCharacterId);
window.deleteGameStateData(window.currentCharacterId);
window.deleteInventoryData(window.currentCharacterId);
window.deleteQuestsData(window.currentCharacterId);
```

## 🔧 **Migration**

### Migration Automatique
Le système détecte et migre automatiquement les anciennes sauvegardes :
- `monrpg_save_${characterId}` → Modules séparés
- Conservation de toutes les données
- Validation d'intégrité

### Migration Manuelle
```javascript
// Migrer toutes les sauvegardes
window.migrateAllSaves();

// Migrer un personnage spécifique
window.saveUtils.migrateOldSaves(characterId);
```

## 🛡️ **Sécurité et Robustesse**

### Validation des Données
- Vérification de l'intégrité à chaque chargement
- Validation des champs requis
- Gestion des versions pour compatibilité future

### Système de Backup
- Sauvegarde automatique avant modification
- Nettoyage des anciens backups
- Récupération en cas d'erreur

### Gestion d'Erreurs
- Try/catch sur toutes les opérations localStorage
- Fallbacks en cas d'échec
- Logs détaillés pour le débogage

## 📊 **Monitoring et Debug**

### Fonctions de Diagnostic
```javascript
// Diagnostic complet
window.diagnoseSaveSystem();

// Diagnostic des quêtes spécifiquement
window.diagnoseQuestsSystem();

// Test des modules
window.testSaveModules();
```

### Informations de Sauvegarde
```javascript
// Informations générales
window.getSaveInfo(window.currentCharacterId);

// Informations par module
window.getPlayerInfo(window.currentCharacterId);
window.getGameStateInfo(window.currentCharacterId);
window.getInventoryInfo(window.currentCharacterId);
window.getQuestsInfo(window.currentCharacterId);
```

## 🔄 **Compatibilité**

### Avec l'Ancien Système
- **Coexistence pacifique** avec `save-system.js`
- Migration automatique des données
- Utilisation des fonctions existantes quand possible

### Multi-Personnages
- Isolation complète par `characterId`
- Clés de sauvegarde uniques : `monrpg_${module}_${characterId}`
- Pas de contamination entre personnages

## 🧪 **Tests et Dépannage**

### Problèmes Courants

#### 1. **Quêtes qui ne se déclenchent plus**
```javascript
// Diagnostic
window.diagnoseQuestsSystem();

// Réinitialisation forcée
window.forceResetQuests();
```

#### 2. **Données résiduelles entre personnages**
```javascript
// Vérifier l'isolation
console.log('Personnage actuel:', window.currentCharacterId);
console.log('Quêtes actuelles:', window.quests);

// Réinitialiser complètement
window.resetQuestsToInitial();
window.resetPNJStates();
```

#### 3. **Sauvegardes corrompues**
```javascript
// Vérifier l'intégrité
window.saveUtils.validateData(savedData);

// Restaurer depuis backup
window.saveUtils.restoreFromBackup(characterId);
```

### Tests de Fonctionnement
```javascript
// 1. Créer un nouveau personnage
// 2. Accepter une quête
// 3. Changer de personnage
// 4. Revenir au premier personnage
// 5. Vérifier que la quête est toujours là

// Test automatisé
window.testQuestsIsolation();
```

## 🔮 **Évolutions Futures**

### Fonctionnalités Prévues
- **Sauvegarde cloud** (optionnelle)
- **Synchronisation** entre appareils
- **Historique des sauvegardes**
- **Compression** des données
- **Chiffrement** des sauvegardes

### Améliorations Techniques
- **Sauvegarde incrémentale**
- **Optimisation** des performances
- **API** pour extensions
- **Plugins** de sauvegarde

## 📝 **Notes de Développement**

### Conventions
- Toutes les clés localStorage préfixées par `monrpg_`
- Versioning pour compatibilité future
- Logs détaillés pour debugging
- Documentation inline complète

### Bonnes Pratiques
- Validation systématique des données
- Gestion d'erreurs robuste
- Isolation par personnage
- Modularité et réutilisabilité

---

**Version :** 1.0  
**Dernière mise à jour :** Décembre 2024  
**Auteur :** Assistant IA Claude
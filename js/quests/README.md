# Système de Quêtes - Structure Modulaire

## Vue d'ensemble

Le système de quêtes a été restructuré en modules séparés pour améliorer la maintenabilité et la lisibilité du code.

## Structure des fichiers

### 📁 `quest-definitions.js`
**Responsabilité :** Définitions des quêtes et fonctions utilitaires
- Définitions des 4 quêtes principales (crowHunt, crowCraft, slimeBoss, slimeBossFinal)
- Fonctions utilitaires (`getEquipmentType`, `getQuestItemImagePath`, `getItemQuantity`)
- Gestion des instances de quêtes (`createQuestsInstance`, `getCurrentQuests`)

### 📁 `quest-logic.js`
**Responsabilité :** Logique métier des quêtes
- Acceptation et progression des quêtes (`acceptQuest`, `updateQuestProgress`)
- Validation des quêtes (`completeQuest`, `canValidateQuestWithPNJ`)
- Vérifications de progression (`checkCraftQuestProgress`, `checkSlimeBossQuestProgress`)
- Gestion des événements (`onCrowKilled`, `onSlimeBossKilled`)

### 📁 `quest-ui.js`
**Responsabilité :** Interface utilisateur
- Modales d'offre de quêtes (`showQuestOffer`, `showCraftQuestOffer`, etc.)
- Fenêtre principale des quêtes (`openQuestsWindow`, `closeQuestsWindow`)
- Gestion des onglets et affichage (`switchQuestTab`, `renderQuestsList`)
- Création des cartes de quêtes (`createQuestCard`)

### 📁 `quests.js`
**Responsabilité :** Fichier principal et sauvegarde
- Système de sauvegarde/chargement multi-personnages
- Fonctions de diagnostic et de test
- Exports globaux pour compatibilité
- Gestion des changements de personnage

### 📁 `test-restructuration.js`
**Responsabilité :** Tests de validation
- Vérification que toutes les fonctions sont disponibles
- Tests de compatibilité avec papi.js et inventory/items.js
- Validation de la création d'instances

## Dépendances

### Externes
- **papi.js** : Utilise les fonctions d'offre et de validation de quêtes
- **inventory/items.js** : Utilise `checkCraftQuestProgress`
- **saveQuests.js** : Utilise les fonctions de sauvegarde

### Internes
- Tous les modules s'exportent globalement via `window.functionName`
- Pas de système de modules ES6 pour maintenir la compatibilité

## Fonctions principales exportées

### Définitions
- `createQuestsInstance()` - Créer une nouvelle instance de quêtes
- `getCurrentQuests()` - Obtenir les quêtes du personnage actuel
- `isQuestAvailable(questId)` - Vérifier si une quête est disponible

### Logique
- `acceptQuest(questId)` - Accepter une quête
- `completeQuest(questId)` - Terminer une quête
- `checkCraftQuestProgress()` - Vérifier la progression de la quête de craft
- `canValidateQuestWithPNJ(pnjId)` - Vérifier si une quête peut être validée

### Interface
- `showQuestOffer()` - Afficher l'offre de quête corbeau
- `showCraftQuestOffer()` - Afficher l'offre de quête de craft
- `openQuestsWindow()` - Ouvrir la fenêtre principale des quêtes

### Sauvegarde
- `saveQuestsForCharacter(characterId)` - Sauvegarder les quêtes
- `loadQuestsForCharacter(characterId)` - Charger les quêtes
- `switchCharacterQuests(characterId)` - Changer de personnage

## Migration depuis l'ancien système

L'ancien fichier `quetes.js` (1717 lignes) a été divisé en modules plus petits et plus maintenables. Toutes les fonctions existantes sont conservées et exportées globalement pour maintenir la compatibilité.

## Tests

Utilisez `window.testRestructuration()` pour vérifier que toutes les fonctions sont disponibles après la restructuration.

## Avantages de la restructuration

✅ **Lisibilité** : Chaque fichier a une responsabilité claire
✅ **Maintenabilité** : Plus facile de modifier une fonctionnalité spécifique
✅ **Performance** : Chargement plus rapide (modules plus petits)
✅ **Équipe** : Plusieurs développeurs peuvent travailler sur différents modules
✅ **Debugging** : Plus facile de localiser les problèmes

## Compatibilité

- ✅ Compatible avec papi.js
- ✅ Compatible avec inventory/items.js
- ✅ Compatible avec saveQuests.js
- ✅ Toutes les fonctions existantes conservées
- ✅ Aucun changement de comportement 
# Module Player - Structure Modulaire

Ce dossier contient le système de joueur réorganisé en modules pour une meilleure maintenabilité et lisibilité.

## Structure des fichiers

### 📁 **constants.js**
- Constantes liées au joueur (dimensions, vitesse, etc.)
- Constantes de combat
- Variables d'animation

### 📁 **stats.js**
- Gestion des statistiques du joueur
- Fonctions de gain d'XP
- Calcul des stats totales
- Système de level up

### 📁 **combat.js**
- Fonctions de calcul des dégâts
- Détection des monstres
- Système de critique et d'esquive
- Utilitaires de combat

### 📁 **movement.js**
- Gestion du pathfinding
- Fonction `nextStepToTarget()`
- Logique de déplacement

### 📁 **bubbles.js**
- Système de bulles de dialogue
- Affichage des messages au-dessus du joueur
- Gestion de l'opacité et de la durée

### 📁 **respawn.js**
- Système de mort et respawn
- Pénalités d'XP
- Restauration de la vie

### 📁 **interaction.js**
- Gestionnaires d'événements (clic, double-clic, touches)
- Interactions avec les tables de craft
- Sélection de monstres
- Déplacement par clic

### 📁 **update.js**
- Fonction `updatePlayer()` principale
- Logique de combat automatique
- Régénération de vie
- Détection de téléportation
- Gestion des portails

### 📁 **main.js**
- Objet `player` principal
- Initialisation du joueur
- Fonction `resetPlayer()`
- Chargement de l'image du joueur
- Fonction `drawPlayer()`

### 📁 **index.js**
- Point d'entrée principal
- Import de tous les modules
- Initialisation du système

## Utilisation

Pour utiliser ce module, il suffit d'importer le fichier `index.js` :

```javascript
// Dans le fichier principal du jeu
import './js/player/index.js';
```

## Avantages de cette structure

1. **Modularité** : Chaque aspect du joueur est dans son propre fichier
2. **Maintenabilité** : Plus facile de trouver et modifier une fonctionnalité spécifique
3. **Lisibilité** : Code mieux organisé et plus facile à comprendre
4. **Réutilisabilité** : Modules pouvant être réutilisés indépendamment
5. **Testabilité** : Chaque module peut être testé séparément

## Dépendances

Le module player dépend des éléments globaux suivants :
- `window.TILE_SIZE`
- `window.mapData`
- `window.currentMap`
- `window.mapOffsetX`
- `window.mapOffsetY`
- `window.monsters`
- `window.occupiedPositions`

## Fonctions globales exportées

Toutes les fonctions importantes sont exportées sur l'objet `window` pour maintenir la compatibilité avec le reste du jeu. 
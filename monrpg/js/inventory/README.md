# Système d'Inventaire Modulaire

Ce dossier contient le système d'inventaire réorganisé en modules séparés pour une meilleure maintenabilité.

## Structure des fichiers

### `core.js`
- Variables globales des inventaires
- Fonctions d'initialisation et de réinitialisation
- Fonctions utilitaires pour la gestion des inventaires

### `grid.js`
- Création et gestion des grilles d'inventaire
- Système de catégories (Tous, Équipement, Potions, Ressources)
- Mise à jour de l'affichage des grilles
- Gestion des événements de clic sur les slots

### `items.js`
- Ajout et suppression d'items dans les inventaires
- Gestion des items empilables
- Synchronisation entre les différents inventaires
- Gestion des clics sur les items (équipement/déséquipement)

### `equipment-display.js`
- Affichage de l'équipement équipé
- Mise à jour des slots d'équipement

### `stats-display.js`
- Affichage des statistiques du joueur
- Gestion des barres d'XP
- Affichage des statistiques dans la fenêtre modale
- Gestion des points de statistiques

### `tooltips.js`
- Système de tooltips pour les items
- Affichage des informations détaillées au survol

### `modals.js`
- Fenêtres modales détaillées pour les items
- Gestion des boutons équiper/déséquiper
- Système de déplacement des fenêtres

### `main.js`
- Gestionnaires d'événements principaux
- Initialisation du système
- Gestion des raccourcis clavier (I, S, Échap)

## Ordre de chargement

Les modules sont chargés dans l'ordre suivant pour assurer les bonnes dépendances :

1. `core.js` - Variables globales
2. `grid.js` - Gestion des grilles
3. `items.js` - Gestion des items
4. `equipment-display.js` - Affichage équipement
5. `stats-display.js` - Affichage statistiques
6. `tooltips.js` - Système de tooltips
7. `modals.js` - Fenêtres modales
8. `main.js` - Gestionnaires d'événements

## Compatibilité

Le système maintient une compatibilité complète avec l'ancien code en exposant toutes les fonctions nécessaires sur l'objet `window`.

## Fonctionnalités préservées

- ✅ Inventaires séparés par catégorie
- ✅ Système d'équipement
- ✅ Tooltips et fenêtres détaillées
- ✅ Gestion des statistiques
- ✅ Raccourcis clavier
- ✅ Sauvegarde automatique
- ✅ Synchronisation entre inventaires 
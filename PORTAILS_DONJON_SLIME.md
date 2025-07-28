# Portails du Donjon Slime

## Description
Le système de portails du donjon slime a été étendu pour inclure une deuxième partie du donjon accessible via un portail à sens unique.

## Portails Disponibles

### Portail 12008 (mapdonjonslime.json → mapdonjonslime2.json)
- **Localisation** : Position (23, 1) sur la couche 4 de `mapdonjonslime.json`
- **Destination** : `mapdonjonslime2.json`
- **Type** : Sens unique (pas de retour possible)

### Portail 12208 (mapdonjonslime2.json)
- **Localisation** : Position (1, 17) sur la couche 4 de `mapdonjonslime2.json`
- **Fonction** : Désactivé - le joueur doit tuer le boss pour sortir du donjon

## Fonctionnalités
- Navigation à sens unique vers la deuxième partie du donjon
- Détection automatique du portail d'entrée lors du déplacement du joueur
- Téléportation avec calcul de la position d'arrivée optimale
- Gestion des collisions et des limites de map
- **Pas de retour possible** - le joueur doit accomplir sa mission pour sortir

## Intégration Technique
Les portails ont été ajoutés au système de détection dans `js/player/update.js` :
- Détection de l'ID 12008 pour l'entrée dans le donjon
- Le portail 12208 est désactivé (pas de logique de retour)
- Logique de téléportation spécifique pour l'entrée uniquement

## Utilisation
1. Le joueur se déplace vers le portail 12008 dans `mapdonjonslime.json`
2. Il est automatiquement téléporté vers `mapdonjonslime2.json` au portail 12208
3. **Aucun retour possible** - le joueur doit tuer le boss pour sortir du donjon

## Notes
- Le portail d'entrée est visible et peut être cliqué pour s'y déplacer
- Le système gère automatiquement les collisions et les limites de map
- La téléportation préserve la direction du joueur pour un placement optimal
- **Le donjon est conçu comme un défi à sens unique** - pas de retour en arrière possible 
# Système de Chat - Mon RPG 2D

## 📁 Structure des fichiers

```
chat/
├── chat.html      # HTML du chat (séparé du jeu principal)
├── chat.css       # Styles du chat
└── README.md      # Cette documentation

js/
└── chat.js        # Logique JavaScript du chat
```

## 🎯 Principe

Le chat est **complètement séparé** du jeu principal pour :
- ✅ Garder le HTML principal propre
- ✅ Faciliter la maintenance
- ✅ Éviter les conflits de code
- ✅ Permettre un développement modulaire

## 🔧 Intégration

Le chat sera chargé **dynamiquement** dans le jeu principal via :
- `fetch()` pour charger le HTML
- `chat.js` pour la logique
- Intégration transparente avec le jeu existant

## 📋 Fonctionnalités prévues

- [ ] Messages système (niveau, XP, etc.)
- [ ] Messages de combat (dégâts, critiques)
- [ ] Messages de progression (stats)
- [ ] Interface utilisateur
- [ ] Contrôles (touches, boutons)
- [ ] Sauvegarde des messages

## 🚀 Prochaines étapes

1. Définir le design du chat
2. Créer le HTML et CSS
3. Implémenter la logique JavaScript
4. Intégrer avec le jeu principal
5. Tester et optimiser

---
**Statut :** 🟡 Préparé (structure créée) 
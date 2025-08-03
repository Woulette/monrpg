// js/pnj.js - Système de PNJ (Personnages Non-Joueurs)

// Liste des PNJ
const pnjs = [];

// PNJ Papi - Tuteur du jeu
function createPapi() {
    const papi = {
        id: 'papi',
        name: "Papi le Guide",
        type: "tutor",
        x: 30, // Position à droite du portail 1, deux cases vers la droite
        y: 1,
        px: 30 * TILE_SIZE,
        py: 1 * TILE_SIZE,
        img: null,
        direction: 0,
        frame: 0,
        lastAnim: 0,
        animDelay: 300, // Animation plus lente pour un PNJ
        // Dialogues du tutoriel
        dialogues: [
            "Bienvenue jeune aventurier ! Je suis Papi, ton guide dans ce monde.",
            "C'est ici que commence ton tutoriel, écoute bien pour gagner tes premier équipements.",
            "Tu peu cliquer sur un monstre pour l'attaquer et gagner de l'XP.",
            "Ton niveau augmente avec l'XP gagné, tu gagnes des points de caractéristiques à chaque niveau.",
            "Tu peu aussi faire gagner de l'xp à tes statistiques !",
            "Il y'a un portail blanc et noir au dessus à ma droite.",
            "Chasse 5 corbeaux prend se portail et retrouve moi plus haut ! Attention aux corbeaux ils sont trés coriace."
        ],
        // Dialogues alternatifs une fois la quête terminée
        alternativeDialogues: [
            "Ah ! Te voilà de retour jeune aventurier !",
            "Tu as bien progressé depuis notre première rencontre.",
            "Sais-tu que ce monde est rempli de mystères et de secrets ?",
            "Les portails que tu vois partout relient différents univers entre eux.",
            "Certains disent qu'il existe des donjons cachés dans les profondeurs...",
            "Continue ton exploration, tu découvriras bien d'autres aventures !"
        ],
        currentDialogue: 0,
        isTalking: false,
        talkStartTime: 0,
        talkDuration: 5000, // 5 secondes par dialogue
        // Zone d'interaction
        interactionRange: 2,
        // État du tutoriel
        tutorialStep: 0,
        tutorialCompleted: false
    };
    
    pnjs.push(papi);
    
    // Marquer la position comme occupée
    if (typeof occupy === "function") {
        occupy(papi.x, papi.y);
    }
    
    return papi;
}

// PNJ Papi2 - Validation des quêtes sur la map 2
function createPapi2() {
    const papi2 = {
        id: 'papi2',
        name: "Papi le Gardien",
        type: "quest_validator",
        x: 22, // Position 3 cases en dessous de la table de craft cordonnier (814)
        y: 16,
        px: 22 * TILE_SIZE,
        py: 16 * TILE_SIZE,
        img: null,
        direction: 0,
        frame: 0,
        lastAnim: 0,
        animDelay: 300,
        // Dialogues par défaut (spécifiques à Papi2)
        dialogues: [
            "Salut jeune aventurier !",
            "Je suis Papi le Gardien, protecteur de cette zone de craft.",
            "Je surveille les artisans et valide les quêtes accomplies.",
            "Si tu as terminé tes missions, je peux les valider pour toi !"
        ],
        // Dialogues alternatifs une fois les quêtes terminées
        alternativeDialogues: [
            "Ah ! Le héros de la chasse aux corbeaux !",
            "Tu as fait du bon travail avec ton équipement de corbeau.",
            "Cette zone de craft est un lieu sacré pour les artisans.",
            "Les établis que tu vois ici sont alimentés par une énergie mystérieuse.",
            "Certains disent qu'ils sont connectés aux forces de l'univers...",
            "Continue à perfectionner tes compétences, jeune artisan !"
        ],
        currentDialogue: 0,
        isTalking: false,
        talkStartTime: 0,
        talkDuration: 4000, // 4 secondes par dialogue
        // Zone d'interaction
        interactionRange: 2,
        // Callback spécial pour la validation de quête
        onInteraction: function() {
            
            // Vérifier si le joueur a une quête prête à être validée
            if (typeof canValidateQuestWithPNJ === 'function') {
                const questToValidate = canValidateQuestWithPNJ('papi2');
                
                if (questToValidate) {
                    // Si une quête peut être validée, utiliser les dialogues de validation
                    papi2.dialogues = [
                        "Ah ! Te voilà enfin jeune aventurier !",
                        "As-tu réussi à chasser les 5 corbeaux comme demandé ?",
                        "Laisse-moi vérifier tes exploits...",
                        "Impressionnant ! Tu as vraiment fait du bon travail !",
                        "En tant que gardien, je valide officiellement ta quête !",
                        "Voici tes récompenses pour cette mission accomplie !",
                        "Très bien, je te propose une nouvelle quête. Vois-tu les établis plus haut ?",
                        "Utilise les ressources que je t'ai données pour crafter tes items, et retrouve moi plus haut !"
                    ];
                    papi2.currentDialogue = 0;
                    
                    // Valider la quête
                    if (typeof validateQuestWithPNJ === 'function') {
                        validateQuestWithPNJ('papi2');
                    }
                } else {
                    // Vérifier si les quêtes sont terminées pour utiliser les dialogues alternatifs
                    if (typeof window.quests !== 'undefined' && 
                        window.quests.crowHunt && window.quests.crowHunt.completed &&
                        window.quests.crowCraft && window.quests.crowCraft.completed) {
                        
                        // Utiliser les dialogues alternatifs
                        papi2.dialogues = papi2.alternativeDialogues;
                        papi2.currentDialogue = 0;
                    } else {
                        // Utiliser les dialogues par défaut
                        papi2.dialogues = [
                            "Salut jeune aventurier !",
                            "Je suis Papi le Gardien, protecteur de cette zone de craft.",
                            "Je surveille les artisans, si tu as fini de crafter tes équipement,",
                            "Retrouve moi sur la map 3 pour valider ta quête !"
                        ];
                        papi2.currentDialogue = 0;
                    }
                }
            }
        }
    };
    
    pnjs.push(papi2);
    
    // Marquer la position comme occupée
    if (typeof occupy === "function") {
        occupy(papi2.x, papi2.y);
    }
    
    return papi2;
}

// Charger l'image de Papi
function loadPapiImage() {
    const papi = pnjs.find(p => p.id === 'papi');
    if (!papi) return;
    
    papi.img = new Image();
    papi.img.onload = function() {
    };
    papi.img.onerror = function() {
    };
    papi.img.src = 'assets/pnj/papi.png';
}

// Charger l'image de Papi2
function loadPapi2Image() {
    const papi2 = pnjs.find(p => p.id === 'papi2');
    if (!papi2) return;
    
    papi2.img = new Image();
    papi2.img.onload = function() {
    };
    papi2.img.onerror = function() {
    };
    papi2.img.src = 'assets/pnj/papi.png'; // Utilise la même image que Papi
}

// PNJ Papi3 - Validation des quêtes sur la map 3
function createPapi3() {
    const papi3 = {
        id: 'papi3',
        name: "Papi le Sage",
        type: "quest_validator",
        x: 24,
        y: 10,
        px: 24 * TILE_SIZE,
        py: 10 * TILE_SIZE,
        map: 'map3',
        img: null,
        direction: 0,
        frame: 0,
        lastAnim: 0,
        animDelay: 300,
        dialogues: [
            "Je suis Papi le Sage, gardien des secrets de cette zone.",
            "Ah, je vois que tu as terminé tes équipements !",
            "Laisse-moi examiner ton travail..."
        ],
        alternativeDialogues: [
            "Je suis Papi le Sage, gardien des secrets de cette zone.",
            "Tu n'as pas encore terminé tes équipements.",
            "Reviens quand tu auras tout crafté !"
        ],
        currentDialogue: 0,
        isTalking: false,
        talkStartTime: 0,
        talkDuration: 4000, // 4 secondes par dialogue
        // Zone d'interaction
        interactionRange: 2,
        // Propriété pour suivre si Papi 3 s'est déplacé
        hasMoved: false,
        // Propriété pour suivre si la quête slimeBoss a été proposée dans cette session
        slimeBossQuestOffered: false,
        onInteraction: function() {
            
            // Vérifier si le joueur a le certificat du donjon slime
            const hasSlimeCertificate = typeof getItemQuantity === 'function' && getItemQuantity('certificat_corbeau') >= 1;
            
            // Vérifier si une quête peut être validée
            if (typeof canValidateQuestWithPNJ === 'function') {
                const questToValidate = canValidateQuestWithPNJ('papi3');
                
                if (questToValidate) {
                    // Définir les dialogues de validation selon la quête
                    if (questToValidate.id === 'crowCraft') {
                        papi3.dialogues = [
                            "Ah, je vois que tu as terminé tes équipements !",
                            "Laisse-moi examiner ton travail...",
                            "Parfait ! Tu as bien crafté tous les équipements requis.",
                            "Voici ta récompense pour cette quête accomplie !"
                        ];
                    } else if (questToValidate.id === 'slimeBoss') {
                        papi3.dialogues = [
                            "Alors as-tu éliminé le Maître des lieux ?",
                            "OH incroyable tu as vraiment réussi !",
                            "Voici ta récompense, je te laisse passer."
                        ];
                    }
                    papi3.currentDialogue = 0;
                } else if (hasSlimeCertificate) {
                    // Le joueur a le certificat, Papi 3 se déplace et retire un certificat
                    if (!papi3.hasMoved) {
                        papi3.hasMoved = true;
                        papi3.x += 1; // Se déplace d'une case vers la droite
                        papi3.px = papi3.x * TILE_SIZE;

                        // Libérer l'ancienne position et occuper la nouvelle
                        if (typeof release === "function") {
                            release(papi3.x - 1, papi3.y);
                        }
                        if (typeof occupy === "function") {
                            occupy(papi3.x, papi3.y);
                        }

                        // Retirer un certificat de l'inventaire
                        if (typeof window.removeItemFromAllInventories === 'function') {
                            window.removeItemFromAllInventories('certificat_corbeau');
                        }

                        // Sauvegarder le jeu après le déplacement de Papi 3
                        if (typeof window.autoSaveOnEvent === 'function') {
                            window.autoSaveOnEvent();
                        }

                    }

                    // Dialogue pour le certificat
                    papi3.dialogues = [
                        "Ah, le certificat du donjon slime !",
                        "Tu as prouvé ta valeur en tuant le maître des lieux.",
                        "Je vais te laisser passer pour accéder au donjon slime."
                    ];
                    papi3.currentDialogue = 0;
                } else {
                    // Vérifier l'état des quêtes pour déterminer le dialogue approprié
                    if (typeof window.quests !== 'undefined') {
                        const crowCraftCompleted = window.quests.crowCraft && window.quests.crowCraft.completed;
                        const slimeBossAccepted = window.quests.slimeBoss && window.quests.slimeBoss.accepted;
                        const slimeBossCompleted = window.quests.slimeBoss && window.quests.slimeBoss.completed;
                        
                        if (crowCraftCompleted && slimeBossAccepted && !slimeBossCompleted) {
                            // Le joueur a terminé crowCraft et accepté slimeBoss mais ne l'a pas encore terminée
                            papi3.dialogues = [
                                "Vous ne passerez pas !",
                                "Je ne peux pas te laisser passer aventurier, tu risquerais d'y laisser ton drop.",
                                "Prouve-moi ta valeur avant !"
                            ];
                        } else if (crowCraftCompleted && !slimeBossAccepted && !papi3.slimeBossQuestOffered) {
                            // Le joueur a terminé crowCraft mais n'a pas encore accepté slimeBoss
                            // Marquer que la quête va être proposée
                            papi3.slimeBossQuestOffered = true;
                            papi3.dialogues = [
                                "Ah, je vois que tu as terminé tes équipements !",
                                "Maintenant, tu souhaites accéder au donjon slime ?",
                                "Mais tu es trop faible ! Prouve-moi ta valeur en tuant le maître des lieux.",
                                "Es-tu prêt à accepter cette mission ?"
                            ];
                        } else if (crowCraftCompleted && !slimeBossAccepted) {
                            // Le joueur a terminé crowCraft mais n'a pas encore accepté slimeBoss (déjà proposé)
                            papi3.dialogues = [
                                "Tu souhaites accéder au donjon slime ?",
                                "Mais tu es trop faible ! Prouve-moi ta valeur en tuant le maître des lieux.",
                                "Accepte la mission pour continuer ton aventure !"
                            ];
                        } else if (crowCraftCompleted && slimeBossCompleted) {
                            // Le joueur a terminé toutes les quêtes précédentes
                            const slimeBossFinalCompleted = window.quests.slimeBossFinal && window.quests.slimeBossFinal.completed;
                            const slimeBossFinalAccepted = window.quests.slimeBossFinal && window.quests.slimeBossFinal.accepted;
                            
                            if (!slimeBossFinalAccepted && !slimeBossFinalCompleted) {
                                // Proposer la quête finale
                                papi3.dialogues = [
                                    "Ah, tu as vaincu le maître des lieux !",
                                    "Mais il y a un danger plus grand qui menace notre monde...",
                                    "Un boss terrifiant d'un autre univers est scellé dans le donjon slime.",
                                    "Les forces du donjon s'affaiblissent, il faut l'éliminer pour rétablir la sécurité.",
                                    "Es-tu prêt à affronter ce défi ultime ?"
                                ];
                            } else if (slimeBossFinalAccepted && !slimeBossFinalCompleted) {
                                // Le joueur a accepté la quête finale mais ne l'a pas terminée
                                papi3.dialogues = [
                                    "Tu as accepté la mission de vaincre le boss du donjon.",
                                    "Ce monstre est d'une puissance inouïe, sois prudent !",
                                    "Une fois vaincu, va voir Papi 4 dans la maison pour ta récompense."
                                ];
                            } else if (slimeBossFinalCompleted) {
                                // Toutes les quêtes sont terminées
                                papi3.dialogues = [
                                    "Tu as accompli l'impossible !",
                                    "Tu as vaincu le boss terrifiant du donjon.",
                                    "Notre monde est maintenant en sécurité grâce à toi.",
                                    "Tu es devenu un héros légendaire !"
                                ];
                            }
                        } else {
                            // Utiliser les dialogues alternatifs par défaut
                            papi3.dialogues = papi3.alternativeDialogues;
                        }
                    } else {
                        // Utiliser les dialogues alternatifs par défaut
                        papi3.dialogues = papi3.alternativeDialogues;
                    }
                    papi3.currentDialogue = 0;
                }
            }
            
            // Démarrer le dialogue
            startPNJDialog(papi3);
        }
    };
    
    pnjs.push(papi3);
    
    // Marquer la position comme occupée
    if (typeof occupy === "function") {
        occupy(papi3.x, papi3.y);
    }
    
    return papi3;
}

// PNJ Papi4 - Validation de la quête finale dans le donjon slime
function createPapi4() {
    const papi4 = {
        id: 'papi4',
        name: "Papi le Gardien du Donjon",
        type: "quest_validator",
        x: 15, // Position par défaut sur la map 4 (donjon slime)
        y: 15,
        px: 15 * TILE_SIZE,
        py: 15 * TILE_SIZE,
        map: 'map4', // Donjon slime
        img: null,
        direction: 0,
        frame: 0,
        lastAnim: 0,
        animDelay: 300,
        dialogues: [
            "Bienvenue dans le donjon slime, jeune héros !",
            "Tu as accompli l'exploit de vaincre le boss terrifiant.",
            "Tu mérites une récompense spéciale pour ta bravoure !"
        ],
        alternativeDialogues: [
            "Depuis la brèche dimensionnelle, des donjons mystérieux sont apparus...",
            "Le donjon slime que tu vois là-bas est l'un d'eux.",
            "Son énergie est instable et les monstres risquent de s'échapper de ce lieu scellé.",
            "Seul un héros courageux pourra rétablir l'équilibre et fermer cette brèche."
        ],
        currentDialogue: 0,
        isTalking: false,
        talkStartTime: 0,
        talkDuration: 4000,
        interactionRange: 2,
        onInteraction: function() {
            
            // Vérifier si une quête peut être validée
            if (typeof canValidateQuestWithPNJ === 'function') {
                const questToValidate = canValidateQuestWithPNJ('papi4');
                
                if (questToValidate) {
                    // Définir les dialogues de validation pour la quête finale
                    if (questToValidate.id === 'slimeBossFinal') {
                        papi4.dialogues = [
                            "Incroyable ! Tu as vaincu le boss terrifiant !",
                            "Tu as sauvé notre monde d'une menace d'un autre univers.",
                            "Tu as prouvé ta valeur. Approche et ouvre le coffre à ma droite !",
                            "Le coffre à ma droite renferme une récompense à la hauteur de ta bravoure."
                        ];
                    }
                    papi4.currentDialogue = 0;
                } else {
                    // Vérifier l'état des quêtes pour déterminer le dialogue approprié
                    if (typeof window.quests !== 'undefined') {
                        const slimeBossFinalCompleted = window.quests.slimeBossFinal && window.quests.slimeBossFinal.completed;
                        
                        if (slimeBossFinalCompleted && window.currentMap === "maison") {
                            // Toutes les quêtes sont terminées et on est dans la maison
                            papi4.dialogues = [
                                "Formidable ! À croire que tu es l'enfant de la prophétie !",
                                "Je n'ai pas les mots... ",
                                "Une longue déstiné t'attend, retrouve moi sur la map à droite.",
                                "C’est ici que s’achèvera notre tout dernier échange."
                                
                            ];
                        } else {
                            // Utiliser les dialogues de la brèche dimensionnelle par défaut
                            papi4.dialogues = papi4.alternativeDialogues;
                        }
                    } else {
                        // Utiliser les dialogues de la brèche dimensionnelle par défaut
                        papi4.dialogues = papi4.alternativeDialogues;
                    }
                    papi4.currentDialogue = 0;
                }
            }
            
            // Démarrer le dialogue
            startPNJDialog(papi4);
        }
    };
    
    // Adapter la position selon la map actuelle
    if (window.currentMap === "maison") {
        papi4.x = 10;
        papi4.y = 4;
        papi4.px = 10 * TILE_SIZE;
        papi4.py = 4 * TILE_SIZE;
    }
    
    pnjs.push(papi4);
    
    // Marquer la position comme occupée
    if (typeof occupy === "function") {
        occupy(papi4.x, papi4.y);
    }
    
    return papi4;
}

// Charger l'image de Papi3
function loadPapi3Image() {
    const papi3 = pnjs.find(p => p.id === 'papi3');
    if (!papi3) return;
    
    papi3.img = new Image();
    papi3.img.onload = function() {
    };
    papi3.img.onerror = function() {
    };
    papi3.img.src = 'assets/pnj/papi.png'; // Utilise la même image que Papi
}

// Charger l'image de Papi4
function loadPapi4Image() {
    const papi4 = pnjs.find(p => p.id === 'papi4');
    if (!papi4) return;
    
    papi4.img = new Image();
    papi4.img.onload = function() {
    };
    papi4.img.onerror = function() {
    };
    papi4.img.src = 'assets/pnj/papi.png'; // Utilise la même image que les autres Papi
}

// Rendre les fonctions accessibles globalement
window.loadPapiImage = loadPapiImage;
window.loadPapi2Image = loadPapi2Image;
window.loadPapi3Image = loadPapi3Image;
window.loadPapi4Image = loadPapi4Image;

// Réinitialiser les états des PNJ lors du changement de personnage
function resetPNJStates() {
    
    // Réinitialiser Papi3
    const papi3 = pnjs.find(p => p.id === 'papi3');
    if (papi3) {
        papi3.slimeBossQuestOffered = false;
        papi3.currentDialogue = 0;
        papi3.isTalking = false;
    }
    
    // Réinitialiser les autres PNJ si nécessaire
    pnjs.forEach(pnj => {
        if (pnj) {
            pnj.currentDialogue = 0;
            pnj.isTalking = false;
        }
    });
    
}

// Exporter la fonction de réinitialisation
window.resetPNJStates = resetPNJStates;

// Vérifier si le joueur est à portée d'interaction avec un PNJ
function checkPNJInteraction() {
    if (!player) return;
    
    pnjs.forEach(pnj => {
        if (!pnj || pnj.hp <= 0) return;
        
        const distance = Math.abs(player.x - pnj.x) + Math.abs(player.y - pnj.y);
        
        if (distance <= pnj.interactionRange) {
            // Le joueur est à portée d'interaction
            if (!pnj.isTalking) {
                startPNJDialog(pnj);
            }
        }
    });
}

// Démarrer un dialogue avec un PNJ
function startPNJDialog(pnj) {
    if (pnj.isTalking) return;
    
    pnj.isTalking = true;
    pnj.talkStartTime = Date.now();
    
    // Exécuter le callback spécial si il existe
    if (pnj.onInteraction && typeof pnj.onInteraction === 'function') {
        pnj.onInteraction();
    }
    
    // Logique spéciale pour Papi1 : utiliser les dialogues alternatifs si la quête est terminée
    if (pnj.id === 'papi' && typeof window.quests !== 'undefined' && 
        window.quests.crowHunt && window.quests.crowHunt.completed) {
        pnj.dialogues = pnj.alternativeDialogues;
        pnj.currentDialogue = 0;
    } else if (pnj.id === 'papi' && typeof window.quests !== 'undefined' && 
               window.quests.crowHunt && window.quests.crowHunt.accepted) {
        // Si la quête est acceptée mais pas terminée, utiliser un dialogue spécial
        pnj.dialogues = [
            "Ah ! Tu as accepté la quête de chasse aux corbeaux !",
            "Va maintenant chasser 5 corbeaux pour prouver ta valeur.",
            "Une fois terminé, va voir Papi sur la map 2 pour valider ta quête !"
        ];
        pnj.currentDialogue = 0;
    }
    
    // Afficher la fenêtre de dialogue modale avec les dialogues actuels du PNJ
    const dialogue = pnj.dialogues[pnj.currentDialogue];
    if (dialogue) {
        showPNJDialogModal(pnj.name, dialogue, null, pnj);
    }
    
}

// Mettre à jour les PNJ
function updatePNJs(ts) {
    pnjs.forEach(pnj => {
        if (!pnj || pnj.hp <= 0) return;
        
        // Pas d'animation pour les PNJ statiques
        
        // Gestion des dialogues
        if (pnj.isTalking) {
            if (ts - pnj.talkStartTime >= pnj.talkDuration) {
                // Fin du dialogue actuel
                pnj.isTalking = false;
                
                // Fermer la fenêtre de dialogue
                hidePNJDialogModal();
                
                // Réinitialiser pour permettre une nouvelle interaction
                pnj.currentDialogue = 0;
            }
        }
    });
}

// Dessiner les PNJ
function drawPNJs(ctx) {
    pnjs.forEach(pnj => {
        if (!pnj || !pnj.img || pnj.hp <= 0) return;
        
        // Position avec les offsets de la map
        const drawX = pnj.px + (window.mapOffsetX || 0);
        const drawY = pnj.py + (window.mapOffsetY || 0);
        
        // Dessiner le PNJ de manière statique
        ctx.drawImage(
            pnj.img,
            0, 0, // Pas d'animation, toujours la première frame
            TILE_SIZE, TILE_SIZE,
            drawX, drawY,
            TILE_SIZE, TILE_SIZE
        );
        
        // Dessiner un indicateur d'interaction si le joueur est proche
        const distance = Math.abs(player.x - pnj.x) + Math.abs(player.y - pnj.y);
        if (distance <= pnj.interactionRange) {
            // Cercle d'interaction
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2, TILE_SIZE/2 + 5, 0, 2 * Math.PI);
            ctx.stroke();
            
            // Texte "Appuyez sur E"
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.strokeText('E', drawX + TILE_SIZE/2, drawY - 10);
            ctx.fillText('E', drawX + TILE_SIZE/2, drawY - 10);
        }
    });
}

// Initialiser les PNJ selon la map
function initPNJs() {
    // Nettoyer les PNJ existants
    pnjs.forEach(pnj => {
        if (typeof release === "function") {
            release(pnj.x, pnj.y);
        }
    });
    pnjs.length = 0;
    
    const currentMap = window.currentMap;
    
    if (currentMap === "map1") {
        // Créer Papi sur la map 1
        createPapi();
        loadPapiImage();
        } else if (currentMap === "map2") {
        // Créer Papi2 sur la map 2
        createPapi2();
        loadPapi2Image();
    } else if (currentMap === "map3") {
        // Créer Papi3 sur la map 3
        createPapi3();
        loadPapi3Image();
    } else if (currentMap === "map4") {
        // Créer Papi4 sur la map 4 (donjon slime)
        createPapi4();
        loadPapi4Image();
    } else if (currentMap === "maison") {
        // Créer Papi4 dans la maison
        createPapi4();
        loadPapi4Image();
    }
    
}

// Afficher la fenêtre de dialogue modale
function showPNJDialogModal(pnjName, dialogue, customCallback = null, pnj = null) {
    // Créer la fenêtre modale si elle n'existe pas
    let modal = document.getElementById('pnj-dialog-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pnj-dialog-modal';
        
        const modalContent = document.createElement('div');
        modalContent.id = 'pnj-dialog-content';
        
        // En-tête avec nom du PNJ
        const header = document.createElement('div');
        header.className = 'pnj-dialog-header';
        
        const pnjIcon = document.createElement('div');
        pnjIcon.className = 'pnj-dialog-icon';
        
        // Créer l'image de Papi
        const pnjImage = document.createElement('img');
        pnjImage.src = 'assets/pnj/papi.png';
        pnjImage.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        `;
        pnjImage.id = 'pnj-dialog-image';
        
        pnjIcon.appendChild(pnjImage);
        
        const pnjNameDiv = document.createElement('div');
        pnjNameDiv.className = 'pnj-dialog-name';
        pnjNameDiv.id = 'pnj-dialog-name';
        
        // Bouton de fermeture (croix)
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.className = 'pnj-dialog-close';
        closeButton.onclick = function() {
            hidePNJDialogModal();
        };
        
        header.appendChild(pnjIcon);
        header.appendChild(pnjNameDiv);
        header.appendChild(closeButton);
        
        // Contenu du dialogue
        const dialogueContent = document.createElement('div');
        dialogueContent.className = 'pnj-dialog-text';
        dialogueContent.id = 'pnj-dialog-text';
        
        // Conteneur pour le texte et le bouton
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 20px;
        `;
        
        // Wrapper pour le texte
        const textWrapper = document.createElement('div');
        textWrapper.style.flex = '1';
        textWrapper.appendChild(dialogueContent);
        
        // Bouton Continuer
        const continueButton = document.createElement('button');
        continueButton.textContent = 'Continuer';
        continueButton.className = 'pnj-dialog-button';
        continueButton.onclick = function() {
            // Récupérer l'ID du PNJ actuel depuis la modale
            const modal = document.getElementById('pnj-dialog-modal');
            const currentPnjId = modal.getAttribute('data-current-pnj-id');
            
            // Cas spécial pour le dialogue de création de personnage (pas de PNJ associé)
            if (!currentPnjId) {
                hidePNJDialogModal();
                if (customCallback) {
                    customCallback();
                }
                return;
            }
            
            // Récupérer le PNJ actuel depuis la liste globale
            const currentPnj = pnjs.find(p => p.id === currentPnjId);
            if (!currentPnj) {
                console.error("PNJ non trouvé:", currentPnjId);
                return;
            }
            
            if (currentPnj.dialogues && currentPnj.currentDialogue < currentPnj.dialogues.length - 1) {
                // Passer au dialogue suivant
                currentPnj.currentDialogue++;
                const nextDialogue = currentPnj.dialogues[currentPnj.currentDialogue];
                if (nextDialogue) {
                    document.getElementById('pnj-dialog-text').textContent = nextDialogue;
                }
            } else {
                // Fin des dialogues
                if (currentPnj.id === 'papi') {
                    if (!window.quests.crowHunt.accepted) {
                        // Papi1 propose la quête
                        if (typeof window.showQuestOffer === 'function') {
                            window.showQuestOffer();
                        }
                    } else {
                        // Papi1 ferme le dialogue normalement (quête déjà acceptée ou terminée)
                        hidePNJDialogModal();
                        if (customCallback) {
                            customCallback();
                        }
                    }
                                 } else if (currentPnj.id === 'papi2') {
                     // Papi2 ferme le dialogue
                     hidePNJDialogModal();
                     
                     // Vérifier si la quête de craft est disponible et proposer APRÈS la fermeture du dialogue
                     if (typeof isQuestAvailable === 'function' && isQuestAvailable('crowCraft')) {
                         if (typeof showCraftQuestOffer === 'function') {
                             showCraftQuestOffer();
                         }
                     }
                     
                     if (customCallback) {
                         customCallback();
                     }
                                 } else if (currentPnj.id === 'papi3') {
                    // Papi3 ferme le dialogue
                    hidePNJDialogModal();
                    
                    // Valider la quête si elle est prête
                    if (typeof validateQuestWithPNJ === 'function') {
                        const questValidated = validateQuestWithPNJ('papi3');
                        
                        // Note: Papi 3 ne se déplace plus automatiquement après validation de la quête slimeBoss
                        // Il se déplacera seulement quand le joueur lui reparle et lui montre le certificat
                        
                        // Si une quête a été validée, proposer la nouvelle quête après
                        if (questValidated) {
                            // Vérifier quelle quête a été validée en regardant l'état des quêtes
                            if (typeof window.quests !== 'undefined') {
                                const crowCraftCompleted = window.quests.crowCraft && window.quests.crowCraft.completed;
                                const slimeBossCompleted = window.quests.slimeBoss && window.quests.slimeBoss.completed;
                                
                                if (crowCraftCompleted && !slimeBossCompleted && typeof isQuestAvailable === 'function' && isQuestAvailable('slimeBoss')) {
                                    // Proposer la quête slimeBoss après avoir validé crowCraft
                                    if (typeof showSlimeBossQuestOffer === 'function') {
                                        showSlimeBossQuestOffer();
                                    }
                                } else if (slimeBossCompleted && typeof isQuestAvailable === 'function' && isQuestAvailable('slimeBossFinal')) {
                                    // Proposer la quête finale après avoir validé slimeBoss
                                    if (typeof showSlimeBossFinalQuestOffer === 'function') {
                                        showSlimeBossFinalQuestOffer();
                                    }
                                }
                            }
                        } else {
                            // Si aucune quête n'a été validée, vérifier si on doit proposer slimeBoss
                            if (typeof window.quests !== 'undefined') {
                                const crowCraftCompleted = window.quests.crowCraft && window.quests.crowCraft.completed;
                                const slimeBossAccepted = window.quests.slimeBoss && window.quests.slimeBoss.accepted;
                                const slimeBossCompleted = window.quests.slimeBoss && window.quests.slimeBoss.completed;
                                
                                if (crowCraftCompleted && !slimeBossAccepted && !slimeBossCompleted && 
                                    typeof isQuestAvailable === 'function' && isQuestAvailable('slimeBoss')) {
                                    // Proposer la quête slimeBoss si elle n'a pas encore été proposée
                                    if (typeof showSlimeBossQuestOffer === 'function') {
                                        showSlimeBossQuestOffer();
                                    } else {
                                        console.error('❌ Fonction showSlimeBossQuestOffer non disponible');
                                    }
                                }
                            }
                        }
                    }
                    
                    if (customCallback) {
                        customCallback();
                    }
                } else if (currentPnj.id === 'papi4') {
                    // Papi4 ferme le dialogue
                    hidePNJDialogModal();
                    
                    // Valider la quête si elle est prête
                    if (typeof validateQuestWithPNJ === 'function') {
                        const questValidated = validateQuestWithPNJ('papi4');
                        
                        if (questValidated) {
                        }
                    }
                    
                    if (customCallback) {
                        customCallback();
                    }
                } else {
                    // Autres PNJ
                    hidePNJDialogModal();
                    if (customCallback) {
                        customCallback();
                    }
                }
            }
        };
        
        contentContainer.appendChild(textWrapper);
        contentContainer.appendChild(continueButton);
        
        modalContent.appendChild(header);
        modalContent.appendChild(contentContainer);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
    
    // Mettre à jour le contenu
    const nameElement = document.getElementById('pnj-dialog-name');
    const textElement = document.getElementById('pnj-dialog-text');
    
    if (nameElement) nameElement.textContent = pnjName;
    if (textElement) textElement.textContent = dialogue;
    
    // Stocker l'ID du PNJ actuel dans la modale
    if (pnj && pnj.id) {
        modal.setAttribute('data-current-pnj-id', pnj.id);
    }
    
    // Afficher la modale
    modal.style.display = 'flex';
}

// Masquer la fenêtre de dialogue modale
function hidePNJDialogModal() {
    const modal = document.getElementById('pnj-dialog-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Réinitialiser seulement l'état de conversation, pas le currentDialogue
    pnjs.forEach(pnj => {
        if (pnj) {
            pnj.isTalking = false;
            // Ne pas réinitialiser currentDialogue pour préserver la progression
        }
    });
    
}

// Gestion des touches pour interagir avec les PNJ
function handlePNJInteraction(key) {
    if (key === 'e' || key === 'E') {
        checkPNJInteraction();
    }
}

// Afficher le dialogue de création de personnage
function showCharacterCreationDialog() {
    // Vérifier si le dialogue a déjà été affiché
    if (window.characterCreationDialogShown) {
        return;
    }
    
    const dialogue = "Ooh, encore un nouveau ! Tu dois te demander ce que tu fais ici, jeune âme. Il y a plusieurs perturbations entre chaque univers et plusieurs jeunes âmes se retrouvent égarées dans d'autres univers comme toi. Viens me voir, je vais tout t'expliquer.";
    
    // Marquer que le dialogue a été affiché
    window.characterCreationDialogShown = true;
    
    showPNJDialogModal("Papi", dialogue, function() {
        // Callback après fermeture du dialogue - le joueur reste en jeu
        // S'assurer que la fenêtre est bien fermée
        hidePNJDialogModal();
    }, null); // Pas de PNJ associé pour le dialogue de création
}

// Réinitialiser le flag du dialogue de création de personnage
function resetCharacterCreationDialog() {
    window.characterCreationDialogShown = false;
}

// Fonction pour réinitialiser les propriétés des PNJ
function resetPNJProperties() {
    
    // Réinitialiser les propriétés de Papi3
    const papi3 = pnjs.find(p => p.id === 'papi3');
    if (papi3) {
        papi3.slimeBossQuestOffered = false;
        papi3.hasMoved = false;
    }
    
    // Réinitialiser les propriétés de Papi4
    const papi4 = pnjs.find(p => p.id === 'papi4');
    if (papi4) {
        papi4.slimeBossFinalQuestOffered = false;
    }
    
}

// Export global
window.pnjs = pnjs;
window.initPNJs = initPNJs;
window.updatePNJs = updatePNJs;
window.drawPNJs = drawPNJs;
window.handlePNJInteraction = handlePNJInteraction;
window.showPNJDialogModal = showPNJDialogModal;
window.hidePNJDialogModal = hidePNJDialogModal;
window.showCharacterCreationDialog = showCharacterCreationDialog;
window.resetCharacterCreationDialog = resetCharacterCreationDialog; 
window.resetPNJProperties = resetPNJProperties; 
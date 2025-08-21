// PNJ Mentor Mage - Permet de changer de classe vers Mage
class MentorMage {
    constructor(x, y, options = {}) {
        // Coordonnées en tiles (cases)
        this.x = x;
        this.y = y;
        // Coordonnées en pixels (pour le rendu)
        this.px = x * TILE_SIZE;
        this.py = y * TILE_SIZE;
        
        // Debug: afficher les coordonnées calculées
        console.log('🧙‍♂️ MentorMage créé:');
        console.log('  - Coordonnées tiles (x, y):', x, y);
        console.log('  - Coordonnées pixels (px, py):', this.px, this.py);
        console.log('  - TILE_SIZE:', TILE_SIZE);
        this.width = 32;
        this.height = 32;
        this.sprite = 'assets/pnj/mentormage.png';
        this.spriteImage = null; // Image chargée (comme papi.img)
        this.name = 'Maître des Arcanes';
        this.type = 'mentor';
        this.interactionRange = 2; // Même taille que Papi (2 tiles)
        this.isInteracting = false;
        this.dialogueOpen = false;
        
        // Options par défaut
        this.options = {
            cost: 100, // Coût en or pour changer de classe
            levelRequired: 20, // Niveau minimum requis (20)
            ...options
        };
        
        // État du PNJ
        this.state = 'idle';
        this.animationFrame = 0;
        this.lastUpdate = Date.now();
        
        // Charger l'image immédiatement
        this.loadSprite();
        
        // Marquer la position comme occupée (collision)
        if (typeof occupy === "function") {
            occupy(this.x, this.y);
        }
    }
    
    loadSprite() {
        if (this.sprite && !this.spriteImage) {
            this.spriteImage = new Image();
            this.spriteImage.onload = () => {
                console.log('🧙‍♂️ Image du MentorMage chargée avec succès');
            };
            this.spriteImage.onerror = () => {
                console.error('❌ Erreur lors du chargement de l\'image du MentorMage');
            };
            this.spriteImage.src = this.sprite;
        }
    }
    
    update() {
        // Animation simple
        const now = Date.now();
        if (now - this.lastUpdate > 1000) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.lastUpdate = now;
        }
        
        // Vérifier si le joueur est proche (même système que Papi)
        if (window.player) {
            // Distance en tiles (comme Papi)
            const distance = Math.abs(window.player.x - this.x) + Math.abs(window.player.y - this.y);
            
            // Debug: afficher les positions
            if (this.lastUpdate % 3000 < 16) { // Toutes les 3 secondes
                console.log('🧙‍♂️ Debug MentorMage:');
                console.log('  - PNJ position (px, py):', this.px, this.py);
                console.log('  - PNJ position (x, y):', this.x, this.y);
                console.log('  - Player position (x, y):', window.player.x, window.player.y);
                console.log('  - Player position (px, py):', window.player.px, window.player.py);
                console.log('  - Distance calculée:', distance);
                console.log('  - Interaction range:', this.interactionRange);
                console.log('  - Distance en tiles:', Math.abs(this.x - window.player.x) + Math.abs(this.y - window.player.y));
            }
            
            // Vérifier si le joueur entre dans la zone d'interaction
            if (distance <= this.interactionRange && !this.isInteracting) {
                console.log('🧙‍♂️ Joueur proche du MentorMage !');
                this.showInteractionPrompt();
            }
            // Vérifier si le joueur sort de la zone d'interaction
            else if (distance > this.interactionRange && this.isInteracting) {
                console.log('🧙‍♂️ Joueur sort de la zone d\'interaction du MentorMage');
                this.hideInteractionPrompt();
            }
        }
    }
    
    draw(ctx) {
        // Dessiner le sprite du PNJ (utiliser l'image préchargée)
        if (this.spriteImage) {
            ctx.drawImage(this.spriteImage, this.px, this.py, this.width, this.height);
        }
        
        // Dessiner le nom au-dessus
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.px + this.width/2, this.py - 10);
        
        // Dessiner l'indicateur d'interaction si le joueur est proche
        if (this.isInteracting) {
            ctx.fillStyle = 'yellow';
            ctx.font = '10px Arial';
            ctx.fillText('Appuyez sur E', this.px + this.width/2, this.py + this.height + 20);
        }
        
        // Debug: dessiner la zone d'interaction (cercle rouge - 0.75 tile)
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.px + this.width/2, this.py + this.height/2, TILE_SIZE * 0.75, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    showInteractionPrompt() {
        console.log('🧙‍♂️ showInteractionPrompt appelé !');
        this.isInteracting = true;
        
        // Écouter la touche E pour interagir
        this.handleKeyPress = (e) => {
            console.log('🧙‍♂️ Touche pressée:', e.key);
            if (e.key === 'e' || e.key === 'E') {
                console.log('🧙‍♂️ Touche E détectée, démarrage interaction !');
                this.startInteraction();
                document.removeEventListener('keydown', this.handleKeyPress);
            }
        };
        
        document.addEventListener('keydown', this.handleKeyPress);
    }
    
    hideInteractionPrompt() {
        console.log('🧙‍♂️ hideInteractionPrompt appelé !');
        this.isInteracting = false;
        
        // Supprimer l'écouteur de touche E
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    
    startInteraction() {
        console.log('🧙‍♂️ startInteraction appelé !');
        console.log('🧙‍♂️ Niveau du joueur:', window.player ? window.player.level : 'undefined');
        console.log('🧙‍♂️ Niveau requis:', this.options.levelRequired);
        
        this.isInteracting = false;
        this.dialogueOpen = true;
        
        // Vérifier le niveau du joueur
        if (window.player && window.player.level >= this.options.levelRequired) {
            console.log('🧙‍♂️ Niveau suffisant, affichage dialogue changement de classe');
            this.showClassChangeDialog();
        } else {
            console.log('🧙‍♂️ Niveau insuffisant, affichage dialogue niveau requis');
            this.showLevelRequirementDialog();
        }
    }
    
    showClassChangeDialog() {
        // Créer l'interface de dialogue pour le changement de classe
        this.createDialogUI();
    }
    
    showLevelRequirementDialog() {
        // Créer l'interface de dialogue pour niveau insuffisant
        this.createLevelRequirementDialog();
    }
    
    createDialogUI() {
        // Interface de base pour le changement de classe
        const currentClass = window.player ? window.player.class : 'aventurier';
        const currentLevel = window.player ? window.player.level : 1;
        const currentGold = window.player ? window.player.pecka : 0;
        const canAfford = currentGold >= this.options.cost;
        const canChange = currentLevel >= this.options.levelRequired && canAfford && currentClass !== 'mage';
        
        const dialog = document.createElement('div');
        dialog.id = 'mentor-mage-dialog';
        dialog.className = 'mentor-dialog';
        dialog.innerHTML = `
            <div class="dialog-header">
                <h3>🧙‍♂️ ${this.name}</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="dialog-content">
                <div class="current-status">
                    <p><strong>Ton statut actuel :</strong></p>
                    <p>🏃 Classe : ${currentClass.charAt(0).toUpperCase() + currentClass.slice(1)}</p>
                    <p>📊 Niveau : ${currentLevel}</p>
                    <p>💰 Or : ${currentGold} pecka</p>
                </div>
                
                <div class="class-info">
                    <h4>🧙‍♂️ Classe Mage</h4>
                    <p>Une classe spécialisée dans la magie et les sorts.</p>
                    <p><em>Plus tard : sorts magiques, bonus d'intelligence...</em></p>
                </div>
                
                <div class="requirements">
                    <p><strong>📋 Conditions requises :</strong></p>
                    <p>✅ Niveau ${this.options.levelRequired}+ : ${currentLevel >= this.options.levelRequired ? '✅' : '❌'}</p>
                    <p>💰 Coût : ${this.options.cost} pecka ${canAfford ? '✅' : '❌'}</p>
                    <p>🔄 Changement possible : ${canChange ? '✅' : '❌'}</p>
                </div>
                
                <button class="change-class-btn ${canChange ? '' : 'disabled'}" 
                        onclick="${canChange ? 'window.mentorMage.changeToMage()' : 'alert(\'❌ Conditions non remplies pour changer de classe !\')'}"
                        ${canChange ? '' : 'disabled'}>
                    ${currentClass === 'mage' ? 'Tu es déjà Mage !' : 'Devenir Mage'}
                </button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Stocker la référence pour la fermeture
        window.mentorMage = this;
    }
    
    createLevelRequirementDialog() {
        // Interface pour niveau insuffisant
        const dialog = document.createElement('div');
        dialog.id = 'mentor-mage-level-dialog';
        dialog.className = 'mentor-dialog level-requirement';
        
        const currentLevel = window.player ? window.player.level : 1;
        const levelProgress = window.player ? (window.player.xp % 10) / 10 : 0;
        
        dialog.innerHTML = `
            <div class="dialog-header">
                <h3>🧙‍♂️ ${this.name}</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="dialog-content">
                <div class="level-warning">
                    <h4>⚠️ Niveau Insuffisant</h4>
                    <p>Je ne peux pas encore t'initier aux arts magiques...</p>
                    <p>Tu dois atteindre le niveau <strong>${this.options.levelRequired}</strong> pour devenir Mage.</p>
                </div>
                
                <div class="current-level">
                    <div class="level-display">Niveau ${currentLevel}</div>
                    <div class="level-progress">
                        <div class="level-progress-fill" style="width: ${levelProgress * 100}%"></div>
                    </div>
                    <p>Progression vers le niveau ${currentLevel + 1}</p>
                </div>
                
                <p style="text-align: center; color: #95a5a6; font-style: italic;">
                    Continue ton aventure pour gagner de l'expérience et revenir me voir !
                </p>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Stocker la référence pour la fermeture
        window.mentorMage = this;
    }
    
    changeToMage() {
        console.log('🧙‍♂️ Changement vers la classe Mage...');
        
        // Vérifier que le joueur existe
        if (!window.player) {
            console.error('❌ Joueur non trouvé');
            return;
        }
        
        // Vérifier le niveau requis
        if (window.player.level < this.options.levelRequired) {
            console.error('❌ Niveau insuffisant pour changer de classe');
            return;
        }
        
        // Vérifier l'or requis
        if (window.player.pecka < this.options.cost) {
            console.error('❌ Or insuffisant pour changer de classe');
            alert(`❌ Tu n'as pas assez d'or ! Il te faut ${this.options.cost} pecka pour devenir Mage.`);
            return;
        }
        
        // Vérifier que le joueur n'est pas déjà Mage
        if (window.player.class === 'mage') {
            console.log('🧙‍♂️ Le joueur est déjà Mage');
            alert('🧙‍♂️ Tu es déjà un Mage !');
            return;
        }
        
        // Effectuer le changement de classe
        console.log('🧙‍♂️ Changement de classe en cours...');
        console.log('  - Classe actuelle:', window.player.class);
        console.log('  - Nouvelle classe: mage');
        console.log('  - Coût payé:', this.options.cost, 'pecka');
        
        // Changer la classe
        window.player.class = 'mage';
        
        // Déduire l'or
        window.player.pecka -= this.options.cost;
        
        // Fermer le dialogue
        const dialog = document.getElementById('mentor-mage-dialog');
        if (dialog) {
            dialog.remove();
        }
        
        this.dialogueOpen = false;
        
        // Afficher le message de succès
        alert('🎉 Félicitations ! Tu es maintenant un Mage !\n\n✨ Tu as débloqué l\'accès aux sorts magiques.\n💰 Coût payé : ' + this.options.cost + ' pecka');
        
        // Sauvegarder automatiquement le changement
        if (typeof autoSaveOnEvent === 'function') {
            autoSaveOnEvent();
        } else if (typeof savePlayerData === 'function' && window.currentCharacterId) {
            savePlayerData(window.currentCharacterId);
        }
        
        // Mettre à jour l'apparence du joueur
        if (window.playerAppearanceManager) {
            window.playerAppearanceManager.forceUpdate();
        }
        
        console.log('✅ Changement de classe réussi !');
        console.log('  - Nouvelle classe:', window.player.class);
        console.log('  - Or restant:', window.player.pecka);
    }
    
    // Méthode pour nettoyer les événements
    destroy() {
        // Libérer la position (collision)
        if (typeof release === "function") {
            release(this.x, this.y);
        }
        
        // Nettoyer les événements et interfaces
        const dialog = document.getElementById('mentor-mage-dialog');
        if (dialog) {
            dialog.remove();
        }
        
        const levelDialog = document.getElementById('mentor-mage-level-dialog');
        if (levelDialog) {
            levelDialog.remove();
        }
    }
}

// Exporter la classe
window.MentorMage = MentorMage;

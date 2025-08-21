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
        const dialog = document.createElement('div');
        dialog.id = 'mentor-mage-dialog';
        dialog.className = 'mentor-dialog';
        dialog.innerHTML = `
            <div class="dialog-header">
                <h3>🧙‍♂️ ${this.name}</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="dialog-content">
                <p>Bienvenue, jeune aventurier ! Je peux t'initier aux arts magiques...</p>
                <div class="class-info">
                    <h4>Classe Mage</h4>
                    <ul>
                        <li>✨ Intelligence +20%</li>
                        <li>🔥 Dégâts magiques +20%</li>
                        <li>🛡️ Défense physique -10%</li>
                        <li>⚡ Vitesse -15%</li>
                    </ul>
                </div>
                <div class="requirements">
                    <p><strong>Conditions :</strong></p>
                    <p>Niveau ${this.options.levelRequired}+ | Coût : ${this.options.cost} or</p>
                </div>
                <button class="change-class-btn" onclick="window.mentorMage.changeToMage()">
                    Devenir Mage
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
        // Logique de changement de classe (à implémenter)
        console.log('🧙‍♂️ Changement vers la classe Mage...');
        
        // Fermer le dialogue
        const dialog = document.getElementById('mentor-mage-dialog');
        if (dialog) {
            dialog.remove();
        }
        
        this.dialogueOpen = false;
        
        // TODO: Implémenter la logique de changement de classe
        alert('Fonctionnalité de changement de classe à implémenter !');
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

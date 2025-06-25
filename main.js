/**
 * Draft Kicker: 4th and Inches
 * A mobile-friendly football field goal kicking game
 * 
 * @author Draft Kicker Team
 * @version 1.0.0
 */

class DraftKicker {
    constructor() {
        // DOM elements
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.teamName = '';
        this.score = 0;
        this.wind = 0;
        this.isKicking = false;
        this.startY = 0;
        this.gameActive = false;
        this.gameOver = false;
        
        // Leaderboards
        this.localLeaderboard = this.loadLocalLeaderboard();
        this.globalLeaderboard = [];
        this.showingGlobal = false;
        
        // Animation
        this.animationId = null;
        
        // Timer properties
        this.gameTime = 60;
        this.gameTimer = null;
        
        // Ball physics
        this.ball = {
            x: 200,
            y: 550,
            vx: 0,
            vy: 0,
            gravity: 0.5,
            windEffect: 0,
            trail: []
        };
        
        // Goal post dimensions
        this.goalpost = {
            leftX: 175,
            rightX: 225,
            topY: 50,
            bottomY: 130
        };
        
        // Initialize game
        this.initializeGame();
        this.loadGlobalLeaderboard();
        this.updateLeaderboardDisplay();
    }
    
    /**
     * Initialize game event listeners and setup
     */
    initializeGame() {
        // Start game button
        document.getElementById('startGame').addEventListener('click', () => {
            this.handleStartGame();
        });
        
        // Enter key on team name input
        document.getElementById('teamName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleStartGame();
            }
        });
        
        // Leaderboard tabs
        document.getElementById('localTab').addEventListener('click', () => {
            this.showingGlobal = false;
            this.updateTabButtons();
            this.updateLeaderboardDisplay();
        });
        
        document.getElementById('globalTab').addEventListener('click', () => {
            this.showingGlobal = true;
            this.updateTabButtons();
            this.updateLeaderboardDisplay();
        });
        
        this.setupCanvasEvents();
    }
    
    /**
     * Handle start game button click
     */
    handleStartGame() {
        const nameInput = document.getElementById('teamName');
        const teamName = nameInput.value.trim();
        
        if (!teamName) {
            nameInput.focus();
            this.showMessage('Please enter your team name!', 'error');
            return;
        }
        
        if (teamName.length < 2) {
            nameInput.focus();
            this.showMessage('Team name must be at least 2 characters!', 'error');
            return;
        }
        
        this.teamName = teamName;
        document.getElementById('teamInput').style.display = 'none';
        document.getElementById('gameArea').style.display = 'block';
        this.setupCanvas();
        this.startGameTimer();
        this.generateWind();
        this.drawField();
    }
    
    /**
     * Setup canvas event listeners for touch and mouse
     */
    setupCanvasEvents() {
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.isKicking || !this.gameActive) return;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.startY = touch.clientY - rect.top;
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.isKicking || !this.gameActive) return;
            
            const touch = e.changedTouches[0];
            const rect = this.canvas.getBoundingClientRect();
            const endY = touch.clientY - rect.top;
            const power = this.startY - endY;
            
            if (power > 0) {
                this.handleKick(power);
            }
        }, { passive: false });
        
        // Mouse events for desktop
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.isKicking || !this.gameActive) return;
            
            const rect = this.canvas.getBoundingClientRect();
            this.startY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            if (this.isKicking || !this.gameActive) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const endY = e.clientY - rect.top;
            const power = this.startY - endY;
            
            if (power > 0) {
                this.handleKick(power);
            }
        });
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    /**
     * Start the game timer
     */
    startGameTimer() {
        this.gameActive = true;
        this.gameTime = 60;
        this.updateTimerDisplay();
        
        this.gameTimer = setInterval(() => {
            this.gameTime--;
            this.updateTimerDisplay();
            
            if (this.gameTime <= 10) {
                document.getElementById('timerValue').classList.add('warning');
            }
            
            if (this.gameTime <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    /**
     * Update timer display
     */
    updateTimerDisplay() {
        document.getElementById('timerValue').textContent = this.gameTime;
    }
    
    /**
     * End the game
     */
    endGame() {
        this.gameActive = false;
        this.gameOver = true;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        // Final score update to leaderboards
        this.updateLocalLeaderboard();
        this.updateGlobalLeaderboard();
        
        // Show game over message
        const resultEl = document.getElementById('kickResult');
        resultEl.innerHTML = `🎯 GAME OVER!<br>Final Score: ${this.score}`;
        resultEl.style.color = '#ffd700';
        
        // Show restart option after a delay
        setTimeout(() => {
            this.showRestartOption();
        }, 3000);
    }
    
    /**
     * Show restart game option
     */
    showRestartOption() {
        const resultEl = document.getElementById('kickResult');
        resultEl.innerHTML = `
            🎯 GAME OVER! Final Score: ${this.score}<br>
            <button onclick="location.reload()" style="
                margin-top: 10px;
                padding: 10px 20px;
                background: #ffd700;
                color: #1a472a;
                border: none;
                border-radius: 5px;
                font-family: 'Orbitron', monospace;
                font-weight: 700;
                cursor: pointer;
            ">PLAY AGAIN</button>
        `;
    }
    
    /**
     * Setup canvas dimensions
     */
    setupCanvas() {
        this.canvas.width = 400;
        this.canvas.height = 600;
        
        // Set canvas display size for mobile
        const containerWidth = this.canvas.parentElement.clientWidth;
        if (containerWidth < 400) {
            this.canvas.style.width = '100%';
            this.canvas.style.height = 'auto';
        }
    }
    
    /**
     * Generate random wind conditions
     */
    generateWind() {
        this.wind = Math.floor(Math.random() * 11) - 5; // -5 to 5
        const windDisplay = document.getElementById('windValue');
        const direction = this.wind < 0 ? '⬅️' : this.wind > 0 ? '➡️' : '🎯';
        windDisplay.textContent = `${direction} ${Math.abs(this.wind)}`;
    }
    
    /**
     * Draw the football field and game elements
     */
    drawField() {
        const ctx = this.ctx;
        
        // Clear canvas
        ctx.clearRect(0, 0, 400, 600);
        
        // Field background
        ctx.fillStyle = '#228b22';
        ctx.fillRect(0, 0, 400, 600);
        
        // Yard lines
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        for (let i = 50; i < 600; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(400, i);
            ctx.stroke();
        }

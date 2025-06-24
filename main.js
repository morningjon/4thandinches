class DraftKicker {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.teamName = '';
        this.score = 0;
        this.wind = 0;
        this.isKicking = false;
        this.startY = 0;
        this.leaderboard = this.loadLeaderboard();
        
        this.football = {
            x: 200,
            y: 550,
            width: 30,
            height: 20
        };
        
        this.goalpost = {
            x: 175,
            y: 50,
            width: 50,
            height: 80
        };
        
        this.initializeGame();
        this.updateLeaderboardDisplay();
    }
    
    initializeGame() {
        document.getElementById('startGame').addEventListener('click', () => {
            const nameInput = document.getElementById('teamName');
            if (nameInput.value.trim()) {
                this.teamName = nameInput.value.trim();
                document.getElementById('teamInput').style.display = 'none';
                document.getElementById('gameArea').style.display = 'block';
                this.setupCanvas();
                this.generateWind();
                this.drawField();
            }
        });
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.startY = touch.clientY - rect.top;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const rect = this.canvas.getBoundingClientRect();
            const endY = touch.clientY - rect.top;
            this.handleKick(this.startY - endY);
        });
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.startY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const endY = e.clientY - rect.top;
            this.handleKick(this.startY - endY);
        });
    }
    
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = 400;
        this.canvas.height = 600;
    }
    
    generateWind() {
        this.wind = Math.floor(Math.random() * 11) - 5; // -5 to 5
        const windDisplay = document.getElementById('windValue');
        const direction = this.wind < 0 ? '⬅️' : this.wind > 0 ? '➡️' : '🎯';
        windDisplay.textContent = `${direction} ${Math.abs(this.wind)}`;
    }
    
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
        
        // Hash marks
        ctx.lineWidth = 1;
        for (let i = 25; i < 600; i += 25) {
            for (let j = 50; j < 400; j += 50) {
                ctx.beginPath();
                ctx.moveTo(j - 10, i);
                ctx.lineTo(j + 10, i);
                ctx.stroke();
            }
        }
        
        // Goal posts
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        
        // Left post
        ctx.beginPath();
        ctx.moveTo(175, 50);
        ctx.lineTo(175, 130);
        ctx.stroke();
        
        // Right post
        ctx.beginPath();
        ctx.moveTo(225, 50);
        ctx.lineTo(225, 130);
        ctx.stroke();
        
        // Crossbar
        ctx.beginPath();
        ctx.moveTo(175, 130);
        ctx.lineTo(225, 130);
        ctx.stroke();
        
        // Football
        this.drawFootball();
    }
    
    drawFootball() {
        const ctx = this.ctx;
        const { x, y, width, height } = this.football;
        
        // Football body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(x, y, width/2, height/2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Football laces
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x, y + 8);
        ctx.stroke();
        
        // Lace marks
        ctx.lineWidth = 1;
        for (let i = -6; i <= 6; i += 3) {
            ctx.beginPath();
            ctx.moveTo(x - 3, y + i);
            ctx.lineTo(x + 3, y + i);
            ctx.stroke();
        }
    }
    
    handleKick(power) {
        if (this.isKicking || power < 20) return; // Minimum swipe threshold
        
        this.isKicking = true;
        
        // Normalize power (20-200 pixel swipe range)
        const normalizedPower = Math.min(Math.max(power, 20), 200) / 200;
        
        // Success calculation: higher power and lower wind = better chance
        const windPenalty = Math.abs(this.wind) * 0.8;
        const powerBonus = normalizedPower * 8;
        const randomFactor = Math.random() * 10;
        
        const success = (powerBonus + randomFactor) > (5 + windPenalty);
        
        if (success) {
            this.score++;
            this.playSuccessEffect();
            this.playSound('cheer');
        } else {
            this.playFailEffect();
            this.playSound('boo');
        }
        
        document.getElementById('scoreValue').textContent = this.score;
        
        // Reset for next kick
        setTimeout(() => {
            this.isKicking = false;
            this.generateWind();
            this.drawField();
            
            if (success) {
                this.updateLeaderboard();
            }
        }, 2000);
    }
    
    playSuccessEffect() {
        // Golden circle effect
        const effect = document.createElement('div');
        effect.className = 'kick-effect success-effect';
        effect.style.left = `${this.football.x - 25}px`;
        effect.style.top = `${this.football.y - 25}px`;
        effect.style.width = '50px';
        effect.style.height = '50px';
        
        const rect = this.canvas.getBoundingClientRect();
        effect.style.position = 'absolute';
        effect.style.left = `${rect.left + this.football.x - 25}px`;
        effect.style.top = `${rect.top + this.football.y - 25}px`;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            document.body.removeChild(effect);
        }, 1000);
        
        // Draw success on canvas
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(this.football.x, this.football.y, 25, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    playFailEffect() {
        // Red flash effect
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(this.football.x, this.football.y, 30, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    playSound(type) {
        // Placeholder for audio - files would need to be provided
        try {
            const audio = new Audio(`${type}.mp3`);
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Audio not available'));
        } catch (e) {
            console.log('Audio not available');
        }
    }
    
    loadLeaderboard() {
        try {
            const saved = localStorage.getItem('draftKickerLeaderboard');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }
    
    saveLeaderboard() {
        try {
            localStorage.setItem('draftKickerLeaderboard', JSON.stringify(this.leaderboard));
        } catch (e) {
            console.log('Could not save leaderboard');
        }
    }
    
    updateLeaderboard() {
        const existingIndex = this.leaderboard.findIndex(entry => entry.team === this.teamName);
        
        if (existingIndex !== -1) {
            this.leaderboard[existingIndex].score = Math.max(this.leaderboard[existingIndex].score, this.score);
        } else {
            this.leaderboard.push({
                team: this.teamName,
                score: this.score
            });
        }
        
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 10); // Top 10
        
        this.saveLeaderboard();
        this.updateLeaderboardDisplay();
    }
    
    updateLeaderboardDisplay() {
        const list = document.getElementById('leaderboardList');
        
        if (this.leaderboard.length === 0) {
            list.innerHTML = '<li>No scores yet - be the first!</li>';
            return;
        }
        
        list.innerHTML = this.leaderboard
            .map(entry => `<li>${entry.team}: ${entry.score} successful kicks</li>`)
            .join('');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DraftKicker();
});

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}

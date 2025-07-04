const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbz0lj_OCd9gJ8Ih2q9pSfEJ4rozs18pGFt1xRRCOLwR1hw2Of9FSX-eLz4pCVxOzZwREA/exec";  // Updated API URL

class DraftKicker {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        // This will attempt to load the team name from local storage
        this.teamName = this.loadTeamName() || ''; 
        this.score = 0;
        this.wind = 0;
        this.isKicking = false;
        this.startY = 0;
        this.localLeaderboard = this.loadLocalLeaderboard();
        this.globalLeaderboard = [];
        this.showingGlobal = false;
        this.animationId = null;

        this.gameTime = 120; // Timer set to 120 seconds
        this.gameTimer = null;
        this.gameActive = false;

        this.ball = {
            x: 200,
            y: 550,
            vx: 0,
            vy: 0,
            gravity: 0.5,
            windEffect: 0,
            trail: []
        };

        // Goalpost dimensions: 150 to 250
        this.goalpost = {
            leftX: 150, 
            rightX: 250, 
            topY: 50,
            bottomY: 130
        };

        this.initializeGame();
        this.loadGlobalLeaderboard();
        this.updateLeaderboardDisplay();

        // Set the team name input value if already stored, and start the game if a name exists
        const nameInput = document.getElementById('teamName');
        if (nameInput) { // Check if nameInput exists before accessing its value
            nameInput.value = this.teamName;
        }
        if (this.teamName) {
            document.getElementById('teamInput').style.display = 'none';
            document.getElementById('gameArea').style.display = 'block';
            this.setupCanvas();
            this.startGameTimer();
            this.generateWind();
            this.drawField();
        }
    }

    initializeGame() {
        document.getElementById('startGame').addEventListener('click', () => {
            const nameInput = document.getElementById('teamName');
            if (nameInput.value.trim()) {
                this.teamName = nameInput.value.trim();
                this.saveTeamName(this.teamName);
                document.getElementById('teamInput').style.display = 'none';
                document.getElementById('gameArea').style.display = 'block';
                this.setupCanvas();
                this.startGameTimer();
                this.generateWind();
                this.drawField();
            }
        });

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

        // "Next Game" button functionality
        document.getElementById('nextGame').addEventListener('click', () => {
            this.resetGame();
        });

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.isKicking) return;
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.startY = touch.clientY - rect.top;
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.isKicking) return;
            const touch = e.changedTouches[0];
            const rect = this.canvas.getBoundingClientRect();
            const endY = touch.clientY - rect.top;
            this.handleKick(this.startY - endY);
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (this.isKicking) return;
            const rect = this.canvas.getBoundingClientRect();
            this.startY = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (this.isKicking) return;
            const rect = this.canvas.getBoundingClientRect();
            const endY = e.clientY - rect.top;
            this.handleKick(this.startY - endY);
        });
    }

    startGameTimer() {
        this.gameActive = true;
        this.gameTime = 120; // Timer set to 120 seconds
        this.updateTimerDisplay();
        
        document.getElementById('nextGame').style.display = 'none'; 

        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.style.display = 'block';
        }
        const timerValue = document.getElementById('timerValue');
        if (timerValue) {
            timerValue.classList.remove('warning');
        }

        if (this.gameTimer) clearInterval(this.gameTimer);

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

    updateTimerDisplay() {
        const timerValueSpan = document.getElementById('timerValue');
        if (timerValueSpan) {
            timerValueSpan.textContent = this.gameTime;
        }
    }

    endGame() {
        this.gameActive = false;
        if (this.gameTimer) clearInterval(this.gameTimer);
        this.updateLocalLeaderboard();
        this.updateGlobalLeaderboard();

        const resultEl = document.getElementById('kickResult');
        resultEl.innerHTML = `🎯 GAME OVER!<br>Final Score: ${this.score}`;
        resultEl.style.color = '#ffd700';
        
        document.getElementById('nextGame').style.display = 'block'; 
    }

    resetGame() {
        this.score = 0;
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('kickResult').textContent = '';
        
        this.ball = {
            x: 200,
            y: 550,
            vx: 0,
            vy: 0,
            gravity: 0.5,
            windEffect: 0,
            trail: []
        };
        this.isKicking = false;
        this.startGameTimer();
        this.generateWind();
        this.drawField();
    }

    setupCanvas() {
        this.canvas.width = 400;
        this.canvas.height = 600;
    }

    generateWind() {
        // Wind range is -3 to +3
        this.wind = Math.floor(Math.random() * 7) - 3; 
        const windDisplay = document.getElementById('windValue');
        const direction = this.wind < 0 ? '⬅️' : this.wind > 0 ? '➡️' : '🎯';
        windDisplay.textContent = `${direction} ${Math.abs(this.wind)}`;
    }

    drawField() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, 400, 600);
        ctx.fillStyle = '#228b22';
        ctx.fillRect(0, 0, 400, 600);

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        for (let i = 50; i < 600; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(400, i);
            ctx.stroke();
        }

        ctx.lineWidth = 1;
        for (let i = 25; i < 600; i += 25) {
            for (let j = 50; j < 400; j += 50) {
                ctx.beginPath();
                ctx.moveTo(j - 10, i);
                ctx.lineTo(j + 10, i);
                ctx.stroke();
            }
        }

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(this.goalpost.leftX, this.goalpost.topY);
        this.ctx.lineTo(this.goalpost.leftX, this.goalpost.bottomY);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(this.goalpost.rightX, this.goalpost.topY);
        this.ctx.lineTo(this.goalpost.rightX, this.goalpost.bottomY);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(this.goalpost.leftX, this.goalpost.bottomY);
        this.ctx.lineTo(this.goalpost.rightX, this.goalpost.bottomY);
        this.ctx.stroke();

        this.drawFootball();
    }

    drawFootball() {
        const ctx = this.ctx;
        const { x, y } = this.ball;
        const width = 30;
        const height = 20;

        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(x, y, width / 2, height / 2, 0, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x, y + 8);
        ctx.stroke();

        ctx.lineWidth = 1;
        for (let i = -6; i <= 6; i += 3) {
            ctx.beginPath();
            ctx.moveTo(x - 3, y + i);
            ctx.lineTo(x + 3, y + i);
            ctx.stroke();
        }
    }

    handleKick(power) {
        if (this.isKicking || power < 30 || !this.gameActive) return;
        this.isKicking = true;
        document.getElementById('kickResult').textContent = '';

        const normalizedPower = Math.min(Math.max(power, 30), 250) / 250;
        this.ball.vy = -normalizedPower * 16 - 8;
        this.ball.vx = Math.random() * 2 - 1;

        // Conditional wind effect multiplier: 20% reduction for Wind 3
        const windMultiplier = (Math.abs(this.wind) === 3) ? 0.08 : 0.1; 
        this.ball.windEffect = this.wind * windMultiplier;

        this.ball.trail = [];

        this.animateKick();
    }

    animateKick() {
        this.drawField();
        this.ball.vy += this.ball.gravity;
        this.ball.vx += this.ball.windEffect;
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
        if (this.ball.trail.length > 8) this.ball.trail.shift();

        this.ball.trail.forEach((point, index) => {
            const alpha = (index + 1) / this.ball.trail.length * 0.5;
            this.ctx.fillStyle = `rgba(139, 69, 19, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            this.ctx.fill();
        });

        this.drawFootball();

        if (this.ball.y <= this.goalpost.bottomY && this.ball.vy < 0) {
            const success = this.ball.x >= this.goalpost.leftX && this.ball.x <= this.goalpost.rightX;
            this.finishKick(success);
            return;
        }

        if (this.ball.y > 600 || this.ball.x < -50 || this.ball.x > 450) {
            this.finishKick(false);
            return;
        }

        this.animationId = requestAnimationFrame(() => this.animateKick());
    }

    finishKick(success) {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        const resultEl = document.getElementById('kickResult');

        if (success) {
            this.score++;
            resultEl.textContent = '🎉 GOOD! Field Goal is GOOD!';
            resultEl.style.color = '#ffd700';
            this.playSuccessEffect();
            this.playSound('cheer');
            this.updateLocalLeaderboard();
            this.updateGlobalLeaderboard();
        } else {
            let missType = 'WIDE';
            if (this.ball.x < this.goalpost.leftX) missType = 'WIDE LEFT';
            else if (this.ball.x > this.goalpost.rightX) missType = 'WIDE RIGHT';
            else if (this.ball.y > this.goalpost.bottomY) missType = 'NO GOOD - Too Low';

            resultEl.textContent = `❌ ${missType}! No Good!`;
            resultEl.style.color = '#ff4444';
            this.playFailEffect();
            this.playSound('boo');
        }

        document.getElementById('scoreValue').textContent = this.score;

        setTimeout(() => {
            if (!this.gameActive) return;
            this.isKicking = false;
            this.ball.x = 200;
            this.ball.y = 550;
            this.ball.vx = 0;
            this.ball.vy = 0;
            this.ball.trail = [];
            this.generateWind();
            this.drawField();
            resultEl.textContent = '';
        }, 3000);
    }

    playSuccessEffect() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, 30, 0, 2 * Math.PI);
        ctx.fill();
    }

    playFailEffect() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, 25, 0, 2 * Math.PI);
        ctx.fill();
    }

    playSound(type) {
        try {
            const audio = new Audio(`assets/${type}.mp3`);
            audio.volume = 0.3;
            audio.play().catch(() => {});
        } catch (e) {
            console.log('Audio error:', e);
        }
    }

    // Load/Save team name methods
    loadTeamName() {
        try {
            return localStorage.getItem('draftKickerTeamName');
        } catch (e) {
            console.log('Error loading team name:', e);
            return null;
        }
    }

    saveTeamName(name) {
        try {
            localStorage.setItem('draftKickerTeamName', name);
        } catch (e) {
            console.log('Error saving team name:', e);
        }
    }

    loadLocalLeaderboard() {
        try {
            const data = localStorage.getItem('localLeaderboard');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    saveLocalLeaderboard() {
        try {
            localStorage.setItem('localLeaderboard', JSON.stringify(this.localLeaderboard));
        } catch (e) {
            console.log('Save error:', e);
        }
    }

    async loadGlobalLeaderboard() {
        try {
            // Corrected: Using the constant GOOGLE_SHEET_API_URL
            const response = await fetch(GOOGLE_SHEET_API_URL);
            const data = await response.json();
            this.globalLeaderboard = data;
            this.updateLeaderboardDisplay();
        } catch (error) {
            console.error('Error loading global leaderboard:', error);
        }
    }

    async updateGlobalLeaderboard() {
        if (!this.teamName || this.score === 0) return;

        try {
            const params = new URLSearchParams({
                team: this.teamName,
                score: this.score
            });

            // Corrected: Using the constant GOOGLE_SHEET_API_URL
            await fetch(GOOGLE_SHEET_API_URL, {
                method: 'POST',
                body: params
            });

            await this.loadGlobalLeaderboard();
        } catch (error) {
            console.error('Error updating global leaderboard:', error);
        }
    }

    updateLocalLeaderboard() {
        if (!this.teamName || this.score === 0) return;

        const index = this.localLeaderboard.findIndex(entry => entry.team.toLowerCase() === this.teamName.toLowerCase());

        if (index !== -1) {
            if (this.score > this.localLeaderboard[index].score) {
                this.localLeaderboard[index].score = this.score;
            }
        } else {
            this.localLeaderboard.push({ team: this.teamName, score: this.score });
        }

        this.localLeaderboard.sort((a, b) => b.score - a.score);
        this.localLeaderboard = this.localLeaderboard.slice(0, 10);
        this.saveLocalLeaderboard();
        this.updateLeaderboardDisplay();
    }

    updateTabButtons() {
        const localTab = document.getElementById('localTab');
        const globalTab = document.getElementById('globalTab');

        if (this.showingGlobal) {
            localTab.classList.remove('active');
            globalTab.classList.add('active');
        } else {
            localTab.classList.add('active');
            globalTab.classList.remove('active');
        }
    }

    updateLeaderboardDisplay() {
        const list = document.getElementById('leaderboardList');
        const leaderboard = this.showingGlobal ? this.globalLeaderboard : this.localLeaderboard;

        if (leaderboard.length === 0) {
            list.innerHTML = '<li>No scores yet!</li>';
            return;
        }

        list.innerHTML = leaderboard.map(entry => `<li>${entry.team}: ${entry.score}</li>`).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DraftKicker();
    // Service worker registration block from index.html is likely preferred
    // if ('serviceWorker' in navigator) {
    //     window.addEventListener('load', () => {
    //         navigator.serviceWorker.register('service-worker.js').then(registration => {
    //             console.log('Service Worker registered with scope:', registration.scope);
    //         }).catch(error => {
    //             console.log('Service Worker registration failed:', error);
    //         });
    //     });
    // }
});

class DraftKicker {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.teamName = '';
    this.score = 0;
    this.wind = 0;
    this.isKicking = false;
    this.startY = 0;
    this.localLeaderboard = this.loadLocalLeaderboard();
    this.globalLeaderboard = [];
    this.showingGlobal = false;
    this.animationId = null;

    this.gameTime = 60;
    this.gameTimer = null;
    this.gameActive = false;

    this.ball = { x: 200, y: 550, vx: 0, vy: 0, gravity: 0.5, windEffect: 0, trail: [] };

    this.goalpost = { leftX: 175, rightX: 225, topY: 50, bottomY: 130 };

    this.initializeGame();
    this.loadGlobalLeaderboard();
    this.updateLeaderboardDisplay();
  }

  initializeGame() {
    document.getElementById('startGame').addEventListener('click', () => {
      const nameInput = document.getElementById('teamName');
      if (!nameInput.value.trim()) return;
      this.teamName = nameInput.value.trim();
      document.getElementById('teamInput').style.display = 'none';
      document.getElementById('gameArea').style.display = 'block';
      this.setupCanvas();
      this.startGameTimer();
      this.generateWind();
      this.drawField();
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

    // Touch & Mouse handlers
    const startKick = e => {
      if (this.isKicking) return;
      const rect = this.canvas.getBoundingClientRect();
      this.startY = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    };
    const endKick = e => {
      if (this.isKicking) return;
      const rect = this.canvas.getBoundingClientRect();
      const endY = e.changedTouches ? e.changedTouches[0].clientY - rect.top : e.clientY - rect.top;
      this.handleKick(this.startY - endY);
    };

    this.canvas.addEventListener('touchstart', startKick);
    this.canvas.addEventListener('mousedown', startKick);
    this.canvas.addEventListener('touchend', endKick);
    this.canvas.addEventListener('mouseup', endKick);
  }

  // ... rest of your methods, but fix template literals, color syntax ...
  // For example:

  generateWind() {
    this.wind = Math.floor(Math.random() * 11) - 5;
    const windDisplay = document.getElementById('windValue');
    const direction = this.wind < 0 ? '⬅️' : this.wind > 0 ? '➡️' : '🎯';
    windDisplay.textContent = `${direction} ${Math.abs(this.wind)}`;
  }

  // etc...
}

window.addEventListener('DOMContentLoaded', () => new DraftKicker());

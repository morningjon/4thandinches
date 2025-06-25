// Select DOM elements
const teamNameInput = document.getElementById('teamNameInput');
const startButton = document.getElementById('startButton');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const kickResult = document.getElementById('kickResult');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const leaderboardList = document.getElementById('leaderboardList');
const currentTab = document.getElementById('currentTab');
const allTimeTab = document.getElementById('allTimeTab');

let teamName = '';
let score = 0;
let timeLeft = 60;
let wind = 0;
let timer;
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
let currentGameScores = [];

// Initialize canvas
canvas.width = 400;
canvas.height = 300;

// Start Game
startButton.addEventListener('click', () => {
  const input = teamNameInput.value.trim();
  if (input) {
    teamName = input;
    score = 0;
    timeLeft = 60;
    updateScore();
    updateTimer();
    startTimer();
    generateWind();
    drawField();
    kickResult.textContent = '';
    currentGameScores = [];
  }
});

// Timer
function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

function updateTimer() {
  timerDisplay.textContent = timeLeft + 's';
}

// Score
function updateScore() {
  scoreDisplay.textContent = score;
}

// Wind
function generateWind() {
  wind = Math.floor(Math.random() * 21) - 10; // -10 to +10
  document.getElementById('windValue').textContent = wind + ' mph';
}

// Handle Kick (Power bar mechanic)
let power = 0;
let powerInterval;

canvas.addEventListener('mousedown', () => {
  if (timeLeft > 0) {
    power = 0;
    powerInterval = setInterval(() => {
      power = (power + 1) % 101; // Power 0-100
      drawField(power);
    }, 20);
  }
});

canvas.addEventListener('mouseup', () => {
  if (powerInterval) {
    clearInterval(powerInterval);
    handleKick(power);
    power = 0;
  }
});

// Kick logic
function handleKick(powerLevel) {
  const windEffect = wind * (Math.random() * 0.3);
  const distance = powerLevel + windEffect;

  if (distance >= 50) {
    score++;
    kickResult.textContent = `✅ GOOD! Distance: ${Math.floor(distance)} yards`;
  } else {
    kickResult.textContent = `❌ Missed. Distance: ${Math.floor(distance)} yards`;
  }

  updateScore();
  generateWind();
  drawField();
}

// End Game
function endGame() {
  kickResult.textContent = `⏱️ Time's up! Final Score: ${score}`;

  // Save to leaderboard
  const playerEntry = { name: teamName, score: score, date: new Date().toISOString() };
  leaderboard.push(playerEntry);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

  // Track this game's scores
  currentGameScores.push(playerEntry);

  renderLeaderboard();
}

// Leaderboard rendering
function renderLeaderboard() {
  leaderboardList.innerHTML = '';
  let list = [];

  if (currentTab.classList.contains('active')) {
    list = [...currentGameScores];
  } else {
    list = [...leaderboard];
  }

  list.sort((a, b) => b.score - a.score);

  list.slice(0, 10).forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = `${entry.name} - ${entry.score} pts`;
    leaderboardList.appendChild(li);
  });
}

// Tab switching
currentTab.addEventListener('click', () => {
  currentTab.classList.add('active');
  allTimeTab.classList.remove('active');
  renderLeaderboard();
});

allTimeTab.addEventListener('click', () => {
  allTimeTab.classList.add('active');
  currentTab.classList.remove('active');
  renderLeaderboard();
});

// Initial leaderboard view
renderLeaderboard();

// Draw Field + Power Bar
function drawField(powerLevel = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Goalposts
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(canvas.width / 2 - 5, 20, 10, 40);
  ctx.fillRect(canva

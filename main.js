// Element selectors
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
const windDisplay = document.getElementById('windValue');

// Game state variables
let teamName = '';
let score = 0;
let timeLeft = 60;
let wind = 0;
let timer;
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
let currentGameScores = [];
let power = 0;
let isCharging = false;
let animationFrame;

// Setup canvas size
canvas.width = 400;
canvas.height = 300;

// Start button
startButton.addEventListener('click', () => {
  const input = teamNameInput.value.trim();
  if (input) {
    teamName = input;
    resetGame();
  }
});

function resetGame() {
  score = 0;
  timeLeft = 60;
  currentGameScores = [];
  updateScore();
  updateTimer();
  generateWind();
  kickResult.textContent = '';
  startTimer();
  drawField();
}

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

function updateScore() {
  scoreDisplay.textContent = score;
}

// Wind
function generateWind() {
  wind = Math.floor(Math.random() * 21) - 10; // -10 to +10
  windDisplay.textContent = `${wind} mph`;
}

// Power Bar (with requestAnimationFrame)
canvas.addEventListener('mousedown', () => {
  if (timeLeft > 0 && !isCharg

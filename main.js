const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startGame');
const teamInput = document.getElementById('teamName');
const windText = document.getElementById('windDirection');
const leaderboard = document.getElementById('leaderboard');

let teamName = '';
let isKicking = false;
let wind = 0;
let scores = [];

// Check for stored team name
window.onload = () => {
  const saved = localStorage.getItem('teamName');
  if (saved) {
    teamName = saved;
    document.getElementById('team-input-container').style.display = 'none';
  }
  loadLeaderboard();
};

// Start button
startBtn.onclick = () => {
  const val = teamInput.value.trim();
  if (!val) return alert('You must enter a team name!');
  teamName = val;
  localStorage.setItem('teamName', teamName);
  document.getElementById('team-input-container').style.display = 'none';
};

// Swipe-to-kick
let startY = 0;
canvas.addEventListener('pointerdown', (e) => {
  startY = e.clientY;
});

canvas.addEventListener('pointerup', (e) => {
  if (!teamName) return;
  const endY = e.clientY;
  const delta = startY - endY;
  if (delta > 50) handleKick(delta);
});

// Kick logic
function handleKick(power) {
  isKicking = true;
  const success = Math.random() < 0.6 + (power / 1000) - Math.abs(wind) * 0.05;
  const score = Math.floor(Math.random() * 1000) + (success ? 3000 : 500);
  const finalScore = Math.min(score, 9999998);

  const timestamp = Date.now();
  updateScore(teamName, finalScore, timestamp);
  playSound(success);
  generateWind();
  drawKick(success);
  loadLeaderboard();
}

// Wind logic
function generateWind() {
  wind = Math.floor(Math.random() * 11) - 5;
  windText.textContent = wind > 0 ? `➡️ ${wind}` : wind < 0 ? `⬅️ ${-wind}` : 'Calm';
}
generateWind();

// Sound
function playSound(success) {
  const audio = new Audio(success ? 'cheer.mp3' : 'boo.mp3');
  audio.play();
}

// Leaderboard
function updateScore(name, score, timestamp) {
  let data = JSON.parse(localStorage.getItem('scores')) || [];
  const existing = data.find(d => d.name === name);
  if (!existing || score > existing.score || (score === existing.score && timestamp < existing.timestamp)) {
    data = data.filter(d => d.name !== name);
    data.push({ name, score, timestamp });
    localStorage.setItem('scores', JSON.stringify(data));
  }
}

// Display
function loadLeaderboard() {
  leaderboard.innerHTML = '';

  const fake = { name: 'hashtagbelieve', score: 9999999, timestamp: 0 };
  const real = JSON.parse(localStorage.getItem('scores')) || [];

  const all = [fake, ...real];
  all.sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.timestamp - b.timestamp
  );

  all.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name} — ${entry.score}`;
    leaderboard.appendChild(li);
  });
}

// Kick animation placeholder
function drawKick(success) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = success ? '#FFD700' : '#FF4444';
  ctx.beginPath();
  ctx.arc(200, 300, 30, 0, 2 * Math.PI);
  ctx.fill();
}

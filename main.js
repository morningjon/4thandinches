const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let wind = 0;
let startY = 0;
let isSwiping = false;
let teamName = '';
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

// 🎨 Draw the field and UI
function drawField() {
  // Background
  ctx.fillStyle = '#006400';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Yard lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  for (let y = 50; y < canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Goalposts
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 30, 50);
  ctx.lineTo(canvas.width / 2 + 30, 50);
  ctx.moveTo(canvas.width / 2 - 30, 50);
  ctx.lineTo(canvas.width / 2 - 30, 20);
  ctx.moveTo(canvas.width / 2 + 30, 50);
  ctx.lineTo(canvas.width / 2 + 30, 20);
  ctx.stroke();
  ctx.lineWidth = 1;

  // Football
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 500, 15, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wind
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px sans-serif';
  ctx.fillText('Wind:', 10, 25);
  const direction = wind < 0 ? `⬅️ ${-wind}` : wind > 0 ? `➡️ ${wind}` : 'Calm';
  ctx.fillText(direction, 60, 25);
}

// 🌪 Generate random wind
function updateWind() {
  wind = Math.floor(Math.random() * 11) - 5; // -5 to +5
  document.getElementById('windDirection').textContent = wind < 0 ? `← ${-wind}` : wind > 0 ? `→ ${wind}` : 'Calm';
}

// 🎯 Animate result
function drawKick(success) {
  drawField();
  ctx.fillStyle = success ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 500, 35, 0, Math.PI * 2);
  ctx.fill();
}

// 🏆 Update leaderboard
function updateLeaderboard(success) {
  if (!success) return;
  const existing = leaderboard.find(entry => entry.name === teamName);
  if (existing) {
    existing.score++;
  } else {
    leaderboard.push({ name: teamName, score: 1 });
  }

  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

  const ol = document.getElementById('leaderboard');
  ol.innerHTML = '';
  for (let i = 0; i < Math.min(5, leaderboard.length); i++) {
    const li = document.createElement('li');
    li.textContent = `${leaderboard[i].name} (${leaderboard[i].score})`;
    ol.appendChild(li);
  }
}

// 📲 Kick logic
function handleKick(distance) {
  const power = distance / 100;
  const accuracy = Math.random() * 10;
  const success = accuracy > Math.abs(wind);

  drawKick(success);
  updateLeaderboard(success);
  updateWind();

  const sound = new Audio(success ? 'cheer.mp3' : 'boo.mp3');
  sound.play();
}

// 📦 Swipe detection
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isSwiping = true;
    startY = e.touches[0].clientY;
  }
});

canvas.addEventListener('touchend', (e) => {
  if (!isSwiping) return;
  const endY = e.changedTouches[0].clientY;
  const distance = startY - endY;
  if (distance > 30) {
    handleKick(distance);
  }
  isSwiping = false;
});

canvas.addEventListener('mousedown', (e) => {
  isSwiping = true;
  startY = e.clientY;
});

canvas.addEventListener('mouseup', (e) => {
  if (!isSwiping) return;
  const endY = e.clientY;
  const distance = startY - endY;
  if (distance > 30) {
    handleKick(distance);
  }
  isSwiping = false;
});

// 🔁 Init
document.getElementById('startGame').addEventListener('click', () => {
  teamName = document.getElementById('teamName').value.trim();
  if (!teamName) return;

  document.getElementById('team-input-container').style.display = 'none';
  drawField();
  updateLeaderboard(false);
  updateWind();
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let wind = 0;
let teamName = '';
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

function drawField() {
  ctx.fillStyle = '#006400';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#ffffff';
  for (let y = 50; y < canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

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

  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 500, 15, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '16px sans-serif';
  const dir = wind < 0 ? `⬅️ ${-wind}` : wind > 0 ? `➡️ ${wind}` : 'Calm';
  ctx.fillText(`Wind: ${dir}`, 10, 25);
}

function updateWind() {
  wind = Math.floor(Math.random() * 11) - 5;
  document.getElementById('windDirection').textContent = wind < 0 ? `← ${-wind}` : wind > 0 ? `→ ${wind}` : 'Calm';
}

function drawKick(success) {
  drawField();
  ctx.fillStyle = success ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 500, 35, 0, Math.PI * 2);
  ctx.fill();
}

function updateLeaderboard(success) {
  if (!success) return;
  const entry = leaderboard.find(e => e.name === teamName);
  if (entry) entry.score++;
  else leaderboard.push({ name: teamName, score: 1 });

  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

  const ol = document.getElementById('leaderboard');
  ol.innerHTML = '';
  leaderboard.slice(0, 5).forEach(e => {
    const li = document.createElement('li');
    li.textContent = `${e.name} (${e.score})`;
    ol.appendChild(li);
  });
}

function handleKick(distance) {
  const success = Math.random() * 10 > Math.abs(wind);
  drawKick(success);
  updateLeaderboard(success);
  updateWind();
  const audio = new Audio(success ? 'cheer.mp3' : 'boo.mp3');
  audio.play();
}

function enableSwipes() {
  let startY = 0;
  let swiping = false;

  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      swiping = true;
      startY = e.touches[0].clientY;
    }
  });

  canvas.addEventListener('touchend', e => {
    if (!swiping) return;
    const endY = e.changedTouches[0].clientY;
    const dy = startY - endY;
    if (dy > 30) handleKick(dy);
    swiping = false;
  });

  canvas.addEventListener('mousedown', e => {
    swiping = true;
    startY = e.clientY;
  });

  canvas.addEventListener('mouseup', e => {
    if (!swiping) return;
    const dy = startY - e.clientY;
    if (dy > 30) handleKick(dy);
    swiping = false;
  });
}

document.getElementById('startGame').addEventListener('click', () => {
  teamName = document.getElementById('teamName').value.trim();
  if (!teamName) return;
  document.getElementById('team-input-container').style.display = 'none';
  drawField();
  updateLeaderboard(false);
  updateWind();
  enableSwipes();
});

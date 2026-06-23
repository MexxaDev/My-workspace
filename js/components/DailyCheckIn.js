import { DB } from '../db.js';
import { Sound } from '../sound.js';

export function showDailyCheckIn() {
  if (document.getElementById('checkinContainer')) return;
  if (!DB.isReady()) return;

  const reward = DB.performCheckIn();
  if (!reward) return;

  const week = DB.getCheckInData();
  const xpInfo = DB.getXPToNextLevel();
  const container = document.createElement('div');
  container.id = 'checkinContainer';
  container.innerHTML = `
    <div class="checkin-overlay">
      <div class="checkin-popup">
        <div class="checkin-glow"></div>
        <div class="checkin-header">
          <div class="checkin-icon">☀️</div>
          <h2>Check-in diario</h2>
        </div>
        <div class="checkin-week">
          ${week.map(d => `
            <div class="checkin-day ${d.checkedIn ? 'done' : d.isToday ? 'today' : ''}">
              <div class="checkin-dot"></div>
              <span class="checkin-label">${d.dayName}</span>
            </div>
          `).join('')}
        </div>
        <div class="checkin-streak">
          <span class="checkin-fire">🔥</span>
          <span>Racha: <strong>${reward.streak}</strong> ${reward.streak === 1 ? 'día' : 'días'}</span>
        </div>
        <div class="checkin-coin-wrap">
          <div class="checkin-coin">🪙</div>
          <div class="checkin-sparkles">
            <span class="sparkle s1">✦</span>
            <span class="sparkle s2">✦</span>
            <span class="sparkle s3">✦</span>
          </div>
        </div>
        <div class="checkin-xp-row">
          <span class="checkin-xp-value">+${reward.xp} XP</span>
          ${reward.bonus > 0 ? `<span class="checkin-bonus-badge">Bonus +${reward.bonus} XP</span>` : ''}
        </div>
        <div class="checkin-total">+${reward.total} XP hoy</div>
        <div class="checkin-level">
          <div class="checkin-level-header">
            <span>Nivel ${reward.level}</span>
            <span class="checkin-next">→ Nivel ${reward.level + 1}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${xpInfo.percent}%"></div>
          </div>
          <div class="checkin-level-xp">${xpInfo.current} / ${xpInfo.needed} XP</div>
        </div>
        <button class="btn btn-primary checkin-close">Continuar</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  setTimeout(() => {
    const coin = container.querySelector('.checkin-coin');
    if (coin) coin.classList.add('animate');
    const sparkles = container.querySelector('.checkin-sparkles');
    if (sparkles) sparkles.classList.add('animate');
  }, 400);

  container.querySelector('.checkin-close').addEventListener('click', () => {
    container.classList.add('closing');
    setTimeout(() => container.remove(), 350);
  });

  container.querySelector('.checkin-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      container.classList.add('closing');
      setTimeout(() => container.remove(), 350);
    }
  });

  Sound.success();
}

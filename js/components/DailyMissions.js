import { DB } from '../db.js';
import { showToast } from './Toast.js';

export function DailyMissions() {
  function render() {
    const missions = DB.getDailyMissions();
    const progress = DB.getMissionsProgress();

    const checkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';

    return `
      <div class="missions-container">
        <div class="missions-header">
          <div class="missions-title">🎯 Misiones del día</div>
          <div class="missions-progress-text">${progress.done}/${progress.total}</div>
        </div>
        <div class="missions-progress-bar">
          <div class="missions-progress-fill" style="width:${progress.percent}%"></div>
        </div>
        ${missions.map(m => `
          <div class="mission-item">
            <button class="mission-check ${m.done ? 'done' : ''} ${m.auto ? 'disabled' : ''}" data-mission="${m.id}" ${m.done ? 'disabled' : ''}>
              ${checkIcon}
            </button>
            <div class="mission-info">
              <div class="mission-label ${m.done ? 'done' : ''}">${m.label}</div>
            </div>
            ${m.rotLabel ? `<span class="mission-type">${m.rotLabel}</span>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  function afterRender() {
    document.querySelectorAll('.mission-check:not(.disabled)').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.mission;
        DB.completeMission(id);
        showToast('Misión completada', 'success');
        const missionsContainer = el.closest('.missions-container');
        if (missionsContainer) {
          missionsContainer.outerHTML = render();
          setTimeout(() => afterRender(), 0);
        }
      });
    });
  }

  return { render, afterRender };
}

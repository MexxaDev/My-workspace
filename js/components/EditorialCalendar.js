import { DB } from '../db.js';
import { Utils } from '../utils.js';
import { showModal } from './Modal.js';
import { showToast } from './Toast.js';
import { showContentForm } from './ContentForm.js';

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const PLATFORM_CLASSES = {
  instagram: 'platform-instagram',
  tiktok: 'platform-tiktok',
  facebook: 'platform-facebook',
  linkedin: 'platform-linkedin'
};

const STATUS_CLASSES = {
  idea: 'card-status-idea',
  brief: 'card-status-brief',
  writing: 'card-status-writing',
  design: 'card-status-design',
  review: 'card-status-review',
  approved: 'card-status-approved',
  scheduled: 'card-status-scheduled',
  published: 'card-status-published'
};

export function EditorialCalendar({ projectId, clientId, onContentChange } = {}) {
  let currentDate = new Date();

  function getWeekDays(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return { monday, days };
  }

  function getMonthDays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const days = [];

    for (let i = 0; i < startPad; i++) {
      const d = new Date(year, month, -startPad + i + 1);
      days.push({ date: d, other: true });
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), other: false });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), other: true });
    }
    return days;
  }

  function getContentForDate(dateStr) {
    return DB.getContentItems(projectId).filter(c =>
      c.scheduledDate && c.scheduledDate === dateStr
    );
  }

  function getAllUnscheduled() {
    return DB.getContentItems(projectId).filter(c => !c.scheduledDate);
  }

  function formatDateStr(date) {
    return date.toISOString().split('T')[0];
  }

  function isToday(date) {
    return formatDateStr(date) === formatDateStr(new Date());
  }

  function prevWeek() {
    currentDate.setDate(currentDate.getDate() - 7);
  }

  function nextWeek() {
    currentDate.setDate(currentDate.getDate() + 7);
  }

  function renderDayCard(item) {
    const platClass = PLATFORM_CLASSES[item.platform] || '';
    const statusClass = STATUS_CLASSES[item.status] || 'card-status-idea';
    const objIcon = { awareness: '👁️', engagement: '💬', conversion: '🛒', retention: '❤️', education: '📚' };
    const formatLabel = { feed: 'Feed', story: 'Story', reel: 'Reel', carousel: 'Carousel', video: 'Video', article: 'Artículo' };

    return `
      <div class="editorial-card ${platClass} ${item.status === 'published' ? 'card-past' : ''}" data-content-id="${item.id}">
        <div class="card-platform">${item.platform} · ${formatLabel[item.format] || item.format}</div>
        <div class="card-hook">${Utils.truncate(Utils.sanitize(item.headline || item.hook || 'Sin título'), 40)}</div>
        <div class="card-meta">
          <span class="card-status-dot ${statusClass}"></span>
          ${item.objective ? `<span class="objective-tag objective-${item.objective}">${objIcon[item.objective] || ''} ${item.objective}</span>` : ''}
          ${item.scheduledTime ? `<span>⏰ ${item.scheduledTime}</span>` : ''}
        </div>
      </div>`;
  }

  function renderAnalyticsPanel(item) {
    const a = item.analytics;
    if (!a) return `
      <div style="text-align:center;padding:16px;color:var(--text-muted)">
        <p style="margin-bottom:12px">Sin datos de analytics todavía</p>
        <button class="btn btn-sm btn-secondary" id="addAnalyticsBtn">📊 Ingresar analytics</button>
      </div>`;

    const metrics = [
      { label: 'Alcance', value: a.reach || '—', trend: a.engagementRate ? 'up' : 'flat' },
      { label: 'Likes', value: a.likes || '—', trend: 'flat' },
      { label: 'Comments', value: a.comments || '—', trend: 'flat' },
      { label: 'Saves', value: a.saves || '—', trend: 'flat' },
    ];

    return `
      <div class="analytics-grid">
        ${metrics.map(m => `
          <div class="analytics-metric">
            <div class="metric-value">${m.value}</div>
            <div class="metric-label">${m.label}</div>
            <div class="metric-trend ${m.trend}">${m.trend === 'up' ? '↑' : '—'}</div>
          </div>
        `).join('')}
      </div>
      ${a.engagementRate ? `<div style="text-align:center;font-size:var(--text-sm);font-weight:600;color:var(--accent);margin-bottom:8px">Engagement Rate: ${a.engagementRate}%</div>` : ''}
      ${a.notes ? `<div style="font-size:var(--text-xs);color:var(--text-muted);padding:8px;background:var(--surface-secondary);border-radius:var(--radius-md)">📝 ${Utils.sanitize(a.notes)}</div>` : ''}
      <div style="margin-top:8px"><button class="btn btn-sm btn-secondary" id="editAnalyticsBtn">✏️ Editar analytics</button></div>`;
  }

  function showContentDetail(item) {
    const formatLabel = { feed: 'Feed', story: 'Story', reel: 'Reel', carousel: 'Carousel', video: 'Video', article: 'Artículo' };
    const objLabels = { awareness: 'Notoriedad', engagement: 'Engagement', conversion: 'Conversión', retention: 'Retención', education: 'Educación' };

    let bodyHtml = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
        <span class="tag" style="background:var(--platform-color, var(--accent));color:white">${item.platform} · ${formatLabel[item.format] || item.format}</span>
        <span class="tag tag-${item.status}">${item.status}</span>
        ${item.objective ? `<span class="objective-tag objective-${item.objective}">${objLabels[item.objective] || item.objective}</span>` : ''}
      </div>`;

    if (item.emotion || item.hook || item.conversationStarter) {
      bodyHtml += `
        <div class="strategy-section" style="margin-bottom:12px">
          <h4>🎯 Estrategia</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:var(--text-sm)">
            ${item.hook ? `<div><strong>Hook:</strong> ${Utils.sanitize(item.hook)}</div>` : ''}
            ${item.emotion ? `<div><strong>Emoción:</strong> ${item.emotion}</div>` : ''}
            ${item.conversationStarter ? `<div style="grid-column:1/-1"><strong>Conversación:</strong> ${Utils.sanitize(item.conversationStarter)}</div>` : ''}
            ${item.desiredAction ? `<div><strong>Acción deseada:</strong> ${Utils.sanitize(item.desiredAction)}</div>` : ''}
            ${item.brandPerception ? `<div><strong>Percepción:</strong> ${Utils.sanitize(item.brandPerception)}</div>` : ''}
          </div>
        </div>`;
    }

    if (item.headline || item.body || item.cta) {
      bodyHtml += `
        <div class="strategy-section" style="margin-bottom:12px">
          <h4>✍️ Copy</h4>
          ${item.headline ? `<div style="font-weight:600;font-size:var(--text-base);margin-bottom:4px">${Utils.sanitize(item.headline)}</div>` : ''}
          ${item.body ? `<div style="font-size:var(--text-sm);color:var(--text-secondary);white-space:pre-wrap;margin-bottom:8px">${Utils.sanitize(item.body)}</div>` : ''}
          ${item.cta ? `<div style="font-size:var(--text-sm);color:var(--accent);font-weight:600">CTA: ${Utils.sanitize(item.cta)}</div>` : ''}
          ${item.tags?.length ? `<div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap">${item.tags.map(t => `<span class="tag">${Utils.sanitize(t)}</span>`).join('')}</div>` : ''}
        </div>`;
    }

    if (item.visualDescription) {
      bodyHtml += `
        <div class="strategy-section" style="margin-bottom:12px">
          <h4>🎨 Visual</h4>
          <p style="font-size:var(--text-sm);color:var(--text-secondary)">${Utils.sanitize(item.visualDescription)}</p>
          ${item.visualReference ? `<a href="${Utils.sanitize(item.visualReference)}" target="_blank" style="font-size:var(--text-xs);color:var(--accent)">🔗 Ver referencia</a>` : ''}
        </div>`;
    }

    if (item.scheduledDate || item.series) {
      bodyHtml += `
        <div style="display:flex;gap:16px;font-size:var(--text-sm);color:var(--text-muted);margin-bottom:12px;padding:12px;background:var(--surface-secondary);border-radius:var(--radius-md)">
          ${item.scheduledDate ? `<span>📅 ${Utils.formatDate(item.scheduledDate)} ${item.scheduledTime ? '⏰ ' + item.scheduledTime : ''}</span>` : ''}
          ${item.series ? `<span>📁 ${Utils.sanitize(item.series)}</span>` : ''}
          ${item.feedback ? `<span>💬 ${Utils.sanitize(item.feedback)}</span>` : ''}
        </div>`;
    }

    if (item.status === 'published' || item.analytics) {
      bodyHtml += `
        <div class="strategy-section">
          <h4>📊 Analytics</h4>
          <div id="analyticsPanel">${renderAnalyticsPanel(item)}</div>
        </div>`;
    }

    showModal(`📄 ${Utils.truncate(Utils.sanitize(item.headline || item.hook || 'Sin título'), 40)}`, bodyHtml, [
      { label: 'Cerrar', class: 'btn btn-secondary', action: cl => cl() },
      { label: '✏️ Editar', class: 'btn btn-primary', action: cl => {
        cl();
        showContentForm({ projectId, clientId, editItemId: item.id, onSave: () => reRender() });
      }},
      { label: '🗑️', class: 'btn btn-danger', action: cl => {
        cl();
        showModal('Confirmar eliminación', `
          <p style="color:var(--text-secondary);margin-bottom:16px">¿Estás seguro de que querés eliminar este contenido?<br><strong>Esta acción no se puede deshacer.</strong></p>
        `, [
          { label: 'Cancelar', class: 'btn btn-secondary', action: c => c() },
          { label: 'Eliminar', class: 'btn btn-danger', action: c => {
            DB.remove('content_items', item.id);
            showToast('Contenido eliminado', 'success');
            c();
            reRender();
          }}
        ]);
      }}
    ]);

    setTimeout(() => {
      document.getElementById('addAnalyticsBtn')?.addEventListener('click', () => showAnalyticsForm(item));
      document.getElementById('editAnalyticsBtn')?.addEventListener('click', () => showAnalyticsForm(item));
    }, 50);
  }

  function showAnalyticsForm(item) {
    const a = item.analytics || {};
    showModal('📊 Analytics - ' + Utils.truncate(item.headline || 'Sin título', 30), `
      <div class="strategy-grid">
        <div class="strategy-field"><label>Alcance</label><input type="number" id="aReach" class="form-input" value="${a.reach || ''}"></div>
        <div class="strategy-field"><label>Likes</label><input type="number" id="aLikes" class="form-input" value="${a.likes || ''}"></div>
        <div class="strategy-field"><label>Comentarios</label><input type="number" id="aComments" class="form-input" value="${a.comments || ''}"></div>
        <div class="strategy-field"><label>Guardados</label><input type="number" id="aSaves" class="form-input" value="${a.saves || ''}"></div>
        <div class="strategy-field"><label>Compartidos</label><input type="number" id="aShares" class="form-input" value="${a.shares || ''}"></div>
        <div class="strategy-field"><label>Engagement Rate %</label><input type="number" step="0.1" id="aEr" class="form-input" value="${a.engagementRate || ''}"></div>
        <div class="strategy-field" style="grid-column:1/-1"><label>Notas post-mortem</label><textarea id="aNotes" class="form-input" rows="3">${a.notes || ''}</textarea></div>
      </div>
    `, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: cl => cl() },
      { label: 'Guardar', class: 'btn btn-primary', action: cl => {
        const analytics = {
          reach: parseInt(document.getElementById('aReach').value) || 0,
          likes: parseInt(document.getElementById('aLikes').value) || 0,
          comments: parseInt(document.getElementById('aComments').value) || 0,
          saves: parseInt(document.getElementById('aSaves').value) || 0,
          shares: parseInt(document.getElementById('aShares').value) || 0,
          engagementRate: parseFloat(document.getElementById('aEr').value) || 0,
          notes: document.getElementById('aNotes').value.trim() || ''
        };
        DB.updateContentAnalytics(item.id, analytics);
        if (item.status !== 'published') {
          DB.update('content_items', item.id, { status: 'published' });
        }
        showToast('Analytics guardados', 'success');
        cl();
        reRender();
      }}
    ]);
  }

  function render() {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const { monday, days } = getWeekDays(currentDate);
    const monthStr = `${MONTHS[month]} ${year}`;

    const contentItems = DB.getContentItems(projectId);
    const unscheduled = contentItems.filter(c => !c.scheduledDate);
    const scheduledCount = contentItems.filter(c => c.scheduledDate).length;

    return `
      <div class="editorial-layout page-enter">
        <div class="editorial-toolbar">
          <div class="editorial-nav">
            <button class="btn btn-sm btn-ghost" id="calPrevWeek">←</button>
            <h3>${monthStr}</h3>
            <button class="btn btn-sm btn-ghost" id="calNextWeek">→</button>
            <button class="btn btn-sm btn-ghost" id="calTodayWeek" style="font-weight:600">Hoy</button>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:var(--text-xs);color:var(--text-muted)">${scheduledCount} programados · ${contentItems.length} total</span>
            <button class="btn btn-primary btn-sm" id="editorialAddContentBtn">+ Nuevo contenido</button>
          </div>
        </div>

        <div class="editorial-week-view">
          ${days.map(d => {
            const dateStr = formatDateStr(d);
            const dayContent = contentItems.filter(c => c.scheduledDate === dateStr);
            const isCurrentMonth = d.getMonth() === month;
            const dayLabel = DAY_LABELS[d.getDay()];
            const dayNum = d.getDate();

            return `
              <div class="editorial-day ${!isCurrentMonth ? 'other-month' : ''}">
                <div class="editorial-day-header">
                  <span>${dayLabel}</span>
                  <span class="day-num ${isToday(d) ? 'today' : ''}">${dayNum}</span>
                </div>
                <div class="editorial-items">
                  ${dayContent.map(item => renderDayCard(item)).join('')}
                </div>
                <div class="editorial-add-slot" data-date="${dateStr}">+</div>
              </div>`;
          }).join('')}
        </div>

        ${unscheduled.length > 0 ? `
          <div style="margin-top:8px">
            <details>
              <summary style="font-size:var(--text-sm);font-weight:600;color:var(--text-secondary);cursor:pointer;padding:8px 0">
                📦 Sin programar (${unscheduled.length})
              </summary>
              <div style="display:flex;flex-wrap:wrap;gap:6px;padding:8px 0">
                ${unscheduled.map(item => `
                  <div class="editorial-card ${PLATFORM_CLASSES[item.platform] || ''}" data-content-id="${item.id}" style="max-width:220px">
                    <div class="card-platform">${item.platform}</div>
                    <div class="card-hook">${Utils.truncate(Utils.sanitize(item.headline || item.hook || 'Sin título'), 30)}</div>
                    <div class="card-meta">
                      <span class="card-status-dot ${STATUS_CLASSES[item.status] || ''}"></span>
                      <span>${item.status}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </details>
          </div>
        ` : ''}
      </div>`;
  }

  function reRender() {
    const container = document.getElementById('editorialCalendarContainer');
    if (container) {
      container.innerHTML = render();
      afterRender();
    }
    if (onContentChange) onContentChange();
  }

  function afterRender() {
    document.getElementById('calPrevWeek')?.addEventListener('click', () => { prevWeek(); reRender(); });
    document.getElementById('calNextWeek')?.addEventListener('click', () => { nextWeek(); reRender(); });
    document.getElementById('calTodayWeek')?.addEventListener('click', () => {
      currentDate = new Date();
      reRender();
    });

    document.getElementById('editorialAddContentBtn')?.addEventListener('click', () => {
      showContentForm({ projectId, clientId, onSave: () => reRender() });
    });

    document.querySelectorAll('.editorial-add-slot').forEach(el => {
      el.addEventListener('click', () => {
        const date = el.dataset.date;
        showContentForm({ projectId, clientId, date, onSave: () => reRender() });
      });
    });

    document.querySelectorAll('.editorial-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.contentId;
        const item = DB.getById('content_items', id);
        if (item) showContentDetail(item);
      });
    });
  }

  return { render, afterRender };
}

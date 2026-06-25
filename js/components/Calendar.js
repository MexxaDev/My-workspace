import { DB } from '../db.js';
import { Utils } from '../utils.js';
import { showModal } from './Modal.js';
import { showToast } from './Toast.js';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function CalendarGrid({ events, tasks, onNavigate, showSidebar = true }) {
  let currentDate = new Date();
  let today = new Date();

  today.setHours(0, 0, 0, 0);

  function getMonthData(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const cells = [];

    for (let i = 0; i < startPad; i++) {
      const d = new Date(year, month, -startPad + i + 1);
      cells.push({ day: d.getDate(), date: d, other: true });
    }
    for (let i = 1; i <= totalDays; i++) {
      cells.push({ day: i, date: new Date(year, month, i), other: false });
    }
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, date: new Date(year, month + 1, i), other: true });
    }
    return cells;
  }

  function getEventsForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return (events || []).filter(e => {
      const ed = (e.date || '').split('T')[0];
      return ed === dateStr;
    });
  }

  function getTasksForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return (tasks || []).filter(t => {
      const td = (t.dueDate || t.createdAt || '').split('T')[0];
      return td === dateStr;
    });
  }

  function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
  }

  function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  function showDayPreview(date) {
    const dateStr = date.toISOString().split('T')[0];
    const dateLabel = Utils.formatDate(dateStr);
    const dayEvents = getEventsForDate(date);
    const dayTasks = getTasksForDate(date);

    let html = '';
    if (dayEvents.length === 0 && dayTasks.length === 0) {
      html = '<p style="color:var(--text-muted);margin-bottom:12px">Sin actividades este día</p>';
    } else {
      if (dayEvents.length > 0) {
        html += '<strong style="font-size:var(--text-sm)">Eventos</strong>';
        html += '<div style="margin:8px 0 12px;display:flex;flex-direction:column;gap:6px">';
        dayEvents.forEach(e => {
          html += `<div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--surface-secondary);border-radius:var(--radius-md);cursor:pointer" class="calendar-nav-item" data-type="event" data-id="${e.id}" data-project="${e.projectId || ''}">`;
          html += `<span class="calendar-event ${e.type || 'publication'}" style="padding:2px 8px">${Utils.sanitize(Utils.statusLabel(e.type || 'publication'))}</span>`;
          html += `<span style="font-size:var(--text-sm)">${Utils.sanitize(e.title)}</span>`;
          html += '</div>';
        });
        html += '</div>';
      }
      if (dayTasks.length > 0) {
        html += '<strong style="font-size:var(--text-sm)">Tareas con vencimiento</strong>';
        html += '<div style="margin:8px 0 0;display:flex;flex-direction:column;gap:6px">';
        dayTasks.forEach(t => {
          html += `<div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--surface-secondary);border-radius:var(--radius-md);cursor:pointer" class="calendar-nav-item" data-type="task" data-id="${t.id}" data-project="${t.projectId || ''}" data-workspace="${t.workspace || ''}">`;
          html += `<span class="widget-bullet ${t.status}"></span>`;
          html += `<span style="font-size:var(--text-sm)">${Utils.truncate(Utils.sanitize(t.title), 50)}</span>`;
          html += '</div>';
        });
        html += '</div>';
      }
    }

    html += '<hr style="margin:12px 0;border-color:var(--border)">';
    html += `<button class="btn btn-secondary btn-sm" id="calAddTaskBtn" style="width:100%"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Agregar tarea para este día</button>`;

    showModal(dateLabel, html, [
      { label: 'Cerrar', class: 'btn btn-secondary', action: c => { c(); } }
    ]);

    setTimeout(() => {
      document.querySelectorAll('.calendar-nav-item').forEach(el => {
        el.addEventListener('click', () => {
          const type = el.dataset.type;
          const id = el.dataset.id;
          const projectId = el.dataset.project;
          const workspace = el.dataset.workspace;
          if (onNavigate) onNavigate(type, id, projectId, workspace);
        });
      });
      document.getElementById('calAddTaskBtn')?.addEventListener('click', () => {
        showAddTaskForDate(dateStr);
      });
    }, 50);
  }

  function showAddTaskForDate(dateStr) {
    const projects = DB.getAll('projects').filter(p => !p.archived);

    const projectOptions = projects.map(p =>
      `<option value="${p.id}">${Utils.sanitize(p.name)}</option>`
    ).join('');

    showModal('Nueva tarea — ' + Utils.formatDate(dateStr), `
      <div class="form-group"><label>Título *</label><input type="text" id="calTaskTitle" class="form-input" autofocus></div>
      <div class="form-group"><label>Descripción</label><textarea id="calTaskDesc" class="form-input" rows="2"></textarea></div>
      <div class="form-group"><label>Dificultad</label><select id="calTaskDifficulty" class="form-input">
        <option value="easy">Fácil</option>
        <option value="medium" selected>Media</option>
        <option value="hard">Difícil</option>
        <option value="epic">Épica</option>
      </select></div>
      <div class="form-group"><label>Fecha de vencimiento</label><input type="date" id="calTaskDueDate" class="form-input" value="${dateStr}"></div>
      <div class="form-group"><label>¿Dónde?</label><select id="calTaskScope" class="form-input">
        <option value="personal">📋 Personal</option>
        ${projectOptions}
      </select></div>
    `, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: c => c() },
      { label: 'Crear', class: 'btn btn-primary', action: c => {
        const title = document.getElementById('calTaskTitle').value.trim();
        if (!title) {
          showToast('El título es obligatorio', 'warning');
          return;
        }
        const scope = document.getElementById('calTaskScope').value;
        const isPersonal = scope === 'personal';
        const project = isPersonal ? null : DB.getById('projects', scope);
        const submitBtn = document.querySelector('[data-modal-btn]:last-child')?.querySelector('button');
        if (submitBtn) submitBtn.disabled = true;

        DB.create('tasks', {
          title,
          description: document.getElementById('calTaskDesc').value.trim(),
          difficulty: document.getElementById('calTaskDifficulty').value,
          dueDate: document.getElementById('calTaskDueDate').value || null,
          status: 'todo',
          workspace: isPersonal ? 'personal' : 'client',
          projectId: isPersonal ? null : scope,
          clientId: isPersonal ? null : (project?.clientId || null),
          objectiveId: null
        });
        showToast('Tarea creada', 'success');
        c();
        reRender();
      }}
    ]);
  }

  function renderPreview(date) {
    const dayEvents = getEventsForDate(date);
    const dayTasks = getTasksForDate(date);
    if (dayEvents.length === 0 && dayTasks.length === 0) return '';
    const items = [];
    dayEvents.slice(0, 2).forEach(e => {
      items.push(`<div class="calendar-event ${e.type || 'publication'}" title="${Utils.sanitize(e.title)}">${Utils.truncate(Utils.sanitize(e.title), 20)}</div>`);
    });
    dayTasks.slice(0, 1).forEach(t => {
      items.push(`<div style="font-size:9px;color:var(--text-muted);padding:0 4px">✦ ${Utils.truncate(Utils.sanitize(t.title), 18)}</div>`);
    });
    if (dayEvents.length + dayTasks.length > 3) {
      items.push(`<div style="font-size:9px;color:var(--accent);padding:0 4px">+${dayEvents.length + dayTasks.length - 3} más</div>`);
    }
    return items.join('');
  }

  function render() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const cells = getMonthData(year, month);
    const todayStr = today.toISOString().split('T')[0];

    let html = '<div class="calendar">';
    html += '<div class="calendar-header">';
    html += `<h3>${MONTHS[month]} ${year}</h3>`;
    html += '<div class="calendar-nav">';
    html += `<button class="btn btn-sm btn-ghost" id="calPrev">←</button>`;
    html += `<button class="btn btn-sm btn-ghost" id="calToday" style="font-weight:600">Hoy</button>`;
    html += `<button class="btn btn-sm btn-ghost" id="calNext">→</button>`;
    html += '</div></div>';
    html += '<div class="calendar-grid">';
    DAYS.forEach(d => { html += `<div class="calendar-day-header">${d}</div>`; });
    cells.forEach(cell => {
      const cellStr = cell.date.toISOString().split('T')[0];
      const isToday = cellStr === todayStr;
      const cls = `calendar-day${cell.other ? ' other-month' : ''}${isToday ? ' today' : ''}`;
      html += `<div class="${cls}" data-date="${cellStr}">`;
      html += `<div class="calendar-day-number">${cell.day}</div>`;
      html += `<div class="calendar-day-events">${renderPreview(cell.date)}</div>`;
      html += '</div>';
    });
    html += '</div></div>';

    if (showSidebar) {
      const todayEvents = getEventsForDate(today);
      const todayTasks = getTasksForDate(today);
      html += '<div class="calendar-sidebar">';
      html += '<h4 style="margin-bottom:8px;font-size:var(--text-sm)">Hoy</h4>';
      if (todayEvents.length === 0 && todayTasks.length === 0) {
        html += '<p style="color:var(--text-muted);font-size:var(--text-xs)">Sin actividades hoy</p>';
      } else {
        todayEvents.forEach(e => {
          html += `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;cursor:pointer" class="calendar-nav-item" data-type="event" data-id="${e.id}" data-project="${e.projectId || ''}">`;
          html += `<span class="calendar-event ${e.type || 'publication'}" style="padding:1px 6px;font-size:10px">${Utils.truncate(Utils.sanitize(e.title), 25)}</span>`;
          html += '</div>';
        });
        todayTasks.forEach(t => {
          html += `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;cursor:pointer" class="calendar-nav-item" data-type="task" data-id="${t.id}" data-project="${t.projectId || ''}" data-workspace="${t.workspace || ''}">`;
          html += `<span class="widget-bullet ${t.status}"></span>`;
          html += `<span style="font-size:var(--text-xs)">${Utils.truncate(Utils.sanitize(t.title), 30)}</span>`;
          html += '</div>';
        });
      }
      html += '</div>';
    }

    return html;
  }

  function afterRender() {
    document.getElementById('calPrev')?.addEventListener('click', () => { prevMonth(); reRender(); });
    document.getElementById('calNext')?.addEventListener('click', () => { nextMonth(); reRender(); });
    document.getElementById('calToday')?.addEventListener('click', () => {
      currentDate = new Date();
      today = new Date();
      today.setHours(0, 0, 0, 0);
      reRender();
    });
    document.querySelectorAll('.calendar-day').forEach(el => {
      el.addEventListener('click', () => {
        const date = new Date(el.dataset.date + 'T12:00:00');
        showDayPreview(date);
      });
    });
    document.querySelectorAll('.calendar-nav-item').forEach(el => {
      el.addEventListener('click', () => {
        const type = el.dataset.type || 'task';
        const id = el.dataset.id;
        const projectId = el.dataset.project;
        const workspace = el.dataset.workspace;
        if (onNavigate) onNavigate(type, id, projectId, workspace);
      });
    });
  }

  function reRender() {
    const container = document.getElementById('calendarContainer');
    if (container) {
      container.innerHTML = render();
      afterRender();
    }
  }

  return { render, afterRender };
}
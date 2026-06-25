import { DB, OCCUPATIONS, TOPICS } from '../db.js';
import { Utils } from '../utils.js';
import { showToast } from '../components/Toast.js';
import { Sound } from '../sound.js';

export function SettingsPage() {
  function saveProfileData() {
    const profile = DB.getProfile();
    const name = document.getElementById('userNameInput')?.value.trim();
    if (name) profile.name = name;
    profile.occupation = document.getElementById('settingsOccupation')?.value || null;
    profile.occupationCustom = document.getElementById('settingsOtherInput')?.value.trim() || '';
    profile.topics = [...document.querySelectorAll('.topic-chip-active')].map(el => el.dataset.topic);
    DB.saveProfile(profile);
    showToast('Perfil guardado', 'success');
  }

  return {
    render() {
      const profile = DB.getProfile();

      return `
        <div class="page-enter" style="max-width:640px">
          <div class="content-header" style="padding-top:0">
            <h1>Configuración</h1>
          </div>

          <div class="settings-section">
            <h3>Perfil</h3>
            <div class="card">
              <div class="card-body">
                <div class="form-group">
                  <label>Tu nombre</label>
                  <input type="text" id="userNameInput" class="form-input" value="${Utils.sanitize(profile.name)}" autofocus>
                </div>
                <div class="form-group">
                  <label>Ocupación</label>
                  <select id="settingsOccupation" class="form-input">
                    <option value="">Seleccioná tu ocupación</option>
                    ${OCCUPATIONS.map(o => `
                      <option value="${o.id}" ${profile.occupation === o.id ? 'selected' : ''}>${o.icon} ${o.label}</option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group" id="settingsOtherGroup" style="${profile.occupation === 'other' ? '' : 'display:none'}">
                  <label>Tu ocupación</label>
                  <input type="text" id="settingsOtherInput" class="form-input" placeholder="Ej: Arquitecto, Chef..." value="${Utils.sanitize(profile.occupationCustom || '')}">
                </div>
                <div class="form-group">
                  <label>Intereses</label>
                  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">
                    ${TOPICS.map(t => {
                      const selected = (profile.topics || []).includes(t.id);
                      return `
                        <label class="topic-chip ${selected ? 'topic-chip-active' : ''}" data-topic="${t.id}" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:var(--radius-full);font-size:var(--text-xs);cursor:pointer;background:${selected ? 'var(--accent-soft)' : 'var(--surface-secondary)'};border:1px solid ${selected ? 'var(--accent)' : 'var(--border)'};color:${selected ? 'var(--accent)' : 'var(--text-secondary)'};transition:all 0.15s ease;user-select:none">
                          ${t.icon} ${t.label}
                        </label>
                      `;
                    }).join('')}
                  </div>
                </div>
                <button class="btn btn-primary" id="saveProfileBtn" style="margin-top:8px">Guardar perfil</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Preferencias</h3>
            <div class="card">
              <div class="card-body">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0">
                  <div>
                    <div style="font-weight:600;font-size:var(--text-sm)">Tema oscuro</div>
                    <div style="font-size:var(--text-xs);color:var(--text-muted)">Alternar entre modo claro y oscuro</div>
                  </div>
                  <button class="btn btn-sm btn-secondary" id="settingsThemeBtn" style="min-width:100px">Cambiar</button>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-top:1px solid var(--border-light)">
                  <div>
                    <div style="font-weight:600;font-size:var(--text-sm)">Sonido</div>
                    <div style="font-size:var(--text-xs);color:var(--text-muted)">Efectos de sonido al interactuar</div>
                  </div>
                  <button class="btn btn-sm btn-secondary" id="settingsSoundBtn" style="min-width:100px">${Sound.isEnabled() ? 'Activado' : 'Silenciado'}</button>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Respaldar datos</h3>
            <div class="card">
              <div class="card-body">
                <p style="margin-bottom:12px">Exportá todos tus datos como archivo JSON o importá una copia previa.</p>
                <button class="btn btn-secondary" id="exportDataBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Exportar datos</button>
                <button class="btn btn-secondary" id="importDataBtn" style="margin-left:8px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Importar datos</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Datos de demostración</h3>
            <div class="card">
              <div class="card-body">
                <p style="margin-bottom:12px">La aplicación incluye datos de demostración precargados para que puedas explorar todas las funcionalidades.</p>
                ${DB.count('clients') > 0 ? `
                  <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:12px">Actualmente hay <strong>${DB.count('clients')}</strong> ${DB.count('clients') === 1 ? 'cliente' : 'clientes'} en el sistema.</p>
                ` : `
                  <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:12px">No hay datos de demostración. Podés recargarlos cuando quieras.</p>
                `}
                <button class="btn btn-secondary" id="reseedBtn">
                  ${DB.count('clients') > 0 ? 'Recargar datos demo' : 'Cargar datos demo'}
                </button>
                <button class="btn btn-danger" id="clearAllBtn" style="margin-left:8px">Eliminar todos los datos</button>
                <p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:12px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:2px"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Recargar demo reinicia todos los datos, incluyendo tu progreso y perfil.</p>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Acerca de</h3>
            <div class="card">
              <div class="card-body">
                <p><strong>My Workspace</strong> — Sistema Operativo Personal & Profesional</p>
                <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-top:4px">Versión 3.0.0</p>
                <p style="font-size:var(--text-sm);color:var(--text-muted);margin-top:12px">Metas → Proyectos → Tareas, con enfoque en acción.</p>
              </div>
            </div>
          </div>
        </div>
      `;
    },
    afterRender() {
      document.getElementById('saveProfileBtn')?.addEventListener('click', saveProfileData);

      document.getElementById('settingsOccupation')?.addEventListener('change', function() {
        const group = document.getElementById('settingsOtherGroup');
        if (group) group.style.display = this.value === 'other' ? '' : 'none';
      });

      document.querySelectorAll('.topic-chip').forEach(el => {
        el.addEventListener('click', () => {
          el.classList.toggle('topic-chip-active');
        });
      });

      document.getElementById('reseedBtn')?.addEventListener('click', async () => {
        Object.keys(localStorage).filter(k => k.startsWith('levitar_')).forEach(k => localStorage.removeItem(k));
        DB.init();
        const { seedDemoData } = await import('../seed.js');
        seedDemoData();
        showToast('Datos demo recargados', 'success');
        window.location.reload();
      });

      document.getElementById('clearAllBtn')?.addEventListener('click', () => {
        if (confirm('¿Estás seguro de eliminar todos los datos? Esta acción no se puede deshacer.')) {
          Object.keys(localStorage).filter(k => k.startsWith('levitar_')).forEach(k => localStorage.removeItem(k));
          DB.init();
          showToast('Todos los datos eliminados', 'success');
          window.location.reload();
        }
      });

      document.getElementById('settingsThemeBtn')?.addEventListener('click', () => {
        const stored = localStorage.getItem('levitar_theme');
        const current = stored === 'dark' || stored === 'light' ? stored : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('levitar_theme', next);
        document.documentElement.classList.toggle('dark', next === 'dark');
        const btn = document.getElementById('settingsThemeBtn');
        if (btn) btn.textContent = next === 'dark' ? 'Oscuro' : 'Claro';
      });

      const soundBtn = document.getElementById('settingsSoundBtn');
      if (soundBtn) {
        soundBtn.addEventListener('click', () => {
          const on = !Sound.isEnabled();
          Sound.toggle(on);
          soundBtn.textContent = on ? 'Activado' : 'Silenciado';
        });
      }

      document.getElementById('exportDataBtn')?.addEventListener('click', () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith('levitar_') && !['levitar_theme','levitar_sound','levitar_version'].includes(key)) {
            try { data[key] = JSON.parse(localStorage.getItem(key)); } catch { data[key] = localStorage.getItem(key); }
          }
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-workspace-backup-${Utils.today()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Datos exportados', 'success');
      });

      document.getElementById('importDataBtn')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            try {
              const data = JSON.parse(ev.target.result);
              let count = 0;
              for (const [key, value] of Object.entries(data)) {
                if (key.startsWith('levitar_')) {
                  localStorage.setItem(key, JSON.stringify(value));
                  count++;
                }
              }
              showToast(`${count} datos importados. Recargando...`, 'success');
              setTimeout(() => window.location.reload(), 1000);
            } catch {
              showToast('Archivo inválido', 'error');
            }
          };
          reader.readAsText(file);
        };
        input.click();
      });
    }
  };
}

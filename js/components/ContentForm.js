import { DB } from '../db.js';
import { showToast } from './Toast.js';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'linkedin', label: 'LinkedIn' }
];

const FORMATS = {
  instagram: ['feed', 'story', 'reel', 'carousel'],
  tiktok: ['video'],
  facebook: ['feed', 'story', 'video', 'carousel'],
  linkedin: ['feed', 'article', 'video']
};

const OBJECTIVES = [
  { id: 'awareness', label: 'Notoriedad', icon: '👁️' },
  { id: 'engagement', label: 'Engagement', icon: '💬' },
  { id: 'conversion', label: 'Conversión', icon: '🛒' },
  { id: 'retention', label: 'Retención', icon: '❤️' },
  { id: 'education', label: 'Educación', icon: '📚' }
];

const EMOTIONS = [
  'Curiosidad', 'Humor', 'Inspiración', 'Urgencia',
  'Confianza', 'Asombro', 'Alegría', 'Empatía',
  'Exclusividad', 'Pertinencia', 'Deseo', 'Sorprender'
];

const STATUSES = [
  { id: 'idea', label: '💡 Idea' },
  { id: 'brief', label: '📋 Brief' },
  { id: 'writing', label: '✍️ Redacción' },
  { id: 'design', label: '🎨 Diseño' },
  { id: 'review', label: '🔍 Revisión' },
  { id: 'approved', label: '✅ Aprobado' },
  { id: 'scheduled', label: '📅 Programado' },
  { id: 'published', label: '🚀 Publicado' }
];

export function showContentForm({ projectId, clientId, editItemId, date, onSave } = {}) {
  const existing = editItemId ? DB.getById('content_items', editItemId) : null;
  const campaigns = DB.where('campaigns', c => c.projectId === projectId && !c.archived);
  const isEditing = !!existing;

  function getFormatOptions(platform) {
    const fmts = FORMATS[platform] || ['feed'];
    return fmts.map(f => `<option value="${f}" ${existing?.format === f ? 'selected' : ''}>${f.charAt(0).toUpperCase() + f.slice(1)}</option>`).join('');
  }

  function strategyField(label, id, type, options, value) {
    if (type === 'select') {
      return `
        <div class="strategy-field">
          <label>${label}</label>
          <select id="${id}" class="form-input">
            ${options.map(o => typeof o === 'string'
              ? `<option value="${o}" ${value === o ? 'selected' : ''}>${o}</option>`
              : `<option value="${o.id}" ${value === o.id ? 'selected' : ''}>${o.icon ? o.icon + ' ' : ''}${o.label}</option>`
            ).join('')}
          </select>
        </div>`;
    }
    return `
      <div class="strategy-field">
        <label>${label}</label>
        <${type === 'textarea' ? 'textarea' : 'input'} id="${id}" class="form-input" ${type !== 'textarea' ? `type="${type}"` : ''} ${type !== 'textarea' ? `value="${(value || '').replace(/"/g, '&quot;')}"` : ''} ${type === 'textarea' ? 'rows="2"' : ''} placeholder="${label}">${type === 'textarea' ? (value || '') : ''}</${type === 'textarea' ? 'textarea' : 'input'}>
      </div>`;
  }

  const modalContent = `
    <div style="max-height:70vh;overflow-y:auto;padding-right:4px">
      <div class="strategy-section">
        <h4>🎯 Antes de crear — respondé estratégicamente</h4>
        <div class="strategy-grid">
          ${strategyField('¿Por qué alguien dejaría de hacer scroll?', 'fHook', 'text', null, existing?.hook)}
          ${strategyField('¿Qué emoción genera?', 'fEmotion', 'select', EMOTIONS, existing?.emotion)}
          ${strategyField('¿Qué conversación inicia?', 'fConversation', 'text', null, existing?.conversationStarter)}
          ${strategyField('¿Qué acción provoca?', 'fAction', 'text', null, existing?.desiredAction)}
          ${strategyField('¿Qué percepción construye sobre la marca?', 'fPerception', 'text', null, existing?.brandPerception)}
        </div>
      </div>

      <div class="strategy-section">
        <h4>📝 Información básica</h4>
        <div class="strategy-grid">
          <div class="strategy-field">
            <label>Plataforma</label>
            <select id="fPlatform" class="form-input">
              ${PLATFORMS.map(p => `<option value="${p.id}" ${existing?.platform === p.id ? 'selected' : ''}>${p.label}</option>`).join('')}
            </select>
          </div>
          <div class="strategy-field">
            <label>Formato</label>
            <select id="fFormat" class="form-input">
              ${getFormatOptions(existing?.platform || 'instagram')}
            </select>
          </div>
          <div class="strategy-field">
            <label>Fecha programada</label>
            <input type="date" id="fDate" class="form-input" value="${existing?.scheduledDate || date || ''}">
          </div>
          <div class="strategy-field">
            <label>Hora</label>
            <input type="time" id="fTime" class="form-input" value="${existing?.scheduledTime || '10:00'}">
          </div>
          ${campaigns.length > 0 ? `
          <div class="strategy-field">
            <label>Campaña</label>
            <select id="fCampaign" class="form-input">
              <option value="">Sin campaña</option>
              ${campaigns.map(c => `<option value="${c.id}" ${existing?.campaignId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>` : ''}
          <div class="strategy-field">
            <label>Objetivo del contenido</label>
            <select id="fObjective" class="form-input">
              ${OBJECTIVES.map(o => `<option value="${o.id}" ${existing?.objective === o.id ? 'selected' : ''}>${o.icon} ${o.label}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <div class="strategy-section">
        <h4>✍️ Copy</h4>
        <div class="strategy-grid">
          <div class="strategy-field" style="grid-column:1/-1">
            <label>Hook o título</label>
            <input type="text" id="fHeadline" class="form-input" value="${(existing?.headline || existing?.hook || '').replace(/"/g, '&quot;')}" placeholder="Primera línea que atrapa">
          </div>
          <div class="strategy-field" style="grid-column:1/-1">
            <label>Cuerpo del texto</label>
            <textarea id="fBody" class="form-input" rows="4" placeholder="Desarrollá el contenido...">${existing?.body || ''}</textarea>
          </div>
          <div class="strategy-field">
            <label>Call to Action</label>
            <input type="text" id="fCta" class="form-input" value="${(existing?.cta || '').replace(/"/g, '&quot;')}" placeholder="Link en bio, Comentá, Compartí">
          </div>
          <div class="strategy-field">
            <label>Hashtags</label>
            <input type="text" id="fHashtags" class="form-input" value="${((existing?.tags || [])).join(', ')}" placeholder="#marketing #tips">
          </div>
        </div>
      </div>

      <div class="strategy-section">
        <h4>🎨 Idea visual</h4>
        <div class="strategy-grid">
          <div class="strategy-field" style="grid-column:1/-1">
            <label>Descripción visual</label>
            <textarea id="fVisualDesc" class="form-input" rows="2" placeholder="Describí la imagen, video o carousel...">${existing?.visualDescription || ''}</textarea>
          </div>
          <div class="strategy-field" style="grid-column:1/-1">
            <label>Referencia visual (URL)</label>
            <input type="url" id="fVisualRef" class="form-input" value="${(existing?.visualReference || '').replace(/"/g, '&quot;')}" placeholder="https://ejemplo.com/referencia">
          </div>
        </div>
      </div>

      <div class="strategy-section">
        <h4>📋 Workflow</h4>
        <div class="strategy-grid">
          <div class="strategy-field">
            <label>Estado</label>
            <select id="fStatus" class="form-input">
              ${STATUSES.map(s => `<option value="${s.id}" ${(existing?.status || 'idea') === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
            </select>
          </div>
          <div class="strategy-field">
            <label>Feedback del cliente</label>
            <input type="text" id="fFeedback" class="form-input" value="${(existing?.feedback || '').replace(/"/g, '&quot;')}">
          </div>
          <div class="strategy-field">
            <label>Serie / Categoría</label>
            <input type="text" id="fSeries" class="form-input" value="${(existing?.series || '').replace(/"/g, '&quot;')}" placeholder="Tips Martes, Detrás de escena...">
          </div>
        </div>
      </div>
    </div>`;

  const title = isEditing ? '✏️ Editar contenido' : '📝 Nuevo contenido estratégico';

  import('./Modal.js').then(({ showModal }) => {
    showModal(title, modalContent, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: close => close() },
      { label: isEditing ? 'Guardar cambios' : 'Crear contenido', class: 'btn btn-primary', action: close => {
        const data = collectFormData();
        if (!data.headline && !data.hook) {
          showToast('El hook/título es obligatorio', 'warning');
          return;
        }
        const submitBtn = document.querySelector('[data-modal-btn]:last-child')?.querySelector('button');
        if (submitBtn) submitBtn.disabled = true;
        if (isEditing) {
          DB.update('content_items', editItemId, data);
          showToast('Contenido actualizado', 'success');
        } else {
          DB.createContentItem({
            ...data,
            clientId: clientId || null,
            projectId
          });
          showToast('Contenido creado', 'success');
        }
        close();
        if (onSave) onSave();
      }}
    ]);

    requestAnimationFrame(() => {
      const platformEl = document.getElementById('fPlatform');
      if (platformEl) {
        platformEl.addEventListener('change', () => {
          const formatEl = document.getElementById('fFormat');
          if (formatEl) {
            const fmts = FORMATS[platformEl.value] || ['feed'];
            formatEl.innerHTML = fmts.map(f => `<option value="${f}" ${existing?.format === f ? 'selected' : ''}>${f.charAt(0).toUpperCase() + f.slice(1)}</option>`).join('');
          }
        });
      }
    });
  });
}

function collectFormData() {
  const getVal = (id) => document.getElementById(id)?.value?.trim() || '';
  const getList = (id) => document.getElementById(id)?.value?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return {
    platform: getVal('fPlatform') || 'instagram',
    format: getVal('fFormat') || 'feed',
    scheduledDate: getVal('fDate') || null,
    scheduledTime: getVal('fTime') || null,
    campaignId: getVal('fCampaign') || null,
    objective: getVal('fObjective') || '',
    emotion: getVal('fEmotion') || '',
    hook: getVal('fHook') || '',
    conversationStarter: getVal('fConversation') || '',
    desiredAction: getVal('fAction') || '',
    brandPerception: getVal('fPerception') || '',
    headline: getVal('fHeadline') || '',
    body: getVal('fBody') || '',
    cta: getVal('fCta') || '',
    tags: getList('fHashtags'),
    visualDescription: getVal('fVisualDesc') || '',
    visualReference: getVal('fVisualRef') || '',
    status: getVal('fStatus') || 'idea',
    feedback: getVal('fFeedback') || '',
    series: getVal('fSeries') || '',
    colorPalette: [],
    font: '',
    approvedBy: '',
    link: ''
  };
}

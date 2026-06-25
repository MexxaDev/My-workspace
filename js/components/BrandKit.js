import { DB } from '../db.js';
import { showToast } from './Toast.js';

export function showBrandKit(clientId) {
  const kit = DB.getBrandKit(clientId);
  const client = DB.getById('clients', clientId);

  function render(k) {
    return `
    <div style="max-width:100%">
      <div class="brand-kit-grid">
        <div class="brand-kit-section">
          <h4>🎨 Colores de marca</h4>
          <div class="color-swatches">
            <div class="color-swatch">
              <div class="color-swatch-circle" style="background:${k.primaryColor || '#6366f1'}"></div>
              <span class="color-swatch-label">Primario</span>
            </div>
            <div class="color-swatch">
              <div class="color-swatch-circle" style="background:${k.secondaryColor || '#8b5cf6'}"></div>
              <span class="color-swatch-label">Secundario</span>
            </div>
            <div class="color-swatch">
              <div class="color-swatch-circle" style="background:${k.accentColor || '#10b981'}"></div>
              <span class="color-swatch-label">Acento</span>
            </div>
          </div>
        </div>

        <div class="brand-kit-section">
          <h4>✍️ Voz y tono</h4>
          <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:8px">
            ${k.toneDescription || client?.tone || 'No definido'}
          </div>
          ${k.personality?.length ? `
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">
            ${k.personality.map(p => `<span class="tag">${p}</span>`).join('')}
          </div>` : ''}
          ${k.brandArchetype ? `<div style="font-size:var(--text-xs);color:var(--text-muted)">Arquetipo: ${k.brandArchetype}</div>` : ''}
        </div>

        <div class="brand-kit-section">
          <h4>✅ Palabras permitidas</h4>
          <div class="word-list">
            ${(k.allowedWords || client?.allowedWords || []).length > 0
              ? (k.allowedWords || client?.allowedWords || []).map(w => `<span class="word-tag allowed">${w}</span>`).join('')
              : '<span style="font-size:var(--text-xs);color:var(--text-muted)">Sin palabras permitidas</span>'}
          </div>
        </div>

        <div class="brand-kit-section">
          <h4>❌ Palabras prohibidas</h4>
          <div class="word-list">
            ${(k.bannedWords || client?.bannedWords || []).length > 0
              ? (k.bannedWords || client?.bannedWords || []).map(w => `<span class="word-tag banned">${w}</span>`).join('')
              : '<span style="font-size:var(--text-xs);color:var(--text-muted)">Sin palabras prohibidas</span>'}
          </div>
        </div>
      </div>

      <div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-secondary" id="editBrandKitBtn">✏️ Editar brand kit</button>
      </div>
    </div>`;
  }

  function renderEditForm(k) {
    return `
    <div style="max-width:100%">
      <div class="brand-kit-grid">
        <div class="brand-kit-section">
          <h4>🎨 Colores</h4>
          <div class="form-group">
            <label class="form-label">Color primario</label>
            <div style="display:flex;gap:8px;align-items:center">
              <input type="color" id="bkPrimary" class="form-input" style="width:48px;height:36px;padding:2px" value="${k.primaryColor || '#6366f1'}">
              <input type="text" id="bkPrimaryHex" class="form-input" value="${k.primaryColor || '#6366f1'}" style="flex:1">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Color secundario</label>
            <div style="display:flex;gap:8px;align-items:center">
              <input type="color" id="bkSecondary" style="width:48px;height:36px;padding:2px" class="form-input" value="${k.secondaryColor || '#8b5cf6'}">
              <input type="text" id="bkSecondaryHex" class="form-input" value="${k.secondaryColor || '#8b5cf6'}" style="flex:1">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Color de acento</label>
            <div style="display:flex;gap:8px;align-items:center">
              <input type="color" id="bkAccent" style="width:48px;height:36px;padding:2px" class="form-input" value="${k.accentColor || '#10b981'}">
              <input type="text" id="bkAccentHex" class="form-input" value="${k.accentColor || '#10b981'}" style="flex:1">
            </div>
          </div>
        </div>

        <div class="brand-kit-section">
          <h4>✍️ Voz y tono</h4>
          <div class="form-group">
            <label class="form-label">Descripción del tono</label>
            <textarea id="bkTone" class="form-input" rows="2">${k.toneDescription || client?.tone || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Personalidad (separada por coma)</label>
            <input type="text" id="bkPersonality" class="form-input" value="${(k.personality || []).join(', ')}" placeholder="divertido, auténtico, directo">
          </div>
          <div class="form-group">
            <label class="form-label">Arquetipo de marca</label>
            <select id="bkArchetype" class="form-input">
              <option value="">Seleccionar...</option>
              ${['El Inocente', 'El Amigable', 'El Héroe', 'El Forajido', 'El Explorador', 'El Creador', 'El Gobernante', 'El Mago', 'El Sabio', 'El Rebelde', 'El Amante', 'El Bufón'].map(a =>
                `<option value="${a}" ${k.brandArchetype === a ? 'selected' : ''}>${a}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <div class="brand-kit-section">
          <h4>✅ Palabras permitidas</h4>
          <div class="form-group">
            <input type="text" id="bkAllowed" class="form-input" value="${(k.allowedWords || client?.allowedWords || []).join(', ')}" placeholder="artesanal, premium, local">
          </div>
        </div>

        <div class="brand-kit-section">
          <h4>❌ Palabras prohibidas</h4>
          <div class="form-group">
            <input type="text" id="bkBanned" class="form-input" value="${(k.bannedWords || client?.bannedWords || []).join(', ')}" placeholder="barato, económico">
          </div>
        </div>
      </div>
    </div>`;
  }

  function showEditMode() {
    const container = document.getElementById('brandKitContainer');
    if (!container) return;
    container.innerHTML = renderEditForm(kit || {});
    setTimeout(() => {
      document.getElementById('saveBrandKitBtn')?.addEventListener('click', saveKit);
      document.getElementById('cancelEditBrandKitBtn')?.addEventListener('click', () => {
        container.innerHTML = render(kit || {});
        bindViewEvents();
      });
      syncColorInputs();
    }, 50);
  }

  function syncColorInputs() {
    ['bkPrimary', 'bkSecondary', 'bkAccent'].forEach(id => {
      const colorInput = document.getElementById(id);
      const hexInput = document.getElementById(id + 'Hex');
      if (colorInput && hexInput) {
        colorInput.addEventListener('input', () => { hexInput.value = colorInput.value; });
        hexInput.addEventListener('input', () => { colorInput.value = hexInput.value; });
      }
    });
  }

  function saveKit() {
    const getVal = (id) => document.getElementById(id)?.value?.trim() || '';
    const getList = (id) => document.getElementById(id)?.value?.split(',').map(s => s.trim()).filter(Boolean) || [];

    const data = {
      primaryColor: getVal('bkPrimaryHex') || '#6366f1',
      secondaryColor: getVal('bkSecondaryHex') || '#8b5cf6',
      accentColor: getVal('bkAccentHex') || '#10b981',
      toneDescription: getVal('bkTone'),
      personality: getList('bkPersonality'),
      brandArchetype: getVal('bkArchetype'),
      allowedWords: getList('bkAllowed'),
      bannedWords: getList('bkBanned'),
      fonts: { headings: '', body: '' }
    };

    DB.saveBrandKit(clientId, data);
    showToast('Brand kit guardado', 'success');

    const container = document.getElementById('brandKitContainer');
    if (container) {
      const updated = DB.getBrandKit(clientId);
      container.innerHTML = render(updated || data);
      bindViewEvents();
    }
  }

  function bindViewEvents() {
    document.getElementById('editBrandKitBtn')?.addEventListener('click', showEditMode);
  }

  return `
    <div id="brandKitContainer">
      ${render(kit || {})}
    </div>
    <div style="margin-top:12px;display:flex;gap:8px" id="brandKitActions">
      <button class="btn btn-primary btn-sm" id="saveBrandKitBtn" style="display:none">Guardar</button>
      <button class="btn btn-secondary btn-sm" id="cancelEditBrandKitBtn" style="display:none">Cancelar</button>
    </div>`;
}

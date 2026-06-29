// content.js — CuteBoard by Eugene 🐦

(async () => {
  await reapplyAll();
  injectUI();
})();

// ─── Reapply saved backgrounds on every page load ──────────────
async function reapplyAll() {
  const hostname = window.location.hostname;
  const all = await chrome.storage.local.get(null);
  for (const [key, base64] of Object.entries(all)) {
    if (key.startsWith(`cb::${hostname}::`)) {
      const selector = key.replace(`cb::${hostname}::`, '');
      applyStyle(selector, base64);
    }
  }
}

function applyStyle(selector, base64) {
  const id = `__cb_s_${hash(selector)}`;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('style');
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = `${selector} {
    background-image: url('${base64}') !important;
    background-size: cover !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
  }`;
}

function removeStyle(selector) {
  document.getElementById(`__cb_s_${hash(selector)}`)?.remove();
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

// ─── Inject floating button + modal ────────────────────────────
function injectUI() {
  if (document.getElementById('__cb_root__')) return;

  // Google Font — Zen Maru Gothic (cute + Japanese)
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;700&display=swap';
  document.head.appendChild(font);

  // Styles
  const css = document.createElement('style');
  css.textContent = `
    #__cb_root__ *, #__cb_root__ *::before, #__cb_root__ *::after {
      box-sizing: border-box !important;
      font-family: 'Zen Maru Gothic', 'Hiragino Maru Gothic Pro', sans-serif !important;
      line-height: normal !important;
    }

    /* ── Floating button ── */
    #__cb_fab__ {
      position: fixed !important;
      bottom: 28px !important;
      right: 28px !important;
      width: 52px !important;
      height: 52px !important;
      border-radius: 50% !important;
      background: #6B4226 !important;
      color: white !important;
      font-size: 22px !important;
      border: none !important;
      cursor: pointer !important;
      z-index: 2147483646 !important;
      box-shadow: 0 4px 20px rgba(107,66,38,0.5) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: transform 0.2s, background 0.2s !important;
    }
    #__cb_fab__:hover {
      background: #8B5E3C !important;
      transform: scale(1.1) !important;
    }

    /* ── Overlay ── */
    #__cb_overlay__ {
      position: fixed !important;
      inset: 0 !important;
      background: rgba(61,31,10,0.4) !important;
      backdrop-filter: blur(3px) !important;
      z-index: 2147483645 !important;
      display: none !important;
      align-items: center !important;
      justify-content: center !important;
    }
    #__cb_overlay__.cb-open { display: flex !important; }

    /* ── Modal ── */
    #__cb_modal__ {
      background: #FBF7F0 !important;
      border-radius: 24px !important;
      padding: 28px 24px 24px !important;
      width: 340px !important;
      max-width: 92vw !important;
      max-height: 90vh !important;
      overflow-y: auto !important;
      position: relative !important;
      box-shadow: 0 16px 48px rgba(61,31,10,0.3) !important;
      animation: cbIn 0.25s cubic-bezier(.34,1.56,.64,1) !important;
    }
    @keyframes cbIn {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Notebook lines */
    #__cb_modal__::after {
      content: '' !important;
      position: absolute !important;
      inset: 0 !important;
      border-radius: 24px !important;
      background: repeating-linear-gradient(
        transparent, transparent 31px,
        rgba(107,66,38,0.06) 31px, rgba(107,66,38,0.06) 32px
      ) !important;
      pointer-events: none !important;
      z-index: 0 !important;
    }

    /* ── Header ── */
    #__cb_modal__ h2 {
      margin: 0 36px 2px 0 !important;
      font-size: 18px !important;
      font-weight: 700 !important;
      color: #3D1F0A !important;
      position: relative !important;
      z-index: 1 !important;
    }
    .cb-sub {
      font-size: 11px !important;
      color: #A07850 !important;
      margin: 0 0 20px !important;
      display: block !important;
      position: relative !important;
      z-index: 1 !important;
    }

    /* ── Close button ── */
    #__cb_close__ {
      position: absolute !important;
      top: 20px !important;
      right: 20px !important;
      background: #EDD9BE !important;
      border: none !important;
      border-radius: 50% !important;
      width: 30px !important;
      height: 30px !important;
      font-size: 14px !important;
      cursor: pointer !important;
      color: #6B4226 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 2 !important;
    }
    #__cb_close__:hover { background: #C9A880 !important; }

    /* ── Section labels ── */
    .cb-lbl {
      display: block !important;
      font-size: 10px !important;
      font-weight: 700 !important;
      letter-spacing: 0.1em !important;
      color: #A07850 !important;
      text-transform: uppercase !important;
      margin-bottom: 7px !important;
      position: relative !important;
      z-index: 1 !important;
    }

    .cb-section {
      margin-bottom: 16px !important;
      position: relative !important;
      z-index: 1 !important;
    }

    /* ── Pick button ── */
    #__cb_pick__ {
      width: 100% !important;
      padding: 10px 14px !important;
      background: #F5EEE3 !important;
      border: 2px dashed #C9A880 !important;
      border-radius: 14px !important;
      color: #6B4226 !important;
      font-size: 13px !important;
      cursor: pointer !important;
      text-align: center !important;
      transition: all 0.2s !important;
      font-family: inherit !important;
    }
    #__cb_pick__:hover { background: #EDD9BE !important; border-color: #6B4226 !important; }
    #__cb_pick__.cb-active {
      border-color: #6B4226 !important;
      background: #EDD9BE !important;
      animation: cbBlink 0.9s infinite !important;
    }
    @keyframes cbBlink {
      0%,100% { border-color: #6B4226; }
      50%      { border-color: #D4B896; }
    }

    /* Selected tag */
    #__cb_seltag__ {
      display: none !important;
      margin-top: 8px !important;
      padding: 7px 11px !important;
      background: #EDD9BE !important;
      border-radius: 10px !important;
      font-size: 12px !important;
      color: #3D1F0A !important;
      word-break: break-all !important;
    }
    #__cb_seltag__.cb-show { display: block !important; }

    /* ── Dropzone ── */
    #__cb_drop__ {
      border: 2px dashed #C9A880 !important;
      border-radius: 14px !important;
      padding: 22px 16px !important;
      text-align: center !important;
      background: #F5EEE3 !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      position: relative !important;
    }
    #__cb_drop__:hover, #__cb_drop__.cb-drag {
      background: #EDD9BE !important;
      border-color: #6B4226 !important;
    }
    #__cb_drop__ input[type="file"] {
      position: absolute !important;
      inset: 0 !important;
      opacity: 0 !important;
      cursor: pointer !important;
      width: 100% !important;
      height: 100% !important;
    }
    .cb-icon { font-size: 28px !important; display: block !important; margin-bottom: 6px !important; }
    .cb-dtxt { font-size: 12px !important; color: #9B7B5A !important; margin: 0 !important; }
    .cb-dhint { font-size: 10px !important; color: #C4A882 !important; margin: 3px 0 0 !important; }

    /* ── Preview ── */
    #__cb_preview__ {
      display: none !important;
      margin-bottom: 16px !important;
      position: relative !important;
      z-index: 1 !important;
    }
    #__cb_preview__.cb-show { display: block !important; }
    #__cb_previmg__ {
      width: 100% !important;
      height: 100px !important;
      object-fit: cover !important;
      border-radius: 12px !important;
      border: 2px solid #C9A880 !important;
      display: block !important;
    }
    #__cb_prevname__ {
      font-size: 11px !important;
      color: #A07850 !important;
      text-align: center !important;
      margin: 5px 0 0 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    /* ── Buttons ── */
    .cb-row {
      display: flex !important;
      gap: 8px !important;
      position: relative !important;
      z-index: 1 !important;
    }
    .cb-btn {
      flex: 1 !important;
      padding: 11px !important;
      border-radius: 14px !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      cursor: pointer !important;
      border: none !important;
      transition: all 0.2s !important;
      font-family: inherit !important;
    }
    #__cb_apply__ { background: #6B4226 !important; color: #FBF7F0 !important; }
    #__cb_apply__:hover:not(:disabled) { background: #3D1F0A !important; transform: translateY(-1px) !important; }
    #__cb_apply__:disabled { background: #C4A882 !important; cursor: not-allowed !important; }
    #__cb_delete__ {
      background: #F5EEE3 !important;
      color: #6B4226 !important;
      border: 2px solid #C9A880 !important;
    }
    #__cb_delete__:hover { background: #EDD9BE !important; transform: translateY(-1px) !important; }

    /* ── Element hover highlight ── */
    .__cb_hl__ {
      outline: 2.5px solid #6B4226 !important;
      outline-offset: 3px !important;
      cursor: crosshair !important;
    }
  `;
  document.head.appendChild(css);

  // HTML
  const root = document.createElement('div');
  root.id = '__cb_root__';
  root.innerHTML = `
    <button id="__cb_fab__">✏️</button>

    <div id="__cb_overlay__">
      <div id="__cb_modal__">
        <button id="__cb_close__">✕</button>
        <h2>🐦 CuteBoard</h2>
        <span class="cb-sub">by Eugene · pick any element, drop your image</span>

        <div class="cb-section">
          <span class="cb-lbl">① select element</span>
          <button id="__cb_pick__">🎯 Click to pick an element</button>
          <div id="__cb_seltag__"></div>
        </div>

        <div class="cb-section">
          <span class="cb-lbl">② upload image or gif</span>
          <div id="__cb_drop__">
            <input type="file" id="__cb_file__" accept="image/*,.gif">
            <span class="cb-icon">🖼️</span>
            <p class="cb-dtxt">drag & drop or click to upload</p>
            <p class="cb-dhint">PNG · JPG · GIF · WebP</p>
          </div>
        </div>

        <div id="__cb_preview__">
          <span class="cb-lbl">preview</span>
          <img id="__cb_previmg__" alt="preview">
          <p id="__cb_prevname__"></p>
        </div>

        <div class="cb-row">
          <button class="cb-btn" id="__cb_apply__" disabled>Apply ✓</button>
          <button class="cb-btn" id="__cb_delete__">Clear 🗑️</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  // ─── State ───────────────────────────────────────────────────
  let selSelector = null;
  let selBase64   = null;
  let picking     = false;

  // ─── Refs ────────────────────────────────────────────────────
  const fab      = document.getElementById('__cb_fab__');
  const overlay  = document.getElementById('__cb_overlay__');
  const closeBtn = document.getElementById('__cb_close__');
  const pickBtn  = document.getElementById('__cb_pick__');
  const selTag   = document.getElementById('__cb_seltag__');
  const dropzone = document.getElementById('__cb_drop__');
  const fileInp  = document.getElementById('__cb_file__');
  const preview  = document.getElementById('__cb_preview__');
  const prevImg  = document.getElementById('__cb_previmg__');
  const prevName = document.getElementById('__cb_prevname__');
  const applyBtn = document.getElementById('__cb_apply__');
  const delBtn   = document.getElementById('__cb_delete__');

  // ─── Open / Close ─────────────────────────────────────────────
  fab.addEventListener('click', () => overlay.classList.toggle('cb-open'));
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  function closeModal() {
    overlay.classList.remove('cb-open');
    if (picking) stopPick();
  }

  // ─── Element Picker ───────────────────────────────────────────
  pickBtn.addEventListener('click', () => picking ? stopPick() : startPick());

  function startPick() {
    picking = true;
    pickBtn.textContent = '⏹ Cancel picking';
    pickBtn.classList.add('cb-active');
    overlay.classList.remove('cb-open');
    document.addEventListener('mouseover', onHover);
    document.addEventListener('click', onPick, true);
  }

  function stopPick() {
    picking = false;
    pickBtn.textContent = '🎯 Click to pick an element';
    pickBtn.classList.remove('cb-active');
    document.querySelectorAll('.__cb_hl__').forEach(el => el.classList.remove('__cb_hl__'));
    document.removeEventListener('mouseover', onHover);
    document.removeEventListener('click', onPick, true);
  }

  function onHover(e) {
    if (e.target.closest('#__cb_root__')) return;
    document.querySelectorAll('.__cb_hl__').forEach(el => el.classList.remove('__cb_hl__'));
    e.target.classList.add('__cb_hl__');
  }

  function onPick(e) {
    if (e.target.closest('#__cb_root__')) return;
    e.preventDefault();
    e.stopPropagation();
    const el = e.target;
    el.classList.remove('__cb_hl__');
    selSelector = makeSelector(el);
    stopPick();
    overlay.classList.add('cb-open');
    selTag.textContent = `✓ ${selSelector}`;
    selTag.classList.add('cb-show');
    checkApply();
  }

  function makeSelector(el) {
    if (el.id && !el.id.startsWith('__cb')) return `#${el.id}`;
    const cls = [...el.classList].filter(c => !c.startsWith('__cb') && !/^\d/.test(c));
    if (cls.length) return `.${cls[0]}`;
    return el.tagName.toLowerCase();
  }

  // ─── File Upload ──────────────────────────────────────────────
  fileInp.addEventListener('change', e => { if (e.target.files[0]) readFile(e.target.files[0]); });

  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('cb-drag'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('cb-drag'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('cb-drag');
    if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]);
  });

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      selBase64 = ev.target.result;
      prevImg.src = selBase64;
      prevName.textContent = file.name;
      preview.classList.add('cb-show');
      checkApply();
    };
    reader.readAsDataURL(file);
  }

  function checkApply() {
    applyBtn.disabled = !(selSelector && selBase64);
  }

  // ─── Apply ────────────────────────────────────────────────────
  applyBtn.addEventListener('click', async () => {
    const key = `cb::${location.hostname}::${selSelector}`;
    await chrome.storage.local.set({ [key]: selBase64 });
    applyStyle(selSelector, selBase64);
    applyBtn.textContent = 'Done! ✨';
    setTimeout(() => { applyBtn.textContent = 'Apply ✓'; }, 2000);
  });

  // ─── Delete ───────────────────────────────────────────────────
  delBtn.addEventListener('click', async () => {
    if (!selSelector) return;
    const key = `cb::${location.hostname}::${selSelector}`;
    await chrome.storage.local.remove(key);
    removeStyle(selSelector);
    selBase64 = null;
    preview.classList.remove('cb-show');
    prevImg.src = '';
    checkApply();
    delBtn.textContent = 'Cleared! ✓';
    setTimeout(() => { delBtn.textContent = 'Clear 🗑️'; }, 2000);
  });

  // ─── Popup message listener ───────────────────────────────────
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.action === 'toggleModal') overlay.classList.toggle('cb-open');
  });
}
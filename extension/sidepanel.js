let selSelector = null;
let mode = 'image';
let selBase64 = null;
let selectedSize = 'cover';
let picking = false;

const pickBtn   = document.getElementById('pickBtn');
const selTag    = document.getElementById('selTag');
const dropzone  = document.getElementById('dropzone');
const fileInp   = document.getElementById('fileInput');
const preview   = document.getElementById('preview');
const prevImg   = document.getElementById('prevImg');
const prevName  = document.getElementById('prevName');
const prevSize  = document.getElementById('prevSize');
const applyBtn  = document.getElementById('applyBtn');
const delBtn    = document.getElementById('deleteBtn');
const opacitySlider = document.getElementById('opacitySlider');
const opacityVal = document.getElementById('opacityVal');
const fixedToggle = document.getElementById('fixedToggle');
const bgColorInput = document.getElementById('bgColorInput');
const textColorInput = document.getElementById('textColorInput');

(async () => {
  const tab = await getTab();
  if (!tab?.url?.includes('mapua.blackboard.com')) {
    document.getElementById('app').classList.add('hidden');
    document.getElementById('blocked').classList.remove('hidden');
  }
})();

async function getTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    mode = tab.dataset.mode;
    document.getElementById('panel-image').classList.toggle('hidden', mode !== 'image');
    document.getElementById('panel-color').classList.toggle('hidden', mode !== 'color');
    document.getElementById('panel-hide').classList.toggle('hidden', mode !== 'hide');
    checkApply();
  });
});

document.querySelectorAll('.size-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.size-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    selectedSize = opt.dataset.size;
  });
});

opacitySlider.addEventListener('input', () => {
  opacityVal.textContent = `${opacitySlider.value}%`;
});

pickBtn.addEventListener('click', async () => {
  const tab = await getTab();
  picking = !picking;
  pickBtn.textContent = picking ? 'Cancel picking' : 'Click to pick an element';
  pickBtn.classList.toggle('active', picking);
  chrome.tabs.sendMessage(tab.id, { action: picking ? 'startPick' : 'stopPick' });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'elementPicked') {
    picking = false;
    selSelector = msg.selector;
    pickBtn.textContent = 'Click to pick an element';
    pickBtn.classList.remove('active');
    selTag.textContent = `✓ ${selSelector}`;
    selTag.classList.remove('hidden');
    checkApply();
  }
});

fileInp.addEventListener('change', e => { if (e.target.files[0]) readFile(e.target.files[0]); });
dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('drag');
  if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]);
});

function readFile(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    selBase64 = ev.target.result;
    prevImg.src = selBase64;
    prevName.textContent = file.name;

    const mb = (file.size / (1024 * 1024)).toFixed(1);
    if (file.size > 4 * 1024 * 1024) {
      prevSize.textContent = `⚠️ ${mb}MB — pretty big, might lag or fail to save`;
      prevSize.style.color = '#e07856';
    } else if (file.size > 2 * 1024 * 1024) {
      prevSize.textContent = `${mb}MB — a bit heavy but should be fine`;
      prevSize.style.color = '#C9A880';
    } else {
      prevSize.textContent = `${mb}MB — nice and light`;
      prevSize.style.color = '#7a9b6e';
    }

    preview.classList.remove('hidden');
    checkApply();
  };
  reader.readAsDataURL(file);
}

function checkApply() {
  if (mode === 'image') applyBtn.disabled = !(selSelector && selBase64);
  else applyBtn.disabled = !selSelector;
}

applyBtn.addEventListener('click', async () => {
  const tab = await getTab();
  let data;

  if (mode === 'image') {
    data = { type: 'image', value: selBase64, size: selectedSize, opacity: opacitySlider.value / 100, fixed: fixedToggle.checked };
  } else if (mode === 'color') {
    data = { type: 'color', bgColor: bgColorInput.value, textColor: textColorInput.value };
  } else if (mode === 'hide') {
    data = { type: 'hidden' };
  }

  const key = `cb::${new URL(tab.url).hostname}::${selSelector}`;
  await chrome.storage.local.set({ [key]: data });
  chrome.tabs.sendMessage(tab.id, { action: 'applyStyle', selector: selSelector, data });

  applyBtn.textContent = 'Done ey';
  setTimeout(() => { applyBtn.textContent = 'Apply ✓'; }, 2000);
});

delBtn.addEventListener('click', async () => {
  if (!selSelector) return;
  const tab = await getTab();
  const key = `cb::${new URL(tab.url).hostname}::${selSelector}`;
  await chrome.storage.local.remove(key);
  chrome.tabs.sendMessage(tab.id, { action: 'removeStyle', selector: selSelector });
  selBase64 = null;
  preview.classList.add('hidden');
  prevImg.src = '';
  checkApply();
  delBtn.textContent = 'Cleared✓';
  setTimeout(() => { delBtn.textContent = 'Clear'; }, 2000);
});
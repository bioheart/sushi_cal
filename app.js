// ─── State ───────────────────────────────────────────────────────────────────
let plates = [];
let version = '1.0.0';
let customIdCounter = 1;
let modalMode = 'add'; // 'add' | 'edit'
let editTargetId = null;
let history = []; // max 3 snapshots

// ─── History ─────────────────────────────────────────────────────────────────
function saveHistory() {
  history.push(JSON.parse(JSON.stringify(plates)));
  if (history.length > 10) history.shift();
}

function undo() {
  if (history.length === 0) return;
  plates = history.pop();
  render();
}

// ─── Render ──────────────────────────────────────────────────────────────────
function render() {
  const list = document.getElementById('platesList');
  list.innerHTML = '';
  let total = 0, totalPlates = 0;

  plates.forEach(plate => {
    total += plate.price * plate.count;
    totalPlates += plate.count;

    const card = document.createElement('div');
    card.className = 'plate-card';
    card.innerHTML = `
      <div class="plate-dot" style="background:${plate.color};border-color:${plate.borderColor || 'rgba(0,0,0,0.12)'}"></div>
      <div class="plate-info">
        <div class="plate-name">
          ${escHtml(plate.name)}
          <span class="count-badge ${plate.count === 0 ? 'zero' : ''}">${plate.count}</span>
        </div>
        <div class="plate-price">
          ฿${plate.price} / plate
          
        </div>
      </div>
      <div class="plate-controls">
        ${plate.editable
          ? `<button class="ctrl-btn edit-price-btn" aria-label="Edit price">✏️</button>
          <button class="ctrl-btn delete-btn" aria-label="Delete plate">🗑</button>
            `
          : '<div style="width:44px"></div>'}
        <div class="count-display">${plate.count}</div>
        ${plate.count > 0
          ? `<button class="ctrl-btn minus-btn" aria-label="Remove one">−</button>`
          : '<div style="width:44px"></div>'}
      </div>
    `;

    // Tap card to increment
    card.addEventListener('click', () => adjust(plate.id, 1));

    // Minus — decrement without bubbling
    const minusBtn = card.querySelector('.minus-btn');
    if (minusBtn) {
      minusBtn.addEventListener('click', e => {
        e.stopPropagation();
        adjust(plate.id, -1);
      });
    }

    // Edit price — open modal without bubbling
    const editBtn = card.querySelector('.edit-price-btn');
    if (editBtn) {
      editBtn.addEventListener('click', e => {
        e.stopPropagation();
        openEditModal(plate.id);
      });
    }

    // Delete — remove row without bubbling
    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', e => {
        e.stopPropagation();
        deletePlate(plate.id);
      });
    }

    list.appendChild(card);
  });

  document.getElementById('appVersion').textContent = `v${version}`;
  document.getElementById('totalAmount').textContent = `฿${total}`;
  document.getElementById('totalPlatesLabel').textContent =
    totalPlates > 0 ? `${totalPlates} plate${totalPlates !== 1 ? 's' : ''}` : '';

  const undoBtn = document.getElementById('undoBtn');
  undoBtn.disabled = history.length === 0;
  undoBtn.title = history.length > 0
    ? `${history.length} step${history.length > 1 ? 's' : ''} available`
    : '';
}

// ─── Plate mutations ─────────────────────────────────────────────────────────
function adjust(id, delta) {
  const plate = plates.find(p => p.id === id);
  if (!plate) return;
  const next = Math.max(0, plate.count + delta);
  if (next === plate.count) return; // no change — don't pollute history
  saveHistory();
  plate.count = next;
  render();
}

function deletePlate(id) {
  saveHistory();
  plates = plates.filter(p => p.id !== id);
  render();
}

function resetAll() {
  saveHistory();
  plates = plates
    .filter(p => !p.editable)   // remove custom plates
    .map(p => ({ ...p, count: 0 })); // zero preset counts
  render();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function openModal() {
  modalMode = 'add';
  editTargetId = null;
  document.getElementById('modalTitle').textContent = 'Add Custom Plate';
  document.getElementById('modalSubtitle').textContent = 'Set a name and price for your custom plate.';
  document.getElementById('inputName').value = '';
  document.getElementById('inputName').style.display = '';
  document.querySelector('label[for="inputName"]').style.display = '';
  document.getElementById('inputPrice').value = '';
  document.getElementById('errorMsg').style.display = 'none';
  document.getElementById('modalOverlay').classList.add('open');
  setTimeout(() => document.getElementById('inputName').focus(), 50);
}

function openEditModal(id) {
  const plate = plates.find(p => p.id === id);
  if (!plate) return;
  modalMode = 'edit';
  editTargetId = id;
  document.getElementById('modalTitle').textContent = `Edit "${plate.name}"`;
  document.getElementById('modalSubtitle').textContent = 'Update the price for this plate.';
  document.getElementById('inputName').style.display = 'none';
  document.querySelector('label[for="inputName"]').style.display = 'none';
  document.getElementById('inputPrice').value = plate.price;
  document.getElementById('errorMsg').style.display = 'none';
  document.getElementById('modalOverlay').classList.add('open');
  setTimeout(() => document.getElementById('inputPrice').focus(), 50);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function confirmModal() {
  const priceRaw = document.getElementById('inputPrice').value.trim();
  const price = parseInt(priceRaw, 10);
  const errEl = document.getElementById('errorMsg');

  if (!priceRaw || isNaN(price) || price < 1 || price > 9999) {
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  saveHistory();
  if (modalMode === 'edit') {
    const plate = plates.find(p => p.id === editTargetId);
    if (plate) plate.price = price;
  } else {
    const rawName = document.getElementById('inputName').value.trim();
    const name = rawName || `Custom ${customIdCounter}`;
    plates.push({
      id: `custom_${customIdCounter++}`,
      name,
      price,
      color: 'linear-gradient(135deg, #8e44ad, #3498db)',
      borderColor: '#8e44ad',
      editable: true,
      count: 1,
    });
  }

  closeModal();
  render();
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch('plates.json');
    const versionRes = await fetch('version.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const versionData = await versionRes.json();
    version = versionData.version;
    plates = data.plates.map(p => ({ ...p, count: 0 }));
  } catch (err) {
    console.error('Failed to load plates.json:', err);
    plates = [
      { id: 'white',  name: 'White',  price: 30,  color: '#f5f5f0',                                        borderColor: '#ccc',     editable: false, count: 0 },
      { id: 'red',    name: 'Red',    price: 40,  color: '#e74c3c',                                        borderColor: '#c0392b',  editable: false, count: 0 },
      { id: 'silver', name: 'Silver', price: 60,  color: 'linear-gradient(135deg,#bdc3c7,#95a5a6)',        borderColor: '#95a5a6',  editable: false, count: 0 },
      { id: 'gold',   name: 'Gold',   price: 80,  color: 'linear-gradient(135deg,#f7c948,#d4a017)',        borderColor: '#d4a017',  editable: false, count: 0 },
      { id: 'black',  name: 'Black',  price: 100, color: '#2c2520',                                        borderColor: '#111',     editable: false, count: 0 },
    ];
  }
  render();
}

// ─── Event listeners ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addCustomBtn').addEventListener('click', openModal);
  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('resetBtn').addEventListener('click', resetAll);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
  document.getElementById('modalConfirmBtn').addEventListener('click', confirmModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.getElementById('modalOverlay').classList.contains('open')) {
      confirmModal();
    }
    if (e.key === 'Escape') closeModal();
  });

  init();
});

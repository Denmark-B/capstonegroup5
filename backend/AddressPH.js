/* ============================================================
   AddressPH.js — Philippine address with typing suggestions.   v4

   LOAD ORDER (last):
     ... backend/ShippingJNT.js, backend/EmailFeature.js,
         backend/AddressPH.js

   Checkout step 1 asks for, in this order:
     City / Municipality   (type to search all of them — province fills in by itself)
     Province              (type to search; narrows the city list)
     Barangay              (type to search the barangays of that city)
     House no. / Street / Subdivision / Landmark
   • Suggestions appear while typing, sorted A→Z (numbers in natural
     order), accents optional ("paranaque" finds Parañaque, "santo"
     finds "Sto. Tomas").
   • Arrow keys + Enter or click to choose; Esc closes the list.
   • The J&T shipping area is set automatically from the city.
   • The full address is saved with the order (orders.address).
   Data: official PSA PSGC list as of 30 June 2026 (2Q 2026): 84 provinces
   incl. Metro Manila, 1,655 cities/municipalities (Manila by district),
   42,010 barangays — data/ph-address/, rebuilt with tools/update-address-data.py.
   ============================================================ */

const LF_ADDR_VERSION = '4';
const LF_ADDR_BASE = 'data/ph-address/';
const LF_ADDR = { provinces: null, index: null, cities: {}, sel: { prov: null, city: null, brgy: '' } };
console.info('[Lost & Found] AddressPH.js v' + LF_ADDR_VERSION + ' loaded');

const lfCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const lfSort = (arr, key) => arr.slice().sort((a, b) => lfCollator.compare(key ? key(a) : a, key ? key(b) : b));
function lfNorm(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/\bsto\.?(?=\s)/g, 'santo').replace(/\bsta\.?(?=\s)/g, 'santa').replace(/\bgen\.?(?=\s)/g, 'general')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

// spelling-forgiving form used only when nothing matches exactly: w≈u, k≈c, doubled letters
function lfFuzz(s) { return s.replace(/w/g, 'u').replace(/k/g, 'c').replace(/([a-z])\1+/g, '$1'); }

async function lfAddrFetch(path) {
  const url = LF_ADDR_BASE + path + '?v=' + LF_ADDR_VERSION;
  let r;
  try { r = await fetch(url, { headers: { 'Accept': 'application/json' } }); }
  catch (e) { throw new Error('could not open ' + url + ' (is the site opened through http://localhost/ ?)'); }
  if (!r.ok) throw new Error(url + ' → ' + r.status + (r.status === 404 ? ' Not Found (copy the "data" folder into the lostandfound folder)' : ''));
  return r.json();
}

/* ============================================================
   Small accessible combobox (input + suggestion list)
   ============================================================ */
function lfCombo({ input, getItems, label, sub, onPick, emptyText }) {
  const list = document.createElement('ul');
  list.id = input.id + '-list';
  list.setAttribute('role', 'listbox');
  list.style.cssText = 'position:absolute;left:0;right:0;top:100%;z-index:50;max-height:240px;overflow-y:auto;margin:2px 0 0;padding:4px 0;list-style:none;background:#fff;border:1.5px solid var(--g2,#d6d3cc);border-radius:var(--r,8px);box-shadow:0 8px 24px rgba(0,0,0,.12);display:none';
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative';
  input.parentElement.insertBefore(wrap, input);
  wrap.appendChild(input); wrap.appendChild(list);
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', list.id);
  input.autocomplete = 'off';

  let items = [], shown = [], active = -1, picked = null;

  function rank(q) {
    if (!q) return items.slice(0, 300);
    const words = q.split(' ');
    const scored = [];
    for (const it of items) {
      const hay = it._norm;
      if (!words.every(w => hay.includes(w))) continue;
      const score = hay.startsWith(q) ? 0 : (' ' + hay).includes(' ' + words[0]) ? 1 : 2;
      scored.push([score, it]);
    }
    if (!scored.length && lfFuzz(q).replace(/ /g, '').length >= 4) {   // nothing? try the spelling-forgiving match
      const fq = lfFuzz(q).split(' ');
      for (const it of items) if (fq.every(w => it._fuzz.includes(w))) scored.push([3, it]);
    }
    scored.sort((a, b) => a[0] - b[0] || lfCollator.compare(label(a[1]), label(b[1])));
    return scored.slice(0, 80).map(s => s[1]);
  }
  function render() {
    const q = lfNorm(input.value);
    shown = rank(picked && input.value === label(picked) ? '' : q);
    active = shown.length ? 0 : -1;
    list.innerHTML = shown.length
      ? shown.map((it, i) => `<li id="${list.id}-${i}" role="option" data-i="${i}" aria-selected="${i === active}"
          style="padding:.5rem .8rem;cursor:pointer;font-size:.88rem;line-height:1.3;${i === active ? 'background:var(--g1,#f1efe9)' : ''}">
          <span style="font-weight:600">${lfEsc(label(it))}</span>${sub && sub(it) ? `<span style="color:var(--g4,#6b6860);font-size:.8rem"> — ${lfEsc(sub(it))}</span>` : ''}</li>`).join('')
      : `<li style="padding:.55rem .8rem;color:var(--g4,#6b6860);font-size:.85rem">${lfEsc(items.length ? 'No match — check the spelling' : (emptyText || 'Nothing to choose yet'))}</li>`;
    open();
    setActive(active);
  }
  function open() { list.style.display = 'block'; input.setAttribute('aria-expanded', 'true'); }
  function close() { list.style.display = 'none'; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); }
  function setActive(i) {
    [...list.querySelectorAll('[role=option]')].forEach((li, j) => {
      li.style.background = j === i ? 'var(--g1,#f1efe9)' : ''; li.setAttribute('aria-selected', j === i ? 'true' : 'false');
    });
    active = i;
    if (i >= 0) { const li = document.getElementById(`${list.id}-${i}`); input.setAttribute('aria-activedescendant', li.id); if (typeof li.scrollIntoView === 'function') li.scrollIntoView({ block: 'nearest' }); }
  }
  function choose(it) { picked = it; input.value = it ? label(it) : ''; input.style.borderColor = ''; close(); onPick(it); }

  input.addEventListener('input', () => { if (picked) { picked = null; onPick(null, true); } render(); });
  input.addEventListener('focus', () => { if (!input.disabled) render(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (list.style.display === 'none') render(); else if (shown.length) setActive(Math.min(active + 1, shown.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (shown.length) setActive(Math.max(active - 1, 0)); }
    else if (e.key === 'Enter') { if (list.style.display !== 'none' && active >= 0) { e.preventDefault(); choose(shown[active]); } }
    else if (e.key === 'Escape') { close(); }
  });
  list.addEventListener('mousedown', e => {           // mousedown so it fires before the input loses focus
    const li = e.target.closest('[role=option]'); if (!li) return;
    e.preventDefault(); choose(shown[+li.dataset.i]);
  });
  input.addEventListener('blur', () => setTimeout(() => {
    close();
    if (!picked && input.value.trim()) {               // typed but didn't choose: accept an exact match, else flag it
      const q = lfNorm(input.value);
      const exact = items.filter(it => lfNorm(label(it)) === q);
      if (exact.length === 1) choose(exact[0]); else input.style.borderColor = 'var(--red,#b91c1c)';
    }
  }, 120));

  return {
    setItems(arr) { items = arr.map(it => { const n = lfNorm(label(it) + ' ' + (sub ? sub(it) || '' : '')); return { ...it, _norm: n, _fuzz: lfFuzz(n) }; }); if (document.activeElement === input) render(); },
    set(it) { picked = it ? (items.find(x => x.c === it.c && x.k === it.k) || it) : null; input.value = it ? label(it) : ''; input.style.borderColor = ''; },
    get: () => picked,
    enable(on) { input.disabled = !on; input.style.opacity = on ? '' : '.55'; },
  };
}

/* ============================================================
   The form
   ============================================================ */
let LF_CB = null;

function lfBuildAddressForm() {
  if (document.getElementById('lf-addr')) return true;
  const zoneSel = document.getElementById('shipping-zone');
  if (!zoneSel) return false;
  const zoneLbl = document.querySelector('label[for="shipping-zone"]');
  const inputCss = 'width:100%;box-sizing:border-box';

  const box = document.createElement('div');
  box.id = 'lf-addr';
  box.innerHTML = `
    <div style="font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--g4);margin:.2rem 0 .5rem">Delivery address</div>
    <div id="lf-addr-error" role="alert" style="display:none;background:#fee2e2;border:1px solid var(--red,#b91c1c);color:var(--red,#b91c1c);border-radius:var(--r,8px);padding:.65rem .9rem;font-size:.82rem;line-height:1.5;margin-bottom:.8rem"></div>
    <label class="pay-label" for="lf-addr-city">City / Municipality *</label>
    <input class="pay-input" id="lf-addr-city" style="${inputCss}" placeholder="Start typing, e.g. Lipa" disabled>
    <label class="pay-label" for="lf-addr-prov">Province *</label>
    <input class="pay-input" id="lf-addr-prov" style="${inputCss}" placeholder="Fills in when you choose a city — or type, e.g. Batangas" disabled>
    <label class="pay-label" for="lf-addr-brgy">Barangay *</label>
    <input class="pay-input" id="lf-addr-brgy" style="${inputCss}" placeholder="Choose a city first" disabled>
    <label class="pay-label" for="lf-addr-street">House no., Street, Subdivision / Village, Landmark *</label>
    <textarea class="pay-input" id="lf-addr-street" maxlength="300" rows="2" autocomplete="street-address"
      style="resize:vertical;min-height:62px;${inputCss}" placeholder="e.g. Blk 5 Lot 12, Mabini St., Villa Rosa Subd., near the chapel"></textarea>
    <div id="lf-addr-preview" aria-live="polite" style="display:none;font-size:.8rem;line-height:1.5;color:var(--g5);background:var(--g1);border-radius:var(--r,8px);padding:.6rem .8rem;margin:-.2rem 0 .8rem"></div>`;
  (zoneLbl || zoneSel).insertAdjacentElement('beforebegin', box);
  zoneSel.style.display = 'none'; zoneSel.setAttribute('aria-hidden', 'true'); zoneSel.tabIndex = -1;
  if (zoneLbl) zoneLbl.style.display = 'none';

  const provName = k => (LF_ADDR.provinces || []).find(p => p.k === k)?.n || '';
  LF_CB = {
    city: lfCombo({ input: document.getElementById('lf-addr-city'), label: c => c.n, sub: c => provName(c.k),
      emptyText: 'Loading cities…', onPick: lfAddrOnCity }),
    prov: lfCombo({ input: document.getElementById('lf-addr-prov'), label: p => p.n, sub: null,
      emptyText: 'Loading provinces…', onPick: lfAddrOnProvince }),
    brgy: lfCombo({ input: document.getElementById('lf-addr-brgy'), label: b => b.n, sub: null,
      emptyText: 'Choose a city first', onPick: b => { LF_ADDR.sel.brgy = b ? b.n : ''; lfAddrCompose(); } }),
  };
  document.getElementById('lf-addr-street').addEventListener('input', lfAddrCompose);
  lfBuildStep2Summary();
  lfAddrLoad();
  return true;
}

function lfBuildStep2Summary() {
  const addr = document.getElementById('pay-address');
  if (!addr || document.getElementById('lf-addr-summary')) return;
  const lbl = document.querySelector('label[for="pay-address"]');
  addr.style.display = 'none'; addr.setAttribute('aria-hidden', 'true'); addr.tabIndex = -1;
  if (lbl) lbl.textContent = 'Delivery Address *';
  const sum = document.createElement('div');
  sum.id = 'lf-addr-summary';
  sum.style.cssText = 'font-size:.86rem;line-height:1.55;background:var(--g1);border:1.5px solid var(--g2);border-radius:var(--r,8px);padding:.7rem .9rem;margin-bottom:1rem;display:flex;justify-content:space-between;gap:.6rem;align-items:flex-start';
  sum.innerHTML = '<span id="lf-addr-summary-text" style="color:var(--g5)">Set your address in step 1.</span>'
    + '<button type="button" class="tbl-action" style="flex-shrink:0" onclick="updateCheckoutStep(1)">Change</button>';
  addr.insertAdjacentElement('afterend', sum);
}

async function lfAddrLoad() {
  try {
    const [pv, ix] = await Promise.all([lfAddrFetch('provinces.json'), lfAddrFetch('cities-index.json')]);
    LF_ADDR.provinces = lfSort(pv.provinces, p => p.n);
    LF_ADDR.index = lfSort(ix, c => c.n);
    LF_CB.prov.setItems(LF_ADDR.provinces);
    LF_CB.city.setItems(LF_ADDR.index);
    LF_CB.city.enable(true); LF_CB.prov.enable(true);
  } catch (e) {
    console.error('[Lost & Found] address list', e);
    const err = document.getElementById('lf-addr-error');
    err.innerHTML = '<b>The address list could not load:</b> ' + lfEsc(e.message)
      + '<br>You can still choose your area below and type your full address in the next step.';
    err.style.display = 'block';
    // keep checkout usable: show the old area list + free-text address again
    const zoneSel = document.getElementById('shipping-zone');
    zoneSel.style.display = ''; zoneSel.removeAttribute('aria-hidden'); zoneSel.tabIndex = 0;
    const zoneLbl = document.querySelector('label[for="shipping-zone"]'); if (zoneLbl) zoneLbl.style.display = '';
    ['lf-addr-city', 'lf-addr-prov', 'lf-addr-brgy', 'lf-addr-street'].forEach(id => {
      const el = document.getElementById(id); el.closest('div[style*="position:relative"]')?.remove(); el.remove();
    });
    document.querySelectorAll('#lf-addr label').forEach(l => l.remove());
    const addr = document.getElementById('pay-address');
    if (addr) { addr.style.display = ''; addr.removeAttribute('aria-hidden'); addr.tabIndex = 0; }
    document.getElementById('lf-addr-summary')?.remove();
    LF_ADDR.failed = true;
  }
}

async function lfAddrProvinceCities(k) {
  if (!LF_ADDR.cities[k]) LF_ADDR.cities[k] = await lfAddrFetch('cities/' + encodeURIComponent(k) + '.json');
  return LF_ADDR.cities[k];
}

/* ---------- picking ---------- */
async function lfAddrOnCity(c, typing) {
  LF_ADDR.sel.city = null; LF_ADDR.sel.brgy = '';
  LF_CB.brgy.set(null); LF_CB.brgy.setItems([]); LF_CB.brgy.enable(false);
  document.getElementById('lf-addr-brgy').placeholder = 'Choose a city first';
  if (!c) { lfAddrSetZone(LF_ADDR.sel.prov ? LF_ADDR.sel.prov.z : ''); lfAddrCompose(); return; }
  // province fills in by itself
  const prov = LF_ADDR.provinces.find(p => p.k === c.k);
  LF_ADDR.sel.prov = prov; LF_CB.prov.set(prov);
  try {
    const full = (await lfAddrProvinceCities(c.k)).find(x => x.c === c.c);
    if (!full || LF_CB.city.get()?.c !== c.c) return;               // changed again meanwhile
    LF_ADDR.sel.city = full;
    LF_CB.brgy.setItems(lfSort(full.b).map(n => ({ c: n, n })));
    LF_CB.brgy.enable(true);
    document.getElementById('lf-addr-brgy').placeholder = `Type your barangay (${full.b.length} in ${full.n})`;
    lfAddrSetZone(full.z);
  } catch (e) { toast('Could not load barangays — ' + e.message, 'error'); }
  lfAddrCompose();
}

function lfAddrOnProvince(p) {
  LF_ADDR.sel.prov = p || null;
  const city = LF_CB.city.get();
  if (!p) {                                                          // province cleared → all cities again
    LF_CB.city.setItems(LF_ADDR.index);
  } else {
    LF_CB.city.setItems(LF_ADDR.index.filter(c => c.k === p.k));      // only this province's cities
    if (city && city.k !== p.k) {                                    // city belongs elsewhere → clear it
      LF_CB.city.set(null); lfAddrOnCity(null);
    }
    document.getElementById('lf-addr-city').placeholder = 'Type a city / municipality in ' + p.n;
  }
  if (!LF_ADDR.sel.city) lfAddrSetZone(p ? p.z : '');
  lfAddrCompose();
}

/* ---------- shipping follows the address ---------- */
function lfAddrSetZone(zone) {
  const zoneSel = document.getElementById('shipping-zone');
  if (!zoneSel) return;
  if (zone && !zoneSel.querySelector(`option[value="${zone}"]`)) {
    const o = document.createElement('option'); o.value = zone; o.textContent = zone; zoneSel.appendChild(o);
  }
  if (zoneSel.value !== (zone || '')) { zoneSel.value = zone || ''; updateShippingRate(); }
}

/* ---------- full address ---------- */
function lfAddrFull() {
  const s = LF_ADDR.sel;
  const street = (document.getElementById('lf-addr-street')?.value || '').trim().replace(/\s+/g, ' ');
  if (!s.prov || !s.city || !s.brgy || !street) return '';
  const brgy = /^(brgy\.?|barangay)\b/i.test(s.brgy) ? s.brgy : 'Brgy. ' + s.brgy;
  const prov = s.prov.k === 'NCR' ? 'Metro Manila' : s.prov.n;
  return `${street}, ${brgy}, ${s.city.n}, ${prov}`;
}
function lfAddrCompose() {
  const full = lfAddrFull();
  const addr = document.getElementById('pay-address');
  if (addr && !LF_ADDR.failed) addr.value = full;
  const prev = document.getElementById('lf-addr-preview');
  if (prev) { prev.style.display = full ? 'block' : 'none'; prev.innerHTML = full ? '<strong>Deliver to:</strong> ' + lfEsc(full) : ''; }
  const sum = document.getElementById('lf-addr-summary-text');
  if (sum) sum.innerHTML = full ? lfEsc(full) : 'Set your address in step 1.';
}

/* ---------- checkout hooks ---------- */
const _lfCheckoutNextAddr = checkoutNext;
checkoutNext = function () {
  if (checkoutStep === 1 && document.getElementById('lf-addr-city') && !LF_ADDR.failed) {
    const s = LF_ADDR.sel;
    const street = (document.getElementById('lf-addr-street').value || '').trim();
    const need = !s.city ? ['lf-addr-city', 'Please choose your city / municipality from the suggestions']
      : !s.prov ? ['lf-addr-prov', 'Please choose your province']
      : !s.brgy ? ['lf-addr-brgy', 'Please choose your barangay from the suggestions']
      : street.length < 5 ? ['lf-addr-street', 'Please enter your house no. and street']
      : null;
    if (need) { toast(need[1], 'error'); document.getElementById(need[0])?.focus(); return; }
    lfAddrCompose();
  }
  return _lfCheckoutNextAddr.apply(this, arguments);
};

const _lfBuildReceiptAddr = buildReceipt;
buildReceipt = function () {
  const r = _lfBuildReceiptAddr.apply(this, arguments);
  if (lfBuildAddressForm() && !LF_ADDR.failed) {
    const s = LF_ADDR.sel;
    const zone = s.city ? s.city.z : (s.prov ? s.prov.z : '');
    if (zone) { document.getElementById('shipping-zone').value = ''; lfAddrSetZone(zone); }
    lfAddrCompose();
  }
  return r;
};

const _lfPlaceOrderAddr = placeOrder;
placeOrder = async function () {
  if (document.getElementById('lf-addr-city') && !LF_ADDR.failed) {
    const full = lfAddrFull();
    if (!full) { toast('Please complete your delivery address', 'error'); updateCheckoutStep(1); return; }
    document.getElementById('pay-address').value = full;
  }
  return _lfPlaceOrderAddr.apply(this, arguments);
};

document.addEventListener('DOMContentLoaded', lfBuildAddressForm);
if (document.readyState !== 'loading') lfBuildAddressForm();

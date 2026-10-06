/* ============================================================
   SyncSecure.js — security + completeness layer for Sync.js.

   LOAD ORDER (in lostandfound.html, right before </body>):
     <script src="lostandfound.js"></script>
     <script src="backend/Sync.js"></script>
     <script src="backend/SyncSecure.js"></script>

   Same approach as Sync.js: nothing in lostandfound.js or Sync.js
   is rewritten. Functions are overridden (same name, loaded
   later) or wrapped (original is called, then extra work).

   What this file adds:
     • CSRF token on every POST/PUT/DELETE, clear server error
       messages in the existing toast()
     • real image uploads (files in /uploads, not base64)
     • localStorage only for cart / recently viewed / visitor id
     • forced password change for temporary passwords
     • strong-password rules for admin-created merchants
     • event approval (admin), feedback list from the database
     • customers can only edit/delete their own reviews
   ============================================================ */

// Where the API lives. If you ever host the frontend on a different
// domain than PHP, set  window.LF_API_URL = 'https://your-php-host/backend/Api.php'
// in a <script> BEFORE this file (and add that origin in config.local.php).
const LF = {
  apiUrl: (typeof window.LF_API_URL === 'string' && window.LF_API_URL) || 'backend/Api.php',
  csrf: null,
  auth: { loggedIn: false, isAdmin: false, merchantId: null },
  mustChange: false,
  lastError: null,
  lastErrorAt: 0,
  errorCount: 0,
  eventStatus: {},
  maxUploadBytes: 5 * 1024 * 1024,
  uploadTypes: ['image/jpeg', 'image/png', 'image/webp'],
};

/* ---------- small helpers ---------- */
function lfEsc(v) {
  return String(v == null ? '' : v).replace(/[&<>"'`]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c]));
}
function lfSetError(msg) { LF.lastError = msg; LF.lastErrorAt = Date.now(); LF.errorCount++; }
function lfIsAdmin() { return !!(currentMerchant && currentMerchant.id === 'lostandfound'); }
function lfPasswordProblem(p) {
  if (!p || p.length < 10) return 'Password must be at least 10 characters.';
  if (p.length > 72) return 'Password must be at most 72 characters.';
  if (!/[A-Za-z]/.test(p)) return 'Password must contain at least one letter.';
  if (!/[0-9]/.test(p)) return 'Password must contain at least one number.';
  return null;
}
function lfIsImageRef(url) {
  return !!url && (/^https:\/\//i.test(url) || /^uploads\//.test(url) || /^(brand pics|products for [^/]+)\//.test(url));
}

/* ---------- 1. localStorage: only harmless UI data from now on ---------- */
(function lfCleanupLegacyStorage() {
  const legacy = ['lf_testimonials', 'lf_testim_reqs', 'lf_brands2', 'lf_products2', 'lf_orders2', 'lf_reviews2',
    'lf_cnotifs', 'lf_mnotifs', 'lf_pending_imgs', 'lf_events', 'lf_feedbacks', 'lf_merchant_passwords',
    'lf_admin_hero_bg', 'lf_admin_mascot', 'lf_admin_logo', 'lf_admin_carousel', 'lf_admin_arrivals_bg', 'lf_admin_events_bg'];
  try { legacy.forEach(k => localStorage.removeItem(k)); } catch (e) { /* private mode */ }
})();

// persist(): real data lives in MySQL now — keep only the cart and browsing UI state locally
function persist() {
  try {
    localStorage.setItem('lf_cart', JSON.stringify(cart));
    localStorage.setItem('lf_rv', JSON.stringify(recentlyViewed));
    localStorage.setItem('lf_browse', JSON.stringify(browseHistory));
  } catch (e) { /* storage full / private mode */ }
}
function persistImgs() { /* pending images are stored in the database */ }
function persistEvents() { /* events are stored in the database */ }
function applyAdminImages() { /* site images come from the database (Sync.js → applyDbSiteImages) */ }

// anonymous visitor id — cryptographically random (keeps any id this browser already has)
function sessionId() {
  let sid = null;
  try { sid = localStorage.getItem('lf_session_id'); } catch (e) { }
  if (!sid || !/^[A-Za-z0-9_]{8,100}$/.test(sid)) {
    const a = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(a);
    sid = 'sess_' + Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
    try { localStorage.setItem('lf_session_id', sid); } catch (e) { }
  }
  return sid;
}

/* ---------- 2. API wrapper with CSRF + readable errors ---------- */
function lfAbsorb(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return;
  if (data.csrfToken) LF.csrf = data.csrfToken;
  if ('mustChangePassword' in data) LF.mustChange = !!data.mustChangePassword;
  if ('loggedIn' in data) LF.auth = { loggedIn: !!data.loggedIn, isAdmin: !!data.isAdmin, merchantId: data.merchantId || null };
}

async function lfFetchCsrf() {
  const res = await fetch(`${LF.apiUrl}?resource=auth&action=check&session=${encodeURIComponent(sessionId())}`,
    { credentials: 'include', headers: { 'Accept': 'application/json' } });
  const data = await res.json().catch(() => null);
  lfAbsorb(data);
  return LF.csrf;
}

// Same signature as api() in Sync.js, so every Sync.js function now uses this one.
async function api(resource, { method = 'GET', id = null, action = null, body = null, query = null } = {}, _retried = false) {
  const params = new URLSearchParams({ resource });
  if (id !== null && id !== undefined) params.set('id', id);
  if (action) params.set('action', action);
  if (query) for (const k in query) params.set(k, query[k]);
  if (!params.has('session')) params.set('session', sessionId());

  const opts = { method, credentials: 'include', headers: { 'Accept': 'application/json' } };
  if (method !== 'GET') {
    if (!LF.csrf) { try { await lfFetchCsrf(); } catch (e) { } }
    opts.headers['X-CSRF-Token'] = LF.csrf || '';
  }
  if (body !== null && body !== undefined) {
    if (body instanceof FormData) opts.body = body;
    else { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  }

  let res;
  try { res = await fetch(`${LF.apiUrl}?${params.toString()}`, opts); }
  catch (e) {
    lfSetError('Cannot reach the server. Check that Apache and MySQL are running.');
    throw e;
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }

  if (!res.ok) {
    if (res.status === 403 && data && data.code === 'csrf' && !_retried) {
      LF.csrf = null;                                   // token expired → fetch a new one, retry once
      return api(resource, { method, id, action, body, query }, true);
    }
    if (data && data.code === 'must_change_password') { LF.mustChange = true; setTimeout(() => lfOpenPasswordModal(true), 50); }
    if (res.status === 401 && data && data.code === 'not_logged_in' && currentMerchant) lfResetLoggedOutUi();
    const msg = (data && data.error) || (text && !data ? 'Server error — check the PHP error log.' : 'Request failed (' + res.status + ').');
    lfSetError(msg);
    console.error('API error', resource, action || '', res.status, msg);
    const err = new Error(msg); err.status = res.status; err.data = data;
    throw err;
  }

  lfAbsorb(data);
  if (resource === 'auth' && action === 'logout') { LF.csrf = null; LF.mustChange = false; LF.auth = { loggedIn: false, isAdmin: false, merchantId: null }; }
  if (resource === 'events' && method === 'GET' && Array.isArray(data)) {
    LF.eventStatus = {};
    data.forEach(e => { LF.eventStatus[e.id] = e.status || 'approved'; try { localStorage.setItem('ev_int_' + e.id, e.interested ? '1' : '0'); } catch (x) { } });
  }
  return data;
}

// Sync.js shows generic error toasts ("Could not save product…").
// If the server just explained WHY, show that message instead.
const _lfToast = toast;
toast = function (msg, type = '') {
  if (type === 'error' && LF.lastError && Date.now() - LF.lastErrorAt < 1500) { msg = LF.lastError; LF.lastError = null; }
  return _lfToast(msg, type);
};

/* ---------- 3. image uploads → real files ---------- */
async function lfUpload(file, category) {
  if (!file) throw new Error('No file selected');
  if (!LF.uploadTypes.includes(file.type)) { lfSetError('Only JPG, PNG or WEBP images are allowed.'); toast('Only JPG, PNG or WEBP images are allowed.', 'error'); throw new Error('type'); }
  if (file.size > LF.maxUploadBytes) { lfSetError('Image is larger than 5 MB.'); toast('Image is larger than 5 MB.', 'error'); throw new Error('size'); }
  const fd = new FormData();
  fd.append('file', file);
  const r = await api('upload', { method: 'POST', query: { category }, body: fd });
  return r.path;
}

// product images (max 5)
async function handleImgsUpload(input) {
  const files = Array.from(input.files || []).slice(0, Math.max(0, 5 - pmImgs.length));
  if (!files.length) { toast('Maximum of 5 images per product', 'error'); return; }
  toast('Uploading ' + files.length + ' image(s)…');
  for (const f of files) {
    try { pmImgs.push(await lfUpload(f, 'products')); renderPmImgsPreview(); }
    catch (e) { if (e.message !== 'type' && e.message !== 'size') toast('Upload failed', 'error'); }
  }
  input.value = '';
}
function addImgUrl(url) {
  url = (url || '').trim();
  if (!url || pmImgs.length >= 5) return;
  if (!/^https:\/\//i.test(url)) { toast('Image links must start with https://', 'error'); return; }
  pmImgs.push(url); renderPmImgsPreview();
}

// brand banner
async function handleBrandImgUpload(input) {
  const file = input.files && input.files[0]; if (!file) return;
  try {
    const path = await lfUpload(file, 'brands');
    const preview = document.getElementById('bm-preview'), area = document.getElementById('bm-upload-area');
    document.getElementById('bm-img').value = path;
    preview.src = path; preview.style.display = 'block'; area.classList.add('has-image');
    toast('Image uploaded — click Save Brand to apply', 'success');
  } catch (e) { if (e.message !== 'type' && e.message !== 'size') toast('Upload failed', 'error'); }
  input.value = '';
}
function previewBrandImgFromUrl(url) {
  const preview = document.getElementById('bm-preview'), area = document.getElementById('bm-upload-area');
  if (lfIsImageRef(url)) {
    preview.src = url; preview.style.display = 'block'; area.classList.add('has-image');
    preview.onerror = () => { preview.style.display = 'none'; area.classList.remove('has-image'); };
  } else { preview.src = ''; preview.style.display = 'none'; area.classList.remove('has-image'); }
}

// event banner
async function handleEvImgUpload(input) {
  const file = input.files && input.files[0]; if (!file) return;
  try {
    const path = await lfUpload(file, 'events');
    document.getElementById('ev-img').value = path;
    const preview = document.getElementById('ev-preview'), area = document.getElementById('ev-upload-area');
    preview.src = path; preview.style.display = 'block'; area.classList.add('has-image');
    toast('Image uploaded!', 'success');
  } catch (e) { if (e.message !== 'type' && e.message !== 'size') toast('Upload failed', 'error'); }
  input.value = '';
}
function previewEvImgFromUrl(url) {
  const preview = document.getElementById('ev-preview'), area = document.getElementById('ev-upload-area');
  if (lfIsImageRef(url)) {
    preview.src = url; preview.style.display = 'block'; area.classList.add('has-image');
    preview.onerror = () => { preview.style.display = 'none'; area.classList.remove('has-image'); };
  } else { preview.src = ''; preview.style.display = 'none'; area.classList.remove('has-image'); }
}

// review photo (customers)
async function handleReviewImg(input) {
  const file = input.files && input.files[0]; if (!file) return;
  try {
    reviewImgData = await lfUpload(file, 'reviews');
    document.getElementById('rm-img-preview').innerHTML = `<img src="${lfEsc(reviewImgData)}" alt="preview">`;
  } catch (e) { if (e.message !== 'type' && e.message !== 'size') toast('Upload failed', 'error'); }
  input.value = '';
}

// site images (admin saves directly, merchants submit for approval)
async function lfSiteImage(input, key, approvalType, targetIndex, label, adminOnly) {
  const file = input.files && input.files[0]; if (!file) return;
  input.value = '';
  let path;
  try { path = await lfUpload(file, 'site'); } catch (e) { if (e.message !== 'type' && e.message !== 'size') toast('Upload failed', 'error'); return; }
  if (lfIsAdmin()) {
    try { await api('settings', { method: 'PUT', body: { key, value: path } }); await loadAllData(); toast(label + ' updated!', 'success'); }
    catch (e) { toast('Could not save image', 'error'); }
  } else if (adminOnly) {
    toast('Only the admin can change the ' + label.toLowerCase(), 'error');
  } else {
    submitForApproval(approvalType, path, targetIndex, label);
  }
}
function adminUploadHero(input) { return lfSiteImage(input, 'hero_bg', 'hero', null, 'Hero Background', false); }
function adminUploadMascot(input) { return lfSiteImage(input, 'mascot_bg', null, null, 'Mascot', true); }
function adminUploadLogo(input) { return lfSiteImage(input, 'logo_bg', null, null, 'Logo', true); }
function adminUploadCarousel(input, i) { return lfSiteImage(input, 'carousel_' + i, 'carousel', i, 'Carousel Slide ' + (i + 1), false); }
function adminUploadArrivalsBanner(input) { return lfSiteImage(input, 'arrivals_bg', 'arrivals', null, 'Arrivals Banner', false); }
function adminUploadEventsBanner(input) { return lfSiteImage(input, 'events_bg', 'events', null, 'Events Banner', false); }

/* ---------- 4. login / session / passwords ---------- */
function lfResetLoggedOutUi() {
  currentMerchant = null;
  saveSession();
  const btn = document.getElementById('merchant-btn');
  if (btn) { btn.innerHTML = ICONS.user + ' Merchant'; btn.classList.remove('logged-in'); btn.style.background = ''; }
  const nw = document.getElementById('merch-notif-wrap'); if (nw) nw.classList.remove('visible');
  if (document.getElementById('page-merchant')?.classList.contains('active')) navigateTo('home');
}

const _lfLoadAllData = loadAllData;
loadAllData = async function () {
  const errorsBefore = LF.errorCount;
  await _lfLoadAllData();
  // Sync.js restores the login before brands are loaded; retry once for brands it didn't know yet
  if (LF.auth.loggedIn && !currentMerchant && typeof getBrand === 'function' && getBrand(LF.auth.merchantId)) {
    await _lfLoadAllData();
  }
  if (!LF.auth.loggedIn && currentMerchant) lfResetLoggedOutUi();
  if (LF.errorCount > errorsBefore && LF.lastError && /reach the server|database|Server error/i.test(LF.lastError)) toast(LF.lastError, 'error');
  if (LF.auth.loggedIn && LF.mustChange) lfOpenPasswordModal(true);
};

const _lfMerchantLogin = merchantLogin;
merchantLogin = async function () {
  const errEl = document.getElementById('mm-error');
  if (!errEl.dataset.defaultText) errEl.dataset.defaultText = errEl.textContent;
  errEl.textContent = errEl.dataset.defaultText;
  const errorsBefore = LF.errorCount;
  await _lfMerchantLogin();
  if (LF.errorCount > errorsBefore && LF.lastError && errEl.style.display === 'block') {
    errEl.textContent = LF.lastError; LF.lastError = null;
  }
  if (LF.mustChange && currentMerchant) lfOpenPasswordModal(true);
};

const _lfMerchantLogout = merchantLogout;
merchantLogout = async function () {
  await _lfMerchantLogout();
  lfClosePasswordModal();
  await loadAllData();           // reload so merchant-only data disappears from this browser
};

// Password modal — forced (temporary password) or voluntary.
function lfOpenPasswordModal(forced) {
  if (document.getElementById('lf-pw-modal')) return;
  const wrap = document.createElement('div');
  wrap.id = 'lf-pw-modal';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-labelledby', 'lf-pw-title');
  wrap.style.cssText = 'position:fixed;inset:0;background:rgba(12,11,9,.72);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem';
  wrap.innerHTML = `
    <div style="background:#fff;border-radius:var(--r2,14px);padding:1.8rem;max-width:440px;width:100%;box-shadow:var(--shadow,0 10px 40px rgba(0,0,0,.25))">
      <div id="lf-pw-title" style="font-family:'Bebas Neue',sans-serif;font-size:1.7rem;letter-spacing:.02em;margin-bottom:.4rem">${forced ? 'Set your new password' : 'Change password'}</div>
      <p style="font-size:.875rem;color:var(--g4,#6b6860);line-height:1.6;margin-bottom:1rem">${forced
        ? 'You logged in with a temporary password. Choose your own password to continue.'
        : 'Use at least 10 characters with letters and numbers.'}</p>
      <label class="pay-label" for="lf-pw-cur">${forced ? 'Temporary password' : 'Current password'} *</label>
      <input id="lf-pw-cur" class="pay-input" type="password" autocomplete="current-password">
      <label class="pay-label" for="lf-pw-new">New password *</label>
      <input id="lf-pw-new" class="pay-input" type="password" autocomplete="new-password" placeholder="Min. 10 characters, letters + numbers">
      <label class="pay-label" for="lf-pw-conf">Repeat new password *</label>
      <input id="lf-pw-conf" class="pay-input" type="password" autocomplete="new-password">
      <div id="lf-pw-err" role="alert" style="display:none;background:#fee2e2;border:1px solid var(--red,#b91c1c);border-radius:var(--r,8px);padding:.65rem 1rem;font-size:.855rem;color:var(--red,#b91c1c);margin-bottom:.9rem"></div>
      <div style="display:flex;gap:.6rem;margin-top:.4rem">
        <button class="edit-cancel-btn" style="flex:1" id="lf-pw-cancel">${forced ? 'Log out' : 'Cancel'}</button>
        <button class="edit-save-btn" style="flex:2" id="lf-pw-save">Save password</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  document.getElementById('lf-pw-cancel').onclick = () => { if (forced) merchantLogout(); else lfClosePasswordModal(); };
  document.getElementById('lf-pw-save').onclick = lfSubmitPasswordModal;
  document.getElementById('lf-pw-conf').onkeydown = e => { if (e.key === 'Enter') lfSubmitPasswordModal(); };
  setTimeout(() => document.getElementById('lf-pw-cur')?.focus(), 50);
}
function lfClosePasswordModal() { document.getElementById('lf-pw-modal')?.remove(); }
async function lfSubmitPasswordModal() {
  const cur = document.getElementById('lf-pw-cur').value;
  const nw = document.getElementById('lf-pw-new').value;
  const conf = document.getElementById('lf-pw-conf').value;
  const err = document.getElementById('lf-pw-err');
  const show = m => { err.textContent = m; err.style.display = 'block'; };
  if (!cur) return show('Enter your current password.');
  const problem = lfPasswordProblem(nw); if (problem) return show(problem);
  if (nw !== conf) return show('The new passwords do not match.');
  try {
    await api('auth', { method: 'POST', action: 'change_password', body: { currentPassword: cur, newPassword: nw } });
    LF.mustChange = false;
    lfClosePasswordModal();
    toast('Password updated!', 'success');
    await loadAllData();
  } catch (e) { show(e.message || 'Could not update password.'); LF.lastError = null; }
}
function openChangePassword() { if (currentMerchant) lfOpenPasswordModal(false); }

// Security tab form (merchants AND admin)
async function saveMerchantPassword() {
  if (!currentMerchant) return;
  const cur = document.getElementById('sec-cur').value;
  const nw = document.getElementById('sec-new').value;
  const conf = document.getElementById('sec-confirm').value;
  const errEl = document.getElementById('sec-error');
  const show = m => { errEl.textContent = m; errEl.style.display = 'block'; };
  if (!cur) return show('Enter your current password.');
  const problem = lfPasswordProblem(nw); if (problem) return show(problem);
  if (nw !== conf) return show('Passwords do not match.');
  try {
    await api('auth', { method: 'POST', action: 'change_password', body: { currentPassword: cur, newPassword: nw } });
    errEl.style.display = 'none';
    ['sec-cur', 'sec-new', 'sec-confirm'].forEach(id => document.getElementById(id).value = '');
    toast('Password updated successfully!', 'success');
  } catch (e) { show(e.message || 'Could not update password.'); LF.lastError = null; }
}

// Admin adds a merchant — a strong password is REQUIRED (no default)
async function adminAddBrand() {
  const id = document.getElementById('nb-id').value.trim().toLowerCase().replace(/\s+/g, '');
  const name = document.getElementById('nb-name').value.trim();
  const tag = document.getElementById('nb-tag').value;
  const loc = document.getElementById('nb-loc').value.trim();
  const year = document.getElementById('nb-year').value.trim();
  const ig = document.getElementById('nb-ig').value.trim();
  const desc = document.getElementById('nb-desc').value.trim();
  const pass = document.getElementById('nb-pass').value;
  if (!id || !name) { toast('Brand ID and Name are required', 'error'); return; }
  if (!/^[a-z0-9][a-z0-9_-]{1,49}$/.test(id)) { toast('Brand ID: 2–50 lowercase letters, numbers, - or _', 'error'); return; }
  if (BRANDS.find(b => b.id === id)) { toast('Brand ID already exists! Use a different ID.', 'error'); return; }
  const problem = lfPasswordProblem(pass); if (problem) { toast(problem, 'error'); return; }
  try {
    await api('brands', { method: 'POST', body: { id, name, tag, desc, location: loc, year, instagram: ig, password: pass } });
    toast('Brand "' + name + '" added! Give the merchant their password privately — they must change it on first login.', 'success');
    ['nb-id', 'nb-name', 'nb-loc', 'nb-year', 'nb-ig', 'nb-desc', 'nb-pass'].forEach(x => document.getElementById(x).value = '');
    await loadAllData();
    renderAdminBrandsList();
  } catch (e) { toast('Could not add brand', 'error'); }
}

// Brand edit — same as Sync.js plus the schedule field
async function saveBrand() {
  const v = id => (document.getElementById(id)?.value || '').trim();
  try {
    await api('brands', { method: 'PUT', id: currentMerchant.id, body: {
      name: v('bm-name'), tag: v('bm-tag'), desc: v('bm-desc'), location: v('bm-loc'), year: v('bm-year'),
      instagram: v('bm-ig'), img: v('bm-img'), ...(document.getElementById('bm-sched') ? { schedule: v('bm-sched') } : {}) } });
    await loadAllData();
    currentMerchant = getBrand(currentMerchant.id); saveSession();
    toast('Brand updated!', 'success');
    closeBrandModal();
    renderMerchantDash();
  } catch (e) { toast('Could not update brand', 'error'); }
}

/* ---------- 5. products: "New" flag in the product form ---------- */
function lfEnsureNewFlagField() {
  if (document.getElementById('pm-new')) return;
  const stock = document.getElementById('pm-stock');
  if (!stock) return;
  const row = document.createElement('label');
  row.htmlFor = 'pm-new';
  row.style.cssText = 'display:flex;align-items:center;gap:.5rem;font-size:.855rem;font-weight:600;margin:.6rem 0;cursor:pointer';
  row.innerHTML = '<input type="checkbox" id="pm-new" style="width:auto;margin:0"> Show "New" badge on this product';
  (stock.closest('.edit-row-2') || stock.closest('.edit-row') || stock.parentElement).insertAdjacentElement('afterend', row);
}
const _lfOpenProductModal = openProductModal;
openProductModal = function (id) {
  const r = _lfOpenProductModal.apply(this, arguments);
  lfEnsureNewFlagField();
  const cb = document.getElementById('pm-new');
  if (cb) { const p = id ? getProduct(id) : null; cb.checked = p ? !!p.new : true; }
  return r;
};

async function saveProduct() {
  const idVal = document.getElementById('pm-id').value;
  const id = idVal ? parseInt(idVal) : null;
  const name = document.getElementById('pm-name').value.trim();
  const priceRaw = document.getElementById('pm-price').value.trim();
  const originalPriceRaw = document.getElementById('pm-original-price').value.trim();
  const tag = document.getElementById('pm-tag').value.trim();
  const size = document.getElementById('pm-size').value.trim();
  const stock = parseInt(document.getElementById('pm-stock').value) || 0;
  const isNew = document.getElementById('pm-new') ? document.getElementById('pm-new').checked : true;
  const urlInput = document.getElementById('pm-img').value.trim();
  if (urlInput && !pmImgs.includes(urlInput)) {
    if (!/^https:\/\//i.test(urlInput)) { toast('Image links must start with https://', 'error'); return; }
    pmImgs.push(urlInput);
  }
  const imgs = pmImgs.slice(0, 5);
  const img = imgs[0] || '';
  if (!name || !priceRaw || !tag || !size) { toast('Fill all required fields (*)', 'error'); return; }
  if (isNaN(Number(priceRaw)) || Number(priceRaw) < 0) { toast('Price must be a number', 'error'); return; }
  if (stock < 0) { toast('Stock cannot be negative', 'error'); return; }
  const body = { name, price: priceRaw, originalPrice: originalPriceRaw, tag, size, img, imgs, stock, new: isNew };
  try {
    if (id) { await api('products', { method: 'PUT', id, body }); toast('Product updated!', 'success'); }
    else { await api('products', { method: 'POST', body: { ...body, brand: currentMerchant.id } }); toast('Product added!', 'success'); }
    await loadAllData();
    closeProductModal();
    renderMerchantDash();
  } catch (e) { toast('Could not save product', 'error'); }
}

// count a product view in the database (server counts once per visitor)
const _lfOpenProductDetail = openProductDetail;
openProductDetail = function (id) {
  const r = _lfOpenProductDetail.apply(this, arguments);
  try {
    const seen = JSON.parse(sessionStorage.getItem('lf_viewed') || '[]');
    if (!seen.includes(Number(id))) {
      seen.push(Number(id)); sessionStorage.setItem('lf_viewed', JSON.stringify(seen.slice(-200)));
      api('products', { method: 'POST', id: Number(id), action: 'view' }).catch(() => { LF.lastError = null; });
    }
  } catch (e) { }
  return r;
};

/* ---------- 6. reviews: only the author (or admin) sees Edit/Delete ---------- */
const _lfMakeReviewCard = makeReviewCard;
makeReviewCard = function (rv) {
  const html = _lfMakeReviewCard.apply(this, arguments);
  if (rv && (rv.mine || lfIsAdmin())) return html;
  return html.replace(/<div class="review-actions">[\s\S]*?<\/div>/, '');
};

/* ---------- 7. events: approval workflow ---------- */
function lfEventStatus(ev) { return LF.eventStatus[ev.id] || 'approved'; }
function lfOnlyApprovedEvents(fn) {
  return function () {
    const all = events;
    events = all.filter(e => lfEventStatus(e) === 'approved');
    try { return fn.apply(this, arguments); } finally { events = all; }
  };
}
renderEventsPage = lfOnlyApprovedEvents(renderEventsPage);
renderBrandEvents = lfOnlyApprovedEvents(renderBrandEvents);

const _lfRenderMerchEventsPanel = renderMerchEventsPanel;
renderMerchEventsPanel = function () {
  const r = _lfRenderMerchEventsPanel.apply(this, arguments);
  const el = document.getElementById('merch-events-list');
  if (!el) return r;
  events.forEach(ev => {
    const st = lfEventStatus(ev);
    if (st === 'approved') return;
    const btn = el.querySelector(`button[onclick="deleteEvent('${CSS.escape(ev.id)}')"]`);
    if (!btn) return;
    const badge = document.createElement('span');
    badge.style.cssText = 'font-size:.72rem;font-weight:700;padding:.2rem .65rem;border-radius:20px;text-transform:uppercase;letter-spacing:.05em;margin-right:.5rem;'
      + (st === 'pending' ? 'background:#fef3c7;color:#92400e' : 'background:#fee2e2;color:#991b1b');
    badge.textContent = st === 'pending' ? 'Waiting for admin approval' : 'Not approved';
    btn.parentElement.insertBefore(badge, btn);
  });
  return r;
};

const _lfSaveEvent = saveEvent;
saveEvent = async function () {
  const before = LF.errorCount;
  await _lfSaveEvent();
  if (LF.errorCount === before && currentMerchant && !lfIsAdmin()) {
    toast('Event submitted — it goes live after the admin approves it.', 'success');
  }
};

async function approveEvent(evId) {
  try { await api('events', { method: 'PUT', id: evId, action: 'approve' }); await loadAllData(); toast('Event approved and live', 'success'); renderImageApprovals(); }
  catch (e) { toast('Could not approve event', 'error'); }
}
async function rejectEvent(evId) {
  try { await api('events', { method: 'PUT', id: evId, action: 'reject' }); await loadAllData(); toast('Event rejected', 'error'); renderImageApprovals(); }
  catch (e) { toast('Could not reject event', 'error'); }
}

// the Approvals tab also lists events waiting for approval
const _lfRenderImageApprovals = renderImageApprovals;
renderImageApprovals = function () {
  const r = _lfRenderImageApprovals.apply(this, arguments);
  const el = document.getElementById('admin-img-approvals-list');
  if (!el || !lfIsAdmin()) return r;
  const pending = events.filter(e => lfEventStatus(e) === 'pending');
  const box = document.createElement('div');
  box.innerHTML = `<div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;margin:1.6rem 0 .9rem;letter-spacing:.02em">Events waiting for approval</div>`
    + (pending.length ? pending.map(ev => `
      <div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.1rem;margin-bottom:.9rem;display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap;box-shadow:var(--shadow)">
        ${ev.img ? `<img src="${lfEsc(ev.img)}" alt="" style="width:110px;height:75px;object-fit:cover;border-radius:10px;flex-shrink:0">` : ''}
        <div style="flex:1;min-width:150px">
          <div style="font-weight:700;font-size:.9rem;margin-bottom:.25rem">${lfEsc(ev.title)}</div>
          <div style="font-size:.78rem;color:var(--g4)">From: <strong>${lfEsc(getBrandName(ev.brandId))}</strong> · ${lfEsc(ev.date)} ${ev.time ? '· ' + lfEsc(ev.time) : ''}</div>
          <div style="font-size:.78rem;color:var(--g4);margin-top:.15rem">${lfEsc(ev.location)}</div>
          ${ev.desc ? `<div style="font-size:.82rem;color:var(--g5);margin-top:.4rem;line-height:1.5">${lfEsc(ev.desc)}</div>` : ''}
          <div style="display:flex;gap:.5rem;margin-top:.75rem">
            <button class="tbl-action" style="background:#dcf5eb;border-color:#076a35;color:#076a35" onclick="approveEvent('${lfEsc(ev.id)}')">${ICONS.check} Approve</button>
            <button class="tbl-action danger" onclick="rejectEvent('${lfEsc(ev.id)}')">${ICONS.x} Reject</button>
          </div>
        </div>
      </div>`).join('')
      : '<div style="color:var(--g4);font-size:.875rem;padding:.5rem 0 1rem">No events waiting for approval.</div>');
  el.appendChild(box);
  return r;
};

// keep the "interested" flag the renderers read in sync with the database
const _lfToggleInterestFor = toggleInterestFor;
toggleInterestFor = async function (evId) {
  const on = await _lfToggleInterestFor(evId);
  if (on !== null && on !== undefined) { try { localStorage.setItem('ev_int_' + evId, on ? '1' : '0'); } catch (e) { } }
  return on;
};

/* ---------- 8. feedback list (admin) comes from the database ---------- */
const _lfRenderFeedbackPanel = renderFeedbackPanel;
renderFeedbackPanel = function () {
  const r = _lfRenderFeedbackPanel.apply(this, arguments);
  const el = document.getElementById('feedback-list');
  if (!el) return r;
  if (!lfIsAdmin()) {
    el.innerHTML = '<div style="color:var(--g4);font-size:.875rem;padding:1rem">Customer feedback is visible to the admin only.</div>';
    return r;
  }
  el.innerHTML = '<div style="color:var(--g4);font-size:.875rem;padding:1rem">Loading feedback…</div>';
  api('feedback').then(list => {
    if (!list || !list.length) { el.innerHTML = '<div style="color:var(--g4);font-size:.875rem;padding:1rem">No feedback yet.</div>'; return; }
    const colors = { complaint: ['#fee2e2', '#991b1b'], compliment: ['#dcf5eb', '#076a35'], suggestion: ['#fef3c7', '#92400e'] };
    el.innerHTML = list.map(f => {
      const [bg, fg] = colors[f.type] || ['var(--g2)', 'var(--g5)'];
      return `<div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.2rem;margin-bottom:.9rem;box-shadow:var(--shadow)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;flex-wrap:wrap;gap:.4rem">
          <div style="font-size:.95rem;font-weight:700">${lfEsc(f.name)}</div>
          <div style="font-size:.75rem;color:var(--g4)">${lfEsc(f.time)}</div>
        </div>
        <div style="margin-bottom:.5rem"><span style="font-size:.72rem;font-weight:700;padding:.2rem .65rem;border-radius:20px;background:${bg};color:${fg};text-transform:uppercase;letter-spacing:.06em">${lfEsc(f.type)}</span></div>
        <div style="font-size:.875rem;color:var(--g5);line-height:1.6;white-space:pre-line">${lfEsc(f.msg)}</div>
      </div>`;
    }).join('');
  }).catch(() => { el.innerHTML = '<div style="color:var(--red);font-size:.875rem;padding:1rem">Could not load feedback.</div>'; LF.lastError = null; });
  return r;
};

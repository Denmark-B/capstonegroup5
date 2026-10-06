/* ============================================================
   PasswordReset.js — "Forgot password?" button on the login box.

   LOAD ORDER (last):
     <script src="lostandfound.js"></script>
     <script src="backend/Sync.js"></script>
     <script src="backend/SyncSecure.js"></script>
     <script src="backend/AccountSecurity.js"></script>
     <script src="backend/PasswordReset.js"></script>

   Merchant: Forgot password? → request form → saved in the database,
             admin is notified.
   Admin:    Security tab → "Password reset requests" → Reset →
             temporary password shown once → give it to the merchant
             privately → merchant must choose a new one at next login.
   Admin's own password: the website cannot reset it (by design);
             the button shows the safe recovery steps instead.
   ============================================================ */

const LF_RESET_URL = LF.apiUrl.replace(/Api\.php(\?.*)?$/, 'PasswordReset.php');

async function lfResetApi(action, { method = 'GET', body = null } = {}, _retried = false) {
  const opts = { method, credentials: 'include', headers: { 'Accept': 'application/json' } };
  if (method !== 'GET') {
    if (!LF.csrf) { try { await lfFetchCsrf(); } catch (e) { } }
    opts.headers['X-CSRF-Token'] = LF.csrf || '';
  }
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  let res;
  try { res = await fetch(`${LF_RESET_URL}?action=${encodeURIComponent(action)}`, opts); }
  catch (e) { throw new Error('Cannot reach the server. Check that Apache and MySQL are running.'); }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { }
  if (!res.ok) {
    if (res.status === 403 && data && data.code === 'csrf' && !_retried) { LF.csrf = null; return lfResetApi(action, { method, body }, true); }
    throw new Error((data && data.error) || 'Request failed (' + res.status + ').');
  }
  return data;
}

/* ---------- shared pop-up shell (same look as the password pop-up) ---------- */
function lfResetModal(id, title, innerHtml) {
  document.getElementById(id)?.remove();
  const wrap = document.createElement('div');
  wrap.id = id;
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-labelledby', id + '-title');
  wrap.style.cssText = 'position:fixed;inset:0;background:rgba(12,11,9,.72);z-index:100000;display:flex;align-items:center;justify-content:center;padding:1rem;overflow-y:auto';
  wrap.innerHTML = `
    <div style="background:#fff;border-radius:var(--r2,14px);padding:1.8rem;max-width:460px;width:100%;box-shadow:var(--shadow,0 10px 40px rgba(0,0,0,.25));margin:auto">
      <div id="${id}-title" style="font-family:'Bebas Neue',sans-serif;font-size:1.7rem;letter-spacing:.02em;margin-bottom:.4rem">${title}</div>
      ${innerHtml}
    </div>`;
  wrap.addEventListener('click', e => { if (e.target === wrap) wrap.remove(); });
  wrap.addEventListener('keydown', e => { if (e.key === 'Escape') wrap.remove(); });
  document.body.appendChild(wrap);
  return wrap;
}
const LF_ERR_BOX = 'display:none;background:#fee2e2;border:1px solid var(--red,#b91c1c);border-radius:var(--r,8px);padding:.65rem 1rem;font-size:.855rem;color:var(--red,#b91c1c);margin-bottom:.9rem';
const LF_OK_BOX = 'background:#dcf5eb;border:1px solid #076a35;border-radius:var(--r,8px);padding:.8rem 1rem;font-size:.875rem;color:#076a35;line-height:1.6';

/* ---------- 1. the "Forgot password?" button ---------- */
function lfAddForgotButton() {
  if (document.getElementById('lf-forgot-btn')) return;
  const login = document.querySelector('#merchant-modal .mm-submit');
  if (!login) return;
  const btn = document.createElement('button');
  btn.id = 'lf-forgot-btn';
  btn.type = 'button';
  btn.className = 'mm-cancel';                      // same text-button style as your Cancel
  btn.style.cssText = 'margin-top:.35rem;color:var(--accent-ink,var(--g5));font-weight:600;text-decoration:underline;text-underline-offset:3px';
  btn.textContent = 'Forgot password?';
  btn.onclick = () => (typeof currentLoginRole !== 'undefined' && currentLoginRole === 'admin') ? lfOpenAdminRecoveryInfo() : lfOpenForgotForm();
  login.insertAdjacentElement('afterend', btn);
}

/* ---------- 2. merchant request form ---------- */
function lfOpenForgotForm() {
  const selected = document.getElementById('mm-brand-select')?.value || '';
  const options = BRANDS.filter(b => b.id !== 'lostandfound')
    .map(b => `<option value="${lfEsc(b.id)}"${b.id === selected ? ' selected' : ''}>${lfEsc(b.name)}</option>`).join('');
  lfResetModal('lf-forgot-modal', 'Forgot password?', `
    <p style="font-size:.875rem;color:var(--g4,#6b6860);line-height:1.6;margin-bottom:1rem">
      Send a reset request to the Lost &amp; Found admin. They will check that it's really you and give you a
      <strong>temporary password</strong>. You'll choose a new password when you log in with it.</p>
    <div id="lf-forgot-body">
      <label class="pay-label" for="lf-fg-brand">Your brand *</label>
      <select id="lf-fg-brand" class="pay-input">${options}</select>
      <label class="pay-label" for="lf-fg-name">Your name *</label>
      <input id="lf-fg-name" class="pay-input" maxlength="150" autocomplete="name">
      <label class="pay-label" for="lf-fg-contact">Phone number or e-mail *</label>
      <input id="lf-fg-contact" class="pay-input" maxlength="150" placeholder="So the admin can contact you">
      <label class="pay-label" for="lf-fg-msg">Message (optional)</label>
      <textarea id="lf-fg-msg" class="pay-input" maxlength="1000" style="min-height:70px;resize:vertical" placeholder="e.g. I'm the owner of the brand, I forgot my password"></textarea>
      <div id="lf-fg-err" role="alert" style="${LF_ERR_BOX}"></div>
      <div style="display:flex;gap:.6rem;margin-top:.4rem">
        <button type="button" class="edit-cancel-btn" style="flex:1" onclick="document.getElementById('lf-forgot-modal').remove()">Cancel</button>
        <button type="button" class="edit-save-btn" style="flex:2" id="lf-fg-send">Send request</button>
      </div>
    </div>`);
  document.getElementById('lf-fg-send').onclick = lfSendForgotRequest;
  setTimeout(() => document.getElementById('lf-fg-name')?.focus(), 50);
}

async function lfSendForgotRequest() {
  const err = document.getElementById('lf-fg-err');
  const btn = document.getElementById('lf-fg-send');
  const show = m => { err.textContent = m; err.style.display = 'block'; };
  const brandId = document.getElementById('lf-fg-brand').value;
  const name = document.getElementById('lf-fg-name').value.trim();
  const contact = document.getElementById('lf-fg-contact').value.trim();
  const message = document.getElementById('lf-fg-msg').value.trim();
  err.style.display = 'none';
  if (!brandId) return show('Please choose your brand.');
  if (!name) return show('Please enter your name.');
  if (!contact) return show('Please enter a phone number or e-mail.');
  btn.disabled = true; btn.textContent = 'Sending…';
  try {
    const r = await lfResetApi('request', { method: 'POST', body: { brandId, name, contact, message } });
    document.getElementById('lf-forgot-body').innerHTML = `
      <div style="${LF_OK_BOX}">${lfEsc(r.message)}</div>
      <button type="button" class="edit-save-btn" style="width:100%;margin-top:1rem" onclick="document.getElementById('lf-forgot-modal').remove()">OK</button>`;
  } catch (e) { show(e.message); btn.disabled = false; btn.textContent = 'Send request'; }
}

/* ---------- 3. admin forgot their own password ---------- */
function lfOpenAdminRecoveryInfo() {
  lfResetModal('lf-forgot-modal', 'Admin password recovery', `
    <p style="font-size:.875rem;color:var(--g5,#3d3b36);line-height:1.65;margin-bottom:.8rem">
      For security, the <strong>admin</strong> password cannot be reset from the website.
      Only the person who manages the server can do it:</p>
    <ol style="font-size:.85rem;color:var(--g5,#3d3b36);line-height:1.7;padding-left:1.2rem;margin-bottom:1rem">
      <li>Open <strong>phpMyAdmin</strong> → database <code>lostfound</code> → <strong>SQL</strong>, run:<br>
        <code style="background:var(--g1,#f1efe9);padding:2px 6px;border-radius:5px;font-size:.8rem;word-break:break-all">DELETE FROM site_settings WHERE setting_key='admin_password';</code></li>
      <li>Put <code>setup.php</code> back into the <code>backend</code> folder and open it in the browser.</li>
      <li>Create a new admin password, then delete <code>setup.php</code> again.</li>
    </ol>
    <p style="font-size:.8rem;color:var(--g4,#6b6860);line-height:1.6;margin-bottom:1rem">Merchant passwords that were already changed are not affected.</p>
    <button type="button" class="edit-save-btn" style="width:100%" onclick="document.getElementById('lf-forgot-modal').remove()">OK</button>`);
}

/* ---------- 4. admin: reset requests panel in the Security tab ---------- */
function lfFormatDate2(ts) {
  if (!ts) return '—';
  const d = new Date(String(ts).replace(' ', 'T'));
  return isNaN(d) ? lfEsc(ts) : d.toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

async function lfRenderResetRequests() {
  const panel = document.getElementById('merch-panel-security');
  let box = document.getElementById('lf-reset-requests');
  if (!lfIsAdmin()) { box?.remove(); return; }
  if (!panel) return;
  if (!box) {
    box = document.createElement('div');
    box.id = 'lf-reset-requests';
    box.style.cssText = 'background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.7rem;max-width:720px;box-shadow:var(--shadow);margin-top:1.3rem';
    const history = document.getElementById('lf-pw-history');
    history ? panel.insertBefore(box, history) : panel.appendChild(box);
  }
  const head = `<div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.02em;margin-bottom:.3rem">Password reset requests</div>`;
  box.innerHTML = head + '<div style="font-size:.82rem;color:var(--g4)">Loading…</div>';
  let rows;
  try { rows = await lfResetApi('list'); }
  catch (e) { box.innerHTML = head + `<div style="color:var(--red);font-size:.875rem">${lfEsc(e.message)}</div>`; return; }

  const pending = rows.filter(r => r.status === 'pending');
  const done = rows.filter(r => r.status !== 'pending').slice(0, 10);
  const badge = s => {
    const c = { completed: ['#dcf5eb', '#076a35', 'Reset done'], rejected: ['#fee2e2', '#991b1b', 'Rejected'] }[s] || ['var(--g2)', 'var(--g5)', s];
    return `<span style="font-size:.7rem;font-weight:700;padding:.15rem .55rem;border-radius:20px;background:${c[0]};color:${c[1]};text-transform:uppercase">${lfEsc(c[2])}</span>`;
  };
  const merchantOptions = BRANDS.filter(b => b.id !== 'lostandfound').map(b => `<option value="${lfEsc(b.id)}">${lfEsc(b.name)}</option>`).join('');

  box.innerHTML = head + `
    <p style="font-size:.85rem;color:var(--g4);line-height:1.6;margin-bottom:1rem">Check that the request is really from the merchant (call or message them) before resetting.
      Reset creates a temporary password that is shown <strong>once</strong>. Give it to the merchant privately — they must choose a new one at their next login.</p>
    ${pending.length ? pending.map(r => `
      <div style="border:1px solid var(--g2);border-radius:var(--r2);padding:1rem;margin-bottom:.8rem;background:var(--g1)">
        <div style="display:flex;justify-content:space-between;gap:.5rem;flex-wrap:wrap;align-items:flex-start">
          <div>
            <div style="font-weight:700;font-size:.92rem">${lfEsc(r.brandName)} <span style="font-weight:400;color:var(--g4)">(${lfEsc(r.brandId)})</span></div>
            <div style="font-size:.8rem;color:var(--g4);margin-top:.15rem">${lfEsc(r.name)} · ${lfEsc(r.contact)} · ${lfFormatDate2(r.requestedAt)}</div>
            ${r.message ? `<div style="font-size:.84rem;color:var(--g5);margin-top:.4rem;white-space:pre-line">${lfEsc(r.message)}</div>` : ''}
          </div>
          <div style="display:flex;gap:.5rem">
            <button class="tbl-action" style="background:#dcf5eb;border-color:#076a35;color:#076a35" onclick="lfAdminReset(${r.id}, null)">Reset password</button>
            <button class="tbl-action danger" onclick="lfAdminReject(${r.id})">Reject</button>
          </div>
        </div>
      </div>`).join('') : '<div style="font-size:.875rem;color:var(--g4);padding:.3rem 0 .8rem">No pending requests.</div>'}
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;margin-top:.6rem;padding-top:1rem;border-top:1px solid var(--g2)">
      <span style="font-size:.84rem;font-weight:600">Reset any merchant:</span>
      <select id="lf-reset-any" class="pay-input" style="flex:1;min-width:160px;margin:0">${merchantOptions}</select>
      <button class="tbl-action" onclick="lfAdminReset(null, document.getElementById('lf-reset-any').value)">Reset password</button>
    </div>
    ${done.length ? `<div style="margin-top:1.2rem;font-size:.72rem;font-weight:700;color:var(--g4);text-transform:uppercase;letter-spacing:.06em">Recent</div>
      ${done.map(r => `<div style="display:flex;justify-content:space-between;gap:.5rem;flex-wrap:wrap;font-size:.82rem;padding:.45rem 0;border-bottom:1px solid var(--g1)">
        <span><strong>${lfEsc(r.brandName)}</strong> · ${lfEsc(r.name)} · ${lfFormatDate2(r.requestedAt)}</span>${badge(r.status)}</div>`).join('')}` : ''}`;
}

async function lfAdminReset(requestId, brandId) {
  const name = brandId ? (getBrandName(brandId) || brandId) : 'this merchant';
  if (!confirm('Reset the password for ' + name + '? Their current password will stop working immediately.')) return;
  try {
    const r = await lfResetApi('reset', { method: 'POST', body: requestId ? { requestId } : { brandId } });
    lfResetModal('lf-temp-modal', 'Temporary password', `
      <p style="font-size:.875rem;color:var(--g4,#6b6860);line-height:1.6;margin-bottom:.8rem">
        Give this to <strong>${lfEsc(r.brandName)}</strong> privately (call or message). It is shown <strong>only once</strong>.
        They must choose a new password when they log in with it.</p>
      <div style="display:flex;gap:.5rem;align-items:center;margin-bottom:1rem">
        <code id="lf-temp-pw" style="flex:1;font-size:1.25rem;letter-spacing:.08em;background:var(--g1,#f1efe9);padding:.7rem 1rem;border-radius:var(--r,8px);text-align:center;user-select:all">${lfEsc(r.tempPassword)}</code>
        <button type="button" class="tbl-action" id="lf-temp-copy">Copy</button>
      </div>
      <button type="button" class="edit-save-btn" style="width:100%" onclick="document.getElementById('lf-temp-modal').remove()">Done — I've saved it</button>`);
    document.getElementById('lf-temp-copy').onclick = async () => {
      try { await navigator.clipboard.writeText(r.tempPassword); toast('Copied!', 'success'); }
      catch (e) { toast('Select the password and copy it manually', 'error'); }
    };
    toast('Password reset for ' + r.brandName + ' — saved to the database', 'success');
    lfRenderResetRequests();
    if (typeof lfRenderPasswordHistory === 'function') lfRenderPasswordHistory();
  } catch (e) { toast(e.message, 'error'); }
}

async function lfAdminReject(requestId) {
  if (!confirm('Reject this reset request?')) return;
  try { await lfResetApi('reject', { method: 'POST', body: { requestId } }); toast('Request rejected'); lfRenderResetRequests(); }
  catch (e) { toast(e.message, 'error'); }
}

// show the panel whenever the admin opens the Security tab
const _lfShowMerchTabReset = showMerchTab;
showMerchTab = function (tab) {
  const r = _lfShowMerchTabReset.apply(this, arguments);
  if (tab === 'security') lfRenderResetRequests();
  return r;
};

document.addEventListener('DOMContentLoaded', lfAddForgotButton);
if (document.readyState !== 'loading') lfAddForgotButton();

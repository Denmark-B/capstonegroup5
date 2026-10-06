/* ============================================================
   EmailFeature.js — verified recovery e-mails + reset links.

   LOAD ORDER (last):
     ... backend/PasswordReset.js, backend/ShippingJNT.js,
         backend/EmailFeature.js

   • "Forgot password?" now e-mails a reset link to the account's
     VERIFIED recovery e-mail, then shows:
       "A password reset link has been sent to your trusted email…"
   • Every admin and merchant account must add and verify a
     recovery e-mail (pop-up after login + Security tab box).
   • Admin: e-mail status of every merchant, can set a merchant's
     e-mail (the merchant still has to verify it), and the Add Brand
     form now requires the merchant's e-mail.
   • Merchants without a verified e-mail can still ask the admin
     (the earlier admin-approved reset stays as a fallback).
   ============================================================ */

const LF_EMAIL_URL = LF.apiUrl.replace(/Api\.php(\?.*)?$/, 'Email.php');
let LF_EMAIL_STATUS = null;

async function lfEmailApi(action, { method = 'GET', body = null } = {}, _retried = false) {
  const opts = { method, credentials: 'include', headers: { 'Accept': 'application/json' } };
  if (method !== 'GET') {
    if (!LF.csrf) { try { await lfFetchCsrf(); } catch (e) { } }
    opts.headers['X-CSRF-Token'] = LF.csrf || '';
  }
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  let res;
  try { res = await fetch(`${LF_EMAIL_URL}?action=${encodeURIComponent(action)}`, opts); }
  catch (e) { throw new Error('Cannot reach the server. Check that Apache and MySQL are running.'); }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { }
  if (!res.ok) {
    if (res.status === 403 && data && data.code === 'csrf' && !_retried) { LF.csrf = null; return lfEmailApi(action, { method, body }, true); }
    const err = new Error((data && data.error) || 'Request failed (' + res.status + ').'); err.status = res.status; throw err;
  }
  return data;
}
const LF_DEV_NOTE = '<div style="margin-top:.8rem;background:#fef3c7;border:1px solid #d97706;border-radius:8px;padding:.6rem .8rem;font-size:.8rem;color:#92400e;line-height:1.5">'
  + '<b>Test mode:</b> email sending isn\'t set up yet, so the email was saved in <code>backend/mail_outbox/</code> on this PC. Open the newest .html file there and click its button. '
  + 'Set up Gmail in <code>backend/config.local.php</code> to send real emails.</div>';

/* ---------- 1. Forgot password → email link ---------- */
const _lfLegacyForgotForm = lfOpenForgotForm;          // admin-approved request (fallback)

lfOpenForgotForm = function () {
  const selected = document.getElementById('mm-brand-select')?.value || '';
  const options = BRANDS.filter(b => b.id !== 'lostandfound')
    .map(b => `<option value="${lfEsc(b.id)}"${b.id === selected ? ' selected' : ''}>${lfEsc(b.name)}</option>`).join('');
  lfResetModal('lf-forgot-modal', 'Forgot password?', `
    <div id="lf-forgot-body">
      <p style="font-size:.875rem;color:var(--g4,#6b6860);line-height:1.6;margin-bottom:1rem">
        We'll email a password reset link to the <strong>verified recovery email</strong> linked to your merchant account.</p>
      <label class="pay-label" for="lf-fg-brand">Your brand *</label>
      <select id="lf-fg-brand" class="pay-input">${options}</select>
      <div id="lf-fg-err" role="alert" style="${LF_ERR_BOX}"></div>
      <div style="display:flex;gap:.6rem;margin-top:.4rem">
        <button type="button" class="edit-cancel-btn" style="flex:1" onclick="document.getElementById('lf-forgot-modal').remove()">Cancel</button>
        <button type="button" class="edit-save-btn" style="flex:2" id="lf-fg-send">Send reset link</button>
      </div>
    </div>`);
  document.getElementById('lf-fg-send').onclick = () => lfSendResetLink('merchant');
};

lfOpenAdminRecoveryInfo = function () {
  lfResetModal('lf-forgot-modal', 'Forgot admin password?', `
    <div id="lf-forgot-body">
      <p style="font-size:.875rem;color:var(--g4,#6b6860);line-height:1.6;margin-bottom:1rem">
        Enter the admin username. A password reset link will be emailed to the <strong>verified recovery email</strong> linked to the admin account.</p>
      <label class="pay-label" for="lf-fg-user">Admin username *</label>
      <input id="lf-fg-user" class="pay-input" maxlength="100" autocomplete="username" value="${lfEsc(document.getElementById('mm-admin-user')?.value || '')}">
      <div id="lf-fg-err" role="alert" style="${LF_ERR_BOX}"></div>
      <div style="display:flex;gap:.6rem;margin-top:.4rem">
        <button type="button" class="edit-cancel-btn" style="flex:1" onclick="document.getElementById('lf-forgot-modal').remove()">Cancel</button>
        <button type="button" class="edit-save-btn" style="flex:2" id="lf-fg-send">Send reset link</button>
      </div>
      <p style="font-size:.76rem;color:var(--g4,#6b6860);line-height:1.55;margin-top:1rem">No verified email on the admin account? Recovery then needs phpMyAdmin + setup.php (see the project guide).</p>
    </div>`);
  document.getElementById('lf-fg-send').onclick = () => lfSendResetLink('admin');
  setTimeout(() => document.getElementById('lf-fg-user')?.focus(), 50);
};

async function lfSendResetLink(type) {
  const err = document.getElementById('lf-fg-err');
  const btn = document.getElementById('lf-fg-send');
  const show = m => { err.textContent = m; err.style.display = 'block'; };
  err.style.display = 'none';
  const body = type === 'admin'
    ? { accountType: 'admin', username: document.getElementById('lf-fg-user').value.trim() }
    : { accountType: 'merchant', brandId: document.getElementById('lf-fg-brand').value };
  if (type === 'admin' && !body.username) return show('Please enter the admin username.');
  if (type === 'merchant' && !body.brandId) return show('Please choose your brand.');
  btn.disabled = true; btn.textContent = 'Sending…';
  try {
    const r = await lfEmailApi('forgot', { method: 'POST', body });
    const box = document.getElementById('lf-forgot-body');
    if (r.sent) {
      box.innerHTML = `
        <div style="text-align:center;font-size:2.4rem;line-height:1;margin:.2rem 0 .6rem" aria-hidden="true">✉️</div>
        <div style="${LF_OK_BOX}"><strong>Reset link sent!</strong><br>${lfEsc(r.message)}</div>
        <p style="font-size:.8rem;color:var(--g4,#6b6860);line-height:1.55;margin-top:.8rem">Open the email and click <b>Reset password</b>. Don't see it? Check your Spam or Promotions folder.</p>
        ${r.devOutbox ? LF_DEV_NOTE : ''}
        <button type="button" class="edit-save-btn" style="width:100%;margin-top:1rem" onclick="document.getElementById('lf-forgot-modal').remove()">OK</button>`;
    } else if (r.noVerifiedEmail) {
      box.innerHTML = `
        <div style="background:#fef3c7;border:1px solid #d97706;border-radius:8px;padding:.8rem 1rem;font-size:.875rem;color:#92400e;line-height:1.6">${lfEsc(r.message)}</div>
        <div style="display:flex;gap:.6rem;margin-top:1rem">
          <button type="button" class="edit-cancel-btn" style="flex:1" onclick="document.getElementById('lf-forgot-modal').remove()">Close</button>
          <button type="button" class="edit-save-btn" style="flex:2" id="lf-fg-ask-admin">Ask the admin instead</button>
        </div>`;
      document.getElementById('lf-fg-ask-admin').onclick = () => {
        const brand = body.brandId;
        document.getElementById('lf-forgot-modal').remove();
        const sel = document.getElementById('mm-brand-select'); if (sel) sel.value = brand;
        _lfLegacyForgotForm();
      };
    }
  } catch (e) { show(e.message); btn.disabled = false; btn.textContent = 'Send reset link'; }
}

/* ---------- 2. Required recovery email after login ---------- */
async function lfLoadEmailStatus() {
  if (!currentMerchant) { LF_EMAIL_STATUS = null; return null; }
  try { LF_EMAIL_STATUS = await lfEmailApi('status'); } catch (e) { LF_EMAIL_STATUS = null; }
  return LF_EMAIL_STATUS;
}

function lfEmailFormHtml(prefix) {
  return `
    <label class="pay-label" for="${prefix}-email">Recovery email *</label>
    <input id="${prefix}-email" class="pay-input" type="email" maxlength="190" autocomplete="email" placeholder="you@gmail.com">
    <label class="pay-label" for="${prefix}-pass">Current password *</label>
    <input id="${prefix}-pass" class="pay-input" type="password" autocomplete="current-password" placeholder="To confirm it's you">
    <div id="${prefix}-err" role="alert" style="${LF_ERR_BOX}"></div>`;
}

async function lfSubmitEmail(prefix, after) {
  const err = document.getElementById(prefix + '-err');
  const show = m => { err.textContent = m; err.style.display = 'block'; };
  err.style.display = 'none';
  const email = document.getElementById(prefix + '-email').value.trim();
  const currentPassword = document.getElementById(prefix + '-pass').value;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return show('Please enter a valid email address.');
  if (!currentPassword) return show('Enter your current password.');
  try {
    const r = await lfEmailApi('set_email', { method: 'POST', body: { email, currentPassword } });
    LF_EMAIL_STATUS = r;
    toast(r.alreadyVerified ? 'This email is already verified.' : 'Verification link sent to ' + email, 'success');
    after && after(r);
  } catch (e) { show(e.message); }
}

function lfOpenEmailRequiredModal() {
  if (!currentMerchant || document.getElementById('lf-email-modal') || document.getElementById('lf-pw-modal')) return;
  const st = LF_EMAIL_STATUS || {};
  const forced = !st.pendingEmail;                       // must at least submit an email
  const who = lfIsAdmin() ? 'admin account' : 'merchant account';
  const wrap = lfResetModal('lf-email-modal', st.pendingEmail ? 'Verify your recovery email' : 'Add a recovery email', `
    <p style="font-size:.875rem;color:var(--g4,#6b6860);line-height:1.6;margin-bottom:1rem">
      Every ${who} needs a <strong>verified email</strong>. If you forget your password, the reset link is sent there.</p>
    <div id="lf-em-body">
      ${st.pendingEmail ? `
        <div style="${LF_OK_BOX}">We sent a verification link to <strong>${lfEsc(st.pendingEmail)}</strong>. Open the email and click <b>Verify email</b>.</div>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem">
          <button type="button" class="edit-cancel-btn" style="flex:1" id="lf-em-resend">Resend link</button>
          <button type="button" class="edit-cancel-btn" style="flex:1" id="lf-em-change">Use another email</button>
          <button type="button" class="edit-save-btn" style="flex:1.4" id="lf-em-later">Continue for now</button>
        </div>`
      : `${lfEmailFormHtml('lf-em')}
        <div style="display:flex;gap:.6rem;margin-top:.4rem">
          <button type="button" class="edit-cancel-btn" style="flex:1" id="lf-em-logout">Log out</button>
          <button type="button" class="edit-save-btn" style="flex:2" id="lf-em-send">Send verification link</button>
        </div>`}
    </div>`);
  if (forced) {                                          // can't click outside / Escape to skip
    wrap.replaceWith(wrap.cloneNode(true));
  }
  const m = document.getElementById('lf-email-modal');
  const done = r => { m.remove(); lfRenderEmailBanner(); lfRenderEmailBox(); if (r && r.devOutbox) lfDevOutboxToast(); lfOpenEmailRequiredModal(); };
  document.getElementById('lf-em-send')?.addEventListener('click', () => lfSubmitEmail('lf-em', done));
  document.getElementById('lf-em-logout')?.addEventListener('click', () => { m.remove(); merchantLogout(); });
  document.getElementById('lf-em-later')?.addEventListener('click', () => { sessionStorage.setItem('lf_email_later_' + currentMerchant.id, '1'); m.remove(); lfRenderEmailBanner(); });
  document.getElementById('lf-em-change')?.addEventListener('click', () => {
    document.getElementById('lf-em-body').innerHTML = lfEmailFormHtml('lf-em') + `
      <button type="button" class="edit-save-btn" style="width:100%;margin-top:.4rem" id="lf-em-send2">Send verification link</button>`;
    document.getElementById('lf-em-send2').onclick = () => lfSubmitEmail('lf-em', done);
  });
  document.getElementById('lf-em-resend')?.addEventListener('click', async () => {
    try { const r = await lfEmailApi('resend', { method: 'POST' }); toast(r.message, 'success'); if (r.devOutbox) lfDevOutboxToast(); }
    catch (e) { toast(e.message, 'error'); }
  });
  setTimeout(() => document.getElementById('lf-em-email')?.focus(), 50);
}
function lfDevOutboxToast() { setTimeout(() => toast('Test mode: the email was saved in backend/mail_outbox on this PC', ''), 1800); }

async function lfCheckEmailRequirement() {
  if (!currentMerchant || LF.mustChange) return;
  const st = await lfLoadEmailStatus();
  lfRenderEmailBanner();
  if (!st || st.verified) return;
  if (st.pendingEmail && sessionStorage.getItem('lf_email_later_' + currentMerchant.id)) return;
  lfOpenEmailRequiredModal();
}

// dashboard banner while not verified
function lfRenderEmailBanner() {
  const hd = document.querySelector('#page-merchant .merch-page-hd');
  let b = document.getElementById('lf-email-banner');
  const st = LF_EMAIL_STATUS;
  if (!currentMerchant || !st || st.verified || !hd) { b?.remove(); return; }
  if (!b) { b = document.createElement('div'); b.id = 'lf-email-banner'; hd.insertAdjacentElement('afterend', b); }
  b.setAttribute('role', 'status');
  b.style.cssText = 'background:#fef3c7;border:1px solid #d97706;color:#92400e;border-radius:var(--r2,12px);padding:.75rem 1rem;margin:0 0 1rem;font-size:.86rem;display:flex;gap:.6rem;align-items:center;justify-content:space-between;flex-wrap:wrap';
  b.innerHTML = `<span>${st.pendingEmail ? 'Please verify your recovery email <b>' + lfEsc(st.pendingEmail) + '</b> — check your inbox.' : '<b>Required:</b> add a recovery email so you can reset your password if you forget it.'}</span>
    <button type="button" class="tbl-action" onclick="lfOpenEmailRequiredModal()">${st.pendingEmail ? 'Resend / change' : 'Add email'}</button>`;
}

const _lfLoadAllDataEmail = loadAllData;
loadAllData = async function () {
  const r = await _lfLoadAllDataEmail.apply(this, arguments);
  lfCheckEmailRequirement();
  return r;
};

/* ---------- 3. Security tab: my recovery email (+ admin: all merchants) ---------- */
function lfBox(id) {
  let box = document.getElementById(id);
  const panel = document.getElementById('merch-panel-security');
  if (!panel) return null;
  if (!box) {
    box = document.createElement('div');
    box.id = id;
    box.style.cssText = 'background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.7rem;max-width:720px;box-shadow:var(--shadow);margin:0 0 1.3rem';
    panel.insertBefore(box, panel.firstElementChild?.nextElementSibling || null);
  }
  return box;
}
const LF_BADGE = (ok, txt) => `<span style="font-size:.7rem;font-weight:700;padding:.15rem .55rem;border-radius:20px;text-transform:uppercase;${ok ? 'background:#dcf5eb;color:#076a35' : 'background:#fef3c7;color:#92400e'}">${txt}</span>`;

async function lfRenderEmailBox() {
  if (!currentMerchant) return;
  const box = lfBox('lf-email-box'); if (!box) return;
  const st = await lfLoadEmailStatus() || {};
  box.innerHTML = `<div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.02em;margin-bottom:.3rem">Recovery email</div>
    <p style="font-size:.86rem;color:var(--g4);line-height:1.6;margin-bottom:.8rem">Password reset links are sent only to a <b>verified</b> email.</p>
    <div style="font-size:.9rem;margin-bottom:.9rem">
      ${st.verified ? `${LF_BADGE(true, 'Verified')} <b>${lfEsc(st.email)}</b>` : `${LF_BADGE(false, 'Not verified')} ${st.email ? 'Current: <b>' + lfEsc(st.email) + '</b>' : 'No verified email yet'}`}
      ${st.pendingEmail ? `<div style="margin-top:.4rem;color:var(--g5)">Waiting for verification: <b>${lfEsc(st.pendingEmail)}</b> <button class="tbl-action" style="margin-left:.4rem" id="lf-eb-resend">Resend link</button></div>` : ''}
    </div>
    ${lfEmailFormHtml('lf-eb')}
    <button class="edit-save-btn" style="max-width:260px" id="lf-eb-save">${st.verified ? 'Change email' : 'Send verification link'}</button>`;
  document.getElementById('lf-eb-save').onclick = () => lfSubmitEmail('lf-eb', r => { lfRenderEmailBox(); lfRenderEmailBanner(); if (r && r.devOutbox) lfDevOutboxToast(); });
  document.getElementById('lf-eb-resend')?.addEventListener('click', async () => {
    try { const r = await lfEmailApi('resend', { method: 'POST' }); toast(r.message, 'success'); if (r.devOutbox) lfDevOutboxToast(); }
    catch (e) { toast(e.message, 'error'); }
  });
  if (lfIsAdmin()) lfRenderAdminEmails();
  else document.getElementById('lf-admin-emails')?.remove();
}

async function lfRenderAdminEmails() {
  const panel = document.getElementById('merch-panel-security'); if (!panel) return;
  let box = document.getElementById('lf-admin-emails');
  if (!box) {
    box = document.createElement('div');
    box.id = 'lf-admin-emails';
    box.style.cssText = 'background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.7rem;max-width:720px;box-shadow:var(--shadow);margin:0 0 1.3rem';
    document.getElementById('lf-email-box').insertAdjacentElement('afterend', box);
  }
  let d;
  try { d = await lfEmailApi('list'); } catch (e) { box.innerHTML = `<div style="color:var(--red)">${lfEsc(e.message)}</div>`; return; }
  const verified = d.merchants.filter(m => m.verified).length;
  box.innerHTML = `<div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.02em;margin-bottom:.3rem">Merchant recovery emails</div>
    <p style="font-size:.86rem;color:var(--g4);line-height:1.6;margin-bottom:.4rem">${verified} of ${d.merchants.length} merchants verified. Merchants without a verified email can't receive reset links.</p>
    ${d.smtpConfigured ? '' : `<p style="font-size:.8rem;background:#fef3c7;color:#92400e;border-radius:8px;padding:.5rem .7rem;margin-bottom:.6rem">Email sending is in <b>test mode</b> — emails are saved in <code>backend/mail_outbox/</code>. Add Gmail SMTP to <code>backend/config.local.php</code> to send real emails.</p>`}
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.84rem">
      <thead><tr style="text-align:left;color:var(--g4);font-size:.72rem;text-transform:uppercase;letter-spacing:.06em">
        <th style="padding:.5rem;border-bottom:1px solid var(--g2)">Brand</th><th style="padding:.5rem;border-bottom:1px solid var(--g2)">Email</th>
        <th style="padding:.5rem;border-bottom:1px solid var(--g2)">Status</th><th style="padding:.5rem;border-bottom:1px solid var(--g2)"></th></tr></thead>
      <tbody>${d.merchants.map(m => `<tr>
        <td style="padding:.5rem;border-bottom:1px solid var(--g1);font-weight:600">${lfEsc(m.name)}</td>
        <td style="padding:.5rem;border-bottom:1px solid var(--g1)">${lfEsc(m.email || m.pendingEmail || '—')}</td>
        <td style="padding:.5rem;border-bottom:1px solid var(--g1)">${m.verified ? LF_BADGE(true, 'Verified') : LF_BADGE(false, m.pendingEmail ? 'Pending' : 'None')}</td>
        <td style="padding:.5rem;border-bottom:1px solid var(--g1)"><button class="tbl-action" onclick="lfAdminSetMerchantEmail('${lfEsc(m.brandId)}')">Set email</button></td>
      </tr>`).join('')}</tbody></table></div>`;
}

async function lfAdminSetMerchantEmail(brandId) {
  const email = prompt('Recovery email for ' + (getBrandName(brandId) || brandId) + '\n(the merchant will get a link to verify it):');
  if (!email) return;
  try { const r = await lfEmailApi('admin_set_email', { method: 'POST', body: { brandId, email: email.trim() } }); toast(r.message, 'success'); if (r.devOutbox) lfDevOutboxToast(); lfRenderAdminEmails(); }
  catch (e) { toast(e.message, 'error'); }
}

const _lfShowMerchTabEmail = showMerchTab;
showMerchTab = function (tab) {
  const r = _lfShowMerchTabEmail.apply(this, arguments);
  if (tab === 'security') lfRenderEmailBox();
  return r;
};

/* ---------- 4. Add Brand: merchant email required ---------- */
function lfAddBrandEmailField() {
  if (document.getElementById('nb-email')) return;
  const pass = document.getElementById('nb-pass'); if (!pass) return;
  const label = document.createElement('label');
  label.className = 'pay-label'; label.htmlFor = 'nb-email'; label.textContent = 'Merchant email (for password recovery) *';
  const input = document.createElement('input');
  input.id = 'nb-email'; input.className = 'pay-input'; input.type = 'email'; input.maxLength = 190; input.placeholder = 'merchant@gmail.com';
  pass.insertAdjacentElement('afterend', input);
  pass.insertAdjacentElement('afterend', label);
}
const _lfAdminAddBrandEmail = adminAddBrand;
adminAddBrand = async function () {
  lfAddBrandEmailField();
  const id = document.getElementById('nb-id').value.trim().toLowerCase().replace(/\s+/g, '');
  const email = (document.getElementById('nb-email')?.value || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Enter the merchant\'s email (for password recovery)', 'error'); return; }
  const exists = () => BRANDS.some(b => b.id === id);   // getBrand() returns a placeholder for unknown ids
  const existed = exists();
  await _lfAdminAddBrandEmail.apply(this, arguments);
  if (!existed && exists()) {
    try {
      const r = await lfEmailApi('admin_set_email', { method: 'POST', body: { brandId: id, email } });
      document.getElementById('nb-email').value = '';
      setTimeout(() => toast('Verification email sent to ' + email + ' — the merchant must open it.', 'success'), 1500);
      if (r.devOutbox) lfDevOutboxToast();
    } catch (e) { toast('Brand added, but the email failed: ' + e.message, 'error'); }
  }
};
const _lfRenderMerchantDashEmail = renderMerchantDash;
renderMerchantDash = function () {
  const r = _lfRenderMerchantDashEmail.apply(this, arguments);
  lfAddBrandEmailField();
  lfRenderEmailBanner();
  return r;
};
document.addEventListener('DOMContentLoaded', lfAddBrandEmailField);
if (document.readyState !== 'loading') lfAddBrandEmailField();

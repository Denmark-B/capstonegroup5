/* ============================================================
   AccountSecurity.js — "Change Password" button + password history.

   LOAD ORDER (last, after SyncSecure.js):
     <script src="lostandfound.js"></script>
     <script src="backend/Sync.js"></script>
     <script src="backend/SyncSecure.js"></script>
     <script src="backend/AccountSecurity.js"></script>

   Adds, without editing any other file:
     • a "Change Password" button next to Logout on the dashboard
     • the Security tab form and the password pop-up now save
       through backend/Account.php, which records every change
       in the database (password_changes table + notifications)
     • a "Password history" list in the Security tab
       (admin also sees every merchant's password changes)
   ============================================================ */

const LF_ACCOUNT_URL = LF.apiUrl.replace(/Api\.php(\?.*)?$/, 'Account.php');

/* ---------- request helper (session cookie + CSRF, retries once) ---------- */
async function lfAccount(action, { method = 'GET', body = null, query = null } = {}, _retried = false) {
  const params = new URLSearchParams({ action });
  if (query) for (const k in query) params.set(k, query[k]);
  const opts = { method, credentials: 'include', headers: { 'Accept': 'application/json' } };
  if (method !== 'GET') {
    if (!LF.csrf) { try { await lfFetchCsrf(); } catch (e) { } }
    opts.headers['X-CSRF-Token'] = LF.csrf || '';
  }
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }

  let res;
  try { res = await fetch(`${LF_ACCOUNT_URL}?${params.toString()}`, opts); }
  catch (e) { throw new Error('Cannot reach the server. Check that Apache and MySQL are running.'); }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { }

  if (!res.ok) {
    if (res.status === 403 && data && data.code === 'csrf' && !_retried) {
      LF.csrf = null;
      return lfAccount(action, { method, body, query }, true);
    }
    const err = new Error((data && data.error) || 'Request failed (' + res.status + ').');
    err.status = res.status;
    throw err;
  }
  if (data && data.csrfToken) LF.csrf = data.csrfToken;
  return data;
}

function lfFormatDate(ts) {
  if (!ts) return '—';
  const d = new Date(String(ts).replace(' ', 'T'));
  if (isNaN(d)) return lfEsc(ts);
  return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
function lfBrowserName(ua) {
  ua = ua || '';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\//.test(ua)) return 'Opera';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua)) return 'Safari';
  return ua ? 'Browser' : '—';
}

/* ---------- one place that changes the password ---------- */
async function lfChangePassword(cur, nw, conf) {
  if (!cur) throw new Error('Enter your current password.');
  const problem = lfPasswordProblem(nw); if (problem) throw new Error(problem);
  if (nw !== conf) throw new Error('The new passwords do not match.');
  if (nw === cur) throw new Error('New password must be different from the current one.');
  const r = await lfAccount('change_password', { method: 'POST', body: { currentPassword: cur, newPassword: nw, confirmPassword: conf } });
  LF.mustChange = false;
  return r;
}
function lfPasswordSuccess(r) {
  toast('Password changed and saved to the database (' + lfFormatDate(r.lastChanged) + ')', 'success');
  lfRenderPasswordHistory();
}

// Pop-up (forced first-login change AND the new header button) — replaces the SyncSecure.js version
async function lfSubmitPasswordModal() {
  const err = document.getElementById('lf-pw-err');
  const btn = document.getElementById('lf-pw-save');
  const show = m => { err.textContent = m; err.style.display = 'block'; };
  err.style.display = 'none';
  btn.disabled = true; const label = btn.textContent; btn.textContent = 'Saving…';
  try {
    const r = await lfChangePassword(
      document.getElementById('lf-pw-cur').value,
      document.getElementById('lf-pw-new').value,
      document.getElementById('lf-pw-conf').value);
    lfClosePasswordModal();
    lfPasswordSuccess(r);
    await loadAllData();
  } catch (e) { show(e.message); btn.disabled = false; btn.textContent = label; }
}

// Security tab form — replaces the SyncSecure.js version
async function saveMerchantPassword() {
  if (!currentMerchant) return;
  const errEl = document.getElementById('sec-error');
  const show = m => { errEl.textContent = m; errEl.style.display = 'block'; };
  errEl.style.display = 'none';
  try {
    const r = await lfChangePassword(
      document.getElementById('sec-cur').value,
      document.getElementById('sec-new').value,
      document.getElementById('sec-confirm').value);
    ['sec-cur', 'sec-new', 'sec-confirm'].forEach(id => document.getElementById(id).value = '');
    lfPasswordSuccess(r);
  } catch (e) { show(e.message); }
}

/* ---------- "Change Password" button next to Logout ---------- */
function lfAddChangePasswordButton() {
  if (document.getElementById('lf-change-pw-btn')) return;
  const logout = document.querySelector('#page-merchant .merch-logout-btn');
  if (!logout) return;
  const btn = document.createElement('button');
  btn.id = 'lf-change-pw-btn';
  btn.type = 'button';
  btn.className = 'merch-logout-btn';                 // same look as your Logout button
  btn.style.marginRight = '.5rem';
  btn.innerHTML = (typeof ICONS !== 'undefined' && ICONS.key ? ICONS.key + ' ' : '') + 'Change Password';
  btn.setAttribute('aria-label', 'Change your password');
  btn.onmouseenter = () => { btn.style.borderColor = 'var(--black)'; btn.style.color = 'var(--black)'; };
  btn.onmouseleave = () => { btn.style.borderColor = ''; btn.style.color = ''; };
  btn.onclick = () => { if (currentMerchant) lfOpenPasswordModal(false); };

  // keep Logout on the right, both buttons together
  const group = document.createElement('div');
  group.style.cssText = 'display:flex;align-items:center;gap:.5rem;flex-wrap:wrap';
  logout.parentElement.insertBefore(group, logout);
  group.appendChild(btn);
  group.appendChild(logout);
}

/* ---------- password history in the Security tab ---------- */
function lfEnsureHistoryBox() {
  let box = document.getElementById('lf-pw-history');
  if (box) return box;
  const panel = document.getElementById('merch-panel-security');
  if (!panel) return null;
  box = document.createElement('div');
  box.id = 'lf-pw-history';
  box.style.cssText = 'background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.7rem;max-width:720px;box-shadow:var(--shadow);margin-top:1.3rem';
  panel.appendChild(box);
  return box;
}

async function lfRenderPasswordHistory() {
  if (!currentMerchant) return;
  const box = lfEnsureHistoryBox(); if (!box) return;
  const admin = lfIsAdmin();
  box.innerHTML = `<div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.02em;margin-bottom:.3rem">${admin ? 'Password activity — all accounts' : 'Password history'}</div>
    <div style="font-size:.82rem;color:var(--g4)">Loading…</div>`;
  try {
    const [status, rows] = await Promise.all([
      lfAccount('status'),
      lfAccount('history', admin ? { query: { all: 1 } } : {}),
    ]);
    const reasonLabel = r => r === 'first_login'
      ? '<span style="font-size:.7rem;font-weight:700;padding:.15rem .55rem;border-radius:20px;background:#fef3c7;color:#92400e;text-transform:uppercase">First login</span>'
      : '<span style="font-size:.7rem;font-weight:700;padding:.15rem .55rem;border-radius:20px;background:#dcf5eb;color:#076a35;text-transform:uppercase">Changed</span>';
    const summary = status.lastChanged
      ? `Your password was last changed on <strong>${lfFormatDate(status.lastChanged)}</strong> · ${status.changeCount} change${status.changeCount === 1 ? '' : 's'} recorded.`
      : 'No password changes recorded yet for your account.';
    const table = rows.length ? `
      <div style="overflow-x:auto;margin-top:1rem">
        <table style="width:100%;border-collapse:collapse;font-size:.84rem">
          <thead><tr style="text-align:left;color:var(--g4);font-size:.72rem;text-transform:uppercase;letter-spacing:.06em">
            <th style="padding:.5rem;border-bottom:1px solid var(--g2)">Date &amp; time</th>
            ${admin ? '<th style="padding:.5rem;border-bottom:1px solid var(--g2)">Account</th>' : ''}
            <th style="padding:.5rem;border-bottom:1px solid var(--g2)">Type</th>
            <th style="padding:.5rem;border-bottom:1px solid var(--g2)">Browser</th>
            <th style="padding:.5rem;border-bottom:1px solid var(--g2)">IP</th>
          </tr></thead>
          <tbody>${rows.map(r => `<tr>
            <td style="padding:.55rem .5rem;border-bottom:1px solid var(--g1)">${lfFormatDate(r.changedAt)}</td>
            ${admin ? `<td style="padding:.55rem .5rem;border-bottom:1px solid var(--g1);font-weight:600">${lfEsc(r.name)}</td>` : ''}
            <td style="padding:.55rem .5rem;border-bottom:1px solid var(--g1)">${reasonLabel(r.reason)}</td>
            <td style="padding:.55rem .5rem;border-bottom:1px solid var(--g1)">${lfEsc(lfBrowserName(r.browser))}</td>
            <td style="padding:.55rem .5rem;border-bottom:1px solid var(--g1);color:var(--g4)">${lfEsc(r.ip || '—')}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>` : '';
    box.innerHTML = `<div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.02em;margin-bottom:.3rem">${admin ? 'Password activity — all accounts' : 'Password history'}</div>
      <div style="font-size:.875rem;color:var(--g5);line-height:1.6">${summary}</div>${table}`;
  } catch (e) {
    box.innerHTML = `<div style="color:var(--red);font-size:.875rem">Could not load password history: ${lfEsc(e.message)}</div>`;
  }
}

// refresh the history whenever the Security tab is opened
const _lfShowMerchTab = showMerchTab;
showMerchTab = function (tab) {
  const r = _lfShowMerchTab.apply(this, arguments);
  if (tab === 'security') lfRenderPasswordHistory();
  return r;
};

// the Security form also works for the admin (SyncSecure.js supports it) — fix the description text
function lfUpdateSecurityText() {
  const p = document.querySelector('#merch-panel-security p');
  if (p && lfIsAdmin()) p.textContent = 'Update your admin login password. Changes take effect immediately and are recorded in the database.';
  else if (p) p.textContent = 'Update your merchant login password. Changes take effect immediately and are recorded in the database.';
}

const _lfRenderMerchantDashAcc = renderMerchantDash;
renderMerchantDash = function () {
  const r = _lfRenderMerchantDashAcc.apply(this, arguments);
  lfAddChangePasswordButton();
  lfUpdateSecurityText();
  return r;
};

document.addEventListener('DOMContentLoaded', lfAddChangePasswordButton);
if (document.readyState !== 'loading') lfAddChangePasswordButton();

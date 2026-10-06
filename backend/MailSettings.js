/* ============================================================
   MailSettings.js — "Email sending (Gmail)" box in the admin
   Security tab. Type the Gmail + App Password, click Save &
   send test: the website tests it, saves it, and from then on
   sends real emails. Load after EmailFeature.js.
   ============================================================ */

const LF_MAILSET_URL = LF.apiUrl.replace(/Api\.php(\?.*)?$/, 'MailSettings.php');

async function lfMailSetApi(action, { method = 'GET', body = null } = {}, _retried = false) {
  const opts = { method, credentials: 'include', headers: { 'Accept': 'application/json' } };
  if (method !== 'GET') { if (!LF.csrf) { try { await lfFetchCsrf(); } catch (e) { } } opts.headers['X-CSRF-Token'] = LF.csrf || ''; }
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  let res;
  try { res = await fetch(`${LF_MAILSET_URL}?action=${action}`, opts); }
  catch (e) { throw new Error('Cannot reach the server.'); }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 403 && data && data.code === 'csrf' && !_retried) { LF.csrf = null; return lfMailSetApi(action, { method, body }, true); }
    const err = new Error((data && data.error) || 'Request failed (' + res.status + ').'); err.detail = data && data.detail; throw err;
  }
  return data;
}

async function lfRenderMailSettings() {
  const panel = document.getElementById('merch-panel-security');
  let box = document.getElementById('lf-mail-settings');
  if (!lfIsAdmin()) { box?.remove(); return; }
  if (!panel) return;
  if (!box) {
    box = document.createElement('div');
    box.id = 'lf-mail-settings';
    box.style.cssText = 'background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.7rem;max-width:720px;box-shadow:var(--shadow);margin:0 0 1.3rem';
    panel.insertBefore(box, panel.firstElementChild?.nextElementSibling || null);
  }
  const head = `<div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.02em;margin-bottom:.3rem">Email sending (Gmail)</div>`;
  let st;
  try { st = await lfMailSetApi('status'); } catch (e) { box.innerHTML = head + `<div style="color:var(--red)">${lfEsc(e.message)}</div>`; return; }

  const badge = st.configured
    ? `<span style="font-size:.7rem;font-weight:700;padding:.15rem .55rem;border-radius:20px;background:#dcf5eb;color:#076a35;text-transform:uppercase">On</span> Real emails are sent from <b>${lfEsc(st.gmail)}</b>`
    : `<span style="font-size:.7rem;font-weight:700;padding:.15rem .55rem;border-radius:20px;background:#fef3c7;color:#92400e;text-transform:uppercase">Test mode</span> Emails are only saved in <code>backend/mail_outbox</code> — nothing reaches real inboxes yet.`;

  box.innerHTML = head + `
    <div style="font-size:.88rem;margin:.2rem 0 1rem;line-height:1.6">${badge}</div>
    <details ${st.configured ? '' : 'open'} style="margin-bottom:1rem">
      <summary style="cursor:pointer;font-weight:600;font-size:.86rem">How to get a Gmail App Password (free, 2 minutes)</summary>
      <ol style="font-size:.84rem;line-height:1.7;color:var(--g5);padding-left:1.2rem;margin:.6rem 0 0">
        <li>Open <a href="https://myaccount.google.com/security" target="_blank" rel="noopener">myaccount.google.com/security</a> → turn <b>2-Step Verification</b> ON.</li>
        <li>Open <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener">myaccount.google.com/apppasswords</a> → type <b>Lost and Found</b> → <b>Create</b>.</li>
        <li>Copy the 16-letter password Google shows and paste it below (spaces are fine).</li>
      </ol>
    </details>
    <label class="pay-label" for="lf-ms-gmail">Gmail address that sends the emails *</label>
    <input id="lf-ms-gmail" class="pay-input" type="email" autocomplete="off" placeholder="yourshop@gmail.com" value="${lfEsc(st.gmail || '')}">
    <label class="pay-label" for="lf-ms-pass">App Password (16 letters) *</label>
    <input id="lf-ms-pass" class="pay-input" type="password" autocomplete="new-password" placeholder="${st.configured ? 'Saved — type again only to change it' : 'abcd efgh ijkl mnop'}">
    <label class="pay-label" for="lf-ms-to">Send the test email to</label>
    <input id="lf-ms-to" class="pay-input" type="email" autocomplete="off" placeholder="Leave empty = your recovery email">
    <div id="lf-ms-msg" role="status" style="display:none;border-radius:8px;padding:.7rem .9rem;font-size:.85rem;line-height:1.55;margin-bottom:.9rem"></div>
    <div style="display:flex;gap:.6rem;flex-wrap:wrap">
      <button class="edit-save-btn" style="max-width:280px" id="lf-ms-save">Save &amp; send test email</button>
      ${st.configured ? '<button class="edit-cancel-btn" style="max-width:220px" id="lf-ms-remove">Turn off (test mode)</button>' : ''}
    </div>
    ${st.writable ? '' : '<p style="font-size:.8rem;color:var(--red);margin-top:.8rem">The server cannot write to the backend folder, so settings cannot be saved here.</p>'}`;

  const msg = (html, ok) => { const m = document.getElementById('lf-ms-msg'); m.style.display = 'block';
    m.style.cssText += ok ? ';background:#dcf5eb;border:1px solid #076a35;color:#076a35' : ';background:#fee2e2;border:1px solid #b91c1c;color:#991b1b';
    m.innerHTML = html; };
  document.getElementById('lf-ms-save').onclick = async () => {
    const btn = document.getElementById('lf-ms-save');
    const gmail = document.getElementById('lf-ms-gmail').value.trim();
    const appPassword = document.getElementById('lf-ms-pass').value;
    const testTo = document.getElementById('lf-ms-to').value.trim();
    if (!gmail) return msg('Enter the Gmail address.', false);
    if (!appPassword) return msg('Enter the App Password.', false);
    btn.disabled = true; btn.textContent = 'Testing with Gmail…';
    try {
      const r = await lfMailSetApi('save', { method: 'POST', body: { gmail, appPassword, testTo } });
      toast('Email sending is ON', 'success');
      await lfRenderMailSettings();
      msg(lfEsc(r.message) + '<br>Check that inbox (and Spam). Now click <b>Resend link</b> on any email waiting for verification.', true);
      if (typeof lfRenderEmailBox === 'function') lfRenderEmailBox();
    } catch (e) {
      msg('<b>Not saved.</b> ' + lfEsc(e.message) + (e.detail ? `<br><span style="font-size:.76rem;opacity:.8">Gmail said: ${lfEsc(e.detail)}</span>` : ''), false);
      btn.disabled = false; btn.textContent = 'Save & send test email';
    }
  };
  document.getElementById('lf-ms-remove')?.addEventListener('click', async () => {
    if (!confirm('Turn off real email sending? Emails will be saved in backend/mail_outbox again.')) return;
    try { const r = await lfMailSetApi('remove', { method: 'POST' }); toast(r.message, ''); lfRenderMailSettings(); if (typeof lfRenderEmailBox === 'function') lfRenderEmailBox(); }
    catch (e) { toast(e.message, 'error'); }
  });
}

const _lfShowMerchTabMail = showMerchTab;
showMerchTab = function (tab) {
  const r = _lfShowMerchTabMail.apply(this, arguments);
  if (tab === 'security') lfRenderMailSettings();
  return r;
};

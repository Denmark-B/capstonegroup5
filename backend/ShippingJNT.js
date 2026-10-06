/* ============================================================
   ShippingJNT.js — J&T Express shipping + automatic order total.

   LOAD ORDER (last):
     ... backend/SyncSecure.js, backend/AccountSecurity.js,
         backend/PasswordReset.js, backend/ShippingJNT.js

   • Shipping-area list shows current J&T "from" prices
   • Fee = real J&T rate by weight + destination (from Luzon/Batangas)
   • One J&T parcel per merchant (each stall ships its own items)
   • Subtotal + shipping = total, calculated automatically and shown
     with a breakdown; the GCash/PayMaya amount follows it
   • The order is placed through backend/Checkout.php, which
     recalculates the shipping on the server (can't be tampered with)
   ============================================================ */

const LF_CHECKOUT_URL = LF.apiUrl.replace(/Api\.php(\?.*)?$/, 'Checkout.php');
let LF_SHIP = null;                       // rate table from the server
let LF_LAST_QUOTE = null;                 // last calculated breakdown

/* ---------- load the rate table (same numbers the server uses) ---------- */
async function lfLoadShippingRates() {
  try {
    const r = await fetch(LF_CHECKOUT_URL + '?action=rates', { credentials: 'include', headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error('rates ' + r.status);
    LF_SHIP = await r.json();
    // keep your SHIPPING_RATES object in step (labels, "from" fee, delivery days)
    for (const [key, z] of Object.entries(LF_SHIP.zones)) {
      SHIPPING_RATES[key] = { label: z.label, fee: LF_SHIP.rates[z.region][0], days: z.days };
    }
    lfRefreshZoneOptions();
  } catch (e) {
    console.error('Could not load J&T rates', e);
  }
}

function lfRefreshZoneOptions() {
  const sel = document.getElementById('shipping-zone');
  if (!sel || !LF_SHIP) return;
  // add the island option once (before Visayas)
  if (!sel.querySelector('option[value="island"]')) {
    const opt = document.createElement('option');
    opt.value = 'island';
    const vis = sel.querySelector('option[value="visayas"]');
    vis ? sel.insertBefore(opt, vis) : sel.appendChild(opt);
  }
  sel.querySelectorAll('option').forEach(o => {
    const z = LF_SHIP.zones[o.value];
    if (z) o.textContent = `${z.label} — from ₱${LF_SHIP.rates[z.region][0]}`;
  });
  const lbl = document.querySelector('label[for="shipping-zone"]');
  if (lbl && !lbl.dataset.lfJnt) { lbl.dataset.lfJnt = '1'; lbl.textContent = 'Shipping Area (J&T Express from Batangas)'; }
}

/* ---------- the calculator (mirror of backend/Shipping.php) ---------- */
function lfItemWeight(p) {
  const hay = ((p.tag || '') + ' ' + (p.name || '')).toLowerCase();
  for (const rule of LF_SHIP.weights) if (new RegExp(rule.match).test(hay)) return rule.kg;
  return LF_SHIP.defaultItemKg;
}
function lfJntFee(region, kg) {
  const rates = LF_SHIP.rates[region] || LF_SHIP.rates.luzon;
  const br = LF_SHIP.brackets;
  for (let i = 0; i < br.length; i++) if (kg <= br[i] + 1e-9) return rates[i];
  const last = rates.length - 1, step = rates[last] - rates[last - 1];
  return rates[last] + Math.ceil(kg - br[last] - 1e-9) * step;
}
function lfCalcShipping(zone, sourceItems) {
  if (!LF_SHIP || !LF_SHIP.zones[zone]) return null;
  const z = LF_SHIP.zones[zone];
  const parcels = {};
  let subtotal = 0;
  sourceItems.forEach(i => {
    const p = getProduct(i.productId); if (!p) return;
    subtotal += (isNaN(p.price) ? 0 : Number(p.price)) * i.qty;
    if (!parcels[p.brand]) parcels[p.brand] = { brandId: p.brand, brandName: getBrandName(p.brand) || p.brand, items: 0, weightKg: LF_SHIP.packagingKg };
    parcels[p.brand].items += i.qty;
    parcels[p.brand].weightKg += lfItemWeight(p) * i.qty;
  });
  const list = Object.values(parcels).map(p => ({ ...p, weightKg: Math.round(p.weightKg * 100) / 100 }));
  list.forEach(p => { p.fee = lfJntFee(z.region, p.weightKg); });
  const shippingTotal = list.reduce((s, p) => s + p.fee, 0);
  return { zone, zoneLabel: z.label, region: z.region, days: z.days, parcels: list, subtotal, shippingTotal, total: subtotal + shippingTotal };
}

/* ---------- breakdown box under "Shipping (J&T Express)" ---------- */
function lfBreakdownBox() {
  let box = document.getElementById('lf-ship-breakdown');
  if (box) return box;
  const shipRow = document.getElementById('pay-ship')?.closest('.receipt-total-row');
  if (!shipRow) return null;
  box = document.createElement('div');
  box.id = 'lf-ship-breakdown';
  box.setAttribute('aria-live', 'polite');
  box.style.cssText = 'font-size:.76rem;color:var(--g4);line-height:1.55;margin:-.15rem 0 .45rem;padding-left:.1rem';
  shipRow.insertAdjacentElement('afterend', box);
  return box;
}
function lfRenderBreakdown(q) {
  const box = lfBreakdownBox(); if (!box) return;
  if (!q) { box.innerHTML = ''; return; }
  const regionName = { luzon: 'Luzon', ncr: 'Metro Manila', visayas: 'Visayas', mindanao: 'Mindanao', island: 'Island' }[q.region] || q.region;
  box.innerHTML = q.parcels.map(p =>
    `<div style="display:flex;justify-content:space-between;gap:.5rem"><span>${lfEsc(p.brandName)} · ${p.items} item${p.items > 1 ? 's' : ''} · ~${p.weightKg} kg</span><span>₱${p.fee}</span></div>`).join('')
    + `<div style="margin-top:.2rem">${q.parcels.length > 1 ? q.parcels.length + ' J&T parcels (each shop ships separately) · ' : ''}Batangas → ${lfEsc(regionName)} rate · weight estimated</div>`;
}

/* ---------- automatic total: replaces your updateShippingRate() ---------- */
function updateShippingRate() {
  const zone = document.getElementById('shipping-zone').value;
  const sourceItems = buyNowItem ? [buyNowItem] : cart;
  const sub = sourceItems.reduce((s, i) => { const p = getProduct(i.productId); return s + (p ? p.price * i.qty : 0); }, 0);
  document.getElementById('pay-sub').textContent = fmtMoney(sub);
  if (!zone) {
    shippingFee = 0; LF_LAST_QUOTE = null;
    document.getElementById('pay-ship').textContent = 'Select area first';
    document.getElementById('pay-total').textContent = '—';
    document.getElementById('delivery-est').style.display = 'none';
    lfRenderBreakdown(null);
    return;
  }
  if (!LF_SHIP) {                                  // rates not loaded yet → load, then recalc
    document.getElementById('pay-ship').textContent = 'Calculating…';
    lfLoadShippingRates().then(() => { if (LF_SHIP) updateShippingRate(); else document.getElementById('pay-ship').textContent = 'Unavailable — check the server'; });
    return;
  }
  const q = lfCalcShipping(zone, sourceItems);
  if (!q) return;
  LF_LAST_QUOTE = q;
  shippingFee = q.shippingTotal;                   // your selectPayMethod() / QR amount use this
  document.getElementById('pay-ship').textContent = fmtMoney(q.shippingTotal);
  document.getElementById('pay-total').textContent = fmtMoney(q.total);
  lfRenderBreakdown(q);
  const d = new Date(); d.setDate(d.getDate() + q.days);
  document.getElementById('est-date').textContent = d.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })
    + ' (about ' + q.days + ' day' + (q.days > 1 ? 's' : '') + ')';
  document.getElementById('delivery-est').style.display = 'block';
  const qr = document.getElementById('qr-amount');
  if (qr && selPayMethod) qr.textContent = fmtMoney(q.total);
}

// clear the breakdown each time the checkout opens
const _lfBuildReceipt = buildReceipt;
buildReceipt = function () {
  const r = _lfBuildReceipt.apply(this, arguments);
  shippingFee = 0; LF_LAST_QUOTE = null; lfRenderBreakdown(null);
  lfRefreshZoneOptions();
  return r;
};

/* ---------- place the order through Checkout.php (server recalculates shipping) ---------- */
async function placeOrder() {
  if (!selPayMethod) { toast('Please select a payment method', 'error'); return; }
  const zone = document.getElementById('shipping-zone').value;
  if (!zone) { toast('Please select a shipping area', 'error'); updateCheckoutStep(1); return; }
  const name = document.getElementById('pay-name').value.trim();
  const email = document.getElementById('pay-email').value.trim();
  const phone = document.getElementById('pay-phone').value.trim();
  const address = document.getElementById('pay-address').value.trim();
  const sourceItems = buyNowItem ? [buyNowItem] : cart;
  const items = sourceItems.map(i => ({ id: i.productId, qty: i.qty }));
  const btn = document.querySelector('#pay-modal .pay-place-btn, #pay-modal [onclick="placeOrder()"]');
  if (btn) btn.disabled = true;

  const send = async (retried) => {
    if (!LF.csrf) { try { await lfFetchCsrf(); } catch (e) { } }
    const res = await fetch(`${LF_CHECKOUT_URL}?action=place&session=${encodeURIComponent(sessionId())}`, {
      method: 'POST', credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-CSRF-Token': LF.csrf || '' },
      body: JSON.stringify({ customer: name, email, phone, address, payMethod: selPayMethod, zone, items }),
    });
    const data = await res.json().catch(() => null);
    if (res.status === 403 && data && data.code === 'csrf' && !retried) { LF.csrf = null; return send(true); }
    if (!res.ok) throw new Error((data && data.error) || 'Could not place order.');
    return data;
  };

  try {
    const r = await send(false);
    const orderItems = sourceItems.map(i => ({ p: getProduct(i.productId), qty: i.qty })).filter(x => x.p);
    if (!buyNowItem) { cart = []; updateCartUI(); }
    buyNowItem = null;
    await loadAllData();
    closeCheckout();
    document.getElementById('conf-order-id').textContent = r.id;
    document.getElementById('conf-email').textContent = email;
    document.getElementById('conf-items').innerHTML =
      orderItems.map(x => `<div style="display:flex;justify-content:space-between;padding:.35rem 0"><span>${lfEsc(x.p.name)} ×${x.qty}</span><span>${fmtMoney(x.p.price * x.qty)}</span></div>`).join('')
      + `<div style="display:flex;justify-content:space-between;padding:.35rem 0;border-top:1px dashed var(--g2);margin-top:.3rem"><span>Subtotal</span><span>${fmtMoney(r.subtotal)}</span></div>`
      + r.parcels.map(p => `<div style="display:flex;justify-content:space-between;padding:.2rem 0;font-size:.85em;color:var(--g4)"><span>J&amp;T shipping · ${lfEsc(p.brandName)} (~${p.weightKg} kg)</span><span>${fmtMoney(p.fee)}</span></div>`).join('');
    document.getElementById('conf-total').textContent = 'Total: ' + fmtMoney(r.total) + '  (items ' + fmtMoney(r.subtotal) + ' + shipping ' + fmtMoney(r.shippingFee) + ')';
    document.getElementById('confirm-modal').classList.add('on');
    openA11yPanel(document.querySelector('.confirm-card'));
    toast('Order placed!', 'success');
  } catch (e) {
    toast(e.message || 'Could not place order', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

/* ---------- start ---------- */
document.addEventListener('DOMContentLoaded', lfLoadShippingRates);
if (document.readyState !== 'loading') lfLoadShippingRates();

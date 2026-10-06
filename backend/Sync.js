/* ============================================================
   sync.js — bridge between lostandfound.js (unchanged) and the
   PHP/MySQL backend, with REAL LOGIN SESSIONS.

   Load this AFTER lostandfound.js:
   <script src="lostandfound.js"></script>
   <script src="backend/sync.js"></script>

   SECURITY:
   The server tracks who's ACTUALLY logged in via a PHP session
   cookie, and checks that on every write. A merchant can only
   ever touch their own brand's data; only the real admin login
   can do admin-only things. Passwords are hashed in the
   database instead of stored as plain text.
   ============================================================ */

   const API = 'backend/Api.php';

async function api(resource, { method = 'GET', id = null, action = null, body = null, query = null } = {}) {
  let url = `${API}?resource=${resource}`;
  if (id !== null) url += `&id=${encodeURIComponent(id)}`;
  if (action) url += `&action=${action}`;
  if (query) for (const k in query) url += `&${k}=${encodeURIComponent(query[k])}`;
  const opts = { method, credentials: 'include' };
  if (body !== null) { opts.headers = { 'Content-Type': 'application/json' }; opts.body = JSON.stringify(body); }
  const res = await fetch(url, opts);
  if (!res.ok) { const t = await res.text(); console.error('API error', url, t); throw new Error(t); }
  return res.status === 204 ? null : res.json();
}

function sessionId() {
  let sid = localStorage.getItem('lf_session_id');
  if (!sid) { sid = 'sess_' + Math.random().toString(36).slice(2) + Date.now(); localStorage.setItem('lf_session_id', sid); }
  return sid;
}

const NOTIF_ICON = k => ICONS[k] || ICONS.bell;

// ── RESTORE LOGIN STATE FROM THE SERVER (not just localStorage) ──
async function restoreServerSession() {
  try {
    const check = await api('auth', { action: 'check' });
    if (check.loggedIn) {
      currentMerchant = getBrand(check.merchantId);
      saveSession();
      const isAdmin = check.isAdmin;
      document.getElementById('merchant-btn').innerHTML = ICONS[isAdmin ? 'key' : 'store'] + ' ' + (isAdmin ? 'Admin' : currentMerchant.name);
      document.getElementById('merchant-btn').classList.add('logged-in');
      if (isAdmin) document.getElementById('merchant-btn').style.background = 'linear-gradient(135deg,#c8a96e,#f0d9a8)';
      document.getElementById('merch-notif-wrap').classList.add('visible');
    } else {
      currentMerchant = null;
    }
  } catch (e) { /* backend offline — leave whatever localStorage had */ }
}

// ── LOAD EVERYTHING FROM THE DATABASE, THEN RE-RENDER ──
async function loadAllData() {
  await restoreServerSession();
  try {
    BRANDS = await api('brands');
    PRODUCTS = (await api('products')).map(p => ({ ...p, id: Number(p.id) }));
    orders = (await api('orders')).map(o => ({
      ...o,
      items: o.items.map(i => ({ ...i, id: Number(i.product_id), qty: Number(i.qty), price: isNaN(i.price) ? i.price : Number(i.price) }))
    }));
    reviews = (await api('reviews')).map(r => ({ ...r, productId: Number(r.product_id), merchantReply: r.merchant_reply }));
    TESTIMONIALS = await api('testimonials');
    TESTIMONIAL_REQUESTS = currentMerchant ? await api('testimonial_requests', { query: { brand: currentMerchant.id } }) : [];
    const dbEvents = await api('events', { query: { session: sessionId() } });
    events = dbEvents.map(e => ({
      id: e.id, brandId: e.brand_id, title: e.title, date: e.event_date, time: e.event_time,
      location: e.location, desc: e.description, img: e.img, postedAt: e.posted_at
    }));
    dbEvents.forEach(e => localStorage.setItem('ev_int_' + e.id, e.interested ? '1' : '0'));
    PENDING_IMAGES = (currentMerchant && currentMerchant.id === 'lostandfound') ? await api('pending_images') : [];
    customerNotifs = (await api('notifications', { query: { audience: 'customer' } })).map(mapNotif);
    if (currentMerchant) {
      merchantNotifs = (await api('notifications', { query: { audience: 'merchant' } })).map(mapNotif);
    }
    const settings = await api('settings');
    applyDbSiteImages(settings);

    persist();
    renderHome();
    renderOrders();
    updateCartUI();
    renderNotifs();
    if (document.getElementById('page-merchant')?.classList.contains('active') && currentMerchant) renderMerchantDash();
    if (document.getElementById('page-catalog')?.classList.contains('active')) renderBrandGrid();
    if (document.getElementById('page-events')?.classList.contains('active')) renderEventsPage();
  } catch (e) {
    console.error('Could not reach backend (api.php). Falling back to local demo data.', e);
  }
}

function mapNotif(n) {
  return { icon: NOTIF_ICON(n.icon), text: n.text, time: new Date(n.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }), read: !!Number(n.is_read), target: n.target, _id: n.id };
}

function applyDbSiteImages(s) {
  if (s.hero_bg) { const bg = document.querySelector('.home-hero-bg'); if (bg) bg.style.backgroundImage = `url('${s.hero_bg}')`; }
  if (s.mascot_bg) { const m = document.getElementById('hero-mascot'); if (m) { m.src = s.mascot_bg; m.style.display = 'block'; } }
  if (s.logo_bg) { const l = document.querySelector('.topbar-brand img'); if (l) { l.src = s.logo_bg; l.style.display = 'block'; } }
  if (s.arrivals_bg) { const bg = document.querySelector('.arrivals-banner-bg'); if (bg) bg.style.backgroundImage = `url('${s.arrivals_bg}')`; }
  if (s.events_bg) { const bg = document.querySelector('.events-banner-bg'); if (bg) bg.style.backgroundImage = `url('${s.events_bg}')`; }
  const slides = document.querySelectorAll('.carousel-slide .cs-bg');
  for (let i = 0; i < 4; i++) { if (s['carousel_' + i] && slides[i]) slides[i].style.backgroundImage = `url('${s['carousel_' + i]}')`; }
}

document.addEventListener('DOMContentLoaded', () => setTimeout(loadAllData, 50));

// ============================================================
// OVERRIDES — same function names as lostandfound.js, redefined
// here (loads after, so these win) to talk to the API with real
// session auth instead of trusting client-claimed IDs.
// ============================================================

// ---------- PRODUCTS ----------
async function saveProduct() {
  const idVal = document.getElementById('pm-id').value;
  const id = idVal ? parseInt(idVal) : null;
  const name = document.getElementById('pm-name').value.trim();
  const priceRaw = document.getElementById('pm-price').value.trim();
  const originalPriceRaw = document.getElementById('pm-original-price').value.trim();
  const tag = document.getElementById('pm-tag').value.trim();
  const size = document.getElementById('pm-size').value.trim();
  const stock = parseInt(document.getElementById('pm-stock').value) || 0;
  const urlInput = document.getElementById('pm-img').value.trim();
  if (urlInput && !pmImgs.includes(urlInput)) pmImgs.push(urlInput);
  const imgs = pmImgs.length ? pmImgs : [];
  const img = imgs[0] || '';
  if (!name || !priceRaw || !tag || !size) { toast('Fill all required fields (*)', 'error'); return; }
  try {
    if (id) {
      await api('products', { method: 'PUT', id, body: { name, price: priceRaw, originalPrice: originalPriceRaw, tag, size, img, imgs, stock } });
      toast('Product updated!', 'success');
    } else {
      await api('products', { method: 'POST', body: { brand: currentMerchant.id, name, price: priceRaw, originalPrice: originalPriceRaw, tag, size, img, imgs, stock, new: true } });
      toast('Product added!', 'success');
    }
    await loadAllData();
    closeProductModal();
    renderMerchantDash();
  } catch (e) { toast('Could not save product — you may need to log in again', 'error'); }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try { await api('products', { method: 'DELETE', id }); await loadAllData(); renderMerchantDash(); toast('Product deleted'); }
  catch (e) { toast('Could not delete — you may need to log in again', 'error'); }
}

async function adjustStock(id) {
  const p = getProduct(id); if (!p) return;
  const v = prompt(`Stock for "${p.name}" (current: ${p.stock || 0}):`, p.stock || 0);
  if (v === null || isNaN(parseInt(v))) return;
  try {
    await api('products', { method: 'PUT', id, action: 'stock', body: { stock: Math.max(0, parseInt(v)) } });
    await loadAllData(); renderMerchantDash(); toast('Stock updated!', 'success');
  } catch (e) { toast('Could not update stock', 'error'); }
}

// ---------- ORDERS ----------
async function placeOrder() {
  if (!selPayMethod) { toast('Please select a payment method', 'error'); return; }
  const name = document.getElementById('pay-name').value.trim() || 'Customer';
  const email = document.getElementById('pay-email').value.trim() || 'customer@email.com';
  const phone = document.getElementById('pay-phone').value.trim();
  const address = document.getElementById('pay-address').value.trim();
  const sourceItems = buyNowItem ? [buyNowItem] : cart;
  const orderItems = sourceItems.map(i => { const p = getProduct(i.productId); return p ? { ...p, qty: i.qty, id: p.id } : null; }).filter(Boolean);
  const sub = orderItems.reduce((s, i) => s + (isNaN(i.price) ? 0 : i.price) * i.qty, 0);
  const total = sub + shippingFee;
  try {
    const r = await api('orders', { method: 'POST', body: { customer: name, email, phone, address, payMethod: selPayMethod, subtotal: sub, shippingFee, total, items: orderItems } });
    if (!buyNowItem) { cart = []; updateCartUI(); }
    buyNowItem = null;
    await loadAllData();
    closeCheckout();
    document.getElementById('conf-order-id').textContent = r.id;
    document.getElementById('conf-email').textContent = email;
    document.getElementById('conf-items').innerHTML = orderItems.map(i => `<div style="display:flex;justify-content:space-between;padding:.35rem 0"><span>${i.name} ×${i.qty}</span><span>${fmtMoney(i.price * i.qty)}</span></div>`).join('');
    document.getElementById('conf-total').textContent = 'Total: ' + fmtMoney(total);
    document.getElementById('confirm-modal').classList.add('on');
    openA11yPanel(document.querySelector('.confirm-card'));
    toast('Order placed!', 'success');
  } catch (e) { toast('Could not place order — check the backend', 'error'); }
}

async function updateOrderStatus(orderId, status) {
  try { await api('orders', { method: 'PUT', id: orderId, action: 'status', body: { status } }); await loadAllData(); toast('Status updated: ' + status, 'success'); renderMerchantDash(); }
  catch (e) { toast('Could not update order — you may need to log in again', 'error'); }
}

async function sendMerchantMsg(orderId) {
  const ti = document.getElementById('ti-' + orderId);
  const mi = document.getElementById('mi-' + orderId);
  const tn = ti?.value.trim(), msg = mi?.value.trim();
  if (!msg && !tn) { toast('Enter a message or tracking number', 'error'); return; }
  try {
    await api('orders', { method: 'POST', id: orderId, action: 'message', body: { role: 'merchant', text: msg || ('Tracking: ' + tn), trackingNumber: tn || null } });
    if (mi) mi.value = '';
    await loadAllData();
    toast('Message sent!', 'success');
    renderMerchantDash();
  } catch (e) { toast('Could not send message', 'error'); }
}

function reorderItems(orderId) {
  const o = orders.find(x => x.id === orderId); if (!o) return;
  let added = 0;
  o.items.forEach(item => {
    const p = getProduct(item.id || item.productId || item.product_id);
    if (p && p.stock > 0) {
      const ex = cart.find(i => i.productId == p.id);
      const curQty = ex ? ex.qty : 0;
      if (curQty + 1 > p.stock) return;
      if (ex) ex.qty++; else cart.push({ productId: p.id, qty: 1 });
      added++;
    }
  });
  persist(); updateCartUI();
  if (added) { toast(added + ' item(s) added to cart!', 'success'); openCart(); } else toast('All items are out of stock', 'error');
}

// ---------- REVIEWS ----------
async function submitReview() {
  const pid = parseInt(document.getElementById('rm-pid').value);
  const rid = document.getElementById('rm-rid').value;
  const text = document.getElementById('rm-text').value.trim();
  if (!reviewStar) { toast('Please select a star rating', 'error'); return; }
  if (!text) { toast('Please write a review', 'error'); return; }
  try {
    if (rid) {
      await api('reviews', { method: 'PUT', id: rid, body: { rating: reviewStar, text, img: reviewImgData } });
      toast('Review updated!', 'success');
    } else {
      await api('reviews', { method: 'POST', body: { productId: pid, author: 'You', rating: reviewStar, text, img: reviewImgData } });
      toast('Review submitted!', 'success');
    }
    await loadAllData();
    closeReviewModal();
    openProductDetail(pid);
  } catch (e) { toast('Could not save review', 'error'); }
}

async function deleteReview(reviewId, productId) {
  if (!confirm('Delete this review?')) return;
  try { await api('reviews', { method: 'DELETE', id: reviewId }); await loadAllData(); toast('Review deleted'); openProductDetail(productId); }
  catch (e) { toast('Could not delete review', 'error'); }
}

async function submitMerchantReply(reviewId, btn) {
  const area = btn.closest('.review-respond-area');
  const txt = area?.querySelector('textarea')?.value.trim();
  if (!txt) { toast('Enter a reply', 'error'); return; }
  try { await api('reviews', { method: 'PUT', id: reviewId, action: 'reply', body: { reply: txt } }); await loadAllData(); toast('Reply submitted!', 'success'); renderMerchantDash(); }
  catch (e) { toast('Could not save reply — you may need to log in again', 'error'); }
}

// ---------- TESTIMONIALS ----------
async function submitTestimonialRequest() {
  const name = document.getElementById('tr-name').value.trim();
  const loc = document.getElementById('tr-loc').value.trim();
  const rating = parseInt(document.getElementById('tr-rating').value);
  const text = document.getElementById('tr-text').value.trim();
  if (!name || !loc || !text) { toast('Fill all required fields', 'error'); return; }
  try {
    await api('testimonial_requests', { method: 'POST', body: { brandId: currentMerchant.id, brandName: currentMerchant.name, name, location: loc, rating, text } });
    toast('Testimonial request submitted! Waiting for admin approval.', 'success');
    ['tr-name', 'tr-loc', 'tr-text'].forEach(id => document.getElementById(id).value = '');
    await loadAllData();
    renderMerchTestimRequestsList();
  } catch (e) { toast('Could not submit request', 'error'); }
}

async function approveTestimonialRequest(reqId) {
  try { await api('testimonial_requests', { method: 'PUT', id: reqId, action: 'approve' }); await loadAllData(); toast('Testimonial approved and added to homepage!', 'success'); renderFeedbackPanel(); renderHome(); }
  catch (e) { toast('Could not approve — admin login required', 'error'); }
}
async function rejectTestimonialRequest(reqId) {
  try { await api('testimonial_requests', { method: 'PUT', id: reqId, action: 'reject' }); await loadAllData(); toast('Request rejected', 'error'); renderFeedbackPanel(); }
  catch (e) { toast('Could not reject — admin login required', 'error'); }
}
async function adminAddTestimonial() {
  const name = document.getElementById('at-name').value.trim();
  const loc = document.getElementById('at-loc').value.trim();
  const rating = parseInt(document.getElementById('at-rating').value);
  const text = document.getElementById('at-text').value.trim();
  if (!name || !loc || !text) { toast('Fill all required fields', 'error'); return; }
  try {
    await api('testimonials', { method: 'POST', body: { name, location: loc, rating, text } });
    toast('Testimonial added to homepage!', 'success');
    ['at-name', 'at-loc', 'at-text'].forEach(id => document.getElementById(id).value = '');
    await loadAllData(); renderFeedbackPanel(); renderHome();
  } catch (e) { toast('Could not add testimonial — admin login required', 'error'); }
}
async function deleteTestimonial(id) {
  if (!confirm('Remove this testimonial from the homepage?')) return;
  try { await api('testimonials', { method: 'DELETE', id }); await loadAllData(); toast('Testimonial removed'); renderFeedbackPanel(); renderHome(); }
  catch (e) { toast('Could not remove testimonial — admin login required', 'error'); }
}

// ---------- EVENTS ----------
async function saveEvent() {
  if (!currentMerchant) return;
  const title = document.getElementById('ev-title').value.trim();
  const date = document.getElementById('ev-date').value;
  const time = document.getElementById('ev-time').value.trim();
  const location = document.getElementById('ev-location').value.trim();
  const desc = document.getElementById('ev-desc').value.trim();
  const img = document.getElementById('ev-img').value.trim();
  if (!title || !date || !location) { toast('Fill in Title, Date, and Location', 'error'); return; }
  try {
    await api('events', { method: 'POST', body: { brandId: currentMerchant.id, title, date, time, location, desc, img } });
    ['ev-title', 'ev-date', 'ev-time', 'ev-location', 'ev-desc', 'ev-img'].forEach(id => { document.getElementById(id).value = ''; });
    toast('Event posted!', 'success');
    await loadAllData();
    renderMerchEventsPanel();
  } catch (e) { toast('Could not post event', 'error'); }
}
async function deleteEvent(evId) {
  if (!confirm('Delete this event?')) return;
  try { await api('events', { method: 'DELETE', id: evId }); await loadAllData(); toast('Event deleted'); renderMerchEventsPanel(); }
  catch (e) { toast('Could not delete event — you may need to log in again', 'error'); }
}

async function toggleInterestFor(evId) {
  try { const r = await api('event_interests', { method: 'POST', body: { eventId: evId, sessionId: sessionId() } }); return r.interested; }
  catch (e) { toast('Could not save', 'error'); return null; }
}
async function toggleInterested(evId, btn) {
  const on = await toggleInterestFor(evId); if (on === null) return;
  btn.classList.toggle('on', on);
  btn.innerHTML = on ? ICONS.star + ' Interested' : 'Interested';
  toast(on ? 'Marked as interested!' : 'Removed interest', on ? 'success' : '');
}
async function toggleInterestedFromCard(evId, btn) {
  const on = await toggleInterestFor(evId); if (on === null) return;
  btn.innerHTML = ICONS.star + ' Interested';
  btn.style.background = on ? 'var(--accent)' : 'none';
  btn.style.color = on ? 'var(--black)' : 'var(--g4)';
  btn.style.borderColor = on ? 'var(--accent)' : 'var(--g2)';
  toast(on ? 'Marked as interested!' : 'Removed interest', on ? 'success' : '');
}
async function toggleInterestedModal() {
  if (!currentEventDetailId) return;
  const on = await toggleInterestFor(currentEventDetailId); if (on === null) return;
  const btn = document.getElementById('edm-interest-btn');
  btn.innerHTML = on ? ICONS.star + ' Interested' : 'Mark as Interested';
  btn.style.background = on ? 'var(--black)' : 'var(--accent)';
  btn.style.color = on ? '#fff' : 'var(--black)';
  toast(on ? 'Marked as interested!' : 'Removed interest', on ? 'success' : '');
  renderEventsPage();
}

// ---------- PENDING IMAGE APPROVALS ----------
async function submitForApproval(type, imageData, targetIndex, label) {
  if (!currentMerchant) return;
  try {
    await api('pending_images', { method: 'POST', body: { merchantId: currentMerchant.id, merchantName: currentMerchant.name, type, imageData, targetIndex, label } });
    toast('Image submitted — waiting for admin approval', 'success');
    await loadAllData();
  } catch (e) { toast('Could not submit image', 'error'); }
}
async function approveImage(imgId) {
  try { await api('pending_images', { method: 'PUT', id: imgId, action: 'approve' }); await loadAllData(); toast('Image approved and live', 'success'); renderImageApprovals(); }
  catch (e) { toast('Could not approve — admin login required', 'error'); }
}
async function rejectImage(imgId) {
  try { await api('pending_images', { method: 'PUT', id: imgId, action: 'reject' }); await loadAllData(); toast('Image rejected', 'error'); renderImageApprovals(); }
  catch (e) { toast('Could not reject — admin login required', 'error'); }
}

// ---------- SITE IMAGES (admin) ----------
function fileToDataUrl(input) { return new Promise((res, rej) => { const f = input.files[0]; if (!f) return rej(); const r = new FileReader(); r.onload = e => res(e.target.result); r.readAsDataURL(f); }); }

async function adminUploadHero(input) {
  const data = await fileToDataUrl(input).catch(() => null); if (!data) return;
  if (currentMerchant?.id === 'lostandfound') { await api('settings', { method: 'PUT', body: { key: 'hero_bg', value: data } }); await loadAllData(); toast('Hero background updated!', 'success'); }
  else submitForApproval('hero', data, null, 'Hero Background');
}
async function adminUploadMascot(input) {
  const data = await fileToDataUrl(input).catch(() => null); if (!data) return;
  try { await api('settings', { method: 'PUT', body: { key: 'mascot_bg', value: data } }); await loadAllData(); toast('Mascot updated!', 'success'); }
  catch (e) { toast('Admin login required', 'error'); }
}
async function adminUploadLogo(input) {
  const data = await fileToDataUrl(input).catch(() => null); if (!data) return;
  try { await api('settings', { method: 'PUT', body: { key: 'logo_bg', value: data } }); await loadAllData(); toast('Logo updated!', 'success'); }
  catch (e) { toast('Admin login required', 'error'); }
}
async function adminUploadCarousel(input, slideIdx) {
  const data = await fileToDataUrl(input).catch(() => null); if (!data) return;
  if (currentMerchant?.id === 'lostandfound') { await api('settings', { method: 'PUT', body: { key: 'carousel_' + slideIdx, value: data } }); await loadAllData(); toast('Carousel slide ' + (slideIdx + 1) + ' updated!', 'success'); }
  else submitForApproval('carousel', data, slideIdx, 'Carousel Slide ' + (slideIdx + 1));
}
async function adminUploadArrivalsBanner(input) {
  const data = await fileToDataUrl(input).catch(() => null); if (!data) return;
  if (currentMerchant?.id === 'lostandfound') { await api('settings', { method: 'PUT', body: { key: 'arrivals_bg', value: data } }); await loadAllData(); toast('Arrivals banner updated!', 'success'); }
  else submitForApproval('arrivals', data, null, 'Arrivals Banner');
}
async function adminUploadEventsBanner(input) {
  const data = await fileToDataUrl(input).catch(() => null); if (!data) return;
  if (currentMerchant?.id === 'lostandfound') { await api('settings', { method: 'PUT', body: { key: 'events_bg', value: data } }); await loadAllData(); toast('Events banner updated!', 'success'); }
  else submitForApproval('events', data, null, 'Events Banner');
}
async function adminResetAllImages() {
  if (!confirm('Reset ALL custom images back to defaults?')) return;
  try { await api('settings', { method: 'DELETE' }); toast('All images reset to defaults. Reloading...', 'success'); setTimeout(() => location.reload(), 1200); }
  catch (e) { toast('Admin login required', 'error'); }
}

// ---------- BRANDS ----------
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
  if (BRANDS.find(b => b.id === id)) { toast('Brand ID already exists! Use a different ID.', 'error'); return; }
  try {
    await api('brands', { method: 'POST', body: { id, name, tag, desc, location: loc, year, instagram: ig, password: pass } });
    toast('Brand "' + name + '" added! They can now log in with password: ' + pass, 'success');
    ['nb-id', 'nb-name', 'nb-loc', 'nb-year', 'nb-ig', 'nb-desc'].forEach(x => document.getElementById(x).value = '');
    document.getElementById('nb-pass').value = '';
    await loadAllData();
    renderAdminBrandsList();
  } catch (e) { toast('Could not add brand — admin login required', 'error'); }
}
async function adminDeleteBrand(brandId) {
  const b = getBrand(brandId);
  if (!confirm('Delete brand "' + b.name + '"? This will also remove all their products!')) return;
  try { await api('brands', { method: 'DELETE', id: brandId }); await loadAllData(); toast('Brand deleted', 'success'); renderAdminBrandsList(); }
  catch (e) { toast('Could not delete brand — admin login required', 'error'); }
}
async function saveBrand() {
  const name = document.getElementById('bm-name').value.trim();
  const tag = document.getElementById('bm-tag').value.trim();
  const desc = document.getElementById('bm-desc').value.trim();
  const loc = document.getElementById('bm-loc').value.trim();
  const year = document.getElementById('bm-year').value.trim();
  const ig = document.getElementById('bm-ig').value.trim();
  const img = document.getElementById('bm-img').value.trim();
  try {
    await api('brands', { method: 'PUT', id: currentMerchant.id, body: { name, tag, desc, location: loc, year, instagram: ig, img } });
    await loadAllData();
    currentMerchant = getBrand(currentMerchant.id); saveSession();
    toast('Brand updated!', 'success');
    closeBrandModal();
    renderMerchantDash();
  } catch (e) { toast('Could not update brand', 'error'); }
}
async function saveBrandDesc(brandId) {
  const txt = document.getElementById('brand-desc-ta').value.trim();
  try {
    await api('brands', { method: 'PUT', id: brandId, body: { ...getBrand(brandId), desc: txt } });
    await loadAllData();
    if (currentMerchant && currentMerchant.id === brandId) { currentMerchant.desc = txt; saveSession(); }
    toast('Description updated!', 'success');
    showBrand(brandId);
  } catch (e) { toast('Could not update description', 'error'); }
}

// ---------- AUTH ----------
async function merchantLogin() {
  document.getElementById('mm-error').style.display = 'none';
  if (currentLoginRole === 'admin') {
    const user = document.getElementById('mm-admin-user').value.trim();
    const pass = document.getElementById('mm-admin-pass').value;
    try {
      const r = await api('auth', { method: 'POST', action: 'admin_login', body: { username: user, password: pass } });
      if (!r.ok) throw 0;
    } catch (e) { document.getElementById('mm-error').style.display = 'block'; return; }
    currentMerchant = getBrand('lostandfound');
    saveSession();
    document.getElementById('merchant-btn').innerHTML = ICONS.key + ' Admin';
    document.getElementById('merchant-btn').classList.add('logged-in');
    document.getElementById('merchant-btn').style.background = 'linear-gradient(135deg,#c8a96e,#f0d9a8)';
    document.getElementById('merch-notif-wrap').classList.add('visible');
    closeMerchantModal(); navigateTo('merchant');
    toast('Admin access granted!', 'success');
  } else {
    const brandId = document.getElementById('mm-brand-select').value;
    const pass = document.getElementById('mm-pass').value;
    try {
      const r = await api('auth', { method: 'POST', action: 'merchant_login', body: { brandId, password: pass } });
      if (!r.ok) throw 0;
    } catch (e) { document.getElementById('mm-error').style.display = 'block'; return; }
    currentMerchant = getBrand(brandId);
    saveSession();
    document.getElementById('merchant-btn').innerHTML = ICONS.store + ' ' + currentMerchant.name;
    document.getElementById('merchant-btn').classList.add('logged-in');
    document.getElementById('merchant-btn').style.background = '';
    document.getElementById('merch-notif-wrap').classList.add('visible');
    closeMerchantModal(); navigateTo('merchant');
    toast('Welcome back, ' + currentMerchant.name + '!', 'success');
  }
  await loadAllData();
}

async function merchantLogout() {
  try { await api('auth', { method: 'POST', action: 'logout' }); } catch (e) {}
  currentMerchant = null;
  saveSession();
  document.getElementById('merchant-btn').innerHTML = ICONS.user + ' Merchant';
  document.getElementById('merchant-btn').classList.remove('logged-in');
  document.getElementById('merchant-btn').style.background = '';
  document.getElementById('merch-notif-wrap').classList.remove('visible');
  navigateTo('home');
  toast('Logged out');
}

async function saveMerchantPassword() {
  if (!currentMerchant || currentMerchant.id === 'lostandfound') return;
  const cur = document.getElementById('sec-cur').value;
  const nw = document.getElementById('sec-new').value;
  const conf = document.getElementById('sec-confirm').value;
  const errEl = document.getElementById('sec-error');
  if (nw.length < 4) { errEl.textContent = 'New password must be at least 4 characters.'; errEl.style.display = 'block'; return; }
  if (nw !== conf) { errEl.textContent = 'Passwords do not match.'; errEl.style.display = 'block'; return; }
  try {
    const r = await api('auth', { method: 'POST', action: 'change_password', body: { currentPassword: cur, newPassword: nw } });
    if (!r.ok) { errEl.textContent = r.error || 'Current password is incorrect.'; errEl.style.display = 'block'; return; }
    errEl.style.display = 'none';
    ['sec-cur', 'sec-new', 'sec-confirm'].forEach(id => document.getElementById(id).value = '');
    toast('Password updated successfully!', 'success');
  } catch (e) { errEl.textContent = 'Could not update password.'; errEl.style.display = 'block'; }
}

// ---------- NOTIFICATIONS ----------
async function handleNotifClick(type, idx) {
  const notifs = type === 'customer' ? customerNotifs : merchantNotifs;
  const n = notifs[idx];
  if (!n) return;
  n.read = true;
  try { if (n._id) await api('notifications', { method: 'PUT', id: n._id }); } catch (e) {}
  renderNotifs(); closeAllDropdowns();
  if (n.target === 'orders') navigateTo('orders');
  else if (n.target === 'orders-merch' && currentMerchant) navigateTo('merchant');
  else if (n.target === 'catalog') navigateTo('catalog');
}
async function clearNotifs(type) {
  try { await api('notifications', { method: 'DELETE', query: { audience: type } }); } catch (e) {}
  if (type === 'customer') customerNotifs = []; else merchantNotifs = [];
  renderNotifs(); closeAllDropdowns();
}

// ---------- FEEDBACK ----------
async function submitFeedback() {
  const name = document.getElementById('fb-name').value.trim();
  const msg = document.getElementById('fb-msg').value.trim();
  const type = document.getElementById('fb-type').value;
  if (!name) { toast('Please enter your name', 'error'); document.getElementById('fb-name').focus(); return; }
  if (!msg) { toast('Please write a message', 'error'); document.getElementById('fb-msg').focus(); return; }
  try {
    await api('feedback', { method: 'POST', body: { name, type, msg } });
    toast('Feedback sent! Thank you ' + name, 'success');
    closeFeedback();
  } catch (e) { toast('Could not send feedback', 'error'); }
}
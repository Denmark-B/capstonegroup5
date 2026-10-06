const SHIPPING_RATES={lipa:{label:'Lipa City, Batangas',fee:110,days:4},batangas_city:{label:'Batangas City',fee:120,days:4},santo_tomas:{label:'Santo Tomas, Batangas',fee:110,days:4},tanauan:{label:'Tanauan, Batangas',fee:110,days:4},rosario:{label:'Rosario, Batangas',fee:120,days:4},bauan:{label:'Bauan, Batangas',fee:120,days:4},san_jose:{label:'San Jose, Batangas',fee:120,days:4},nasugbu:{label:'Nasugbu, Batangas',fee:130,days:5},other_batangas:{label:'Other Batangas Towns',fee:130,days:5},lucena:{label:'Lucena City, Quezon',fee:105,days:1},quezon_province:{label:'Quezon Province (other)',fee:130,days:3},laguna:{label:'Laguna',fee:140,days:3},cavite:{label:'Cavite',fee:150,days:3},rizal:{label:'Rizal',fee:155,days:2},metro_manila:{label:'Metro Manila (NCR)',fee:170,days:2},luzon_south:{label:'Southern Luzon (Bicol, etc)',fee:200,days:5},luzon_north:{label:'Northern Luzon',fee:220,days:6},visayas:{label:'Visayas',fee:270,days:7},mindanao:{label:'Mindanao',fee:290,days:8}};

const DEFAULT_BRANDS=[
  {id:'lostandfound',name:'Lost & Found',tag:'admin',desc:'Lost & Found system administrator. Full access to all merchants, products, orders, and settings.',img:'brand pics/logolostandfound.jpg',color:'#0c0b09'},
  {id:'geckoman',name:'Geckoman',tag:'hat',desc:'Quality caps and headwear for every style. Hats only — snapbacks, buckets, truckers & more.',img:'brand pics/gecko.jpg',color:'#1a0a00',location:'Batangas',year:'2021',schedule:'Every Saturday, 8AM–5PM',instagram:'@geckoman_ph',follows:142},
  {id:'hooksnloops',name:'Hooks n Loops',tag:'crochet',desc:'Crochet items and so much more! Bags, accessories, stuffed toys & handmade creations by Batangas locals.',img:'brand pics/Hooks  Loops.jpg',color:'#0a1a0a',location:'Batangas',year:'2022',schedule:'Weekends',instagram:'@hooksnloops',follows:98},
  {id:'outhrift',name:'Outhrift',tag:'thrift',desc:'Curated vintage tees, hoodies, and streetwear at affordable prices. Hand-picked thrift finds — tshirts, hoodies, jackets & more.',img:'brand pics/outhrift.jpg',color:'#001a0a',location:'Batangas',year:'2020',schedule:'Every Weekend, 9AM–6PM',instagram:'@outhrift',follows:318},
  {id:'10thrift',name:'10 Thrift',tag:'thrift',desc:'Affordable thrift finds, hand-picked weekly from local bazaars and ukay-ukay. Tops, bottoms, outerwear & more.',img:'brand pics/10thrift.jpg',color:'#0a0a1a',location:'Batangas',year:'2020',schedule:'Every Saturday',instagram:'@10thrift',follows:187},
  {id:'chasingscents',name:'Chasing Scents',tag:'perfume',desc:'Premium perfumes and niche fragrances. Wide selection of EDP, EDT, and body mists at great prices.',img:'brand pics/chasingscents.jpg',color:'#1a001a',location:'Batangas',year:'2022',schedule:'Weekends, 10AM–5PM',instagram:'@chasingscentsph',follows:256},
  {id:'beadsunstoppable',name:'Beads Unstoppable',tag:'thrift',desc:'Beads Unstoppable — quality thrift pieces at unbeatable prices. Tops, bottoms, outerwear & more.',img:'brand pics/greatdilemma.jpg',color:'#1a1a00',location:'Batangas',year:'2022',schedule:'Sundays, 8AM–4PM',instagram:'@beadsunstoppable',follows:98},
  {id:'zero4thrift',name:'Zero4Thrift',tag:'thrift',desc:'Fresh thrift drops every week. Tops, bottoms, outerwear & more at zero-budget prices.',img:'brand pics/zero4thrift.jpg',color:'#0a0010',location:'Batangas',year:'2021',schedule:'Weekends',instagram:'@zero4thrift',follows:134},
  {id:'kriztianothrift',name:'Kriztiano Thrift',tag:'thrift',desc:'Kriztiano Thrift — your go-to for affordable pre-loved fashion finds in Batangas.',img:'brand pics/kriztianothrift.jpg',color:'#1a0800',location:'Batangas',year:'2023',schedule:'Every Weekend',instagram:'@kriztianothrift',follows:77},
  {id:'perfumesbatangas',name:'Arranged by Annita',tag:'aniknik',desc:'Arranged by Annita — beautiful handcrafted bouquets and floral arrangements for every occasion.',img:'brand pics/Perfumes Batangas by Arashi.jpg',color:'#1a000a',location:'Batangas',year:'2022',schedule:'Weekends',instagram:'@arrangedbyannita',follows:201},
  {id:'selahessentials',name:'Selah Essentials',tag:'perfume',desc:'Carefully curated essential perfumes and scents. Calm your senses with Selah.',img:'brand pics/Selah Essentials.jpg',color:'#001010',location:'Batangas',year:'2023',schedule:'Weekends',instagram:'@selahessentials',follows:88},
  {id:'thriftthread',name:'Thrift Thread',tag:'thrift',desc:'Thrift Thread — curated pre-loved fashion finds for the budget-conscious fashionista in Batangas.',img:'brand pics/Fivis Thrift.jpg',color:'#0a1000',location:'Batangas',year:'2021',schedule:'Every Weekend',instagram:'@thriftthread',follows:145},
  {id:'soltheminishop',name:'Sol The Mini Shop',tag:'aniknik',desc:'Your neighborhood anik-anik shop! Collectibles, cute finds, accessories, novelty items & lifestyle products.',img:'brand pics/soltheminishop.jpg',color:'#10001a',location:'Batangas',year:'2023',schedule:'Weekends',instagram:'@soltheminishop',follows:109},
  {id:'daveskybiker',name:'Daveskybiker 3D Printing',tag:'3dprint',desc:'3D printing services for students, schools, creators & local businesses. Powered by Bambu Lab P2S, A1 & Elegoo Centauri Carbon.',img:'brand pics/Daveskybiker 3D Printing.jpg',color:'#001020',location:'Batangas',year:'2022',schedule:'Order anytime, pickup on market days',instagram:'@daveskybiker',follows:77},
];

const DEFAULT_PRODUCTS=[
  {id:1,brand:'geckoman',name:'Bass Pro',tag:'Hat',price:699,size:'56-58cm',img:'products for gecko/BASS PRO.jfif',new:true,stock:15,views:142},
  {id:2,brand:'geckoman',name:'Dont Trip',tag:'Hat',price:645,size:'57-59cm',img:'products for gecko/DONT PIRT.jfif',new:true,stock:8,views:98},
  {id:3,brand:'geckoman',name:'Supreme',tag:'Hat',price:795,size:'Adjustable',img:'products for gecko/SUPREME.jfif',new:false,stock:14,views:76},
  {id:4,brand:'geckoman',name:'Wake N Bake',tag:'Hat',price:695,size:'Adjustable',img:'products for gecko/WAKE  N BAKE.jfif',new:true,stock:6,views:55},
  {id:5,brand:'hooksnloops',name:'Mera Mera no Mi',tag:'KeyChain',price:480,size:'12cm',img:'products for hooks/in-love-with-a-boy-so-i-crocheted-him-a-mera-mera-no-mi-v0-ags6ibjlvgug1-removebg-preview.png',new:true,stock:7,views:88},
  {id:6,brand:'hooksnloops',name:'Baby Totoro',tag:'KeyChain',price:320,size:'Adjustable',img:'products for hooks/Baby_Totoro_Keychains-removebg-preview.png',new:true,stock:5,views:72},
  {id:7,brand:'hooksnloops',name:'Mr Bean Teddy',tag:'Toy',price:250,size:'10cm',img:'products for hooks/Mr._Bean_Teddy_handmade_crochet_keychain-removebg-preview.png',new:false,stock:12,views:44},
  {id:8,brand:'outhrift',name:'Vintage Tee — Washed',tag:'Top',price:350,size:'L',img:'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=500',new:true,stock:5,views:203},
  {id:9,brand:'outhrift',name:'Oversized Hoodie',tag:'Top',price:650,size:'XL',img:'https://images.unsplash.com/photo-1556821840-3a63f15732ce?q=80&w=500',new:false,stock:12,views:87},
  {id:10,brand:'outhrift',name:'Graphic Band Tee',tag:'Top',price:280,size:'M',img:'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=500',new:true,stock:2,views:158},
  {id:11,brand:'10thrift',name:'Denim Jacket Raw',tag:'Outerwear',price:780,size:'M',img:'products for 10thrift/acme.jpg',new:false,stock:6,views:134},
  {id:12,brand:'10thrift',name:'Y2K Cargo Pants',tag:'Bottoms',price:520,size:'32',img:'products for 10thrift/loewe.jpg',new:true,stock:9,views:175},
  {id:13,brand:'10thrift',name:'Windbreaker Jacket',tag:'Outerwear',price:920,size:'L',img:'products for 10thrift/harley.jpg',new:true,stock:3,views:143},
  {id:14,brand:'chasingscents',name:'Midnight Bloom EDP',tag:'Perfume',price:850,size:'30ml',img:'https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=500',new:true,stock:20,views:310},
  {id:15,brand:'chasingscents',name:'Cedar & Oud',tag:'Perfume',price:1200,size:'50ml',img:'https://images.unsplash.com/photo-1588776814546-1ffbb74cc0b7?q=80&w=500',new:false,stock:7,views:188},
  {id:17,brand:'beadsunstoppable',name:'necklace',tag:'Top',price:480,size:'M',img:'products for beads unstoppable/6390f4de-243e-4c03-b7ab-74af4318c9b0.jfif',new:false,stock:11,views:92},
  {id:34,brand:'beadsunstoppable',name:'bracelet',tag:'Bottoms',price:580,size:'30',img:'products for beads unstoppable/necklace.jfif',new:true,stock:5,views:112},
  {id:18,brand:'zero4thrift',name:'Washed Polo Shirt',tag:'Top',price:220,size:'L',img:'products for zero4thrift/cahmps.jpg',new:true,stock:8,views:66},
  {id:19,brand:'zero4thrift',name:'Vintage Crewneck',tag:'Top',price:350,size:'M',img:'products for zero4thrift/vntg.jpg',new:false,stock:4,views:54},
  {id:20,brand:'kriztianothrift',name:'Balenciaga Polo',tag:'Top',price:380,size:'M/L',img:'products for kriztiano/balen.jfif',new:true,stock:6,views:89},
  {id:21,brand:'kriztianothrift',name:'Vintage Graphic Hoodie',tag:'Top',price:490,size:'L',img:'products for kriztiano/vntg wres.jfif',new:false,stock:4,views:67},
  {id:22,brand:'perfumesbatangas',name:'Classic Rose Bouquet',tag:'Bouquet',price:750,size:'Medium',img:'https://images.unsplash.com/photo-1487530811015-780780d13b82?q=80&w=500',new:true,stock:15,views:231},
  {id:23,brand:'perfumesbatangas',name:'Sunflower Arrangement',tag:'Bouquet',price:450,size:'Small',img:'https://images.unsplash.com/photo-1490750967868-88df5691cc4a?q=80&w=500',new:false,stock:18,views:144},
  {id:24,brand:'selahessentials',name:'Selah Rose & Musk',tag:'Perfume',price:580,size:'50ml',img:'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?q=80&w=500',new:true,stock:12,views:88},
  {id:25,brand:'selahessentials',name:'Selah Amber Collection',tag:'Perfume',price:650,size:'30ml',img:'https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=500',new:false,stock:9,views:71},
  {id:26,brand:'thriftthread',name:'Vintage Oversized Jacket',tag:'Outerwear',price:620,size:'L',img:'products for thrift thread/ae104824-0b70-468c-a40a-2e3b7d60e493.jfif',new:true,stock:4,views:101},
  {id:27,brand:'thriftthread',name:'Thrift Graphic Tee',tag:'Top',price:260,size:'M',img:'products for thrift thread/stuss.jfif',new:false,stock:8,views:74},
  {id:28,brand:'soltheminishop',name:'Enamel Pin Collection',tag:'Anik-anik',price:120,size:'One size',img:'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600',new:true,stock:30,views:177},
  {id:29,brand:'soltheminishop',name:'Mini Keychain Set',tag:'Anik-anik',price:95,size:'One size',img:'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600',new:false,stock:25,views:88},
  {id:30,brand:'soltheminishop',name:'Novelty Sticker Pack',tag:'Anik-anik',price:75,size:'One size',img:'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600',new:true,stock:40,views:112},
  {id:31,brand:'daveskybiker',name:'Custom 3D Print (Small)',tag:'3D Print',price:150,size:'Custom',img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600',new:true,stock:99,views:143},
  {id:32,brand:'daveskybiker',name:'Engineering Part Prototype',tag:'3D Print',price:350,size:'Custom',img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600',new:false,stock:99,views:88},
  {id:33,brand:'daveskybiker',name:'Custom 3D Print (Large)',tag:'3D Print',price:650,size:'Custom',img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600',new:true,stock:99,views:65},
];

// NOTE: previous versions of this file force-cleared localStorage on every
// load (wiping carts, orders, merchant edits, everything). That reset has
// been removed — data now actually persists across page loads as intended.
// If you ever want a guaranteed-fresh demo state, use the "Reset All Images"
// button (site images only) or clear site data in devtools manually.

const DEFAULT_ORDERS=[
  {id:'ORD-20240101',items:[{id:14,name:'Midnight Bloom EDP',price:850,qty:1,brand:'chasingscents',size:'30ml',img:'https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=500'},{id:28,name:'Enamel Pin Collection',price:120,qty:1,brand:'soltheminishop',size:'One size',img:'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600'}],total:1140,shippingFee:170,date:'January 15, 2026',customer:'Maria Santos',email:'maria@email.com',phone:'+63 912 345 6789',address:'123 Rizal St, Lipa City, Batangas',payMethod:'gcash',status:'delivered',trackingNumber:'JT2026011501234',messages:[{role:'merchant',text:'Your order has been packed and shipped! Tracking: JT2026011501234',time:'Jan 16, 9:00 AM'},{role:'customer',text:'Thank you! Will wait for it.',time:'Jan 16, 10:15 AM'}],timeline:{placed:'Jan 15',confirmed:'Jan 15',packed:'Jan 16',shipped:'Jan 16',delivered:'Jan 18'}},
  {id:'ORD-20240202',items:[{id:1,name:'Bass Pro',price:699,qty:1,brand:'geckoman',size:'56-58cm',img:'products for gecko/BASS PRO.jfif'}],total:620,shippingFee:170,date:'February 5, 2026',customer:'Juan dela Cruz',email:'juan@email.com',phone:'+63 998 765 4321',address:'456 Mabini Ave, Manila',payMethod:'paymaya',status:'shipped',trackingNumber:'JT2026020567890',messages:[{role:'merchant',text:'Hi! Your cap is on the way. Tracking: JT2026020567890',time:'Feb 6, 2:00 PM'}],timeline:{placed:'Feb 5',confirmed:'Feb 5',packed:'Feb 6',shipped:'Feb 6',delivered:null}},
];

const DEFAULT_REVIEWS=[
  {id:'rv1',productId:14,author:'Maria Santos',rating:5,text:'Absolutely love Midnight Bloom! The scent lasts all day and I get compliments everywhere.',img:null,date:'Jan 20, 2026',merchantReply:"Thank you so much Maria! We're so glad you love it."},
  {id:'rv2',productId:1,author:'Juan dela Cruz',rating:4,text:'Great cap, fits perfectly and the quality is solid. Very happy with my purchase from Geckoman!',img:null,date:'Feb 12, 2026',merchantReply:null},
];

let TESTIMONIALS=JSON.parse(localStorage.getItem('lf_testimonials')||'null')||[
  {id:'t1',name:'Mika Santos',location:'Lipa, Batangas',rating:5,text:'Got a gorgeous vintage tee from Outhrift — came super fast and quality was amazing! Will definitely order again.',avatar:'MS',approved:true},
  {id:'t2',name:'Jake Reyes',location:'Batangas City',rating:5,text:"The snapback from Geckoman fits perfectly. Best cap I've bought! Great quality and fast shipping.",avatar:'JR',approved:true},
  {id:'t3',name:'Camille Cruz',location:'Tanauan',rating:4,text:'Chasing Scents has the best selections. Midnight Bloom is now my everyday scent!',avatar:'CC',approved:true},
  {id:'t4',name:'Renz Villanueva',location:'Nasugbu',rating:5,text:"Sol The Mini Shop has the cutest anik-anik finds! Got a whole set of enamel pins. Supporting local Batangas brands has never been this easy!",avatar:'RV',approved:true},
];
let TESTIMONIAL_REQUESTS=JSON.parse(localStorage.getItem('lf_testim_reqs')||'[]');

const MERCHANT_ACCOUNTS={}; // passwords are checked ONLY by the server (backend/Api.php)

let BRANDS=JSON.parse(localStorage.getItem('lf_brands2')||'null')||DEFAULT_BRANDS;
let PENDING_IMAGES=JSON.parse(localStorage.getItem('lf_pending_imgs')||'[]');
function persistImgs(){localStorage.setItem('lf_pending_imgs',JSON.stringify(PENDING_IMAGES));}
function submitForApproval(type,imageData,targetIndex,label){
  if(!currentMerchant)return;
  PENDING_IMAGES.push({id:'img'+Date.now(),merchantId:currentMerchant.id,merchantName:currentMerchant.name,type,imageData,targetIndex,label,status:'pending',submittedAt:new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})});
  persistImgs();
  toast('Image submitted — waiting for admin approval','success');
  addNotif('merchant',ICONS.clock,'"'+label+'" pending admin approval',null);
}
function approveImage(imgId){
  const img=PENDING_IMAGES.find(i=>i.id===imgId);if(!img)return;
  img.status='approved';persistImgs();
  if(img.type==='carousel'){const slides=document.querySelectorAll('.carousel-slide .cs-bg');if(slides[img.targetIndex])slides[img.targetIndex].style.backgroundImage=`url('${img.imageData}')`;const s=JSON.parse(localStorage.getItem('lf_admin_carousel')||'[]');s[img.targetIndex]=img.imageData;localStorage.setItem('lf_admin_carousel',JSON.stringify(s));}
  else if(img.type==='arrivals'){const bg=document.querySelector('.arrivals-banner-bg');if(bg)bg.style.backgroundImage=`url('${img.imageData}')`;localStorage.setItem('lf_admin_arrivals_bg',img.imageData);}
  else if(img.type==='events'){const bg=document.querySelector('.events-banner-bg');if(bg)bg.style.backgroundImage=`url('${img.imageData}')`;localStorage.setItem('lf_admin_events_bg',img.imageData);}
  else if(img.type==='hero'){const bg=document.querySelector('.home-hero-bg');if(bg)bg.style.backgroundImage=`url('${img.imageData}')`;localStorage.setItem('lf_admin_hero_bg',img.imageData);}
  toast('Image approved and live','success');renderImageApprovals();
}
function rejectImage(imgId){
  const img=PENDING_IMAGES.find(i=>i.id===imgId);if(!img)return;
  img.status='rejected';persistImgs();toast('Image rejected','error');renderImageApprovals();
}
function renderImageApprovals(){
  const el=document.getElementById('admin-img-approvals-list');if(!el)return;
  const pending=PENDING_IMAGES.filter(i=>i.status==='pending');
  if(!pending.length){el.innerHTML='<div style="color:var(--g4);font-size:.875rem;padding:1rem 0">No pending image approvals.</div>';return;}
  el.innerHTML=pending.map(img=>`<div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.1rem;margin-bottom:.9rem;display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap;box-shadow:var(--shadow)"><img src="${img.imageData}" style="width:110px;height:75px;object-fit:cover;border-radius:10px;flex-shrink:0"><div style="flex:1;min-width:150px"><div style="font-weight:700;font-size:.9rem;margin-bottom:.25rem">${img.label}</div><div style="font-size:.78rem;color:var(--g4)">From: <strong>${img.merchantName}</strong> · ${img.submittedAt}</div><div style="font-size:.78rem;color:var(--g4);margin-top:.15rem">Type: ${img.type}${img.targetIndex!=null?' (slot '+(img.targetIndex+1)+')':''}</div><div style="display:flex;gap:.5rem;margin-top:.75rem"><button class="tbl-action" style="background:#dcf5eb;border-color:#076a35;color:#076a35" onclick="approveImage('${img.id}')">${ICONS.check} Approve</button><button class="tbl-action danger" onclick="rejectImage('${img.id}')">${ICONS.x} Reject</button></div></div></div>`).join('');
}
let PRODUCTS=JSON.parse(localStorage.getItem('lf_products2')||'null')||DEFAULT_PRODUCTS;
let cart=JSON.parse(localStorage.getItem('lf_cart')||'[]');
let orders=JSON.parse(localStorage.getItem('lf_orders2')||'null')||DEFAULT_ORDERS;
let reviews=JSON.parse(localStorage.getItem('lf_reviews2')||'null')||DEFAULT_REVIEWS;
let recentlyViewed=JSON.parse(localStorage.getItem('lf_rv')||'[]');
let browseHistory=JSON.parse(localStorage.getItem('lf_browse')||'[]');
let customerNotifs=JSON.parse(localStorage.getItem('lf_cnotifs')||'[]');
let merchantNotifs=JSON.parse(localStorage.getItem('lf_mnotifs')||'[]');
let currentMerchant=null,shippingFee=0,selPayMethod=null,checkoutStep=1,buyNowItem=null;
let carouselIdx=0,carouselTimer=null;
let curBrandProds=[],curPage=1,prodNewFilter='all';
let reviewStar=0,reviewImgData=null,salesChart=null;
let saleEnd=Date.now()+2*24*60*60*1000+3*3600*1000;
let activeBrandFilter='all';
let activeOrderStatusFilter='all'; // NEW: for merchant order tabs

// ── ICON LIBRARY (inline SVG, replaces emoji for a cleaner look) ──
const ICONS={
  search:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  bell:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  store:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"/></svg>',
  user:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  key:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></svg>',
  lock:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  cart:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
  package:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  clipboard:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z"/><rect x="4" y="5" width="16" height="16" rx="2"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
  clock:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  check:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><polyline points="20 6 9 17 4 12"/></svg>',
  checkCircle:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  truck:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  barChart:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
  archive:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',
  tag:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M20.59 13.41L11 3.83A2 2 0 0 0 9.59 3.17L4 3a1 1 0 0 0-1 1l.17 5.59a2 2 0 0 0 .66 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  star:'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="vertical-align:-2px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  calendar:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  message:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
  image:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  plus:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  camera:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  x:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  mapPin:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  creditCard:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
  mail:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>',
  alertTriangle:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  heart:'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="vertical-align:-2px"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>',
  lightbulb:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>',
  sparkle:'<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="vertical-align:-1px"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z"/></svg>',
  tent:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 21L12 3l8.5 18"/><path d="M12 3v18"/><path d="M6 21l6-9 6 9"/></svg>',
  qr:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-4px"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  bag:'<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2l1.5 4h9L18 2"/><path d="M3.5 6h17l-1.4 14.2a2 2 0 0 1-2 1.8H6.9a2 2 0 0 1-2-1.8z"/><line x1="9" y1="10" x2="9" y2="13"/><line x1="15" y1="10" x2="15" y2="13"/></svg>',
  partyPopper:'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 11.3L2 22l10.7-3.8"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="M11 13c1.7-1.28 3.5-1.28 5.2 0L18 15l1.5-1.5"/></svg>',
};

// ── FOCUS MANAGEMENT (accessibility) ──
// Remembers what was focused before a modal/drawer opens, moves focus
// into the panel, and restores it on close so keyboard users don't get lost.
let _focusStack=[];
function openA11yPanel(panelEl){
  if(!panelEl)return;
  _focusStack.push(document.activeElement);
  setTimeout(()=>{
    const focusable=panelEl.querySelector('input,button,select,textarea,[tabindex]:not([tabindex="-1"])');
    if(focusable)focusable.focus();
  },60);
}
function closeA11yPanel(){
  const prev=_focusStack.pop();
  if(prev&&typeof prev.focus==='function')prev.focus();
}

// ── PERSISTENT SESSION ──
(function restoreSession(){
  const saved = sessionStorage.getItem('lf_session');
  if(saved){
    try{
      const s = JSON.parse(saved);
      currentMerchant = s.merchant;
      if(currentMerchant){
        const isAdmin = currentMerchant.id==='lostandfound';
        document.getElementById('merchant-btn').innerHTML = ICONS[isAdmin?'key':'store']+' '+(isAdmin?'Admin':currentMerchant.name);
        document.getElementById('merchant-btn').classList.add('logged-in');
        if(isAdmin) document.getElementById('merchant-btn').style.background='linear-gradient(135deg,#c8a96e,#f0d9a8)';
        document.getElementById('merch-notif-wrap').classList.add('visible');
      }
    }catch(e){}
  }
})();

function saveSession(){
  sessionStorage.setItem('lf_session',JSON.stringify({merchant:currentMerchant}));
}

function persist(){localStorage.setItem('lf_testimonials',JSON.stringify(TESTIMONIALS));
localStorage.setItem('lf_testim_reqs',JSON.stringify(TESTIMONIAL_REQUESTS));localStorage.setItem('lf_brands2',JSON.stringify(BRANDS));localStorage.setItem('lf_products2',JSON.stringify(PRODUCTS));localStorage.setItem('lf_cart',JSON.stringify(cart));localStorage.setItem('lf_orders2',JSON.stringify(orders));localStorage.setItem('lf_reviews2',JSON.stringify(reviews));localStorage.setItem('lf_rv',JSON.stringify(recentlyViewed));localStorage.setItem('lf_browse',JSON.stringify(browseHistory));localStorage.setItem('lf_cnotifs',JSON.stringify(customerNotifs));localStorage.setItem('lf_mnotifs',JSON.stringify(merchantNotifs));}

function toast(msg,type=''){const icons={success:ICONS.check,error:ICONS.x,'':ICONS.bell};const el=document.getElementById('toast');document.getElementById('toast-icon').innerHTML=icons[type]||ICONS.bell;document.getElementById('toast-text').textContent=msg;el.className='toast on'+(type?' '+type:'');clearTimeout(el._t);el._t=setTimeout(()=>el.className='toast',3000);}
function fmtMoney(n){if(typeof n==='string'&&isNaN(Number(n)))return n.startsWith('₱')?n:'₱'+n;return '₱'+Number(n).toLocaleString();}
function getBrand(id){return BRANDS.find(b=>b.id===id)||{id,name:id,color:'#111',tag:'',location:'Batangas',year:'',schedule:'',instagram:'',img:'',desc:''};}
function getBrandName(id){return getBrand(id).name;}
function getProduct(id){return PRODUCTS.find(p=>p.id==id);}
function stockStatus(s){if(s<=0)return['Out of Stock','stock-out'];if(s<=5)return['Low Stock','stock-low'];return['In Stock','stock-in'];}
function nowTime(){return new Date().toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'});}
function getProductAvgRating(pid){const r=reviews.filter(rv=>rv.productId==pid);return r.length?(r.reduce((s,rv)=>s+rv.rating,0)/r.length).toFixed(1):null;}
function sortProds(arr,sv){let s=[...arr];if(sv==='price-low')s.sort((a,b)=>a.price-b.price);if(sv==='price-high')s.sort((a,b)=>b.price-a.price);if(sv==='name-az')s.sort((a,b)=>a.name.localeCompare(b.name));if(sv==='newest')s.sort((a,b)=>(b.new?1:0)-(a.new?1:0));return s;}
function showSpinner(ms=600){const s=document.getElementById('spinner');s.classList.add('on');setTimeout(()=>s.classList.remove('on'),ms);}
function brandEmoji(tag){return ICONS.tag;}

function _navigateToImpl(page){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));const el=document.getElementById('page-'+page);if(!el)return;el.classList.add('active');document.querySelectorAll('.tn-btn').forEach(b=>b.classList.remove('active'));const nav=document.querySelector(`.tn-btn[onclick*="'${page}'"]`);if(nav)nav.classList.add('active');window.scrollTo({top:0,behavior:'smooth'});closeAllDropdowns();if(page==='home')renderHome();if(page==='catalog'){renderBrandGrid();showAllBrands();}if(page==='arrivals')renderArrivals();if(page==='orders')renderOrders();if(page==='events'){renderEventsPage();}if(page==='merchant'){if(!currentMerchant){openMerchantModal();return;}document.body.classList.add('management-mode');renderMerchantDash();}else{document.body.classList.remove('management-mode');}}
function navigateTo(page){if(document.startViewTransition){document.startViewTransition(()=>_navigateToImpl(page));}else{_navigateToImpl(page);}}
function goMerchTab(tab){if(!currentMerchant){openMerchantModal();return;}navigateTo('merchant');const btn=document.querySelector('.mt-tab[data-tab="'+tab+'"]');showMerchTab(tab,btn);}
function closeAllDropdowns(){document.getElementById('notif-dropdown')?.classList.remove('open');document.getElementById('merch-notif-dropdown')?.classList.remove('open');}

function carouselGo(n){carouselIdx=n;document.getElementById('carousel-track').style.transform=`translateX(-${n*100}%)`;document.querySelectorAll('.carousel-dot').forEach((d,i)=>d.classList.toggle('active',i===n));}
function carouselMove(dir){carouselIdx=(carouselIdx+dir+4)%4;carouselGo(carouselIdx);resetCarouselTimer();}
function startCarouselTimer(){carouselTimer=setInterval(()=>carouselMove(1),5000);}
function resetCarouselTimer(){clearInterval(carouselTimer);startCarouselTimer();}
function updateCountdown(){const diff=Math.max(0,saleEnd-Date.now());const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=String(v).padStart(2,'0');};set('cd-days',Math.floor(diff/86400000));set('cd-hours',Math.floor((diff%86400000)/3600000));set('cd-mins',Math.floor((diff%3600000)/60000));set('cd-secs',Math.floor((diff%60000)/1000));}

function getFirstImg(p){return(p.imgs&&p.imgs[0])||p.img||'';}
function makeGallery(imgs,productId){
  if(!imgs||!imgs.length)imgs=[''];
  const multi=imgs.length>1;
  return`<div class="pd-gallery-wrap" id="gallery-${productId}" data-idx="0" data-imgs='${JSON.stringify(imgs)}' ontouchstart="galleryTouchStart(event,'${productId}')" ontouchend="galleryTouchEnd(event,'${productId}')"><div class="pd-img-track" id="gtrack-${productId}" style="display:flex">${imgs.map(src=>`<div style="min-width:100%;aspect-ratio:1;background:var(--g2);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;color:var(--g3)">${src?`<img src="${src}" style="width:100%;height:100%;object-fit:cover" loading="lazy">`:`<span style="transform:scale(6)">${ICONS.tag}</span>`}</div>`).join('')}</div>${multi?`<button class="pd-gallery-arrow pd-gallery-prev" onclick="galleryMove('${productId}',-1)" aria-label="Previous image">←</button><button class="pd-gallery-arrow pd-gallery-next" onclick="galleryMove('${productId}',1)" aria-label="Next image">→</button><div class="pd-img-counter" id="gcounter-${productId}">1 / ${imgs.length}</div>`:''}</div>${multi?`<div class="pd-gallery-dots" id="gdots-${productId}">${imgs.map((_,i)=>`<button class="pd-gallery-dot ${i===0?'active':''}" onclick="galleryGo('${productId}',${i})" aria-label="Image ${i+1}"></button>`).join('')}</div>`:''}`;
}
function galleryGo(pid,idx){
  const wrap=document.getElementById('gallery-'+pid);
  const track=document.getElementById('gtrack-'+pid);
  const imgs=JSON.parse(wrap.dataset.imgs);
  idx=Math.max(0,Math.min(imgs.length-1,idx));
  wrap.dataset.idx=idx;
  track.style.transform=`translateX(-${idx*100}%)`;
  document.querySelectorAll(`#gdots-${pid} .pd-gallery-dot`).forEach((d,i)=>d.classList.toggle('active',i===idx));
  const counter=document.getElementById('gcounter-'+pid);
  if(counter)counter.textContent=`${idx+1} / ${imgs.length}`;
}
function galleryMove(pid,dir){
  const wrap=document.getElementById('gallery-'+pid);
  const imgs=JSON.parse(wrap.dataset.imgs);
  galleryGo(pid,parseInt(wrap.dataset.idx)+dir);
}
let _touchStartX=0;
function galleryTouchStart(e,pid){_touchStartX=e.touches[0].clientX;}
function galleryTouchEnd(e,pid){const diff=_touchStartX-e.changedTouches[0].clientX;if(Math.abs(diff)>40)galleryMove(pid,diff>0?1:-1);}

function makeCard(p,ranked=false){const soldOut=p.stock<=0;const onSale=p.originalPrice&&parseFloat(p.originalPrice)>parseFloat(p.price);const avg=getProductAvgRating(p.id);const rank=ranked?[...PRODUCTS].sort((a,b)=>b.views-a.views).findIndex(x=>x.id===p.id)+1:0;return `<div class="product-card" onclick="openProductDetail(${p.id})" role="button" tabindex="0" aria-label="${p.name}, ${fmtMoney(p.price)}" onkeydown="if(event.key==='Enter'){openProductDetail(${p.id})}"><div class="card-img"><div class="card-badges">${soldOut?'<div class="card-soldout-badge">Sold Out</div>':(onSale?'<div class="card-sale-badge">Sale</div>':(p.new?'<div class="card-new-badge">New</div>':''))}</div>${getFirstImg(p)?`<img src="${getFirstImg(p)}" alt="${p.name}" loading="lazy">`:`<span style="z-index:1;position:relative;color:var(--g3);transform:scale(3)">${ICONS.tag}</span>`}${ranked&&rank?`<div class="trending-rank">${rank}</div>`:''}<button class="card-action-btn" onclick="event.stopPropagation();addToCart(${p.id})" title="Add to cart" aria-label="Add ${p.name} to cart" ${soldOut?'disabled':''}>${ICONS.plus}</button></div><div class="card-body"><div class="card-row"><div><div class="card-brand">${getBrandName(p.brand)}</div><div class="card-name">${p.name}</div></div><div class="card-price-wrap">${onSale?`<span class="card-price-original">${fmtMoney(p.originalPrice)}</span>`:''}<span class="card-price${onSale?' on-sale':''}">${fmtMoney(p.price)}</span></div></div>${avg?`<div class="card-avg-rating">${'★'.repeat(Math.round(parseFloat(avg)))} ${avg}</div>`:''}</div></div>`;}
function renderGrid(id,list,ranked=false){const el=document.getElementById(id);if(!el)return;el.innerHTML=list.length?list.map(p=>makeCard(p,ranked)).join(''):'<p style="color:var(--g4);font-size:.9rem;padding:1.1rem">No items found.</p>';}

function renderHome(){showSpinner(400);renderArrivalsCollage();renderMerchantsCollage();renderTrendingCollage();const sb=document.getElementById('stat-brands');if(sb)sb.textContent=BRANDS.length;const sp=document.getElementById('stat-products');if(sp)sp.textContent=PRODUCTS.length;const sn=document.getElementById('stat-new');if(sn)sn.textContent=PRODUCTS.filter(p=>p.new).length;const hb=document.getElementById('hero-brands');if(hb)hb.innerHTML=BRANDS.filter(b=>b.id!=='lostandfound').slice(0,6).map(b=>`<div class="hero-brand-pill" onclick="navigateTo('catalog');setTimeout(()=>showBrand('${b.id}'),200)"><div class="hbp-icon">${b.img?`<img src="${b.img}" alt="${b.name}" loading="lazy">`:'&nbsp;'}</div><div><div class="hbp-name">${b.name}</div><div class="hbp-tag">${b.tag}</div></div></div>`).join('');const tg=document.getElementById('testimonials-grid');if(tg)tg.innerHTML=TESTIMONIALS.filter(t=>t.approved).map(t=>`<div class="testimonial-card"><div class="t-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5-t.rating)}</div><p class="t-text">"${t.text}"</p><div class="t-author"><div class="t-avatar">${t.avatar}</div><div><div class="t-name">${t.name}</div><div class="t-location">${ICONS.mapPin} ${t.location}</div></div></div></div>`).join('');const rv=recentlyViewed.map(id=>getProduct(id)).filter(Boolean);const rvs=document.getElementById('rv-section');if(rvs)rvs.style.display=rv.length?'block':'none';renderRecentlyViewedCollage(rv);renderRecommended();
}

// ── NEW ARRIVALS: marquee ticker + full-bleed collage ──
function renderArrivalsCollage(){
  const track=document.getElementById('arrivals-marquee-track');
  if(track){
    const words=['NEW ARRIVALS','LOST & FOUND','BATANGAS FLEA MARKET'];
    let items='';
    for(let i=0;i<10;i++)items+=`<span class="amq-item">${words[i%words.length]}</span>`;
    track.innerHTML=items+items; // duplicated for a seamless loop
  }
  const el=document.getElementById('arrivals-collage');
  if(!el)return;
  const items=PRODUCTS.filter(p=>p.new).slice(0,3);
  if(!items.length){el.style.display='none';return;}
  el.style.display='flex';
  el.innerHTML=items.map(p=>`<div class="arrivals-collage-col" onclick="openProductDetail(${p.id})" role="button" tabindex="0" aria-label="View ${p.name}" onkeydown="if(event.key==='Enter'){openProductDetail(${p.id})}">
    ${getFirstImg(p)?`<img src="${getFirstImg(p)}" alt="${p.name}" loading="lazy">`:''}
    <div class="arrivals-collage-overlay"></div>
    <div class="arrivals-collage-content">
      <div class="arrivals-collage-eyebrow">${getBrandName(p.brand)}</div>
      <div class="arrivals-collage-title">${p.name}</div>
      <span class="arrivals-collage-btn">View Product</span>
    </div>
  </div>`).join('');
}

// ── OUR MERCHANTS: same full-bleed marquee + collage treatment ──
function renderMerchantsCollage(){
  const track=document.getElementById('merchants-marquee-track');
  if(track){
    const words=['OUR MERCHANTS','LOST & FOUND','BATANGAS FLEA MARKET'];
    let items='';
    for(let i=0;i<10;i++)items+=`<span class="amq-item">${words[i%words.length]}</span>`;
    track.innerHTML=items+items;
  }
  const el=document.getElementById('merchants-collage');
  if(!el)return;
  const items=BRANDS.filter(b=>b.id!=='lostandfound').slice(0,4);
  if(!items.length){el.style.display='none';return;}
  el.style.display='flex';
  const count=b=>PRODUCTS.filter(p=>p.brand===b.id).length;
  el.innerHTML=items.map(b=>`<div class="arrivals-collage-col" onclick="navigateTo('catalog');setTimeout(()=>showBrand('${b.id}'),200)" role="button" tabindex="0" aria-label="View ${b.name}" onkeydown="if(event.key==='Enter'){navigateTo('catalog');setTimeout(()=>showBrand('${b.id}'),200)}">
    ${b.img?`<img src="${b.img}" alt="${b.name}" loading="lazy">`:''}
    <div class="arrivals-collage-overlay"></div>
    <div class="arrivals-collage-content">
      <div class="arrivals-collage-eyebrow">${b.tag} · ${b.location||'Batangas'} · ${count(b)} items</div>
      <div class="arrivals-collage-title">${b.name}</div>
      <span class="arrivals-collage-btn">Visit Shop</span>
    </div>
  </div>`).join('');
}

// ── TRENDING NOW: same full-bleed marquee + collage treatment ──
function renderTrendingCollage(){
  const track=document.getElementById('trending-marquee-track');
  if(track){
    const words=['TRENDING NOW','MOST VIEWED THIS WEEK','LOST & FOUND'];
    let items='';
    for(let i=0;i<10;i++)items+=`<span class="amq-item">${words[i%words.length]}</span>`;
    track.innerHTML=items+items;
  }
  const el=document.getElementById('trending-collage');
  if(!el)return;
  const items=[...PRODUCTS].sort((a,b)=>b.views-a.views).slice(0,3);
  if(!items.length){el.style.display='none';return;}
  el.style.display='flex';
  el.innerHTML=items.map(p=>`<div class="arrivals-collage-col" onclick="openProductDetail(${p.id})" role="button" tabindex="0" aria-label="View ${p.name}" onkeydown="if(event.key==='Enter'){openProductDetail(${p.id})}">
    ${getFirstImg(p)?`<img src="${getFirstImg(p)}" alt="${p.name}" loading="lazy">`:''}
    <div class="arrivals-collage-overlay"></div>
    <div class="arrivals-collage-content">
      <div class="arrivals-collage-eyebrow">${getBrandName(p.brand)}</div>
      <div class="arrivals-collage-title">${p.name}</div>
      <span class="arrivals-collage-btn">View Product</span>
    </div>
  </div>`).join('');
}

// ── RECOMMENDATION ENGINE ──
// Scores every product the person hasn't already viewed by how often
// they've browsed that same tag/brand, weighting recent views more
// heavily than older ones. Falls back to hidden (no section shown) if
// there's not enough browse history yet to make a personal call.
// ── Shared helper: full-bleed product collage (same treatment as New Arrivals / Trending), with an optional marquee ──
function buildProductCollage(items,sectionId,marqueeId,collageId,words){
  const section=document.getElementById(sectionId);
  if(marqueeId){
    const track=document.getElementById(marqueeId);
    if(track){
      let t='';
      for(let i=0;i<10;i++)t+=`<span class="amq-item">${words[i%words.length]}</span>`;
      track.innerHTML=t+t;
    }
  }
  const el=document.getElementById(collageId);
  if(!el)return;
  if(!items.length){
    if(section)section.style.display='none';
    el.style.display='none';
    return;
  }
  if(section)section.style.display='block';
  el.style.display='flex';
  el.innerHTML=items.slice(0,3).map(p=>`<div class="arrivals-collage-col" onclick="openProductDetail(${p.id})" role="button" tabindex="0" aria-label="View ${p.name}" onkeydown="if(event.key==='Enter'){openProductDetail(${p.id})}">
    ${getFirstImg(p)?`<img src="${getFirstImg(p)}" alt="${p.name}" loading="lazy">`:''}
    <div class="arrivals-collage-overlay"></div>
    <div class="arrivals-collage-content">
      <div class="arrivals-collage-eyebrow">${getBrandName(p.brand)}</div>
      <div class="arrivals-collage-title">${p.name}</div>
      <span class="arrivals-collage-btn">View Product</span>
    </div>
  </div>`).join('');
}
function renderRecentlyViewedCollage(items){
  buildProductCollage(items,'rv-section',null,'rv-collage',[]);
}

function getRecommendedProducts(limit=8){
  if(!browseHistory.length)return[];
  const tagScore={},brandScore={};
  browseHistory.forEach((h,i)=>{
    const weight=1/(i+1); // more recent views count more
    if(h.tag)tagScore[h.tag]=(tagScore[h.tag]||0)+weight;
    if(h.brand)brandScore[h.brand]=(brandScore[h.brand]||0)+weight;
  });
  const viewedIds=new Set(browseHistory.map(h=>h.productId));
  const scored=PRODUCTS.filter(p=>!viewedIds.has(p.id)).map(p=>({
    p,
    score:(tagScore[p.tag]||0)*1.5+(brandScore[p.brand]||0)
  })).filter(x=>x.score>0);
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0,limit).map(x=>x.p);
}
function renderRecommended(){
  const recos=getRecommendedProducts(8);
  buildProductCollage(recos,'reco-section',null,'reco-collage',[]);
}

function makeBrandCard(b){const count=PRODUCTS.filter(p=>p.brand===b.id).length;return `<div class="brand-card" onclick="navigateTo('catalog');setTimeout(()=>showBrand('${b.id}'),200)" role="button" tabindex="0" aria-label="View ${b.name}" onkeydown="if(event.key==='Enter'){navigateTo('catalog');setTimeout(()=>showBrand('${b.id}'),200)}">${b.img?`<img src="${b.img}" alt="${b.name}" loading="lazy">`:`<div style="position:absolute;inset:0;background:${b.color||'#111'};display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.5)"><span style="transform:scale(2.4)">${ICONS.store}</span></div>`}<div class="brand-card-overlay"></div><div class="brand-card-content"><span class="brand-tag">${b.tag}</span><div class="brand-name">${b.name}</div><div class="brand-meta-row">${ICONS.mapPin} ${b.location||'Batangas'} · ${count} items</div></div></div>`;}

function filterBrands(tag,btn){activeBrandFilter=tag;document.querySelectorAll('#brand-grid-wrap .f-btn').forEach(b=>b.classList.remove('on'));if(btn)btn.classList.add('on');renderBrandGrid();}
function renderBrandGrid(){let arr=(activeBrandFilter==='all'?[...BRANDS]:BRANDS.filter(b=>b.tag===activeBrandFilter)).filter(b=>b.id!=='lostandfound');const sv=document.getElementById('brand-sort')?.value||'default';if(sv==='name-az')arr.sort((a,b)=>a.name.localeCompare(b.name));if(sv==='name-za')arr.sort((a,b)=>b.name.localeCompare(a.name));if(sv==='items')arr.sort((a,b)=>PRODUCTS.filter(p=>p.brand===b.id).length-PRODUCTS.filter(p=>p.brand===a.id).length);const el=document.getElementById('brand-grid');if(el)el.innerHTML=arr.map(b=>makeBrandCard(b)).join('');}
function showBrand(brandId){
  const b=getBrand(brandId);
  curBrandProds=PRODUCTS.filter(p=>p.brand===brandId);
  curPage=1;prodNewFilter='all';

  const oldStrip=document.getElementById('bsh-details-strip');
  if(oldStrip)oldStrip.remove();

  const isOwn=currentMerchant&&currentMerchant.id===brandId;

  const svgPin=ICONS.mapPin;
  const svgCal=ICONS.calendar;
  const svgIg=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`;
  const svgClock=ICONS.clock;

  const meta=[];
  if(b.location) meta.push(`${svgPin} ${b.location}`);
  if(b.schedule) meta.push(`${svgCal} ${b.schedule}`);
  if(b.instagram) meta.push(`<a href="https://instagram.com/${b.instagram.replace('@','')}" target="_blank" style="color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:.3rem">${svgIg} ${b.instagram}</a>`);
  if(b.year) meta.push(`${svgClock} Est. ${b.year}`);

  const descBlock=`
    <div style="position:relative;margin-bottom:.75rem;max-width:560px">

      <!-- Display mode -->
      <div id="brand-desc-display" style="display:flex;align-items:flex-start;gap:.6rem">
        <p style="font-size:.875rem;color:var(--g5);line-height:1.7;margin:0;padding-left:.85rem;border-left:2px solid rgba(196,144,48,.4);flex:1">
          ${b.desc||`<em style="color:var(--g3)">No description yet.</em>`}
        </p>
        ${isOwn?`
          <button onclick="editBrandDesc('${brandId}')"
            title="Edit description"
            aria-label="Edit brand description"
            style="flex-shrink:0;background:rgba(196,144,48,.1);border:1px solid rgba(196,144,48,.3);color:var(--accent);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:.75rem;display:flex;align-items:center;justify-content:center;transition:all .18s;margin-top:2px"
            onmouseover="this.style.background='rgba(196,144,48,.22)'"
            onmouseout="this.style.background='rgba(196,144,48,.1)'"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;display:inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        `:''}
      </div>

      <!-- Edit mode (hidden by default) -->
      ${isOwn?`
        <div id="brand-desc-edit" style="display:none">
          <textarea id="brand-desc-ta"
            style="width:100%;background:#fff;border:1.5px solid rgba(196,144,48,.4);color:var(--black);padding:.75rem .9rem;font-family:'Inter',sans-serif;font-size:.875rem;line-height:1.65;border-radius:10px;resize:vertical;min-height:80px;outline:none;margin-bottom:.5rem"
            placeholder="Describe your brand — what you sell, your vibe, what makes you unique..."
            onfocus="this.style.borderColor='var(--accent)'"
            onblur="this.style.borderColor='rgba(200,169,110,.4)'"
          >${b.desc||''}</textarea>
          <div style="display:flex;gap:.5rem">
            <button onclick="saveBrandDesc('${brandId}')"
              style="background:var(--accent);color:var(--black);border:none;padding:.45rem 1.1rem;font-family:'Inter',sans-serif;font-size:.8rem;font-weight:700;border-radius:20px;cursor:pointer;transition:all .18s;letter-spacing:.04em"
              onmouseover="this.style.background='var(--accent2)'"
              onmouseout="this.style.background='var(--accent)'">Save</button>
            <button onclick="document.getElementById('brand-desc-display').style.display='flex';document.getElementById('brand-desc-edit').style.display='none'"
              style="background:var(--g1);color:var(--g4);border:1px solid var(--g2);padding:.45rem .95rem;font-family:'Inter',sans-serif;font-size:.8rem;font-weight:500;border-radius:20px;cursor:pointer">Cancel</button>
          </div>
        </div>
      `:''}
    </div>
  `;

  const bsh=document.getElementById('bsh');
  bsh.classList.add('show');
  bsh.innerHTML=`
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,#f8f6f2 0%,#f0ebe3 100%);pointer-events:none"></div>
    <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(to bottom,var(--accent) 0%,rgba(196,144,48,.3) 100%)"></div>

    <div style="position:relative;display:flex;align-items:center;gap:1.6rem;padding:1.75rem 1.9rem 1.75rem 2.2rem;width:100%;flex-wrap:wrap">

      <div style="width:82px;height:82px;flex-shrink:0;border-radius:16px;overflow:hidden;border:1.5px solid rgba(255,255,255,.1);box-shadow:0 6px 28px rgba(0,0,0,.45),0 0 0 1px rgba(200,169,110,.08);background:rgba(255,255,255,.05)">
        ${b.img
          ?`<img src="${b.img}" style="width:100%;height:100%;object-fit:cover;display:block">`
          :`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--accent);transform:scale(1.8)">${ICONS.store}</div>`}
      </div>

      <div style="flex:1;min-width:200px">
        <div style="display:flex;align-items:center;gap:.65rem;flex-wrap:wrap;margin-bottom:.5rem">
          <span style="font-family:'Bebas Neue',sans-serif;font-size:2.1rem;letter-spacing:.04em;line-height:1;color:var(--black)">${b.name}</span>
          <span style="background:rgba(196,144,48,.12);color:var(--accent-ink);font-size:.68rem;font-weight:700;padding:.24rem .85rem;border-radius:20px;border:1px solid rgba(196,144,48,.3);letter-spacing:.1em;text-transform:uppercase">${curBrandProds.length} items</span>
          <span style="background:var(--g2);color:var(--g5);font-size:.67rem;font-weight:600;padding:.24rem .8rem;border-radius:20px;border:1px solid var(--g3);letter-spacing:.1em;text-transform:uppercase">${b.tag}</span>
        </div>

        <div style="height:1px;background:linear-gradient(to right,var(--g3),transparent);margin-bottom:.65rem;max-width:500px"></div>

        ${descBlock}

        ${meta.length
          ?`<div style="display:flex;flex-wrap:wrap;align-items:center;gap:0;font-size:.75rem;color:var(--g4)">
              ${meta.map((m,i)=>`
                <span style="display:inline-flex;align-items:center;gap:.3rem">${m}</span>
                ${i<meta.length-1?`<span style="margin:0 .7rem;color:rgba(255,255,255,.15)">·</span>`:''}
              `).join('')}
            </div>`
          :''}
      </div>

      <button onclick="showAllBrands()"
        style="flex-shrink:0;align-self:flex-start;background:rgba(0,0,0,.04);border:1px solid var(--g2);color:var(--g4);padding:.5rem 1.1rem;font-family:'Inter',sans-serif;font-size:.8rem;font-weight:500;border-radius:20px;cursor:pointer;transition:all .2s;white-space:nowrap;letter-spacing:.03em"
        onmouseover="this.style.background='var(--black)';this.style.color='#fff';this.style.borderColor='var(--black)'"
        onmouseout="this.style.background='rgba(0,0,0,.04)';this.style.color='var(--g4)';this.style.borderColor='var(--g2)'">
        ← All Brands
      </button>
    </div>
  `;

  document.getElementById('brand-grid-wrap').style.display='none';
  document.getElementById('brand-prods-wrap').style.display='block';
  const pd=document.getElementById('price-max-disp');if(pd)pd.textContent='₱5,000';
  const bc=document.getElementById('catalog-bc');
  if(bc)bc.innerHTML=`<a onclick="navigateTo('home')">Home</a><span>›</span><a onclick="showAllBrands()">Catalog</a><span>›</span><span>${b.name}</span>`;
  document.querySelectorAll('#brand-prods-wrap .f-btn').forEach(btn=>btn.classList.remove('on'));
  document.querySelector('#brand-prods-wrap .f-btn')?.classList.add('on');
  renderPaginatedProds(curBrandProds);
  renderBrandEvents(brandId);
}
function showAllBrands(){document.getElementById('bsh').classList.remove('show');document.getElementById('brand-grid-wrap').style.display='block';document.getElementById('brand-prods-wrap').style.display='none';const bc=document.getElementById('catalog-bc');if(bc)bc.innerHTML=`<a onclick="navigateTo('home')">Home</a><span>›</span><span>Catalog</span>`;renderBrandGrid();}
function filterProdNew(val,btn){prodNewFilter=val;document.querySelectorAll('#brand-prods-wrap .f-btn').forEach(b=>b.classList.remove('on'));if(btn)btn.classList.add('on');applyBrandProdFilters();}
function applyBrandProdFilters(){const sv=document.getElementById('prod-sort')?.value||'default';let f=prodNewFilter==='new'?curBrandProds.filter(p=>p.new):curBrandProds;curPage=1;renderPaginatedProds(sortProds(f,sv));}
const PER_PAGE=8;
function renderPaginatedProds(list){const pages=Math.ceil(list.length/PER_PAGE),start=(curPage-1)*PER_PAGE;renderGrid('brand-prods-grid',list.slice(start,start+PER_PAGE));const pg=document.getElementById('catalog-pg');if(!pg)return;if(pages<=1){pg.innerHTML='';return;}let pgHTML='';for(let i=1;i<=pages;i++)pgHTML+=`<button class="page-num ${i===curPage?'active':''}" onclick="curPage=${i};applyBrandProdFilters()">${i}</button>`;pg.innerHTML=pgHTML;}

function renderArrivals(){const sv=document.getElementById('arr-sort')?.value||'default';renderGrid('arrivals-grid',sortProds(PRODUCTS.filter(p=>p.new),sv));}

function openProductDetail(id){const p=getProduct(id);if(!p)return;p.views=(p.views||0)+1;recentlyViewed=[id,...recentlyViewed.filter(x=>x!=id)].slice(0,12);browseHistory.unshift({tag:p.tag,productId:p.id,brand:p.brand});browseHistory=browseHistory.slice(0,50);persist();const b=getBrand(p.brand);const[stLbl,stCls]=stockStatus(p.stock);const pRevs=reviews.filter(r=>r.productId==id);const avg=pRevs.length?(pRevs.reduce((s,r)=>s+r.rating,0)/pRevs.length).toFixed(1):null;const canRev=orders.some(o=>o.status==='delivered'&&o.items.some(i=>(i.id||i.productId)==id));const recs=PRODUCTS.filter(x=>x.id!=id&&(x.brand===p.brand||x.tag===p.tag)).slice(0,4);const starDist=[5,4,3,2,1].map(star=>({star,count:pRevs.filter(r=>r.rating===star).length}));document.getElementById('pd-bc-name').textContent=p.name;document.getElementById('pd-container').innerHTML=`<div class="pd-layout"><div class="pd-gallery">${makeGallery(p.imgs||[p.img],p.id)}</div><div class="pd-info"><div class="pd-brand-link" onclick="navigateTo('catalog');setTimeout(()=>showBrand('${b.id}'),200)">${ICONS.store} ${b.name}</div><h1 class="pd-title">${p.name}</h1><div class="pd-price">${fmtMoney(p.price)}</div>${avg?`<div style="color:var(--accent-ink);font-size:.9rem;margin-bottom:.6rem">${'★'.repeat(Math.round(parseFloat(avg)))} ${avg} (${pRevs.length} review${pRevs.length!==1?'s':''})</div>`:''}<span class="pd-stock card-stock-badge ${stCls}" style="margin-bottom:1.3rem;display:inline-block">${stLbl}</span><div class="pd-detail-rows"><div class="pd-detail-row"><span>Brand</span><span>${b.name}</span></div><div class="pd-detail-row"><span>Category</span><span>${p.tag}</span></div><div class="pd-detail-row"><span>Size</span><span class="size-val">${p.size}</span></div><div class="pd-detail-row"><span>Stock</span><span>${p.stock>0?p.stock+' available':'Out of stock'}</span></div><div class="pd-detail-row"><span>Views</span><span>${p.views}</span></div><div class="pd-detail-row"><span>Location</span><span>${b.location||'Batangas'}</span></div></div><button class="pd-atc-btn" onclick="addToCart(${p.id})" ${p.stock<=0?'disabled':''}>${p.stock<=0?'Out of Stock':ICONS.cart+' Add to Cart — '+fmtMoney(p.price)}</button><button class="pd-bin-btn" onclick="buyItNow(${p.id})" ${p.stock<=0?'disabled':''}>${p.stock<=0?'Unavailable':'Buy It Now'}</button><div style="background:var(--g1);border:1px solid var(--g2);border-radius:var(--r);padding:.7rem 1rem;font-size:.875rem;color:var(--g4);margin-top:.55rem">${ICONS.creditCard} Payment via <strong>GCash</strong> or <strong>PayMaya</strong> only. No Cash on Delivery.</div></div></div><div class="review-section"><h3>Customer Reviews</h3>${pRevs.length?`<div class="review-summary"><div><div class="review-big-score">${avg}</div><div style="color:var(--accent-ink);font-size:1.2rem">${'★'.repeat(Math.round(parseFloat(avg)))}</div><div style="font-size:.875rem;color:var(--g4)">${pRevs.length} reviews</div></div><div class="review-stars-bar">${starDist.map(({star,count})=>`<div class="review-star-row"><span>${star}★</span><div class="review-star-track"><div class="review-star-fill" style="width:${pRevs.length?Math.round(count/pRevs.length*100):0}%"></div></div><span>${count}</span></div>`).join('')}</div>${canRev?`<button class="review-write-btn" onclick="openReviewModal(${id},null)">Write Review</button>`:''}</div>`:`<div style="font-size:.9rem;color:var(--g4);margin-bottom:1.1rem">No reviews yet.${canRev?' Be the first!':' Purchase to leave a review.'}</div>${canRev?`<button class="review-write-btn" onclick="openReviewModal(${id},null)">Write First Review</button>`:''}`}${pRevs.map(rv=>makeReviewCard(rv)).join('')}</div>${recs.length?`<div class="pd-section-title">You Might Also Like</div><div class="recommendations-grid">${recs.map(r=>makeCard(r)).join('')}</div>`:''}`; navigateTo('product');}
function makeReviewCard(rv){return `<div class="review-card" id="rvc-${rv.id}"><div class="review-card-header"><span class="review-card-author">${rv.author}</span><span class="review-card-date">${rv.date}</span></div><div class="review-card-stars">${'★'.repeat(rv.rating)}${'☆'.repeat(5-rv.rating)}</div><div class="review-card-text">${rv.text}</div>${rv.img?`<img class="review-card-img" src="${rv.img}" alt="Review photo" onclick="window.open('${rv.img}')">`:''} ${rv.merchantReply?`<div class="review-reply"><strong>${ICONS.store} Merchant Reply:</strong> ${rv.merchantReply}</div>`:''}<div class="review-actions"><button class="review-action-btn" onclick="openReviewModal(${rv.productId},'${rv.id}')">Edit</button><button class="review-action-btn danger" onclick="deleteReview('${rv.id}',${rv.productId})">Delete</button></div></div>`;}

function buyItNow(id){const p=getProduct(id);if(!p||p.stock<=0){toast('This item is out of stock!','error');return;}buyNowItem={productId:id,qty:1};buildReceipt([buyNowItem]);checkoutStep=1;updateCheckoutStep(1);selPayMethod=null;document.querySelectorAll('.pay-method').forEach(m=>m.classList.remove('selected'));document.getElementById('pay-qr-box').classList.remove('show');const ipb=document.getElementById('i-paid-btn');if(ipb)ipb.style.display='none';document.getElementById('pay-modal').classList.add('on');openA11yPanel(document.querySelector('.pay-card'));closeCart();}

function openReviewModal(productId,reviewId){const p=getProduct(productId);if(!p)return;const ex=reviewId?reviews.find(r=>r.id===reviewId):null;document.getElementById('rm-pid').value=productId;document.getElementById('rm-rid').value=reviewId||'';document.getElementById('rm-pname').textContent=p.name;document.getElementById('rm-text').value=ex?ex.text:'';document.getElementById('rm-img-preview').innerHTML='';reviewImgData=ex?.img||null;reviewStar=ex?ex.rating:0;updateStarPicker(reviewStar);document.getElementById('review-modal').classList.add('on');openA11yPanel(document.querySelector('.review-modal-card'));}
function closeReviewModal(){document.getElementById('review-modal').classList.remove('on');closeA11yPanel();}
function setReviewStar(n){reviewStar=n;updateStarPicker(n);}
function updateStarPicker(n){document.querySelectorAll('#star-picker span').forEach((s,i)=>{s.classList.toggle('on',i<n);s.setAttribute('aria-checked',i<n?'true':'false');});}
function handleReviewImg(input){const file=input.files[0];if(!file)return;const reader=new FileReader();reader.onload=e=>{reviewImgData=e.target.result;document.getElementById('rm-img-preview').innerHTML=`<img src="${reviewImgData}" alt="preview">`;};reader.readAsDataURL(file);}
function submitReview(){const pid=parseInt(document.getElementById('rm-pid').value);const rid=document.getElementById('rm-rid').value;const text=document.getElementById('rm-text').value.trim();if(!reviewStar){toast('Please select a star rating','error');return;}if(!text){toast('Please write a review','error');return;}const p=getProduct(pid);if(rid){const rv=reviews.find(r=>r.id===rid);if(rv){rv.rating=reviewStar;rv.text=text;rv.img=reviewImgData;}toast('Review updated!','success');}else{reviews.push({id:'rv'+Date.now(),productId:pid,author:'You',rating:reviewStar,text,img:reviewImgData,date:new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}),merchantReply:null});toast('Review submitted!','success');addNotif('customer',ICONS.star,'Your review for '+(p?.name||'item')+' was submitted',null);}persist();closeReviewModal();openProductDetail(pid);}
function deleteReview(reviewId,productId){if(!confirm('Delete this review?'))return;reviews=reviews.filter(r=>r.id!==reviewId);persist();toast('Review deleted');document.getElementById('rvc-'+reviewId)?.remove();}

// FIX: cart quantity is now capped at available stock so the storefront can
// never let someone order more than a merchant actually has.
function addToCart(id){
  const p=getProduct(id);
  if(!p||p.stock<=0){toast('This item is out of stock!','error');return;}
  const ex=cart.find(i=>i.productId==id);
  const currentQty=ex?ex.qty:0;
  if(currentQty+1>p.stock){toast('Only '+p.stock+' in stock','error');return;}
  if(ex)ex.qty++;else cart.push({productId:id,qty:1});
  persist();updateCartUI();toast('Added to cart — '+p.name,'success');addNotif('customer',ICONS.cart,'Added "'+p.name+'" to cart',null);
}
function removeFromCart(id){cart=cart.filter(i=>i.productId!=id);persist();updateCartUI();}
function changeQty(id,delta){
  const i=cart.find(x=>x.productId==id);
  const p=getProduct(id);
  if(!i)return;
  let nq=i.qty+delta;
  if(p&&p.stock&&nq>p.stock){toast('Only '+p.stock+' in stock','error');nq=p.stock;}
  i.qty=Math.max(1,nq);
  persist();updateCartUI();
}
function clearCart(){if(!confirm('Remove all items?'))return;cart=[];persist();updateCartUI();}
function getCartTotal(){return cart.reduce((s,i)=>{const p=getProduct(i.productId);return s+(p?p.price*i.qty:0);},0);}
function getCartCount(){return cart.reduce((s,i)=>s+i.qty,0);}
function updateCartUI(){const total=getCartCount();const badge=document.getElementById('cart-badge');if(badge){badge.textContent=total;badge.style.opacity=total>0?'1':'0';}document.getElementById('cart-count').textContent=cart.length;const itemsEl=document.getElementById('cd-items');const summaryEl=document.getElementById('cd-summary');if(!itemsEl)return;if(!cart.length){itemsEl.innerHTML=`<div class="cd-empty"><div style="color:var(--g3)">${ICONS.bag}</div><div>Your cart is empty</div><button class="hero-cta-primary" onclick="closeCart();navigateTo('catalog')" style="margin-top:.9rem;font-size:.85rem;padding:.55rem 1.3rem">Shop Now</button></div>`;if(summaryEl)summaryEl.style.display='none';return;}if(summaryEl)summaryEl.style.display='block';itemsEl.innerHTML=cart.map(item=>{const p=getProduct(item.productId);if(!p)return '';return `<div class="cart-item"><div class="cart-item-thumb">${p.img?`<img src="${p.img}" alt="${p.name}" loading="lazy">`:ICONS.tag}</div><div class="cart-item-info"><div class="cart-item-name">${p.name}</div><div class="cart-item-brand">${getBrandName(p.brand)} · ${p.size}</div><div class="cart-item-price">${fmtMoney(p.price*item.qty)}</div><div class="qty-control"><button class="qty-btn" onclick="changeQty(${p.id},-1)" aria-label="Decrease quantity">−</button><span style="font-size:.875rem;min-width:22px;text-align:center">${item.qty}</span><button class="qty-btn" onclick="changeQty(${p.id},1)" aria-label="Increase quantity">+</button></div></div><button class="cart-item-remove" onclick="removeFromCart(${p.id})" aria-label="Remove ${p.name} from cart">✕</button></div>`;}).join('');const sub=getCartTotal();document.getElementById('cd-subtotal').textContent=fmtMoney(sub);document.getElementById('cd-total').textContent=fmtMoney(sub);}
function openCart(){document.getElementById('cart-drawer').classList.add('on');document.getElementById('cart-overlay').classList.add('on');openA11yPanel(document.getElementById('cart-drawer'));}
function closeCart(){document.getElementById('cart-drawer').classList.remove('on');document.getElementById('cart-overlay').classList.remove('on');closeA11yPanel();}

function buildReceipt(sourceItems){const ri=document.getElementById('receipt-items');if(!ri)return;ri.innerHTML=sourceItems.map(item=>{const p=getProduct(item.productId);if(!p)return '';return `<div class="receipt-item"><span>${p.name} × ${item.qty}</span><span>${fmtMoney(p.price*item.qty)}</span></div>`;}).join('');const sub=sourceItems.reduce((s,i)=>{const p=getProduct(i.productId);return s+(p?p.price*i.qty:0);},0);shippingFee=0;const pSub=document.getElementById('pay-sub');if(pSub)pSub.textContent=fmtMoney(sub);const pShip=document.getElementById('pay-ship');if(pShip)pShip.textContent='Select area first';const pTotal=document.getElementById('pay-total');if(pTotal)pTotal.textContent='—';document.getElementById('shipping-zone').value='';document.getElementById('delivery-est').style.display='none';}
function openCheckout(){if(!cart.length){toast('Cart is empty!','error');return;}buyNowItem=null;closeCart();buildReceipt(cart);checkoutStep=1;updateCheckoutStep(1);selPayMethod=null;document.querySelectorAll('.pay-method').forEach(m=>m.classList.remove('selected'));document.getElementById('pay-qr-box').classList.remove('show');const ipb=document.getElementById('i-paid-btn');if(ipb)ipb.style.display='none';document.getElementById('pay-modal').classList.add('on');openA11yPanel(document.querySelector('.pay-card'));}
function closeCheckout(){document.getElementById('pay-modal').classList.remove('on');buyNowItem=null;checkoutStep=1;updateCheckoutStep(1);selPayMethod=null;document.querySelectorAll('.pay-method').forEach(m=>m.classList.remove('selected'));closeA11yPanel();}
function updateCheckoutStep(n){checkoutStep=n;document.querySelectorAll('.pay-section').forEach((s,i)=>s.classList.toggle('active',i===n-1));document.querySelectorAll('.pay-step-btn').forEach((b,i)=>{b.classList.toggle('active',i===n-1);b.classList.toggle('done',i<n-1);});document.getElementById('pay-back').style.display=n>1?'block':'none';document.getElementById('pay-next').style.display=n===3?'none':'block';}
function checkoutBack(){if(checkoutStep>1)updateCheckoutStep(checkoutStep-1);}
function checkoutNext(){if(checkoutStep===1){if(!document.getElementById('shipping-zone').value){toast('Please select a shipping area','error');return;}updateCheckoutStep(2);}else if(checkoutStep===2){const name=document.getElementById('pay-name').value.trim();const email=document.getElementById('pay-email').value.trim();const phone=document.getElementById('pay-phone').value.trim();const addr=document.getElementById('pay-address').value.trim();if(!name||!email||!phone||!addr){toast('Please fill all required fields','error');return;}updateCheckoutStep(3);}}
function updateShippingRate(){const zone=document.getElementById('shipping-zone').value;const rate=SHIPPING_RATES[zone];if(!rate){shippingFee=0;return;}shippingFee=rate.fee;const sourceItems=buyNowItem?[buyNowItem]:cart;const sub=sourceItems.reduce((s,i)=>{const p=getProduct(i.productId);return s+(p?p.price*i.qty:0);},0);document.getElementById('pay-ship').textContent=fmtMoney(shippingFee);document.getElementById('pay-total').textContent=fmtMoney(sub+shippingFee);const estEl=document.getElementById('delivery-est');const estDate=document.getElementById('est-date');const d=new Date();d.setDate(d.getDate()+rate.days+1);estDate.textContent=d.toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric'});estEl.style.display='block';}
function selectPayMethod(el){document.querySelectorAll('.pay-method').forEach(m=>m.classList.remove('selected'));el.classList.add('selected');selPayMethod=el.dataset.method;const qrBox=document.getElementById('pay-qr-box');const sourceItems=buyNowItem?[buyNowItem]:cart;const sub=sourceItems.reduce((s,i)=>{const p=getProduct(i.productId);return s+(p?p.price*i.qty:0);},0);const total=sub+shippingFee;document.getElementById('qr-method-label').textContent=selPayMethod==='gcash'?'GCash QR Code':'PayMaya QR Code';document.getElementById('qr-amount').textContent=fmtMoney(total);generateQR();qrBox.classList.add('show');const ipb=document.getElementById('i-paid-btn');if(ipb)ipb.style.display='block';}
function generateQR(){const grid=document.getElementById('qr-pattern');if(!grid)return;const p=[1,1,1,1,1,1,1,0,1,0,1,0,0,0,0,0,1,0,0,1,1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,0,1,0,1,0,0,0,0,0,1,1,0,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,0,1,1,1,0,1,0,1,0,1,0,0,0,1,0,0];grid.innerHTML=p.map(c=>`<div class="qr-cell ${c?'':'w'}"></div>`).join('');}

// FIX: placing an order now actually decrements stock on the purchased
// products. Previously stock never changed after checkout, so "Low/Out of
// Stock" badges were disconnected from real sales.
function placeOrder(){if(!selPayMethod){toast('Please select a payment method','error');return;}const orderId='ORD-'+Date.now().toString().slice(-8);const name=document.getElementById('pay-name').value.trim()||'Customer';const email=document.getElementById('pay-email').value.trim()||'customer@email.com';const phone=document.getElementById('pay-phone').value.trim();const address=document.getElementById('pay-address').value.trim();const sourceItems=buyNowItem?[buyNowItem]:cart;const orderItems=sourceItems.map(i=>{const p=getProduct(i.productId);return p?{...p,qty:i.qty,id:p.id}:null;}).filter(Boolean);const sub=orderItems.reduce((s,i)=>s+i.price*i.qty,0);const total=sub+shippingFee;const order={id:orderId,items:orderItems,total,shippingFee,date:new Date().toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'}),customer:name,email,phone,address,payMethod:selPayMethod,status:'pending',trackingNumber:null,messages:[],timeline:{placed:new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric'}),confirmed:null,packed:null,shipped:null,delivered:null}};orders.unshift(order);orderItems.forEach(i=>{const p=getProduct(i.id);if(p)p.stock=Math.max(0,(p.stock||0)-(i.qty||1));});addNotif('customer',ICONS.package,'Order '+orderId+' placed — '+fmtMoney(total),'orders');[...new Set(orderItems.map(i=>i.brand))].forEach(bid=>{addNotif('merchant',ICONS.bag,'New order '+orderId+' from '+name+' — '+getBrandName(bid),'orders-merch');});if(!buyNowItem){cart=[];updateCartUI();}buyNowItem=null;persist();closeCheckout();document.getElementById('conf-order-id').textContent=orderId;document.getElementById('conf-email').textContent=email;document.getElementById('conf-items').innerHTML=orderItems.map(i=>`<div style="display:flex;justify-content:space-between;padding:.35rem 0"><span>${i.name} ×${i.qty}</span><span>${fmtMoney(i.price*i.qty)}</span></div>`).join('');document.getElementById('conf-total').textContent='Total: '+fmtMoney(total);document.getElementById('confirm-modal').classList.add('on');openA11yPanel(document.querySelector('.confirm-card'));toast('Order placed!','success');}
function closeConfirm(){document.getElementById('confirm-modal').classList.remove('on');closeA11yPanel();navigateTo('orders');}

function renderOrders(){const el=document.getElementById('orders-list');if(!el)return;if(!orders.length){el.innerHTML=`<div style="text-align:center;padding:4rem 2rem"><div style="color:var(--g3);margin-bottom:1.1rem;display:flex;justify-content:center;transform:scale(2.4)">${ICONS.package}</div><p style="color:var(--g4);font-size:.9rem">No orders yet.</p><button class="hero-cta-primary" onclick="navigateTo('catalog')" style="display:inline-block;margin-top:1.1rem">Shop Now</button></div>`;return;}el.innerHTML=orders.map(o=>makeOrderCard(o)).join('');}
function makeOrderCard(o){const steps=['pending','confirmed','packed','shipped','delivered'];const stepIdx=steps.indexOf(o.status||'pending');const progress=steps.map((s,i)=>`<div class="progress-step ${i<stepIdx?'done':i===stepIdx?'active':''}"><div class="ps-dot">${i<stepIdx?ICONS.check:i+1}</div><div class="ps-label">${s.charAt(0).toUpperCase()+s.slice(1)}</div></div>`).join('');return `<div class="order-card"><div class="order-card-summary" onclick="toggleOrderDetails('${o.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'){toggleOrderDetails('${o.id}')}"><div><div class="order-id">${o.id}</div><div class="order-date">${o.date}</div></div><div style="display:flex;align-items:center;gap:.9rem;flex-wrap:wrap"><span class="order-status status-${o.status||'pending'}">${(o.status||'pending').charAt(0).toUpperCase()+(o.status||'pending').slice(1)}</span><span style="font-size:.95rem;font-weight:700">${fmtMoney(o.total)}</span><button class="order-expand-btn" id="expbtn-${o.id}" aria-label="Toggle order details" onclick="event.stopPropagation();toggleOrderDetails('${o.id}')">▼</button></div></div><div class="order-details" id="od-${o.id}"><div style="font-size:.78rem;color:var(--g4);margin-bottom:.9rem;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Order Progress</div><div class="order-progress">${progress}</div>${Object.entries(o.timeline||{}).filter(([,v])=>v).map(([k,v])=>`<div style="font-size:.82rem;color:var(--g4);margin-bottom:.25rem"><strong style="color:var(--black)">${k.charAt(0).toUpperCase()+k.slice(1)}:</strong> ${v}</div>`).join('')}<div style="font-size:.78rem;color:var(--g4);margin-top:.9rem;margin-bottom:.55rem;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Items</div>${o.items.map(i=>`<div class="order-item-row"><div class="order-item-thumb">${i.img?`<img src="${i.img}" alt="${i.name}" loading="lazy">`:ICONS.tag}</div><div style="flex:1"><div style="font-size:.9rem;font-weight:600">${i.name}</div><div style="font-size:.78rem;color:var(--g4)">${getBrandName(i.brand||'')} · <strong>${i.size||''}</strong></div></div><div style="font-size:.875rem">× ${i.qty||1}</div><div style="font-size:.9rem;font-weight:600">${fmtMoney(i.price*(i.qty||1))}</div></div>`).join('')}<div style="display:flex;justify-content:space-between;padding:.65rem 0;font-weight:700;font-size:.95rem;border-top:1px solid var(--g2);margin-top:.55rem"><span>Total</span><span>${fmtMoney(o.total)}</span></div><div style="font-size:.875rem;color:var(--g4);margin-bottom:.9rem;line-height:1.7">${ICONS.mapPin} ${o.address||'—'} · ${ICONS.creditCard} ${(o.payMethod||'—').toUpperCase()} · ${ICONS.mail} ${o.email||'—'}</div>${o.trackingNumber?`<div class="order-tracking-box"><div style="font-size:.78rem;color:var(--g4);margin-bottom:.45rem;font-weight:600">${ICONS.truck} J&T Express Tracking</div><div style="font-size:.875rem;margin-bottom:.45rem"><strong>${o.trackingNumber}</strong></div><a class="tracking-link" href="https://www.jtexpress.ph/trajectoryQuery?flag=1&waybillNo=${o.trackingNumber}" target="_blank">Track on J&T</a></div>`:''} ${o.messages&&o.messages.length?`<div style="font-size:.78rem;color:var(--g4);margin-bottom:.45rem;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Messages from Merchant</div><div style="background:var(--g1);border-radius:var(--r2);padding:.9rem;margin-bottom:1.1rem;font-size:.875rem;color:var(--g5)">${o.messages.map(m=>`<div style="margin-bottom:.45rem"><strong>${m.role==='merchant'?ICONS.store+' Merchant':'You'}:</strong> ${m.text} <span style="font-size:.72rem;color:var(--g4)">${m.time||''}</span></div>`).join('')}</div>`:''}<div class="order-actions"><button class="order-action-btn" onclick="reorderItems('${o.id}')">Reorder</button>${o.status==='delivered'?o.items.map(i=>`<button class="order-action-btn" onclick="openReviewModal(${i.id||i.productId},null)">Review ${i.name}</button>`).join(''):''}</div></div></div>`;}
function toggleOrderDetails(orderId){document.getElementById('od-'+orderId)?.classList.toggle('open');document.getElementById('expbtn-'+orderId)?.classList.toggle('open');}
function reorderItems(orderId){const o=orders.find(x=>x.id===orderId);if(!o)return;let added=0;o.items.forEach(item=>{const p=getProduct(item.id||item.productId);if(p&&p.stock>0){const ex=cart.find(i=>i.productId==p.id);const curQty=ex?ex.qty:0;if(curQty+1>p.stock)return;if(ex)ex.qty++;else cart.push({productId:p.id,qty:1});added++;}});persist();updateCartUI();if(added){toast(added+' item(s) added to cart!','success');openCart();}else toast('All items are out of stock','error');}

function addNotif(type,icon,text,target){const n={icon,text,time:nowTime(),read:false,target:target||null};if(type==='customer'){customerNotifs.unshift(n);customerNotifs=customerNotifs.slice(0,20);}else{merchantNotifs.unshift(n);merchantNotifs=merchantNotifs.slice(0,20);}persist();renderNotifs();}
function handleNotifClick(type,idx){const notifs=type==='customer'?customerNotifs:merchantNotifs;if(notifs[idx]){notifs[idx].read=true;const target=notifs[idx].target;persist();renderNotifs();closeAllDropdowns();if(target==='orders')navigateTo('orders');else if(target==='orders-merch'&&currentMerchant)navigateTo('merchant');else if(target==='catalog')navigateTo('catalog');}}
function renderNotifs(){const cu=customerNotifs.filter(n=>!n.read).length;const cb=document.getElementById('notif-count');if(cb){cb.textContent=cu;cb.classList.toggle('on',cu>0);}const cl=document.getElementById('notif-list');if(cl)cl.innerHTML=customerNotifs.length?customerNotifs.map((n,i)=>`<div class="notif-item ${n.read?'':'unread'}" onclick="handleNotifClick('customer',${i})"><div class="notif-icon-c">${n.icon}</div><div style="flex:1"><div class="notif-text">${n.text}</div><div class="notif-time">${n.time}</div></div>${n.target?`<span class="notif-arrow">›</span>`:''}</div>`).join(''):`<div class="notif-empty-msg"><span class="notif-empty-icon">${ICONS.bell}</span>No notifications yet</div>`;const mu=merchantNotifs.filter(n=>!n.read).length;const mb=document.getElementById('merch-notif-count');if(mb){mb.textContent=mu;mb.classList.toggle('on',mu>0);}const ml=document.getElementById('merch-notif-list');if(ml)ml.innerHTML=merchantNotifs.length?merchantNotifs.map((n,i)=>`<div class="notif-item ${n.read?'':'unread'}" onclick="handleNotifClick('merchant',${i})"><div class="notif-icon-c">${n.icon}</div><div style="flex:1"><div class="notif-text">${n.text}</div><div class="notif-time">${n.time}</div></div>${n.target?`<span class="notif-arrow">›</span>`:''}</div>`).join(''):`<div class="notif-empty-msg"><span class="notif-empty-icon">${ICONS.store}</span>No merchant alerts</div>`;}
function toggleNotif(type){if(type==='customer'){const dd=document.getElementById('notif-dropdown');const willOpen=!dd.classList.contains('open');dd.classList.toggle('open');document.getElementById('merch-notif-dropdown').classList.remove('open');}else{const dd=document.getElementById('merch-notif-dropdown');dd.classList.toggle('open');document.getElementById('notif-dropdown').classList.remove('open');}}
function clearNotifs(type){if(type==='customer')customerNotifs=[];else merchantNotifs=[];persist();renderNotifs();closeAllDropdowns();}


let currentLoginRole='admin';
function setLoginRole(role){
  currentLoginRole=role;
  const adminBtn=document.getElementById('role-admin-btn');
  const merchBtn=document.getElementById('role-merch-btn');
  const adminFields=document.getElementById('mm-admin-fields');
  const merchFields=document.getElementById('mm-merch-fields');
  if(role==='admin'){
    adminBtn.style.background='var(--black)';adminBtn.style.color='#fff';
    merchBtn.style.background='transparent';merchBtn.style.color='var(--g4)';
    adminFields.style.display='block';merchFields.style.display='none';
  } else {
    merchBtn.style.background='var(--black)';merchBtn.style.color='#fff';
    adminBtn.style.background='transparent';adminBtn.style.color='var(--g4)';
    adminFields.style.display='none';merchFields.style.display='block';
  }
  document.getElementById('mm-error').style.display='none';
}
function openMerchantModal(){
  if(currentMerchant){navigateTo('merchant');return;}
  const sel=document.getElementById('mm-brand-select');
  sel.innerHTML=BRANDS.filter(b=>b.id!=='lostandfound').map(b=>`<option value="${b.id}">${b.name}</option>`).join('');
  document.getElementById('mm-admin-user').value='';
  document.getElementById('mm-admin-pass').value='';
  if(document.getElementById('mm-pass'))document.getElementById('mm-pass').value='';
  document.getElementById('mm-error').style.display='none';
  currentLoginRole='admin';
  setLoginRole('admin');
  document.getElementById('merchant-modal').classList.add('on');
  openA11yPanel(document.querySelector('.merchant-modal-card'));
}
function closeMerchantModal(){document.getElementById('merchant-modal').classList.remove('on');closeA11yPanel();}
function merchantLogin(){
  document.getElementById('mm-error').style.display='none';
  if(currentLoginRole==='admin'){
    const user=document.getElementById('mm-admin-user').value.trim();
    const pass=document.getElementById('mm-admin-pass').value;
    {document.getElementById('mm-error').style.display='block';return;} // login is verified ONLY by the server (backend/Sync.js → Api.php)
    currentMerchant=getBrand('lostandfound');
    saveSession();
    document.getElementById('merchant-btn').innerHTML=ICONS.key+' Admin';
    document.getElementById('merchant-btn').classList.add('logged-in');
    document.getElementById('merchant-btn').style.background='linear-gradient(135deg,#c8a96e,#f0d9a8)';
    document.getElementById('merch-notif-wrap').classList.add('visible');
    closeMerchantModal();navigateTo('merchant');
    toast('Admin access granted!','success');
    addNotif('merchant',ICONS.key,'Logged in as ADMIN — full access','orders-merch');
  } else {
    const brandId=document.getElementById('mm-brand-select').value;
    const pass=document.getElementById('mm-pass').value;
    const storedPass=JSON.parse(localStorage.getItem('lf_merchant_passwords')||'{}');
    const effectivePass=storedPass[brandId]||MERCHANT_ACCOUNTS[brandId];
    if(effectivePass!==pass){document.getElementById('mm-error').style.display='block';return;}
    currentMerchant=getBrand(brandId);
    saveSession();
    document.getElementById('merchant-btn').innerHTML=ICONS.store+' '+currentMerchant.name;
    document.getElementById('merchant-btn').classList.add('logged-in');
    document.getElementById('merchant-btn').style.background='';
    document.getElementById('merch-notif-wrap').classList.add('visible');
    closeMerchantModal();navigateTo('merchant');
    toast('Welcome back, '+currentMerchant.name+'!','success');
    addNotif('merchant',ICONS.store,'Logged in as '+currentMerchant.name,'orders-merch');
  }
}
function merchantLogout(){currentMerchant=null;saveSession();document.getElementById('merchant-btn').innerHTML=ICONS.user+' Merchant';document.getElementById('merchant-btn').classList.remove('logged-in');document.getElementById('merchant-btn').style.background='';document.getElementById('merch-notif-wrap').classList.remove('visible');navigateTo('home');toast('Logged out');}

/* ══ ORDER STATUS FILTER (NEW) ══ */
function setOrderStatusFilter(status, btn) {
  activeOrderStatusFilter = status;
  document.querySelectorAll('.osn-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMerchantOrdersList();
}

function updateOrderStatusCounts(myOrders) {
  const statuses = ['all','pending','confirmed','packed','shipped','delivered'];
  statuses.forEach(s => {
    const el = document.getElementById('osn-count-' + s);
    if (!el) return;
    const count = s === 'all' ? myOrders.length : myOrders.filter(o => o.status === s).length;
    el.textContent = count;
    el.classList.toggle('has-items', count > 0 && s !== 'all' && s !== 'delivered');
  });
}

function renderMerchantOrdersList() {
  if (!currentMerchant) return;
  const isAdmin=currentMerchant.id==='lostandfound';
  const myO=isAdmin?orders:orders.filter(o=>o.items.some(i=>i.brand===currentMerchant.id));
  updateOrderStatusCounts(myO);
  const filtered = activeOrderStatusFilter === 'all' ? myO : myO.filter(o => o.status === activeOrderStatusFilter);
  const ol = document.getElementById('merch-orders-list');
  if (!ol) return;
  if (!filtered.length) {
    const statusLabel = activeOrderStatusFilter === 'all' ? 'orders' : `"${activeOrderStatusFilter}" orders`;
    ol.innerHTML = `<div style="text-align:center;padding:3rem 1rem;color:var(--g4);font-size:.9rem">No ${statusLabel} found.</div>`;
    return;
  }
  ol.innerHTML = filtered.map(o => makeMerchantOrderCard(o)).join('');
}

/* ══ PRODUCT SEARCH (NEW) ══ */
function renderMerchProductTable() {
  if (!currentMerchant) return;
  const query = (document.getElementById('merch-prod-search')?.value || '').toLowerCase().trim();
  const isAdmin=currentMerchant.id==='lostandfound';
const myP=isAdmin?PRODUCTS:PRODUCTS.filter(p=>p.brand===currentMerchant.id);
  const filtered = query ? myP.filter(p =>
    p.name.toLowerCase().includes(query) ||
    String(p.id).includes(query) ||
    p.tag.toLowerCase().includes(query) ||
    p.size.toLowerCase().includes(query)
  ) : myP;
  const tbody = document.getElementById('merch-product-tbody');
  if (!tbody) return;
  tbody.innerHTML = filtered.length ? filtered.map(p => {
    const [sl, sc] = stockStatus(p.stock);
    return `<tr>
      <td><span class="prod-id-badge">#${p.id}</span></td>
      <td><div style="width:38px;height:38px;border-radius:5px;overflow:hidden;background:var(--g2);display:flex;align-items:center;justify-content:center;color:var(--g3)">${p.img ? `<img src="${p.img}" style="width:100%;height:100%;object-fit:cover" loading="lazy">` : ICONS.tag}</div></td>
      <td style="font-size:.9rem;font-weight:500">${p.name}</td>
      <td><span style="font-size:.8rem;background:var(--g1);border:1px solid var(--g2);padding:.22rem .6rem;border-radius:5px;font-weight:500">${p.tag}</span></td>
      <td style="font-size:.9rem;font-weight:600">${fmtMoney(p.price)}</td>
      <td style="font-size:.875rem;font-weight:600;color:var(--g5)">${p.size}</td>
      <td><span class="card-stock-badge ${sc}">${sl} (${p.stock})</span></td>
      <td><button class="tbl-action" onclick="openProductModal(${p.id})">Edit</button><button class="tbl-action danger" onclick="deleteProduct(${p.id})">Del</button></td>
    </tr>`;
  }).join('') : `<tr><td colspan="8" style="text-align:center;color:var(--g4);padding:2rem;font-size:.875rem">No products match your search.</td></tr>`;
}

function renderMerchantDash(){
  if(!currentMerchant){openMerchantModal();return;}
  const isAdmin=currentMerchant.id==='lostandfound';
  const myP=isAdmin?PRODUCTS:PRODUCTS.filter(p=>p.brand===currentMerchant.id);
  const myO=isAdmin?orders:orders.filter(o=>o.items.some(i=>i.brand===currentMerchant.id));
  const rev=myO.reduce((s,o)=>s+o.total,0);
  document.getElementById('merch-title').innerHTML=currentMerchant.name+' Dashboard'+(isAdmin?' <span style="background:linear-gradient(135deg,#c8a96e,#f0d9a8);color:#0c0b09;font-size:.9rem;padding:.2rem .8rem;border-radius:20px;font-family:Inter,sans-serif;font-weight:700;letter-spacing:.08em;vertical-align:middle">'+ICONS.key+' ADMIN</span>':'');
  document.querySelectorAll('.admin-only-tab').forEach(el=>{el.style.display=isAdmin?'':'none';});
  if(isAdmin)renderCategoriesPanel();
  document.getElementById('merch-stats-grid').innerHTML=`<div class="merch-stat-card"><div class="merch-stat-val">${myP.length}</div><div class="merch-stat-lbl">Products</div></div><div class="merch-stat-card"><div class="merch-stat-val">${myO.length}</div><div class="merch-stat-lbl">Orders</div></div><div class="merch-stat-card"><div class="merch-stat-val">${fmtMoney(rev)}</div><div class="merch-stat-lbl">Revenue</div></div><div class="merch-stat-card"><div class="merch-stat-val">${myP.reduce((s,p)=>s+(p.stock||0),0)}</div><div class="merch-stat-lbl">Total Stock</div></div>`;
  renderMerchProductTable();
  renderMerchantOrdersList();
  const tl=document.getElementById('top-products-list');if(tl){const s=[...myP].sort((a,b)=>b.views-a.views).slice(0,5);tl.innerHTML=s.map((p,i)=>`<li class="top-product-item"><span class="tp-rank">${i+1}</span><span class="tp-name">${p.name}</span><span style="font-size:.82rem;color:var(--g4)">${p.views} views · ${fmtMoney(p.price)}</span></li>`).join('');}
  const il=document.getElementById('inventory-list');if(il)il.innerHTML=myP.map(p=>{const pct=Math.min(100,((p.stock||0)/30)*100);const cls=(p.stock||0)<=0?'out':(p.stock||0)<=5?'low':'';return `<div class="inv-bar"><span class="inv-label">${p.name}</span><div class="inv-track"><div class="inv-fill ${cls}" style="width:${pct}%"></div></div><span class="inv-num">${p.stock||0} units</span><button class="inv-edit" onclick="adjustStock(${p.id})">Edit</button></div>`;}).join('');
  const bp=document.getElementById('merch-brand-profile');
  if(bp)bp.innerHTML=`<div style="display:flex;align-items:center;gap:1.6rem;padding:1.6rem;background:#fff;border:1px solid var(--g2);border-radius:var(--r2);margin-bottom:1.6rem;flex-wrap:wrap"><div style="width:82px;height:82px;border-radius:var(--r2);overflow:hidden;background:var(--g2);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--g4)">${currentMerchant.img?`<img src="${currentMerchant.img}" style="width:100%;height:100%;object-fit:cover">`:ICONS.store}</div><div style="flex:1"><div style="font-family:'Bebas Neue';font-size:1.6rem">${currentMerchant.name}</div><div style="font-size:.9rem;color:var(--g4);margin:.25rem 0;line-height:1.6">${currentMerchant.desc||'—'}</div><div style="font-size:.82rem;color:var(--g4)">${ICONS.mapPin} ${currentMerchant.location||'Batangas'} · Est. ${currentMerchant.year||'—'}</div><div style="font-size:.82rem;color:var(--g4)">${ICONS.clock} ${currentMerchant.schedule||'—'} · ${currentMerchant.instagram||'—'}</div></div><button class="edit-save-btn" style="padding:.55rem 1.3rem;border-radius:20px;max-width:160px;font-size:.85rem" onclick="openBrandModal()">Edit Profile &amp; Image</button><button class="edit-cancel-btn" style="padding:.55rem 1.3rem;border-radius:20px;max-width:160px;font-size:.85rem;margin-top:.5rem;display:block" onclick="openChangePassword()">Change Password</button></div>${currentMerchant.img?`<div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);overflow:hidden;margin-bottom:1.6rem"><div style="font-size:.78rem;color:var(--g4);padding:.65rem 1.1rem .25rem;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Current Brand Banner</div><img src="${currentMerchant.img}" style="width:100%;height:185px;object-fit:cover;display:block" alt="Brand banner"><div style="padding:.55rem 1.1rem;font-size:.78rem;color:var(--g4)">This image appears as your banner in the catalog.</div></div>`:'<div style="background:var(--g1);border:2px dashed var(--g2);border-radius:var(--r2);padding:1.6rem;text-align:center;font-size:.875rem;color:var(--g4);margin-bottom:1.6rem">No banner image set yet. Click "Edit Profile &amp; Image" to add one.</div>'}`;
  const myIds=myP.map(p=>p.id);const myRevs=reviews.filter(r=>myIds.includes(r.productId));const rl=document.getElementById('merch-reviews-list');if(rl)rl.innerHTML=myRevs.length?myRevs.map(rv=>{const pr=getProduct(rv.productId);return `<div class="review-card"><div style="font-size:.78rem;color:var(--g4);margin-bottom:.35rem">Product: <strong>${pr?.name||'—'}</strong></div><div class="review-card-header"><span class="review-card-author">${rv.author}</span><span class="review-card-date">${rv.date}</span></div><div class="review-card-stars">${'★'.repeat(rv.rating)}${'☆'.repeat(5-rv.rating)}</div><div class="review-card-text">${rv.text}</div>${rv.merchantReply?`<div class="review-reply"><strong>Your Reply:</strong> ${rv.merchantReply}</div>`:`<div class="review-respond-area" id="rra-${rv.id}"><textarea placeholder="Write your reply..."></textarea><button class="review-respond-submit" onclick="submitMerchantReply('${rv.id}',this)">Send Reply</button></div><button class="review-respond-btn" onclick="document.getElementById('rra-${rv.id}').classList.toggle('open')">Reply to Review</button>`}</div>`;}).join(''):'<div style="color:var(--g4);font-size:.875rem;padding:1.1rem">No reviews yet on your products.</div>';
  setTimeout(drawSalesChart,100);
  setTimeout(()=>{const activeBtn=document.querySelector('.mt-tab.active');if(activeBtn)positionTabIndicator(activeBtn);},60);
}

function makeMerchantOrderCard(o){return `<div class="merch-order-detail"><div class="mod-header"><div><div class="mod-id">${o.id}</div><div style="font-size:.82rem;color:var(--g4)">${o.date}</div></div><select class="status-select" onchange="updateOrderStatus('${o.id}',this.value)">${['pending','confirmed','packed','shipped','delivered'].map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}</select></div><div class="mod-customer-info"><strong>${o.customer}</strong> · ${o.email} · ${o.phone||'—'}<br>${ICONS.mapPin} ${o.address||'—'} · ${ICONS.creditCard} ${(o.payMethod||'—').toUpperCase()}</div><div style="font-size:.875rem;margin-bottom:.9rem">${o.items.map(i=>`${i.name} ×${i.qty||1}`).join(' · ')}</div><div style="font-weight:700;font-size:.95rem;margin-bottom:.9rem">Total: ${fmtMoney(o.total)}</div><div class="mod-tracking-input"><input id="ti-${o.id}" placeholder="J&T Tracking Number..." value="${o.trackingNumber||''}"><input id="mi-${o.id}" placeholder="Message to customer..." style="flex:2"><button class="mod-send-btn" onclick="sendMerchantMsg('${o.id}')">Send</button></div><div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:.9rem;max-height:160px;overflow-y:auto;font-size:.875rem">${(o.messages||[]).map(m=>`<div style="margin-bottom:.45rem;color:${m.role==='merchant'?'var(--black)':'var(--g4)'}"><strong>${m.role==='merchant'?'You':'Customer'}:</strong> ${m.text}</div>`).join('')||'<span style="color:var(--g4)">No messages yet.</span>'}</div></div>`;}

function sendMerchantMsg(orderId){const o=orders.find(x=>x.id===orderId);if(!o)return;const ti=document.getElementById('ti-'+orderId);const mi=document.getElementById('mi-'+orderId);const tn=ti?.value.trim(),msg=mi?.value.trim();if(!msg&&!tn){toast('Enter a message or tracking number','error');return;}if(tn)o.trackingNumber=tn;if(!o.messages)o.messages=[];o.messages.push({role:'merchant',text:msg||(tn?'Tracking: '+tn:''),time:nowTime()});if(mi)mi.value='';persist();toast('Message sent!','success');addNotif('customer',ICONS.message,'Merchant message for order '+orderId,'orders');renderMerchantDash();}
function submitMerchantReply(reviewId,btn){const area=btn.closest('.review-respond-area');const txt=area?.querySelector('textarea')?.value.trim();if(!txt){toast('Enter a reply','error');return;}const rv=reviews.find(r=>r.id===reviewId);if(rv){rv.merchantReply=txt;persist();toast('Reply submitted!','success');renderMerchantDash();}}
function updateOrderStatus(orderId,status){const o=orders.find(x=>x.id===orderId);if(!o)return;o.status=status;if(!o.timeline)o.timeline={};o.timeline[status]=new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric'});persist();addNotif('customer',ICONS.package,'Your order '+orderId+' is now: '+status,'orders');addNotif('merchant',ICONS.checkCircle,'Updated '+orderId+' → '+status,'orders-merch');toast('Status updated: '+status,'success');renderMerchantDash();}
function adjustStock(id){const p=getProduct(id);if(!p)return;const v=prompt(`Stock for "${p.name}" (current: ${p.stock||0}):`,p.stock||0);if(v!==null&&!isNaN(parseInt(v))){p.stock=Math.max(0,parseInt(v));persist();renderMerchantDash();toast('Stock updated!','success');}}
function deleteProduct(id){if(!confirm('Delete this product?'))return;PRODUCTS=PRODUCTS.filter(p=>p.id!==id);persist();renderMerchantDash();toast('Product deleted');}
function positionTabIndicator(btn){const ind=document.getElementById('mt-tab-indicator');const wrap=document.querySelector('.merch-tabs');if(!ind||!wrap||!btn||window.innerWidth<=900)return;const wrapRect=wrap.getBoundingClientRect();const btnRect=btn.getBoundingClientRect();ind.style.height=btnRect.height+'px';ind.style.transform='translateY('+(btnRect.top-wrapRect.top)+'px)';}
window.addEventListener('resize',()=>{const active=document.querySelector('.mt-tab.active');if(active)positionTabIndicator(active);});
function _showMerchTabImpl(tab,btn){['products','orders','analytics','inventory','brand','reviews','events','feedback','testimonial','siteimages','brands','categories','approvals','security'].forEach(t=>{const el=document.getElementById('merch-panel-'+t);if(el)el.style.display=t===tab?'block':'none';});document.querySelectorAll('.mt-tab').forEach(b=>b.classList.toggle('active',b===btn));if(btn)positionTabIndicator(btn);if(tab==='analytics')setTimeout(drawSalesChart,150);if(tab==='orders')renderMerchantOrdersList();if(tab==='events')renderMerchEventsPanel();if(tab==='feedback')renderFeedbackPanel();if(tab==='testimonial')renderMerchTestimRequestsList();if(tab==='siteimages'){}if(tab==='brands')renderAdminBrandsList();
if(tab==='categories')renderCategoriesPanel();
if(tab==='approvals')renderImageApprovals();}
function showMerchTab(tab,btn){if(document.startViewTransition){document.startViewTransition(()=>_showMerchTabImpl(tab,btn));}else{_showMerchTabImpl(tab,btn);}}
function renderCategoriesPanel(){
  const el=document.getElementById('admin-categories-list');if(!el)return;
  const map={};
  PRODUCTS.forEach(p=>{const t=p.tag||'Uncategorized';(map[t]=map[t]||[]).push(p);});
  const tags=Object.keys(map).sort();
  el.innerHTML=tags.length?tags.map(t=>{
    const items=map[t];
    const stock=items.reduce((s,p)=>s+(p.stock||0),0);
    const merchants=new Set(items.map(p=>p.brand)).size;
    return `<div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1rem 1.2rem;margin-bottom:.8rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem">
      <div><div style="font-weight:700;font-size:1.05rem">${t}</div><div style="font-size:.82rem;color:var(--g4)">${items.length} product(s) · ${stock} units in stock · ${merchants} merchant(s)</div></div>
    </div>`;
  }).join(''):'<p style="color:var(--g4);font-size:.9rem;padding:1rem">No product categories yet — categories appear here as soon as merchants add products.</p>';
}

function openProductModal(id){
  const p=id?getProduct(id):null;
  pmImgs=p?(p.imgs||(p.img?[p.img]:[])):[];
  document.getElementById('pm-title').textContent=p?'Edit Product':'Add Product';
  document.getElementById('pm-id').value=p?p.id:'';
  document.getElementById('pm-name').value=p?p.name:'';
  document.getElementById('pm-price').value=p?p.price:'';
  document.getElementById('pm-original-price').value=p&&p.originalPrice?p.originalPrice:'';
  document.getElementById('pm-tag').value=p?p.tag:'';
  document.getElementById('pm-size').value=p?p.size:'';
  document.getElementById('pm-stock').value=p?(p.stock||0):'10';
  document.querySelectorAll('.price-chip').forEach(b=>b.classList.remove('on'));
  renderPmImgsPreview();
  document.getElementById('product-modal').classList.add('on');
  openA11yPanel(document.querySelector('#product-modal .edit-card'));
}
function closeProductModal(){document.getElementById('product-modal').classList.remove('on');closeA11yPanel();}
let pmImgs=[];
function handleImgsUpload(input){
  const files=Array.from(input.files).slice(0,5-pmImgs.length);
  files.forEach(file=>{
    const reader=new FileReader();
    reader.onload=e=>{pmImgs.push(e.target.result);renderPmImgsPreview();};
    reader.readAsDataURL(file);
  });
}
function addImgUrl(url){if(!url||pmImgs.length>=5)return;pmImgs.push(url);renderPmImgsPreview();}
function removePmImg(idx){pmImgs.splice(idx,1);renderPmImgsPreview();}
function renderPmImgsPreview(){
  const el=document.getElementById('pm-imgs-preview');
  if(!el)return;
  el.innerHTML=pmImgs.map((src,i)=>`<div style="position:relative;width:72px;height:72px"><img src="${src}" style="width:72px;height:72px;object-fit:cover;border-radius:var(--r);border:2px solid ${i===0?'var(--accent)':'var(--g2)'}"><button onclick="removePmImg(${i})" aria-label="Remove image ${i+1}" style="position:absolute;top:-6px;right:-6px;background:var(--red);color:#fff;border:none;width:18px;height:18px;border-radius:50%;font-size:.65rem;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>${i===0?'<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(196,144,48,.85);color:#fff;font-size:.6rem;text-align:center;font-weight:700;border-radius:0 0 var(--r) var(--r)">COVER</div>':''}</div>`).join('');
}
function saveProduct(){
  const idVal=document.getElementById('pm-id').value;
  const id=idVal?parseInt(idVal):null;
  const name=document.getElementById('pm-name').value.trim();
  const priceRaw=document.getElementById('pm-price').value.trim();
const price=isNaN(parseFloat(priceRaw))?priceRaw:parseFloat(priceRaw);
  const originalPriceRaw=document.getElementById('pm-original-price').value.trim();
  const originalPrice=originalPriceRaw?(isNaN(parseFloat(originalPriceRaw))?originalPriceRaw:parseFloat(originalPriceRaw)):null;
  const tag=document.getElementById('pm-tag').value.trim();
  const size=document.getElementById('pm-size').value.trim();
  const stock=parseInt(document.getElementById('pm-stock').value)||0;
  const urlInput=document.getElementById('pm-img').value.trim();
  if(urlInput&&!pmImgs.includes(urlInput))pmImgs.push(urlInput);
  const imgs=pmImgs.length?pmImgs:[];
  const img=imgs[0]||'';
  if(!name||!priceRaw||!tag||!size){toast('Fill all required fields (*)','error');return;}
  if(id){const p=getProduct(id);if(p){Object.assign(p,{name,price,originalPrice,tag,size,stock,img,imgs});toast('Product updated!','success');}}
  else{const newId=Math.max(0,...PRODUCTS.map(p=>p.id))+1;PRODUCTS.push({id:newId,brand:currentMerchant.id,name,tag,price,originalPrice,size,stock,img,imgs,new:true,views:0});toast('Product added!','success');}
  persist();closeProductModal();renderMerchantDash();
}

function openBrandModal(){const b=currentMerchant;document.getElementById('bm-name').value=b.name;document.getElementById('bm-tag').value=b.tag;document.getElementById('bm-desc').value=b.desc||'';document.getElementById('bm-loc').value=b.location||'';document.getElementById('bm-year').value=b.year||'';document.getElementById('bm-ig').value=b.instagram||'';document.getElementById('bm-sched').value=b.schedule||'';document.getElementById('bm-img').value=b.img||'';const fileInput=document.getElementById('bm-file');if(fileInput)fileInput.value='';const area=document.getElementById('bm-upload-area');const preview=document.getElementById('bm-preview');if(b.img){preview.src=b.img;preview.style.display='block';area.classList.add('has-image');}else{preview.src='';preview.style.display='none';area.classList.remove('has-image');}document.getElementById('brand-modal').classList.add('on');openA11yPanel(document.querySelector('#brand-modal .edit-card'));}
function closeBrandModal(){document.getElementById('brand-modal').classList.remove('on');closeA11yPanel();}
function handleBrandImgUpload(input){const file=input.files[0];if(!file)return;const reader=new FileReader();reader.onload=e=>{const data=e.target.result;const preview=document.getElementById('bm-preview');const area=document.getElementById('bm-upload-area');document.getElementById('bm-img').value=data;preview.src=data;preview.style.display='block';area.classList.add('has-image');toast('Image loaded — click Save Brand to apply','success');};reader.readAsDataURL(file);}
function previewBrandImgFromUrl(url){const preview=document.getElementById('bm-preview');const area=document.getElementById('bm-upload-area');if(url&&(url.startsWith('http')||url.startsWith('data:'))){preview.src=url;preview.style.display='block';area.classList.add('has-image');preview.onerror=()=>{preview.style.display='none';area.classList.remove('has-image');};}else{preview.src='';preview.style.display='none';area.classList.remove('has-image');}}
function saveBrand(){const i=BRANDS.findIndex(b=>b.id===currentMerchant.id);if(i>=0){const b=BRANDS[i];const name=document.getElementById('bm-name').value.trim();if(name)b.name=name;b.tag=document.getElementById('bm-tag').value.trim()||b.tag;b.desc=document.getElementById('bm-desc').value.trim()||b.desc;b.location=document.getElementById('bm-loc').value.trim();b.year=document.getElementById('bm-year').value.trim();b.instagram=document.getElementById('bm-ig').value.trim();b.schedule=document.getElementById('bm-sched').value.trim();const img=document.getElementById('bm-img').value.trim();if(img)b.img=img;currentMerchant={...currentMerchant,...b};}persist();toast('Brand updated!','success');closeBrandModal();renderMerchantDash();}

function initSearch(){const input=document.getElementById('search-input');const results=document.getElementById('search-results');let deb;input.addEventListener('input',()=>{clearTimeout(deb);deb=setTimeout(()=>{const q=input.value.trim().toLowerCase();if(!q){results.innerHTML='';return;}const matches=PRODUCTS.filter(p=>p.name.toLowerCase().includes(q)||getBrandName(p.brand).toLowerCase().includes(q)||p.tag.toLowerCase().includes(q)).slice(0,8);results.innerHTML=matches.length?matches.map(p=>`<div class="sr-item" onclick="selectSearchResult(${p.id})"><div class="sr-thumb">${p.img?`<img src="${p.img}" alt="${p.name}" loading="lazy">`:ICONS.tag}</div><div><div class="sr-name">${p.name}</div><div class="sr-meta">${getBrandName(p.brand)} · ${p.tag} · <strong style="color:var(--g5)">${p.size}</strong></div></div><div class="sr-price">${fmtMoney(p.price)}</div></div>`).join(''):'<div style="padding:1.1rem;font-size:.875rem;color:var(--g4)">No results found</div>';},200);});}
function toggleSearchOverlay(){const ov=document.getElementById('search-overlay');if(ov.classList.contains('open'))closeSearchOverlay();else openSearchOverlay();}
function openSearchOverlay(){const ov=document.getElementById('search-overlay');ov.classList.add('open');closeAllDropdowns();setTimeout(()=>document.getElementById('search-input')?.focus(),50);}
function closeSearchOverlay(){const ov=document.getElementById('search-overlay');ov.classList.remove('open');const input=document.getElementById('search-input');const results=document.getElementById('search-results');if(input)input.value='';if(results)results.innerHTML='';}
function selectSearchResult(productId){closeSearchOverlay();openProductDetail(productId);}

function showWelcomeModal(){
  const merchants=BRANDS.filter(b=>b.id!=='lostandfound');
  const pick=merchants[Math.floor(Math.random()*merchants.length)];
  if(pick){
    document.getElementById('welcome-merchant-name').textContent=pick.name;
    document.getElementById('welcome-merchant-sub').innerHTML=ICONS.mapPin+' '+(pick.location||'Batangas')+' · '+pick.tag;
    const thumb=document.getElementById('welcome-merch-thumb');
    if(thumb){
      if(pick.img){thumb.innerHTML=`<img src="${pick.img}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='${ICONS.store.replace(/'/g,"\\'")}'">`;}
      else{thumb.innerHTML=ICONS.store;}
    }
  }
  const brandCountEl=document.getElementById('welcome-brand-count');
  if(brandCountEl)brandCountEl.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41L11 3.83A2 2 0 0 0 9.59 3.17L4 3a1 1 0 0 0-1 1l.17 5.59a2 2 0 0 0 .66 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> '+merchants.length+' Brands';
  document.getElementById('welcome-modal').classList.add('show');
  openA11yPanel(document.querySelector('.wm-card'));
}
function closeWelcomeModal(){
  document.getElementById('welcome-modal').classList.remove('show');
  closeA11yPanel();
}

function openChangePassword(){
  if(!currentMerchant)return;
  const current=prompt('Enter your CURRENT password:');
  if(current===null)return;
  if(MERCHANT_ACCOUNTS[currentMerchant.id]!==current){toast('Incorrect current password','error');return;}
  const next=prompt('Enter your NEW password (min 4 characters):');
  if(!next||next.length<4){toast('Password too short — minimum 4 characters','error');return;}
  const confirm2=prompt('Confirm new password:');
  if(next!==confirm2){toast('Passwords do not match','error');return;}
  MERCHANT_ACCOUNTS[currentMerchant.id]=next;
  toast('Password changed successfully!','success');
}

function saveMerchantPassword(){
  if(!currentMerchant||currentMerchant.id==='lostandfound')return;
  const cur=document.getElementById('sec-cur').value;
  const nw=document.getElementById('sec-new').value;
  const conf=document.getElementById('sec-confirm').value;
  const errEl=document.getElementById('sec-error');
  const storedPass=JSON.parse(localStorage.getItem('lf_merchant_passwords')||'{}');
  const effectivePass=storedPass[currentMerchant.id]||MERCHANT_ACCOUNTS[currentMerchant.id];
  if(cur!==effectivePass){errEl.textContent='Current password is incorrect.';errEl.style.display='block';return;}
  if(nw.length<4){errEl.textContent='New password must be at least 4 characters.';errEl.style.display='block';return;}
  if(nw!==conf){errEl.textContent='Passwords do not match.';errEl.style.display='block';return;}
  errEl.style.display='none';
  storedPass[currentMerchant.id]=nw;
  localStorage.setItem('lf_merchant_passwords',JSON.stringify(storedPass));
  MERCHANT_ACCOUNTS[currentMerchant.id]=nw;
  document.getElementById('sec-cur').value='';
  document.getElementById('sec-new').value='';
  document.getElementById('sec-confirm').value='';
  toast('Password updated successfully!','success');
}

function subscribeNewsletter(){const email=document.getElementById('newsletter-email').value.trim();if(!email||!email.includes('@')){toast('Please enter a valid email','error');return;}toast('Subscribed! Welcome to the family.','success');document.getElementById('newsletter-email').value='';}
function selectPriceChip(btn, val) {
  document.querySelectorAll('.price-chip').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('pm-price').value = val;
}
function clearChipSelection() {
  document.querySelectorAll('.price-chip').forEach(b => b.classList.remove('on'));
}
function loadChartJS(cb){if(window.Chart){cb();return;}const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js';s.onload=cb;document.head.appendChild(s);}
function drawSalesChart(){
  const canvas=document.getElementById('salesChart');
  if(!canvas||!currentMerchant)return;
  const isAdmin=currentMerchant.id==='lostandfound';
  const myOrders=isAdmin?orders:orders.filter(o=>o.items.some(i=>i.brand===currentMerchant.id));
  const delivered=myOrders.filter(o=>o.status==='delivered');
  let totalSales=0,itemsSold=0;
  delivered.forEach(o=>{o.items.forEach(i=>{if(isAdmin||(i.brand===currentMerchant.id)){totalSales+=i.price*(i.qty||1);itemsSold+=(i.qty||1);}});});
  const avgPrice=itemsSold?Math.round(totalSales/itemsSold):0;
  const inProgress=myOrders.filter(o=>o.status!=='delivered').reduce((s,o)=>s+o.total,0);
  const panel=document.getElementById('merch-panel-analytics');
  let mc=document.getElementById('analytics-metrics');
  if(!mc){mc=document.createElement('div');mc.id='analytics-metrics';mc.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:1rem;margin-bottom:1.6rem';panel.insertBefore(mc,panel.firstChild);}
  mc.innerHTML=[
    {label:'Total Sales',val:fmtMoney(totalSales),icon:ICONS.creditCard,bg:'#dcf5eb',tc:'#076a35'},
    {label:'Items Sold',val:itemsSold+' pcs',icon:ICONS.package,bg:'#dbeafe',tc:'#1e40af'},
    {label:'Avg Per Item',val:fmtMoney(avgPrice),icon:ICONS.barChart,bg:'#fef3c7',tc:'#92400e'},
    {label:'In Progress',val:fmtMoney(inProgress),icon:ICONS.clock,bg:'#fee2e2',tc:'#991b1b'},
  ].map(m=>`<div style="background:${m.bg};border-radius:16px;padding:1.2rem;text-align:center"><div style="margin-bottom:.25rem;color:${m.tc};display:flex;justify-content:center;transform:scale(1.5)">${m.icon}</div><div style="font-family:'Bebas Neue',sans-serif;font-size:1.55rem;color:${m.tc}">${m.val}</div><div style="font-size:.68rem;color:${m.tc};opacity:.75;text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-top:.15rem">${m.label}</div></div>`).join('');
  loadChartJS(()=>{
    if(salesChart){salesChart.destroy();salesChart=null;}
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now=new Date();const labels=[];const data=[];
    for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);labels.push(months[d.getMonth()]);const ms=delivered.filter(o=>{const od=new Date(o.date);return od.getMonth()===d.getMonth()&&od.getFullYear()===d.getFullYear();}).reduce((s,o)=>s+o.total,0);data.push(ms);}
    const hasData=data.some(v=>v>0);
    const chartData=hasData?data:[1200,1800,1400,2200,1900,2800];
    const ctx=canvas.getContext('2d');
    const grad=ctx.createLinearGradient(0,0,0,240);
    grad.addColorStop(0,'rgba(200,169,110,0.28)');grad.addColorStop(1,'rgba(200,169,110,0.01)');
    salesChart=new Chart(canvas,{type:'line',data:{labels,datasets:[{label:'Revenue (₱)',data:chartData,borderColor:'#c8a96e',backgroundColor:grad,borderWidth:2.5,fill:true,tension:0.42,pointBackgroundColor:'#c8a96e',pointRadius:5,pointHoverRadius:7,pointBorderColor:'#fff',pointBorderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>'  ₱'+ctx.raw.toLocaleString()}}},scales:{x:{grid:{display:false},ticks:{font:{family:'Inter',size:12},color:'#8a8278'}},y:{ticks:{callback:v=>'₱'+v.toLocaleString(),font:{family:'Inter',size:12},color:'#8a8278'},grid:{color:'rgba(0,0,0,.04)'}}}}});
  });
}

document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();closeCheckout();closeSearchOverlay();['confirm-modal','merchant-modal','product-modal','brand-modal','review-modal'].forEach(id=>document.getElementById(id)?.classList.remove('on'));closeEventDetail();closeAllDropdowns();if(document.getElementById('welcome-modal')?.classList.contains('show'))closeWelcomeModal();if(document.getElementById('feedback-modal')?.style.display==='flex')closeFeedback();}if(e.key==='ArrowLeft')carouselMove(-1);if(e.key==='ArrowRight')carouselMove(1);if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openSearchOverlay();}});
window.addEventListener('scroll',()=>{document.getElementById('back-to-top')?.classList.toggle('show',window.scrollY>400);});
document.addEventListener('click',e=>{if(!e.target.closest('#customer-notif-wrapper')&&!e.target.closest('#merch-notif-wrap'))closeAllDropdowns();});

function init(){showSpinner(700);startCarouselTimer();const cs=document.getElementById('carousel-section');if(cs){cs.addEventListener('mouseenter',()=>clearInterval(carouselTimer));cs.addEventListener('mouseleave',startCarouselTimer);}setInterval(updateCountdown,1000);updateCountdown();initSearch();renderHome();renderOrders();updateCartUI();renderNotifs();loadChartJS(()=>{});
applyAdminImages();
setTimeout(showWelcomeModal,900);
}
// ── EVENTS DATA ──
let events = JSON.parse(localStorage.getItem('lf_events') || '[]');

function persistEvents() {
  localStorage.setItem('lf_events', JSON.stringify(events));
}

let activeEventFilter = 'all';

function getEventStatus(ev) {
  const today = new Date(); today.setHours(0,0,0,0);
  const evDate = new Date(ev.date); evDate.setHours(0,0,0,0);
  if (evDate > today) return 'upcoming';
  if (evDate.toDateString() === today.toDateString()) return 'ongoing';
  return 'past';
}

function filterEvents(type, btn) {
  activeEventFilter = type;
  document.querySelectorAll('#events-filter-bar .f-btn').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  renderEventsPage();
}

function renderEventsPage() {
  const el = document.getElementById('events-list');
  if (!el) return;
  let list = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (activeEventFilter !== 'all') list = list.filter(ev => getEventStatus(ev) === activeEventFilter);
  if (!list.length) {
    el.innerHTML = `<div class="events-empty"><div class="events-empty-icon" style="display:flex;justify-content:center;transform:scale(2.4);color:var(--g3)">${ICONS.tent}</div><div class="events-empty-text">No ${activeEventFilter === 'all' ? '' : activeEventFilter + ' '}events yet.<br>Check back soon!</div></div>`;
    return;
  }
  el.innerHTML = list.map(ev => makeEventCard(ev)).join('');
}

function makeEventCard(ev) {
  const status = getEventStatus(ev);
  const statusColors = { upcoming: '#d4edda;color:#155724', ongoing: '#fff3cd;color:#856404', past: 'var(--g2);color:var(--g4)' };
  const brand = getBrand(ev.brandId);
  const dateStr = ev.date ? new Date(ev.date + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const intKey = 'ev_int_' + ev.id;
  const interested = localStorage.getItem(intKey) === '1';
  return `<div class="event-card" onclick="openEventDetail('${ev.id}')" style="cursor:pointer" role="button" tabindex="0" onkeydown="if(event.key==='Enter'){openEventDetail('${ev.id}')}">
    <div class="event-card-banner">
      ${ev.img ? `<img src="${ev.img}" alt="${ev.title}" loading="lazy">` : `<div class="event-card-banner-placeholder" style="color:var(--g3);transform:scale(2.2)">${ICONS.tent}</div>`}
      <div style="position:absolute;top:.75rem;left:.75rem;background:${statusColors[status]};font-size:.72rem;font-weight:700;padding:.25rem .75rem;border-radius:20px;text-transform:uppercase;letter-spacing:.06em">${status}</div>
    </div>
    <div class="event-card-body">
      <div class="event-card-meta">
        <span class="event-meta-pill event-meta-date">${ICONS.calendar} ${dateStr}</span>
        ${ev.time ? `<span class="event-meta-pill event-meta-date">${ICONS.clock} ${ev.time}</span>` : ''}
        <span class="event-meta-pill event-meta-location">${ICONS.mapPin} ${ev.location}</span>
        <span class="event-meta-pill event-meta-brand">${ICONS.store} ${brand.name}</span>
      </div>
      <div class="event-card-title">${ev.title}</div>
      ${ev.desc ? `<div class="event-card-desc">${ev.desc}</div>` : ''}
      <div class="event-card-footer">
        <div class="event-card-posted-by">Posted by <strong>${brand.name}</strong></div>
        <button class="event-interested-btn ${interested ? 'on' : ''}" onclick="event.stopPropagation();toggleInterested('${ev.id}',this)">
          ${interested ? ICONS.star+' Interested' : 'Interested'}
        </button>
      </div>
    </div>
  </div>`;
}

function toggleInterested(evId, btn) {
  const key = 'ev_int_' + evId;
  const on = localStorage.getItem(key) === '1';
  localStorage.setItem(key, on ? '0' : '1');
  btn.classList.toggle('on', !on);
  btn.innerHTML = !on ? ICONS.star+' Interested' : 'Interested';
  toast(!on ? 'Marked as interested!' : 'Removed interest', !on ? 'success' : '');
}

function saveEvent() {
  if (!currentMerchant) return;
  const title = document.getElementById('ev-title').value.trim();
  const date = document.getElementById('ev-date').value;
  const time = document.getElementById('ev-time').value.trim();
  const location = document.getElementById('ev-location').value.trim();
  const desc = document.getElementById('ev-desc').value.trim();
  const img = document.getElementById('ev-img').value.trim();
  if (!title || !date || !location) { toast('Fill in Title, Date, and Location', 'error'); return; }
  const ev = { id: 'ev' + Date.now(), brandId: currentMerchant.id, title, date, time, location, desc, img, postedAt: new Date().toISOString() };
  events.unshift(ev);
  persistEvents();
  ['ev-title','ev-date','ev-time','ev-location','ev-desc','ev-img'].forEach(id => { document.getElementById(id).value = ''; });
  toast('Event posted!', 'success');
  addNotif('merchant', ICONS.calendar, 'Event "' + title + '" posted', null);
  renderMerchEventsPanel();
}

function renderBrandEvents(brandId) {
  const section = document.getElementById('brand-events-section');
  const el = document.getElementById('brand-events-list');
  if (!section || !el) return;
  const brandEvs = events.filter(e => e.brandId === brandId);
  if (!brandEvs.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  el.innerHTML = brandEvs.map(ev => {
    const status = getEventStatus(ev);
    const dateStr = ev.date ? new Date(ev.date + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const intKey = 'ev_int_' + ev.id;
    const interested = localStorage.getItem(intKey) === '1';
    const statusConfig = {
      upcoming: { bg:'#d4f4e8', color:'#0a6640', dot:'#12a05c', label:'Upcoming' },
      ongoing:  { bg:'#fff3cd', color:'#7a5200', dot:'#e6a817', label:'Ongoing' },
      past:     { bg:'#f0ede8', color:'#6b6460', dot:'#b0aaa4', label:'Past' }
    };
    const st = statusConfig[status];
    return `<div onclick="openEventDetail('${ev.id}')" style="background:#fff;border:1px solid #e8e4dc;border-radius:16px;margin-bottom:1rem;overflow:hidden;display:flex;cursor:pointer;transition:box-shadow .2s ease,transform .2s ease" onmouseover="this.style.boxShadow='0 8px 32px rgba(0,0,0,.1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='none';this.style.transform='none'">
      <div style="width:160px;min-height:140px;flex-shrink:0;background:#1a1a18;position:relative;overflow:hidden">
        <img src="${ev.img}" onclick="event.stopPropagation();openImgLightbox('${ev.img}')" style="width:100%;height:100%;object-fit:cover;opacity:.85;display:block;position:absolute;inset:0;cursor:zoom-in" alt="${ev.title}">
        <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,.35) 0%,transparent 60%)"></div>
      </div>
      <div style="flex:1;padding:1.1rem 1.3rem;display:flex;flex-direction:column;justify-content:space-between;min-width:0">
        <div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem;flex-wrap:wrap">
            <span style="display:inline-flex;align-items:center;gap:.3rem;font-size:.72rem;font-weight:600;padding:.22rem .7rem;border-radius:20px;background:${st.bg};color:${st.color};letter-spacing:.04em">
              <span style="width:6px;height:6px;border-radius:50%;background:${st.dot};flex-shrink:0"></span>${st.label}
            </span>
            <span style="font-size:.75rem;color:#8a8278;display:flex;align-items:center;gap:.3rem">
              ${ICONS.calendar}
              ${dateStr}
            </span>
            ${ev.time ? `<span style="font-size:.75rem;color:#8a8278;display:flex;align-items:center;gap:.3rem">${ICONS.clock}${ev.time}</span>` : ''}
          </div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:1.45rem;line-height:1.15;color:#0c0b09;margin-bottom:.35rem;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${ev.title}</div>
          <div style="font-size:.82rem;color:#8a8278;display:flex;align-items:center;gap:.3rem;margin-bottom:.3rem">
            ${ICONS.mapPin}
            ${ev.location}
          </div>
          ${ev.desc ? `<div style="font-size:.82rem;color:#6b6460;line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${ev.desc}</div>` : ''}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:.8rem;padding-top:.7rem;border-top:1px solid #f0ede8" onclick="event.stopPropagation()">
          <span style="font-size:.8rem;color:#c8a96e;font-weight:600;cursor:pointer;letter-spacing:.02em" onclick="openEventDetail('${ev.id}')">View details</span>
          <button onclick="toggleInterestedFromCard('${ev.id}',this);event.stopPropagation()" style="display:inline-flex;align-items:center;gap:.35rem;background:${interested?'#c8a96e':'transparent'};color:${interested?'#0c0b09':'#8a8278'};border:1.5px solid ${interested?'#c8a96e':'#d4cfc8'};padding:.3rem .85rem;font-family:'Inter',sans-serif;font-size:.78rem;font-weight:600;border-radius:20px;cursor:pointer;transition:all .18s">
            ${ICONS.star}
            Interested
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function deleteEvent(evId) {
  if (!confirm('Delete this event?')) return;
  events = events.filter(e => e.id !== evId);
  persistEvents();
  toast('Event deleted');
  renderMerchEventsPanel();
}

function renderMerchEventsPanel() {
  if (!currentMerchant) return;
  const el = document.getElementById('merch-events-list');
  if (!el) return;
  const myEvents = events.filter(e => e.brandId === currentMerchant.id);
  if (!myEvents.length) {
    el.innerHTML = '<div style="color:var(--g4);font-size:.875rem;padding:1rem">No events posted yet.</div>';
    return;
  }
  el.innerHTML = myEvents.map(ev => {
    const status = getEventStatus(ev);
    const dateStr = ev.date ? new Date(ev.date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    return `<div style="background:var(--g1);border:1px solid var(--g2);border-radius:var(--r2);padding:1.1rem;margin-bottom:.9rem;display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap">
      <div>
        <div style="font-family:'Bebas Neue';font-size:1.2rem">${ev.title}</div>
        <div style="font-size:.82rem;color:var(--g4);margin-top:.25rem">${ICONS.calendar} ${dateStr} ${ev.time ? '· '+ICONS.clock+' ' + ev.time : ''}</div>
        <div style="font-size:.82rem;color:var(--g4)">${ICONS.mapPin} ${ev.location}</div>
        <div style="margin-top:.4rem"><span style="font-size:.72rem;font-weight:700;padding:.2rem .65rem;border-radius:20px;background:${status==='upcoming'?'#d4edda':status==='ongoing'?'#fff3cd':'var(--g2)'};color:${status==='upcoming'?'#155724':status==='ongoing'?'#856404':'var(--g4)'};text-transform:uppercase;letter-spacing:.05em">${status}</span></div>
      </div>
      <button class="tbl-action danger" onclick="deleteEvent('${ev.id}')">Delete</button>
    </div>`;
  }).join('');
}
let currentEventDetailId = null;

function openEventDetail(evId) {
  const ev = events.find(e => e.id === evId);
  if (!ev) return;
  currentEventDetailId = evId;
  const brand = getBrand(ev.brandId);
  const status = getEventStatus(ev);
  const dateStr = ev.date ? new Date(ev.date + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const statusColors = { upcoming: 'background:#d4edda;color:#155724', ongoing: 'background:#fff3cd;color:#856404', past: 'background:var(--g2);color:var(--g4)' };
  const intKey = 'ev_int_' + evId;
  const interested = localStorage.getItem(intKey) === '1';
  const img = document.getElementById('edm-img');
  const placeholder = document.getElementById('edm-placeholder');
  if (ev.img) { img.src = ev.img; img.style.display = 'block'; placeholder.style.display = 'none'; }
  else { img.style.display = 'none'; placeholder.style.display = 'flex'; }
  const badge = document.getElementById('edm-status-badge');
  badge.textContent = status;
  badge.style.cssText = 'position:absolute;top:1rem;left:1rem;font-size:.72rem;font-weight:700;padding:.3rem .85rem;border-radius:20px;text-transform:uppercase;letter-spacing:.08em;' + statusColors[status];
  document.getElementById('edm-brand-pill').innerHTML = ICONS.store+' ' + brand.name;
  document.getElementById('edm-title').textContent = ev.title;
  document.getElementById('edm-meta').innerHTML = `
    <span style="font-size:.78rem;font-weight:600;padding:.3rem .85rem;border-radius:20px;background:#fff3cd;color:#856404">${ICONS.calendar} ${dateStr}</span>
    ${ev.time ? `<span style="font-size:.78rem;font-weight:600;padding:.3rem .85rem;border-radius:20px;background:#d1ecf1;color:#0c5460">${ICONS.clock} ${ev.time}</span>` : ''}
    <span style="font-size:.78rem;font-weight:600;padding:.3rem .85rem;border-radius:20px;background:var(--g1);color:var(--g5);border:1px solid var(--g2)">${ICONS.mapPin} ${ev.location}</span>
  `;
  const descEl = document.getElementById('edm-desc');
  descEl.textContent = ev.desc || '';
  descEl.style.display = ev.desc ? 'block' : 'none';
  const btn = document.getElementById('edm-interest-btn');
  btn.innerHTML = interested ? ICONS.star+' Interested' : 'Mark as Interested';
  btn.style.background = interested ? 'var(--black)' : 'var(--accent)';
  btn.style.color = interested ? '#fff' : 'var(--black)';
  document.getElementById('event-detail-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  openA11yPanel(document.querySelector('#event-detail-modal > div'));
}

function closeEventDetail() {
  document.getElementById('event-detail-modal').style.display = 'none';
  document.body.style.overflow = '';
  currentEventDetailId = null;
  closeA11yPanel();
}

function toggleInterestedModal() {
  if (!currentEventDetailId) return;
  const key = 'ev_int_' + currentEventDetailId;
  const on = localStorage.getItem(key) === '1';
  localStorage.setItem(key, on ? '0' : '1');
  const btn = document.getElementById('edm-interest-btn');
  btn.innerHTML = !on ? ICONS.star+' Interested' : 'Mark as Interested';
  btn.style.background = !on ? 'var(--black)' : 'var(--accent)';
  btn.style.color = !on ? '#fff' : 'var(--black)';
  toast(!on ? 'Marked as interested!' : 'Removed interest', !on ? 'success' : '');
  renderEventsPage();
}

function toggleInterestedFromCard(evId, btn) {
  const key = 'ev_int_' + evId;
  const on = localStorage.getItem(key) === '1';
  localStorage.setItem(key, on ? '0' : '1');
  btn.innerHTML = !on ? ICONS.star+' Interested' : ICONS.star+' Interested';
  btn.style.background = !on ? 'var(--accent)' : 'none';
  btn.style.color = !on ? 'var(--black)' : 'var(--g4)';
  btn.style.borderColor = !on ? 'var(--accent)' : 'var(--g2)';
  toast(!on ? 'Marked as interested!' : 'Removed interest', !on ? 'success' : '');
}

function openImgLightbox(src) {
  if (!src) return;
  const lb = document.createElement('div');
  lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:2rem;backdrop-filter:blur(6px)';
  lb.innerHTML = `<img src="${src}" style="max-width:90vw;max-height:88vh;border-radius:12px;object-fit:contain;box-shadow:0 24px 80px rgba(0,0,0,.5)" onclick="event.stopPropagation()"><button onclick="this.closest('div').remove()" aria-label="Close image" style="position:absolute;top:1.2rem;right:1.2rem;background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.3);color:#fff;width:42px;height:42px;border-radius:50%;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)">✕</button>`;
  lb.onclick = () => lb.remove();
  document.body.appendChild(lb);
}

function editBrandDesc(brandId){
  document.getElementById('brand-desc-display').style.display='none';
  document.getElementById('brand-desc-edit').style.display='block';
  document.getElementById('brand-desc-ta').focus();
}
function saveBrandDesc(brandId){
  const txt=document.getElementById('brand-desc-ta').value.trim();
  const b=BRANDS.find(x=>x.id===brandId);
  if(b){b.desc=txt;if(currentMerchant&&currentMerchant.id===brandId)currentMerchant.desc=txt;}
  persist();
  toast('Description updated!','success');
  showBrand(brandId);
}


document.addEventListener('DOMContentLoaded',init);
function handleEvImgUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const data = e.target.result;
    document.getElementById('ev-img').value = data;
    const preview = document.getElementById('ev-preview');
    const area = document.getElementById('ev-upload-area');
    preview.src = data;
    preview.style.display = 'block';
    area.classList.add('has-image');
    toast('Image loaded!', 'success');
  };
  reader.readAsDataURL(file);
}

function openFeedback(){document.getElementById('feedback-modal').style.display='flex';openA11yPanel(document.querySelector('#feedback-modal > div'));}
function closeFeedback(){document.getElementById('feedback-modal').style.display='none';document.getElementById('fb-name').value='';document.getElementById('fb-msg').value='';document.getElementById('fb-type').value='suggestion';closeA11yPanel();}
function submitFeedback(){
  const name=document.getElementById('fb-name').value.trim();
  const msg=document.getElementById('fb-msg').value.trim();
  const type=document.getElementById('fb-type').value;
  if(!name){toast('Please enter your name','error');document.getElementById('fb-name').focus();return;}
  if(!msg){toast('Please write a message','error');document.getElementById('fb-msg').focus();return;}
  const feedbacks=JSON.parse(localStorage.getItem('lf_feedbacks')||'[]');
  feedbacks.unshift({name,type,msg,time:new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})+' '+nowTime()});
  localStorage.setItem('lf_feedbacks',JSON.stringify(feedbacks));
  toast('Feedback sent! Thank you '+name,'success');
  closeFeedback();
}


function submitTestimonialRequest(){
  const name=document.getElementById('tr-name').value.trim();
  const loc=document.getElementById('tr-loc').value.trim();
  const rating=parseInt(document.getElementById('tr-rating').value);
  const text=document.getElementById('tr-text').value.trim();
  if(!name||!loc||!text){toast('Fill all required fields','error');return;}
  TESTIMONIAL_REQUESTS.unshift({id:'treq'+Date.now(),brandId:currentMerchant.id,brandName:currentMerchant.name,name,location:loc,rating,text,avatar:name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(),status:'pending',submittedAt:new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})});
  persist();
  toast('Testimonial request submitted! Waiting for admin approval.','success');
  ['tr-name','tr-loc','tr-text'].forEach(id=>document.getElementById(id).value='');
  renderMerchTestimRequestsList();
}

function renderMerchTestimRequestsList(){
  const el=document.getElementById('merch-testim-requests-list');
  if(!el)return;
  const myReqs=TESTIMONIAL_REQUESTS.filter(r=>r.brandId===currentMerchant?.id);
  if(!myReqs.length){el.innerHTML='<div style="color:var(--g4);font-size:.875rem;padding:1rem">No requests submitted yet.</div>';return;}
  el.innerHTML=myReqs.map(r=>`
    <div style="background:var(--g1);border:1px solid var(--g2);border-radius:var(--r2);padding:1.1rem;margin-bottom:.9rem">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;margin-bottom:.5rem">
        <div style="font-size:.9rem;font-weight:700">${r.name} · ${r.location}</div>
        <span style="font-size:.72rem;font-weight:700;padding:.2rem .65rem;border-radius:20px;background:${r.status==='approved'?'#dcf5eb':r.status==='rejected'?'#fee2e2':'#fef3c7'};color:${r.status==='approved'?'#076a35':r.status==='rejected'?'#991b1b':'#92400e'};text-transform:uppercase">${r.status}</span>
      </div>
      <div style="color:var(--accent-ink);font-size:.85rem;margin-bottom:.35rem">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      <div style="font-size:.875rem;color:var(--g5);line-height:1.6;font-style:italic">"${r.text}"</div>
      <div style="font-size:.75rem;color:var(--g4);margin-top:.4rem">Submitted: ${r.submittedAt}</div>
    </div>
  `).join('');
}

function adminAddTestimonial(){
  const name=document.getElementById('at-name').value.trim();
  const loc=document.getElementById('at-loc').value.trim();
  const rating=parseInt(document.getElementById('at-rating').value);
  const text=document.getElementById('at-text').value.trim();
  if(!name||!loc||!text){toast('Fill all required fields','error');return;}
  TESTIMONIALS.push({id:'t'+Date.now(),name,location:loc,rating,text,avatar:name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(),approved:true});
  persist();
  toast('Testimonial added to homepage!','success');
  ['at-name','at-loc','at-text'].forEach(id=>document.getElementById(id).value='');
  renderFeedbackPanel();
  renderHome();
}

function approveTestimonialRequest(reqId){
  const req=TESTIMONIAL_REQUESTS.find(r=>r.id===reqId);
  if(!req)return;
  req.status='approved';
  TESTIMONIALS.push({id:'t'+Date.now(),name:req.name,location:req.location,rating:req.rating,text:req.text,avatar:req.avatar,approved:true});
  persist();
  toast('Testimonial approved and added to homepage!','success');
  renderFeedbackPanel();
  renderHome();
}

function rejectTestimonialRequest(reqId){
  const req=TESTIMONIAL_REQUESTS.find(r=>r.id===reqId);
  if(!req)return;
  req.status='rejected';
  persist();
  toast('Request rejected','error');
  renderFeedbackPanel();
}

function deleteTestimonial(id){
  if(!confirm('Remove this testimonial from the homepage?'))return;
  TESTIMONIALS=TESTIMONIALS.filter(t=>t.id!==id);
  persist();
  toast('Testimonial removed');
  renderFeedbackPanel();
  renderHome();
}

function renderFeedbackPanel(){
  const isAdmin=currentMerchant?.id==='lostandfound';

  // Admin testimonial requests
  const adminReqEl=document.getElementById('admin-testim-requests-list');
  if(adminReqEl&&isAdmin){
    const pending=TESTIMONIAL_REQUESTS.filter(r=>r.status==='pending');
    if(!pending.length){adminReqEl.innerHTML='<div style="color:var(--g4);font-size:.875rem;padding:.5rem 0 1rem">No pending requests.</div>';}
    else{adminReqEl.innerHTML=pending.map(r=>`
      <div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.2rem;margin-bottom:.9rem;box-shadow:var(--shadow)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.5rem;margin-bottom:.5rem">
          <div>
            <div style="font-size:.9rem;font-weight:700">${r.name} · ${r.location}</div>
            <div style="font-size:.78rem;color:var(--g4)">From: ${r.brandName} · ${r.submittedAt}</div>
          </div>
          <div style="display:flex;gap:.5rem">
            <button class="tbl-action" onclick="approveTestimonialRequest('${r.id}')">Approve</button>
            <button class="tbl-action danger" onclick="rejectTestimonialRequest('${r.id}')">Reject</button>
          </div>
        </div>
        <div style="color:var(--accent-ink);font-size:.85rem;margin-bottom:.35rem">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        <div style="font-size:.875rem;color:var(--g5);line-height:1.6;font-style:italic">"${r.text}"</div>
      </div>
    `).join('');}
  }

  // Current testimonials list (admin only)
  const adminTestimEl=document.getElementById('admin-testimonials-list');
  if(adminTestimEl&&isAdmin){
    adminTestimEl.innerHTML=TESTIMONIALS.filter(t=>t.approved).map(t=>`
      <div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.1rem;margin-bottom:.9rem;display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;box-shadow:var(--shadow)">
        <div style="flex:1">
          <div style="font-size:.9rem;font-weight:700;margin-bottom:.2rem">${t.name} · ${t.location}</div>
          <div style="color:var(--accent-ink);font-size:.82rem;margin-bottom:.3rem">${'★'.repeat(t.rating)}${'☆'.repeat(5-t.rating)}</div>
          <div style="font-size:.875rem;color:var(--g5);font-style:italic">"${t.text}"</div>
        </div>
        <button class="tbl-action danger" onclick="deleteTestimonial('${t.id}')">Delete</button>
      </div>
    `).join('')||'<div style="color:var(--g4);font-size:.875rem;padding:.5rem 0">No testimonials yet.</div>';
  }

  // Customer feedback
  const el=document.getElementById('feedback-list');
  if(!el)return;
  const feedbacks=JSON.parse(localStorage.getItem('lf_feedbacks')||'[]');
  if(!feedbacks.length){el.innerHTML='<div style="color:var(--g4);font-size:.875rem;padding:1rem">No feedback yet.</div>';return;}
  el.innerHTML=feedbacks.map((f,i)=>`
    <div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.2rem;margin-bottom:.9rem;box-shadow:var(--shadow)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;flex-wrap:wrap;gap:.4rem">
        <div style="font-size:.95rem;font-weight:700">${f.name}</div>
        <div style="font-size:.75rem;color:var(--g4)">${f.time}</div>
      </div>
      <div style="margin-bottom:.5rem"><span style="font-size:.72rem;font-weight:700;padding:.2rem .65rem;border-radius:20px;background:${f.type==='complaint'?'#fee2e2':f.type==='compliment'?'#dcf5eb':f.type==='suggestion'?'#fef3c7':'var(--g2)'};color:${f.type==='complaint'?'#991b1b':f.type==='compliment'?'#076a35':f.type==='suggestion'?'#92400e':'var(--g5)'};text-transform:uppercase;letter-spacing:.06em">${f.type}</span></div>
      <div style="font-size:.875rem;color:var(--g5);line-height:1.6">${f.msg}</div>
    </div>
  `).join('');
}


function previewEvImgFromUrl(url) {
  const preview = document.getElementById('ev-preview');
  const area = document.getElementById('ev-upload-area');
  if (url && (url.startsWith('http') || url.startsWith('data:'))) {
    preview.src = url;
    preview.style.display = 'block';
    area.classList.add('has-image');
    preview.onerror = () => { preview.style.display = 'none'; area.classList.remove('has-image'); };
  } else {
    preview.src = '';
    preview.style.display = 'none';
    area.classList.remove('has-image');
  }
}

function adminUploadHero(input) {
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    if(currentMerchant?.id==='lostandfound'){const bg=document.querySelector('.home-hero-bg');if(bg)bg.style.backgroundImage=`url('${e.target.result}')`;localStorage.setItem('lf_admin_hero_bg',e.target.result);toast('Hero background updated!','success');}
    else submitForApproval('hero',e.target.result,null,'Hero Background');
  };
  reader.readAsDataURL(file);
}

function adminUploadMascot(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const m = document.getElementById('hero-mascot');
    if (m) { m.src = e.target.result; m.style.display = 'block'; }
    localStorage.setItem('lf_admin_mascot', e.target.result);
    toast('Mascot updated!', 'success');
  };
  reader.readAsDataURL(file);
}

function adminUploadLogo(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const logo = document.querySelector('.topbar-brand img');
    if (logo) { logo.src = e.target.result; logo.style.display = 'block'; }
    localStorage.setItem('lf_admin_logo', e.target.result);
    toast('Logo updated!', 'success');
  };
  reader.readAsDataURL(file);
}

function adminUploadCarousel(input,slideIdx) {
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    if(currentMerchant?.id==='lostandfound'){const slides=document.querySelectorAll('.carousel-slide .cs-bg');if(slides[slideIdx])slides[slideIdx].style.backgroundImage=`url('${e.target.result}')`;const saved=JSON.parse(localStorage.getItem('lf_admin_carousel')||'[]');saved[slideIdx]=e.target.result;localStorage.setItem('lf_admin_carousel',JSON.stringify(saved));toast('Carousel slide '+(slideIdx+1)+' updated!','success');}
    else submitForApproval('carousel',e.target.result,slideIdx,'Carousel Slide '+(slideIdx+1));
  };
  reader.readAsDataURL(file);
}

function adminUploadArrivalsBanner(input) {
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    if(currentMerchant?.id==='lostandfound'){const bg=document.querySelector('.arrivals-banner-bg');if(bg)bg.style.backgroundImage=`url('${e.target.result}')`;localStorage.setItem('lf_admin_arrivals_bg',e.target.result);toast('Arrivals banner updated!','success');}
    else submitForApproval('arrivals',e.target.result,null,'Arrivals Banner');
  };
  reader.readAsDataURL(file);
}

function adminUploadEventsBanner(input) {
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    if(currentMerchant?.id==='lostandfound'){const bg=document.querySelector('.events-banner-bg');if(bg)bg.style.backgroundImage=`url('${e.target.result}')`;localStorage.setItem('lf_admin_events_bg',e.target.result);toast('Events banner updated!','success');}
    else submitForApproval('events',e.target.result,null,'Events Banner');
  };
  reader.readAsDataURL(file);
}

function adminResetAllImages() {
  if (!confirm('Reset ALL custom images back to defaults?')) return;
  ['lf_admin_hero_bg','lf_admin_mascot','lf_admin_logo','lf_admin_carousel','lf_admin_arrivals_bg','lf_admin_events_bg'].forEach(k => localStorage.removeItem(k));
  toast('All images reset to defaults. Reload the page.', 'success');
  setTimeout(() => location.reload(), 1500);
}

function adminAddBrand(){
  const id=document.getElementById('nb-id').value.trim().toLowerCase().replace(/\s+/g,'');
  const name=document.getElementById('nb-name').value.trim();
  const tag=document.getElementById('nb-tag').value;
  const loc=document.getElementById('nb-loc').value.trim();
  const year=document.getElementById('nb-year').value.trim();
  const ig=document.getElementById('nb-ig').value.trim();
  const desc=document.getElementById('nb-desc').value.trim();
  const pass=document.getElementById('nb-pass').value;
  if(!id||!name){toast('Brand ID and Name are required','error');return;}
  if(BRANDS.find(b=>b.id===id)){toast('Brand ID already exists! Use a different ID.','error');return;}
  BRANDS.push({id,name,tag,desc,img:'',color:'#111',location:loc,year,schedule:'',instagram:ig,follows:0});
  MERCHANT_ACCOUNTS[id]=pass;
  persist();
  toast('Brand "'+name+'" added! They can now log in with password: '+pass,'success');
  ['nb-id','nb-name','nb-loc','nb-year','nb-ig','nb-desc'].forEach(x=>document.getElementById(x).value='');
  document.getElementById('nb-pass').value='';
  renderAdminBrandsList();
}

function adminDeleteBrand(brandId){
  const b=getBrand(brandId);
  if(!confirm('Delete brand "'+b.name+'"? This will also remove all their products!'))return;
  BRANDS=BRANDS.filter(x=>x.id!==brandId);
  PRODUCTS=PRODUCTS.filter(p=>p.brand!==brandId);
  delete MERCHANT_ACCOUNTS[brandId];
  persist();
  toast('Brand deleted','success');
  renderAdminBrandsList();
}

function renderAdminBrandsList(){
  const el=document.getElementById('admin-brands-list');
  if(!el)return;
  const list=BRANDS.filter(b=>b.id!=='admin');
  el.innerHTML=list.map(b=>{
    const count=PRODUCTS.filter(p=>p.brand===b.id).length;
    return `<div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.1rem;margin-bottom:.9rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;box-shadow:var(--shadow)">
      <div style="width:46px;height:46px;border-radius:10px;overflow:hidden;background:var(--g2);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--g4)">${b.img?`<img src="${b.img}" style="width:100%;height:100%;object-fit:cover">`:ICONS.tag}</div>
      <div style="flex:1;min-width:120px">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:1.15rem">${b.name}</div>
        <div style="font-size:.78rem;color:var(--g4)">${b.id} · ${b.tag} · ${count} products · ${ICONS.mapPin} ${b.location||'Batangas'}</div>
      </div>
      <span style="font-size:.72rem;font-weight:700;padding:.22rem .75rem;border-radius:20px;background:var(--g1);border:1px solid var(--g2);color:var(--g5);text-transform:uppercase">${b.tag}</span>
      <button class="tbl-action danger" onclick="adminDeleteBrand('${b.id}')">Delete</button>
    </div>`;
  }).join('');
}

function applyAdminImages() {
  const hero = localStorage.getItem('lf_admin_hero_bg');
  if (hero) { const bg = document.querySelector('.home-hero-bg'); if (bg) bg.style.backgroundImage = `url('${hero}')`; }

  const mascot = localStorage.getItem('lf_admin_mascot');
  if (mascot) { const m = document.getElementById('hero-mascot'); if (m) { m.src = mascot; m.style.display = 'block'; } }

  const logo = localStorage.getItem('lf_admin_logo');
  if (logo) { const l = document.querySelector('.topbar-brand img'); if (l) { l.src = logo; l.style.display = 'block'; } }

  const carousel = JSON.parse(localStorage.getItem('lf_admin_carousel') || '[]');
  const slides = document.querySelectorAll('.carousel-slide .cs-bg');
  carousel.forEach((src, i) => { if (src && slides[i]) slides[i].style.backgroundImage = `url('${src}')`; });

  const arrivals = localStorage.getItem('lf_admin_arrivals_bg');
  if (arrivals) { const bg = document.querySelector('.arrivals-banner-bg'); if (bg) bg.style.backgroundImage = `url('${arrivals}')`; }

  const eventsBg = localStorage.getItem('lf_admin_events_bg');
  if (eventsBg) { const bg = document.querySelector('.events-banner-bg'); if (bg) bg.style.backgroundImage = `url('${eventsBg}')`; }
}
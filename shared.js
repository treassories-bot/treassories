/* ═══════════════════════════════════════════════════════════
   TREASSORIES — Shared site logic
   Loaded on every page. Injects header/cart/login/checkout/footer,
   and holds all cart/login/checkout/search functions.
   ═══════════════════════════════════════════════════════════ */

const API_BASE = '/api';
const CART_KEY = 'treassories_cart';
const USER_KEY = 'treassories_user';

let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
let user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
let pendingCheckout = false;
let selectedPay = 'cod';
window.__productCache = window.__productCache || {};

function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function saveUser(){ localStorage.setItem(USER_KEY, JSON.stringify(user)); }
function cacheProducts(list){ (list||[]).forEach(p=>window.__productCache[p.id]=p); }

/* ═══════════ INJECT HEADER / CART / MODALS / FOOTER ═══════════ */
function currentPage(){ return (location.pathname.split('/').pop()||'index.html').replace('.html',''); }

function navHTML(){
  const page = currentPage();
  const active = n => page===n ? ' class="nav-active"' : '';
  return `
<nav>
  <div class="nav-left">
    <button class="menu-btn" id="menuBtn" onclick="openSidebar()" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
    <a href="index.html" class="logo" style="text-decoration:none">TREASS<b>ORIES</b></a>
  </div>

  <ul class="nav-links">
    <li><a href="index.html#collections">Collections</a></li>
    <li><a href="men.html"${active('men')}>Men</a></li>
    <li><a href="women.html"${active('women')}>Women</a></li>
  </ul>

  <div class="search-wrap">
    <input type="text" class="search-bar" id="searchInput" placeholder="Search products...">
    <div class="search-results" id="searchResults"></div>
  </div>

  <div class="nav-icons">
    <button class="icon-btn" id="userBtn" onclick="openLogin()">◈</button>
    <button class="icon-btn" onclick="toggleCart()">◇<span class="cart-count" id="cartCount">0</span></button>
  </div>
</nav>`;
}
function chromeHTML(){
  return `function chromeHTML(){
  return `
<!-- ═══ SIDEBAR MENU ═══ -->
<div class="side-backdrop" id="sideBackdrop" onclick="closeSidebar()"></div>

<aside class="side-menu" id="sideMenu" aria-hidden="true">
  <div class="side-head">
    <a href="index.html" class="side-logo" onclick="closeSidebar()">TREASS<b>ORIES</b></a>
    <button class="side-close" onclick="closeSidebar()" aria-label="Close menu">✕</button>
  </div>

  <div class="side-search">
    <input type="text" id="sideSearchInput" placeholder="Search products...">
    <div class="side-results" id="sideSearchResults"></div>
  </div>

  <div class="side-links">
    <a href="index.html" onclick="closeSidebar()"><span>01</span> Home</a>
    <a href="index.html#collections" onclick="closeSidebar()"><span>02</span> Collections</a>
    <a href="men.html" onclick="closeSidebar()"><span>03</span> Men</a>
    <a href="women.html" onclick="closeSidebar()"><span>04</span> Women</a>
  </div>

  <div class="side-actions">
    <button onclick="closeSidebar();openLogin()">Account</button>
    <button onclick="closeSidebar();toggleCart()">Open Bag</button>
  </div>

  <div class="side-note">
    <b>Premium Accessories</b>
    <p>Timeless pieces for men and women, crafted for everyday luxury.</p>
  </div>
</aside>
  <!-- ═══ CART ═══ -->
<div class="drawer" id="cartDrawer">
  <div class="drawer-head"><h2>YOUR BAG</h2><button class="close-x" onclick="toggleCart()">✕</button></div>
  <div class="drawer-items" id="cartItems"></div>
  <div class="drawer-foot">
    <div class="total-row"><span>Total</span><span id="cartTotal">₹0</span></div>
    <button class="btn-lux btn-fill w100" onclick="startCheckout()">Proceed to Checkout</button>
  </div>
</div>

<!-- ═══ LOGIN ═══ -->
<div class="overlay" id="loginOverlay">
  <div class="modal">
    <div id="loginMain">
      <h2>Welcome to <em class="gold">Treassories</em></h2>
      <p class="sub">Please log in before shopping</p>
      <button class="login-opt" onclick="socialLogin('Google')"><span class="lo-icon">🔴</span> Continue with Google</button>
      <button class="login-opt" onclick="socialLogin('Facebook')"><span class="lo-icon">🔵</span> Continue with Facebook</button>
      <button class="login-opt" onclick="showLoginView('phoneView')"><span class="lo-icon">📱</span> Continue with Phone (OTP)</button>
      <button class="login-opt" onclick="showLoginView('emailView')"><span class="lo-icon">✉️</span> Continue with Email</button>
      <p style="text-align:center;margin-top:1rem"><button class="back-link" onclick="closeOverlay('loginOverlay')">CANCEL</button></p>
    </div>
    <div id="phoneView" class="hidden">
      <button class="back-link" onclick="showLoginView('loginMain')">← BACK</button>
      <h2>Phone Login</h2><p class="sub">OTP will be sent to your number</p>
      <div id="phoneStep1">
        <div class="field"><label>MOBILE NUMBER</label><input type="tel" id="phoneInput" maxlength="10" placeholder="10-digit number"></div>
        <button class="btn-lux btn-fill w100" onclick="sendOTP()">Send OTP</button>
      </div>
      <div id="phoneStep2" class="hidden">
        <p class="sub">OTP sent to <b class="gold" id="otpHint"></b> (demo: <b>1234</b>)</p>
        <div class="otp-row"><input maxlength="1" class="otp-in"><input maxlength="1" class="otp-in"><input maxlength="1" class="otp-in"><input maxlength="1" class="otp-in"></div>
        <button class="btn-lux btn-fill w100" onclick="verifyOTP()">Verify & Login</button>
      </div>
    </div>
    <div id="emailView" class="hidden">
      <button class="back-link" onclick="showLoginView('loginMain')">← BACK</button>
      <h2>Email Login</h2><p class="sub">Please fill in your details</p>
      <div class="field"><label>FULL NAME</label><input id="emailName" placeholder="Your name"></div>
      <div class="field"><label>EMAIL</label><input type="email" id="emailInput" placeholder="you@example.com"></div>
      <div class="field"><label>PASSWORD</label>
        <div class="pw-wrap">
          <input type="password" id="passInput" placeholder="••••••••">
          <button type="button" class="pw-toggle" onclick="togglePw('passInput',this)">👁</button>
        </div>
      </div>
      <button class="btn-lux btn-fill w100" onclick="emailLogin()">Login / Sign Up</button>
    </div>
  </div>
</div>

<!-- ═══ CHECKOUT ═══ -->
<div class="overlay" id="checkoutOverlay">
  <div class="modal">
    <div class="steps">
      <div class="step active" id="st1"><div class="dot">I</div><small>Address</small></div>
      <div class="step" id="st2"><div class="dot">II</div><small>Payment</small></div>
      <div class="step" id="st3"><div class="dot">III</div><small>Done</small></div>
    </div>
    <div id="ckStep1">
      <h2 style="font-size:1.2rem;text-align:left;margin-bottom:1.3rem">Delivery Address</h2>
      <div class="field"><label>FULL NAME</label><input id="adName" placeholder="Receiver's name"></div>
      <div class="field"><label>PHONE</label><input id="adPhone" maxlength="10" placeholder="Delivery number"></div>
      <div class="field"><label>EMAIL</label><input type="email" id="adEmail" placeholder="you@example.com"></div>
      <div class="field"><label>FULL ADDRESS</label><textarea id="adAddr" rows="2" placeholder="House no, Street, Area"></textarea></div>
      <div style="display:flex;gap:1rem">
        <div class="field" style="flex:1"><label>CITY</label><input id="adCity"></div>
        <div class="field" style="flex:1"><label>PINCODE</label><input id="adPin" maxlength="6"></div>
      </div>
      <div class="field"><label>STATE</label><select id="adState"><option value="">Select State</option>
        <option>Delhi</option><option>Maharashtra</option><option>Uttar Pradesh</option><option>Karnataka</option>
        <option>Gujarat</option><option>Rajasthan</option><option>Punjab</option><option>West Bengal</option>
        <option>Tamil Nadu</option><option>Other</option></select></div>
      <button class="login-opt" style="justify-content:center" onclick="useLocation()">📡 Use My Current Location</button>
      <button class="btn-lux btn-fill w100" onclick="goToPayment()">Continue to Payment</button>
      <p style="text-align:center;margin-top:1rem"><button class="back-link" onclick="closeOverlay('checkoutOverlay')">CANCEL</button></p>
    </div>
    <div id="ckStep2" class="hidden">
      <button class="back-link" onclick="ckShow(1)">← BACK TO ADDRESS</button>
      <h2 style="font-size:1.2rem;text-align:left;margin-bottom:1.3rem">Payment Method</h2>
      <div class="pay-opt sel" data-pay="cod" onclick="selPay(this)"><div class="radio"></div><span>💵 Cash on Delivery</span><span class="cod-tag">RECOMMENDED</span></div>
      <div class="pay-opt" data-pay="upi" onclick="selPay(this)"><div class="radio"></div><span>📲 UPI (GPay / PhonePe / Paytm)</span></div>
      <div class="pay-opt" data-pay="card" onclick="selPay(this)"><div class="radio"></div><span>💳 Credit / Debit Card</span></div>
      <div class="pay-opt" data-pay="wallet" onclick="selPay(this)"><div class="radio"></div><span>👛 Wallets</span></div>
      <div class="summary-box" id="orderSummary"></div>
      <button class="btn-lux btn-fill w100" onclick="placeOrder()">Place Order</button>
      <p style="text-align:center;margin-top:1rem"><button class="back-link" onclick="ckShow(1)">← BACK TO ADDRESS</button></p>
    </div>
    <div id="ckStep3" class="hidden">
      <div class="success-anim">
        <div class="check-circle">✓</div>
        <h2>Order Confirmed</h2>
        <p class="sub" style="margin-top:.5rem">Order ID: <b class="gold" id="orderId"></b></p>
        <div class="summary-box" style="text-align:left" id="successSummary"></div>
        <p style="color:var(--muted);font-size:.8rem;font-weight:300;margin-bottom:1.5rem">Delivery within 3–5 days at your doorstep</p>
        <button class="btn-lux btn-fill w100" onclick="finishOrder()">Continue Shopping</button>
      </div>
    </div>
  </div>
</div>

<div id="toast"></div>

<footer>
  <span class="flogo">TREASS<b>ORIES</b></span>
  Premium Men & Women Accessories · Crafted with passion in India<br><br>
  © 2025 Treassories · All rights reserved
</footer>`;
}

function injectChrome(){
  document.body.insertAdjacentHTML('afterbegin', navHTML());
  document.body.insertAdjacentHTML('beforeend', chromeHTML());
}

/* ═══════════ PRODUCT CARD (reused by home/men/women grids) ═══════════ */
function productCardHTML(p, i){
  window.__productCache[p.id]=p;
  const visual = p.image_url
    ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover">`
    : `<span class="obj">${p.emoji||'✦'}</span>`;
  return `<div class="pcard">
    <a href="product.html?slug=${p.slug}" style="text-decoration:none;color:inherit">
      <div class="pvis"><div class="inner-frame"></div>
        ${p.tag?`<span class="tag">${p.tag}</span>`:''}
        ${visual}<div class="glow-floor"></div></div>
      <div class="pbody"><span class="pcat">${p.category==='men'?'Homme':'Femme'} · Accessory</span>
      <h3>${p.name}</h3><div class="stars">★★★★★<b>${p.rating||4.5}</b></div></a>
      <div class="price-row"><span class="price">₹${Number(p.price).toLocaleString('en-IN')}${p.old_price?`<s>₹${p.old_price}</s>`:''}</span>
      <button class="bag-btn" onclick="addToCart(${p.id},this)">Add to Bag</button></div></div>
    </div>`;
}

async function loadProductsIntoGrid(gridId, category, limit){
  const grid = document.getElementById(gridId);
  if(!grid) return;
  grid.innerHTML = '<div class="grid-loading">Loading pieces…</div>';
  try{
    let url = `${API_BASE}/products?`;
    if(category && category!=='all') url += `category=${category}&`;
    if(limit) url += `limit=${limit}&`;
    const res = await fetch(url);
    const data = await res.json();
    const list = data.products||[];
    if(!list.length){ grid.innerHTML='<div class="grid-empty">No pieces here yet — check back soon.</div>'; return; }
    grid.innerHTML = list.map(productCardHTML).join('');
    [...grid.querySelectorAll('.pcard')].forEach((c,i)=>setTimeout(()=>c.classList.add('visible'),80*i+80));
  }catch(err){
    console.error(err);
    grid.innerHTML = '<div class="grid-empty">Could not load products. Please refresh.</div>';
  }
}

/* ═══════════ SEARCH ═══════════ */
let searchTimer;
function initSearch(){
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  if(!input) return;
  input.addEventListener('input', ()=>{
    clearTimeout(searchTimer);
    const q = input.value.trim();
    if(q.length < 2){ results.classList.remove('show'); return; }
    searchTimer = setTimeout(async ()=>{
      try{
        const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(q)}&limit=6`);
        const data = await res.json();
        renderSearchResults(data.products||[]);
      }catch(err){ console.error(err); }
    }, 300);
  });
  document.addEventListener('click', e=>{
    if(!e.target.closest('.search-wrap')) results.classList.remove('show');
  });
}
function renderSearchResults(list){
  const results = document.getElementById('searchResults');
  cacheProducts(list);
  results.innerHTML = list.length ? list.map(p=>`
    <a class="sr-item" href="product.html?slug=${p.slug}">
      ${p.image_url?`<img src="${p.image_url}">`:`<span class="sr-emoji">${p.emoji||'✦'}</span>`}
      <span class="sr-name">${p.name}</span>
      <span class="sr-price">₹${Number(p.price).toLocaleString('en-IN')}</span>
    </a>`).join('') : '<div class="sr-empty">No products found</div>';
  results.classList.add('show');
}

/* ═══════════ CART ═══════════ */
function addToCart(id, btn){
  const p = window.__productCache[id];
  if(!p) return;
  const ex = cart.find(x=>x.id===id);
  ex ? ex.qty++ : cart.push({id:p.id,name:p.name,price:p.price,emoji:p.emoji,image_url:p.image_url,qty:1});
  saveCart();
  if(btn){
    const r=btn.getBoundingClientRect();
    const fly=document.createElement('div');fly.className='fly-item';fly.textContent=p.emoji||'✦';
    fly.style.left=r.left+'px';fly.style.top=r.top+'px';document.body.appendChild(fly);
    const cb=document.querySelector('.nav-icons .icon-btn:last-child').getBoundingClientRect();
    requestAnimationFrame(()=>{fly.style.left=cb.left+'px';fly.style.top=cb.top+'px';
      fly.style.transform='scale(.15) rotate(360deg)';fly.style.opacity='0';});
    setTimeout(()=>fly.remove(),900);
  }
  updateCart();
  toast(`<span class="gold">${p.name}</span> added to your bag ✦`);
}
function updateCart(){
  const cc=document.getElementById('cartCount'),n=cart.reduce((s,i)=>s+i.qty,0);
  cc.textContent=n;cc.classList.toggle('show',n>0);
  const box=document.getElementById('cartItems');
  box.innerHTML=cart.length?cart.map(i=>`<div class="cart-item">
    ${i.image_url?`<img src="${i.image_url}" style="width:2.2rem;height:2.2rem;object-fit:cover">`:`<span class="ci-emoji">${i.emoji||'✦'}</span>`}
    <div class="ci-info"><h4>${i.name}</h4><div class="p">₹${(i.price*i.qty).toLocaleString('en-IN')}</div></div>
    <div class="qty"><button onclick="chQty(${i.id},-1)">−</button><b>${i.qty}</b><button onclick="chQty(${i.id},1)">+</button></div></div>`).join('')
    :'<div class="empty-cart"><div>◇</div>Your bag is empty.<br>Discover something timeless.</div>';
  document.getElementById('cartTotal').textContent='₹'+cart.reduce((s,i)=>s+i.price*i.qty,0).toLocaleString('en-IN');
  saveCart();
}
function chQty(id,d){const i=cart.find(x=>x.id===id);i.qty+=d;if(i.qty<1)cart=cart.filter(x=>x.id!==id);updateCart();}
function toggleCart(){document.getElementById('cartDrawer').classList.toggle('open');}
/* ═══════════ SIDEBAR MENU ═══════════ */
function openSidebar(){
  const menu = document.getElementById('sideMenu');
  const backdrop = document.getElementById('sideBackdrop');
  if(!menu || !backdrop) return;

  menu.classList.add('open');
  backdrop.classList.add('show');
  document.body.classList.add('menu-lock');
  menu.setAttribute('aria-hidden','false');
}

function closeSidebar(){
  const menu = document.getElementById('sideMenu');
  const backdrop = document.getElementById('sideBackdrop');
  if(!menu || !backdrop) return;

  menu.classList.remove('open');
  backdrop.classList.remove('show');
  document.body.classList.remove('menu-lock');
  menu.setAttribute('aria-hidden','true');
}

function initSidebarSearch(){
  const input = document.getElementById('sideSearchInput');
  const results = document.getElementById('sideSearchResults');
  if(!input || !results) return;

  let timer;
  input.addEventListener('input', ()=>{
    clearTimeout(timer);
    const q = input.value.trim();

    if(q.length < 2){
      results.classList.remove('show');
      results.innerHTML = '';
      return;
    }

    timer = setTimeout(async ()=>{
      try{
        const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(q)}&limit=6`);
        const data = await res.json();
        const list = data.products || [];
        cacheProducts(list);

        results.innerHTML = list.length ? list.map(p=>`
          <a class="side-result-item" href="product.html?slug=${p.slug}" onclick="closeSidebar()">
            ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}">` : `<span>${p.emoji || '✦'}</span>`}
            <em>${p.name}</em>
            <b>₹${Number(p.price).toLocaleString('en-IN')}</b>
          </a>
        `).join('') : `<div class="side-empty">No products found</div>`;

        results.classList.add('show');
      }catch(err){
        console.error(err);
      }
    }, 300);
  });

  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape') closeSidebar();
  });
}
/* ═══════════ LOGIN ═══════════ */
function openLogin(){showLoginView('loginMain');document.getElementById('loginOverlay').classList.add('show');}
function closeOverlay(id){document.getElementById(id).classList.remove('show');}
function showLoginView(v){['loginMain','phoneView','emailView'].forEach(x=>document.getElementById(x).classList.add('hidden'));
  document.getElementById(v).classList.remove('hidden');
  document.getElementById('phoneStep1').classList.remove('hidden');
  document.getElementById('phoneStep2').classList.add('hidden');}
function loginSuccess(name){user={name};saveUser();closeOverlay('loginOverlay');
  document.getElementById('userBtn').textContent='✦';
  toast(`Welcome, <span class="gold">${name}</span> — login successful`);
  if(pendingCheckout){pendingCheckout=false;startCheckout();}}
function socialLogin(p){toast(`Connecting to ${p}...`);setTimeout(()=>loginSuccess(p+' User'),1200);}
function sendOTP(){const ph=document.getElementById('phoneInput').value;
  if(ph.length!==10)return toast('Please enter a valid 10-digit number');
  document.getElementById('otpHint').textContent='+91 '+ph;
  document.getElementById('phoneStep1').classList.add('hidden');
  document.getElementById('phoneStep2').classList.remove('hidden');
  const ins=document.querySelectorAll('.otp-in');ins.forEach(i=>i.value='');ins[0].focus();
  ins.forEach((inp,i)=>inp.oninput=()=>{if(inp.value&&i<3)ins[i+1].focus();});}
function verifyOTP(){const otp=[...document.querySelectorAll('.otp-in')].map(i=>i.value).join('');
  otp==='1234'?loginSuccess('Phone User'):toast('Incorrect OTP — demo OTP is: 1234');}
function togglePw(id,btn){
  const inp=document.getElementById(id);
  const show=inp.type==='password';
  inp.type=show?'text':'password';
  btn.textContent=show?'🙈':'👁';
}
function emailLogin(){const n=document.getElementById('emailName').value,e=document.getElementById('emailInput').value,p=document.getElementById('passInput').value;
  if(!n||!e.includes('@')||p.length<4)return toast('Please fill in all details correctly');loginSuccess(n);}

/* ═══════════ CHECKOUT ═══════════ */
function startCheckout(){
  if(!cart.length)return toast('Add something to your bag first ✦');
  if(!user){pendingCheckout=true;toggleCart();return openLogin();}
  document.getElementById('cartDrawer').classList.remove('open');
  ckShow(1);document.getElementById('checkoutOverlay').classList.add('show');}
function ckShow(step){[1,2,3].forEach(n=>{
  document.getElementById('ckStep'+n).classList.toggle('hidden',n!==step);
  const st=document.getElementById('st'+n);
  st.classList.toggle('active',n===step);st.classList.toggle('done',n<step);});}
function useLocation(){toast('Fetching your location...');
  if(navigator.geolocation)navigator.geolocation.getCurrentPosition(
    pos=>{document.getElementById('adAddr').value=`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} (edit to enter your full address)`;
    toast('Location found — please complete your address');},
    ()=>toast('Please allow location access or enter address manually'));}
function goToPayment(){
  for(const id of['adName','adPhone','adEmail','adAddr','adCity','adPin','adState'])
    if(!document.getElementById(id).value)return toast('Please fill in all delivery details');
  if(document.getElementById('adPhone').value.length!==10)return toast('Phone number must be 10 digits');
  if(!document.getElementById('adEmail').value.includes('@'))return toast('Please enter a valid email address');
  const sub=cart.reduce((s,i)=>s+i.price*i.qty,0);
  document.getElementById('orderSummary').innerHTML=
    cart.map(i=>`<div class="row"><span>${i.name} × ${i.qty}</span><span>₹${i.price*i.qty}</span></div>`).join('')+
    `<div class="row"><span>Delivery</span><span class="free">COMPLIMENTARY</span></div>
     <div class="row total"><span>Total Payable</span><span>₹${sub.toLocaleString('en-IN')}</span></div>`;
  ckShow(2);}
function selPay(el){document.querySelectorAll('.pay-opt').forEach(p=>p.classList.remove('sel'));
  el.classList.add('sel');selectedPay=el.dataset.pay;}
function getAddressData(){
  return {
    name:document.getElementById('adName').value,
    phone:document.getElementById('adPhone').value,
    email:document.getElementById('adEmail').value,
    address:document.getElementById('adAddr').value,
    city:document.getElementById('adCity').value,
    pin:document.getElementById('adPin').value,
    state:document.getElementById('adState').value
  };
}
async function placeOrder(){
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const address=getAddressData();
  if(selectedPay==='cod'){
    return codOrder(total,address);
  }
  payOnline(total,address);
}
async function codOrder(total,address){
  try{
    toast('Placing your order...');
    const res=await fetch(`${API_BASE}/cod-order`,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({amount:total,cart,address})
    });
    const data=await res.json();
    if(!data.orderId)return toast('Order could not be saved, please try again');
    completeOrder(data.orderId,'Cash on Delivery');
  }catch(err){
    console.error(err);
    toast('Something went wrong, please try again.');
  }
}
async function payOnline(total,address){
  try{
    toast('Opening payment window...');
    const res=await fetch(`${API_BASE}/create-order`,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({amount:total,cart,address})
    });
    const data=await res.json();
    if(!data.orderId)return toast('Order could not be created, please try again');
    const rzp=new Razorpay({
      key:data.keyId,amount:data.amount,currency:'INR',name:'Treassories',description:'Order Payment',
      order_id:data.orderId,theme:{color:'#c9a962'},
      prefill:{name:address.name,contact:address.phone},
      handler:async function(response){
        const vr=await fetch(`${API_BASE}/verify-payment`,{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify(response)
        });
        const vd=await vr.json();
        const pn={upi:'UPI',card:'Card',wallet:'Wallet'};
        if(vd.verified)completeOrder(response.razorpay_payment_id,pn[selectedPay]||'Online');
        else toast('Payment could not be verified — please contact support');
      },
      modal:{ondismiss:function(){toast('Payment was cancelled');}}
    });
    rzp.open();
  }catch(err){
    console.error(err);
    toast('Something went wrong, please try again.');
  }
}
function completeOrder(oid,payLabel){
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  document.getElementById('orderId').textContent=oid;
  document.getElementById('successSummary').innerHTML=
    `<div class="row"><span>Items</span><span>${cart.reduce((s,i)=>s+i.qty,0)}</span></div>
     <div class="row"><span>Payment</span><span>${payLabel}</span></div>
     <div class="row"><span>Deliver to</span><span>${document.getElementById('adName').value}, ${document.getElementById('adCity').value}</span></div>
     <div class="row total"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>`;
  ckShow(3);confetti();
}
function finishOrder(){cart=[];updateCart();closeOverlay('checkoutOverlay');toast('Thank you! Your order is confirmed ✦');}
function confetti(){for(let i=0;i<36;i++){
  const c=document.createElement('div');
  c.style.cssText=`position:fixed;z-index:999;width:8px;height:8px;pointer-events:none;
  border-radius:${Math.random()>.5?'50%':'1px'};background:${['#c9a962','#ecd9a0','#8a6d35','#ece7dd'][i%4]};
  left:${50+(Math.random()-.5)*30}%;top:40%`;
  document.body.appendChild(c);
  c.animate([{transform:'translate(0,0)',opacity:1},
    {transform:`translate(${(Math.random()-.5)*450}px,${300+Math.random()*300}px) rotate(${Math.random()*720}deg)`,opacity:0}],
    {duration:1600+Math.random()*900,easing:'cubic-bezier(.19,1,.22,1)'}).onfinish=()=>c.remove();}}
let toastT;
function toast(msg){const t=document.getElementById('toast');t.innerHTML=msg;t.classList.add('show');
clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2800);}

/* ═══════════ SCROLL REVEAL (used on any page with .rv elements) ═══════════ */
function initRevealObserver(){
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('in','visible');io.unobserve(e.target);}
  }),{threshold:.12});
  document.querySelectorAll('.rv').forEach(el=>io.observe(el));
}

/* ═══════════ INIT ═══════════ */
document.addEventListener('DOMContentLoaded', ()=>{
  injectChrome();
  updateCart();
  if(user) document.getElementById('userBtn').textContent='✦';
  initSearch();
  initSidebarSearch();
  initRevealObserver();
  if(typeof onSharedReady==='function') onSharedReady();
});

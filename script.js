// script.js — product rendering and cart logic (localStorage based)
const PRODUCTS_URL = 'products.json';
let products = [];
let cart = {}; // { productId: qty }

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

function loadProducts(){
  return fetch(PRODUCTS_URL).then(r=>r.json()).then(data=>{
    products = data;
    renderProducts(products);
  });
}

function renderProducts(list){
  const grid = $('#productsGrid');
  grid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="card-body">
        <h4 class="card-title">${p.name}</h4>
        <div class="card-price">$${p.price.toFixed(2)}</div>
        <div class="card-actions">
          <button class="btn" data-id="${p.id}" data-action="view">View</button>
          <button class="btn primary" data-id="${p.id}" data-action="add">Add to cart</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function saveCart(){
  localStorage.setItem('simpleshop_cart', JSON.stringify(cart));
  updateCartCount();
}
function loadCart(){
  const raw = localStorage.getItem('simpleshop_cart');
  cart = raw ? JSON.parse(raw) : {};
  updateCartCount();
}

function updateCartCount(){
  const count = Object.values(cart).reduce((s,n)=>s+n,0);
  $('#cartCount').textContent = count;
}

function openCart(){
  $('#cartDrawer').classList.add('open');
  $('#cartDrawer').setAttribute('aria-hidden','false');
  renderCartItems();
}
function closeCart(){
  $('#cartDrawer').classList.remove('open');
  $('#cartDrawer').setAttribute('aria-hidden','true');
}

function renderCartItems(){
  const container = $('#cartItems');
  container.innerHTML = '';
  if(Object.keys(cart).length===0){
    container.innerHTML = '<p>Your cart is empty.</p>';
    $('#cartTotal').textContent = '0.00';
    return;
  }
  let total = 0;
  for(const id of Object.keys(cart)){
    const qty = cart[id];
    const prod = products.find(p=>String(p.id)===String(id));
    if(!prod) continue;
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <img src="${prod.image}" alt="${prod.name}">
      <div style="flex:1">
        <div><strong>${prod.name}</strong></div>
        <div>$${prod.price.toFixed(2)} x <input type="number" min="1" value="${qty}" data-id="${id}" class="qty-input" style="width:60px"></div>
      </div>
      <div>
        <div style="font-weight:700">$${(prod.price*qty).toFixed(2)}</div>
        <button class="btn" data-id="${id}" data-action="remove">Remove</button>
      </div>
    `;
    container.appendChild(item);
    total += prod.price * qty;
  }
  $('#cartTotal').textContent = total.toFixed(2);
}

function addToCart(id, qty=1){
  cart[id] = (cart[id]||0) + qty;
  saveCart();
}
function removeFromCart(id){
  delete cart[id];
  saveCart();
}
function setQty(id, qty){
  if(qty<=0) removeFromCart(id);
  else cart[id] = qty;
  saveCart();
}

// event delegation
document.addEventListener('click', e=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if(btn.id === 'cartBtn') { openCart(); return; }
  if(btn.id === 'closeCartBtn') { closeCart(); return; }
  if(btn.id === 'checkoutBtn') { openCheckout(); return; }

  if(action === 'add'){
    addToCart(id,1);
    showToast('Added to cart');
  }
  if(action === 'remove'){
    removeFromCart(id);
    renderCartItems();
    showToast('Removed');
  }
  if(action === 'view'){
    const prod = products.find(p=>String(p.id)===String(id));
    if(prod) showProductModal(prod);
  }
});

// quantity change
document.addEventListener('change', e=>{
  if(e.target.classList.contains('qty-input')){
    const id = e.target.dataset.id;
    const val = parseInt(e.target.value,10) || 1;
    setQty(id, val);
    renderCartItems();
  }
});

// search
$('#searchInput').addEventListener('input', e=>{
  const q = e.target.value.trim().toLowerCase();
  const filtered = products.filter(p=>p.name.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q));
  renderProducts(filtered);
});

// sort
$('#sortSelect').addEventListener('change', e=>{
  const v = e.target.value;
  let sorted = [...products];
  if(v==='price-asc') sorted.sort((a,b)=>a.price-b.price);
  if(v==='price-desc') sorted.sort((a,b)=>b.price-a.price);
  renderProducts(sorted);
});

// cart drawer close
$('#closeCartBtn').addEventListener('click', closeCart);

// checkout modal
function openCheckout(){
  if(Object.keys(cart).length===0){ showToast('Cart is empty'); return; }
  $('#checkoutModal').setAttribute('aria-hidden','false');
}
function closeCheckout(){
  $('#checkoutModal').setAttribute('aria-hidden','true');
}
$('#cancelCheckout').addEventListener('click', closeCheckout);
$('#closeCheckout').addEventListener('click', closeCheckout);

$('#checkoutForm').addEventListener('submit', e=>{
  e.preventDefault();
  const form = new FormData(e.target);
  const order = {
    name: form.get('name'),
    email: form.get('email'),
    address: form.get('address'),
    items: Object.entries(cart).map(([id,qty])=>{
      const p = products.find(x=>String(x.id)===String(id));
      return { id, name: p?.name||'', price: p?.price||0, qty };
    }),
    total: Number($('#cartTotal').textContent)
  };
  // For demo: clear cart and show a fake success
  localStorage.removeItem('simpleshop_cart');
  cart = {};
  updateCartCount();
  renderCartItems();
  $('#orderResult').hidden = false;
  $('#orderResult').textContent = `Thanks ${order.name}! Your order of $${order.total.toFixed(2)} has been placed (demo).`;
  e.target.reset();
});

// simple product modal (reuse checkout modal container?) implement small modal
function showProductModal(prod){
  // quick modal using checkout modal structure
  const modal = $('#checkoutModal');
  modal.setAttribute('aria-hidden','false');
  modal.querySelector('h3').textContent = prod.name;
  const content = document.createElement('div');
  content.innerHTML = `
    <img src="${prod.image}" alt="${prod.name}" style="width:100%;max-height:320px;object-fit:cover;margin-bottom:0.6rem;border-radius:6px">
    <p>${prod.description || ''}</p>
    <div style="font-weight:700">Price: $${prod.price.toFixed(2)}</div>
    <div style="margin-top:0.5rem"><button class="btn primary" id="modalAddBtn" data-id="${prod.id}">Add to cart</button></div>
  `;
  const existing = modal.querySelector('.modal-body');
  // remove previous dynamic body
  modal.querySelectorAll('.modal-body').forEach(n=>n.remove());
  const body = document.createElement('div'); body.className = 'modal-body';
  body.appendChild(content);
  modal.querySelector('.modal-content').appendChild(body);

  // attach add handler
  setTimeout(()=>{
    const mab = document.getElementById('modalAddBtn');
    if(mab) mab.addEventListener('click', ()=>{ addToCart(prod.id,1); showToast('Added to cart'); });
  },50);
}

// toast
function showToast(msg, ms=1300){
  let t = document.getElementById('simpleshop_toast');
  if(!t){ t = document.createElement('div'); t.id='simpleshop_toast'; t.style.position='fixed'; t.style.right='16px'; t.style.bottom='16px'; t.style.background='#222'; t.style.color='white'; t.style.padding='0.6rem 0.8rem'; t.style.borderRadius='6px'; t.style.zIndex=9999; document.body.appendChild(t); }
  t.textContent = msg; t.style.opacity='1';
  setTimeout(()=>{ t.style.opacity='0'; }, ms);
}

// init
loadCart();
loadProducts();

// close checkout modal when background clicked
document.getElementById('checkoutModal').addEventListener('click', e=>{
  if(e.target === e.currentTarget) closeCheckout();
});

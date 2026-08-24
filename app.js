// Simple Shop frontend logic
const PRODUCTS_URL = 'products.json'
let products = []
let cart = JSON.parse(localStorage.getItem('simple_shop_cart') || '[]')

const elements = {
  products: document.getElementById('products'),
  cartToggle: document.getElementById('cart-toggle'),
  cart: document.getElementById('cart'),
  cartCount: document.getElementById('cart-count'),
  cartItems: document.getElementById('cart-items'),
  cartTotal: document.getElementById('cart-total'),
  closeCart: document.getElementById('close-cart'),
  checkout: document.getElementById('checkout'),
  search: document.getElementById('search'),
  sort: document.getElementById('sort'),
  overlay: document.getElementById('overlay'),
  modal: document.getElementById('modal'),
  modalClose: document.getElementById('modal-close'),
  modalImage: document.getElementById('modal-image'),
  modalTitle: document.getElementById('modal-title'),
  modalPrice: document.getElementById('modal-price'),
  modalDescription: document.getElementById('modal-description'),
  modalAdd: document.getElementById('modal-add'),
  productTemplate: document.getElementById('product-template')
}

function saveCart(){
  localStorage.setItem('simple_shop_cart', JSON.stringify(cart))
}

function updateCartUI(){
  elements.cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0)
  elements.cartItems.innerHTML = ''
  let total = 0
  cart.forEach(item=>{
    total += item.price * item.qty
    const el = document.createElement('div')
    el.className = 'cart-item'
    el.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div style="flex:1">
        <div style="font-weight:600">${item.name}</div>
        <div style="color:var(--muted)">$${item.price.toFixed(2)} × ${item.qty}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px">
        <button class="btn small" data-id="${item.id}" data-op="inc">+</button>
        <button class="btn small" data-id="${item.id}" data-op="dec">−</button>
      </div>
    `
    elements.cartItems.appendChild(el)
  })
  elements.cartTotal.textContent = total.toFixed(2)
  saveCart()
}

function addToCart(productId, qty=1){
  const p = products.find(x=>x.id===productId)
  if(!p) return
  const existing = cart.find(i=>i.id===productId)
  if(existing) existing.qty += qty
  else cart.push({id:p.id,name:p.name,price:p.price,image:p.image,qty})
  updateCartUI()
}

function removeFromCart(productId){
  cart = cart.filter(i=>i.id!==productId)
  updateCartUI()
}

function renderProducts(list){
  elements.products.innerHTML = ''
  list.forEach(p=>{
    const node = elements.productTemplate.content.cloneNode(true)
    const article = node.querySelector('.product')
    const img = node.querySelector('.product-image')
    const title = node.querySelector('.product-title')
    const price = node.querySelector('.product-price')
    const addBtn = node.querySelector('.btn-add')
    const detailsBtn = node.querySelector('.btn-details')

    img.src = p.image
    img.alt = p.name
    title.textContent = p.name
    price.textContent = `$${p.price.toFixed(2)}`

    addBtn.addEventListener('click', ()=> addToCart(p.id))
    detailsBtn.addEventListener('click', ()=> openModal(p))

    elements.products.appendChild(node)
  })
}

function openCart(){
  elements.cart.classList.add('open')
  elements.overlay.hidden = false
  elements.cartToggle.setAttribute('aria-expanded', 'true')
}
function closeCart(){
  elements.cart.classList.remove('open')
  elements.overlay.hidden = true
  elements.cartToggle.setAttribute('aria-expanded', 'false')
}

function openModal(p){
  elements.modalImage.src = p.image
  elements.modalTitle.textContent = p.name
  elements.modalPrice.textContent = `$${p.price.toFixed(2)}`
  elements.modalDescription.textContent = p.description || ''
  elements.modal.hidden = false
  elements.overlay.hidden = false
  elements.modalAdd.onclick = ()=>{ addToCart(p.id); closeModal() }
}
function closeModal(){
  elements.modal.hidden = true
  elements.overlay.hidden = true
}

// Simple search + sort
function applyFilters(){
  const q = elements.search.value.trim().toLowerCase()
  let list = products.filter(p=>p.name.toLowerCase().includes(q) || (p.description||"").toLowerCase().includes(q))
  const sort = elements.sort.value
  if(sort==='price-asc') list.sort((a,b)=>a.price-b.price)
  if(sort==='price-desc') list.sort((a,b)=>b.price-a.price)
  renderProducts(list)
}

// init
fetch(PRODUCTS_URL).then(r=>r.json()).then(data=>{
  products = data
  applyFilters()
}).catch(err=>{
  console.error('Failed to load products',err)
  elements.products.innerHTML = '<p style="grid-column:1/-1">Failed to load products.</p>'
})

// events
elements.cartToggle.addEventListener('click', ()=>{
  if(elements.cart.classList.contains('open')) closeCart(); else openCart()
})
(elements.closeCart).addEventListener('click', closeCart)
elements.overlay.addEventListener('click', ()=>{ closeCart(); closeModal() })

elements.cartItems.addEventListener('click',(e)=>{
  const btn = e.target.closest('button')
  if(!btn) return
  const id = btn.dataset.id
  const op = btn.dataset.op
  const item = cart.find(i=>i.id===id)
  if(!item) return
  if(op==='inc'){ item.qty += 1 }
  else if(op==='dec'){ item.qty -= 1; if(item.qty<=0) removeFromCart(id) }
  updateCartUI()
})

elements.checkout.addEventListener('click', ()=>{
  if(cart.length===0){ alert('Your cart is empty') ; return }
  // mock checkout
  alert('Thank you! This is a demo — no payment will be processed.')
  cart = []
  updateCartUI()
  closeCart()
})

elements.search.addEventListener('input', applyFilters)
elements.sort.addEventListener('change', applyFilters)

elements.modalClose.addEventListener('click', closeModal)

// initial UI
updateCartUI()

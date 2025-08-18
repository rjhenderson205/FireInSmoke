// Fire In Smoke BBQ House JS
(function(){
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('navMenu');
  if(navToggle && navMenu){
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('open');
    });
  }
  navMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if(window.innerWidth <= 820){
      navMenu.classList.remove('open');
      navToggle?.setAttribute('aria-expanded','false');
    }
  }));
  const header = document.querySelector('.site-header');
  const shrinkPoint = 24;
  const onScroll = () => {
    if(window.scrollY > shrinkPoint) header?.classList.add('shrink'); else header?.classList.remove('shrink');
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target);} });
  }, { threshold: 0.18 });
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
  const form = document.querySelector('.res-form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    setTimeout(() => { btn.textContent = 'Request Submitted'; form.reset(); setTimeout(()=>{ btn.disabled=false; btn.textContent='Request Reservation'; }, 2500); }, 1000);
  });
})();

// Smooth scroll for internal anchor links
(function(){
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if(id && id.length > 1){
        const target = document.querySelector(id);
        if(target){
          e.preventDefault();
          target.scrollIntoView({ behavior:'smooth', block:'start' });
          history.pushState(null,'',id);
        }
      }
    });
  });
})();

// Dynamic menu rendering
(async function(){
  const menuSection = document.getElementById('menu');
  if(!menuSection) return;
  const dataContainerSignature = menuSection.querySelector('.menu-grid');
  const seafoodSubgroup = menuSection.querySelector('.menu-subgroup');
  try {
    const res = await fetch('assets/data/menu.json', { cache: 'no-cache' });
    if(!res.ok) throw new Error('Menu fetch failed');
    const menuData = await res.json();
    if(!menuData.sections) return;
    // Clear existing static items
    dataContainerSignature.innerHTML = '';
    if(seafoodSubgroup){ seafoodSubgroup.remove(); }
    const frag = document.createDocumentFragment();
    menuData.sections.forEach(section => {
      if(section.id === 'signature'){
        section.items.forEach(item => frag.appendChild(buildMenuItem(item)));
        dataContainerSignature.appendChild(frag);
      } else {
        const subgroup = document.createElement('div');
        subgroup.className = 'menu-subgroup fade-in';
        subgroup.setAttribute('aria-labelledby', section.id + '-title');
        const h3 = document.createElement('h3');
        h3.id = section.id + '-title';
        h3.className = 'menu-subtitle';
        h3.textContent = section.title;
        subgroup.appendChild(h3);
        const grid = document.createElement('div');
        grid.className = 'menu-grid compact';
        section.items.forEach(item => grid.appendChild(buildMenuItem(item)));
        subgroup.appendChild(grid);
        menuSection.querySelector('.center').before(subgroup);
      }
    });
    // Removed invalid attachCartHandlers() call (binding handled by cart logic listening to menuRendered)
    window.dispatchEvent(new CustomEvent('menuRendered'));
  } catch(err){
    console.warn('Menu dynamic load failed, using static fallback.', err);
    // Fallback: augment existing static menu items with Add buttons if they lack one
    try {
      const staticItems = menuSection.querySelectorAll('.menu-grid .menu-item');
      staticItems.forEach(itemEl => {
        if(itemEl.querySelector('.add-cart')) return; // already has
        const titleEl = itemEl.querySelector('h3');
        if(!titleEl) return;
        const name = titleEl.childNodes[0].textContent.trim();
        const priceSpan = titleEl.querySelector('.price');
        if(!priceSpan) return;
        const priceText = priceSpan.textContent.replace('$','');
        const price = parseFloat(priceText);
        if(isNaN(price)) return; // skip unknown price
        const btn = document.createElement('button');
        btn.className = 'add-cart';
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g,'_');
        btn.dataset.id = id;
        btn.dataset.name = name;
        btn.dataset.price = String(Math.round(price*100));
        btn.type='button';
        btn.textContent='Add';
        btn.setAttribute('aria-label', `Add ${name} to cart`);
        itemEl.appendChild(btn);
      });
      window.dispatchEvent(new CustomEvent('menuRendered'));
    } catch(fbErr){ console.warn('Static fallback enhancement failed', fbErr); }
  }
  function buildMenuItem(item){
    const div = document.createElement('div');
    div.className = 'menu-item fade-in';
    const price = item.price == null ? '$—' : '$' + item.price;
    div.innerHTML = `<h3>${escapeHtml(item.name)} <span class="price">${price}</span></h3><p>${escapeHtml(item.desc)}</p>` +
      (item.basePriceCents ? `<button class="add-cart" data-id="${escapeAttr(item.id)}" data-name="${escapeAttr(item.name)}" data-price="${item.basePriceCents}" aria-label="Add ${escapeAttr(item.name)} to cart">Add</button>` : `<button class="add-cart disabled" aria-disabled="true" title="Temporarily unavailable">Unavailable</button>`);
    return div;
  }
  function escapeHtml(str=''){ return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
  function escapeAttr(str=''){ return escapeHtml(str).replace(/"/g,'&quot;'); }
})();

// Partners state logic
(function(){
  const container = document.querySelector('[data-partners]');
  if(!container) return;
  fetch('assets/data/partners.json')
    .then(r=>r.json())
    .then(list => {
      const frag = document.createDocumentFragment();
      list.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'partner';
        btn.type='button';
        btn.textContent = p.name;
        if(p.status !== 'live'){
          btn.disabled = true;
          btn.classList.add('coming-soon');
          btn.setAttribute('aria-label', `${p.name} coming soon`);
        } else {
          btn.addEventListener('click', () => {
            window.open(p.url,'_blank','noopener');
          });
        }
        frag.appendChild(btn);
      });
      container.innerHTML='';
      container.appendChild(frag);
    });
})();

// Reservation form validation & honeypot
(function(){
  const form = document.querySelector('.res-form');
  if(!form) return;
  const btn = form.querySelector('button[type=submit]');
  const live = document.querySelector('.sr-live');
  const requiredFields = ['name','email','date','time','guests'];
  form.addEventListener('submit', e => {
    e.preventDefault();
    const hp = form.querySelector('input[name=company]');
    if(hp && hp.value){ return; }
    let valid = true;
    requiredFields.forEach(name => {
      const field = form.querySelector(`[name="${name}"]`);
      const container = field?.closest('label');
      if(field && !field.value){
        valid=false;
        container?.classList.add('invalid');
      }
    });
    if(!valid){
      btn.textContent='Check Required Fields';
      live && (live.textContent='Form incomplete, please fill required fields.');
      setTimeout(()=>{ btn.textContent='Request Reservation'; },1800);
      return;
    }
    btn.disabled=true; btn.textContent='Sending...'; live && (live.textContent='Submitting reservation request.');
    setTimeout(()=>{ btn.textContent='Request Submitted'; live && (live.textContent='Reservation request submitted.'); form.reset(); setTimeout(()=>{ btn.disabled=false; btn.textContent='Request Reservation'; live && (live.textContent='Ready for another reservation.'); },2500); },900);
  });
  form.addEventListener('input', e => {
    const t=e.target;
    if(t.name && t.closest('label')?.classList.contains('invalid') && t.value){
      t.closest('label').classList.remove('invalid');
    }
  });
})();

// Gallery lightbox
(function(){
  const gallery = document.querySelector('[data-gallery]');
  if(!gallery) return;
  // Generate placeholder clickable items for now
  const items = Array.from(gallery.querySelectorAll('.g-item'));
  items.forEach((el, i) => {
    el.tabIndex = 0;
    el.setAttribute('role','button');
    el.setAttribute('aria-label', 'Open image '+ (i+1));
    el.addEventListener('click', () => open(i));
    el.addEventListener('keypress', e => { if(e.key==='Enter' || e.key===' '){ e.preventDefault(); open(i);} });
  });
  const lb = document.getElementById('lightbox');
  if(!lb) return;
  const img = lb.querySelector('.lightbox-img');
  const caption = lb.querySelector('.lightbox-caption');
  const btnClose = lb.querySelector('.lightbox-close');
  const btnPrev = lb.querySelector('.lightbox-nav.prev');
  const btnNext = lb.querySelector('.lightbox-nav.next');
  let index = 0; let lastFocus = null; let lock = false;
  function open(i){
    index = i; lastFocus = document.activeElement; render();
    lb.classList.add('open'); lb.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    btnClose.focus();
    document.addEventListener('keydown', onKey);
  }
  function close(){
    lb.classList.remove('open'); lb.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    document.removeEventListener('keydown', onKey);
    lastFocus?.focus();
  }
  function onKey(e){
    if(e.key==='Escape') close();
    else if(e.key==='ArrowRight') nav(1);
    else if(e.key==='ArrowLeft') nav(-1);
    else if(e.key==='Tab') trapFocus(e);
  }
  function nav(delta){ if(lock) return; index = (index + delta + items.length) % items.length; render(); }
  function render(){
    // Placeholder: use hero image for all until real images available
    const src = 'image0.jpg';
    img.src = src;
    img.alt = 'Gallery image '+ (index+1);
    caption.textContent = 'Preview image ' + (index+1) + ' (placeholder)';
  }
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => nav(-1));
  btnNext.addEventListener('click', () => nav(1));
  function trapFocus(e){
    const focusables = lb.querySelectorAll('button, img');
    const f = Array.from(focusables); if(!f.length) return;
    const first = f[0]; const last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }
})();

// Cart logic (extended)
(function(){
  const storageKey = 'fis_cart';
  let cart = JSON.parse(localStorage.getItem(storageKey)||'[]');
  const panel = document.getElementById('cartPanel');
  const trigger = document.querySelector('.cart-trigger');
  const closeBtn = panel?.querySelector('.cart-close');
  const linesEl = panel?.querySelector('.cart-lines');
  const subtotalEl = panel?.querySelector('.sum-subtotal');
  const taxEl = panel?.querySelector('.sum-tax');
  const tipEl = panel?.querySelector('.sum-tip');
  const totalEl = panel?.querySelector('.sum-total');
  const tipSelect = panel?.querySelector('.tip-input');
  const checkoutBtn = panel?.querySelector('.proceed-checkout');
  const checkoutContainer = panel?.querySelector('.checkout-container');
  const toastRegion = document.querySelector('.toast-region');
  let lastFocus = null;

  function persist(){ localStorage.setItem(storageKey, JSON.stringify(cart)); updateBadge(); }
  function updateBadge(){ const badge = document.querySelector('.cart-count'); if(!badge) return; const count = cart.reduce((a,l)=>a+l.qty,0); badge.textContent = count; badge.hidden = count===0; }
  function add(item){ const found = cart.find(l=>l.id===item.id); if(found) found.qty += 1; else cart.push({...item, qty:1}); persist(); render(); announce(`${item.name} added to cart.`); toast(`${item.name} added`); }
  function remove(id){ const line = cart.find(l=>l.id===id); cart = cart.filter(l=>l.id!==id); persist(); render(); if(line) announce(`${line.name} removed from cart.`); }
  function changeQty(id, delta){ const line = cart.find(l=>l.id===id); if(!line) return; line.qty += delta; if(line.qty<=0) remove(id); else { persist(); render(); announce(`${line.name} quantity ${line.qty}`); } }
  function currency(cents){ return '$' + (cents/100).toFixed(2); }
  function calc(){ const subtotal = cart.reduce((a,l)=> a + (l.priceCents * l.qty),0); const tipRate = parseFloat(tipSelect?.value||'0'); const tip = Math.round(subtotal * tipRate); const tax = Math.round(subtotal * 0.08); const total = subtotal + tax + tip; return {subtotal, tax, tip, total}; }
  function render(){ if(!linesEl) return; linesEl.innerHTML=''; cart.forEach(line => { const li = document.createElement('li'); li.className='cart-line'; li.innerHTML = `<div><div class="cart-line-title">${escapeHtml(line.name)}</div><div class="cart-line-price">${currency(line.priceCents)}</div></div><div class="qty-controls"><button class="qty-btn" data-act="dec" data-id="${line.id}" aria-label="Decrease quantity">-</button><span class="qty" aria-label="Quantity">${line.qty}</span><button class="qty-btn" data-act="inc" data-id="${line.id}" aria-label="Increase quantity">+</button><button class="qty-btn" data-act="rem" data-id="${line.id}" aria-label="Remove item">×</button></div>`; linesEl.appendChild(li); });
    const {subtotal, tax, tip, total} = calc();
    subtotalEl.textContent = currency(subtotal);
    taxEl.textContent = currency(tax);
    tipEl.textContent = currency(tip);
    totalEl.textContent = currency(total);
    checkoutBtn.disabled = cart.length===0;
  }
  function open(){ if(!panel) return; lastFocus = document.activeElement; panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; panel.querySelector('.cart-close').focus(); trapSetup(); }
  function close(){ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); document.body.style.overflow=''; lastFocus?.focus(); trapRemove(); }
  function onPanelClick(e){ const btn = e.target.closest('button.qty-btn'); if(btn){ const id = btn.dataset.id; const act = btn.dataset.act; if(act==='inc') changeQty(id,1); else if(act==='dec') changeQty(id,-1); else if(act==='rem') remove(id); } }
  function attachAddButtons(){ document.querySelectorAll('.add-cart:not(.wired):not(.disabled)').forEach(b=>{ b.classList.add('wired'); b.addEventListener('click', ()=> add({ id:b.dataset.id, name:b.dataset.name, priceCents: parseInt(b.dataset.price,10) })); }); }
  function trap(e){ if(e.key!=='Tab') return; const focusable = panel.querySelectorAll('button, select'); const list = Array.from(focusable); if(!list.length) return; const first = list[0]; const last = list[list.length-1]; if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); } }
  function trapSetup(){ document.addEventListener('keydown', trap); }
  function trapRemove(){ document.removeEventListener('keydown', trap); }
  function toast(message){ if(!toastRegion) return; const el = document.createElement('div'); el.className='toast'; el.textContent = message; toastRegion.appendChild(el); setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .3s'; setTimeout(()=> el.remove(), 350); }, 2600); }
  function announce(msg){ const live = document.querySelector('.sr-live'); if(live){ live.textContent = msg; } }
  trigger?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  linesEl?.addEventListener('click', onPanelClick);
  tipSelect?.addEventListener('change', render);
  document.addEventListener('keydown', e => { if(e.key==='Escape' && panel?.classList.contains('open')) close(); });
  checkoutBtn?.addEventListener('click', () => { checkoutContainer.hidden = false; checkoutBtn.disabled = true; initSquarePlaceholder(); });
  function initSquarePlaceholder(){ const status = panel.querySelector('#payment-status'); if(status) status.textContent='Square payment form will mount here (backend required).'; }
  function escapeHtml(str=''){ return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
  // Initial
  updateBadge(); render(); attachAddButtons();
  window.addEventListener('menuRendered', ()=>{ attachAddButtons(); });
})();

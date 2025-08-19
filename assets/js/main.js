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

// Square storefront quick integration (Phase 1)
(function(){
  const SQUARE_URL = 'https://fire-in-smoke-bbq.square.site';
  const links = document.querySelectorAll('[data-square-order]');
  links.forEach(a => {
    if(a.tagName === 'A') a.href = SQUARE_URL;
    if(!a.dataset.squareBound){
      a.dataset.squareBound = '1';
      a.addEventListener('click', ()=>{
        console.debug('[square] order link click');
      });
    }
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
  const originalSignatureHTML = dataContainerSignature ? dataContainerSignature.innerHTML : '';
  const originalSeafood = seafoodSubgroup ? seafoodSubgroup.outerHTML : '';
  // Skeleton placeholders (overlay style) instead of wiping original first
  let removedOriginal = false;
  if(dataContainerSignature){
    dataContainerSignature.classList.add('skeleton-loading');
    if(!dataContainerSignature.dataset.skeleton){
      const skelFrag = document.createDocumentFragment();
      for(let i=0;i<6;i++){ const sk = document.createElement('div'); sk.className='skel-item'; skelFrag.appendChild(sk); }
      dataContainerSignature.dataset.skeleton='true';
      // Temporarily append skeletons AFTER original so layout height preserved
      const skelWrapper = document.createElement('div');
      skelWrapper.className='skel-wrapper';
      skelWrapper.appendChild(skelFrag);
      dataContainerSignature.appendChild(skelWrapper);
    }
  }
  try {
    const res = await fetch('assets/data/menu.json', { cache: 'no-cache' });
    if(!res.ok) throw new Error('Menu fetch failed');
    const menuData = await res.json();
    if(!menuData.sections) return;
    // Now safely replace with dynamic
    removedOriginal = true;
    dataContainerSignature.innerHTML = '';
    dataContainerSignature.classList.remove('skeleton-loading');
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
    // Force reveal of dynamically inserted fade-in elements (observer only bound to initial static nodes)
    requestAnimationFrame(()=>{
      menuSection.querySelectorAll('.fade-in:not(.visible)').forEach(el=>{
        el.classList.add('visible');
      });
    });
    window.dispatchEvent(new CustomEvent('menuRendered'));
  } catch(err){
    console.warn('Menu dynamic load failed, restoring original static fallback.', err);
    // Remove skeletons only, restore original content if we cleared it
    if(dataContainerSignature){
      dataContainerSignature.classList.remove('skeleton-loading');
      if(removedOriginal){
        dataContainerSignature.innerHTML = originalSignatureHTML;
        if(originalSeafood && !menuSection.querySelector('.menu-subgroup')){
          menuSection.querySelector('.container').insertAdjacentHTML('beforeend', originalSeafood);
        }
      } else {
        // Remove skeleton wrapper nodes
        dataContainerSignature.querySelectorAll('.skel-wrapper').forEach(w=>w.remove());
      }
      // Enhance static items with Add buttons
      try {
        const staticItems = dataContainerSignature.querySelectorAll('.menu-item');
        staticItems.forEach(itemEl => {
          // Inject thumbnail wrapper if missing
          if(!itemEl.querySelector('.menu-thumb')){
            const h3 = itemEl.querySelector('h3');
            if(h3){
              const nameId = h3.textContent.toLowerCase().split('$')[0].trim().replace(/[^a-z0-9]+/g,'_');
              const thumbMap = { brisket:'Ribsimg.webp', pulled_heritage_pork:'Plateimg.webp', fire_glazed_ribs:'Ribsimg2.webp', charred_jalapeño_cornbread:'Plateimggg.webp', coal_roasted_carrots:'Chicken.webp', smoked_pecan_cheesecake:'Plateimg.webp' };
              const file = thumbMap[nameId] || 'Plateimg.webp';
              const img = document.createElement('div');
              img.className='menu-thumb';
                img.innerHTML = `<img class="blur-up" src="assets/images/${file}" alt="${h3.childNodes[0].textContent.trim()}" loading="lazy" decoding="async" width="144" height="144">`;
              itemEl.prepend(img);
              const wrap = document.createElement('div');
              wrap.className='menu-info';
              // Move existing h3 + p into wrap
              const p = itemEl.querySelector('p');
              wrap.appendChild(h3);
              if(p) wrap.appendChild(p);
              itemEl.insertBefore(wrap, itemEl.querySelector('.add-cart'));
            }
          }
          if(itemEl.querySelector('.add-cart')) return;
          const titleEl = itemEl.querySelector('h3'); if(!titleEl) return;
          const name = titleEl.childNodes[0].textContent.trim();
            const priceSpan = titleEl.querySelector('.price'); if(!priceSpan) return;
          const priceText = priceSpan.textContent.replace('$',''); const price = parseFloat(priceText);
          if(isNaN(price)) return;
          const btn = document.createElement('button');
          btn.className='add-cart'; const id = name.toLowerCase().replace(/[^a-z0-9]+/g,'_');
          btn.dataset.id=id; btn.dataset.name=name; btn.dataset.price=String(Math.round(price*100)); btn.type='button'; btn.textContent='Add'; btn.setAttribute('aria-label',`Add ${name} to cart`);
          itemEl.appendChild(btn);
        });
        // Ensure any static fade-ins are visible (in case original observer missed them)
        menuSection.querySelectorAll('.fade-in:not(.visible)').forEach(el=> el.classList.add('visible'));
      } catch(e2){ console.warn('Enhancement of static items failed', e2); }
      window.dispatchEvent(new CustomEvent('menuRendered'));
    }
  }
  function buildMenuItem(item){
    const div = document.createElement('div');
    div.className = 'menu-item fade-in';
    const price = item.price == null ? '$—' : '$' + item.price;
    // Simple thumbnail mapping (extend later). Fallback to ribs image if specific not mapped.
    const thumbMap = {
      brisket: 'Ribsimg.webp',
      pulled_pork: 'Plateimg.webp',
      ribs: 'Ribsimg2.webp',
      cornbread: 'Plateimggg.webp',
      carrots: 'Chicken.webp',
      pecan_cheesecake: 'Plateimg.webp',
      fish_fries: 'Plateimggg.webp',
      shrimp_fries: 'Plateimg.webp',
      fish_shrimp_combo: 'Ribsimg.webp'
    };
    const imgFile = thumbMap[item.id] || 'Plateimg.webp';
    const imgTag = `<div class="menu-thumb"><img src="assets/images/${imgFile}" alt="${escapeAttr(item.name)}" loading="lazy"></div>`;
    div.innerHTML = imgTag + `<div class="menu-info"><h3>${escapeHtml(item.name)} <span class="price">${price}</span></h3><p>${escapeHtml(item.desc)}</p></div>` +
      (item.basePriceCents ? `<button class="add-cart" data-id="${escapeAttr(item.id)}" data-name="${escapeAttr(item.name)}" data-price="${item.basePriceCents}" aria-label="Add ${escapeAttr(item.name)} to cart">Add</button>` : `<button class="add-cart disabled" aria-disabled="true" title="Temporarily unavailable">Unavailable</button>`);
    return div;
  }
  function escapeHtml(str=''){ return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
  function escapeAttr(str=''){ return escapeHtml(str).replace(/"/g,'&quot;'); }
  window.addEventListener('menuRendered', () => {
    console.debug('[menuRendered] add-cart buttons count:', document.querySelectorAll('.add-cart').length);
    // Progressive image reveal
    document.querySelectorAll('.menu-thumb img.blur-up').forEach(img => {
      if(img.complete){ img.classList.add('loaded'); }
      else img.addEventListener('load', () => img.classList.add('loaded'), { once:true });
    });
  }, { once:true });
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

// Gallery & single-image lightbox
(function(){
  const gallery = document.querySelector('[data-gallery]');
  const items = gallery ? Array.from(gallery.querySelectorAll('.g-item')) : [];
  items.forEach((el, i) => {
    el.tabIndex = 0;
    el.setAttribute('role','button');
    if(!el.getAttribute('aria-label')){
      const img = el.querySelector('img');
      const baseLabel = img?.getAttribute('alt') || 'Gallery item';
      el.setAttribute('aria-label', baseLabel + ' (open)');
    }
    el.addEventListener('click', () => openGallery(i));
    el.addEventListener('keypress', e => { if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openGallery(i);} });
  });
  const lb = document.getElementById('lightbox');
  if(!lb) return;
  const stage = lb.querySelector('.lightbox-stage');
  const caption = lb.querySelector('.lightbox-caption');
  const btnClose = lb.querySelector('.lightbox-close');
  const btnPrev = lb.querySelector('.lightbox-nav.prev');
  const btnNext = lb.querySelector('.lightbox-nav.next');
  let index = 0; let lastFocus = null; let single = false;
  function commonOpen(){ lb.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; btnClose.focus(); }
  function openGallery(i){ single=false; index=i; lastFocus=document.activeElement; render(); lb.classList.add('open'); lb.classList.remove('single'); commonOpen(); document.addEventListener('keydown', onKey); updateNav(); }
  function openSingle(src, alt){ single=true; lastFocus=document.activeElement; index=-1; renderSingle(src, alt); lb.classList.add('open','single'); commonOpen(); document.addEventListener('keydown', onKeySingle); updateNav(); }
  function close(){ lb.classList.remove('open','single'); lb.setAttribute('aria-hidden','true'); document.body.style.overflow=''; document.removeEventListener('keydown', onKey); document.removeEventListener('keydown', onKeySingle); lastFocus?.focus(); }
  function onKey(e){ if(e.key==='Escape') close(); else if(!single && e.key==='ArrowRight') nav(1); else if(!single && e.key==='ArrowLeft') nav(-1); else if(e.key==='Tab') trapFocus(e); }
  function onKeySingle(e){ if(e.key==='Escape') close(); else if(e.key==='Tab') trapFocus(e); }
  function nav(delta){ if(single) return; index = (index + delta + items.length) % items.length; render(); }
  function render(){ const el = items[index]; if(!el) return; stage.innerHTML=''; const isVideo = el.hasAttribute('data-video'); if(isVideo){ const vid=document.createElement('video'); vid.className='lightbox-video'; vid.src=el.getAttribute('data-video'); const poster=el.getAttribute('data-poster')||''; if(poster) vid.poster=poster; vid.controls=true; vid.autoplay=true; vid.loop=true; vid.playsInline=true; stage.appendChild(vid); caption.textContent = (el.querySelector('img')?.alt || 'Video'); } else { const full = el.getAttribute('data-full') || el.querySelector('img')?.src || ''; const imgEl=document.createElement('img'); imgEl.className='lightbox-img'; imgEl.src=full; const alt = el.querySelector('img')?.getAttribute('alt') || ('Gallery image '+(index+1)); imgEl.alt=alt; stage.appendChild(imgEl); caption.textContent=alt; } }
  function renderSingle(src, alt){ stage.innerHTML=''; const imgEl=document.createElement('img'); imgEl.className='lightbox-img'; imgEl.src=src; imgEl.alt=alt||'Menu item'; stage.appendChild(imgEl); caption.textContent=alt||''; }
  function updateNav(){ if(single){ btnPrev.style.display='none'; btnNext.style.display='none'; } else { btnPrev.style.display=''; btnNext.style.display=''; } }
  btnClose.addEventListener('click', close); btnPrev.addEventListener('click', ()=> nav(-1)); btnNext.addEventListener('click', ()=> nav(1));
  function trapFocus(e){ const focusables = lb.querySelectorAll('button, .lightbox-stage *'); const list = Array.from(focusables); if(!list.length) return; const first = list[0]; const last = list[list.length-1]; if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); } }
  // Expose openSingle globally for menu items
  window.__openSingleImage = openSingle;
  // Backdrop click close
  lb.addEventListener('mousedown', e => {
    // If click target is the backdrop (lightbox) or outside inner container
    if(e.target === lb){ close(); }
  });
  // Also allow clicking empty space inside inner but not on media or buttons
  lb.querySelector('.lightbox-inner')?.addEventListener('mousedown', e => {
    const mediaClicked = e.target.closest('.lightbox-stage');
    const controlClicked = e.target.closest('button');
    if(!mediaClicked && !controlClicked){ close(); }
  });
})();

// Click-to-enlarge for menu thumbnails (static and dynamic)
(function(){
  function delegate(e){
    const thumb = e.target.closest('.menu-thumb');
    if(!thumb) return;
    const img = thumb.querySelector('img');
    if(!img) return;
    if(window.__openSingleImage) window.__openSingleImage(img.src, img.alt);
  }
  document.addEventListener('click', delegate);
  document.addEventListener('keypress', e => { if(e.key==='Enter' || e.key===' '){ const thumb = e.target.closest('.menu-thumb'); if(thumb){ e.preventDefault(); const img=thumb.querySelector('img'); if(img && window.__openSingleImage) window.__openSingleImage(img.src, img.alt); } } });
  const obs = new MutationObserver(muts => { muts.forEach(m => { m.addedNodes.forEach(n => { if(n.nodeType===1){ if(n.matches && n.matches('.menu-thumb')) makeInteractive(n); n.querySelectorAll?.('.menu-thumb').forEach(makeInteractive); } }); }); });
  function makeInteractive(el){ el.tabIndex=0; el.setAttribute('role','button'); if(!el.getAttribute('aria-label')){ const img=el.querySelector('img'); if(img) el.setAttribute('aria-label', (img.alt||'Menu image') + ' (enlarge)'); } }
  document.querySelectorAll('.menu-thumb').forEach(makeInteractive);
  obs.observe(document.getElementById('menu'), { childList:true, subtree:true });
})();

// Cart logic (extended)
(function(){
  const storageKey = 'fis_cart';
  let cart = JSON.parse(localStorage.getItem(storageKey)||'[]');
  const panel = document.getElementById('cartPanel');
  const trigger = document.querySelector('.cart-trigger');
  const closeBtn = panel?.querySelector('.cart-close');
  const linesEl = panel?.querySelector('.cart-lines');
  const tipEl = panel?.querySelector('.sum-tip');
  const totalEl = panel?.querySelector('.sum-total');
  const tipSelect = panel?.querySelector('.tip-input');
  const subtotalEl = panel?.querySelector('.sum-subtotal');
  const taxEl = panel?.querySelector('.sum-tax');
  const checkoutBtn = panel?.querySelector('.proceed-checkout');
  const checkoutContainer = panel?.querySelector('.checkout-container');
  const toastRegion = document.querySelector('.toast-region');
  const modeDisplay = panel?.querySelector('[data-fulfillment-mode]');
  const fulfillmentRadios = panel?.querySelectorAll('input[name="fulfillment"]');
  let fulfillmentMode = localStorage.getItem('fis_fulfillment') || 'pickup';
  function syncFulfillmentUI(){
    fulfillmentRadios.forEach(r=>{ r.checked = (r.value===fulfillmentMode); });
    if(modeDisplay) modeDisplay.textContent = fulfillmentMode.charAt(0).toUpperCase()+fulfillmentMode.slice(1);
  }
  syncFulfillmentUI();
  fulfillmentRadios.forEach(r=>{
    r.addEventListener('change', ()=>{
      if(r.disabled) return;
      fulfillmentMode = r.value;
      localStorage.setItem('fis_fulfillment', fulfillmentMode);
      syncFulfillmentUI();
      announce(`Fulfillment method set to ${fulfillmentMode}.`);
    });
  });

  function persist(){ localStorage.setItem(storageKey, JSON.stringify(cart)); updateBadge(); }
  function updateBadge(){ const badge = document.querySelector('.cart-count'); if(!badge) return; const count = cart.reduce((a,l)=>a+l.qty,0); badge.textContent = count; badge.hidden = count===0; badge.classList.add('pulse'); setTimeout(()=>badge.classList.remove('pulse'),700); }
  function add(item){ const found = cart.find(l=>l.id===item.id); if(found) found.qty += 1; else cart.push({...item, qty:1}); persist(); render(); announce(`${item.name} added to cart.`); toast(`${item.name} added`); const btn = document.querySelector(`.add-cart[data-id="${CSS.escape(item.id)}"]`); if(btn){ btn.classList.add('added','pulse'); btn.textContent='Added'; btn.setAttribute('aria-disabled','true'); btn.disabled=true; setTimeout(()=>{ btn.classList.remove('pulse'); },650); setTimeout(()=>{ btn.disabled=false; btn.removeAttribute('aria-disabled'); btn.classList.remove('added'); btn.textContent='Add'; }, 2300); } }
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
  // Hybrid Square checkout integration
  const HYBRID = true; // toggle if you want to revert to static Square site redirect
  async function hybridCheckout(){
    if(!cart.length){ toast('Cart empty'); return; }
    const payload = { cart: cart.map(l=> ({ id:l.id, name:l.name, qty:l.qty, priceCents:l.priceCents })) };
    try {
      announce('Creating checkout...');
      const res = await fetch('/api/create-checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if(!res.ok){ const err = await res.json().catch(()=>({})); throw new Error(err.error||'Checkout failed'); }
      const data = await res.json();
      if(data.checkoutUrl){ window.location.href = data.checkoutUrl; } else { throw new Error('No checkout URL returned'); }
    } catch(err){
      console.error('[checkout]', err);
  // Graceful fallback: redirect to public Square ordering site if backend unavailable
  const FALLBACK_SQUARE_URL = 'https://fire-in-smoke-bbq.square.site';
  toast('Checkout unavailable, redirecting...');
  announce('Checkout backend unavailable, redirecting to Square site.');
  checkoutBtn.disabled = false;
  setTimeout(()=>{ window.location.href = FALLBACK_SQUARE_URL; }, 900);
    }
  }
  if(checkoutBtn){
    checkoutBtn.addEventListener('click', e => {
      if(HYBRID){ e.preventDefault(); e.stopPropagation(); hybridCheckout(); }
    });
  }
  function initSquarePlaceholder(){ const status = panel.querySelector('#payment-status'); if(status) status.textContent='Square payment form will mount here (backend required).'; }
  function escapeHtml(str=''){ return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
  // Initial
  updateBadge(); render(); attachAddButtons();
  window.addEventListener('menuRendered', ()=>{ attachAddButtons(); });
})();

// Hero parallax
(function(){
  const heroContent = document.querySelector('.hero-content');
  if(!heroContent) return; heroContent.classList.add('parallax-hero');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(reduce.matches) return;
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY;
    const limit = Math.min(60, y*0.15);
    heroContent.style.transform = `translateY(${limit}px)`;
  }, { passive:true });
})();

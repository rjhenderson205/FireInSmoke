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

  // Close nav on link click (mobile)
  navMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if(window.innerWidth <= 820){
      navMenu.classList.remove('open');
      navToggle?.setAttribute('aria-expanded','false');
    }
  }));

  // Header shrink on scroll
  const header = document.querySelector('.site-header');
  const shrinkPoint = 24;
  const onScroll = () => {
    if(window.scrollY > shrinkPoint) header?.classList.add('shrink'); else header?.classList.remove('shrink');
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  // Intersection observer fade-ins
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

  // Year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Placeholder reservation form
  const form = document.querySelector('.res-form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    setTimeout(() => {
      btn.textContent = 'Request Submitted';
      form.reset();
      setTimeout(()=>{ btn.disabled=false; btn.textContent='Request Reservation'; }, 2500);
    }, 1000);
  });
})();

// Smooth scroll for internal anchor links (enhanced UX)
(function(){
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if(id.length > 1){
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

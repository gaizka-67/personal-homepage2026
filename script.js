(function () {
  'use strict';

  const path = location.pathname.split('/').pop() || 'index.html';
  const PAGE = path.includes('blog')    ? 'blog'
             : path.includes('gallery') ? 'gallery'
             : path.includes('contact') ? 'contact'
             : 'home';

  document.body.style.opacity    = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  setTimeout(() => { document.body.style.opacity = '1'; }, 40);

  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    // Hanya link internal .html, bukan link eksternal atau anchor
    if (!href || href.startsWith('http') || href.startsWith('#') || !href.endsWith('.html')) return;
    e.preventDefault();
    document.body.style.opacity = '0';
    setTimeout(() => { location.href = href; }, 300);
  });

  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    const items = [
      ...document.querySelectorAll('table[width="700"]'), // kartu blog
      ...document.querySelectorAll('center > img'),       // foto gallery
      ...document.querySelectorAll('h2, h3'),
    ];

    items.forEach((el, i) => {
      el.classList.add('sr');
      el.style.transitionDelay = (i % 4) * 0.07 + 's';
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    items.forEach(el => io.observe(el));
  }

  function initBackTop() {
    const btn = document.createElement('button');
    btn.id = 'back-top';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Kembali ke atas');
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 350);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initProgressBar() {
    if (PAGE !== 'blog') return;

    const bar = document.createElement('div');
    bar.id = 'progress-bar';
    document.body.prepend(bar);

    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = total > 0 ? (window.scrollY / total * 100) + '%' : '0%';
    }, { passive: true });
  }

  function initTyped() {
    if (PAGE !== 'home') return;

    const h2 = document.querySelector('h2');
    if (!h2) return;

    const phrases = [
      'Halo!',
      'Selamat Datang! 👋',
    ];

    const style = document.createElement('style');
    style.textContent = `
      .typed-cur {
        display: inline-block;
        border-right: 2px solid #c0674a;
        margin-left: 2px;
        animation: blink-c 0.8s step-end infinite;
      }
      @keyframes blink-c { 50% { border-color: transparent; } }
    `;
    document.head.appendChild(style);

    const span = document.createElement('span');
    const cur  = document.createElement('span');
    cur.className = 'typed-cur';

    h2.textContent = '';
    h2.appendChild(span);
    h2.appendChild(cur);

    let pIdx = 0, cIdx = 0, deleting = false;

    function tick() {
      const phrase = phrases[pIdx];
      if (!deleting) {
        span.textContent = phrase.slice(0, ++cIdx);
        if (cIdx === phrase.length) { deleting = true; return setTimeout(tick, 2000); }
        setTimeout(tick, 60);
      } else {
        span.textContent = phrase.slice(0, --cIdx);
        if (cIdx === 0) {
          deleting = false;
          pIdx = (pIdx + 1) % phrases.length;
          return setTimeout(tick, 350);
        }
        setTimeout(tick, 30);
      }
    }
    setTimeout(tick, 900);
  }

  function initLightbox() {
    const imgs = [...document.querySelectorAll('img')].filter(img =>
      !img.src.includes('gambardiri')
    );
    if (!imgs.length) return;

    const lb    = document.createElement('div');  lb.id = 'lightbox';
    const lbImg = document.createElement('img');  lbImg.id = 'lightbox-img';
    const lbCls = document.createElement('button'); lbCls.id = 'lightbox-close'; lbCls.textContent = '✕';
    const lbCap = document.createElement('div');  lbCap.id = 'lightbox-caption';
    const lbNav = document.createElement('div');  lbNav.id = 'lightbox-nav';
    const lbPrv = document.createElement('button'); lbPrv.id = 'lb-prev'; lbPrv.className = 'lb-arrow'; lbPrv.innerHTML = '&#8249;';
    const lbNxt = document.createElement('button'); lbNxt.id = 'lb-next'; lbNxt.className = 'lb-arrow'; lbNxt.innerHTML = '&#8250;';

    lbNav.appendChild(lbPrv);
    lbNav.appendChild(lbNxt);
    lb.appendChild(lbCls);
    lb.appendChild(lbImg);
    lb.appendChild(lbCap);
    lb.appendChild(lbNav);
    document.body.appendChild(lb);

    let cur = 0;

    function open(idx) {
      cur = (idx + imgs.length) % imgs.length;
      lbImg.src = imgs[cur].src;
      lbImg.alt = imgs[cur].alt || '';
      lbCap.textContent = imgs[cur].alt || (cur + 1) + ' / ' + imgs.length;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }

    imgs.forEach((img, i) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => open(i));
    });

    lbCls.addEventListener('click', close);
    lbPrv.addEventListener('click', () => open(cur - 1));
    lbNxt.addEventListener('click', () => open(cur + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });

    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowRight') open(cur + 1);
      if (e.key === 'ArrowLeft')  open(cur - 1);
    });

    let tx = 0;
    lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend',   e => {
      const diff = tx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 48) diff > 0 ? open(cur + 1) : open(cur - 1);
    });
  }

  function init() {
    initScrollReveal();
    initBackTop();
    initProgressBar();
    initTyped();
    initLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
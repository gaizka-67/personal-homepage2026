(function () {
  'use strict';

  /* ── Deteksi halaman aktif ───────────────────────────────── */
  const PAGE = (() => {
    const f = location.pathname.split('/').pop() || 'index.html';
    if (f.includes('blog'))    return 'blog';
    if (f.includes('gallery')) return 'gallery';
    if (f.includes('contact')) return 'contact';
    return 'home';
  })();

  /* ── Inject global styles ────────────────────────────────── */
  const injectStyles = () => {
    const s = document.createElement('style');
    s.textContent = `
      /* Page fade-in */
      body { opacity: 0; transition: opacity 0.45s ease; }
      body.page-ready { opacity: 1; }

      /* Scroll-reveal base state */
      .sr { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s cubic-bezier(0.22,1,0.36,1); }
      .sr.visible { opacity: 1; transform: translateY(0); }

      /* Reading progress bar */
      #progress-bar {
        position: fixed; top: 0; left: 0; height: 3px; width: 0%;
        background: linear-gradient(90deg, #c0674a, #4a6fa5);
        z-index: 9999; border-radius: 0 99px 99px 0;
        transition: width 0.1s linear;
        pointer-events: none;
      }

      /* Back-to-top button */
      #back-top {
        position: fixed; bottom: 32px; right: 28px;
        width: 44px; height: 44px; border-radius: 50%;
        background: rgba(253,249,242,0.85);
        border: 1.5px solid rgba(176,154,126,0.5);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        color: #1e2328; font-size: 18px; line-height: 1;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 6px 20px rgba(30,35,40,0.12);
        opacity: 0; transform: translateY(10px) scale(0.85);
        transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        z-index: 999;
      }
      #back-top.show { opacity: 1; transform: translateY(0) scale(1); }
      #back-top:hover { background: #c0674a; color: #fdfaf6; border-color: #c0674a; }

      /* Lightbox */
      #lightbox {
        position: fixed; inset: 0;
        background: rgba(20,15,10,0.92);
        backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        z-index: 10000; opacity: 0; pointer-events: none;
        transition: opacity 0.3s ease;
      }
      #lightbox.open { opacity: 1; pointer-events: all; }
      #lightbox img {
        max-width: 90vw; max-height: 88vh;
        border-radius: 12px;
        box-shadow: 0 24px 80px rgba(0,0,0,0.6);
        transform: scale(0.88);
        transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
      }
      #lightbox.open img { transform: scale(1); }
      #lightbox-close {
        position: absolute; top: 20px; right: 24px;
        width: 40px; height: 40px; border-radius: 50%;
        background: rgba(255,255,255,0.12);
        border: 1px solid rgba(255,255,255,0.2);
        color: #fff; font-size: 20px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.2s;
      }
      #lightbox-close:hover { background: rgba(192,103,74,0.7); }
      #lightbox-caption {
        position: absolute; bottom: 24px; left: 50%;
        transform: translateX(-50%);
        color: rgba(255,255,255,0.7);
        font-family: 'Outfit', sans-serif;
        font-size: 13px; letter-spacing: 0.3px;
        background: rgba(0,0,0,0.4);
        border-radius: 99px; padding: 6px 18px;
        white-space: nowrap;
      }
      #lightbox-nav {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 16px; pointer-events: none;
      }
      .lb-arrow {
        width: 44px; height: 44px; border-radius: 50%;
        background: rgba(255,255,255,0.10);
        border: 1px solid rgba(255,255,255,0.18);
        color: #fff; font-size: 20px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        pointer-events: all;
        transition: background 0.2s, transform 0.2s;
      }
      .lb-arrow:hover { background: rgba(192,103,74,0.65); transform: scale(1.08); }

      /* Active nav button */
      button.nav-active {
        background: #1e2328 !important;
        color: #fdfaf6 !important;
        border-color: #1e2328 !important;
      }

      /* Ripple */
      .ripple-wrap { position: relative; overflow: hidden; display: inline-block; }
      .ripple-circle {
        position: absolute; border-radius: 50%;
        background: rgba(192,103,74,0.25);
        transform: scale(0); animation: ripple-anim 0.55s linear forwards;
        pointer-events: none;
      }
      @keyframes ripple-anim {
        to { transform: scale(3.5); opacity: 0; }
      }

      /* Typed cursor */
      #typed-cursor { border-right: 2px solid #c0674a; animation: blink 0.8s step-end infinite; }
      @keyframes blink { 50% { border-color: transparent; } }

      /* Image shimmer placeholder */
      .shimmer {
        background: linear-gradient(90deg, #e8e0d4 25%, #f2ece4 50%, #e8e0d4 75%);
        background-size: 200% 100%;
        animation: shimmer-move 1.4s infinite;
        border-radius: 8px;
      }
      @keyframes shimmer-move {
        from { background-position: 200% 0; }
        to   { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(s);
  };

  /* ── 1. Page fade-in ─────────────────────────────────────── */
  const initPageFade = () => {
    requestAnimationFrame(() => {
      setTimeout(() => document.body.classList.add('page-ready'), 30);
    });
  };

  /* ── 2. Smooth page transition on nav links ──────────────── */
  const initPageTransition = () => {
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      // only internal .html links
      if (!href || href.startsWith('http') || href.startsWith('#') || !href.endsWith('.html')) return;
      a.addEventListener('click', e => {
        e.preventDefault();
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity   = '0';
        setTimeout(() => { location.href = href; }, 310);
      });
    });
  };

  /* ── 3. Active nav button highlight ─────────────────────── */
  const initActiveNav = () => {
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.toLowerCase();
      const isActive =
        (PAGE === 'home'    && text.includes('home'))    ||
        (PAGE === 'blog'    && text.includes('blog'))    ||
        (PAGE === 'gallery' && text.includes('gallery')) ||
        (PAGE === 'contact' && text.includes('contact'));
      if (isActive) btn.classList.add('nav-active');
    });
  };

  /* ── 4. Ripple on buttons ────────────────────────────────── */
  const initRipple = () => {
    document.querySelectorAll('button').forEach(btn => {
      // wrap in relative container if not already
      const parent = btn.parentElement;
      if (parent && parent.tagName === 'A') parent.classList.add('ripple-wrap');
      btn.addEventListener('click', e => {
        const rect   = btn.getBoundingClientRect();
        const size   = Math.max(rect.width, rect.height);
        const x      = e.clientX - rect.left - size / 2;
        const y      = e.clientY - rect.top  - size / 2;
        const ripple = document.createElement('span');
        ripple.className = 'ripple-circle';
        Object.assign(ripple.style, {
          width: size + 'px', height: size + 'px',
          left: x + 'px', top: y + 'px'
        });
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  };

  /* ── 5. Scroll-reveal ────────────────────────────────────── */
  const initScrollReveal = () => {
    // Mark elements for reveal
    const targets = [
      ...document.querySelectorAll('h1, h2, h3'),
      ...document.querySelectorAll('table[width="700"]'),
      ...document.querySelectorAll('center > p'),
      ...document.querySelectorAll('center > img'),
    ];

    targets.forEach((el, i) => {
      el.classList.add('sr');
      el.style.transitionDelay = (i % 6) * 0.07 + 's';
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
  };

  /* ── 6. Reading progress bar (Blog) ─────────────────────── */
  const initProgressBar = () => {
    if (PAGE !== 'blog') return;
    const bar = document.createElement('div');
    bar.id = 'progress-bar';
    document.body.prepend(bar);

    window.addEventListener('scroll', () => {
      const docH   = document.documentElement.scrollHeight - window.innerHeight;
      const pct    = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  };

  /* ── 7. Back-to-top button ───────────────────────────────── */
  const initBackTop = () => {
    const btn = document.createElement('button');
    btn.id = 'back-top';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Kembali ke atas');
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 320);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  /* ── 8. Typed greeting text (Home only) ──────────────────── */
  const initTyped = () => {
    if (PAGE !== 'home') return;

    const phrases = [
      'Halo!',
      'Selamat Datang'
    ];

    // Find h2 or first heading on home
    const h2 = document.querySelector('h2');
    if (!h2) return;

    const original = h2.textContent.trim();
    let phraseIdx = 0, charIdx = 0, deleting = false;

    const cursor = document.createElement('span');
    cursor.id = 'typed-cursor';
    cursor.textContent = '|';

    const typedSpan = document.createElement('span');
    h2.textContent = '';
    h2.appendChild(typedSpan);
    h2.appendChild(cursor);

    const tick = () => {
      const current = phrases[phraseIdx];
      if (!deleting) {
        charIdx++;
        typedSpan.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(tick, 1800);
          return;
        }
        setTimeout(tick, 68);
      } else {
        charIdx--;
        typedSpan.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(tick, 300);
          return;
        }
        setTimeout(tick, 34);
      }
    };
    setTimeout(tick, 800);
  };

  /* ── 9. Lightbox for gallery & blog images ───────────────── */
  const initLightbox = () => {
    // Collect all content images (skip profile)
    const allImgs = [...document.querySelectorAll('img')].filter(img => {
      const src = img.getAttribute('src') || '';
      return !src.includes('gambardiri');
    });

    if (!allImgs.length) return;

    // Build lightbox DOM
    const lb      = document.createElement('div');
    lb.id         = 'lightbox';
    const lbImg   = document.createElement('img');
    const lbClose = document.createElement('button');
    lbClose.id    = 'lightbox-close';
    lbClose.innerHTML = '✕';
    const lbCap   = document.createElement('div');
    lbCap.id      = 'lightbox-caption';
    const lbNav   = document.createElement('div');
    lbNav.id      = 'lightbox-nav';
    const lbPrev  = document.createElement('button');
    lbPrev.className = 'lb-arrow';
    lbPrev.innerHTML = '‹';
    const lbNext  = document.createElement('button');
    lbNext.className = 'lb-arrow';
    lbNext.innerHTML = '›';
    lbNav.appendChild(lbPrev);
    lbNav.appendChild(lbNext);
    lb.appendChild(lbClose);
    lb.appendChild(lbImg);
    lb.appendChild(lbCap);
    lb.appendChild(lbNav);
    document.body.appendChild(lb);

    let current = 0;

    const open = idx => {
      current = (idx + allImgs.length) % allImgs.length;
      const img = allImgs[current];
      lbImg.src = img.src;
      lbImg.alt = img.alt || '';
      lbCap.textContent = img.alt || (current + 1) + ' / ' + allImgs.length;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    };

    // Make images clickable
    allImgs.forEach((img, i) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => open(i));
    });

    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click',  () => open(current - 1));
    lbNext.addEventListener('click',  () => open(current + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowRight')  open(current + 1);
      if (e.key === 'ArrowLeft')   open(current - 1);
    });

    // Touch/swipe support
    let touchX = 0;
    lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const diff = touchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? open(current + 1) : open(current - 1);
    });
  };

  /* ── 10. Image shimmer lazy-load ─────────────────────────── */
  const initLazyImages = () => {
    if (!('IntersectionObserver' in window)) return;

    document.querySelectorAll('img').forEach(img => {
      // Skip already-loaded images
      if (img.complete) return;

      const wrap = document.createElement('span');
      wrap.className = 'shimmer';
      wrap.style.display = 'inline-block';
      wrap.style.width    = (img.width  || 200) + 'px';
      wrap.style.height   = (img.height || 150) + 'px';
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.5s ease';

      const reveal = () => {
        img.style.opacity = '1';
        wrap.classList.remove('shimmer');
        wrap.style.background = 'none';
      };

      img.addEventListener('load', reveal);
      if (img.complete) reveal();
    });
  };

  /* ── 11. Smooth scroll for anchor links ──────────────────── */
  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  };

  /* ── 12. Gallery grid layout enhancement ─────────────────── */
  const initGalleryLayout = () => {
    if (PAGE !== 'gallery') return;

    const galleryImgs = document.querySelectorAll('center > img');
    galleryImgs.forEach((img, i) => {
      img.style.transitionDelay = (i * 0.06) + 's';
    });
  };

  /* ── 13. Contact link copy on click ─────────────────────── */
  const initContactCopy = () => {
    if (PAGE !== 'contact') return;

    const paragraphs = document.querySelectorAll('center > p');
    paragraphs.forEach(p => {
      const text = p.textContent.trim();
      // Only email & phone
      if (!text.includes('@') && !text.match(/\d{4}/)) return;

      p.style.cursor = 'pointer';
      p.title = 'Klik untuk menyalin';

      p.addEventListener('click', () => {
        // Extract the actual value (after the colon or emoji)
        const val = text.replace(/^[^:]+:\s*/, '').trim();
        if (!val || !navigator.clipboard) return;

        navigator.clipboard.writeText(val).then(() => {
          const orig = p.style.background;
          p.style.background = 'rgba(192,103,74,0.12)';
          p.style.transition = 'background 0.3s';

          const toast = document.createElement('small');
          toast.textContent = '✓ Tersalin!';
          toast.style.cssText = `
            margin-left: 10px; color: #c0674a;
            font-size: 12px; font-weight: 600;
            opacity: 1; transition: opacity 0.4s;
          `;
          p.appendChild(toast);
          setTimeout(() => {
            toast.style.opacity = '0';
            p.style.background = orig;
            setTimeout(() => toast.remove(), 400);
          }, 1600);
        });
      });
    });
  };

  /* ── Init all ────────────────────────────────────────────── */
  const init = () => {
    injectStyles();
    initPageFade();
    initPageTransition();
    initActiveNav();
    initRipple();
    initScrollReveal();
    initProgressBar();
    initBackTop();
    initTyped();
    initLightbox();
    initLazyImages();
    initSmoothScroll();
    initGalleryLayout();
    initContactCopy();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
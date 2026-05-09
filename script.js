document.addEventListener('DOMContentLoaded', () => {

    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('button').forEach(btn => {
        const parent = btn.closest('a');
        if (!parent) return;
        const href = parent.getAttribute('href') || '';
        if (href === page || (page === '' && href === 'index.html')) {
            btn.style.background    = 'var(--matcha)';
            btn.style.color         = 'white';
            btn.style.borderColor   = 'var(--matcha)';
            btn.style.fontWeight    = '600';
            btn.style.pointerEvents = 'none';
        }
    });

    const cards = document.querySelectorAll('center > table[width="700"]');
    cards.forEach((card, i) => {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(32px)';
        card.style.transition = `opacity 0.5s ${i * 0.12}s ease, transform 0.5s ${i * 0.12}s ease`;

        setTimeout(() => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0)';
        }, 80 + i * 120);
    });

    const galleryImgs = Array.from(document.querySelectorAll('img:not([src*="gambardiri"])'));

    if (galleryImgs.length > 0) {
        let currentIndex = 0;

        const style = document.createElement('style');
        style.textContent = `
            #lb-overlay {
                display: none;
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(30,46,32,0.93);
                z-index: 9000;
            }
            #lb-img {
                position: fixed;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                max-width: 82vw;
                max-height: 80vh;
                border-radius: 18px;
                box-shadow: 0 12px 60px rgba(0,0,0,0.6);
                opacity: 0;
                transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.34,1.56,0.64,1);
                z-index: 9002;
                display: none;
            }
            #lb-close {
                position: fixed;
                top: 16px; right: 16px;
                width: 42px; height: 42px;
                border-radius: 50%; border: none;
                background: white; color: #3a5a40;
                font-size: 1.2rem; font-weight: 700;
                cursor: pointer; line-height: 42px;
                text-align: center; padding: 0;
                box-shadow: 0 2px 12px rgba(0,0,0,0.35);
                z-index: 9003;
                display: none;
            }
            #lb-prev {
                position: fixed;
                top: 50%; left: 16px;
                transform: translateY(-50%);
                width: 46px; height: 46px;
                border-radius: 50%; border: none;
                background: white; color: #3a5a40;
                font-size: 1.4rem; font-weight: 700;
                cursor: pointer; line-height: 46px;
                text-align: center; padding: 0;
                box-shadow: 0 2px 14px rgba(0,0,0,0.35);
                z-index: 9003;
                display: none;
            }
            #lb-next {
                position: fixed;
                top: 50%; right: 16px;
                transform: translateY(-50%);
                width: 46px; height: 46px;
                border-radius: 50%; border: none;
                background: white; color: #3a5a40;
                font-size: 1.4rem; font-weight: 700;
                cursor: pointer; line-height: 46px;
                text-align: center; padding: 0;
                box-shadow: 0 2px 14px rgba(0,0,0,0.35);
                z-index: 9003;
                display: none;
            }
            #lb-counter {
                position: fixed;
                bottom: 20px; left: 50%;
                transform: translateX(-50%);
                color: rgba(255,255,255,0.82);
                font-size: 0.85rem; font-family: sans-serif;
                letter-spacing: 0.06em;
                z-index: 9003;
                display: none;
                pointer-events: none;
            }
            #lb-close:hover, #lb-prev:hover, #lb-next:hover {
                background: #6a9a6e !important;
                color: white !important;
            }
        `;
        document.head.appendChild(style);

        const overlay  = Object.assign(document.createElement('div'),    { id: 'lb-overlay' });
        const lbImg    = Object.assign(document.createElement('img'),    { id: 'lb-img' });
        const closeBtn = Object.assign(document.createElement('button'), { id: 'lb-close', textContent: '✕' });
        const prevBtn  = Object.assign(document.createElement('button'), { id: 'lb-prev',  innerHTML: '&#8592;' });
        const nextBtn  = Object.assign(document.createElement('button'), { id: 'lb-next',  innerHTML: '&#8594;' });
        const counter  = Object.assign(document.createElement('div'),    { id: 'lb-counter' });

        [overlay, lbImg, closeBtn, prevBtn, nextBtn, counter].forEach(el => document.body.appendChild(el));

        const allUI = [closeBtn, prevBtn, nextBtn, counter];

        const showImage = (index, dir = 1) => {
            currentIndex = (index + galleryImgs.length) % galleryImgs.length;
            lbImg.style.opacity   = '0';
            lbImg.style.transform = `translate(calc(-50% + ${dir > 0 ? '40px' : '-40px'}), -50%) scale(0.92)`;
            setTimeout(() => {
                lbImg.src             = galleryImgs[currentIndex].src;
                lbImg.style.opacity   = '1';
                lbImg.style.transform = 'translate(-50%, -50%) scale(1)';
                counter.textContent   = `${currentIndex + 1} / ${galleryImgs.length}`;
            }, 200);
        };

        const openLightbox = (index) => {
            overlay.style.display = 'block';
            lbImg.style.display   = 'block';
            allUI.forEach(el => el.style.display = 'block');
            document.body.style.overflow = 'hidden';
            showImage(index, 1);
        };

        const closeLightbox = () => {
            lbImg.style.opacity   = '0';
            lbImg.style.transform = 'translate(-50%, -50%) scale(0.88)';
            setTimeout(() => {
                overlay.style.display = 'none';
                lbImg.style.display   = 'none';
                allUI.forEach(el => el.style.display = 'none');
                document.body.style.overflow = '';
            }, 230);
        };

        galleryImgs.forEach((img, i) => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => openLightbox(i));
        });

        prevBtn.addEventListener('click',  (e) => { e.stopPropagation(); showImage(currentIndex - 1, -1); });
        nextBtn.addEventListener('click',  (e) => { e.stopPropagation(); showImage(currentIndex + 1,  1); });
        closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
        overlay.addEventListener('click',  () => closeLightbox());

        document.addEventListener('keydown', (e) => {
            if (overlay.style.display === 'none') return;
            if (e.key === 'Escape')     closeLightbox();
            if (e.key === 'ArrowRight') showImage(currentIndex + 1,  1);
            if (e.key === 'ArrowLeft')  showImage(currentIndex - 1, -1);
        });

        let touchStartX = 0;
        overlay.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
        overlay.addEventListener('touchend',   e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) diff > 0 ? showImage(currentIndex + 1, 1) : showImage(currentIndex - 1, -1);
        });
    }

    const allImgs = document.querySelectorAll('img');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity   = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    allImgs.forEach((img, i) => {
        img.style.opacity    = '0';
        img.style.transform  = 'translateY(20px)';
        img.style.transition = `opacity 0.5s ${(i % 5) * 0.08}s ease, transform 0.5s ${(i % 5) * 0.08}s ease, box-shadow 0.3s ease`;
        observer.observe(img);
    });

    const heading = document.querySelector('h2');
    if (heading && heading.textContent.includes('Selamat Datang')) {
        const full = heading.textContent.trim();
        heading.textContent = '';
        let i = 0;
        const type = () => {
            if (i < full.length) {
                heading.textContent += full[i++];
                setTimeout(type, 55);
            }
        };
        setTimeout(type, 400);
    }

    document.querySelectorAll('button').forEach(btn => {
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';

        btn.addEventListener('click', function(e) {
            const rect   = btn.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size   = Math.max(rect.width, rect.height);
            const x      = e.clientX - rect.left  - size / 2;
            const y      = e.clientY - rect.top   - size / 2;

            Object.assign(ripple.style, {
                position:     'absolute',
                width:        size + 'px',
                height:       size + 'px',
                left:         x + 'px',
                top:          y + 'px',
                borderRadius: '50%',
                background:   'rgba(255,255,255,0.4)',
                transform:    'scale(0)',
                animation:    'ripple-anim 0.5s ease-out',
                pointerEvents:'none',
            });

            btn.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });

    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple-anim {
                to { transform: scale(2.5); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    const footer = document.querySelector('footer p');
    if (footer) {
        footer.innerHTML = footer.innerHTML.replace('2026', new Date().getFullYear());
    }

    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#')) return;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.style.transition = 'opacity 0.25s ease';
            document.body.style.opacity    = '0';
            setTimeout(() => {
                window.location.href = href;
            }, 250);
        });
    });

    document.body.style.opacity    = '0';
    document.body.style.transition = 'opacity 0.4s ease';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });

});

 let current = 0;
    const total = 2;

    function goToSlide(index) {
        const track = document.querySelector('.slides-track');
        const dots  = document.querySelectorAll('.dot');
        const slides = document.querySelectorAll('.slide');

        slides[current].classList.remove('active');
        slides[current].classList.add(index > current ? 'exit-left' : 'exit-right');

        setTimeout(() => {
            slides[current].classList.remove('exit-left', 'exit-right');
            current = index;
            slides[current].classList.add('active');
        }, 380);

        dots.forEach((d, i) => d.classList.toggle('active', i === index));

        track.style.transform = `translateX(-${index * 100}%)`;
    }

    function nextSlide() { goToSlide((current + 1) % total); }
    function prevSlide() { goToSlide((current - 1 + total) % total); }

    let touchStartX = 0;
    const wrapper = document.querySelector('.slide-wrapper');
    wrapper.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
    wrapper.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
    });

    document.querySelectorAll('.slide')[0].classList.add('active');
/**
 * Configuração do site — atualize antes de publicar
 */
const SITE_CONFIG = {
    whatsapp: '5518996589306',
    whatsappMessage: 'Olá, Giovana! Gostaria de agendar uma consulta.',
    instagram: 'https://instagram.com/nutri.giovannabordao',
    email: 'giovannabordao@outlook.com'
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getWhatsAppUrl(message) {
    const text = encodeURIComponent(message || SITE_CONFIG.whatsappMessage);
    return `https://wa.me/${SITE_CONFIG.whatsapp}?text=${text}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function initWhatsAppLinks() {
    const url = getWhatsAppUrl();
    document.querySelectorAll('[data-whatsapp]').forEach((el) => {
        el.setAttribute('href', url);
        if (el.getAttribute('target') === null && el.tagName === 'A') {
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

function initSocialLinks() {
    const instagram = document.querySelector('.social-link.gradient-instagram');
    if (instagram) instagram.href = SITE_CONFIG.instagram;
}

function initHeader() {
    const header = document.getElementById('header');
    const navToggle = document.querySelector('.nav-toggle');
    const siteNav = document.querySelector('.site-nav');

    if (!header || !navToggle || !siteNav) return;

    const closeMenu = () => {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-open');
    };

    navToggle.addEventListener('click', () => {
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!isOpen));
        siteNav.classList.toggle('is-open', !isOpen);
    });

    siteNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    const onScroll = debounce(() => {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
    }, 16);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        });
    });
}

function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    if (prefersReducedMotion) {
        elements.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
}

function initParallax() {
    if (prefersReducedMotion) return;

    const heroBackground = document.querySelector('.hero-background');
    if (!heroBackground) return;

    let ticking = false;

    const updateParallax = () => {
        const rate = window.scrollY * 0.35;
        heroBackground.style.transform = `translate3d(0, ${rate}px, 0)`;
        ticking = false;
    };

    window.addEventListener(
        'scroll',
        () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        },
        { passive: true }
    );
}

function initScrollProgress() {
    const indicator = document.querySelector('.scroll-progress');
    if (!indicator) return;

    const update = () => {
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
        indicator.style.width = `${progress}%`;
    };

    window.addEventListener('scroll', debounce(update, 16), { passive: true });
    update();
}

function initScrollIndicator() {
    const indicator = document.querySelector('.scroll-indicator');
    const about = document.querySelector('#about');
    if (!indicator || !about) return;

    indicator.addEventListener('click', () => {
        about.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
}

function initTestimonialsCarousel() {
    const carousel = document.querySelector('.testimonial-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.testimonial-carousel__track');
    const items = Array.from(carousel.querySelectorAll('[data-carousel-item]'));
    const prevBtn = carousel.querySelector('.carousel-btn--prev');
    const nextBtn = carousel.querySelector('.carousel-btn--next');
    const indicatorContainer = carousel.querySelector('.carousel-indicators');

    if (!track || !items.length || !prevBtn || !nextBtn || !indicatorContainer) return;

    let activeIndex = 0;
    let autoplayId = null;
    let touchStartX = 0;
    let touchCurrentX = 0;
    let isTouchDragging = false;
    const swipeThreshold = 60;

    const setActiveIndex = (index) => {
        activeIndex = ((index % items.length) + items.length) % items.length;
        track.style.transform = `translateX(-${activeIndex * 100}%)`;
        indicatorContainer.querySelectorAll('button').forEach((button, idx) => {
            button.setAttribute('aria-selected', String(idx === activeIndex));
        });
    };

    const resetAutoplay = () => {
        if (prefersReducedMotion) return;
        if (autoplayId) clearInterval(autoplayId);
        autoplayId = setInterval(() => setActiveIndex(activeIndex + 1), 7000);
    };

    const handleTouchStart = (event) => {
        if (event.touches.length !== 1) return;
        touchStartX = event.touches[0].clientX;
        touchCurrentX = touchStartX;
        isTouchDragging = true;
        track.style.transition = 'none';
        if (autoplayId) clearInterval(autoplayId);
    };

    const handleTouchMove = (event) => {
        if (!isTouchDragging || event.touches.length !== 1) return;
        touchCurrentX = event.touches[0].clientX;
        const deltaX = touchCurrentX - touchStartX;
        track.style.transform = `translateX(calc(-${activeIndex * 100}% + ${deltaX}px))`;
    };

    const handleTouchEnd = () => {
        if (!isTouchDragging) return;
        isTouchDragging = false;
        const deltaX = touchCurrentX - touchStartX;
        track.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';

        if (Math.abs(deltaX) > swipeThreshold) {
            if (deltaX < 0) {
                setActiveIndex(activeIndex + 1);
            } else {
                setActiveIndex(activeIndex - 1);
            }
        } else {
            setActiveIndex(activeIndex);
        }

        resetAutoplay();
    };

    items.forEach((_, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', `Depoimento ${index + 1}`);
        button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        button.addEventListener('click', () => {
            setActiveIndex(index);
            resetAutoplay();
        });
        indicatorContainer.appendChild(button);
    });

    prevBtn.addEventListener('click', () => {
        setActiveIndex(activeIndex - 1);
        resetAutoplay();
    });
    nextBtn.addEventListener('click', () => {
        setActiveIndex(activeIndex + 1);
        resetAutoplay();
    });

    if (!prefersReducedMotion) {
        resetAutoplay();
        carousel.addEventListener('mouseenter', () => {
            if (autoplayId) clearInterval(autoplayId);
        });
        carousel.addEventListener('mouseleave', () => {
            resetAutoplay();
        });
    }

    carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
    carousel.addEventListener('touchmove', handleTouchMove, { passive: true });
    carousel.addEventListener('touchend', handleTouchEnd);
    carousel.addEventListener('touchcancel', handleTouchEnd);

    setActiveIndex(0);
}

function initRipple() {
    document.querySelectorAll('.btn').forEach((button) => {
        button.addEventListener('click', (e) => {
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

function initStatCounters() {
    const animateCounter = (element, target, suffix) => {
        const duration = 2000;
        const start = performance.now();

        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const value = Math.floor(progress * target);
            element.textContent = `${value}${suffix}`;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = `${target}${suffix}`;
            }
        };

        requestAnimationFrame(step);
    };

    const statsObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const statValue = entry.target.querySelector('.stat-value');
                if (!statValue || statValue.dataset.animated === 'true') return;

                const suffix = statValue.dataset.suffix || '';
                const target = parseInt(statValue.textContent.replace(/\D/g, ''), 10);

                if (!Number.isNaN(target)) {
                    animateCounter(statValue, target, suffix);
                }

                statValue.dataset.animated = 'true';
                statsObserver.unobserve(entry.target);
            });
        },
        { threshold: 0.5 }
    );

    document.querySelectorAll('.stat-item').forEach((stat) => statsObserver.observe(stat));
}

function initPrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    const trigger = document.getElementById('privacidade');
    if (!modal || !trigger) return;

    const open = (e) => {
        e.preventDefault();
        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const close = () => {
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    trigger.addEventListener('click', open);
    modal.querySelectorAll('[data-close-modal]').forEach((el) => {
        el.addEventListener('click', close);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) close();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initWhatsAppLinks();
    initSocialLinks();
    initHeader();
    initSmoothScroll();
    initScrollAnimations();
    initParallax();
    initScrollProgress();
    initScrollIndicator();
    initRipple();
    initStatCounters();
    initTestimonialsCarousel();
    initPrivacyModal();
});

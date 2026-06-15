/* =============================================================
   NUVIO GEAR — main.js
   Scroll animations, form validation, product page filter, utilities
   ============================================================= */

(function () {
  'use strict';

  /* ── INTERSECTION OBSERVER — FADE IN ── */
  function initScrollAnimations() {
    const els = document.querySelectorAll('.fade-in');
    if (!els.length) return;

    // Skip animations if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach(el => observer.observe(el));
  }

  /* ── FORM VALIDATION ── */
  const validators = {
    required: (val) => val.trim() !== '' ? null : 'This field is required.',
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? null : 'Please enter a valid email address.',
    minLength: (n) => (val) => val.trim().length >= n ? null : `Must be at least ${n} characters.`,
  };

  function validateField(input) {
    const group = input.closest('.form-group');
    if (!group) return true;

    const errEl = group.querySelector('.form-error');
    let error = null;

    if (input.required) {
      error = validators.required(input.value);
    }

    if (!error && input.type === 'email' && input.value.trim()) {
      error = validators.email(input.value);
    }

    if (!error && input.dataset.minlength) {
      error = validators.minLength(parseInt(input.dataset.minlength))(input.value);
    }

    group.classList.toggle('has-error', !!error);
    group.classList.toggle('has-success', !error && input.value.trim() !== '');
    if (errEl) errEl.textContent = error || '';

    return !error;
  }

  function initFormValidation() {
    const forms = document.querySelectorAll('[data-validate]');

    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');

      // Live validation on blur
      inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
          if (input.closest('.form-group')?.classList.contains('has-error')) {
            validateField(input);
          }
        });
      });

      form.addEventListener('submit', e => {
        e.preventDefault();

        let valid = true;
        inputs.forEach(input => {
          if (!validateField(input)) valid = false;
        });

        if (!valid) {
          const firstError = form.querySelector('.form-group.has-error input, .form-group.has-error textarea');
          firstError?.focus();
          return;
        }

        // Success state
        const successMsg = form.querySelector('.form-success-msg');
        const submitBtn  = form.querySelector('[type="submit"]');

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending…';
        }

        // Simulate async submission (replace with real fetch in production)
        setTimeout(() => {
          form.reset();
          inputs.forEach(input => {
            const group = input.closest('.form-group');
            group?.classList.remove('has-success', 'has-error');
          });

          if (successMsg) successMsg.classList.add('visible');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
          }

          setTimeout(() => successMsg?.classList.remove('visible'), 5000);
        }, 900);
      });
    });
  }

  /* ── FLEET FORM HANDLING ── */
  function initFleetForm() {
    const form = document.querySelector('[data-fleet-form]');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();

      const btn = form.querySelector('[type="submit"]');
      const success = form.querySelector('.form-success-msg');

      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      setTimeout(() => {
        form.reset();
        if (success) success.classList.add('visible');
        if (btn) { btn.disabled = false; btn.textContent = 'Get Fleet Quote'; }
        setTimeout(() => success?.classList.remove('visible'), 6000);
      }, 1000);
    });
  }

  /* ── PRODUCTS PAGE FILTER ── */
  function initProductFilter() {
    const filterForm = document.querySelector('.filter-sidebar');
    if (!filterForm) return;

    const categoryInputs = filterForm.querySelectorAll('[name="category"]');
    const sortSelect     = document.querySelector('.sort-select');
    const productCards   = document.querySelectorAll('.product-card-wrap');
    const countEl        = document.querySelector('.products-count');

    function applyFilters() {
      const activeCategories = [...categoryInputs]
        .filter(i => i.checked)
        .map(i => i.value);

      const sortValue = sortSelect?.value || 'default';

      let visible = 0;

      productCards.forEach(card => {
        const cat  = card.dataset.category || '';
        const show = activeCategories.length === 0 || activeCategories.includes(cat);
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      if (countEl) countEl.textContent = `${visible} products`;

      // Sort visible cards
      if (sortValue !== 'default') {
        const grid = document.querySelector('.product-grid');
        if (!grid) return;

        const cards = [...grid.querySelectorAll('.product-card-wrap')].filter(
          c => c.style.display !== 'none'
        );

        cards.sort((a, b) => {
          const priceA = parseFloat(a.dataset.price) || 0;
          const priceB = parseFloat(b.dataset.price) || 0;
          const nameA  = a.dataset.name || '';
          const nameB  = b.dataset.name || '';

          if (sortValue === 'price-asc')  return priceA - priceB;
          if (sortValue === 'price-desc') return priceB - priceA;
          if (sortValue === 'name-asc')   return nameA.localeCompare(nameB);
          return 0;
        });

        cards.forEach(card => grid.appendChild(card));
      }
    }

    categoryInputs.forEach(input => input.addEventListener('change', applyFilters));
    sortSelect?.addEventListener('change', applyFilters);
  }

  /* ── PAGINATION ── */
  function initPagination() {
    const pageBtns = document.querySelectorAll('.page-btn[data-page]');

    pageBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        pageBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // In a real app: fetch page or show/hide card slices
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  /* ── HERO SCROLL ARROW ── */
  function initHeroScroll() {
    const arrow = document.querySelector('.hero-scroll');
    if (!arrow) return;

    arrow.addEventListener('click', () => {
      const nextSection = document.querySelector('.categories, .featured-categories');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      }
    });

    arrow.style.cursor = 'pointer';
  }

  /* ── COUNTER ANIMATION ── */
  function animateCounter(el, target, duration = 1600) {
    const start  = performance.now();
    const isFloat = String(target).includes('.');

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      const value = isFloat
        ? (eased * target).toFixed(1)
        : Math.round(eased * target).toLocaleString();

      el.textContent = value;

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el     = entry.target;
            const target = parseFloat(el.dataset.counter);
            animateCounter(el, target);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(el => observer.observe(el));
  }

  /* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */
  function initSmoothScroll() {
    document.addEventListener('click', e => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const id = anchor.getAttribute('href').slice(1);
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ── IMAGE LAZY LOAD POLYFILL ── */
  function initLazyImages() {
    if ('loading' in HTMLImageElement.prototype) return; // native support

    const images = document.querySelectorAll('img[loading="lazy"]');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => observer.observe(img));
  }

  /* ── NEWSLETTER FORM ── */
  function initNewsletter() {
    const forms = document.querySelectorAll('.newsletter-form');

    forms.forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const input = form.querySelector('.newsletter-input');
        const btn   = form.querySelector('button[type="submit"]');

        if (!input || !input.value.trim()) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
          input.style.borderColor = '#ff4444';
          input.focus();
          return;
        }

        input.style.borderColor = '';
        if (btn) { btn.disabled = true; btn.textContent = '✓ Subscribed'; }
        input.value = '';

        setTimeout(() => {
          if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; }
        }, 4000);
      });
    });
  }

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initFormValidation();
    initFleetForm();
    initProductFilter();
    initPagination();
    initHeroScroll();
    initCounters();
    initSmoothScroll();
    initLazyImages();
    initNewsletter();
  });

})();

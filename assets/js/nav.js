/* =============================================================
   NUVIO GEAR — nav.js
   Sticky header, mobile hamburger, mega dropdown, announcement bar
   ============================================================= */

(function () {
  'use strict';

  /* ── ANNOUNCEMENT BAR ── */
  const BAR_KEY = 'ng_announce_dismissed_v1';

  function initAnnouncementBar() {
    const bar = document.querySelector('.announcement-bar');
    if (!bar) return;

    // Restore dismissed state
    if (localStorage.getItem(BAR_KEY) === '1') {
      bar.classList.add('hidden');
    }

    const closeBtn = bar.querySelector('.announcement-bar__close');
    if (!closeBtn) return;

    closeBtn.addEventListener('click', () => {
      bar.classList.add('hidden');
      localStorage.setItem(BAR_KEY, '1');
    });
  }

  /* ── STICKY NAV ── */
  function initStickyNav() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;

    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;

      if (y > 20) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      lastY = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* ── ACTIVE NAV LINK ── */
  function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-link, .mobile-nav-link');

    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ── MOBILE HAMBURGER ── */
  function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');

    if (!hamburger || !mobileNav) return;

    let isOpen = false;

    function openNav() {
      isOpen = true;
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      isOpen = false;
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      isOpen ? closeNav() : openNav();
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) closeNav();
    });

    // Close when clicking a link inside mobile nav
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeNav);
    });

    // Sub-section toggles in mobile nav
    const subToggles = mobileNav.querySelectorAll('[data-sub-toggle]');
    subToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const targetId = toggle.dataset.subToggle;
        const sub = document.getElementById(targetId);
        if (!sub) return;
        const open = sub.style.display === 'flex';
        sub.style.display = open ? 'none' : 'flex';
        toggle.setAttribute('aria-expanded', String(!open));
      });
    });
  }

  /* ── MEGA DROPDOWN KEYBOARD SUPPORT ── */
  function initMegaDropdown() {
    const dropdownItems = document.querySelectorAll('.nav-item');

    dropdownItems.forEach(item => {
      const trigger = item.querySelector('.nav-link');
      const dropdown = item.querySelector('.mega-dropdown');
      if (!trigger || !dropdown) return;

      // Show on focus
      trigger.addEventListener('focus', () => {
        dropdown.style.opacity = '1';
        dropdown.style.pointerEvents = 'auto';
        dropdown.style.transform = 'translateX(-50%) translateY(0)';
      });

      // Hide when focus leaves the whole nav-item
      item.addEventListener('focusout', e => {
        if (!item.contains(e.relatedTarget)) {
          dropdown.style.opacity = '';
          dropdown.style.pointerEvents = '';
          dropdown.style.transform = '';
        }
      });

      // Escape collapses dropdown
      item.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          trigger.focus();
          dropdown.style.opacity = '';
          dropdown.style.pointerEvents = '';
          dropdown.style.transform = '';
        }
      });
    });
  }

  /* ── COLLAPSIBLE FILTER GROUPS ── */
  function initCollapsibles() {
    const toggles = document.querySelectorAll('.collapsible-toggle');

    toggles.forEach(toggle => {
      const targetId = toggle.getAttribute('aria-controls');
      const body = targetId
        ? document.getElementById(targetId)
        : toggle.nextElementSibling;

      if (!body) return;

      // Start open by default on desktop
      const startOpen = window.innerWidth >= 1024;
      if (startOpen) {
        body.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        toggle.setAttribute('aria-expanded', 'false');
      }

      toggle.addEventListener('click', () => {
        const isOpen = body.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });
    });
  }

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', () => {
    initAnnouncementBar();
    initStickyNav();
    setActiveNavLink();
    initMobileNav();
    initMegaDropdown();
    initCollapsibles();
  });

})();

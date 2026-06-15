/* =============================================================
   NUVIO GEAR — cart.js
   Cart state (localStorage), drawer UI, add/remove, qty, badge
   ============================================================= */

(function () {
  'use strict';

  const CART_KEY = 'ng_cart_v1';

  /* ── STATE ── */
  let cart = loadCart();

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // Storage full or unavailable — silently continue
    }
  }

  /* ── CART OPERATIONS ── */

  function addItem(id, name, price, qty = 1) {
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, 99);
    } else {
      cart.push({ id, name, price, qty });
    }
    saveCart();
    render();
    showToast(`${name} added to cart`);
  }

  function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    render();
  }

  function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, Math.min(99, item.qty + delta));
    saveCart();
    render();
  }

  function getTotal() {
    return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function getTotalQty() {
    return cart.reduce((sum, i) => sum + i.qty, 0);
  }

  /* ── BADGE ── */
  function updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const qty = getTotalQty();
    badges.forEach(badge => {
      badge.textContent = qty > 99 ? '99+' : qty;
      badge.classList.toggle('active', qty > 0);
    });
  }

  /* ── DRAWER UI ── */
  function openDrawer() {
    const overlay = document.querySelector('.cart-overlay');
    const drawer  = document.querySelector('.cart-drawer');
    overlay?.classList.add('open');
    drawer?.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus trap: focus first focusable element
    const firstFocus = drawer?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    firstFocus?.focus();
  }

  function closeDrawer() {
    const overlay = document.querySelector('.cart-overlay');
    const drawer  = document.querySelector('.cart-drawer');
    overlay?.classList.remove('open');
    drawer?.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── RENDER CART ── */
  function render() {
    updateBadge();
    renderDrawer();
  }

  function renderDrawer() {
    const itemsEl = document.querySelector('.cart-items');
    const countEl = document.querySelector('.cart-count');
    const totalEl = document.querySelector('.cart-total-amount');
    const subtotalEl = document.querySelector('.cart-subtotal-amount');
    const checkoutBtn = document.querySelector('.btn-checkout');

    if (!itemsEl) return;

    const qty = getTotalQty();
    const total = getTotal();

    if (countEl) countEl.textContent = `(${qty} ${qty === 1 ? 'item' : 'items'})`;
    if (totalEl) totalEl.textContent = `€${total.toFixed(2)}`;
    if (subtotalEl) subtotalEl.textContent = `€${total.toFixed(2)}`;
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;

    if (cart.length === 0) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <svg class="cart-empty-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16h40l-4 24H16L12 16z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <circle cx="22" cy="52" r="3" stroke="currentColor" stroke-width="2"/>
            <circle cx="42" cy="52" r="3" stroke="currentColor" stroke-width="2"/>
            <path d="M8 8h4l4 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>Your cart is empty</p>
          <a href="products.html" class="btn btn-outline-accent btn-sm" onclick="closeCartDrawer()">Shop Now</a>
        </div>
      `;
      return;
    }

    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img">
          ${makeCartItemSVG(item.name)}
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHTML(item.name)}</div>
          <div class="cart-item-price">€${item.price.toFixed(2)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" aria-label="Decrease" onclick="ngCart.updateQty('${item.id}', -1)">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" aria-label="Increase" onclick="ngCart.updateQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" aria-label="Remove ${escapeHTML(item.name)}" onclick="ngCart.removeItem('${item.id}')">×</button>
      </div>
    `).join('');
  }

  /* Mini SVG thumbnail for cart item */
  function makeCartItemSVG(name) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <rect width="64" height="64" fill="#1A1A1A"/>
      <text x="32" y="38" text-anchor="middle" font-family="Barlow Condensed, sans-serif"
        font-size="24" font-weight="700" fill="#C6FF00">${initial}</text>
    </svg>`;
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── ADD TO CART BUTTONS ── */
  function initAddToCartButtons() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-add-to-cart]');
      if (!btn) return;

      const id    = btn.dataset.addToCart;
      const name  = btn.dataset.name  || 'Product';
      const price = parseFloat(btn.dataset.price) || 0;

      addItem(id, name, price);

      // Button feedback animation
      const prevText = btn.textContent;
      btn.classList.add('added');
      btn.textContent = '✓ Added';
      btn.disabled = true;

      setTimeout(() => {
        btn.classList.remove('added');
        btn.textContent = prevText;
        btn.disabled = false;
      }, 1800);
    });
  }

  /* ── CART BUTTON TOGGLE ── */
  function initCartToggle() {
    // Open drawer
    document.addEventListener('click', e => {
      if (e.target.closest('.cart-btn')) {
        openDrawer();
      }
    });

    // Close via overlay
    document.querySelector('.cart-overlay')?.addEventListener('click', closeDrawer);

    // Close via close button
    document.querySelector('.cart-close')?.addEventListener('click', closeDrawer);

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const drawer = document.querySelector('.cart-drawer');
        if (drawer?.classList.contains('open')) closeDrawer();
      }
    });
  }

  /* ── TOAST NOTIFICATION ── */
  let toastTimer = null;

  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  /* ── PUBLIC API ── */
  window.ngCart = {
    addItem,
    removeItem,
    updateQty,
    openDrawer,
    closeDrawer,
    showToast,
    getCart: () => [...cart],
  };

  // Expose for inline onclick
  window.closeCartDrawer = closeDrawer;

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', () => {
    initCartToggle();
    initAddToCartButtons();
    render(); // Restore cart from localStorage on page load
  });

})();

# Nuvio Gear — Static Website

Premium courier equipment brand site. Dark, bold, performance-focused aesthetic targeting gig-economy couriers and delivery fleets.

## Project Structure

```
nuvio-gear-website/
├── index.html            # Homepage (hero, categories, bestsellers, fleet, testimonials)
├── products.html         # Product grid with filter sidebar and pagination
├── about.html            # Brand story, team cards, timeline
├── contact.html          # Contact form, B2B inquiry, map
├── assets/
│   ├── css/
│   │   ├── main.css       # Design tokens, reset, all page-level styles
│   │   ├── components.css # Buttons, forms, product cards, cart drawer, tags
│   │   └── responsive.css # Mobile-first media queries (320→1440px)
│   ├── js/
│   │   ├── nav.js         # Sticky header, hamburger menu, announcement bar
│   │   ├── cart.js        # Cart drawer, localStorage persistence, badge
│   │   └── main.js        # Scroll animations, form validation, counters
│   └── images/
│       └── placeholder/   # SVG placeholders for all images
└── README.md
```

## How to Run Locally

No build step required — pure HTML/CSS/JS.

**Option 1 — VS Code Live Server:**
1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Right-click `index.html` → "Open with Live Server"

**Option 2 — Python HTTP server:**
```bash
cd nuvio-gear-website
python3 -m http.server 8080
# Open http://localhost:8080
```

**Option 3 — Node.js serve:**
```bash
npx serve .
```

> **Important:** Open via a server (not `file://`) so that relative paths resolve correctly and localStorage works as expected.

## Brand Identity

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0A0A0A` | Page background |
| Card bg | `#1A1A2E` | Cards, nav, footer |
| Accent | `#F5A623` | Primary amber — icons, prices, highlights |
| CTA | `#FF6B35` | Call-to-action buttons |
| Text | `#FFFFFF` | Headlines |
| Muted | `#AAAAAA` | Body copy, labels |
| Display font | Barlow Condensed | Headlines, nav, prices |
| Body font | Inter | Paragraphs, labels |

All design tokens are CSS custom properties in `assets/css/main.css` under `:root`.

## Customization Guide

### Changing Colors
Edit the `:root` block at the top of `assets/css/main.css`:
```css
:root {
  --color-accent: #F5A623;   /* Change amber to your brand color */
  --color-cta:    #FF6B35;   /* CTA button color */
}
```

### Adding Products
In `products.html`, copy a `.product-card-wrap` block and update:
- `data-category` — `thermal`, `backpacks`, `safety`, or `accessories`
- `data-price` — numeric price
- `data-name` — product name
- `data-add-to-cart` — unique slug ID
- `data-name` and `data-price` on the buttons
- Image `src` and `alt`

### Adding Pages
1. Copy the nav and footer HTML from an existing page
2. Update the `aria-current="page"` attribute on the active nav link
3. Add the three `<script>` tags at the bottom

### Replacing SVG Placeholders with Real Images
Swap `<img src="assets/images/placeholder/...">` with your actual images. The CSS uses `object-fit: cover` everywhere so any aspect ratio will work — just set a consistent aspect ratio on the container.

### Connecting Forms
The contact and fleet forms simulate submission with a 900ms delay. To wire up a real backend:
1. In `assets/js/main.js`, find the `setTimeout` in `initFormValidation()`
2. Replace it with a `fetch()` call to your API endpoint
3. Handle errors in the catch block

### Cart & Checkout
The cart stores state in `localStorage` under key `ng_cart_v1`. To connect a real checkout:
1. In `assets/js/cart.js`, find the `.btn-checkout` click handler (add one to the button)
2. Call your payment provider's SDK or redirect to a checkout URL with cart items encoded as query params

## JavaScript Features

| Feature | File | Key function |
|---------|------|--------------|
| Sticky header | `nav.js` | `initStickyNav()` |
| Mobile hamburger | `nav.js` | `initMobileNav()` |
| Announcement bar dismiss | `nav.js` | `initAnnouncementBar()` |
| Cart drawer | `cart.js` | `openDrawer()` / `closeDrawer()` |
| Add to cart | `cart.js` | `addItem(id, name, price)` |
| Cart badge | `cart.js` | `updateBadge()` |
| Scroll fade-in | `main.js` | `initScrollAnimations()` |
| Form validation | `main.js` | `initFormValidation()` |
| Counter animation | `main.js` | `initCounters()` |
| Product filter | `main.js` | `initProductFilter()` |

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari iOS 14+

Uses: CSS custom properties, CSS Grid/Flexbox, IntersectionObserver, localStorage. No polyfills needed for modern browsers.

## Deployment

Drop the entire folder into any static hosting service:
- **Netlify:** Drag & drop the folder at netlify.com/drop
- **Vercel:** `npx vercel` from the project directory
- **GitHub Pages:** Push to a repo, enable Pages in Settings → Pages
- **Cloudflare Pages:** Connect GitHub repo in the Cloudflare dashboard

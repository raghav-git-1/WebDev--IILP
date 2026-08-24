# SimpleShop — Demo E-commerce Frontend

This repository contains a simple, static e-commerce frontend you can use as a starting point for a project or for learning. It is intentionally frontend-only and stores the cart in localStorage.

Files added
- index.html — main page
- styles.css — basic responsive styles
- script.js — frontend logic: load products, cart (localStorage), checkout form
- products.json — sample product data

How to run
1. Clone the repository (or use GitHub Pages).
2. Open index.html in your browser. Since this is a static site, no server is required. If you run into CORS when fetching products.json, serve the folder with a simple static server, for example:

   - Python 3: python -m http.server 8000
   - Node (http-server): npx http-server

Customization / Next steps
- Replace products.json with your API endpoints to fetch real products.
- Hook up a backend for real checkout and payment processing.
- Improve accessibility and add keyboard navigation to modals and drawer.
- Replace placeholder images with real product images.

Notes
- This demo does not process payments — the checkout form is illustrative and clears the cart locally.


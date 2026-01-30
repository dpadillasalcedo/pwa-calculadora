/* =========================================================
   ROOT · DARK THEME
========================================================= */
:root {
  --bg: #020617;
  --panel: #0b1220;
  --border: #1e293b;

  --text: #e5e7eb;
  --muted: #94a3b8;

  --primary: #38bdf8;
  --primary-strong: #0ea5e9;
}

/* =========================================================
   BASE
========================================================= */
* { box-sizing: border-box; }

html, body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  line-height: 1.6;
}

body {
  padding-bottom: env(safe-area-inset-bottom);
}

a {
  color: var(--primary);
  text-decoration: none;
}

a:hover {
  color: var(--primary-strong);
}

/* =========================================================
   LAYOUT
========================================================= */
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem;
}

.app {
  padding-top: 0.5rem;
}

/* =========================================================
   BREADCRUMB
========================================================= */
.breadcrumb {
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
  color: #f8fafc;
}

.breadcrumb a {
  color: #f8fafc;
  font-weight: 500;
}

.breadcrumb a:hover {
  color: var(--primary-strong);
}

.breadcrumb span {
  margin: 0 0.4rem;
}

/* =========================================================
   HEADER
========================================================= */
.app-header {
  margin-bottom: 2rem;
}

.app-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #f8fafc;
}

.subtitle {
  margin-top: 0.5rem;
  color: var(--muted);
  max-width: 760px;
}

/* =========================================================
   PANEL
========================================================= */
.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.75rem;
}

.panel h2 {
  margin-top: 1.75rem;
  font-size: 1.2rem;
  color: #f8fafc;
}

.panel h2:first-child {
  margin-top: 0;
}

.panel p {
  margin-top: 0.5rem;
  color: var(--text);
}

/* =========================================================
   FOOTER
========================================================= */
.site-footer {
  border-top: 1px solid var(--border);
  margin-top: 3rem;
  padding: 2rem 1rem calc(2rem + env(safe-area-inset-bottom));
  background: var(--panel);
}

.footer-inner {
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.footer-nav {
  font-size: 0.9rem;
  color: #f8fafc;
}

.footer-nav a {
  color: #f8fafc;
  font-weight: 500;
}

.footer-nav a:hover {
  color: var(--primary-strong);
}

.footer-copy {
  font-size: 0.8rem;
  color: #f8fafc;
  margin: 0;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }

  .app-header h1 {
    font-size: 1.55rem;
  }
}

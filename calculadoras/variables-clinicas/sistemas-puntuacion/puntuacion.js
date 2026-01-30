/* =========================================================
   ROOT · DARK THEME
========================================================= */
:root {
  --bg: #020617;
  --panel: #0b1220;
  --card: #0f172a;
  --border: #1e293b;

  --text: #e5e7eb;
  --muted: #94a3b8;

  --primary: #38bdf8;
  --primary-strong: #0ea5e9;

  --ok: #22c55e;
  --warn: #f59e0b;
  --bad: #ef4444;
}

/* =========================================================
   RESET / BASE
========================================================= */
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  line-height: 1.5;
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

.app-header .note {
  margin-top: 0.5rem;
  color: var(--muted);
  max-width: 760px;
  font-size: 0.9rem;
}

/* =========================================================
   PANELS
========================================================= */
.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.75rem;
  margin-bottom: 2.5rem;
}

.panel h2 {
  margin: 0 0 1rem;
  font-size: 1.3rem;
  color: #f8fafc;
}

.panel h3 {
  margin-top: 1.75rem;
  margin-bottom: 0.5rem;
  font-size: 1.05rem;
  color: var(--primary);
}

/* =========================================================
   FORM ELEMENTS
========================================================= */
label {
  display: block;
  margin-top: 0.85rem;
  font-size: 0.85rem;
  color: var(--text);
}

input,
select {
  width: 100%;
  margin-top: 0.35rem;
  padding: 0.55rem 0.6rem;
  border-radius: 10px;
  background: #020617;
  border: 1px solid var(--border);
  color: var(--text);
  font-family: inherit;
  font-size: 0.9rem;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--primary);
}

select {
  cursor: pointer;
}

/* =========================================================
   NOTES / RESULTS
========================================================= */
.note {
  font-size: 0.85rem;
  color: var(--muted);
  margin: 0.5rem 0 1rem;
}

.result {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(2, 6, 23, 0.4);
  font-weight: 700;
}

/* =========================================================
   BUTTONS
========================================================= */
button {
  appearance: none;
  background: var(--primary);
  color: #020617;
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.25rem;
  font-weight: 800;
  margin-top: 1.25rem;
  cursor: pointer;
}

button:hover {
  background: var(--primary-strong);
}

/* =========================================================
   FOOTER
========================================================= */
footer,
.site-footer {
  border-top: 1px solid var(--border);
  background: var(--panel);
  padding: 2rem 1rem calc(2rem + env(safe-area-inset-bottom));
  text-align: center;
}

.footer-nav {
  font-size: 0.9rem;
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.footer-nav a {
  color: #f8fafc;
  font-weight: 500;
}

.footer-nav a:hover {
  color: var(--primary-strong);
}

footer p,
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

  .panel {
    padding: 1.25rem;
  }
}

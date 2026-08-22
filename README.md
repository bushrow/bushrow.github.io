# bushrow.github.io

Personal site for Charlie Bushrow, served at [bushrow.xyz](https://bushrow.xyz)
via GitHub Pages from `main`.

Plain static HTML, CSS, and a little JavaScript. No build step: edits to `main`
go live directly.

## Layout

- `index.html`: single scrolling landing page (hero, work, about, contact)
- `pages/resume.html`: full resume
- `pages/*.html`: meta-refresh stubs for retired URLs
- `css/site.css`: design tokens and shared layout
- `css/resume.css`: resume page only
- `app.js`: mobile nav toggle

## Adding a project

Copy an `<article class="card">` block in the `#work` section of `index.html`
and change the title, description, tags, and link.

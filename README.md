# bushrow.github.io

Personal site for Charlie Bushrow, served at [bushrow.xyz](https://bushrow.xyz)
via GitHub Pages from `main`.

Plain static HTML, CSS, and a little JavaScript. No build step: edits to `main`
go live directly.

## Layout

- `index.html`: landing page (hero, about, contact)
- `pages/resume.html`: full resume
- `pages/projects.html`: side projects, kept off the landing page on purpose
- `pages/*.html`: meta-refresh stubs for retired URLs
- `css/site.css`: design tokens and shared layout
- `css/resume.css`: resume page only
- `app.js`: mobile nav toggle
- `hero.js`: decorative canvas animation behind the hero

## Adding a project

Copy an `<article class="card">` block in `pages/projects.html` and change the
title, description, tags, and link. Projects deliberately do not appear on the
landing page: they are hobby work, and the landing page is professional.

# bushrow.github.io

Personal site for Charlie Bushrow, served at [bushrow.xyz](https://bushrow.xyz)
via GitHub Pages from `main`.

Plain static HTML, CSS, and a little JavaScript. No build step: edits to `main`
go live directly.

## Layout

- `index.html`: landing page. One viewport, no scroll: name, blurb, buttons, nav.
- `pages/about.html`: bio and background
- `pages/resume.html`: full resume, rendered as a light sheet
- `pages/projects.html`: side projects, kept off the landing page on purpose
- `pages/contact.html`: business card
- `pages/resume-select.html`: meta-refresh stub for a retired URL
- `css/site.css`: design tokens and shared layout
- `css/resume.css`: resume page only
- `app.js`: mobile nav toggle
- `hero.js`: decorative canvas animation behind the hero

The site is dark. The two things that are documents, the resume and the
contact card, render light on it. That is where `--paper` and `--ink` are used;
everywhere else uses `--bg` and `--text`.

## Adding a project

Copy an `<article class="card">` block in `pages/projects.html` and change the
title, description, tags, and link. Projects deliberately do not appear on the
landing page: they are hobby work, and the landing page is professional.

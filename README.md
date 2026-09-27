# Théo Jeanmart — Portfolio

A single-page portfolio for my work in robotics and AI engineering. It presents experience, technical skills, projects, and interests through a restrained visual design and small, purposeful interactions.

## What is on the page

- **Experience and projects:** short summaries open into detailed dialogs. Project dialogs include a compact architecture diagram.
- **Skills:** grouped, gently floating bubbles.
- **Failures and interests:** a few lessons learned and clickable interests with short descriptions.
- **Margin illustrations:** a LiDAR point-cloud scene, cobot, Formula Student car, and drone respond to scrolling.

The page is written in plain HTML, CSS, and JavaScript. It has no application framework, package manager, server-side code, or build step.

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>. The page also works as a static document, but a local server gives it the same URL structure as a deployment.

## Project structure

```text
index.html   Page content and dialogs
styles.css   Layout, responsive styles, and animations
script.js    Scroll effects and dialog/interest behavior
assets/      Local illustrations
```

All site assets use paths relative to `index.html`. IBM Plex Mono is requested from Google Fonts, with a system monospace fallback in CSS.

## Deploy

This is a static site. On Vercel, select the **Other** framework preset, leave the **Build Command** empty, and serve the repository root (`.`). No `vercel.json` or rewrite rule is needed: the portfolio has one page, with fragment links such as `/#projects` rather than separate application routes.

## Scope

The project is a personal portfolio, not a reusable component library. Content and project descriptions live directly in `index.html`; update them there when the underlying work changes.

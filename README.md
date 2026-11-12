# Somantha Manuranga · AI Engineer Portfolio

Personal portfolio: an interactive 3D site built with **React, Three.js (react-three-fiber), Framer Motion and Lenis**.

**Live:** https://somanthamanuranga.github.io/portfolio/

## Highlights

- Shader-driven 3D "neural core" (noise-displaced icosahedron, orbit rings, network graph, particle field) that reacts to scrolling and the mouse
- Short boot intro (once per session), HUD panels with real project metrics, magnetic buttons, smooth scrolling
- 14 projects with animated per-project visuals, category filters and a detail modal with shareable links (`#project/<slug>`)
- Experience timeline, draggable 3D skill sphere, education, talks, certifications, endorsements and a photo gallery
- Responsive from 320 px phones to wide desktops; respects `prefers-reduced-motion`; falls back gracefully without WebGL
- Three.js is lazy-loaded after first paint and images are WebP, so the text is interactive immediately

## Editing content

All text, projects, metrics and links live in **[`src/data/content.ts`](src/data/content.ts)**. Add or edit entries there; no component changes are needed.

- Projects: add an object to `projects` (set `featured: true` to show it in the large spotlight grid).
- Images go in `public/images/` (WebP recommended). The CV is `public/Somantha_Manuranga_CV.pdf`.

## CV

The master CV is written in LaTeX, in English and German:

- `cv/cv-en.tex` and `cv/cv-de.tex`: the content
- `cv/cv-style.tex`: shared layout, contact details and the photo switch
- `cv/photo.jpg`: the photo

```bash
npm run cv   # compiles both and writes public/Somantha_Manuranga_CV.pdf and public/Somantha_Manuranga_Lebenslauf.pdf
```

It needs `pdflatex` (MiKTeX or TeX Live). The files also compile unchanged on Overleaf: upload the four files in `cv/`.

## Development

```bash
npm install
npm run dev        # http://localhost:5173/portfolio/
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The site is built for the `/portfolio/` path. For a root domain (Netlify, Vercel, custom domain) build with `BASE_PATH=/ npm run build`.

## Structure

```
src/
  data/content.ts         all site content
  three/Scene.tsx         WebGL scene (shaders, particles, scroll/mouse rig)
  components/             Hero, About, Projects (+ modal, visuals), Sections, Nav, Intro, HUD
  styles/global.css       design tokens and all styles
public/                   images, CV, talk slides, favicon
```

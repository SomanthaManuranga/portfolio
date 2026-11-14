# Somantha Manuranga · AI Engineer Portfolio

Personal portfolio: an interactive 3D site built with **React, Three.js (react-three-fiber), Framer Motion and Lenis**.

**Live:** https://somanthamanuranga.github.io/portfolio/

## Highlights

- Light, airy layout with rounded panels and pill buttons; one accent colour
- Hero: a 3D scene in a dark rounded panel. A cluster of machine parts (gears, nuts, bearings, blocks) in blue, black and white that collide, move away from the cursor and scatter on a click. The physics is a small hand-written solver in `src/three/Scene.tsx`
- Scroll-driven motion: ribbon lines that draw themselves behind the headings (`Ribbon` in `src/components/ui.tsx`), a pinned work reel that grows from a blue-tinted thumbnail to the full screen, text that fills in as you read, and a closing card that straightens and zooms into a full dark screen
- About: one short line whose ending rotates through four phrases (`aboutPhrases` in `src/data/content.ts`). Skills: a moving band of skill names above cards whose chips pop in
- Sound (off until the header button is pressed): a calm outdoor scene made only from filtered noise (wind in trees, a small stream, and a breeze that rises with scroll speed), synthesised in `src/lib/sound.ts`
- Headings mix black and grey words: wrap words in asterisks in a `SectionHead` title to set them in grey
- Rolling-letter hover on buttons, menu links and project titles; headings that rise word by word
- Optional sound (header button, off by default): a quiet ambient pad and small interface sounds, synthesised in the browser with no audio files
- 15 projects as visual cards, each with its own illustration and headline result; opening one shows a full-screen case study with shareable links (`#project/<slug>`)
- Responsive from 320 px phones to wide desktops; respects `prefers-reduced-motion`; falls back gracefully without WebGL

## Colour theme

Four themes are defined at the top of `src/styles/global.css` (`lumen`, `paper`, `steel`, `graphite`).
In `src/App.tsx`, `DEFAULT_THEME` sets the one visitors get and `SHOW_THEME_PICKER` shows or hides the picker bar.

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

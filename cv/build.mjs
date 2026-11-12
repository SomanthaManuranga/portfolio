// Compiles the LaTeX master CV (cv-en.tex, cv-de.tex) and copies the PDFs into public/.
// Usage: npm run cv        (or: node cv/build.mjs)
// Needs a LaTeX distribution with pdflatex on the PATH (MiKTeX or TeX Live).
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'out');
mkdirSync(out, { recursive: true });

const targets = [
  ['cv-en', 'Somantha_Manuranga_CV.pdf'],
  ['cv-de', 'Somantha_Manuranga_Lebenslauf.pdf'],
];

for (const [tex, pdf] of targets) {
  // Two passes so the "Page x / y" footer gets the right total.
  for (let pass = 0; pass < 2; pass++) {
    try {
      execFileSync('pdflatex', ['-interaction=nonstopmode', '-halt-on-error', '-output-directory=out', `${tex}.tex`], {
        cwd: here,
        stdio: 'pipe',
      });
    } catch (err) {
      console.error(`pdflatex failed for ${tex}.tex. See cv/out/${tex}.log`);
      console.error(String(err.stdout ?? '').split('\n').filter((l) => l.startsWith('!') || l.startsWith('l.')).join('\n'));
      process.exit(1);
    }
  }
  copyFileSync(join(out, `${tex}.pdf`), join(here, '..', 'public', pdf));
  console.log(`wrote public/${pdf}`);
}

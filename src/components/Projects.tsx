import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, FileText, PlayCircle, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { categories, projects, type Category, type Link, type Project } from '../data/content';
import { lockScroll } from '../lib/scroll';
import { sound } from '../lib/sound';
import ProjectVisual from './ProjectVisual';
import { GithubIcon, Reveal, RollText, SectionHead } from './ui';

const linkIcon = (kind: Link['kind']) =>
  kind === 'code' ? <GithubIcon /> : kind === 'demo' ? <PlayCircle /> : kind === 'paper' ? <BookOpen /> : <FileText />;

/** How many cards get the wide (half-width) size so every row of the grid is full. */
function wideCount(n: number) {
  for (const w of [2, 4, 6]) if (w <= n && (n - w) % 3 === 0) return w;
  return 0;
}

/* ---------------- Card ---------------- */
function WorkCard({ p, onOpen }: { p: Project; onOpen: (p: Project) => void }) {
  const m = p.metrics[0];
  return (
    <button className="wcard roll-host" onClick={() => onOpen(p)} aria-haspopup="dialog">
      <div className="wcard-media">
        <ProjectVisual slug={p.slug} />
        <span className="wcard-tag">{p.featured ? 'Featured' : 'Case study'}</span>
      </div>
      <div className="wcard-body">
        <div className="wcard-tags label">
          <span>{p.category}</span>
          <span>{p.year}</span>
        </div>
        <h3>
          <RollText text={p.title} />
        </h3>
        <p>{p.summary}</p>
        <div className="wcard-foot">
          <div>
            <strong>{m.value}</strong>
            <small>{m.label}</small>
          </div>
          <span className="go" aria-hidden>
            <ArrowUpRight />
          </span>
        </div>
      </div>
    </button>
  );
}

/* ---------------- Full-screen case study ---------------- */
function CaseStudy({ p, onClose, onStep }: { p: Project; onClose: () => void; onStep: (dir: 1 | -1) => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const index = projects.findIndex((x) => x.slug === p.slug);
  const next = projects[(index + 1) % projects.length];

  // Lock the page, remember focus, restore both on close
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    lockScroll(true);
    closeRef.current?.focus();
    return () => {
      lockScroll(false);
      before?.focus({ preventScroll: true });
    };
  }, []);

  // Keyboard: Esc closes, arrows step, Tab stays inside the dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onStep(1);
      else if (e.key === 'ArrowLeft') onStep(-1);
      else if (e.key === 'Tab' && boxRef.current) {
        const items = boxRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onStep]);

  // New project: back to the top
  useEffect(() => {
    boxRef.current?.scrollTo({ top: 0 });
  }, [p.slug]);

  return (
    <>
      <motion.div
        className="case-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={onClose}
      />
      <motion.div
        ref={boxRef}
        className="case"
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
        data-lenis-prevent
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="case-bar">
          <button ref={closeRef} className="pill dark" onClick={onClose}>
            Close <X />
          </button>
          <div className="steps">
            <span className="label" style={{ marginRight: 8 }}>
              {String(index + 1).padStart(2, '0')} / {projects.length}
            </span>
            <button className="round-btn" onClick={() => onStep(-1)} aria-label="Previous project">
              <ArrowLeft />
            </button>
            <button className="round-btn" onClick={() => onStep(1)} aria-label="Next project">
              <ArrowRight />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={p.slug}
            className="case-inner"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="case-head">
              <div>
                <span className="label">
                  {p.category} • {p.context} • {p.year}
                </span>
                <h2 id="case-title">{p.title}</h2>
              </div>
              <p>{p.summary}</p>
            </div>

            <ProjectVisual slug={p.slug} className="case-hero" />

            <div className="case-metrics">
              {p.metrics.map((m) => (
                <div key={m.label} className="case-metric">
                  <strong>{m.value}</strong>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>

            <div className="case-cols">
              <div className="case-block">
                <h3>What I did and found</h3>
                <ol className="highlights">
                  {p.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ol>
              </div>
              <div className="case-side">
                <div className="case-block">
                  <h3>Stack</h3>
                  <div className="chips">
                    {p.tech.map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="case-block">
                  <h3>Links</h3>
                  {p.links.length > 0 ? (
                    <div className="case-links">
                      {p.links.map((l, i) => (
                        <a key={l.href} className={`pill small ${i === 0 ? 'dark' : ''}`} href={l.href} target="_blank" rel="noopener">
                          {linkIcon(l.kind)} {l.label}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="case-note">No public repository for this project.</p>
                  )}
                </div>
              </div>
            </div>

            <button className="case-next dark-panel" onClick={() => onStep(1)}>
              <span>
                <span className="label">Next project</span>
                <h3>{next.title}</h3>
              </span>
              <span className="go" aria-hidden>
                <ArrowRight />
              </span>
            </button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  );
}

/* ---------------- Section ---------------- */
type Filter = 'All' | Category;

export default function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = useMemo(() => (filter === 'All' ? projects : projects.filter((p) => p.category === filter)), [filter]);
  const wide = wideCount(filtered.length);
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: projects.length };
    projects.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, []);

  const openProject = useCallback((p: Project) => {
    sound.open();
    setOpen(p);
    history.replaceState(null, '', `#project/${p.slug}`);
  }, []);
  const step = useCallback((dir: 1 | -1) => {
    setOpen((cur) => {
      if (!cur) return cur;
      const i = projects.findIndex((x) => x.slug === cur.slug);
      const nextP = projects[(i + dir + projects.length) % projects.length];
      sound.step();
      history.replaceState(null, '', `#project/${nextP.slug}`);
      return nextP;
    });
  }, []);
  const close = useCallback(() => {
    sound.close();
    setOpen(null);
    history.replaceState(null, '', '#projects');
  }, []);

  // Deep link: #project/<slug> (on load and on hash change)
  useEffect(() => {
    const fromHash = () => {
      const m = location.hash.match(/^#project\/(.+)$/);
      const p = m && projects.find((x) => x.slug === m[1]);
      if (p) {
        setOpen(p);
        document.getElementById('projects')?.scrollIntoView();
      }
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  return (
    <section className="section" id="projects">
      <div className="container">
        <SectionHead
          eyebrow="Work"
          title="Projects *with* measured results"
          sub="Each card shows what the project is and its headline result, taken from a held-out evaluation in the public repository. Open one for the full story."
        />

        <Reveal className="filters" >
          {(['All', ...categories] as Filter[]).map((c) => (
            <button key={c} aria-pressed={filter === c} className={`filter ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
              {c}
              <span className="count">{counts[c] ?? 0}</span>
            </button>
          ))}
        </Reveal>

        <ul className="work-grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((p, i) => (
              <motion.li
                key={p.slug}
                className={i < wide ? 'wide' : ''}
                layout
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <WorkCard p={p} onOpen={openProject} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      {createPortal(
        <AnimatePresence>{open && <CaseStudy key="case" p={open} onClose={close} onStep={step} />}</AnimatePresence>,
        document.body,
      )}
    </section>
  );
}

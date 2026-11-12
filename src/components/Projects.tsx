import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, FileText, PlayCircle, BookOpen, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { categories, projects, type Category, type Link, type Project } from '../data/content';
import { GithubIcon, Reveal, SectionHead } from './ui';
import ProjectVisual from './ProjectVisual';
import { lockScroll } from '../lib/scroll';

const linkIcon = (kind: Link['kind']) =>
  kind === 'code' ? <GithubIcon /> : kind === 'demo' ? <PlayCircle /> : kind === 'paper' ? <BookOpen /> : <FileText />;

const accentStyle = (p: Project) => ({ '--accent': p.accent }) as React.CSSProperties;

/* ---------------- Spotlight card with 3D tilt ---------------- */
function SpotlightCard({ p, index, onOpen }: { p: Project; index: number; onOpen: (p: Project) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    if (e.pointerType === 'mouse') el.style.transform = `perspective(1000px) rotateY(${(x - 0.5) * 6}deg) rotateX(${(0.5 - y) * 6}deg)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = '';
  };
  const m = p.metrics[0];
  return (
    <Reveal delay={0.06 * index}>
      <button
        ref={ref}
        className="pcard glass"
        style={accentStyle(p)}
        onPointerMove={onMove}
        onPointerLeave={reset}
        onClick={() => onOpen(p)}
        aria-haspopup="dialog"
      >
        <ProjectVisual slug={p.slug} />
        <div className="pcard-top">
          <span className="pcard-cat">{p.category}</span>
          <span>{p.year}</span>
        </div>
        <h3>{p.title}</h3>
        <p className="pcard-summary">{p.summary}</p>
        <div className="pcard-metric">
          <div>
            <strong>{m.value}</strong>
            <small>{m.label}</small>
          </div>
          <span className="pcard-open" aria-hidden>
            <ArrowUpRight />
          </span>
        </div>
      </button>
    </Reveal>
  );
}

/* ---------------- Modal ---------------- */
function ProjectModal({ p, onClose, onStep }: { p: Project; onClose: () => void; onStep: (dir: 1 | -1) => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const index = projects.findIndex((x) => x.slug === p.slug);
  const prev = projects[(index - 1 + projects.length) % projects.length];
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

  // New project: back to the top of the dialog
  useEffect(() => {
    boxRef.current?.scrollTo({ top: 0 });
  }, [p.slug]);

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      data-lenis-prevent
    >
      <motion.div
        ref={boxRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={accentStyle(p)}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-bar">
          <span className="modal-count">
            {String(index + 1).padStart(2, '0')} / {projects.length}
          </span>
          <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Close project details">
            <X />
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProjectVisual slug={p.slug} />
            <div className="pcard-top">
              <span className="pcard-cat">{p.category}</span>
            </div>
            <h2 id="modal-title">{p.title}</h2>
            <p className="modal-context">
              {p.context} · {p.year}
            </p>
            <p className="modal-summary" style={{ marginTop: 16 }}>
              {p.summary}
            </p>
            <div className="metrics">
              {p.metrics.map((m) => (
                <div key={m.label} className="metric">
                  <strong>{m.value}</strong>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
            <h3>Highlights</h3>
            <ul className="highlights">
              {p.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <h3>Stack</h3>
            <div className="chips">
              {p.tech.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
            {p.links.length > 0 ? (
              <div className="modal-links">
                {p.links.map((l) => (
                  <a key={l.href} className="link-pill" href={l.href} target="_blank" rel="noopener">
                    {linkIcon(l.kind)} {l.label}
                  </a>
                ))}
              </div>
            ) : (
              <p className="modal-note">No public repository for this project.</p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="modal-nav">
          <button onClick={() => onStep(-1)} aria-label={`Previous project: ${prev.title}`}>
            <ArrowLeft />
            <span>
              <small>Previous</small>
              {prev.title}
            </span>
          </button>
          <button onClick={() => onStep(1)} aria-label={`Next project: ${next.title}`}>
            <span>
              <small>Next</small>
              {next.title}
            </span>
            <ArrowRight />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Section ---------------- */
type Filter = 'All' | Category;

export default function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  const [filter, setFilter] = useState<Filter>('All');
  const featured = projects.filter((p) => p.featured);
  const filtered = useMemo(() => (filter === 'All' ? projects : projects.filter((p) => p.category === filter)), [filter]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: projects.length };
    projects.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, []);

  const openProject = useCallback((p: Project) => {
    setOpen(p);
    history.replaceState(null, '', `#project/${p.slug}`);
  }, []);
  const step = useCallback((dir: 1 | -1) => {
    setOpen((cur) => {
      if (!cur) return cur;
      const i = projects.findIndex((x) => x.slug === cur.slug);
      const nextP = projects[(i + dir + projects.length) % projects.length];
      history.replaceState(null, '', `#project/${nextP.slug}`);
      return nextP;
    });
  }, []);
  const close = useCallback(() => {
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
          eyebrow="02 · Selected work"
          title={
            <>
              Projects with <span className="grad-text">measured results</span>
            </>
          }
          sub="LLM safety, computer vision, document AI and engineering surrogates. Every number below comes from a held-out evaluation in the project's public repository. Open a card for details."
        />

        <div className="spotlight">
          {featured.map((p, i) => (
            <SpotlightCard key={p.slug} p={p} index={i} onOpen={openProject} />
          ))}
        </div>

        <div className="all-projects">
          <Reveal className="all-head">
            <h3>All projects</h3>
            <LayoutGroup id="filters">
              <div className="filters" role="tablist" aria-label="Filter projects by category">
                {(['All', ...categories] as Filter[]).map((c) => (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={filter === c}
                    className={`filter ${filter === c ? 'active' : ''}`}
                    onClick={() => setFilter(c)}
                  >
                    {filter === c && <motion.span layoutId="filter-bg" className="filter-bg" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                    <span>
                      {c}
                      <span className="count">{counts[c] ?? 0}</span>
                    </span>
                  </button>
                ))}
              </div>
            </LayoutGroup>
          </Reveal>

          <motion.div layout className="plist">
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((p) => (
                <motion.div
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button className="prow glass" style={accentStyle(p)} onClick={() => openProject(p)} aria-haspopup="dialog">
                    <span className="pcard-top" style={{ width: '100%' }}>
                      <span className="pcard-cat">{p.category}</span>
                      <span>{p.year}</span>
                    </span>
                    <h4>{p.title}</h4>
                    <p>{p.summary}</p>
                    <span className="prow-foot">
                      <span>
                        <strong>{p.metrics[0].value}</strong> · {p.metrics[0].label}
                      </span>
                      <ArrowUpRight size={16} />
                    </span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {createPortal(
        <AnimatePresence>{open && <ProjectModal key="project-modal" p={open} onClose={close} onStep={step} />}</AnimatePresence>,
        document.body,
      )}
    </section>
  );
}

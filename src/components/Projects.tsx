import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ArrowUpRight, FileText, PlayCircle, BookOpen, X } from 'lucide-react';
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
function ProjectModal({ p, onClose }: { p: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    lockScroll(true);
    return () => {
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
      prev?.focus({ preventScroll: true });
    };
  }, [onClose]);

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
        <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Close project details">
          <X />
        </button>
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
          {p.metrics.map((m, i) => (
            <motion.div
              key={m.label}
              className="metric"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
            >
              <strong>{m.value}</strong>
              <span>{m.label}</span>
            </motion.div>
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
          <p className="modal-note">No public repository for this project. Photos are in the Beyond section below.</p>
        )}
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
        <AnimatePresence>{open && <ProjectModal key={open.slug} p={open} onClose={close} />}</AnimatePresence>,
        document.body,
      )}
    </section>
  );
}

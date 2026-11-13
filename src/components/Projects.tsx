import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, FileText, PlayCircle, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { categories, projects, type Category, type Link, type Project } from '../data/content';
import { lockScroll } from '../lib/scroll';
import ProjectVisual from './ProjectVisual';
import { GithubIcon, Reveal, SectionHead } from './ui';

const linkIcon = (kind: Link['kind']) =>
  kind === 'code' ? <GithubIcon /> : kind === 'demo' ? <PlayCircle /> : kind === 'paper' ? <BookOpen /> : <FileText />;

/* ---------------- Detail panel ---------------- */
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

  // New project: back to the top of the panel
  useEffect(() => {
    boxRef.current?.scrollTo({ top: 0 });
  }, [p.slug]);

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      data-lenis-prevent
    >
      <motion.div
        ref={boxRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-bar">
          <span className="label">
            Project {String(index + 1).padStart(2, '0')} / {projects.length}
          </span>
          <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Close project details">
            Close <X />
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={p.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ProjectVisual slug={p.slug} />
            <div className="modal-body">
              <span className="label accent">{p.category}</span>
              <h2 id="modal-title">{p.title}</h2>
              <p className="label">
                {p.context} · {p.year}
              </p>
              <p className="modal-summary">{p.summary}</p>
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
                    <a key={l.href} className="text-link" href={l.href} target="_blank" rel="noopener">
                      {linkIcon(l.kind)} {l.label}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="modal-note">No public repository for this project.</p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="modal-nav">
          <button onClick={() => onStep(-1)} aria-label={`Previous project: ${prev.title}`}>
            <ArrowLeft />
            <span>
              <small className="label">Previous</small>
              {prev.title}
            </span>
          </button>
          <button onClick={() => onStep(1)} aria-label={`Next project: ${next.title}`}>
            <span>
              <small className="label">Next</small>
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
  const [hover, setHover] = useState<Project | null>(null);
  const preview = useRef<HTMLDivElement>(null);

  const featured = projects.filter((p) => p.featured);
  const filtered = useMemo(() => (filter === 'All' ? projects : projects.filter((p) => p.category === filter)), [filter]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: projects.length };
    projects.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, []);

  const openProject = useCallback((p: Project) => {
    setHover(null);
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

  // The preview card trails the cursor over the featured list (mouse only)
  const onListMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !preview.current) return;
    const w = 300;
    const x = Math.min(e.clientX + 30, window.innerWidth - w - 16);
    const y = Math.min(e.clientY + 26, window.innerHeight - 160);
    preview.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  return (
    <section className="section" id="projects">
      <div className="container">
        <SectionHead
          eyebrow="02 / Work"
          title={
            <>
              Projects with <span className="accent">measured results</span>
            </>
          }
          sub="Every number comes from a held-out evaluation in the project's public repository. Select a project for details."
        />

        <Reveal>
          <ol className="work-list" onPointerMove={onListMove} onPointerLeave={() => setHover(null)}>
            {featured.map((p, i) => (
              <li key={p.slug}>
                <button
                  className="work-row"
                  onClick={() => openProject(p)}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(p)}
                  aria-haspopup="dialog"
                >
                  <span className="label">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{p.title}</h3>
                  <span className="cat label">
                    {p.category}
                    <br />
                    {p.year}
                  </span>
                  <span className="wm">
                    <strong>{p.metrics[0].value}</strong>
                    <span className="label">{p.metrics[0].label}</span>
                  </span>
                  <ArrowUpRight className="arrow" aria-hidden />
                </button>
              </li>
            ))}
          </ol>
        </Reveal>

        <div className="all-projects">
          <Reveal className="all-head">
            <h3>All projects</h3>
            <div className="filters" role="tablist" aria-label="Filter projects by category">
              {(['All', ...categories] as Filter[]).map((c) => (
                <button key={c} role="tab" aria-selected={filter === c} className={`filter ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
                  {c}
                  <span className="count">{counts[c] ?? 0}</span>
                </button>
              ))}
            </div>
          </Reveal>

          <ul className="ptable">
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((p) => (
                <motion.li
                  key={p.slug}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <button className="prow" onClick={() => openProject(p)} aria-haspopup="dialog">
                    <span className="y label">{p.year}</span>
                    <h4>{p.title}</h4>
                    <span className="c label">{p.category}</span>
                    <span className="m">
                      <b>{p.metrics[0].value}</b> · {p.metrics[0].label}
                    </span>
                    <ArrowUpRight aria-hidden />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>

      {createPortal(
        <>
          <div ref={preview} className={`work-preview ${hover && !open ? 'on' : ''}`} aria-hidden>
            {hover && <ProjectVisual slug={hover.slug} />}
          </div>
          <AnimatePresence>{open && <ProjectModal key="project-modal" p={open} onClose={close} onStep={step} />}</AnimatePresence>
        </>,
        document.body,
      )}
    </section>
  );
}

import { AnimatePresence, easeInOut, motion, useMotionValueEvent, useReducedMotion, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUp, ArrowUpRight, Award, Check, ChevronLeft, ChevronRight, Copy, Download, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  beyond,
  certifications,
  education,
  endorsements,
  experience,
  profile,
  skillGroups,
  talks,
  venture,
} from '../data/content';
import { asset, CharReveal, GithubIcon, LinkedinIcon, Reveal, Ribbon, RollText, SectionHead, useBoxProgress } from './ui';

/* ================================================================== */
/*  Experience                                                         */
/* ================================================================== */
export function Experience() {
  return (
    <section className="section" id="experience">
      <div className="container">
        <SectionHead eyebrow="Experience" title="Industry experience, *engineering first*" />
        <div className="rows">
          {experience.map((job, i) => (
            <Reveal key={job.company} delay={0.05 * i} as="article" className="row">
              <div className="row-when">
                {job.current && (
                  <span className="now label">
                    <span className="status-dot" /> Current
                  </span>
                )}
                <span className="label">{job.period}</span>
                <span className="label">{job.location}</span>
              </div>
              <div>
                <div className="row-title">
                  {job.logo && (
                    <div className="row-logo">
                      <img src={asset(job.logo)} alt={`${job.company} logo`} loading="lazy" />
                    </div>
                  )}
                  <div>
                    <h3>{job.role}</h3>
                    <div className="row-org">{job.company}</div>
                  </div>
                </div>
                <ul>
                  {job.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <div className="chips">
                  {job.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Skills                                                             */
/* ================================================================== */
const ALL_SKILLS = skillGroups.flatMap((g) => g.items);
const ROW_A = ALL_SKILLS.filter((_, i) => i % 2 === 0);
const ROW_B = ALL_SKILLS.filter((_, i) => i % 2 === 1);
const rise = [0.22, 1, 0.36, 1] as const;

function SkillCard({ title, items, i }: { title: string; items: string[]; i: number }) {
  // A soft light follows the cursor across the card
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <motion.div
      className="skill-col roll-host"
      onPointerMove={onMove}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      variants={{
        hidden: { opacity: 0, y: 44 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, delay: 0.07 * (i % 3), ease: rise, staggerChildren: 0.04, delayChildren: 0.2 + 0.07 * (i % 3) },
        },
      }}
    >
      <div className="skill-top">
        <span className="label">0{i + 1}</span>
        <span className="label">{items.length} skills</span>
      </div>
      <h3>
        <RollText text={title} />
      </h3>
      <div className="chips">
        {items.map((s) => (
          <motion.span
            key={s}
            className="chip"
            variants={{
              hidden: { opacity: 0, scale: 0.6, y: 12 },
              show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 420, damping: 24 } },
            }}
          >
            {s}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

export function Skills() {
  const reduced = useReducedMotion() ?? false;
  const band = useRef<HTMLDivElement>(null);
  // Two rows of skill names slide past each other as the section scrolls by
  const drift = useBoxProgress(band, ({ top, height, vh }) => [top - vh, top + height]);
  const xa = useTransform(drift, [0, 1], ['0%', '-24%']);
  const xb = useTransform(drift, [0, 1], ['-24%', '0%']);
  return (
    <section className="section has-ribbon" id="skills">
      <Ribbon
        className="r-skills"
        tone="blue"
        reduced={reduced}
        from={0.85}
        to={0.05}
        points={[
          [-0.06, 0.3],
          [0.14, 0.08],
          [0.4, 0.04],
          [0.6, 0.2],
          [0.62, 0.5],
          [0.46, 0.68],
          [0.3, 0.56],
          [0.34, 0.3],
          [0.56, 0.2],
          [0.82, 0.34],
          [1.06, 0.62],
        ]}
      />
      <div className="container">
        <SectionHead eyebrow="Toolkit" title="The stack *behind* the work" />
      </div>
      <div className="skill-band" ref={band} aria-hidden>
        <motion.div style={reduced ? undefined : { x: xa }}>
          {ROW_A.map((s, i) => (
            <span key={s} className={i % 3 === 1 ? 'muted' : ''}>
              {s}
            </span>
          ))}
        </motion.div>
        <motion.div style={reduced ? undefined : { x: xb }}>
          {ROW_B.map((s, i) => (
            <span key={s} className={i % 3 === 0 ? 'muted' : ''}>
              {s}
            </span>
          ))}
        </motion.div>
      </div>
      <div className="container">
        <div className="skill-cols">
          {skillGroups.map((g, i) => (
            <SkillCard key={g.title} title={g.title} items={g.items} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Education, talks, certificates, endorsements                       */
/* ================================================================== */
export function Background() {
  return (
    <section className="section" id="education">
      <div className="container">
        <SectionHead eyebrow="Education" title="Education *and continuous* learning" />
        <div className="rows">
          {education.map((e, i) => (
            <Reveal key={e.school} delay={0.05 * i} as="article" className="row">
              <div className="row-when">
                <span className="label">{e.period}</span>
                <span className="label">{e.location}</span>
              </div>
              <div>
                <div className="row-title">
                  <div className="row-logo">
                    <img src={asset(e.logo)} alt={`${e.school} logo`} loading="lazy" />
                  </div>
                  <div>
                    <h3>{e.degree}</h3>
                    <div className="row-org">{e.school}</div>
                  </div>
                </div>
                <ul style={{ marginBottom: 0 }}>
                  {e.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <h3 className="subhead">Talks</h3>
        </Reveal>
        <div className="list">
          {talks.map((t) => (
            <Reveal key={t.title} className="list-row">
              <div>
                <h4>{t.title}</h4>
                <span className="label">{t.venue}</span>
              </div>
              <p>{t.summary}</p>
              <div className="acts">
                {t.links.map((l, i) => (
                  <a key={l.href} className={`pill small ${i === 0 ? 'dark' : ''}`} href={asset(l.href)} target="_blank" rel="noopener">
                    {l.label} {l.label === 'Slides' ? <FileText /> : <ArrowUpRight />}
                  </a>
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <h3 className="subhead">Certifications</h3>
        </Reveal>
        <div className="cert-grid">
          {certifications.map((c, i) => (
            <Reveal key={c.title} delay={0.06 * i}>
              <a className="cert roll-host" href={c.href} target="_blank" rel="noopener">
                <span className="cert-icon" aria-hidden>
                  <Award />
                </span>
                <h4>{c.title}</h4>
                <span className="label">{c.issuer}</span>
                <p>{c.note}</p>
                <span className="cert-more label">
                  <RollText text="View certificate" /> <ArrowUpRight />
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <h3 className="subhead">Endorsements</h3>
        </Reveal>
        <div className="quotes">
          {endorsements.map((q, i) => (
            <Reveal key={q.name} delay={0.08 * i} as="article" className="quote">
              <blockquote>“{q.quote}”</blockquote>
              <strong>{q.name}</strong>
              <span className="label">
                {q.title} • {q.org}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Beyond                                                             */
/* ================================================================== */
function Gallery({ images }: { images: string[] }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const paused = useRef(false);
  const go = (n: number, d: number) => {
    setDir(d);
    setI((n + images.length) % images.length);
  };
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => {
      if (!paused.current) {
        setDir(1);
        setI((x) => (x + 1) % images.length);
      }
    }, 4800);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div
      className="gallery"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      aria-roledescription="carousel"
      aria-label="Photos of 3D printer builds and printed parts"
    >
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={images[i]}
          className="slide"
          initial={{ opacity: 0, x: dir * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -dir * 50 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) go(i + 1, 1);
            else if (info.offset.x > 50) go(i - 1, -1);
          }}
        >
          <img className="slide-bg" src={asset(images[i])} alt="" aria-hidden draggable={false} />
          <img className="slide-fg" src={asset(images[i])} alt={`VYROBA TECHS build photo ${i + 1} of ${images.length}`} draggable={false} />
        </motion.div>
      </AnimatePresence>
      <div className="gallery-bar">
        <span className="count label">
          {String(i + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </span>
        <div>
          <button onClick={() => go(i - 1, -1)} aria-label="Previous photo">
            <ChevronLeft />
          </button>
          <button onClick={() => go(i + 1, 1)} aria-label="Next photo">
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Beyond() {
  return (
    <section className="section" id="beyond">
      <div className="container">
        <SectionHead eyebrow="Beyond" title="Maker, *teammate,* founder" />
        <Reveal className="venture">
          <div className="venture-text">
            <span className="label">Entrepreneurship</span>
            <h3>{venture.name}</h3>
            <p>{venture.text}</p>
            <ul>
              {venture.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <Gallery images={venture.images} />
        </Reveal>
        <div className="beyond-grid">
          {beyond.map((b, i) => (
            <Reveal key={b.title} delay={0.08 * i} as="article" className={`beyond-card ${b.image.includes('telc') ? 'logo' : ''}`}>
              <img src={asset(b.image)} alt={b.title} loading="lazy" />
              <div>
                <span className="label">0{i + 1}</span>
                <h4>{b.title}</h4>
                <p>{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Closing panel, moving strip and footer                             */
/* ================================================================== */
const STRIP = ['Computer vision', 'LLMs & NLP', 'Industrial AI', 'Automation', 'Robotics', 'Open to thesis topics'];

export function Contact({ onTop }: { onTop: () => void }) {
  const [copied, setCopied] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const wrap = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(reduced);
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 820);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 820);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // While the page is held, the tilted dark card straightens and grows until it fills the screen
  const pin = useBoxProgress(wrap, ({ top, height, vh }) => [top, top + height - vh]);
  const grow = { ease: easeInOut };
  const scale = useTransform(pin, [0.08, 0.6], [narrow ? 0.66 : 0.46, 1], grow);
  const rotate = useTransform(pin, [0.08, 0.6], [narrow ? -5 : -7, 0], grow);
  const x = useTransform(pin, [0.08, 0.6], [narrow ? '0vw' : '-23vw', '0vw'], grow);
  const y = useTransform(pin, [0.08, 0.6], [narrow ? '13vh' : '3vh', '0vh'], grow);
  const radius = useTransform(pin, [0.08, 0.6], [56, 0], grow);
  const asideX = useTransform(pin, [0.08, 0.42], ['0vw', '34vw']);
  const asideRotate = useTransform(pin, [0.08, 0.42], [0, 9]);
  const asideOpacity = useTransform(pin, [0.08, 0.36], [1, 0]);
  useMotionValueEvent(pin, 'change', (v) => setOpen(reduced || v > 0.56));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section className="contact" id="contact">
      <div className={`end-wrap${reduced ? ' static' : ''}`} ref={wrap}>
        <div className="end-stick">
          <motion.div
            className="end-aside"
            style={reduced ? undefined : { x: asideX, rotate: asideRotate, opacity: asideOpacity }}
          >
            <span className="label">Contact</span>
            <p>
              A role, a thesis topic <span className="muted">or a project in mind?</span>
            </p>
            <p className="end-aside-small">
              I am based in {profile.location} and reply to every message. Keep scrolling for the details.
            </p>
          </motion.div>

          <motion.div
            className={`end dark-panel${open ? ' open' : ''}`}
            style={reduced ? undefined : { scale, rotate, x, y, borderRadius: radius }}
          >
            <span className="plus c1" aria-hidden>+</span>
            <span className="plus c2" aria-hidden>+</span>
            <span className="plus c3" aria-hidden>+</span>
            <span className="plus c4" aria-hidden>+</span>
            <p className="end-sub label">Have a role, a thesis topic or a project in mind?</p>
            <a className="end-title" href={`mailto:${profile.email}`} tabIndex={open ? 0 : -1}>
              <CharReveal text="Let's work together!" shown={open} />
            </a>
            <span className="end-more pill light" aria-hidden>
              <ArrowDown /> Continue to scroll <ArrowDown />
            </span>
            <div className="end-strip" aria-hidden>
              <div>
                {[...STRIP, ...STRIP, ...STRIP, ...STRIP].map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container">
        <footer className="footer">
          <div className="footer-cols">
            <div>
              <span className="label">Based in</span>
              <p>
                {profile.location}
                <br />
                {profile.availability}
              </p>
            </div>
            <div>
              <span className="label">Contact</span>
              <p>
                <a className="roll-host" href={`mailto:${profile.email}`}>
                  <RollText text={profile.email} />
                </a>
                <br />
                <a className="roll-host" href={profile.phoneHref}>
                  <RollText text={profile.phone} />
                </a>
              </p>
              <button className="pill small" onClick={copy} aria-live="polite" style={{ marginTop: 12 }}>
                {copied ? 'Copied' : 'Copy email'} {copied ? <Check /> : <Copy />}
              </button>
            </div>
            <div>
              <span className="label">Profiles</span>
              <p>
                <a className="roll-host with-icon" href={profile.linkedin} target="_blank" rel="noopener">
                  <LinkedinIcon /> <RollText text="LinkedIn" />
                </a>
                <br />
                <a className="roll-host with-icon" href={profile.github} target="_blank" rel="noopener">
                  <GithubIcon /> <RollText text="GitHub" />
                </a>
              </p>
            </div>
            <div>
              <span className="label">Curriculum vitae</span>
              <div className="footer-pills">
                <a className="pill small dark" href={asset(profile.cv)} target="_blank" rel="noopener">
                  English <Download />
                </a>
                <a className="pill small" href={asset(profile.cvDe)} target="_blank" rel="noopener">
                  Deutsch <Download />
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom label">
            <span>
              © {new Date().getFullYear()} {profile.name}
            </span>
            <span>Built with React and Three.js</span>
            <button className="round-btn" onClick={onTop} aria-label="Back to top">
              <ArrowUp />
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}

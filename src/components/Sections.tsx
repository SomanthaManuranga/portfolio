import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUp, ArrowUpRight, Check, ChevronLeft, ChevronRight, Copy, Download, FileText } from 'lucide-react';
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
import { asset, GithubIcon, LinkedinIcon, Reveal, RollText, SectionHead } from './ui';

/* ================================================================== */
/*  Experience                                                         */
/* ================================================================== */
export function Experience() {
  return (
    <section className="section" id="experience">
      <div className="container">
        <SectionHead eyebrow="Experience" title="Industry experience, engineering first" />
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
export function Skills() {
  return (
    <section className="section" id="skills">
      <div className="container">
        <SectionHead eyebrow="Toolkit" title="The stack behind the work" />
        <div className="skill-cols">
          {skillGroups.map((g, i) => (
            <Reveal key={g.title} delay={0.05 * i} className="skill-col">
              <span className="label">0{i + 1}</span>
              <h3>{g.title}</h3>
              <div className="chips">
                {g.items.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </Reveal>
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
        <SectionHead eyebrow="Education" title="Education and continuous learning" />
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
        <div className="list">
          {certifications.map((c, i) => (
            <Reveal key={c.title} delay={0.04 * i}>
              <a className="list-row" href={c.href} target="_blank" rel="noopener" aria-label={`${c.title}: view certificate`}>
                <div>
                  <h4>{c.title}</h4>
                  <span className="label">{c.issuer}</span>
                </div>
                <p>{c.note}</p>
                <span className="go" aria-hidden>
                  <ArrowUpRight />
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
        <SectionHead eyebrow="Beyond" title="Maker, teammate, founder" />
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
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.25'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

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
      <div className="container">
        <motion.div ref={ref} className="end dark-panel" style={{ scale }}>
          <div className="end-crosses label" aria-hidden>
            <span className="plus">+</span>
            <span className="plus">+</span>
            <span className="plus">+</span>
          </div>
          <p className="end-sub label">Have a role, a thesis topic or a project in mind?</p>
          <a className="end-title roll-host" href={`mailto:${profile.email}`}>
            <RollText text="Let's work together!" />
          </a>
          <div className="end-strip" aria-hidden>
            <div>
              {[...STRIP, ...STRIP, ...STRIP, ...STRIP].map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>
          </div>
        </motion.div>

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

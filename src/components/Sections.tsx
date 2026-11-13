import { AnimatePresence, motion } from 'framer-motion';
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
import { asset, GithubIcon, LinkedinIcon, Reveal, SectionHead } from './ui';

/* ================================================================== */
/*  Experience                                                         */
/* ================================================================== */
export function Experience() {
  return (
    <section className="section" id="experience">
      <div className="container">
        <SectionHead
          eyebrow="03 / Experience"
          title={
            <>
              Industry experience, <span className="accent">engineering first</span>
            </>
          }
        />
        <div className="rows">
          {experience.map((job, i) => (
            <Reveal key={job.company} delay={0.05 * i} as="article" className="row">
              <div className="row-when label">
                {job.current && (
                  <span className="now">
                    <span className="status-dot" /> Current
                  </span>
                )}
                <span>{job.period}</span>
                <span>{job.location}</span>
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
        <SectionHead
          eyebrow="04 / Toolkit"
          title={
            <>
              The <span className="accent">stack</span> behind the work
            </>
          }
        />
        <div className="skill-cols">
          {skillGroups.map((g, i) => (
            <Reveal key={g.title} delay={0.05 * i} className="skill-col">
              <span className="label">0{i + 1}</span>
              <h3>{g.title}</h3>
              <ul>
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
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
        <SectionHead
          eyebrow="05 / Education"
          title={
            <>
              Education and <span className="accent">continuous learning</span>
            </>
          }
        />
        <div className="rows">
          {education.map((e, i) => (
            <Reveal key={e.school} delay={0.05 * i} as="article" className="row">
              <div className="row-when label">
                <span>{e.period}</span>
                <span>{e.location}</span>
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
        {talks.map((t) => (
          <Reveal key={t.title} className="list-row">
            <div>
              <h4>{t.title}</h4>
              <span className="label">{t.venue}</span>
            </div>
            <p>{t.summary}</p>
            <div style={{ display: 'grid', gap: 10 }}>
              {t.links.map((l) => (
                <a key={l.href} className="text-link" href={asset(l.href)} target="_blank" rel="noopener">
                  {l.label === 'Slides' ? <FileText /> : <ArrowUpRight />} {l.label}
                </a>
              ))}
            </div>
          </Reveal>
        ))}

        <Reveal>
          <h3 className="subhead">Certifications</h3>
        </Reveal>
        {certifications.map((c, i) => (
          <Reveal key={c.title} delay={0.04 * i}>
            <a className="list-row" href={c.href} target="_blank" rel="noopener">
              <div>
                <h4>{c.title}</h4>
                <span className="label">{c.issuer}</span>
              </div>
              <p>{c.note}</p>
              <span className="go label">
                Certificate <ArrowUpRight />
              </span>
            </a>
          </Reveal>
        ))}

        <Reveal>
          <h3 className="subhead">Endorsements</h3>
        </Reveal>
        <div className="quotes">
          {endorsements.map((q, i) => (
            <Reveal key={q.name} delay={0.08 * i} as="article" className="quote">
              <blockquote>{q.quote}</blockquote>
              <strong>{q.name}</strong>
              <span className="label">
                {q.title} · {q.org}
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
        <span className="label">
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
        <SectionHead
          eyebrow="06 / Beyond"
          title={
            <>
              Maker, teammate, <span className="accent">founder</span>
            </>
          }
        />
        <Reveal className="venture">
          <div className="venture-text">
            <span className="label accent">Entrepreneurship</span>
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
/*  Contact + footer                                                   */
/* ================================================================== */
export function Contact() {
  const [copied, setCopied] = useState(false);
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
    <section className="section contact" id="contact">
      <div className="container">
        <Reveal>
          <span className="label">07 / Contact</span>
          <h2>
            Let's <span className="accent">talk</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="contact-row">
          <p>
            I'm always happy to talk about computer vision, LLMs and industrial AI, and about thesis topics or AI/ML
            engineering opportunities in Germany.
          </p>
          <div className="email-wrap">
            <a className="email-link" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <button className="copy-btn label" onClick={copy} aria-live="polite">
              {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </Reveal>
        <Reveal delay={0.15} className="contact-links">
          <a className="text-link" href={profile.linkedin} target="_blank" rel="noopener">
            <LinkedinIcon /> LinkedIn
          </a>
          <a className="text-link" href={profile.github} target="_blank" rel="noopener">
            <GithubIcon /> GitHub
          </a>
          <a className="text-link" href={profile.phoneHref}>
            {profile.phone}
          </a>
          <a className="text-link" href={asset(profile.cv)} target="_blank" rel="noopener">
            <Download /> CV (English)
          </a>
          <a className="text-link" href={asset(profile.cvDe)} target="_blank" rel="noopener">
            <Download /> Lebenslauf (Deutsch)
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer({ onTop }: { onTop: () => void }) {
  return (
    <footer className="site-footer">
      <div className="container footer-inner label">
        <span>
          © {new Date().getFullYear()} {profile.name} · {profile.location}
        </span>
        <button className="to-top label" onClick={onTop}>
          Back to top <ArrowUp />
        </button>
      </div>
    </footer>
  );
}

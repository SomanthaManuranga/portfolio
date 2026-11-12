import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import {
  ArrowUp,
  Award,
  Bot,
  Brain,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Database,
  Eye,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Phone,
  Presentation,
  ScrollText,
  Wrench,
  Download,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section className="section" id="experience">
      <div className="container">
        <SectionHead
          eyebrow="03 · Experience"
          title={
            <>
              Industry experience, <span className="grad-text">engineering first</span>
            </>
          }
          sub="From robotic production lines and aviation design to applied AI in German industry."
        />
        <div className="timeline" ref={ref}>
          <div className="timeline-rail" aria-hidden>
            <motion.div className="timeline-fill" style={{ scaleY }} />
          </div>
          {experience.map((job, i) => (
            <Reveal key={job.company} delay={0.05 * i} as="article" className="job glass">
              <span className={`job-node ${job.current ? 'current' : ''}`} aria-hidden />
              <div className="job-head">
                <div className="job-title">
                  {job.logo ? (
                    <div className="job-logo">
                      <img src={asset(job.logo)} alt={`${job.company} logo`} loading="lazy" />
                    </div>
                  ) : (
                    <div className="job-logo placeholder" aria-hidden>
                      <Briefcase />
                    </div>
                  )}
                  <div>
                    <h3>{job.role}</h3>
                    <div className="job-company">{job.company}</div>
                  </div>
                </div>
                <div className="job-when">
                  {job.current && (
                    <>
                      <span className="now">Current</span>
                      <br />
                    </>
                  )}
                  {job.period}
                  <br />
                  {job.location}
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Skills: interactive 3D tag sphere                                  */
/* ================================================================== */
function SkillSphere({ tags }: { tags: string[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLSpanElement | null)[]>([]);

  const points = useMemo(() => {
    const n = tags.length;
    return tags.map((_, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return [Math.cos(theta) * Math.sin(phi), Math.sin(theta) * Math.sin(phi), Math.cos(phi)];
    });
  }, [tags]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let vx = 0.003;
    let vy = 0.0045;
    let rx = 0;
    let ry = 0;
    let dragging = false;
    let lx = 0;
    let ly = 0;
    let raf = 0;
    let visible = true;
    const colors = ['#5eead4', '#818cf8', '#f472b6', '#7dd3fc', '#c4b5fd'];

    const render = () => {
      const R = el.clientWidth * (el.clientWidth < 440 ? 0.33 : 0.42);
      const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
      points.forEach(([x, y, z], i) => {
        // rotate around X then Y
        const y1 = y * cx - z * sx;
        const z1 = y * sx + z * cx;
        const x2 = x * cy + z1 * sy;
        const z2 = -x * sy + z1 * cy;
        const node = items.current[i];
        if (!node) return;
        const scale = 0.6 + (z2 + 1) * 0.35;
        node.style.transform = `translate(-50%, -50%) translate3d(${x2 * R}px, ${y1 * R}px, 0) scale(${scale})`;
        node.style.opacity = String(0.25 + ((z2 + 1) / 2) * 0.75);
        node.style.zIndex = String(Math.round((z2 + 1) * 100));
        node.style.color = z2 > 0.2 ? colors[i % colors.length] : '#8a94ab';
      });
    };

    const tick = () => {
      if (!dragging) {
        rx += vx;
        ry += vy;
        vx += (0.003 - vx) * 0.02;
        vy += (0.0045 - vy) * 0.02;
      }
      render();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const down = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      vy = dx * 0.006;
      vx = -dy * 0.006;
      rx += vx;
      ry += vy;
    };
    const up = () => (dragging = false);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduced) raf = requestAnimationFrame(tick);
    });

    render();
    if (!reduced) io.observe(el);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [points]);

  return (
    <div className="sphere-wrap" ref={wrap} aria-hidden>
      {tags.map((t, i) => (
        <span key={t} className="sphere-tag" ref={(n) => (items.current[i] = n)}>
          {t}
        </span>
      ))}
    </div>
  );
}

const groupIcons = [Brain, Eye, ScrollText, Bot, Database, Wrench];

export function Skills() {
  const tags = useMemo(() => skillGroups.flatMap((g) => g.items.slice(0, 5)), []);
  return (
    <section className="section" id="skills">
      <div className="container">
        <SectionHead
          eyebrow="04 · Toolkit"
          title={
            <>
              The <span className="grad-text">stack</span> behind the work
            </>
          }
          sub="Drag the sphere to spin it. The groups show where each tool fits in my work."
        />
        <div className="skills-grid">
          <Reveal>
            <SkillSphere tags={tags} />
          </Reveal>
          <div className="skill-groups">
            {skillGroups.map((g, i) => {
              const Icon = groupIcons[i % groupIcons.length];
              return (
                <Reveal key={g.title} delay={0.05 * i} className="skill-group glass">
                  <h3>
                    <Icon /> {g.title}
                  </h3>
                  <div className="chips">
                    {g.items.map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Education, certifications, talks                                   */
/* ================================================================== */
export function Education() {
  return (
    <section className="section" id="education">
      <div className="container">
        <SectionHead
          eyebrow="05 · Learning"
          title={
            <>
              Education & <span className="grad-text">continuous learning</span>
            </>
          }
        />
        <div className="edu-grid">
          {education.map((e, i) => (
            <Reveal key={e.school} delay={0.08 * i} as="article" className="edu glass">
              <div className="edu-top">
                <div className="edu-logo">
                  <img src={asset(e.logo)} alt={`${e.school} logo`} loading="lazy" />
                </div>
                <span className="chip">{e.period}</span>
              </div>
              <h3>{e.degree}</h3>
              <div className="edu-school">
                {e.school} · {e.location}
              </div>
              <ul>
                {e.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <h3 className="subhead">Talks</h3>
        </Reveal>
        {talks.map((t) => (
          <Reveal key={t.title} as="article" className="talk glass">
            <div className="talk-icon" aria-hidden>
              <Presentation />
            </div>
            <div>
              <h4>{t.title}</h4>
              <div className="venue">{t.venue}</div>
              <p>{t.summary}</p>
              <div className="talk-foot">
                <div className="chips">
                  {t.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="chips">
                  {t.links.map((l) => (
                    <a key={l.href} className="link-pill" href={asset(l.href)} target="_blank" rel="noopener">
                      {l.label === 'Slides' ? <FileText /> : <ExternalLink />} {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}

        <Reveal>
          <h3 className="subhead">Certifications</h3>
        </Reveal>
        <div className="cert-grid">
          {certifications.map((c, i) => (
            <Reveal key={c.title} delay={0.06 * i}>
              <a className="cert glass" href={c.href} target="_blank" rel="noopener" style={{ height: '100%' }}>
                <span className="cert-icon" aria-hidden>
                  <Award />
                </span>
                <h4>{c.title}</h4>
                <span className="issuer">{c.issuer}</span>
                <p>{c.note}</p>
                <span className="more">
                  View certificate <ExternalLink />
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
            <Reveal key={q.name} delay={0.08 * i} as="article" className="quote glass">
              <div className="quote-mark" aria-hidden>
                “
              </div>
              <blockquote>{q.quote}</blockquote>
              <div className="quote-who">
                <strong>{q.name}</strong>
                <span>
                  {q.title} · {q.org}
                </span>
              </div>
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
  const go = (n: number) => {
    setDir(n > i || (i === images.length - 1 && n === 0) ? 1 : -1);
    setI((n + images.length) % images.length);
  };
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => {
      if (!paused.current) {
        setDir(1);
        setI((x) => (x + 1) % images.length);
      }
    }, 4200);
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
        <motion.img
          key={images[i]}
          src={asset(images[i])}
          alt={`VYROBA TECHS build photo ${i + 1} of ${images.length}`}
          loading="lazy"
          custom={dir}
          initial={{ opacity: 0, scale: 1.08, x: dir * 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.98, x: -dir * 40 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>
      <button className="gallery-nav prev" onClick={() => go(i - 1)} aria-label="Previous photo">
        <ChevronLeft />
      </button>
      <button className="gallery-nav next" onClick={() => go(i + 1)} aria-label="Next photo">
        <ChevronRight />
      </button>
      <div className="gallery-dots">
        {images.map((_, n) => (
          <button key={n} className={n === i ? 'active' : ''} onClick={() => go(n)} aria-label={`Show photo ${n + 1}`} />
        ))}
      </div>
    </div>
  );
}

export function Beyond() {
  return (
    <section className="section" id="beyond">
      <div className="container">
        <SectionHead
          eyebrow="06 · Beyond the code"
          title={
            <>
              Maker, teammate, <span className="grad-text">founder</span>
            </>
          }
          sub="Building physical things, leading teams on the pitch, and settling into a new country and language."
        />
        <Reveal className="venture glass">
          <div className="venture-text">
            <span className="venture-badge">Entrepreneurship</span>
            <h3>{venture.name}</h3>
            <p>{venture.text}</p>
            <ul>
              {venture.points.map((p) => (
                <li key={p}>
                  <CheckCircle2 /> {p}
                </li>
              ))}
            </ul>
          </div>
          <Gallery images={venture.images} />
        </Reveal>
        <div className="beyond-grid">
          {beyond.map((b, i) => (
            <Reveal key={b.title} delay={0.08 * i} as="article" className="beyond-card glass">
              <img src={asset(b.image)} alt={b.title} loading="lazy" />
              <div>
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
    <section className="section" id="contact">
      <div className="container">
        <Reveal className="contact glass">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>
            07 · Contact
          </div>
          <h2>
            Let's build <span className="grad-text">something real.</span>
          </h2>
          <p>
            I'm looking for Werkstudent and AI/ML engineering roles in Germany, and I'm always happy to talk about computer
            vision, LLMs or industrial AI.
          </p>
          <div className="email-row">
            <a className="email-link" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <button className="copy-btn" onClick={copy} aria-live="polite">
              {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="contact-cards">
            <a className="link-pill" href={profile.linkedin} target="_blank" rel="noopener">
              <LinkedinIcon /> LinkedIn
            </a>
            <a className="link-pill" href={profile.github} target="_blank" rel="noopener">
              <GithubIcon /> GitHub
            </a>
            <a className="link-pill" href={profile.phoneHref}>
              <Phone /> {profile.phone}
            </a>
            <span className="link-pill">
              <MapPin /> {profile.location}
            </span>
            <a className="link-pill" href={asset(profile.cv)} target="_blank" rel="noopener">
              <Download /> CV (PDF)
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer({ onTop }: { onTop: () => void }) {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>
          © {new Date().getFullYear()} {profile.name} · Built with React, Three.js and Framer Motion
        </span>
        <span style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <a href={`mailto:${profile.email}`} aria-label="Email" className="to-top">
            <Mail />
          </a>
          <button className="to-top" onClick={onTop}>
            Back to top <ArrowUp />
          </button>
        </span>
      </div>
    </footer>
  );
}

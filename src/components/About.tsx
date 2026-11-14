import { useInView } from 'framer-motion';
import { Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { principles, profile, stats } from '../data/content';
import { asset, CountUp, Reveal, Ribbon, ScrollWords, SectionHead } from './ui';

function Portrait() {
  return (
    <figure className="portrait">
      <img src={asset(profile.portrait)} alt={`Portrait of ${profile.name}`} width={1024} height={1024} loading="lazy" />
      <figcaption className="label">
        <b>{profile.name}</b>
        <span>{profile.location}</span>
      </figcaption>
    </figure>
  );
}

/* Small animated drawings, one per principle. They only move while their card is open. */
const glyphs = [
  // Physics-aware ML: a mass on an orbit
  <svg key="a" viewBox="0 0 48 48" className="glyph">
    <circle cx="24" cy="24" r="17" className="g-line g-dash" />
    <circle cx="24" cy="24" r="4" className="g-fill" />
    <g className="g-spin">
      <circle cx="41" cy="24" r="3.4" className="g-accent" />
    </g>
  </svg>,
  // Honest evaluation: bars and a check mark
  <svg key="b" viewBox="0 0 48 48" className="glyph">
    <rect x="6" y="26" width="7" height="16" rx="2" className="g-fill g-bar" />
    <rect x="17" y="18" width="7" height="24" rx="2" className="g-fill g-bar d1" />
    <rect x="28" y="10" width="7" height="32" rx="2" className="g-accent g-bar d2" />
    <path d="M36 9l3.5 3.5L45 6" className="g-line g-draw" pathLength={1} />
  </svg>,
  // Production-ready AI: a chip with a pulsing core
  <svg key="c" viewBox="0 0 48 48" className="glyph">
    <rect x="11" y="11" width="26" height="26" rx="5" className="g-line" />
    <rect x="19" y="19" width="10" height="10" rx="2" className="g-accent g-pulse" />
    <path d="M18 11V5M30 11V5M18 43v-6M30 43v-6M11 18H5M11 30H5M43 18h-6M43 30h-6" className="g-line" />
  </svg>,
  // Cyber-physical systems: a machine and its twin, with data moving between them
  <svg key="d" viewBox="0 0 48 48" className="glyph">
    <rect x="4" y="15" width="16" height="18" rx="3" className="g-line" />
    <rect x="28" y="15" width="16" height="18" rx="3" className="g-line g-dash" />
    <path d="M20 24h8" className="g-line" />
    <circle cx="20" cy="24" r="2.6" className="g-accent g-travel" />
  </svg>,
];

const STEP_MS = 4200;

/**
 * The four working principles as a strip that opens one card at a time.
 * It moves on by itself while on screen; hovering or tapping a card picks it.
 */
function Principles() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-15% 0px -15% 0px' });
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);

  useEffect(() => {
    if (hold || !inView) return;
    const t = setTimeout(() => setActive((n) => (n + 1) % principles.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, hold, inView]);

  return (
    <div
      className={`principles${inView && !hold ? ' running' : ''}`}
      ref={ref}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHold(true)}
      onPointerLeave={() => setHold(false)}
    >
      {principles.map((p, i) => (
        <button
          key={p.title}
          type="button"
          className={`principle${i === active ? ' active' : ''}`}
          aria-expanded={i === active}
          onClick={() => setActive(i)}
          onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
          onFocus={() => setActive(i)}
        >
          <span className="principle-top">
            <span className="label">0{i + 1}</span>
            {glyphs[i]}
          </span>
          <span className="principle-body">
            <h3>{p.title}</h3>
            <span className="principle-text">
              <span>
                <span className="principle-p">{p.text}</span>
              </span>
            </span>
          </span>
          <span className="principle-bar" aria-hidden>
            <i key={`${active}-${hold}`} style={{ animationDuration: `${STEP_MS}ms` }} />
          </span>
        </button>
      ))}
    </div>
  );
}

export default function About({ reduced }: { reduced: boolean }) {
  return (
    <section className="section has-ribbon" id="about">
      <Ribbon
        className="r-about"
        tone="cyan"
        reduced={reduced}
        from={0.8}
        to={-0.15}
        points={[
          [1.06, 0.2],
          [0.8, 0.05],
          [0.5, 0.02],
          [0.27, 0.14],
          [0.21, 0.4],
          [0.3, 0.64],
          [0.5, 0.72],
          [0.66, 0.58],
          [0.7, 0.3],
          [0.79, 0.1],
          [0.9, 0.13],
          [0.92, 0.32],
        ]}
      />
      <div className="container">
        <SectionHead eyebrow="About" title="*From mechanical systems* to intelligent systems" />
        <div className="about-grid">
          <div>
            <ScrollWords
              className="about-lead"
              text="I build AI for the physical world: factory floors, inspection lines and robots. Careful evaluation, honest failure analysis, and models small enough to deploy."
            />
            <Reveal delay={0.12} className="about-cta">
              <a className="pill dark" href={asset(profile.cv)} target="_blank" rel="noopener">
                Download CV <Download />
              </a>
            </Reveal>
            <div className="stats">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={0.06 * i} className="stat">
                  <div className="stat-value">
                    <CountUp to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="stat-label">{s.label}</div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={0.1}>
            <Portrait />
          </Reveal>
        </div>

        <Reveal>
          <Principles />
        </Reveal>
      </div>
    </section>
  );
}

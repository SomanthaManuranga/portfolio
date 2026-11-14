import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { aboutPhrases, profile, stats } from '../data/content';
import { asset, CountUp, Reveal, Ribbon, SectionHead } from './ui';

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

/** The end of the About line: short phrases that take turns, each rising into place. */
function Rotator({ words, reduced }: { words: string[]; reduced: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), 2400);
    return () => clearInterval(t);
  }, [reduced, words.length]);
  const prev = (i - 1 + words.length) % words.length;
  return (
    <span className="rotator" aria-hidden>
      {words.map((w, n) => (
        <span key={w} className={n === i ? 'on' : n === prev ? 'prev' : ''}>
          {w}
        </span>
      ))}
    </span>
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
            <Reveal>
              <p className="about-lead" aria-label={`I build AI for the physical world that is ${aboutPhrases.join(' ').replace(/\./g, ',')}`}>
                <span aria-hidden>I build AI for the physical world </span>
                <span className="about-turn" aria-hidden>
                  <span className="muted">that is</span> <Rotator words={aboutPhrases} reduced={reduced} />
                </span>
              </p>
            </Reveal>
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
      </div>
    </section>
  );
}

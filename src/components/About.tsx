import { GraduationCap } from 'lucide-react';
import { useRef } from 'react';
import { principles, profile, stats } from '../data/content';
import { asset, CountUp, Reveal, SectionHead } from './ui';

function Portrait() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transform = `rotateY(${(x - 0.5) * 14}deg) rotateX(${(0.5 - y) * 14}deg)`;
    el.style.setProperty('--sx', `${x * 100}%`);
    el.style.setProperty('--sy', `${y * 100}%`);
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = '';
  };
  return (
    <div className="portrait-wrap">
      <div ref={ref} className="portrait-card glass" onPointerMove={onMove} onPointerLeave={reset}>
        <img src={asset(profile.portrait)} alt={`Portrait of ${profile.name}`} width={900} height={900} loading="lazy" />
        <div className="portrait-shine" />
        <div className="portrait-tag glass t1">
          <GraduationCap size={14} /> M.Sc. <b>AI · OTH</b>
        </div>
        <div className="portrait-tag glass t2">
          <span className="status-dot" /> B.Sc. <b>Mech. Eng.</b>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <SectionHead eyebrow="01 · About" title={<>From mechanical systems <span className="grad-text">to intelligent ones.</span></>} />
        <div className="about-grid">
          <div>
            <Reveal>
              <p className="about-lead">
                I build AI that has to survive contact with the real world: <em>factory floors</em>, X-ray inspection lines,
                scanned paperwork and <em>robots</em> that start without a map.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="about-body">{profile.summary}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="about-body">
                Before Germany I worked as a design engineer in aviation and as a mechatronics trainee on robotic production lines.
                That background shapes how I work: careful evaluation, honest failure analysis and models small enough to deploy.
              </p>
            </Reveal>
            <div className="stats" style={{ marginTop: 32 }}>
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={0.08 * i} className="stat glass">
                  <div className="stat-value grad-text">
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

        <div className="principles">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={0.08 * i} className="principle glass">
              <span className="principle-num">0{i + 1} / principle</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import { principles, profile, stats } from '../data/content';
import { asset, CountUp, Reveal, SectionHead } from './ui';

function Portrait() {
  return (
    <figure className="portrait">
      <img src={asset(profile.portrait)} alt={`Portrait of ${profile.name}`} width={1024} height={1024} loading="lazy" />
      <span className="corner tl" aria-hidden />
      <span className="corner tr" aria-hidden />
      <span className="corner bl" aria-hidden />
      <span className="corner br" aria-hidden />
      <figcaption className="label">
        <b>{profile.name}</b>
        <span>{profile.location}</span>
      </figcaption>
    </figure>
  );
}

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <SectionHead eyebrow="01 / About" title={<>From mechanical systems to <span className="accent">intelligent ones</span></>} />
        <div className="about-grid">
          <div>
            <Reveal>
              <p className="about-lead">
                I build AI for the physical world: factory floors, inspection lines and robots.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="about-body">{profile.summary}</p>
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

        <div className="principles">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={0.06 * i} className="principle">
              <span className="label">0{i + 1}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

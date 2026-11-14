import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { profile, projects } from '../data/content';
import ProjectVisual from './ProjectVisual';
import { Reveal, RollText } from './ui';

const featured = projects.filter((p) => p.featured);

/**
 * The statement after the hero: a very large two-line title that drifts into place
 * as you scroll, a short description, and a "work reel" panel that grows from a
 * thumbnail to the full width while it cycles through the featured projects.
 */
export default function Statement({ onNavigate, reduced }: { onNavigate: (id: string) => void; reduced: boolean }) {
  const titleRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);

  const title = useScroll({ target: titleRef, offset: ['start end', 'end 0.35'] });
  const x1 = useTransform(title.scrollYProgress, [0, 1], ['-9%', '0%']);
  const x2 = useTransform(title.scrollYProgress, [0, 1], ['9%', '0%']);

  // The reel opens from its top-right corner to the full panel
  const reel = useScroll({ target: reelRef, offset: ['start 0.95', 'start 0.12'] });
  const clip = useTransform(reel.scrollYProgress, (p) => {
    const q = 1 - Math.min(1, Math.max(0, p));
    return `inset(0% 0% ${q * 52}% ${q * 60}% round 22px)`;
  });
  const inner = useTransform(reel.scrollYProgress, [0, 1], [1.18, 1]);
  const descOpacity = useTransform(reel.scrollYProgress, [0.25, 0.7], [1, 0]);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((n) => (n + 1) % featured.length), 3200);
    return () => clearInterval(t);
  }, [reduced]);

  const p = featured[i];

  return (
    <section className="statement" id="intro">
      <div className="container">
        <div className="statement-title" ref={titleRef} aria-label="Beyond the notebook, built to deploy">
          <motion.span style={reduced ? undefined : { x: x1 }} aria-hidden>
            Beyond the notebook
          </motion.span>
          <motion.span style={reduced ? undefined : { x: x2 }} aria-hidden>
            Built to deploy
          </motion.span>
        </div>

        <div className="reel-wrap" ref={reelRef}>
          <motion.div className="reel-desc" style={reduced ? undefined : { opacity: descOpacity }}>
            <Reveal>
              <p>{profile.summary}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <a
                href="#about"
                className="pill roll-host cta"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('about');
                }}
              >
                <span className="dot" />
                <RollText text="About me" />
                <ArrowRight className="pill-arrow at-end" aria-hidden />
              </a>
            </Reveal>
          </motion.div>

          <motion.div className="reel dark-panel" style={reduced ? undefined : { clipPath: clip }}>
            <motion.div className="reel-inner" style={reduced ? undefined : { scale: inner }}>
              {featured.map((f, n) => (
                <div key={f.slug} className={`reel-slide ${n === i ? 'on' : ''}`}>
                  <ProjectVisual slug={f.slug} />
                </div>
              ))}
            </motion.div>
            <div className="reel-overlay">
              <div className="orow top label">
                <span className="plus">+</span>
                <span>
                  Selected work {String(i + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}
                </span>
                <span className="plus">+</span>
              </div>
              <div className="orow">
                <div>
                  <span className="label">{p.category}</span>
                  <h3>{p.title}</h3>
                </div>
                <a
                  href="#projects"
                  className="pill roll-host"
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('projects');
                  }}
                >
                  <RollText text="View work" />
                  <span className="dot" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import { easeInOut, motion, useMotionValueEvent, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { profile, projects } from '../data/content';
import ProjectVisual from './ProjectVisual';
import { Ribbon, RollText, useBoxProgress } from './ui';

const featured = projects.filter((p) => p.featured);
const CROSSES = [0, 1, 2, 3, 4];

/**
 * The statement after the hero: a very large two-line title, a ribbon line that
 * draws itself behind it, then a pinned "work reel". The reel starts as a small
 * blue-tinted thumbnail beside the description and, while the page is held in
 * place, grows to fill the screen and takes its real colours.
 */
export default function Statement({ onNavigate, reduced }: { onNavigate: (id: string) => void; reduced: boolean }) {
  const topRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(reduced);
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 820);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 820);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // The two title lines drift toward each other as they come up the screen
  const title = useBoxProgress(topRef, ({ top, height, vh }) => [top - vh, top + height * 0.3]);
  const x1 = useTransform(title, [0, 1], ['-7%', '0%']);
  const x2 = useTransform(title, [0, 1], ['7%', '0%']);

  // Progress through the pinned stretch
  const pin = useBoxProgress(wrapRef, ({ top, height, vh }) => [top, top + height - vh]);
  const small = narrow ? 0.52 : 0.44;
  const scale = useTransform(pin, [0.12, 0.8], [small, 1], { ease: easeInOut });
  const radius = useTransform(scale, (s) => `${22 / s}px`);
  const tint = useTransform(pin, [0.2, 0.7], [1, 0]);
  const descOpacity = useTransform(pin, [0.12, 0.36], [1, 0]);
  const descY = useTransform(pin, [0.12, 0.36], [0, -36]);
  const overlay = useTransform(pin, [0.66, 0.86], [0, 1]);
  useMotionValueEvent(pin, 'change', (v) => setOpen(reduced || v > 0.7));

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((n) => (n + 1) % featured.length), 3200);
    return () => clearInterval(t);
  }, [reduced]);

  const p = featured[i];
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(id);
  };

  return (
    <section className="statement" id="intro">
      <div className="statement-top" ref={topRef}>
        <Ribbon
          className="r-statement"
          tone="blue"
          reduced={reduced}
          from={0.72}
          to={-0.5}
          points={[
            [-0.06, 0.02],
            [0.16, 0.1],
            [0.3, 0.3],
            [0.33, 0.56],
            [0.3, 0.9],
            [0.14, 1.0],
            [0.0, 0.9],
            [0.0, 0.7],
            [0.18, 0.57],
            [0.44, 0.58],
            [0.62, 0.7],
            [0.73, 0.86],
          ]}
        />
        <div className="container">
          <div className="statement-title" aria-label="Beyond the notebook, built to deploy">
            <motion.span style={reduced ? undefined : { x: x1 }} aria-hidden>
              Beyond the notebook,
            </motion.span>
            <motion.span style={reduced ? undefined : { x: x2 }} aria-hidden>
              built to deploy
            </motion.span>
          </div>
        </div>
      </div>

      <div className={`reel-wrap${reduced ? ' static' : ''}`} ref={wrapRef}>
        <div className="reel-stick">
          <div className="container">
            <div className="reel-stage">
              <motion.div className="reel-crosses top" style={reduced ? undefined : { opacity: overlay }} aria-hidden>
                {CROSSES.map((n) => (
                  <span key={n} className="plus">
                    +
                  </span>
                ))}
              </motion.div>

              <motion.div className="reel-desc" style={reduced ? undefined : { opacity: descOpacity, y: descY }}>
                <p>{profile.summary}</p>
                <a href="#about" className="pill roll-host cta light" onClick={go('about')}>
                  <span className="dot" />
                  <RollText text="About me" />
                  <ArrowRight className="pill-arrow at-end" aria-hidden />
                </a>
              </motion.div>

              <motion.div
                className={`reel dark-panel${open ? ' open' : ''}`}
                style={reduced ? undefined : { scale, borderRadius: radius }}
              >
                <div className="reel-inner">
                  {featured.map((f, n) => (
                    <div key={f.slug} className={`reel-slide ${n === i ? 'on' : ''}`}>
                      <ProjectVisual slug={f.slug} />
                    </div>
                  ))}
                </div>
                {!reduced && <motion.div className="reel-tint" style={{ opacity: tint }} aria-hidden />}
                <motion.div className="reel-overlay" style={reduced ? undefined : { opacity: overlay }}>
                  <div className="orow top label">
                    <span>
                      Selected work {String(i + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}
                    </span>
                    <span>{p.category}</span>
                  </div>
                  <a href="#projects" className="reel-big roll-host" onClick={go('projects')} tabIndex={open ? 0 : -1}>
                    <span>View</span>
                    <span className="reel-go" aria-hidden>
                      <ArrowRight />
                    </span>
                    <span>work</span>
                  </a>
                  <div className="orow">
                    <h3 key={p.slug} className="reel-name">
                      {p.title}
                    </h3>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div className="reel-crosses bottom" style={reduced ? undefined : { opacity: overlay }} aria-hidden>
                {CROSSES.map((n) => (
                  <span key={n} className="plus">
                    +
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

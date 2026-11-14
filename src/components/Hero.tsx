import { motion, useScroll, useTransform } from 'framer-motion';
import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { profile } from '../data/content';
import { SplitReveal } from './ui';

const Scene = lazy(() => import('../three/Scene'));
const ease = [0.22, 1, 0.36, 1] as const;

/** Never let a WebGL problem take the page down. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn('3D scene disabled:', err);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** The theme's accent colours (for dark surfaces, and the full-strength brand colour), re-read when the theme changes. */
function useThemeColours() {
  const read = () => {
    const css = getComputedStyle(document.documentElement);
    return {
      accent: css.getPropertyValue('--accent-on-dark').trim() || '#93a4ff',
      brand: css.getPropertyValue('--accent').trim() || '#1f3bff',
    };
  };
  const [accent, setAccent] = useState(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setAccent(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  return accent;
}

export default function Hero({ reduced }: { reduced: boolean }) {
  const [webgl] = useState(hasWebGL);
  const [showScene, setShowScene] = useState(false);
  const { accent, brand } = useThemeColours();
  const panel = useRef<HTMLDivElement>(null);

  // The panel settles back slightly as it scrolls away
  const { scrollYProgress } = useScroll({ target: panel, offset: ['start 0.2', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 40]);

  // Load the 3D scene after first paint so the text is interactive immediately
  useEffect(() => {
    if (!webgl) return;
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: object) => number }).requestIdleCallback;
    if (idle) idle(() => setShowScene(true), { timeout: 600 });
    else setTimeout(() => setShowScene(true), 200);
  }, [webgl]);

  return (
    <section className="hero" id="top">
      <div className="container">
        <h1 className="hero-title" aria-label={`${profile.name}, AI engineer. I build computer vision, LLM and automation systems for industry.`}>
          <SplitReveal
            text="*I'm an* AI engineer. *I build* computer vision, LLM *and* automation systems *for industry.*"
            delay={0.15}
            immediate
          />
        </h1>

        <motion.div
          ref={panel}
          className="hero-panel dark-panel"
          style={reduced ? undefined : { scale, y }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease }}
        >
          {showScene && (
            <SceneBoundary>
              <Suspense fallback={null}>
                <Scene reducedMotion={reduced} accent={accent} brand={brand} />
              </Suspense>
            </SceneBoundary>
          )}
          <div className="overlay">
            <div className="orow top">
              <span className="status label">
                <span className="status-dot" /> {profile.availability}
              </span>
            </div>
            <div className="orow">
              <span className="hero-hint label">
                <span className="for-mouse">Move through the parts · click to scatter</span>
                <span className="for-touch">Tap to scatter the parts</span>
              </span>
              <div className="hero-focus">
                {profile.rotatingRoles.map((r) => (
                  <span key={r} className="chip">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="scroll-row label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          aria-hidden
        >
          <span className="plus">+</span>
          <span className="plus">+</span>
          <span className="scroll-text">Scroll to explore</span>
          <span className="plus">+</span>
          <span className="plus">+</span>
        </motion.div>
      </div>
    </section>
  );
}

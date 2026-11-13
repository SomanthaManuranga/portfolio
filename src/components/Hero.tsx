import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { profile } from '../data/content';
import { asset } from './ui';

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

/** The theme's accent for dark surfaces, re-read whenever the theme changes. */
function useAccentOnDark() {
  const read = () => getComputedStyle(document.documentElement).getPropertyValue('--accent-on-dark').trim() || '#93a4ff';
  const [accent, setAccent] = useState(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setAccent(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  return accent;
}

export default function Hero({ onNavigate, reduced }: { onNavigate: (id: string) => void; reduced: boolean }) {
  const [webgl] = useState(hasWebGL);
  const [showScene, setShowScene] = useState(false);
  const accent = useAccentOnDark();

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
        <div className="hero-top">
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease }}
          >
            {profile.name}. <span className="muted">{profile.role} building computer vision, LLM and automation systems for industry.</span>
          </motion.h1>
          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
          >
            <a
              href="#projects"
              className="pill dark"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('projects');
              }}
            >
              View work <span className="dot" />
            </a>
            <a href={asset(profile.cv)} target="_blank" rel="noopener" className="pill">
              Download CV <Download />
            </a>
          </motion.div>
        </div>

        <motion.div
          className="hero-panel dark-panel"
          initial={{ opacity: 0, y: 30, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease }}
        >
          {showScene && (
            <SceneBoundary>
              <Suspense fallback={null}>
                <Scene reducedMotion={reduced} accent={accent} />
              </Suspense>
            </SceneBoundary>
          )}
          <div className="overlay">
            <div className="orow top">
              <span className="status label">
                <span className="status-dot" /> {profile.availability}
              </span>
              <span className="plus" aria-hidden>
                +
              </span>
            </div>
            <div className="orow">
              <span className="label">
                <span className="plus" aria-hidden>
                  +
                </span>
                &nbsp;&nbsp;Scroll to explore
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
      </div>
    </section>
  );
}

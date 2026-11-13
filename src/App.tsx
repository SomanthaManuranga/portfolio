import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import About from './components/About';
import Hero from './components/Hero';
import Intro from './components/Intro';
import Nav from './components/Nav';
import Projects from './components/Projects';
import { Beyond, Contact, Background, Experience, Footer, Skills } from './components/Sections';
import { nav, profile } from './data/content';
import { scroll, scrollToId } from './lib/scroll';

const Scene = lazy(() => import('./three/Scene'));

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

/** Small fixed read-outs in the bottom corners: where you are on the page. */
function CornerHud() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  const [index, setIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => scrollYProgress.on('change', (v) => setAtEnd(v > 0.985)), [scrollYProgress]);

  useEffect(() => {
    const ids = ['top', ...nav.map((n) => n.id)];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setIndex(ids.indexOf(e.target.id))),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const label = index === 0 ? 'Intro' : nav[index - 1].label;
  return (
    <>
      <div className={`corner-hud left label ${index === 0 ? '' : 'off'}`} aria-hidden>
        <span>{profile.location}</span>
        <span>49.44° N, 11.85° E</span>
      </div>
      <div className={`corner-hud right label ${atEnd ? 'off' : ''}`} aria-hidden>
        <span>
          <b>{String(index).padStart(2, '0')}</b> / {String(nav.length).padStart(2, '0')}
        </span>
        <span className="bar">
          <motion.span style={{ scaleX: progress }} />
        </span>
        <span>{label}</span>
      </div>
    </>
  );
}

export default function App() {
  const reduced = useReducedMotion() ?? false;
  const [webgl] = useState(hasWebGL);
  const [showScene, setShowScene] = useState(false);
  const [intro, setIntro] = useState(() => {
    try {
      return !sessionStorage.getItem('intro-seen') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });
  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem('intro-seen', '1');
    } catch {
      /* storage blocked: fine */
    }
    setIntro(false);
  }, []);

  // The scene is bright in the hero and at the very end, quiet behind the content in between
  const { scrollY, scrollYProgress } = useScroll();
  const [vh] = useState(() => window.innerHeight);
  const heroFade = useTransform(scrollY, [0, vh * 0.9], [1, 0.3]);
  const endFade = useTransform(scrollYProgress, [0.92, 1], [0, 0.45]);
  const sceneOpacity = useTransform([heroFade, endFade], ([a, b]: number[]) => Math.min(1, a + b));

  // Smooth scrolling
  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    scroll.lenis = lenis;
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      scroll.lenis = null;
    };
  }, [reduced]);

  // Load the 3D scene after first paint so text is interactive immediately
  useEffect(() => {
    if (!webgl) return;
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: object) => number }).requestIdleCallback;
    if (idle) idle(() => setShowScene(true), { timeout: 600 });
    else setTimeout(() => setShowScene(true), 200);
  }, [webgl]);

  // Respect an initial #section hash
  useEffect(() => {
    const id = location.hash.slice(1);
    if (id && !id.startsWith('project/')) setTimeout(() => document.getElementById(id)?.scrollIntoView(), 50);
  }, []);

  return (
    <>
      <AnimatePresence>{intro && <Intro onDone={finishIntro} />}</AnimatePresence>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {showScene && (
        <motion.div className="scene-layer" style={{ opacity: sceneOpacity }} aria-hidden>
          <motion.div style={{ width: '100%', height: '100%' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
            <SceneBoundary>
              <Suspense fallback={null}>
                <Scene reducedMotion={reduced} />
              </Suspense>
            </SceneBoundary>
          </motion.div>
        </motion.div>
      )}
      <div className="vignette" aria-hidden />

      <Nav onNavigate={scrollToId} />
      <main id="main">
        <Hero key={intro ? 'pre' : 'live'} onNavigate={scrollToId} />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Background />
        <Beyond />
        <Contact />
      </main>
      <Footer onTop={() => scrollToId('top')} />
      <CornerHud />
    </>
  );
}

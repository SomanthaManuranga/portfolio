import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import About from './components/About';
import Hero from './components/Hero';
import Intro from './components/Intro';
import Nav from './components/Nav';
import Projects from './components/Projects';
import { Beyond, Contact, Education, Experience, Footer, Skills } from './components/Sections';
import { skillGroups } from './data/content';
import { ArrowUp } from 'lucide-react';
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

function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let x = window.innerWidth / 2,
      y = window.innerHeight / 3,
      cx = x,
      cy = y,
      raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      if (ref.current) ref.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div className="cursor-glow" ref={ref} aria-hidden />;
}

function BackToTop() {
  const { scrollYProgress, scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useEffect(() => scrollY.on('change', (y) => setShow(y > 700)), [scrollY]);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          className="back-top"
          onClick={() => scrollToId('top')}
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg viewBox="0 0 48 48" aria-hidden>
            <circle cx="24" cy="24" r="21" className="back-top-track" />
            <motion.circle cx="24" cy="24" r="21" className="back-top-ring" style={{ pathLength: scrollYProgress }} />
          </svg>
          <ArrowUp />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function Marquee() {
  const words = skillGroups.flatMap((g) => g.items.slice(0, 4));
  const row = [...words, ...words];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {row.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
    </div>
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
  const { scrollYProgress, scrollY } = useScroll();
  const [vh] = useState(() => window.innerHeight);
  const sceneOpacity = useTransform(scrollY, [0, vh * 0.9], [1, 0.32]);
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  // Smooth scrolling
  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
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
      <motion.div className="progress-bar" style={{ scaleX: progress }} aria-hidden />
      <div className="bg-gradient" aria-hidden />
      <div className="bg-grid" aria-hidden />
      {showScene && (
        <motion.div className="scene-layer" style={{ opacity: sceneOpacity }} aria-hidden>
          <motion.div style={{ width: '100%', height: '100%' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6 }}>
            <SceneBoundary>
              <Suspense fallback={null}>
                <Scene reducedMotion={reduced} />
              </Suspense>
            </SceneBoundary>
          </motion.div>
        </motion.div>
      )}
      {!reduced && <CursorGlow />}

      <Nav onNavigate={scrollToId} />
      <main id="main">
        <Hero key={intro ? 'pre' : 'live'} onNavigate={scrollToId} />
        <Marquee />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Education />
        <Beyond />
        <Contact />
      </main>
      <Footer onTop={() => scrollToId('top')} />
      <BackToTop />
    </>
  );
}

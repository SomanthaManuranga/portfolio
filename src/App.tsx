import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import { useCallback, useEffect, useState } from 'react';
import About from './components/About';
import Hero from './components/Hero';
import Intro from './components/Intro';
import Nav from './components/Nav';
import Projects from './components/Projects';
import Statement from './components/Reel';
import { Background, Beyond, Contact, Experience, Skills } from './components/Sections';
import { scroll, scrollToId } from './lib/scroll';
import { bindUiSounds } from './lib/sound';

/** Colour themes. The first one is the default. */
const THEMES = [
  { id: 'lumen', name: 'Lumen blue', swatch: '#1f3bff', bg: '#f0f1f8' },
  { id: 'paper', name: 'Paper teal', swatch: '#0f766e', bg: '#f3f0ea' },
  { id: 'steel', name: 'Steel orange', swatch: '#d9480f', bg: '#e9edf1' },
  { id: 'graphite', name: 'Graphite mint', swatch: '#7fd6cb', bg: '#20252d' },
] as const;

/** Set to true to show a theme picker bar while choosing a theme. */
const SHOW_THEME_PICKER = false;
const DEFAULT_THEME: (typeof THEMES)[number]['id'] = 'lumen';

function ThemePicker({ theme, onPick }: { theme: string; onPick: (id: string) => void }) {
  return (
    <div className="theme-picker" role="group" aria-label="Colour theme">
      <span className="label">Theme</span>
      {THEMES.map((t) => (
        <button key={t.id} className={theme === t.id ? 'on' : ''} onClick={() => onPick(t.id)} aria-pressed={theme === t.id}>
          <i style={{ background: `linear-gradient(135deg, ${t.bg} 50%, ${t.swatch} 50%)` }} />
          {t.name}
        </button>
      ))}
    </div>
  );
}

/** Thin bar on the right edge showing how far down the page you are. */
function ScrollIndicator() {
  const { scrollYProgress } = useScroll();
  const y = useSpring(scrollYProgress, { stiffness: 220, damping: 40 });
  return (
    <div className="scroll-indicator" aria-hidden>
      <motion.span style={{ scaleY: y }} />
    </div>
  );
}

export default function App() {
  const reduced = useReducedMotion() ?? false;
  const [theme, setTheme] = useState<string>(() => {
    if (!SHOW_THEME_PICKER) return DEFAULT_THEME;
    try {
      const saved = localStorage.getItem('theme');
      return THEMES.some((t) => t.id === saved) ? (saved as string) : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const bg = THEMES.find((t) => t.id === theme)?.bg ?? '#f0f1f8';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
    if (SHOW_THEME_PICKER) {
      try {
        localStorage.setItem('theme', theme);
      } catch {
        /* storage blocked: fine */
      }
    }
  }, [theme]);

  useEffect(() => bindUiSounds(), []);

  // Smooth scrolling
  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
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
      <Nav onNavigate={scrollToId} />
      <main id="main">
        <Hero key={intro ? 'pre' : 'live'} reduced={reduced} />
        <Statement onNavigate={scrollToId} reduced={reduced} />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Background />
        <Beyond />
        <Contact onTop={() => scrollToId('top')} />
      </main>
      <ScrollIndicator />
      {SHOW_THEME_PICKER && <ThemePicker theme={theme} onPick={setTheme} />}
    </>
  );
}

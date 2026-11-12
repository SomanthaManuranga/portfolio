import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const lines = ['loading weights', 'compiling shaders', 'calibrating sensors', 'neural core online'];

/** Short boot sequence shown once per browser session. */
export default function Intro({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1300;
    let raf = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      setPct(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 250);
    });
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const step = Math.min(lines.length - 1, Math.floor(pct / 26));

  return (
    <motion.div
      className="intro"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
      onClick={onDone}
      aria-hidden
    >
      <motion.div className="intro-inner" exit={{ scale: 1.08, filter: 'blur(8px)', transition: { duration: 0.7 } }}>
        <div className="intro-mark">
          <svg viewBox="0 0 100 100">
            <polygon points="50,4 92,28 92,72 50,96 8,72 8,28" className="intro-hex" pathLength={1} style={{ strokeDashoffset: 1 - pct / 100 }} />
          </svg>
          <span>SM</span>
        </div>
        <div className="intro-count">
          {String(pct).padStart(3, '0')}
          <small>%</small>
        </div>
        <div className="intro-bar">
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <div className="intro-line">
          <span className="intro-prompt">&gt;</span> {lines[step]}
          {pct === 100 ? ' ✓' : '…'}
        </div>
      </motion.div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { profile } from '../data/content';

/** Short loading counter shown once per browser session. Click to skip. */
export default function Intro({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    let raf = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      setPct(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 220);
    });
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <motion.div
      className="intro"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
      onClick={onDone}
      aria-hidden
    >
      <div className="intro-row">
        <span className="label">
          {profile.name} · {profile.role}
        </span>
        <span className="intro-count">{String(pct).padStart(3, '0')}</span>
      </div>
      <span className="intro-bar" style={{ transform: `scaleX(${pct / 100})` }} />
    </motion.div>
  );
}

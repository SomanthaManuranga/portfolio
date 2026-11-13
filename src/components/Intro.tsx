import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/** Short loading bar shown once per browser session. Click to skip. */
export default function Intro({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1100;
    let raf = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      setPct(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 200);
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
      <div className="intro-inner">
        <div className="intro-bar">
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <span className="label">Loading {String(pct).padStart(3, '0')}</span>
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/** One digit column of the loading counter: the strip slides to the current digit. */
function Digit({ value }: { value: number }) {
  return (
    <span className="intro-digit">
      <span style={{ transform: `translateY(${-value * 10}%)` }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <i key={d}>{d}</i>
        ))}
      </span>
    </span>
  );
}

/** Loading screen shown once per browser session: a bar and a rolling counter. Click to skip. */
export default function Intro({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1500;
    let raf = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      setPct(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 260);
    });
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const digits = String(pct).padStart(3, '0').split('').map(Number);

  return (
    <motion.div
      className="intro"
      initial={{ y: 0 }}
      exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.35, 0, 0, 1] } }}
      onClick={onDone}
      aria-hidden
    >
      <div className="intro-bar">
        <span style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      <div className="intro-count">
        {digits.map((d, i) => (
          <Digit key={i} value={d} />
        ))}
      </div>
    </motion.div>
  );
}

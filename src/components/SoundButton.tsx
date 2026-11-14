import { useEffect, useRef, useState } from 'react';
import { sound } from '../lib/sound';

/** Round header button with a line that turns into a moving wave while sound is on. */
export default function SoundButton() {
  const [on, setOn] = useState(sound.on);
  const path = useRef<SVGPathElement>(null);

  useEffect(() => sound.subscribe(setOn), []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let amp = 0;
    const draw = (t: number) => {
      const target = on ? 1 : 0;
      amp += (target - amp) * 0.12;
      const pts: string[] = [];
      for (let i = 0; i <= 20; i++) {
        const x = 2 + i;
        const edge = Math.sin((i / 20) * Math.PI); // pinned at both ends
        const y = 12 + Math.sin(i * 0.75 - t * 0.008) * 5 * edge * amp;
        pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(2)}`);
      }
      path.current?.setAttribute('d', pts.join(' '));
      if (!reduced && (on || amp > 0.01)) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [on]);

  return (
    <button
      className={`sound-btn ${on ? 'on' : ''}`}
      onClick={() => sound.toggle()}
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
      title={on ? 'Sound on' : 'Sound off'}
      data-sound-toggle
    >
      <svg viewBox="0 0 24 24" aria-hidden>
        <path ref={path} d="M2 12 L22 12" />
      </svg>
    </button>
  );
}

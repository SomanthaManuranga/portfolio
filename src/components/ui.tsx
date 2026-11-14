import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform, type MotionValue, type Variants } from 'framer-motion';
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject, type SVGProps } from 'react';

/** Resolve a path in /public against the deploy base (e.g. /portfolio/). */
export const asset = (path: string) =>
  /^https?:\/\//.test(path) ? path : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
};

export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'article';
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

export function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <Reveal className="section-head">
      <div>
        <span className="label">{eyebrow}</span>
        <h2>
          <SplitReveal text={title} />
        </h2>
      </div>
      {sub && <p>{sub}</p>}
    </Reveal>
  );
}

/** Number that counts up when scrolled into view. */
export function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1600, bounce: 0 });
  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, mv, to]);
  useEffect(
    () =>
      spring.on('change', (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      }),
    [spring, suffix],
  );
  return <span ref={ref}>0{suffix}</span>;
}

export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

/** Wrap an element so it leans toward the pointer (desktop only). */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = '';
  };
  return (
    <span ref={ref} className="magnetic" onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </span>
  );
}

/**
 * Text whose letters roll upward to a second copy when the nearest `.roll-host`
 * ancestor is hovered or focused. Words stay whole, so long titles still wrap.
 */
export function RollText({ text }: { text: string }) {
  let n = 0;
  return (
    <span className="roll" aria-label={text}>
      {text.split(' ').map((word, w) => (
        <span key={w} className="roll-word" aria-hidden>
          {Array.from(word).map((ch) => {
            const i = n++;
            return (
              <span key={i} className="roll-ch" style={{ '--i': Math.min(i, 30) } as CSSProperties}>
                <span>{ch}</span>
                <span>{ch}</span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

/** `*like this*` marks words to set in grey; everything else stays in the main text colour. */
function toneWords(text: string) {
  const out: { word: string; muted: boolean }[] = [];
  text.split('*').forEach((seg, i) =>
    seg
      .split(' ')
      .filter(Boolean)
      .forEach((word) => out.push({ word, muted: i % 2 === 1 })),
  );
  return out;
}
export const plainText = (text: string) => text.replace(/\*/g, '');

/**
 * Heading text that rises word by word from behind a mask when it scrolls into view.
 * Wrap words in asterisks to set them in grey: "Built *to deploy*".
 */
export function SplitReveal({ text, delay = 0, immediate = false }: { text: string; delay?: number; immediate?: boolean }) {
  // `immediate` plays on mount (for text that is on screen at load) instead of waiting to scroll into view
  const trigger = immediate ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, margin: '0px 0px -10% 0px' } };
  return (
    <motion.span
      className="split"
      aria-label={plainText(text)}
      initial="hidden"
      {...trigger}
      transition={{ staggerChildren: 0.055, delayChildren: delay }}
    >
      {toneWords(text).map(({ word, muted }, i) => (
        <span key={i} className={`split-word${muted ? ' muted' : ''}`} aria-hidden>
          <motion.span
            variants={{ hidden: { y: '110%' }, show: { y: 0 } }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Letters that rise one after another once `shown` is true. */
export function CharReveal({ text, shown }: { text: string; shown: boolean }) {
  let n = 0;
  return (
    <span className={`chars${shown ? ' in' : ''}`} aria-label={text}>
      {text.split(' ').map((word, w) => (
        <span key={w} className="chars-word" aria-hidden>
          {Array.from(word).map((ch) => {
            const i = n++;
            return (
              <span key={i} className="chars-ch">
                <span style={{ '--i': i } as CSSProperties}>{ch}</span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

/**
 * Scroll progress from 0 to 1 between two page offsets worked out from an element's box.
 * Measured by hand so it stays correct around sticky and transformed elements.
 */
export function useBoxProgress(
  ref: RefObject<HTMLElement>,
  range: (box: { top: number; height: number; vh: number }) => [number, number],
): MotionValue<number> {
  const { scrollY } = useScroll();
  const mv = useMotionValue(0);
  const rangeRef = useRef(range);
  rangeRef.current = range;
  useEffect(() => {
    let lim: [number, number] = [0, 1];
    const update = (y: number) => mv.set(Math.min(1, Math.max(0, (y - lim[0]) / Math.max(1, lim[1] - lim[0]))));
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      lim = rangeRef.current({ top: r.top + window.scrollY, height: r.height, vh: window.innerHeight });
      update(window.scrollY);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    const off = scrollY.on('change', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      off();
    };
  }, [ref, scrollY, mv]);
  return mv;
}

/** A smooth curve through the given points (Catmull-Rom converted to cubic Béziers). */
function splinePath(pts: [number, number][]) {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * A thick ribbon line that draws itself as the page scrolls and sits behind the content.
 * `points` are [x, y] fractions of the ribbon's own box; values outside 0..1 run off the edge.
 * `from` and `to` say when drawing starts and ends, as the viewport fraction the box top has reached.
 */
export function Ribbon({
  points,
  className = '',
  tone = 'blue',
  from = 0.85,
  to = -0.2,
  reduced = false,
}: {
  points: [number, number][];
  className?: string;
  tone?: 'blue' | 'cyan';
  from?: number;
  to?: number;
  reduced?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, '');
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const progress = useBoxProgress(box, ({ top, vh }) => [top - vh * from, top - vh * to]);
  const opacity = useTransform(progress, [0, 0.015], [0, 1]);
  const d = size.w ? splinePath(points.map(([x, y]) => [x * size.w, y * size.h])) : '';
  return (
    <div ref={box} className={`ribbon ribbon-${tone} ${className}`} aria-hidden>
      {d && (
        <svg width={size.w} height={size.h}>
          <defs>
            <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={size.w} y2={size.h}>
              <stop offset="0" className="ribbon-a" />
              <stop offset="1" className="ribbon-b" />
            </linearGradient>
          </defs>
          <motion.path d={d} stroke={`url(#${id})`} style={reduced ? undefined : { pathLength: progress, opacity }} />
        </svg>
      )}
    </div>
  );
}

function ScrollWord({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

/** A paragraph whose words go from faint to solid as it is scrolled through. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.35'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <ScrollWord key={i} word={w} progress={scrollYProgress} range={[i / words.length, Math.min(1, (i + 1.5) / words.length)]} />
      ))}
    </p>
  );
}

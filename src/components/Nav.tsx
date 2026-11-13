import { AnimatePresence, motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { nav, profile } from '../data/content';
import { asset } from './ui';

export default function Nav({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll spy
  useEffect(() => {
    const sections = ['top', ...nav.map((n) => n.id)].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id === 'top' ? '' : e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Close the menu on Escape or a click outside it
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!card.current?.contains(t) && !(t as Element).closest?.('.menu-toggle')) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <nav className="container nav-inner" aria-label="Main">
          <a href="#top" className="brand" onClick={(e) => go(e, 'top')}>
            {profile.name}
          </a>
          <div className="nav-actions">
            <a href="#contact" className="pill dark" onClick={(e) => go(e, 'contact')}>
              Let's talk <span className="dot" />
            </a>
            <button className="pill menu-toggle" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((o) => !o)}>
              {open ? 'Close' : 'Menu'}
              <span className="menu-dots" aria-hidden>
                <i />
                <i />
              </span>
            </button>
          </div>
        </nav>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={card}
            id="site-menu"
            className="menu-card"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top right' }}
          >
            {nav.map((n, i) => (
              <a key={n.id} className={`item ${active === n.id ? 'active' : ''}`} href={`#${n.id}`} onClick={(e) => go(e, n.id)}>
                {n.label}
                <small>{String(i + 1).padStart(2, '0')}</small>
              </a>
            ))}
            <div className="menu-foot">
              <a className="pill small dark" href={asset(profile.cv)} target="_blank" rel="noopener">
                CV (English) <Download />
              </a>
              <a className="pill small" href={asset(profile.cvDe)} target="_blank" rel="noopener">
                Lebenslauf <Download />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

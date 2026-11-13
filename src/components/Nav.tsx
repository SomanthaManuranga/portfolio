import { AnimatePresence, motion } from 'framer-motion';
import { Download, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { nav, profile } from '../data/content';
import { lockScroll } from '../lib/scroll';
import { asset } from './ui';

export default function Nav({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll spy
  useEffect(() => {
    const sections = ['top', ...nav.map((n) => n.id)].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id === 'top' ? '' : e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    lockScroll(open);
  }, [open]);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (open) {
      // Wait for the menu to close and smooth scrolling to resume, otherwise the restart cancels the scroll.
      setOpen(false);
      setTimeout(() => onNavigate(id), 80);
    } else onNavigate(id);
  };

  return (
    <>
      <header className={`nav ${scrolled || open ? 'scrolled' : ''}`}>
        <nav className="container nav-inner" aria-label="Main">
          <a href="#top" className="brand" onClick={(e) => go(e, 'top')}>
            {profile.name} <span>/ {profile.role}</span>
          </a>
          <ul className="nav-links">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className={active === n.id ? 'active' : ''} onClick={(e) => go(e, n.id)}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <a className="btn nav-cta" href={asset(profile.cv)} target="_blank" rel="noopener">
            CV <Download />
          </a>
          <button className="menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <X /> : <Menu />}
          </button>
        </nav>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {nav.map((n, i) => (
              <motion.a
                key={n.id}
                className="item"
                href={`#${n.id}`}
                onClick={(e) => go(e, n.id)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.4 }}
              >
                <small>{String(i + 1).padStart(2, '0')}</small>
                {n.label}
              </motion.a>
            ))}
            <a className="btn btn-primary" href={asset(profile.cv)} target="_blank" rel="noopener">
              Download CV <Download />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

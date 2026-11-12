import type Lenis from 'lenis';

export const scroll: { lenis: Lenis | null } = { lenis: null };

export function scrollToId(id: string) {
  const target = id === 'top' ? 0 : document.getElementById(id);
  if (target === null) return;
  if (scroll.lenis) {
    scroll.lenis.scrollTo(target, { offset: id === 'top' ? 0 : -70, duration: 1.4, force: true });
  } else if (target === 0) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    target.scrollIntoView({ behavior: 'smooth' });
  }
  history.replaceState(null, '', id === 'top' ? location.pathname : `#${id}`);
}

/** Lock page scroll (modal / mobile menu). */
export function lockScroll(locked: boolean) {
  document.body.style.overflow = locked ? 'hidden' : '';
  if (scroll.lenis) {
    if (locked) scroll.lenis.stop();
    else scroll.lenis.start();
  }
}

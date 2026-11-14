import { useEffect } from 'react';
import * as THREE from 'three';

/** What the hero scenes know about the visitor: where the cursor is over the panel, clicks, and scroll. */
export const input = { mx: 0.4, my: 0.3, hasPointer: false, inside: false, hero: 0, burst: false };

export function useInputListeners() {
  useEffect(() => {
    const locate = (e: PointerEvent) => {
      const r = document.querySelector('.hero-panel')?.getBoundingClientRect();
      if (!r) return false;
      input.mx = Math.max(-1.4, Math.min(1.4, ((e.clientX - r.left) / r.width) * 2 - 1));
      input.my = -Math.max(-1.4, Math.min(1.4, ((e.clientY - r.top) / r.height) * 2 - 1));
      input.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      return input.inside;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      input.hasPointer = true;
      locate(e);
    };
    const onDown = (e: PointerEvent) => {
      if (locate(e)) input.burst = true;
    };
    const onScroll = () => {
      input.hero = Math.min(1.4, window.scrollY / window.innerHeight);
    };
    onScroll();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
}

/* ---------------- Shapes ---------------- */
export function extrude(shape: THREE.Shape, depth: number) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3,
    curveSegments: 22,
  });
  g.center();
  return g;
}
export function hole(shape: THREE.Shape, r: number, x = 0) {
  const h = new THREE.Path();
  h.absarc(x, 0, r, 0, Math.PI * 2, true);
  shape.holes.push(h);
}
/** A gear. `broken` teeth in a row are snapped off, leaving jagged stubs. */
export function gearGeometry(broken = 0) {
  const shape = new THREE.Shape();
  const teeth = 9;
  const step = (Math.PI * 2) / teeth;
  for (let k = 0; k < teeth; k++) {
    const a = k * step;
    const pts: [number, number][] =
      k < broken
        ? [
            [0.76, a],
            [0.76, a + step * 0.2],
            [0.83, a + step * 0.3],
            [0.78, a + step * 0.46],
            [0.84, a + step * 0.6],
            [0.76, a + step * 0.8],
          ]
        : [
            [0.76, a],
            [0.76, a + step * 0.2],
            [1, a + step * 0.34],
            [1, a + step * 0.66],
            [0.76, a + step * 0.8],
          ];
    pts.forEach(([r, ang], i) => {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (k === 0 && i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }
  shape.closePath();
  hole(shape, 0.3);
  return extrude(shape, 0.5);
}
export function nutGeometry() {
  const shape = new THREE.Shape();
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    if (k === 0) shape.moveTo(Math.cos(a), Math.sin(a));
    else shape.lineTo(Math.cos(a), Math.sin(a));
  }
  shape.closePath();
  hole(shape, 0.46);
  return extrude(shape, 0.66);
}

/** Small deterministic random generator, so a scene looks the same on every visit. */
export function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

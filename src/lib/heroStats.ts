/**
 * Live numbers from the hero's inspection-cell scene, shared with the page so the
 * counters and the log line can be drawn as ordinary text over the 3D panel.
 * They count what the little simulation has done since the page opened; they are
 * not results from a real system.
 */
export type CellStats = { inspected: number; passed: number; rejected: number; log: string };

type Listener = (s: CellStats) => void;

const listeners = new Set<Listener>();
let value: CellStats = { inspected: 0, passed: 0, rejected: 0, log: '' };

export const cellStats = {
  get: () => value,
  set(patch: Partial<CellStats>) {
    value = { ...value, ...patch };
    listeners.forEach((fn) => fn(value));
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

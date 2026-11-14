/**
 * Sound for the site, synthesised with the Web Audio API (no audio files).
 * Off by default: browsers only allow sound after a click, and nobody likes a page
 * that starts making noise by itself. The header button turns it on.
 */

type Listener = (on: boolean) => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambient: { gain: GainNode; nodes: AudioScheduledSourceNode[] } | null = null;
  private listeners = new Set<Listener>();
  private lastHover = 0;
  on = false;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  /** Whether the visitor left sound on last time (used to hint the button, never to autoplay). */
  get remembered() {
    try {
      return localStorage.getItem('sound') === 'on';
    } catch {
      return false;
    }
  }

  private ensure() {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return true;
  }

  toggle() {
    this.set(!this.on);
  }

  set(on: boolean) {
    if (on && !this.ensure()) return;
    this.on = on;
    try {
      localStorage.setItem('sound', on ? 'on' : 'off');
    } catch {
      /* storage blocked: fine */
    }
    if (this.ctx && this.master) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(on ? 1 : 0, t, 0.12);
      if (on) this.startAmbient();
      else this.stopAmbient();
    }
    if (on) this.tone(520, 880, 0.16, 0.07, 'sine');
    this.listeners.forEach((fn) => fn(on));
  }

  /** A very quiet, slowly moving pad so the page has a sense of space. */
  private startAmbient() {
    if (!this.ctx || !this.master || this.ambient) return;
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 520;
    filter.Q.value = 0.4;
    const nodes: AudioScheduledSourceNode[] = [];
    [110, 164.81, 220.4, 329.63].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 ? 'triangle' : 'sine';
      osc.frequency.value = f;
      osc.detune.value = (i - 1.5) * 4;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.5 : 0.22;
      osc.connect(g).connect(filter);
      osc.start();
      nodes.push(osc);
    });
    // Slow breathing of the filter
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    nodes.push(lfo);
    filter.connect(gain).connect(this.master);
    gain.gain.setTargetAtTime(0.045, ctx.currentTime, 1.2);
    this.ambient = { gain, nodes };
  }

  private stopAmbient() {
    if (!this.ctx || !this.ambient) return;
    const { gain, nodes } = this.ambient;
    const t = this.ctx.currentTime;
    gain.gain.setTargetAtTime(0, t, 0.25);
    nodes.forEach((n) => n.stop(t + 1.2));
    this.ambient = null;
  }

  private tone(from: number, to: number, dur: number, vol: number, type: OscillatorType) {
    if (!this.on || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  hover() {
    const now = performance.now();
    if (now - this.lastHover < 70) return;
    this.lastHover = now;
    this.tone(1250, 980, 0.05, 0.022, 'sine');
  }
  click() {
    this.tone(360, 180, 0.11, 0.07, 'triangle');
  }
  open() {
    this.tone(260, 720, 0.24, 0.05, 'sine');
  }
  close() {
    this.tone(640, 240, 0.2, 0.045, 'sine');
  }
  step() {
    this.tone(480, 620, 0.09, 0.04, 'sine');
  }
}

export const sound = new SoundEngine();

/** Hover and click sounds for every link and button, wired once for the whole page. */
export function bindUiSounds() {
  let last: Element | null = null;
  const pick = (t: EventTarget | null) => (t instanceof Element ? t.closest('a, button, [role="button"]') : null);
  const over = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = pick(e.target);
    if (el && el !== last) sound.hover();
    last = el;
  };
  const click = (e: MouseEvent) => {
    const el = pick(e.target);
    if (el && !el.hasAttribute('data-sound-toggle')) sound.click();
  };
  document.addEventListener('pointerover', over, { passive: true });
  document.addEventListener('click', click, { passive: true });
  return () => {
    document.removeEventListener('pointerover', over);
    document.removeEventListener('click', click);
  };
}

/**
 * Sound for the site, synthesised with the Web Audio API (no audio files).
 * Off by default: browsers only allow sound after a click, and nobody likes a page
 * that starts making noise by itself. The header button turns it on.
 *
 * The sound is meant to be calm: a warm, slowly breathing chord, a soft rush of air
 * that follows how fast the page is scrolled, a quiet note when a new section
 * arrives, and gentle taps on buttons. Everything runs through a soft reverb.
 */

type Listener = (on: boolean) => void;

/** A major pentatonic, low and soft: one note per section of the page. */
const SECTION_NOTES = [220, 246.94, 277.18, 329.63, 369.99, 440, 493.88, 554.37];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private pad: { gain: GainNode; filter: BiquadFilterNode; nodes: AudioScheduledSourceNode[] } | null = null;
  private air: { gain: GainNode; filter: BiquadFilterNode; src: AudioBufferSourceNode } | null = null;
  private listeners = new Set<Listener>();
  private lastHover = 0;
  private lastChime = 0;
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
      const ctx = new Ctor();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(ctx.destination);

      // Everything goes to the bus: part of it straight out, part through a soft reverb
      this.bus = ctx.createGain();
      this.bus.connect(this.master);
      const reverb = ctx.createConvolver();
      reverb.buffer = this.impulse(ctx, 3.2);
      const wet = ctx.createGain();
      wet.gain.value = 0.55;
      this.bus.connect(reverb).connect(wet).connect(this.master);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return true;
  }

  /** A reverb tail made from fading noise. */
  private impulse(ctx: AudioContext, seconds: number) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.2);
    }
    return buffer;
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
      this.master.gain.setTargetAtTime(on ? 1 : 0, t, on ? 0.4 : 0.15);
      if (on) {
        this.startPad();
        this.startAir();
      } else {
        this.stopLayers();
      }
    }
    if (on) {
      this.note(329.63, 1.4, 0.035);
      this.note(440, 1.6, 0.028, 0.12);
    }
    this.listeners.forEach((fn) => fn(on));
  }

  /** The background: a warm chord of pure tones, each one slowly swelling and fading on its own. */
  private startPad() {
    if (!this.ctx || !this.bus || this.pad) return;
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 0.2;
    const nodes: AudioScheduledSourceNode[] = [];
    const voices: [number, number, number][] = [
      // frequency, level, speed of its own slow swell
      [110, 0.5, 0.05],
      [164.81, 0.3, 0.037],
      [220, 0.24, 0.061],
      [277.18, 0.11, 0.043],
      [329.63, 0.07, 0.029],
    ];
    voices.forEach(([freq, level, rate]) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = level * 0.7;
      const swell = ctx.createOscillator();
      swell.frequency.value = rate;
      const depth = ctx.createGain();
      depth.gain.value = level * 0.3;
      swell.connect(depth).connect(g.gain);
      osc.connect(g).connect(filter);
      osc.start();
      swell.start();
      nodes.push(osc, swell);
    });
    filter.connect(gain).connect(this.bus);
    gain.gain.setTargetAtTime(0.05, ctx.currentTime, 2.4);
    this.pad = { gain, filter, nodes };
  }

  /** A soft rush of air, silent until the page moves. */
  private startAir() {
    if (!this.ctx || !this.bus || this.air) return;
    const ctx = this.ctx;
    const length = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      // Brown noise: smooth and low, with no hiss
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 260;
    filter.Q.value = 0.3;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(filter).connect(gain).connect(this.bus);
    src.start();
    this.air = { gain, filter, src };
  }

  private stopLayers() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (this.pad) {
      this.pad.gain.gain.setTargetAtTime(0, t, 0.3);
      this.pad.nodes.forEach((n) => n.stop(t + 1.6));
      this.pad = null;
    }
    if (this.air) {
      this.air.gain.gain.setTargetAtTime(0, t, 0.2);
      this.air.src.stop(t + 1.2);
      this.air = null;
    }
  }

  /**
   * Called while the page scrolls. `speed` runs from 0 (still) to 1 (fast):
   * the air gets a little louder and brighter and the chord opens up, then both settle again.
   */
  scroll(speed: number) {
    if (!this.on || !this.ctx) return;
    const s = Math.min(1, Math.max(0, speed));
    const t = this.ctx.currentTime;
    if (this.air) {
      this.air.gain.gain.setTargetAtTime(s * 0.07, t, s > 0 ? 0.08 : 0.5);
      this.air.filter.frequency.setTargetAtTime(260 + s * 620, t, 0.15);
    }
    if (this.pad) this.pad.filter.frequency.setTargetAtTime(420 + s * 380, t, 0.3);
  }

  /** A quiet note as a new section arrives, a step up the scale each time. */
  chime(index: number) {
    const now = performance.now();
    if (now - this.lastChime < 500) return;
    this.lastChime = now;
    const f = SECTION_NOTES[((index % SECTION_NOTES.length) + SECTION_NOTES.length) % SECTION_NOTES.length];
    this.note(f, 2.2, 0.03);
    this.note(f * 1.5, 2.4, 0.012, 0.06);
  }

  /** One soft pure tone: a gentle start and a long fade. */
  private note(freq: number, dur: number, vol: number, delay = 0, attack = 0.03) {
    if (!this.on || !this.ctx || !this.bus) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.bus);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  hover() {
    const now = performance.now();
    if (now - this.lastHover < 110) return;
    this.lastHover = now;
    this.note(554.37, 0.28, 0.008, 0, 0.02);
  }
  click() {
    this.note(277.18, 0.5, 0.03, 0, 0.012);
  }
  open() {
    this.note(329.63, 0.9, 0.026);
    this.note(440, 1.1, 0.02, 0.09);
  }
  close() {
    this.note(440, 0.8, 0.02);
    this.note(329.63, 1.0, 0.024, 0.09);
  }
  step() {
    this.note(369.99, 0.6, 0.022);
  }
}

export const sound = new SoundEngine();

/**
 * Wires the page to the sound, once: soft taps on links and buttons, the air that
 * follows scrolling, and a note for each section as it reaches the middle of the screen.
 */
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

  // Scroll speed, smoothed, in screens per second
  let lastY = window.scrollY;
  let lastT = performance.now();
  let speed = 0;
  let rest = 0;
  const onScroll = () => {
    const now = performance.now();
    const dt = Math.max(8, now - lastT);
    const v = (Math.abs(window.scrollY - lastY) / dt) * 1000;
    lastY = window.scrollY;
    lastT = now;
    speed += (Math.min(1, v / (window.innerHeight * 2.2)) - speed) * 0.35;
    sound.scroll(speed);
    window.clearTimeout(rest);
    rest = window.setTimeout(() => {
      speed = 0;
      sound.scroll(0);
    }, 140);
  };

  const sections = Array.from(document.querySelectorAll('section[id]'));
  const middle = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) sound.chime(sections.indexOf(e.target));
      });
    },
    { rootMargin: '-49% 0px -49% 0px' },
  );
  sections.forEach((s) => middle.observe(s));

  document.addEventListener('pointerover', over, { passive: true });
  document.addEventListener('click', click, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    document.removeEventListener('pointerover', over);
    document.removeEventListener('click', click);
    window.removeEventListener('scroll', onScroll);
    window.clearTimeout(rest);
    middle.disconnect();
  };
}

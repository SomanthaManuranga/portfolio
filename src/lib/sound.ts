/**
 * Sound for the site, synthesised with the Web Audio API (no audio files).
 * Off by default: browsers only allow sound after a click, and nobody likes a page
 * that starts making noise by itself. The header button turns it on.
 *
 * The sound is a set of soft chimes, like a kalimba or a wind chime in a quiet room.
 * There is no continuous sound at all: no hum, no hiss. Scrolling plays notes up and
 * down a gentle scale, a rare single note drifts in while the page is still, and
 * buttons answer with one low note.
 */

type Listener = (on: boolean) => void;

/** G major pentatonic over two octaves: any order of these notes sounds calm together. */
const SCALE = [196.0, 220.0, 246.94, 293.66, 329.63, 392.0, 440.0, 493.88, 587.33, 659.25];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private listeners = new Set<Listener>();
  private idle = 0;
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

      // Notes go through a gentle filter (takes the edge off) and a soft room echo
      this.bus = ctx.createGain();
      const warm = ctx.createBiquadFilter();
      warm.type = 'lowpass';
      warm.frequency.value = 2600;
      warm.Q.value = 0.2;
      this.bus.connect(warm).connect(this.master);
      const room = ctx.createConvolver();
      room.buffer = this.tail(ctx, 3);
      const wet = ctx.createGain();
      wet.gain.value = 0.42;
      warm.connect(room).connect(wet).connect(this.master);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return true;
  }

  /** The room echo: a fading tail that only sounds while a note rings through it. */
  private tail(ctx: AudioContext, seconds: number) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.6);
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
      this.master.gain.setTargetAtTime(on ? 1 : 0, t, on ? 0.05 : 0.2);
    }
    window.clearTimeout(this.idle);
    if (on) {
      // A small rising phrase says "sound is on"
      this.chime(SCALE[2], 0.05);
      this.chime(SCALE[4], 0.045, 0.16);
      this.chime(SCALE[6], 0.04, 0.34);
      this.breathe();
    }
    this.listeners.forEach((fn) => fn(on));
  }

  /** Now and then, while the page is still, one quiet note. */
  private breathe() {
    this.idle = window.setTimeout(
      () => {
        if (!this.on) return;
        if (!document.hidden) {
          const i = Math.floor(Math.random() * SCALE.length);
          this.chime(SCALE[i], 0.018);
          if (Math.random() < 0.4) this.chime(SCALE[Math.min(SCALE.length - 1, i + 2)], 0.014, 0.35);
        }
        this.breathe();
      },
      8000 + Math.random() * 9000,
    );
  }

  /**
   * One chime: a pure note with two quieter overtones that fade faster, the way a
   * struck bar or tine sounds. A soft start avoids any click.
   */
  private chime(freq: number, vol: number, delay = 0, length = 1) {
    if (!this.on || !this.ctx || !this.bus) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const tune = 1 + (Math.random() - 0.5) * 0.004;
    const partials: [number, number, number][] = [
      // multiple of the note, level, seconds to fade
      [1, 1, 2.6 * length],
      [2, 0.2, 1.1 * length],
      [4.02, 0.07, 0.4 * length],
    ];
    for (const [ratio, level, fade] of partials) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * ratio * tune;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol * level, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + fade);
      osc.connect(g).connect(this.bus);
      osc.start(t);
      osc.stop(t + fade + 0.05);
    }
  }

  /** A note of the scale, played by scrolling. `strength` (0 to 1) is how fast the page is moving. */
  scrollNote(index: number, strength: number) {
    const i = Math.max(0, Math.min(SCALE.length - 1, index));
    this.chime(SCALE[i], 0.022 + Math.min(1, strength) * 0.028);
  }
  get notes() {
    return SCALE.length;
  }

  /** Hovering is silent on purpose: a calm page does not tick as the mouse moves. */
  hover() {}
  click() {
    this.chime(SCALE[0], 0.04, 0, 0.5);
  }
  open() {
    this.chime(SCALE[3], 0.04);
    this.chime(SCALE[5], 0.035, 0.12);
  }
  close() {
    this.chime(SCALE[5], 0.035);
    this.chime(SCALE[3], 0.04, 0.12);
  }
  step() {
    this.chime(SCALE[4], 0.035, 0, 0.6);
  }
}

export const sound = new SoundEngine();

/**
 * Wires the page to the sound, once: one low note on links and buttons, and chimes
 * that play as the page is scrolled, climbing on the way down and falling on the way up.
 */
export function bindUiSounds() {
  const pick = (t: EventTarget | null) => (t instanceof Element ? t.closest('a, button, [role="button"]') : null);
  const click = (e: MouseEvent) => {
    const el = pick(e.target);
    if (el && !el.hasAttribute('data-sound-toggle')) sound.click();
  };

  let lastY = window.scrollY;
  let lastT = performance.now();
  let lastNote = 0;
  let travelled = 0;
  let note = 3;
  const onScroll = () => {
    const now = performance.now();
    const dy = window.scrollY - lastY;
    const speed = Math.abs(dy) / Math.max(8, now - lastT);
    lastY = window.scrollY;
    lastT = now;
    travelled += Math.abs(dy);
    // A new note after a short stretch of scrolling, never faster than a gentle pace
    if (travelled < 170 || now - lastNote < 150 || !sound.on) return;
    travelled = 0;
    lastNote = now;
    const dir = dy >= 0 ? 1 : -1;
    const stride = Math.random() < 0.7 ? 1 : 2;
    note += Math.random() < 0.82 ? dir * stride : -dir;
    // At either end of the scale, fold back by half an octave and carry on
    if (note >= sound.notes) note -= 4;
    if (note < 0) note += 4;
    sound.scrollNote(note, speed / 2.5);
  };

  document.addEventListener('click', click, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    document.removeEventListener('click', click);
    window.removeEventListener('scroll', onScroll);
  };
}

/**
 * Sound for the site, synthesised with the Web Audio API (no audio files).
 * Off by default: browsers only allow sound after a click, and nobody likes a page
 * that starts making noise by itself. The header button turns it on.
 *
 * The sound is a calm outdoor scene made only from filtered noise, the way wind and
 * water are: a slow swell like wind moving through trees, a small stream, and a
 * breeze that rises while the page is scrolled. There are no musical tones or hums.
 */

type Listener = (on: boolean) => void;

type Layer = { gain: GainNode; filter: BiquadFilterNode; nodes: AudioScheduledSourceNode[] };

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private pink: AudioBuffer | null = null;
  private white: AudioBuffer | null = null;
  private trees: Layer | null = null;
  private stream: Layer | null = null;
  private breeze: Layer | null = null;
  private listeners = new Set<Listener>();
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

      // A little room around everything, so nothing sounds close and dry
      this.bus = ctx.createGain();
      this.bus.connect(this.master);
      const room = ctx.createConvolver();
      room.buffer = this.tail(ctx, 2.4);
      const wet = ctx.createGain();
      wet.gain.value = 0.22;
      this.bus.connect(room).connect(wet).connect(this.master);

      this.white = this.noise(ctx, 5, false);
      this.pink = this.noise(ctx, 7, true);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return true;
  }

  /** Noise to shape into wind and water. Pink noise is the softer, more natural-sounding kind. */
  private noise(ctx: AudioContext, seconds: number, pink: boolean) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const data = new Float32Array(length);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1;
      if (!pink) {
        data[i] = w;
        continue;
      }
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
    // Fade the ends into each other so the loop has no click
    const fade = Math.floor(ctx.sampleRate * 0.25);
    for (let i = 0; i < fade; i++) {
      const k = i / fade;
      data[i] = data[i] * k + data[length - fade + i] * (1 - k);
    }
    const out = ctx.createBuffer(1, length - fade, ctx.sampleRate);
    out.getChannelData(0).set(data.subarray(0, length - fade));
    return out;
  }

  /** A short reverb tail made from fading noise. */
  private tail(ctx: AudioContext, seconds: number) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.4);
    }
    return buffer;
  }

  private source(buffer: AudioBuffer, offset = 0) {
    const src = this.ctx!.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.start(0, offset);
    return src;
  }

  /** A slow wave that moves a parameter up and down, e.g. once every 12 seconds. */
  private drift(target: AudioParam, rate: number, depth: number) {
    const osc = this.ctx!.createOscillator();
    osc.frequency.value = rate;
    const g = this.ctx!.createGain();
    g.gain.value = depth;
    osc.connect(g).connect(target);
    osc.start();
    return osc;
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
      this.master.gain.setTargetAtTime(on ? 1 : 0, t, on ? 0.9 : 0.2);
      if (on) this.start();
      else this.stop();
    }
    this.listeners.forEach((fn) => fn(on));
  }

  private start() {
    if (!this.ctx || !this.bus || !this.pink || !this.white || this.trees) return;
    const ctx = this.ctx;

    // Wind in the trees: low, soft, rising and falling over many seconds
    {
      const src = this.source(this.pink);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 620;
      filter.Q.value = 0.3;
      const gain = ctx.createGain();
      gain.gain.value = 0.2;
      src.connect(filter).connect(gain).connect(this.bus);
      const a = this.drift(gain.gain, 0.083, 0.09);
      const b = this.drift(gain.gain, 0.031, 0.05);
      const c = this.drift(filter.frequency, 0.057, 210);
      this.trees = { gain, filter, nodes: [src, a, b, c] };
    }

    // A small stream: a steady soft rush, plus a narrower band that wanders to give the trickle
    {
      const src = this.source(this.pink, 2.5);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      filter.Q.value = 0.55;
      const gain = ctx.createGain();
      gain.gain.value = 0.085;
      src.connect(filter).connect(gain).connect(this.bus);

      const src2 = this.source(this.white, 1.1);
      const trickle = ctx.createBiquadFilter();
      trickle.type = 'bandpass';
      trickle.frequency.value = 2300;
      trickle.Q.value = 5;
      const tg = ctx.createGain();
      tg.gain.value = 0.012;
      src2.connect(trickle).connect(tg).connect(gain);
      const a = this.drift(trickle.frequency, 3.3, 420);
      const b = this.drift(trickle.frequency, 5.9, 260);
      const c = this.drift(tg.gain, 0.9, 0.005);
      this.stream = { gain, filter, nodes: [src, src2, a, b, c] };
    }

    // The breeze that follows scrolling: silent until the page moves
    {
      const src = this.source(this.pink, 4.2);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 520;
      filter.Q.value = 0.5;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      src.connect(filter).connect(gain).connect(this.bus);
      this.breeze = { gain, filter, nodes: [src] };
    }
  }

  private stop() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const layer of [this.trees, this.stream, this.breeze]) {
      if (!layer) continue;
      layer.gain.gain.cancelScheduledValues(t);
      layer.gain.gain.setTargetAtTime(0, t, 0.25);
      layer.nodes.forEach((n) => n.stop(t + 1.5));
    }
    this.trees = this.stream = this.breeze = null;
  }

  /**
   * Called while the page scrolls. `speed` runs from 0 (still) to 1 (fast):
   * a breeze picks up and the stream brightens a little, then both settle again.
   */
  scroll(speed: number) {
    if (!this.on || !this.ctx) return;
    const s = Math.min(1, Math.max(0, speed));
    const t = this.ctx.currentTime;
    if (this.breeze) {
      this.breeze.gain.gain.setTargetAtTime(s * 0.34, t, s > 0 ? 0.25 : 0.9);
      this.breeze.filter.frequency.setTargetAtTime(520 + s * 520, t, 0.4);
    }
    if (this.stream) this.stream.filter.frequency.setTargetAtTime(1500 + s * 500, t, 0.5);
  }

  /** A short soft puff of filtered noise: a tap, a pebble, a gust. Never a beep. */
  private puff(freq: number, to: number, dur: number, vol: number, q = 1.2) {
    if (!this.on || !this.ctx || !this.bus || !this.pink) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.pink;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = q;
    filter.frequency.setValueAtTime(freq, t);
    filter.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.06, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(this.bus);
    src.start(t, Math.random() * 3);
    src.stop(t + dur + 0.05);
  }

  /** Hovering is silent on purpose: a calm page does not tick as the mouse moves. */
  hover() {}
  click() {
    this.puff(900, 420, 0.16, 0.5, 2.2);
  }
  open() {
    this.puff(380, 1300, 0.6, 0.45);
  }
  close() {
    this.puff(1300, 380, 0.55, 0.4);
  }
  step() {
    this.puff(700, 900, 0.3, 0.3);
  }
}

export const sound = new SoundEngine();

/**
 * Wires the page to the sound, once: soft taps on links and buttons, and the breeze
 * that follows how fast the page is scrolled.
 */
export function bindUiSounds() {
  const pick = (t: EventTarget | null) => (t instanceof Element ? t.closest('a, button, [role="button"]') : null);
  const click = (e: MouseEvent) => {
    const el = pick(e.target);
    if (el && !el.hasAttribute('data-sound-toggle')) sound.click();
  };

  // Scroll speed, smoothed
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
    speed += (Math.min(1, v / (window.innerHeight * 2.2)) - speed) * 0.3;
    sound.scroll(speed);
    window.clearTimeout(rest);
    rest = window.setTimeout(() => {
      speed = 0;
      sound.scroll(0);
    }, 160);
  };

  document.addEventListener('click', click, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    document.removeEventListener('click', click);
    window.removeEventListener('scroll', onScroll);
    window.clearTimeout(rest);
  };
}

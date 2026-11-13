/**
 * Small animated SVG illustrations for project cards.
 * Pure SVG + CSS animation (no canvas), coloured with the card's --accent.
 */

function Attention() {
  // Attention matrix with a "trigger" column being suppressed, and a shield.
  const n = 9;
  const cells = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const base = Math.max(0.08, 1 - Math.abs(r - c) / 5);
      const trigger = c === 6;
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={20 + c * 15}
          y={14 + r * 13}
          width={13}
          height={11}
          rx={2}
          className={trigger ? 'pv-trigger' : 'pv-cell'}
          style={{ opacity: base * 0.85, animationDelay: `${((r * n + c) % 17) * 0.12}s` }}
        />,
      );
    }
  }
  return (
    <svg viewBox="0 0 320 140" className="pv">
      {cells}
      <text x="20" y="134" className="pv-label">attention · layer 24</text>
      <g transform="translate(222 30)">
        <path d="M40 0 L76 12 V44 C76 66 60 80 40 88 C20 80 4 66 4 44 V12 Z" className="pv-shield" />
        <path d="M24 44 L36 56 L58 32" className="pv-check" />
      </g>
      <text x="206" y="134" className="pv-label">ASR 95% → 1.7%</text>
    </svg>
  );
}

function GradCam() {
  return (
    <svg viewBox="0 0 320 140" className="pv">
      <defs>
        <radialGradient id="cam" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.7" />
          <stop offset="75%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* ribcage */}
      <g className="pv-xray">
        <path d="M160 18 V122" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            <path d={`M156 ${30 + i * 14} C130 ${26 + i * 14} 104 ${36 + i * 15} 96 ${54 + i * 14}`} />
            <path d={`M164 ${30 + i * 14} C190 ${26 + i * 14} 216 ${36 + i * 15} 224 ${54 + i * 14}`} />
          </g>
        ))}
        <ellipse cx="128" cy="76" rx="30" ry="46" />
        <ellipse cx="192" cy="76" rx="30" ry="46" />
      </g>
      <ellipse cx="198" cy="88" rx="34" ry="30" fill="url(#cam)" className="pv-heat" />
      <ellipse cx="124" cy="64" rx="18" ry="16" fill="url(#cam)" className="pv-heat d2" />
      <text x="16" y="24" className="pv-label">Grad-CAM</text>
      <text x="236" y="24" className="pv-label">94.9% acc</text>
    </svg>
  );
}

function Detection() {
  const boxes = [
    { x: 58, y: 40, w: 30, h: 26, c: '0.91' },
    { x: 150, y: 70, w: 22, h: 20, c: '0.84' },
    { x: 214, y: 32, w: 38, h: 32, c: '0.97' },
  ];
  return (
    <svg viewBox="0 0 320 140" className="pv">
      <defs>
        <radialGradient id="wheel" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.04" />
        </radialGradient>
      </defs>
      <rect x="8" y="8" width="304" height="124" rx="10" fill="url(#wheel)" />
      {Array.from({ length: 34 }).map((_, i) => (
        <circle key={i} cx={(i * 97) % 300 + 10} cy={(i * 53) % 116 + 12} r={(i % 3) + 1} className="pv-pore" />
      ))}
      <rect x="0" y="0" width="320" height="4" className="pv-scan" />
      {boxes.map((b, i) => (
        <g key={i} className="pv-box" style={{ animationDelay: `${i * 0.6}s` }}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="2" />
          <rect x={b.x} y={b.y - 12} width="52" height="11" rx="2" className="pv-tag" />
          <text x={b.x + 3} y={b.y - 3.5} className="pv-tagtext">
            defect {b.c}
          </text>
        </g>
      ))}
      <text x="16" y="128" className="pv-label">YOLOv8n · ONNX 60 ms</text>
    </svg>
  );
}

function Circuit() {
  const wires = [32, 60, 88, 116];
  return (
    <svg viewBox="0 0 320 140" className="pv">
      {wires.map((y, i) => (
        <g key={y}>
          <text x="8" y={y + 4} className="pv-label">
            q{i}
          </text>
          <line x1="28" y1={y} x2="312" y2={y} className="pv-wire" />
        </g>
      ))}
      {[
        [60, 32, 'H'],
        [60, 88, 'H'],
        [150, 60, 'RZ'],
        [236, 116, 'X'],
        [270, 32, 'T'],
      ].map(([x, y, g]) => (
        <g key={`${x}-${y}`}>
          <rect x={(x as number) - 13} y={(y as number) - 11} width="26" height="22" rx="4" className="pv-gate" />
          <text x={x as number} y={(y as number) + 4} textAnchor="middle" className="pv-gatetext">
            {g}
          </text>
        </g>
      ))}
      {/* CNOT */}
      <line x1="108" y1="32" x2="108" y2="116" className="pv-ctrl" />
      <circle cx="108" cy="32" r="4" className="pv-dot" />
      <circle cx="108" cy="116" r="9" className="pv-target" />
      <line x1="108" y1="107" x2="108" y2="125" className="pv-ctrl" />
      <line x1="196" y1="60" x2="196" y2="88" className="pv-ctrl" />
      <circle cx="196" cy="60" r="4" className="pv-dot" />
      <circle cx="196" cy="88" r="9" className="pv-target" />
      {wires.map((y, i) => (
        <circle key={`p${y}`} cx="28" cy={y} r="3.5" className="pv-pulse" style={{ animationDelay: `${i * 0.35}s` }} />
      ))}
    </svg>
  );
}

function Airfoil() {
  const lines = [22, 38, 54, 86, 102, 118];
  return (
    <svg viewBox="0 0 320 140" className="pv">
      {lines.map((y, i) => {
        const bend = y < 70 ? -(70 - y) * 0.0 - 18 + (70 - y) * 0.25 : 14 - (y - 70) * 0.2;
        return (
          <path
            key={y}
            d={`M0 ${y} C 90 ${y} 120 ${y + bend} 170 ${y + bend} S 260 ${y} 320 ${y}`}
            className="pv-stream"
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        );
      })}
      <path d="M88 72 C 110 52, 170 50, 238 68 C 170 76, 120 82, 88 72 Z" className="pv-foil" />
      <text x="16" y="134" className="pv-label">NACA 4412 · Cd 1.125 vs 1.121</text>
      <text x="246" y="20" className="pv-label">CNN ≈ CFD</text>
    </svg>
  );
}

function Document() {
  // A scanned form: text lines, with question / answer fields picked out
  const lines = [28, 40, 52, 76, 88, 112];
  return (
    <svg viewBox="0 0 320 140" className="pv">
      <rect x="92" y="12" width="136" height="118" rx="4" className="pv-fill-soft" />
      {lines.map((y, i) => (
        <line key={y} x1="104" y1={y} x2={i % 2 ? 190 : 214} y2={y} className="pv-line" />
      ))}
      <g className="pv-box" style={{ animationDelay: '0s' }}>
        <rect x="102" y="58" width="50" height="12" rx="2" />
        <rect x="102" y="45" width="46" height="11" rx="2" className="pv-tag" />
        <text x="105" y="54" className="pv-tagtext">question</text>
      </g>
      <g className="pv-box" style={{ animationDelay: '0.7s' }}>
        <rect x="158" y="58" width="58" height="12" rx="2" />
        <rect x="158" y="45" width="37" height="11" rx="2" className="pv-tag" />
        <text x="161" y="54" className="pv-tagtext">answer</text>
      </g>
      <g className="pv-box" style={{ animationDelay: '1.4s' }}>
        <rect x="102" y="96" width="112" height="12" rx="2" />
      </g>
      <text x="16" y="130" className="pv-label">F1 0.896</text>
      <text x="246" y="130" className="pv-label">key → value</text>
    </svg>
  );
}

function Segmentation() {
  // Condition-state mask over a steel surface
  return (
    <svg viewBox="0 0 320 140" className="pv">
      <rect x="20" y="16" width="280" height="100" rx="6" className="pv-fill-soft" />
      {[36, 56, 76, 96].map((y) => (
        <line key={y} x1="20" y1={y} x2="300" y2={y} className="pv-line" style={{ opacity: 0.4 }} />
      ))}
      <path d="M58 30 C 96 20, 132 34, 126 62 C 120 92, 74 100, 54 78 C 40 62, 40 38, 58 30 Z" className="pv-fill-accent pv-fade" style={{ opacity: 0.35 }} />
      <path d="M170 44 C 204 30, 250 40, 262 68 C 272 94, 222 108, 190 96 C 162 86, 150 56, 170 44 Z" className="pv-fill-accent" style={{ opacity: 0.22 }} />
      <path d="M206 58 C 222 52, 240 60, 240 74 C 240 88, 216 92, 204 82 C 196 74, 196 62, 206 58 Z" className="pv-accent-line" />
      <text x="20" y="132" className="pv-label">fair · poor · severe</text>
      <text x="238" y="132" className="pv-label">mIoU 0.523</text>
    </svg>
  );
}

function Maze() {
  // Occupancy grid with a planned route drawn through it
  const walls = ['M40 20 H280 V120 H40 Z', 'M40 54 H120', 'M160 20 V70', 'M120 86 H220', 'M220 54 V120', 'M80 86 V120', 'M200 54 H250'];
  return (
    <svg viewBox="0 0 320 140" className="pv">
      {walls.map((d) => (
        <path key={d} d={d} className="pv-line" />
      ))}
      <path d="M58 104 V70 H140 V38 H190 V70 H236 V38 H262" className="pv-accent-line pv-draw" pathLength={600} />
      <circle cx="58" cy="104" r="5" className="pv-node" />
      <circle cx="262" cy="38" r="5" className="pv-fill-accent" />
      <text x="40" y="134" className="pv-label">A* route on the occupancy grid</text>
    </svg>
  );
}

function Bars() {
  const hs = [34, 52, 44, 70, 58, 88, 64, 76, 96];
  return (
    <svg viewBox="0 0 320 140" className="pv">
      <line x1="34" y1="114" x2="290" y2="114" className="pv-line" />
      {hs.map((h, i) => (
        <rect key={i} x={44 + i * 27} y={114 - h} width="16" height={h} rx="2" className={`pv-bar ${i === hs.length - 1 ? 'hi' : ''}`} style={{ animationDelay: `${i * 0.08}s` }} />
      ))}
      <text x="34" y="132" className="pv-label">model comparison</text>
    </svg>
  );
}

function Scatter() {
  // Falling trend with a fitted line
  const pts = Array.from({ length: 34 }, (_, i) => {
    const x = 40 + ((i * 53) % 240);
    const y = 28 + (x - 40) * 0.3 + (((i * 37) % 30) - 15);
    return [x, y];
  });
  return (
    <svg viewBox="0 0 320 140" className="pv">
      <path d="M34 16 V116 H292" className="pv-line" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.6" fill="rgba(255,255,255,0.45)" />
      ))}
      <path d="M40 28 L282 102" className="pv-accent-line pv-draw" pathLength={600} />
      <text x="34" y="132" className="pv-label">usage ↑ sleep ↓ · r = −0.79</text>
    </svg>
  );
}

function Signal() {
  // Noisy sensor readings and the filtered result
  const noisy = Array.from({ length: 49 }, (_, i) => {
    const x = 28 + i * 5.5;
    const y = 70 + Math.sin(i * 0.22) * 6 + (((i * 29) % 23) - 11) * (i === 30 ? 3 : 1);
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  const clean = Array.from({ length: 49 }, (_, i) => `${i ? 'L' : 'M'}${(28 + i * 5.5).toFixed(1)} ${(70 + Math.sin(i * 0.22) * 6).toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 320 140" className="pv">
      <line x1="28" y1="70" x2="292" y2="70" className="pv-line" style={{ opacity: 0.35 }} />
      <path d={noisy} className="pv-line" />
      <path d={clean} className="pv-accent-line pv-draw" pathLength={600} />
      <text x="28" y="130" className="pv-label">raw readings → filtered</text>
    </svg>
  );
}

function Printer() {
  // CoreXY gantry seen from above, with printed layers
  return (
    <svg viewBox="0 0 320 140" className="pv">
      <rect x="70" y="16" width="180" height="104" rx="6" className="pv-fill-soft" />
      <path d="M70 16 L250 120 M250 16 L70 120" className="pv-line" style={{ opacity: 0.45 }} />
      {[84, 92, 100].map((y, i) => (
        <path key={y} d={`M118 ${y} H202`} className="pv-accent-line pv-draw" pathLength={600} style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
      <line x1="70" y1="58" x2="250" y2="58" className="pv-line" />
      <rect x="150" y="48" width="20" height="20" rx="3" className="pv-gate" />
      <circle cx="70" cy="16" r="5" className="pv-node" />
      <circle cx="250" cy="16" r="5" className="pv-node" />
      <text x="70" y="134" className="pv-label">CoreXY kinematics</text>
    </svg>
  );
}

function Dashboard() {
  const hs = [18, 30, 24, 38, 46];
  return (
    <svg viewBox="0 0 320 140" className="pv">
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={24 + i * 94} y="16" width="84" height="38" rx="5" className="pv-fill-soft" />
          <line x1={34 + i * 94} y1="30" x2={66 + i * 94} y2="30" className="pv-line" />
          <rect x={34 + i * 94} y="38" width={30 + i * 10} height="6" rx="3" className="pv-fill-accent" />
        </g>
      ))}
      <rect x="24" y="62" width="130" height="62" rx="5" className="pv-fill-soft" />
      {hs.map((h, i) => (
        <rect key={i} x={38 + i * 22} y={116 - h} width="12" height={h} rx="2" className={`pv-bar ${i === 4 ? 'hi' : ''}`} style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
      <rect x="162" y="62" width="134" height="62" rx="5" className="pv-fill-soft" />
      <path d="M174 108 L198 94 L222 100 L246 80 L284 72" className="pv-accent-line pv-draw" pathLength={600} />
    </svg>
  );
}

function Network() {
  const layers = [3, 5, 5, 2];
  const nodes = layers.flatMap((n, l) =>
    Array.from({ length: n }, (_, i) => ({ x: 50 + l * 74, y: 70 + (i - (n - 1) / 2) * 22, l })),
  );
  const edges = [];
  for (const a of nodes) for (const b of nodes) if (b.l === a.l + 1) edges.push([a, b]);
  return (
    <svg viewBox="0 0 320 140" className="pv">
      {edges.map(([a, b], i) => (
        <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="pv-edge" style={{ animationDelay: `${(i % 9) * 0.2}s` }} />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="5" className="pv-node" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </svg>
  );
}

const map: Record<string, () => JSX.Element> = {
  'llm-backdoor-defense': Attention,
  'pneumonia-cnn-vit': GradCam,
  'xray-casting-defects': Detection,
  'quantum-circuit-dataset': Circuit,
  'cnn-drag-prediction': Airfoil,
  'layoutlmv3-funsd': Document,
  'corrosion-segmentation': Segmentation,
  'rosbot-maze': Maze,
  'alia-digital-twin': Maze,
  'ml-challenge': Bars,
  'study-program-intelligence': Bars,
  'social-media-eda': Scatter,
  'ir-thermometer': Signal,
  'corexy-printer': Printer,
  'production-analytics-dashboard': Dashboard,
};

/** The illustration always sits on the dark panel colour, whatever the page theme. */
export default function ProjectVisual({ slug, className = '' }: { slug: string; className?: string }) {
  const V = map[slug] ?? Network;
  return (
    <div className={`pv-wrap dark-panel ${className}`} aria-hidden>
      <V />
    </div>
  );
}

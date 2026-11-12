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
};

export default function ProjectVisual({ slug }: { slug: string }) {
  const V = map[slug] ?? Network;
  return (
    <div className="pv-wrap" aria-hidden>
      <V />
    </div>
  );
}

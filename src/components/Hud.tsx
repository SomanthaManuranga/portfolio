import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/** Floating glass read-outs around the 3D core, built from real project results. */
const panels = [
  { k: 'llm.backdoor.asr', v: '95% → 1.7%', note: 'hybrid SFT · Qwen2.5', pos: 'p1' },
  { k: 'vision.xray.mAP50', v: '0.545', note: 'YOLOv8n · ONNX 60 ms', pos: 'p2' },
  { k: 'vision.cxr.accuracy', v: '94.9%', note: 'TinyViT · Grad-CAM', pos: 'p3' },
  { k: 'surrogate.cfd.err', v: '0.06%', note: 'best case · CNN drag', pos: 'p4' },
];

function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      {t.toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', second: '2-digit' })} · Amberg, DE
    </>
  );
}

export default function Hud() {
  return (
    <div className="hud" aria-hidden>
      {panels.map((p, i) => (
        <motion.div
          key={p.k}
          className={`hud-panel glass ${p.pos}`}
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 1.1 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="hud-key">{p.k}</span>
          <strong>{p.v}</strong>
          <span className="hud-note">{p.note}</span>
        </motion.div>
      ))}
      <motion.div
        className="hud-status"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
      >
        <span className="status-dot" /> neural_core: online · <Clock />
      </motion.div>
    </div>
  );
}

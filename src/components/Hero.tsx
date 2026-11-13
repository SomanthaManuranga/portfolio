import { motion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import { profile } from '../data/content';
import { asset } from './ui';

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [first, ...rest] = profile.name.split(' ');
  const last = rest.join(' ');

  return (
    <section className="hero" id="top">
      <div className="container">
        <motion.div
          className="hero-eyebrow label"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
        >
          <span className="status-dot" /> {profile.availability}
        </motion.div>

        <h1 className="hero-title">
          <span className="line">
            <motion.span initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.1, ease }}>
              {first}
            </motion.span>
          </span>
          <span className="line">
            <motion.span initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.2, ease }}>
              {last}
            </motion.span>
          </span>
        </h1>

        <motion.div
          className="hero-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease }}
        >
          <p className="hero-tagline">
            <b>{profile.role}.</b> {profile.tagline}
          </p>
          <div className="hero-ctas">
            <a
              href="#projects"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('projects');
              }}
            >
              View work <ArrowRight />
            </a>
            <a href={asset(profile.cv)} target="_blank" rel="noopener" className="btn">
              Download CV <Download />
            </a>
          </div>
        </motion.div>

        <motion.div
          className="hero-focus label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          {profile.rotatingRoles.map((r) => (
            <span key={r}>{r}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

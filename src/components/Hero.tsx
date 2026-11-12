import { motion } from 'framer-motion';
import { ArrowDownRight, Download, Mail, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { profile } from '../data/content';
import { asset, GithubIcon, LinkedinIcon, Magnetic } from './ui';
import Hud from './Hud';

const ease = [0.22, 1, 0.36, 1] as const;

function RoleTyper() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = profile.rotatingRoles[idx];
    const done = !deleting && text === word;
    const empty = deleting && text === '';
    const delay = done ? 1800 : empty ? 250 : deleting ? 35 : 70;
    const t = setTimeout(() => {
      if (done) setDeleting(true);
      else if (empty) {
        setDeleting(false);
        setIdx((i) => (i + 1) % profile.rotatingRoles.length);
      } else setText(word.slice(0, text.length + (deleting ? -1 : 1)));
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, idx]);

  return (
    <span className="role-word" aria-hidden>
      {text}
      <span className="caret" />
    </span>
  );
}

export default function Hero({ onNavigate }: { onNavigate: (id: string) => void }) {
  const first = profile.name.split(' ')[0];
  const last = profile.name.split(' ').slice(1).join(' ');

  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div>
          <motion.div
            className="status-pill glass"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <span className="status-dot" /> {profile.availability}
          </motion.div>

          <h1 className="hero-title">
            <span className="line">
              <motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.1, ease }}>
                {first}
              </motion.span>
            </span>
            <span className="line">
              <motion.span
                className="grad-text"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.22, ease }}
              >
                {last}
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="hero-role"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span>{profile.role}</span>
            <span aria-hidden>/</span>
            <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
              {profile.rotatingRoles.join(', ')}
            </span>
            <RoleTyper />
          </motion.p>

          <motion.p
            className="hero-tagline"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease }}
          >
            {profile.tagline}
          </motion.p>

          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease }}
          >
            <Magnetic>
            <a
              href="#projects"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('projects');
              }}
            >
              Explore projects <ArrowDownRight />
            </a>
            </Magnetic>
            <Magnetic>
              <a href={asset(profile.cv)} target="_blank" rel="noopener" className="btn btn-ghost">
                <Download /> Download CV
              </a>
            </Magnetic>
          </motion.div>

          <motion.div
            className="hero-meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.05 }}
          >
            <span>
              <MapPin /> {profile.location}
            </span>
            <div className="hero-socials">
              <a className="icon-btn" href={profile.github} target="_blank" rel="noopener" aria-label="GitHub">
                <GithubIcon />
              </a>
              <a className="icon-btn" href={profile.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">
                <LinkedinIcon />
              </a>
              <a className="icon-btn" href={`mailto:${profile.email}`} aria-label="Email">
                <Mail />
              </a>
            </div>
          </motion.div>
        </div>
        <Hud />
      </div>

      <div className="scroll-cue" aria-hidden>
        <span className="mouse" />
        SCROLL
      </div>
    </section>
  );
}

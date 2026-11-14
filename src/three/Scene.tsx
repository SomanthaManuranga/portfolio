import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { sceneState } from '../lib/scroll';
import Cell from './Cell';
import { input, useInputListeners } from './shared';

/**
 * The hero panel's 3D scene: the inspection cell (see Cell.tsx) with its lights,
 * reflections and a little dust in the air. It only renders while the hero is on screen.
 */

/** Soft studio reflections, so the metal parts and the glossy arm read as what they are. */
function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = Math.random() * 9 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.006;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#dfe3ff" size={0.026} sizeAttenuation transparent opacity={0.3} depthWrite={false} />
    </points>
  );
}

/**
 * Lights: a key light that casts the shadows, a cool rim from the left, a warm rim
 * from the right (it matches the glow on the stage), and a small one that follows the cursor.
 */
function Lights({ shadows }: { shadows: boolean }) {
  const follow = useRef<THREE.PointLight>(null!);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const tx = input.hasPointer ? input.mx * 7 : Math.cos(t * 0.35) * 4;
    const ty = input.hasPointer ? 3 + input.my * 1.6 : 3 + Math.sin(t * 0.5) * 0.8;
    follow.current.position.x = THREE.MathUtils.damp(follow.current.position.x, tx, 3, dt);
    follow.current.position.y = THREE.MathUtils.damp(follow.current.position.y, ty, 3, dt);
  });
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[5, 9, 8]}
        intensity={2.0}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.05}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={9.5}
        shadow-camera-bottom={-9.5}
        shadow-camera-near={1}
        shadow-camera-far={40}
      />
      <directionalLight position={[-7, 3, 6]} intensity={0.5} />
      <directionalLight position={[-6, 5, -6]} intensity={2.0} color="#8fa2ff" />
      <directionalLight position={[9, 2.5, -5]} intensity={1.3} color="#ff9a5c" />
      <pointLight ref={follow} position={[2, 3, 4.5]} color="#ffffff" intensity={18} distance={16} decay={2} />
    </>
  );
}

/** Render only while the hero is on screen and nothing covers the page. */
function Ticker({ settleOnly }: { settleOnly: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    const started = performance.now();
    const loop = () => {
      // With reduced motion the scene runs for a few seconds so it is set up, then stays still
      if (settleOnly && performance.now() - started > 5000) return;
      raf = requestAnimationFrame(loop);
      if (document.hidden || sceneState.paused) return;
      if (window.scrollY > window.innerHeight * 1.15) return;
      invalidate();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [invalidate, settleOnly]);
  return null;
}

export default function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  useInputListeners();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 820;
  const lowPower = mobile || (navigator.hardwareConcurrency ?? 8) <= 4;

  return (
    <Canvas
      className="scene-canvas"
      dpr={[1, lowPower ? 1.5 : 1.8]}
      camera={{ position: [0, 6, 13], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      shadows={!lowPower}
      flat
      frameloop="demand"
      aria-hidden
    >
      <Ticker settleOnly={reducedMotion} />
      <Environment />
      <Lights shadows={!lowPower} />
      <Cell lowPower={lowPower} />
      <Dust count={lowPower ? 140 : 340} />
    </Canvas>
  );
}

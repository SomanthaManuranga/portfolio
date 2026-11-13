import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { sceneState } from '../lib/scroll';

/**
 * One calm scene for the whole page: a dark machined gimbal (three rings around a
 * faceted core) lit by a single light that follows the pointer. Scrolling turns the
 * rings and moves the object from the hero to the edge of the page and back to the
 * centre for the contact section.
 */

const input = { mx: 0.35, my: -0.2, hasPointer: false, hero: 0, page: 0 };

function useInputListeners() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      input.hasPointer = true;
      input.mx = (e.clientX / window.innerWidth) * 2 - 1;
      input.my = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      input.page = window.scrollY / max;
      input.hero = Math.min(1, window.scrollY / window.innerHeight);
    };
    onScroll();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
}

/** Soft studio reflections so the dark metal reads as metal. */
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

function Gimbal({ segments }: { segments: number }) {
  const rings = useRef<THREE.Mesh[]>([]);
  const core = useRef<THREE.Mesh>(null!);
  const nodes = useRef<THREE.InstancedMesh>(null!);

  const metal = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2b2f35', metalness: 0.9, roughness: 0.28, envMapIntensity: 0.95 }),
    [],
  );
  const coreMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1b1e22', metalness: 0.8, roughness: 0.2, envMapIntensity: 1.0, flatShading: true }),
    [],
  );
  const nodeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2a2d33', metalness: 0.8, roughness: 0.4, emissive: '#7fd6cb', emissiveIntensity: 0.0 }),
    [],
  );

  const ringDefs = useMemo(
    () => [
      { r: 1.5, tube: 0.062, tilt: [0.5, 0.2, 0] as const, speed: 0.11 },
      { r: 1.95, tube: 0.05, tilt: [1.25, -0.4, 0.3] as const, speed: -0.075 },
      { r: 2.42, tube: 0.04, tilt: [-0.35, 0.9, 0.6] as const, speed: 0.05 },
    ],
    [],
  );

  // Small machined studs around the outer ring, like an encoder wheel
  const NODE_COUNT = 60;
  useEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    for (let i = 0; i < NODE_COUNT; i++) {
      const a = (i / NODE_COUNT) * Math.PI * 2;
      const long = i % 5 === 0;
      q.setFromEuler(new THREE.Euler(0, 0, a));
      s.set(long ? 0.18 : 0.08, 0.024, 0.024);
      m.compose(new THREE.Vector3(Math.cos(a) * 2.95, Math.sin(a) * 2.95, 0), q, s);
      nodes.current.setMatrixAt(i, m);
    }
    nodes.current.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const scrollTurn = input.page * Math.PI * 2.2;
    ringDefs.forEach((d, i) => {
      const ring = rings.current[i];
      if (!ring) return;
      ring.rotation.x = d.tilt[0] + t * d.speed + scrollTurn * (i % 2 ? -0.6 : 0.8);
      ring.rotation.y = d.tilt[1] + t * d.speed * 0.7 + scrollTurn * 0.4;
      ring.rotation.z = d.tilt[2];
    });
    core.current.rotation.y += dt * 0.12;
    core.current.rotation.x = 0.4 + Math.sin(t * 0.25) * 0.15;
    nodes.current.rotation.z = t * 0.03 - scrollTurn * 0.25;
  });

  return (
    <group>
      <mesh ref={core} material={coreMat}>
        <icosahedronGeometry args={[0.72, 1]} />
      </mesh>
      {ringDefs.map((d, i) => (
        <mesh key={i} ref={(m) => { if (m) rings.current[i] = m; }} material={metal}>
          <torusGeometry args={[d.r, d.tube, 4, segments]} />
        </mesh>
      ))}
      <instancedMesh ref={nodes} args={[undefined, undefined, NODE_COUNT]} material={nodeMat} rotation={[1.15, 0.25, 0]}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.006;
    ref.current.position.y = input.page * 1.5;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#cfd3d6" size={0.022} sizeAttenuation transparent opacity={0.45} depthWrite={false} />
    </points>
  );
}

/** The single key light. Follows the mouse; on touch devices it drifts on its own. */
function PointerLight() {
  const light = useRef<THREE.PointLight>(null!);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const tx = input.hasPointer ? input.mx * 5.2 : Math.cos(t * 0.35) * 3.2;
    const ty = input.hasPointer ? input.my * 3.0 : Math.sin(t * 0.5) * 1.8;
    light.current.position.x = THREE.MathUtils.damp(light.current.position.x, tx, 3, dt);
    light.current.position.y = THREE.MathUtils.damp(light.current.position.y, ty, 3, dt);
  });
  return <pointLight ref={light} position={[2, 1, 3.4]} color="#fff3e2" intensity={85} distance={16} decay={2} />;
}

function Rig({ mobile, children }: { mobile: boolean; children: ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const { camera } = useThree();

  useFrame((_, dt) => {
    const h = input.hero;
    // 0 in the hero, 1 through the middle of the page, back towards 0 at the very end (contact)
    const end = THREE.MathUtils.smoothstep(input.page, 0.9, 1);
    const away = h * (1 - end);

    const x = mobile ? THREE.MathUtils.lerp(0, 1.5, away) : THREE.MathUtils.lerp(3.05, 4.9, away);
    const y = mobile ? THREE.MathUtils.lerp(1.85, 2.5, away) : THREE.MathUtils.lerp(0.55, 0.6, away) - end * 0.5;
    const s = (mobile ? 0.62 : 1) * THREE.MathUtils.lerp(1, 0.86, away);
    const g = group.current;
    g.position.x = THREE.MathUtils.damp(g.position.x, x * (1 - end * (mobile ? 1 : 0.55)), 2.2, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, y, 2.2, dt);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 2.2, dt));
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, input.mx * 0.18, 2.5, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -input.my * 0.12, 2.5, dt);

    camera.position.x = THREE.MathUtils.damp(camera.position.x, input.mx * 0.25, 2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, input.my * 0.15, 2, dt);
    camera.lookAt(0, 0, 0);
  });

  return <group ref={group}>{children}</group>;
}

/** Full rate in the hero, half rate further down, nothing while hidden or covered. */
function Ticker() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    let n = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || sceneState.paused) return;
      n++;
      const pastHero = window.scrollY > window.innerHeight * 0.9;
      if (!pastHero || n % 2 === 0) invalidate();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [invalidate]);
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
      camera={{ position: [0, 0, 8.6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop="demand"
      aria-hidden
    >
      {!reducedMotion && <Ticker />}
      <Environment />
      <ambientLight intensity={0.22} />
      <directionalLight position={[-6, 3, -4]} color="#7fd6cb" intensity={1.6} />
      <PointerLight />
      <Rig mobile={mobile}>
        <Gimbal segments={lowPower ? 120 : 220} />
      </Rig>
      <Dust count={lowPower ? 220 : 520} />
    </Canvas>
  );
}

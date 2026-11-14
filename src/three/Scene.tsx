import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { sceneState } from '../lib/scroll';

/**
 * The hero panel's 3D scene: a cluster of machine parts (gears, nuts, bearings,
 * rounded blocks, balls) in blue, black and white. They are pulled toward the
 * centre, collide with each other, and get pushed aside by the cursor. A click
 * scatters them. The physics is a small hand-written sphere solver, so no
 * physics library is loaded. It only renders while the hero is on screen.
 */

const input = { mx: 0.4, my: 0.3, hasPointer: false, inside: false, hero: 0, burst: false };

function useInputListeners() {
  useEffect(() => {
    const locate = (e: PointerEvent) => {
      const r = document.querySelector('.hero-panel')?.getBoundingClientRect();
      if (!r) return false;
      input.mx = Math.max(-1.4, Math.min(1.4, ((e.clientX - r.left) / r.width) * 2 - 1));
      input.my = -Math.max(-1.4, Math.min(1.4, ((e.clientY - r.top) / r.height) * 2 - 1));
      input.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      return input.inside;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      input.hasPointer = true;
      locate(e);
    };
    const onDown = (e: PointerEvent) => {
      if (locate(e)) input.burst = true;
    };
    const onScroll = () => {
      input.hero = Math.min(1.4, window.scrollY / window.innerHeight);
    };
    onScroll();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
}

/** Soft studio reflections so the glossy parts read as glossy. */
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

/* ---------------- Part shapes ---------------- */
function extrude(shape: THREE.Shape, depth: number) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3,
    curveSegments: 22,
  });
  g.center();
  return g;
}
function hole(shape: THREE.Shape, r: number) {
  const h = new THREE.Path();
  h.absarc(0, 0, r, 0, Math.PI * 2, true);
  shape.holes.push(h);
}
function gearGeometry() {
  const shape = new THREE.Shape();
  const teeth = 9;
  const step = (Math.PI * 2) / teeth;
  for (let k = 0; k < teeth; k++) {
    const a = k * step;
    const pts: [number, number][] = [
      [0.76, a],
      [0.76, a + step * 0.2],
      [1, a + step * 0.34],
      [1, a + step * 0.66],
      [0.76, a + step * 0.8],
    ];
    pts.forEach(([r, ang], i) => {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (k === 0 && i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }
  shape.closePath();
  hole(shape, 0.3);
  return extrude(shape, 0.5);
}
function nutGeometry() {
  const shape = new THREE.Shape();
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    if (k === 0) shape.moveTo(Math.cos(a), Math.sin(a));
    else shape.lineTo(Math.cos(a), Math.sin(a));
  }
  shape.closePath();
  hole(shape, 0.46);
  return extrude(shape, 0.66);
}

/** Small deterministic random generator, so the cluster looks the same on every visit. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Body = {
  kind: number;
  slot: number;
  r: number;
  scale: number;
  p: THREE.Vector3;
  v: THREE.Vector3;
  q: THREE.Quaternion;
  w: THREE.Vector3;
  spin: THREE.Vector3;
};

function Cluster({ lowPower, brand }: { lowPower: boolean; brand: string }) {
  const group = useRef<THREE.Group>(null!);
  const meshes = useRef<THREE.InstancedMesh[]>([]);
  const { camera, size } = useThree();

  // Each kind: a geometry, how round it is for collisions, and how many of it
  const kinds = useMemo(() => {
    const n = lowPower ? 0.5 : 1;
    return [
      { geo: gearGeometry(), collide: 0.84, count: Math.round(10 * n) },
      { geo: nutGeometry(), collide: 0.9, count: Math.round(8 * n) },
      { geo: new THREE.TorusGeometry(0.64, 0.34, 20, 44), collide: 0.9, count: Math.round(7 * n) },
      { geo: new RoundedBoxGeometry(1.3, 1.3, 1.3, 4, 0.24), collide: 0.92, count: Math.round(7 * n) },
      { geo: new THREE.SphereGeometry(1, 40, 28), collide: 1, count: Math.round(9 * n) },
      { geo: new THREE.CapsuleGeometry(0.5, 0.86, 8, 22), collide: 0.82, count: Math.round(4 * n) },
    ];
  }, [lowPower]);

  const material = useMemo(
    () =>
      lowPower
        ? new THREE.MeshStandardMaterial({ roughness: 0.34, metalness: 0.08, envMapIntensity: 0.55 })
        : new THREE.MeshPhysicalMaterial({ roughness: 0.34, metalness: 0.06, clearcoat: 0.8, clearcoatRoughness: 0.22, envMapIntensity: 0.55 }),
    [lowPower],
  );

  const bodies = useMemo(() => {
    const rand = rng(7);
    const list: Body[] = [];
    kinds.forEach((k, kind) => {
      for (let slot = 0; slot < k.count; slot++) {
        const scale = (lowPower ? 0.52 : 0.5) + rand() * 0.42;
        // Start far out so the parts fly in and assemble when the page opens
        const a = rand() * Math.PI * 2;
        const d = 9 + rand() * 6;
        list.push({
          kind,
          slot,
          scale,
          r: scale * k.collide,
          p: new THREE.Vector3(Math.cos(a) * d * 1.4, Math.sin(a) * d * 0.8, (rand() - 0.5) * 6),
          v: new THREE.Vector3(),
          q: new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * 6, rand() * 6, rand() * 6)),
          w: new THREE.Vector3(),
          spin: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.5),
        });
      }
    });
    return list;
  }, [kinds, lowPower]);

  // Blue, black and white, mixed evenly across every kind of part
  useEffect(() => {
    const rand = rng(21);
    const palette = [new THREE.Color(brand), new THREE.Color('#090a0e'), new THREE.Color('#e4e6ee')];
    const counters = kinds.map(() => 0);
    bodies.forEach((b) => {
      const mesh = meshes.current[b.kind];
      if (!mesh) return;
      const pick = (counters[b.kind]++ + b.kind + (rand() < 0.25 ? 1 : 0)) % 3;
      mesh.setColorAt(b.slot, palette[pick]);
    });
    meshes.current.forEach((m) => {
      if (m?.instanceColor) m.instanceColor.needsUpdate = true;
    });
  }, [bodies, kinds, brand]);

  const tmp = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      s: new THREE.Vector3(),
      n: new THREE.Vector3(),
      ptr: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      dq: new THREE.Quaternion(),
      axis: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 30);
    const t = state.clock.elapsedTime;
    const aspect = size.width / size.height;
    const wide = aspect > 1.5;

    // Fit the cluster to the panel and let it drift back a little on scroll
    const g = group.current;
    const target = (wide ? 1.16 : Math.max(0.74, Math.min(1.02, aspect * 0.86))) * (1 + input.hero * 0.1);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x || target, target, 3, dt));
    g.position.y = input.hero * 0.9;
    const gs = g.scale.x;

    // Pointer on the z = 0 plane, in the cluster's own units
    tmp.dir.set(input.mx, input.my, 0.5).unproject(camera).sub(camera.position).normalize();
    const k = -camera.position.z / tmp.dir.z;
    tmp.ptr.copy(camera.position).addScaledVector(tmp.dir, k).divideScalar(gs);
    const pointerOn = input.hasPointer && input.inside;

    // The centre the parts are pulled toward wanders slowly, so the cluster never freezes
    const cx = Math.sin(t * 0.31) * (wide ? 0.9 : 0.25);
    const cy = Math.cos(t * 0.27) * 0.28;
    const kx = wide ? 0.5 : 1.5;
    const pull = 3.4;
    const damp = Math.exp(-2.1 * dt);

    for (const b of bodies) {
      const { p, v } = b;
      let ax = -(p.x - cx) * kx * pull;
      let ay = -(p.y - cy) * 1.5 * pull;
      const az = -p.z * 2.8 * pull;
      // A gentle swirl
      ax += -p.y * 0.55;
      ay += p.x * 0.3;
      if (input.burst) {
        tmp.n.copy(p).sub(tmp.ptr);
        const d2 = tmp.n.lengthSq();
        tmp.n.normalize();
        v.addScaledVector(tmp.n, 17 / (1 + d2 * 0.22));
      }
      v.x = (v.x + ax * dt) * damp;
      v.y = (v.y + ay * dt) * damp;
      v.z = (v.z + az * dt) * damp;
      p.addScaledVector(v, dt);
    }
    input.burst = false;

    // Collisions: two passes keep the pile from sinking into itself
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < bodies.length; i++) {
        const a = bodies[i];
        for (let j = i + 1; j < bodies.length; j++) {
          const c = bodies[j];
          const min = a.r + c.r;
          tmp.n.copy(c.p).sub(a.p);
          const d2 = tmp.n.lengthSq();
          if (d2 >= min * min || d2 < 1e-8) continue;
          const d = Math.sqrt(d2);
          tmp.n.multiplyScalar(1 / d);
          const overlap = (min - d) * 0.5;
          a.p.addScaledVector(tmp.n, -overlap);
          c.p.addScaledVector(tmp.n, overlap);
          const vn = (c.v.x - a.v.x) * tmp.n.x + (c.v.y - a.v.y) * tmp.n.y + (c.v.z - a.v.z) * tmp.n.z;
          if (vn < 0) {
            const imp = -0.6 * vn;
            a.v.addScaledVector(tmp.n, -imp);
            c.v.addScaledVector(tmp.n, imp);
          }
        }
      }
      if (pointerOn) {
        for (const b of bodies) {
          const min = b.r + 1.25;
          tmp.n.copy(b.p).sub(tmp.ptr);
          tmp.n.z *= 0.6;
          const d2 = tmp.n.lengthSq();
          if (d2 >= min * min || d2 < 1e-8) continue;
          const d = Math.sqrt(d2);
          tmp.n.multiplyScalar(1 / d);
          const overlap = min - d;
          b.p.addScaledVector(tmp.n, overlap * 0.35);
          b.v.addScaledVector(tmp.n, overlap * 26 * dt);
        }
      }
    }

    // Spin follows the motion, like something rolling, on top of a slow idle tumble
    const spinEase = 1 - Math.exp(-3 * dt);
    for (const b of bodies) {
      b.w.x += (b.v.y * -0.9 + b.spin.x - b.w.x) * spinEase;
      b.w.y += (b.v.x * 0.9 + b.spin.y - b.w.y) * spinEase;
      b.w.z += ((b.v.x - b.v.y) * 0.3 + b.spin.z - b.w.z) * spinEase;
      const speed = b.w.length();
      if (speed > 1e-5) {
        tmp.axis.copy(b.w).multiplyScalar(1 / speed);
        tmp.dq.setFromAxisAngle(tmp.axis, speed * dt);
        b.q.premultiply(tmp.dq);
      }
      tmp.s.setScalar(b.scale);
      tmp.m.compose(b.p, b.q, tmp.s);
      meshes.current[b.kind]?.setMatrixAt(b.slot, tmp.m);
    }
    meshes.current.forEach((m) => {
      if (m) m.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group ref={group}>
      {kinds.map((k, i) => (
        <instancedMesh
          key={i}
          ref={(m) => {
            if (m) meshes.current[i] = m;
          }}
          args={[k.geo, material, k.count]}
          castShadow={!lowPower}
          receiveShadow={!lowPower}
          frustumCulled={false}
        />
      ))}
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 11;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 5;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.008;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#dfe3ea" size={0.024} sizeAttenuation transparent opacity={0.35} depthWrite={false} />
    </points>
  );
}

/** Lights: a key light that casts the shadows, a coloured rim, and one that follows the cursor. */
function Lights({ accent, shadows }: { accent: string; shadows: boolean }) {
  const follow = useRef<THREE.PointLight>(null!);
  const rim = useRef<THREE.DirectionalLight>(null!);
  const { camera } = useThree();
  useEffect(() => {
    rim.current.color.set(accent);
  }, [accent]);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const tx = input.hasPointer ? input.mx * 6 : Math.cos(t * 0.35) * 3.4;
    const ty = input.hasPointer ? input.my * 3.2 : Math.sin(t * 0.5) * 1.8;
    follow.current.position.x = THREE.MathUtils.damp(follow.current.position.x, tx, 3, dt);
    follow.current.position.y = THREE.MathUtils.damp(follow.current.position.y, ty, 3, dt);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, input.mx * 0.35, 2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, input.my * 0.2, 2, dt);
    camera.lookAt(0, 0, 0);
  });
  return (
    <>
      <ambientLight intensity={0.42} />
      <directionalLight
        position={[5, 8, 9]}
        intensity={2.0}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.05}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      <directionalLight position={[-7, -3, 5]} intensity={0.55} />
      <directionalLight ref={rim} position={[-6, 4, -5]} intensity={2.4} />
      <pointLight ref={follow} position={[2, 1, 4.2]} color="#ffffff" intensity={20} distance={14} decay={2} />
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
      // With reduced motion the parts still need a few seconds to come together, then everything stops
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

export default function Scene({ reducedMotion, accent, brand }: { reducedMotion: boolean; accent: string; brand: string }) {
  useInputListeners();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 820;
  const lowPower = mobile || (navigator.hardwareConcurrency ?? 8) <= 4;

  return (
    <Canvas
      className="scene-canvas"
      dpr={[1, lowPower ? 1.5 : 1.8]}
      camera={{ position: [0, 0, 8.6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      shadows={!lowPower}
      flat
      frameloop="demand"
      aria-hidden
    >
      <Ticker settleOnly={reducedMotion} />
      <Environment />
      <Lights accent={accent} shadows={!lowPower} />
      <Cluster lowPower={lowPower} brand={brand} />
      <Dust count={lowPower ? 160 : 380} />
    </Canvas>
  );
}

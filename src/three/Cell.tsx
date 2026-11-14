import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { cellStats } from '../lib/heroStats';
import { gearGeometry, input, nutGeometry, rng } from './shared';

/**
 * The inspection cell: a small working model of "see, decide, act".
 *
 *   see     parts ride a conveyor under a camera; each one gets a detection frame and a label
 *   decide  good parts pass, broken ones are flagged
 *   act     a robot arm lifts the flagged parts off the belt and drops them in a bin
 *
 * The arm follows the cursor while it has nothing to do, and a click on any part sends
 * it to the bin. Everything is simulated here; the counters only count this simulation.
 */

const FLOOR = -1.3;
const BELT = { len: 26, width: 2, speed: 0.85, gap: 2.35, top: -0.02 };
const STATION_X = -3.2;
const ARM = { x: 2.3, y: 0.95, z: -2.2, l1: 2.05, l2: 1.9, tool: 0.52 };
const BIN = { x: 5.05, z: -2.25, floor: -0.63 };

/**
 * The scene's own colours: an orange arm, cream trim and a green-blue scanning light
 * on a deep blue stage, with red reserved for defects.
 */
const TONE = {
  arm: '#ff6a2b',
  joint: '#f4efe6',
  tool: '#161a2c',
  body: '#2a3160',
  legs: '#39406a',
  belt: '#12172e',
  slat: '#2b3360',
  trim: '#f4efe6',
  camera: '#19b3a0',
  vision: '#5eead4',
  signal: '#ff3b6b',
  tagBg: 'rgba(13, 17, 44, 0.92)',
  tagText: '#ffffff',
};
/** Steel, brass and copper: what the parts on a real line are made of. */
const METALS = ['#cdd3df', '#e0aa3e', '#d07a4d'];
const PART_SIZE = 0.58;
/** On wide panels the line is turned a little, so it gains depth and the arm is seen from the side. */
const WIDE_TURN = -0.24;
/** How the whole cell is placed when the panel is taller than it is wide (phones). */
const NARROW = { turn: -0.95, scale: 0.6, x: -0.35, y: 0.3, z: 0.6 };

type Def = { name: string; defect: boolean; geo: THREE.BufferGeometry; half: number; log: string };
type Part = {
  def: Def;
  mesh: THREE.Mesh;
  frame: THREE.Mesh;
  tag: THREE.Sprite;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: number;
  state: 'belt' | 'held' | 'falling' | 'binned';
  seen: boolean;
  counted: boolean;
  wanted: boolean;
  claimed: boolean;
  show: number;
  age: number;
  shrink: number;
};

/** The mark a vision system draws around what it has found: four corners on the belt and a line up to the label. */
function reticleGeometry(half: number) {
  const parts: THREE.BufferGeometry[] = [];
  const len = 0.32;
  const th = 0.045;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const a = new THREE.BoxGeometry(len, 0.016, th);
      a.translate(sx * half - (sx * len) / 2, 0, sz * half);
      const b = new THREE.BoxGeometry(th, 0.016, len);
      b.translate(sx * half, 0, sz * half - (sz * len) / 2);
      parts.push(a, b);
    }
  }
  const leader = new THREE.BoxGeometry(0.022, 0.34, 0.022);
  leader.translate(0, 0.72, 0);
  parts.push(leader);
  return mergeGeometries(parts, false)!;
}

/** The small label that floats over a detected part. */
function tagTexture(text: string, bad: boolean) {
  const tone = TONE;
  const w = 384;
  const h = 96;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d')!;
  g.beginPath();
  if (g.roundRect) g.roundRect(4, 4, w - 8, h - 8, 44);
  else g.rect(4, 4, w - 8, h - 8);
  g.fillStyle = bad ? tone.signal : tone.tagBg;
  g.fill();
  if (!bad) {
    g.lineWidth = 3;
    g.strokeStyle = tone.vision;
    g.stroke();
  }
  g.fillStyle = bad ? '#ffffff' : tone.vision;
  g.beginPath();
  g.arc(46, h / 2, 9, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = bad ? '#ffffff' : tone.tagText;
  g.font = '600 31px "JetBrains Mono", ui-monospace, Menlo, monospace';
  g.textBaseline = 'middle';
  g.fillText(text, 70, h / 2 + 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function Cell({ lowPower }: { lowPower: boolean }) {
  const tone = TONE;
  const root = useRef<THREE.Group>(null!);
  const slats = useRef<THREE.InstancedMesh>(null!);
  const scan = useRef<THREE.Mesh>(null!);
  const yaw = useRef<THREE.Group>(null!);
  const shoulder = useRef<THREE.Group>(null!);
  const elbow = useRef<THREE.Group>(null!);
  const wrist = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  const { camera, size, invalidate } = useThree();
  const shadows = !lowPower;

  const mats = useMemo(() => {
    const gloss = (color: string) =>
      lowPower
        ? new THREE.MeshStandardMaterial({ color, roughness: 0.36, metalness: 0.06, envMapIntensity: 0.55 })
        : new THREE.MeshPhysicalMaterial({ color, roughness: 0.34, metalness: 0.06, envMapIntensity: 0.55, clearcoat: 0.8, clearcoatRoughness: 0.22 });
    const matte = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.08 });
    return {
      arm: gloss(tone.arm),
      joint: gloss(tone.joint),
      tool: gloss(tone.tool),
      trim: gloss(tone.trim),
      camera: gloss(tone.camera),
      body: matte(tone.body),
      legs: matte(tone.legs),
      belt: new THREE.MeshStandardMaterial({ color: tone.belt, roughness: 0.92 }),
      slat: new THREE.MeshStandardMaterial({ color: tone.slat, roughness: 0.85 }),
      metals: METALS.map((color) => new THREE.MeshStandardMaterial({ color, metalness: 1, roughness: 0.3, envMapIntensity: 1.15 })),
      ok: new THREE.MeshBasicMaterial({ color: tone.vision }),
      bad: new THREE.MeshBasicMaterial({ color: tone.signal }),
      cone: new THREE.MeshBasicMaterial({
        color: tone.vision,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    };
  }, [tone, lowPower]);

  const sim = useMemo(() => {
    const flat = (g: THREE.BufferGeometry) => {
      g.rotateX(-Math.PI / 2);
      return g;
    };
    const defs: Def[] = [
      { name: 'GEAR', defect: false, geo: flat(gearGeometry()), half: 0.3 * PART_SIZE, log: 'gear · teeth complete · pass' },
      { name: 'GEAR', defect: true, geo: flat(gearGeometry(4)), half: 0.3 * PART_SIZE, log: 'gear · broken teeth · reject' },
      { name: 'BEARING', defect: false, geo: flat(new THREE.TorusGeometry(0.66, 0.3, 18, 44)), half: 0.3 * PART_SIZE, log: 'bearing · ring closed · pass' },
      { name: 'BEARING', defect: true, geo: flat(new THREE.TorusGeometry(0.66, 0.3, 18, 40, Math.PI * 1.6)), half: 0.3 * PART_SIZE, log: 'bearing · cracked ring · reject' },
      { name: 'NUT', defect: false, geo: flat(nutGeometry()), half: 0.38 * PART_SIZE, log: 'nut · thread clear · pass' },
    ];
    const group = new THREE.Group();
    const frameGeo = reticleGeometry(0.78);
    const parts: Part[] = [];
    const count = lowPower ? 8 : 10;
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(defs[0].geo, mats.metals[0]);
      mesh.castShadow = mesh.receiveShadow = !lowPower;
      const frame = new THREE.Mesh(frameGeo, mats.ok);
      frame.visible = false;
      const tag = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false }));
      tag.renderOrder = 5;
      tag.visible = false;
      group.add(mesh, frame, tag);
      parts.push({
        def: defs[0],
        mesh,
        frame,
        tag,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        rot: 0,
        state: 'belt',
        seen: false,
        counted: false,
        wanted: false,
        claimed: false,
        show: 0,
        age: 0,
        shrink: 1,
      });
    }
    return {
      rand: rng(5),
      defs,
      group,
      parts,
      tags: new Map<string, THREE.Texture>(),
      lastDefect: true,
      offset: 0,
      coneGlow: 0.1,
      look: { x: 0, y: 0 },
      arm: {
        tip: new THREE.Vector3(ARM.x + 0.5, 2.9, ARM.z + 0.5),
        goal: new THREE.Vector3(),
        job: null as null | { part: Part; phase: number; t: number },
      },
      stats: { inspected: 0, passed: 0, rejected: 0, log: '' },
      dirty: true,
    };
  }, [lowPower, mats]);

  const setTag = (p: Part) => {
    const bad = p.def.defect || p.wanted;
    const text = `${p.def.name} ${p.def.defect ? 'DEFECT' : p.wanted ? 'REJECT' : 'OK'}`;
    let texture = sim.tags.get(text);
    if (!texture) {
      texture = tagTexture(text, bad);
      sim.tags.set(text, texture);
    }
    const material = p.tag.material as THREE.SpriteMaterial;
    material.map = texture;
    material.needsUpdate = true;
    p.frame.material = bad ? mats.bad : mats.ok;
  };

  /** Put a fresh part on the belt at x. Two broken parts never follow each other, so the arm keeps up. */
  const assign = (p: Part, x: number, opts: { seen?: boolean; allowDefect?: boolean; force?: boolean } = {}) => {
    const defect = opts.force || (opts.allowDefect !== false && !sim.lastDefect && sim.rand() < 0.36);
    const pool = sim.defs.filter((d) => d.defect === defect);
    const def = pool[Math.floor(sim.rand() * pool.length)];
    sim.lastDefect = defect;
    p.def = def;
    p.mesh.geometry = def.geo;
    p.mesh.material = mats.metals[Math.floor(sim.rand() * mats.metals.length)];
    p.pos.set(x, BELT.top + def.half, (sim.rand() - 0.5) * 0.5);
    p.vel.set(0, 0, 0);
    p.rot = sim.rand() * Math.PI * 2;
    p.state = 'belt';
    p.seen = !!opts.seen;
    p.counted = false;
    p.wanted = false;
    p.claimed = false;
    p.show = opts.seen ? 1 : 0;
    p.age = 0;
    p.shrink = 1;
    setTag(p);
  };

  // Fill the belt so the scene is already running when it appears
  useEffect(() => {
    sim.stats = { inspected: 0, passed: 0, rejected: 0, log: 'line running' };
    sim.parts.forEach((p, i) => {
      const x = BELT.len / 2 - 2.2 - i * BELT.gap;
      const seen = x > STATION_X;
      // The second part still to reach the camera is always a broken one, so a visitor sees a rejection within seconds
      assign(p, x, { seen, allowDefect: false, force: i === 7 });
      if (seen) sim.stats.inspected++;
      if (seen && x > ARM.x + 2.6) {
        p.counted = true;
        sim.stats.passed++;
      }
    });
    sim.dirty = true;
    // Redraw the labels once the web font has arrived
    let alive = true;
    document.fonts?.ready.then(() => {
      if (!alive) return;
      sim.tags.forEach((t) => t.dispose());
      sim.tags.clear();
      sim.parts.forEach(setTag);
      invalidate();
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim]);

  const tmp = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      inv: new THREE.Matrix4(),
      ray: new THREE.Raycaster(),
      ndc: new THREE.Vector2(),
      hoverPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.2),
      followPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.15),
      hover: new THREE.Vector3(),
      follow: new THREE.Vector3(),
      w: new THREE.Vector3(),
      s: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      p: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 30);
    const t = state.clock.elapsedTime;
    const ease = (k: number) => 1 - Math.exp(-k * dt);
    const aspect = size.width / size.height;
    const wide = aspect >= 1.5;

    /* ---------- Camera: a slow push-in when the page opens, then a little parallax ---------- */
    const cam = camera as THREE.PerspectiveCamera;
    if (cam.fov !== 34) {
      cam.fov = 34;
      cam.updateProjectionMatrix();
    }
    const intro = 1 - Math.pow(1 - Math.min(1, t / 2), 3);
    sim.look.x += (input.mx - sim.look.x) * ease(2);
    sim.look.y += (input.my - sim.look.y) * ease(2);
    cam.position.set(sim.look.x * 0.55, 4.5 + sim.look.y * 0.25 + (1 - intro) * 1.6 + input.hero * 1.2, 10.6 + (1 - intro) * 2.6);
    cam.lookAt(0, 0.7 + input.hero * 0.5, -0.5);
    cam.updateMatrixWorld();

    // On narrow screens the line turns to run into the distance, so it still fits
    const g = root.current;
    g.rotation.y = wide ? WIDE_TURN : NARROW.turn;
    g.scale.setScalar(wide ? Math.min(1, aspect / 2.1) : NARROW.scale * Math.min(1, aspect / 0.62));
    g.position.set(wide ? 0 : NARROW.x, wide ? 0 : NARROW.y, wide ? 0 : NARROW.z);
    g.updateMatrixWorld();

    /* ---------- Where the cursor points, in the cell's own space ---------- */
    tmp.ray.setFromCamera(tmp.ndc.set(input.mx, input.my), cam);
    tmp.ray.ray.applyMatrix4(tmp.inv.copy(g.matrixWorld).invert());
    const pointing = input.hasPointer && input.inside;
    // A tap counts as aiming too, although there is no cursor to follow on a touch screen
    const hasHover = input.inside && (input.hasPointer || input.burst) && !!tmp.ray.ray.intersectPlane(tmp.hoverPlane, tmp.hover);
    const hasFollow = pointing && !!tmp.ray.ray.intersectPlane(tmp.followPlane, tmp.follow);

    /* ---------- Belt ---------- */
    sim.offset = (sim.offset + BELT.speed * dt) % BELT.len;
    const slatCount = slats.current.count;
    for (let i = 0; i < slatCount; i++) {
      const x = ((i * BELT.len) / slatCount + sim.offset) % BELT.len - BELT.len / 2;
      tmp.m.makeTranslation(x, BELT.top + 0.004, 0);
      slats.current.setMatrixAt(i, tmp.m);
    }
    slats.current.instanceMatrix.needsUpdate = true;

    /* ---------- Parts ---------- */
    let hovered: Part | null = null;
    let underCamera = false;
    for (const p of sim.parts) {
      if (p.state === 'belt') {
        p.pos.x += BELT.speed * dt;
        if (Math.abs(p.pos.x - STATION_X) < 0.9) underCamera = true;
        if (!p.seen && p.pos.x >= STATION_X) {
          p.seen = true;
          sim.stats.inspected++;
          sim.stats.log = p.def.log;
          sim.dirty = true;
        }
        if (!p.counted && p.pos.x > ARM.x + 2.6) {
          p.counted = true;
          if (!p.def.defect && !p.wanted) {
            sim.stats.passed++;
            sim.dirty = true;
          }
        }
        if (hasHover && Math.abs(tmp.hover.x - p.pos.x) < 0.74 && Math.abs(tmp.hover.z - p.pos.z) < 0.8) hovered = p;
        if (p.pos.x > BELT.len / 2 + 0.8) {
          let left = Infinity;
          for (const o of sim.parts) if (o !== p && o.state === 'belt') left = Math.min(left, o.pos.x);
          assign(p, Math.min(left - BELT.gap, -BELT.len / 2 - 0.4));
        }
      } else if (p.state === 'held') {
        p.pos.set(sim.arm.tip.x, sim.arm.tip.y - p.def.half, sim.arm.tip.z);
      } else if (p.state === 'falling') {
        p.vel.y -= 16 * dt;
        p.pos.addScaledVector(p.vel, dt);
        p.rot += dt * 3;
        if (p.pos.y <= BIN.floor + p.def.half) {
          p.pos.y = BIN.floor + p.def.half;
          p.state = 'binned';
          sim.stats.rejected++;
          sim.dirty = true;
        }
      } else {
        p.age += dt;
        if (p.age > 2.4) p.shrink = Math.max(0, p.shrink - dt * 2.4);
        if (p.shrink <= 0) {
          let left = Infinity;
          for (const o of sim.parts) if (o !== p && o.state === 'belt') left = Math.min(left, o.pos.x);
          assign(p, Math.min(left - BELT.gap, -BELT.len / 2 - 0.4));
        }
      }
    }

    // A click sends the part under the cursor to the bin, even a good one
    if (input.burst && hovered && !hovered.def.defect && !hovered.wanted && hovered.pos.x < ARM.x + 0.9) {
      hovered.wanted = true;
      if (!hovered.seen) {
        hovered.seen = true;
        sim.stats.inspected++;
      }
      setTag(hovered);
      sim.stats.log = `${hovered.def.name.toLowerCase()} · operator override · reject`;
      sim.dirty = true;
    }
    input.burst = false;

    /* ---------- Robot arm ---------- */
    const arm = sim.arm;
    let magnet = false;
    let rate = 4;
    if (!arm.job) {
      const next = sim.parts.find(
        (p) => p.state === 'belt' && p.seen && (p.def.defect || p.wanted) && !p.claimed && p.pos.x > ARM.x - 2.4 && p.pos.x < ARM.x + 1.3,
      );
      if (next) {
        next.claimed = true;
        arm.job = { part: next, phase: 0, t: 0 };
      }
    }
    if (arm.job) {
      const job = arm.job;
      const p = job.part;
      job.t += dt;
      const top = p.pos.y + p.def.half + 0.02;
      if (job.phase === 0) {
        // Move above the part, keeping pace with the belt
        arm.goal.set(p.pos.x + BELT.speed * 0.14, top + 0.7, p.pos.z);
        rate = 9;
        if ((job.t > 0.3 && arm.tip.distanceTo(arm.goal) < 0.22) || job.t > 0.9) (job.phase = 1), (job.t = 0);
      } else if (job.phase === 1) {
        arm.goal.set(p.pos.x + BELT.speed * 0.09, top, p.pos.z);
        rate = 13;
        if (Math.abs(arm.tip.y - top) < 0.05 || job.t > 0.45) (job.phase = 2), (job.t = 0);
      } else if (job.phase === 2) {
        magnet = true;
        arm.goal.set(p.pos.x + BELT.speed * 0.09, top, p.pos.z);
        rate = 13;
        if (job.t > 0.12) {
          p.state = 'held';
          job.phase = 3;
          job.t = 0;
        }
      } else if (job.phase === 3) {
        magnet = true;
        arm.goal.set(BIN.x, 1.75, BIN.z);
        rate = 5.5;
        if (Math.hypot(arm.tip.x - BIN.x, arm.tip.z - BIN.z) < 0.35 || job.t > 1.7) {
          p.state = 'falling';
          p.vel.set(0.3, -0.5, 0);
          job.phase = 4;
          job.t = 0;
        }
      } else {
        arm.goal.set(BIN.x, 1.75, BIN.z);
        if (job.t > 0.25) arm.job = null;
      }
    } else if (hasFollow) {
      arm.goal.set(tmp.follow.x, 1.15, THREE.MathUtils.clamp(tmp.follow.z, -1.6, 1.3));
      rate = 6;
    } else {
      // Nothing to do: a slow idle sway over the belt
      arm.goal.set(ARM.x - 1.75 + Math.sin(t * 0.6) * 0.55, 1.55 + Math.sin(t * 0.9) * 0.18, -0.15 + Math.cos(t * 0.5) * 0.3);
    }
    // Keep the goal inside what the arm can reach
    tmp.w.set(arm.goal.x - ARM.x, arm.goal.y + ARM.tool - ARM.y, arm.goal.z - ARM.z);
    const reach = ARM.l1 + ARM.l2 - 0.14;
    if (tmp.w.length() > reach) {
      tmp.w.setLength(reach);
      arm.goal.set(ARM.x + tmp.w.x, ARM.y + tmp.w.y - ARM.tool, ARM.z + tmp.w.z);
    }
    arm.goal.y = Math.max(arm.goal.y, 0.1);
    arm.tip.lerp(arm.goal, ease(rate));

    // Two-link inverse kinematics: turn the base toward the target, then solve shoulder and elbow
    const dx = arm.tip.x - ARM.x;
    const dy = arm.tip.y + ARM.tool - ARM.y;
    const dz = arm.tip.z - ARM.z;
    const flatDist = Math.hypot(dx, dz);
    const d = THREE.MathUtils.clamp(Math.hypot(flatDist, dy), 0.45, ARM.l1 + ARM.l2 - 0.02);
    const up = Math.atan2(dy, flatDist) + Math.acos(THREE.MathUtils.clamp((ARM.l1 * ARM.l1 + d * d - ARM.l2 * ARM.l2) / (2 * ARM.l1 * d), -1, 1));
    const bend = Math.PI - Math.acos(THREE.MathUtils.clamp((ARM.l1 * ARM.l1 + ARM.l2 * ARM.l2 - d * d) / (2 * ARM.l1 * ARM.l2), -1, 1));
    yaw.current.rotation.y = Math.atan2(-dz, dx);
    shoulder.current.rotation.z = up;
    elbow.current.rotation.z = -bend;
    wrist.current.rotation.z = -Math.PI / 2 - (up - bend);
    ring.current.material = magnet ? mats.ok : mats.tool;

    /* ---------- Draw the parts, their frames and labels ---------- */
    for (const p of sim.parts) {
      const lift = p === hovered ? 1.07 : 1;
      p.mesh.position.copy(p.pos);
      p.mesh.rotation.y = p.rot;
      p.mesh.scale.setScalar(PART_SIZE * lift * p.shrink);
      p.show += ((p.seen && p.state === 'belt' ? 1 : 0) - p.show) * ease(9);
      const on = p.state === 'belt' && p.show > 0.03;
      p.frame.visible = on;
      p.tag.visible = on;
      if (on) {
        p.frame.position.set(p.pos.x, BELT.top + 0.014, p.pos.z);
        p.frame.scale.set(1 + (1 - p.show) * 0.5, p.show, 1 + (1 - p.show) * 0.5);
        p.tag.position.set(p.pos.x, BELT.top + 1.18, p.pos.z);
        p.tag.scale.set(1.9 * p.show, 0.475 * p.show, 1);
      }
    }

    /* ---------- Camera station ---------- */
    scan.current.position.x = Math.sin(t * 2.4) * 0.55;
    sim.coneGlow += ((underCamera ? 0.24 : 0.09) - sim.coneGlow) * ease(6);
    mats.cone.opacity = sim.coneGlow;

    if (sim.dirty) {
      sim.dirty = false;
      cellStats.set(sim.stats);
    }
  });

  const legX = [-11, -7, -3, 1, 5, 9];
  const legH = -0.44 - FLOOR;
  const pedestalH = ARM.y - 0.38 - FLOOR;
  const half = BELT.width / 2;

  return (
    <group ref={root}>
      {shadows && (
        <mesh rotation-x={-Math.PI / 2} position-y={FLOOR} receiveShadow>
          <planeGeometry args={[80, 44]} />
          <shadowMaterial opacity={0.5} />
        </mesh>
      )}

      {/* Conveyor */}
      <mesh position={[0, -0.26, 0]} material={mats.body} castShadow={shadows} receiveShadow={shadows}>
        <boxGeometry args={[BELT.len, 0.36, BELT.width + 0.4]} />
      </mesh>
      <mesh position={[0, -0.04, 0]} material={mats.belt} receiveShadow={shadows}>
        <boxGeometry args={[BELT.len, 0.04, BELT.width]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0, s * (half + 0.12)]} material={mats.trim} castShadow={shadows}>
          <boxGeometry args={[BELT.len, 0.16, 0.1]} />
        </mesh>
      ))}
      <instancedMesh ref={slats} args={[undefined, mats.slat, 46]} frustumCulled={false}>
        <boxGeometry args={[0.05, 0.012, BELT.width - 0.08]} />
      </instancedMesh>
      {legX.flatMap((x) =>
        [-1, 1].map((s) => (
          <mesh key={`${x}${s}`} position={[x, FLOOR + legH / 2, s * (half + 0.05)]} material={mats.legs} castShadow={shadows}>
            <boxGeometry args={[0.14, legH, 0.14]} />
          </mesh>
        )),
      )}

      {/* Camera station */}
      <group position={[STATION_X, 0, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 0.7, s * (half + 0.42)]} material={mats.trim} castShadow={shadows}>
            <boxGeometry args={[0.12, 4, 0.12]} />
          </mesh>
        ))}
        <mesh position={[0, 2.7, 0]} material={mats.trim} castShadow={shadows}>
          <boxGeometry args={[0.14, 0.14, BELT.width + 0.96]} />
        </mesh>
        <mesh position={[0, 2.42, 0]} material={mats.camera} castShadow={shadows}>
          <boxGeometry args={[0.66, 0.42, 0.52]} />
        </mesh>
        <mesh position={[0, 2.1, 0]} material={mats.tool}>
          <cylinderGeometry args={[0.17, 0.21, 0.26, 28]} />
        </mesh>
        <mesh position={[0, 1.0, 0]} rotation-y={Math.PI / 4} material={mats.cone}>
          <coneGeometry args={[1.28, 2, 4, 1, true]} />
        </mesh>
        <mesh ref={scan} position={[0, BELT.top + 0.012, 0]} material={mats.ok}>
          <boxGeometry args={[0.035, 0.012, BELT.width - 0.1]} />
        </mesh>
      </group>

      {/* Robot arm */}
      <group position={[ARM.x, 0, ARM.z]}>
        <mesh position={[0, FLOOR + pedestalH / 2, 0]} material={mats.legs} castShadow={shadows}>
          <cylinderGeometry args={[0.44, 0.52, pedestalH, 36]} />
        </mesh>
        <mesh position={[0, FLOOR + 0.05, 0]} material={mats.trim} receiveShadow={shadows}>
          <cylinderGeometry args={[0.72, 0.76, 0.1, 40]} />
        </mesh>
        <group ref={yaw} position={[0, ARM.y, 0]}>
          <mesh position={[0, -0.2, 0]} material={mats.arm} castShadow={shadows}>
            <cylinderGeometry args={[0.46, 0.46, 0.42, 36]} />
          </mesh>
          <group ref={shoulder}>
            <mesh rotation-x={Math.PI / 2} material={mats.joint} castShadow={shadows}>
              <cylinderGeometry args={[0.33, 0.33, 0.8, 32]} />
            </mesh>
            <mesh rotation-x={Math.PI / 2} material={mats.tool}>
              <cylinderGeometry args={[0.2, 0.2, 0.86, 28]} />
            </mesh>
            <mesh position={[ARM.l1 / 2, 0, 0]} rotation-z={-Math.PI / 2} material={mats.arm} castShadow={shadows}>
              <capsuleGeometry args={[0.19, ARM.l1 - 0.2, 8, 20]} />
            </mesh>
            <group ref={elbow} position={[ARM.l1, 0, 0]}>
              <mesh rotation-x={Math.PI / 2} material={mats.joint} castShadow={shadows}>
                <cylinderGeometry args={[0.27, 0.27, 0.7, 32]} />
              </mesh>
              <mesh rotation-x={Math.PI / 2} material={mats.tool}>
                <cylinderGeometry args={[0.16, 0.16, 0.76, 28]} />
              </mesh>
              <mesh position={[ARM.l2 / 2, 0, 0]} rotation-z={-Math.PI / 2} material={mats.arm} castShadow={shadows}>
                <capsuleGeometry args={[0.155, ARM.l2 - 0.2, 8, 20]} />
              </mesh>
              <group ref={wrist} position={[ARM.l2, 0, 0]}>
                <mesh rotation-x={Math.PI / 2} material={mats.tool} castShadow={shadows}>
                  <cylinderGeometry args={[0.19, 0.19, 0.5, 28]} />
                </mesh>
                <mesh position={[0.2, 0, 0]} rotation-z={-Math.PI / 2} material={mats.joint}>
                  <cylinderGeometry args={[0.07, 0.07, 0.36, 16]} />
                </mesh>
                <mesh position={[ARM.tool - 0.07, 0, 0]} rotation-z={-Math.PI / 2} material={mats.tool} castShadow={shadows}>
                  <cylinderGeometry args={[0.3, 0.3, 0.14, 32]} />
                </mesh>
                <mesh ref={ring} position={[ARM.tool - 0.01, 0, 0]} rotation-y={Math.PI / 2} material={mats.tool}>
                  <torusGeometry args={[0.3, 0.03, 10, 40]} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* Reject bin */}
      <group position={[BIN.x, 0, BIN.z]}>
        <mesh position={[0, BIN.floor - 0.03, 0]} material={mats.trim} receiveShadow={shadows}>
          <boxGeometry args={[1.6, 0.06, 1.6]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={`z${s}`} position={[0, -0.36, s * 0.77]} material={mats.trim} castShadow={shadows}>
            <boxGeometry args={[1.6, 0.6, 0.06]} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={`x${s}`} position={[s * 0.77, -0.36, 0]} material={mats.trim} castShadow={shadows}>
            <boxGeometry args={[0.06, 0.6, 1.6]} />
          </mesh>
        ))}
        <mesh position={[0, (FLOOR + BIN.floor - 0.06) / 2, 0]} material={mats.legs} castShadow={shadows}>
          <boxGeometry args={[0.6, BIN.floor - 0.06 - FLOOR, 0.6]} />
        </mesh>
      </group>

      <primitive object={sim.group} />
    </group>
  );
}

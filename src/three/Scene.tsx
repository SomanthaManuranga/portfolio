import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { sceneState } from '../lib/scroll';

/* ------------------------------------------------------------------ */
/*  Shared input state (mouse + scroll), written by DOM listeners      */
/* ------------------------------------------------------------------ */
const input = { mx: 0, my: 0, scroll: 0, hero: 0, velocity: 0 };

function useInputListeners() {
  useEffect(() => {
    let last = window.scrollY;
    const onMove = (e: PointerEvent) => {
      input.mx = (e.clientX / window.innerWidth) * 2 - 1;
      input.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      input.scroll = window.scrollY / max;
      input.hero = Math.min(1, window.scrollY / window.innerHeight);
      input.velocity += (window.scrollY - last) * 0.002;
      last = window.scrollY;
    };
    onScroll();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/*  GLSL helpers                                                       */
/* ------------------------------------------------------------------ */
const noiseGLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

/* ------------------------------------------------------------------ */
/*  Neural core: noise-displaced icosahedron with fresnel glow         */
/* ------------------------------------------------------------------ */
function Core({ detail }: { detail: number }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const wire = useRef<THREE.LineSegments>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.22 },
      uColorA: { value: new THREE.Color('#5eead4') },
      uColorB: { value: new THREE.Color('#818cf8') },
      uColorC: { value: new THREE.Color('#f472b6') },
    }),
    [],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          uniform float uTime; uniform float uAmp;
          varying vec3 vNormal; varying vec3 vView; varying float vNoise;
          ${noiseGLSL}
          void main(){
            float n = snoise(normal * 1.6 + uTime * 0.35);
            float n2 = snoise(normal * 4.0 - uTime * 0.25) * 0.35;
            vNoise = n + n2;
            vec3 pos = position + normal * (vNoise * uAmp);
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorC; uniform float uTime;
          varying vec3 vNormal; varying vec3 vView; varying float vNoise;
          void main(){
            float fres = pow(1.0 - abs(dot(vNormal, vView)), 2.4);
            vec3 col = mix(uColorB, uColorA, smoothstep(-0.6, 0.8, vNoise));
            col = mix(col, uColorC, smoothstep(0.55, 1.1, vNoise) * 0.6);
            float bands = smoothstep(0.92, 1.0, sin(vNoise * 18.0 + uTime * 1.5)) * 0.35;
            float a = fres * 0.95 + 0.06 + bands;
            gl_FragColor = vec4(col * (0.55 + fres * 1.3 + bands), a);
          }`,
      }),
    [uniforms],
  );

  const wireGeo = useMemo(() => new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.42, 1)), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;
    uniforms.uAmp.value = 0.2 + Math.min(0.1, Math.abs(input.velocity) * 0.25);
    mesh.current.rotation.y += dt * 0.12;
    mesh.current.rotation.x = Math.sin(t * 0.2) * 0.2;
    wire.current.rotation.y -= dt * 0.06;
    wire.current.rotation.z += dt * 0.03;
  });

  return (
    <group>
      <mesh ref={mesh} material={material}>
        <icosahedronGeometry args={[1, detail]} />
      </mesh>
      <lineSegments ref={wire} geometry={wireGeo}>
        <lineBasicMaterial color="#7dd3fc" transparent opacity={0.16} />
      </lineSegments>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Orbit rings with travelling satellite nodes (gyroscope motif)      */
/* ------------------------------------------------------------------ */
function Orbits() {
  const group = useRef<THREE.Group>(null!);
  const sats = useRef<THREE.Mesh[]>([]);
  const rings = useMemo(
    () => [
      { r: 1.95, tilt: [1.2, 0.2, 0], speed: 0.5, color: '#5eead4' },
      { r: 2.35, tilt: [0.4, 1.0, 0.3], speed: -0.35, color: '#818cf8' },
      { r: 2.75, tilt: [1.7, -0.6, 0.5], speed: 0.22, color: '#f472b6' },
    ],
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    group.current.rotation.y = t * 0.05;
    rings.forEach((ring, i) => {
      const s = sats.current[i];
      if (!s) return;
      const a = t * ring.speed + i * 2.1;
      s.position.set(Math.cos(a) * ring.r, Math.sin(a) * ring.r, 0);
    });
  });

  return (
    <group ref={group}>
      {rings.map((ring, i) => (
        <group key={i} rotation={ring.tilt as [number, number, number]}>
          <mesh>
            <torusGeometry args={[ring.r, 0.004, 8, 200]} />
            <meshBasicMaterial color={ring.color} transparent opacity={0.35} />
          </mesh>
          <mesh ref={(m) => { if (m) sats.current[i] = m; }}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshBasicMaterial color={ring.color} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Neural network: nearby nodes connected by faint lines              */
/* ------------------------------------------------------------------ */
function Network({ count }: { count: number }) {
  const ref = useRef<THREE.Group>(null!);
  const { points, lines } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(3.1 + Math.random() * 1.6);
      pts.push(v);
    }
    const seg: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < 1.25) seg.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      }
    }
    const pg = new THREE.BufferGeometry().setFromPoints(pts);
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    return { points: pg, lines: lg };
  }, [count]);

  useFrame((_, dt) => {
    ref.current.rotation.y -= dt * 0.03;
    ref.current.rotation.x += dt * 0.01;
  });

  return (
    <group ref={ref}>
      <points geometry={points}>
        <pointsMaterial color="#a5b4fc" size={0.045} sizeAttenuation transparent opacity={0.9} />
      </points>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#6366f1" transparent opacity={0.14} />
      </lineSegments>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Star / data particle field                                         */
/* ------------------------------------------------------------------ */
function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixel: { value: 1 } }), []);
  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 22;
      const v = new THREE.Vector3().randomDirection().multiplyScalar(r);
      pos.set([v.x, v.y * 0.7, v.z], i * 3);
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          uniform float uTime; uniform float uPixel; attribute float aSeed; varying float vA; varying float vSeed;
          void main(){
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            float tw = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed * 1.8) + aSeed * 40.0);
            vA = tw; vSeed = aSeed;
            gl_PointSize = (1.2 + aSeed * 2.4) * uPixel * (14.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying float vA; varying float vSeed;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d) * vA;
            vec3 c = mix(vec3(0.37,0.92,0.83), vec3(0.65,0.55,0.98), vSeed);
            gl_FragColor = vec4(c, a * 0.85);
          }`,
      }),
    [uniforms],
  );

  const { gl } = useThree();
  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPixel.value = gl.getPixelRatio();
    ref.current.rotation.y += dt * (0.01 + Math.abs(input.velocity) * 0.4);
    ref.current.rotation.x = input.scroll * 0.6;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

/* ------------------------------------------------------------------ */
/*  Rig: scroll + pointer choreography                                 */
/* ------------------------------------------------------------------ */
function Rig({ mobile, children }: { mobile: boolean; children: ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const { camera } = useThree();

  useFrame((_, dt) => {
    input.velocity *= Math.pow(0.04, dt); // decay
    const s = input.scroll;
    const h = input.hero;
    // Hero: core sits on the right. After the hero it parks at the right edge, smaller, out of the text column.
    const heroX = mobile ? 0 : 2.3;
    const targetX = THREE.MathUtils.lerp(heroX, mobile ? 1.6 : 4.7, h);
    const targetY = mobile ? THREE.MathUtils.lerp(1.55, 2.4, h) : THREE.MathUtils.lerp(0, 0.6, h);
    const targetScale = THREE.MathUtils.lerp(mobile ? 0.68 : 1, mobile ? 0.55 : 0.8, h);
    const g = group.current;
    g.position.x = THREE.MathUtils.damp(g.position.x, targetX, 2.5, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY, 2.5, dt);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, targetScale, 2.5, dt));
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, input.mx * 0.35 + s * Math.PI * 1.2, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, input.my * 0.2, 3, dt);

    camera.position.x = THREE.MathUtils.damp(camera.position.x, input.mx * 0.4, 2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, -input.my * 0.25, 2, dt);
    camera.lookAt(0, 0, 0);
  });

  return <group ref={group}>{children}</group>;
}

/** Drives rendering: full rate in the hero, half rate further down, nothing while hidden or covered. */
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
      camera={{ position: [0, 0, 8.5], fov: 42 }}
      gl={{ antialias: !lowPower, alpha: true, powerPreference: 'high-performance' }}
      frameloop="demand"
      aria-hidden
    >
      {!reducedMotion && <Ticker />}
      <Rig mobile={mobile}>
        <Core detail={lowPower ? 18 : 30} />
        <Orbits />
        <Network count={lowPower ? 70 : 120} />
      </Rig>
      <Particles count={lowPower ? 900 : 2200} />
    </Canvas>
  );
}

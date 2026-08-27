'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  spread?: [number, number, number];
  size?: number;
  opacity?: number;
  /** Two colours lerped across the field. */
  colors?: [string, string];
  /** Rotation speed (rad/s). */
  speed?: number;
  reducedMotion?: boolean;
}

/**
 * Micro-particle field (plan §10) — a single buffer-geometry points cloud,
 * reused wherever atmospheric dust is needed. No instancing overhead,
 * no extra lights.
 */
export default function ParticleField({
  count = 350,
  spread = [16, 16, 12],
  size = 0.035,
  opacity = 0.6,
  colors = ['#1e2a78', '#00b3b8'],
  speed = 0.02,
  reducedMotion = false,
}: ParticleFieldProps) {
  const ref = useRef<THREE.Points>(null);

  const { positions, colorAttrs } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color(colors[0]);
    const c2 = new THREE.Color(colors[1]);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * spread[0];
      pos[i3 + 1] = (Math.random() - 0.5) * spread[1];
      pos[i3 + 2] = (Math.random() - 0.5) * spread[2];
      const c = c1.clone().lerp(c2, Math.random());
      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;
    }
    return { positions: pos, colorAttrs: col };
  }, [count, spread, colors]);

  useFrame((_, delta) => {
    if (reducedMotion || !ref.current) return;
    ref.current.rotation.y += delta * speed;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach='attributes-position' args={[positions, 3]} />
        <bufferAttribute attach='attributes-color' args={[colorAttrs, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

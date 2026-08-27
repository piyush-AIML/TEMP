'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbitProps {
  radius?: number;
  tube?: number;
  color?: string;
  opacity?: number;
  emissiveIntensity?: number;
  /** radians per second per axis — ambient rotation unless reduced motion. */
  speed?: [number, number];
  tilt?: [number, number, number];
  reducedMotion?: boolean;
}

/** Thin orbit ring (plan §10) — reused at different scales and tilts. */
export default function Orbit({
  radius = 3.2,
  tube = 0.014,
  color = '#00b3b8',
  opacity = 0.35,
  emissiveIntensity = 0.3,
  speed = [0.05, 0.08],
  tilt = [0, 0, 0],
  reducedMotion = false,
}: OrbitProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !ref.current) return;
    ref.current.rotation.x += delta * speed[0];
    ref.current.rotation.y += delta * speed[1];
  });

  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, tube, 16, 120]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

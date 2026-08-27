'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface NodeProps {
  position: [number, number, number];
  color: string;
  size?: number;
  reducedMotion?: boolean;
}

/**
 * Ecosystem node (plan §10) — a softly emissive sphere with a thin halo
 * ring. No per-node lights: the material itself carries the glow.
 */
export default function Node({ position, color, size = 0.16, reducedMotion = false }: NodeProps) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !ringRef.current) return;
    ringRef.current.rotation.z += delta * 0.4;
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 1.6}
      rotationIntensity={0.2}
      floatIntensity={0.5}
    >
      <group position={position}>
        <mesh>
          <sphereGeometry args={[size, 24, 24]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.35} />
        </mesh>
        <mesh ref={ringRef} rotation-x={Math.PI / 2}>
          <torusGeometry args={[size * 2.1, 0.008, 8, 48]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>
    </Float>
  );
}

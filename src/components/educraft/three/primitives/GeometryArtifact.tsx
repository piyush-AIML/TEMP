'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface GeometryArtifactProps {
  position: [number, number, number];
  color?: string;
  variant?: 'icosahedron' | 'octahedron';
  size?: number;
  speed?: number;
  reducedMotion?: boolean;
}

/**
 * Floating wireframe geometry (plan §10) — depth-plane artefacts that
 * give the scene layers without competing with the nodes.
 */
export default function GeometryArtifact({
  position,
  color = '#1e2a78',
  variant = 'icosahedron',
  size = 0.32,
  speed = 1,
  reducedMotion = false,
}: GeometryArtifactProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !ref.current) return;
    ref.current.rotation.x += delta * 0.15 * speed;
    ref.current.rotation.z += delta * 0.1 * speed;
  });

  return (
    <Float speed={reducedMotion ? 0 : speed * 0.8} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={ref} position={position}>
        {variant === 'icosahedron' ? (
          <icosahedronGeometry args={[size, 0]} />
        ) : (
          <octahedronGeometry args={[size, 0]} />
        )}
        <meshStandardMaterial color={color} transparent opacity={0.14} wireframe />
      </mesh>
    </Float>
  );
}

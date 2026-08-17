'use client';
import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const NODE_COLORS = ['#1E2A78', '#00B3B8', '#F4B942', '#3B4896', '#00898D'];

function RingAndNodes() {
  const groupRef = useRef<THREE.Group>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useFrame((_, delta) => {
    if (!reducedMotion && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef} rotation-x={-Math.PI / 3.5}>
      {/* Orbit ring */}
      <mesh>
        <torusGeometry args={[2.5, 0.012, 16, 80]} />
        <meshStandardMaterial
          color='#00B3B8'
          transparent
          opacity={0.4}
          emissive='#00B3B8'
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* 5 nodes */}
      {NODE_COLORS.map((color, i) => {
        const angle = (Math.PI * 2 * i) / 5;
        return (
          <mesh key={i} position={[Math.cos(angle) * 2.5, 0, Math.sin(angle) * 2.5]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
          </mesh>
        );
      })}

      {/* Inner connecting ring */}
      <mesh>
        <torusGeometry args={[1.2, 0.008, 16, 60]} />
        <meshStandardMaterial
          color='#1E2A78'
          transparent
          opacity={0.2}
          emissive='#1E2A78'
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
}

export default function CourseOrbit3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className='w-full aspect-square' />;

  return (
    <div className='w-full aspect-square max-w-[500px] mx-auto'>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 5, 5]} intensity={0.6} />
        <RingAndNodes />
        <Stars radius={30} depth={30} count={200} factor={2} saturation={0} fade speed={0.3} />
      </Canvas>
    </div>
  );
}

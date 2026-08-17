'use client';
import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function OrbitRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useFrame((_, delta) => {
    if (!reducedMotion && ringRef.current) {
      ringRef.current.rotation.x += delta * 0.05;
      ringRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[3.2, 0.015, 16, 100]} />
      <meshStandardMaterial
        color='#00B3B8'
        transparent
        opacity={0.35}
        emissive='#00B3B8'
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function OrbitNode({ angle, color, size = 0.12 }: { angle: number; color: string; size?: number }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!reducedMotion && ref.current) {
      ref.current.rotation.y += delta * 0.5;
    }
  });

  const x = Math.cos(angle) * 3.2;
  const z = Math.sin(angle) * 3.2;

  return (
    <Float speed={reducedMotion ? 0 : 1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={ref} position={[x, 0, z]}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight position={[x, 0, z]} color={color} intensity={0.5} distance={1.5} />
    </Float>
  );
}

function IcosahedronShape({ position, color, speed = 1 }: { position: [number, number, number]; color: string; speed?: number }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const ref = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useFrame((_, delta) => {
    if (!reducedMotion && ref.current) {
      ref.current.rotation.x += delta * 0.15 * speed;
      ref.current.rotation.z += delta * 0.1 * speed;
    }
  });

  return (
    <Float speed={reducedMotion ? 0 : speed * 0.8} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={color} transparent opacity={0.15} wireframe />
      </mesh>
    </Float>
  );
}

function OctahedronShape({ position, color, speed = 1 }: { position: [number, number, number]; color: string; speed?: number }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const ref = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useFrame((_, delta) => {
    if (!reducedMotion && ref.current) {
      ref.current.rotation.x += delta * 0.15 * speed;
      ref.current.rotation.z += delta * 0.1 * speed;
    }
  });

  return (
    <Float speed={reducedMotion ? 0 : speed * 0.8} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={ref} position={position}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={color} transparent opacity={0.15} wireframe />
      </mesh>
    </Float>
  );
}

function SceneContent() {
  const nodeAngles = useMemo(
    () => [0, (Math.PI * 2) / 5, (Math.PI * 4) / 5, (Math.PI * 6) / 5, (Math.PI * 8) / 5],
    []
  );
  const nodeColors = ['#1E2A78', '#00B3B8', '#F4B942', '#3B4896', '#00898D'];

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color='#ffffff' />
      <directionalLight position={[-3, 2, -3]} intensity={0.3} color='#00B3B8' />
      <OrbitRing />
      {nodeAngles.map((angle, i) => (
        <OrbitNode key={i} angle={angle} color={nodeColors[i]} />
      ))}
      <IcosahedronShape position={[-4.5, 1.5, -2]} color='#1E2A78' speed={0.8} />
      <OctahedronShape position={[4, -1, -3]} color='#00B3B8' speed={1.2} />
      <IcosahedronShape position={[-2, -2, -1.5]} color='#F4B942' speed={0.6} />
      <OctahedronShape position={[3.5, 2, -2.5]} color='#3B4896' speed={1} />
      <Stars radius={50} depth={50} count={1500} factor={3} saturation={0} fade speed={0.5} />
    </>
  );
}

export default function HeroScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className='absolute inset-0 w-full h-full canvas-container' style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}

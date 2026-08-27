'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useTheme } from 'next-themes';
import * as THREE from 'three';
import CanvasShell from '../core/CanvasShell';
import Lighting from '../core/Lighting';
import CameraRig from '../core/CameraRig';
import Node from '../primitives/Node';
import Orbit from '../primitives/Orbit';
import Connector from '../primitives/Connector';
import ParticleField from '../primitives/ParticleField';
import GeometryArtifact from '../primitives/GeometryArtifact';
import GlowLayer from '../primitives/GlowLayer';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSceneActive } from '../hooks/useSceneActive';
import { programmes } from '@/data/programmes';
import { programmeColors } from '@/design/colors';

const NODE_RADIUS = 3.2;

interface EcosystemSceneProps {
  /** 0..1 scroll progress through the hero — scroll-linked transformation (plan §4.2). */
  progress?: number;
}

/**
 * The coordinated ecosystem visual (plan §10, §36) — one scene, built
 * from reusable primitives: core form, five pillar nodes, connections,
 * depth planes, glow, and atmosphere. Theme-aware: accents brighten in
 * dark mode (plan §44).
 */
export default function EcosystemScene({ progress = 0 }: EcosystemSceneProps) {
  const [mounted, setMounted] = useState(false);
  const reducedMotion = useReducedMotion();
  const { ref, active } = useSceneActive<HTMLDivElement>();
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const nodeColors = useMemo(() => {
    const dark = resolvedTheme === 'dark';
    return programmes.map((p) => {
      const c = programmeColors[p.pillarId];
      return dark ? c.darkMain : c.strong;
    });
  }, [resolvedTheme]);

  if (!mounted) return null;

  return (
    <div ref={ref} className='absolute inset-0 w-full h-full' style={{ zIndex: 0 }}>
      <CanvasShell active={active}>
        <EcosystemContent
          progress={progress}
          reducedMotion={reducedMotion}
          nodeColors={nodeColors}
          dark={resolvedTheme === 'dark'}
        />
      </CanvasShell>
    </div>
  );
}

function EcosystemContent({
  progress,
  reducedMotion,
  nodeColors,
  dark,
}: {
  progress: number;
  reducedMotion: boolean;
  nodeColors: string[];
  dark: boolean;
}) {
  const nodesGroup = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !nodesGroup.current) return;
    nodesGroup.current.rotation.y += delta * 0.06;
  });

  const nodes = useMemo(
    () =>
      programmes.map((_, i) => {
        const angle = (Math.PI * 2 * i) / 5;
        return {
          x: Math.cos(angle) * NODE_RADIUS,
          y: Math.sin(angle * 2) * 0.35,
          z: Math.sin(angle) * NODE_RADIUS,
        };
      }),
    []
  );

  const coreColor = dark ? '#7c86c9' : '#1e2a78';
  const artifactA = dark ? '#7c86c9' : '#1e2a78';

  return (
    <>
      <Lighting />
      <CameraRig progress={progress} reducedMotion={reducedMotion} />

      <group scale={1 - progress * 0.1}>
        {/* Core form */}
        <mesh>
          <icosahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial
            color={coreColor}
            emissive={coreColor}
            emissiveIntensity={0.35}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
        <GlowLayer position={[0, 0, 0]} color='#00b3b8' scale={4.5} opacity={dark ? 0.4 : 0.28} />

        {/* Orbit rings at different tilts and speeds */}
        <Orbit
          radius={NODE_RADIUS}
          tilt={[Math.PI / 2.4, 0, 0]}
          reducedMotion={reducedMotion}
        />
        <Orbit
          radius={NODE_RADIUS}
          tilt={[Math.PI / 1.7, 0.3, 0]}
          color='#3b4896'
          opacity={0.18}
          tube={0.01}
          speed={[-0.03, -0.05]}
          reducedMotion={reducedMotion}
        />
        <Orbit
          radius={4.6}
          tube={0.008}
          opacity={0.12}
          color='#3b4896'
          speed={[0.02, 0.03]}
          reducedMotion={reducedMotion}
        />

        {/* Five pillar nodes + core connections — drift apart on scroll */}
        <group ref={nodesGroup} scale={1 + progress * 0.25}>
          {nodes.map((n, i) => (
            <group key={i}>
              <Connector from={[0, 0, 0]} to={[n.x, n.y, n.z]} color={nodeColors[i]} opacity={0.22} />
              <Node position={[n.x, n.y, n.z]} color={nodeColors[i]} reducedMotion={reducedMotion} />
            </group>
          ))}
        </group>

        {/* Depth-plane artefacts */}
        <GeometryArtifact
          position={[-4.5, 1.6, -2.5]}
          color={artifactA}
          speed={0.8}
          reducedMotion={reducedMotion}
        />
        <GeometryArtifact
          position={[4.2, -1.4, -3]}
          variant='octahedron'
          color='#00b3b8'
          speed={1.2}
          reducedMotion={reducedMotion}
        />
        <GeometryArtifact
          position={[-2.2, -2.2, -1.8]}
          variant='octahedron'
          color='#f4b942'
          size={0.24}
          speed={0.6}
          reducedMotion={reducedMotion}
        />

        {/* Atmosphere */}
        <ParticleField reducedMotion={reducedMotion} />
        <Stars
          radius={60}
          depth={40}
          count={1200}
          factor={3}
          saturation={0}
          fade
          speed={reducedMotion ? 0 : 0.5}
        />
      </group>
    </>
  );
}

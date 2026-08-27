'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface GlowLayerProps {
  position: [number, number, number];
  color?: string;
  scale?: number;
  opacity?: number;
}

/**
 * Soft volumetric glow (plan §10) — an additive radial sprite behind the
 * core form. Replaces the per-node point-light approach with a single
 * cheap texture (plan §35).
 */
export default function GlowLayer({
  position,
  color = '#00b3b8',
  scale = 4.5,
  opacity = 0.28,
}: GlowLayerProps) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);

  if (!texture) return null;

  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial
        map={texture}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}

'use client';

import { type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import { cn } from '@/lib/utils';

interface CanvasShellProps {
  children: ReactNode;
  camera?: { position: [number, number, number]; fov: number };
  /** Pauses the render loop when the scene is off-screen (plan §35). */
  active?: boolean;
  className?: string;
  dpr?: [number, number];
}

/**
 * Shared WebGL infrastructure (plan §36) — one canvas shell for every
 * scene: transparent background, device-aware DPR, and off-screen pausing.
 * No scene should invent its own Canvas setup.
 */
export default function CanvasShell({
  children,
  camera = { position: [0, 0, 8], fov: 50 },
  active = true,
  className,
  dpr = [1, 1.5],
}: CanvasShellProps) {
  return (
    <div className={cn('absolute inset-0 w-full h-full canvas-container', className)}>
      <Canvas
        camera={camera}
        dpr={dpr}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        frameloop={active ? 'always' : 'never'}
      >
        <AdaptiveDpr pixelated={false} />
        {children}
      </Canvas>
    </div>
  );
}

'use client';

import { useThree, useFrame } from '@react-three/fiber';

interface CameraRigProps {
  /** 0..1 scroll progress through the section — drives the pull-back (plan §4). */
  progress?: number;
  /** Static composition under reduced motion (plan §10). */
  reducedMotion?: boolean;
  /** Multiplier for pointer parallax. */
  parallax?: number;
}

/**
 * Scroll-linked, cursor-responsive camera (plan §10, §36).
 * Eases toward a target computed from scroll progress and pointer position.
 */
export default function CameraRig({ progress = 0, reducedMotion = false, parallax = 0.7 }: CameraRigProps) {
  const { camera, pointer } = useThree();

  useFrame((_, delta) => {
    if (reducedMotion) return;
    const damp = Math.min(1, delta * 2.5);
    const targetX = pointer.x * parallax * 1.4;
    const targetY = pointer.y * parallax * 0.9 + progress * 1.8;
    const targetZ = 8 + progress * 3.5;

    // Imperative Three.js scene-graph mutation is the canonical R3F
    // useFrame pattern — this is not React state, so immutability does not apply.
    // eslint-disable-next-line react-hooks/immutability
    camera.position.x += (targetX - camera.position.x) * damp;
    camera.position.y += (targetY - camera.position.y) * damp;
    camera.position.z += (targetZ - camera.position.z) * damp;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

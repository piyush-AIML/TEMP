'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface ConnectorProps {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
  opacity?: number;
}

/**
 * A thin connection line between two points (plan §10) — core-to-node
 * links that make the ecosystem read as one connected system.
 */
export default function Connector({ from, to, color = '#3b4896', opacity = 0.25 }: ConnectorProps) {
  const positions = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    // Slight midpoint lift gives the line a gentle arc.
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.z += a.distanceTo(b) * 0.12;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const points = curve.getPoints(24).flatMap((p) => [p.x, p.y, p.z]);
    return new Float32Array(points);
  }, [from, to]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach='attributes-position' args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

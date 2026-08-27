'use client';

/**
 * Shared scene lighting (plan §36) — a single restrained rig.
 * No per-node point lights (plan §68): emissive materials and glow
 * sprites carry the colour work instead.
 */
export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 6, 5]} intensity={0.9} color='#ffffff' />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} color='#00b3b8' />
    </>
  );
}

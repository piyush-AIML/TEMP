/**
 * v4 atmosphere (FC-05) — fixed film-grain layer over the whole marketing site.
 * A ~1 KB feTurbulence SVG data-URI, tiled; pure decoration (aria-hidden,
 * pointer-events-none). Sits on the overlay z-rung — above nav/dropdowns,
 * below modals (legibility) and the cursor. Static, so there is nothing to
 * gate under reduced motion.
 */
export default function GrainOverlay() {
  return <div aria-hidden='true' className='grain-overlay' />;
}

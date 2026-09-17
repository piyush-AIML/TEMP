/**
 * About — "Global outreach" network visual.
 *
 * The confirmed node is the owner-stated location (2026-09-18): Sharjah,
 * United Arab Emirates. No partner countries, counts, or additional locations
 * exist to draw, and none may be invented — the open dashed nodes are slots
 * for owner-supplied locations, not claims. (Note: /contact, /privacy and
 * /terms still publish an earlier Bangalore address; reconciling those pages
 * is outside this page's scope.)
 *
 * Static SVG, no client JS, nothing to gate under reduced motion. The facts
 * are also written beside it in the page copy, so the graphic is never the
 * only carrier of meaning.
 */
export default function OutreachNetwork() {
  return (
    <div className='card-surface relative overflow-hidden p-6 md:p-8'>
      <span className='eyebrow text-ec-slate'>Global network</span>

      <svg
        viewBox='0 0 600 420'
        role='img'
        aria-label='Network diagram: one confirmed location for the Sharjah office, with open connections awaiting confirmed locations and partners.'
        className='mt-4 w-full text-ec-teal'
        fill='none'
      >
        {/* Confirmed hub → open nodes */}
        {[
          { x: 130, y: 92 },
          { x: 470, y: 92 },
          { x: 96, y: 330 },
          { x: 504, y: 330 },
          { x: 300, y: 52 },
        ].map((node, i) => (
          <path
            key={i}
            d={`M 300 210 Q ${(300 + node.x) / 2} ${(210 + node.y) / 2}, ${node.x} ${node.y}`}
            stroke='var(--ec-border)'
            strokeWidth='1.5'
            strokeDasharray='4 7'
          />
        ))}

        {/* Open nodes — no labels: nothing to name yet */}
        {[
          { x: 130, y: 92 },
          { x: 470, y: 92 },
          { x: 96, y: 330 },
          { x: 504, y: 330 },
          { x: 300, y: 52 },
        ].map((node, i) => (
          <circle
            key={`open-${i}`}
            cx={node.x}
            cy={node.y}
            r='11'
            stroke='var(--ec-border)'
            strokeWidth='1.5'
            strokeDasharray='3 4'
          />
        ))}

        {/* Confirmed node */}
        <circle cx='300' cy='210' r='34' fill='var(--ec-p-learn-soft)' />
        <circle cx='300' cy='210' r='16' fill='currentColor' />
        <circle cx='300' cy='210' r='5' fill='var(--card)' />

        <text
          x='300'
          y='266'
          textAnchor='middle'
          fontFamily='var(--font-manrope)'
          fontWeight='700'
          fontSize='15'
          fill='var(--ec-ink)'
        >
          Sharjah, UAE
        </text>
        <text
          x='300'
          y='288'
          textAnchor='middle'
          fontFamily='var(--font-manrope)'
          fontWeight='500'
          fontSize='12'
          fill='var(--ec-slate)'
        >
          Office &amp; operations
        </text>
      </svg>

      <ul className='mt-6 space-y-3'>
        <li className='flex items-start gap-3'>
          <span aria-hidden='true' className='mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-ec-learn' />
          <span className='type-body-s text-ec-slate'>
            Confirmed: office and operations, Sharjah, United Arab Emirates.
          </span>
        </li>
        <li className='flex items-start gap-3'>
          <span
            aria-hidden='true'
            className='mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full border border-dashed border-ec-hairline-strong'
          />
          <span className='type-body-s text-ec-slate'>
            Open: additional locations and partnerships to be confirmed.
          </span>
        </li>
      </ul>

      <p className='type-caption uppercase tracking-[0.08em] text-ec-slate mt-5'>
        Owner input required
      </p>
    </div>
  );
}

import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Educraft — Five paths. One learning ecosystem.';

/** Homepage social preview (plan §46). */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '72px',
          background:
            'linear-gradient(135deg, #141D57 0%, #1E2A78 45%, #0B0F1E 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Ecosystem motif */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          {['#00B3B8', '#4A86D9', '#8B7BD8', '#F4B942', '#7C86C9'].map((c) => (
            <div
              key={c}
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: c,
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: '64px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            maxWidth: '900px',
          }}
        >
          <span>Five paths.</span>
          <span>
            One learning <span style={{ color: '#3FCBCF' }}>ecosystem</span>.
          </span>
        </div>
        <div style={{ fontSize: '26px', color: 'rgba(255,255,255,0.7)', marginTop: '28px' }}>
          Linguistics · Inclusion · Wellbeing · AI & Digital · NEET/JEE
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '56px',
            right: '72px',
            fontSize: '24px',
            fontWeight: 600,
            color: '#F4B942',
          }}
        >
          Educraft
        </div>
      </div>
    ),
    { ...size }
  );
}

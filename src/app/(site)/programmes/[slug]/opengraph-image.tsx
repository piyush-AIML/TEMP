import { ImageResponse } from 'next/og';
import { getProgrammeBySlug } from '@/data/programmes';
import { pillars } from '@/data/pillars';
import { brand, programmeColors } from '@/design/colors';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const DARK_BG = '#0B0F1E';

/** Programme social previews (plan §46). */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const programme = getProgrammeBySlug(slug);
  const pillar = programme ? pillars.find((pl) => pl.id === programme.pillarId) : undefined;
  const accent = programme ? programmeColors[programme.pillarId] : undefined;
  /** Text role on the dark OG gradient — must clear AA there. */
  const accentText = accent?.textDark ?? brand.tealTextDark;
  /** Non-text role for the status dot. */
  const accentDot = accent?.graphicDark ?? brand.tealGraphicDark;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          background: `linear-gradient(135deg, ${DARK_BG} 0%, #141D57 70%, ${DARK_BG} 100%)`,
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: accentText,
            marginBottom: '24px',
          }}
        >
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: accentDot }} />
          {pillar?.name} — {pillar?.vertical}
        </div>
        <div
          style={{
            fontSize: '60px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            maxWidth: '950px',
          }}
        >
          {programme?.name ?? 'Educraft Programme'}
        </div>
        <div style={{ fontSize: '26px', color: 'rgba(255,255,255,0.75)', marginTop: '24px', maxWidth: '850px' }}>
          {programme?.tagline}
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

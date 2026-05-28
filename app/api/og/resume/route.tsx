import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Job Seeker';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #faf8f4 0%, #fff8e7 100%)',
          fontFamily: 'sans-serif',
          padding: '80px',
        }}
      >
        {/* Top accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: '#f59e0b', display: 'flex' }} />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            background: '#fef3c7',
            border: '1.5px solid #f59e0b',
            borderRadius: '100px',
            padding: '6px 20px',
            marginBottom: '32px',
          }}
        >
          <span style={{ color: '#92400e', fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Resume Builder
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '54px',
            fontWeight: 800,
            color: '#0f172a',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: '20px',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Sub */}
        <div style={{ fontSize: '24px', color: '#64748b', textAlign: 'center', marginBottom: '56px' }}>
          Built with Addify Resume Builder
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#f59e0b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#0f172a', fontSize: '16px', fontWeight: 800 }}>A</span>
          </div>
          <span style={{ fontSize: '18px', color: '#475569', fontWeight: 600 }}>addify.ae</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Generic OG image for any page that doesn't generate its own — replaces
// the previously-referenced /og-default.png, which was never a real file
// and 404'd on every page that pointed at it (every job posting page, and
// the sitewide default before this route existed).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Gulf Careers, Clarified.';

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
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: '#f59e0b', display: 'flex' }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '40px',
          }}
        >
          <div style={{ width: '40px', height: '40px', background: '#f59e0b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#0f172a', fontSize: '20px', fontWeight: 800 }}>A</span>
          </div>
          <span style={{ fontSize: '28px', color: '#0f172a', fontWeight: 700 }}>Addify</span>
        </div>

        <div
          style={{
            fontSize: '54px',
            fontWeight: 800,
            color: '#0f172a',
            textAlign: 'center',
            lineHeight: 1.15,
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        <div style={{ fontSize: '24px', color: '#64748b', textAlign: 'center', marginTop: '24px' }}>
          Salary data and free career tools for the Gulf
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

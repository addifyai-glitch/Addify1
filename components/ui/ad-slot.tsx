'use client';

import { useEffect, useRef } from 'react';

type AdFormat = 'in-article' | 'multiplex' | 'in-feed' | 'display';

interface AdSlotProps {
  format?: AdFormat;
  slotId?: string;
  className?: string;
}

const SLOT_MAP: Record<AdFormat, string | undefined> = {
  'in-article': process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE,
  'multiplex':  process.env.NEXT_PUBLIC_ADSENSE_SLOT_MULTIPLEX,
  'in-feed':    process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED,
  'display':    process.env.NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY,
};

const ADSENSE_CLIENT  = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-3315075439326038';
const ADSENSE_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== 'false';

export function AdSlot({ format = 'in-article', slotId, className = '' }: AdSlotProps) {
  const insRef    = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  const resolvedSlotId = slotId || SLOT_MAP[format];

  useEffect(() => {
    if (!ADSENSE_ENABLED) return;
    if (!resolvedSlotId) return;
    if (pushedRef.current) return;
    try {
      // @ts-expect-error - adsbygoogle is injected by Google's script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (e) {
      console.warn('[AdSlot] adsbygoogle.push failed:', e);
    }
  }, [resolvedSlotId]);

  if (!ADSENSE_ENABLED || !resolvedSlotId) return null;

  const { style, dataAttrs } = getFormatProps(format);

  return (
    <div className={`w-full flex justify-center my-6 ${className}`}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={resolvedSlotId}
        {...dataAttrs}
      />
    </div>
  );
}

function getFormatProps(format: AdFormat): {
  style: React.CSSProperties;
  dataAttrs: Record<string, string>;
} {
  switch (format) {
    case 'in-article':
      return {
        style:     { display: 'block', textAlign: 'center', minHeight: '280px', width: '100%' },
        dataAttrs: { 'data-ad-layout': 'in-article', 'data-ad-format': 'fluid' },
      };
    case 'multiplex':
      return {
        style:     { display: 'block', minHeight: '320px', width: '100%' },
        dataAttrs: { 'data-ad-format': 'autorelaxed' },
      };
    case 'in-feed':
      return {
        style:     { display: 'block', minHeight: '180px', width: '100%' },
        dataAttrs: { 'data-ad-format': 'fluid', 'data-ad-layout-key': '-fb+5w+4e-db+86' },
      };
    case 'display':
    default:
      return {
        style:     { display: 'block', minHeight: '90px', width: '100%' },
        dataAttrs: { 'data-ad-format': 'auto', 'data-full-width-responsive': 'true' },
      };
  }
}

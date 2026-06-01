'use client';

import { useState, useRef } from 'react';

const FRAME = 200;

interface Props {
  value?: string;
  onChange: (photo: string | undefined) => void;
}

export function PhotoUpload({ value, onChange }: Props) {
  const [rawImage, setRawImage] = useState<HTMLImageElement | null>(null);
  const [imgX, setImgX] = useState(0);
  const [imgY, setImgY] = useState(0);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [sizeKB, setSizeKB] = useState<number | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  function constrain(x: number, y: number, img: HTMLImageElement, s: number) {
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    return {
      x: Math.min(0, Math.max(x, FRAME - w)),
      y: Math.min(0, Math.max(y, FRAME - h)),
    };
  }

  function handleFile(file: File) {
    setError(null);
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB. Please choose a smaller file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const s = Math.max(FRAME / img.naturalWidth, FRAME / img.naturalHeight);
        const w = img.naturalWidth * s;
        const h = img.naturalHeight * s;
        const pos = constrain((FRAME - w) / 2, (FRAME - h) / 2, img, s);
        setScale(s);
        setImgX(pos.x);
        setImgY(pos.y);
        setRawImage(img);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  function onPointerDown(cx: number, cy: number) {
    setDragging(true);
    setDragStart({ x: cx - imgX, y: cy - imgY });
  }

  function onPointerMove(cx: number, cy: number) {
    if (!dragging || !rawImage) return;
    const pos = constrain(cx - dragStart.x, cy - dragStart.y, rawImage, scale);
    setImgX(pos.x);
    setImgY(pos.y);
  }

  function onPointerUp() {
    setDragging(false);
  }

  function saveCrop() {
    if (!rawImage) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sx = -imgX / scale;
    const sy = -imgY / scale;
    const sw = FRAME / scale;
    const sh = FRAME / scale;
    ctx.drawImage(rawImage, sx, sy, sw, sh, 0, 0, 400, 400);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64 = dataUrl.split(',')[1] ?? '';
    const byteSize = Math.round(base64.length * 0.75);
    const kb = Math.round(byteSize / 1024);

    if (byteSize > 300 * 1024) {
      setError('Photo too large after compression. Try a smaller or simpler image.');
      return;
    }

    setSizeKB(kb);
    setRawImage(null);
    setError(null);
    onChange(dataUrl);
  }

  function remove() {
    onChange(undefined);
    setSizeKB(null);
    setError(null);
    setRawImage(null);
  }

  return (
    <div className="space-y-3">
      {value && !rawImage && (
        <div className="flex items-center gap-4">
          <img src={value} alt="" className="w-20 h-20 rounded-full object-cover border border-border" />
          <div className="flex gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} className="text-sm underline text-foreground/75 hover:text-foreground transition-colors">
              Replace
            </button>
            <button type="button" onClick={remove} className="text-sm underline text-destructive hover:opacity-80 transition-opacity">
              Remove
            </button>
          </div>
        </div>
      )}

      {!value && !rawImage && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2 rounded-lg border border-dashed border-border hover:bg-muted text-sm text-foreground/75 hover:text-foreground transition-colors"
        >
          + Add profile photo (optional)
        </button>
      )}

      {rawImage && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Drag to position, then click Save.</p>
          <div
            className="relative overflow-hidden rounded-full border-2 border-accent cursor-move select-none bg-muted"
            style={{ width: FRAME, height: FRAME }}
            onMouseDown={(e) => { e.preventDefault(); onPointerDown(e.clientX, e.clientY); }}
            onMouseMove={(e) => onPointerMove(e.clientX, e.clientY)}
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onTouchStart={(e) => { e.preventDefault(); onPointerDown(e.touches[0].clientX, e.touches[0].clientY); }}
            onTouchMove={(e) => { e.preventDefault(); onPointerMove(e.touches[0].clientX, e.touches[0].clientY); }}
            onTouchEnd={onPointerUp}
          >
            <img
              src={rawImage.src}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                left: `${imgX}px`,
                top: `${imgY}px`,
                width: `${rawImage.naturalWidth * scale}px`,
                height: `${rawImage.naturalHeight * scale}px`,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={saveCrop}
              className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Save photo
            </button>
            <button
              type="button"
              onClick={() => setRawImage(null)}
              className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground/75 hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {sizeKB !== null && !rawImage && (
        <p className="text-xs text-muted-foreground">Photo size after compression: {sizeKB} KB</p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        Optional. Photos are common on Gulf and EU CVs. Skip for US, UK, or remote-first roles where some ATS systems may reject resumes with images.
      </p>
    </div>
  );
}

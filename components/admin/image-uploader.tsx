'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

interface Props {
  value: string;
  altValue: string;
  onChangeUrl: (url: string) => void;
  onChangeAlt: (alt: string) => void;
}

export function ImageUploader({ value, altValue, onChangeUrl, onChangeAlt }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(!value);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const body = new FormData();
      body.append('file', file);

      const res = await fetch('/api/admin/blog/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || 'Upload failed');
        return;
      }

      onChangeUrl(data.url);
      setShowUrlInput(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const syntheticEvent = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(syntheticEvent);
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Hero image <span className="normal-case font-normal">(optional)</span>
      </label>

      {/* Preview */}
      {value && (
        <div className="relative rounded-xl overflow-hidden border border-border bg-muted aspect-[21/8] w-full">
          <Image
            src={value}
            alt={altValue || 'Hero image preview'}
            fill
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={() => { onChangeUrl(''); setShowUrlInput(true); }}
            className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-semibold text-foreground hover:bg-background transition-colors border border-border"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-semibold text-foreground hover:bg-background transition-colors border border-border disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Replace'}
          </button>
        </div>
      )}

      {/* Drop zone (shown when no image) */}
      {!value && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-10 cursor-pointer hover:border-accent hover:bg-muted/60 transition-colors ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {uploading ? (
            <p className="text-sm text-muted-foreground">Uploading...</p>
          ) : (
            <>
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPEG, WebP, GIF up to 5 MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      {uploadError && (
        <p className="text-xs text-destructive">{uploadError}</p>
      )}

      {/* Paste URL toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowUrlInput((v) => !v)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showUrlInput ? 'Hide URL field' : 'Or paste an image URL instead'}
        </button>
        {showUrlInput && (
          <input
            type="url"
            value={value}
            onChange={(e) => { onChangeUrl(e.target.value); if (e.target.value) setShowUrlInput(false); }}
            placeholder="https://images.unsplash.com/..."
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        )}
      </div>

      {/* Alt text */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
          Alt text
        </label>
        <input
          type="text"
          value={altValue}
          onChange={(e) => onChangeAlt(e.target.value)}
          placeholder="Descriptive alt text for accessibility"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>
    </div>
  );
}

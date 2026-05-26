'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  jobId: string;
  jobTitle: string;
}

export function SubmissionActions({ jobId, jobTitle }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    if (!confirm(`Approve "${jobTitle}"? It will go live on /jobs immediately.`)) return;

    setBusy('approve');
    setError(null);

    try {
      const res = await fetch(`/api/admin/submissions/${jobId}`, {
        method: 'PATCH',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Approval failed');
        setBusy(null);
        return;
      }

      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
      setBusy(null);
    }
  }

  async function handleReject() {
    if (!confirm(`Reject "${jobTitle}"? This will permanently delete the submission.`)) return;

    setBusy('reject');
    setError(null);

    try {
      const res = await fetch(`/api/admin/submissions/${jobId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Rejection failed');
        setBusy(null);
        return;
      }

      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
      setBusy(null);
    }
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2 shrink-0">
        <div className="text-xs text-destructive">{error}</div>
        <button
          onClick={() => setError(null)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={handleApprove}
        disabled={busy !== null}
        className="px-4 py-1.5 rounded-full bg-success/15 text-success text-xs font-semibold hover:bg-success/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy === 'approve' ? 'Approving...' : 'Approve'}
      </button>
      <button
        onClick={handleReject}
        disabled={busy !== null}
        className="px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy === 'reject' ? 'Rejecting...' : 'Reject'}
      </button>
    </div>
  );
}

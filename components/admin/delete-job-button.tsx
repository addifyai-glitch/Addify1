"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteJobButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this job permanently?")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Delete failed");
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="text-xs text-destructive hover:opacity-70 transition-opacity disabled:opacity-50"
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}

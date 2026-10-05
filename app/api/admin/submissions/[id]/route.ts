import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { sendJobApprovedEmail } from '@/lib/email';
import { revalidateJobPages } from '@/lib/revalidate-content';

export const runtime = 'nodejs';

// PATCH /api/admin/submissions/[id] — Approve
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: job, error } = await supabase
      .from('jobs')
      .update({
        approved: true,
        modified_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('title, slug, submitter_email')
      .single();

    if (error) {
      console.error('[admin/approve] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // An approved submission becomes public: refresh the job pages now.
    revalidateJobPages(job?.slug);

    if (job?.submitter_email) {
      await sendJobApprovedEmail(job.submitter_email, job.title, job.slug);
    }

    return NextResponse.json({ success: true, action: 'approved' });
  } catch (e) {
    console.error('[admin/approve] Exception:', e);
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/submissions/[id] — Reject (delete the row)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('approved, source')
      .eq('id', id)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.approved === true) {
      return NextResponse.json(
        { error: 'Cannot reject an already-approved job. Edit it from /admin/jobs instead.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[admin/reject] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, action: 'rejected' });
  } catch (e) {
    console.error('[admin/reject] Exception:', e);
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

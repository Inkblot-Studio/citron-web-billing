import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { emptyUsage, type UsageSummary } from '@/lib/usage';
import { citronApiConfigured, fetchUsageByOwner } from '@/lib/citron-api';

export const dynamic = 'force-dynamic';

/**
 * Usage summary for the signed-in user's workspace, from citron-api.
 * Falls back to a zeroed summary when the platform API is not configured.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to view usage.' }, { status: 401 });
  }

  if (citronApiConfigured()) {
    const live = await fetchUsageByOwner<UsageSummary>(user.email);
    if (live) return NextResponse.json(live);
  }
  return NextResponse.json(emptyUsage(user.workspace ?? 'Your workspace'));
}

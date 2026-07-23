import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { emptyBilling, type BillingSummary } from '@/lib/billing-types';
import { citronApiConfigured, fetchBillingSummary } from '@/lib/citron-api';

export const dynamic = 'force-dynamic';

/** Billing summary (plan + credits + invoices) for the signed-in user. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to view billing.' }, { status: 401 });
  }

  if (citronApiConfigured()) {
    const live = await fetchBillingSummary<BillingSummary>(user.email);
    if (live) return NextResponse.json(live);
  }
  return NextResponse.json(emptyBilling());
}

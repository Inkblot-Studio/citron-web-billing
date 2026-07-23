import { NextResponse } from 'next/server';
import { getStripe, STRIPE_UNAVAILABLE } from '@/lib/stripe';
import { getSessionUser } from '@/lib/session';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * Opens the Stripe Customer Portal for the signed-in user so they can manage
 * their subscription, payment methods, and invoices. Customer is looked up by
 * the session email.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: STRIPE_UNAVAILABLE }, { status: 503 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to manage billing.' }, { status: 401 });
  }

  try {
    const { data } = await stripe.customers.list({ email: user.email, limit: 1 });
    const customer = data[0];
    if (!customer) {
      return NextResponse.json(
        { error: 'No billing account found for this email yet. Complete a checkout first.' },
        { status: 404 }
      );
    }

    const origin = req.headers.get('origin') ?? siteConfig.url;
    const portal = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${origin}/billing`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (e) {
    console.error('[billing/portal] failed:', e);
    return NextResponse.json(
      { error: 'Could not open the billing portal. Please try again.' },
      { status: 502 }
    );
  }
}

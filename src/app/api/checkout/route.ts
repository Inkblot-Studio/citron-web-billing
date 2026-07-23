import { NextResponse } from 'next/server';
import { getStripe, STRIPE_UNAVAILABLE } from '@/lib/stripe';
import { getSessionUser } from '@/lib/session';
import { siteConfig } from '@/lib/site';
import { getCreditPack } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

const MAX_PACK_QTY = 20;

/**
 * One-time checkout for AI credit top-ups, initiated from the billing
 * dashboard. Prices are rebuilt server-side from the catalog. The completed
 * session is provisioned by the shared Stripe webhook (in citron-web), which
 * reads `citron_cart` metadata — same compact format used across the suite.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: STRIPE_UNAVAILABLE }, { status: 503 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to buy credits.' }, { status: 401 });
  }

  let packId: string;
  let quantity: number;
  try {
    const body = (await req.json()) as { packId?: string; quantity?: number };
    packId = String(body.packId ?? '');
    quantity = Math.floor(Number(body.quantity ?? 1));
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const pack = getCreditPack(packId);
  if (!pack) {
    return NextResponse.json({ error: 'Unknown credit pack.' }, { status: 400 });
  }
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_PACK_QTY) {
    return NextResponse.json({ error: `Quantity must be between 1 and ${MAX_PACK_QTY}.` }, { status: 400 });
  }

  const origin = req.headers.get('origin') ?? siteConfig.url;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(pack.price * 100),
            product_data: {
              name: `Citron AI credits — ${pack.name}`,
              description: `${pack.credits.toLocaleString()} hosted-model AI credits. One-time top-up; local Citron AI is always unlimited.`,
              metadata: { citron_item: 'credits', pack_id: pack.id, credits: String(pack.credits) },
            },
          },
        },
      ],
      allow_promotion_codes: true,
      customer_email: user.email,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/usage`,
      metadata: {
        citron_user_id: user.id ?? '',
        citron_cart: JSON.stringify([{ k: 'cr', p: pack.id, q: quantity }]).slice(0, 490),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('[checkout] Stripe session creation failed:', e);
    return NextResponse.json(
      { error: 'Could not start checkout. Please try again in a moment.' },
      { status: 502 }
    );
  }
}

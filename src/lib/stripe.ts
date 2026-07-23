import 'server-only';
import Stripe from 'stripe';

let client: Stripe | null = null;

/**
 * Lazily-initialized Stripe client. Returns null when STRIPE_SECRET_KEY is
 * unset so routes can degrade gracefully instead of crashing at import time.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}

export const STRIPE_UNAVAILABLE =
  'Payments are not enabled in this environment yet. Set STRIPE_SECRET_KEY to enable billing.';

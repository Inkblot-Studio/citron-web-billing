export const siteConfig = {
  name: 'Citron',
  tagline: 'Billing & Usage',
  description: 'Manage your Citron subscription, seats, AI credits, usage, and invoices.',
  url: process.env.NEXT_PUBLIC_BILLING_URL ?? 'https://billing.citronos.com',
  /** Main marketing/commerce site — pricing, cart, checkout. */
  mainSite: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://citronos.com',
  identity: {
    url: process.env.NEXT_PUBLIC_IDENTITY_URL ?? 'https://identity.citronos.com',
  },
  studio: {
    name: 'Inkblot Studio',
    url: 'https://inkblotstudio.eu',
  },
  contact: {
    email: 'hello@citronos.com',
    sales: 'sales@citronos.com',
    support: 'support@citronos.com',
  },
} as const;

/** URL into the identity portal, with a return destination on this subdomain. */
export function identityUrl(path: 'login' | 'signup', returnTo?: string) {
  const base = `${siteConfig.identity.url}/${path}`;
  if (!returnTo) return base;
  const dest = returnTo.startsWith('http') ? returnTo : `${siteConfig.url}${returnTo}`;
  return `${base}?redirect_uri=${encodeURIComponent(dest)}`;
}

/** Absolute URL to a page on the main marketing site. */
export function mainSiteUrl(path = '/') {
  return `${siteConfig.mainSite}${path}`;
}

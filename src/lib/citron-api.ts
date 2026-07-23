import 'server-only';

/**
 * Client for the Citron Platform API (citron-api) — the billing/usage source
 * of truth. When CITRON_API_URL / CITRON_API_TOKEN are unset, callers fall
 * back to empty states so the dashboard still renders in local dev.
 */

const BASE = (process.env.CITRON_API_URL ?? '').replace(/\/$/, '');
const TOKEN = process.env.CITRON_API_TOKEN ?? '';

export function citronApiConfigured(): boolean {
  return Boolean(BASE && TOKEN);
}

async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!citronApiConfigured()) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error(`[citron-api] ${path} -> ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.error(`[citron-api] ${path} failed:`, e);
    return null;
  }
}

export async function fetchUsageByOwner<T>(ownerEmail: string): Promise<T | null> {
  return call<T>(`/v1/usage/by-owner?owner_email=${encodeURIComponent(ownerEmail)}`);
}

export async function fetchBillingSummary<T>(ownerEmail: string): Promise<T | null> {
  return call<T>(`/v1/billing/summary?owner_email=${encodeURIComponent(ownerEmail)}`);
}

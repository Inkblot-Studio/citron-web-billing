import 'server-only';
import { cookies } from 'next/headers';

/**
 * Session contract with identity.citronos.com.
 *
 * After login, `/auth/callback` stores the Identity JWT in an HttpOnly cookie
 * on `.citronos.com`. We validate it via `GET /api/auth/me` (Bearer).
 *
 * Local dev without identity: set DEV_FAKE_SESSION=1 to get a stub user.
 */

export type { SessionUser } from '@/lib/session-types';
import type { SessionUser } from '@/lib/session-types';

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'citron_session';

const DEV_USER: SessionUser = {
  id: 'dev-user',
  email: 'dev@citronos.com',
  name: 'Dev Preview',
  workspace: 'Citron Preview Workspace',
};

type MeResponse = {
  userId?: string;
  email?: string | null;
  displayName?: string | null;
  organizations?: Array<{ name?: string }>;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  if (process.env.DEV_FAKE_SESSION === '1') return DEV_USER;

  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const identityApi = process.env.IDENTITY_API_URL;
  if (!identityApi) return null;

  try {
    const res = await fetch(`${identityApi.replace(/\/$/, '')}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as MeResponse;
    if (!data.userId || !data.email) return null;

    // Identity orgs are optional; the platform workspace name is the source of truth.
    let workspace = data.organizations?.[0]?.name || undefined;
    if (!workspace) {
      const { fetchBillingSummary } = await import('@/lib/citron-api');
      const billing = await fetchBillingSummary<{
        workspace?: { name?: string } | null;
      }>(data.email);
      workspace = billing?.workspace?.name || undefined;
    }

    return {
      id: data.userId,
      email: data.email,
      name: data.displayName || data.email.split('@')[0] || 'User',
      workspace,
    };
  } catch {
    return null;
  }
}

import 'server-only';
import { cookies } from 'next/headers';

/**
 * Session contract with identity.citronos.com — identical to citron-web.
 *
 * Identity sets a session cookie on the parent domain (`.citronos.com`), so
 * every subdomain — including this billing app — receives it. We never parse
 * the cookie ourselves; we forward it to the identity API for validation.
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

export async function getSessionUser(): Promise<SessionUser | null> {
  if (process.env.DEV_FAKE_SESSION === '1') return DEV_USER;

  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const identityApi = process.env.IDENTITY_API_URL;
  if (!identityApi) return null;

  try {
    const res = await fetch(`${identityApi.replace(/\/$/, '')}/api/session`, {
      headers: { cookie: `${COOKIE_NAME}=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: SessionUser };
    return data.user ?? null;
  } catch {
    return null;
  }
}

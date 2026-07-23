import { NextResponse } from 'next/server';

/**
 * Exchange an Identity JWT (from the portal redirect hash) for an HttpOnly
 * session cookie on `.citronos.com`, shared by web + dashboard.
 */
export async function POST(req: Request) {
  let body: { token?: string };
  try {
    body = (await req.json()) as { token?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const identityApi = process.env.IDENTITY_API_URL;
  if (!identityApi) {
    return NextResponse.json({ error: 'Identity API not configured' }, { status: 503 });
  }

  const meRes = await fetch(`${identityApi.replace(/\/$/, '')}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!meRes.ok) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const cookieName = process.env.SESSION_COOKIE_NAME ?? 'citron_session';
  const maxAge = 60 * 60 * 24 * 7;

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: cookieName,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    domain: '.citronos.com',
    maxAge,
  });
  return res;
}

import { NextResponse } from 'next/server';

/** Clear the shared Identity session cookie. */
export async function POST() {
  const cookieName = process.env.SESSION_COOKIE_NAME ?? 'citron_session';
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: cookieName,
    value: '',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    domain: '.citronos.com',
    maxAge: 0,
  });
  return res;
}

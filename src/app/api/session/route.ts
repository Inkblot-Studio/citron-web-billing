import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** Session probe for client components. Always 200; `user` is null when signed out. */
export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

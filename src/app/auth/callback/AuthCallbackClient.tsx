'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { identityUrl } from '@/lib/site';

const PENDING_TOKEN_KEY = 'citron_pending_auth_token';

function readTokenFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#/, '');
  const fromHash = new URLSearchParams(hash).get('token');
  if (fromHash) return fromHash;
  const fromQuery = new URLSearchParams(window.location.search).get('token');
  if (fromQuery) return fromQuery;
  try {
    return sessionStorage.getItem(PENDING_TOKEN_KEY);
  } catch {
    return null;
  }
}

export default function AuthCallbackClient() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/';
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useLayoutEffect(() => {
    const token = readTokenFromLocation();
    if (token) {
      try {
        sessionStorage.setItem(PENDING_TOKEN_KEY, token);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const token = readTokenFromLocation();

    if (!token) {
      (async () => {
        try {
          const res = await fetch('/api/session', { cache: 'no-store', credentials: 'include' });
          if (res.ok) {
            const data = (await res.json()) as { user?: unknown };
            if (data.user) {
              router.replace(next);
              return;
            }
          }
        } catch {
          /* fall through */
        }
        window.location.assign(identityUrl('login', next) + '&prompt=login');
      })();
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
          credentials: 'include',
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || 'Sign-in failed');
        }
        try {
          sessionStorage.removeItem(PENDING_TOKEN_KEY);
        } catch {
          /* ignore */
        }
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        if (!cancelled) router.replace(next);
      } catch (e) {
        started.current = false;
        try {
          sessionStorage.removeItem(PENDING_TOKEN_KEY);
        } catch {
          /* ignore */
        }
        if (!cancelled) setError(e instanceof Error ? e.message : 'Sign-in failed');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, next]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
      {error ? (
        <>
          <p className="text-[1.1rem] font-semibold text-cine">Couldn’t finish sign-in</p>
          <p className="mt-3 text-sm text-cine-dim">{error}</p>
          <a
            href={identityUrl('login', next) + '&prompt=login'}
            className="btn btn-primary mt-6 h-10 px-5 text-[0.8125rem]"
          >
            Try again
          </a>
        </>
      ) : (
        <p className="text-sm text-cine-dim">Finishing sign-in…</p>
      )}
    </main>
  );
}

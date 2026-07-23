'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackClient() {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
    const params = new URLSearchParams(hash);
    const token = params.get('token');
    const next = search.get('next') || '/';

    if (!token) {
      setError('Missing sign-in token. Try logging in again.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || 'Sign-in failed');
        }
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        if (!cancelled) router.replace(next);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Sign-in failed');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, search]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
      {error ? (
        <>
          <p className="text-[1.1rem] font-semibold text-cine">Couldn’t finish sign-in</p>
          <p className="mt-3 text-sm text-cine-dim">{error}</p>
        </>
      ) : (
        <p className="text-sm text-cine-dim">Finishing sign-in…</p>
      )}
    </main>
  );
}

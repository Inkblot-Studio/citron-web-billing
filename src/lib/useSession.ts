'use client';

import { useEffect, useState } from 'react';
import type { SessionUser } from '@/lib/session-types';

export type SessionState = {
  user: SessionUser | null;
  loading: boolean;
};

/** Client-side session state, backed by /api/session. */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ user: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/session')
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((data: { user: SessionUser | null }) => {
        if (!cancelled) setState({ user: data.user, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ user: null, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

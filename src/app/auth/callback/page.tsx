import { Suspense } from 'react';
import AuthCallbackClient from './AuthCallbackClient';

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-5">
          <p className="text-sm text-cine-dim">Finishing sign-in…</p>
        </main>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}

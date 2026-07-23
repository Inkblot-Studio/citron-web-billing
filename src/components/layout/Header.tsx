'use client';

import { ArrowUpRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { mainSiteUrl } from '@/lib/site';
import { useSession } from '@/lib/useSession';

/**
 * Slim header for the billing subdomain: brand mark (back to main site),
 * a link to return to Citron, and the signed-in user's initials.
 */
export function Header() {
  const { user } = useSession();
  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-5">
      <div className="relative z-10 mx-auto mt-3 flex h-[3.5rem] max-w-[1120px] items-center justify-between gap-3 rounded-full border border-[var(--cine-card-border)] bg-[rgba(255,255,255,0.82)] pl-5 pr-2 backdrop-blur-xl shadow-[0_1px_2px_rgba(29,28,25,0.04),0_20px_48px_-20px_rgba(29,28,25,0.14)] sm:mt-4 sm:pl-6">
        <Logo />

        <div className="flex items-center gap-1.5">
          <a
            href={mainSiteUrl('/')}
            className="btn btn-ghost hidden h-10 items-center gap-1.5 px-3.5 text-[0.8125rem] font-medium sm:inline-flex"
          >
            Back to Citron
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </a>

          {initials && (
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--cine-line)] bg-[var(--cine-card)] text-[0.75rem] font-semibold text-cine"
              title={user?.name}
            >
              {initials}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Gauge, LayoutDashboard, Loader2, Lock } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import { identityUrl } from '@/lib/site';
import { cn } from '@/lib/cn';

const TABS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/usage', label: 'Usage', icon: Gauge },
  { href: '/billing', label: 'Billing', icon: CreditCard },
];

/**
 * Chrome for the billing dashboard: session gate, workspace header, and tab
 * navigation. Children render only when a session exists.
 */
export function BillingShell({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-cine-faint" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--cine-line)] bg-[rgba(var(--cine-particle),0.08)] text-[var(--cine-amber)]">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="mt-6 text-[1.75rem] font-semibold tracking-[-0.02em] text-cine">
          Sign in to your account
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-cine-dim">
          Manage your subscription, seats, AI usage, and billing in one place.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href={identityUrl('login', pathname)} className="btn btn-primary h-11 px-6 text-[0.875rem]">
            Log in
          </a>
          <a href={identityUrl('signup', pathname)} className="btn btn-secondary h-11 px-6 text-[0.875rem]">
            Create account
          </a>
        </div>
      </div>
    );
  }

  const workspaceLabel = user.workspace || `${user.name}'s workspace`;

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-cine-faint">
            Workspace
          </p>
          <h1 className="mt-1.5 text-[1.75rem] font-semibold tracking-[-0.03em] text-cine sm:text-[1.9rem]">
            {workspaceLabel}
          </h1>
          <p className="mt-1.5 text-[0.875rem] text-cine-dim">
            Signed in as <span className="font-medium text-cine">{user.email}</span>
          </p>
        </div>
        <nav
          aria-label="Account"
          className="flex w-full items-center gap-1 rounded-full border border-[var(--cine-line)] bg-[var(--cine-card)] p-1 sm:w-auto"
        >
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 text-[0.8125rem] font-semibold transition-colors sm:flex-none sm:px-4',
                  active ? 'bg-[var(--cine-ink)] text-white' : 'text-cine-dim hover:text-cine'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CreditCard, Gauge, Loader2, Sparkles } from 'lucide-react';
import type { UsageSummary } from '@/lib/usage';
import { mainSiteUrl } from '@/lib/site';

const fmt = (n: number) => n.toLocaleString('en-US');

export function OverviewView() {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/usage')
      .then((r) => (r.ok ? (r.json() as Promise<UsageSummary>) : Promise.reject()))
      .then(setUsage)
      .catch(() => setFailed(true));
  }, []);

  if (!usage && !failed) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-cine-faint" />
      </div>
    );
  }

  const totalCredits = usage ? usage.includedCredits + usage.bonusCredits : 0;
  const remaining = usage ? Math.max(0, totalCredits - usage.usedCredits) : 0;
  const used = usage?.usedCredits ?? 0;

  return (
    <div className="space-y-6">
      {failed && (
        <p
          role="alert"
          className="rounded-[var(--radius-lg)] border border-[var(--cine-line)] bg-[rgba(220,60,60,0.06)] p-4 text-[0.875rem] text-[var(--color-error)]"
        >
          Could not load your workspace usage. Refresh the page or try again in a moment.
        </p>
      )}

      {usage && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[var(--radius-xl)] cine-card p-5">
            <h2 className="text-[0.8125rem] font-medium text-cine-dim">Plan</h2>
            <div className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-cine">{usage.plan}</div>
            <p className="mt-1 text-[0.75rem] text-cine-faint">{usage.workspace}</p>
          </div>
          <div className="rounded-[var(--radius-xl)] cine-card p-5">
            <h2 className="text-[0.8125rem] font-medium text-cine-dim">Credits</h2>
            <div className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-cine tabular-nums">
              {fmt(used)} <span className="text-[1rem] font-medium text-cine-faint">/ {fmt(totalCredits)}</span>
            </div>
            <p className="mt-1 text-[0.75rem] text-cine-faint">
              {fmt(remaining)} remaining this period
              {totalCredits === 0 ? ' · buy a plan to unlock hosted AI credits' : ''}
            </p>
          </div>
          <div className="rounded-[var(--radius-xl)] cine-card p-5">
            <h2 className="text-[0.8125rem] font-medium text-cine-dim">Local AI actions</h2>
            <div className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-cine tabular-nums">
              {fmt(usage.localAi.requests)}
            </div>
            <p className="mt-1 text-[0.75rem] font-medium text-[var(--cine-amber)]">Unlimited, always</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/usage"
          className="group rounded-[var(--radius-xl)] cine-card p-5 transition hover:border-[var(--cine-amber-bright)]"
        >
          <Gauge className="h-5 w-5 text-[var(--cine-amber)]" />
          <h2 className="mt-3 flex items-center gap-1.5 text-[0.9375rem] font-semibold text-cine">
            Usage
            <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
          </h2>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-cine-dim">
            Credits by model and provider, daily trends, top-ups.
          </p>
        </Link>

        <Link
          href="/billing"
          className="group rounded-[var(--radius-xl)] cine-card p-5 transition hover:border-[var(--cine-amber-bright)]"
        >
          <CreditCard className="h-5 w-5 text-[var(--cine-amber)]" />
          <h2 className="mt-3 flex items-center gap-1.5 text-[0.9375rem] font-semibold text-cine">
            Billing
            <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
          </h2>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-cine-dim">
            Subscription, seats, invoices, and payment methods.
          </p>
        </Link>

        <a
          href={mainSiteUrl('/build')}
          className="group rounded-[var(--radius-xl)] cine-card p-5 transition hover:border-[var(--cine-amber-bright)]"
        >
          <Sparkles className="h-5 w-5 text-[var(--cine-amber)]" />
          <h2 className="mt-3 flex items-center gap-1.5 text-[0.9375rem] font-semibold text-cine">
            Expand Citron
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
          </h2>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-cine-dim">
            Add modules or credits as your team grows.
          </p>
        </a>
      </div>
    </div>
  );
}

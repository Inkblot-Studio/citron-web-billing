'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Infinity as InfinityIcon, Loader2, Sparkles } from 'lucide-react';
import type { UsageSummary } from '@/lib/usage';
import { creditPacks, formatUSD } from '@/lib/catalog';
import { cn } from '@/lib/cn';

const fmt = (n: number) => n.toLocaleString('en-US');

function Meter({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const tone =
    pct >= 90 ? 'var(--color-error)' : pct >= 75 ? 'var(--color-warning)' : 'var(--cine-amber)';
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[1.5rem] font-semibold tracking-[-0.02em] text-cine tabular-nums">
          {fmt(used)}
        </span>
        <span className="text-[0.8125rem] text-cine-faint tabular-nums">of {fmt(total)} credits</span>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={used}
        aria-label="AI credits used this period"
        className="mt-2.5 h-2 overflow-hidden rounded-full bg-[rgba(var(--cine-particle),0.14)]"
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, background: tone }}
        />
      </div>
      <p className="mt-2 text-[0.75rem] text-cine-faint">{pct}% used · resets at period end</p>
    </div>
  );
}

function DailyChart({ daily }: { daily: UsageSummary['daily'] }) {
  if (daily.length === 0) {
    return (
      <p className="py-10 text-center text-[0.8125rem] text-cine-faint">
        No hosted-model usage yet this period.
      </p>
    );
  }
  const max = Math.max(...daily.map((d) => d.credits), 1);
  const monthDay = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <figure aria-label="Hosted-model credits used per day this period">
      <div className="relative h-40">
        {[0.5, 1].map((f) => (
          <div
            key={f}
            aria-hidden
            className="absolute inset-x-0 border-t border-[var(--cine-line)] opacity-60"
            style={{ bottom: `${f * 100}%` }}
          >
            <span className="absolute -top-2.5 right-0 text-[0.65rem] text-cine-faint tabular-nums">
              {fmt(Math.round(max * f))}
            </span>
          </div>
        ))}
        <div className="absolute inset-0 flex items-end gap-[2px]">
          {daily.map((d) => (
            <div key={d.date} className="group relative flex-1">
              <div
                className="w-full rounded-t-[4px] bg-[var(--cine-amber)] opacity-75 transition-opacity group-hover:opacity-100"
                style={{ height: `${Math.max(3, (d.credits / max) * 152)}px` }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--cine-line)] bg-[var(--cine-bg-1)] px-2.5 py-1.5 text-[0.7rem] shadow-[var(--shadow-md)] group-hover:block">
                <span className="font-semibold text-cine tabular-nums">{fmt(d.credits)} credits</span>
                <span className="text-cine-faint"> · {monthDay(d.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-2 flex justify-between text-[0.7rem] text-cine-faint">
        <span>{monthDay(daily[0].date)}</span>
        <span>{monthDay(daily[daily.length - 1].date)}</span>
      </figcaption>
    </figure>
  );
}

export function UsageView() {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/usage')
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? 'Could not load usage.');
        return r.json() as Promise<UsageSummary>;
      })
      .then(setUsage)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function topUp(packId: string) {
    setBuying(packId);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId, quantity: 1 }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Could not start checkout.');
        setBuying(null);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError('Could not start checkout.');
      setBuying(null);
    }
  }

  if (error && !usage) {
    return <p className="rounded-[var(--radius-lg)] bg-[rgba(220,60,60,0.08)] p-4 text-[0.875rem] text-[var(--color-error)]">{error}</p>;
  }
  if (!usage) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-cine-faint" />
      </div>
    );
  }

  const totalCredits = usage.includedCredits + usage.bonusCredits;
  const periodEnd = new Date(`${usage.periodEnd}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="rounded-[var(--radius-lg)] bg-[rgba(220,60,60,0.08)] p-3 text-[0.8125rem] text-[var(--color-error)]">
          {error}
        </p>
      )}

      {/* stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[var(--radius-xl)] cine-card p-5">
          <h2 className="text-[0.8125rem] font-medium text-cine-dim">Hosted-model credits</h2>
          <div className="mt-3">
            <Meter used={usage.usedCredits} total={totalCredits} />
          </div>
          <p className="mt-2 text-[0.75rem] text-cine-faint">
            {fmt(usage.includedCredits)} included with {usage.plan} + {fmt(usage.bonusCredits)} from top-ups
          </p>
        </div>

        <div className="rounded-[var(--radius-xl)] cine-card p-5">
          <h2 className="text-[0.8125rem] font-medium text-cine-dim">Local Citron AI</h2>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[1.5rem] font-semibold tracking-[-0.02em] text-cine tabular-nums">
              {fmt(usage.localAi.requests)}
            </span>
            <span className="text-[0.8125rem] text-cine-faint">actions this period</span>
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[rgba(var(--cine-particle),0.12)] px-2.5 py-1 text-[0.72rem] font-semibold text-[var(--cine-amber)]">
            <InfinityIcon className="h-3.5 w-3.5" /> Unlimited — never uses credits
          </p>
        </div>

        <div className="rounded-[var(--radius-xl)] cine-card p-5 sm:col-span-2 lg:col-span-1">
          <h2 className="text-[0.8125rem] font-medium text-cine-dim">Current plan</h2>
          <div className="mt-3 text-[1.5rem] font-semibold tracking-[-0.02em] text-cine">{usage.plan}</div>
          <p className="mt-1 text-[0.8125rem] text-cine-faint">Credits reset on {periodEnd}</p>
          <Link
            href="/billing"
            className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-[var(--cine-amber)] hover:underline"
          >
            Manage plan <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* daily chart */}
      <div className="rounded-[var(--radius-xl)] cine-card p-5 sm:p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[1rem] font-semibold text-cine">Daily credit usage</h2>
          <span className="text-[0.75rem] text-cine-faint">This billing period</span>
        </div>
        <div className="mt-5">
          <DailyChart daily={usage.daily} />
        </div>
      </div>

      {/* per-model table */}
      <div className="overflow-hidden rounded-[var(--radius-xl)] cine-card">
        <div className="flex items-baseline justify-between p-5 pb-0 sm:p-6 sm:pb-0">
          <h2 className="text-[1rem] font-semibold text-cine">Usage by model</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--cine-line)] text-[0.72rem] uppercase tracking-[0.08em] text-cine-faint">
                <th className="px-5 py-3 font-medium sm:px-6">Provider</th>
                <th className="px-3 py-3 font-medium">Model</th>
                <th className="px-3 py-3 text-right font-medium">Requests</th>
                <th className="px-3 py-3 text-right font-medium">Tokens</th>
                <th className="px-5 py-3 text-right font-medium sm:px-6">Credits</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--cine-line)] bg-[rgba(var(--cine-particle),0.05)]">
                <td className="px-5 py-3.5 text-[0.875rem] font-medium text-cine sm:px-6">Citron</td>
                <td className="px-3 py-3.5 text-[0.875rem] text-cine-dim">Citron Local AI</td>
                <td className="px-3 py-3.5 text-right text-[0.875rem] text-cine-dim tabular-nums">
                  {fmt(usage.localAi.requests)}
                </td>
                <td className="px-3 py-3.5 text-right text-[0.875rem] text-cine-faint">—</td>
                <td className="px-5 py-3.5 text-right text-[0.875rem] font-semibold text-[var(--cine-amber)] sm:px-6">
                  Unlimited
                </td>
              </tr>
              {usage.byModel.map((m) => (
                <tr key={`${m.provider}-${m.model}`} className="border-b border-[var(--cine-line)] last:border-0">
                  <td className="px-5 py-3.5 text-[0.875rem] font-medium text-cine sm:px-6">{m.provider}</td>
                  <td className="px-3 py-3.5 text-[0.875rem] text-cine-dim">{m.model}</td>
                  <td className="px-3 py-3.5 text-right text-[0.875rem] text-cine-dim tabular-nums">{fmt(m.requests)}</td>
                  <td className="px-3 py-3.5 text-right text-[0.875rem] text-cine-dim tabular-nums">{fmt(m.tokens)}</td>
                  <td className="px-5 py-3.5 text-right text-[0.875rem] font-semibold text-cine tabular-nums sm:px-6">
                    {fmt(m.credits)}
                  </td>
                </tr>
              ))}
              {usage.byModel.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[0.8125rem] text-cine-faint">
                    No hosted-model usage yet. Local Citron AI is always unlimited.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* top-up */}
      <div className="rounded-[var(--radius-xl)] cine-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--cine-amber)]" />
          <h2 className="text-[1rem] font-semibold text-cine">Top up credits</h2>
        </div>
        <p className="mt-1.5 text-[0.8125rem] text-cine-dim">
          One-time packs, applied instantly. Unused top-up credits roll over.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {creditPacks.map((pack) => (
            <button
              key={pack.id}
              type="button"
              disabled={buying !== null}
              onClick={() => topUp(pack.id)}
              className={cn(
                'rounded-[var(--radius-lg)] border p-4 text-left transition disabled:opacity-60',
                'border-[var(--cine-line)] hover:border-[var(--cine-amber-bright)]'
              )}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[0.9375rem] font-semibold text-cine">{pack.name}</span>
                <span className="text-[0.9375rem] font-semibold text-cine tabular-nums">{formatUSD(pack.price)}</span>
              </div>
              <p className="mt-1 text-[0.75rem] text-cine-faint">
                {buying === pack.id ? 'Redirecting to checkout…' : pack.blurb}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

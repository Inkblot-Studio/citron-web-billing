'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, CreditCard, ExternalLink, Loader2, ReceiptText, Repeat } from 'lucide-react';
import type { BillingSummary } from '@/lib/billing-types';
import { siteConfig, mainSiteUrl } from '@/lib/site';

const fmt = (n: number) => n.toLocaleString('en-US');

function money(cents: number | null, currency: string | null) {
  if (cents == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency ?? 'usd').toUpperCase(),
  }).format(cents / 100);
}

export function BillingView() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/billing/summary')
      .then((r) => (r.ok ? (r.json() as Promise<BillingSummary>) : Promise.reject()))
      .then(setSummary)
      .catch(() => setLoadFailed(true));
  }, []);

  async function openPortal() {
    setOpening(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Could not open the billing portal.');
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError('Could not open the billing portal.');
    } finally {
      setOpening(false);
    }
  }

  if (!summary && !loadFailed) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-cine-faint" />
      </div>
    );
  }

  const credits = summary?.credits;

  return (
    <div className="space-y-6">
      {/* plan + credits snapshot */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[var(--radius-xl)] cine-card p-5">
            <h2 className="text-[0.8125rem] font-medium text-cine-dim">Current plan</h2>
            <div className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-cine">{summary.plan}</div>
            <p className="mt-1 text-[0.75rem] text-cine-faint">
              {summary.seats} {summary.seats === 1 ? 'seat' : 'seats'}
              {summary.cadence ? ` · billed ${summary.cadence}` : ''} · {summary.status}
            </p>
          </div>
          <div className="rounded-[var(--radius-xl)] cine-card p-5">
            <h2 className="text-[0.8125rem] font-medium text-cine-dim">Credits remaining</h2>
            <div className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-cine tabular-nums">
              {fmt(credits?.remaining ?? 0)}
            </div>
            <p className="mt-1 text-[0.75rem] text-cine-faint">
              {fmt(credits?.included ?? 0)} included + {fmt(credits?.bonus ?? 0)} bonus
            </p>
          </div>
          <div className="rounded-[var(--radius-xl)] cine-card p-5">
            <h2 className="text-[0.8125rem] font-medium text-cine-dim">Used this period</h2>
            <div className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-cine tabular-nums">
              {fmt(credits?.used ?? 0)}
            </div>
            <p className="mt-1 text-[0.75rem] text-cine-faint">hosted-model credits</p>
          </div>
        </div>
      )}

      {/* manage subscription via Stripe */}
      <div className="rounded-[var(--radius-xl)] cine-card p-6">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[var(--cine-amber)]" />
          <h2 className="text-[1rem] font-semibold text-cine">Subscription & payment</h2>
        </div>
        <p className="mt-2 max-w-xl text-[0.875rem] leading-relaxed text-cine-dim">
          Your subscription, seats, payment methods, and invoices are managed in the
          secure Stripe billing portal. Changes are prorated and take effect
          immediately.
        </p>

        {error && (
          <p role="alert" className="mt-4 max-w-xl rounded-[var(--radius-lg)] bg-[rgba(220,60,60,0.08)] p-3 text-[0.8125rem] text-[var(--color-error)]">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={openPortal}
          disabled={opening}
          className="btn btn-primary mt-5 h-11 px-6 text-[0.875rem]"
        >
          {opening ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Manage billing <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} /></>}
        </button>
      </div>

      {/* invoices */}
      <div className="overflow-hidden rounded-[var(--radius-xl)] cine-card">
        <div className="flex items-center gap-2 p-5 pb-0 sm:p-6 sm:pb-0">
          <ReceiptText className="h-4 w-4 text-[var(--cine-amber)]" />
          <h2 className="text-[1rem] font-semibold text-cine">Invoices</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--cine-line)] text-[0.72rem] uppercase tracking-[0.08em] text-cine-faint">
                <th className="px-5 py-3 font-medium sm:px-6">Invoice</th>
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 text-right font-medium sm:px-6">PDF</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.invoices ?? []).map((inv) => (
                <tr key={inv.id} className="border-b border-[var(--cine-line)] last:border-0">
                  <td className="px-5 py-3.5 text-[0.875rem] font-medium text-cine sm:px-6">{inv.number ?? inv.id}</td>
                  <td className="px-3 py-3.5 text-[0.875rem] text-cine-dim tabular-nums">{inv.date}</td>
                  <td className="px-3 py-3.5 text-[0.875rem]">
                    <span className={inv.status === 'paid' ? 'text-[var(--color-success)]' : 'text-cine-dim'}>
                      {inv.status ?? '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-right text-[0.875rem] text-cine tabular-nums">
                    {money(inv.amount_paid ?? inv.amount_due, inv.currency)}
                  </td>
                  <td className="px-5 py-3.5 text-right sm:px-6">
                    {inv.invoice_pdf || inv.hosted_invoice_url ? (
                      <a
                        href={inv.invoice_pdf ?? inv.hosted_invoice_url ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-[var(--cine-amber)] hover:underline"
                      >
                        View <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-[0.8125rem] text-cine-faint">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {(summary?.invoices.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[0.8125rem] text-cine-faint">
                    No invoices yet. They&rsquo;ll appear here after your first payment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* change plan / help */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--radius-xl)] cine-card p-6">
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-[var(--cine-amber)]" />
            <h2 className="text-[0.9375rem] font-semibold text-cine">Change plan or seats</h2>
          </div>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-cine-dim">
            Upgrade, downgrade, or adjust seat count — or switch to a custom module
            bundle built for your team.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={mainSiteUrl('/pricing')} className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-[var(--cine-amber)] hover:underline">
              View plans <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a href={mainSiteUrl('/build')} className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-[var(--cine-amber)] hover:underline">
              Build custom <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] cine-card p-6">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-[var(--cine-amber)]" />
            <h2 className="text-[0.9375rem] font-semibold text-cine">Need help?</h2>
          </div>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-cine-dim">
            Questions about an invoice, VAT details, or procurement paperwork — our
            team answers within one business day.
          </p>
          <a
            href={`mailto:${siteConfig.contact.support}`}
            className="mt-4 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-[var(--cine-amber)] hover:underline"
          >
            {siteConfig.contact.support}
          </a>
        </div>
      </div>
    </div>
  );
}

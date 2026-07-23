import { siteConfig, mainSiteUrl } from '@/lib/site';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="relative z-30 border-t border-[var(--cine-line)] bg-[var(--cine-bg-1)]">
      <div className="mx-auto max-w-[1120px] px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Logo />
            <p className="mt-3 max-w-[22rem] text-[0.8125rem] leading-relaxed text-[var(--cine-ink-faint)]">
              Manage your subscription, seats, AI credits, and invoices. Your
              data stays yours — never used to train shared models.
            </p>
          </div>
          <nav aria-label="Links" className="flex flex-wrap gap-x-6 gap-y-2 text-[0.8125rem]">
            <a href={mainSiteUrl('/pricing')} className="text-[var(--cine-ink-dim)] transition-colors hover:text-[var(--cine-amber)]">Plans</a>
            <a href={mainSiteUrl('/legal/terms')} className="text-[var(--cine-ink-dim)] transition-colors hover:text-[var(--cine-amber)]">Terms</a>
            <a href={mainSiteUrl('/legal/privacy')} className="text-[var(--cine-ink-dim)] transition-colors hover:text-[var(--cine-amber)]">Privacy</a>
            <a href={`mailto:${siteConfig.contact.support}`} className="text-[var(--cine-ink-dim)] transition-colors hover:text-[var(--cine-amber)]">Support</a>
          </nav>
        </div>
        <div className="mt-8 border-t border-[var(--cine-line)] pt-6">
          <p className="text-[0.8125rem] text-[var(--cine-ink-faint)]">
            © {new Date().getFullYear()} Citron · Crafted by{' '}
            <a
              href={siteConfig.studio.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--cine-ink-dim)] underline-offset-4 transition-colors hover:text-[var(--cine-amber)] hover:underline"
            >
              Inkblot Studio
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

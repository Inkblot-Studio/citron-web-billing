import Link from 'next/link';
import { mainSiteUrl } from '@/lib/site';

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-[640px] flex-col items-center justify-center px-5 pb-24 pt-32 text-center">
      <p className="eyebrow-pill">404</p>
      <h1 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.03em] text-cine">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-[1rem] leading-relaxed text-cine-dim">
        The page you&rsquo;re looking for doesn&rsquo;t exist in your billing dashboard.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn btn-primary h-12 px-6 text-[0.9rem]">
          Go to overview
        </Link>
        <a href={mainSiteUrl('/')} className="btn btn-secondary h-12 px-6 text-[0.9rem]">
          Back to Citron
        </a>
      </div>
    </section>
  );
}

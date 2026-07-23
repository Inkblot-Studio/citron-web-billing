import type { Metadata } from 'next';
import { BillingShell } from '@/components/BillingShell';
import { UsageView } from '@/components/UsageView';

export const metadata: Metadata = { title: 'Usage' };

export default function UsagePage() {
  return (
    <section className="mx-auto w-full max-w-[1120px] px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-32 lg:px-10">
      <BillingShell>
        <UsageView />
      </BillingShell>
    </section>
  );
}

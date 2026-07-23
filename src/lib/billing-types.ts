/** Billing summary contract — matches citron-api GET /v1/billing/summary. */

export type Invoice = {
  id: string;
  number: string | null;
  amount_due: number | null;
  amount_paid: number | null;
  currency: string | null;
  status: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  date: string;
};

export type BillingSummary = {
  workspace: { id: string; name: string; owner_email: string } | null;
  plan: string;
  cadence: string | null;
  seats: number;
  status: string;
  credits: {
    included: number;
    bonus: number;
    used: number;
    remaining: number;
  };
  invoices: Invoice[];
};

export function emptyBilling(): BillingSummary {
  return {
    workspace: null,
    plan: 'Free',
    cadence: null,
    seats: 0,
    status: 'active',
    credits: { included: 0, bonus: 0, used: 0, remaining: 0 },
    invoices: [],
  };
}

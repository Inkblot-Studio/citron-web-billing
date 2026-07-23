/**
 * Credit top-up packs — mirrors citron-web's catalog. Used by the top-up flow
 * so users can buy AI credits directly from the billing dashboard.
 */

export type CreditPack = {
  id: string;
  name: string;
  credits: number;
  price: number;
  blurb: string;
  bestValue?: boolean;
};

export const creditPacks: CreditPack[] = [
  { id: 'credits-1k', name: '1,000 credits', credits: 1_000, price: 12, blurb: 'Occasional frontier-model work.' },
  { id: 'credits-5k', name: '5,000 credits', credits: 5_000, price: 50, blurb: 'Steady hosted-model usage for a team.', bestValue: true },
  { id: 'credits-20k', name: '20,000 credits', credits: 20_000, price: 180, blurb: 'Heavy multi-team AI workloads.' },
];

export const getCreditPack = (id: string) => creditPacks.find((p) => p.id === id);

export const formatUSD = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);

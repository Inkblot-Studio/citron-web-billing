/**
 * Usage metering contract — matches citron-web and citron-api.
 * GET /api/usage returns a `UsageSummary` for the signed-in user's workspace.
 */

export type ModelUsage = {
  provider: string;
  model: string;
  requests: number;
  tokens: number;
  credits: number;
};

export type DailyUsage = {
  date: string;
  credits: number;
  localRequests: number;
};

export type UsageSummary = {
  workspace: string;
  plan: string;
  periodStart: string;
  periodEnd: string;
  includedCredits: number;
  bonusCredits: number;
  usedCredits: number;
  localAi: {
    requests: number;
    unlimited: true;
  };
  byModel: ModelUsage[];
  daily: DailyUsage[];
};

/** A zeroed summary for the empty/no-workspace state. */
export function emptyUsage(workspace = 'Your workspace'): UsageSummary {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return {
    workspace,
    plan: 'Free',
    periodStart: iso(start),
    periodEnd: iso(end),
    includedCredits: 0,
    bonusCredits: 0,
    usedCredits: 0,
    localAi: { requests: 0, unlimited: true },
    byModel: [],
    daily: [],
  };
}

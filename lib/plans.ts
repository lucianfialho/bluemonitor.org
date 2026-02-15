import { getDb } from "./db";

export interface PlanLimits {
  maxWatchlist: number;
  maxWebhooks: number;
  allowedWebhookEvents: string[];
  rateLimitAuthenticated: number;
  historyRetentionDays: number;
  recheckIntervalMinutes: number;
  mcpAccess: boolean;
  canSetPrivate: boolean;
  botTracking: boolean;
}

export type PlanTier = "free" | "pro";

export interface UserPlan {
  tier: PlanTier;
  limits: PlanLimits;
  status: string;
  billingPeriod: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export const FREE_LIMITS: PlanLimits = {
  maxWatchlist: 3,
  maxWebhooks: 2,
  allowedWebhookEvents: ["down", "llm_update"],
  rateLimitAuthenticated: 60,
  historyRetentionDays: 1,
  recheckIntervalMinutes: 10,
  mcpAccess: false,
  canSetPrivate: false,
  botTracking: false,
};

export const PRO_LIMITS: PlanLimits = {
  maxWatchlist: Infinity,
  maxWebhooks: 10,
  allowedWebhookEvents: ["down", "slow", "recovered", "dead", "resurrected", "llm_update", "googlebot_inactive"],
  rateLimitAuthenticated: 300,
  historyRetentionDays: 30,
  recheckIntervalMinutes: 1,
  mcpAccess: true,
  canSetPrivate: true,
  botTracking: true,
};

const FREE_PLAN: UserPlan = {
  tier: "free",
  limits: FREE_LIMITS,
  status: "active",
  billingPeriod: null,
  currentPeriodEnd: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
};

function limitsForTier(tier: PlanTier): PlanLimits {
  return tier === "pro" ? PRO_LIMITS : FREE_LIMITS;
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const sql = getDb();
  const rows = await sql`
    SELECT plan, status, billing_period, current_period_end,
           stripe_customer_id, stripe_subscription_id
    FROM user_plans
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  if (rows.length === 0) return FREE_PLAN;

  const row = rows[0];
  const tier = (row.plan === "pro" && row.status === "active") ? "pro" as const : "free" as const;

  return {
    tier,
    limits: limitsForTier(tier),
    status: row.status as string,
    billingPeriod: row.billing_period as string | null,
    currentPeriodEnd: row.current_period_end as string | null,
    stripeCustomerId: row.stripe_customer_id as string | null,
    stripeSubscriptionId: row.stripe_subscription_id as string | null,
  };
}

export async function getUserPlanByApiKey(
  apiKey: string
): Promise<UserPlan> {
  const sql = getDb();
  const rows = await sql`
    SELECT up.plan, up.status, up.billing_period, up.current_period_end,
           up.stripe_customer_id, up.stripe_subscription_id
    FROM api_keys ak
    LEFT JOIN user_plans up ON up.user_id = ak.user_id
    WHERE ak.key = ${apiKey}
    LIMIT 1
  `;

  if (rows.length === 0 || !rows[0].plan) return FREE_PLAN;

  const row = rows[0];
  const tier = (row.plan === "pro" && row.status === "active") ? "pro" as const : "free" as const;

  return {
    tier,
    limits: limitsForTier(tier),
    status: row.status as string,
    billingPeriod: row.billing_period as string | null,
    currentPeriodEnd: row.current_period_end as string | null,
    stripeCustomerId: row.stripe_customer_id as string | null,
    stripeSubscriptionId: row.stripe_subscription_id as string | null,
  };
}

import { AI_CRAWLER_BOTS } from "@/lib/bots";

export interface AIVisibilityInput {
  distinct_bots: number;
  distinct_pages: number;
  total_visits: number;
  visiting_bots: string[];
  /** Previous period stats for trend calculation */
  prev_total_visits: number;
}

export interface AIVisibilityBreakdown {
  diversity: number;
  frequency: number;
  coverage: number;
  trend: number;
}

export type AIVisibilityLabel = "Low" | "Medium" | "High";
export type AIVisibilityTrend = "up" | "down" | "stable";

export interface AIVisibilityResult {
  score: number;
  label: AIVisibilityLabel;
  trend: AIVisibilityTrend;
  trend_pct: number;
  visiting_bots: string[];
  missing_bots: string[];
  breakdown: AIVisibilityBreakdown;
}

const TOTAL_AI_BOTS = AI_CRAWLER_BOTS.length; // 9

function getLabel(score: number): AIVisibilityLabel {
  if (score <= 30) return "Low";
  if (score <= 60) return "Medium";
  return "High";
}

export function calculateAIVisibility(
  input: AIVisibilityInput,
  periodDays: number,
): AIVisibilityResult {
  // Diversity: (distinct_ai_bots / total_ai_bots) * 30
  const diversity = Math.round((Math.min(input.distinct_bots, TOTAL_AI_BOTS) / TOTAL_AI_BOTS) * 30);

  // Frequency: min(30, log10(avg_daily_visits + 1) * 15)
  const avgDaily = input.total_visits / Math.max(periodDays, 1);
  const frequency = Math.round(Math.min(30, Math.log10(avgDaily + 1) * 15));

  // Coverage: min(1, distinct_pages / 20) * 20
  const coverage = Math.round(Math.min(1, input.distinct_pages / 20) * 20);

  // Trend: based on % change vs previous period
  let trend_pct = 0;
  let trendDir: AIVisibilityTrend = "stable";
  if (input.prev_total_visits > 0) {
    trend_pct = ((input.total_visits - input.prev_total_visits) / input.prev_total_visits) * 100;
    trendDir = trend_pct > 5 ? "up" : trend_pct < -5 ? "down" : "stable";
  } else if (input.total_visits > 0) {
    trend_pct = 100;
    trendDir = "up";
  }

  let trendScore: number;
  if (trend_pct >= 50) trendScore = 20;
  else if (trend_pct >= 20) trendScore = 15;
  else if (trend_pct >= 0) trendScore = 10;
  else if (trend_pct >= -20) trendScore = 5;
  else trendScore = 0;

  const score = diversity + frequency + coverage + trendScore;

  const visitingSet = new Set(input.visiting_bots);
  const missing_bots = AI_CRAWLER_BOTS.filter((b) => !visitingSet.has(b));

  return {
    score: Math.min(100, score),
    label: getLabel(Math.min(100, score)),
    trend: trendDir,
    trend_pct: Math.round(trend_pct * 10) / 10,
    visiting_bots: input.visiting_bots,
    missing_bots,
    breakdown: { diversity, frequency, coverage, trend: trendScore },
  };
}

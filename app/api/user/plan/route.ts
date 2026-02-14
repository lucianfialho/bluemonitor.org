import { NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getUserPlan } from "@/lib/plans";

export async function GET() {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await getUserPlan(session.user.id);

  return NextResponse.json({
    tier: plan.tier,
    limits: {
      ...plan.limits,
      // Infinity isn't JSON-serializable
      maxWatchlist: plan.limits.maxWatchlist === Infinity ? -1 : plan.limits.maxWatchlist,
    },
    status: plan.status,
    billingPeriod: plan.billingPeriod,
    currentPeriodEnd: plan.currentPeriodEnd,
  });
}

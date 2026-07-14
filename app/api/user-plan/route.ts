import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getUserPlan } from "@/lib/business/get-user-plan";
import { getUserSubscription } from "@/lib/business/get-user-subscription";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const plan = await getUserPlan(userId);
    const subscription = await getUserSubscription();

    return NextResponse.json({
      remainingCredits: plan.remainingCredits,
      totalCreditsUsed: plan.totalCreditsUsed,
      lastCreditReset:
        plan.lastCreditReset instanceof Date
          ? plan.lastCreditReset.toISOString()
          : plan.lastCreditReset,
      monthlyCredits: subscription.monthlyCredits,
      maxPdfSizeMB: subscription.maxPdfSizeMB,
      maxImages: subscription.maxImages,
      isPro: subscription.isPro,
    });
  } catch (error) {
    console.error("Error loading user plan:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load user plan." },
      { status: 500 },
    );
  }
}

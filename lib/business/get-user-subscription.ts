import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";

import { FREE_PLAN, PRO_PLAN, type PlanConfig } from "@/lib/business/plans";

const proPlanId = process.env.NEXT_PUBLIC_CLERK_PRO_PLAN_ID;

export interface UserSubscription {
  plan: "free" | "pro";
  isPro: boolean;
  isFree: boolean;
  monthlyCredits: number;
  maxPdfSizeMB: number;
  maxImages: number;
}

export async function getUserSubscription(): Promise<UserSubscription> {
  const { userId } = await auth();

  if (!userId) {
    return planToSubscription("free", FREE_PLAN);
  }

  if (!proPlanId) {
    return planToSubscription("free", FREE_PLAN);
  }

  try {
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const subscription = await clerkClient.billing.getUserBillingSubscription(userId);

    const hasPro = subscription.subscriptionItems?.some(
      (item) => item.plan?.id === proPlanId && item.status === "active" && !item.canceledAt,
    );

    return hasPro
      ? planToSubscription("pro", PRO_PLAN)
      : planToSubscription("free", FREE_PLAN);
  } catch {
    return planToSubscription("free", FREE_PLAN);
  }
}

function planToSubscription(plan: "free" | "pro", config: PlanConfig): UserSubscription {
  return {
    plan,
    isPro: plan === "pro",
    isFree: plan === "free",
    monthlyCredits: config.monthlyCredits,
    maxPdfSizeMB: config.maxPdfSizeMB,
    maxImages: config.maxImages,
  };
}

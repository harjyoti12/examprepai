"use client";

import { useSubscriptionQuery } from "@/hooks/use-subscription";
import { getPermissions, type Permissions } from "@/lib/business/permissions";

const PRO_PLAN_ID = process.env.NEXT_PUBLIC_CLERK_PRO_PLAN_ID;

function deriveIsPro(
  subscription: { subscriptionItems?: Array<{ plan?: { id: string } | null; status: string; canceledAt: Date | null }> } | null | undefined,
): boolean {
  if (!subscription || !PRO_PLAN_ID) return false;

  return !!subscription.subscriptionItems?.some(
    (item) =>
      item.plan?.id === PRO_PLAN_ID &&
      item.status === "active" &&
      !item.canceledAt,
  );
}

export function usePermissions() {
  const { data: subscription, isLoading, error } = useSubscriptionQuery();

  const isPro = deriveIsPro(
    subscription as { subscriptionItems?: Array<{ plan?: { id: string } | null; status: string; canceledAt: Date | null }> } | null | undefined,
  );

  const userSubscription = {
    plan: isPro ? ("pro" as const) : ("free" as const),
    isPro,
    isFree: !isPro,
    monthlyCredits: 0,
    maxPdfSizeMB: 0,
    maxImages: 0,
  };

  const permissions = getPermissions(userSubscription);

  return {
    permissions,
    isLoading,
    error,
    isPro,
  };
}

export type { Permissions };

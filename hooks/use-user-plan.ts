"use client";

import { useQuery } from "@tanstack/react-query";

export interface UserPlanData {
  remainingCredits: number;
  totalCreditsUsed: number;
  lastCreditReset: string;
  monthlyCredits: number;
  maxPdfSizeMB: number;
  maxImages: number;
  isPro: boolean;
}

export function useUserPlan() {
  return useQuery<UserPlanData>({
    queryKey: ["user-plan"],
    queryFn: async () => {
      const res = await fetch("/api/user-plan");

      if (!res.ok) {
        throw new Error("Failed to fetch user plan");
      }

      return res.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    retry: false,
  });
}

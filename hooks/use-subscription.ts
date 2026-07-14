"use client";

import { useQuery } from "@tanstack/react-query";
import { useClerk } from "@clerk/nextjs";

export function useSubscriptionQuery() {
  const clerk = useClerk();

  return useQuery({
    queryKey: ["clerk-subscription"],
    queryFn: async () => {
      try {
        const result = await (clerk as any).billing.getSubscription({});
        return result;
      } catch (err) {
        throw err;
      }
    },
    enabled: !!clerk,
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: false,
  } as any);
}

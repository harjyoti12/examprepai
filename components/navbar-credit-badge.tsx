"use client";

import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserPlan } from "@/hooks/use-user-plan";

export function NavbarCreditBadge() {
  const { data, isLoading, isError } = useUserPlan();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="h-9 w-24 rounded-lg bg-violet-50 animate-pulse" />
    );
  }

  if (isError || !data) {
    return null;
  }

  return (
    <button
      onClick={() => router.push("/dashboard/pricing")}
      className="flex items-center gap-1.5 h-9 rounded-lg px-3 border border-violet-200 bg-violet-50 hover:bg-violet-100 transition-colors cursor-pointer shrink-0"
    >
      <Zap size={14} className="text-[#6D42F5] shrink-0" />
      <span className="text-[13px] font-semibold text-gray-900 whitespace-nowrap">
        {data.remainingCredits} / {data.monthlyCredits}
      </span>
    </button>
  );
}

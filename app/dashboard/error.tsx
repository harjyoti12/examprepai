"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#F7F8FC] px-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50">
            <span className="text-2xl font-extrabold text-violet-700">!</span>
          </div>
        </div>
        <h1 className="mb-2 text-[24px] font-extrabold text-[#12162F]">
          Something Went Wrong
        </h1>
        <p className="mb-8 text-[14px] font-medium leading-relaxed text-[#42506E]">
          An unexpected error occurred while loading this page.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            variant="default"
            className="bg-violet-600 text-white hover:bg-violet-700"
            onClick={() => reset()}
          >
            Try Again
          </Button>
          <Button asChild variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-50">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <span className="text-2xl font-extrabold text-red-500">!</span>
          </div>
        </div>
        <h1 className="mb-2 text-[28px] font-extrabold text-[#12162F]">
          Something Went Wrong
        </h1>
        <p className="mb-8 text-[14px] font-medium leading-relaxed text-[#42506E]">
          An unexpected error occurred. Please try again or return home.
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
            <Link href={isSignedIn ? "/dashboard" : "/"}>
              {isSignedIn ? "Dashboard" : "Home"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F8FC] px-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50">
            <span className="text-2xl font-extrabold text-violet-700">?</span>
          </div>
        </div>
        <h1 className="mb-2 text-[28px] font-extrabold text-[#12162F]">
          Page Not Found
        </h1>
        <p className="mb-8 text-[14px] font-medium leading-relaxed text-[#42506E]">
          We couldn&apos;t find the page you&apos;re looking for.
          <br />
          It may have been removed or the link may be incorrect.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {isAuthenticated ? (
            <>
              <Button asChild variant="default" className="bg-violet-600 text-white hover:bg-violet-700">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-50">
                <Link href="/dashboard/generate">Generate Notes</Link>
              </Button>
            </>
          ) : (
            <Button asChild variant="default" className="bg-violet-600 text-white hover:bg-violet-700">
              <Link href="/">Go Home</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

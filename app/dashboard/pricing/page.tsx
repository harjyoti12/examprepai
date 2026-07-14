"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { BUY_ME_A_COFFEE_URL } from "@/lib/config";
import { FREE_PLAN, PRO_PLAN } from "@/lib/business/plans";

const FEATURES = [
  { label: "AI Credits / Month", free: String(FREE_PLAN.monthlyCredits), pro: String(PRO_PLAN.monthlyCredits) },
  { label: "Max PDF Size", free: `${FREE_PLAN.maxPdfSizeMB} MB`, pro: `${PRO_PLAN.maxPdfSizeMB} MB` },
  { label: "Max Images", free: String(FREE_PLAN.maxImages), pro: String(PRO_PLAN.maxImages) },
  { label: "Processing Speed", free: "Standard", pro: "Fast" },
  { label: "PDF Export", free: <span className="inline-flex items-center"><X className="h-4 w-4 text-red-400" /></span>, pro: <span className="inline-flex items-center"><Check className="h-4 w-4 text-emerald-500" /></span> },
  { label: "Share Notes", free: <span className="inline-flex items-center"><X className="h-4 w-4 text-red-400" /></span>, pro: <span className="inline-flex items-center"><Check className="h-4 w-4 text-emerald-500" /></span> },
  { label: "Priority Queue", free: <span className="inline-flex items-center"><X className="h-4 w-4 text-red-400" /></span>, pro: <span className="inline-flex items-center"><Check className="h-4 w-4 text-emerald-500" /></span> },
];

export default function PricingPage() {
  return (
    <main className="main-container font-jakarta text-[#11172F]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-[34px] font-extrabold leading-tight tracking-tight text-[#12162F] sm:text-[40px]">
            Simple pricing.
            <br />
            Powerful learning.
          </h1>
          <p className="mt-4 text-[15px] font-medium text-[#42506E]">
            Generate AI-powered exam notes with flexible monthly AI Credits.
          </p>
        </div>

          <div className="mb-16 grid gap-5 md:grid-cols-2">
          <Card className="relative overflow-hidden rounded-2xl border-gray-200 bg-white shadow-sm">
            <div className="absolute right-4 top-4 rounded-full bg-gray-200 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-gray-600">
              Current Plan
            </div>
            <CardHeader className="px-6 pb-1 pt-6">
              <CardTitle className="text-[18px] font-extrabold text-[#12162F]">Free</CardTitle>
              <div className="mt-3">
                <span className="text-[34px] font-extrabold tracking-tight text-[#12162F]">₹0</span>
                <span className="ml-1 text-[14px] font-medium text-[#667085]">/ month</span>
              </div>
              <p className="mt-1 text-[13px] font-medium text-[#667085]">
                Perfect for getting started
              </p>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="rounded-lg border border-violet-100 bg-violet-50 px-4 py-3">
                <p className="text-[13px] font-bold text-[#6D42F5]">{FREE_PLAN.monthlyCredits} AI Credits every month</p>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#11172F]">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  {FREE_PLAN.monthlyCredits} AI Credits / month
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#11172F]">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Max PDF Size: {FREE_PLAN.maxPdfSizeMB} MB
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#11172F]">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Max {FREE_PLAN.maxImages} Images
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#11172F]">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Basic AI Generation
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#11172F]">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Standard Processing
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#11172F]">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  View results online
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#9CA3AF]">
                  <X className="h-3.5 w-3.5 text-red-300" />
                  PDF Export
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#9CA3AF]">
                  <X className="h-3.5 w-3.5 text-red-300" />
                  Share Notes
                </li>
              </ul>
              <Button
                variant="outline"
                onClick={() => window.open(BUY_ME_A_COFFEE_URL, "_blank", "noopener,noreferrer")}
                className="h-10 w-full rounded-lg border-violet-200 text-[13px] font-extrabold text-violet-700 hover:border-violet-300 hover:bg-violet-50"
              >
                ❤️ Support Development
              </Button>
              <p className="text-center text-[12px] font-medium text-[#667085]">
                ExamPrep AI is free to use. If you find it helpful, consider buying me a coffee!
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-2xl border-violet-200 bg-white shadow-sm opacity-60">
            <div className="absolute right-4 top-4 rounded-full bg-amber-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
              Coming Soon
            </div>
            <div className="absolute right-4 top-16 rounded-full bg-violet-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
              Most Popular
            </div>
            <CardHeader className="px-6 pb-1 pt-6">
              <CardTitle className="text-[18px] font-extrabold text-[#12162F]">Pro</CardTitle>
              <div className="mt-3">
                <span className="text-[34px] font-extrabold tracking-tight text-[#12162F]">₹{process.env.NEXT_PUBLIC_PRO_PLAN_PRICE || "99"}</span>
                <span className="ml-1 text-[14px] font-medium text-[#667085]">/ month</span>
              </div>
              <p className="mt-1 text-[13px] font-medium text-[#667085]">
                Best for university students
              </p>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
                <p className="text-[13px] font-bold text-[#6D42F5]">{PRO_PLAN.monthlyCredits} AI Credits every month</p>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#11172F]">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  {PRO_PLAN.monthlyCredits} AI Credits / month
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#11172F]">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Max PDF Size: {PRO_PLAN.maxPdfSizeMB} MB
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#11172F]">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Max {PRO_PLAN.maxImages} Images
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#11172F]">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Faster Processing
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#11172F]">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  PDF Export
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#11172F]">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Share Notes
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#11172F]">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Priority Queue
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-[#11172F]">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Future Premium Features
                </li>
              </ul>
              <Button
                disabled
                className="h-10 w-full rounded-lg bg-violet-600/60 text-[13px] font-extrabold text-white cursor-not-allowed"
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-20 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="px-7 pb-2 pt-7">
            <h2 className="text-[22px] font-extrabold text-[#12162F]">Compare Plans</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-7 py-4 text-left text-[12.5px] font-extrabold uppercase tracking-wider text-[#667085]">
                    Feature
                  </th>
                  <th className="px-7 py-4 text-center text-[12.5px] font-extrabold uppercase tracking-wider text-[#667085]">
                    Free
                  </th>
                  <th className="px-7 py-4 text-center text-[12.5px] font-extrabold uppercase tracking-wider text-[#6D42F5]">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, i) => (
                  <tr
                    key={feature.label}
                    className={cn(
                      "border-b border-gray-100 transition-colors hover:bg-violet-50/20",
                      i === FEATURES.length - 1 && "border-b-0",
                    )}
                  >
                    <td className="px-7 py-4 text-[14px] font-semibold text-[#11172F]">
                      {feature.label}
                    </td>
                    <td className="px-7 py-4 text-center align-middle text-[14px] font-medium text-[#667085]">
                      {feature.free}
                    </td>
                    <td className="px-7 py-4 text-center align-middle text-[14px] font-semibold text-[#11172F]">
                      {feature.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}

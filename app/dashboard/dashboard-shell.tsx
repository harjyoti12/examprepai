"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { MobileTopBar } from "@/components/layout/mobile-top-bar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Desktop navigation (hidden on mobile via CSS) */}
      <Sidebar />
      <Navbar />

      {/* Mobile navigation (hidden on desktop via CSS) */}
      <MobileTopBar />
      <MobileBottomNav />

      {/* Content */}
      <div className="min-h-screen bg-[#F7F8FC] ml-0 lg:ml-60 pt-[52px] lg:pt-15 pb-20 lg:pb-0">
        {children}
      </div>
    </>
  );
}

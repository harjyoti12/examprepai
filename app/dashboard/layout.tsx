import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard page for ExamPrep AI",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="ml-55 min-h-screen bg-[#F7F8FC] pt-15">
        {children}
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Lightbulb, Mail, Heart, Check, Clock } from "lucide-react";

import { BUY_ME_A_COFFEE_URL, SUPPORT_EMAIL } from "@/lib/config";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-[12px] font-medium text-purple-300">
      {children}
    </div>
  );
}

function Card({ icon: Icon, title, description, children }: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-250 hover:border-purple-500/30 hover:bg-purple-500/[0.04] hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] sm:p-7">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-400 shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-shadow duration-250 group-hover:shadow-[0_0_30px_rgba(124,58,237,0.35)]">
        <Icon size={20} />
      </div>
      <h3 className="mb-1.5 text-[17px] font-bold text-white">{title}</h3>
      <p className="mb-5 text-[13.5px] leading-relaxed text-gray-500">{description}</p>
      {children}
    </div>
  );
}

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${SUPPORT_EMAIL}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      <div className="mx-auto max-w-[900px] px-5 py-24 sm:px-8 sm:py-32">

        {/* ── Hero ── */}
        <div className="mb-12 text-center">
          <Badge>
            <MessageSquare size={11} className="text-purple-400" />
            Contact Us
          </Badge>
          <h1 className="mb-3 text-[2.25rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Get in Touch
          </h1>
          <p className="text-[14.5px] text-gray-400">
            We&apos;re always happy to hear from students.
          </p>
        </div>

        {/* ── Three Cards ── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">

          {/* Bug Reports */}
          <Card icon={MessageSquare} title="Bug Reports" description="Report problems you discover so we can fix them quickly.">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
            >
              Open Feedback
            </Link>
          </Card>

          {/* Feature Requests */}
          <Card icon={Lightbulb} title="Feature Requests" description="Tell us what you&apos;d like to see in future updates.">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
            >
              Send Feedback
            </Link>
          </Card>

          {/* General Questions */}
          <Card icon={Mail} title="General Questions" description="Reach out directly via email for any questions.">
            <button
              onClick={copyEmail}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
            >
              {copied ? <><Check size={13} className="text-green-400" /> Copied!</> : "Copy Email"}
            </button>
          </Card>

        </div>

        {/* ── Support Card ── */}
        <div className="mb-8 rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-6 text-center sm:p-8">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-400">
            <Heart size={20} />
          </div>
          <h3 className="mb-2 text-[17px] font-bold text-white">Support Development</h3>
          <p className="mx-auto mb-5 max-w-md text-[13.5px] leading-relaxed text-gray-400">
            ExamPrepAI is currently developed independently. If you enjoy using it,
            consider supporting development.
          </p>
          <a
            href={BUY_ME_A_COFFEE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-7 py-3 text-[14px] font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:bg-purple-700 hover:shadow-[0_0_30px_rgba(124,58,237,0.45)] active:scale-[0.97]"
          >
            <Heart size={14} className="text-pink-400" />
            Buy Me a Coffee
          </a>
        </div>

        {/* ── Response Time ── */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[13px] text-gray-500">
            <Clock size={14} className="text-purple-400" />
            We usually reply within <span className="font-medium text-gray-300">24–72 hours</span>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Menu, X, ArrowRight, Zap, FileText, ChevronRight,
  Play, BookOpen, File, BrainCircuit, BarChart3,
  Check, Upload, Brain, Target, Heart, Rocket, MessageCircle, HeartHandshake, CheckCircle,
  Globe, ExternalLink, X as TwitterIcon, Mail,
} from "lucide-react";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

import { BUY_ME_A_COFFEE_URL, SUPPORT_EMAIL, PORTFOLIO_URL, LINKEDIN_URL, X_URL } from "@/lib/config";

/* ── 4-pointed sparkle SVG ── */
function Sparkle({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M8 0 Q8.8 7 16 8 Q8.8 9 8 16 Q7.2 9 0 8 Q7.2 7 8 0Z" />
    </svg>
  );
}

/* ── Floating animation ── */
function Float({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  return (
    <div style={{ animation: `float 6s ease-in-out ${delay}s infinite` }}>
      {children}
    </div>
  );
}

/* ── Subtle drift animation ── */
function Drift({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  return (
    <div style={{ animation: `drift 8s ease-in-out ${delay}s infinite` }}>
      {children}
    </div>
  );
}

/* ── Scroll-triggered fade-up ── */
function AnimateOnScroll({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090f] text-white overflow-x-hidden">

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-[#09090f]/80 backdrop-blur-xl border-white/5"
            : "bg-transparent border-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 sm:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-white">
            {/* <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600">
              <Sparkle size={14} />
            </div> */}
            <svg width="26" height="26" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.2 28 C 31.2 28 22 30 16.5 31.5 C 13.5 32.3 11.5 33.8 11.5 36.5 L 11.5 50 C 11.5 52.6 14 54.4 16.4 53.5 C 21.5 51.6 28 48.7 30.6 46.5 C 31.1 46.1 31.2 45.5 31.2 44.8 Z" fill="#5732DC"></path><path d="M32.8 28 C 32.8 28 42 30 47.5 31.5 C 50.5 32.3 52.5 33.8 52.5 36.5 L 52.5 50 C 52.5 52.6 50 54.4 47.6 53.5 C 42.5 51.6 36 48.7 33.4 46.5 C 32.9 46.1 32.8 45.5 32.8 44.8 Z" fill="#5732DC"></path><path d="M40 36 L 44.3 38.6" stroke="#8F76EE" strokeWidth="1.5" strokeLinecap="round"></path><path d="M27.5 23.5 C 23 25.3 20 28.2 18.8 32" stroke="#5732DC" strokeWidth="1.7" strokeLinecap="round" fill="none"></path><path d="M36.5 23.5 C 41 25.3 44 28.2 45.2 32" stroke="#5732DC" strokeWidth="1.7" strokeLinecap="round" fill="none"></path><ellipse cx="32" cy="22" rx="5.4" ry="4.6" fill="#5732DC"></ellipse><path d="M32 8.5 L 51 18.2 C 52 18.7 52 20 51 20.5 L 32.7 27.8 C 32.3 28 31.7 28 31.3 27.8 L 13 20.5 C 12 20 12 18.7 13 18.2 L 31.3 8.5 C 31.7 8.3 32.3 8.3 32 8.5 Z" fill="#5732DC"></path></svg>
            <span className="text-[15px] font-extrabold tracking-tight">
              ExamPrep AI
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-7 text-[13.5px] text-gray-400">
            {["Features", "How it Works", "Pricing"].map((l) => (
              <li key={l}>
                <a
                  href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
                  className="transition-colors hover:text-white"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>

          {/* Right auth */}
          <div className="flex items-center gap-3">
            {!isLoaded ? null : !isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="hidden sm:block text-[13.5px] font-medium text-gray-400 hover:text-white transition-colors px-3 py-1.5">
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-full bg-purple-600 px-5 py-2 text-[13.5px] font-semibold text-white hover:bg-purple-700 transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                    Try for Free
                  </button>
                </SignUpButton>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <button className="rounded-full bg-purple-600 px-5 py-2 text-[13.5px] font-semibold text-white hover:bg-purple-700 transition-colors">
                    Dashboard
                  </button>
                </Link>
                <UserButton />
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center justify-center md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={22} className="text-gray-300" /> : <Menu size={22} className="text-gray-300" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="absolute top-16 left-0 right-0 border-b border-white/5 bg-[#09090f]/95 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-1 px-5 py-4">
              {["Features", "How it Works", "Pricing"].map((l) => (
                <button
                  key={l}
                  onClick={() => scrollTo(l.toLowerCase().replace(/\s+/g, "-"))}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-[14px] font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {l}
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
              ))}
              <hr className="my-2 border-white/5" />
              {!isLoaded ? null : !isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button className="w-full rounded-lg px-3 py-3 text-left text-[14px] font-semibold text-gray-300 transition-colors hover:bg-white/5">
                      Log in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full rounded-full bg-purple-600 px-3 py-3 text-center text-[14px] font-semibold text-white transition-all hover:bg-purple-700">
                      Try for Free
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <Link href="/dashboard">
                  <button className="w-full rounded-full bg-purple-600 px-3 py-3 text-center text-[14px] font-semibold text-white">
                    Dashboard
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden pt-16">
        {/* ── Background layers ── */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Large purple radial glow */}
          <div className="absolute top-[20%] right-[15%] h-[600px] w-[600px] rounded-full bg-purple-700/25 blur-[120px]" />
          <div className="absolute top-[40%] right-[25%] h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[100px]" />

          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Floating particles */}
          {[
            ["12%", "18%", "0.5"], ["85%", "12%", "0.3"], ["70%", "65%", "0.4"],
            ["8%", "70%", "0.3"], ["92%", "55%", "0.2"], ["45%", "80%", "0.35"],
            ["28%", "35%", "0.25"], ["75%", "28%", "0.3"], ["55%", "10%", "0.2"],
            ["18%", "55%", "0.25"], ["88%", "78%", "0.2"], ["35%", "15%", "0.3"],
          ].map(([l, t, o], i) => (
            <div
              key={i}
              className="absolute h-[2px] w-[2px] rounded-full bg-purple-400"
              style={{ left: l, top: t, opacity: o }}
            />
          ))}
        </div>

        {/* ── Content ── */}
        <div className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-[1280px] items-center px-5 sm:px-8">
          <div className="grid w-full grid-cols-1 items-center gap-12 py-12 lg:grid-cols-2 lg:gap-8">

            {/* ══ LEFT ══ */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-[12px] font-medium text-purple-300">
                <Sparkle size={11} className="text-purple-400" />
                AI-Powered Study Assistant
              </div>

              {/* Heading */}
              <h1 className="mb-5 text-[2.75rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                Turn Your Notes into{" "}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                  Exam-Ready Answers
                </span>{" "}
                <br className="hidden sm:block" />
                in Seconds
              </h1>

              {/* Subtitle */}
              <p className="mx-auto mb-8 max-w-md text-[15px] leading-relaxed text-gray-400 lg:mx-0">
                Upload your notes and let AI generate important questions,
                short answers and quick revision notes — instantly.
              </p>

              {/* CTAs */}
              <div className="mb-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <SignUpButton mode="modal">
                  <button className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-7 py-3 text-[14px] font-semibold text-white hover:bg-purple-700 transition-all shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.5)] active:scale-[0.97]">
                    Try for Free
                    <ArrowRight size={15} />
                  </button>
                </SignUpButton>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-[14px] font-medium text-white hover:bg-white/10 transition-colors"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600/80">
                    <Play size={8} fill="white" stroke="none" />
                  </div>
                  See How It Works
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-gray-500 lg:justify-start">
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-green-400" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText size={14} className="text-purple-400" />
                  Supports PDF &amp; Images
                </span>
              </div>
            </div>

            {/* ══ RIGHT — Floating UI Cards ══ */}
            <div className="relative flex items-center justify-center">
              {/* Glow behind cards */}
              <div aria-hidden className="absolute h-[350px] w-[350px] rounded-full bg-purple-700/30 blur-[100px]" />

              {/* Container */}
              <div className="relative w-full max-w-[460px]">
                {/* ── Decorative floating icons ── */}
                <Float delay={0.5}>
                  <div aria-hidden className="absolute -left-8 top-[15%] z-40 flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/30 bg-purple-900/50 text-purple-400 backdrop-blur-sm">
                    <Zap size={18} />
                  </div>
                </Float>
                <Float delay={1.8}>
                  <div aria-hidden className="absolute -right-5 top-[5%] z-40 flex h-9 w-9 items-center justify-center rounded-full border border-purple-500/20 bg-purple-900/40 text-purple-400 backdrop-blur-sm">
                    <BrainCircuit size={16} />
                  </div>
                </Float>
                <Float delay={1.2}>
                  <div aria-hidden className="absolute left-[40%] -top-4 z-40 flex h-7 w-7 items-center justify-center rounded-full border border-purple-500/20 bg-purple-900/40 text-yellow-400/60 backdrop-blur-sm">
                    <Sparkle size={12} />
                  </div>
                </Float>

                {/* Sparkle dots */}
                <Sparkle size={14} className="absolute -left-2 top-[5%] z-40 text-purple-400/50" aria-hidden />
                <Sparkle size={10} className="absolute -right-2 bottom-[15%] z-40 text-yellow-400/40" aria-hidden />
                <Sparkle size={8} className="absolute right-[5%] -top-1 z-40 text-purple-300/30" aria-hidden />
                <Sparkle size={6} className="absolute left-[15%] bottom-[5%] z-40 text-purple-400/30" aria-hidden />

                {/* ── Arrow connector ── */}
                {/* <div
                  aria-hidden
                  className="pointer-events-none absolute right-[-5%] top-[42%] z-30 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-purple-500 bg-purple-600 shadow-[0_0_25px_rgba(124,58,237,0.6)]"
                >
                  <ArrowRight size={16} />
                </div> */}

                {/* ── Card 1: Your Notes ── */}
                <Float delay={0}>
                  <div className="absolute top-[5%] left-[0%] z-10 w-[200px] rounded-2xl border border-white/10 bg-[#12101e]/90 p-4 shadow-2xl backdrop-blur-md sm:w-[220px]">
                    <p className="mb-3 text-[11px] font-semibold text-gray-500">Your Notes</p>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                        <File size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-white leading-tight">Thermodynamics Notes.pdf</p>
                        <p className="text-[10px] text-gray-500">43 pages</p>
                      </div>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-1 text-[10px] font-semibold text-green-400">
                      <Check size={10} />
                      Uploaded
                    </div>
                  </div>
                </Float>

                {/* ── Card 2: AI Generated ── */}
                <Float delay={1.5}>
                  <div className="relative z-10 ml-auto w-[250px] rounded-2xl border border-purple-500/30 bg-[#12101e]/90 p-5 shadow-2xl backdrop-blur-md sm:w-[280px]">
                    <div className="mb-4 flex items-center gap-2">
                      <Zap size={14} className="fill-purple-400 text-purple-400" />
                      <p className="text-[13px] font-bold text-purple-300">AI Generated</p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { icon: BookOpen, label: "25 Important Questions", sub: "with short answers" },
                        { icon: FileText, label: "Quick Revision Notes", sub: "Chapter-wise summary" },
                        { icon: BarChart3, label: "Mind Maps", sub: "Visualize key concepts" },
                      ].map(({ icon: Icon, label, sub }) => (
                        <div key={label} className="flex items-start gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
                            <Icon size={13} />
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-white">{label}</p>
                            <p className="text-[10px] text-gray-500">{sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-[12px] font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                      Ready in 15s
                      <Sparkle size={10} />
                    </div>
                  </div>
                </Float>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          {/* Badge */}
          <AnimateOnScroll className="flex justify-center">
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-[12px] font-medium text-purple-300">
              <Sparkle size={11} className="text-purple-400" />
              How It Works
            </div>
          </AnimateOnScroll>

          {/* Heading */}
          <AnimateOnScroll delay={0.1} className="mb-16 text-center">
            <h2 className="text-[2.25rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Simple{" "}
              <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                3 Steps
              </span>
            </h2>
          </AnimateOnScroll>

          {/* Cards */}
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-stretch lg:gap-0">

            {/* ── Card 1 ── */}
            <AnimateOnScroll delay={0.15} className="w-full lg:flex-1">
              <div className="group relative flex h-full items-start gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-purple-500/[0.04] hover:shadow-[0_0_30px_rgba(124,58,237,0.12)]">
                <div className="min-w-0 flex-1">
                  <span className="mb-3 block text-[2.5rem] font-extrabold leading-none text-white/10">01</span>
                  <h3 className="mb-2 text-[17px] font-bold text-white">Upload Notes</h3>
                  <p className="text-[13.5px] leading-relaxed text-gray-500">
                    Upload PDF or image of your class notes, books or any material.
                  </p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-400 shadow-[0_0_25px_rgba(124,58,237,0.25)] transition-shadow duration-300 group-hover:shadow-[0_0_35px_rgba(124,58,237,0.4)]">
                  <Upload size={22} />
                </div>
              </div>
            </AnimateOnScroll>

            {/* Connector 1→2 */}
            <div className="hidden lg:flex lg:w-12 lg:shrink-0 lg:items-center lg:justify-center">
              <div className="flex items-center gap-1">
                <div className="h-px w-6 border-t-2 border-dashed border-purple-500/40" />
                <ArrowRight size={14} className="text-purple-500/40" />
              </div>
            </div>

            {/* ── Card 2 ── */}
            <AnimateOnScroll delay={0.3} className="w-full lg:flex-1">
              <div className="group relative flex h-full items-start gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-purple-500/[0.04] hover:shadow-[0_0_30px_rgba(124,58,237,0.12)]">
                <div className="min-w-0 flex-1">
                  <span className="mb-3 block text-[2.5rem] font-extrabold leading-none text-white/10">02</span>
                  <h3 className="mb-2 text-[17px] font-bold text-white">AI Analyzes</h3>
                  <p className="text-[13.5px] leading-relaxed text-gray-500">
                    Our AI reads and understands your content deeply.
                  </p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-400 shadow-[0_0_25px_rgba(124,58,237,0.25)] transition-shadow duration-300 group-hover:shadow-[0_0_35px_rgba(124,58,237,0.4)]">
                  <Brain size={22} />
                </div>
              </div>
            </AnimateOnScroll>

            {/* Connector 2→3 */}
            <div className="hidden lg:flex lg:w-12 lg:shrink-0 lg:items-center lg:justify-center">
              <div className="flex items-center gap-1">
                <div className="h-px w-6 border-t-2 border-dashed border-purple-500/40" />
                <ArrowRight size={14} className="text-purple-500/40" />
              </div>
            </div>

            {/* ── Card 3 ── */}
            <AnimateOnScroll delay={0.45} className="w-full lg:flex-1">
              <div className="group relative flex h-full items-start gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-purple-500/[0.04] hover:shadow-[0_0_30px_rgba(124,58,237,0.12)]">
                <div className="min-w-0 flex-1">
                  <span className="mb-3 block text-[2.5rem] font-extrabold leading-none text-white/10">03</span>
                  <h3 className="mb-2 text-[17px] font-bold text-white">Get Answers</h3>
                  <p className="text-[13.5px] leading-relaxed text-gray-500">
                    Get important questions, short answers and revision notes.
                  </p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-400 shadow-[0_0_25px_rgba(124,58,237,0.25)] transition-shadow duration-300 group-hover:shadow-[0_0_35px_rgba(124,58,237,0.4)]">
                  <FileText size={22} />
                </div>
              </div>
            </AnimateOnScroll>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FROM NOTES TO PERFECT ANSWERS
      ══════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

            {/* ══ LEFT Content ══ */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <AnimateOnScroll className="mb-5 flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-[12px] font-medium text-purple-300">
                  <Sparkle size={11} className="text-purple-400" />
                  See It In Action
                </div>
              </AnimateOnScroll>

              {/* Heading */}
              <AnimateOnScroll delay={0.1} className="mb-5">
                <h2 className="text-[2.25rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
                  From Notes to{" "}
                  <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                    Perfect Answers
                  </span>{" "}
                  <Sparkle size={22} className="inline-block text-yellow-400/60" />
                </h2>
              </AnimateOnScroll>

              {/* Subtitle */}
              <AnimateOnScroll delay={0.2} className="mb-8">
                <p className="mx-auto max-w-md text-[15px] leading-relaxed text-gray-400 lg:mx-0">
                  See how ExamPrep AI transforms your notes into exam-ready
                  study material in seconds.
                </p>
              </AnimateOnScroll>

              {/* Button */}
              <AnimateOnScroll delay={0.3} className="flex justify-center lg:justify-start">
                <SignUpButton mode="modal">
                  <button className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-7 py-3 text-[14px] font-semibold text-white hover:bg-purple-700 transition-all shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.5)] active:scale-[0.97]">
                    Try Live Demo
                    <ArrowRight size={15} />
                  </button>
                </SignUpButton>
              </AnimateOnScroll>
            </div>

            {/* ══ RIGHT — Comparison Card ══ */}
            <AnimateOnScroll delay={0.2}>
              <div className="relative rounded-3xl border border-purple-500/20 bg-white/[0.02] p-4 shadow-[0_0_60px_rgba(124,58,237,0.08)] backdrop-blur-md sm:p-6">
                {/* Glow behind */}
                <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600/5 via-transparent to-violet-600/5" />

                <div className="relative flex items-center gap-3 sm:gap-4">

                  {/* ── Left Card: Your Notes ── */}
                  <div className="flex-1 rounded-2xl border border-white/[0.06] bg-[#0d0b18]/80 p-3.5 sm:p-4">
                    <p className="mb-3 text-[11px] font-semibold text-gray-500">Your Notes</p>
                    {/* Notebook placeholder */}
                    <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-xl bg-[#1a1726] border border-white/5">
                      {/* Notebook lines */}
                      <div className="absolute inset-0 flex flex-col justify-between p-4">
                        <div>
                          <p className="mb-3 text-[11px] font-bold text-purple-300/80 underline underline-offset-2">Thermodynamics</p>
                          {["The study of heat, work,", "temperature and energy.", "", "First Law: Energy cannot", "be created or destroyed,", "only transformed.", "", "Entropy always increases", "in a closed system.", "", "Key formulas:", "Q = mcΔT", "ΔU = Q - W"].map((line, i) => (
                            <p key={i} className={`text-[9px] leading-[1.8] ${line === "" ? "h-2" : "text-gray-400/70"}`}>{line}</p>
                          ))}
                        </div>
                      </div>
                      {/* Notebook grid overlay */}
                      <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                          backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)",
                          backgroundSize: "100% 18px",
                        }}
                      />
                      {/* Left margin line */}
                      <div className="absolute left-7 top-0 bottom-0 w-px bg-red-500/20" />
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium text-gray-400">
                      <BookOpen size={10} />
                      Original Notes
                    </div>
                  </div>

                  {/* ── Center Arrow ── */}
                  <div className="flex shrink-0 items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/40 bg-purple-600 shadow-[0_0_30px_rgba(124,58,237,0.5)] sm:h-14 sm:w-14" style={{ animation: "pulse-glow 2s ease-in-out infinite" }}>
                      <ArrowRight size={20} className="text-white" />
                    </div>
                  </div>

                  {/* ── Right Card: AI Output ── */}
                  <div className="flex-1 rounded-2xl border border-purple-500/20 bg-[#0d0b18]/80 p-3.5 sm:p-4">
                    <p className="mb-3 text-[11px] font-semibold text-purple-400">AI Generated Output</p>
                    <div className="space-y-3">
                      {/* Q1 */}
                      <div>
                        <p className="mb-1 text-[11px] font-bold text-white">Q1. What is Thermodynamics?</p>
                        <p className="text-[9px] leading-relaxed text-gray-500">
                          • Thermodynamics is the branch of physics that deals with the study of heat, work, temperature and energy and their relation to each other.
                        </p>
                      </div>
                      {/* Q2 */}
                      <div>
                        <p className="mb-1 text-[11px] font-bold text-white">Q2. State the Zeroth Law of Thermodynamics.</p>
                        <p className="text-[9px] leading-relaxed text-gray-500">
                          • If two systems are individually in thermal equilibrium with a third system, they are in thermal equilibrium with each other.
                        </p>
                      </div>
                      {/* Key Concepts */}
                      <div>
                        <p className="mb-1.5 text-[10px] font-bold text-purple-400">Key Concepts</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["Heat", "Work", "Energy", "Temperature"].map((tag) => (
                            <span key={tag} className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[9px] font-medium text-purple-300 border border-purple-500/20">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Generated pill */}
                    <div className="mt-3 flex justify-end">
                      <div className="inline-flex items-center gap-1 rounded-full bg-purple-600/20 px-2.5 py-1 text-[9px] font-bold text-purple-300 border border-purple-500/20">
                        Generated in 15s
                        <Sparkle size={8} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </AnimateOnScroll>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section id="features" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:items-start">

            {/* ══ LEFT — Section Intro ══ */}
            <div className="text-center lg:text-left lg:sticky lg:top-28">
              {/* Badge */}
              <AnimateOnScroll className="mb-5 flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-[12px] font-medium text-purple-300">
                  <Sparkle size={11} className="text-purple-400" />
                  Why Students Love It
                </div>
              </AnimateOnScroll>

              {/* Heading */}
              <AnimateOnScroll delay={0.1} className="mb-5">
                <h2 className="text-[2.25rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
                  Everything You Need to{" "}
                  <br className="hidden sm:block" />
                  Study Smarter
                </h2>
              </AnimateOnScroll>

              {/* Description */}
              <AnimateOnScroll delay={0.2}>
                <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-gray-400 lg:mx-0">
                  ExamPrepAI helps you prepare faster by transforming your
                  notes into exam-focused study material.
                </p>
              </AnimateOnScroll>
            </div>

            {/* ══ RIGHT — Feature Grid ══ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">

              {/* Feature 1 */}
              <AnimateOnScroll delay={0.1}>
                <div className="group flex h-full flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-250 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-purple-500/[0.04] hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-400 shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-shadow duration-250 group-hover:shadow-[0_0_30px_rgba(124,58,237,0.35)]">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-[16px] font-bold text-white">Instant Results</h3>
                    <p className="text-[13.5px] leading-relaxed text-gray-500">
                      Generate exam-ready notes in seconds and spend less time studying.
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* Feature 2 */}
              <AnimateOnScroll delay={0.2}>
                <div className="group flex h-full flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-250 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-purple-500/[0.04] hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-400 shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-shadow duration-250 group-hover:shadow-[0_0_30px_rgba(124,58,237,0.35)]">
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-[16px] font-bold text-white">Exam Focused</h3>
                    <p className="text-[13.5px] leading-relaxed text-gray-500">
                      AI generates content designed specifically for university examinations.
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* Feature 3 */}
              <AnimateOnScroll delay={0.3}>
                <div className="group flex h-full flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-250 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-purple-500/[0.04] hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-400 shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-shadow duration-250 group-hover:shadow-[0_0_30px_rgba(124,58,237,0.35)]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-[16px] font-bold text-white">Supports PDF &amp; Images</h3>
                    <p className="text-[13.5px] leading-relaxed text-gray-500">
                      Upload handwritten notes, scanned PDFs or textbook pages.
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* Feature 4 */}
              <AnimateOnScroll delay={0.4}>
                <div className="group flex h-full flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-250 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-purple-500/[0.04] hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-400 shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-shadow duration-250 group-hover:shadow-[0_0_30px_rgba(124,58,237,0.35)]">
                    <Brain size={20} />
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-[16px] font-bold text-white">Smart &amp; Accurate</h3>
                    <p className="text-[13.5px] leading-relaxed text-gray-500">
                      AI understands your notes and creates structured revision material.
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRICING
      ══════════════════════════════════════ */}
      <section id="pricing" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr_1.1fr] lg:gap-6 lg:items-start">

            {/* ══ LEFT — Section Intro ══ */}
            <div className="text-center lg:text-left lg:sticky lg:top-28">
              {/* Badge */}
              <AnimateOnScroll className="mb-5 flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-[12px] font-medium text-purple-300">
                  <Sparkle size={11} className="text-purple-400" />
                  Simple &amp; Affordable
                </div>
              </AnimateOnScroll>

              {/* Heading */}
              <AnimateOnScroll delay={0.1} className="mb-5">
                <h2 className="text-[2.25rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
                  Plans for Every Student
                </h2>
              </AnimateOnScroll>

              {/* Description */}
              <AnimateOnScroll delay={0.2}>
                <p className="mx-auto max-w-xs text-[15px] leading-relaxed text-gray-400 lg:mx-0">
                  Start completely free today. Support development if you
                  enjoy using ExamPrepAI.
                </p>
              </AnimateOnScroll>
            </div>

            {/* ══ FREE PLAN ══ */}
            <AnimateOnScroll delay={0.15}>
              <div className="relative rounded-2xl border border-purple-500/30 bg-white/[0.03] p-6 shadow-[0_0_40px_rgba(124,58,237,0.08)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_50px_rgba(124,58,237,0.14)] sm:p-7">
                {/* Header */}
                <div className="mb-5">
                  <h3 className="text-[17px] font-bold text-white">Free Plan</h3>
                  <p className="mt-1 text-[13px] text-gray-500">Perfect for getting started</p>
                </div>

                {/* Price */}
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-[2.5rem] font-extrabold leading-none text-white">₹0</span>
                  <span className="text-[14px] text-gray-500">/month</span>
                </div>

                {/* Features */}
                <ul className="mb-7 space-y-3">
                  {[
                    "30 Monthly Credits",
                    "AI Question Generation",
                    "Quick Revision Notes",
                    "Supports PDF & Images",
                    "Standard AI Processing",
                    "Secure Cloud Storage",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-gray-300">
                      <Check size={16} className="mt-0.5 shrink-0 text-purple-400" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <SignUpButton mode="modal">
                  <button className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-[14px] font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:bg-purple-700 hover:shadow-[0_0_30px_rgba(124,58,237,0.45)] active:scale-[0.97]">
                    Get Started Free
                    <ArrowRight size={15} />
                  </button>
                </SignUpButton>

                {/* Support Development */}
                <div className="text-center">
                  <a
                    href={BUY_ME_A_COFFEE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-400 transition-colors hover:text-purple-400"
                  >
                    <Heart size={13} className="text-pink-500" />
                    Support Development
                  </a>
                </div>

                {/* Helper text */}
                <p className="mt-4 text-center text-[11.5px] leading-relaxed text-gray-600">
                  Your support helps keep ExamPrepAI free while Pro is under development ❤️
                </p>
              </div>
            </AnimateOnScroll>

            {/* ══ PRO PLAN ══ */}
            <AnimateOnScroll delay={0.3}>
              <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 opacity-75 backdrop-blur-md sm:p-7">
                {/* Coming Soon Badge */}
                <div className="mb-4 flex justify-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-600/80 px-3 py-1 text-[11px] font-bold text-white">
                    🚧 Coming Soon
                  </span>
                </div>

                {/* Header */}
                <div className="mb-5 text-center">
                  <h3 className="text-[17px] font-bold text-white">Pro Plan</h3>
                  <p className="mt-1 text-[13px] text-gray-500">For serious exam preparation</p>
                </div>

                {/* Price */}
                <div className="mb-6 flex items-baseline justify-center gap-1">
                  <span className="text-[2.5rem] font-extrabold leading-none text-white">₹299</span>
                  <span className="text-[14px] text-gray-500">/month</span>
                </div>

                {/* Features */}
                <ul className="mb-7 space-y-3">
                  {[
                    "100 Monthly Credits",
                    "Download PDF",
                    "Share Notes",
                    "Priority AI Processing",
                    "Larger Upload Limits",
                    "Faster Generation",
                    "Future Premium AI Features",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-gray-300">
                      <Check size={16} className="mt-0.5 shrink-0 text-purple-400" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Disabled Button */}
                <button
                  disabled
                  className="mb-2 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-[14px] font-semibold text-gray-500"
                >
                  Coming Soon
                </button>

                {/* Helper text */}
                <p className="mt-4 text-center text-[11.5px] leading-relaxed text-gray-600">
                  Launching soon after community feedback.
                </p>
              </div>
            </AnimateOnScroll>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          EARLY BETA
      ══════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:items-start">

            {/* ══ LEFT — Section Intro ══ */}
            <div className="text-center lg:text-left lg:sticky lg:top-28">
              {/* Badge */}
              <AnimateOnScroll className="mb-5 flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-[12px] font-medium text-purple-300">
                  <Sparkle size={11} className="text-purple-400" />
                  Early Beta
                </div>
              </AnimateOnScroll>

              {/* Heading */}
              <AnimateOnScroll delay={0.1} className="mb-5">
                <h2 className="text-[2.25rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
                  Help Build{" "}
                  <br className="hidden sm:block" />
                  ExamPrepAI{" "}
                  <br className="hidden sm:block" />
                  Together
                </h2>
              </AnimateOnScroll>

              {/* Description */}
              <AnimateOnScroll delay={0.2}>
                <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-gray-400 lg:mx-0">
                  We&apos;re launching ExamPrepAI with a small group of students.
                  Every suggestion, bug report and feature request directly helps
                  improve the product before the public launch.
                </p>
              </AnimateOnScroll>
            </div>

            {/* ══ RIGHT — Cards ══ */}
            <div className="space-y-4">

              {/* Card 1 */}
              <AnimateOnScroll delay={0.1}>
                <div className="group flex items-start gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-250 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-purple-500/[0.04] hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-400 shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-shadow duration-250 group-hover:shadow-[0_0_30px_rgba(124,58,237,0.35)]">
                    <Rocket size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1.5 text-[16px] font-bold text-white">Early Beta Access</h3>
                    <p className="mb-3 text-[13.5px] leading-relaxed text-gray-500">
                      Be among the first students to use ExamPrepAI before the
                      public launch and experience new features first.
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-medium text-purple-300">
                      🚀 Early Access
                    </span>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* Card 2 */}
              <AnimateOnScroll delay={0.2}>
                <div className="group flex items-start gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-250 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-purple-500/[0.04] hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-400 shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-shadow duration-250 group-hover:shadow-[0_0_30px_rgba(124,58,237,0.35)]">
                    <MessageCircle size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1.5 text-[16px] font-bold text-white">Share Your Feedback</h3>
                    <p className="mb-3 text-[13.5px] leading-relaxed text-gray-500">
                      Tell us what you love, report bugs, and suggest improvements
                      that make studying easier.
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-medium text-purple-300">
                      💬 We Read Every Feedback
                    </span>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* Card 3 */}
              <AnimateOnScroll delay={0.3}>
                <div className="group flex items-start gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-250 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-purple-500/[0.04] hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-600/15 text-purple-400 shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-shadow duration-250 group-hover:shadow-[0_0_30px_rgba(124,58,237,0.35)]">
                    <HeartHandshake size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1.5 text-[16px] font-bold text-white">Help Shape The Future</h3>
                    <p className="mb-3 text-[13.5px] leading-relaxed text-gray-500">
                      Your ideas directly influence future updates, AI improvements
                      and upcoming Pro features.
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-medium text-purple-300">
                      ❤️ Community Driven
                    </span>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* ── Why Early Beta? ── */}
              <AnimateOnScroll delay={0.35}>
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-6 text-center sm:p-8">
                  <h3 className="mb-3 text-[17px] font-bold text-white">Why Early Beta?</h3>
                  <p className="mx-auto mb-6 max-w-md text-[13.5px] leading-relaxed text-gray-400">
                    Instead of guessing what students need, we&apos;re building
                    ExamPrepAI together with real student feedback. Every
                    improvement starts with conversations like yours.
                  </p>

                  <SignUpButton mode="modal">
                    <button className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-600 px-7 py-3 text-[14px] font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:bg-purple-700 hover:shadow-[0_0_30px_rgba(124,58,237,0.45)] active:scale-[0.97]">
                      Join the Beta
                      <ArrowRight size={15} />
                    </button>
                  </SignUpButton>

                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-gray-500">
                    <span>No credit card required</span>
                    <span>Free to join</span>
                    <span>30 monthly credits included</span>
                  </div>
                </div>
              </AnimateOnScroll>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 via-[#0d0b18] to-violet-900/20 p-10 sm:p-16">

            {/* ── Background decorations ── */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-purple-700/20 blur-[120px]" />
              <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[120px]" />
              <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[100px]" />
              {/* Particles */}
              <div className="absolute left-[10%] top-[20%] h-[2px] w-[2px] rounded-full bg-purple-400/40" />
              <div className="absolute right-[15%] top-[30%] h-[2px] w-[2px] rounded-full bg-purple-300/30" />
              <div className="absolute bottom-[25%] left-[20%] h-[2px] w-[2px] rounded-full bg-purple-400/30" />
              <div className="absolute bottom-[30%] right-[10%] h-[2px] w-[2px] rounded-full bg-purple-300/25" />
            </div>

            {/* ── Content ── */}
            <div className="relative z-10 text-center">
              {/* Badge */}
              <AnimateOnScroll className="mb-5 flex justify-center">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-[12px] font-medium text-purple-300">
                  <Sparkle size={11} className="text-purple-400" />
                  Ready to Get Started?
                </div>
              </AnimateOnScroll>

              {/* Heading */}
              <AnimateOnScroll delay={0.1} className="mb-5">
                <h2 className="text-[2.5rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
                  Ace Your Exams{" "}
                  <br className="hidden sm:block" />
                  with{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                    AI
                  </span>
                </h2>
              </AnimateOnScroll>

              {/* Description */}
              <AnimateOnScroll delay={0.2} className="mb-8">
                <p className="mx-auto max-w-md text-[15px] leading-relaxed text-gray-400">
                  Turn your notes into exam-ready study material in seconds.
                  Join our Early Beta today and help build the future of
                  AI-powered learning.
                </p>
              </AnimateOnScroll>

              {/* Buttons */}
              <AnimateOnScroll delay={0.3} className="mb-8 flex flex-wrap items-center justify-center gap-3">
                <SignUpButton mode="modal">
                  <button className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-3.5 text-[14px] font-semibold text-white shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all hover:bg-purple-700 hover:shadow-[0_0_35px_rgba(124,58,237,0.55)] active:scale-[0.97]">
                    Start Free Today
                    <ArrowRight size={15} />
                  </button>
                </SignUpButton>
                <a
                  href="#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById("how-it-works");
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 80;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-[14px] font-medium text-white transition-colors hover:bg-white/10"
                >
                  See How It Works
                </a>
              </AnimateOnScroll>

              {/* Trust indicators */}
              <AnimateOnScroll delay={0.4}>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={15} className="text-green-400" />
                    Free Forever During Beta
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={15} className="text-green-400" />
                    30 Monthly Credits
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={15} className="text-green-400" />
                    No Credit Card Required
                  </span>
                </div>
              </AnimateOnScroll>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="relative border-t border-white/[0.04] bg-[#07060d]">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">

            {/* ── Column 1: Brand ── */}
            <div className="sm:col-span-2 lg:col-span-1">
              {/* Logo */}
              <Link href="/" className="mb-4 inline-flex items-center gap-2 font-bold text-white">
                {/* <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600">
                  <Sparkle size={14} />
                </div> */}
                 <svg width="26" height="26" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.2 28 C 31.2 28 22 30 16.5 31.5 C 13.5 32.3 11.5 33.8 11.5 36.5 L 11.5 50 C 11.5 52.6 14 54.4 16.4 53.5 C 21.5 51.6 28 48.7 30.6 46.5 C 31.1 46.1 31.2 45.5 31.2 44.8 Z" fill="#5732DC"></path><path d="M32.8 28 C 32.8 28 42 30 47.5 31.5 C 50.5 32.3 52.5 33.8 52.5 36.5 L 52.5 50 C 52.5 52.6 50 54.4 47.6 53.5 C 42.5 51.6 36 48.7 33.4 46.5 C 32.9 46.1 32.8 45.5 32.8 44.8 Z" fill="#5732DC"></path><path d="M40 36 L 44.3 38.6" stroke="#8F76EE" strokeWidth="1.5" strokeLinecap="round"></path><path d="M27.5 23.5 C 23 25.3 20 28.2 18.8 32" stroke="#5732DC" strokeWidth="1.7" strokeLinecap="round" fill="none"></path><path d="M36.5 23.5 C 41 25.3 44 28.2 45.2 32" stroke="#5732DC" strokeWidth="1.7" strokeLinecap="round" fill="none"></path><ellipse cx="32" cy="22" rx="5.4" ry="4.6" fill="#5732DC"></ellipse><path d="M32 8.5 L 51 18.2 C 52 18.7 52 20 51 20.5 L 32.7 27.8 C 32.3 28 31.7 28 31.3 27.8 L 13 20.5 C 12 20 12 18.7 13 18.2 L 31.3 8.5 C 31.7 8.3 32.3 8.3 32 8.5 Z" fill="#5732DC"></path></svg>
                <span className="text-[15px] font-extrabold tracking-tight">ExamPrep AI</span>
              </Link>

              {/* Description */}
              <p className="mb-5 max-w-xs text-[13px] leading-relaxed text-gray-500">
                AI-powered study assistant that transforms your notes into
                exam-ready study material in seconds.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {[
                  { icon: Globe, label: "Portfolio", href: PORTFOLIO_URL },
                  { icon: ExternalLink, label: "LinkedIn", href: LINKEDIN_URL },
                  { icon: TwitterIcon, label: "X", href: X_URL },
                  { icon: Mail, label: "Email", href: `mailto:${SUPPORT_EMAIL}` },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-gray-500 transition-all duration-200 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* ── Column 2: Product ── */}
            <div>
              <h4 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-white">Product</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Features", href: "#features" },
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Pricing", href: "#pricing" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      onClick={(e) => {
                        if (href.startsWith("#")) {
                          e.preventDefault();
                          const id = href.slice(1);
                          const el = document.getElementById(id);
                          if (el) {
                            const y = el.getBoundingClientRect().top + window.scrollY - 80;
                            window.scrollTo({ top: y, behavior: "smooth" });
                          }
                        }
                      }}
                      className="text-[13.5px] text-gray-500 transition-colors duration-200 hover:text-purple-400"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Column 3: Resources ── */}
            <div>
              <h4 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-white">Resources</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Contact", href: "/contact" },
                  { label: "Feedback", href: "/contact" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-[13.5px] text-gray-500 transition-colors duration-200 hover:text-purple-400"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Column 4: Support ── */}
            <div>
              <h4 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-white">Support</h4>
              <a
                href={BUY_ME_A_COFFEE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_0_15px_rgba(124,58,237,0.25)] transition-all duration-200 hover:bg-purple-700 hover:shadow-[0_0_25px_rgba(124,58,237,0.4)]"
              >
                <Heart size={14} className="text-pink-400" />
                Buy Me a Coffee
              </a>
              <p className="max-w-[220px] text-[12px] leading-relaxed text-gray-600">
                Your support helps cover AI costs and keeps ExamPrepAI free
                during Early Beta.
              </p>
            </div>

          </div>

          {/* ── Bottom Divider ── */}
          <div className="border-t border-white/[0.04]" />

          {/* ── Bottom Row ── */}
          <div className="flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
            <p className="text-[12px] text-gray-600">
              &copy; 2026 ExamPrepAI. Built with <Heart size={11} className="inline text-pink-500" /> for students.
            </p>
            <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-medium text-purple-300">
              Early Beta v1.0
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
}

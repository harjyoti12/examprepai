import { FileText, Scale, Mail } from "lucide-react";
import type { Metadata } from "next";
import { SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of Service — ExamPrepAI",
  description: "Terms of Service for ExamPrepAI. Read our terms and conditions.",
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-[12px] font-medium text-purple-300">
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-[17px] font-bold text-white">{title}</h2>
      <div className="space-y-3 text-[14px] leading-relaxed text-gray-400">{children}</div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500/60" /><span>{children}</span></li>;
}

export default function TermsPage() {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      <div className="mx-auto max-w-[900px] px-5 py-24 sm:px-8 sm:py-32">

        {/* ── Top Section ── */}
        <div className="mb-12 text-center">
          <Badge>
            <Scale size={11} className="text-purple-400" />
            Terms
          </Badge>
          <h1 className="mb-3 text-[2.25rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="text-[13px] text-gray-500">Last Updated: {today}</p>
        </div>

        {/* ── Card ── */}
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-10">

          {/* Introduction */}
          <p className="mb-10 text-[14.5px] leading-relaxed text-gray-400">
            Welcome to ExamPrepAI. By using this service, you agree to these terms.
            Please read them carefully.
          </p>

          <div className="space-y-10">

            <Section title="Use of Service">
              <p>
                ExamPrepAI is provided to help students create study material. You may use
                the service for personal, educational purposes in accordance with these terms.
              </p>
            </Section>

            <Section title="Acceptable Use">
              <p>Users agree not to:</p>
              <ul className="list-none space-y-2">
                <Bullet>Upload illegal or harmful content</Bullet>
                <Bullet>Upload copyrighted material without permission</Bullet>
                <Bullet>Abuse or misuse the service</Bullet>
                <Bullet>Attempt to bypass usage limits</Bullet>
                <Bullet>Attempt to attack or exploit the platform</Bullet>
              </ul>
            </Section>

            <Section title="AI Generated Content">
              <p>
                AI can make mistakes. Students should verify important academic information
                independently. ExamPrepAI is designed to assist learning, not replace critical
                thinking.
              </p>
            </Section>

            <Section title="Accounts">
              <p>
                Users are responsible for protecting their account credentials. You are
                responsible for all activity that occurs under your account.
              </p>
            </Section>

            <Section title="Credits">
              <p>
                Free users currently receive <strong className="text-white">30 monthly
                credits</strong>. Credits and usage limits may change during the Early Beta
                period without prior notice.
              </p>
            </Section>

            <Section title="Beta Notice">
              <p>
                ExamPrepAI is currently an Early Beta product. Features may change, be
                added, or removed without notice as we iterate based on user feedback.
              </p>
            </Section>

            <Section title="Termination">
              <p>
                We reserve the right to suspend or terminate accounts that abuse the
                service or violate these terms.
              </p>
            </Section>

            <Section title="Limitation of Liability">
              <p>
                ExamPrepAI is provided <strong className="text-white">&quot;as is&quot;</strong>. We are not
                responsible for academic decisions made solely based on AI-generated output.
                Always verify important information with trusted sources.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                For questions about these terms, reach out at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-purple-400 underline underline-offset-2 transition-colors hover:text-purple-300">
                  {SUPPORT_EMAIL}
                </a>{" "}
                or visit our{" "}
                <a href="/dashboard/help" className="text-purple-400 underline underline-offset-2 transition-colors hover:text-purple-300">
                  Feedback page
                </a>.
              </p>
            </Section>

          </div>

          {/* Bottom note */}
          <div className="mt-12 border-t border-white/[0.04] pt-6 text-center text-[12px] text-gray-600">
            These terms may change as the platform evolves.
          </div>
        </div>

      </div>
    </div>
  );
}

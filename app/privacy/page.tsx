import { Shield, Lock, Mail, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { BUY_ME_A_COFFEE_URL, SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy — ExamPrepAI",
  description: "Privacy Policy for ExamPrepAI. Learn how we collect, use, and protect your data.",
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

export default function PrivacyPage() {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      <div className="mx-auto max-w-[900px] px-5 py-24 sm:px-8 sm:py-32">

        {/* ── Top Section ── */}
        <div className="mb-12 text-center">
          <Badge>
            <Lock size={11} className="text-purple-400" />
            Privacy
          </Badge>
          <h1 className="mb-3 text-[2.25rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-[13px] text-gray-500">Last Updated: {today}</p>
        </div>

        {/* ── Card ── */}
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-10">

          {/* Introduction */}
          <p className="mb-10 text-[14.5px] leading-relaxed text-gray-400">
            ExamPrepAI respects your privacy. We only collect information necessary to
            provide the service. This application is currently in Early Beta, and this
            policy may evolve as the product grows.
          </p>

          <div className="space-y-10">

            <Section title="Information We Collect">
              <ul className="list-none space-y-2">
                <Bullet>Email address (via Clerk authentication)</Bullet>
                <Bullet>Uploaded PDFs and images</Bullet>
                <Bullet>Generated notes and study material</Bullet>
                <Bullet>Feedback you submit to us</Bullet>
              </ul>
            </Section>

            <Section title="How We Use Your Data">
              <ul className="list-none space-y-2">
                <Bullet>Generate exam-ready study material from your notes</Bullet>
                <Bullet>Store your notes and generated content securely</Bullet>
                <Bullet>Improve AI quality and accuracy over time</Bullet>
                <Bullet>Respond to your feedback and support requests</Bullet>
              </ul>
            </Section>

            <Section title="AI Processing">
              <p>
                Uploaded files may be securely processed by third-party AI providers to
                generate study material. Generated results may not always be perfectly
                accurate — students should verify important information independently.
              </p>
            </Section>

            <Section title="Data Storage">
              <p>
                Your files and generated notes are stored securely. Only authenticated
                users can access their own notes. Ownership protection is enforced to
                ensure your data stays yours.
              </p>
            </Section>

            <Section title="Data Sharing">
              <p>
                We do <strong className="text-white">not</strong> sell your personal data.
                We only share information with service providers required to operate
                ExamPrepAI, such as authentication, storage, and AI services.
              </p>
            </Section>

            <Section title="Your Rights">
              <ul className="list-none space-y-2">
                <Bullet>Delete your notes at any time</Bullet>
                <Bullet>Delete your account and all associated data</Bullet>
                <Bullet>Contact us regarding any privacy concerns</Bullet>
              </ul>
            </Section>

            <Section title="Contact">
              <p>
                For privacy-related questions, reach out at{" "}
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
            This policy may change as ExamPrepAI evolves.
          </div>
        </div>

      </div>
    </div>
  );
}

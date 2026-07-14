"use client";

import { useState } from "react";
import { ChevronDown, Loader2, Mail, MessageSquareText, SendHorizonal, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = ["Bug Report", "Feature Request", "Improvement", "General Feedback"] as const;

type Category = (typeof CATEGORIES)[number];

const FAQS = [
  {
    q: "What are AI Credits?",
    a: "AI Credits are used whenever ExamPrepAI generates questions and revision notes. Larger documents require more AI Credits because they require more AI processing.",
  },
  {
    q: "Do unused credits roll over?",
    a: "No. Credits reset every month with your subscription.",
  },
  {
    q: "Can I upgrade later?",
    a: "Yes. You can upgrade from Free to Pro at any time.",
  },
  {
    q: "How do I delete a note?",
    a: "Go to My Notes, find the note you want to delete, click the three-dot menu, and select Delete. This permanently removes the note and its associated files.",
  },
  {
    q: "What file types are supported?",
    a: "ExamPrepAI supports PDF files and image files (JPG, JPEG, PNG). You can upload up to 5 images at once, or a single PDF per upload.",
  },
  {
    q: "How long does AI generation take?",
    a: "Most notes are processed within 30 seconds to 2 minutes. Larger documents may take longer. You can see real-time progress on the upload screen.",
  },
  {
    q: "Why did my note fail to process?",
    a: "Processing can fail due to poor scan quality, corrupted files, or temporary server issues. Try re-uploading the file. If the problem persists, contact us via the feedback form above.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your uploaded files and generated notes are private to your account only. We use your content only to generate study material and do not share it with third parties.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-violet-200">
      <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-[15px] font-bold text-[#12162F]">
        {question}
        <ChevronDown className="h-5 w-5 text-[#667085] transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-gray-100 px-6 py-4">
        <p className="text-[13.5px] leading-relaxed text-[#42506E]">{answer}</p>
      </div>
    </details>
  );
}

export default function HelpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Please provide a valid email address.";
    if (!category) errs.category = "Category is required.";
    if (!message.trim()) errs.message = "Message is required.";
    else if (message.trim().length < 10) errs.message = "Message must be at least 10 characters.";
    return errs;
  };

  const isFormValid = email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && category && message.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          category,
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "RATE_LIMIT_EXCEEDED") {
          toast.error("Too many requests. Please try again in a moment.");
        } else if (data.error === "VALIDATION_ERROR" && data.details) {
          const fieldErrors: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(data.details)) {
            fieldErrors[key] = (msgs as string[])[0];
          }
          setErrors(fieldErrors);
        } else {
          toast.error("Unable to send feedback. Please try again.");
        }
        return;
      }

      toast.success("Thank you for your feedback!");
      setName("");
      setEmail("");
      setCategory("");
      setMessage("");
      setErrors({});
    } catch {
      toast.error("Unable to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = message.length;
  const isNearLimit = charCount > 4500;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-[#12162F]">Help &amp; FAQ</h1>
        <p className="mt-2 text-[14px] font-medium text-[#42506E]">
          Find answers to common questions or send us your feedback.
        </p>
      </div>

      <Card className="mb-10 overflow-hidden rounded-2xl border-gray-200 bg-white shadow-sm">
        <CardHeader className="px-6 pb-1 pt-6">
          <CardTitle className="flex items-center gap-3 text-[17px] font-extrabold text-[#12162F]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-700">
              <MessageSquareText className="h-4.5 w-4.5" />
            </span>
            Send Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="feedback-name" className="mb-2 block text-[13px] font-extrabold text-[#111827]">
                Name <span className="font-medium text-[#9CA3AF]">(optional)</span>
              </label>
              <div className="flex h-10 items-center gap-2.5 rounded-lg border border-[#D1D5DB] bg-white px-3.5">
                <User size={14} className="text-[#9CA3AF] shrink-0" />
                <input
                  id="feedback-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-full w-full border-0 bg-transparent p-0 text-[13px] font-medium text-[#374151] outline-none placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="feedback-email" className="mb-2 block text-[13px] font-extrabold text-[#111827]">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="flex h-10 items-center gap-2.5 rounded-lg border border-[#D1D5DB] bg-white px-3.5">
                <Mail size={14} className="text-[#9CA3AF] shrink-0" />
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: "" })); }}
                  placeholder="your@email.com"
                  className="h-full w-full border-0 bg-transparent p-0 text-[13px] font-medium text-[#374151] outline-none placeholder:text-[#9CA3AF]"
                  required
                />
              </div>
              {errors.email && <p className="mt-1.5 text-[12px] font-semibold text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="feedback-category" className="mb-2 block text-[13px] font-extrabold text-[#111827]">
                Category <span className="text-red-500">*</span>
              </label>
              <Select value={category} onValueChange={(val) => { setCategory(val as Category); setErrors((prev) => ({ ...prev, category: "" })); }}>
                <SelectTrigger id="feedback-category" className="h-10 w-full rounded-lg border-[#D1D5DB] text-[13px] font-medium text-[#374151]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="text-[13px] font-medium">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="mt-1.5 text-[12px] font-semibold text-red-500">{errors.category}</p>}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="feedback-message" className="block text-[13px] font-extrabold text-[#111827]">
                  Message <span className="text-red-500">*</span>
                </label>
                {isNearLimit && (
                  <span className="text-[11px] font-medium text-amber-600">{charCount}/5000</span>
                )}
              </div>
              <Textarea
                id="feedback-message"
                placeholder="Tell us how we can improve ExamPrepAI..."
                value={message}
                onChange={(e) => { setMessage(e.target.value); setErrors((prev) => ({ ...prev, message: "" })); }}
                maxLength={5000}
                required
              />
              {errors.message && <p className="mt-1.5 text-[12px] font-semibold text-red-500">{errors.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="h-10 gap-2 rounded-lg bg-violet-600 px-5 text-[13px] font-extrabold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizonal className="h-4 w-4" />
              )}
              Send Feedback
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-6 text-[22px] font-extrabold text-[#12162F]">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </div>
  );
}

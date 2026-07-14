import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { checkRateLimit, RATE_LIMITS } from "@/lib/business/rate-limit";
import { RESEND_API_ENDPOINT } from "@/lib/config";

const feedbackSchema = z.object({
  name: z.string().max(200, "Name must not exceed 200 characters.").optional(),
  email: z.string().email("Please provide a valid email address."),
  category: z.enum(["Bug Report", "Feature Request", "Improvement", "General Feedback"]),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters.")
    .max(5000, "Message must not exceed 5000 characters."),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const rateCheck = checkRateLimit(`feedback:${userId}`, RATE_LIMITS.FEEDBACK);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please try again in a moment." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, email, category, message } = parsed.data;

    const resendApiKey = process.env.RESEND_API_KEY;
    const feedbackEmail = process.env.FEEDBACK_EMAIL;

    if (!resendApiKey || !feedbackEmail) {
      console.error("Feedback email not configured: missing RESEND_API_KEY or FEEDBACK_EMAIL");
      return NextResponse.json(
        { error: "Feedback is not configured yet." },
        { status: 500 },
      );
    }

    // Read Referer header for page/route context
    const referer = request.headers.get("referer") || "";

    // Determine plan from query param or default
    let plan = "Unknown";
    try {
      const { getUserSubscription } = await import("@/lib/business/get-user-subscription");
      const subscription = await getUserSubscription();
      plan = subscription.isPro ? "Pro" : "Free";
    } catch {
      plan = "Unknown";
    }

    const displayName = name?.trim() || "Not provided";
    const displayEmail = email;
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

    const emailContent = `
Name: ${displayName}
Email: ${displayEmail}
Category: ${category}
Plan: ${plan}
Page: ${referer}
Timestamp: ${timestamp}

Message:
${message}
`;

    const fromDomain = process.env.RESEND_FROM_DOMAIN || "resend.dev";
    const fromName = "ExamPrepAI Feedback";
    const fromAddress = fromDomain === "resend.dev"
      ? "onboarding@resend.dev"
      : `feedback@${fromDomain}`;

    const res = await fetch(RESEND_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromAddress}>`,
        to: feedbackEmail,
        replyTo: displayEmail,
        subject: `[ExamPrepAI] [${category}]`,
        text: emailContent.trim(),
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend API error:", res.status, errBody);
      return NextResponse.json(
        { error: "Failed to send feedback." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Failed to send feedback." },
      { status: 500 },
    );
  }
}

import { connectToDatabase } from "@/lib/db";
import UserPlanModel, { type UserPlan } from "@/models/user-plan.model";

export interface ConsumeCreditsInput {
  clerkUserId: string;
  credits: number;
  noteId?: string;
}

export interface ConsumeCreditsResult {
  success: boolean;
  remainingCredits: number;
  totalCreditsUsed: number;
}

export async function consumeCredits(
  input: ConsumeCreditsInput,
): Promise<ConsumeCreditsResult> {
  if (input.credits <= 0) {
    throw new Error("Credits must be a positive number.");
  }

  await connectToDatabase();

  const updated = await UserPlanModel.findOneAndUpdate(
    { clerkUserId: input.clerkUserId, remainingCredits: { $gte: input.credits } },
    {
      $inc: {
        remainingCredits: -input.credits,
        totalCreditsUsed: input.credits,
      },
    },
    { new: true },
  ).lean<UserPlan>();

  if (!updated) {
    throw new Error("Insufficient credits.");
  }

  return {
    success: true,
    remainingCredits: updated.remainingCredits,
    totalCreditsUsed: updated.totalCreditsUsed,
  };
}

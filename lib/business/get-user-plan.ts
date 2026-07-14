import { connectToDatabase } from "@/lib/db";
import UserPlanModel, { type UserPlan } from "@/models/user-plan.model";
import { getUserSubscription } from "@/lib/business/get-user-subscription";
import { CREDIT_RESET_DAYS } from "@/lib/config";

export async function getUserPlan(clerkUserId: string): Promise<UserPlan> {
  await connectToDatabase();

  const existing = await UserPlanModel.findOne({ clerkUserId })
    .lean<UserPlan>()
    .exec();

  if (existing) {
    const subscription = await getUserSubscription();
    const now = new Date();
    const daysSinceReset =
      (now.getTime() - new Date(existing.lastCreditReset).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysSinceReset >= CREDIT_RESET_DAYS) {
      await UserPlanModel.updateOne(
        { clerkUserId },
        {
          $set: {
            remainingCredits: subscription.monthlyCredits,
            totalCreditsUsed: 0,
            lastCreditReset: now,
          },
        },
      );

      existing.remainingCredits = subscription.monthlyCredits;
      existing.totalCreditsUsed = 0;
      existing.lastCreditReset = now;
    } else {
      const expectedTotal =
        existing.remainingCredits + existing.totalCreditsUsed;

      if (expectedTotal !== subscription.monthlyCredits) {
        await UserPlanModel.updateOne(
          { clerkUserId },
          {
            $set: {
              remainingCredits: subscription.monthlyCredits,
              totalCreditsUsed: 0,
              lastCreditReset: now,
            },
          },
        );

        existing.remainingCredits = subscription.monthlyCredits;
        existing.totalCreditsUsed = 0;
        existing.lastCreditReset = now;
      }
    }

    return existing;
  }

  const subscription = await getUserSubscription();

  const now = new Date();

  try {
    const created = await UserPlanModel.create({
      clerkUserId,
      remainingCredits: subscription.monthlyCredits,
      totalCreditsUsed: 0,
      lastCreditReset: now,
    });

    return created.toObject() as UserPlan;
  } catch (error) {
    throw new Error(
      `Failed to create UserPlan for ${clerkUserId}: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }
}

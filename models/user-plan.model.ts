import { Schema, model, models, type InferSchemaType } from "mongoose";

const userPlanSchema = new Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    remainingCredits: {
      type: Number,
      required: true,
    },
    totalCreditsUsed: {
      type: Number,
      required: true,
      default: 0,
    },
    lastCreditReset: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export type UserPlan = InferSchemaType<typeof userPlanSchema>;

const UserPlanModel =
  models.UserPlan || model("UserPlan", userPlanSchema);

export default UserPlanModel;

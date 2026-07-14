import { type UserSubscription } from "@/lib/business/get-user-subscription";
import { type UserPlan } from "@/models/user-plan.model";

export interface UploadValidationError {
  code: "PDF_SIZE_EXCEEDED" | "IMAGE_COUNT_EXCEEDED" | "INSUFFICIENT_CREDITS";
  message: string;
}

export interface UploadValidationInput {
  subscription: UserSubscription;
  userPlan: UserPlan;
  fileType: "pdf" | "image";
  fileSizeMB?: number;
  imageCount?: number;
  chunkCount?: number;
}

export interface UploadValidationResult {
  success: boolean;
  requiredCredits?: number;
  remainingCredits?: number;
  creditsNeeded?: number;
  errors: UploadValidationError[];
}

export function validateUpload(
  input: UploadValidationInput,
): UploadValidationResult {
  const errors: UploadValidationError[] = [];

  // --- Plan limit validation ---

  if (
    input.fileType === "pdf" &&
    input.fileSizeMB !== undefined &&
    input.fileSizeMB > input.subscription.maxPdfSizeMB
  ) {
    errors.push({
      code: "PDF_SIZE_EXCEEDED",
      message: `PDF exceeds your plan limit. ${
        input.subscription.isFree ? "Free" : "Pro"
      } plan allows PDFs up to ${input.subscription.maxPdfSizeMB} MB.`,
    });
  }

  if (
    input.imageCount !== undefined &&
    input.imageCount > input.subscription.maxImages
  ) {
    errors.push({
      code: "IMAGE_COUNT_EXCEEDED",
      message: `Your plan allows up to ${input.subscription.maxImages} images per upload. Upgrade to Pro to upload more.`,
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // --- Credit calculation ---

  let requiredCredits = 0;

  if (input.chunkCount !== undefined) {
    requiredCredits = input.chunkCount;
  } else if (input.imageCount !== undefined) {
    requiredCredits = input.imageCount;
  }

  // --- Credit validation ---

  if (requiredCredits > 0 && input.userPlan.remainingCredits < requiredCredits) {
    const remaining = input.userPlan.remainingCredits;

    return {
      success: false,
      requiredCredits,
      remainingCredits: remaining,
      creditsNeeded: requiredCredits - remaining,
      errors: [
        {
          code: "INSUFFICIENT_CREDITS",
          message: `You need ${requiredCredits} credits but only have ${remaining} remaining. Upgrade to Pro to continue.`,
        },
      ],
    };
  }

  return {
    success: true,
    requiredCredits: requiredCredits > 0 ? requiredCredits : undefined,
    remainingCredits: input.userPlan.remainingCredits,
    creditsNeeded: 0,
    errors: [],
  };
}

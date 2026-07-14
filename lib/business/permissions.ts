import { type UserSubscription } from "@/lib/business/get-user-subscription";

export interface Permissions {
  canGenerateNotes: boolean;
  canUploadPdf: boolean;
  canUploadImages: boolean;
  canShare: boolean;
  canExportPdf: boolean;
  canFlashcards: boolean;
  canRevisionNotes: boolean;
  canMockTests: boolean;
  canPriorityGeneration: boolean;
}

const FREE_PERMISSIONS: Permissions = {
  canGenerateNotes: true,
  canUploadPdf: true,
  canUploadImages: true,
  canShare: false,
  canExportPdf: false,
  canFlashcards: false,
  canRevisionNotes: false,
  canMockTests: false,
  canPriorityGeneration: false,
};

const PRO_PERMISSIONS: Permissions = {
  canGenerateNotes: true,
  canUploadPdf: true,
  canUploadImages: true,
  canShare: true,
  canExportPdf: true,
  canFlashcards: true,
  canRevisionNotes: true,
  canMockTests: true,
  canPriorityGeneration: true,
};

function getPlanPermissions(subscription: UserSubscription): Permissions {
  return subscription.isPro ? PRO_PERMISSIONS : FREE_PERMISSIONS;
}

const SAFE_PERMISSIONS: Permissions = {
  canGenerateNotes: true,
  canUploadPdf: true,
  canUploadImages: true,
  canShare: false,
  canExportPdf: false,
  canFlashcards: false,
  canRevisionNotes: false,
  canMockTests: false,
  canPriorityGeneration: false,
};

export function getPermissions(
  subscription: UserSubscription | null | undefined,
): Permissions {
  if (!subscription) {
    return SAFE_PERMISSIONS;
  }

  return getPlanPermissions(subscription);
}

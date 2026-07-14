export interface PlanConfig {
  monthlyCredits: number;
  maxPdfSizeMB: number;
  maxImages: number;
}

export const FREE_PLAN: PlanConfig = {
  monthlyCredits: 30,
  maxPdfSizeMB: 5,
  maxImages: 2,
};

export const PRO_PLAN: PlanConfig = {
  monthlyCredits: 100,
  maxPdfSizeMB: 20,
  maxImages: 5,
};

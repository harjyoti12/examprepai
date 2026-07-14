export const CLEANUP_INTERVAL_MS = 60_000;

export const RATE_LIMITS = {
  UPLOAD: { windowMs: 60_000, max: 5 },
  SEARCH: { windowMs: 60_000, max: 30 },
  FEEDBACK: { windowMs: 60_000, max: 3 },
} as const;

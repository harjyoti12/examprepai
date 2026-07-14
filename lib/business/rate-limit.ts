import { CLEANUP_INTERVAL_MS, RATE_LIMITS as RATE_LIMITS_CONFIG } from "@/lib/config/rate-limits";

const store = new Map<string, { count: number; resetAt: number }>();

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    (cleanupTimer as NodeJS.Timeout).unref();
  }
}

export type RateLimitConfig = {
  windowMs: number;
  max: number;
};

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetInMs: number;
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  startCleanup();

  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt <= now) {
    store.set(identifier, { count: 1, resetAt: now + config.windowMs });
    return { success: true, remaining: config.max - 1, resetInMs: config.windowMs };
  }

  if (entry.count >= config.max) {
    const resetInMs = entry.resetAt - now;
    return { success: false, remaining: 0, resetInMs };
  }

  entry.count += 1;
  return { success: true, remaining: config.max - entry.count, resetInMs: entry.resetAt - now };
}

export const RATE_LIMITS = RATE_LIMITS_CONFIG;

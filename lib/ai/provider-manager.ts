import {
  GoogleGenerativeAIFetchError,
  type GenerateContentRequest,
  type GenerateContentResult,
  type GenerationConfig,
} from "@google/generative-ai";
import { getGeminiClient } from "./gemini";
import {
  AI_MODEL_NAMES,
  AI_MAX_RETRIES,
  AI_BASE_DELAY_MS,
  AI_MAX_OUTPUT_TOKENS,
  AI_DEFAULT_TEMPERATURE,
} from "@/lib/config/ai";

interface AiProviderConfig {
  modelName: string;
}

const PROVIDERS: AiProviderConfig[] = AI_MODEL_NAMES.map((name) => ({ modelName: name }));

const MAX_RETRIES = AI_MAX_RETRIES;
const BASE_DELAY_MS = AI_BASE_DELAY_MS;

const DEFAULTS: GenerationConfig = {
  responseMimeType: "application/json",
  maxOutputTokens: AI_MAX_OUTPUT_TOKENS,
  temperature: AI_DEFAULT_TEMPERATURE,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTemporaryError(error: unknown): boolean {
  if (error instanceof GoogleGenerativeAIFetchError) {
    if (error.status === 429 || error.status === 503 || error.status === 504) {
      return true;
    }
  }

  if (error instanceof TypeError) {
    return true;
  }

  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  const tempKeywords = [
    "too many requests",
    "unavailable",
    "timeout",
    "overloaded",
    "service unavailable",
    "gateway timeout",
    "connection reset",
    "network error",
    "fetch failed",
    "eof",
    "deadline exceeded",
    "model overloaded",
    "temporary",
  ];

  return tempKeywords.some((keyword) => message.includes(keyword));
}

function isPermanentError(error: unknown): boolean {
  if (error instanceof GoogleGenerativeAIFetchError) {
    if (error.status === 400 || error.status === 401 || error.status === 403) {
      return true;
    }
  }

  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  if (
    (message.includes("json") &&
      (message.includes("parse") || message.includes("syntax"))) ||
    message.includes("invalid api key") ||
    message.includes("api key not found") ||
    message.includes("permission denied") ||
    message.includes("not found")
  ) {
    return true;
  }

  return false;
}

export async function generateWithFallback(
  generationConfig: GenerationConfig,
  request: GenerateContentRequest,
): Promise<GenerateContentResult> {
  const startTime = Date.now();
  const client = getGeminiClient();
  let lastError: unknown = null;

  for (const provider of PROVIDERS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const model = client.getGenerativeModel({
          model: provider.modelName,
          generationConfig: {
            ...DEFAULTS,
            ...generationConfig,
          },
        });

        const result = await model.generateContent(request);
        const duration = Date.now() - startTime;
        console.log(
          `[AI Provider] Success: ${provider.modelName} (attempt ${attempt}, ${duration}ms)`,
        );
        return result;
      } catch (error) {
        lastError = error;
        const msg = error instanceof Error ? error.message : String(error);
        console.log(
          `[AI Provider] ${provider.modelName} attempt ${attempt}/${MAX_RETRIES} failed: ${msg}`,
        );

        if (isPermanentError(error)) {
          console.log(`[AI Provider] Permanent error, aborting`);
          throw error;
        }

        if (isTemporaryError(error)) {
          if (attempt < MAX_RETRIES) {
            const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
            console.log(
              `[AI Provider] Retrying ${provider.modelName} in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
            );
            await sleep(delay);
          }
        } else {
          console.log(
            `[AI Provider] Unknown error type, moving to next provider`,
          );
          break;
        }
      }
    }

    console.log(
      `[AI Provider] Exhausted retries for ${provider.modelName}, falling back to next provider`,
    );
  }

  console.log(
    `[AI Provider] All providers exhausted after ${Date.now() - startTime}ms`,
  );
  throw lastError;
}

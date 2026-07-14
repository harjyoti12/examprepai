import { GoogleGenerativeAI } from "@google/generative-ai";

let gemini: GoogleGenerativeAI | null = null;

export function getGeminiClient() {
  if (gemini) {
    return gemini;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Please define the GEMINI_API_KEY environment variable.");
  }

  gemini = new GoogleGenerativeAI(apiKey);
  return gemini;
}

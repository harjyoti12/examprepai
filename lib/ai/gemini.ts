import { GoogleGenerativeAI, type GenerationConfig } from "@google/generative-ai";

let gemini: GoogleGenerativeAI | null = null;

function getGeminiClient() {
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



export function getGeminiModel(
  generationConfig: GenerationConfig = {},
) {
  const ModelName = process.env.GEMINI_MODEL_NAME ?? "gemini-3-flash-preview";


  return getGeminiClient().getGenerativeModel({
    model: ModelName,
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 64000,
      temperature: 0.2,
      ...generationConfig,
    },
  });
}

import { connectToDatabase } from "../db";
import NoteModel from "../../models/note.model";
import { generateWithFallback } from "./provider-manager";
import { StudyMaterial } from "./generate-study-material";
import { SchemaType, type ResponseSchema } from "@google/generative-ai";

interface ProcessScannedPdfResult {
  success: boolean;
  message: string;
  generatedContent?: StudyMaterial;
}

const SCANNED_PROMPT = (title: string, subject: string) => `You are an educational AI assistant specializing in exam preparation.
Analyze the attached PDF document carefully and extract educational content.

Extract and structure:
1. Up to 8 important exam questions with clear, concise answers
2. Key concepts and definitions
3. Up to 6 quick revision notes with main points

Preserve the original educational meaning and accuracy.
Format your response as valid JSON.
Every string and JSON object must be complete. Do not stop mid-sentence.

Document Title: ${title}
Subject/Topic: ${subject}

Return ONLY a JSON object with this exact format:
{
  "importantQuestions": [
    { "question": "string", "answer": "string" }
  ],
  "quickRevision": [
    { "heading": "string", "points": ["string"] }
  ]
}`;

const STUDY_MATERIAL_RESPONSE_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    importantQuestions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING },
          answer: { type: SchemaType.STRING },
        },
        required: ["question", "answer"],
      },
    },
    quickRevision: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          heading: { type: SchemaType.STRING },
          points: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: ["heading", "points"],
      },
    },
  },
  required: ["importantQuestions", "quickRevision"],
};

export function extractJsonPayload(rawText: string): string {
  const cleaned = rawText.trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

export function parseStudyMaterial(rawText: string): StudyMaterial {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText.trim());
  } catch (error) {
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        parsed = JSON.parse(rawText.slice(firstBrace, lastBrace + 1));
      } catch (retryError) {
        throw new Error(`Gemini response did not parse as JSON: ${rawText.slice(0, 200)}`);
      }
    } else {
      throw new Error(`Gemini response did not parse as JSON: ${rawText.slice(0, 200)}`);
    }
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as any).importantQuestions) ||
    !Array.isArray((parsed as any).quickRevision)
  ) {
    throw new Error(`Gemini response structure invalid: ${JSON.stringify(parsed).slice(0, 200)}`);
  }

  return {
    importantQuestions: (parsed as any).importantQuestions
      .map((item: any) => ({
        question: String(item.question ?? "").trim(),
        answer: String(item.answer ?? "").trim(),
      }))
      .filter((item: any) => item.question && item.answer),
    quickRevision: (parsed as any).quickRevision
      .map((item: any) => ({
        heading: String(item.heading ?? "").trim(),
        points: Array.isArray(item.points)
          ? item.points.map((point: any) => String(point ?? "").trim()).filter(Boolean)
          : [],
      }))
      .filter((item: any) => item.heading && item.points.length > 0),
  };
}

async function fetchPdfBuffer(pdfUrl: string): Promise<Buffer> {
  const response = await fetch(pdfUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch scanned PDF: ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function processScannedPdf(
  noteId: string,
  pdfUrl: string,
): Promise<ProcessScannedPdfResult> {
  try {
    await connectToDatabase();

    const note = await NoteModel.findById(noteId);
    if (!note) {
      return {
        success: false,
        message: `Note with ID ${noteId} not found.`,
      };
    }

    const pdfBuffer = await fetchPdfBuffer(pdfUrl);
    const pdfBase64 = pdfBuffer.toString("base64");
    
    const prompt = SCANNED_PROMPT(note.title, note.subject);

    const response = await generateWithFallback(
      {
        maxOutputTokens: 8192,
        responseSchema: STUDY_MATERIAL_RESPONSE_SCHEMA,
      },
      {
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: pdfBase64,
                },
              },
            ],
          },
        ],
      },
    );

    const rawOutput = response.response.text();

    const jsonCandidate = extractJsonPayload(rawOutput);
    const result = parseStudyMaterial(jsonCandidate);

    note.extractedContent = [];
    note.generatedContent = result;
    await note.save();

    return {
      success: true,
      message: "Scanned PDF processed and study material generated successfully.",
      generatedContent: result,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`Scanned PDF processing failed for note ${noteId}:`, errorMsg);
    console.error(`Full error:`, error);

    try {
      await connectToDatabase();
      const note = await NoteModel.findById(noteId);
      if (note) {
        note.processingStatus = "failed";
        await note.save();
      }
    } catch (updateError) {
      console.error("Failed to update note status to failed after scanned PDF error:", updateError);
    }

    return {
      success: false,
      message: `Scanned PDF processing failed: ${errorMsg}`,
    };
  }
}

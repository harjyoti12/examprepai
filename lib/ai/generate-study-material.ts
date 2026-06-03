import { connectToDatabase } from "../db";
import NoteModel from "../../models/note.model";
import { getGeminiModel } from "./gemini";
import { chunkExtractedContent, type ExtractedPageChunk } from "./chunk-content";

interface ImportantQuestion {
  question: string;
  answer: string;
}

interface QuickRevisionItem {
  heading: string;
  points: string[];
}

export interface StudyMaterial {
  importantQuestions: ImportantQuestion[];
  quickRevision: QuickRevisionItem[];
}

interface GenerateMaterialResult {
  success: boolean;
  message: string;
  generatedContent?: StudyMaterial;
}

function createPrompt(chunkText: string, title: string, subject: string) {
  return `You are an educational AI assistant.
Based on the provided study material:
1. Generate important exam questions with concise answers.
2. Generate quick revision notes.
3. Keep answers clear and exam-focused.
4. Avoid unnecessary explanations.
5. Return ONLY valid JSON.

Title: ${title}
Subject: ${subject}

Content:
${chunkText}

Return only a JSON object with this format:
{
  "importantQuestions": [
    { "question": "string", "answer": "string" }
  ],
  "quickRevision": [
    { "heading": "string", "points": ["string"] }
  ]
}`;
}

function extractJsonPayload(rawText: string): string {
  const cleaned = rawText.trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

function parseStudyMaterial(rawText: string, chunkIndex: number): StudyMaterial {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText.trim());
  } catch (error) {
    throw new Error(`Gemini response for chunk ${chunkIndex} did not parse as JSON.`);
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as any).importantQuestions) ||
    !Array.isArray((parsed as any).quickRevision)
  ) {
    throw new Error(`Gemini response for chunk ${chunkIndex} did not match the required structure.`);
  }

  const importantQuestions = (parsed as any).importantQuestions.map((item: any) => ({
    question: String(item.question ?? "").trim(),
    answer: String(item.answer ?? "").trim(),
  }));

  const quickRevision = (parsed as any).quickRevision.map((item: any) => ({
    heading: String(item.heading ?? "").trim(),
    points: Array.isArray(item.points)
      ? item.points.map((point: any) => String(point ?? "").trim())
      : [],
  }));

  return {
    importantQuestions,
    quickRevision,
  };
}

export async function generateStudyMaterial(
  noteId: string,
): Promise<GenerateMaterialResult> {
  try {
    await connectToDatabase();

    const note = await (NoteModel as any).findOne({ _id: noteId }).exec();
    if (!note) {
      return {
        success: false,
        message: `Note with ID ${noteId} not found.`,
      };
    }

    const extractedContent = note.extractedContent as ExtractedPageChunk[];
    if (!Array.isArray(extractedContent) || extractedContent.length === 0) {
      return {
        success: false,
        message: "No extracted content found. AI generation requires extracted PDF text.",
      };
    }

    note.processingStatus = "processing";
    await note.save();

    const chunks = chunkExtractedContent(extractedContent);
    const merged: StudyMaterial = {
      importantQuestions: [],
      quickRevision: [],
    };

    const model = getGeminiModel();

    for (let index = 0; index < chunks.length; index += 1) {
      const chunkText = chunks[index];
      const prompt = createPrompt(chunkText, note.title, note.subject);
      console.log(`Generating AI content for note ${noteId}, chunk ${index + 1}/${chunks.length}`);

      const response = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      const rawOutput = response.response.text();
      const jsonCandidate = extractJsonPayload(rawOutput);
      const chunkResult = parseStudyMaterial(jsonCandidate, index + 1);

      merged.importantQuestions.push(...chunkResult.importantQuestions);
      merged.quickRevision.push(...chunkResult.quickRevision);
    }

    note.generatedContent = merged;
    note.processingStatus = "completed";
    await note.save();

    console.log(`AI generation completed for note ${noteId}`);

    return {
      success: true,
      message: "Study material generated successfully.",
      generatedContent: merged,
    };
  } catch (error) {
    console.error(`AI generation failed for note ${noteId}:`, error);

    try {
      await connectToDatabase();
      const note = await (NoteModel as any).findOne({ _id: noteId }).exec();
      if (note) {
        note.processingStatus = "failed";
        await note.save();
      }
    } catch (updateError) {
      console.error("Failed to update note status to failed after AI error:", updateError);
    }

    return {
      success: false,
      message: "AI generation failed.",
      generatedContent: undefined,
    };
  }
}

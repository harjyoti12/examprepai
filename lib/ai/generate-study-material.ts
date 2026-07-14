import { connectToDatabase } from "../db";
import NoteModel from "../../models/note.model";
import NoteChunkModel from "../../models/note-chunk.model";
import { generateWithFallback } from "./provider-manager";
import {
  createNoteChunksFromPages,
  type ExtractedPageChunk,
  type NoteChunkInput,
} from "./chunk-content";

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

interface StudyMaterialChunk {
  chunkIndex: number;
  content: string;
}

interface ParsedImportantQuestion {
  question?: unknown;
  answer?: unknown;
}

interface ParsedQuickRevisionItem {
  heading?: unknown;
  points?: unknown;
}

interface ParsedStudyMaterial {
  importantQuestions?: unknown;
  quickRevision?: unknown;
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
  } catch {
    throw new Error(`Gemini response for chunk ${chunkIndex} did not parse as JSON.`);
  }

  const studyMaterial = parsed as ParsedStudyMaterial;

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray(studyMaterial.importantQuestions) ||
    !Array.isArray(studyMaterial.quickRevision)
  ) {
    throw new Error(`Gemini response for chunk ${chunkIndex} did not match the required structure.`);
  }

  const importantQuestions = studyMaterial.importantQuestions.map((item: ParsedImportantQuestion) => ({
    question: String(item.question ?? "").trim(),
    answer: String(item.answer ?? "").trim(),
  }));

  const quickRevision = studyMaterial.quickRevision.map((item: ParsedQuickRevisionItem) => ({
    heading: String(item.heading ?? "").trim(),
    points: Array.isArray(item.points)
      ? item.points.map((point: unknown) => String(point ?? "").trim())
      : [],
  }));

  return {
    importantQuestions,
    quickRevision,
  };
}

async function loadStudyMaterialChunks(
  noteId: string,
  extractedContent: ExtractedPageChunk[],
): Promise<StudyMaterialChunk[]> {
  const storedChunks = await NoteChunkModel.find({ noteId })
    .sort({ chunkIndex: 1 })
    .select("chunkIndex content")
    .lean()
    .exec();

  if (storedChunks.length > 0) {
    return storedChunks.map((chunk) => ({
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
    }));
  }

  if (!Array.isArray(extractedContent) || extractedContent.length === 0) {
    return [];
  }

  // Backward compatibility for older PDF notes created before NoteChunk existed.
  return createNoteChunksFromPages(extractedContent).map((chunk: NoteChunkInput) => ({
    chunkIndex: chunk.chunkIndex,
    content: chunk.content,
  }));
}

export async function generateStudyMaterial(
  noteId: string,
): Promise<GenerateMaterialResult> {
  try {
    await connectToDatabase();

    const note = await NoteModel.findById(noteId).exec();
    if (!note) {
      return {
        success: false,
        message: `Note with ID ${noteId} not found.`,
      };
    }

    const chunks = await loadStudyMaterialChunks(
      noteId,
      note.extractedContent as ExtractedPageChunk[],
    );

    if (chunks.length === 0) {
      return {
        success: false,
        message: "No note chunks found. AI generation requires extracted PDF text.",
      };
    }

    note.processingStatus = "processing";
    await note.save();

    const merged: StudyMaterial = {
      importantQuestions: [],
      quickRevision: [],
    };

    for (let index = 0; index < chunks.length; index += 1) {
      const chunkText = chunks[index].content;
      const prompt = createPrompt(chunkText, note.title, note.subject);

      const response = await generateWithFallback({}, {
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
    await note.save();

    return {
      success: true,
      message: "Study material generated successfully.",
      generatedContent: merged,
    };
  } catch (error) {
    console.error(`AI generation failed for note ${noteId}:`, error);

    try {
      await connectToDatabase();
      const note = await NoteModel.findById(noteId).exec();
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

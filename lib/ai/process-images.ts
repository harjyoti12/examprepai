import { connectToDatabase } from "../db";
import NoteModel from "../../models/note.model";
import { generateWithFallback } from "./provider-manager";
import { StudyMaterial } from "./generate-study-material";
import { extractJsonPayload, parseStudyMaterial } from "./process-scanned-pdf";
import { SchemaType, type ResponseSchema } from "@google/generative-ai";

interface ProcessImagesResult {
  success: boolean;
  message: string;
  generatedContent?: StudyMaterial;
}

const IMAGE_PROMPT = `You are an educational AI assistant.

Analyze this study note image carefully.

IMPORTANT:

* Extract important exam questions
* Generate concise answers
* Generate quick revision notes
* Capture as much educational content as possible
* Preserve educational meaning accurately

IMPORTANT RULES:

* Return ONLY valid raw JSON
* Do NOT use markdown
* Output must begin with {
* Output must end with }

Required JSON structure:

{
"importantQuestions": [
{
"question": "string",
"answer": "string"
}
],

"quickRevision": [
{
"heading": "string",
"points": ["string"]
}
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

function normalizeMimeType(contentType: string | null): string {
  if (!contentType) {
    return "image/jpeg";
  }

  const normalized = contentType.split(";")[0].trim();
  if (normalized === "image/jpeg" || normalized === "image/jpg" || normalized === "image/png" || normalized === "image/webp") {
    return normalized === "image/jpg" ? "image/jpeg" : normalized;
  }

  return "image/jpeg";
}

export async function processImages(noteId: string): Promise<ProcessImagesResult> {
  try {
    await connectToDatabase();

    const note = await NoteModel.findById(noteId);
    if (!note) {
      return {
        success: false,
        message: `Note with ID ${noteId} not found.`,
      };
    }

    if (!Array.isArray(note.fileUrls) || note.fileUrls.length === 0) {
      return {
        success: false,
        message: "No image URLs found for this note.",
      };
    }

    const merged: StudyMaterial = {
      importantQuestions: [],
      quickRevision: [],
    };

    for (const imageUrl of note.fileUrls) {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image from ${imageUrl}: ${response.statusText}`);
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());
      const imageBase64 = imageBuffer.toString("base64");
      const mimeType = normalizeMimeType(response.headers.get("content-type"));

      const rawResult = await generateWithFallback(
        {
          maxOutputTokens: 8192,
          responseSchema: STUDY_MATERIAL_RESPONSE_SCHEMA,
        },
        {
          contents: [
            {
              role: "user",
              parts: [
                { text: IMAGE_PROMPT },
                {
                  inlineData: {
                    mimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
        },
      );

      const rawOutput = rawResult.response.text();
      const jsonCandidate = extractJsonPayload(rawOutput);
      const imageContent = parseStudyMaterial(jsonCandidate);

      merged.importantQuestions.push(...imageContent.importantQuestions);
      merged.quickRevision.push(...imageContent.quickRevision);
    }

    note.generatedContent = merged;
    await note.save();

    return {
      success: true,
      message: "Image AI generation completed successfully.",
      generatedContent: merged,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`Image processing failed for note ${noteId}:`, errorMsg);

    try {
      await connectToDatabase();
      const note = await NoteModel.findById(noteId);
      if (note) {
        note.processingStatus = "failed";
        await note.save();
      }
    } catch (updateError) {
      console.error("Failed to update note status after image processing error:", updateError);
    }

    return {
      success: false,
      message: errorMsg,
    };
  }
}
